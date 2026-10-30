# Architecture roadmap

## Stage 0 — Git-native research commons (current)
Markdown stories, explicit sources and hypothesis tables, peer review via GitHub Pull Requests. Issues are the research intake. Git commit history is the audit log. No database or AI scoring required to contribute.

## Stage 1 — Structured evidence
Add machine-readable records under `data/signals/`, `data/events/`, `data/claims/`, `data/forecasts/`. Use stable IDs, JSON Schema validation in CI, timestamps in ISO 8601 UTC, source URLs, license metadata, and links between IDs. Do not scrape sites in violation of terms. Deduplicate syndicated news reports.

## Stage 2 — reproducible research
Connect openly licensed series from reputable institutional datasets; store extract scripts and dataset versions rather than copying restricted datasets. Use Python notebooks for market-event studies, lag checks, alternative drivers, and sensitivity analyses. Publish figures with source, units, and methodology.

## Stage 3 — graph, map, dashboards
Project structured relations into a graph; offer a map/timeline, domain indicators, hypothesis confidence based on explicit rubric (not opaque AI scores), prediction scorecards, and topic subscriptions. Keep original records in Git and treat graph as a rebuildable projection.

## Potential data families (subject to license and access)
- Economics: central banks, statistical offices, World Bank, IMF, OECD, Eurostat.
- Energy: EIA, IEA datasets where permitted, ENTSO-E, energy exchanges.
- Logistics: port statistics, UN Comtrade, open AIS datasets where licensed.
- Environment: NASA Earthdata, Copernicus, NOAA.
- Science: Crossref, OpenAlex, institutional repositories.
- Events: GDELT as lead discovery, official archives and multiple independent confirmations.

## Contributor workflow
Signal (Issue) → evidence record → alternative causal hypotheses → analysis PR → peer review → publication → follow-up measurements → forecast resolution / correction.

## Non-goals
No automatic truth labels, blanket political scoring, real-time predictive certainty, or unreviewed publication of AI-generated assertions.
