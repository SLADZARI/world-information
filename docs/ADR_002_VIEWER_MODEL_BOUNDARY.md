# ADR-WI-002 — Evidence, simulations and browser rendering remain separate

**Status:** integration-candidate, 2026-10-31. Supplements `docs/ARCHITECTURE.md` and `docs/ECONOMY_ENGINE_THREEJS.md`.

The canonical research graph lives in reviewable JSON with stable IDs, source provenance, a dated claim and typed, directional relationships. It is **not** a numeric economic solver. Three.js/2D are interchangeable projections. Never infer causation from a compelling animation or spatial layout.

The synthetic Economy Lab has a pure transition function, fixtures, timed shocks, audit ledgers and scenario snapshots. It is useful to test conservation rules and *conditional* responses. Its fictional coefficients and initial balances are **not** country facts. It must not receive real-indicator inputs until a reviewed mapping records units, geography, vintage, model calibration and baseline uncertainty.

Pipeline:
```
external source -> reviewed record -> claim -> directed relation -> 2D / 3D evidence view
                                                 |
                                        reviewer-approved mapping (NOT IMPLEMENTED)
                                                 v
synthetic assumptions -> pure transition -> scenario snapshots -> 3D and 2D model view
```

Release controls:
- Source links, legal status and alternative hypotheses remain visible when an edge is clicked.
- Multi-market co-movement is a candidate to research, never automatic causal proof.
- Derived historical baselines cannot be consequences of newer political events.
- Public Pages only receives pre-reviewed static assets from an allow-list; no unreviewed ingestion or private user submissions.
- Keep an accessible textual relationship list when WebGL is absent.
- Save future scenario edits as explicitly labeled *branches*, never overwrite source observations.
- A first-time visitor must distinguish a measured result, untested mechanism and a synthetic simulation before following any link.
