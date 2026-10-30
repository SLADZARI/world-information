import { test } from "node:test";
import assert from "node:assert/strict";
import { ECONOMY_FIXTURE as fixture } from "../prototype/economy-lab/fixtures.mjs";
import { simulate, compareRuns, auditSnapshot, validateFixture } from "../prototype/economy-lab/core.mjs";

test("fixture is explicitly synthetic, immutable across runs and valid",()=>{
  assert.equal(fixture.synthetic,true);
  assert.equal(validateFixture(fixture),true);
  const old=JSON.stringify(fixture);
  simulate(fixture,{scenarioId:"north-shock",horizon:8,policyPct:30});
  assert.equal(JSON.stringify(fixture),old);
});

test("baseline first quarter balances trade without unserved demand",()=>{
  const run=simulate(fixture,{scenarioId:"none",horizon:1,policyPct:0});
  const q=run.snapshots[0];
  assert.equal(q.routes.filter(x=>x.amount>0).length,2);
  for(const c of fixture.countries){
    assert.ok(Math.abs(q.rows[c.id].unserved)<1e-9);
    assert.ok(Math.abs(q.rows[c.id].outputIndex-100)<1e-9);
    assert.equal(auditSnapshot(fixture,q),true);
  }
});

test("external shock first becomes active in Q2, then propagates through reserves and trade",()=>{
  const run=simulate(fixture,{scenarioId:"north-shock",horizon:8,policyPct:0});
  assert.equal(run.snapshots[0].rows.NO.shockFraction,0);
  const q2=run.snapshots[1];
  assert.ok(q2.rows.NO.shockFraction>0.4);
  assert.ok(q2.rows.PL.unserved>0);
  assert.ok(q2.rows.DE.unserved>0);
  assert.ok(q2.rows.PL.outputIndex<100);
  assert.ok(q2.rows.PL.treasuryClosing>=0);
  assert.equal(auditSnapshot(fixture,q2),true);
  assert.ok(run.snapshots[2].rows.PL.reserveClosing<=q2.rows.PL.reserveClosing);
});

test("scenario outcomes are deterministic, consistent at every quarter and financially bounded",()=>{
  const options={scenarioId:"double-shock",horizon:12,policyPct:80};
  const a=simulate(fixture,options);
  const b=simulate(fixture,options);
  assert.deepEqual(a,b);
  for(const s of a.snapshots){
    auditSnapshot(fixture,s);
    for(const c of fixture.countries){
      const r=s.rows[c.id];
      assert.ok(r.investment>=0);
      assert.ok(r.publicPaid<=c.publicServices+1e-9);
      assert.ok(r.efficiencyClosing<=fixture.modelAssumptions.maxEfficiency+1e-9);
      assert.ok(r.reserveDraw<=r.reserveOpening+1e-9);
      assert.ok(r.treasuryClosing>=-1e-9);
    }
  }
});

test("policy investments consume cash in current quarter and only change demand in subsequent quarters",()=>{
  const none=simulate(fixture,{scenarioId:"north-shock",horizon:6,policyPct:0});
  const invested=simulate(fixture,{scenarioId:"north-shock",horizon:6,policyPct:80});
  assert.equal(invested.snapshots[0].rows.PL.demand,none.snapshots[0].rows.PL.demand);
  assert.ok(invested.snapshots[0].rows.PL.investment>0);
  assert.ok(invested.snapshots[0].rows.PL.treasuryClosing<none.snapshots[0].rows.PL.treasuryClosing);
  assert.ok(invested.snapshots[1].rows.PL.demand<none.snapshots[1].rows.PL.demand);
  assert.ok(invested.snapshots[5].rows.PL.outputIndex>=none.snapshots[5].rows.PL.outputIndex-1e-8);
});

test("control run has zero delta under scenario none",()=>{
  const result=compareRuns(fixture,{scenarioId:"none",horizon:8,policyPct:45});
  for(const q of result.comparisons) for(const c of fixture.countries){
    assert.equal(q.byCountry[c.id].outputDelta,0);
    assert.equal(q.byCountry[c.id].treasuryDelta,0);
    assert.equal(q.byCountry[c.id].unservedDelta,0);
  }
});

test("unknown scenario and impossible shock/treasury fixtures fail closed",()=>{
  assert.throws(()=>simulate(fixture,{scenarioId:"not-a-scenario"}),/Unknown scenario/);
  assert.throws(()=>simulate(fixture,{policyPct:101}),/Policy/);
  assert.throws(()=>simulate(fixture,{horizon:200}),/Horizon/);
  const broken=structuredClone(fixture);
  broken.countries[0].reserve=broken.countries[0].reserveCap+1;
  assert.throws(()=>validateFixture(broken),/reserve exceeds capacity/);
  broken.countries[0].reserve=0;
  broken.routes[0].capacity=-1;
  assert.throws(()=>validateFixture(broken),/Invalid nonnegative/);
});
