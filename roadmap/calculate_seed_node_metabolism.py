#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. ROADMAP — PARAMETRIC SEED NODE SIZING & METABOLIC CALCULATOR
File: roadmap/calculate_seed_node_metabolism.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Zero-dependency biophysical calculator for pioneer community founders,
Pillar 1 economists, and Pillar 4 architects.
Computes exact thermodynamic, structural, agronomic, and demarchic
sizing parameters for physical Seed Nodes across 5 planetary biomes.

Usage:
    python3 roadmap/calculate_seed_node_metabolism.py --pop 150 --biome NODE-01
    python3 roadmap/calculate_seed_node_metabolism.py --all
"""

import argparse
import math
import sys

BIOME_METRICS = {
    "NODE-01": {
        "name": "Oceanic Galicia (Atlantic Temperate)",
        "koppen": "Cfb",
        "solar_yield_kwh_kwp_day": 3.6,
        "annual_rainfall_mm": 1350.0,
        "dry_spell_days": 45,
        "agri_yield_mcal_ha_yr": 18500.0,  # 18.5 million kcal/ha/yr (bio-intensive agroforestry)
        "winter_heat_kwh_cap_day": 2.2,
    },
    "NODE-02": {
        "name": "Montane Andes (Highland Subtropical)",
        "koppen": "Cwb",
        "solar_yield_kwh_kwp_day": 5.2,
        "annual_rainfall_mm": 780.0,
        "dry_spell_days": 90,
        "agri_yield_mcal_ha_yr": 14000.0,  # 14.0 million kcal/ha/yr
        "winter_heat_kwh_cap_day": 3.1,
    },
    "NODE-03": {
        "name": "Tropical Monsoon (Western Ghats)",
        "koppen": "Am",
        "solar_yield_kwh_kwp_day": 4.5,
        "annual_rainfall_mm": 2800.0,
        "dry_spell_days": 120,
        "agri_yield_mcal_ha_yr": 24000.0,  # 24.0 million kcal/ha/yr
        "winter_heat_kwh_cap_day": 0.0,
    },
    "NODE-04": {
        "name": "Equatorial Rift (East African Highlands)",
        "koppen": "Aw",
        "solar_yield_kwh_kwp_day": 5.4,
        "annual_rainfall_mm": 950.0,
        "dry_spell_days": 75,
        "agri_yield_mcal_ha_yr": 20000.0,  # 20.0 million kcal/ha/yr
        "winter_heat_kwh_cap_day": 0.5,
    },
    "NODE-05": {
        "name": "Continental Ozarks (Four-Season Temperate)",
        "koppen": "Dfa",
        "solar_yield_kwh_kwp_day": 4.1,
        "annual_rainfall_mm": 1100.0,
        "dry_spell_days": 60,
        "agri_yield_mcal_ha_yr": 16500.0,  # 16.5 million kcal/ha/yr
        "winter_heat_kwh_cap_day": 4.5,
    },
}

PER_CAPITA_DAILY_STANDARDS = {
    "exergy_electric_kwh": 3.0,       # Tier 1 domestic + refrigeration + water pump
    "potable_water_liters": 100.0,     # Drinking, cooking, personal hygiene
    "caloric_intake_kcal": 2400.0,     # Nutrition-dense whole food baseline
    "mhu_occupancy_per_54m2": 2.0,     # 2 adults per 54m² 3-bay modular dwelling
    "reedbed_greywater_m2": 2.5,       # Sizing for subsurface vertical flow reed bed
}


def compute_seed_node_metabolism(pop, biome_code):
    """Computes comprehensive metabolic sizing for a given population and biome."""
    if biome_code not in BIOME_METRICS:
        raise ValueError(f"Unknown biome code {biome_code}. Valid options: {list(BIOME_METRICS.keys())}")

    b = BIOME_METRICS[biome_code]

    # 1. Structural & Housing
    n_mhu = math.ceil(pop / PER_CAPITA_DAILY_STANDARDS["mhu_occupancy_per_54m2"])
    total_living_area_m2 = n_mhu * 54.0

    # 2. Daily Demands
    daily_exergy_kwh = pop * (PER_CAPITA_DAILY_STANDARDS["exergy_electric_kwh"] + b["winter_heat_kwh_cap_day"])
    daily_water_l = pop * PER_CAPITA_DAILY_STANDARDS["potable_water_liters"]
    annual_calories_mcal = (pop * PER_CAPITA_DAILY_STANDARDS["caloric_intake_kcal"] * 365.25) / 1000.0

    # 3. Energy Hardware Sizing
    # Required PV array (kWp) with 20% system margin
    pv_kwp = (daily_exergy_kwh / b["solar_yield_kwh_kwp_day"]) * 1.20
    # Battery storage: 3 days of autonomy in 48V/380V LFP
    battery_kwh = daily_exergy_kwh * 3.0

    # 4. Water Substrate Sizing
    # Cistern buffer covering the historic dry spell duration
    cistern_liters = daily_water_l * b["dry_spell_days"]
    # Phytodepuration reed bed surface
    reedbed_m2 = pop * PER_CAPITA_DAILY_STANDARDS["reedbed_greywater_m2"]

    # 5. Food & Agroforestry Land Sizing
    # Required arable/agroforestry hectares with 25% safety reserve
    arable_ha = (annual_calories_mcal / b["agri_yield_mcal_ha_yr"]) * 1.25

    # 6. Demarchic Governance Sizing
    if pop <= 30:
        jury_size = 3
        council_tier = "Direct Assembly / 3-Member Mediation Panel"
    elif pop <= 100:
        jury_size = 15
        council_tier = "Neighborhood Commons Council (15 Jurors)"
    else:
        jury_size = 101
        council_tier = "Bioregional Seed Assembly (101 Jurors)"

    supermajority_threshold_seats = math.ceil(jury_size * 0.75)

    # 7. Estimated Transition CapEx (Stage 0 to Stage 2 Self-Build in EUR)
    # MHU cost: €72,690 per unit (BOM Level 6)
    capex_housing_eur = n_mhu * 72690.0
    # Microgrid (PV + LFP + inverters): ~€650 per kWh of battery + PV
    capex_energy_eur = battery_kwh * 400.0 + pv_kwp * 700.0
    # Water & Earthworks (cisterns, plumbing, reed bed): ~€0.25 per liter cistern + civil works
    capex_water_eur = cistern_liters * 0.35 + reedbed_m2 * 45.0
    # Agroforestry tools, nursery tree stock & fencing: ~€3,500 per ha
    capex_agri_eur = arable_ha * 3500.0
    # Legal inception & Swiss Verein asset lock reserve
    capex_legal_eur = 12000.0

    capex_total_eur = capex_housing_eur + capex_energy_eur + capex_water_eur + capex_agri_eur + capex_legal_eur

    return {
        "pop": pop,
        "biome_code": biome_code,
        "biome_name": b["name"],
        "koppen": b["koppen"],
        "n_mhu_units": n_mhu,
        "total_living_area_m2": total_living_area_m2,
        "daily_exergy_kwh": daily_exergy_kwh,
        "pv_kwp": round(pv_kwp, 1),
        "battery_lfp_kwh": round(battery_kwh, 1),
        "daily_water_liters": daily_water_l,
        "cistern_buffer_liters": round(cistern_liters, 0),
        "reedbed_greywater_m2": round(reedbed_m2, 1),
        "annual_calories_mcal": round(annual_calories_mcal, 1),
        "arable_agroforestry_ha": round(arable_ha, 2),
        "jury_size": jury_size,
        "supermajority_seats": supermajority_threshold_seats,
        "council_tier": council_tier,
        "capex_housing_eur": capex_housing_eur,
        "capex_energy_eur": capex_energy_eur,
        "capex_water_eur": capex_water_eur,
        "capex_agri_eur": capex_agri_eur,
        "capex_legal_eur": capex_legal_eur,
        "capex_total_eur": capex_total_eur,
        "capex_per_capita_eur": capex_total_eur / pop,
    }


def print_node_report(res):
    """Prints a structured terminal report of the metabolic sizing."""
    print("=" * 76)
    print(f" O.N.E. SEED NODE SIZING REPORT: {res['biome_name']} (N = {res['pop']})")
    print("=" * 76)
    print(f" Biome Köppen Class   : {res['koppen']} ({res['biome_code']})")
    print(f" Population           : {res['pop']} Residents")
    print("-" * 76)
    print(" [1] HOUSING & PHYSICAL STRUCTURE:")
    print(f"     • Modular Habitat Units (MHU 54m²) : {res['n_mhu_units']} units ({res['total_living_area_m2']} m² total)")
    print(f"     • Occupancy Standard               : 2.0 persons / unit (Passivhaus timber chassis)")
    print(" [2] ELECTRICAL MICROGRID (380V / 48V DC):")
    print(f"     • Daily Exergy Demand              : {res['daily_exergy_kwh']:.1f} kWh/day")
    print(f"     • Solar PV Capacity Required       : {res['pv_kwp']} kWp")
    print(f"     • 3-Day LFP Battery Storage        : {res['battery_lfp_kwh']} kWh")
    print(" [3] WATER HARVESTING & PHYTO-TREATMENT:")
    print(f"     • Daily Potable Water Demand       : {res['daily_water_liters']:,.0f} L/day")
    print(f"     • Cistern Buffer Volume            : {res['cistern_buffer_liters']:,.0f} L")
    print(f"     • Reed Bed Greywater Surface       : {res['reedbed_greywater_m2']} m²")
    print(" [4] AGROECOLOGY & FOOD COMMONS:")
    print(f"     • Annual Caloric Subsistence       : {res['annual_calories_mcal']:,.0f} Mcal/year")
    print(f"     • Required Agroforestry Surface    : {res['arable_agroforestry_ha']} ha")
    print(" [5] DEMARCHIC GOVERNANCE:")
    print(f"     • Governance Body Tier             : {res['council_tier']}")
    print(f"     • Odd-Parity Jury Size             : {res['jury_size']} Jurors")
    print(f"     • 75% Supermajority Quorum         : {res['supermajority_seats']} votes to ratify")
    print("-" * 76)
    print(" [6] TRANSITION CAPEX (STAGES 0–2 SELF-BUILD):")
    print(f"     • MHU Modular Dwellings (BOM L6)   : EUR {res['capex_housing_eur']:,.2f}")
    print(f"     • Solar PV + LFP Battery Microgrid : EUR {res['capex_energy_eur']:,.2f}")
    print(f"     • Water Cisterns & Reed Beds       : EUR {res['capex_water_eur']:,.2f}")
    print(f"     • Agroforestry & Nursery Tools     : EUR {res['capex_agri_eur']:,.2f}")
    print(f"     • Swiss Legal Shield & Verein Cap  : EUR {res['capex_legal_eur']:,.2f}")
    print(f"     ----------------------------------------------------------------------")
    print(f"     • TOTAL TRANSITION INVESTMENT      : EUR {res['capex_total_eur']:,.2f}")
    print(f"     • Investment per Resident          : EUR {res['capex_per_capita_eur']:,.2f}")
    print("=" * 76)


def main():
    parser = argparse.ArgumentParser(description="O.N.E. Parametric Seed Node Metabolic Sizing Calculator")
    parser.add_argument("--pop", type=int, default=150, help="Seed Node resident population (default: 150)")
    parser.add_argument("--biome", type=str, default="NODE-01", choices=list(BIOME_METRICS.keys()), help="Target biome code")
    parser.add_argument("--all", action="store_true", help="Print summary table across all biomes and scales")
    args = parser.parse_args()

    if args.all:
        print("================================================================================")
        print(" O.N.E. SEED NODE METABOLIC BENCHMARK ACROSS 5 BIOMES (N = 50 vs 150 vs 300)")
        print("================================================================================")
        scales = [50, 150, 300]
        for b_code in BIOME_METRICS.keys():
            print(f"\n>>> BIOME {b_code}: {BIOME_METRICS[b_code]['name']}")
            print(f"{'Pop':<5} | {'MHUs':<6} | {'PV (kWp)':<9} | {'LFP (kWh)':<10} | {'Cistern (L)':<12} | {'Land (ha)':<10} | {'Total CapEx (€)':<16}")
            print("-" * 76)
            for s in scales:
                r = compute_seed_node_metabolism(s, b_code)
                print(f"{s:<5} | {r['n_mhu_units']:<6} | {r['pv_kwp']:<9.1f} | {r['battery_lfp_kwh']:<10.1f} | {r['cistern_buffer_liters']:<12,.0f} | {r['arable_agroforestry_ha']:<10.2f} | €{r['capex_total_eur']:<15,.0f}")
        return

    res = compute_seed_node_metabolism(args.pop, args.biome)
    print_node_report(res)


if __name__ == "__main__":
    main()
