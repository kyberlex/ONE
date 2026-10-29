#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. HABITAT — AUTOMATED ENGINEERING & PRIVACY VERIFICATION SUITE
File: habitat/test_habitat_specs.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Zero-dependency verification script for Pillar 4A (Open-BIM CAD & Passivhaus Envelope)
and Pillar 4B (Zero-Cloud Home Assistant / ESPHome & 380V/48V DC Microgrid).
Run before submitting any Pull Request to `habitat/`:
    python3 habitat/test_habitat_specs.py
"""

import csv
import importlib.machinery
import importlib.util
import os
import re
import sys

HABITAT_DIR = os.path.dirname(os.path.abspath(__file__))


def load_macro_module(name, path):
    loader = importlib.machinery.SourceFileLoader(name, path)
    spec = importlib.util.spec_from_loader(loader.name, loader)
    mod = importlib.util.module_from_spec(spec)
    loader.exec_module(mod)
    return mod


def test_cad_macros_and_exports():
    """Verifies Eurocode 5 & Helical Pile calculations and checks DXF/STL fabrication files."""
    cad_dir = os.path.join(HABITAT_DIR, "cad")
    gusset_mod = load_macro_module("mhu_gusset", os.path.join(cad_dir, "generate_mhu_gusset.FCMacro"))
    docking_mod = load_macro_module("helical_docking", os.path.join(cad_dir, "generate_helical_pile_docking.FCMacro"))

    ec5 = gusset_mod.compute_eurocode5_shear_capacity()
    assert ec5["F_v_Rk_node_kN"] >= 50.0, f"EC5 nodal shear too low: {ec5['F_v_Rk_node_kN']} kN < 50 kN"

    pile = docking_mod.compute_pile_bearing_audit()
    assert pile["status"] == "PASS" and pile["geotech_safety_factor"] >= 2.0, (
        f"Helical pile safety factor below 2.0: {pile}"
    )

    required_cad_files = [
        "mhu_nodal_gusset_18mm.dxf",
        "mhu_nodal_gusset_18mm.stl",
        "helical_pile_docking_flange_s355.dxf",
        "helical_pile_docking_flange_s355.stl",
    ]
    for fname in required_cad_files:
        fpath = os.path.join(cad_dir, fname)
        assert os.path.isfile(fpath), f"Missing CAD export: {fname}"
        assert os.path.getsize(fpath) > 1000, f"CAD export unexpectedly small (<1KB): {fname}"

    print(f"[PASS] Track 4A CAD & Structural Audit: F_v,Rk = {ec5['F_v_Rk_node_kN']} kN, "
          f"Pile SF = {pile['geotech_safety_factor']}x, 4 DXF/STL artifacts verified.")


def test_bom_integrity():
    """Verifies the 6-level Bill of Materials CSV structure and total cost conservation."""
    bom_path = os.path.join(HABITAT_DIR, "bom", "mhu_bom_6_levels.csv")
    assert os.path.isfile(bom_path), "Missing habitat/bom/mhu_bom_6_levels.csv"

    mhu_sum = 0.0
    skylark_sum = 0.0
    levels_seen = set()

    with open(bom_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            levels_seen.add(int(row["level"]))
            mhu_cost = float(row["mhu_total_eur"])
            sky_cost = float(row["wikihouse_skylark_eur"])
            delta = float(row["delta_eur"])
            assert abs((mhu_cost - sky_cost) - delta) < 1e-2, f"Delta mismatch in {row['component_id']}"
            mhu_sum += mhu_cost
            skylark_sum += sky_cost

    assert levels_seen == {1, 2, 3, 4, 5, 6}, f"Expected BOM levels 1..6, found {levels_seen}"
    assert 70000.0 <= mhu_sum <= 75000.0, f"Unexpected MHU total BOM cost: {mhu_sum} EUR"
    assert mhu_sum < skylark_sum, "MHU hybrid chassis must remain more economical than pure CNC cassette baseline"
    print(f"[PASS] BOM 6-Level Audit: MHU Total = EUR {mhu_sum:,.2f} vs Skylark EUR {skylark_sum:,.2f} "
          f"(Net Savings: EUR {skylark_sum - mhu_sum:,.2f}).")


def test_automation_biometric_and_cloud_purity():
    """Scans all YAML configurations to enforce Zero Biometric Surveillance & Zero Cloud dependencies."""
    auto_dir = os.path.join(HABITAT_DIR, "automation")
    forbidden_patterns = [
        r"\bcamera\b",
        r"\bmicrophone\b",
        r"\bvoice_assistant\b",
        r"\bface_recognition\b",
        r"\baws_iot\b",
        r"\btuya_cloud\b",
        r"https?://",
    ]
    yaml_files = []
    for root, _, files in os.walk(auto_dir):
        for f in files:
            if f.endswith((".yaml", ".yml")):
                yaml_files.append(os.path.join(root, f))

    assert len(yaml_files) >= 4, f"Expected at least 4 YAML files in automation/, found {len(yaml_files)}"

    for ypath in yaml_files:
        with open(ypath, "r", encoding="utf-8") as f:
            content = f.read()
        # Strip comment lines before checking forbidden tokens
        active_lines = "\n".join(
            line for line in content.splitlines() if not line.strip().startswith("#")
        )
        for pat in forbidden_patterns:
            match = re.search(pat, active_lines, flags=re.IGNORECASE)
            assert match is None, f"Forbidden surveillance/cloud pattern '{pat}' found in {os.path.basename(ypath)}"

    print(f"[PASS] Track 4B Automation & Privacy Audit: {len(yaml_files)} YAML configs verified "
          "(100% local, zero cameras/microphones, zero cloud URLs).")


if __name__ == "__main__":
    print("=== O.N.E. HABITAT AUTOMATED SPECIFICATION AUDIT ===")
    try:
        test_cad_macros_and_exports()
        test_bom_integrity()
        test_automation_biometric_and_cloud_purity()
        print("=== ALL HABITAT VERIFICATION CHECKS PASSED ===")
    except AssertionError as err:
        print(f"[FAIL] {err}", file=sys.stderr)
        sys.exit(1)

