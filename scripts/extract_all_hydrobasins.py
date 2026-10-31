#!/usr/bin/env python3
"""
extract_all_hydrobasins.py — Automated extraction of all 14 canonical basins from HydroBASINS (Level 05)

Extracts exact watershed boundaries for the 14 O.N.E. bioregional basins:
1.  Po Valley & Western Alpine Arc (basin-po, Europe)
2.  Rhine-Meuse-Danube Corridor (basin-rhine, Europe)
3.  Amazon Basin & Tapajós Sanctuary (basin-amazon, South America)
4.  Great Lakes & Laurentian Basin (basin-greatlakes, North America)
5.  Cascadia & Columbia Catchment (basin-cascadia, North America)
6.  Atacama Endorheic Basin & Altiplano (basin-atacama, South America)
7.  Congo Basin Equatorial Peatlands (basin-congo, Africa)
8.  Nilotic Riverine & Sudd Catchment (basin-nile, Africa)
9.  Fertile Crescent / Tigris-Euphrates (basin-rojava, Europe/West Asia shapefile)
10. Indus Glacial Runoff & Punjab Basin (basin-indus, Asia)
11. Western Ghats & Malabar Catchment (basin-kerala, Asia)
12. Yangtze & Southern River Commons (basin-yangtze, Asia)
13. Murray-Darling Basin (basin-murray, Australia/Oceania)
14. Baltic Taiga & Boreal Peatland Catchment (basin-baltic, Europe)

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import json
import os
import sys
from pathlib import Path
import shapefile
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

REPO_ROOT = Path(__file__).resolve().parent.parent
HB_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(os.environ.get("HB_DIR", REPO_ROOT / ".cache" / "hydrobasins"))
OUT_DIR = REPO_ROOT / "data" / "basins"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASIN_SPECS = {
    "basin-po": {
        "cont": "eu", "type": "main_bas", "val": 2050013010, "simplify": 0.03,
        "name": "Po Valley & Western Alpine Arc"
    },
    "basin-rhine": {
        "cont": "eu", "type": "main_bas", "val": 2050023010, "simplify": 0.04,
        "name": "Rhine-Meuse-Danube Corridor"
    },
    "basin-amazon": {
        "cont": "sa", "type": "main_bas", "val": 6050007000, "simplify": 0.08,
        "name": "Amazon Basin & Tapajós Sanctuary"
    },
    "basin-greatlakes": {
        "cont": "na", "type": "main_bas", "val": 7050034520, "simplify": 0.05,
        "name": "Great Lakes & Laurentian Basin"
    },
    "basin-cascadia": {
        "cont": "na", "type": "main_bas_tuple", "val": (7050014930, 7050014940), "simplify": 0.05,
        "name": "Cascadia & Columbia Catchment"
    },
    "basin-atacama": {
        "cont": "sa", "type": "pfaf_prefix_endo", "val": ("664", 2), "simplify": 0.04,
        "name": "Atacama Endorheic Basin & Altiplano"
    },
    "basin-congo": {
        "cont": "af", "type": "main_bas", "val": 1050020040, "simplify": 0.06,
        "name": "Congo Basin Equatorial Peatlands"
    },
    "basin-nile": {
        "cont": "af", "type": "main_bas", "val": 1050034260, "simplify": 0.06,
        "name": "Nilotic Riverine & Sudd Catchment"
    },
    "basin-rojava": {
        "cont": "eu", "type": "main_bas", "val": 2050073570, "simplify": 0.05,
        "name": "Fertile Crescent / Tigris-Euphrates"
    },
    "basin-indus": {
        "cont": "as", "type": "main_bas", "val": 4050033640, "simplify": 0.05,
        "name": "Indus Glacial Runoff & Punjab Basin"
    },
    "basin-kerala": {
        "cont": "as", "type": "pfaf_prefix", "val": "454", "simplify": 0.04,
        "name": "Western Ghats & Malabar Catchment"
    },
    "basin-yangtze": {
        "cont": "as", "type": "main_bas", "val": 4050009880, "simplify": 0.05,
        "name": "Yangtze & Southern River Commons"
    },
    "basin-murray": {
        "cont": "au", "type": "main_bas", "val": 5050073410, "simplify": 0.05,
        "name": "Murray-Darling Basin"
    },
    "basin-baltic": {
        "cont": "eu", "type": "pfaf_prefix", "val": "24", "simplify": 0.06,
        "name": "Baltic Taiga & Boreal Peatland Catchment"
    },
}

def extract_basin(spec):
    cont = spec["cont"]
    shp_path = HB_DIR / f"hybas_{cont}_lev05_v1c"
    r = shapefile.Reader(str(shp_path))
    fields = [f[0] for f in r.fields[1:]]

    geoms = []
    tot_area = 0.0
    sub_count = 0

    stype = spec["type"]
    val = spec["val"]

    for sr in r.iterShapeRecords():
        rec = dict(zip(fields, sr.record))
        match = False
        if stype == "main_bas" and rec["MAIN_BAS"] == val:
            match = True
        elif stype == "pfaf_prefix" and str(rec["PFAF_ID"]).startswith(val):
            match = True
        elif stype == "main_bas_tuple" and rec["MAIN_BAS"] in val:
            match = True
        elif stype == "pfaf_prefix_endo":
            prefix, endo = val
            if str(rec["PFAF_ID"]).startswith(prefix) and rec["ENDO"] == endo:
                match = True
        
        if match:
            geoms.append(shape(sr.shape.__geo_interface__))
            tot_area += rec["SUB_AREA"]
            sub_count += 1

    if not geoms:
        raise ValueError(f"No geometry matched for {spec['name']}")

    merged = unary_union(geoms)
    # Simplify polygon for crisp and fast canvas rendering
    simplified = merged.simplify(spec["simplify"])
    if simplified.geom_type == "MultiPolygon":
        # Keep dominant contiguous region or significant islands
        polys = [p for p in simplified.geoms if p.area > 0.05 * simplified.area]
        if len(polys) == 1:
            simplified = polys[0]
        else:
            simplified = max(simplified.geoms, key=lambda x: x.area)

    ring = [[round(x, 3), round(y, 3)] for x, y in simplified.exterior.coords]
    cen = merged.representative_point()

    return {
        "name": spec["name"],
        "sub_basins_count": sub_count,
        "area_km2_hydrobasins": round(tot_area),
        "bounds": [round(x, 2) for x in merged.bounds],
        "center": [round(cen.x, 3), round(cen.y, 3)],
        "polygon": ring,
        "attribution": "HydroBASINS Level 05 (c) WWF / HydroSHEDS (Lehner and Grill 2013)"
    }

def main():
    results = {}
    print(f"{'Basin ID':18} | {'Parts':5} | {'Area km²':10} | {'Center':16} | {'Bounds'}")
    print("-" * 75)
    for b_id, spec in BASIN_SPECS.items():
        res = extract_basin(spec)
        results[b_id] = res
        print(f"{b_id:18} | {res['sub_basins_count']:5} | {res['area_km2_hydrobasins']:10} | {str(res['center']):16} | {res['bounds']}")

    out_file = OUT_DIR / "canonical_hydrobasins_14.json"
    out_file.write_text(json.dumps(results, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\n[✓] Successfully extracted and saved all 14 basins to {out_file}!")

if __name__ == "__main__":
    main()

