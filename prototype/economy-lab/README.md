# Economy Lab / Three.js — experimental macro graph v0.1

**Status: interactive, illustrative model — not an empirical forecast or a simulation of actual national accounts.**

## Run (no build, no new backend)
From the repository root:

\`\`\`sh
python3 -m http.server 8000
# Open http://localhost:8000/prototype/economy-lab/
\`\`\`

A modern browser with WebGL and internet access to **pinned** \`three@0.186.1\` (jsDelivr) is required for 3D. If Three.js or WebGL fails, all simulation controls, comparison chart and ledger panels still work. No API key, registration or proprietary game repository required.

## UI
- **Countries:** Poland, Germany and Norway, real geographical labels but **fictional** energy/cash quantities.
- **Periods:** Q1–Q8; no shock, supply shortfall in Norway, domestic supply disruption in Germany, or joint shock.
- **Policy slider:** fraction of simulated tax receipts devoted to reducing future energy demand. The efficacy coefficient is a hypothesis, explicitly stored in the fixture.
- **3D graph:** country anchors and layer nodes (energy served, output index, reserves, treasury). Trade arcs have explicit direction, capacity and modeled flow; click them for capacity/assumption.
- **Click / keyboard:** click 3D country, metric, route or shock; independently select country from buttons and dropdown for non-3D/keyboard use.
- **Comparison:** baseline **with the same policy** versus selected shock; no guessed probability.
- **Trace panel:** source/destination of energy, tax inflow, services spending, investment and effect on next quarter.

## Model transitions and invariants

Every quarter, for each country \`i\`:

1. **Available local energy** \`P_i(t) = capacity_i × (1 − event_loss_i(t))\`.
2. **Effective demand** \`D_i(t) = base_demand_i × (1 − energy_efficiency_i(t))\`.
3. **Constrained trade:** exporter sells no more than production surplus and route capacity; importer buys no more than its shortage. Simplified priority order stands for hypothetical contracts, not optimization.
4. **Reserve draw:** only up to actual stored energy. An energy deficit reduces served demand, not magically created stock.
5. **Physical accounting**:
   \`production + imports + reserve_draw = consumed + exports + reserve_charge + curtailed\`.
   Storage state:
   \`reserve_end = reserve_start − reserve_draw + reserve_charge\`.
6. **Industrial output index:** \`100 × max(0, 1 − sensitivity × unserved_fraction)\`. This is a **sensitivity scenario**, NOT calculated GDP or econometric causation.
7. **Illustrative taxes:** \`tax_base × output_index / 100\`.
8. **Cash constraints:** pay public-services commitments as far as available funds allow; investment cannot exceed remaining cash or the policy budget.
   \`treasury_end = treasury_start + taxes − public_services_paid − investment\`.
   Unpaid planned services are shown, never hidden.
9. **Lagged policy response:** \`efficiency(t+1) = min(20%, efficiency(t) + 0.002 × investment(t))\`. This coefficient is an **arbitrary demo assumption**. A fiscal policy changes future demand, not current energy stock.
10. **Audit:** positive balances, domestic reserve constraints, finite routes, equal total imports and exports, and exact ledger conservation.

Feedback loops are implemented **across time steps**, not instantaneous circular equations. The three countries and formulas are a minimal toy system, not national input-output tables.

## Graph object semantics and evidence
- Country anchors: real entity IDs; data fields are entirely synthetic.
- Metric nodes: \`energy_served\`, \`production_index\`, \`treasury\`, \`reserve\`, with an explicit unit and time quarter.
- Links: \`modeled_trade_flow\`, \`scenario_shock\`, \`modeled_causes\` and \`model_accounting\`. None is promoted to an empirical \`supported_causal_effect\`.
- To avoid false provenance, links to the [EU gas case](../../data/cases/eu-gas-transition-2021-2026.json) are **context references only**. The model does not ingest those quantities or derive its assumptions from them.
- Country rights, migration, monetary policy, trade contracts, private-sector credit, and demographics are not modeled in v0.1.

## What carries over from Dementor Live (principles only)
Inspired by the private game-world design and its tested resource/treasury handling:
- Physical quantities have one accounting owner, never duplicated between storage and transport.
- Payment commitments need backing; unavailable resources block production.
- Events transition state through explicit rules, with replayable steps.
- Scenarios are conditional and branch from an identical starting state.
- Interaction exposes *why* a system state changed.

**No private game code was copied or published.** This is a clean independent research experiment.

## Quality gate
\`\`\`sh
node --test tests/economy-lab.test.mjs
node --check prototype/economy-lab/main.mjs
\`\`\`

Tests verify deterministic replay, the timing of shocks, comparison baseline, trade balances, reserve bounds, cash conservation, no hidden money creation and invalid inputs. Browser usability, WebGL rendering across devices and numeric scientific calibration remain separate unverified gates until tested.

## Next steps, in order
1. **Validation / data model:** connect World Bank/Eurostat/ENTSO-E series with transparent units, vintages and national source coverage; replace fictional parameters only when each has a documented mapping.
2. **Domain structure:** extend to households, firms, government, foreign sector and banking with stock-flow consistent transaction matrices, preserving sector budgets; no aggregate output proxy marketed as GDP.
3. **Trade and energy:** add multiple commodities, imports/exports and finite bottlenecks. Compare against historical backtesting windows, stress-test assumptions.
4. **Scenarios:** show sensitivity intervals and outcomes; backtest forecast resolution and calibration before publishing probabilities.
5. **Rendering:** semantic 3D zoom and filtering for more countries; retain a text/table alternative and 2D map for orientation. Three.js is a viewport, never the data authority.

Official Three.js installation and controls: https://threejs.org/manual/pages/installation.html · https://threejs.org/docs/pages/OrbitControls.
