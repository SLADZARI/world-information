/* Archived market data viewer: never treats an intraday social post as a closing price. */
const $=id=>document.getElementById(id);
const fmt=v=>typeof v==="number"?new Intl.NumberFormat("ru-RU",{minimumFractionDigits:1,maximumFractionDigits:2}).format(v)+"%":"—";
const el=(tag,parent,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;parent?.appendChild(n);return n;};
let data=null;
const instrumentById=()=>new Map(data.instruments.map(x=>[x.id,x]));
const sourceById=()=>new Map(data.sources.map(x=>[x.id,x]));
const quotesFor=id=>data.observations.filter(x=>x.instrument_id===id);
function detail(instrument, observations) {
  const target=$("detail");target.replaceChildren();
  el("h3",target,instrument.label+" · "+instrument.id);
  el("p",target,"Сектор: "+instrument.sector+" · площадка: "+instrument.market_id);
  el("p",target,"Сессия: "+data.session_date+" · "+data.market_timezone);
  for(const q of observations.sort((a,b)=>a.window.localeCompare(b.window))){
    const box=el("div",target,undefined,"info");
    el("strong",box,q.window==="regular_close_to_close"?"После закрытия рынка":"Ранее опубликованная оценка");
    el("p",box,"Изменение: "+fmt(q.value)+" относительно предыдущего закрытия.");
    el("p",box,"Время измерения: "+(q.measurement_at||"не указано"));
    el("p",box,"Время сообщения / регистрации: "+q.reported_at);
    el("p",box,"Качество: "+q.verification_status,"mono");
    el("p",box,q.note,"muted");
    const src=sourceById().get(q.source_id);
    if(src){const link=el("a",box,"Источник: "+src.publisher);link.href=src.url;link.target="_blank";link.rel="noopener noreferrer";}
  }
}
function render(){
  const table=$("rows");table.replaceChildren();
  const ids=instrumentById();
  const mode=$("view").value;
  let selected=data.instruments.filter(i=>mode==="all"||(mode==="equity"?i.asset_class==="equity":i.asset_class!=="equity"));
  const val=i=>quotesFor(i.id).find(q=>q.window==="regular_close_to_close")?.value??0;
  if($("sort").value==="loss")selected.sort((a,b)=>val(a)-val(b));
  else selected.sort((a,b)=>a.label.localeCompare(b.label));
  for(const inst of selected){
    const observations=quotesFor(inst.id);
    const claim=observations.find(q=>q.window==="regular_session_intraday");
    const close=observations.find(q=>q.window==="regular_close_to_close");
    const tr=el("tr",table);
    const cell=el("td",tr);const btn=el("button",cell,inst.label);
    btn.type="button";btn.addEventListener("click",()=>detail(inst,observations));
    el("small",cell,inst.id);
    el("td",tr,claim?fmt(claim.value):"—","num");
    const final=el("td",tr,close?fmt(close.value):"—","num negative");
    if(close){const bar=el("div",final,undefined,"chart");const fill=el("span",bar);fill.style.width=Math.min(100,Math.abs(close.value)*2.6)+"%";}
    const provenance=el("td",tr);
    if(close){
      const src=sourceById().get(close.source_id);
      const link=el("a",provenance,src?.publisher||close.source_id);
      link.href=src?.url||"#";link.target="_blank";link.rel="noopener noreferrer";
    }
  }
  if(!selected.length){const tr=el("tr",table);const cell=el("td",tr,"Нет наблюдений");cell.colSpan=4;}
}
async function init(){
  const response=await fetch("../../data/markets/US/2026-10-30-tech-selloff.json",{cache:"no-cache"});
  if(!response.ok)throw Error("HTTP "+response.status);
  data=await response.json();
  if(data.kind!=="market_observation_batch"||data.session_date!=="2026-10-30")throw Error("Неподходящий архив");
  $("view").addEventListener("change",render);$("sort").addEventListener("change",render);
  render();
  el("p",$("detail"),"Снимок: "+data.as_of+" · всего "+data.instruments.length+" инструментов, "+data.observations.length+" записей.","muted");
}
init().catch(e=>{
  const tbody=$("rows");tbody.replaceChildren();const tr=el("tr",tbody);const td=el("td",tr,"Данные не загрузились: "+e.message+". Запустите HTTP-сервер в корне репозитория.");td.colSpan=4;
});
