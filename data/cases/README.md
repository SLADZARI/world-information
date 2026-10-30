# Reviewed real-world case graphs

Two starter investigations share the v0.1 schema. They contain **historical, source-backed facts and separately marked causal hypotheses**, not live streams or system-level numerical forecasts.

| Case | Scope | Verified observations | What remains hypothetical |
|---|---|---|---|
| [EU gas transition 2021–2026](eu-gas-transition-2021-2026.json) | EU, Germany and Poland as investigative perspectives | Gas import volumes, supplier shift, 2022 REPowerEU, 2026 regulation | Attribution of the total shift to individual policies, national industrial price effects |
| [Maritime corridors 2023–2024](maritime-corridors-2023-2024.json) | Red Sea/Suez & Panama Canal | Shipping attacks and disruptions, UNCTAD historical canal-transit estimates | Exact causal contribution to freight prices and end-consumer inflation |

**No fabricated certainty:** an official article reporting a metric supports the existence of that reported observation, but does not automatically establish a quantified causal effect. Nodes with question marks indicate outcomes without a verified measurement in this first release.

To inspect: open [the interactive real-case board](../../prototype/research-board.html). Offline HTML snapshots in the repository; each edge links to a specific source URL or discloses that evidence is missing.

To validate: `python tools/validate_graph.py` (planned to check all case files; original fixture validator currently checks demo only).
