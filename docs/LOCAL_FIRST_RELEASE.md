# World Information — LOCAL-FIRST / DEMO release playbook

**State:** integration candidate, not a production causal engine. Source branch: `feat/local-first-demo-integration` (until reviewed). Owner/reviewer and browser QA are required before publishing.

## G3: model boundaries
- **Evidence graph**: documented observations, claims, alternatives and typed directed relations under `data/cases/*.json`; `data/case-registry.json` is the case registry.
- **2D viewer**: `prototype/research-board.html` embeds an exact, deterministic, **offline** snapshot of the 7 reviewed cases. Update snapshots with `node tools/sync_research_board.mjs`.
- **3D evidence viewer**: `prototype/poland-economic-3d/` reads one checked Poland graph from the local same-origin JSON. Three.js is a *projection*, not a data authority.
- **3D Economy Lab**: `prototype/economy-lab/` computes a deterministic but **fictional** PL–DE–NO economic scenario. It does **not** calibrate itself from current country indicators. Never imply that policy news caused historical investments.
- **Country catalog (PR #8 stacked on PR #7)**: `prototype/digital-country-catalog.html` is a self-contained read-only 249-country/area directory. Only 4 preliminary research profiles have measurements, 3 are queued, 242 are explicitly unresearched. Its canonical baseline and profiles remain research staging under `data/research/` and `data/catalog/`. Those source files are NOT part of the public site bundle; only the clearly labelled browser preview is staged. ISO and other upstream data rights require owner review.
- **Country relations lens (same seven reviewed cases)**: `prototype/country-relations/` compares two ISO country/area codes. Its graph is a projection of explicit country tags and source-linked graph edges, not a real bilateral foreign-relations registry. A multi-country event is *common context*, and `disputed` on an internal relation is never an interstate disagreement. `tools/build_country_pair_options.mjs --check` keeps 249 country choices synchronized.
- **Market archive (PR #3)**: `prototype/markets/` reads one dated batch of secondary market observations; quote-report timestamps and session-close calculations stay distinct. Not a live quote feed or causal trading engine.
- **Contributor instructions (PR #6)**: root `AGENTS.md`, ChatGPT project prompt and research charter carry review and traceability gates.
- **Event detector**: `tools/detect_market_events.mjs` flags candidate anomalies; no automatic causal identification or licensed live market feed.

## G4: local startup (macOS, Windows, Linux)
Prerequisites: a modern Chromium/Firefox/Safari browser, Python 3 to serve files, Node.js 22 for tests only. Internet + WebGL are required **only for 3D Three.js** (pinned `three@0.186.1` CDN). No database, backend, API credentials or paid services.

```sh
git clone https://github.com/SLADZARI/world-information.git
cd world-information
git switch feat/local-first-demo-integration
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000/**. On macOS, alternatively double-click `run-local.command` (or run `bash run-local.command`); it opens the browser and binds to loopback only. Stop via Control-C. On Windows, `py -m http.server 8000 --bind 127.0.0.1` also works. If the port is busy, choose another port and use the corresponding URL.

A direct double-click of the HTML file is not sufficient for the 3D modules/JSON fetch because browsers restrict `file://` imports. The dependency-free 2D research board can be opened offline as a file.

## G5: smoke and deterministic test gates
```sh
python3 tools/validate_graph.py
python3 tools/validate_research.py
python3 tools/validate_digital_ecosystem.py
python3 tools/build_digital_country_catalog.py --check
python3 -m unittest discover -s tests -p 'test_digital_ecosystem.py'
python3 -m unittest discover -s tests -p 'test_digital_country_catalog.py'
python3 -m unittest discover -s tests -p 'test_open_apis.py'
node tools/check_board.mjs
node tools/sync_research_board.mjs --check
node tools/check_research_board.mjs
node tools/market_registry.mjs
node tools/check_country_catalog.mjs
node tools/build_country_pair_options.mjs --check
node tools/validate_poland.mjs
node tools/build_poland_economy.mjs --check
node --test tests/*.test.mjs
node tools/check_public_demo.mjs
node tools/build_site.mjs
node tools/check_public_demo.mjs dist
```

The integrated CI workflow executes all gates on push/PR; the two domain-specific workflows provide additional focused checks for catalog and ecosystem changes. The Pages artifact uses an explicit allow-list: homepage, six browser prototypes, seven reviewed case JSON files, dated market archive, preliminary self-contained country catalog and referenced documents/stories. The public demo is **not** a release of the staging research baseline or country profile source JSON. No staging/API raw dumps or repository internals are published. `dist/` is excluded from Git.

**Manual browser QA still required:** Chrome/Firefox/Safari desktop and mobile; open all six workspaces; change a case, country, time and status filter; inspect a relation's source and alternatives; check keyboard list fallback; in 3D drag/zoom/select nodes; in Economy Lab change shock, policy and quarter, verify baseline and visible conservation ledger. Verify two-country selector and evidence empty-state, the 249-country search/filter counts (4 partial, 3 queued, 242 unresearched), the market viewer's secondary-vs-intraday distinction, zero JS console errors and fallback with WebGL/CDN blocked. Capture browser, OS, exact SHA and failed cases in the PR.

## G6–G8: public demonstration through GitHub Pages

1. Review PR #1 foundation, then the integration PR #5 (which imports the exact head snapshots from PR #3, #6, #7 and #8), after passing CI and independent browser QA. Avoid separately merging duplicate code paths without conflict review; retain PR authorship/provenance and close superseded lanes only after accepted consolidation. Do not force/auto-merge.
2. Repository owner: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. In **Actions → Publish approved static demo (manual)** choose `main` and **Run workflow**. Feature branches cannot deploy by this workflow.
4. Confirm the deployed URL shown in the workflow's `github-pages` environment. Standard project site address is expected to be `https://sladzari.github.io/world-information/`, but it is **not confirmed active** until Pages reports deployment.
5. Open each view through the real HTTPS project path, inspect Network and Console, test the CDN and mobile view. Record SHA and explicit rollback (re-deploy prior approved commit).

GitHub Pages hosts **public static HTML/JS/JSON**; it does NOT provide a private dataset, authentication, server databases, persistent user edits, live Python, real-time ingestion or API proxy. All published cases are accessible to every visitor. The absence of a `LICENSE` means public visibility does not grant reuse rights automatically; owner must separately choose code/data/content licenses and validate source redistribution before an open-source release.

**Current gate:** integrated code under review; 4 partial catalog profiles remain review_required, local HTTP/browser test pending. GitHub Pages settings, deployment and external browser QA are not yet verified.
