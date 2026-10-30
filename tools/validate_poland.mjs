#!/usr/bin/env node
/** Offline semantic validation of Poland case graph + policy status registry.
 * Complements Graph JSON Schema; does NOT determine legal truth or cause.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const get=path=>JSON.parse(fs.readFileSync(new URL("../"+path,import.meta.url),"utf8"));
export const graphs=Object.fromEntries(
 ["poland-institutional-crisis-2026-10","poland-migration-policy-2025-2026"].map(name=>[name,get("data/cases/"+name+".json")]));
export const policies=get("data/policies/PL-2026-10-30.json");
export const profile=get("data/countries/PL/overview-2026-10-30.json");
export function validatePoland(policyData, countryData, allGraphs) {
 assert.equal(policyData.schema_version,"0.1.0");
 assert.equal(policyData.country,"PL");
 assert.equal(countryData.country_code,"PL");
 assert.equal(policyData.as_of,countryData.as_of);
 const records=new Set(),mig=allGraphs["poland-migration-policy-2025-2026"];
 const migNodes=new Map(mig.nodes.map(n=>[n.id,n]));
 const migSources=new Set(mig.sources.map(s=>s.id));
 assert.ok(migNodes.size>10,"Missing Poland migration nodes");
 for(const p of policyData.records){
  assert.ok(!records.has(p.id),"Duplicate policy id "+p.id);
  records.add(p.id);
  assert.ok(["proposed","enacted","time_limited","annual_exemption","disputed","repealed"].includes(p.status),p.id+" bad status");
  assert.ok(p.source_ids?.length && p.source_urls?.length,p.id+" missing evidence");
  assert.ok(p.source_ids.every(s=>migSources.has(s)),p.id+" source not in case graph");
  assert.ok(p.source_urls.every(s=>s.startsWith("https://")),p.id+" needs an HTTPS provenance");
  assert.ok(migNodes.has(p.graph_node_id),p.id+" missing graph node");
  assert.ok(p.applies_to.length && p.does_not_automatically_apply_to.length,p.id+" missing affected/unaffected groups");
  assert.ok(p.exceptions_and_transition,p.id+" missing exceptions");
  if(p.status==="proposed") assert.equal(p.effective_from,null,p.id+" proposed policy must not have active date");
  if(["enacted","annual_exemption","time_limited"].includes(p.status)) assert.ok(p.effective_from,p.id+" active policy needs start");
  if(p.effective_from && p.expires_at)assert.ok(p.effective_from<=p.expires_at,p.id+" expiry before start");
 }
 assert.equal(countryData.topic_clusters.length,3);
 for(const topic of countryData.topic_clusters){
  const graph=allGraphs[topic.event_graph_id];
  assert.ok(graph,topic.topic+" missing canonical graph");
  if(topic.file)assert.ok(topic.file.endsWith("/"+topic.event_graph_id+".json"),"Country graph path mismatch");
  assert.ok(topic.not_inferred?.length,topic.topic+" missing inference limits");
 }
 for(const [name,g]of Object.entries(allGraphs)){
  const nodeIDs=new Set(g.nodes.map(n=>n.id));
  const sourceIDs=new Set(g.sources.map(s=>s.id));
  const claimIDs=new Set(g.claims.map(c=>c.id));
  assert.equal(nodeIDs.size,g.nodes.length,name+" duplicate node");
  assert.equal(sourceIDs.size,g.sources.length,name+" duplicate source");
  for(const n of g.nodes)assert.ok(n.countries.includes("PL"),"Cross-country graph without Polish scope");
  for(const edge of g.relations){
   assert.ok(nodeIDs.has(edge.from)&&nodeIDs.has(edge.to),edge.id+" dangling");
   assert.ok(edge.evidence_source_ids.every(id=>sourceIDs.has(id)),edge.id+" unknown source");
   assert.ok(edge.claim_ids.every(id=>claimIDs.has(id)),edge.id+" unknown claim");
   if(edge.status==="supported")assert.ok(edge.evidence_source_ids.length,edge.id+" supported without evidence");
   if(edge.relation==="hypothesized_to_affect")assert.ok(edge.claim_ids.length,edge.id+" causal hypothesis without claim");
  }
 }
 const court=allGraphs["poland-institutional-crisis-2026-10"];
 const legalEvent="pl-reputation-case",tribunal="pl-tk-suspension";
 assert.ok(!court.relations.some(r=>
   ["hypothesized_to_affect","supported_causal_effect"].includes(r.relation)
   && ((r.from===legalEvent&&r.to===tribunal)||(r.to===legalEvent&&r.from===tribunal))),
   "Unsupported direct court scandal–Tribunal causality");
 return true;
}
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1])) {
 validatePoland(policies,profile,graphs);
 console.log("PASS: Poland political and migration graphs, legal status, affected groups, country profile");
}
