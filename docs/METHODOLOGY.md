# Methodology: global signal → causal investigation

## Evidence hierarchy
1. Direct measurements and primary records (with collection method and limitations).
2. Official reports and peer-reviewed studies (not presumed infallible).
3. Reputable secondary reporting (multiple independent sources preferred).
4. Social posts, anonymous testimony, and machine-generated summaries: **unverified leads**, not established facts.

## Record types
- **Signal**: an unusual observation with a timestamp and provenance.
- **Event**: a bounded occurrence, possibly supported by multiple signals.
- **Entity**: an organization, facility, market, place, mechanism, or relevant institution.
- **Claim**: falsifiable statement with evidence for and against.
- **Hypothesis**: proposed explanation with alternatives and predicted observable implications.
- **Impact**: measured change in a defined indicator and time window.
- **Forecast**: time-stamped statement with horizon, metric, baseline, and later outcome.
- **Story**: readable synthesis that references the above.

## Causal analysis
Time order is necessary but insufficient for causation. Always assess baseline, competing causes, reverse causation, confounding variables, measurement changes, and selection effects. Prefer event studies with comparison groups and explicit time windows where data permits. A network edge must have a relation type and evidence reference; **association is not causation**.

Suggested relation types: `precedes`, `associated_with`, `hypothesized_to_affect`, `supported_causal_effect`, `contradicts`, `depends_on`. Never automatically promote association to supported causation.

## Forecast hygiene
Timestamp forecasts before observing the outcome. Define an observable resolution criterion, horizon, and source. Quantified probabilities are optional, but when supplied must be judged on calibration over a series of forecasts, not one outcome. Corrections are append-only where practical; do not silently rewrite old predictions.

## Trust and safety
Public availability is not permission to republish raw personal records. Minimize personal data, avoid operationally sensitive targeting details, and respect data licensing, API conditions, and embargoes. Report uncertainty without false precision. AI-assisted drafts require human verification of every citation and numerical claim.
