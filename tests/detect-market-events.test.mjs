import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {detectMarketAnomalies, validateObservations} from "../tools/detect_market_events.mjs";
const doc=JSON.parse(readFileSync(new URL("../data/examples/market-selloff-observations-2026-10-30.json",import.meta.url),"utf8"));
const copy=()=>structuredClone(doc);
test("source and observation snapshots pass integrity checks",()=>{
  assert.equal(validateObservations(doc),true);
});
test("reports distinct price shocks without claiming causation",()=>{
  const out=detectMarketAnomalies(doc);
  assert.deepEqual(out.signals.map(s=>s.instrument_id).sort(),["CN:CHINEXT","CN:SZCOMP","NASDAQ:INTC","US:NASDAQ-COMP"].sort());
  assert.equal(out.global_causal_conclusion,"none");
  assert.ok(out.signals.every(s=>s.causal_attribution==="none"&&s.review_status==="requires_exchange_verification"));
  assert.equal(out.signals.find(s=>s.instrument_id==="NASDAQ:INTC").observed_return_pct,-28.6);
  assert.equal(out.signals.find(s=>s.instrument_id==="NASDAQ:INTC").matched_rule.threshold_pct,8);
});
test("market cluster is observational and Hong Kong is positive counterevidence",()=>{
  const out=detectMarketAnomalies(doc);
  assert.equal(out.clusters.length,1);
  assert.deepEqual(out.clusters[0].regions.sort(),["CN","US"].sort());
  assert.equal(out.clusters[0].status,"observational_only");
  assert.ok(out.positiveCounterexamples.some(x=>x.instrument_id==="HK:HSI"&&x.return_pct>0));
  assert.ok(!out.signals.some(s=>s.instrument_id==="CN:SHCOMP"),"broad Shanghai drop lower than declared alert rule");
});
test("dedup and input provenance is mandatory",()=>{
  const x=copy();x.observations.push(structuredClone(x.observations[0]));
  assert.throws(()=>validateObservations(x),/Duplicate/);
  const y=copy();y.observations[0].source_id="fake";
  assert.throws(()=>validateObservations(y),/source/);
  const z=copy();z.sources[0].url="http://unsafe.example";
  assert.throws(()=>validateObservations(z),/HTTPS/);
});
test("do not mix regular session and rolling 24h observations into a single index cluster",()=>{
  const x=copy();x.observations=x.observations.filter(o=>o.region!=="CN");
  x.observations.push({instrument_id:"CN:NEW",label:"Synthetic new index",asset_type:"sector_index",region:"CN",sector:"technology",return_pct:-9,window:"rolling_24h",observed_at:"2026-10-30T08:00:00Z",source_id:"rthk-china",provenance:"test_synthetic"});
  const result=detectMarketAnomalies(x);
  assert.equal(result.clusters.length,0);
});
test("do not infer China selloff if Chinese instruments rise",()=>{
  const x=copy();
  x.observations=x.observations.filter(o=>o.region!=="CN");
  x.observations.push({instrument_id:"CN:TEST",label:"Synthetic Chinese index",asset_type:"sector_index",region:"CN",sector:"technology",return_pct:7,window:"regular_close_to_close",observed_at:"2026-10-30T07:00:00Z",source_id:"rthk-china",provenance:"test_synthetic"});
  const result=detectMarketAnomalies(x);
  assert.equal(result.clusters.length,0);
});
test("negative values and future timestamps fail closed",()=>{
  const x=copy();x.observations[0].return_pct=-101;
  assert.throws(()=>validateObservations(x),/Invalid price return/);
  const y=copy();y.observations[0].observed_at="2026-10-31T00:00:00Z";
  assert.throws(()=>validateObservations(y),/Future observation/);
});
