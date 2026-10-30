# World Information — LOCAL-FIRST / DEMO release playbook

**State:** integration candidate, not a production causal engine. Source branch: `feat/local-first-demo-integration` (until reviewed). Owner/reviewer and browser QA are required before publishing.

## G3: model boundaries
- **Evidence graph**: documented observations, claims, alternatives and typed directed relations under `data/cases/*.json`; `data/cases/manifest.json` is the case registry.
- **2D viewer**: `prototype/research-board.html` embeds an exact, deterministic, **offline** snapshot of the 7 reviewed cases. Update snapshots with `node tools/sync_research_board.mjs`.
- **3D evidence viewer**: `prototype/poland-economic-3d/` reads one checked Poland graph from the local same-origin JSON. Three.js is a *projection*, not a data authority.
- **3D Economy Lab**: `prototype/economy-lab/` computes a deterministic but **fictional** PL–DE–NO economic scenario. It does **not** calibrate itself from current country indicators. Never imply that policy news caused historical investments.
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
python3 -m unittest discover -s tests -p 'test_open_apis.py'
node tools/check_board.mjs
node tools/sync_research_board.mjs --check
node tools/check_research_board.mjs
node tools/validate_poland.mjs
node tools/build_poland_economy.mjs --check
node --test tests/*.test.mjs
node tools/check_public_demo.mjs
node tools/build_site.mjs
node tools/check_public_demo.mjs dist
```

One CI workflow executes all gates for push/PR. The page bundle uses an explicit allow-list: entry page, browser prototypes, research case JSON and reviewed stories. No staging/API raw dumps or repository internals are published. `dist/` is excluded from Git.

**Manual browser QA still required:** Chrome/Firefox/Safari desktop and mobile; open all three workspaces; change a case, country, time and status filter; inspect a relation's source and alternatives; check keyboard list fallback; in 3D drag/zoom/select nodes; in Economy Lab change shock, policy and quarter, verify baseline and visible conservation ledger. Verify zero JS console errors and fallback with WebGL/CDN blocked. Capture browser, OS, exact SHA and failed cases in the PR.

## G6–G8: public demonstration through GitHub Pages

1. Review and merge the integration PR and its foundation into `main` after passing CI and an independent browser check. Do not force/auto-merge.
2. Repository owner: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. In **Actions → Publish approved static demo (manual)** choose `main` and **Run workflow**. Feature branches cannot deploy by this workflow.
4. Confirm the deployed URL shown in the workflow's `github-pages` environment. Standard project site address is expected to be `https://sladzari.github.io/world-information/`, but it is **not confirmed active** until Pages reports deployment.
5. Open each view through the real HTTPS project path, inspect Network and Console, test the CDN and mobile view. Record SHA and explicit rollback (re-deploy prior approved commit).

GitHub Pages hosts **public static HTML/JS/JSON**; it does NOT provide a private dataset, authentication, server databases, persistent user edits, live Python, real-time ingestion or API proxy. All published cases are accessible to every visitor. The absence of a `LICENSE` means public visibility does not grant reuse rights automatically; owner must separately choose code/data/content licenses and validate source redistribution before an open-source release.

**Current gate:** code under review, local HTTP/browser test pending. GitHub Pages settings, deployment and external browser QA are not yet verified.
