#!/usr/bin/env python3
"""No-network adapter unit tests for data discovery."""
import importlib.util
import pathlib
import unittest
from argparse import Namespace
from datetime import datetime

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("adapter",ROOT/"tools/ingest_open_apis.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class AdapterTests(unittest.TestCase):
    def args(self,source):
        return Namespace(source=source,start="2026-10-01",end="2026-10-30",countries="PL,DE",indicator="FP.CPI.TOTL.ZG",min_magnitude=6.0,limit=20)

    def test_allowlisted_urls(self):
        self.assertTrue(m.build_url(self.args("worldbank")).startswith("https://api.worldbank.org/v2/country/PL;DE"))
        self.assertIn("date=2026%3A2026",m.build_url(self.args("worldbank")))
        self.assertIn("format=geojson",m.build_url(self.args("usgs")))
        self.assertIn("status=open",m.build_url(self.args("eonet")))

    def test_normalize_worldbank_skips_missing_measurements(self):
        sample=[{"page":1,"pages":1},[{"countryiso3code":"POL","country":{"value":"Poland"},"indicator":{"id":"FP.CPI.TOTL.ZG","value":"Inflation"},"date":"2025","value":2.5},
                {"countryiso3code":"DEU","country":{"value":"Germany"},"indicator":{"id":"FP.CPI.TOTL.ZG","value":"Inflation"},"date":"2025","value":None}]]
        rows=m.normalize_worldbank(sample)
        self.assertEqual(len(rows),1);self.assertEqual(rows[0]["value"],2.5)

    def test_normalize_usgs(self):
        sample={"type":"FeatureCollection","features":[{"id":"usabc","properties":{"time":1750000000000,"mag":6.2,"title":"M6.2 test","place":"Somewhere","url":"https://earthquake.usgs.gov/eventpage/usabc"},"geometry":{"coordinates":[1,2,3]}}]}
        rows=m.normalize_usgs(sample)
        self.assertEqual(rows[0]["magnitude"],6.2)
        self.assertIn("2025",rows[0]["occurred_at"])

    def test_normalize_eonet(self):
        sample={"events":[{"id":"EONET-test","title":"Storm demo","geometry":[{"date":"2026-10-30T01:00:00Z"}],"categories":[{"id":"severeStorms"}],"link":"https://eonet.gsfc.nasa.gov/api/v3/events/EONET-test","closed":None}]}
        rows=m.normalize_eonet(sample);self.assertEqual(rows[0]["status"],"open")


if __name__=="__main__":
    unittest.main()
