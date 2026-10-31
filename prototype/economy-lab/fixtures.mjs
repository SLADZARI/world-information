/**
 * Stylised macro-regional ENERGY/INDUSTRY/TREASURY demo.
 * ALL numeric inputs are illustrative, not empirical country statistics.
 * Countries are real places; the numbers are NOT descriptions of them.
 * Mechanics are a newly authored adaptation of stock/flow and bounded-ledger
 * principles in the private Dementor Live design, not copied game code.
 */
export const ECONOMY_FIXTURE = Object.freeze({
  version: "0.1.0",
  asOf: "2026-10-30",
  synthetic: true,
  unit: "abstract energy units per quarter",
  periodsPerYear: 4,
  note: "Синтетические входные параметры. Индекс производства НЕ является прогнозом ВВП.",
  modelAssumptions: {
    energyOutputElasticity: "output_index = 100 × (1 − sensitivity × unserved_fraction)",
    efficiencyYield: 0.002,
    maxEfficiency: 0.20,
    taxes: "tax_base × output_index / 100",
    budgets: "treasury_next = treasury_prev + taxes − paid_services − efficiency_investment",
    source: "Author-created hypothesis for interaction testing; not econometrically calibrated"
  },
  countries: [
    { id: "PL", name: "Польша", region: "Европа", production: 68, demand: 95, reserve: 22, reserveCap: 44, sensitivity: 0.95, treasury: 90, baseTax: 16, publicServices: 14 },
    { id: "DE", name: "Германия", region: "Европа", production: 72, demand: 115, reserve: 25, reserveCap: 50, sensitivity: 0.80, treasury: 120, baseTax: 22, publicServices: 20 },
    { id: "NO", name: "Норвегия", region: "Европа", production: 145, demand: 62, reserve: 20, reserveCap: 50, sensitivity: 0.65, treasury: 110, baseTax: 17, publicServices: 15 }
  ],
  // Contract priority is an explicit simplifying assumption. Not real trade contracts.
  routes: [
    { id: "NO-DE", from: "NO", to: "DE", capacity: 45, priority: 1 },
    { id: "NO-PL", from: "NO", to: "PL", capacity: 35, priority: 2 },
    { id: "DE-PL", from: "DE", to: "PL", capacity: 15, priority: 3 }
  ],
  scenarios: [
    { id: "none", name: "Базовый вариант", description: "Новых потрясений нет", changes: [] },
    { id: "north-shock", name: "Ограничение поставок на севере", description: "Иллюстративное −45% предложения в NO в Q2–Q4", changes: [{ country: "NO", productionLoss: 0.45, from: 2, to: 4 }] },
    { id: "industry-shock", name: "Снижение внутреннего предложения", description: "Иллюстративное −35% предложения в DE в Q2–Q5", changes: [{ country: "DE", productionLoss: 0.35, from: 2, to: 5 }] },
    { id: "double-shock", name: "Комбинация шоков", description: "Иллюстративное снижение в NO и DE одновременно", changes: [{ country: "NO", productionLoss: 0.35, from: 2, to: 5 }, { country: "DE", productionLoss: 0.20, from: 2, to: 5 }] }
  ],
  evidence: [
    { title: "Исторические данные ЕС по импорту газа", link: "https://www.consilium.europa.eu/en/infographics/where-does-the-eu-s-gas-come-from/", relation: "Контекст, НЕ источник синтетических параметров модели" },
    { title: "Исследование газовой перестройки в репозитории", link: "../../stories/2026/eu-gas-transition-2021-2026.md", relation: "Обоснованные исторические наблюдения и конкурирующие гипотезы" }
  ]
});
