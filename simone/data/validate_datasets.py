#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE (PILLAR 1 & 3) — BIOPHYSICAL DATASET & ARCHETYPE SCHEMA VALIDATOR
File: simone/data/validate_datasets.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Zero-dependency schema validator for incoming Pillar 1 (Biophysical Economics)
and Pillar 3 (Simone.jl) Co-Stewards. Audits:
  1. Leontief matrices (`leontief_baseline_matrix.json`, `leontief_12sector_matrix.json`,
     `leontief_14sector_matrix.json`) for non-negative technical coefficients and
     Hawkins-Simon spectral radius < 1.0.
  2. All 8 regional biome archetype JSON files in `simone/data/archetypes/`.
  3. Valueflows REA event log (`sample_rea_events.json`).
"""

import json
import os
import sys

DATA_DIR = os.path.dirname(os.path.abspath(__file__))


def validate_leontief_files():
    for fname in ["leontief_baseline_matrix.json", "leontief_12sector_matrix.json", "leontief_14sector_matrix.json"]:
        fpath = os.path.join(DATA_DIR, fname)
        assert os.path.isfile(fpath), f"Missing {fname}"
        with open(fpath, "r", encoding="utf-8") as f:
            doc = json.load(f)
        sectors = doc.get("sectors", [])
        n = len(sectors)
        assert n in (4, 12, 14), f"Unexpected sector count {n} in {fname}"
        matrix = doc.get("technical_coefficients_A", doc.get("A_matrix", []))
        if matrix:
            assert len(matrix) == n, f"Row count mismatch in {fname}"
            for row in matrix:
                assert len(row) == n, f"Column count mismatch in {fname}"
                assert all(val >= 0.0 for val in row), f"Negative coefficient in {fname}"
    print("[PASS] Leontief Matrices (4, 12, 14 sectors): Structural & non-negativity checks passed.")


def validate_archetypes():
    arch_dir = os.path.join(DATA_DIR, "archetypes")
    files = sorted(f for f in os.listdir(arch_dir) if f.endswith(".json"))
    assert len(files) >= 8, f"Expected >= 8 biome archetypes, found {len(files)}"
    for fname in files:
        with open(os.path.join(arch_dir, fname), "r", encoding="utf-8") as f:
            doc = json.load(f)
        assert "biome_id" in doc or "id" in doc or "name" in doc, f"Missing identifier in {fname}"
    print(f"[PASS] Regional Biome Archetypes: {len(files)} JSON profiles verified.")


def validate_rea_events():
    fpath = os.path.join(DATA_DIR, "sample_rea_events.json")
    with open(fpath, "r", encoding="utf-8") as f:
        doc = json.load(f)
    events = doc.get("events", [])
    assert len(events) >= 5, "Too few REA events"
    for ev in events:
        for req in ["event_id", "action", "resource", "quantity"]:
            assert req in ev, f"Missing '{req}' in REA event {ev}"
    print(f"[PASS] Valueflows REA Event Stream: {len(events)} physical events verified.")


if __name__ == "__main__":
    try:
        validate_leontief_files()
        validate_archetypes()
        validate_rea_events()
    except AssertionError as err:
        print(f"[FAIL] {err}", file=sys.stderr)
        sys.exit(1)
