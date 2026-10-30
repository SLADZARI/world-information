# ADR-ECO-001: Three.js macroeconomic causal exploration

Status: **proposed experiment** · 2026-10-30

## Problem
World Information has a source-backed event graph but does not yet make economic stocks, policy choices and cross-border feedback visually explorable. The private Dementor Live game models finite physical items, non-duplicated ledgers and decision responses, but its runtime is not a calibrated model of national economies.

## Decision
Build an **independently authored, pure function** economic scenario kernel with an optional Three.js 3D graph:
- `prototype/economy-lab/core.mjs` (pure deterministic stock-flow transition, reproducible and independently testable);
- `prototype/economy-lab/fixtures.mjs` (synthetic country assumptions and timed event variants);
- `prototype/economy-lab/main.mjs` (UI glue; 3D renderer loaded dynamically and gracefully degraded);
- `prototype/economy-lab/index.html` (human controls, source caveats and accessible comparison);
- `tests/economy-lab.test.mjs` (invariants and timeline checks).

All numbers shown are **fictitious**; real-country labels only express how the graph might be presented once calibrated. The model never silently calls a news feed or rewrites original observations.

## Separation between event graph and model graph
```
Real source -> evidence -> measured indicator -> hypothesis
                                           |
                                           v
                               Proposed calibration mapping
                                           |
                                           v
Synthetic scenario assumption -> model rule -> calculated state
                                           |
                                           v
                                  3D rendering / 2D output
```
Until calibration is approved, the edge from *measured indicator* to *model parameter* is intentionally absent. The 3D scene is a projection of scenario output and can be rebuilt without changing evidence.

## Trace requirements for a model prediction (future)
- scenario ID, branch timestamp, parameter set, source versions, units and spatial/temporal scope;
- engine version, random seed (where relevant), conditions, risk factors and alternative mechanisms;
- observed baseline comparison and explicit computation steps;
- historical forecast backtests, sensitivity and falsification;
- no implicit certainty or country score; all model-calculated outcomes labelled as such.

## Rejected for MVP
- Copying/importing game-private World modules.
- Using large-language-model probabilities as calibrated economic predictions.
- 3D globe or thousands of countries before 3-country usability testing.
- Using news sentiment or prediction-market price as a physical economic input.
- Third-party graph database or paid simulation infrastructure with no demonstrated need.

## Three.js and performance
Official `three` package, pinned **0.186.1**, matches core and addons. Render with capped pixel ratio and low object count; controls rotate/zoom/pan and support keyboard-accessible fallback through DOM. No textures/assets downloaded except Three.js modules. Avoid gratuitous animation or real-time WebGL if hidden; build a conventional 2D map when geographic context would matter more than 3D topology.

## Acceptance criteria (proposed)
- Visual graph changes when slider changes scenario/time/policy.
- Each displayed flow has a route ID, capacity, endpoints and a corresponding ledger entry.
- Every accounting identity and constraint passes tests.
- Baseline has zero delta to itself; controlled branch comparison.
- User can retrieve all same metrics without WebGL.
- Browser QA on desktop/mobile; no console errors; descriptions readable; source disclaimers visible.
- No assertion of macroeconomic forecast validity without external data calibration.
