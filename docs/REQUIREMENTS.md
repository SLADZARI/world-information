# Requirements traceability matrix v0.1

Statuses: `designed` means documented, not shipped; `prototype` means demonstrable UI; `planned` means future.

| Requirement | JTBD owner | Expected behavior / acceptance | Schema trace | UI trace | Test / status |
|---|---|---|---|---|---|
| REQ-001 country selection | relocator, local | country or region selected; graph and detail pane recalculate | country_codes on nodes / scopes | country control | prototype, manual switch |
| REQ-002 category taxonomy | all | each event has a primary category + ≥1 subcategory path | events[].category, subcategories[] | domain filters & node labels | schema required / prototype |
| REQ-003 event layers | all | independently toggle event, factors, impacts, scenarios, discourse | nodes[].layer | layer controls | prototype |
| REQ-004 evidence trace | analyst | every supported relation links real source or claim; open inspection panel | relations[].evidence_source_ids, claim_ids | click edge / fact sheet | designed; validation to add |
| REQ-005 alternative causes | investor, resident | at least two alternative hypotheses for an explained event | claim, mechanism, alternatives | competing pathways | designed / prototype |
| REQ-006 scenario forks | forecaster, investor | separate baseline from hypothetical assumptions; conditional effects labeled | scenarios, forecasts | scenario toggle | prototype synthetic / model planned |
| REQ-007 as-of history | all | user can distinguish event time vs publication and knowledge date | occurred_at, published_at, observed_at | as-of selector | designed |
| REQ-008 relocation context | relocator | differentiated citizen/visa/legal-status and regional availability | indicator population_scope | country lens | designed |
| REQ-009 opinion vs evidence | resident, contributor | discussion cannot be treated as primary proof | discussions / claims | discussion pane | designed |
| REQ-010 market-context card | forecaster | market card includes status, outcome wording, timestamp, liquidity/method, clear third-party branding | market_refs[] | external market panel | planned; no live API |
| REQ-011 locked forecast | forecaster | prediction fixed at cutoff; outcome resolved against named source | forecasts, resolutions | forecast panel | designed |
| REQ-012 accessibility | all | clickable nodes have keyboard alternative; textual graph relation list | title / summary | graph & side list | prototype baseline |
| REQ-013 external source licensing | operators | source metadata records license and permitted reuse | sources[].rights | provenance inspector | designed |
| REQ-014 no cross-border false causality | analyst | country crossing path has explicit exposure channel and status | relation mechanism / scope | edge detail | designed |
| REQ-015 contributor review | contributor | proposed new edge enters review before publishing | claim status and review | GitHub PR | exists as workflow, automation planned |

## Definition of done for a public causal edge
- Both nodes exist with stable IDs and time scope.
- A relation type distinguishes association from causation.
- Claim identifies mechanism, alternative explanation, falsifier.
- At least one attributable primary source for supported/observed status; contrary evidence displayed.
- Review timestamp and author/reviewer attribution.
- Link from board to evidence and back.
- Coverage and missingness noted; no fabricated point estimates.
