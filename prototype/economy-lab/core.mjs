/**
 * Deterministic accounting simulator, independent of rendering/Three.js.
 * The engine is a toy causal mechanism explorer, NOT a calibrated macro model.
 * All flows are conserved. No monetary issuance, no energy from nowhere.
 */
const EPS = 1e-8;
export const round = (x, n = 3) => Number(x.toFixed(n));
function finitePositive(x, label, allowZero = true) {
  if (typeof x !== "number" || !Number.isFinite(x) || (allowZero ? x < 0 : x <= 0))
    throw new Error("Invalid nonnegative input: " + label);
}
function clamp(x, min, max) { return Math.max(min, Math.min(max, x)); }
export function validateFixture(data) {
  if (data?.synthetic !== true) throw new Error("This MVP accepts labelled synthetic fixtures only");
  if (!Array.isArray(data.countries) || data.countries.length < 2) throw new Error("Need at least two countries");
  const ids = new Set();
  for (const c of data.countries) {
    if (!c.id || ids.has(c.id)) throw new Error("Duplicate/empty country ID");
    ids.add(c.id);
    for (const f of ["production", "demand", "reserve", "reserveCap", "sensitivity", "treasury", "baseTax", "publicServices"]) finitePositive(c[f], c.id + "." + f);
    if (c.reserve > c.reserveCap) throw new Error(c.id + ": reserve exceeds capacity");
    if (c.sensitivity > 2) throw new Error("Out-of-range sensitivity");
  }
  if (!Array.isArray(data.routes)) throw new Error("Routes required");
  const routes = new Set();
  for (const r of data.routes) {
    if (routes.has(r.id) || !ids.has(r.from) || !ids.has(r.to) || r.from === r.to) throw new Error("Invalid trade route");
    routes.add(r.id);
    finitePositive(r.capacity, r.id + ".capacity");
    finitePositive(r.priority, r.id + ".priority");
  }
  if (!Array.isArray(data.scenarios) || !data.scenarios.some(x => x.id === "none")) throw new Error("Baseline scenario required");
  for (const sc of data.scenarios) for (const ch of sc.changes) {
    if (!ids.has(ch.country) || !Number.isInteger(ch.from) || !Number.isInteger(ch.to) || ch.from < 1 || ch.to < ch.from) throw new Error("Invalid shock dates/country");
    finitePositive(ch.productionLoss, "shock.productionLoss");
    if (ch.productionLoss > 1) throw new Error("Shock outside [0,1]");
  }
  return true;
}
function requireOptions(opts) {
  const scenarioId = opts?.scenarioId || "none";
  const horizon = Number(opts?.horizon ?? 8);
  const policyPct = Number(opts?.policyPct ?? 0);
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 16) throw new Error("Horizon must be 1–16 quarters");
  if (!Number.isFinite(policyPct) || policyPct < 0 || policyPct > 100) throw new Error("Policy budget percentage must be 0–100");
  return { scenarioId, horizon, policyPct };
}
export function simulate(fixture, options = {}) {
  validateFixture(fixture);
  const { scenarioId, horizon, policyPct } = requireOptions(options);
  const scenario = fixture.scenarios.find(x => x.id === scenarioId);
  if (!scenario) throw new Error("Unknown scenario");
  const config = fixture.modelAssumptions;
  const yieldPerUnit = Number(config.efficiencyYield);
  const maxEfficiency = Number(config.maxEfficiency);
  finitePositive(yieldPerUnit, "efficiencyYield"); finitePositive(maxEfficiency, "maxEfficiency");
  if (maxEfficiency > 0.8) throw new Error("Invalid efficiency cap");
  const state = Object.fromEntries(fixture.countries.map(c => [c.id, { reserve: c.reserve, treasury: c.treasury, efficiency: 0 }]));
  const snapshots = [];
  const routes = [...fixture.routes].sort((a,b) => a.priority - b.priority || a.id.localeCompare(b.id));

  for (let quarter = 1; quarter <= horizon; quarter++) {
    const rows = {};
    for (const c of fixture.countries) {
      const s = state[c.id];
      const activeShocks = scenario.changes.filter(ch => ch.country === c.id && quarter >= ch.from && quarter <= ch.to);
      // Two simultaneous shocks multiply remaining capacity; combined impact is bounded by 100%.
      const factor = activeShocks.reduce((v,ch) => v * (1 - ch.productionLoss), 1);
      rows[c.id] = {
        country: c.id, quarter, production: c.production * factor,
        demand: c.demand * (1 - s.efficiency),
        shockFraction: 1 - factor, appliedShocks: activeShocks.map(x => ({from:x.from,to:x.to,loss:x.productionLoss})),
        imports: 0, exports: 0,
        reserveOpening: s.reserve, reserveClosing: 0, reserveDraw: 0, reserveCharge: 0,
        consumed: 0, curtailed: 0, unserved: 0, coverage: 0,
        outputIndex: 0, tax: 0, treasuryOpening: s.treasury, treasuryClosing: 0,
        publicPaid: 0, publicUnpaid: 0, investment: 0,
        efficiencyOpening: s.efficiency, efficiencyClosing: 0
      };
    }
    const flowRows = [];
    for (const rt of routes) {
      const a = rows[rt.from], b = rows[rt.to];
      const maxSell = Math.max(0, a.production - a.demand - a.exports + a.imports);
      const maxBuy = Math.max(0, b.demand - b.production - b.imports + b.exports);
      const amount = Math.max(0, Math.min(rt.capacity, maxSell, maxBuy));
      a.exports += amount; b.imports += amount;
      flowRows.push({ id: rt.id, from: rt.from, to: rt.to, amount, capacity: rt.capacity, isSynthetic: true });
    }

    for (const c of fixture.countries) {
      const r = rows[c.id], prev = state[c.id];
      const balanceBeforeReserves = r.production + r.imports - r.exports;
      const shortage = Math.max(0, r.demand - balanceBeforeReserves);
      r.reserveDraw = Math.min(prev.reserve, shortage);
      r.consumed = Math.min(r.demand, balanceBeforeReserves + r.reserveDraw);
      r.unserved = Math.max(0, r.demand - r.consumed);
      const reserveRemaining = prev.reserve - r.reserveDraw;
      r.reserveCharge = Math.min(c.reserveCap - reserveRemaining, Math.max(0, balanceBeforeReserves - r.consumed));
      r.reserveClosing = reserveRemaining + r.reserveCharge;
      r.curtailed = Math.max(0, balanceBeforeReserves + r.reserveDraw - r.consumed - r.reserveCharge);
      r.coverage = r.demand > 0 ? r.consumed / r.demand : 1;
      r.outputIndex = 100 * clamp(1 - c.sensitivity * (1 - r.coverage), 0, 1);
      // Tax flows are endogenous to this toy output proxy, not collected actual taxes.
      r.tax = c.baseTax * r.outputIndex / 100;
      const funds = prev.treasury + r.tax;
      r.publicPaid = Math.min(c.publicServices, funds);
      r.publicUnpaid = Math.max(0, c.publicServices - r.publicPaid);
      const spendable = Math.max(0, funds - r.publicPaid);
      const desiredInvestment = r.tax * policyPct / 100;
      r.investment = Math.min(desiredInvestment, spendable);
      r.treasuryClosing = funds - r.publicPaid - r.investment;
      r.efficiencyClosing = clamp(prev.efficiency + r.investment * yieldPerUnit, 0, maxEfficiency);
      state[c.id] = { reserve: r.reserveClosing, treasury: r.treasuryClosing, efficiency: r.efficiencyClosing };
    }
    const snapshot = { quarter, scenarioId, policyPct, rows, routes: flowRows };
    auditSnapshot(fixture, snapshot);
    snapshots.push(snapshot);
  }
  return {
    model: "synthetic-energy-stock-flow-v0.1",
    synthetic: true, title: scenario.name, description: scenario.description,
    modelAssumptions: { ...fixture.modelAssumptions }, policyPct,
    snapshots
  };
}
export function auditSnapshot(fixture, snapshot, tolerance = 1e-6) {
  let totalImport = 0, totalExport = 0;
  for (const c of fixture.countries) {
    const s = snapshot.rows[c.id];
    if (!s) throw new Error("Missing country row: " + c.id);
    const lhs = s.production + s.imports + s.reserveDraw;
    const rhs = s.consumed + s.exports + s.reserveCharge + s.curtailed;
    if (Math.abs(lhs-rhs) > tolerance) throw new Error(c.id + ": energy conservation failed: " + (lhs-rhs));
    const cash = s.treasuryOpening + s.tax - s.publicPaid - s.investment;
    if (Math.abs(cash - s.treasuryClosing) > tolerance) throw new Error(c.id + ": budget conservation failed");
    if (s.reserveClosing < -EPS || s.reserveClosing > c.reserveCap + EPS) throw new Error(c.id + ": reserve bounds");
    if (s.treasuryClosing < -EPS || s.consumed < -EPS || s.unserved < -EPS) throw new Error(c.id + ": negative balance");
    if (s.coverage < -EPS || s.coverage > 1+EPS) throw new Error(c.id + ": invalid coverage");
    if (Math.abs(s.consumed+s.unserved-s.demand) > tolerance) throw new Error(c.id + ": demand mismatch");
    totalImport += s.imports; totalExport += s.exports;
  }
  const routeTotal = snapshot.routes.reduce((a,r) => a+r.amount,0);
  if (Math.abs(totalImport-totalExport)>tolerance || Math.abs(totalImport-routeTotal)>tolerance) throw new Error("Inter-country trade ledger mismatch");
  for (const r of snapshot.routes) if(r.amount< -EPS || r.amount>r.capacity+EPS) throw new Error("Route capacity exceeded");
  return true;
}
export function compareRuns(fixture, options) {
  const shocked = simulate(fixture,options);
  const baseline = simulate(fixture,{...options,scenarioId:"none"});
  const comparisons = shocked.snapshots.map((snap, i) => {
    const base = baseline.snapshots[i];
    return {quarter:snap.quarter,byCountry:Object.fromEntries(fixture.countries.map(c=>{
      const r=snap.rows[c.id], b=base.rows[c.id];
      return [c.id,{
        outputDelta:round(r.outputIndex-b.outputIndex,3),
        unservedDelta:round(r.unserved-b.unserved,3),
        treasuryDelta:round(r.treasuryClosing-b.treasuryClosing,3),
        energyCoverageDelta:round(100*(r.coverage-b.coverage),3)
      }];
    }))};
  });
  return {shocked,baseline,comparisons};
}
