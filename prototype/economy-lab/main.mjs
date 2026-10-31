import { ECONOMY_FIXTURE as data } from "./fixtures.mjs";
import { compareRuns, round } from "./core.mjs";

// Data, model, UI and Three.js renderer are deliberately separate.
// The DOM remains useful if WebGL or the third-party CDN is unavailable.
const $ = id => document.getElementById(id);
const fmt = (x, places = 1) => Number(x).toLocaleString("ru-RU", { maximumFractionDigits: places, minimumFractionDigits: 0 });
const svgNS = "http://www.w3.org/2000/svg";
let scenarioId = "north-shock";
let policyPct = 30;
let selectedQuarter = 1;
let selectedCountry = "DE";
let selectedTarget = null; // {kind:"country"|"metric"|"route"|"event", ...}
let pair = null;
let view3d = null;
let playback = null;
const countryIds = data.countries.map(c => c.id);
const nodeCoordinates = {
  NO: [-7.1, 0, -2.5],
  DE: [0, 0, 2.0],
  PL: [7.1, 0, -2.5]
};
const layerFlags = () => ({
  energy: $("show-energy").checked, output: $("show-output").checked,
  budget: $("show-budget").checked, flows: $("show-flows").checked,
  shocks: $("show-shocks").checked, reserves: $("show-reserves").checked
});

function make(tag, parent, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined && text !== null) el.textContent = text;
  if (className) el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}
function card(parent, label, value, delta) {
  const div=make("div",parent,null,"metric");
  make("small",div,label);
  make("strong",div,value);
  if(delta)make("span",div,delta,"delta");
}
function infoRow(parent,label,value) {
  const div=make("div",parent,null,"row");
  make("span",div,label);make("span",div,value,"value");
}
function refreshModels() {
  pair = compareRuns(data, {scenarioId, policyPct, horizon:8});
  const choice=data.scenarios.find(x=>x.id===scenarioId);
  $("caseTitle").textContent=choice.name;
  $("caseDescription").textContent=choice.description;
  $("policyLabel").textContent=policyPct+"% налоговых поступлений";
  $("quarter").value=String(selectedQuarter);
  $("quarterLabel").textContent="Q"+selectedQuarter+" / Q8";
  updateDataPanels();
  if (view3d) view3d.rebuild();
}
function getSnapshot(){return pair.shocked.snapshots[selectedQuarter-1];}
function getBase(){return pair.baseline.snapshots[selectedQuarter-1];}

function renderCountryButtons() {
  $("countryButtons").replaceChildren();
  for (const c of data.countries) {
    const btn=make("button",$("countryButtons"),c.id);
    btn.type="button";
    btn.setAttribute("aria-pressed",String(c.id===selectedCountry));
    btn.setAttribute("aria-label","Страна "+c.name);
    btn.addEventListener("click",()=>selectCountry(c.id));
  }
}
function selectCountry(id) {
  if (!countryIds.includes(id))return;
  selectedCountry=id;
  selectedTarget={kind:"country",country:id};
  $("focus").value=id;
  renderCountryButtons();
  updateDataPanels();
  view3d?.rebuild();
}
function selectRoute(id) {
  const route=data.routes.find(x=>x.id===id);
  if(!route)return;
  selectedTarget={kind:"route",id};
  selectedCountry=route.to;
  $("focus").value=selectedCountry;
  renderCountryButtons();updateDataPanels();view3d?.rebuild();
}
function selectMetric(country,metric) {
  selectedCountry=country;selectedTarget={kind:"metric",country,metric};
  $("focus").value=country;
  renderCountryButtons();updateDataPanels();view3d?.rebuild();
}
function selectEvent(country) {
  selectedCountry=country;selectedTarget={kind:"event",country};
  $("focus").value=country;renderCountryButtons();updateDataPanels();view3d?.rebuild();
}
function modelTrace(r, base, c) {
  const el=make("div",null,null,"trace");
  make("strong",el,"Цепочка расчёта (правила модели)");
  make("p",el,"Поставка "+fmt(r.production)+" + импорт "+fmt(r.imports)+" + резерв "+fmt(r.reserveDraw)+" − экспорт "+fmt(r.exports)+" → удовлетворено "+fmt(r.consumed)+" из "+fmt(r.demand)+".");
  make("p",el,"Недопоставка "+fmt(r.unserved)+" → индекс выпуска "+fmt(r.outputIndex)+" → налоги "+fmt(r.tax)+" → казна "+fmt(r.treasuryClosing)+".");
  make("p",el,"Инвестиции "+fmt(r.investment)+" → энергоэффективность следующего квартала "+fmt(r.efficiencyClosing*100,2)+"%. Эффект: "+data.modelAssumptions.efficiencyYield+" доли снижения спроса на условную денежную единицу; коэффициент НЕ оценён по реальным данным.");
  if (r.shockFraction) make("p",el,"Активный внешний фактор: сокращение предложения на "+fmt(r.shockFraction*100)+"%. Резерв и торговые маршруты временно сглаживают часть воздействия.");
  else make("p",el,"В этом периоде прямой шок предложения данной страны не активен.");
  make("p",el,"Сравнение с отсутствием нового шока при той же инвестиционной политике: Δ выпуска "+fmt(r.outputIndex-base.outputIndex,2)+" индексных пункта.");
  return el;
}
function updateDataPanels() {
  if(!pair) return;
  const snap=getSnapshot(),base=getBase(),r=snap.rows[selectedCountry],b=base.rows[selectedCountry];
  const c=data.countries.find(x=>x.id===selectedCountry);
  const panel=$("detail");panel.replaceChildren();
  const name=make("h3",panel,c.name+" · квартал "+selectedQuarter);
  name.style.marginTop="0";
  make("p",panel,"Показатели — условные значения модели, не статистика "+c.name+".","quiet");

  if(selectedTarget?.kind==="route"){
    const route=data.routes.find(x=>x.id===selectedTarget.id);
    const flow=snap.routes.find(x=>x.id===route.id);
    const box=make("div",panel,null,"trace");
    make("strong",box,"Торговый коридор "+route.from+" → "+route.to);
    make("p",box,"Перевезено "+fmt(flow.amount)+" из возможных "+fmt(route.capacity)+" единиц за квартал.");
    make("p",box,"Поставщик не может отгрузить больше остатка после собственного спроса; получатель не покупает сверх своего дефицита.");
    make("p",box,"Приоритет договора "+route.priority+" — искусственное допущение. Никаких фактических контрактов в модели нет.");
  }
  if(selectedTarget?.kind==="event"){
    const box=make("div",panel,null,"trace");
    make("strong",box,"Событие: внешний шок предложения");
    make("p",box,"Для "+selectedCountry+" активная потеря предложения: "+fmt(r.shockFraction*100)+"%; в данном периоде это изменение задано вручную, а не предсказано.");
  }
  const grid=make("div",panel,null,"metric-grid");
  card(grid,"Покрытие спроса",fmt(r.coverage*100)+"%","Недопоставка "+fmt(r.unserved));
  card(grid,"Индекс производства",fmt(r.outputIndex,1), "Δ к базе: "+fmt(r.outputIndex-b.outputIndex,1));
  card(grid,"Резерв на конец Q",fmt(r.reserveClosing), "начало "+fmt(r.reserveOpening));
  card(grid,"Казна на конец Q",fmt(r.treasuryClosing), "Δ "+fmt(r.treasuryClosing-b.treasuryClosing));
  infoRow(panel,"Доступное предложение",fmt(r.production)+" энерг. ед.");
  infoRow(panel,"Импорт / экспорт",fmt(r.imports)+" / "+fmt(r.exports));
  infoRow(panel,"Налоги / оплаченные услуги",fmt(r.tax)+" / "+fmt(r.publicPaid));
  infoRow(panel,"Инвестиции / неоплаченный план",fmt(r.investment)+" / "+fmt(r.publicUnpaid));
  infoRow(panel,"Эффективность (след. квартал)",fmt(r.efficiencyClosing*100,2)+"%");
  panel.appendChild(modelTrace(r,b,c));
  drawChart();drawLedger();
  const flows=snap.routes.filter(x=>x.amount>0).map(x=>x.from+" → "+x.to+": "+fmt(x.amount));
  $("graphDescription").textContent="Q"+selectedQuarter+" · потоков: "+(flows.join("; ")||"нет")+". Отображаются направленные торговые потоки и модельные причины; документированные события ЕС доступны только как исторический контекст.";
}
function drawChart() {
  const svg=$("chart");svg.replaceChildren();
  const rows=pair.shocked.snapshots.map(x=>x.rows[selectedCountry].outputIndex);
  const baseline=pair.baseline.snapshots.map(x=>x.rows[selectedCountry].outputIndex);
  const bottom=Math.max(0,Math.floor((Math.min(...rows,...baseline)-8)/10)*10);
  const upper=105;
  const px=i=>38+i*35.2, py=v=>118-(v-bottom)/(upper-bottom)*95;
  function node(name,attrs,parent=svg){
    const el=document.createElementNS(svgNS,name);
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
    parent.appendChild(el);return el;
  }
  for(let y=0;y<=4;y++){
    const val=bottom+(upper-bottom)*y/4;
    node("line",{x1:33,y1:py(val),x2:294,y2:py(val),stroke:"#294158","stroke-width":1});
    const label=node("text",{x:4,y:py(val)+3,fill:"#95b0c9","font-size":9});label.textContent=fmt(val,0);
  }
  [1,2,3,4,5,6,7,8].forEach((n,i)=>{
    const t=node("text",{x:px(i)-4,y:135,fill:"#9bb5c9","font-size":10});t.textContent=String(n);
  });
  const pathOf=vs=>vs.map((v,i)=>(i?"L":"M")+fmt(px(i),3)+","+fmt(py(v),3)).join(" ");
  node("path",{d:pathOf(baseline),stroke:"#63d9ea","stroke-width":2.2,fill:"none"});
  node("path",{d:pathOf(rows),stroke:"#ffba79","stroke-width":2.5,fill:"none"});
  node("line",{x1:px(selectedQuarter-1),y1:16,x2:px(selectedQuarter-1),y2:118,stroke:"#fff","stroke-dasharray":"3 5",opacity:.55});
  node("circle",{cx:px(selectedQuarter-1),cy:py(rows[selectedQuarter-1]),r:4,fill:"#ffba79"});
}
function drawLedger() {
  const target=$("ledger");target.replaceChildren();
  const r=getSnapshot().rows[selectedCountry];
  const table=make("table",target);
  const thead=make("thead",table),tr=make("tr",thead);
  for(const x of ["Баланс","Начало","+ / −","Конец"])make("th",tr,x);
  const body=make("tbody",table);
  const records=[
    ["Энергия",r.production+r.imports+r.reserveDraw,"−"+fmt(r.consumed+r.exports+r.reserveCharge+r.curtailed),0],
    ["Резерв",r.reserveOpening,"−"+fmt(r.reserveDraw)+" +"+fmt(r.reserveCharge),r.reserveClosing],
    ["Казна",r.treasuryOpening,"+"+fmt(r.tax)+" −"+fmt(r.publicPaid+r.investment),r.treasuryClosing]
  ];
  for(const [name,opening,flows,closing] of records){
    const row=make("tr",body);[name,fmt(opening),flows,fmt(closing)].forEach(x=>make("td",row,x));
  }
  make("p",target,"Энергетический баланс учитывает невостребованный избыток и весь физический экспорт; первая строка закрывается в ноль по определению.","quiet");
}
function stopPlay() {
  if(playback!==null){clearInterval(playback);playback=null;}
  $("play").textContent="▶ Прогнать";$("play").setAttribute("aria-pressed","false");
}
function changeQuarter(q) {
  selectedQuarter=Math.max(1,Math.min(8,q));
  refreshModels();
  if (selectedQuarter===8) stopPlay();
}
function initControls() {
  const scenario=$("scenario");
  for(const s of data.scenarios){
    const o=make("option",scenario,s.name);
    o.value=s.id;
  }
  scenario.value=scenarioId;
  const country=$("focus");
  for(const c of data.countries){
    const o=make("option",country,c.name+" ("+c.id+")");o.value=c.id;
  }
  country.value=selectedCountry;
  scenario.addEventListener("change",()=>{scenarioId=scenario.value;selectedTarget=null;stopPlay();refreshModels()});
  $("policy").addEventListener("input",()=>{policyPct=Number($("policy").value);stopPlay();refreshModels()});
  $("quarter").addEventListener("input",()=>{stopPlay();changeQuarter(Number($("quarter").value))});
  country.addEventListener("change",()=>selectCountry(country.value));
  $("prev").addEventListener("click",()=>{stopPlay();changeQuarter(selectedQuarter-1)});
  $("next").addEventListener("click",()=>{stopPlay();changeQuarter(selectedQuarter+1)});
  $("play").addEventListener("click",()=>{
    if(playback!==null){stopPlay();return;}
    if(selectedQuarter===8) selectedQuarter=1;
    $("play").textContent="❚❚ Пауза";$("play").setAttribute("aria-pressed","true");
    changeQuarter(selectedQuarter);
    playback=setInterval(()=>changeQuarter(selectedQuarter+1),1400);
  });
  $("reset").addEventListener("click",()=>{
    stopPlay();scenarioId="north-shock";policyPct=30;selectedQuarter=1;selectedTarget=null;selectedCountry="DE";
    scenario.value=scenarioId;$("policy").value=String(policyPct);country.value=selectedCountry;
    for(const id of ["energy","output","budget","flows","shocks","reserves"])$("show-"+id).checked=true;
    renderCountryButtons();refreshModels();
  });
  for(const id of ["energy","output","budget","flows","shocks","reserves"])
    $("show-"+id).addEventListener("change",()=>view3d?.rebuild());
  renderCountryButtons();
  refreshModels();
}

/* THREE.JS RENDERER */
async function initScene() {
  const viewport=$("viewport");
  const canvasCheck=document.createElement("canvas");
  if(!canvasCheck.getContext("webgl2") && !canvasCheck.getContext("webgl")){
    throw new Error("WebGL is unavailable");
  }
  const [THREE,{OrbitControls}]=await Promise.all([
    import("three"),
    import("three/addons/controls/OrbitControls.js")
  ]);
  const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.setClearColor(0x081321,1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-label","3D-сцена: страны NO, DE, PL и потоки условных энергоресурсов");
  viewport.insertBefore(renderer.domElement,viewport.firstChild);
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x081321,0.011);
  const camera=new THREE.PerspectiveCamera(47,1,0.1,150);
  camera.position.set(4.5,12.8,22.5);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,.8,0);
  controls.minDistance=9;controls.maxDistance=42;
  controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI*.88;
  controls.enableDamping=true;controls.dampingFactor=.08;
  controls.update();
  scene.add(new THREE.HemisphereLight(0x8ecbff,0x0b1523,2.6));
  const key=new THREE.DirectionalLight(0xb8d8ff,2.3);key.position.set(7,12,8);scene.add(key);
  const grid=new THREE.GridHelper(25,20,0x244b62,0x18334a);grid.position.y=-2.1;scene.add(grid);
  const root=new THREE.Group();scene.add(root);
  let pickables=[],particles=[];
  const raycaster=new THREE.Raycaster(),cursor=new THREE.Vector2();
  const materials=new Set();
  const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;

  const textSprite=(label,color="#f0f7ff",width=3.25)=>{
    const cv=document.createElement("canvas");cv.width=640;cv.height=128;
    const ctx=cv.getContext("2d");
    ctx.fillStyle="rgba(14,29,47,0.88)";
    ctx.beginPath();ctx.roundRect(6,12,628,100,18);ctx.fill();
    ctx.lineWidth=3;ctx.strokeStyle="rgba(92,143,173,.75)";ctx.stroke();
    ctx.font="bold 37px system-ui,Arial";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillStyle=color;ctx.fillText(label,320,65,600);
    const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
    const mat=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false});
    const sp=new THREE.Sprite(mat);sp.scale.set(width,width*.2,1);sp.renderOrder=15;return sp;
  };
  const mesh=(geometry,color,roughness=.43)=>{
    const mat=new THREE.MeshStandardMaterial({color,roughness,metalness:.15,emissive:color,emissiveIntensity:.14});
    return new THREE.Mesh(geometry,mat);
  };
  const vec=arr=>new THREE.Vector3(...arr);
  const selectable=(obj,target)=>{obj.userData.target=target;pickables.push(obj);return obj;};
  const addMetric=(country,base,dx,dy,dz,color,title,visible,metric,sphereR=.35)=>{
    if(!visible)return;
    const sphere=mesh(new THREE.SphereGeometry(sphereR,18,14),color);
    sphere.position.set(base.x+dx,base.y+dy,base.z+dz);
    selectable(sphere,{kind:"metric",country,metric});
    root.add(sphere);
    const label=textSprite(title,"#d8edff",2.6);
    label.position.copy(sphere.position).add(new THREE.Vector3(0,.73,0));
    root.add(label);
    const points=[new THREE.Vector3(base.x,base.y+.5,base.z),sphere.position];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({color,transparent:true,opacity:.35}));
    root.add(line);
  };
  function clearRoot(){
    root.traverse(obj=>{
      obj.geometry?.dispose();
      if (obj.material) for(const m of (Array.isArray(obj.material)?obj.material:[obj.material])) {
        m.map?.dispose();m.dispose();
      }
    });
    root.clear();pickables=[];particles=[];
  }
  function rebuild() {
    clearRoot();
    const snap=getSnapshot(),flags=layerFlags();
    const focus=selectedCountry;
    for(const c of data.countries){
      const p=vec(nodeCoordinates[c.id]),r=snap.rows[c.id];
      const highlighted=c.id===focus;
      const base=mesh(new THREE.CylinderGeometry(1.65,1.95,.38,32),highlighted?0x2b5263:0x203449);
      base.position.copy(p).add(new THREE.Vector3(0,-1.75,0));
      root.add(base);
      const rod=mesh(new THREE.CylinderGeometry(.04,.04,2.8,10),0x456678);
      rod.position.copy(p).add(new THREE.Vector3(0,-.18,0));root.add(rod);
      const countrySphere=mesh(new THREE.IcosahedronGeometry(.72,2),highlighted?0x8df3d6:0x51aeca);
      countrySphere.position.copy(p).add(new THREE.Vector3(0,1.18,0));
      selectable(countrySphere,{kind:"country",country:c.id});
      root.add(countrySphere);
      const title=textSprite(c.name,"#f0fbff",3.1);
      title.position.copy(p).add(new THREE.Vector3(0,2.1,0));
      root.add(title);
      const line=textSprite("Выпуск "+fmt(r.outputIndex)+" · спрос "+fmt(r.coverage*100)+"%","#a7d8e8",3.4);
      line.position.copy(p).add(new THREE.Vector3(0,-1.05,0));root.add(line);
      const severe=r.unserved/r.demand;
      addMetric(c.id,p,-1.25,.95,1.2,severe>.1?0xff796e:severe>.001?0xffc274:0x6de9ce,
        "Энергия "+fmt(r.coverage*100)+"%",flags.energy,"energy");
      addMetric(c.id,p,1.35,.4,1.2,0x79a9fc,"Выпуск "+fmt(r.outputIndex),flags.output,"output");
      addMetric(c.id,p,1.25,-.9,1.0,r.treasuryClosing<10?0xff867d:0xf4c778,
        "Казна "+fmt(r.treasuryClosing),flags.budget,"budget");
      addMetric(c.id,p,-1.35,-.8,1.1,0x9da9f2,
        "Резерв "+fmt(r.reserveClosing),flags.reserves,"reserve");
      if(flags.shocks&&r.shockFraction>0){
        const warning=mesh(new THREE.OctahedronGeometry(.48),0xf97069);
        warning.position.copy(p).add(new THREE.Vector3(0,3.25,0));
        selectable(warning,{kind:"event",country:c.id});root.add(warning);
        const lbl=textSprite("ШОК −"+fmt(r.shockFraction*100)+"%","#ffd3c7",2.7);
        lbl.position.copy(p).add(new THREE.Vector3(0,4.1,0));root.add(lbl);
      }
    }
    if(flags.flows){
      for(const flow of snap.routes){
        const a=vec(nodeCoordinates[flow.from]).add(new THREE.Vector3(0,1.05,0));
        const b=vec(nodeCoordinates[flow.to]).add(new THREE.Vector3(0,1.05,0));
        const middle=a.clone().add(b).multiplyScalar(.5).add(new THREE.Vector3(0,3.2,0));
        const curve=new THREE.QuadraticBezierCurve3(a,middle,b);
        const ratio=flow.capacity?flow.amount/flow.capacity:0;
        const tube=new THREE.Mesh(
          new THREE.TubeGeometry(curve,36,.035+Math.min(.085,ratio*.095),6,false),
          new THREE.MeshStandardMaterial({color:flow.amount>.001?0x50cce3:0x4c5a70,
            transparent:true,opacity:flow.amount>.001?.82:.32,emissive:0x23546a,emissiveIntensity:.3})
        );
        selectable(tube,{kind:"route",id:flow.id});root.add(tube);
        const arrow=mesh(new THREE.ConeGeometry(.15,.44,9),flow.amount>.001?0x8beada:0x64788b);
        const t=.7, tangent=curve.getTangent(t).normalize();
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);
        arrow.position.copy(curve.getPoint(t));root.add(arrow);
        const lbl=textSprite(flow.from+" → "+flow.to+": "+fmt(flow.amount),"#83d6eb",2.8);
        lbl.position.copy(curve.getPoint(.48)).add(new THREE.Vector3(0,.65,0));root.add(lbl);
        if(flow.amount>.001){
          for(let i=0;i<3;i++){
            const particle=mesh(new THREE.SphereGeometry(.085,8,8),0xa3fff3);
            root.add(particle);particles.push({mesh:particle,curve,offset:i/3,speed:.12+ratio*.24});
          }
        }
      }
    }
  }
  let initialPoint=null;
  renderer.domElement.addEventListener("pointerdown",ev=>{initialPoint={x:ev.clientX,y:ev.clientY}});
  renderer.domElement.addEventListener("pointerup",ev=>{
    if(!initialPoint||Math.hypot(ev.clientX-initialPoint.x,ev.clientY-initialPoint.y)>6)return;
    const rect=renderer.domElement.getBoundingClientRect();
    cursor.x=((ev.clientX-rect.left)/rect.width)*2-1;
    cursor.y=-((ev.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(cursor,camera);
    const picked=raycaster.intersectObjects(pickables,false)[0]?.object?.userData?.target;
    if(!picked)return;
    if(picked.kind==="route")selectRoute(picked.id);
    else if(picked.kind==="country")selectCountry(picked.country);
    else if(picked.kind==="metric")selectMetric(picked.country,picked.metric);
    else if(picked.kind==="event")selectEvent(picked.country);
  });
  function size() {
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if(!width||!height)return;
    camera.aspect=width/height;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
  }
  const ro=typeof ResizeObserver==="function"?new ResizeObserver(size):null;
  ro?.observe(viewport);window.addEventListener("resize",size);
  size();rebuild();
  const clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);
    const time=clock.getElapsedTime();
    if(!reduced)for(const item of particles)
      item.mesh.position.copy(item.curve.getPoint((time*item.speed+item.offset)%1));
    else for(const item of particles)
      item.mesh.position.copy(item.curve.getPoint(item.offset));
    controls.update();
    if (!document.hidden) renderer.render(scene,camera);
  }
  loop();
  return {rebuild};
}

initControls();
initScene().then(scene=>{view3d=scene;view3d.rebuild()}).catch(error=>{
  $("fallback").style.display="grid";
  $("fallback").textContent="3D не запустился ("+error.message+"). Таблица, график и сценарный расчёт доступны независимо от WebGL.";
  console.warn("3D renderer unavailable:",error);
});
