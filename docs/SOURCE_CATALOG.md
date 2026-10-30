# Proposed data sources & integration constraints

All are **candidates**. None is connected by this PR. Scraping and reuse require individual license and rate-limit review.

| Need | Source & documentation | Data family | Caveat |
|---|---|---|---|
| Country macro | World Bank Indicators V2 https://datahelpdesk.worldbank.org/knowledgebase/articles/889392 | macro indicators and historical series | publication lag, country comparability |
| Official macro | IMF SDMX https://data.imf.org/en/Resource-Pages/IMF-API | balance of payments, prices, debt, forecasts | series vintages and rate limits |
| Well-being | OECD Well-being Monitor https://www.oecd.org/en/data/tools/well-being-data-monitor.html | population group outcomes, indicators | multidimensional, not universal ranking |
| Migrant experience | OECD Integration Indicators https://www.oecd.org/en/data/dashboards/indicators-of-immigrant-integration.html | subgroup integration metrics | not a substitute for country-specific immigration law |
| Human development | UNDP HDI https://hdr.undp.org/data-center/human-development-index | education / health / incomes | composite excludes many important dimensions |
| Political institutions | World Bank WGI https://www.worldbank.org/en/publication/worldwide-governance-indicators | perception-based governance estimates | uncertainty, not definitive ratings |
| News-based discovery | GDELT https://www.gdeltproject.org/ | multilingual mentions and event leads | media attention and coding artifacts ≠ real-world event rate |
| Political disorder | ACLED methodology https://acleddata.com/methodology/acled-codebook | coded conflict events | source coverage, geolocation precision, usage rights |
| Prediction discussions & markets | Polymarket Gamma + Data APIs https://institute.polymarket.com/data | contracts, outcome criteria, historical prices, liquidity | price is traded estimate, not objective probability; jurisdiction/terms |
| Forecast questions | Metaculus https://www.metaculus.com/api/ | question metadata / conditional forecasting | auth, restricted fields and commercial/AI use require permission |

## Provider policy for predictions / comments
- Display read-only external **question** cards with exact resolution criteria, market lifecycle (`active`, `closed`, `resolved`), source platform, platform URL, `observed_at`, price or consensus and methodology.
- Show inactive and resolved items as **history**, not as live opportunities. If user chooses "active", require `status=active`, a valid observation timestamp, and eligibility of terms; missing means `unknown`.
- A price of 0.63 can be labelled "quoted YES price 0.63" and, with caveats, an **implied market estimate around 63%**; bid-ask spread, fees, slippage, liquidity, and manipulative trading mean it is not ground truth.
- Platform comments, Reddit threads and internal discussions can supply leads/arguments, not verified event facts. Store comment URL, timestamp, claim references, moderation and sampling limitations; avoid raw personal-data archives.
- Aggregated sentiment and automated "support/opposition" scores require sampling methods, representativeness caveats, spam/bot checks, and auditability; do not present them as population polling.
- External market access, links and data processing must comply with local law, platform terms, and privacy requirements. No deposits, trading or wagering inside this platform.

## Ingestion adapter contract
`fetch → source_snapshot(with retrieved_at + license + checksums) → normalize → dedupe → classify → human/algorithm review → publish`. Preserve original units, the sampling frame, source update date and source confidence/precision. Maintain per-provider failure and freshness diagnostics.
