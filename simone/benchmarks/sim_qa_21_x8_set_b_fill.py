#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-21 X-8: COUNCIL FILL UNDER THE ACCEPTED RULES (SET B + H6)
File: simone/benchmarks/sim_qa_21_x8_set_b_fill.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. Refusal is swept, not estimated. Part-time service
(SIM-QA-18 H7, Set B) is expected to lower refusal; how much is unknown, so the
whole sweep is reported. Read the output as relative behaviour between rules.

Question (maintainer, 2026-11-13): does a council of 15 hold below 150 adults
once the accepted rules apply?

Rules compared for a node of N adults (50, 80, 100, 120, 150):
  FIX  the rule of the original SIM-QA-21 fill model (FIX reproduces its figures within
       sampling error): the whole council of 15 is
       drawn at once for a fixed 6-month mandate; hiatus 12 months.
  SETB the accepted rules: each seat has its own mandate, drawn uniformly in
       3..6 months (SIM-QA-19 H6 with SIM-QA-18 Set B); a member leaves at the
       end of the drawn mandate and enters a hiatus of twice the mandate served
       (Art. 4.3.3); the seat is refilled the same month (continuous renewal).
  Both: monthly steps, 10 years plus a 2-year warm-up that is not counted.
  A summoned eligible adult refuses with probability r. FIX copies the
  original mechanics exactly (one summons per person per term, no refill
  during a term). SETB refills a seat the month it opens and retries an
  unfilled seat monthly, but a refuser is not summoned again for a lock of
  6 months (the deferral window of SIM-QA-18 H2); locks of 3 months and of
  1 month (a refuser may be summoned again next month) are sensitivity cases
  (2026-11-13: the maintainer set the window at 3 months, so the months
  table also reports SETB with a 3-month lock). Panels of three are drawn per
  dispute from outside the node (X-1, X-3) and take no one from the node.
  Part-time service changes the hours, not the head count, so it enters only
  through r.

Metrics per (rule, N, r):
  full   share of months with all 15 seats filled;
  empty  mean empty seats per month;
  T95    smallest N in a fine grid (40..200, step 5) with full >= 95%.

Reproduce:
  python3 simone/benchmarks/sim_qa_21_x8_set_b_fill.py --reps 1000    # as published
  python3 simone/benchmarks/sim_qa_21_x8_set_b_fill.py --reps 200     # quick
"""

import argparse
import random

NODES = (50, 80, 100, 120, 150)
REFUSAL = (0.0, 0.1, 0.3, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9)
SEATS = 15
WARMUP = 24                         # months, not counted
MONTHS = 120                        # counted horizon
FIX_MANDATE, FIX_HIATUS = 6, 12
SETB_RANGE = (3, 6)                 # months, uniform integer
GRID = range(40, 205, 5)


def summon(rng, eligible, r):
    """Summon eligible adults in random order until one accepts.

    Returns (accepted person or None, list of refusers)."""
    order = list(eligible)
    rng.shuffle(order)
    refused = []
    for i in order:
        if rng.random() >= r:
            return i, refused
        refused.append(i)
    return None, refused


def run(rule, n, r, reps, seed, lock=6):
    """FIX replicates sim_qa_21_small_node.py: the whole council is drawn at the
    start of each 6-month term, each eligible adult is summoned at most once per
    term, and an unfilled seat stays empty for the term. SETB: each seat is
    refilled the month it opens; a refuser is not summoned again for `lock`
    months (the deferral window); an unfilled seat is retried monthly."""
    rng = random.Random(seed * 104729 + n * 131 + int(r * 1000) + (rule == "SETB") + lock)
    full = months = empty_sum = 0
    for _ in range(reps):
        free_at = [0] * n            # first month a person may sit again
        ask_at = [0] * n             # first month a person may be summoned again
        seat = [None] * SEATS
        start = [0] * SEATS
        end = [0] * SEATS
        for m in range(WARMUP + MONTHS):
            if rule == "FIX":
                if m % FIX_MANDATE == 0:
                    for s in range(SEATS):
                        if seat[s] is not None:
                            free_at[seat[s]] = m + FIX_HIATUS
                            seat[s] = None
                    order = [i for i in range(n) if free_at[i] <= m]
                    rng.shuffle(order)
                    k = 0
                    for i in order:
                        if k == SEATS:
                            break
                        if rng.random() >= r:
                            seat[k] = i
                            k += 1
            else:
                for s in range(SEATS):
                    if seat[s] is not None and m >= end[s]:
                        free_at[seat[s]] = m + 2 * (m - start[s])
                        seat[s] = None
                sitting = {p for p in seat if p is not None}
                for s in range(SEATS):
                    if seat[s] is not None:
                        continue
                    el = [i for i in range(n)
                          if free_at[i] <= m and ask_at[i] <= m and i not in sitting]
                    p, refused = summon(rng, el, r)
                    for i in refused:
                        ask_at[i] = m + lock
                    if p is None:
                        continue
                    seat[s], start[s] = p, m
                    end[s] = m + rng.randint(*SETB_RANGE)
                    sitting.add(p)
            if m >= WARMUP:
                e = sum(1 for p in seat if p is None)
                months += 1
                empty_sum += e
                full += e == 0
    return full / months, empty_sum / months


def t95(rule, r, reps, seed, lock=6):
    for n in GRID:
        if run(rule, n, r, reps, seed, lock)[0] >= 0.95:
            return n
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=1000)
    ap.add_argument("--seed", type=int, default=20261113)
    a = ap.parse_args()
    print("# SIM-QA-21 X-8: council fill under Set B + H6 (synthetic, uncalibrated)\n")
    print(f"reps = {a.reps}, seed = {a.seed}, {MONTHS} counted months after "
          f"{WARMUP} warm-up\n")
    print("## Months fully seated (share) and mean empty seats\n")
    head = "| Adults | Rule | " + " | ".join(f"r = {r}" for r in REFUSAL) + " |"
    print(head)
    print("| :--- | :--- | " + " | ".join(":---" for _ in REFUSAL) + " |")
    for n in NODES:
        for rule, lock, label in (("FIX", 6, "FIX"), ("SETB", 6, "SETB"),
                                  ("SETB", 3, "SETB, lock 3")):
            cells = []
            for r in REFUSAL:
                f, e = run(rule, n, r, a.reps, a.seed, lock)
                cells.append(f"{f:.0%} / {e:.2f}")
            print(f"| {n} | {label} | " + " | ".join(cells) + " |")
    print("\n## Smallest node with >= 95% of months fully seated (grid 40..200, step 5)\n")
    print("| Rule | " + " | ".join(f"r = {r}" for r in REFUSAL) + " |")
    print("| :--- | " + " | ".join(":---" for _ in REFUSAL) + " |")
    qreps = max(50, a.reps // 4)
    for rule, lock, label in (("FIX", 6, "FIX"), ("SETB", 6, "SETB, lock 6"),
                              ("SETB", 3, "SETB, lock 3"),
                              ("SETB", 1, "SETB, lock 1")):
        cells = []
        for r in REFUSAL:
            t = t95(rule, r, qreps, a.seed, lock)
            cells.append(str(t) if t is not None else "> 200")
        print(f"| {label} | " + " | ".join(cells) + " |")
    print(f"\n*T95 uses {qreps} reps per grid point.*")


if __name__ == "__main__":
    main()
