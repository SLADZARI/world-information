#!/usr/bin/env node
// Rebuild the dependency-free research board's embedded, offline case snapshots.
// Canonical JSON in data/cases/ is authoritative; this file contains no facts.
import fs from "node:fs";
const root=new URL("../",import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL("data/case-registry.json",root),"utf8"));
const ids=manifest.cases;
if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw Error("Invalid/duplicate case IDs");
const cases=ids.map(id=>{
  if(!/^[a-z0-9-]+$/.test(id))throw Error("Unsafe case ID: "+id);
  const x=JSON.parse(fs.readFileSync(new URL("data/cases/"+id+".json",root),"utf8"));
  if(x.case_id!==id)throw Error("Case id mismatch: "+id);
  return x;
});
const target=new URL("prototype/research-board.html",root);
const previous=fs.readFileSync(target,"utf8");
const marker=/(<script type="application\/json" id="cases-data">)[\s\S]*?(<\/script>)/;
if(!marker.test(previous))throw Error("Missing cases-data script");
const value=JSON.stringify(cases).replace(/</g,"\\u003c");
const expected=previous.replace(marker,(_,a,b)=>a+value+b);
if(process.argv.includes("--check")){
  if(previous!==expected){console.error("Research board out of sync; run node tools/sync_research_board.mjs");process.exitCode=1;}
  else console.log("PASS: research board contains "+ids.length+" exact canonical case snapshots");
}else{
  fs.writeFileSync(target,expected);
  console.log("Updated research board: "+ids.length+" cases");
}
