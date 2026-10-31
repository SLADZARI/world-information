# AGENTS.md — World Information contributor / AI agent instructions

## Project identity
World Information is an **open research commons for global events, country conditions, measured indicators, falsifiable causal hypotheses and scenario review**. It is not the private Dementor Tab / Dementor Live game, not a real-time trading signal service and not a universal country-ranking algorithm.

Read [project research charter](docs/PROJECT_INSTRUCTIONS.ru.md) and [ChatGPT project prompt](docs/CHATGPT_PROJECT_PROMPT.ru.md) before substantial work. See [vision](docs/PRODUCT_VISION.md), [methodology](docs/METHODOLOGY.md), [graph spec](docs/GRAPH_BOARD_SPEC.md) and [traceability](docs/STORAGE_AND_TRACEABILITY.md).

## Before modifying anything
1. Inspect `main`, **all relevant open PRs and branch heads**, existing schemas and tests. Some prototypes and research graphs may still be in unmerged branches; do not mistake them for `main` or overwrite competing work.
2. Determine whether the request is **research, data ingestion, graph modeling, visualization, scenario simulation or editorial review**. Preserve canonical records and source history.
3. Prefer a focused new branch and PR. State dependencies on unmerged PRs and proactively flag overlapping edited files.

## Mandatory research/data invariants
- Data chain: **original source → raw signal → normalized observation/event → attributed claim → typed relation → story → conditional scenario/forecast → later resolution**.
- Retain object IDs, exact provenance URLs, publisher, as-of, publication, occurrence and legal effective timestamps. Do not fabricate or silently backdate evidence.
- Distinguish **measured observation**, **documented statement**, **causal hypothesis**, **statistically supported causal effect**, **disputed legal interpretation**, **rejected claim**. A cited article alone never establishes a quantified causal effect.
- No backwards-time effects. October 2026 political actions cannot explain an indicator for March or H1 2026; historical values are baselines, not outcomes.
- All measurements require unit, reporting period, scope (population, sector and country), method and source; do not equate visa *issuances* with employed-foreigner *stocks*, market cap changes with cash flows, or GUS investment outlays with NBP direct-investment flows.
- A policy proposal is **not enacted law**. Preserve legal status, population coverage, exclusions, validity period and official source. Opposing legal arguments remain attributed until adjudicated.
- Capture competing explanations and potential falsification before promoting a causal relation; do not invent probabilities or precise economic losses.
- Imported signals require staging and review. Source licensing, content rights, attribution, privacy and personal safety are part of ingestion validation.

## Graph / interface / model
- Category and subcategory describe topic; layer describes visibility; node type describes ontology. All views (2D board, Three.js, maps, country summary) must project **the same canonical dataset**.
- On every clickable edge expose evidence sources, status, mechanism, alternatives and time. Keep a text/keyboard-accessible fallback to 3D.
- Keep scenario calculation pure, separately tested and balance-conserving. Synthetic assumptions must be visibly labelled as synthetic; real macroeconomic forecasts require calibrated inputs, historical tests and uncertainty.
- The Dementor Live Brain inspires stock-flow accounting and world-response mechanics **conceptually only**. Do not copy or publish nonpublic game code.

## Contributions and quality gate
- Include `JTBD → REQ-ID → data field → UI → test` traceability when adding new capabilities.
- Use structured JSON and Markdown narratives in established paths, preserve schemas, stable IDs and case-source cross-references.
- Run applicable local checks when available, for example:
  `python tools/validate_graph.py`, `python tools/validate_research.py`, `node tools/check_board.mjs`, `node tools/check_research_board.mjs`.
  Also run tests and validators added by the relevant branch; verify GitHub Actions and report failures.
- A JS syntax check is **not** browser QA. Confirm rendering and usability before claiming visual testing. Distinguish implementation from deployment and historical fixture from live data.
- The repository is public but publishing source files **does not grant third-party copying/redistribution rights**. Verify licenses before reuse.
- Summarize work with changed files, evidence/source status, test results, PR URL, unresolved assumptions and precise next steps.

## Response style
Reply in the user's language. Prefer clear findings, measured values, attributed opposing perspectives, causal alternatives, actionable conditions to monitor, and honest limitations. No political advocacy and no narrative certainty that the evidence does not support.
