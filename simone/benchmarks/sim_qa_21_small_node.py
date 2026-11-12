#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-21: GOVERNANCE OF NODES BELOW THE COUNCIL THRESHOLD
File: simone/benchmarks/sim_qa_21_small_node.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. Every hour budget, turnout, refusal rate, household
size and faction share below is an assumption picked for a stylised comparison,
not a measurement of any real settlement. Read the output as relative behaviour
between rules.

Regimes compared for a node of N adults (30, 50, 100, 150):
  B0  current text (Arts. 4.2.1, 4.2.2, 4.3.3): under 50 adults a drawn panel of
      3 holds municipal administration (3-month mandate, 6-month hiatus, no
      first-degree kin or partners concurrently); from 50 adults a 15-seat
      council (6-month mandate, 12-month hiatus) plus a mediation panel of 3.
  H1  attachment: below threshold T the node has no body of its own; its adults
      enter the draw of the council of the nearest larger centre.
  H2  two levels: below T, internal matters go to an assembly of all adults;
      other matters to the centre council, whose draw includes the node; disputes
      to a panel of 3 drawn outside the node.
  At or above T, H1 and H2 both fall back to the B0 council. T in {50, 100, 150}.

Metrics:
  (a) seat-fill failure: share of terms with an empty seat (quarterly Monte
      Carlo, uniform refusal r, refusers replaced from the eligible pool until it
      is exhausted; same mechanics as sim_qa_18_summons_refusal.py, no strata);
  (b) governance hours per adult per week (analytic, assumed budgets below);
  (c) node share of the centre council: expected seats and P(no seat), exact
      hypergeometric for 15 seats drawn from a pool of POOL adults incl. the node;
  (d) assembly quorum failure (binomial turnout) and faction vote share (RED-4).

Reproduce:
  python3 simone/benchmarks/sim_qa_21_small_node.py                # 2000 reps
  python3 simone/benchmarks/sim_qa_21_small_node.py --reps 200     # quick
"""

import argparse
import math
import random

NODES = (30, 50, 100, 150)
THRESHOLDS = (50, 100, 150)
REFUSAL = (0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9)
QUARTERS = 40                       # 10-year horizon
COUNCIL = {"seats": 15, "mandate": 2, "hiatus": 4}   # quarters (Art. 4.3.3: 2x)
PANEL = {"seats": 3, "mandate": 1, "hiatus": 2}
POOL = 2000                         # adults in the centre's draw, node included
HOUSEHOLD = ((1, 0.30), (2, 0.40), (3, 0.20), (4, 0.10))  # adults per household
# Hour budgets (h/week per seat or per attending adult) — all assumptions.
H_COUNCIL = 40.0                    # full release from routine labour (Art. 4.3.2)
H_PANEL_ADMIN = 20.0                # B0 panel holding municipal administration
H_PANEL_MED = 4.0                   # mediation-only panel next to a council
H_ASSEMBLY = 1.5                    # one 3-hour session per fortnight incl. prep
TURNOUT = 0.6                       # assembly attendance assumed for hours
QUORUM = 1 / 3                      # assembly quorum, share of all adults
DISPUTES_PER_ADULT_YEAR = 0.04      # H2(c) disputes, panel of 3 x 10 h each
H_DISPUTE = 3 * 10.0
TRAVEL = 1.25                       # H1/H2 centre service: +25% for travel


def households(n, rng):
    fam, f = [], 0
    while len(fam) < n:
        x, acc = rng.random(), 0.0
        for size, p in HOUSEHOLD:
            acc += p
            if x <= acc:
                break
        fam.extend([f] * size)
        f += 1
    return fam[:n]


def draw(rng, n, eligible, seats, r, fam=None):
    """Summon eligible people in random order; return seated list and fill flag."""
    order = [i for i in range(n) if eligible[i]]
    rng.shuffle(order)
    seated, used = [], set()
    for i in order:
        if len(seated) == seats:
            break
        if fam is not None and fam[i] in used:
            continue
        if rng.random() < r:
            continue
        seated.append(i)
        if fam is not None:
            used.add(fam[i])
    return seated, len(seated) == seats


def simulate(n, r, with_council, reps, seed):
    """Return (council fail share, panel fail share) over all terms and reps."""
    rng = random.Random(seed * 7919 + n * 31 + int(r * 1000) + with_council)
    cf = ct = pf = pt = 0
    for _ in range(reps):
        fam = None if with_council else households(n, rng)
        c_free = [0] * n            # first quarter a person may sit again
        p_free = [0] * n
        c_seat, p_seat = [], []
        for q in range(QUARTERS):
            if with_council and q % COUNCIL["mandate"] == 0:
                for i in c_seat:
                    c_free[i] = q + COUNCIL["hiatus"]
                el = [c_free[i] <= q for i in range(n)]
                c_seat, ok = draw(rng, n, el, COUNCIL["seats"], r)
                ct += 1
                cf += not ok
            for i in p_seat:
                p_free[i] = q + PANEL["hiatus"]
            busy = set(c_seat)
            el = [p_free[i] <= q and i not in busy for i in range(n)]
            p_seat, ok = draw(rng, n, el, PANEL["seats"], r, fam)
            pt += 1
            pf += not ok
    return (cf / ct if ct else 0.0), pf / pt


def p_no_seat(n, pool=POOL, seats=15):
    return math.comb(pool - n, seats) / math.comb(pool, seats)


def centre_hours_per_adult():
    return (COUNCIL["seats"] * H_COUNCIL + PANEL["seats"] * H_PANEL_MED) * TRAVEL / POOL


def hours(regime, n, t):
    """Governance h/week per node adult and share of adults fully off roster."""
    below = n < (50 if regime == "B0" else t)
    if not below:
        return (COUNCIL["seats"] * H_COUNCIL + PANEL["seats"] * H_PANEL_MED) / n, COUNCIL["seats"] / n
    if regime == "B0":
        return PANEL["seats"] * H_PANEL_ADMIN / n, 0.0
    off = COUNCIL["seats"] / POOL
    if regime == "H1":
        return centre_hours_per_adult(), off
    disp = DISPUTES_PER_ADULT_YEAR * H_DISPUTE / 52
    return H_ASSEMBLY * TURNOUT + centre_hours_per_adult() + disp, off


def quorum_fail(n, turnout, quorum=QUORUM):
    need = math.ceil(quorum * n)
    return sum(math.comb(n, k) * turnout ** k * (1 - turnout) ** (n - k) for k in range(need))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=2000)
    ap.add_argument("--seed", type=int, default=20261112)
    a = ap.parse_args()
    print("SIM-QA-21 small-node governance — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)")
    print(f"reps={a.reps} seed={a.seed} horizon={QUARTERS} quarters; pool={POOL}; "
          f"hours: council {H_COUNCIL}, admin panel {H_PANEL_ADMIN}, mediation panel {H_PANEL_MED}, "
          f"assembly {H_ASSEMBLY} x turnout {TURNOUT}; travel x{TRAVEL}; quorum {QUORUM:.2f}")

    sim = {}
    for n in NODES:
        for r in REFUSAL:
            sim[(n, r, True)] = simulate(n, r, True, a.reps, a.seed)
            if n < 50:
                sim[(n, r, False)] = simulate(n, r, False, a.reps, a.seed)
    for r in REFUSAL:
        sim[(POOL, r, True)] = simulate(POOL, r, True, max(1, a.reps // 20), a.seed)

    print("\n### (a) Seat-fill failure, current text (B0): share of terms with an empty seat\n")
    print("| Node | Body | " + " | ".join(f"r={r}" for r in REFUSAL) + " |")
    print("|---|---|" + "---|" * len(REFUSAL))
    for n in NODES:
        if n < 50:
            print(f"| {n} | admin panel of 3 (kin rule) | "
                  + " | ".join(f"{sim[(n, r, False)][1]:.3f}" for r in REFUSAL) + " |")
        else:
            print(f"| {n} | council of 15 | "
                  + " | ".join(f"{sim[(n, r, True)][0]:.3f}" for r in REFUSAL) + " |")
            print(f"| {n} | mediation panel of 3 | "
                  + " | ".join(f"{sim[(n, r, True)][1]:.3f}" for r in REFUSAL) + " |")
    print(f"| {POOL} (centre) | council of 15 | "
          + " | ".join(f"{sim[(POOL, r, True)][0]:.3f}" for r in REFUSAL) + " |")
    print("\nCouncil of 15 if it were triggered in smaller nodes (for the threshold test):\n")
    print("| Node | " + " | ".join(f"r={r}" for r in REFUSAL) + " |")
    print("|---|" + "---|" * len(REFUSAL))
    for n in NODES:
        print(f"| {n} | " + " | ".join(f"{sim[(n, r, True)][0]:.3f}" for r in REFUSAL) + " |")

    print("\n### (a') Threshold test: worst council fill failure among nodes at or above T\n")
    print("Below T, H1 and H2 draw no seat inside the node (H1: centre council only; H2: centre "
          "council and an outside dispute panel), so their node-level fill failure is the "
          "centre's value in table (a).\n")
    print("| T | " + " | ".join(f"r={r}" for r in REFUSAL) + " |")
    print("|---|" + "---|" * len(REFUSAL))
    for t in THRESHOLDS:
        ns = [n for n in NODES if n >= t]
        print(f"| {t} | " + " | ".join(f"{max(sim[(n, r, True)][0] for n in ns):.3f}"
                                      for r in REFUSAL) + " |")

    print("\n### (b) Governance hours per node adult per week; share of node adults fully "
          "off the work roster\n")
    print("| Node | B0 (T=50) | " + " | ".join(f"H1 T={t} | H2 T={t}" for t in THRESHOLDS) + " |")
    print("|---|---|" + "---|---|" * len(THRESHOLDS))
    for n in NODES:
        h, o = hours("B0", n, 50)
        cells = [f"{h:.2f} h; {o:.1%}"]
        for t in THRESHOLDS:
            for reg in ("H1", "H2"):
                h, o = hours(reg, n, t)
                cells.append(f"{h:.2f} h; {o:.1%}")
        print(f"| {n} | " + " | ".join(cells) + " |")

    print(f"\n### (c) Node share of the centre council (15 seats, pool {POOL} incl. node)\n")
    print("| Node | Expected seats | P(no seat), exact | Binomial check (1-n/pool)^15 |")
    print("|---|---|---|---|")
    for n in NODES:
        print(f"| {n} | {15 * n / POOL:.2f} | {p_no_seat(n):.3f} | {(1 - n / POOL) ** 15:.3f} |")
    print("\nUnder H1 every matter of a node below T is decided by this council; under H2 only "
          "matters that are not internal to the node.")

    print(f"\n### (d1) Assembly quorum failure, quorum {QUORUM:.0%} of all adults (H2a)\n")
    tos = (0.3, 0.4, 0.5, 0.6)
    print("| Node | " + " | ".join(f"turnout {x:.0%}" for x in tos) + " |")
    print("|---|" + "---|" * len(tos))
    for n in NODES:
        print(f"| {n} | " + " | ".join(f"{quorum_fail(n, x):.3f}" for x in tos) + " |")

    print("\n### (d2) RED-4: bloc (dominant family and allies) of share f, always attending; "
          "others attend at rate t. Bloc share of votes cast in the assembly vs. P(bloc "
          "holds >= 2 of 3 panel seats) under B0 when the bloc spans several households\n")
    print("| f | t=0.4 | t=0.6 | t=0.8 | B0 panel P(>=2 of 3) |")
    print("|---|---|---|---|---|")
    for f in (0.1, 0.2, 0.3, 0.4):
        cells = [f"{f / (f + (1 - f) * t):.0%}" for t in (0.4, 0.6, 0.8)]
        p2 = 3 * f * f * (1 - f) + f ** 3
        print(f"| {f:.0%} | " + " | ".join(cells) + f" | {p2:.0%} |")
    print("\nReading: a bloc vote share >= 25% blocks every 75% matter; > 50% carries every "
          "simple-majority matter; >= 60% carries every 60% matter.")


if __name__ == "__main__":
    main()
