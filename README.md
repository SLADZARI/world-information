# World Information — Global Causal Observatory

**Open research laboratory for world events, country environments and traceable causal analysis.**

Status: **concept + working synthetic HTML prototype**. No live country data, forecasts or prediction markets are connected. Dementor Tab is an existing separate game and is **not** the name of this platform.

## Первые реальные графы — исторические исследования

- **[Открыть исследовательский борд](prototype/research-board.html)** — три исследовательских истории; для взаимодействия скачайте HTML и откройте локально.
- [Binance 29–30 октября 2026: расследование и реакция рынков](stories/2026/binance-incident-2026-10.md) · [JSON graph](data/cases/binance-incident-2026-10.json)
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
