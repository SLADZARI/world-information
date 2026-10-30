#!/usr/bin/env node
// Offline smoke test: fixture synchronization, parseable inline JavaScript,
// and presence of used UI control IDs. It is not an end-to-end browser test.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../prototype/board.html',import.meta.url),'utf8');
const graph=JSON.parse(fs.readFileSync(new URL('../data/examples/world-graph.demo.json',import.meta.url),'utf8'));
const fixture=html.match(/<script id="fixture" type="application\/json">([\s\S]*?)<\/script>/);
assert(fixture,'Missing inline fixture');
assert.deepEqual(JSON.parse(fixture[1]),graph,'Board demo data must match canonical JSON fixture');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const code=scripts.at(-1)?.[1];
assert(code,'Missing application script');
new Function(code); // parse only; do not execute without DOM
const ids=[...code.matchAll(/\bel\('([^']+)'\)/g)].map(m=>m[1]);
for(const id of new Set(ids)){assert(html.includes('id="'+id+'"'),'Missing control: '+id);}
const unique=new Set(graph.nodes.map(n=>n.id));
assert.equal(unique.size,graph.nodes.length,'Duplicate node IDs');
console.log('PASS: board JS parses; controls exist; embedded fixture matches canonical JSON');
