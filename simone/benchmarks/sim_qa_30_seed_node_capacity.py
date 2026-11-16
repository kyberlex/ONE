#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-30: ADMISSION TO A SEED NODE AT CAPACITY
File: simone/benchmarks/sim_qa_30_seed_node_capacity.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. Every number below is an assumption chosen for a
stylised stress test of admission rules. It is not SIMONE challenge 1 (the
Julia agent model of the free-rider threshold), which remains NOT_RUN.

Model (deterministic, daily steps, two years, Python stdlib only):
  * Unit: one Tier 1 ration (food, water, heat) for one person for one day.
  * A seed node of N0 = 60 persons, of whom a share CM = 0.8 contribute
    shifts (children, the old and the ill do not).
  * Output: each contributor produces R rations a day, capped by the node's
    installed capacity (land, water, energy) K rations a day. K = 1.2 * N0:
    the node can feed 72 people at most, whatever the labour.
  * Reserve: 180 days of the founding population's rations (the roadmap's
    Stage 1 cache). Floor: 30 days of the current population's rations
    (Art. 6.1.2). The run fails on the day the reserve falls below the floor.
  * Arrivals: A persons a week, every week. An arrival consumes from day one
    (hospitality, Art. 10.4.3) and contributes from week 5 (entry period with
    shifts, H3) with probability G; the rest never contribute.
  * Policies:
      P0  open: everyone stays (residence or hospitality, same consumption).
      P1  residence cap only (strategy 1): residence by lot up to capacity,
          the rest stay as guests. Guests eat, so consumption equals P0.
      P2  network (strategy 2): above capacity, a share Q of each new arrival
          accepts transfer to another seed node with room; the rest stay.
      P34 core hospitality + referral (strategies 3 and 4): above capacity, a
          new arrival receives core hospitality for T = 7 nights, then is
          referred (accompanied) to a legacy public service and leaves.
      P234 network first, then core hospitality and referral.

Usage: python3 sim_qa_30_seed_node_capacity.py
Writes markdown tables to stdout.
"""

N0 = 60
CM = 0.8
K_FACTOR = 1.2
RESERVE_DAYS = 180
FLOOR_DAYS = 30
ENTRY_WEEKS = 4
T_NIGHTS = 7
Q_TRANSFER = 0.5
HORIZON = 730


def run(policy, arrivals_per_week, g, r, k_factor=K_FACTOR):
    k = k_factor * N0
    reserve = RESERVE_DAYS * N0
    members_contrib = CM * N0
    members_other = N0 - members_contrib
    # cohorts of arrivals still present: list of [day_arrived, size, contributes_share]
    cohorts = []
    referred = 0.0
    transferred = 0.0
    for day in range(HORIZON):
        if day % 7 == 0 and arrivals_per_week > 0:
            pop_now = N0 + sum(c[1] for c in cohorts)
            a = float(arrivals_per_week)
            over = pop_now + a > k
            if policy in ("P2", "P234") and over:
                t = a * Q_TRANSFER
                transferred += t
                a -= t
            if policy in ("P34", "P234") and over:
                # core hospitality for T nights, then referral
                cohorts.append([day, a, None])
            else:
                cohorts.append([day, a, g])
        # referral of short-stay cohorts
        keep = []
        for c in cohorts:
            if c[2] is None and day - c[0] >= T_NIGHTS:
                referred += c[1]
                continue
            keep.append(c)
        cohorts = keep
        pop = N0 + sum(c[1] for c in cohorts)
        contrib = members_contrib + sum(
            c[1] * c[2] for c in cohorts
            if c[2] is not None and day - c[0] >= ENTRY_WEEKS * 7)
        output = min(contrib * r, k)
        reserve += output - pop
        if reserve < FLOOR_DAYS * pop:
            return day, pop, referred, transferred
    return None, N0 + sum(c[1] for c in cohorts), referred, transferred


def fmt_day(d):
    return "holds 2 years" if d is None else f"day {d}"


def main():
    global T_NIGHTS
    print("# SIM-QA-30: Seed Node at Capacity (synthetic, uncalibrated)")
    print()
    print("`python3 sim_qa_30_seed_node_capacity.py`")
    print()
    print(f"Node of {N0}, {int(CM*100)}% contributing; capacity K = {K_FACTOR} x N0 = {int(K_FACTOR*N0)} rations a day; "
          f"reserve {RESERVE_DAYS} days; floor {FLOOR_DAYS} days of current population; entry period {ENTRY_WEEKS} weeks; "
          f"core hospitality {T_NIGHTS} nights; transfer acceptance {int(Q_TRANSFER*100)}%.")
    print()
    print("## 1. Day the reserve falls below the 30-day floor (R = 2 rations per contributor a day)")
    print()
    print("| Arrivals a week | Arrivals who contribute (G) | P0 open | P1 residence cap only | P2 network | P34 core + referral | P234 |")
    print("| ---: | ---: | :--- | :--- | :--- | :--- | :--- |")
    for a in (1, 3, 10):
        for g in (0.2, 0.5, 0.8):
            row = []
            for p in ("P0", "P1", "P2", "P34", "P234"):
                d, pop, ref, tr = run(p, a, g, 2.0)
                row.append(fmt_day(d))
            print(f"| {a} | {int(g*100)}% | " + " | ".join(row) + " |")
    print()
    print("## 2. Persons referred and transferred over two years (R = 2, G = 50%)")
    print()
    print("| Arrivals a week | Policy | Referred to legacy services | Transferred to other seed nodes | Population at end or at failure |")
    print("| ---: | :--- | ---: | ---: | ---: |")
    for a in (1, 3, 10):
        for p in ("P0", "P2", "P34", "P234"):
            d, pop, ref, tr = run(p, a, 0.5, 2.0)
            print(f"| {a} | {p} | {ref:.0f} | {tr:.0f} | {pop:.0f} |")
    print()
    print("## 3. Sensitivity to output per contributor R (arrivals 3 a week, G = 50%)")
    print()
    print("| R | P0 open | P34 core + referral |")
    print("| ---: | :--- | :--- |")
    for r in (1.25, 1.5, 2.0, 3.0):
        d0 = run("P0", 3, 0.5, r)[0]
        d1 = run("P34", 3, 0.5, r)[0]
        print(f"| {r} | {fmt_day(d0)} | {fmt_day(d1)} |")
    print()
    print("## 4. When labour binds: installed capacity 3 x N0, R = 1.25, open node (P0)")
    print()
    print("| Arrivals a week | G = 20% | G = 50% | G = 80% |")
    print("| ---: | :--- | :--- | :--- |")
    for a in (1, 3, 10):
        row = [fmt_day(run("P0", a, g, 1.25, 3.0)[0]) for g in (0.2, 0.5, 0.8)]
        print(f"| {a} | " + " | ".join(row) + " |")
    print()
    print("## 5. Sensitivity to core hospitality nights T (policy P34, R = 2, G = 50%; entry period 4 or 8 weeks gives the same result here)")
    print()
    print("| T nights | Arrivals a week | Result | Referred over two years or until failure |")
    print("| ---: | ---: | :--- | ---: |")
    saved = T_NIGHTS
    for t in (7, 14, 30):
        T_NIGHTS = t
        for a in (3, 10):
            d, pop, ref, tr = run("P34", a, 0.5, 2.0)
            print(f"| {t} | {a} | {fmt_day(d)} | {ref:.0f} |")
    T_NIGHTS = saved
    print()
    print("P1 consumes as P0 by construction: a cap on residence does not cap what guests eat.")


if __name__ == "__main__":
    main()
