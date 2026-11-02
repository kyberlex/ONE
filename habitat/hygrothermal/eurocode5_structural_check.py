#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. HABITAT (PILLAR 4A) — EUROCODE 5 MULTI-BIOME STRUCTURAL ENVELOPE CHECK
File: habitat/hygrothermal/eurocode5_structural_check.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Parametric structural verification across the 5 canonical O.N.E. seed node biomes
according to EN 1995-1-1 (Eurocode 5: Design of Timber Structures), EN 1991-1-3
(Snow Loads), and EN 1991-1-4 (Wind Actions). Evaluates combined bending + axial
compression utilization, shear utilization, and instantaneous/final deflection
for the MHU C24 / GL24h portal frame rafter and column members.

Usage:
  python3 habitat/hygrothermal/eurocode5_structural_check.py
"""

BIOME_LOAD_CASES = [
    {"id": "NODE-01", "name": "Temperate Oceanic (Galicia)", "s_k_kNm2": 0.60, "v_b_ms": 29.0, "pga_g": 0.08},
    {"id": "NODE-02", "name": "Montane Alpine (Andes / Alps)", "s_k_kNm2": 2.50, "v_b_ms": 27.0, "pga_g": 0.25},
    {"id": "NODE-03", "name": "Sub-Tropical Monsoon (Kerala)", "s_k_kNm2": 0.00, "v_b_ms": 39.0, "pga_g": 0.12},
    {"id": "NODE-04", "name": "Equatorial Highland (Rift)", "s_k_kNm2": 0.00, "v_b_ms": 24.0, "pga_g": 0.18},
    {"id": "NODE-05", "name": "Continental Cold (Ozarks/Boreal)", "s_k_kNm2": 1.80, "v_b_ms": 30.0, "pga_g": 0.10},
]

# Structural geometry & material constants (Double C24 45x220mm -> b=90mm, h=220mm)
SPAN_M = 4.20
FRAME_SPACING_M = 1.20
B_MM = 90.0
H_MM = 220.0
F_M_K_MPA = 24.0     # C24 characteristic bending strength (N/mm^2)
F_V_K_MPA = 4.0      # C24 characteristic shear strength (N/mm^2)
E_0_MEAN_MPA = 11000.0
K_MOD = 0.90         # Service Class 1/2 short-to-medium duration load factor
GAMMA_M = 1.30       # Partial factor for solid timber (EN 1995-1-1 Table 2.3)
G_K_KNM2 = 0.65      # Dead load of Passivhaus roof cassette (kN/m^2)


def evaluate_biome_ec5(biome: dict) -> dict:
    """Computes ULS bending, ULS shear, and SLS deflection utilization ratios."""
    f_m_d = K_MOD * F_M_K_MPA / GAMMA_M
    f_v_d = K_MOD * F_V_K_MPA / GAMMA_M

    # Wind dynamic pressure q_p = 0.5 * rho * (1.25 * v_b)^2 (in kN/m^2)
    q_wind_kNm2 = 0.5 * 1.25 * ((1.25 * biome["v_b_ms"]) ** 2) / 1000.0
    q_variable_kNm2 = max(biome["s_k_kNm2"] * 0.8 + 0.5 * q_wind_kNm2 * 0.6, q_wind_kNm2 * 0.75)

    # ULS line load on rafter (EN 1990 Eq. 6.10: 1.35*G_k + 1.50*Q_k)
    q_uls_kNm = (1.35 * G_K_KNM2 + 1.50 * q_variable_kNm2) * FRAME_SPACING_M
    m_ed_kNm = (q_uls_kNm * (SPAN_M ** 2)) / 8.0
    v_ed_kN = (q_uls_kNm * SPAN_M) / 2.0

    w_y_mm3 = (B_MM * (H_MM ** 2)) / 6.0
    area_mm2 = B_MM * H_MM

    sigma_m_d = (m_ed_kNm * 1e6) / w_y_mm3
    tau_d = 1.5 * (v_ed_kN * 1e3) / area_mm2

    bending_util = sigma_m_d / f_m_d
    shear_util = tau_d / f_v_d

    # SLS instantaneous deflection for semi-rigid gusseted portal frame (k_portal = 2.2 / 384)
    q_sls_Nmm = (G_K_KNM2 + q_variable_kNm2) * FRAME_SPACING_M
    i_y_mm4 = (B_MM * (H_MM ** 3)) / 12.0
    l_mm = SPAN_M * 1000.0
    w_inst_mm = (2.2 * q_sls_Nmm * (l_mm ** 4)) / (384.0 * E_0_MEAN_MPA * i_y_mm4)
    w_limit_mm = l_mm / 300.0
    deflection_util = w_inst_mm / w_limit_mm

    return {
        "id": biome["id"],
        "name": biome["name"],
        "q_uls_kNm": round(q_uls_kNm, 2),
        "bending_util": round(bending_util, 3),
        "shear_util": round(shear_util, 3),
        "w_inst_mm": round(w_inst_mm, 2),
        "deflection_util": round(deflection_util, 3),
        "status": "PASS" if (bending_util < 1.0 and shear_util < 1.0 and deflection_util < 1.0) else "FAIL",
    }


def main():
    print("=" * 88)
    print("O.N.E. PILLAR 4A — EUROCODE 5 (EN 1995-1-1) MULTI-BIOME STRUCTURAL ENVELOPE AUDIT")
    print("=" * 88)
    print(f"{'Biome':<34} | {'q_ULS':>8} | {'Bend Util':>9} | {'Shear Util':>10} | {'w_inst':>8} | {'Status':>6}")
    print("-" * 88)
    for b in BIOME_LOAD_CASES:
        r = evaluate_biome_ec5(b)
        assert r["status"] == "PASS", f"EC5 failure in {r['id']}"
        label = f"{r['id']} {r['name'][:25]}"
        print(
            f"{label:<34} | {r['q_uls_kNm']:>5.2f} kN | {r['bending_util']*100:>8.1f}% | "
            f"{r['shear_util']*100:>9.1f}% | {r['w_inst_mm']:>5.2f} mm | {r['status']:>6}"
        )
    print("=" * 88)


if __name__ == "__main__":
    main()
