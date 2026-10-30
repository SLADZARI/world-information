#!/usr/bin/env node
// Check internal routes in the local site or GitHub Pages build artifact.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const repo=fileURLToPath(new URL("../",import.meta.url));
const site=path.join(repo,process.argv[2]||".");
const html=fs.readFileSync(path.join(site,"index.html"),"utf8");
const ids=JSON.parse(fs.readFileSync(path.join(repo,"data/case-registry.json"),"utf8")).cases;
assert.equal(ids.length,7,"Unexpected launch case count");
const board=fs.readFileSync(path.join(site,"prototype/research-board.html"),"utf8");
const embedded=board.match(/<script type="application\/json" id="cases-data">([\s\S]*?)<\/script>/);
assert(embedded,"No board snapshots in staged site");
assert.deepEqual(JSON.parse(embedded[1]).map(x=>x.case_id),ids,"Board does not display every reviewed case");
const hrefs=[...html.matchAll(/href="(\.\/[^"]+)"/g)].map(x=>x[1].split(/[?#]/)[0]);
for(const href of hrefs){
  const url=decodeURIComponent(href.slice(2));
  const target=path.join(site,url);
  assert(path.resolve(target).startsWith(path.resolve(site)+path.sep),"Unsafe relative link");
  assert(fs.existsSync(target),"Broken demo link: "+href);
  if(href.endsWith("/"))assert(fs.existsSync(path.join(target,"index.html")),"Missing directory entry point: "+href);
}
for(const pathName of ["prototype/economy-lab/index.html","prototype/poland-economic-3d/index.html"]){
  const page=fs.readFileSync(path.join(site,pathName),"utf8");
  assert(page.includes("three@0.186.1"),"Three.js version not pinned: "+pathName);
}
if(process.argv[2])assert(fs.existsSync(path.join(site,".nojekyll")),"Missing .nojekyll in public artifact");
console.log("PASS: "+ids.length+" cases, "+hrefs.length+" homepage links, 2 pinned 3D entry points");
