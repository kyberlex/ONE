#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. ADVERSARIAL BENCHMARK — SIM-QA-14: CRYO LITHIUM LOCKOUT & VOLTAGE DROP AUDIT
File: simone/benchmarks/sim_qa_14_cryo_and_voltage_drop.py
Author: Kyberlex <kyberlex@proton.me>
Pillar: Pillar 4B (DC Microgrid & Battery Safety Critic)
License: AGPL-3.0-or-later

Description:
Tests Docket SIM-QA-14 across two physical failure vectors:
  Vector A (Cryo Lithium Plating under MCU Freeze): Simulates an ESP32 firmware
    hang during a rapid polar temperature drop to -12°C while 1500W of solar PV
    is available. Verifies that the series bimetallic thermal switch (K1 coil
    break at +2.0°C) physically cuts charging current to 0.0A with zero silicon.
  Vector B (Long-Distance 48V DC Solar Feeder Ohmic Loss Failure): Demonstrates
    why 48V DC fails over a 100m solar array feeder (15 kW) and verifies that
    stepping up to 800V DC reduces copper mass by >99% while keeping drop <2%.
"""

import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO_ROOT, "habitat", "schematics"))
from calculate_voltage_copper_tradeoff import evaluate_voltage_option  # noqa: E402


def audit_cryo_hardware_interlock(cell_temp_c: float, mcu_frozen: bool, has_bimetallic_k1: bool) -> dict:
    # Software command fails open (stays at 30A charge) if MCU is frozen
    sw_charge_enable = True if mcu_frozen else (cell_temp_c > 2.0)
    # Hardware bimetallic switch in series with Contactor K1 opens physically at <= +2.0°C
    hw_k1_closed = (cell_temp_c > 2.0) if has_bimetallic_k1 else True

    charge_current_a = 30.0 if (sw_charge_enable and hw_k1_closed) else 0.0
    lithium_plating_hazard = (cell_temp_c <= 0.0) and (charge_current_a > 0.0)

    return {
        "cell_temp_c": cell_temp_c,
        "mcu_frozen": mcu_frozen,
        "has_bimetallic_k1": has_bimetallic_k1,
        "charge_current_a": charge_current_a,
        "verdict": "FAIL_LITHIUM_PLATING" if lithium_plating_hazard else "PASS_HARDWARE_SAFE",
    }


def main():
    sw_only = audit_cryo_hardware_interlock(cell_temp_c=-12.0, mcu_frozen=True, has_bimetallic_k1=False)
    hw_backed = audit_cryo_hardware_interlock(cell_temp_c=-12.0, mcu_frozen=True, has_bimetallic_k1=True)

    v48 = evaluate_voltage_option("48V DC over 100m", 48.0, power_kw=15.0, distance_m=100.0, max_drop_pct=2.0)
    v800 = evaluate_voltage_option("800V DC over 100m", 800.0, power_kw=15.0, distance_m=100.0, max_drop_pct=2.0)

    print("=" * 84)
    print("SIM-QA-14 BENCHMARK: CRYO HARDWARE INTERLOCK & SOLAR FEEDER OHMIC LOSS")
    print("=" * 84)
    print(f"[Vector A1] MCU Frozen @ -12°C (Software-Only):  I_chg = {sw_only['charge_current_a']:>4.1f} A -> {sw_only['verdict']}")
    print(f"[Vector A2] MCU Frozen @ -12°C (Bimetallic K1):  I_chg = {hw_backed['charge_current_a']:>4.1f} A -> {hw_backed['verdict']}")
    print("-" * 84)
    print(f"[Vector B1] 15kW @ 100m (48V DC):  Cu Mass = {v48['copper_mass_kg']:>7.1f} kg ({v48['iec_area_mm2']} mm²) -> PROHIBITIVE")
    print(f"[Vector B2] 15kW @ 100m (800V DC): Cu Mass = {v800['copper_mass_kg']:>7.1f} kg ({v800['iec_area_mm2']} mm²) -> PASS (<2% drop)")
    print("=" * 84)

    assert sw_only["verdict"] == "FAIL_LITHIUM_PLATING"
    assert hw_backed["verdict"] == "PASS_HARDWARE_SAFE"
    assert v800["copper_mass_kg"] < 15.0 and v48["copper_mass_kg"] > 1000.0


if __name__ == "__main__":
    main()
