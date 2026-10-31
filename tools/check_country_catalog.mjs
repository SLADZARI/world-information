#!/usr/bin/env node
// Offline smoke-check of generated HTML wiring and JavaScript syntax.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const html = fs.readFileSync("prototype/digital-country-catalog.html", "utf8");
assert(!html.includes("__COUNTRY_CATALOG_JSON__"), "unrendered JSON placeholder");
const match = html.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/);
assert(match, "embedded country registry missing");
const d = JSON.parse(match[1]);
assert.equal(d.countries.length, 249);
assert.equal(d.counts.partial, 4);
assert.equal(d.counts.queued, 3);
assert.equal(d.counts.unresearched, 242);
assert(d.countries.some(x => x.code === "PL" && x.profile.metrics.length));
assert(d.countries.some(x => x.code === "BY" && x.profile.metrics.length === 0));
const all = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(all.length, 2, "expected JSON data + one code script");
new vm.Script(all[1][1], {filename:"digital-country-catalog-inline.js"});
assert(html.includes('id="search"') && html.includes('id="filter"') && html.includes('id="detail"'));
console.log("PASS: self-contained country catalog: 249 records, JSON, JS syntax and controls");
