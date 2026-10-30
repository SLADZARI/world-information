#!/usr/bin/env node
// Browser-free fixture integrity and inline app syntax check.
import fs from "node:fs";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url);
const html=fs.readFileSync(new URL("prototype/research-board.html",root),"utf8");
const match=html.match(/<script type="application\/json" id="cases-data">([\s\S]*?)<\/script>/);
assert(match,"Missing embedded research cases");
const cases=JSON.parse(match[1]);
const ids=JSON.parse(fs.readFileSync(new URL("data/case-registry.json",root),"utf8")).cases;
assert.deepEqual(cases.map(x=>x.case_id),ids,"Board case order does not match manifest");
for(const id of ids){
  const canonical=JSON.parse(fs.readFileSync(new URL("data/cases/"+id+".json",root),"utf8"));
  assert.deepEqual(cases.find(x=>x.case_id===id),canonical,"Board snapshot drift: "+id);
}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const code=scripts.at(-1)?.[1];
assert(code,"Missing board application JavaScript");
new Function(code); // parse only: no DOM execution
for(const m of code.matchAll(/\$\("([^"]+)"\)/g))
  assert(html.includes('id="'+m[1]+'"'),"Missing DOM ID: "+m[1]);
console.log("PASS: "+ids.length+" canonical cases, board JS syntax and DOM references");
