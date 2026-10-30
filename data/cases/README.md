# Reviewed real-world case graphs

Five starter investigations share the v0.1 schema. They contain **historical, source-backed facts and separately marked causal hypotheses**, not live streams or system-level numerical forecasts.

| Case | Scope | Verified observations | What remains hypothetical |
|---|---|---|---|
| [Poland Constitutional Tribunal and leadership conflict](poland-institutional-crisis-2026-10.json) | Poland, Oct 2026 | Reuters/AP reports, PKW vote, scheduled civil hearing | Legal authority contested; no inferred link from Onet case to TK |
| [Poland immigration law and citizenship proposal](poland-migration-policy-2025-2026.json) | Poland, 2025–2026 | 800+ policy dates, visa totals, EU Pact, annual exception | Policy effect on workforce and residents by status not measured |
| [Binance incident October 2026](binance-incident-2026-10.json) | Global crypto and U.S. listed equity context | Official ~$6.3B impact estimate, corporate and independent frozen-asset observations, dated market snapshot | Technical attribution, causal market effect, market recovery and liquidity stress |
| [EU gas transition 2021–2026](eu-gas-transition-2021-2026.json) | EU, Germany and Poland as investigative perspectives | Gas import volumes, supplier shift, 2022 REPowerEU, 2026 regulation | Attribution of the total shift to individual policies, national industrial price effects |
| [Maritime corridors 2023–2024](maritime-corridors-2023-2024.json) | Red Sea/Suez & Panama Canal | Shipping attacks and disruptions, UNCTAD historical canal-transit estimates | Exact causal contribution to freight prices and end-consumer inflation |

**No fabricated certainty:** an official article reporting a metric supports the existence of that reported observation, but does not automatically establish a quantified causal effect. Nodes with question marks indicate outcomes without a verified measurement in this first release.

To inspect: open [the interactive real-case board](../../prototype/research-board.html). Offline HTML snapshots in the repository; each edge links to a specific source URL or discloses that evidence is missing.

To validate: `python tools/validate_graph.py` (planned to check all case files; original fixture validator currently checks demo only).
