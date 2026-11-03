#!/usr/bin/env python3
"""
compute_urban_blocks.py — Traceable block audit for all cities in the O.N.E. Watershed Explorer.

Reads ONLY raw files stored in data/osm/ (see data/osm/PROVENANCE.md), computes a monthly
energy model and a daily rainwater-tank simulation per city, then:
  * writes the full detail to data/urban_blocks_model.json
  * rewrites the data fields of docs/data/urban_blocks.json (names, ids, flags, links are kept)

Every parameter is declared in ASSUMPTIONS with its status. Nothing is measured on site:
homes and inhabitants are ALWAYS estimates (OpenStreetMap carries no dwelling counts).

Requires: shapely, pyproj   (pip install shapely pyproj)
Run:      python3 scripts/compute_urban_blocks.py

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import collections
import gzip
import json
from pathlib import Path

from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import polygonize, transform, unary_union

REPO_ROOT = Path(__file__).resolve().parent.parent
OSM_DIR = REPO_ROOT / "data" / "osm"
BLOCKS_FILE = REPO_ROOT / "docs" / "data" / "urban_blocks.json"
MODEL_FILE = REPO_ROOT / "data" / "urban_blocks_model.json"

# Berlin block was chosen explicitly (best perimeter block with level data); others are
# selected automatically as the valid block closest to the city centre in urban_blocks.json.
BLOCK_POINT_OVERRIDE = {"berlin-kreuzberg": (52.5013, 13.4215), "tadley-uk": (51.3457284, -1.1427247)}
REFERENCE_CITY = "berlin-kreuzberg"

RESIDENTIAL_TYPES = {"apartments", "residential", "yes", "house", "terrace", "detached",
                     "semidetached_house", "dormitory"}

ASSUMPTIONS = {
    "usable_roof_fraction": (0.55, "assumption", "Share of footprint usable for PV (chimneys, shading, access)."),
    "pv_kwp_per_m2_panel": (0.200, "assumption", "Modern c-Si module, ~20% efficiency at STC."),
    "pv_tilt_azimuth": ("30 deg tilt, south, 14% system losses", "PVGIS input", "Applied to every city (no local roof geometry)."),
    "net_to_gross_floor": (0.80, "assumption", "Net heated area as share of gross floor area from OSM levels."),
    "net_area_per_flat_m2": (70.0, "assumption", "Average net area per dwelling, identical for all cities."),
    "persons_per_flat": (1.9, "assumption", "Average household size, identical for all cities."),
    "default_levels_untagged": ("mean of tagged buildings in the block", "assumption", "Used for buildings without building:levels."),
    "heat_demand_reference_kwh_m2_yr": (180.0, "literature, to verify", "IWU TABULA Gruenderzeit multi-family house, unrenovated (~170-190); verify on TABULA WebTool. Applied to Berlin."),
    "heat_demand_scaling": ("by heating degree-hours (base 15 C) relative to Berlin", "assumption", "No city-specific building stock data: other cities are scaled from the Berlin reference. Treat as order of magnitude."),
    "heat_demand_deep_retrofit_kwh_m2_yr": (50.0, "assumption", "Berlin value after deep retrofit; scaled like the reference."),
    "heat_pump_cop": (3.0, "assumption", "Seasonal COP held constant (real winter COP is lower, so winter coverage is optimistic)."),
    "household_electricity_kwh_flat_yr": (2000.0, "assumption", "Appliances and lighting, flat over the year, identical for all cities."),
    "cooling": ("not modelled", "limitation", "Summer cooling load (Austin, Madrid, Tokyo) is excluded."),
    "runoff_coefficient": (0.85, "literature", "Typical roof runoff coefficient (DIN 1989-1 range 0.8-0.9)."),
    "flush_litres_person_day": (30.0, "assumption", "Toilet flushing demand per person."),
    "tank_m3_per_home": (1.5, "assumption", "Distributed storage sizing; tank is simulated day by day against ERA5 rain."),
}
A = {k: v[0] for k, v in ASSUMPTIONS.items()}
HDH_BASE_C = 15.0
FOOTPRINT_SIMPLIFY_M = 0.6


def slug(block_id):
    return block_id.replace("-", "_")


def utm_for(lon):
    zone = int((lon + 180) // 6) + 1
    return Transformer.from_crs(4326, 32600 + zone, always_xy=True)  # northern hemisphere only


def pick_block(block_id, center, osm_elements, to_m, to_ll):
    proj = lambda g: transform(to_m.transform, g)
    streets = [(proj(LineString([(p["lon"], p["lat"]) for p in e["geometry"]])), e["tags"])
               for e in osm_elements if "highway" in e.get("tags", {}) and len(e["geometry"]) > 1]
    buildings = [(proj(Polygon([(p["lon"], p["lat"]) for p in e["geometry"]])).buffer(0), e["tags"])
                 for e in osm_elements
                 if "building" in e.get("tags", {}) and e["geometry"][0] == e["geometry"][-1]
                 and len(e["geometry"]) > 3]
    blocks = list(polygonize(unary_union([s for s, _ in streets])))

    def stats(blk):
        ins = [(g, t) for g, t in buildings if g.representative_point().within(blk)]
        res = [(g, t) for g, t in ins if t.get("building") in RESIDENTIAL_TYPES]
        fp = sum(g.area for g, _ in res)
        tagged = sum(1 for _, t in res if t.get("building:levels"))
        return ins, res, fp, tagged

    if block_id in BLOCK_POINT_OVERRIDE:
        pt = proj(Point(BLOCK_POINT_OVERRIDE[block_id][1], BLOCK_POINT_OVERRIDE[block_id][0]))
        chosen = next((b for b in blocks if b.contains(pt)), None)
    else:
        c = proj(Point(center[0], center[1]))
        cands = []
        for blk in blocks:
            if not (6000 < blk.area < 60000):
                continue
            ins, res, fp, tagged = stats(blk)
            if len(res) < 6 or fp / blk.area < 0.12:
                continue
            ratio = tagged / len(res)
            cands.append((ratio >= 0.6, -blk.centroid.distance(c), ratio, blk))
        cands.sort(key=lambda x: (x[0], x[1]), reverse=True)
        chosen = cands[0][3] if cands else None
    if chosen is None:
        raise SystemExit(f"{block_id}: no valid block found")

    ins, res, fp, tagged = stats(chosen)
    named = []
    for s, t in streets:
        if t.get("name") and s.distance(chosen) < 6 and t["name"] not in named:
            named.append(t["name"])
    if "Monkswood Crescent" in named:
        named.remove("Monkswood Crescent")
        named.insert(0, "Monkswood Crescent")
    return chosen, ins, res, fp, tagged, named


def levels_gfa(res, block_id=""):
    tagged = [(g, float(t["building:levels"])) for g, t in res
              if str(t.get("building:levels", "")).replace(".", "", 1).isdigit()]
    if tagged:
        mean_lv = (sum(g.area * lv for g, lv in tagged) / sum(g.area for g, _ in tagged))
    elif block_id == "tadley-uk":
        mean_lv = 2.0
    else:
        mean_lv = 1.0
    tagged_ids = {id(g) for g, _ in tagged}
    gfa = sum(g.area * lv for g, lv in tagged)
    gfa += sum(g.area * mean_lv for g, t in res if id(g) not in tagged_ids)
    return gfa, mean_lv, len(tagged)


def climate(slug_name):
    pv = json.loads(gzip.open(OSM_DIR / f"pvgis_{slug_name}_2015_2020_raw.json.gz", "rt", encoding="utf-8").read())
    hourly = pv["outputs"]["hourly"]
    years = len({r["time"][:4] for r in hourly})
    kwh_kwp = collections.defaultdict(float)
    hdh = collections.defaultdict(float)
    for r in hourly:
        m = int(r["time"][4:6])
        kwh_kwp[m] += r["P"] / 1000.0 / years
        hdh[m] += max(0.0, HDH_BASE_C - r["T2m"]) / years
    pr = json.loads((OSM_DIR / f"precip_{slug_name}_2015_2020_raw.json").read_text(encoding="utf-8"))
    return kwh_kwp, hdh, pr["daily"]["precipitation_sum"], years


def tank_simulation(rain_mm_days, roof_m2, tank_m3, demand_l_day):
    stored = tank_m3 * 1000.0
    cap = stored
    met = needed = 0.0
    empty_days = 0
    for mm in rain_mm_days:
        stored = min(cap, stored + (mm or 0.0) * roof_m2 * A["runoff_coefficient"])
        take = min(stored, demand_l_day)
        stored -= take
        met += take
        needed += demand_l_day
        empty_days += stored <= 0.0
    return 100.0 * met / needed, 100.0 * empty_days / len(rain_mm_days)


def main():
    base = json.loads(BLOCKS_FILE.read_text(encoding="utf-8"))
    hdh_ref = sum(climate(slug(REFERENCE_CITY))[1].values())
    model = []
    for b in base:
        bid = b["id"]
        s = slug(bid)
        lon0, lat0 = b["center"]
        to_m = utm_for(lon0)
        to_ll = Transformer.from_crs(to_m.target_crs, 4326, always_xy=True)
        osm = json.loads((OSM_DIR / f"{s}_raw.json").read_text(encoding="utf-8"))["elements"]
        blk, ins, res, fp, tagged, streets = pick_block(bid, (lon0, lat0), osm, to_m, to_ll)
        gfa, mean_lv, n_tag = levels_gfa(res, bid)
        kwh_kwp, hdh, rain_days, years = climate(s)

        net = gfa * A["net_to_gross_floor"]
        flats = net / A["net_area_per_flat_m2"]
        persons = flats * A["persons_per_flat"]
        kwp = fp * A["usable_roof_fraction"] * A["pv_kwp_per_m2_panel"]
        hdh_tot = sum(hdh.values())
        scale = hdh_tot / hdh_ref
        heat = {"unrenovated": A["heat_demand_reference_kwh_m2_yr"] * scale,
                "deep_retrofit": A["heat_demand_deep_retrofit_kwh_m2_yr"] * scale}

        monthly = []
        house_mwh = flats * A["household_electricity_kwh_flat_yr"] / 12.0 / 1000.0
        for m in range(1, 13):
            pv = kwp * kwh_kwp[m] / 1000.0
            row = {"month": m, "pv_mwh": round(pv, 1), "household_elec_mwh": round(house_mwh, 1)}
            for k, d in heat.items():
                heat_mwh = net * d * (hdh[m] / hdh_tot) / 1000.0
                elec = house_mwh + heat_mwh / A["heat_pump_cop"]
                row[f"heat_{k}_mwh"] = round(heat_mwh, 1)
                row[f"elec_{k}_mwh"] = round(elec, 1)
                row[f"pv_coverage_{k}_pct"] = round(100 * pv / elec)
            monthly.append(row)
        tot = lambda key: sum(r[key] for r in monthly)

        annual_mm = sum((x or 0.0) for x in rain_days) / years
        rain_l = fp * annual_mm * A["runoff_coefficient"]
        tank_m3 = flats * A["tank_m3_per_home"]
        flush_day = persons * A["flush_litres_person_day"]
        flush_met, empty_pct = tank_simulation(rain_days, fp, tank_m3, flush_day)

        # Geometry for the app: footprints normalised to the block bounding box (y down).
        minx, miny, maxx, maxy = blk.bounds
        w, h = maxx - minx, maxy - miny
        norm = lambda g: [[round((x - minx) / w, 4), round(1 - (y - miny) / h, 4)] for x, y in g.exterior.coords]
        foot = []
        for g, _ in res:
            sg = g.simplify(FOOTPRINT_SIMPLIFY_M)
            if sg.geom_type == "Polygon" and not sg.is_empty:
                foot.append(norm(sg))
        outline = norm(blk.simplify(FOOTPRINT_SIMPLIFY_M)) if blk.geom_type == "Polygon" else []
        llb = [to_ll.transform(minx, miny), to_ll.transform(maxx, maxy)]
        cx, cy = to_ll.transform(*blk.centroid.coords[0])

        jan = monthly[0]
        info = {
            "id": bid,
            "block_area_m2": round(blk.area),
            "buildings_total": len(ins),
            "residential_like": len(res),
            "levels_tagged": n_tag,
            "mean_levels": round(mean_lv, 1),
            "footprint_m2": round(fp),
            "coverage_pct": round(100 * fp / blk.area),
            "gfa_m2": round(gfa),
            "homes_est": round(flats),
            "inhabitants_est": round(persons),
            "pv_kwp": round(kwp),
            "pv_mwh_yr": round(tot("pv_mwh")),
            "elec_unrenovated_mwh_yr": round(tot("elec_unrenovated_mwh")),
            "elec_deep_retrofit_mwh_yr": round(tot("elec_deep_retrofit_mwh")),
            "heat_scale_vs_berlin": round(scale, 2),
            "bounding_streets": streets,
            "precip_mm_yr": round(annual_mm),
            "rain_liters_yr": round(rain_l),
            "tank_m3": round(tank_m3),
            "flush_demand_met_pct": round(flush_met),
            "tank_empty_days_pct": round(empty_pct),
            "jan_pv_coverage_unrenovated_pct": jan["pv_coverage_unrenovated_pct"],
            "jan_pv_coverage_deep_retrofit_pct": jan["pv_coverage_deep_retrofit_pct"],
            "monthly": monthly,
            "geometry": {"center": [round(cx, 6), round(cy, 6)],
                         "bbox": [round(llb[0][0], 6), round(llb[0][1], 6), round(llb[1][0], 6), round(llb[1][1], 6)],
                         "aspect_w_over_h": round(w / h, 3),
                         "footprints": foot, "outline": outline},
        }
        model.append(info)

        # ---- write back into the app dataset (names, flags, links preserved) ----
        b["center"] = info["geometry"]["center"]
        b["bbox"] = info["geometry"]["bbox"]
        b["units"] = info["homes_est"]
        b["inhabitants"] = info["inhabitants_est"]
        b["roofArea_m2"] = info["footprint_m2"]
        b["polygons"] = []  # legacy field; real footprints are in "footprints"
        b["extent_m"] = [round(w), round(h)]
        b["footprints"] = foot
        b["block_outline"] = outline
        b["aspect"] = info["geometry"]["aspect_w_over_h"]
        b["bounding_streets"] = streets
        b.pop("streets", None)
        b.pop("dimensions", None)
        b.pop("tacticalPolygon", None)
        b["typology"] = f"{info['residential_like']} buildings, {info['mean_levels']} levels on average, {info['coverage_pct']}% site coverage"
        b["bioclimatic"] = {"solar_annual_kwh_kwp": round(sum(kwh_kwp.values())),
                            "precip_annual_mm": info["precip_mm_yr"]}
        b["audit_thermodynamics"] = {
            "epv_mwh_yr": info["pv_mwh_yr"],
            "elec_demand_unrenovated_mwh_yr": info["elec_unrenovated_mwh_yr"],
            "elec_demand_deep_retrofit_mwh_yr": info["elec_deep_retrofit_mwh_yr"],
            "rain_liters_yr": info["rain_liters_yr"],
            "rain_label": f"{info['rain_liters_yr'] / 1e6:.2f}M L/yr",
            "tank_m3": info["tank_m3"],
            "flush_demand_met_pct": info["flush_demand_met_pct"],
            "jan_pv_coverage_unrenovated_pct": info["jan_pv_coverage_unrenovated_pct"],
            "jan_pv_coverage_deep_retrofit_pct": info["jan_pv_coverage_deep_retrofit_pct"],
            "monthly_pv_mwh": [r["pv_mwh"] for r in monthly],
            "monthly_elec_unrenovated_mwh": [r["elec_unrenovated_mwh"] for r in monthly],
            "monthly_elec_deep_retrofit_mwh": [r["elec_deep_retrofit_mwh"] for r in monthly],
        }
        lf = b["legacy_financial"]
        drain = (b["units"] * lf["monthly_rent_eur"] * 12 * 30
                 + b["units"] * lf["elec_demand_kwh_unit_yr"] * lf["grid_elec_eur_kwh"] * 30
                 + b["inhabitants"] * lf["water_demand_m3_capita_yr"] * lf["water_eur_m3"] * 30)
        lf["drain_30y_eur"] = round(drain)
        lf["drain_30y_label"] = f"€{drain / 1e6:.1f}M"
        b["data_quality"] = {
            "geometry": "OpenStreetMap (ODbL), real footprints",
            "levels": f"{n_tag}/{len(res)} buildings with declared levels" if n_tag > 0 else f"estimated {mean_lv:.1f} levels (suburban residential)",
            "homes_inhabitants": "estimated from gross floor area",
            "energy_climate": "PVGIS v5.3 + ERA5, 2015-2020",
            "financial_inputs": "field reported by resident (Exalyte on Reddit): rent £1,150-£2,073, elec 32p/kWh, gas 8p/kWh" if bid == "tadley-uk" else "illustrative, not verified",
            "heat_demand": "Berlin TABULA reference scaled by degree-hours" if bid != REFERENCE_CITY else "IWU TABULA reference (to verify)",
        }
        b["bottleneck"] = {
            "title": f"January: solar covers {info['jan_pv_coverage_unrenovated_pct']}% of demand "
                     f"({info['jan_pv_coverage_deep_retrofit_pct']}% after deep retrofit)",
            "desc": "Modelled January PV output against heat-pump heating plus household electricity.",
            "habitat_link": b.get("bottleneck", {}).get("habitat_link", "https://github.com/kyberlex/ONE/tree/main/habitat"),
            "sim_link": b.get("bottleneck", {}).get("sim_link", ""),
        }
        print(f"{bid:20} homes~{info['homes_est']:5} fp {info['footprint_m2']:6} m2  PV {info['pv_mwh_yr']:5} MWh  "
              f"demand {info['elec_unrenovated_mwh_yr']:5}/{info['elec_deep_retrofit_mwh_yr']:5}  "
              f"Jan {info['jan_pv_coverage_unrenovated_pct']:3}%/{info['jan_pv_coverage_deep_retrofit_pct']:3}%  "
              f"flush {info['flush_demand_met_pct']}%  levels {n_tag}/{len(res)}  {streets[:3]}")

    MODEL_FILE.write_text(json.dumps({"assumptions": {k: {"value": v[0], "status": v[1], "note": v[2]} for k, v in ASSUMPTIONS.items()},
                                      "blocks": model,
                                      "attribution": "Building and street data (c) OpenStreetMap contributors, ODbL 1.0. "
                                                     "Solar and temperature: PVGIS v5.3 (c) European Commission, JRC. "
                                                     "Precipitation: Open-Meteo archive (ERA5, Copernicus)."},
                                     indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    BLOCKS_FILE.write_text(json.dumps(base, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
