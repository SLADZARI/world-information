#!/usr/bin/env node
// Static, review-gated site bundle. No raw ingestion, country research staging, or repository internals.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const output=path.join(root,"dist");
const registry=JSON.parse(fs.readFileSync(path.join(root,"data/case-registry.json"),"utf8"));
if(!Array.isArray(registry.cases)||registry.cases.length!==7||new Set(registry.cases).size!==7)
  throw Error("Unexpected reviewed case registry");
const casePaths=registry.cases.map(id=>{
  if(!/^[a-z0-9-]+$/.test(id))throw Error("Unsafe case id");
  return "data/cases/"+id+".json";
});
const publicFiles=[
  "index.html",
  "prototype/board.html",
  "prototype/research-board.html",
  "prototype/digital-country-catalog.html",
  "data/markets/US/2026-10-30-tech-selloff.json",
  "docs/MARKET_OBSERVATORY.md",
  "stories/2026/ai-tech-selloff-2026-10-30.md",
  "stories/2026/binance-incident-2026-10.md",
  "stories/2026/eu-gas-transition-2021-2026.md",
  "stories/2026/maritime-corridors-2023-2024.md",
  "stories/2026/poland-economy-causal-links-2026-10.md",
  "stories/2026/poland-institutions-2026-10.md",
  "stories/2026/poland-migration-2026-10.md",
  ...casePaths,
];
const publicDirs=["prototype/poland-economic-3d","prototype/economy-lab","prototype/markets"];

fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
function copy(relative){
  const src=path.join(root,relative),dest=path.join(output,relative);
  if(!fs.existsSync(src))throw Error("Missing reviewed public asset: "+relative);
  if(fs.lstatSync(src).isSymbolicLink())throw Error("Symlinks prohibited: "+relative);
  if(fs.statSync(src).isDirectory()){
    fs.mkdirSync(dest,{recursive:true});
    for(const child of fs.readdirSync(src))copy(path.posix.join(relative,child));
  }else{
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.copyFileSync(src,dest);
  }
}
for(const entry of [...publicFiles,...publicDirs])copy(entry);
fs.writeFileSync(path.join(output,".nojekyll"),"");
console.log("PASS: generated static bundle. Canonical graph IDs="+registry.cases.length+"; research staging, code tooling and non-public material excluded.");
