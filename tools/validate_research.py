#!/usr/bin/env python3
"""Validate all reviewed country-event case graphs (stdlib, no network).

Schema documents are in schemas/world-graph.schema.json; this validation is a
cross-reference and content-integrity complement to JSON Schema, not a full
JSON Schema engine. All records are still subject to human review.
"""
import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]
CASE_DIR = ROOT / "data/cases"
IDENT = re.compile(r"^[a-z][a-z0-9_-]+$")
SUBCAT = re.compile(r"^[a-z]+(\.[a-z_]+)+$")
COUNTRY = re.compile(r"^[A-Z]{2}$")
STATUSES = {"hypothesized", "associated", "supported", "disputed", "rejected"}
RELATIONS = {"located_in","associated_with","precedes","hypothesized_to_affect","supported_causal_effect","depends_on","discusses","prices_outcome"}
CAUSE_RELATIONS = {"hypothesized_to_affect", "supported_causal_effect"}


def stamp(value, item, errors, nullable=False):
    if value is None and nullable:
        return
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        errors.append(f"{item}: invalid timestamp {value!r}")


def validate(file):
    e = []
    obj = json.loads(file.read_text(encoding="utf-8"))
    if obj.get("schema_version") != "0.1.0": e.append("unsupported version")
    if obj.get("synthetic") is not False: e.append("case graph must be explicitly real-world")
    groups = ("nodes", "relations", "claims", "sources", "scenarios", "forecasts")
    if any(not isinstance(obj.get(k), list) for k in groups):
        return ["missing required collections"]
    identifiers={}
    for k in groups:
        values=[x.get("id") for x in obj[k]]
        if len(set(values)) != len(values): e.append(f"{k}: duplicate ID")
        if not all(isinstance(x,str) and IDENT.fullmatch(x) for x in values): e.append(f"{k}: bad ID")
        identifiers[k]=set(values)
    for n in obj["nodes"]:
        name=n["id"]
        stamp(n.get("at"),name+".at",e)
        if not n.get("subcategories") or not all(SUBCAT.fullmatch(s) for s in n["subcategories"]): e.append(name+": invalid subcategory path")
        if not n.get("category"): e.append(name+": missing category")
        if not n.get("countries") or not all(COUNTRY.fullmatch(c) for c in n["countries"]): e.append(name+": invalid country codes")
        if n.get("type") == "indicator" and "indicator" in n:
            i=n["indicator"]
            for field in ("metric","unit","period","source_id","population_scope"):
                if not i.get(field): e.append(name+f": indicator missing {field}")
            if i.get("source_id") not in identifiers["sources"]: e.append(name+": unknown indicator source")
            if "value" in i and not isinstance(i["value"],(int,float)): e.append(name+": indicator value must be numeric")
    for s in obj["sources"]:
        stamp(s.get("published_at"),s["id"]+".published_at",e,nullable=True)
        stamp(s.get("retrieved_at"),s["id"]+".retrieved_at",e)
        if not str(s.get("url","")).startswith("https://"): e.append(s["id"]+": source URL must be HTTPS")
        if not s.get("rights"): e.append(s["id"]+": missing rights metadata")
    for r in obj["relations"]:
        name=r["id"]
        if r.get("from") not in identifiers["nodes"] or r.get("to") not in identifiers["nodes"]: e.append(name+": unresolved edge endpoint")
        if r.get("from")==r.get("to"): e.append(name+": implicit self-cause invalid (explicit time steps required)")
        if r.get("relation") not in RELATIONS: e.append(name+": unknown edge type")
        if r.get("status") not in STATUSES: e.append(name+": unknown epistemic status")
        if any(x not in identifiers["claims"] for x in r.get("claim_ids",[])): e.append(name+": unknown claim")
        if any(x not in identifiers["sources"] for x in r.get("evidence_source_ids",[])): e.append(name+": unknown source")
        if r.get("relation") in CAUSE_RELATIONS and (not r.get("claim_ids") or not r.get("mechanism")):
            e.append(name+": causal edge needs hypothesis ID and mechanism")
        if r.get("relation")=="supported_causal_effect" and r.get("status")!="supported":
            e.append(name+": supported effect cannot have unverified status")
        if (r.get("status")=="supported" or r.get("relation")=="supported_causal_effect") and not r.get("evidence_source_ids"):
            e.append(name+": supported edge lacks attributable source")
    for c in obj["claims"]:
        if not c.get("falsification"): e.append(c["id"]+": no falsification plan")
        if not c.get("alternatives"): e.append(c["id"]+": no rival explanation")
        if any(x not in identifiers["sources"] for x in c.get("evidence_source_ids",[])):
            e.append(c["id"]+": unresolved evidence")
    return e


if __name__ == "__main__":
    paths=sorted(CASE_DIR.glob("*.json"))
    if not paths:
        raise SystemExit("No real case graphs found")
    failed=False
    for p in paths:
        errors=validate(p)
        print(("FAIL" if errors else "PASS")+": "+p.name)
        for e in errors: print("  - "+e)
        failed |= bool(errors)
    sys.exit(1 if failed else 0)
