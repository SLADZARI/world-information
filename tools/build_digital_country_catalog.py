#!/usr/bin/env python3
"""Build a self-contained, source-linked digital-country catalog (no network).

The reference registry lists ISO country/area codes. It does NOT imply
sovereignty, and absence of a research profile means *unresearched*, not zero.
Evidence lives in baseline-*.json and manually reviewed country profiles;
generated representations are projections, never a source of truth.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data/catalog/country-registry.csv"
PROFILES = ROOT / "data/catalog/digital-countries"
BASELINE = ROOT / "data/research/digital-ecosystems/baseline-2026-10-31.json"
INDEX = ROOT / "data/catalog/country-index.generated.json"
TEMPLATE = ROOT / "prototype/digital-country-catalog.template.html"
OUTPUT_HTML = ROOT / "prototype/digital-country-catalog.html"
ISO = re.compile(r"^[A-Z]{2}$")
ALLOWED_STATUSES = {"queued", "partial"}
STRICT_KEYS = {"country_code", "as_of", "status", "review_status",
               "measurement_ids", "source_ids", "operators", "platforms",
               "social_groups", "digital_rights", "research_gaps", "notes"}
SOURCE_PIN = "https://raw.githubusercontent.com/datasets/country-list/ca393dfa16db21ce07be77902c1c129d63c86d9f/data.csv"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build() -> dict:
    baseline = load(BASELINE)
    as_of = date.fromisoformat(baseline["as_of"])
    sources = {s["id"]: s for s in baseline["sources"]}
    measures = {m["id"]: m for m in baseline["measurements"]}
    if len(sources) != len(baseline["sources"]) or len(measures) != len(baseline["measurements"]):
        raise ValueError("duplicate baseline source or measurement ID")
    with REGISTRY.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != ["Name", "Code"]:
            raise ValueError("registry must be a Name,Code CSV")
        registry = list(reader)
    if len(registry) != 249:
        raise ValueError(f"reference registry count changed: {len(registry)} != 249; update deliberately")
    country_names = {r["Code"]: r["Name"] for r in registry}
    if len(country_names) != len(registry) or any(not ISO.fullmatch(code) for code in country_names):
        raise ValueError("duplicate or non-ISO country/area code in registry")

    profiles = {}
    for path in sorted(PROFILES.glob("*.json")):
        p = load(path)
        code = p.get("country_code")
        if path.stem != code or code not in country_names or code in profiles:
            raise ValueError(f"{path}: bad or duplicate country_code")
        if set(p) != STRICT_KEYS:
            raise ValueError(f"{path}: expected fields {sorted(STRICT_KEYS - set(p))}; unexpected {sorted(set(p) - STRICT_KEYS)}")
        if p["status"] not in ALLOWED_STATUSES or p["review_status"] != "review_required":
            raise ValueError(f"{path}: status must be partial/queued and require review")
        if date.fromisoformat(p["as_of"]) > as_of:
            raise ValueError(f"{path}: future-as-of profile")
        if not isinstance(p["notes"], str) or not p["notes"].strip():
            raise ValueError(f"{path}: missing notes")
        if not p["research_gaps"] or any(not isinstance(x, str) or not x.strip() for x in p["research_gaps"]):
            raise ValueError(f"{path}: missing research gaps")
        if p["status"] == "queued" and (p["measurement_ids"] or p["source_ids"] or p["operators"] or p["platforms"] or p["social_groups"] or p["digital_rights"]):
            raise ValueError(f"{path}: queued country must not claim imported research")
        if p["status"] == "partial" and not p["measurement_ids"]:
            raise ValueError(f"{path}: partial profile must reference an observation")
        for key in ("measurement_ids", "source_ids"):
            if not isinstance(p[key], list) or len(set(p[key])) != len(p[key]):
                raise ValueError(f"{path}: bad or duplicate {key}")
        for key in ("operators", "platforms", "social_groups", "digital_rights"):
            if not isinstance(p[key], list):
                raise ValueError(f"{path}: {key} must be a list")
        if p["platforms"] or p["social_groups"] or p["digital_rights"]:
            raise ValueError(f"{path}: new research entities require a documented schema + source references before import")
        for sid in p["source_ids"]:
            if sid not in sources:
                raise ValueError(f"{path}: unknown source {sid}")
        measured = []
        for mid in p["measurement_ids"]:
            m = measures.get(mid)
            if m is None or m["geography"] != code:
                raise ValueError(f"{path}: unknown or cross-geography measurement {mid}")
            if m["source_id"] not in p["source_ids"]:
                raise ValueError(f"{path}: measurement {mid} source omitted from profile")
            if m.get("causal_effect") is not False or m.get("status") != "review_required":
                raise ValueError(f"{path}: unexpected causal or reviewed claim {mid}")
            if not all(m.get(k) for k in ("period", "method", "denominator", "population_scope", "unit")):
                raise ValueError(f"{path}: incomplete measurement {mid}")
            if "influence" in m["metric"].lower():
                raise ValueError(f"{path}: descriptive influence % is prohibited")
            measured.append({
                "id": m["id"], "metric": m["metric"], "type": m["measurement_type"],
                "value": m["value"], "comparison": m["comparison"], "unit": m["unit"],
                "period": m["period"], "population_scope": m["population_scope"],
                "denominator": m["denominator"], "method": m["method"],
                "limitations": m["limitations"], "source_id": m["source_id"],
            })
        operators = []
        for op in p["operators"]:
            if set(op) != {"name", "service", "share_percent", "source_id", "verification_status"}:
                raise ValueError(f"{path}: operator fields invalid")
            if not op["name"] or not op["service"] or op["source_id"] not in p["source_ids"]:
                raise ValueError(f"{path}: operator missing name/service/source")
            if op["verification_status"] != "review_required":
                raise ValueError(f"{path}: operator must remain unverified")
            if op["share_percent"] is not None:
                raise ValueError(f"{path}: operator share must be sourced as a separate method-backed measurement")
            operators.append(op)
        profiles[code] = {"status":p["status"],"as_of":p["as_of"],
                          "review_status":p["review_status"],"metrics":measured,
                          "sources":[{"id":sid,"publisher":sources[sid]["publisher"],
                                      "url":sources[sid]["url"],
                                      "published_on":sources[sid]["published_on"],
                                      "limitations":sources[sid]["limitations"],
                                      "rights":sources[sid]["rights"]} for sid in p["source_ids"]],
                          "operators":operators,"platforms":[],"social_groups":[],
                          "digital_rights":[],"research_gaps":p["research_gaps"],
                          "notes":p["notes"]}
    entries = []
    for rec in sorted(registry, key=lambda x: x["Name"].casefold()):
        code = rec["Code"]
        profile = profiles.get(code)
        entries.append({"code": code, "name": rec["Name"],
                        "status": profile["status"] if profile else "unresearched",
                        "profile": profile})
    counts = {s:sum(p["status"] == s for p in entries) for s in ("partial","queued","unresearched")}
    return {
        "schema_version":"0.1.0", "as_of":str(as_of),
        "registry":{"source":SOURCE_PIN,"upstream_license":"PDDL-1.0; upstream warns ISO reuse terms may need review",
                    "official_crosscheck":"https://unstats.un.org/unsd/methodology/m49/",
                    "entities":"ISO country or area, not sovereign-state list"},
        "baseline_source":"data/research/digital-ecosystems/baseline-2026-10-31.json",
        "status_meanings":{"partial":"has preliminary source-linked measurement(s); review required",
                           "queued":"priority research requested, no measurements yet",
                           "unresearched":"no imported research; never interpret as zero digital use"},
        "counts":counts, "countries":entries,
    }


def outputs(index: dict) -> dict[Path, str]:
    content = json.dumps(index, indent=2, ensure_ascii=False) + "\n"
    template = TEMPLATE.read_text(encoding="utf-8")
    marker = "__COUNTRY_CATALOG_JSON__"
    if template.count(marker) != 1:
        raise ValueError("HTML template must include exactly one JSON marker")
    # Prevent a raw closing script tag inside JSON from ending the data element.
    inline = json.dumps(index, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return {INDEX:content, OUTPUT_HTML:template.replace(marker, inline)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="exit with failure if generated outputs are stale")
    args = parser.parse_args()
    try:
        index = build()
        artifacts = outputs(index)
        for path, content in artifacts.items():
            if args.check:
                if not path.exists() or path.read_text(encoding="utf-8") != content:
                    raise ValueError(f"generated file missing/stale: {path.relative_to(ROOT)}")
            else:
                path.write_text(content, encoding="utf-8")
        print("PASS: {count} country/area entries; {p} partial; {q} queued; {u} unresearched".format(
            count=len(index["countries"]), p=index["counts"]["partial"],
            q=index["counts"]["queued"], u=index["counts"]["unresearched"]))
        return 0
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
