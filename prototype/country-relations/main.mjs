import {summarizeCountryPair,CATEGORIES,LABELS} from "./core.mjs";
const $=id=>document.getElementById(id), NS="http://www.w3.org/2000/svg";
const colors={politics:"#b1a3e0",economy:"#e0bb79",energy:"#75c9bd",society:"#df9fbe",finance:"#91b2eb",security:"#e49d8c",logistics:"#9bb9e8",environment:"#94cfaa",science:"#aac4e8"};
const mk=(tag,parent,text,cls)=>{
  const node=document.createElement(tag);if(text!==undefined&&text!==null)node.textContent=String(text);
  if(cls)node.className=cls;parent?.appendChild(node);return node;
};
const sv=(tag,attrs,parent,text)=>{
  const node=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attrs||{}))node.setAttribute(key,String(value));
  if(text!==undefined)node.textContent=String(text);parent?.appendChild(node);return node;
};
let options=new Map(),research=null,result=null,mode="common",selected=null;
const name=code=>options.get(code)?.name||code;
const status=s=>$("app-status").textContent=s;
const visible=()=>mode==="common"?result.topics:mode==="cross"?result.crossRegionEdges:result.explicitDisputes;
function link(parent,url,label){
  if(!/^https:\/\//.test(url))return;
  const a=mk("a",parent,label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";
}
function caseLink(parent,id){
  if(!/^[a-z0-9-]+$/.test(id))return;
  const a=mk("a",parent,"Открыть исходный 2D-граф и проверить объяснения");
  a.href="../research-board.html?case="+encodeURIComponent(id);
}
function details(){
  const root=$("detail");root.replaceChildren();
  const chosen=visible().find(x=>x.id===selected);
  if(!chosen){
    mk("h3",root,mode==="common"?"Общий контекст":mode==="cross"?"Направленная связь объектов":"Строгая проверка спора");
    mk("p",root,mode==="common"?
      "Обе страны встречаются в одной проверяемой теме. Это ещё не свидетельство прямого сотрудничества, торговых потоков или взаимного влияния.":
      mode==="cross"?
      "Сравнение объектов из двух разных географий не обязательно представляет договор, торговый поток или причинную связь.":
      "Статус disputed внутреннего графа не означает спор между государствами. Нужны явные стороны, предмет, дата и документы.");
    mk("p",root,"Выберите объект на схеме или в текстовом списке для просмотра источников.","muted");
    return;
  }
  mk("div",root,chosen.case_title,"tag");
  mk("h3",root,chosen.label||(chosen.from+" → "+chosen.to));
  if(mode==="common"){
    mk("p",root,chosen.description);
    mk("p",root,"Сфера: "+(CATEGORIES[chosen.category]||chosen.category)+
      " · дата: "+chosen.at.slice(0,10)+" · страны: "+chosen.countries.join(", "),"muted");
    mk("div",root,chosen.shared_scope_note,"proof");
    if(chosen.related_statuses.length)mk("p",root,
      "Рёбра внутри исследования: "+chosen.related_statuses.map(s=>LABELS[s]||s).join("; "),"muted");
  }else{
    mk("p",root,"Характер связи: "+chosen.mechanism);
    mk("p",root,"Тип: "+chosen.relation+" · статус: "+(LABELS[chosen.status]||chosen.status),"muted");
    mk("div",root,chosen.epistemic_notice,"proof");
  }
  mk("h3",root,"Источники, привязанные к объекту исследования");
  if(!chosen.sources.length)mk("p",root,"Отдельных источников для этого объекта не привязано.","muted");
  else for(const s of chosen.sources){
    link(root,s.url,s.publisher||s.id);
    mk("small",root,s.published_at?"Публикация: "+s.published_at.slice(0,10):"Дата публикации не установлена","muted");
  }
  mk("h3",root,"Полное исследование");
  caseLink(root,chosen.case_id);
}
function textList(){
  const root=$("focus-list");root.replaceChildren();
  if(!visible().length){
    mk("p",root,mode==="common"?
      "Общих исследованных тем в этой сфере и периоде не найдено.":
      mode==="cross"?
      "Прямых межстрановых рёбер в этих семи исследованиях пока нет. Это пробел данных, а не отсутствие отношений.":
      "Явно подтверждённых двусторонних споров в загруженных исследованиях не зарегистрировано. Это не означает отсутствия споров в мире.","muted");return;
  }
  for(const t of visible()){
    const btn=mk("button",root,t.label||(t.from+" → "+t.to));
    btn.type="button";btn.setAttribute("aria-pressed",String(selected===t.id));
    const label=mode==="common"?(CATEGORIES[t.category]||t.category)+" · "+t.case_title:
      (LABELS[t.status]||t.status)+" · "+t.case_title;
    mk("small",btn,label);
    btn.addEventListener("click",()=>choose(t.id));
  }
}
function focal(root,x,code){
  sv("rect",{x,y:228,width:170,height:78,rx:13,fill:"#1d414b",stroke:"#77cfc2","stroke-width":2},root);
  sv("text",{x:x+85,y:257,"text-anchor":"middle",fill:"#baf4e9","font-size":20,"font-weight":700},root,code);
  const label=name(code);sv("text",{x:x+85,y:281,"text-anchor":"middle",fill:"#edf6fb","font-size":13},
    root,label.length>19?label.slice(0,18)+"…":label);
}
function graph(){
  const root=$("relation-graph");root.replaceChildren();
  focal(root,17,result.countryA);focal(root,774,result.countryB);
  const items=visible().slice(0,8);
  if(!items.length){
    sv("text",{x:480,y:260,"text-anchor":"middle",fill:"#b6d5e2","font-size":18},root,
      mode==="common"?"Общие темы пока не исследованы":mode==="cross"?"Нет прямых межстрановых рёбер":"Нет проверенных споров в корпусе");
    sv("text",{x:480,y:289,"text-anchor":"middle",fill:"#90afc1","font-size":13},root,
      "Недостаток данных не означает отсутствия отношений");
    return;
  }
  const start=items.length===1?242:Math.max(24,264-items.length*29);
  for(let i=0;i<items.length;i++){
    const t=items[i],x=351,y=start+i*58,cy=y+23;
    const dash=mode==="common"?"6 6":"none";
    sv("path",{d:"M187 267 Q270 "+cy+" "+x+" "+cy,fill:"none",stroke:"#70b8ad","stroke-width":1.6,"stroke-dasharray":dash,opacity:.9},root);
    sv("path",{d:"M609 "+cy+" Q690 "+cy+" 774 267",fill:"none",stroke:"#70b8ad","stroke-width":1.6,"stroke-dasharray":dash,opacity:.9},root);
    const g=sv("g",{role:"button",tabindex:0,"aria-label":"Открыть "+(t.label||t.from+" → "+t.to)},root);
    const chosen=t.id===selected,c=colors[t.category]||"#8db8cd";
    sv("rect",{x,y,width:258,height:46,rx:9,fill:chosen?"#275251":"#1c3044",
      stroke:chosen?"#a2efd3":"#526b82","stroke-width":chosen?2:1.1},g);
    sv("rect",{x,y,width:5,height:46,rx:2,fill:c},g);
    const text=t.label||(t.from+" → "+t.to);
    sv("text",{x:x+13,y:y+20,fill:"#edf5fb","font-size":13},g,text.length>32?text.slice(0,31)+"…":text);
    sv("text",{x:x+13,y:y+36,fill:"#98c1d1","font-size":10},g,
      mode==="common"?(CATEGORIES[t.category]||t.category):LABELS[t.status]||t.status);
    g.addEventListener("click",()=>choose(t.id));
    g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose(t.id);}});
  }
  if(visible().length>8)
    sv("text",{x:480,y:522,"text-anchor":"middle",fill:"#9abacd","font-size":12},root,
      "Остальные объекты доступны в полном списке ниже");
}
function choose(id){selected=id;graph();textList();details();}
function update(){
  if(!research)return;
  const a=$("country-a").value,b=$("country-b").value,category=$("domain").value,until=$("until").value;
  if(a===b){status("Выберите две разные страны. Сравнение страны с самой собой недоступно.");return;}
  try{result=summarizeCountryPair(research,a,b,{category,until});}
  catch(e){status(e.message);return;}
  if(!visible().some(t=>t.id===selected))selected=visible()[0]?.id||null;
  for(const [id,v] of Object.entries({"metric-cases":result.counts.cases,"metric-topics":result.counts.topics,
    "metric-cross":result.counts.crossRegionEdges,"metric-disputes":result.counts.verifiedBilateralDisputes}))
    $(id).textContent=v;
  for(const btn of document.querySelectorAll("[data-mode]"))
    btn.setAttribute("aria-pressed",String(btn.dataset.mode===mode));
  $("country-context").textContent="Статус цифрового каталога: "+a+" — "+options.get(a)?.research_status+
    "; "+b+" — "+options.get(b)?.research_status+". Это не рейтинг внешних отношений.";
  $("graph-caption").textContent=mode==="common"?
    "Пунктир обозначает общую тему исследования. Нет утверждения о причинном или договорном отношении между странами.":
    mode==="cross"?"Сплошная линия обозначает сравнение двух географически определённых объектов. Характер ребра определяется источником, не оформлением.":
    "Показываются только прямые споры, явно заявленные и атрибутированные между конкретными странами.";
  graph();textList();details();
  const url=new URL(location.href);
  for(const [k,v] of Object.entries({a,b,domain:category,until,view:mode}))url.searchParams.set(k,v);
  history.replaceState(null,"",url);
  status("Срез до "+until+": "+result.counts.cases+" общих исследований, "+
    result.counts.topics+" тем, "+result.counts.crossRegionEdges+" межстрановых рёбер. "+
    "Это не полный реестр отношений.");
}
async function getJson(url){
  const response=await fetch(url,{cache:"no-cache"});
  if(!response.ok)throw Error(url+": HTTP "+response.status);
  return response.json();
}
async function init(){
  const catalog=await getJson("./country-options.json");
  if(catalog.country_count!==249||catalog.countries.length!==249)throw Error("Неполный справочник стран");
  for(const country of catalog.countries)options.set(country.code,country);
  const params=new URLSearchParams(location.search);
  for(const [id,param,fallback] of [["country-a","a","PL"],["country-b","b","DE"]]){
    const el=$(id);el.replaceChildren();
    for(const country of catalog.countries){
      const opt=mk("option",el,country.name+" ("+country.code+")");opt.value=country.code;
    }
    const value=params.get(param)||fallback;el.value=options.has(value)?value:fallback;
  }
  for(const [key,label] of Object.entries(CATEGORIES)){
    const opt=mk("option",$("domain"),label);opt.value=key;
  }
  const domain=params.get("domain")||"all";$("domain").value=domain in CATEGORIES?domain:"all";
  const until=params.get("until")||"2026-10-31";
  if(/^\d{4}-\d{2}-\d{2}$/.test(until))$("until").value=until;
  const view=params.get("view");if(["common","cross","disputes"].includes(view))mode=view;
  for(const id of ["country-a","country-b","domain","until"])
    $(id).addEventListener("change",()=>{selected=null;update();});
  $("swap").addEventListener("click",()=>{
    const a=$("country-a").value;$("country-a").value=$("country-b").value;$("country-b").value=a;
    selected=null;update();
  });
  for(const btn of document.querySelectorAll("[data-mode]"))
    btn.addEventListener("click",()=>{mode=btn.dataset.mode;selected=null;update();});
  $("copy").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(location.href);status("Ссылка скопирована.");}
    catch{status("Не удалось скопировать автоматически. Скопируйте URL из адресной строки.");}
  });
  const registry=await getJson("../../data/case-registry.json");
  if(registry.cases?.length!==7)throw Error("Неподтверждённый состав графов");
  research=await Promise.all(registry.cases.map(async id=>{
    if(!/^[a-z0-9-]+$/.test(id))throw Error("Недопустимый ID кейса");
    const data=await getJson("../../data/cases/"+id+".json");
    if(data.case_id!==id||data.synthetic!==false)throw Error("Неподходящая версия графа "+id);
    return data;
  }));
  update();
}
init().catch(e=>status("Сравнение не загрузилось: "+e.message+
  ". Запустите HTTP-сервер из корня репозитория или откройте 2D-борд."));
