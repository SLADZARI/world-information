# Storage and traceability contract v0.1

## Canonical repository structure

```text
world-information/
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── PRODUCT_VISION.md
│   ├── DEMENTOR_ADAPTATION.md
│   ├── STORAGE_AND_TRACEABILITY.md
│   ├── GRAPH_BOARD_SPEC.md
│   ├── CJM_JTBD_RESEARCH.md
│   ├── SOURCE_CATALOG.md
│   └── REQUIREMENTS.md
├── schemas/
│   └── world-graph.schema.json
├── data/
│   ├── examples/world-graph.demo.json   # synthetic, non-factual test data
│   ├── sources/                          # metadata, licensing, retrieval versions
│   ├── entities/                         # country, region, organization, market IDs
│   ├── signals/                          # atomized observations and news mentions
│   ├── events/                           # deduplicated events
│   ├── indicators/                       # references to versioned time series
│   ├── claims/                           # checkable statements & evidence bundles
│   ├── relations/                        # evidence-scoped directed multigraph edges
│   ├── scenarios/                        # counterfactual assumptions and variants
│   ├── forecasts/                        # immutable predictions & resolutions
│   └── discussions/                      # optional imported *metadata* / issue links
├── stories/                              # reviewed human-readable narratives
├── prototype/board.html                  # offline demo; no live numbers
├── tools/                                # future ingestion and validation code
└── .github/                              # future issue / PR schemas and CI
```

Stage 0 may keep a single JSON fixture. After CI and storage rules stabilize, split into one record per file (e.g. `data/events/2026/evt-*.json`). A file belongs to one stable ID; changing title does not change ID.

## Country model and granularity
- Country IDs: ISO 3166-1 alpha-2; subnational region IDs require dataset-specific definitions.
- An event can affect several countries (roles: origin, transit, exposed, observer). Do not force exactly one country.
- Indicators must specify metric, units, geography, population subgroup, period, method, source, vintage, and comparable baseline.
- Residency/rights metadata varies by citizenship, visa/residency status, municipality, and date; do not make country-wide categorical claims without conditions.

## Graph primitives
`entities` (Country, Region, Sector, Institution, Market, Route, Commodity), `events`, `signals`, `indicators`, `claims`, `scenarios`, `forecasts`, `discussion_refs`, `market_refs`, `sources`.

`relations` connect stable IDs, are typed, directed, time-scoped and backed by a claim or source. Multiple relations between identical nodes are allowed.

```text
source → supports/contradicts → claim → asserts → relation
requirement → implemented_by → graph/UI field → tested_by → test
event → hypothesized_to_affect → indicator → observed_by → measurement
scenario → assumes → claims/indicator shocks → predicts → forecast
discussion → comments_on → claim (never → proves claim)
prediction_market → prices_outcome_of → forecast question (never → confirms truth)
```

## Two independent traceability chains
1. **Evidence lineage**: `source_id + retrieval_time + content hash / archived pointer → signal / observation → claim → relation → story / forecast`.
2. **Product requirements**: `REQ-ID → user job → acceptance criteria → schema path → UI element → automated/manual test`. See `docs/REQUIREMENTS.md`.

## Time and revisions
Preserve at minimum `occurred_at`, `published_at`, `observed_at`, `ingested_at`, and `valid_from` where relevant; `observed_at` is not necessarily event time. Display what was known *as of* selected date (bitemporal queries in DB later). Never rewrite submitted predictions after their cutoff; corrections are append-only with amendment IDs.

## Validation and safety invariants
- All linked IDs must resolve; `supports`/supported causal edges require existing source IDs; ambiguous relations default to hypothesis.
- Claims have a mechanism, alternatives, falsification conditions, authorship, and review status.
- Categories/tags are controlled, but support multiple domains and subcategory paths.
- Historical indicators are never interpolated without explicit labelling.
- Comments, prediction market prices, and generative summaries are **opinions/signals**, never verified evidence of the proposition.
- Store links and excerpts within rights/quoting rules, not scraped copyrighted article bodies.
- No private home addresses, doxxing, individual targeting, or sensitive raw user submissions in public Git.

## Database later — projections, not new sources of truth
Postgres tables: countries, actors, events, signal_observations, indicator_series, indicator_points, claims, evidence_links, relations, scenarios, forecasts, forecast_resolutions, source_snapshots, discussions, moderation_actions, market_snapshots. PK stable IDs; FK references, GIN on labels/categories, B-tree on time and country, spatial index where appropriate. Start with PostgreSQL recursive CTEs; only add graph database if cross-country traversal/graph analytics justifies it. DuckDB useful for offline indicator analysis. Keep Git as auditable source and DB as rebuildable index.
