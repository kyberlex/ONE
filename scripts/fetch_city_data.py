#!/usr/bin/env python3
"""
fetch_city_data.py — Download raw source data for every urban block listed in docs/data/urban_blocks.json.

For each city it stores, under data/osm/ (see data/osm/PROVENANCE.md):
  <slug>_raw.json                          OpenStreetMap buildings + streets (Overpass, ODbL)
  pvgis_<slug>_2015_2020_raw.json.gz       PVGIS v5.3 hourly PV yield + 2 m temperature (JRC)
  precip_<slug>_2015_2020_raw.json         Open-Meteo archive (ERA5) daily precipitation

Files that already exist are skipped. Requests are spaced out to respect public-service limits.

Usage:  python3 scripts/fetch_city_data.py [slug ...]

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import gzip
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "data" / "osm"
BLOCKS_FILE = REPO_ROOT / "docs" / "data" / "urban_blocks.json"
UA = "ONE-commons-research/1.0 (kyberlex@proton.me)"
HALF_LAT, HALF_LON = 0.006, 0.010  # search window around the block centre (~1.3 km x 1.5 km)
START, END = 2015, 2020

HIGHWAY_RE = ("^(primary|secondary|tertiary|residential|unclassified|living_street|"
              "pedestrian|primary_link|secondary_link|tertiary_link)$")


def slug_of(block_id: str) -> str:
    return block_id.replace("-", "_")


def http(url: str, data: bytes | None = None, timeout: int = 120) -> bytes:
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def fetch_osm(slug, lat, lon):
    out = OUT_DIR / f"{slug}_raw.json"
    if out.exists():
        return
    s, w, n, e = lat - HALF_LAT, lon - HALF_LON, lat + HALF_LAT, lon + HALF_LON
    bbox = f"({s:.5f},{w:.5f},{n:.5f},{e:.5f})"
    q = (f'[out:json][timeout:90];(way["building"]{bbox};'
         f'way["highway"~"{HIGHWAY_RE}"]{bbox};);out tags geom;')
    out.write_bytes(http("https://overpass-api.de/api/interpreter",
                         urllib.parse.urlencode({"data": q}).encode()))
    print(f"  OSM  -> {out.name}")


def fetch_pvgis(slug, lat, lon):
    out = OUT_DIR / f"pvgis_{slug}_{START}_{END}_raw.json.gz"
    if out.exists():
        return
    url = (f"https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?lat={lat}&lon={lon}"
           f"&startyear={START}&endyear={END}&pvcalculation=1&peakpower=1&loss=14"
           f"&angle=30&aspect=0&outputformat=json")
    out.write_bytes(gzip.compress(http(url), 9))
    print(f"  PVGIS -> {out.name}")


def fetch_precip(slug, lat, lon):
    out = OUT_DIR / f"precip_{slug}_{START}_{END}_raw.json"
    if out.exists():
        return
    url = (f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
           f"&start_date={START}-01-01&end_date={END}-12-31&daily=precipitation_sum&timezone=UTC")
    out.write_bytes(http(url))
    print(f"  Precip -> {out.name}")


def main():
    blocks = json.loads(BLOCKS_FILE.read_text(encoding="utf-8"))
    wanted = set(sys.argv[1:])
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for b in blocks:
        slug = slug_of(b["id"])
        if wanted and slug not in wanted and b["id"] not in wanted:
            continue
        lon, lat = b["center"]
        print(b["id"])
        for fn in (fetch_osm, fetch_pvgis, fetch_precip):
            try:
                fn(slug, lat, lon)
            except Exception as exc:  # keep going; report at the end
                print(f"  !! {fn.__name__} failed: {exc}")
            time.sleep(8)


if __name__ == "__main__":
    main()

