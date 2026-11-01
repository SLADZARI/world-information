import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=path=>JSON.parse(fs.readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const r=read("data/research/ai-productivity/institutional-comparison.2026-11-01.json");
test("2026 institutional AI review remains non-public, bounded and sourced",()=>{
 assert.equal(r.status,"review_required");
 assert.equal(r.as_of,"2026-11-01");
 assert.ok(r.institutions.length>=10);
 assert.ok(r.comparability_notes.length>=5);
 const graph=read("data/research/ai-productivity/ai-productivity-paradox-1987-2026.graph.json");
 assert.equal(r.links_to,"data/research/ai-productivity/ai-productivity-paradox-1987-2026.graph.json");
 assert.equal(graph.synthetic,false);
 const ids=new Set();
 for(const i of r.institutions){
   assert.ok(i.institution&&i.publication&&i.published&&i.method&&i.finding&&i.caveat);
   assert.match(i.url,/^https:\/\//);
   assert.ok(i.published.slice(0,7)<="2026-11");
   assert.ok(!ids.has(i.url));ids.add(i.url);
   for(const m of i.metrics){
     assert.equal(typeof m.value,"number");
     for(const key of ["name","period","unit"])assert.ok(m[key],i.institution+" "+key);
   }
 }
 assert.ok(r.institutions.some(x=>/MIT/.test(x.institution)&&/SEC/.test(x.method)));
 assert.ok(r.institutions.some(x=>/BIS/.test(x.institution)&&/demand bottleneck/i.test(x.finding)));
 assert.ok(r.institutions.some(x=>/McKinsey/.test(x.institution)&&/EBIT/.test(x.finding)));
});
test("Different adoption and macro denominators cannot be silently collapsed",()=>{
 const mit=r.institutions.find(x=>x.publication==="AI Adoption in S&P 500 Firms");
 const nber=r.institutions.find(x=>x.publication.startsWith("Firm Data on AI"));
 const acemoglu=r.institutions.find(x=>x.publication==="The Simple Macroeconomics of AI");
 const imf=r.institutions.find(x=>x.institution==="IMF");
 assert.equal(mit.metrics[0].value,11);
 assert.equal(nber.metrics[0].value,78);
 assert.notEqual(mit.metrics[0].unit,nber.metrics[0].unit);
 assert.equal(acemoglu.metrics[0].value,0.53);
 assert.match(acemoglu.metrics[0].unit,/cumulative TFP/);
 assert.equal(imf.metrics[0].value,0.5);
 assert.match(imf.metrics[0].unit,/annual global growth/);
 const bis=r.institutions.find(x=>x.institution==="BIS");
 assert.equal(bis.evidence_type,"conditional_calibrated_model");
});
