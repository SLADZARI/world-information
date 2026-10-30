# Graph board: product + rendering specification v0.1

## Canvas / country overview
Desktop: country header (country + as-of date + lens), left filters, central graph, right evidence/details panel, bottom time axis and scenario comparator. Mobile: country summary first, then focused graph/story cards; never show thousands of tangled edges by default.

### Distinct visual dimensions
- **Category** (subject): economy, politics/governance, energy, logistics/trade, environment/climate, science/technology, society/rights, security/conflict, finance.
- **Subcategory**: hierarchical controlled paths, e.g. `energy.electricity.grid`, `economy.inflation.cpi`, `society.migration.residence_rights`.
- **Object type** (shape): country/region, actor, event, measured indicator, claim, factor, scenario, forecast, discussion, market.
- **Epistemic status** (edge stroke and text): measured/observed, hypothesized, supported, contested, refuted. NEVER encode this merely as a color.
- **View layer** (filter): 1. geography, 2. indicators, 3. events, 4. candidate causal mechanisms, 5. scenarios/forecasts, 6. community debate/market expectations.
- **Time**: both event time and as-of date.

Categorical color is independent of causal certainty. An event can have multiple category tags; one primary category controls the visual accent, but all filters can match. Subcategories are taxonomic, not parent-child causal edges.

## Semantic zoom / rendering
1. **Earth**: world map with normalized country-level indicators, exposure pathways and time window. No causality inferred from proximity.
2. **Country**: country condition dashboard with baseline, trend, drivers, relevant neighboring connections, demographic and legal-status cuts.
3. **Investigation**: bounded directed multigraph from focal event; 1–3 hops, collapse category clusters, show side factors and alternative paths.
4. **Evidence**: select a node/edge → full source chain, alternative interpretations, dated forecasts and comments.

For MVP, render a bounded *layered* directed view and an adjacent evidence panel. Future: React Flow + ELK for legible editable pathways and nested groups; Sigma.js + Graphology for very large network exploration; map with MapLibre if geospatial maps are required. Render only the selected subgraph; aggregate the rest as counts. React Flow supports subflows/group nodes; Sigma uses WebGL for large networks. Sources: https://reactflow.dev/learn/layouting/sub-flows and https://www.sigmajs.org/concepts/rendering/.

## Scenario semantics
Baseline = observed and measured. A scenario branches from an explicit `assumption` at time T, shows factors, alternative outcomes and possible propagations over T+1 ... T+N. Not a deterministic forecast unless a validated model is specified. Scenarios may share upstream evidence. Compare changes vs baseline with interval / uncertainty, not made-up precise odds.

Real-world feedback loops are represented by `A(t) → B(t+1) → A(t+2)` when running models. The evidence graph itself may contain cycles and opposing edges.

## Interactions
- Country selector, user lens, time filter and as-of date.
- Toggle topical layers and evidence/scenario/discussion overlays.
- Click relation → explain type, evidence/contradictions, when it was proposed, who reviewed it.
- Highlight path from event to indicator; switch competing hypotheses without hiding disconfirming evidence.
- Expand/collapse cross-border connections; compare countries with same population/methodology constraints.
- Comments anchored to exact `claim_id` or `relation_id` and version; reply not equal to source.
- Market thread linked to resolution wording, jurisdictional availability and timestamped liquidity/price, with **read-only context**, never a betting recommendation.
- Save board query state in a shareable URL; annotate selected as-of date.

## MVP performance / accessibility (targets)
Initial country summary meaningful in <3 seconds on typical broadband (target, to measure). Focused graph capped to ~30–60 visible nodes until tested; mouse/keyboard selection, visible labels beyond color, textual alternative for every graph, screen-reader-friendly relation list, reduced-motion option. Expose missing data and coverage differences.

## Demo
`prototype/board.html` is a self-contained interactive **synthetic** board, with country switch, domain filters, scenario toggle and evidence pane. Do not mistake demo figures and connections for current world facts.
