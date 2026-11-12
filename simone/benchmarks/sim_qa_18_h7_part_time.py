#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-18 (addendum): H7 PART-TIME SERVICE
File: simone/benchmarks/sim_qa_18_h7_part_time.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. Learning times, the acceptance curve, the refusal
reductions under H7 and the lower care multiplier are assumptions. No data on
refusal under part-time, duty-based summons exists. Read the output as how the
rules act relative to each other, not as a forecast.

H7: no full-time mandates by default; a share of a 40-hour week is fixed per
tier; release from labour is proportional; mandate length is drawn within a
per-tier range (SIM-QA-19 H6); orientation only at the first mandate.

Parameter sets (share of a full week, drawn mandate range in months):
  B0  current text: full release; 6 / 12 / 18 / 24 months fixed
  A   15: 10%, 3-6;  101: 20%, 2-4;  301: 50%, 4-8;  1,001: 100%, 6-12
  B   as A, but 101: 20%, 4-8 and 1,001: 50%, 6-12
  C   proposed third set: as B, but 1,001: 50%, 9-15

Part 1  per tier: hours per member per mandate, share of those hours spent
        before a member is up to speed, people needed per year, standing pool
        (serving + hiatus), burden in full-time-equivalent months.
Part 2  assumed acceptance curve: acceptance = A_MAX * exp(-burden / tau), with
        tau fitted so that the current 1,001-tier burden (24 FTE-months) gives a
        refusal of 94% (steep) or 80% (shallow). Refusal per set and tier.
Part 3  re-run of the SIM-QA-18 model (RED-1 carer gap, fill) at 150 and 500
        adults with refusal lowered under H7 by an ASSUMED factor and the carer
        refusal multiplier lowered from 2.5 to 1.5 (ASSUMED); RED-2 analytic.

Reproduce:
  python3 simone/benchmarks/sim_qa_18_h7_part_time.py               # 200 reps
  python3 simone/benchmarks/sim_qa_18_h7_part_time.py --reps 40     # quick
"""

import argparse
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sim_qa_18_summons_refusal as m18  # noqa: E402

WEEK_H = 40.0
WEEKS_PER_MONTH = 52 / 12
TIERS = (15, 101, 301, 1001)
LEARN_H = {15: 12, 101: 40, 301: 80, 1001: 160}   # service hours to get up to speed
RETURN_LEARN = 0.25                                # returners need 25% (no orientation)
SETS = {
    "B0": {15: (1.0, 6, 6), 101: (1.0, 12, 12), 301: (1.0, 18, 18), 1001: (1.0, 24, 24)},
    "A": {15: (0.1, 3, 6), 101: (0.2, 2, 4), 301: (0.5, 4, 8), 1001: (1.0, 6, 12)},
    "B": {15: (0.1, 3, 6), 101: (0.2, 4, 8), 301: (0.5, 4, 8), 1001: (0.5, 6, 12)},
    "C": {15: (0.1, 3, 6), 101: (0.2, 4, 8), 301: (0.5, 4, 8), 1001: (0.5, 9, 15)},
}
A_MAX = 0.80                                       # acceptance of a trivial summons
CURRENT_GLOBAL_BURDEN = 24.0
CURVES = {"steep": 0.94, "shallow": 0.80}          # refusal at current 1,001 burden


def tier_row(share, lo, hi, seats, learn):
    mean_m = (lo + hi) / 2
    hours = share * WEEK_H * WEEKS_PER_MONTH * mean_m
    return {"mean": mean_m, "hours": hours, "learn": min(1.0, learn / hours),
            "learn_ret": min(1.0, RETURN_LEARN * learn / hours),
            "per_year": seats * 12 / mean_m, "pool": 3 * seats, "burden": share * mean_m,
            "h_week": share * WEEK_H}


def refusal(burden, curve):
    tau = CURRENT_GLOBAL_BURDEN / math.log(A_MAX / (1 - CURVES[curve]))
    return 1 - A_MAX * math.exp(-burden / tau)


def part1():
    print("\n## Part 1. Service load per tier\n")
    print("Learning time (service hours before a member is up to speed, ASSUMED): "
          + ", ".join(f"{t} seats {LEARN_H[t]} h" for t in TIERS)
          + f"; returners need {RETURN_LEARN:.0%} of it (orientation only at first mandate).\n")
    print("| Set | Seats | h/week | Mandate (months) | Hours per member per mandate | Share before "
          "up to speed: first / returning | People needed per year | Standing pool | Burden (FTE-months) |")
    print("|---|---|---|---|---|---|---|---|---|")
    for name, tiers in SETS.items():
        for t in TIERS:
            share, lo, hi = tiers[t]
            r = tier_row(share, lo, hi, t, LEARN_H[t])
            rng = f"{lo}" if lo == hi else f"{lo}-{hi}"
            print(f"| {name} | {t:,} | {r['h_week']:.0f} | {rng} | {r['hours']:.0f} | "
                  f"{r['learn']:.0%} / {r['learn_ret']:.0%} | {r['per_year']:.0f} | {r['pool']:,} | "
                  f"{r['burden']:.1f} |")


def part2():
    print("\n## Part 2. Refusal under an ASSUMED acceptance curve "
          f"(acceptance = {A_MAX} x exp(-burden / tau))\n")
    for curve, r0 in CURVES.items():
        tau = CURRENT_GLOBAL_BURDEN / math.log(A_MAX / (1 - r0))
        print(f"* {curve}: tau = {tau:.1f} FTE-months (current 1,001 tier refusal = {r0:.0%})")
    print("\n| Set | Seats | Burden | Refusal (steep) | Refusal (shallow) | RED-2: 5% faction seat share "
          "(steep / shallow) |")
    print("|---|---|---|---|---|---|")
    for name, tiers in SETS.items():
        for t in TIERS:
            share, lo, hi = tiers[t]
            b = share * (lo + hi) / 2
            rs, rh = refusal(b, "steep"), refusal(b, "shallow")
            fs = [0.05 / (0.05 + 0.95 * (1 - r)) for r in (rs, rh)]
            print(f"| {name} | {t:,} | {b:.1f} | {rs:.0%} | {rh:.0%} | {fs[0]:.0%} / {fs[1]:.0%} |")


def part3(reps, seed):
    print("\n## Part 3. SIM-QA-18 model re-run with refusal lowered under H7 (ASSUMED reduction)\n")
    print("CORRELATED refusal (age x care load). H7 rows: refusal multiplied by the stated factor "
          "and carer multiplier 2.5 -> 1.5 unless marked 'kept'. Both changes are assumptions, not findings.\n")
    print("| Node | Baseline r | Variant | Effective r | Council empty-seat terms | "
          "Carer gap B0 | Carer gap ALL (H1-H3) |")
    print("|---|---|---|---|---|---|---|")
    for n in (150, 500):
        for r0 in (0.6, 0.9, 0.94):
            for label, factor, care in (("current service", 1.0, 2.5),
                                        ("H7, refusal x0.75, carer mult kept", 0.75, 2.5),
                                        ("H7, refusal x0.75", 0.75, 1.5),
                                        ("H7, refusal x0.50", 0.50, 1.5)):
                m18.CARE_MULT = care
                r = r0 * factor
                b0 = m18.summarize(n, r, True, "B0", reps, seed)[0]["council"]
                al = m18.summarize(n, r, True, "ALL", reps, seed)[0]["council"]
                print(f"| {n} | {r0} | {label} | {r:.2f} | {b0['fail']:.2f} | "
                      f"{100 * b0['care']:+.0f}pp | {100 * al['care']:+.0f}pp |")
    m18.CARE_MULT = 2.5
    print("\n### RED-2 (analytic): seat share of an always-accepting faction\n")
    print("| Faction f | r=0.94 | x0.75 (0.705) | x0.50 (0.47) | r=0.6 | x0.75 (0.45) | x0.50 (0.30) |")
    print("|---|---|---|---|---|---|---|")
    for f in (0.02, 0.05, 0.10, 0.20):
        cells = [f / (f + (1 - f) * (1 - r)) for r in (0.94, 0.705, 0.47, 0.6, 0.45, 0.30)]
        print(f"| {f:.2f} | " + " | ".join(f"{c:.0%}" for c in cells) + " |")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=200)
    ap.add_argument("--seed", type=int, default=20261112)
    a = ap.parse_args()
    print("SIM-QA-18 H7 part-time service — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)")
    print(f"reps={a.reps} seed={a.seed}; week {WEEK_H:.0f} h; A_MAX={A_MAX}")
    part1()
    part2()
    part3(a.reps, a.seed)


if __name__ == "__main__":
    main()
