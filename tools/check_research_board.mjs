#!/usr/bin/env node
// Parse-check page JS and compare embedded case snapshots to canonical JSON.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const html=fs.readFileSync(new URL('prototype/research-board.html',root),'utf8');
const fixture=html.match(/<script type="application\/json" id="cases-data">([\s\S]*?)<\/script>/);
assert(fixture,'Missing embedded research cases');
const cases=JSON.parse(fixture[1]);
const names=['eu-gas-transition-2021-2026','maritime-corridors-2023-2024'];
assert.equal(cases.length,names.length,'Unexpected dataset count');
for(const name of names){
 const canonical=JSON.parse(fs.readFileSync(new URL('data/cases/'+name+'.json',root),'utf8'));
 assert.deepEqual(cases.find(x=>x.case_id===name),canonical,'Board snapshot drift for '+name);
}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const code=scripts.at(-1)?.[1];assert(code,'Missing application code');
new Function(code); // parse, don't invoke DOM
for(const m of code.matchAll(/\$\("([^"]+)"\)/g)){assert(html.includes('id="'+m[1]+'"'),'DOM ID not found: '+m[1]);}
console.log('PASS: real board JS parses and matches canonical case graphs');
