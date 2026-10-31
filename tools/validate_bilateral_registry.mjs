#!/usr/bin/env node
// Semantic validation (zero dependencies). JSON Schema in schemas/bilateral-relations.schema.json
// documents the format; this enforces temporal, legal and referential invariants.
import fs from "node:fs";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
export const ROOT=root;
const schema=JSON.parse(fs.readFileSync(new URL("../schemas/bilateral-relations.schema.json",import.meta.url),"utf8"));
function exactFields(value,def,label){
  assert(value&&typeof value==="object"&&!Array.isArray(value),label+" must be an object");
  assert.deepEqual(Object.keys(value).sort(),Object.keys(def.properties).sort(),"Unknown or missing field in "+label);
}
const enumIn=(value,arr,label)=>assert(arr.includes(value),"Invalid "+label+": "+value);
const ISO=/^[A-Z]{2}$/;
const ID=/^[a-z][a-z0-9-]+$/;
const domains=new Set(["politics","economy","finance","energy","society","logistics","security","environment","science"]);
const types=new Set(["treaties","trade","investment","sanctions","territorial","migration","science","society"]);
function date(v,label,nullable=false){
  if(nullable&&v===null)return;
  assert.equal(typeof v,"string",label+" must be a date");
  assert(/^\d{4}-\d{2}-\d{2}$/.test(v),label+" must use YYYY-MM-DD");
  const d=new Date(v+"T00:00:00.000Z");
  assert(!Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v,"Invalid calendar day "+label);
}
function unique(arr,label){
  assert(Array.isArray(arr),label+" must be array");
  assert.equal(new Set(arr).size,arr.length,"Duplicate "+label);
}
export function validateBilateralRegistry(doc,{allowedCountries}={}){
  exactFields(doc,schema,"registry root");
  assert.equal(doc?.schema_version,"1.0.0");
  assert.equal(doc.registry_id,"world-information.bilateral.v1");
  enumIn(doc.publication_status,["research_staging_review_required","approved_for_public_reuse"],"publication_status");
  date(doc.as_of,"root.as_of");
  assert(doc.summary?.length>=25&&doc.source_policy?.length>=25,"Missing research caveat / rights disclaimer");
  unique(doc.categories,"categories");assert.equal(doc.categories.length,8);
  assert.deepEqual(new Set(doc.categories),types,"Required eight research categories missing");
  assert(Array.isArray(doc.sources)&&doc.sources.length>0,"Missing source records");
  assert(Array.isArray(doc.records),"Missing evidence records");
  if(allowedCountries!==undefined){unique(allowedCountries,"country ISO registry");}
  const validISO=new Set(allowedCountries||[]);
  const sourceMap=new Map(),recordMap=new Map();
  for(const s of doc.sources){
    exactFields(s,schema.$defs.source,"source");
    assert(ID.test(s.id)&&!sourceMap.has(s.id),"Bad or duplicate source ID "+s.id);
    assert(/^https:\/\/[^/]+/.test(s.url),"Source must be HTTPS");
    assert(s.publisher?.length>=4&&s.title?.length>=8,"Source missing publisher/title "+s.id);
    assert(s.rights?.includes("redistribution_not_cleared"),"Source license/reuse unknown "+s.id);
    enumIn(s.kind,["primary_legal_record","primary_regulatory_notice","official_government_overview","official_secondary_statistics","official_government_event","official_public_historical_context"],"source.kind");
    date(s.published_on,"published_on "+s.id,true);
    date(s.retrieved_on,"retrieved_on "+s.id);
    assert(s.retrieved_on<=doc.as_of,"Source future retrieval "+s.id);
    if(s.published_on!==null)assert(s.published_on<=doc.as_of,"Source publication after snapshot "+s.id);
    sourceMap.set(s.id,s);
  }
  for(const x of doc.records){
    exactFields(x,schema.$defs.record,"bilateral fact");
    assert(ID.test(x.id)&&!recordMap.has(x.id),"Bad or duplicate record ID "+x.id);
    assert(Number.isInteger(x.version)&&x.version>=1,"Missing version "+x.id);
    assert(Array.isArray(x.pair)&&x.pair.length===2&&x.pair.every(c=>ISO.test(c))&&x.pair[0]<x.pair[1],"Pair must have two sorted ISO codes");
    if(allowedCountries)assert(x.pair.every(c=>validISO.has(c)),"Pair not found in canonical country index: "+x.id);
    enumIn(x.direction,["directed","bilateral"],"direction");
    if(x.direction==="directed")assert(x.from!==x.to&&x.pair.includes(x.from)&&x.pair.includes(x.to),"Directed endpoints invalid "+x.id);
    else assert(x.from===null&&x.to===null,"Bilateral record must not imply a direction "+x.id);
    assert(types.has(x.category),"Unknown relation category "+x.id);
    unique(x.domain_tags,"domain_tags "+x.id);
    assert(x.domain_tags.length&&x.domain_tags.every(d=>domains.has(d)),"Invalid subject domains "+x.id);
    assert(/^[a-z][a-z0-9_]+$/.test(x.type),"Invalid relation subtype "+x.id);
    assert(x.title_ru?.length>=8&&x.claim_ru?.length>=30,"Missing attributed claim "+x.id);
    date(x.occurred_on,"occurred_on "+x.id,true);
    date(x.as_of,"as_of "+x.id);
    assert(x.as_of<=doc.as_of&&(!x.occurred_on||x.occurred_on<=x.as_of),"Record future-dated "+x.id);
    enumIn(x.temporal_status,["historical_agreement","dated_measurement","source_reported_snapshot","undated_source_overview","historical_event","historical_policy_action"],"temporal_status");
    enumIn(x.evidence_status,["primary_official_document","official_secondary_measurement","official_reported_estimate","official_government_description"],"evidence_status");
    enumIn(x.review_status,["review_required","approved","rejected"],"review_status");
    date(x.approved_on,"approved_on "+x.id,true);
    if(x.review_status==="approved")
      assert(x.reviewer?.length>=3&&x.approved_on!==null&&x.approved_on<=doc.as_of,"Approval requires reviewer and date "+x.id);
    else assert(x.reviewer===null&&x.approved_on===null,"Unreviewed record has fake signoff "+x.id);
    enumIn(x.dispute_status,["none","historically_settled","documented_active","contested"],"dispute_status");
    enumIn(x.legal_status,["in_force_as_listed","not_applicable","action_recorded","status_unverified"],"legal_status");
    if(x.dispute_status==="historically_settled")assert(x.category==="territorial"&&x.type==="border_settlement","Historical border cannot be an active dispute "+x.id);
    if(x.dispute_status==="documented_active"){
      assert(x.category==="territorial"&&x.type==="documented_territorial_dispute","Active disputes require explicit dispute type "+x.id);
      assert(x.review_status==="approved"&&x.source_ids.length>=2,"Active dispute requires independent editorial approval and corroboration "+x.id);
    }
    if(x.category==="sanctions")assert(x.direction==="directed"&&x.type==="targeted_sanctions_action","No global blanket sanctions inference");
    if(x.category==="treaties")assert(x.direction==="bilateral"&&x.type==="bilateral_treaty","Treaties are reciprocal documents, not automatically directed flows");
    if(x.category==="territorial"&&x.type==="border_settlement")assert(x.direction==="bilateral","Border settlement needs both parties");
    unique(x.source_ids,"source ids "+x.id);
    assert(x.source_ids.length&&x.source_ids.every(id=>sourceMap.has(id)),"Missing proof source "+x.id);
    assert(x.limitations?.length>=25,"Limitations / uncertainty required "+x.id);
    unique(x.supersedes,"supersedes "+x.id);
    assert(Array.isArray(x.alternatives)&&x.alternatives.every(v=>typeof v==="string"&&v.length>=6),"Invalid alternative explanations "+x.id);
    if(x.measurement!==null){
      const m=x.measurement;
      exactFields(m,schema.$defs.measurement,"measured bilateral fact");
      assert(["trade","investment","migration"].includes(x.category),"Illegal measured category "+x.id);
      enumIn(m.kind,["goods_export_value","direct_investment_position","resident_citizens_stock"],"metric kind");
      assert(Number.isFinite(m.value)&&m.value>=0,"Invalid numeric measurement "+x.id);
      assert(["EUR","persons"].includes(m.unit)&&["billion","units"].includes(m.scale),"Bad metric units "+x.id);
      assert((m.unit==="EUR"&&m.scale==="billion")||(m.unit==="persons"&&m.scale==="units"),"Metric unit/scale inconsistent "+x.id);
      enumIn(m.qualifier,["reported","approximately"],"metric qualifier");
      assert(m.population_scope?.length>=12&&m.methodology?.length>=25,"Measurement scope/method absent "+x.id);
      date(m.period_start,"period_start "+x.id,true);
      date(m.period_end,"period_end "+x.id);
      assert(m.period_end<=x.as_of&&(!m.period_start||m.period_start<=m.period_end),"Future/inverted measurement window "+x.id);
      assert(x.direction==="directed"&&m.geography_from===x.from&&m.geography_to===x.to,"Metric direction inconsistent "+x.id);
      assert(x.source_ids.includes(m.source_id),"Numeric measurement has no source reference "+x.id);
      assert(["official_secondary_measurement","official_reported_estimate"].includes(x.evidence_status),"Numeric value needs separate attributed evidence level "+x.id);
    }else{
      assert(!["trade","investment","migration"].includes(x.category),"Quantitative category missing its measured series "+x.id);
    }
    recordMap.set(x.id,x);
  }
  for(const x of doc.records){
    for(const id of x.supersedes)assert(id!==x.id&&recordMap.has(id),"Invalid superseded record "+x.id);
  }
  if(doc.publication_status==="approved_for_public_reuse")
    assert(doc.records.every(x=>x.review_status==="approved"),"Release cannot promote unreviewed claims");
  return {records:doc.records.length,sources:doc.sources.length,categories:doc.categories.length,needs_review:doc.records.filter(x=>x.review_status!=="approved").length};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  try{
    const data=JSON.parse(fs.readFileSync(new URL("../data/bilateral/registry.v1.json",import.meta.url)));
    const opts=JSON.parse(fs.readFileSync(new URL("../prototype/country-relations/country-options.json",import.meta.url)));
    const verdict=validateBilateralRegistry(data,{allowedCountries:opts.countries.map(c=>c.code)});
    if(process.argv.includes("--require-approved"))
      assert.equal(data.publication_status,"approved_for_public_reuse","STOP: public Pages release requires signed off bilateral evidence and rights review");
    console.log("PASS: bilateral registry",JSON.stringify(verdict));
  }catch(e){
    console.error("FAIL: bilateral registry:",e.message);
    process.exitCode=1;
  }
}
