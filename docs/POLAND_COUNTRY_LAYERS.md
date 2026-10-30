# Country situation as a layered evidence graph: Poland, 30 October 2026

## Design decision
**One country environment, two independent case graphs, seven legal-policy records, multiple user lenses.** Political crisis around judicial appointments and migration-policy change should not be collapsed into a single event or a universal country risk score.

### Canonical objects
| Object | Where stored | Example | Required invariant |
|---|---|---|---|
| Country environment | `data/countries/PL/overview-2026-10-30.json` | Polish national context | as-of timestamp; links to bounded cases |
| Institutional event graph | `data/cases/poland-institutional-crisis-2026-10.json` | Tusk/Nawrocki/TK and Onet civil case | no unsupported legal judgment or direct unrelated causal edge |
| Migration event graph | `data/cases/poland-migration-policy-2025-2026.json` | EU Pact, border regulation, 800+, citizenship bill | distinguish status of each act |
| Legal and policy status register | `data/policies/PL-2026-10-30.json` | `proposed`, `enacted`, `time_limited`, `annual_exemption` | effective dates, scope, exceptions, primary text, version |
| Story | `stories/2026/poland-*.md` | readable evidence and competing hypotheses | links to graph, source and limits |
| Follow-up | `data/countries/PL/overview-2026-10-30.json#watchpoints` | hearing 18.01.2027 | scheduled event ≠ predicted result |

## How a user sees Poland

**Country: Poland · time: 2026-10-30 · lens: Resident / Relocator / Employer / Analyst**

1. **Institutional stability**: current Constitutional Tribunal events, disputed legal authority, veto / court process and historical election. No synthetic governance score.
2. **Civic rights**: asylum access border regulation, conditions and exceptions, differing positions from government and human-rights organizations.
3. **Migration and eligibility**: applicable current law by legal group, effective date, exemptions, pending bills separately.
4. **Economic channels**: official visa count, possible labour-supply channel and sector sensitivity; *no* automatically estimated GDP effect.
5. **Community discussion (future)**: comments attached to specific `claim_id` or `relation_id`, marked opinion / supporting source / rebuttal; moderation and multiple viewpoints.
6. **Forecasts (future)**: dispute-specific, time-stamped predictions with objective resolution conditions; no speculative probabilities automatically generated.

## Why this is a graph rather than a text-only summary

```text
Official source → 2026 EU Pact applicable
                       ↘ 2026 solidarity exemption (separate legal scope)
Gov work-visas source → 2022 Q1 123k → 2026 Q1 16k
                                ↘ hypothesis → sector labour availability
                                ↑
                    alternative: employer labour demand

President → 2025 citizenship bill [PROPOSED]
                                   ↘ only IF enacted → applicable recognition path

Government and president → judicial appointments dispute
                                  ↘ 30 Oct reported TK leadership suspension [LEGAL STATUS DISPUTED]
                                     ↘ political response / police / president returns
Grand Hotel/Onet civil case → Jan 18 2027 scheduled hearing
[NO EVIDENCE EDGE from this case to TK event]
```

## Causal and editorial safeguards
- Source date, event date, legal effective date and as-of date are distinct.
- Rival legal interpretations are **attributed claims**, not assistant verdicts.
- An institution's press release can document *its position*, not by itself prove a controversial constitutional claim.
- Sworn testimony documents what a witness said, not necessarily truth of a disputed accusation.
- No automatic effects on immigration status unless a real, applicable legal act has taken effect.
- Administrative work visas are not migrant population stock nor all work permissions.
- Annual solidarity exemption ≠ permanent removal of EU Pact obligations.
- Historic court appointments counts must be bound to source date; conflicting press counts are not silently reconciled.
- AI agents may extract candidate claims but must not publish personal accusations or unsupported links without reviewed sources.

## Requirement traceability
| ID | User job | Data path | UI/QA |
|---|---|---|---|
| PL-REQ-01 | What is happening in Polish institutions? | institutional case nodes/events | case board, click source |
| PL-REQ-02 | Is the tribunal leadership legally removed? | statuses `disputed`, claims, AP/Reuters | never display settled outcome |
| PL-REQ-03 | Is a new citizenship rule already in force? | policy `status=proposed`, null `effective_from` | strong proposal label, validator |
| PL-REQ-04 | Which benefits apply to my residence status? | policy `applies_to`, dates and exceptions | profile before blanket assertion |
| PL-REQ-05 | Did fewer visas cause labour shortages? | separate administrative indicator and claim | hypothesis with alternatives |
| PL-REQ-06 | Was the civil hearing coordinated with the TK event? | no `hypothesized_to_affect` edge | automated safeguard |
| PL-REQ-07 | What must be checked next? | country watchpoints, dates and official source | future update / resolution panel |

## Not yet implemented
Live Polish legal gazette/Sejm adapters; structured official bill workflow updates; user residency profile (privacy preserving); social discussions; independent law review; automated cross-case simulation; alerting and dated forecast resolution. The **existing HTML research board** displays the two graphs from canonical static files embedded as snapshots.


## Economic measurement bridge, delivered 2026-10-30

The previous institutional and migration graphs now have a **derived empirical view**, not a speculative immediate GDP prediction.

- [Cross-domain graph](../data/cases/poland-policy-economy-2026-10.json) (23 traceable nodes, 20 edges, 11 original source records).
- [Underlying economic measurements and proposed paths](../data/overlays/PL-policy-economy-2026-10.json) (GUS, MSWiA, NBP, preserved quarterly or annual grains).
- [Three.js viewer](../prototype/poland-economic-3d/index.html) with source/claim inspection and epistemic filters.
- [2D alternative](../prototype/research-board.html?case=poland-policy-economy-2026-10); as-of fixed to research snapshot.
- [Reproducible projection script](../tools/build_poland_economy.mjs) and tests.

**What changed:** stock of working foreigners in March 2026 **+8.0% YoY**, even as work-visa issuances in Q1 2026 were lower relative to Q1 2022. Vacancies Q1 2026 **100.2k** → Q2 2026 **98.7k**. Real enterprise investment outlays H1 2026 **+13.7% YoY**, total nominal **PLN 100.2bn**. NBP's FDI series **2023 → 2024** is a separate **lagged historical** baseline, not 2026 investment activity.

**Unsupported / prohibited links:** the Tribunal escalation on 2026-10-30 cannot cause financial or labour measurements dated March, June or earlier years. The derived graph contains only *prospective hypothetical* paths from political instability to future decisions, with explicit alternatives and falsification tests.

### Added requirement traceability

| Requirement ID | User-facing task | Output record | Verified in |
|---|---|---|---|
| PL-REQ-08 | Country overview shows measured foreign employment | `pl-foreign-workers-2025-03`, `pl-foreign-workers-2026-03` | `tests/poland-economic-links.test.mjs` |
| PL-REQ-09 | Show work visas without misleading decline in total foreign workers | `rel-pl-visa-vs-workers` association only | unit tests + source method |
| PL-REQ-10 | Show labour demand and vacancy rate with correct units | `pl-job-vacancies-2026-q1/q2` and `pl-vacancy-rate-2026-q2` | unit tests + source detail |
| PL-REQ-11 | Keep enterprise investment outlays separate from FDI | `pl-enterprise-investment-h1-2026`, `pl-fdi-inflow-2024` | explicit method + tests |
| PL-REQ-12 | No retroactive politics→old economy causality | `rel-pl-legal-uncertainty-investment` ends at **prospective factor** | builder invariant + tests |
| PL-REQ-13 | Source-backed 3D/2D graph for each claim | derived JSON case, click source/claim | 3D DOM / graph CI snapshot (full browser QA still required) |
