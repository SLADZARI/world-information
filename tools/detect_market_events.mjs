/**
 * Conservative, evidence-first market event discovery from normalized observations.
 * Does NOT fetch prices, read news prose, infer causes, or label crashes as proven.
 * Input prices and reporting times are attributed, reviewed observations.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_RULES = Object.freeze({
  equity: { declinePct: 8, surgePct: 8 },
  broad_index: { declinePct: 2.5, surgePct: 2.5 },
  sector_index: { declinePct: 4, surgePct: 4 },
  crypto: { declinePct: 5, surgePct: 5 },
  // Detection families are purposefully categorical, not probabilities.
  clusterMaxWindowHours: 36,
  minRegions: 2,
  minIndexAlerts: 2
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function ms(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(iso)) throw new Error("Missing ISO 8601 timestamp");
  const dt=Date.parse(iso);
  if(!Number.isFinite(dt) || !/[Zz]|[+-]\d\d:\d\d$/.test(iso)) throw new Error("Timestamp must contain a timezone");
  return dt;
}
const stable = (...s) => s.map(v=>String(v).replace(/[^a-zA-Z0-9_-]/g,"_")).join("__");
const validReturn = n=>typeof n==="number" && Number.isFinite(n) && n>=-100 && n<=1000;
export function validateObservations(doc) {
  assert(doc?.schema_version==="0.1.0", "Unsupported observations schema");
  assert(Array.isArray(doc.sources) && doc.sources.length>0, "Sources required");
  assert(Array.isArray(doc.observations) && doc.observations.length>0, "Observations required");
  const asOf=ms(doc.as_of);
  const sources=new Set();
  for(const source of doc.sources) {
    assert(source.id && !sources.has(source.id), "Duplicate/missing source id");
    sources.add(source.id);
    assert(/^https:\/\//.test(source.url), "Sources must be HTTPS");
    const published=ms(source.published_at);
    assert(published<=asOf, "Future source relative to as_of");
  }
  const ids=new Set();
  for(const obs of doc.observations) {
    assert(typeof obs.instrument_id==="string" && obs.instrument_id.length>2, "Instrument ID required");
    assert(!ids.has(obs.instrument_id+"@"+obs.window+"@"+obs.observed_at), "Duplicate instrument/window/time");
    ids.add(obs.instrument_id+"@"+obs.window+"@"+obs.observed_at);
    assert(Object.prototype.hasOwnProperty.call(DEFAULT_RULES,obs.asset_type), "Unknown asset type");
    assert(validReturn(obs.return_pct), "Invalid price return");
    assert(obs.region && obs.sector && obs.label, "Region, sector and label required");
    assert(obs.window==="regular_close_to_close" || obs.window==="rolling_24h", "Unrecognized measurement window");
    assert(sources.has(obs.source_id), "Observation has no attributable source");
    assert(obs.provenance && typeof obs.provenance==="string", "Missing provenance status");
    assert(ms(obs.observed_at)<=asOf, "Future observation");
  }
  if(doc.narratives) {
    assert(Array.isArray(doc.narratives),"Narratives must be an array");
    const ids=new Set();
    for(const n of doc.narratives){
      assert(n.id && !ids.has(n.id), "Duplicate/missing narrative ID"); ids.add(n.id);
      assert(n.text && n.status && n.note, "Narrative requires raw text, review status and note");
    }
  }
  return true;
}
export function detectMarketAnomalies(doc, rules=DEFAULT_RULES) {
  validateObservations(doc);
  const signals=[];
  for(const o of doc.observations){
    const rule=rules[o.asset_type];
    const direction=o.return_pct<=-rule.declinePct?"decline":o.return_pct>=rule.surgePct?"rise":null;
    if(!direction)continue;
    signals.push({
      id:"signal-"+stable(o.instrument_id,o.observed_at),
      type:"market_price_anomaly_candidate",
      direction, asset_type:o.asset_type,
      instrument_id:o.instrument_id, region:o.region, sector:o.sector,
      observed_return_pct:o.return_pct, reported_window:o.window,
      observed_at:o.observed_at, source_id:o.source_id, provenance:o.provenance,
      matched_rule:{threshold_pct:direction==="decline"?rule.declinePct:rule.surgePct},
      review_status:"requires_exchange_verification",
      causal_attribution:"none"
    });
  }
  // Report synchronized movement only for the compatible session type.
  // Different market closes in Asia and US do not imply direct transmission.
  const indexDown=signals.filter(s=>s.direction==="decline" && ["broad_index","sector_index"].includes(s.asset_type) && s.reported_window==="regular_close_to_close");
  const regions=[...new Set(indexDown.map(s=>s.region))];
  const times=indexDown.map(s=>ms(s.observed_at));
  const spanH=times.length>1?(Math.max(...times)-Math.min(...times))/3600000:0;
  const crossRegion=regions.length>=rules.minRegions && indexDown.length>=rules.minIndexAlerts && spanH<=rules.clusterMaxWindowHours;
  const positiveCounterexamples=doc.observations.filter(o=>o.return_pct>0).map(o=>({instrument_id:o.instrument_id,return_pct:o.return_pct,source_id:o.source_id,region:o.region,window:o.window}));
  const clusters = crossRegion ? [{
    id:"cluster-"+doc.as_of.slice(0,10)+"-multimarket-equity",
    type:"coincident_market_stress_candidate",
    regions,observations:indexDown.map(s=>s.id),window_hours:Math.round(spanH*100)/100,
    status:"observational_only",causal_attribution:"not_established",
    caveat:"Cross-market co-movement may reflect multiple simultaneous causes; differences in market sessions, asset exposure and alternative drivers must be controlled."
  }]:[];
  return {
    schema_version:"0.1.0",
    as_of:doc.as_of,
    observation_count:doc.observations.length,
    signal_count:signals.length,
    signals,clusters,positiveCounterexamples,
    narratives:(doc.narratives||[]).map(n=>({...n,review_status:"requires_source_review"})),
    next_steps:[
      "Verify reported market moves against appropriately licensed exchange or consolidated closing series; preserve close versus intraday.",
      "Parse earnings, company guidance, consensus forecasts and cash-flow metrics separately.",
      "Compare exposed versus control sectors and windows; distinguish 2026-10-29 US post-close from 2026-10-30 Asian close.",
      "Keep Binance as an independent competing crypto-market trigger.",
      "Require evidence and method review before promoting any arrow to causal effect."
    ],
    global_causal_conclusion:"none"
  };
}
const isCli=process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1]);
if(isCli){
  const fixture=process.argv[2] || "data/examples/market-selloff-observations-2026-10-30.json";
  const result=detectMarketAnomalies(JSON.parse(readFileSync(fixture,"utf8")));
  if (process.argv[3]) {
    writeFileSync(process.argv[3],JSON.stringify(result,null,2)+"\n");
    process.stdout.write("Wrote review-only signals to "+process.argv[3]+"\n");
  } else process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
