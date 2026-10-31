#!/usr/bin/env python3
"""
make_elbe_basin.py — Build the Elbe basin entry (real boundary + rivers) for the Watershed Explorer.

Boundary: HydroBASINS v1c, Europe, level 6 (WWF / HydroSHEDS). All sub-basins sharing the MAIN_BAS id
of the sub-basin that contains Berlin are merged and simplified.
Rivers:   OpenStreetMap relations Elbe and Havel (ODbL), stored in data/basins/elbe_rivers_raw.json.

Outputs:
  data/basins/elbe_hydrobasins_lev06.geojson   raw (unsimplified) sub-basin polygons with attributes
  data/basins/elbe_basin.json                  simplified polygon, rivers, centre, area for the app

The HydroBASINS zip is not stored in the repository (13 MB); download it from the URL below and
check the SHA-256 in data/basins/PROVENANCE.md.

Usage: python3 scripts/make_elbe_basin.py /path/to/hybas_eu_lev06_v1c
Requires: shapely, pyshp

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import MultiLineString, Point, mapping, shape
from shapely.ops import linemerge, unary_union

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "data" / "basins"
RIVERS_FILE = OUT_DIR / "elbe_rivers_raw.json"
BERLIN = Point(13.4215, 52.5013)
BASIN_SIMPLIFY_DEG = 0.04
RIVER_SIMPLIFY_DEG = 0.015


def river_lines(elements, name):
    lines = []
    for rel in elements:
        if rel["tags"].get("name") != name:
            continue
        for m in rel.get("members", []):
            if m.get("type") == "way" and m.get("geometry") and m.get("role", "") in ("", "main_stream", "side_stream"):
                if m.get("role") == "side_stream":
                    continue
                lines.append([(p["lon"], p["lat"]) for p in m["geometry"]])
    merged = linemerge(MultiLineString(lines))
    return list(merged.geoms) if merged.geom_type == "MultiLineString" else [merged]


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    reader = shapefile.Reader(sys.argv[1])
    fields = [f[0] for f in reader.fields[1:]]
    rows = [(dict(zip(fields, sr.record)), shape(sr.shape.__geo_interface__)) for sr in reader.iterShapeRecords()]
    main_bas = next(r["MAIN_BAS"] for r, g in rows if g.contains(BERLIN))
    parts = [(r, g) for r, g in rows if r["MAIN_BAS"] == main_bas]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "elbe_hydrobasins_lev06.geojson").write_text(json.dumps({
        "type": "FeatureCollection",
        "features": [{"type": "Feature", "properties": r, "geometry": mapping(g)} for r, g in parts],
    }), encoding="utf-8")

    merged = unary_union([g for _, g in parts])
    simple = merged.simplify(BASIN_SIMPLIFY_DEG)
    if simple.geom_type != "Polygon":
        simple = max(simple.geoms, key=lambda x: x.area)
    ring = [[round(x, 3), round(y, 3)] for x, y in simple.exterior.coords]

    elements = json.loads(RIVERS_FILE.read_text(encoding="utf-8"))["elements"]
    rivers = []
    for name in ("Elbe", "Havel"):
        for ln in river_lines(elements, name):
            s = ln.simplify(RIVER_SIMPLIFY_DEG)
            if not s.is_empty and s.length > 0.2:
                rivers.append([[round(x, 3), round(y, 3)] for x, y in s.coords])

    cen = merged.representative_point()
    out = {
        "id": "basin-elbe",
        "main_bas": main_bas,
        "sub_basins": len(parts),
        "area_km2_hydrobasins": round(sum(r["SUB_AREA"] for r, _ in parts)),
        "bounds": [round(v, 3) for v in merged.bounds],
        "center": [round(cen.x, 3), round(cen.y, 3)],
        "polygon": ring,
        "rivers": rivers,
        "attribution": "Basin boundary: HydroBASINS v1c level 6 (c) WWF / HydroSHEDS (Lehner and Grill 2013). "
                       "Rivers: (c) OpenStreetMap contributors, ODbL 1.0.",
    }
    (OUT_DIR / "elbe_basin.json").write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in out.items() if k not in ("polygon", "rivers")}, indent=1))
    print("polygon vertices:", len(ring), "rivers:", len(rivers), [len(r) for r in rivers])


if __name__ == "__main__":
    main()

