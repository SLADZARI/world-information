#!/usr/bin/env node
// Dependency-free, real-browser smoke test. This is NOT desktop/mobile GPU visual acceptance.
// Requires Chrome/Chromium on the CI runner and serves only this checkout on loopback.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const chrome=(process.env.CHROME_BIN&&fs.existsSync(process.env.CHROME_BIN)?process.env.CHROME_BIN:null) ||
  ["google-chrome","google-chrome-stable","chromium","chromium-browser"].find(n=>
    spawnSync("which",[n],{encoding:"utf8"}).status===0);
if(!chrome)throw Error("Chrome/Chromium missing: cannot claim browser smoke PASS");
const port=18927;
const origin="http://127.0.0.1:"+port+"/";
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{cwd:root,stdio:"ignore"});
const assert=(ok,message)=>{if(!ok)throw Error(message);};
async function waitForHttp(){
  for(let i=0;i<40;i++){
    if(server.exitCode!==null)throw Error("Local HTTP process exited unexpectedly");
    try { const r=await fetch(origin,{signal:AbortSignal.timeout(600)});if(r.ok)return; }
    catch{}
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw Error("No local HTTP server: "+origin);
}
function render(relative){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),"wi-browser-"));
  try {
    const html=execFileSync(chrome,[
      "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
      "--no-first-run","--no-default-browser-check","--hide-scrollbars",
      "--user-data-dir="+profile,"--virtual-time-budget=4000",
      "--dump-dom",origin+relative
    ],{encoding:"utf8",timeout:25000,maxBuffer:5*1024*1024,stdio:["ignore","pipe","ignore"]});
    assert(html.includes("<!DOCTYPE html>")||html.includes("<html"),"Chromium did not return DOM for "+relative);
    return html;
  }finally {fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:150});}
}
function section(html,needle,ending,length=6000){
  const start=html.indexOf(needle);
  assert(start!==-1,"Missing DOM element "+needle);
  const end=html.indexOf(ending,start+needle.length);
  assert(end!==-1,"Missing DOM closing tag for "+needle);
  return html.slice(start,Math.min(end+ending.length,start+length));
}

try{
  await waitForHttp();
  const board=render("prototype/research-board.html");
  const select=section(board,'<select id="case"','</select>',15000);
  assert((select.match(/<option\b/g)||[]).length===7,"2D case selector did not render 7 investigated cases");
  assert(section(board,'id="relations"','</div>',18000).includes("button"),"2D graph lacks live accessible relation controls");
  console.log("PASS browser: 2D graph, seven case options, real relation buttons");

  const country=render("prototype/digital-country-catalog.html");
  const list=section(country,'id="list"','</section>',180000);
  assert((list.match(/<button\b/g)||[]).length===249,"Country catalog did not render 249 selectable countries");
  assert(country.includes("Срез 2026-10-31"),"Catalog as-of date not rendered");
  console.log("PASS browser: 249 country cards and as-of label");

  const markets=render("prototype/markets/");
  const tbody=section(markets,'id="rows"','</tbody>',32000);
  assert((tbody.match(/<tr\b/g)||[]).length>=7,"Market observer table missing its equity rows");
  assert(!tbody.includes("Загрузка данных"),"Market data fetch did not complete");
  console.log("PASS browser: sourced market rows fetched over same-origin HTTP");

  const economy=render("prototype/economy-lab/");
  const countries=section(economy,'id="countryButtons"','</div>',3000);
  assert((countries.match(/<button\b/g)||[]).length===3,"Economy Lab JS did not initialize country controls");
  console.log("PASS browser: scenario engine initialized independently of 3D");

  const poland=render("prototype/poland-economic-3d/");
  const edgeList=section(poland,'id="edgeList"','</div>',30000);
  assert(edgeList.includes("<button"),"Poland 3D graph did not load canonical JSON text fallback");
  console.log("PASS browser: Poland causal relations available with keyboard controls");
}finally{
  server.kill("SIGTERM");
}
