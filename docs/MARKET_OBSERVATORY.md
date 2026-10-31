# Separate Market Observatory — first US equities snapshot

**Status:** source-linked historical snapshot (US regular session, 30 October 2026). NOT a live exchange feed, confirmed market vendor dataset, trading recommendation or proof of a common AI causal mechanism.

## Why market information must be distinct from stories

A share-price movement is an **observation** of an identified security on a particular market venue, at an exact session and reference price. A headline is a **claim** about what happened; a research story is an **interpretation**. They belong to separate collections:

```
Market: exchange / instrument / session
    ↓
Market observation: session close − prior close, dated and sourced
    ↓                  ↑
Anomaly candidate     Original intraday post (unverified quote time)
    ↓
Analytical event: multiple instruments can be affected by several causes
    ↓
Claim + attribution + competing mechanism
    ↓
Country / industry / company / scenario graph
```

## Implemented
- [US session snapshot 2026-10-30](../data/markets/US/2026-10-30-tech-selloff.json): 7 US stocks, 4 index/sector reference points, **7 original circulating quote claims preserved separately** from **11 closing estimates**.
- [Schema](../schemas/market-observation.schema.json): records define `instrument_id`, `market_id`, `asset_class`, `sector`, timezone, `session_date`, quote `window`, percentage return, reference `price_basis`, `measurement_at` (nullable), `reported_at`, `source_id`, verification status and as-of.
- [Adapter and validator](../tools/market_registry.mjs): enforces exact US session boundaries, no missing sources/tickers, no claim of direct exchange verification from third-party publications, no artificial quote timestamp, and converts **only regular market closes** into anomaly-detection inputs.
- [Existing anomaly engine](../tools/detect_market_events.mjs): fixed thresholds are **candidate flags**, not systemic-risk measurements. This particular US-only set never auto-creates a cross-country cluster.
- [Tests](../tests/market-registry.test.mjs): archived claim vs close, distinct identities, time, sources, no synthetic causal claim.

### Example record: Intel

```json
{
  "instrument_id": "NASDAQ:INTC",
  "window": "regular_close_to_close",
  "session_date": "2026-10-30",
  "measurement_at": "2026-10-30T20:00:00Z",
  "value": -28.58,
  "unit": "percent",
  "price_basis": "prior_regular_session_close",
  "verification_status": "secondary_closing_snapshot"
}
```

The **−31%** circulating percentage is archived *in a different record* with `measurement_at=null` and `verification_status=report_only_time_unverified`. The social post was published before the US session had closed; it must not overwrite the later closing estimate.

### Source quality
- **Primary for fundamentals:** [Intel Q3 2026 IR](https://www.intc.com/news-events/press-releases/detail/1786/intel-reports-third-quarter-2026-financial-results), [Reddit Q3 2026 IR](https://investor.redditinc.com/news-events/news-releases/news-details/2026/Reddit-Reports-Third-Quarter-2026-Results/default.aspx), [Illumina Q3 2026 IR](https://investor.illumina.com/news-releases/news-release-details/illumina-reports-financial-results-third-quarter-fiscal-year-8), [Roblox Q3 shareholder letter / SEC](https://www.sec.gov/Archives/edgar/data/1315098/000162828026068235/ex991-q32026earningsshar.htm).
- **Stock/index moves:** dated [Reuters](https://www.reuters.com/business/nasdaq-futures-tumble-amazon-intel-results-deepen-ai-spending-woes-2026-10-30/), [AP](https://apnews.com/article/a01d3551e794fed1a0c317c20bc3f0a2), [market end-of-day summary](https://weeklytrader.io/losers.php), [ARM price history](https://stockanalysis.com/stocks/arm/history/). Some feed vendors disagree slightly on prices due to revisions, corporate-action adjustments and snapshot basis — do not silently take an average.
- These closing returns are **secondary observations awaiting direct licensed/official EOD verification**, not official exchange-certified bars. Do not republish copyrighted raw feeds without license.

### Why the seven companies cannot be assigned one reason
| Subsector | Observation | Initial non-exclusive hypotheses |
|---|---|---|
| Intel, Arm, Sandisk, Dell | chip, storage and PC-related sells | Intel guidance, PC demand and memory prices; AI capex and sector exposure |
| Reddit | search referral risk, platform profitability | Google's AI Overviews/AI Mode may reduce referrals even while Reddit reports positive net income |
| Roblox | gaming platform, bookings and daily engagement | growth and forward bookings/DAU expectations vs prior year |
| Illumina | genomics instruments/research — **not an AI pure-play** | reported revenue and China geography versus market expectations |

Common broad equity risk-off may have contributed, but requires matched-sector event-study and duration analysis. **Company disclosure and market move are not themselves causal-effect estimates.**

### Recommended future storage architecture (not deployed)

`markets` = market venues, calendars, currencies, sessions, holidays;
`instruments` = ticker history, identifiers (ISIN/FIGI when licensing permits), issuer, listings, corporate actions;
`price_bars` = OHLCV, adjusted/unadjusted source vintage, splits, session, exchange timezone, provider licensing;
`market_signals` = daily return anomalies, standardized 20/60-day volatility, liquidity/volume, controls;
`market_event_links` = attributed links between observations and claims, never one default cause;
`market_exposure_edges` = economic links to country, sector and trade graph with lag/uncertainty;
`prediction_market_questions` = separate forecast-market objects with resolution rules, not equity prices.

Do not blindly cluster non-comparable 24h crypto percentage moves, premarket/regular-session equities and China/US closes. Each requires its own quote window and session alignment.

## Local verification

```sh
node tools/market_registry.mjs
node --test tests/market-registry.test.mjs
```

Further work before calling this a live market monitor: licensed exchange/provider API, source terms review, trading calendars, OHLC corporate-action adjustment, revision-vintages, Z-score detection calibrated to each security, market/sector comparators and historical false-positive testing.
