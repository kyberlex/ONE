#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-29 RED-10: RE-IDENTIFICATION IN SMALL NODES
File: simone/benchmarks/sim_qa_29_reidentification.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. The age distribution and the gender split are
assumptions picked for a stylised stress test, not data on any real population.

Question: if a replicated civic-register index shows, for each row, the node,
the gender and an age field, how many persons in a node are alone in their
cell (identified) or in a cell smaller than k (k-anonymity broken)?

Model (Monte Carlo, Python stdlib only):
  * A node of N adults aged 16 to 95. Age weights fall linearly from 1.0 at
    16 to 0.6 at 65, then to 0.05 at 95 (stylised ageing pyramid).
  * Gender: two values, 50/50 (a third value or an uneven split makes cells
    smaller, so these figures are a lower bound on identification).
  * Age field shown in the index, four variants:
      YEAR   year of birth (as in H1 of SIM-QA-29)
      B5     five-year band
      B10    ten-year band
      B3     three bands (16-34, 35-64, 65+), the strata of the SIM-QA-18 model
  * For each variant: share of persons alone in their (age field, gender)
    cell; share in cells smaller than 5 and smaller than 10.

Usage: python3 sim_qa_29_reidentification.py [--reps 400] [--seed 20261116]
Writes a markdown table to stdout.
"""

import argparse
import random
from collections import Counter

NODE_SIZES = [15, 30, 50, 100, 150, 300, 1000]
AGES = list(range(16, 96))


def age_weight(a):
    if a <= 65:
        return 1.0 - 0.4 * (a - 16) / (65 - 16)
    return 0.6 - 0.55 * (a - 65) / (95 - 65)


WEIGHTS = [age_weight(a) for a in AGES]


def field(variant, age):
    if variant == "YEAR":
        return age
    if variant == "B5":
        return (age - 16) // 5
    if variant == "B10":
        return (age - 16) // 10
    if variant == "B3":
        return 0 if age < 35 else (1 if age < 65 else 2)
    raise ValueError(variant)


VARIANTS = ["YEAR", "B5", "B10", "B3"]


def run(n, reps, rng):
    sums = {v: [0.0, 0.0, 0.0] for v in VARIANTS}
    for _ in range(reps):
        ages = rng.choices(AGES, weights=WEIGHTS, k=n)
        genders = [rng.random() < 0.5 for _ in range(n)]
        for v in VARIANTS:
            cells = [(field(v, a), g) for a, g in zip(ages, genders)]
            count = Counter(cells)
            sizes = [count[c] for c in cells]
            sums[v][0] += sum(1 for s in sizes if s == 1) / n
            sums[v][1] += sum(1 for s in sizes if s < 5) / n
            sums[v][2] += sum(1 for s in sizes if s < 10) / n
    return {v: [x / reps for x in sums[v]] for v in VARIANTS}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=400)
    ap.add_argument("--seed", type=int, default=20261116)
    args = ap.parse_args()
    rng = random.Random(args.seed)

    print("# SIM-QA-29 RED-10: Re-Identification in Small Nodes (synthetic, uncalibrated)")
    print()
    print(f"`python3 sim_qa_29_reidentification.py --reps {args.reps} --seed {args.seed}`")
    print()
    print("Share of a node's adults alone in their (age field, gender) cell, and in cells smaller than 5 and 10.")
    print("Two genders at 50/50: a lower bound on identification.")
    print()
    print("| Adults in node | Age field | Alone (identified) | Cell < 5 | Cell < 10 |")
    print("| ---: | :--- | ---: | ---: | ---: |")
    for n in NODE_SIZES:
        res = run(n, args.reps, rng)
        for v in VARIANTS:
            a, k5, k10 = res[v]
            print(f"| {n} | {v} | {a:.1%} | {k5:.1%} | {k10:.1%} |")
    print()
    print("YEAR = year of birth; B5 / B10 = five- / ten-year bands; B3 = 16-34, 35-64, 65+.")


if __name__ == "__main__":
    main()
