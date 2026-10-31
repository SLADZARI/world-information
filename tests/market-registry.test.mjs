import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {validateMarketBatch,toDetectorInput,analyzeMarketBatch} from "../tools/market_registry.mjs";
const original=JSON.parse(fs.readFileSync(new URL("../data/markets/US/2026-10-30-tech-selloff.json",import.meta.url),"utf8"));
const clone=()=>structuredClone(original);
test("seven user-published intraday claims are archived alongside real closing snapshots",()=>{
  assert.equal(validateMarketBatch(original),true);
  const claims=original.observations.filter(r=>r.window==="regular_session_intraday");
  const closes=original.observations.filter(r=>r.window==="regular_close_to_close");
  assert.equal(claims.length,7);assert.equal(closes.length,11);
  assert.ok(claims.every(x=>x.measurement_at===null&&x.verification_status==="report_only_time_unverified"));
  assert.ok(closes.every(x=>x.measurement_at==="2026-10-30T20:00:00Z"));
});
test("news article does not establish exact closing return",()=>{
  const pair=(ticker)=>original.observations.filter(o=>o.instrument_id===ticker).sort((a,b)=>a.window.localeCompare(b.window));
  for(const ticker of ["NASDAQ:INTC","NYSE:RDDT","NYSE:RBLX","NASDAQ:ILMN","NASDAQ:SNDK","NASDAQ:ARM","NYSE:DELL"]){
    const rows=pair(ticker);
    assert.equal(rows.length,2);
    assert.notEqual(rows[0].window,rows[1].window);
    assert.notEqual(rows[0].verification_status,rows[1].verification_status);
    assert.notEqual(rows[0].value,rows[1].value);
  }
  assert.equal(original.observations.find(x=>x.id==="claim-NASDAQ-INTC-20261030").value,-31);
  assert.equal(original.observations.find(x=>x.id==="close-NASDAQ-INTC-20261030").value,-28.58);
  assert.equal(original.observations.find(x=>x.id==="close-NASDAQ-ARM-20261030").value,-10.01);
});
test("detector only consumes regular-session closes, never social-media quote claims",()=>{
  const normalized=toDetectorInput(original);
  assert.equal(normalized.observations.length,11);
  assert.ok(normalized.observations.every(o=>o.window==="regular_close_to_close"&&o.provenance==="secondary_closing_snapshot"));
  const out=analyzeMarketBatch(original);
  assert.equal(out.preserved_intraday_claims,7);
  assert.equal(out.normalized_session_closes,11);
  assert.equal(out.clusters.length,0,"one US equity market is not multi-country contagion");
  assert.equal(out.global_causal_conclusion,"none");
  assert.equal(out.signal_count,10,"7 stock drops, 2 broad-index drops, 1 sector-index drop");
  assert.ok(out.signals.every(s=>s.review_status==="requires_exchange_verification"));
});
test("bad source, fake exchange confirmation, off-session timestamp or backwards report are rejected",()=>{
  const badSource=clone();badSource.observations[0].source_id="missing";
  assert.throws(()=>validateMarketBatch(badSource),/Unresolved/);
  const fakeExchange=clone();fakeExchange.observations.find(x=>x.window==="regular_close_to_close").verification_status="exchange_verified";
  assert.throws(()=>validateMarketBatch(fakeExchange),/Cannot claim exchange verification/);
  const future=clone();future.observations.find(x=>x.window==="regular_close_to_close").reported_at="2026-10-30T18:50:00Z";
  assert.throws(()=>validateMarketBatch(future),/Quote time after report time/);
  const quote=clone();quote.observations[0].measurement_at="2026-10-30T18:50:00Z";
  assert.throws(()=>validateMarketBatch(quote),/must not pretend to have exchange timestamp/);
});
test("unknown publication date remains null, and market observations never assert a common causal factor",()=>{
  assert.equal(original.sources.find(x=>x.id==="src-arm-close").published_at,null);
  assert.equal(original.connected_case_id,"ai-tech-multimarket-2026-10-30");
  assert.ok(original.narrative_assessments.every(n=>n.status!=="supported_causal_effect"));
  assert.equal(original.synthetic,false);
});
