import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const root=new URL("../",import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const graph=read("data/research/ai-productivity/ai-productivity-paradox-1987-2026.graph.json");
const intake=read("data/research/ai-productivity/manifest.2026-11-01.json");
const sets=Object.fromEntries(["nodes","sources","relations","claims","scenarios","forecasts"].map(k=>[k,new Set(graph[k].map(x=>x.id))]));
const byId=(arr,id)=>graph[arr].find(x=>x.id===id);
const ts=s=>Date.parse(s);

test("AI case stays research staging rather than published",()=>{
  assert.equal(intake.review_status,"review_required");
  assert.equal(intake.publication_approved,false);
  assert.equal(intake.integration.rendered_on_board,false);
  assert.equal(intake.integration.case_registry_updated,false);
  assert.equal(graph.synthetic,false);
  assert.equal(graph.schema_version,"0.1.0");
  const manifest=read("data/case-registry.json");
  assert.ok(!manifest.cases.includes(graph.case_id),"Unreviewed AI graph must not be in public case registry");
  assert.ok(fs.readFileSync(new URL(intake.narrative,root),"utf8").includes("review_required"));
});

test("All graph IDs, sources and typed relations resolve and have auditable time",()=>{
  const keys=["nodes","sources","relations","claims","scenarios","forecasts"];
  for(const k of keys)assert.equal(sets[k].size,graph[k].length,"duplicates: "+k);
  assert.ok(graph.sources.length>=8);
  for(const s of graph.sources){
    assert.match(s.url,/^https:\/\//);
    assert.ok(s.publisher&&s.rights);
    assert.ok(Number.isFinite(ts(s.retrieved_at)),s.id+": retrieval date");
    assert.ok(ts(s.retrieved_at)<=ts("2026-11-02T00:00:00Z"));
    if(s.published_at)assert.ok(ts(s.published_at)<=ts(s.retrieved_at),s.id+": publication after retrieval");
  }
  for(const n of graph.nodes){
    assert.ok(n.category&&n.subcategories?.length,n.id+": category");
    assert.ok(n.layer&&Number.isFinite(ts(n.at)),n.id+": layer/date");
    if(n.indicator){
      const m=n.indicator;
      for(const field of ["metric","unit","period","population_scope","method","source_id"])assert.ok(m[field],n.id+": "+field);
      assert.ok(sets.sources.has(m.source_id),n.id+": missing measurement source");
      assert.ok(m.value===undefined||Number.isFinite(m.value));
      if(m.series)for(const e of m.series)assert.ok(e.period&&Number.isFinite(e.value));
    }
  }
  const causal=new Set(["hypothesized_to_affect","supported_causal_effect"]);
  for(const e of graph.relations){
    assert.ok(sets.nodes.has(e.from)&&sets.nodes.has(e.to),e.id+": dangling node");
    assert.ok(e.mechanism,e.id+": missing mechanism");
    assert.ok(e.evidence_source_ids.every(id=>sets.sources.has(id)),e.id+": unknown source");
    assert.ok(e.claim_ids.every(id=>sets.claims.has(id)),e.id+": unknown claim");
    assert.ok((e.alternative_claim_ids||[]).every(id=>sets.claims.has(id)),e.id+": unknown alternative claim");
    if(causal.has(e.relation)){
      assert.ok(e.claim_ids.length,e.id+": unsupported causality");
      assert.ok(ts(byId("nodes",e.from).at)<=ts(byId("nodes",e.to).at),e.id+": backward causality");
    }
    if(e.status==="supported")assert.ok(e.evidence_source_ids.length,e.id+": supported without evidence");
  }
  for(const c of graph.claims){
    assert.equal(c.review_status,"under_review");
    assert.ok(c.falsification&&c.alternatives?.length,c.id+": requires alternatives and falsification");
    assert.ok(c.evidence_source_ids.every(id=>sets.sources.has(id)));
  }
  for(const scenario of graph.scenarios){
    assert.equal(scenario.is_forecast,false);
    assert.ok(scenario.assumptions.length>=2);
    assert.ok(ts(scenario.base_as_of)<=ts("2026-11-02T00:00:00Z"));
  }
  assert.deepEqual(graph.forecasts,[]);
});

test("GDP investment proxy, BLS rates and survey claims cannot be mislabeled AI causality",()=>{
  const gdp=byId("nodes","indicator-ai-related-gdp").indicator;
  assert.deepEqual(gdp.series.map(x=>x.value),[1.3,1.16,0.48]);
  assert.match(gdp.metric,/NOT AI-only/i);
  assert.equal(gdp.unit,"percentage points of annualized real GDP growth");
  assert.equal(gdp.source_id,"src-stlouis-2026");
  assert.match(gdp.method,/imputed/i);
  const qoq=byId("nodes","indicator-bls-2026-q2-qoq").indicator;
  const yoy=byId("nodes","indicator-bls-2026-q2-yoy").indicator;
  assert.equal(qoq.value,1.4);assert.equal(yoy.value,2.2);
  assert.notEqual(qoq.unit,yoy.unit);
  assert.equal(byId("nodes","indicator-firm-ai-adoption").indicator.value,78);
  const survey=byId("nodes","indicator-selfreport-productivity").indicator;
  assert.equal(survey.value,0.2);
  assert.match(survey.unit,/self-reported/);
  assert.ok(!graph.relations.some(e=>e.to==="indicator-bls-2026-q2-qoq"&&e.relation==="supported_causal_effect"),"BLS aggregate is not a measured AI effect");
});

test("Distinct task studies retain opposite signs, scope and follow-up limitations",()=>{
  const support=byId("nodes","indicator-customer-support-15").indicator;
  const metr=byId("nodes","indicator-metr-time-19").indicator;
  assert.equal(support.value,15);
  assert.equal(metr.value,19);
  assert.match(support.unit,/resolved cases per hour/);
  assert.match(metr.unit,/positive = slower/);
  assert.match(metr.population_scope,/16 experienced/);
  assert.ok(graph.sources.some(x=>x.id==="src-metr-update-2026"));
  for(const edgeId of ["edge-support-task-effect","edge-metr-task-effect"]){
    const r=byId("relations",edgeId);
    assert.equal(r.relation,"supported_causal_effect");
    assert.ok(r.evidence_source_ids.length);
    assert.ok(r.claim_ids.length);
  }
});
