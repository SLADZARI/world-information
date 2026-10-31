#!/usr/bin/env node
/**
 * Market archive integrity + adapter to the existing event anomaly detector.
 * IMPORTANT: snapshots in data/markets are secondary published observations,
 * NOT market-data vendor quotes nor supported causal effects.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectMarketAnomalies } from "./detect_market_events.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
export const DEFAULT_ARCHIVE="data/markets/US/2026-10-30-tech-selloff.json";
const requireCondition=(ok,msg)=>{if(!ok)throw new Error(msg);};
const validTime=s=>typeof s==="string"&&Number.isFinite(Date.parse(s))&&/(Z|[+-]\d\d:\d\d)$/.test(s);
export function validateMarketBatch(batch){
  requireCondition(batch?.schema_version==="0.1.0"&&batch.kind==="market_observation_batch","Wrong batch schema");
  requireCondition(batch.synthetic===false,"Markets must be explicitly real records");
  requireCondition(validTime(batch.as_of),"Missing as-of datetime");
  requireCondition(Array.isArray(batch.sources)&&batch.sources.length>0,"Missing sources");
  requireCondition(Array.isArray(batch.instruments)&&batch.instruments.length>0,"Missing instruments");
  requireCondition(Array.isArray(batch.observations)&&batch.observations.length>0,"Missing observations");
  requireCondition(batch.market_timezone==="America/New_York"&&batch.session_date==="2026-10-30","This reviewed batch requires fixed exchange session");
  const sourceIDs=new Map(),tickerIDs=new Map(),obsIDs=new Set();
  for(const s of batch.sources){
    requireCondition(s.id&&!sourceIDs.has(s.id),"Duplicate/missing source "+s.id);
    requireCondition(s.url?.startsWith("https://")&&s.publisher&&s.kind&&s.rights,"Unattributed or unusable source "+s.id);
    requireCondition(s.published_at===null||validTime(s.published_at),"Invalid source published_at "+s.id);
    if(s.published_at!==null)requireCondition(Date.parse(s.published_at)<=Date.parse(batch.as_of),"Future source relative to snapshot");
    sourceIDs.set(s.id,s);
  }
  for(const inst of batch.instruments){
    requireCondition(inst.id&&!tickerIDs.has(inst.id),"Duplicate ticker "+inst.id);
    requireCondition(inst.country_of_listing==="US"&&inst.exchange_timezone===batch.market_timezone,"Wrong geographic or trading venue for US data");
    requireCondition(["equity","broad_index","sector_index"].includes(inst.asset_class),"Unsupported instrument class in reviewed batch");
    tickerIDs.set(inst.id,inst);
  }
  for(const r of batch.observations){
    requireCondition(r.id&&!obsIDs.has(r.id),"Duplicate/missing record ID "+r.id);obsIDs.add(r.id);
    requireCondition(tickerIDs.has(r.instrument_id)&&sourceIDs.has(r.source_id),"Unresolved ticker or source "+r.id);
    requireCondition(r.session_date===batch.session_date,"Mixing sessions");
    requireCondition(r.metric==="price_change_percent"&&r.unit==="percent"&&Number.isFinite(r.value)&&r.value>=-100,"Invalid return "+r.id);
    requireCondition(["regular_session_intraday","regular_close_to_close"].includes(r.window),"Unknown quote window");
    requireCondition(r.price_basis==="prior_regular_session_close","Incompatible comparison basis");
    requireCondition(validTime(r.reported_at)&&Date.parse(r.reported_at)<=Date.parse(batch.as_of),"Future/missing report time "+r.id);
    requireCondition(r.measurement_at===null||validTime(r.measurement_at),"Bad measurement time "+r.id);
    if(r.measurement_at!==null)requireCondition(Date.parse(r.measurement_at)<=Date.parse(r.reported_at),"Quote time after report time "+r.id);
    if(r.window==="regular_session_intraday"){
      requireCondition(r.measurement_at===null&&r.verification_status==="report_only_time_unverified","Unverified media quote must not pretend to have exchange timestamp");
      requireCondition(sourceIDs.get(r.source_id).kind==="user_claim","Media claim incorrectly labelled as verified price");
    }
    if(r.window==="regular_close_to_close"){
      requireCondition(r.measurement_at==="2026-10-30T20:00:00Z","Close needs correct NYC regular-session close time");
      requireCondition(["secondary_closing_snapshot","exchange_verified"].includes(r.verification_status),"Close status invalid");
      if(r.verification_status==="exchange_verified")requireCondition(sourceIDs.get(r.source_id).kind==="exchange_official","Cannot claim exchange verification using third party");
    }
  }
  const pairs=new Set(batch.observations.map(r=>r.instrument_id+"|"+r.window+"|"+r.session_date));
  requireCondition(pairs.size===batch.observations.length,"Duplicated quote window for same ticker");
  requireCondition(batch.connected_case_id==="ai-tech-multimarket-2026-10-30","Market archive must link to the actual event study ID");
  return true;
}
export function toDetectorInput(batch) {
  validateMarketBatch(batch);
  const instrumentByID=new Map(batch.instruments.map(i=>[i.id,i]));
  const rows=batch.observations.filter(r=>r.window==="regular_close_to_close");
  return {
    schema_version: "0.1.0",
    as_of:batch.as_of,
    sources:batch.sources.map(s=>({id:s.id,url:s.url,publisher:s.publisher,published_at:s.published_at,rights:s.rights})),
    observations:rows.map(r=>{
      const i=instrumentByID.get(r.instrument_id);
      return {
        instrument_id:i.id,label:i.label,asset_type:i.asset_class,region:i.country_of_listing,
        sector:i.sector,return_pct:r.value,window:"regular_close_to_close",
        observed_at:r.measurement_at,source_id:r.source_id,provenance:r.verification_status
      };
    }),
    narratives:batch.narrative_assessments.map(n=>({id:n.id,text:n.claim,status:n.status,note:n.caution}))
  };
}
export function analyzeMarketBatch(batch){
  const detection=detectMarketAnomalies(toDetectorInput(batch));
  return {
    batch_id:batch.batch_id,
    as_of:batch.as_of,
    market_id:batch.market_id,
    event_graph_id:batch.connected_case_id,
    instrument_count:batch.instruments.length,
    preserved_intraday_claims:batch.observations.filter(r=>r.window==="regular_session_intraday").length,
    normalized_session_closes:batch.observations.filter(r=>r.window==="regular_close_to_close").length,
    ...detection
  };
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const location=process.argv[2]||DEFAULT_ARCHIVE;
  const result=analyzeMarketBatch(JSON.parse(fs.readFileSync(path.resolve(ROOT,location),"utf8")));
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
