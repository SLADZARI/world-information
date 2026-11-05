// node --test tests/pl_belarus_integration_research.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/research/pl-migration-crime/by-integration-2020-2026.2026-11-05.json',import.meta.url),'utf8'));
const sources=new Set(d.sources.map(s=>s.id));
test('staging and source references are explicit',()=>{
 assert.equal(d.review_status,'review_required');
 assert.equal(d.research_design.status,'infrastructure_extended_no_estimated_effect');
 assert.equal(d.suspect_age_by_citizenship.value,null);
 assert.equal(d.poles_card_to_citizenship.count_naturalized_via_card_by_year_and_BY,null);
 for(const s of d.sources)assert.match(s.url,/^https:\/\//);
});
test('five selected offenses are matched eight month observations, not all crime categories',()=>{
 assert.equal(d.selected_offense_articles_2022_2024.coverage,'Jan 1–Aug 31 each year');
 assert.equal(d.selected_offense_articles_2022_2024.rows.length,5);
 for(const r of d.selected_offense_articles_2022_2024.rows){
  assert.deepEqual(Object.keys(r.values),['2022','2023','2024']);
  assert.ok(Object.values(r.values).every(x=>Number.isInteger(x)&&x>=0));
 }
 assert.ok(sources.has(d.selected_offense_articles_2022_2024.source_id));
});
test('crude rates never classified as incidence or guilt propensity',()=>{
 assert.equal(d.crude_indicators_2024.length,2);
 for(const row of d.crude_indicators_2024){
  assert.equal(row.status,'arithmetic_indicator_NOT_incidence_or_individual_probability');
  assert.ok(row.comparability.includes('year-end_stock_not_person_years'));
  assert.ok(Math.abs(row.per_1000-row.numerator/row.denominator*1000)<0.0001);
 }
});
test('naturalizations and Pole Cards are different and 2024 discrepancy retained',()=>{
 assert.equal(d.naturalization_by_previous_citizenship.length,6);
 const y=d.naturalization_by_previous_citizenship.find(r=>r.year===2024);
 assert.equal(y.administrative+y.presidential,y.persons);
 assert.notEqual(y.persons,d.naturalization_source_conflict.alternative_total);
 const pole=d.pole_card_grants_by_place.filter(r=>r.year===2020);
 assert.equal(new Set(pole.map(r=>r.cards)).size,2);
 assert.equal(d.poles_card_to_citizenship.citizenship_direct,false);
 assert.ok(d.pole_card_grants_poland_2024_all_citizenships.note.includes('MUST NOT'));
});
test('mixed marriages have one PL spouse and two disjoint sexes',()=>{
 const m=d.mixed_marriages_2024;
 assert.equal(m.total,m.female_citizenship_BY_male_citizenship_PL+m.male_citizenship_BY_female_citizenship_PL);
 assert.equal(m.total,286);
 assert.equal(d.mixed_marriages_2020_2023.yearwise_values,null);
});
