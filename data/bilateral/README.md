# Bilateral Relations Evidence Registry

Canonical source: [registry.v1.json](registry.v1.json) · schema: [bilateral-relations.schema.json](../../schemas/bilateral-relations.schema.json).

The source is deliberately separate from the seven source-linked research graphs. Both are projections of *evidence*, not a country-relationship score, prediction or binary ally/adversary classification.

**Current scope:** 10 source-attributed records; 9 Germany–Poland and 1 United States–Russia. Eight categories are supported. All records are `review_required`. Zero current territorial disputes in the sample is an evidence gap, not a geopolitical conclusion. The border treaty is a documented historical settlement.

Add a new record only with ISO pair, direction, date, legal status, original claims, publisher and source URL, known reuse rights, and honest limitations. For quantitative fields preserve stock/flow distinction and source-defined reporting periods. Never fabricate an amount, causal effect, or a legal status.

Validation: `node tools/validate_bilateral_registry.mjs` and `node --test tests/bilateral-registry.test.mjs`.

Read the full project method in [BILATERAL_REGISTRY.md](../../docs/BILATERAL_REGISTRY.md).
