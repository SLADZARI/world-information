"""Offline consistency tests: prevent invented country coverage or digital influence."""
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("digital_catalog", ROOT / "tools/build_digital_country_catalog.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CatalogTests(unittest.TestCase):
    def test_249_areas_and_explicit_missingness(self):
        obj = module.build()
        self.assertEqual(len(obj["countries"]), 249)
        self.assertEqual(obj["counts"], {"partial": 4, "queued": 3, "unresearched": 242})
        self.assertEqual(len({c["code"] for c in obj["countries"]}), 249)

    def test_queued_countries_have_no_fabricated_metrics(self):
        by_code = {c["code"]: c for c in module.build()["countries"]}
        for code in ("BY", "RU", "UA"):
            self.assertEqual(by_code[code]["status"], "queued")
            self.assertEqual(by_code[code]["profile"]["metrics"], [])
            self.assertFalse(by_code[code]["profile"]["operators"])
        self.assertIsNone(by_code["AF"]["profile"])

    def test_all_measurements_source_linked(self):
        obj = module.build()
        for c in obj["countries"]:
            if c["profile"] is None:
                continue
            refs = {s["id"] for s in c["profile"]["sources"]}
            for m in c["profile"]["metrics"]:
                self.assertIn(m["source_id"], refs)
                self.assertTrue(m["denominator"])
                self.assertTrue(m["period"])
                self.assertNotIn("influence", m["metric"])

    def test_all_operators_have_no_unsourced_shares(self):
        obj = module.build()
        for c in obj["countries"]:
            if c["profile"]:
                for op in c["profile"]["operators"]:
                    self.assertIsNone(op["share_percent"])

    def test_offline_artifacts_up_to_date(self):
        outputs = module.outputs(module.build())
        for path, expected in outputs.items():
            self.assertEqual(path.read_text(encoding="utf-8"), expected,
                             f"{path.name} out of date: regenerate with build script")

    def test_rejects_country_metric_from_other_geography(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for file in module.PROFILES.glob("*.json"):
                shutil.copyfile(file, root / file.name)
            path = root / "PL.json"
            obj = json.loads(path.read_text(encoding="utf-8"))
            obj["measurement_ids"].append("gb-time-online-2025")
            path.write_text(json.dumps(obj), encoding="utf-8")
            with patch.object(module, "PROFILES", root):
                with self.assertRaisesRegex(ValueError, "cross-geography"):
                    module.build()

    def test_rejects_operator_market_share_without_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for file in module.PROFILES.glob("*.json"):
                shutil.copyfile(file, root / file.name)
            path = root / "CN.json"
            obj = json.loads(path.read_text(encoding="utf-8"))
            obj["operators"][0]["share_percent"] = 90
            path.write_text(json.dumps(obj), encoding="utf-8")
            with patch.object(module, "PROFILES", root):
                with self.assertRaisesRegex(ValueError, "operator share"):
                    module.build()


if __name__ == "__main__":
    unittest.main()
