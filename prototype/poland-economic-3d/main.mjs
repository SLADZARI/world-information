/**
 * Independent Three.js evidence graph for Poland. No economic simulation
 * and no numerical "causal certainty" derived from political headlines.
 * Uses the canonical checked JSON generated from underlying research cases.
 */
const $=id=>document.getElementById(id);
const GRAPH_URL="../../data/cases/poland-policy-economy-2026-10.json";
const LAYERS=[["geography","Страна"],["events","События и решения"],["factors","Факторы и акторы"],["impacts","Экономические показатели"],["scenarios","Сценарии"]];
const STATUSES=[["supported","Подтверждено источником"],["associated","Контекстное сопоставление"],["hypothesized","Гипотеза"],["disputed","Оспаривается"]];
const COLORS={politics:"#7be0bc",society:"#e2a4cb",economy:"#78c3f2",finance:"#f0bb75"};
const HEIGHT={geography:.55,events:2.2,factors:1.5,impacts:.7,scenarios:2.8,discussions:1,markets:1};
let graph,selected=null,renderScene=null;
const clone=x=>JSON.parse(JSON.stringify(x));
const nodeMap=()=>new Map(graph.nodes.map(n=>[n.id,n]));
const sourceMap=()=>new Map(graph.sources.map(s=>[s.id,s]));
const claimMap=()=>new Map(graph.claims.map(c=>[c.id,c]));
const make=(tag,parent,text,cls)=>{
  const el=document.createElement(tag);
  if(text!==undefined)el.textContent=text;
  if(cls)el.className=cls;
  if(parent)parent.appendChild(el);
  return el;
};
const isOn=(kind,value)=>[...document.querySelectorAll("input[data-"+kind+"]:checked")].some(x=>x.dataset[kind]===value);
function layerControls(){
  for(const [id,name] of LAYERS){
    const row=make("div",$("layers"),undefined,"check");
    const input=make("input",row);input.type="checkbox";input.checked=true;input.dataset.layer=id;input.id="layer-"+id;
    const label=make("label",row,name);label.htmlFor=input.id;
  }
  for(const [id,name] of STATUSES){
    const row=make("div",$("statusToggles"),undefined,"check");
    const input=make("input",row);input.type="checkbox";input.checked=true;input.dataset.status=id;input.id="status-"+id;
    const label=make("label",row,name);label.htmlFor=input.id;
  }
  for(const id of ["category","layers","statusToggles"])$(id).addEventListener("change",updateGraph);
  $("reset").addEventListener("click",()=>{
    $("category").value="all";
    document.querySelectorAll("input[data-layer],input[data-status]").forEach(e=>e.checked=true);
    selected=null;updateGraph();
  });
}
function visible(){
  const category=$("category").value;
  const ns=graph.nodes.filter(n=>isOn("layer",n.layer)&&(category==="all"||n.category===category||n.type==="country"));
  const ids=new Set(ns.map(n=>n.id));
  const es=graph.relations.filter(e=>ids.has(e.from)&&ids.has(e.to)&&isOn("status",e.status));
  return {ns,es};
}
function showSelected(kind,id){
  selected={kind,id};renderDetails();renderScene?.update();
}
function sourceList(parent,ids){
  const src=sourceMap();
  const unique=[...new Set(ids)];
  if(!unique.length){make("p",parent,"Нет прикреплённых источников — это только сценарная гипотеза.","sub");return;}
  for(const id of unique){
    const s=src.get(id);if(!s)continue;
    const box=make("div",parent,undefined,"record sources");
    make("strong",box,s.publisher);
    make("div",box,"Публикация: "+(s.published_at?s.published_at.slice(0,10):"точная дата неизвестна")+" · срез: "+s.retrieved_at.slice(0,10),"sub");
    const a=make("a",box,"Открыть первичный источник");a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";
  }
}
function renderDetails(){
  const panel=$("details");panel.replaceChildren();
  if(!selected){
    make("p",panel,"Выберите показатель, политическое событие или связь. Каждое ребро показывает тип утверждения и источники; гипотезы не превращаются в измерения.");
    return;
  }
  const nodeById=nodeMap();
  if(selected.kind==="node"){
    const n=nodeById.get(selected.id);if(!n)return;
    make("h3",panel,n.label);make("p",panel,n.description);
    make("div",panel,"Тип: "+n.type+" · слой: "+n.layer+" · область: "+n.category,"meta");
    make("p",panel,"Подкатегория: "+n.subcategories.join(" / "));
    make("p",panel,"Время наблюдения или события: "+n.at.slice(0,10));
    if(n.indicator){
      const i=n.indicator;
      const d=make("div",panel,undefined,"record");
      make("div",d,i.metric,"sub");
      if(i.value!==undefined)make("div",d,Number(i.value).toLocaleString("ru-RU")+" "+i.unit,"number");
      make("p",d,"Период: "+i.period+" · охват: "+i.population_scope);
      if(i.comparison_value!==undefined)make("p",d,"База сравнения: "+Number(i.comparison_value).toLocaleString("ru-RU")+" ("+i.comparison_period+")");
      if(i.method)make("p",d,"Метод: "+i.method);
      make("h3",panel,"Первичный источник");
      sourceList(panel,[i.source_id]);
    }
    const edges=graph.relations.filter(e=>e.from===n.id||e.to===n.id);
    make("h3",panel,"Связи ("+edges.length+")");
    for(const e of edges){
      const button=make("button",panel,nodeById.get(e.from).label+" → "+nodeById.get(e.to).label,"item");
      make("small",button,e.relation+" · "+e.status);
      button.addEventListener("click",()=>showSelected("edge",e.id));
    }
    return;
  }
  const e=graph.relations.find(x=>x.id===selected.id);if(!e)return;
  make("h3",panel,nodeById.get(e.from).label+" → "+nodeById.get(e.to).label);
  make("div",panel,e.relation+" · "+e.status,"meta");
  make("p",panel,e.mechanism);
  const claims=claimMap();const ids=[...e.evidence_source_ids];
  for(const cid of e.claim_ids){
    const c=claims.get(cid);if(!c)continue;
    const box=make("div",panel,undefined,"record");
    make("strong",box,"Проверяемая гипотеза");
    make("p",box,c.statement);make("p",box,"Механизм: "+c.mechanism);
    make("p",box,"Альтернативные объяснения: "+c.alternatives.join("; "));
    make("p",box,"Как опровергнуть: "+c.falsification);
    ids.push(...c.evidence_source_ids);
  }
  make("h3",panel,"Источники");sourceList(panel,ids);
}
function renderEdges(es){
  const el=$("edgeList");el.replaceChildren();const byId=nodeMap();
  for(const e of es){
    const btn=make("button",el,byId.get(e.from).label+" → "+byId.get(e.to).label,"item");
    make("small",btn,e.relation+" · "+e.status);
    btn.addEventListener("click",()=>showSelected("edge",e.id));
  }
}
function updateGraph(){
  const {ns,es}=visible();
  $("counts").textContent=ns.length+" узлов · "+es.length+" связей";
  if(selected){
    const stillVisible=selected.kind==="node"?ns.some(n=>n.id===selected.id):es.some(e=>e.id===selected.id);
    if(!stillVisible)selected=null;
  }
  renderEdges(es);renderDetails();renderScene?.update(ns,es);
}
async function start3D(){
  const mount=$("canvasContainer");
  const webgl=document.createElement("canvas");
  if(!webgl.getContext("webgl2")&&!webgl.getContext("webgl"))throw Error("WebGL отсутствует");
  const THREE=await import("three");
  const {OrbitControls}=await import("three/addons/controls/OrbitControls.js");
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
  renderer.setClearColor(0x0c1627);
  mount.insertBefore(renderer.domElement,mount.firstChild);
  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x0c1627,20,75);
  const camera=new THREE.PerspectiveCamera(48,1,.1,150);
  camera.position.set(5,15,25);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.7,0);
  controls.enableDamping=true;controls.maxDistance=60;controls.minDistance=8;
  scene.add(new THREE.HemisphereLight(0xaacfff,0x223347,2.1));
  const light=new THREE.DirectionalLight(0xc1e1ff,2.2);light.position.set(-3,10,10);scene.add(light);
  const grid=new THREE.GridHelper(22,14,0x29425a,0x1d3047);grid.position.y=-.65;scene.add(grid);
  const group=new THREE.Group();scene.add(group);
  let clickable=[];
  const C={supported:0x70dbb2,associated:0x8eabc4,hypothesized:0xeab575,disputed:0xf18b83,rejected:0xa4a4a4};
  const pos=n=>new THREE.Vector3((n.layout.x-630)/105,HEIGHT[n.layer]??1,(n.layout.y-290)/82);
  const createText=(str)=>{
    const canvas=document.createElement("canvas");canvas.width=512;canvas.height=112;
    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#11273bec";ctx.beginPath();ctx.roundRect(4,7,504,96,14);ctx.fill();
    ctx.strokeStyle="#4e7894";ctx.lineWidth=2;ctx.stroke();
    ctx.font="bold 24px system-ui,sans-serif";ctx.fillStyle="#eef9ff";ctx.textBaseline="middle";ctx.textAlign="center";
    ctx.fillText(str.length>35?str.slice(0,33)+"…":str,256,55,475);
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false});
    const sprite=new THREE.Sprite(material);sprite.scale.set(3.7,.83,1);sprite.renderOrder=10;
    return sprite;
  };
  function clear(){
    group.traverse(o=>{
      o.geometry?.dispose();
      const materials=o.material?Array.isArray(o.material)?o.material:[o.material]:[];
      for(const m of materials){m.map?.dispose();m.dispose();}
    });
    group.clear();clickable=[];
  }
  function update(ns,es){
    if(!ns||!es){({ns,es}=visible());}
    clear();
    const byId=new Map(ns.map(n=>[n.id,n]));
    for(const e of es){
      const a=pos(byId.get(e.from)),b=pos(byId.get(e.to));
      const pivot=a.clone().lerp(b,.5);pivot.y+=.35;
      const curve=new THREE.QuadraticBezierCurve3(a,pivot,b);
      const geom=new THREE.BufferGeometry().setFromPoints(curve.getPoints(22));
      const material=new THREE.LineDashedMaterial({
        color:C[e.status]??0x8eabc4,transparent:true,opacity:e.status==="associated"?.47:.9,
        dashSize:e.status==="supported"?100:e.status==="associated"?.13:.22,
        gapSize:e.status==="supported"?0:.18
      });
      const line=new THREE.Line(geom,material);line.computeLineDistances();group.add(line);
      const dir=curve.getTangent(.85).normalize();
      const cone=new THREE.Mesh(new THREE.ConeGeometry(.06,.23,8),
        new THREE.MeshBasicMaterial({color:C[e.status]??0x8eabc4}));
      cone.position.copy(curve.getPoint(.85));cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
      group.add(cone);
      const hit=new THREE.Mesh(new THREE.TubeGeometry(curve,18,.11,5,false),
        new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));
      hit.userData={kind:"edge",id:e.id};clickable.push(hit);group.add(hit);
    }
    for(const n of ns){
      const color=COLORS[n.category]||"#abbfd9";
      let geom;
      if(n.type==="event")geom=new THREE.BoxGeometry(.43,.43,.43);
      else if(n.type==="indicator")geom=new THREE.SphereGeometry(.26,15,12);
      else if(n.type==="actor")geom=new THREE.ConeGeometry(.27,.55,8);
      else if(n.type==="impact")geom=new THREE.OctahedronGeometry(.33);
      else geom=new THREE.IcosahedronGeometry(.25,0);
      const chosen=selected?.id===n.id;
      const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:chosen?.8:.18,roughness:.52});
      const mesh=new THREE.Mesh(geom,mat);mesh.position.copy(pos(n));
      mesh.userData={kind:"node",id:n.id};clickable.push(mesh);group.add(mesh);
      const lab=createText(n.label);lab.position.copy(mesh.position).add(new THREE.Vector3(0,.62,0));group.add(lab);
    }
  }
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let down=null;
  renderer.domElement.addEventListener("pointerdown",e=>down={x:e.clientX,y:e.clientY});
  renderer.domElement.addEventListener("pointerup",e=>{
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
    raycaster.setFromCamera(pointer,camera);
    const t=raycaster.intersectObjects(clickable,false)[0]?.object.userData;
    if(t?.id)showSelected(t.kind,t.id);
  });
  function resize(){
    const w=mount.clientWidth,h=mount.clientHeight;
    if(w<1||h<1)return;
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  }
  if(typeof ResizeObserver!=="undefined")new ResizeObserver(resize).observe(mount);
  window.addEventListener("resize",resize);resize();
  function animate(){requestAnimationFrame(animate);controls.update();if(!document.hidden)renderer.render(scene,camera);}
  animate();return {update};
}
async function init(){
  layerControls();
  const response=await fetch(GRAPH_URL,{cache:"no-cache"});
  if(!response.ok)throw Error("Невозможно загрузить проверенный JSON графа: HTTP "+response.status);
  graph=await response.json();
  if(graph.synthetic!==false||graph.case_id!=="poland-policy-economy-2026-10")throw Error("Неподходящая версия графа");
  updateGraph();
  try{renderScene=await start3D();updateGraph();}
  catch(e){console.warn("Three.js 3D unavailable",e);$("canvasMessage").style.display="grid";$("canvasMessage").textContent="3D не загрузился: "+e.message+". Используйте список связей и источников.";}
}
init().catch(e=>{
  $("canvasMessage").style.display="grid";
  $("canvasMessage").textContent="Нельзя загрузить исследовательский граф: "+e.message+". Запустите python3 -m http.server 8000 в корне репозитория.";
  $("counts").textContent="Данные недоступны";
});
