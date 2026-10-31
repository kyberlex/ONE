# OpenStreetMap raw data — provenance

Raw extracts used to audit real urban blocks for the O.N.E. Watershed Explorer
(`docs/data/urban_blocks.json`). Kept in the repository so every derived number
can be traced to its source.

## License and attribution

Data © OpenStreetMap contributors, available under the
[Open Database License (ODbL) 1.0](https://www.openstreetmap.org/copyright).
Derived figures in this repository must keep this attribution.

## Files

| File | Source | OSM base timestamp | SHA-256 |
| :--- | :--- | :--- | :--- |
| `berlin_kreuzberg_raw.json` | Overpass API (`https://overpass-api.de/api/interpreter`) | 2026-10-31T20:15:06Z | `846bed153198f0ede489dc6660c5a94538a9b8b787173038566c137e7c72f5b9` |
| `pvgis_berlin_kreuzberg_2015_2020_raw.json.gz` | PVGIS v5.3 `seriescalc` (JRC, European Commission), SARAH3 radiation + ERA5 temperature | n/a (years 2015-2020) | `2b33d689ed0c137d6b81dd8c91739934a9910321065838264f7cfb7052ad65a3` |

### berlin_kreuzberg_raw.json

- Bounding box (S, W, N, E): `52.4945, 13.405, 52.5045, 13.43`
- Content: all `building` ways, plus `highway` ways of type primary, secondary,
  tertiary, residential, unclassified, living_street, pedestrian (and links),
  returned with `out tags geom`.
- Reproduce with:
  `python3 scripts/fetch_city_data.py berlin_kreuzberg`
  (the script uses a smaller window than the original manual query; the live database changes over time, so a new download will differ; the
  hash above identifies the exact snapshot used for the published numbers).

## Known limits of this data

- OSM carries no dwelling counts here (`building:flats` is absent), so the
  number of homes and inhabitants is always an **estimate** derived from gross
  floor area and declared assumptions, never a measured value.
- `building:levels` is a volunteer-declared tag, not a surveyed height.
  Buildings without it are excluded from floor-area totals (underestimate).
- Blocks are reconstructed by polygonizing the street network; small service
  lanes are not used as block boundaries.


### pvgis_berlin_kreuzberg_2015_2020_raw.json.gz

- Request: `https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?lat=52.5013&lon=13.4215&startyear=2015&endyear=2020&pvcalculation=1&peakpower=1&loss=14&angle=30&aspect=0&outputformat=json`
- Content: hourly PV yield of 1 kWp (30 degree tilt, south, 14% system losses) and 2 m air temperature.
- Used by `scripts/compute_berlin_block.py` for monthly PV yield and heating degree-hours (base 15 C).
- Solar and temperature data (c) European Commission, JRC (PVGIS).

## All cities (added with scripts/fetch_city_data.py)

For each of the 8 cities in `docs/data/urban_blocks.json` the repository keeps three raw files,
named after the city slug (e.g. `milan_loreto`):

| Pattern | Source | Notes |
| :--- | :--- | :--- |
| `<slug>_raw.json` | Overpass API, ODbL | Window of about 1.3 km x 1.5 km around the city centre (see `HALF_LAT`/`HALF_LON` in the script). |
| `pvgis_<slug>_2015_2020_raw.json.gz` | PVGIS v5.3 `seriescalc` | 1 kWp, 30 degree tilt, south, 14% losses; hourly PV yield and 2 m temperature. |
| `precip_<slug>_2015_2020_raw.json` | Open-Meteo archive (ERA5, Copernicus) | Daily precipitation sum, UTC. |

Reproduce: `python3 scripts/fetch_city_data.py` then `python3 scripts/compute_urban_blocks.py`.
The compute step writes `data/urban_blocks_model.json` (full monthly detail and all assumptions)
and updates the data fields of `docs/data/urban_blocks.json`.

### Known data gaps

- Austin and Detroit were replaced by Seattle (Capitol Hill) and Chicago (Lakeview) because their OSM blocks
  had no `building:levels`; their raw files were removed. Seattle has levels on 5 of 8 residential buildings:
  its floor area uses the mean of those 5, so treat it as medium reliability.
  Seattle drains to Puget Sound, so it belongs to the Cascadia bioregion but not strictly to the Columbia catchment.
- Rents, tariffs and water prices in `legacy_financial` are **illustrative, not verified** (Seattle and Chicago reuse the inputs of the cities they replaced).
- Heat demand outside Berlin is the Berlin TABULA reference scaled by heating degree-hours, not
  city-specific building stock data. Summer cooling is not modelled.
- The previous orthophoto files in `docs/assets/blocks/` are no longer used by the app (their source and
  licence could not be verified, and they were not georeferenced to the footprints).
