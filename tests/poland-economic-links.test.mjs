import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {build} from "../tools/build_poland_economy.mjs";
const doc=JSON.parse(fs.readFileSync(new URL("../data/cases/poland-policy-economy-2026-10.json",import.meta.url),"utf8"));
const overlay=JSON.parse(fs.readFileSync(new URL("../data/overlays/PL-policy-economy-2026-10.json",import.meta.url),"utf8"));
const nodes=new Map(doc.nodes.map(x=>[x.id,x])), sources=new Set(doc.sources.map(x=>x.id));
const get=id=>nodes.get(id)?.indicator?.value;
test("projection exactly rebuilds from canonical source cases and overlay",()=>assert.deepEqual(build(),doc));
test("all measured indicators retain original GUS, NBP or MSWiA sources",()=>{
 for(const n of doc.nodes){
  if(n.indicator?.value!==undefined){
   assert.ok(sources.has(n.indicator.source_id),"Missing source: "+n.id);
   assert.ok(n.indicator.period && n.indicator.unit && n.indicator.population_scope,"Incomplete grain: "+n.id);
  }
 }
 assert.ok(doc.sources.some(s=>s.publisher.includes("Statistics Poland")));
 assert.ok(doc.sources.some(s=>s.publisher.includes("Narodowy Bank")));
});
test("GUS worker stock grows while distinct MSWiA visa issuance falls",()=>{
 assert.equal(get("pl-foreign-workers-2025-03"),1067);
 assert.equal(get("pl-foreign-workers-2026-03"),1152.7);
 assert.ok(get("pl-foreign-workers-2026-03")>get("pl-foreign-workers-2025-03"));
 assert.equal(get("pl-visa-2026"),16000);
 assert.equal(get("pl-visa-2022"),123000);
 assert.ok(doc.relations.some(e=>e.id==="rel-pl-visa-vs-workers" && e.relation==="associated_with"));
});
test("quarterly vacancies and investment baseline are separate metrics",()=>{
 assert.equal(get("pl-job-vacancies-2026-q1"),100.2);
 assert.equal(get("pl-job-vacancies-2026-q2"),98.7);
 assert.equal(get("pl-vacancy-rate-2026-q2"),0.8);
 assert.equal(get("pl-enterprise-investment-h1-2026"),100.2);
 assert.equal(get("pl-enterprise-investment-growth-h1-2026"),13.7);
 assert.equal(get("pl-fdi-inflow-2023"),125.7);
 assert.equal(get("pl-fdi-inflow-2024"),56.5);
 assert.notEqual(nodes.get("pl-fdi-inflow-2024").indicator.unit,
    nodes.get("pl-enterprise-investment-h1-2026").indicator.unit);
});
test("no politically generated effect points back to an earlier measurement",()=>{
 const historical=new Set([
 "pl-foreign-workers-2025-03","pl-foreign-workers-2026-03",
 "pl-job-vacancies-2026-q1","pl-job-vacancies-2026-q2",
 "pl-enterprise-investment-h1-2026","pl-enterprise-investment-growth-h1-2026",
 "pl-fdi-inflow-2023","pl-fdi-inflow-2024"
 ]);
 for(const e of doc.relations) {
  assert.ok(nodes.has(e.from) && nodes.has(e.to),"Dangling "+e.id);
  if(["hypothesized_to_affect","supported_causal_effect"].includes(e.relation)){
   assert.ok(e.claim_ids?.length,"Causal claim missing for "+e.id);
   assert.ok(Date.parse(nodes.get(e.from).at)<=Date.parse(nodes.get(e.to).at),"Backward influence: "+e.id);
   if(e.from==="pl-tk-suspension"||e.from==="pl-legislative-block")
    assert.ok(!historical.has(e.to),"October shock cannot cause pre-October observation "+e.id);
  }
 }
 assert.ok(!doc.relations.some(e=>e.relation==="supported_causal_effect"),"No quantitative effects are established yet");
});
test("reviewed source is not interchanged with an opinion and the projection contains future alternatives",()=>{
 assert.equal(doc.synthetic,false);
 assert.ok(doc.claims.some(c=>c.id==="claim-pl-institutions-investment-prospective"));
 assert.ok(doc.claims.some(c=>c.id==="claim-pl-future-labour-impact"));
 for(const s of doc.sources)assert.match(s.url,/^https:\/\//);
 assert.equal(overlay.as_of,"2026-10-30T22:30:00Z");
});
