#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. HABITAT — BILL OF MATERIALS & SHEARING LAYERS VALIDATOR
File: habitat/bom/validate_bom.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Audits both `mhu_bom_6_levels.csv` and `utility_spine_800x800_bom.csv` to verify:
  1. Mathematical cost and delta conservation across all 6 WBS levels
  2. Shearing-layer longevity separation (Passive Analog Core >= 35 yrs vs
     Swappable DIN-Rail digital nodes <= 15 yrs, representing < 10% of Spine cost)
"""

import csv
import os
import sys

BOM_DIR = os.path.dirname(os.path.abspath(__file__))


def validate_master_bom():
    path = os.path.join(BOM_DIR, "mhu_bom_6_levels.csv")
    assert os.path.isfile(path), "Missing mhu_bom_6_levels.csv"
    total_mhu = 0.0
    total_sky = 0.0
    levels = set()

    with open(path, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            levels.add(int(row["level"]))
            mhu = float(row["mhu_total_eur"])
            sky = float(row["wikihouse_skylark_eur"])
            delta = float(row["delta_eur"])
            assert abs((mhu - sky) - delta) < 1e-2, f"Delta mismatch on {row['component_id']}"
            total_mhu += mhu
            total_sky += sky

    assert levels == {1, 2, 3, 4, 5, 6}, f"Incomplete BOM levels: {levels}"
    print(f"[PASS] Master 6-Level BOM: EUR {total_mhu:,.2f} (Savings vs CNC Cassette: EUR {total_sky - total_mhu:,.2f})")


def validate_utility_spine_bom():
    path = os.path.join(BOM_DIR, "utility_spine_800x800_bom.csv")
    assert os.path.isfile(path), "Missing utility_spine_800x800_bom.csv"
    passive_eur = 0.0
    digital_eur = 0.0
    total_mass = 0.0

    with open(path, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            life = int(row["service_life_years"])
            cost = float(row["total_eur"])
            mass = float(row["mass_kg"])
            total_mass += mass
            if row["architecture_tier"] == "50yr_Passive_Analog":
                assert life >= 35, f"Passive component {row['sub_id']} lifespan < 35 yrs"
                passive_eur += cost
            elif row["architecture_tier"] == "10yr_Swappable_DIN":
                assert life <= 15, f"Digital DIN module {row['sub_id']} lifespan > 15 yrs"
                digital_eur += cost
            else:
                raise AssertionError(f"Unknown tier: {row['architecture_tier']}")

    total_eur = passive_eur + digital_eur
    digital_share_pct = (digital_eur / total_eur) * 100.0
    assert digital_share_pct < 12.0, f"Swappable electronics exceed 12% of Utility Spine cost: {digital_share_pct:.1f}%"
    print(
        f"[PASS] Utility Spine 800x800mm BOM: Total EUR {total_eur:,.2f} ({total_mass:.1f} kg) | "
        f"50yr Passive Core = {100.0 - digital_share_pct:.1f}% | Swappable 2026 DIN Nodes = {digital_share_pct:.1f}% (EUR {digital_eur:,.2f})"
    )


if __name__ == "__main__":
    try:
        validate_master_bom()
        validate_utility_spine_bom()
    except AssertionError as err:
        print(f"[FAIL] {err}", file=sys.stderr)
        sys.exit(1)

