// node --test tests/pl_migration_crime_staging.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/research/pl-migration-crime/observations.2026-11-05.json',import.meta.url),'utf8'));
const validSources=new Set(d.sources.map(x=>x.id));
test('review gate prevents publication of unverified causal estimates',()=>{
 assert.equal(d.review_status,'review_required');
 assert.equal(d.analysis.causal_effect_estimated,false);
 assert.equal(d.analysis.execution_status,'design_and_source_inventory_only_no_regional_estimate');
});
test('suspects are persons, not convictions, and denominator missing',()=>{
 assert.equal(d.metric_definition.unit,'persons');
 assert.equal(d.metric_definition.case_status,'suspect_not_convicted');
 assert.ok(d.metric_definition.denominator_status.startsWith('missing_'));
 assert.equal(d.crime_types_status.nationality_by_offense_verified,false);
});
test('annual count rows include valid chronology, nonnegative integers and provenance',()=>{
 for(const r of d.annual_by_citizenship){
  assert.deepEqual(r.years,[2020,2021,2022,2023,2024]);
  assert.equal(r.years.length,r.values.length);
  assert.ok(r.values.every(v=>Number.isInteger(v)&&v>=0));
  assert.ok(validSources.has(r.source_id));
 }
});
test('within-period series compare matched windows and sources',()=>{
 assert.deepEqual(d.first_half_total.map(r=>r.period),['2025-H1','2026-H1']);
 assert.equal(d.first_half_total[0].foreign_suspects-d.first_half_total[1].foreign_suspects,882);
 for(const r of d.jan_aug_2024_2025){
  assert.equal(r.period_2024.slice(5,10),r.period_2025.slice(5,10));
  assert.equal(r.period_2024.slice(16),r.period_2025.slice(16));
  assert.ok(validSources.has(r.source_id));
 }
});
test('conflicting shares remain separate observations',()=>{
 assert.equal(d.disputed_2024_foreign_share.length,2);
 assert.notEqual(d.disputed_2024_foreign_share[0].share_percent,d.disputed_2024_foreign_share[1].share_percent);
});

test('Polish totals derive within one defined source series',()=>{
 for(const r of d.polish_vs_foreign_suspects_one_series){
   assert.equal(r.all_suspects-r.foreign_suspects,r.polish_suspects_derived);
   assert.equal(r.source_id,'mswia_2024');
 }
});
test('offense-level shares do not masquerade as citizenship-specific counts',()=>{
 assert.ok(d.offense_specific_foreign_suspect_share_not_nationality.length>0);
 assert.ok(d.offense_specific_foreign_suspect_share_not_nationality.every(r=>r.share_foreign_percent>=0&&r.share_foreign_percent<=100&&!('citizenship' in r)));
});
