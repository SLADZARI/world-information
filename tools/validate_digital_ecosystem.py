#!/usr/bin/env python3
"""Offline evidence-staging checks. Complements JSON Schema; no external dependencies.

Do not promote survey reach, subscription counts, or platform audience into
'percentage of causal influence'. Record is review_required until human review.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data/research/digital-ecosystems/baseline-2026-10-31.json"
SCHEMA = ROOT / "schemas/digital-ecosystem-research.schema.json"
ID = re.compile(r"^[a-z][a-z0-9_-]{2,}$")
COUNTRY = re.compile(r"^[A-Z]{2}$")
ALLOWED_GEOGRAPHIES = re.compile(r"^(GLOBAL|MARKETS_[0-9]+|[A-Z]{2})$")
KINDS = {"official_statistics", "regulator", "survey", "methodology",
         "civil_society_monitoring", "randomized_experiment"}
REACH_TYPES = {"coverage", "infrastructure_coverage", "self_report_news_reach",
               "attitude_survey", "household_internet_adoption", "consumer_ecommerce_reach"}


def errors(dataset: dict) -> list[str]:
    problems: list[str] = []
    if dataset.get("schema_version") != "0.1.0":
        problems.append("unsupported schema_version")
    if dataset.get("record_status") != "review_required":
        problems.append("staging dataset must be review_required")
    try:
        as_of = date.fromisoformat(dataset["as_of"])
    except (ValueError, KeyError, TypeError):
        problems.append("as_of: expected ISO date")
        as_of = date.min
    for coll in ("sources", "measurements", "hypotheses", "country_context"):
        if not isinstance(dataset.get(coll), list):
            problems.append(f"{coll}: expected list")
            return problems
    ids: dict[str, set[str]] = {}
    for coll in ("sources", "measurements", "hypotheses"):
        rows = dataset[coll]
        values = [r.get("id") for r in rows if isinstance(r, dict)]
        if len(values) != len(rows) or any(not isinstance(x, str) or not ID.fullmatch(x) for x in values):
            problems.append(f"{coll}: malformed ID")
        if len(values) != len(set(values)):
            problems.append(f"{coll}: duplicate ID")
        ids[coll] = set(values)
    if not ids["sources"] or not ids["measurements"]:
        problems.append("empty sources or measurements")
    for s in dataset["sources"]:
        if not isinstance(s, dict):
            problems.append("source: malformed record")
            continue
        name = s.get("id", "?")
        if s.get("kind") not in KINDS:
            problems.append(f"{name}: unsupported source kind")
        if not str(s.get("url", "")).startswith("https://"):
            problems.append(f"{name}: invalid HTTPS source")
        if s.get("status") != "review_required":
            problems.append(f"{name}: unreviewed source promoted")
        if not str(s.get("rights", "")).strip():
            problems.append(f"{name}: missing reuse rights")
        for field in ("published_on", "retrieved_on"):
            value = s.get(field)
            if value is None and field == "published_on":
                continue
            try:
                parsed = date.fromisoformat(value)
                if parsed > as_of:
                    problems.append(f"{name}: {field} later than as_of")
            except (ValueError, TypeError):
                problems.append(f"{name}: invalid {field}")
    for m in dataset["measurements"]:
        if not isinstance(m, dict):
            problems.append("measurement: malformed record")
            continue
        name = m.get("id", "?")
        if m.get("source_id") not in ids["sources"]:
            problems.append(f"{name}: unknown source_id")
        if not ALLOWED_GEOGRAPHIES.fullmatch(str(m.get("geography", ""))):
            problems.append(f"{name}: invalid geography")
        if m.get("status") != "review_required" or m.get("causal_effect") is not False:
            problems.append(f"{name}: forbidden causal promotion or missing review")
        for field in ("denominator", "population_scope", "period", "unit", "method", "limitations"):
            if not str(m.get(field, "")).strip():
                problems.append(f"{name}: missing {field}")
        val = m.get("value")
        if isinstance(val, bool) or not isinstance(val, (int, float)) or not 0 <= val < float("inf"):
            problems.append(f"{name}: bad numeric value")
        if m.get("comparison") not in ("=", ">", ">="):
            problems.append(f"{name}: invalid comparison bound")
        if m.get("measurement_type") in REACH_TYPES:
            if m.get("unit") not in ("percent_of_population", "percent_of_households",
                                     "percent_of_respondents", "percent_of_adults",
                                     "percent_of_individuals_16_74"):
                problems.append(f"{name}: percentage metric has incompatible denominator/unit")
            if isinstance(val, (int, float)) and not 0 <= val <= 100:
                problems.append(f"{name}: percentage outside [0,100]")
        if "influence" in str(m.get("metric", "")).lower():
            problems.append(f"{name}: unsupported influence metric (must estimate causal effects separately)")
    for h in dataset["hypotheses"]:
        if not isinstance(h, dict):
            problems.append("hypothesis: malformed record")
            continue
        name = h.get("id", "?")
        if h.get("status") != "review_required" or h.get("causal_effect_estimate", "MISSING") is not None:
            problems.append(f"{name}: no causal effect estimate accepted in staging")
        for key in ("evidence_source_ids", "contradicting_source_ids"):
            refs = h.get(key, [])
            if not isinstance(refs, list):
                problems.append(f"{name}: {key} must be list")
                continue
            problems.extend(f"{name}: unknown source in {key} ({ref})"
                            for ref in refs if ref not in ids["sources"])
        if not h.get("alternatives") or not h.get("falsification") or not h.get("mechanism"):
            problems.append(f"{name}: missing mechanism/alternatives/falsification")
    seen_countries: set[str] = set()
    for c in dataset["country_context"]:
        if not isinstance(c, dict):
            problems.append("country_context: malformed record")
            continue
        country = c.get("country", "")
        if not COUNTRY.fullmatch(str(country)):
            problems.append(f"country_context: invalid ISO code {country!r}")
        if country in seen_countries:
            problems.append(f"country_context: duplicate {country}")
        seen_countries.add(country)
        for ref in c.get("available_evidence", []):
            if ref not in ids["sources"]:
                problems.append(f"country_context/{country}: missing source {ref}")
        if c.get("platform_preferences_status") not in ("not_yet_validated", "partially_surveyed", "validated"):
            problems.append(f"country_context/{country}: bad coverage status")
    return problems


def main() -> int:
    json.loads(SCHEMA.read_text(encoding="utf-8"))  # schema must be parseable
    dataset = json.loads(DATASET.read_text(encoding="utf-8"))
    failures = errors(dataset)
    if failures:
        for line in failures:
            print("FAIL:", line)
        return 1
    print("PASS: staged digital ecosystem sources, denominators, references and causal discipline")
    return 0


if __name__ == "__main__":
    sys.exit(main())
