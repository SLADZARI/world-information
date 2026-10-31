"""Regression checks for source-linked digital ecosystem staging."""
import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "validate_digital_ecosystem", ROOT / "tools/validate_digital_ecosystem.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
baseline = json.loads((ROOT / "data/research/digital-ecosystems/baseline-2026-10-31.json").read_text(encoding="utf-8"))


class DigitalEcosystemTests(unittest.TestCase):
    def test_baseline_passes(self):
        self.assertEqual(module.errors(baseline), [])

    def test_missing_source_is_caught(self):
        doc = copy.deepcopy(baseline)
        doc["measurements"][0]["source_id"] = "missing"
        self.assertTrue(any("unknown source_id" in e for e in module.errors(doc)))

    def test_source_future_date_is_caught(self):
        doc = copy.deepcopy(baseline)
        doc["sources"][0]["retrieved_on"] = "2027-01-01"
        self.assertTrue(any("later than as_of" in e for e in module.errors(doc)))

    def test_percent_outside_range_is_caught(self):
        doc = copy.deepcopy(baseline)
        doc["measurements"][0]["value"] = 120
        self.assertTrue(any("outside" in e for e in module.errors(doc)))

    def test_do_not_promote_news_reach_to_causal_influence(self):
        doc = copy.deepcopy(baseline)
        doc["measurements"][1]["causal_effect"] = True
        self.assertTrue(any("forbidden causal promotion" in e for e in module.errors(doc)))

    def test_no_unjustified_causal_percentage(self):
        doc = copy.deepcopy(baseline)
        doc["measurements"][1]["metric"] = "digital_influence_percent"
        self.assertTrue(any("unsupported influence metric" in e for e in module.errors(doc)))

    def test_cannot_invent_causal_effect_estimate(self):
        doc = copy.deepcopy(baseline)
        doc["hypotheses"][0]["causal_effect_estimate"] = 0.5
        self.assertTrue(any("no causal effect estimate" in e for e in module.errors(doc)))

    def test_duplicate_source_is_caught(self):
        doc = copy.deepcopy(baseline)
        doc["sources"].append(copy.deepcopy(doc["sources"][0]))
        self.assertTrue(any("duplicate ID" in e for e in module.errors(doc)))

    def test_subscription_not_forced_to_percentage(self):
        doc = copy.deepcopy(baseline)
        rows = [r for r in doc["measurements"] if r["id"] == "cn-mobile-subs-2025"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["unit"], "million_subscriptions")
        self.assertEqual(module.errors(doc), [])


if __name__ == "__main__":
    unittest.main()
