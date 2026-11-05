# Belarusian migration in Poland: crime, age, denominators, citizenship, Pole's Card, marriages (research staging)

**As of:** 2026-11-05 · **Territory:** PL · **Population:** citizens BY residing in or temporarily present in Poland, with a separate cohort of former BY citizens who naturalized. **Status:** `review_required`. No causal crime effect computed; **do not attribute criminal propensity to national origin**. Canonical data: [BY integration JSON](../../data/research/pl-migration-crime/by-integration-2020-2026.2026-11-05.json).

## 1. Criminal offense types — official primary source

Official MSWiA reply to Sejm query 1117 (indexed original, direct view challenges automated access), selected five Polish Penal Code articles for BY, **Jan 1–Aug 31 only**:

| Art. and offense | 2022 | 2023 | 2024 |
| --- | ---: | ---: | ---: |
| 278 theft | 143 | 184 | 136 |
| 280 robbery | 5 | 2 | 6 |
| 197 rape | 1 | 2 | 0 |
| 148 homicide | 2 | 0 | 0 |
| 204 pimping | 0 | 0 | 0 |

**Provenance:** https://www.sejm.gov.pl/sejm10.nsf/InterpelacjaTresc.xsp?key=DBCKGW&view=2

**Do not:** sum these to all offenses, call them annual numbers, count them as convictions, or divide by total suspects to claim a crime-type distribution: different counting units and unidentified overlaps. These five categories omit common traffic, drug, fraud and document offenses. Official police H1-2026 says drunk-driving, drug possession and theft are most common among *all foreign suspects*, but not specifically Belarus citizens: https://policja.pl/pol/aktualnosci/280366,Pierwsze-polrocze-2026-roku-skuteczne-dzialania-pionu-kryminalnego-Policji.html.

## 2. Number of suspects and denominator audit (2024)

A parliamentary MSWiA series covering KGP + Border Guard reports **1,341 Belarus citizens suspected in 2024** (https://www.sejm.gov.pl/sejm10.nsf/InterpelacjaTresc.xsp?key=DFQJ6A). A police-only compilation, secondary (Migralert referencing KGP), reports **1,122 suspected BY citizens** and **1,610 confirmed offenses** in 2024: https://migralert.pl/podejrzani.php ; https://migralert.pl/stwierdzone.php . These are different metrics/coverage. **No merging or 'correction' until underlying KGP extraction reconciled**.

UdSC / EMN reports approximately **141,000 Belarus citizens holding valid residence documents at the end of 2024**, with visa-only residents, naturalized former Belarus citizens and other classes excluded: https://www.gov.pl/attachment/4ab216a5-4ad8-40b1-98d2-bf94399b0482 .

**Only a crude arithmetic comparator, NOT a population-normalized individual risk:** 1,122 / 141,000 × 1,000 = ~7.96; alternative series 1,341 / 141,000 × 1,000 = ~9.51. The numerator may include short-term visitors or nonresidents, while denominator is end-year documents rather than person-years. These endpoints do not form a true rate or a statistical confidence interval. Full age/sex correction or regional causal DID **not possible yet**.

Age of BY suspects by offense and year: **not found** in verified public material. IWS "Atlas przestępczości" 2023 has *all-nationality* age groups (30–49 ≈52.2% of all suspects) but **must not impute this to Belarus citizens**: https://iws.gov.pl/wp-content/uploads/2025/07/Atlas-7-PL-WERSJA-ELEKTRONICZNA.pdf. NBP immigrant demographics are not offender demographics.

### Request needed from police statistics/KGP/KSIP
Annual 2018–2026 cells: `citizenship=BY`, `resident_in_PL`, `year`, `powiat`, `age_band` (under 18, 18–24, 25–34, 35–44, 45–59, 60+), `sex`, `penal_code_article`, `suspected_distinct_persons`, `confirmed_offenses`, `convicted_persons` (courts), `detection_intensity`, and privacy suppression policy. Need nationality change tracking **only aggregate, no personal identity data**.

## 3. Belarus-to-Poland naturalization and Pole's Card

**Naturalized former Belarus citizens (people acquiring Polish citizenship, all procedures):**

| Year | People | Source |
| --- | ---: | --- |
| 2020 | 2,017 | Rządowa Rada Ludnościowa / MSWiA, table 6.17 |
| 2021 | 2,211 | same |
| 2022 | 3,001 | same |
| 2023 | 4,456 | same |
| 2024 | 5,830 | EMN/UdSC administrative 5,664 + presidential 166 |
| 2025 | 6,506 | European Commission, 2026-07-31 citing MSWiA |

Sources: https://rrl.stat.gov.pl/Files/raporty/sytuacja_demograficzna_polski_20222023_internet_2.pdf ; https://www.gov.pl/attachment/e296ba4d-4fb6-41f5-8297-a9cb3eef9a4b ; https://home-affairs.ec.europa.eu/news/new-migrant-integration-measures-and-statistics-poland-2026-07-31_en .

**Reconciliation warning:** a different published 2024 series reports **5,666** BY acquisitions: https://notesfrompoland.com/2025/08/29/record-number-of-foreigners-granted-polish-citizenship-in-2024/ . Other reports also cite ~4,466 in 2023 and ~2,994 in 2022 vs RRL 4,456 and 3,001. Treat as version / definition conflicts until raw Open Data extracts reconciled. Do not sum mixed snapshots.

**Pole's Cards issued *in Belarus* (place of issuance, not applicants' citizenship):**
- GUS Demographic Yearbook 2025 table 60(211): BY 2020 **10,636**, 2023 **6,020**, 2024 **163**. In 2024 another **7,796** Pole's Cards were issued in **Poland to applicants of all nationalities**, so fall in the Belarus-consulate series does *not* establish collapse in awards to Belarus citizens.
- Rządowa Rada Ludnościowa table 6.4: BY 2020 **11,467**, 2021 **8,522**, 2022 **9,168**. **2020 differs between statistical releases** (10,636 vs 11,467); mark `review_required`. Also renewal counts included in historical Pole's Card time-series.
- Card ≠ permanent residence ≠ naturalization. Under art 30(1)(7), one may be recognized after at least one year continuous residence on a permanent permit acquired due to **Polish origin OR Pole's Card** and other legal requirements. The by-BY, by-year count based on **Pole's Card specifically is not yet confirmed**.
- The combined number naturalized 2020–25 in listed snapshots is 24,021, but this is **not** a count of adult voters or of Pole's Card holders.

Sources: https://stat.gov.pl/files/gfx/portalinformacyjny/pl/defaultaktualnosci/5515/3/19/1/rocznik_demograficzny_2025_pl.pdf (p.474), https://bip.stat.gov.pl/download/gfx/bip/pl/defaultstronaopisowa/805/1/1/sytuacja_demograficzna_polski_20222023_internet.pdf ; https://www.gov.pl/web/mswia/popros-o-uznanie-za-polskiego-obywatela .

**Criminal-statistics classification issue:** a former BY citizen who becomes PL citizen ceases to count as BY in subsequent police nationality-based statistics, without changing personal migration background. This must be controlled in any longitudinal causal inference; do not reconstruct identities.

## 4. Mixed marriages, 2024 (official GUS)

Yearbook 2025, table 24(48), page 225, Polish registrations:
- Belarusian woman + Polish man: **216**
- Belarusian man + Polish woman: **70**
- Total BY–PL citizen mixed marriages: **286** (~4.9% of 5,875 all registered PL–non-PL marriages in GUS tab.2.2).
This is *new marriages registered in 2024*, not all Belarusian-origin families, and does not imply automatic Polish citizenship. The yearbook says 1,068 marriages had both spouses normally resident abroad before marriage and were still included in table 24 as a whole; do not assume each of 286 is a resident couple. Year-by-year BY-specific 2020–2023 table extraction is pending historical yearbook cross-check.

Source: https://stat.gov.pl/files/gfx/portalinformacyjny/pl/defaultaktualnosci/5515/3/19/1/rocznik_demograficzny_2025_pl.pdf ; summary https://stat.gov.pl/files/gfx/portalinformacyjny/pl/defaultaktualnosci/5468/40/5/1/sytuacja_demograficzna_polski_do_2024.pdf

## 5. Causal design and competing explanations

Exposures: BY new residence flows 2020 onward; BY employment/ZUS separate; integration via naturalizations, marriages and jobs (these are mediator/outcomes, not assumed exogenous treatments). Outcomes: resident victimization / suspected-person rate stratified by offense/age/sex; reporting/detection; local socioeconomic effect. Population-year denominators must come from residence **person-years**, not permit stock.

Hypotheses to test: (H1) demographic size change explains absolute increases; (H2) age/sex composition and local urban context explain some differences; (H3) enforcement and border checking alter observed suspect counts; (H4) naturalization reclassifies citizen labels; (H5) concentration/industry, employment and integration alter circumstances. A pretrend and quasi-experiment would help only after obtaining source-disaggregated data. Falsify direct-effect claims when pretrends/selection/detection differences absorb the association. Also study local crime victimization regardless of offender citizenship to avoid narrow single-group inference.

**Sources status:** Polish Sejm original indexed search excerpts but direct browsing human challenge; GUS PDFs text-extracted, screenshot service cache missed for 2025 yearbook; 2024 marital summary PDF screenshot succeeded; archived documents linked, not copied. **Publication gate: `review_required`**.

**JTBD → requirement → data → UI → tests:** compare risks and integration without nationality stereotyping → independent persons/offenses/convictions, age adjustment and matched periods → `source_id`, `counting_unit`, `citizenship`, `age_band`, `denominator_kind`, `legal_status` → time series and evidence drill-down with explicit NA values → automated provenance, year and denominator gates. No board/Three.js change or CI pass implied.
