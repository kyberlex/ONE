# Basin boundaries and rivers — provenance

Added for the Elbe basin of the Watershed Explorer (`basin-elbe`). The other 14 basin polygons in
`scripts/build_docs_hub.py` are still hand-drawn schematic shapes with no source; only the Elbe uses a real boundary.

| File | Source | Notes |
| :--- | :--- | :--- |
| `elbe_hydrobasins_lev06.geojson` | HydroBASINS v1c, Europe, level 6 (WWF / HydroSHEDS, Lehner and Grill 2013) | The 9 sub-basins with `MAIN_BAS` = 2060024170 (the one containing Berlin), unsimplified, with their attributes. |
| `elbe_rivers_raw.json` | OpenStreetMap via Overpass API, ODbL 1.0 | Relations `Elbe` and `Havel`, fetched 2026-10-31. |
| `elbe_basin.json` | Derived | Simplified polygon (0.04 degrees), rivers (0.015 degrees), centre; read by `build_docs_hub.py`. |

Source archive (not stored, 13 MB): `https://data.hydrosheds.org/file/HydroBASINS/standard/hybas_eu_lev06_v1c.zip`
SHA-256 `6a4d9bcbadacbf6e32936970f84ec77c21809948085d79d1d1d4388964d607fa`.

Rebuild: `python3 scripts/make_elbe_basin.py /path/to/hybas_eu_lev06_v1c` (needs shapely and pyshp).

## Known limits

- HydroBASINS level 6 covers 138,383 km². The published Elbe catchment is about 148,000 km² (ICPER); the
  difference is the estuary section below Hamburg, which HydroBASINS assigns to other coastal units. The
  app shows the published figures for area and discharge (about 860 m3/s at the mouth, to verify) and
  draws only the part upstream of the estuary.
- Basin outlines are simplified for display, not for hydrological analysis.
