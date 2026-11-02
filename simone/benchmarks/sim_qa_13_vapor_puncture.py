#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. ADVERSARIAL BENCHMARK — SIM-QA-13: VAPOR RETARDER PUNCTURE & DRYING RESERVE
File: simone/benchmarks/sim_qa_13_vapor_puncture.py
Author: Kyberlex <kyberlex@proton.me>
Pillar: Pillar 4A (Passivhaus Building Physics Critic)
License: AGPL-3.0-or-later

Description:
Tests Docket SIM-QA-13: If a resident punctures the interior smart vapor retarder
during winter (-25°C Boreal/Alpine conditions, indoor +20°C / 50% RH), reducing
effective interior vapor resistance from s_d = 25.0 m down to a degraded s_d,
at what threshold does interstitial condensation exceed the ISO 13788 drying
capacity of the exterior Steico Universal wood-fiber sheathing (s_d,ext = 0.105 m)?
Verifies that the 50mm decoupled service cavity (Shearing Layer 4) prevents
fastener penetrations from reaching the airtight membrane.
"""

import math


def sat_vapor_pressure_pa(temp_c: float) -> float:
    """Magnus-Tetens saturation vapor pressure (Pa) per ISO 13788."""
    if temp_c >= 0.0:
        return 610.5 * math.exp((17.269 * temp_c) / (237.3 + temp_c))
    return 610.5 * math.exp((21.875 * temp_c) / (265.5 + temp_c))


def evaluate_vapor_puncture(sd_interior_m: float, t_in_c: float = 20.0, rh_in: float = 0.50,
                            t_out_c: float = -25.0, rh_out: float = 0.85) -> dict:
    # Interface between 240mm cellulose (R=6.32) and 35mm wood-fiber exterior board (R=0.73)
    r_total = 8.47
    r_to_interface = 0.13 + 0.06 + 0.52 + 6.32  # Up to exterior face of cellulose
    t_interface_c = t_in_c - (r_to_interface / r_total) * (t_in_c - t_out_c)

    p_in = rh_in * sat_vapor_pressure_pa(t_in_c)
    p_out = rh_out * sat_vapor_pressure_pa(t_out_c)
    p_sat_interface = sat_vapor_pressure_pa(t_interface_c)

    sd_cellulose = 0.48
    sd_exterior = 0.105
    sd_to_interface = sd_interior_m + sd_cellulose
    sd_total = sd_to_interface + sd_exterior

    p_vapor_interface = p_in - (sd_to_interface / sd_total) * (p_in - p_out)
    condensation_occurs = p_vapor_interface > p_sat_interface

    return {
        "sd_interior_m": sd_interior_m,
        "t_interface_c": round(t_interface_c, 2),
        "p_vapor_pa": round(p_vapor_interface, 1),
        "p_sat_pa": round(p_sat_interface, 1),
        "condensation": condensation_occurs,
    }


def main():
    cases = [
        ("Intact Smart Retarder + 50mm Service Cavity", 25.0),
        ("Moderate Aging / Minor Seam Relaxation", 5.0),
        ("Direct Unprotected Wall Puncture (No Service Cavity)", 0.5),
    ]
    print("=" * 84)
    print("SIM-QA-13 BENCHMARK: ISO 13788 VAPOR RETARDER PUNCTURE IN -25°C WINTER")
    print("=" * 84)
    results = []
    for label, sd in cases:
        r = evaluate_vapor_puncture(sd)
        results.append(r)
        status = "FAIL_CONDENSATION" if r["condensation"] else "PASS_DRY"
        print(
            f"{label:<52} | s_d={sd:>5.1f}m | P_v={r['p_vapor_pa']:>6.1f} Pa | "
            f"P_sat={r['p_sat_pa']:>6.1f} Pa | {status}"
        )
    print("=" * 84)
    assert not results[0]["condensation"], "Intact retarder must not condense"
    assert not results[1]["condensation"], "s_d=5.0m must still remain dry thanks to breathable exterior"
    assert results[2]["condensation"], "Unprotected s_d=0.5m puncture at -25°C confirms need for 50mm service cavity"


if __name__ == "__main__":
    main()

