# Inspiration from Dementor Lab's existing Brain (concept transfer, not code transfer)

Reference examined (private): `SLADZARI/dementor_lab` (`src/core/graph.mjs`, `src/core/model.mjs`, `src/ui/brain-layout.mjs`, `src/ui/brain-constructor.mjs`). **Do not copy private source files into this public repository without a separate permission and licensing decision.**

## Reusable design principles
- Typed node families and explicit edge contracts.
- Validate every new connection before activation.
- Graph with legible routing, coordinates, branching, and fallback paths.
- A scenario should expose its triggering event, intermediary state, response, and impact.
- An unused / unconnected construct is visible as an incomplete hypothesis, not silently "fixed".
- Explanations must show how an input changes a downstream outcome.

## Necessary differences at country scale
| Game Brain | Global analytical graph |
| --- | --- |
| Trigger / State / Impulse / Reaction / Control / Ability | Signal / Event / Indicator / Actor / Hypothesis / Impact / Forecast / Discussion |
| Deterministic turns and approved effects | Measured outcomes, uncertain influences, contested causal mechanisms |
| DAG and strict rejection of cycles | Real feedback loops allowed, but scenario simulation unfolds time steps into a DAG |
| Branch with scripted response | Alternative hypotheses and scenario branches with explicit assumptions |
| Numeric state of a character | Country/time/population-specific measurements, never invented universal state |
| Can execute a known transition | Only simulate transitions when calibrated/assumed model is explicitly displayed |

The game Brain is a conceptual reference, not the source of observational truth or country forecasts. The public graph engine should be built separately with open licenses.

## Graph rules
- Epistemic types: `observed_relation`, `proposed_cause`, `supported_cause`, `disputed`, `rejected`.
- A causal edge must identify a mechanism, time direction, provenance, and falsification plan.
- Multi-edges permit contradictory claims with distinct authors and evidence.
- Cycles can describe feedback in reality; prediction algorithms must unroll to t+1 to avoid simultaneous self-causation.
- A market-implied price or comment sentiment is NOT a causal explanation by itself.
