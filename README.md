# World Information — Global Causal Observatory

**Open research laboratory for world events, country environments and traceable causal analysis.**

Status: **local-first research demos with source-linked historical records and a separate synthetic model**. No live ingest, account system, financial forecasts or prediction markets are connected. Dementor Tab is an existing separate game and is **not** the name of this platform.

## Local-first launch · one entry point (stacked integration candidates)

- **[Open application home](index.html)** (run through a local HTTP server) — entry to six workspaces.
- **[Country Relations Explorer](prototype/country-relations/)** — choose any two of 249 country/area codes and explore **separately sourced bilateral facts** (treaties, trade, investment, sanctions, border settlements, migration, science, society) alongside *indirect common graph topics*. Pilot: 9 DE–PL + 1 US–RU source-attributed records, all **review_required**; no alliance/conflict score or inferred dispute. [Registry contract](docs/BILATERAL_REGISTRY.md) · [Comparison methodology](docs/COUNTRY_RELATIONS_MVP.md).
- **[Digital country directory](prototype/digital-country-catalog.html)** — 249 ISO country/area entries: 4 preliminary profiles, 3 queued, 242 unresearched. The source-linked observations are **review_required**, not scientifically approved causal effects.
- **[Archived Market Observatory](prototype/markets/)** — separate timestamped intraday reports and secondary session-close snapshots, not real-time or exchange-certified.
- **[2D evidence board](prototype/research-board.html)** — **7** curated cases, filters, directed edges, primary references and alternative claims.
- **[Three.js Poland evidence viewer](prototype/poland-economic-3d/)** — source-backed 3D graph; observation and hypothesis are not the same.
- **[Three.js Economy Lab](prototype/economy-lab/)** — separate deterministic and **synthetic** energy/trade/treasury scenario model (NOT a national economic forecast).
- **[Local startup, CI and GitHub Pages release instructions](docs/LOCAL_FIRST_RELEASE.md)**.
- **[Contributor and AI standards](AGENTS.md)** · [Research charter](docs/PROJECT_INSTRUCTIONS.ru.md) · [ChatGPT Project prompt](docs/CHATGPT_PROJECT_PROMPT.ru.md) · [Digital ecosystem methodology](docs/SOCIAL_DYNAMICS_DIGITAL_ECOSYSTEM.ru.md) · [Market model](docs/MARKET_OBSERVATORY.md).

For this unmerged bilateral-registry PR, first checkout `feat/bilateral-evidence-registry-v1` after cloning. On macOS: double-click `run-local.command` from that checkout, or open Terminal in the repository root and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# http://127.0.0.1:8000/
```

All six views are served locally without logins, server database, npm install, payments or live API keys. The Three.js 3D canvases load **pinned three@0.186.1 from jsDelivr**, and need internet connectivity + WebGL; the 2D board, country comparison, country catalog, market archive and simulation tables remain inspectable without 3D.

Validation: `node tools/validate_bilateral_registry.mjs && node tools/sync_research_board.mjs --check && node tools/check_research_board.mjs && node --test tests/*.test.mjs && node tools/build_site.mjs && node tools/check_public_demo.mjs dist`.

**Release boundary:** bilateral records are `review_required`; the manual Pages workflow refuses them until independently approved and source reuse is reviewed. Market observations are secondary reports, digital country profiles are staging/review-required and the ISO-3166 registry has unresolved commercial-rights caveats; do not treat this integration as publication approval. A public repository is not the same as a published site. The Pages workflow is manual and gated to `main` after review. No automatic web deployment from feature branches.

## Poland: linked political and economic graph (GUS / MSWiA / NBP)

The country case is now a **real evidence-linked cross-domain graph**, not only a narrative:

- [**3D Three.js graph**](prototype/poland-economic-3d/index.html) — interactive politics → migration → labour / vacancies → investment paths. Use the server instructions below; every node and edge opens its underlying source / falsification record.
- [**2D research board**](prototype/research-board.html?case=poland-policy-economy-2026-10) — same reviewed graph, static HTML snapshot; download the board HTML for standalone browsing.
- [Economic investigation](stories/2026/poland-economy-causal-links-2026-10.md) · [derived graph JSON](data/cases/poland-policy-economy-2026-10.json) · [source overlay](data/overlays/PL-policy-economy-2026-10.json).
- [Graph composer](tools/build_poland_economy.mjs) deterministic versioned merge of the judicial dispute and migration case nodes with GUS/NBP indicators; [tests](tests/poland-economic-links.test.mjs).

**Observed (not caused by 30 Oct political events):** GUS workers 1,067.0k (Mar 2025) → 1,152.7k (Mar 2026); vacancies 100.2k Q1 → 98.7k Q2; H1 2026 business investment PLN 100.2bn, +13.7% YoY constant prices; NBP FDI 2023 PLN 125.7bn → 2024 PLN 56.5bn (historical series). Visa **issuances** are a different statistic from workers already working. All prospective influence is tagged as hypothesis, not measured effect.

**3D local start** from repository root (Three.js CDN + WebGL needed):

```sh
python3 -m http.server 8000
# open http://localhost:8000/prototype/poland-economic-3d/
```

**Source/logic validation:** `node tools/build_poland_economy.mjs --check` and `node --test tests/poland-economic-links.test.mjs`. GitHub CI also checks the exact JSON snapshot on the 2D board.

## Poland: country environment, legal status and contested political events (30 October 2026)

- [Country environment (source-linked country overview)](data/countries/PL/overview-2026-10-30.json) — institution, migration and court-proceedings layers with future follow-ups.
- [Constitutional Tribunal crisis, Tusk and Nawrocki](stories/2026/poland-institutions-2026-10.md) · [graph](data/cases/poland-institutional-crisis-2026-10.json).
- [Migration policy: enacted laws vs proposals](stories/2026/poland-migration-2026-10.md) · [graph](data/cases/poland-migration-policy-2025-2026.json).
- [Policy status and affected populations](data/policies/PL-2026-10-30.json) · [policy schema](schemas/policy-register.schema.json) · [country product specification](docs/POLAND_COUNTRY_LAYERS.md).
- [Interactive research board with both cases](prototype/research-board.html). Both cases are source-attributed snapshots, **not legally conclusive judgments or automated policy advice**.
- `node tools/validate_poland.mjs` checks provenance, legal status and the absence of an invented causal link between the unrelated civil case and tribunal conflict.

## Первые реальные графы — исторические исследования

- **[Открыть исследовательский борд](prototype/research-board.html)** — семь исследовательских историй; для взаимодействия скачайте HTML и откройте локально.
- [Binance 29–30 октября 2026: расследование и реакция рынков](stories/2026/binance-incident-2026-10.md) · [JSON graph](data/cases/binance-incident-2026-10.json)
- [Технологические рынки и конкурирующие причины падения, октябрь 2026](stories/2026/ai-tech-selloff-2026-10-30.md) · [JSON graph](data/cases/ai-tech-multimarket-2026-10-30.json)
- [Газовая перестройка ЕС, 2021–2026](stories/2026/eu-gas-transition-2021-2026.md) · [JSON graph](data/cases/eu-gas-transition-2021-2026.json)
- [Красное море / Суэц / Панама, 2023–2024](stories/2026/maritime-corridors-2023-2024.md) · [JSON graph](data/cases/maritime-corridors-2023-2024.json)
- [Проверенный каталог бесплатных API](docs/API_CATALOG_2026.md) — доступ, квоты, ограничения и порядок интеграции.

**Это не live-мониторинг:** документированные показатели сосуществуют с явно отмеченными гипотезами; причинные эффекты и рыночные прогнозы не выдумываются. События за 2023–2024 годы — исторические, несмотря на дату исследовательского обзора 2026.

**Сбор сигналов в staging:** `python tools/ingest_open_apis.py --source eonet --limit 15` или `--source usgs`, `--source worldbank`. Результаты попадают в исключённую из Git папку `data/incoming/` со статусом `review_required`; автоматической публикации причинных стрелок нет.

## Try the graph board

Open [prototype/board.html](prototype/board.html) as a raw/downloaded HTML file in your browser. No build, dependencies, login or network needed. Switch between Poland/Germany, audience lenses, time, categories, layered views and alternative scenarios. Click a node or arrow to inspect its explanation. **All example events and relations are fictional, not empirical findings.**

## Read the product spec

- [Vision and user lenses](docs/PRODUCT_VISION.md)
- [JTBD, CJM and user research hypotheses](docs/CJM_JTBD_RESEARCH.md)
- [Graph board display specification](docs/GRAPH_BOARD_SPEC.md)
- [Storage layout and evidence traceability](docs/STORAGE_AND_TRACEABILITY.md)
- [Requirements traceability matrix](docs/REQUIREMENTS.md)
- [Graph inspiration, with independent implementation](docs/DEMENTOR_ADAPTATION.md)
- [Source catalog and constraints](docs/SOURCE_CATALOG.md)
- [Analysis methodology](docs/METHODOLOGY.md)
- [Story template](templates/story.md)

## Data contracts

- [JSON Schema](schemas/world-graph.schema.json)
- [Synthetic graph example](data/examples/world-graph.demo.json)
- [Semantic validator](tools/validate_graph.py) — run `python tools/validate_graph.py`
- GitHub Actions performs offline fixture integrity checking on data/schema changes.

## Participate

Read [CONTRIBUTING.md](CONTRIBUTING.md). Open an issue for a signal, or submit a PR with a sourced analysis. Evidence and controversial hypotheses remain distinguishable. Attribution and human review are required; AI summaries do not count as independent evidence.

## Principles

- **Traceability**: source → signal → claim → causal relation → story/forecast.
- **Comparability**: explicit indicator units, country, group, and time window.
- **Plurality**: conflicting explanations and missing evidence remain visible.
- **Time**: event date, publication, collection, knowledge-as-of and forecast horizon are separate.
- **Safety**: no doxxing, unsafe personal records, automated truth scores or wagering in the platform.

### Licensing

No license has yet been selected. Public visibility does **not** itself grant permission to copy/reuse the code, content or datasets. Select a repository license and document third-party rights before accepting external contributions or redistributing data.
