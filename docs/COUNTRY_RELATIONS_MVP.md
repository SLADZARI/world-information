# Country Relations Explorer — evidence-first comparison v0.1

Status: experimental read-only local-first prototype in prototype/country-relations/. It is not a complete international relations database and does not assert country friendship, hostility, or economic influence scores.

## User scenario

1. Select two different countries or ISO areas (249 entries), date, and subject (politics, economy, finance, energy, society, logistics, security, environment, science).
2. See both countries as anchor nodes and documented research topics shared between them as intermediate cards.
3. Start with a separate verified-source **bilateral fact registry** (8 categories), then switch to common research topics, cross-geography graph associations, or explicitly sourced direct disputes. A government source does not substitute for editorial approval.
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

## Separate canonical bilateral evidence registry (implemented in stacked PR)

- `data/bilateral/registry.v1.json`: 10 source-attributed research records, 8 categories (treaties, trade, investment, sanctions, territorial, migration, science, society); 9 PL/DE and 1 US/RU.
- `schemas/bilateral-relations.schema.json`: formal record structure with sorted ISO pair, directed or bilateral link, event/reporting dates, legal status, source IDs, evidence state, exact units and stock/flow semantics.
- `tools/validate_bilateral_registry.mjs` and `tests/bilateral-registry.test.mjs`: referential/temporal/direction/false-approval checks.
- `prototype/country-relations/bilateral.mjs`: pure read-only projection onto the pair interface. The original seven research cases remain independent; this module never upgrades shared topics to bilateral facts.
- All records are **review_required**, not editorially approved. The Pages release gate refuses unapproved records; manual publication and rights review remain mandatory.

Full implementation and authoring rules: [BILATERAL_REGISTRY.md](BILATERAL_REGISTRY.md).

Future work (not implemented): collaborative editing/review workflow, complete legal effective-date history, independently confirmed quantitative revision series, 3D bilateral pathways and comprehensive country coverage. Never infer alliance, hostility or causal effect from a government summary.

## Minimal acceptance

- Poland–Germany: EU gas and regulatory subjects are shown as shared research with no fabricated diplomatic dispute.
- China–Hong Kong: one cross-region finance comparison, explicitly associated, not causal.
- Egypt–Panama: two transport-related contexts, not a proven conflict.
- Poland–Belarus: no fabricated relationship from unrelated Poland-only records.
- URL query supports a, b, domain, type, until and view. `view=facts` is the default; `type=trade` filters the curated registry, not unrelated research graphs.
- 249 country/area options match the canonical catalog exactly. All seven cases read by same-origin HTTP.
- Tests: `node tools/build_country_pair_options.mjs --check`, `node tools/validate_bilateral_registry.mjs`, `node --test tests/country-relations.test.mjs tests/bilateral-registry.test.mjs`; CI adds a headless Chromium DOM check.
- Public Pages build includes only country pair viewer, country option metadata, reviewed graph assets; raw research staging and authoring tools remain excluded.

## Launch

From the repository root run python3 -m http.server 8000 --bind 127.0.0.1, then open:

http://127.0.0.1:8000/prototype/country-relations/?a=PL&b=DE

This feature now includes ten historical direct bilateral facts and quantitative snapshots, explicitly at their historical dates and with review_required labels. Shared research, source-backed direct facts and model hypotheses remain different data types. Full collaborative authoring, live series, backend storage, temporal 3D and automated web discovery are future work. No public deployment until review and manual owner approval.
