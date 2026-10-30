# Free / open / free-tier API catalog (research snapshot: 2026-10-30)

This is a **prioritized selection, not every API worldwide**. "Free" refers to a documented free tier, not guaranteed unrestricted or commercial reuse. Provider documentation linked below is controlling. Tier status, quotas, schema and license may change. **No credentials are stored here.**

| ID | Domain | Provider / reference | Access | Example / entrypoint | Caveats | Priority |
|---|---|---|---|---|---|---|
| worldbank | macro, demographics | https://datahelpdesk.worldbank.org/knowledgebase/articles/889392 | No key | `https://api.worldbank.org/v2/country/PL;DE/indicator/NY.GDP.MKTP.CD?format=json` | Series annual, revisions, country codes and units | P0 |
| eurostat | macro, migration, energy | https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api | No key, free | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp?format=JSON` | Most recent revision only, no native data vintages | P0 |
| ecb | currencies, financial indicators | https://data.ecb.europa.eu/help/getting-data-web-services-sdmx-0 | Open SDMX | https://data-api.ecb.europa.eu/service/data/EXR | Frequency/transformations and metadata vary | P0 |
| oecd | socioeconomic comparisons | https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html | Free SDMX, terms and rate limiting | OECD Data Explorer API builder | Comparability and subgroup definitions | P0 |
| gdelt | global news signal discovery | https://www.gdeltproject.org/data.html | Open datasets and query services | GDELT 2 event and GKG exports | Media reports ≠ confirmed events; duplicate syndication and language bias | P0 |
| usgs | geophysics | https://earthquake.usgs.gov/fdsnws/event/1/ | Public | `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&endtime=2024-01-02&minmagnitude=6` | Use GeoJSON summary feeds for real-time; event revisions | P0 |
| nasa-eonet | natural events | https://eonet.gsfc.nasa.gov/docs/v3 | Public | `https://eonet.gsfc.nasa.gov/api/v3/events?limit=10` | Source events may have imprecise onset/end | P0 |
| gdacs | disasters | https://www.gdacs.org/gdacsapi/swagger/index.html | Public events API/feeds | https://www.gdacs.org/feed_reference.aspx | Alert priority not actual observed loss | P0 |
| crossref | science evidence metadata | https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication | Public, no key; polite pool recommended | `https://api.crossref.org/works?query.bibliographic=energy&rows=3` | Works metadata is not peer review of causal claims; concurrency limits | P0 |
| owid | long-run datasets | https://docs.owid.io/projects/etl/api/chart-api/ | Chart CSV and metadata, no key | `https://ourworldindata.org/grapher/life-expectancy.csv` | Each chart may inherit distinct upstream source rights | P0 |
| uncomtrade | trade volumes | https://uncomtrade.org/docs/subscriptions/ | Preview without key; free basic key | https://comtradeapi.un.org/public/v1/preview/C/A/2023/8/156/0/0 | Free basic max 500 calls/day, record caps and redistribution terms | P1 |
| eia | energy | https://www.eia.gov/opendata/ | Free registration/key | https://api.eia.gov/v2/ | License and frequency vary per series | P1 |
| firms | fire hotspots | https://firms.modaps.eosdis.nasa.gov/api/map_key/ | Free MAP_KEY | https://firms.modaps.eosdis.nasa.gov/api/ | 5000 transactions per 10 min; hotspot ≠ damage | P1 |
| copernicus-cds | climate | https://cds.climate.copernicus.eu/en/how-to-api | Free account / token | https://cds.climate.copernicus.eu/api | Product-specific licenses, asynchronous large downloads | P1 |
| noaa-cdo | weather observations | https://www.ncei.noaa.gov/cdo-web/faq | Free registration/token | https://www.ncei.noaa.gov/cdo-web/webservices/v2 | Site/station coverage and changes | P1 |
| open-meteo | climate/weather context | https://open-meteo.com/ | No key, free for non-commercial | https://archive-api.open-meteo.com/v1/archive | 10k requests/day free non-commercial; commercial access paid; CC BY 4.0 attribution | P1 |
| openalex | science research networks | https://help.openalex.org/access/pricing/ | Free casual calls, optional free key | https://api.openalex.org/works | Daily free usage budget ~$1; higher use paid | P1 |
| ucdp | conflict events | https://ucdp.uu.se/apidocs/ | Free token requested by email | https://ucdpapi.pcr.uu.se/ | 5k API calls/day; token approval, free downloadable CC BY 4.0 datasets | P1 |
| fred | financial and macro series | https://fred.stlouisfed.org/docs/api/fred/v2/api_key.html | Free registered API key | https://api.stlouisfed.org/fred/ | Third-party data rights and vintage metadata vary | P1 |
| imf | balance of payments and macro | https://data.imf.org/en/Resource-Pages/IMF-API | SDMX API, some discovery/account friction | IMF API explorer | Series and access rules must be validated per dataset | P1 |
| reliefweb | humanitarian reports | https://apidoc.reliefweb.int/ | Free with approved appname | https://api.reliefweb.int/v2/reports | Appname approval and article copyright retained by originator | P1 |
| polymarket | prediction-event metadata | https://institute.polymarket.com/data | Public Gamma API; read-only for this project | `https://gamma-api.polymarket.com/markets?active=true&limit=100&offset=0` | Contract price ≠ objective probability; terms/jurisdiction; do not execute trades | P2 |
| metaculus | forecasting questions | https://www.metaculus.com/api/ | Auth required, restricted by account | https://www.metaculus.com/api/ | Commercial use requires agreement; AI training/evaluation requires permission; some community aggregations unavailable | P2 |

## Initial ingestion policy
1. Source discovery cannot create automatically verified causal claims.
2. Ingest raw observations to a quarantined staging area with IDs, timestamps, provenance and license metadata.
3. Normalize ISO country, subnational IDs, units, and status; deduplicate syndicated copies.
4. Evidence-review workflow must approve any causal edge; unreviewed signals are never automatically published as facts.
5. Store source URL and digest with timestamp and extraction methodology. Respect API cache TTL and terms.
6. Record outages, API rate-limit responses, publication delay and schema changes.
7. Do not republish restricted article texts or sensitive identifiers.
8. For comments/markets preserve question wording, observation timestamp, trading state and sampling limitations.

## MVP integration order
**Wave 1**: World Bank + Eurostat + USGS + NASA EONET + two historical fact-checked case graphs. **Wave 2**: GDELT / EIA / UN Comtrade after permissions and ingestion QA. **Wave 3**: forecasting and discussion overlays after moderation and legal review.

## State of implementation
The initial historical case graphs in `data/cases/` are manually curated from linked sources; **they are not the result of running any of these APIs live**. API adapters and continuous data refresh are a separate implementation stage.
