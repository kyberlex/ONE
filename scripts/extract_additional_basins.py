#!/usr/bin/env python3
"""
extract_additional_basins.py — Extract real HydroBASINS geometries for missing city basins:
1. Thames Catchment (basin-thames, London) — hybas_eu_lev06
2. Tagus River Basin (basin-tagus, Madrid) — hybas_eu_lev06
3. Kanto Plain & Tone River (basin-tone, Tokyo) — hybas_as_lev06

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import json
import os
import sys
from pathlib import Path
import shapefile
from shapely.geometry import shape, Point
from shapely.ops import unary_union

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRATCH_HB = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(os.environ.get("HB_DIR", REPO_ROOT / ".cache" / "hydrobasins"))
OUT_FILE = REPO_ROOT / "data" / "basins" / "additional_hydrobasins_3.json"

BASIN_TARGETS = [
    {
        "id": "basin-thames",
        "tag": "BASIN-EUR-05",
        "name": "Thames River Catchment & Estuary",
        "biome": "temperate",
        "biomeIcon": "🌊",
        "biomeName": "Temperate Oceanic River Basin",
        "desc": "Drains southern England to the North Sea through London. Historic brick masonry terrace architecture with high domestic energy footprint. Boundary: HydroBASINS Level 06.",
        "area": "≈13,300 km²",
        "discharge": "≈66 m³/s",
        "exergy": "Wind + Tidal Hydro",
        "demarchy: ": "101 Citizens (Odd)",
        "nodeName": "Hackney Terrace Commons",
        "simParam": "rhine-meuse",
        "gameParam": "temperate",
        "zoomLevel": 5.8,
        "shp": SCRATCH_HB / "hybas_eu_lev06_v1c",
        "main_bas": 2060053790,
        "simplify": 0.02,
        "rivers": [[[-1.4, 51.7], [-0.5, 51.5], [0.1, 51.5], [0.6, 51.5]]]
    },
    {
        "id": "basin-tagus",
        "tag": "BASIN-EUR-06",
        "name": "Tagus River Basin / Tajo-Tejo Corridor",
        "biome": "arid",
        "biomeIcon": "☀️",
        "biomeName": "Mediterranean Semi-Arid Plateau",
        "desc": "Major Iberian river artery rising in the Montes Universales, traversing Madrid via the Manzanares and Lisbon to the Atlantic. Extreme summer heat and drought stress. Boundary: HydroBASINS Level 06.",
        "area": "≈71,100 km²",
        "discharge": "≈440 m³/s",
        "exergy": "Solar + Gravity Aqueducts",
        "demarchy": "101 Citizens (Odd)",
        "nodeName": "Lavapiés Corrala Commons",
        "simParam": "po-valley",
        "gameParam": "arid",
        "zoomLevel": 5.0,
        "shp": SCRATCH_HB / "hybas_eu_lev06_v1c",
        "main_bas": 2060018840,
        "simplify": 0.03,
        "rivers": [[[-2.0, 40.4], [-3.7, 40.0], [-6.5, 39.8], [-9.1, 38.7]]]
    },
    {
        "id": "basin-tone",
        "tag": "BASIN-EAS-02",
        "name": "Kanto Plain & Tone River Catchment",
        "biome": "riverine",
        "biomeIcon": "🌾",
        "biomeName": "Subtropical Coastal Plain & Canal Network",
        "desc": "Japan's largest alluvial catchment, draining the Kanto plain into Tokyo Bay and the Pacific. High summer monsoon precipitation and high-density micro-lot residential fabric. Boundary: HydroBASINS Level 06.",
        "area": "≈33,300 km²",
        "discharge": "≈290 m³/s",
        "exergy": "Solar + Micro-Canal Hydro",
        "demarchy": "101 Citizens (Odd)",
        "nodeName": "Setagaya Micro-Commons",
        "simParam": "yangtze",
        "gameParam": "riverine",
        "zoomLevel": 5.4,
        "shp": SCRATCH_HB / "hybas_as_lev06_v1c",
        "main_bas": 4060044550,
        "simplify": 0.02,
        "rivers": [[[138.8, 36.8], [139.7, 36.2], [140.4, 35.8], [140.8, 35.7]]]
    }
]

def main():
    results = {}
    for spec in BASIN_TARGETS:
        r = shapefile.Reader(str(spec["shp"]))
        fields = [f[0] for f in r.fields[1:]]
        parts = []
        tot_area = 0.0
        for sr in r.iterShapeRecords():
            rec = dict(zip(fields, sr.record))
            if rec['MAIN_BAS'] == spec['main_bas']:
                parts.append(shape(sr.shape.__geo_interface__))
                tot_area += rec['SUB_AREA']

        merged = unary_union(parts)
        simplified = merged.simplify(spec["simplify"])
        if simplified.geom_type == "MultiPolygon":
            simplified = max(simplified.geoms, key=lambda x: x.area)
        
        ring = [[round(x, 3), round(y, 3)] for x, y in simplified.exterior.coords]
        cen = merged.representative_point()

        entry = {k: v for k, v in spec.items() if k not in ("shp", "main_bas", "simplify")}
        entry["center"] = [round(cen.x, 3), round(cen.y, 3)]
        entry["polygon"] = ring
        entry["area_km2_hydrobasins"] = round(tot_area)
        entry["attribution"] = "HydroBASINS Level 06 (c) WWF / HydroSHEDS (Lehner and Grill 2013)"
        results[spec["id"]] = entry
        print(f"Extracted {spec['id']}: {len(ring)} vertices, center: {entry['center']}, area: {round(tot_area)} km²")

    OUT_FILE.write_text(json.dumps(results, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\n[✓] Successfully saved {len(results)} additional basins to {OUT_FILE}!")

if __name__ == "__main__":
    main()

