// Pure read-only projection of a separately attributed bilateral fact registry.
// This module NEVER infers treaties, conflicts, trade flows or causal effects from shared mentions.
export const BILATERAL_CATEGORIES=Object.freeze({
  treaties:"Договоры",trade:"Торговля",investment:"Инвестиции",
  sanctions:"Санкции",territorial:"Территория и границы",
  migration:"Миграция",science:"Наука и образование",society:"Общественные связи"
});
export const EVIDENCE_LABELS=Object.freeze({
  primary_official_document:"Официальный первичный документ",
  official_secondary_measurement:"Государственная сводка со ссылкой на статистику",
  official_reported_estimate:"Приблизительная оценка госоргана",
  official_government_description:"Официальное описание программы или события"
});
export const REVIEW_LABELS=Object.freeze({
  review_required:"Требуется независимая редакционная проверка",
  approved:"Одобрено с указанием проверяющего",
  rejected:"Не использовать"
});
const ISO=/^[A-Z]{2}$/;
const isDay=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
  !Number.isNaN(Date.parse(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
function observationDay(x){return x.measurement?.period_end||x.occurred_on||x.as_of;}
export function selectBilateralFacts(registry,a,b,{domain="all",category="all",until="2026-10-31",includeRejected=false}={}){
  if(!ISO.test(a)||!ISO.test(b)||a===b)throw Error("Нужны две разные страны с ISO-кодами");
  if(domain!=="all"&&!["politics","economy","finance","energy","society","logistics","security","environment","science"].includes(domain))
    throw Error("Неизвестная предметная область");
  if(category!=="all"&&!(category in BILATERAL_CATEGORIES))throw Error("Неизвестная категория двусторонних фактов");
  if(!isDay(until))throw Error("Некорректная дата");
  if(!registry||registry.schema_version!=="1.0.0"||!Array.isArray(registry.records)||!Array.isArray(registry.sources))
    throw Error("Неподходящий двусторонний реестр");
  const pair=[a,b].sort().join("|");
  const sources=new Map(registry.sources.map(x=>[x.id,x]));
  const records=registry.records.filter(x=>
    x.pair.join("|")===pair&&(includeRejected||x.review_status!=="rejected")&&
    (domain==="all"||x.domain_tags.includes(domain))&&(category==="all"||x.category===category)&&observationDay(x)<=until)
    .map(x=>({
      ...x,
      event_day:observationDay(x),
      party_label:x.direction==="directed"?x.from+" → "+x.to:x.pair.join(" ↔ "),
      sources:x.source_ids.map(id=>sources.get(id)).filter(Boolean)
    }))
    .sort((x,y)=>y.event_day.localeCompare(x.event_day)||x.id.localeCompare(y.id));
  const categories=Object.keys(BILATERAL_CATEGORIES).map(key=>({
    category:key,label:BILATERAL_CATEGORIES[key],count:records.filter(x=>x.category===key).length,
    coverage:records.some(x=>x.category===key)?"documented_records":"no_record_in_this_scope"
  }));
  return {
    countryA:a,countryB:b,until,domain,category,records,categories,
    count:records.length,
    active_disputes:records.filter(x=>x.dispute_status==="documented_active"&&x.review_status==="approved").length,
    historical_settlements:records.filter(x=>x.dispute_status==="historically_settled").length,
    pending_review:records.filter(x=>x.review_status!=="approved").length,
    note:"Отсутствие записи не означает отсутствие отношений. Документ и вторичная оценка имеют разный статус; причинность не выводится автоматически."
  };
}
export function formatBilateralMetric(record){
  const m=record?.measurement;
  if(!m)return null;
  const raw=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(m.value);
  const scale=m.scale==="billion"?" млрд":"";
  const unit=m.unit==="EUR"?" евро":" человек";
  const sign=m.qualifier==="approximately"?"≈ ":"";
  return sign+raw+scale+unit+" · "+m.period_end;
}
