#!/usr/bin/env python3
"""Offline semantic validation of the synthetic graph fixture (stdlib only).

JSON Schema is published separately in schemas/world-graph.schema.json.
This script checks cross-record integrity and central domain invariants; it does
not claim to be a full JSON Schema implementation.
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]
PATH = ROOT / "data/examples/world-graph.demo.json"
ALLOWED_LAYERS = {"geography","events","factors","impacts","scenarios","discussions","markets"}
ALLOWED_STATUSES = {"hypothesized","associated","supported","disputed","rejected"}
CAUSAL = {"hypothesized_to_affect","supported_causal_effect"}
ERRORS: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        ERRORS.append(message)


def timestamp(s: str, label: str) -> None:
    try:
        datetime.fromisoformat(s.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        ERRORS.append(f"{label}: invalid ISO 8601 datetime")


def table(entries: list[dict], field: str):
    ids = [x.get("id") for x in entries]
    check(len(ids) == len(set(ids)), f"duplicate {field} identifiers")
    check(all(isinstance(x, str) and x for x in ids), f"{field}: missing id")
    return set(ids)


def validate(doc: dict) -> None:
    check(doc.get("schema_version") == "0.1.0", "unsupported schema version")
    for key in ("nodes", "relations", "claims", "sources", "scenarios", "forecasts"):
        check(isinstance(doc.get(key), list), f"missing collection: {key}")
    if ERRORS:
        return
    nodes = table(doc["nodes"], "node")
    claims = table(doc["claims"], "claim")
    sources = table(doc["sources"], "source")
    table(doc["relations"], "relation")
    table(doc["scenarios"], "scenario")
    table(doc["forecasts"], "forecast")
    for n in doc["nodes"]:
        nid = n["id"]
        check(n.get("layer") in ALLOWED_LAYERS, f"{nid}: unknown layer")
        check(bool(n.get("category")), f"{nid}: missing category")
        check(bool(n.get("subcategories")), f"{nid}: no subcategory")
        check(all(re.fullmatch(r"[a-z]+(\.[a-z_]+)+", s) for s in n.get("subcategories", [])), f"{nid}: malformed subcategory")
        check(all(re.fullmatch("[A-Z]{2}", c) for c in n.get("countries", [])), f"{nid}: invalid country code")
        timestamp(n.get("at",""),nid)
    for r in doc["relations"]:
        rid=r["id"]
        check(r.get("from") in nodes and r.get("to") in nodes, f"{rid}: dangling graph edge")
        check(r.get("status") in ALLOWED_STATUSES, f"{rid}: invalid status")
        check(all(i in claims for i in r.get("claim_ids",[])), f"{rid}: unknown claim")
        check(all(i in sources for i in r.get("evidence_source_ids",[])), f"{rid}: unknown evidence source")
        if r.get("relation") in CAUSAL:
            check(bool(r.get("claim_ids")), f"{rid}: causation needs a checkable claim")
            check(bool(r.get("mechanism")), f"{rid}: missing mechanism")
        if r.get("status") == "supported" or r.get("relation") == "supported_causal_effect":
            check(bool(r.get("evidence_source_ids")), f"{rid}: supported effect missing primary evidence")
    for c in doc["claims"]:
        check(bool(c.get("falsification")), f"{c['id']}: missing falsification criterion")
        check(bool(c.get("alternatives")), f"{c['id']}: missing alternative explanations")
        check(all(i in sources for i in c.get("evidence_source_ids",[])), f"{c['id']}: unknown source")
    for f in doc["forecasts"]:
        timestamp(f.get("created_at",""),f["id"]+" created_at")
        timestamp(f.get("resolve_by",""),f["id"]+" resolve_by")
        check(bool(f.get("resolution_rule")), f"{f['id']}: missing outcome rule")


if __name__ == "__main__":
    # Syntax checks for both machine-readable artifacts.
    json.loads((ROOT / "schemas/world-graph.schema.json").read_text(encoding="utf-8"))
    validate(json.loads(PATH.read_text(encoding="utf-8")))
    if ERRORS:
        print("INVALID:\n- " + "\n- ".join(ERRORS))
        sys.exit(1)
    print("PASS: graph records, IDs, causal claims, references and timestamps")
