import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {validateBilateralRegistry} from "../tools/validate_bilateral_registry.mjs";
import {selectBilateralFacts,BILATERAL_CATEGORIES,formatBilateralMetric} from "../prototype/country-relations/bilateral.mjs";
const root=new URL("../",import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL("data/bilateral/registry.v1.json",root),"utf8"));
const opts=JSON.parse(fs.readFileSync(new URL("prototype/country-relations/country-options.json",root),"utf8"));
const countryCodes=opts.countries.map(c=>c.code);
const clone=()=>structuredClone(data);
test("registry enforces all eight categories, official sources, country codes and review status",()=>{
  const verdict=validateBilateralRegistry(data,{allowedCountries:countryCodes});
  assert.equal(verdict.records,10);
  assert.equal(verdict.sources,10);
  assert.equal(verdict.categories,8);
  assert.equal(verdict.needs_review,10);
  assert.equal(Object.keys(BILATERAL_CATEGORIES).length,8);
});
test("PL-DE has nine named, traceable bilateral source records and no fabricated active dispute",()=>{
  const r=selectBilateralFacts(data,"PL","DE");
  assert.equal(r.records.length,9);
  assert(r.records.some(x=>x.type==="border_settlement"&&x.dispute_status==="historically_settled"));
  assert.equal(r.active_disputes,0);
  assert.equal(r.historical_settlements,1);
  assert(r.records.every(x=>x.sources.length&&x.review_status==="review_required"));
});
test("direction of trade and FDI is preserved, and stock is not flow",()=>{
  const r=selectBilateralFacts(data,"DE","PL",{domain:"economy"});
  const de=r.records.find(x=>x.id==="de-pl-trade-exports-h1-2025");
  const pl=r.records.find(x=>x.id==="pl-de-trade-exports-h1-2025");
  assert.equal(de.party_label,"DE → PL");assert.equal(de.measurement.value,49.4);
  assert.equal(pl.party_label,"PL → DE");assert.equal(pl.measurement.value,40.6);
  const fdi=r.records.find(x=>x.id==="de-pl-fdi-stock-2022");
  assert.equal(fdi.measurement.kind,"direct_investment_position");
  assert.match(formatBilateralMetric(fdi),/42,6.*млрд.*евро/);
});
test("US-RU sanctions are a dated specific US decision, not global trade blockade",()=>{
  const r=selectBilateralFacts(data,"US","RU",{domain:"security"});
  assert.equal(r.count,1);assert.equal(r.records[0].category,"sanctions");
  assert.equal(r.records[0].party_label,"US → RU");
  assert.equal(r.records[0].legal_status,"action_recorded");
  assert.equal(selectBilateralFacts(data,"US","RU",{domain:"science"}).count,0);
});
test("missing country-pair evidence remains a research gap, not a negative score",()=>{
  const r=selectBilateralFacts(data,"PL","BY");
  assert.equal(r.count,0);assert.equal(r.active_disputes,0);
  assert(r.categories.every(x=>x.coverage==="no_record_in_this_scope"));
});
test("temporal filters do not backdate statistics or US sanctions",()=>{
  const early=selectBilateralFacts(data,"PL","DE",{until:"2000-01-01"});
  assert(early.records.some(x=>x.type==="border_settlement"));
  assert(!early.records.some(x=>x.measurement));
  assert.equal(selectBilateralFacts(data,"RU","US",{until:"2025-10-21"}).count,0);
});
test("only source-backed categories are displayed, with no invented sanctions for PL-DE",()=>{
  const pl=selectBilateralFacts(data,"PL","DE",{domain:"security"});
  assert.equal(pl.count,1);
  assert.equal(pl.records[0].category,"territorial");
  assert.equal(pl.records[0].dispute_status,"historically_settled");
  assert(!pl.records.some(x=>x.category==="sanctions"));
});
test("invalid duplicate/source/ISO/date/measurement/signoff/fake active dispute fail closed",()=>{
  const tamper=(f)=>{const x=clone();f(x);assert.throws(()=>validateBilateralRegistry(x,{allowedCountries:countryCodes}));};
  tamper(x=>x.records.push(structuredClone(x.records[0])));
  tamper(x=>x.records[0].source_ids=["missing"]);
  tamper(x=>x.records[0].pair=["DE","ZZ"]);
  tamper(x=>x.records[0].occurred_on="2026-02-31");
  tamper(x=>x.records[3].measurement.geography_from="PL");
  tamper(x=>{x.records[0].review_status="approved";});
  tamper(x=>{x.records[1].dispute_status="documented_active";});
  tamper(x=>{x.publication_status="approved_for_public_reuse";});
  assert.throws(()=>selectBilateralFacts(data,"PL","PL"),/две разные/);
  assert.throws(()=>selectBilateralFacts(data,"PL","DE",{until:"2025-02-31"}),/дата/);
});
