# User research, JTBD and CJM v0.1

Status: **desk-research hypotheses**, not validated interviews or measured demand. Date: 2026-10-30. The product is World Information (not Dementor Tab).

## Why users might care (evidence vs hypotheses)
Existing country comparison services show concrete indicator needs: OECD Well-being Data Monitor lets people customize well-being dimensions and compare countries and population gaps (https://www.oecd.org/en/data/tools/well-being-data-monitor.html); OECD migrant integration dashboards separate recent/settled and foreign/native born (https://www.oecd.org/en/data/dashboards/indicators-of-immigrant-integration.html). World Bank's governance estimates are comparative indicators, but not definitive individual investment decisions (https://www.worldbank.org/en/publication/worldwide-governance-indicators). Polymarket provides event-market metadata/price history (https://institute.polymarket.com/data); Metaculus's public API imposes access and usage restrictions (https://www.metaculus.com/api/). These are **evidence of existing adjacent use cases**, not proof our product has product-market fit.

## JTBD (job → context → expected outcome → trust needs → MVP feature)

| Segment | When / situation | I want to... | So I can... | Trust / failure risk | MVP |
|---|---|---|---|---|---|
| Relocator / cross-border worker | Considering country/city and legal residence | compare cost, jobs, services, safety, bank access, residence status and what might change | narrow down locations and questions for advisors | false assumption that citizens and migrants have equal rights; old laws | country compare by legal status; dated official source |
| Local resident | Price shock, new law, environmental incident | see what's changed in my area and competing explanations | form an informed view and participate in discussion | disinformation, national averages hiding local gaps | local event → indicator path → primary sources → debate |
| Investor / owner / supply-chain manager | Evaluating exposure in country or corridor | trace energy, trade, policy and currency shocks to affected sectors | prioritize deeper diligence and monitoring | spurious causality, stale prices, false precision | exposure graph, indicator history, alerts |
| Analyst / journalist / researcher | Reporting or researching a contested event | reproduce claim-to-source chain and inspect alternative hypotheses | publish a defensible and correctly qualified finding | non-reproducible citations, source bias | story evidence panel, export trace, change log |
| Forecaster / enthusiast | Wants to contest a scenario and follow accuracy | submit falsifiable outcome and inspect track records / prediction market threads | learn whether reasoning was calibrated and debate mechanisms | hindsight edits, market price mistaken for truth | timestamp forecast, clear outcome rule, discussion per claim |

## Jobs by urgency, not demographics
- **Exploration** (weeks/months): "Which country fits my constraints?" → country lens & comparison.
- **Incident response** (hours/days): "What does event X affect?" → graph centered on event with sources.
- **Monitoring** (ongoing): "What has changed since I last checked?" → delta timeline and subscribed topics.
- **Accountability** (after horizon): "Who predicted this and was it right?" → locked forecasts and resolutions.
- **Participation** (anytime): "I disagree; what contradicts the claim?" → claim-scoped review and evidence submission.

## CJM A — person choosing a country for relocation

| Step | User action | Thought / doubt | Product surface | Success signal |
|---|---|---|---|---|
| Trigger | hears about changes affecting residence/work | "Will I still be eligible?" | search/link to country | discovers country page |
| Orientation | picks country, region and residence/citizenship context | "Am I seeing conditions that apply to me?" | context profile & as-of | correctly distinguishes residency |
| Compare | weighs costs, rights, services, earnings | "Which differences are comparable?" | indicators and subpopulation cuts | ≥2 indicator sources opened |
| Explain | opens cause graph of major policy/economic changes | "What actually caused the shift?" | event graph and alternatives | identifies at least one uncertainty |
| Explore | compares conditional future outcomes | "What if the policy changes?" | scenario branches | understands baseline vs conditional |
| Decide | saves evidence-based checklist | "What must I verify officially?" | export/citations and watchlist | appropriate information source opened |
| Return | receives updated official change | "Did the forecast happen?" | time-based updates | revisits decision |

## CJM B — investor / analyst responding to country event

Discover trigger → choose portfolio/exposure lens → select cross-border event → show 1–3 causal hops → inspect primary source and alternative macro drivers → compare scenarios against benchmark → export evidence & open watchlist → revisit forecasts and revisions.

Critical step: distinguish `correlation`, `hypothesized effect`, `identified causal effect`. Never present automated scenario values without assumptions.

## CJM C — local resident / contributor

Arrives from shared event → sees verified and unverified statements separated → opens evidence trail → comments on specific claim with counterevidence → submits correction/proposed relation → reviewer checks source and schema → contribution appears with version attribution → returns to see rebuttal, corrections and forecast outcome.

## Interview / usability study plan (not yet run)
- Recruit purposively: 5–8 usability sessions per priority segment initially (not statistical representativeness); ensure migrant legal-status and locality diversity; 15–25 discovery interviews across segments to rank jobs and willingness to revisit. These are research targets, **not actual participants**.
- Tasks: "Find conditions for a non-citizen," "Explain a price movement without inventing a cause," "Show whether a probability is market quote or editorial estimate," "Dispute an edge."
- Measures: task completion, time-to-citable-answer, confusion rate observed/simulated, source-open rate, qualified weekly return, citation correctness, evidence-bearing contributions / accepted PRs, forecast resolution coverage. Do not optimize click volume or controversy.

## Validation decisions / kill signals
Start with two focal jobs: `country decision` and `investigate shock`. Separate landing experiences, same underlying records. If novice users cannot understand claim status without training, simplify canvas into a guided story path. If content ingest grows but verified edges do not, halt ingestion expansion. If forecasts cannot be resolved objectively, stop publishing numeric aggregates.
