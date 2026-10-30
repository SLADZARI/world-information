#!/usr/bin/env node
// Publish only allow-listed, already-reviewed static files. NEVER upload staging/raw API snapshots.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const output=path.join(root,"dist");
const files=["index.html","prototype/board.html","prototype/research-board.html"];
const dirs=["prototype/poland-economic-3d","prototype/economy-lab","data/cases","stories/2026"];
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
function copy(relative){
  const src=path.join(root,relative),dest=path.join(output,relative);
  if(!fs.existsSync(src))throw Error("Missing public site source: "+relative);
  if(fs.lstatSync(src).isSymbolicLink())throw Error("Refusing symlink: "+relative);
  if(fs.statSync(src).isDirectory()){
    fs.mkdirSync(dest,{recursive:true});
    for(const child of fs.readdirSync(src))copy(path.posix.join(relative,child));
  }else{
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.copyFileSync(src,dest);
  }
}
for(const entry of [...files,...dirs])copy(entry);
fs.writeFileSync(path.join(output,".nojekyll"),"");
console.log("Site staged at dist/. No private staging, full repository or source code is copied.");
