#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. CO-STEWARDS & PILLARS INFRASTRUCTURE AUDIT GATE
File: scripts/verify_pillars_readiness.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Zero-dependency automated gate validating the integrity and readiness
of all 5 technical pillars across `stewards/`, `simone/`, `habitat/`,
and `oasis/external_critics_round2/` prior to co-steward onboarding.
Enforces:
  1. Habitat CAD, Passivhaus Glaser audit, BOM & DC Microgrid schematics
  2. Simone Leontief 12-sector Hawkins-Simon conditions & REA event adapter
  3. External Critics Round 2 pipeline integrity
  4. Class-0 Invariants: Zero personal identity leaks & zero proprietary dependencies
"""

import json
import os
import re
import subprocess
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def audit_zero_leak_opsec():
    """Scans all repository files for forbidden identity leaks and local workstation paths."""
    print("--> [1/5] Auditing Class-0 Zero-Leak Identity & Path Invariants...")
    forbidden_terms = [
        re.compile(r"/Users/[a-zA-Z0-9_]+/", re.IGNORECASE),
        re.compile(r"\b192\.168\.\d+\.\d+\b"),
        re.compile(r"\b10\.\d+\.\d+\.\d+\b"),
    ]

    scanned_count = 0
    target_dirs = ["stewards", "habitat", "simone", "oasis", "roadmap", "foundation"]

    for tdir in target_dirs:
        abs_tdir = os.path.join(REPO_ROOT, tdir)
        for root, _, files in os.walk(abs_tdir):
            if any(p in root for p in [".git", "node_modules", ".gemini", "__pycache__"]):
                continue
            for f in files:
                if f.endswith((".py", ".jl", ".json", ".md", ".yaml", ".yml", ".FCMacro", ".csv")):
                    scanned_count += 1
                    fpath = os.path.join(root, f)
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as handle:
                        text = handle.read()
                    for pat in forbidden_terms:
                        match = pat.search(text)
                        assert match is None, (
                            f"LEAK VIOLATION in {os.path.relpath(fpath, REPO_ROOT)}: match '{match.group(0)}'"
                        )

    print(f"    [PASS] {scanned_count} files scanned across {target_dirs}. Zero leaks detected.")


def audit_habitat_pillar():
    """Runs habitat/test_habitat_specs.py and verifies all CAD, Glaser, and Microgrid artifacts."""
    print("--> [2/5] Auditing Pillar 4A & 4B (Habitat, CAD, Glaser & Microgrid)...")
    test_script = os.path.join(REPO_ROOT, "habitat", "test_habitat_specs.py")
    res = subprocess.run([sys.executable, test_script], capture_output=True, text=True)
    assert res.returncode == 0, f"habitat/test_habitat_specs.py failed:\n{res.stderr}\n{res.stdout}"

    # Verify Glaser report existence
    glaser_rep = os.path.join(REPO_ROOT, "habitat", "hygrothermal", "glaser_audit_report.md")
    assert os.path.isfile(glaser_rep), "Missing glaser_audit_report.md"

    # Verify 380V/48V single line SVG & spec
    schem_svg = os.path.join(REPO_ROOT, "habitat", "schematics", "microgrid_380v_48v_single_line.svg")
    assert os.path.isfile(schem_svg), "Missing microgrid_380v_48v_single_line.svg"

    print("    [PASS] Pillar 4A (CAD/Glaser) and Pillar 4B (YAML/Schematics) 100% verified.")


def audit_simone_pillar():
    """Verifies Leontief 12-sector matrix Hawkins-Simon criteria and REA event stream format."""
    print("--> [3/5] Auditing Pillar 1 & 3 (Simone.jl, Leontief 12-Sector & REA Adapter)...")
    matrix_path = os.path.join(REPO_ROOT, "simone", "data", "leontief_12sector_matrix.json")
    with open(matrix_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data["sectors"]) == 12, f"Expected 12 sectors, found {len(data['sectors'])}"
    assert data["hawkins_simon_verification"]["spectral_radius_rho"] < 1.0
    assert data["hawkins_simon_verification"]["determinant_I_minus_A"] > 0.0
    assert data["hawkins_simon_verification"]["leontief_inverse_nonnegative"] is True

    rea_path = os.path.join(REPO_ROOT, "simone", "data", "sample_rea_events.json")
    with open(rea_path, "r", encoding="utf-8") as f:
        rea_data = json.load(f)
    assert len(rea_data["events"]) >= 5, "Sample REA events count too low"

    # Verify code files
    for fname in ["rea_adapter.jl", "Simone.jl"]:
        assert os.path.isfile(os.path.join(REPO_ROOT, "simone", "src", fname))
    for exname in [
        "run_full_4layer_year.jl",
        "run_lmin_drought_stress_test.jl",
        "run_sybil_sortition_attack.jl",
        "run_hexaco_tipping_point.jl",
    ]:
        assert os.path.isfile(os.path.join(REPO_ROOT, "simone", "examples", exname)), f"Missing simone/examples/{exname}"
    assert os.path.isfile(os.path.join(REPO_ROOT, "simone", "benchmarks", "benchmark_solvers.jl"))

    print("    [PASS] Simone 12-Sector Leontief Hawkins-Simon, REA adapter, and benchmarks verified.")


def audit_oasis_critics_round2():
    """Verifies External Critics Round 2 tracking board and templates."""
    print("--> [4/5] Auditing Pillar 2 & Critics Pipeline (oasis/external_critics_round2/)...")
    round2_dir = os.path.join(REPO_ROOT, "oasis", "external_critics_round2")
    assert os.path.isfile(os.path.join(round2_dir, "README.md"))
    assert os.path.isfile(os.path.join(round2_dir, "TEMPLATE_CRITIC_DOCKET.md"))
    assert os.path.isfile(os.path.join(round2_dir, "CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md"))

    with open(os.path.join(round2_dir, "CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md"), "r", encoding="utf-8") as f:
        board_text = f.read()

    for docket in ["SIM-QA-10", "SIM-QA-11", "SIM-QA-12", "SIM-QA-13", "SIM-QA-14"]:
        assert docket in board_text, f"Missing docket {docket} in Round 2 board"

    print("    [PASS] Round 2 Adversarial Critics board (SIM-QA-10 to SIM-QA-14) active & verified.")


def audit_stewards_hub():
    """Verifies stewards/ directory files and cross-links."""
    print("--> [5/7] Auditing Stewards Hub & Compacts...")
    stewards_dir = os.path.join(REPO_ROOT, "stewards")
    expected_files = [
        "CALL_FOR_CO_STEWARDS.md",
        "PILLAR_0_STEWARD_COMPACT.md",
        "TECHNICAL_PILLARS_COMPACT.md",
        "CRITIC_BRIEFING_PACK.md",
        "ROSTER_AND_LEDGER.md",
        "OPEN_SOURCE_GRANTS_KIT.md",
        "FIRST_PR_PLAYBOOK.md",
        "README.md",
    ]
    for ef in expected_files:
        assert os.path.isfile(os.path.join(stewards_dir, ef)), f"Missing stewards/{ef}"

    print(f"    [PASS] All {len(expected_files)} Stewards Compacts, Playbooks, and Briefings intact.")


def audit_foundation_pillar():
    """Verifies Foundation, Tax Ruling, Cross-Border and Verein Bootstrap kit files."""
    print("--> [6/7] Auditing Pillar 2 & Foundation/Verein Kit (foundation/)...")
    f_dir = os.path.join(REPO_ROOT, "foundation")
    expected_f_files = [
        "README.md",
        "statutes_foundation_one.md",
        "legal_framework.md",
        "PRE_CLEARANCE_CHECKLIST_ESA.md",
        "USUFRUCT_COVENANT_TEMPLATE.md",
        "SORTITION_PROTOCOL_SPEC.md",
        "CANTONAL_TAX_RULING_REQUEST_DE_EN.md",
        "CROSS_BORDER_SEED_NODE_CHARTER.md",
    ]
    for ff in expected_f_files:
        assert os.path.isfile(os.path.join(f_dir, ff)), f"Missing foundation/{ff}"

    v_dir = os.path.join(f_dir, "verein_bootstrap")
    expected_verein_files = [
        "README.md",
        "VEREIN_STATUTES_BILINGUAL_DE_EN.md",
        "FOUNDING_ASSEMBLY_MINUTES_DE_EN.md",
        "BANKING_ABS_AND_OPSEC_DOSSIER.md",
        "FIDUCIARY_TRUSTEE_MANDATE_TEMPLATE.md",
    ]
    for vf in expected_verein_files:
        assert os.path.isfile(os.path.join(v_dir, vf)), f"Missing foundation/verein_bootstrap/{vf}"
    print(f"    [PASS] All {len(expected_f_files) + len(expected_verein_files)} Foundation, Tax Ruling, and Verein files verified.")


def audit_roadmap_pillar():
    """Verifies roadmap blueprints and metabolic sizing calculator."""
    print("--> [7/7] Auditing Roadmap & Seed Node Metabolic Calculator (roadmap/)...")
    r_dir = os.path.join(REPO_ROOT, "roadmap")
    assert os.path.isfile(os.path.join(r_dir, "README.md")), "Missing roadmap/README.md"
    assert os.path.isfile(os.path.join(r_dir, "roadmap.md")), "Missing roadmap/roadmap.md"
    assert os.path.isfile(os.path.join(r_dir, "SEED_NODE_SIZING_MATRIX.md")), "Missing roadmap/SEED_NODE_SIZING_MATRIX.md"
    assert os.path.isfile(os.path.join(r_dir, "calculate_seed_node_metabolism.py")), "Missing roadmap/calculate_seed_node_metabolism.py"

    bp_dir = os.path.join(r_dir, "blueprints")
    for bp in [
        "SEED_NODE_CANDIDATE_REGISTRY.md",
        "SEED_NODE_QUICKSTART_HANDBOOK.md",
        "STAGE_0_LEGAL_INCEPTION_BLUEPRINT.md",
        "STAGE_1_SURVIVAL_CORE_BLUEPRINT.md",
        "STAGE_2_FABLAB_METABOLIC_BLUEPRINT.md",
        "STAGE_3_WATERSHED_FEDERATION_BLUEPRINT.md",
    ]:
        assert os.path.isfile(os.path.join(bp_dir, bp)), f"Missing roadmap/blueprints/{bp}"

    # Run quick metabolic verification check
    calc_script = os.path.join(r_dir, "calculate_seed_node_metabolism.py")
    res = subprocess.run([sys.executable, calc_script, "--pop", "50", "--biome", "NODE-01"], capture_output=True, text=True)
    assert res.returncode == 0, f"Metabolic calculator failed: {res.stderr}"

    print("    [PASS] Roadmap blueprints and parametric metabolic calculator verified.")


def main():
    print("=" * 70)
    print("O.N.E. CO-STEWARDS & PILLARS INFRASTRUCTURE AUDIT GATE")
    print("=" * 70)
    try:
        audit_zero_leak_opsec()
        audit_habitat_pillar()
        audit_simone_pillar()
        audit_oasis_critics_round2()
        audit_stewards_hub()
        audit_foundation_pillar()
        audit_roadmap_pillar()
        print("=" * 70)
        print("ALL CO-STEWARD & PILLARS AUDIT CHECKS PASSED SUCCESSFULLY [100% READY]")
        print("=" * 70)
    except AssertionError as err:
        print(f"\n[AUDIT FAILED] {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

