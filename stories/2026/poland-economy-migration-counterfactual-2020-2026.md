# Poland 2020–2026: economy, Ukrainian and Belarusian migration, counterfactual assumptions

**Research snapshot 2026-11-05. Status: research_staging / review_required.** This is the archived current synthesis from the project's cross-topic research; it is not a model deployment, a new GDP series, or a completed impact evaluation. Follow up with [crime/citizenship](poland-belarus-crime-citizenship-integration.md) and [crime DID](poland-migration-crime-counterfactual-2020-2026.md).

## Core chronology and compared measures
- 2020 COVID shock and Belarus post-election emigration; 2021 recovery in Poland.
- 2022 Russian full-scale invasion, arrival of Ukrainian displaced persons and energy/inflation shock. 2023 Polish GDP almost stagnant while migrants remained in the workforce; 2024–2025 recovery. Confounding shocks preclude attributing Polish GDP growth to migration by comparing aggregate GDP years.
- Polish GUS real GDP growth series for 2020–2025: approximately -2.0%, +6.9%, +5.3%, +0.2%, +3.0%, +3.8%, subject to GUS revisions and series vintage. Source: https://stat.gov.pl/ ; https://ssgk.stat.gov.pl/index.html . Annual year 2026 not yet concluded.
- ZUS end-year Belarus citizens insured 2020 ~50.6k, 2022 ~108.1k, 2024 ~134.9k, 2025 ~138k; Ukraine 2020 ~532.5k, 2022 ~746k, 2024 ~787.5k, 2025 ~857k (latter approximate; reconcile latest ZUS publication). **Insured are neither net migration nor total resident population**, and may include workforce formalization. https://www.zus.pl/ .
- UdSC end-2024 Belarus citizens holding valid residence permits approximately 141k; end-2025/Feb-2026 around 143k; these are administrative permit stocks and not all residents. https://www.gov.pl/web/udsc .
- Ukrainian refugees under temporary protection: Eurostat ~939k in Poland at end-Aug 2026 (the EU scheme is a separate legal status and denominator). https://ec.europa.eu/eurostat/ .

## Published model-based counterfactual, not measured component of GDP
Deloitte/UNHCR (2026 updated model) estimates that presence of Ukrainian displaced persons increased Poland's **2025 GDP level** by about 2.4% compared with a modeled no-arrivals counterfactual (reported as ~94bn PLN at current prices). The estimate is not 2.4 **percentage points of annual GDP growth** nor a net government budget gain. In revision, 2024 estimate changed from earlier 2.7% to approx 2.3%; preserve version distinctions. Assumptions include labor market and productivity calibration, so do not overstate identification, individual wage impacts, or universal welfare gains.
Primary: https://data.unhcr.org/en/documents/download/124105 .

## BY workforce and company relocation: not yet a causally identified GDP effect
For a rough illustration, 86k additional BY persons in ZUS since 2020 × average 2025 GDP per worker ~227k PLN yields **~19.5bn PLN mechanical gross production comparator**. Applying arbitrary 25/50/100% additionality factors gives ~4.9/9.8/19.5bn PLN. These are **synthetic sensitivity tests**, not an estimated Belarus migration effect, confidence interval, or an identified contribution. ZUS count growth includes previously settled people who entered formal employment; mean productivity is not marginal contribution and reallocation would occur absent migration. Don't add this comparator to Ukrainian Deloitte effect. Sources: https://www.zus.pl/ ; https://stat.gov.pl/ .

NBP 2025 sample survey of Belarusian migrants documents political motives, education, employment and IT profile; sample composition != population distribution. Primary: https://nbp.pl/wp-content/uploads/2026/02/Sytuacja_uchodzcow_z_Bialorusi-ANG-2025-WWW.pdf .

## Alternative mechanisms
1. Migration → labor supply/consumption/tax bases → GDP, but supply response and substitution matter.
2. Migration → housing demand; supply, mortgage rates and internal Polish mobility act as alternatives; national inflation ≠ identified migration effect.
3. Migrant contact and local public services → experience/perceived fairness → changing policy priorities, but party selection, media and economy confound; no electoral forecasts.
4. New Polish citizenship and mixed marriages → changed population legal status and social integration; former BY citizen becomes PL citizen in administrative crime statistics, causing changing classification without changing ancestry.

## Next-level identification plan
Compile powiat×quarter panel 2018–2026; outcomes: real wages, employment, rent, school capacity, police offense counts by category, suspected **persons**, citizenship, age/sex, court convictions where available; exposures: actual resident person-years from official migration data, ZUS insured as distinct predictor, refugee temporary protection and legal-status transitions separately; controls: pre-2020 age/sex and sector mix, Covid, inflation, urban/rural, housing supply, police enforcement, geography. Estimate event-study / staggered DiD after pretrend and spillover tests. No coefficients generated yet; scope is design and provenance, not a finished causal analysis. Track contradicting data vintage, rights and approvals before canonical-board registration.

**Data rights:** only original commentary and facts with links; no third-party PDF redistribution. **Publication gate:** review_required until independent revalidation and QA.
