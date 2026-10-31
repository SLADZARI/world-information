import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {summarizeCountryPair} from "../prototype/country-relations/core.mjs";
const root=new URL("../",import.meta.url);
const ids=JSON.parse(fs.readFileSync(new URL("data/case-registry.json",root))).cases;
const cases=ids.map(id=>JSON.parse(fs.readFileSync(new URL("data/cases/"+id+".json",root))));
test("Poland–Germany share EU gas topics but no fabricated bilateral dispute",()=>{
  const p=summarizeCountryPair(cases,"PL","DE");
  assert(p.cases.some(x=>x.id==="eu-gas-transition-2021-2026"));
  assert(p.topics.some(x=>x.label==="Диверсификация импорта"));
  assert.equal(p.crossRegionEdges.length,0);
  assert.equal(p.explicitDisputes.length,0);
  assert(p.topics.every(x=>x.countries.includes("PL")&&x.countries.includes("DE")));
});
test("Egypt–Panama coappear in logistics but country disputes are not inferred",()=>{
  const p=summarizeCountryPair(cases,"EG","PA",{category:"economy"});
  assert(p.topics.some(x=>x.label==="Стоимость морской перевозки?"));
  assert.equal(p.explicitDisputes.length,0);
});
test("China–Hong Kong comparison is cross-region association, not causal dispute",()=>{
  const p=summarizeCountryPair(cases,"CN","HK",{category:"finance"});
  assert.equal(p.crossRegionEdges.length,1);
  assert.equal(p.crossRegionEdges[0].relation,"associated_with");
  assert.equal(p.explicitDisputes.length,0);
  assert(p.crossRegionEdges[0].sources.length>0);
});
test("US–China shared market themes must not be upgraded to bilateral trade evidence",()=>{
  const p=summarizeCountryPair(cases,"US","CN");
  assert(p.topics.some(x=>x.label.includes("AI CAPEX")));
  assert.equal(p.crossRegionEdges.length,0);
  assert.equal(p.explicitDisputes.length,0);
});
test("No evidence is explicitly reported for pair with no joint research",()=>{
  const p=summarizeCountryPair(cases,"PL","BY");
  assert.deepEqual(p.counts,{cases:0,topics:0,crossRegionEdges:0,verifiedBilateralDisputes:0});
});
test("Time and category filters remove ineligible future observations",()=>{
  const p=summarizeCountryPair(cases,"PL","DE",{until:"2021-12-31",category:"energy"});
  assert(p.topics.every(x=>x.at.slice(0,10)<="2021-12-31"));
  assert(!p.topics.some(x=>x.label.includes("REPowerEU")));
  const q=summarizeCountryPair(cases,"PL","DE",{category:"society"});
  assert.equal(q.topics.length,0);
});
test("Reject same country, invalid ISO or invalid domain",()=>{
  assert.throws(()=>summarizeCountryPair(cases,"PL","PL"),/разные страны/);
  assert.throws(()=>summarizeCountryPair(cases,"XXX","PL"),/ISO/);
  assert.throws(()=>summarizeCountryPair(cases,"PL","DE",{category:"friendship"}),/категория/);
});
test("All seven canonical research cases are loaded and source references remain bounded",()=>{
  assert.equal(cases.length,7);
  const p=summarizeCountryPair(cases,"PL","DE");
  for(const x of p.topics)for(const s of x.sources)assert.match(s.url,/^https:\/\//);
});
