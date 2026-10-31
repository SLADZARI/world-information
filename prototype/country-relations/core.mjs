// Pure read-only projection of country-tagged research graphs.
// Co-occurrence is NOT a bilateral relationship, contradiction, or causal effect.
const ISO=/^[A-Z]{2}$/;
export const CATEGORIES=Object.freeze({
  all:"Все сферы",politics:"Политика и институты",economy:"Экономика",
  finance:"Финансы",energy:"Энергетика",society:"Общество",
  logistics:"Логистика",security:"Безопасность",environment:"Экология",
  science:"Наука и технологии"
});
export const LABELS=Object.freeze({
  supported:"Поддержано источником (не обязательно причинно)",
  associated:"Контекстная связь",hypothesized:"Гипотеза",
  disputed:"Оспариваемый механизм",rejected:"Опровергнуто"
});
const OPPOSITION_TYPES=new Set(["opposes","disputes_with","bilateral_dispute"]);
const nodesOf=(c,until,category)=>c.nodes.filter(n=>
  Array.isArray(n.countries)&&typeof n.at==="string"&&n.at.slice(0,10)<=until
  &&(category==="all"||n.category===category));
const tagged=(n,code)=>n.countries.includes(code);
const scoped=(n,code)=>n.countries.length===1&&n.countries[0]===code;
const refSources=(c,e)=>[...new Set(e.evidence_source_ids||[])].map(id=>
  c.sources.find(s=>s.id===id)).filter(Boolean).map(s=>({
  id:s.id,url:s.url,publisher:s.publisher,published_at:s.published_at||null
}));
export function summarizeCountryPair(cases,countryA,countryB,{category="all",until="2026-10-31"}={}){
  if(!ISO.test(countryA)||!ISO.test(countryB)||countryA===countryB)
    throw Error("Выберите две разные страны с корректными ISO-кодами");
  if(!(category in CATEGORIES))throw Error("Неизвестная категория исследования");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(until)||Number.isNaN(Date.parse(until+"T00:00:00Z")))
    throw Error("Некорректная дата среза");
  if(!Array.isArray(cases))throw Error("Исследовательские графы не загружены");
  const sharedCases=[],topics=[],crossRegionEdges=[],explicitDisputes=[];
  for(const c of cases){
    if(!Array.isArray(c.nodes)||!Array.isArray(c.relations)||!Array.isArray(c.sources)||typeof c.case_id!=="string")
      throw Error("Некорректная схема исследовательского кейса");
    const nodes=nodesOf(c,until,category);
    const aNodes=nodes.filter(n=>tagged(n,countryA));
    const bNodes=nodes.filter(n=>tagged(n,countryB));
    if(!aNodes.length||!bNodes.length)continue;
    const index=new Map(nodes.map(n=>[n.id,n]));
    const common=nodes.filter(n=>tagged(n,countryA)&&tagged(n,countryB)&&n.type!=="country");
    const regionEdges=[];
    for(const r of c.relations){
      const a=index.get(r.from),b=index.get(r.to);
      if(!a||!b)continue;
      const ab=scoped(a,countryA)&&scoped(b,countryB);
      const ba=scoped(a,countryB)&&scoped(b,countryA);
      if(!ab&&!ba)continue;
      const item={
        id:c.case_id+"::"+r.id,case_id:c.case_id,case_title:c.case_title,
        from:a.label,to:b.label,from_country:a.countries[0],to_country:b.countries[0],
        status:r.status,relation:r.relation,mechanism:r.mechanism||"",
        reviewed_at:r.reviewed_at||null,sources:refSources(c,r),
        epistemic_notice:"Ребро сравнивает объекты двух географий; само по себе не устанавливает двустороннюю причинность."
      };
      regionEdges.push(item);crossRegionEdges.push(item);
      if(OPPOSITION_TYPES.has(r.relation)&&item.sources.length&&r.status!=="rejected")
        explicitDisputes.push(item);
    }
    if(!common.length&&!regionEdges.length)continue; // no demonstrated comparison for this category
    const topicItems=common.map(n=>{
      const related=c.relations.filter(r=>r.from===n.id||r.to===n.id);
      const sourceIDs=[...new Set(related.flatMap(r=>r.evidence_source_ids||[]))];
      const sources=sourceIDs.map(id=>c.sources.find(s=>s.id===id))
        .filter(Boolean).map(s=>({id:s.id,url:s.url,publisher:s.publisher,published_at:s.published_at||null}));
      return {
        id:c.case_id+"::"+n.id,case_id:c.case_id,case_title:c.case_title,
        node_id:n.id,label:n.label,description:n.description||"",
        at:n.at,category:n.category,layer:n.layer,countries:n.countries,
        sources,
        related_statuses:[...new Set(related.map(r=>r.status))],
        shared_scope_note:n.countries.length>2
          ?"Также относится к другим странам/регионам: "+n.countries.filter(code=>code!==countryA&&code!==countryB).join(", ")
          :"Обе страны фигурируют в одном объекте исследования; это не доказательство двустороннего сотрудничества или конфликта."
      };
    });
    topics.push(...topicItems);
    sharedCases.push({
      id:c.case_id,title:c.case_title,description:c.description||"",
      shared_topic_count:topicItems.length,cross_region_edge_count:regionEdges.length,
      categories:[...new Set(topicItems.map(t=>t.category))],
      sources_total:c.sources.length
    });
  }
  return {countryA,countryB,category,until,cases:sharedCases,topics,crossRegionEdges,explicitDisputes,
    counts:{cases:sharedCases.length,topics:topics.length,crossRegionEdges:crossRegionEdges.length,
      verifiedBilateralDisputes:explicitDisputes.length},
    warning:"Совместное упоминание стран не доказывает их двусторонних отношений. Статус 'disputed' у внутреннего ребра не означает спор между государствами."
  };
}
