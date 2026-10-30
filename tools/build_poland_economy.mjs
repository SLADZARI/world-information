#!/usr/bin/env node
/**
 * Compose the reviewed Poland institutional and migration graphs with
 * the measured GUS/NBP country economic overlay.
 *
 * Evidence stays canonical in source graphs and overlay; the built board case
 * is a deterministic projection. No news causes are inferred.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const OVERLAY="data/overlays/PL-policy-economy-2026-10.json";
const OUTPUT="data/cases/poland-policy-economy-2026-10.json";
const load=relative=>JSON.parse(readFileSync(path.join(ROOT,relative),"utf8"));
const idIndex=(entries,name)=> {
  const result=new Map();
  for(const item of entries){
    assert(item?.id && !result.has(item.id),"Duplicate/missing "+name+": "+item?.id);
    result.set(item.id,item);
  }
  return result;
};
function addUnique(index,item,collection){
  const prior=index.get(item.id);
  if(prior){
    assert.deepEqual(prior,item,"Nonidentical records with same ID: "+item.id);
    return;
  }
  index.set(item.id,item);
  collection.push(structuredClone(item));
}
export function build(overlay=load(OVERLAY),caseLoader=name=>load("data/cases/"+name+".json")){
  assert.equal(overlay.synthetic,false);
  assert.equal(overlay.projection_id,"poland-policy-economy-2026-10");
  const bases=overlay.base_cases.map(caseLoader);
  assert.equal(bases.length,2,"Expected two independent Polish research graphs");
  const allNodes=idIndex(bases.flatMap(b=>b.nodes),"base node");
  const allEdges=idIndex(bases.flatMap(b=>b.relations),"base relation");
  const allClaims=idIndex(bases.flatMap(b=>b.claims),"base claim");
  const allSources=idIndex(bases.flatMap(b=>b.sources),"base source");
  const nodes=[], relations=[],claims=[],sources=[];
  const nodeIndex=new Map(),edgeIndex=new Map(),claimIndex=new Map(),sourceIndex=new Map();
  for(const id of overlay.base_node_ids){
    const n=allNodes.get(id);assert(n,"Missing base node "+id);
    const copy=structuredClone(n);
    if(overlay.layout_overrides[id])copy.layout=structuredClone(overlay.layout_overrides[id]);
    addUnique(nodeIndex,copy,nodes);
  }
  for(const n of overlay.nodes)addUnique(nodeIndex,n,nodes);
  for(const id of overlay.base_relation_ids) {
    const e=allEdges.get(id);assert(e,"Missing base relation "+id);
    addUnique(edgeIndex,e,relations);
  }
  for(const e of overlay.relations)addUnique(edgeIndex,e,relations);
  const useClaims=new Set(relations.flatMap(e=>[...(e.claim_ids||[]),...(e.alternative_claim_ids||[])]));
  for(const id of useClaims){
    const claim=allClaims.get(id)||overlay.claims.find(c=>c.id===id);
    assert(claim,"Unknown claim "+id);
    addUnique(claimIndex,claim,claims);
  }
  const useSources=new Set([
    ...nodes.filter(n=>n.indicator?.source_id).map(n=>n.indicator.source_id),
    ...relations.flatMap(e=>e.evidence_source_ids||[]),
    ...claims.flatMap(c=>[...(c.evidence_source_ids||[]),...(c.contradicting_source_ids||[])])
  ]);
  for(const id of useSources){
    const src=allSources.get(id)||overlay.sources.find(s=>s.id===id);
    assert(src,"Unknown source "+id);
    addUnique(sourceIndex,src,sources);
  }
  for(const e of relations){
    assert(nodeIndex.has(e.from)&&nodeIndex.has(e.to),"Unresolved graph endpoint "+e.id);
    assert((e.claim_ids||[]).every(id=>claimIndex.has(id)),"Unresolved claim "+e.id);
    assert((e.evidence_source_ids||[]).every(id=>sourceIndex.has(id)),"Unresolved evidence "+e.id);
    const from=nodeIndex.get(e.from),to=nodeIndex.get(e.to);
    if(["hypothesized_to_affect","supported_causal_effect"].includes(e.relation)){
      assert(e.claim_ids?.length,"Causal mechanism has no falsifiable claim: "+e.id);
      assert(Date.parse(from.at)<=Date.parse(to.at),"Causal event points backwards in time: "+e.id);
      if(Date.parse(from.at)>Date.parse("2026-10-01T00:00:00Z")){
        assert(!["pl-foreign-workers-2025-03","pl-foreign-workers-2026-03","pl-job-vacancies-2026-q1","pl-job-vacancies-2026-q2","pl-fdi-inflow-2024","pl-enterprise-investment-h1-2026"].includes(e.to),"Oct 2026 event cannot cause older measurement: "+e.id);
      }
    }
  }
  assert(!relations.some(e=>e.from==="pl-tk-suspension"&&e.to==="pl-enterprise-investment-h1-2026"),"False historical causality");
  assert(!relations.some(e=>e.from==="pl-reputation-case"&&e.to==="pl-legislative-block"),"Unreviewed reputation narrative");
  const output={
    schema_version:"0.1.0",synthetic:false,
    case_id:overlay.projection_id,
    case_title:"Польша: государственные институты → миграция → рынок труда → инвестиции",
    description:"Наблюдаемая экономика: официальные ряды GUS/MSWiA/NBP; гипотезы влияния политики на будущие решения и вакансии отделены от исторических измерений. Ас-оф 30.10.2026. Детерминированная проекция двух исходных графов.",
    sources,nodes,relations,claims,scenarios:[],forecasts:[]
  };
  return output;
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
const run=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(run){
  const built=build();
  const filename=path.join(ROOT,OUTPUT);
  if(process.argv.includes("--check")){
    assert(same(built,load(OUTPUT)),"Country economy projection drifted; run node tools/build_poland_economy.mjs");
    process.stdout.write("PASS: "+built.nodes.length+" linked nodes, "+built.relations.length+" inspected relations, "+built.sources.length+" original sources\n");
  } else {
    writeFileSync(filename,JSON.stringify(built,null,2)+"\n");
    process.stdout.write("Created "+OUTPUT+" ("+built.nodes.length+" nodes; "+built.relations.length+" links)\n");
  }
}
