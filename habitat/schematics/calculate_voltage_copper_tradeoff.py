#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. HABITAT (PILLAR 4B) — PARAMETRIC VOLTAGE & COPPER MASS TRADE-OFF CALCULATOR
File: habitat/schematics/calculate_voltage_copper_tradeoff.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Open engineering tool for Pillar 4B Co-Stewards and Collaborators to evaluate
ohmic line losses (P_loss = I^2 * R), required IEC 60228 copper conductor
cross-sections (mm^2), and embodied copper mass (kg) across different voltage
domains:
  - 48 V DC (SELV Intra-MHU short run <8m only — prohibitive over long distances)
  - 380 V DC (Bioregional Nanogrid Baseline)
  - 800 V DC (High-Voltage Solar String / Inter-Cluster Feeder)
  - 400 V AC 3-Phase (Standard Three-Phase AC Microgrid Comparison)

Usage:
  python3 habitat/schematics/calculate_voltage_copper_tradeoff.py
  python3 habitat/schematics/calculate_voltage_copper_tradeoff.py --power-kw 15 --distance-m 80 --max-drop-pct 2.0
"""

import argparse
import math

RHO_CU_20C = 0.017241  # Ohm * mm^2 / m (annealed copper at 20°C)
DENSITY_CU = 8.96e-3   # kg / (mm^2 * m)
IEC_60228_SECTIONS = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0, 150.0, 185.0, 240.0, 300.0]


def select_iec_section(min_area_mm2: float) -> float:
    """Returns the next standard IEC 60228 conductor cross-section >= min_area_mm2."""
    for sec in IEC_60228_SECTIONS:
        if sec >= min_area_mm2:
            return sec
    return math.ceil(min_area_mm2 / 50.0) * 50.0


def evaluate_voltage_option(label: str, voltage_v: float, power_kw: float, distance_m: float,
                            max_drop_pct: float, is_three_phase: bool = False) -> dict:
    """Computes current, minimum conductor cross-section, copper mass, and ohmic loss."""
    power_w = power_kw * 1000.0
    max_drop_v = voltage_v * (max_drop_pct / 100.0)

    if is_three_phase:
        # 3-phase balanced line (3 conductors, cos(phi) = 0.95)
        cos_phi = 0.95
        current_a = power_w / (math.sqrt(3.0) * voltage_v * cos_phi)
        min_area_mm2 = (math.sqrt(3.0) * RHO_CU_20C * distance_m * current_a * cos_phi) / max_drop_v
        n_conductors = 3
    else:
        # 2-wire DC loop (2 * distance_m)
        current_a = power_w / voltage_v
        min_area_mm2 = (2.0 * RHO_CU_20C * distance_m * current_a) / max_drop_v
        n_conductors = 2

    iec_area_mm2 = select_iec_section(min_area_mm2)
    r_single_conductor = (RHO_CU_20C * distance_m) / iec_area_mm2
    actual_loss_w = n_conductors * (current_a ** 2) * r_single_conductor
    actual_drop_pct = (actual_loss_w / power_w) * 100.0
    copper_mass_kg = n_conductors * iec_area_mm2 * distance_m * DENSITY_CU

    return {
        "label": label,
        "voltage_v": voltage_v,
        "current_a": round(current_a, 2),
        "min_area_mm2": round(min_area_mm2, 2),
        "iec_area_mm2": iec_area_mm2,
        "copper_mass_kg": round(copper_mass_kg, 2),
        "actual_loss_w": round(actual_loss_w, 1),
        "actual_drop_pct": round(actual_drop_pct, 2),
    }


def run_tradeoff_table(power_kw: float, distance_m: float, max_drop_pct: float) -> list:
    options = [
        ("48V DC (SELV Intra-Cabin Only)", 48.0, False),
        ("380V DC (Nanogrid Bus)", 380.0, False),
        ("400V AC 3-Phase (Microgrid)", 400.0, True),
        ("800V DC (Solar String / Feeder)", 800.0, False),
    ]
    return [evaluate_voltage_option(lbl, v, power_kw, distance_m, max_drop_pct, tp) for lbl, v, tp in options]


def main():
    parser = argparse.ArgumentParser(description="Pillar 4B Voltage & Copper Trade-Off Calculator")
    parser.add_argument("--power-kw", type=float, default=15.0, help="Transmitted active power in kW (default: 15.0)")
    parser.add_argument("--distance-m", type=float, default=80.0, help="One-way feeder distance in meters (default: 80.0)")
    parser.add_argument("--max-drop-pct", type=float, default=2.0, help="Maximum allowable voltage drop %% (default: 2.0)")
    args = parser.parse_args()

    results = run_tradeoff_table(args.power_kw, args.distance_m, args.max_drop_pct)

    print("=" * 88)
    print(f"O.N.E. PILLAR 4B — OHMIC LOSS & COPPER EMBODIED MASS TRADE-OFF")
    print(f"Scenario: P = {args.power_kw:.1f} kW | One-Way Run L = {args.distance_m:.1f} m | Max Drop <= {args.max_drop_pct:.1f}%")
    print("=" * 88)
    print(f"{'Architecture':<32} | {'I (A)':>8} | {'IEC mm²':>8} | {'Cu Mass':>10} | {'I²R Loss':>10} | {'Drop %':>7}")
    print("-" * 88)
    for r in results:
        print(
            f"{r['label']:<32} | {r['current_a']:>8.1f} | {r['iec_area_mm2']:>8.1f} | "
            f"{r['copper_mass_kg']:>7.2f} kg | {r['actual_loss_w']:>8.1f} W | {r['actual_drop_pct']:>6.2f}%"
        )
    print("=" * 88)
    print("Engineering Conclusion: 48V DC is restricted strictly to short (<8m) intra-MHU SELV")
    print("point-of-load runs. Solar fields and inter-node feeders MUST use >=380V DC or 400V AC.")


if __name__ == "__main__":
    main()

