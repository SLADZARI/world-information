#!/usr/bin/env node
// Only country names/codes/research-state escape the canonical generated index.
// No raw observations, research staging, or subjective bilateral scores are copied.
import fs from "node:fs";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL("data/catalog/country-index.generated.json",root),"utf8"));
assert.equal(source.countries.length,249,"Country registry cardinality changed");
const seen=new Set();
const countries=source.countries.map(c=>{
  assert.match(c.code,/^[A-Z]{2}$/);
  assert(!seen.has(c.code),"Duplicate ISO code "+c.code);seen.add(c.code);
  assert(typeof c.name==="string"&&c.name.trim(),"Missing country name");
  assert(["partial","queued","unresearched"].includes(c.status),"Invalid source research status");
  return {code:c.code,name:c.name,research_status:c.status};
});
const output={schema_version:1,as_of:source.as_of,source:"data/catalog/country-index.generated.json",country_count:countries.length,countries};
const wanted=JSON.stringify(output,null,2)+"\n";
const target=new URL("prototype/country-relations/country-options.json",root);
if(process.argv.includes("--check")){
  assert.equal(fs.readFileSync(target,"utf8"),wanted,"Country pair selector not synchronized with catalog");
  console.log("PASS: country-pair selector exactly matches 249 canonical country/area codes");
}else{
  fs.writeFileSync(target,wanted);
  console.log("Generated country pair options: "+countries.length);
}
