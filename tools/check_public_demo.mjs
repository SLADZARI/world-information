#!/usr/bin/env node
// Smoke-test the actual local root or exact GitHub Pages artifact, including nested links.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const staged=process.argv[2]==="dist";
assert(process.argv.length<3||staged,"Only 'dist' is a supported artifact path");
const site=staged?path.join(root,"dist"):root;
const read=relative=>fs.readFileSync(path.join(site,relative),"utf8");
const ids=JSON.parse(fs.readFileSync(path.join(root,"data/case-registry.json"),"utf8")).cases;
assert.equal(ids.length,7,"Unexpected reviewed case count");
const board=read("prototype/research-board.html");
const embedded=board.match(/<script type="application\/json" id="cases-data">([\s\S]*?)<\/script>/);
assert(embedded,"Missing embedded board data");
assert.deepEqual(JSON.parse(embedded[1]).map(c=>c.case_id),ids,"Case index differs from 2D graph");
const catalog=read("prototype/digital-country-catalog.html");
const catalogMatch=catalog.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/);
assert(catalogMatch,"Missing generated country catalog data");
const profile=JSON.parse(catalogMatch[1]);
assert.equal(profile.countries.length,249,"Catalog entries changed");
assert.deepEqual([profile.counts.partial,profile.counts.queued,profile.counts.unresearched],[4,3,242],"Country evidence states lost");
const market=JSON.parse(read("data/markets/US/2026-10-30-tech-selloff.json"));
assert.equal(market.kind,"market_observation_batch");
assert.equal(market.observations.length,18,"Market observations changed");

const htmlPaths=[
  "index.html",
  "prototype/board.html",
  "prototype/research-board.html",
  "prototype/digital-country-catalog.html",
  "prototype/economy-lab/index.html",
  "prototype/poland-economic-3d/index.html",
  "prototype/markets/index.html"
];
let internalLinks=0;
for(const relative of htmlPaths){
  const html=read(relative);
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const href=match[1];
    if(href.startsWith("#")||/^(https?:|mailto:|tel:|data:)/i.test(href))continue;
    const url=new URL(href,"https://site.example/"+relative);
    assert.equal(url.origin,"https://site.example","External link parsing error: "+href);
    const dest=path.resolve(site,decodeURIComponent(url.pathname.slice(1)));
    assert(dest.startsWith(path.resolve(site)+path.sep),"Unsafe internal link: "+href);
    assert(fs.existsSync(dest),"Broken "+relative+" -> "+href);
    if(url.pathname.endsWith("/"))assert(fs.existsSync(path.join(dest,"index.html")),"Missing index.html for "+href);
    internalLinks++;
  }
}
const home=read("index.html");
for(const pathName of ["./prototype/research-board.html","./prototype/digital-country-catalog.html","./prototype/markets/","./prototype/poland-economic-3d/","./prototype/economy-lab/"])
  assert(home.includes('href="'+pathName+'"'),"Workspace not listed on homepage: "+pathName);
for(const page of ["prototype/economy-lab/index.html","prototype/poland-economic-3d/index.html"])
  assert(read(page).includes("three@0.186.1"),"Three.js version not pinned: "+page);
if(staged){
  assert(fs.existsSync(path.join(site,".nojekyll")),"Missing .nojekyll");
  for(const excluded of ["data/research","data/catalog","tools",".github","AGENTS.md","schemas","data/incoming","docs/PROJECT_INSTRUCTIONS.ru.md"])
    assert(!fs.existsSync(path.join(site,excluded)),"Private/review staging or development file leaked: "+excluded);
  assert.equal(fs.readdirSync(path.join(site,"data/cases")).filter(x=>x.endsWith(".json")).length,ids.length,
    "Unreviewed case JSON included in public artifact");
}
console.log("PASS: 5 workspaces, 7 research graphs, 249 ISO entries (4/3/242), 18 market observations, "+internalLinks+" local links, two pinned Three.js canvases"+(staged?", static bundle has no staging":""));
