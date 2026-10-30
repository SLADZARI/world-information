#!/usr/bin/env python3
"""Bounded, no-key API ingestion into review-only staging (not graph publication).

Examples:
  python tools/ingest_open_apis.py --source eonet --limit 15
  python tools/ingest_open_apis.py --source usgs --start 2026-10-01 --end 2026-10-30 --min-magnitude 6
  python tools/ingest_open_apis.py --source worldbank --countries PL,DE --indicator FP.CPI.TOTL.ZG --start 2021 --end 2025
  python tools/ingest_open_apis.py --source eonet --fixture tests/fixtures/eonet.json

Does not authenticate, bypass quotas, scrape copyrighted content or publish
unverified causal edges. Keep staging files outside the committed repository.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
ALLOW = {"api.worldbank.org","eonet.gsfc.nasa.gov","earthquake.usgs.gov"}
MAX_BYTES = 4_000_000


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z")


def request_json(url):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname not in ALLOW:
        raise ValueError("URL not in reviewed HTTPS provider allowlist")
    req=urllib.request.Request(url,headers={"User-Agent":"world-information-research/0.1 (+https://github.com/SLADZARI/world-information)","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=20) as resp:
        if int(resp.headers.get("content-length","0")) > MAX_BYTES:
            raise ValueError("Too much API data (content-length)")
        content=resp.read(MAX_BYTES+1)
    if len(content)>MAX_BYTES:
        raise ValueError("Too much API data (stream limit)")
    return json.loads(content)


def build_url(a):
    if a.source=="worldbank":
        countries=a.countries.split(",")
        if not countries or any(not re.fullmatch(r"[A-Z]{2,3}",x) for x in countries):
            raise ValueError("country IDs must be comma-separated ISO alpha-2/3")
        if not re.fullmatch(r"[A-Z0-9.]+",a.indicator):
            raise ValueError("invalid World Bank indicator code")
        path="/v2/country/"+urllib.parse.quote(";".join(countries),safe=";")+"/indicator/"+urllib.parse.quote(a.indicator)
        query=urllib.parse.urlencode({"format":"json","date":str(a.start) +":"+str(a.end),"per_page":min(250,a.limit)})
        return "https://api.worldbank.org"+path+"?"+query
    if a.source=="usgs":
        if a.end<a.start: raise ValueError("End must not precede start")
        query=urllib.parse.urlencode({"format":"geojson","starttime":a.start,"endtime":a.end,"minmagnitude":a.min_magnitude,"limit":min(a.limit,200),"orderby":"time"})
        return "https://earthquake.usgs.gov/fdsnws/event/1/query?"+query
    return "https://eonet.gsfc.nasa.gov/api/v3/events?"+urllib.parse.urlencode({"limit":min(a.limit,100),"status":"open"})


def normalize_worldbank(obj):
    if not isinstance(obj,list) or len(obj)<2 or not isinstance(obj[1],list):raise ValueError("Invalid World Bank envelope")
    return [{"external_id":str(v.get("countryiso3code"))+"-"+str(v.get("indicator",{}).get("id"))+"-"+str(v.get("date")),
             "title":str(v.get("indicator",{}).get("value","indicator"))+" — "+str(v.get("country",{}).get("value","")),
             "period":str(v.get("date")),"value":v.get("value"),"unit":"As documented by World Bank indicator metadata",
             "country_iso3":v.get("countryiso3code"),"record_type":"indicator",
             "provenance":"World Bank Indicators API v2; historical values may be revised"} for v in obj[1] if v.get("value") is not None]


def normalize_usgs(obj):
    if obj.get("type")!="FeatureCollection":raise ValueError("Invalid USGS GeoJSON")
    out=[]
    for v in obj.get("features",[]):
        p=v.get("properties",{})
        ms=p.get("time")
        dt=datetime.fromtimestamp(ms/1000,timezone.utc).isoformat().replace("+00:00","Z") if isinstance(ms,(int,float)) else None
        out.append({"external_id":v.get("id"),"title":p.get("title"),"occurred_at":dt,"record_type":"earthquake",
                    "magnitude":p.get("mag"),"place":p.get("place"),"detail_url":p.get("url"),
                    "coordinates":v.get("geometry",{}).get("coordinates"),"provenance":"USGS ComCat; event values may be revised"})
    return out


def normalize_eonet(obj):
    if not isinstance(obj.get("events"),list):raise ValueError("Invalid NASA EONET response")
    out=[]
    for v in obj["events"]:
        g=v.get("geometry",[])
        out.append({"external_id":v.get("id"),"title":v.get("title"),"occurred_at":g[0].get("date") if g else None,
                    "record_type":"natural_event","status":"closed" if v.get("closed") else "open",
                    "categories":[c.get("id") for c in v.get("categories",[])],
                    "detail_url":v.get("link"),"provenance":"NASA EONET: source event and geometry can be revised"})
    return out


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",choices=["worldbank","usgs","eonet"],required=True)
    p.add_argument("--start",default="2026-10-01")
    p.add_argument("--end",default="2026-10-30")
    p.add_argument("--countries",default="PL,DE")
    p.add_argument("--indicator",default="FP.CPI.TOTL.ZG")
    p.add_argument("--min-magnitude",type=float,default=6.0)
    p.add_argument("--limit",type=int,default=40)
    p.add_argument("--fixture",type=pathlib.Path,help="Read local test fixture instead of calling any network API")
    p.add_argument("--output-dir",type=pathlib.Path,default=ROOT/"data/incoming")
    a=p.parse_args()
    if not 1<=a.limit<=250: p.error("limit must be 1..250")
    url=build_url(a)
    try:
        raw=json.loads(a.fixture.read_text(encoding="utf-8")) if a.fixture else request_json(url)
        normalizer={"worldbank":normalize_worldbank,"usgs":normalize_usgs,"eonet":normalize_eonet}[a.source]
        rows=normalizer(raw)[:a.limit]
        stamp=utc_now()
        payload={"source_id":a.source,"status":"review_required","retrieved_at":stamp,
                 "request_url":url,"source_documentation":{
                    "worldbank":"https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",
                    "usgs":"https://earthquake.usgs.gov/fdsnws/event/1/",
                    "eonet":"https://eonet.gsfc.nasa.gov/docs/v3"}[a.source],
                 "raw_sha256":hashlib.sha256(json.dumps(raw,sort_keys=True,ensure_ascii=False).encode()).hexdigest(),
                 "item_count":len(rows),"items":rows,
                 "warning":"Only discovery signals; no causal relation or fact-check approval implied. Review reuse permissions."}
        a.output_dir.mkdir(parents=True,exist_ok=True)
        target=a.output_dir/(a.source+"-"+stamp[:10]+".json")
        target.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"Wrote {len(rows)} review-only records to {target}")
    except (urllib.error.URLError,TimeoutError,ValueError,KeyError,json.JSONDecodeError) as ex:
        print("Ingestion failed: "+str(ex),file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
