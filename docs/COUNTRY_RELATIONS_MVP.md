# Country Relations Explorer — evidence-first comparison v0.1

Status: experimental read-only local-first prototype in prototype/country-relations/. It is not a complete international relations database and does not assert country friendship, hostility, or economic influence scores.

## User scenario

1. Select two different countries or ISO areas (249 entries), date, and subject (politics, economy, finance, energy, society, logistics, security, environment, science).
2. See both countries as anchor nodes and documented research topics shared between them as intermediate cards.
3. Switch between common research topics, cross-geography directed edges, and explicitly sourced bilateral disputes.
4. Select a topic to inspect its description, relevant source links, epistemic statuses on nearby graph edges, and link to the canonical 2D investigation.
5. Share the pair, date, subject and view in a URL. If evidence is absent, show an explicit research gap.

The current default is Poland–Germany. The energy case provides common EU-wide themes. That is not a direct PL–DE relationship or verified causal effect.

## Evidence boundaries (mandatory)

- The country selector is generated from data/catalog/country-index.generated.json by tools/build_country_pair_options.mjs. It copies only country code, name, and the catalog research state. Country catalog status is not a measure of foreign affairs.
- The comparison reads data/case-registry.json and the same seven reviewed JSON graphs used by the 2D board. Its pure aggregation lives in prototype/country-relations/core.mjs.
- A common topic requires an actual node whose countries array contains both selected ISO codes. A multi-country policy can involve more than just the selected pair; the details disclose all tagged countries.
- A cross-geography edge requires graph endpoints exclusively tagged with one country each. Preserve the original relation type, hypothesis/review status and original source links. An association between stock indices is not a diplomatic dispute and not automatically causal.
- Disputes require a direct bilateral dispute-type edge with source evidence. Do not treat the status disputed on a domestic or global causal hypothesis as a dispute between governments. Empty results are incomplete coverage, not evidence of peace or no commerce.
- Event dates are filtering boundaries. Do not imply that a policy caused earlier published historical indicators. Do not infer numeric bilateral correlations, relationship strength, sanctions or trade volume from co-occurrence.
- Source links on common themes are the sources of adjacent research edges, not proof of a treaty or country-country impact.

## Data model required for a future real bilateral registry (not implemented)

A new reviewed country relation will need stable ID, parties and direction, relation type, subject category, valid start/end, event and publication dates, document/claim identifiers, primary-source IDs, mechanism, alternatives, falsification, legal status, source license, reviewer and version.

Possible types: documented agreement, bilateral trade/FDI flow (measurement and denomination required), border/regulatory dispute, security incident, transport corridor, migration, scientific exchange and cooperation. Every quantitative field must state base population, unit, geography, period and method. No generalized friendship index.

## Minimal acceptance

- Poland–Germany: EU gas and regulatory subjects are shown as shared research with no fabricated diplomatic dispute.
- China–Hong Kong: one cross-region finance comparison, explicitly associated, not causal.
- Egypt–Panama: two transport-related contexts, not a proven conflict.
- Poland–Belarus: no fabricated relationship from unrelated Poland-only records.
- URL query supports a, b, domain, until and view.
- 249 country/area options match the canonical catalog exactly. All seven cases read by same-origin HTTP.
- Tests: node tools/build_country_pair_options.mjs --check and node --test tests/country-relations.test.mjs. CI adds a headless Chromium DOM check.
- Public Pages build includes only country pair viewer, country option metadata, reviewed graph assets; raw research staging and authoring tools remain excluded.

## Launch

From the repository root run python3 -m http.server 8000 --bind 127.0.0.1, then open:

http://127.0.0.1:8000/prototype/country-relations/?a=PL&b=DE

This feature is a view on source-linked data. Full relationship authoring, cross-border economic metrics, backend storage, collaborative edits, temporal 3D and automated web discovery are future work. No public deployment until review and manual owner approval.
