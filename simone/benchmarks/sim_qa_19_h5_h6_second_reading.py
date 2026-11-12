#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-19 (revision): H5 SECOND READING BY A RENEWED COUNCIL
AND H6 DRAWN MANDATE LENGTH
File: simone/benchmarks/sim_qa_19_h5_h6_second_reading.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. Opinion shares, the anchoring of retained members,
faction shares, refusal rates and the one-month learning time are assumptions
for a stylised comparison, not measurements.

H5  A 60% decision may be re-examined once, by the same council after at least
    K of its members have been replaced by lot (provisional K = 8 of 15).
H6  The public draw also draws each member's mandate length, uniform in a range
    per tier (15 seats: 3-6 months; 101 seats: 2-4 or 4-8 months); hiatus stays
    at twice the mandate served.

Parts:
  A  RED-1 exact: a body of n seats, members vote yes with prob p (independent,
     infinite population). Retained members keep their first-reading vote
     (ANCHORED, the pessimistic case); k new members vote afresh. Report
     P(adopted at first reading and confirmed at second), and P(confirmed) for
     a well-supported measure (cost of the second reading).
  B  Monte Carlo renewal process: waiting time until K of the members seated at
     a decision have left; share of members in their first month (learning
     cost); 101-seat variant with K = 51.
  C  Monthly Monte Carlo of a finite node: smallest node that keeps at least 95%
     of months without an empty council seat, fixed six-month mandates vs H6.
  D  RED-2: a faction of share f that always accepts while others refuse at r
     gets seat probability q = f / (f + (1-f)(1-r)). Share of time it holds 9 of
     15 (same marginal under both rules), mean length of a majority spell, and
     P(it still holds 9 at the second reading | it held 9 at the decision).

Reproduce:
  python3 simone/benchmarks/sim_qa_19_h5_h6_second_reading.py            # default
  python3 simone/benchmarks/sim_qa_19_h5_h6_second_reading.py --reps 500 # quick
"""

import argparse
import math
import random
import statistics

SEED = 20261112
FIXED = 6.0                  # current text: six-month council mandate (months)
RANGE15 = (3.0, 6.0)         # H6, 15 seats (Set A = Set B)
RANGES101 = {"A": (2.0, 4.0), "B": (4.0, 8.0)}
FIXED101 = 12.0              # current text: one-year staggered mandates
LEARN = 1.0                  # months before a member is up to speed (assumption)


def binom(n, k, p):
    return math.comb(n, k) * p ** k * (1 - p) ** (n - k) if 0 <= k <= n else 0.0


def need(n, share=0.6):
    return math.ceil(round(share * n, 9))


def second_reading(n, k, p):
    """Return (P adopt at first, P adopt and confirm). Retained members anchored."""
    t = need(n)
    first = sum(binom(n, y, p) for y in range(t, n + 1))
    both = 0.0
    keep = n - k
    for y in range(t, n + 1):
        py = binom(n, y, p)
        for ry in range(max(0, keep - (n - y)), min(keep, y) + 1):
            # retained yes count, hypergeometric given y yes among n
            ph = math.comb(y, ry) * math.comb(n - y, keep - ry) / math.comb(n, keep)
            conf = sum(binom(k, j, p) for j in range(max(0, t - ry), k + 1))
            both += py * ph * conf
    return first, both


def part_a():
    print("\n## A. RED-1: error after one reading vs. second reading (exact; retained members anchored)\n")
    for n, ks in ((15, (8, 10, 12, 15)), (101, (51, 76, 101))):
        print(f"### {n} seats (60% = {need(n)} votes)\n")
        print("| New members at second reading | p=0.5: adopted at 1st | p=0.5: survives 2nd "
              "| p=0.4: survives 2nd | p=0.7: adopted at 1st | p=0.7: confirmed at 2nd |")
        print("|---|---|---|---|---|---|")
        for k in ks:
            f5, b5 = second_reading(n, k, 0.5)
            _, b4 = second_reading(n, k, 0.4)
            f7, b7 = second_reading(n, k, 0.7)
            print(f"| {k} of {n} | {f5:.3f} | {b5:.3f} | {b4:.4f} | {f7:.3f} | {b7:.3f} |")
        print()
    print("p = population share in favour. A 60% decision is wrong when p < 0.6 (p = 0.5, 0.4) "
          "and right when p >= 0.6 (p = 0.7). 'Survives 2nd' is the error rate with H5 applied "
          "to every adopted decision (upper bound: in practice only contested ones are re-read).")


def renewal(seats, lo, hi, horizon, rng, fixed=None):
    """Return list per seat of (start, end) mandates over [0, horizon] months."""
    out = []
    for _ in range(seats):
        if fixed:
            t, ms = 0.0, []
        else:
            t, ms = -rng.uniform(0, hi), []       # random phase
        while t < horizon:
            L = fixed if fixed else rng.uniform(lo, hi)
            ms.append((t, t + L))
            t += L
        out.append(ms)
    return out


def wait_and_learning(seats, k, lo, hi, reps, rng, fixed=None):
    waits, firsts, peak = [], [], []
    horizon = 120.0
    for _ in range(reps):
        sched = renewal(seats, lo, hi, horizon, rng, fixed)
        t0 = rng.uniform(24.0, 96.0)
        ends = []
        for ms in sched:
            for s, e in ms:
                if s <= t0 < e:
                    ends.append(e - t0)
                    break
        ends.sort()
        waits.append(ends[k - 1])
        samp = []
        for j in range(24):
            t = rng.uniform(24.0, 96.0)
            samp.append(sum(1 for ms in sched for s, e in ms if s <= t < e and t - s < LEARN) / seats)
        firsts.append(statistics.mean(samp))
        peak.append(max(samp))
    waits.sort()
    return (statistics.mean(waits), waits[int(0.95 * len(waits))], statistics.mean(firsts),
            statistics.mean(peak))


def part_b(reps, rng):
    print(f"\n## B. Waiting time until K members are new; learning cost (first {LEARN:.0f} month)\n")
    print("| Body | Rule | K | Mean wait (months) | 95th pct wait | Mean share in first month "
          "| Mean of per-run peak share |")
    print("|---|---|---|---|---|---|---|")
    rows = (("15", "fixed 6 months (current)", 15, 8, None, None, FIXED),
            ("15", "H6 3-6 months", 15, 8, *RANGE15, None),
            ("15", "H6 3-6 months", 15, 12, *RANGE15, None),
            ("101", "staggered 12 months (current)", 101, 51, FIXED101, FIXED101, None),
            ("101", "H6 Set A 2-4 months", 101, 51, *RANGES101["A"], None),
            ("101", "H6 Set B 4-8 months", 101, 51, *RANGES101["B"], None))
    for body, label, seats, k, lo, hi, fixed in rows:
        w, w95, f, pk = wait_and_learning(seats, k, lo or 0, hi or 0, reps, rng, fixed)
        print(f"| {body} | {label} | {k} | {w:.2f} | {w95:.2f} | {f:.1%} | {pk:.1%} |")
    print("\nUnder fixed six-month mandates the whole council changes at once, so the 'same council "
          "with 8 new' is the next council (15 new). Peak share = worst sampled month per run.")


def fill_node(n, r, h6, months, rng):
    free = [0] * n                 # month a person may sit again
    seat_end = [-1] * 15
    seat_start = [0] * 15
    occupant = [None] * 15
    bad = 0
    for m in range(months):
        for s in range(15):
            if occupant[s] is not None and seat_end[s] <= m:
                i = occupant[s]
                served = seat_end[s] - seat_start[s]
                free[i] = m + 2 * served
                occupant[s] = None
        busy = {o for o in occupant if o is not None}
        empty = [s for s in range(15) if occupant[s] is None]
        pool = [i for i in range(n) if free[i] <= m and i not in busy]
        rng.shuffle(pool)
        for s in empty:
            while pool:
                i = pool.pop()
                if rng.random() >= r:
                    occupant[s] = i
                    seat_start[s] = m
                    if h6:
                        seat_end[s] = m + rng.randint(3, 6)
                    else:
                        seat_end[s] = (m // 6 + 1) * 6
                    break
        bad += any(o is None for o in occupant)
    return bad / months


def part_c(reps, rng):
    print("\n## C. Smallest node keeping >= 95% of months with a full 15-seat council (monthly MC)\n")
    grid = (45, 50, 60, 70, 80, 100, 120, 150, 200, 300)
    print("| Refusal r | Fixed 6 months (current) | H6 3-6 months (whole months) |")
    print("|---|---|---|")
    for r in (0.0, 0.3, 0.6, 0.8):
        cells = []
        for h6 in (False, True):
            found = "> 300"
            for n in grid:
                f = statistics.mean(fill_node(n, r, h6, 120, rng) for _ in range(reps))
                if f <= 0.05:
                    found = str(n)
                    break
            cells.append(found)
        print(f"| {r} | " + " | ".join(cells) + " |")


def faction_runs(q, lo, hi, fixed, reps, rng, k=8):
    hold, spells, cond, base = 0, [], [], 0
    for _ in range(reps):
        sched = renewal(15, lo, hi, 120.0, rng, fixed)
        tags = [[rng.random() < q for _ in ms] for ms in sched]

        def comp(t):
            c, idx = 0, []
            for si, ms in enumerate(sched):
                for mi, (s, e) in enumerate(ms):
                    if s <= t < e:
                        c += tags[si][mi]
                        idx.append((si, mi, e))
                        break
            return c, idx
        run, steps = 0, 0
        for j in range(96 * 4):
            t = 24.0 + j * 0.25
            c, _ = comp(t)
            steps += 1
            if c >= 9:
                hold += 1
                run += 1
            elif run:
                spells.append(run * 0.25)
                run = 0
        for _ in range(10):                 # ten decisions per run
            t0 = rng.uniform(24.0, 90.0)
            c0, idx = comp(t0)
            if c0 >= 9:
                base += 1
                t1 = sorted(e for _, _, e in idx)[k - 1] + 1e-6
                cond.append(comp(t1)[0] >= 9)
    tot = reps * 96 * 4
    return hold / tot, (statistics.mean(spells) if spells else 0.0), \
        (statistics.mean(cond) if cond else float("nan")), len(cond)


def part_d(reps, rng):
    print("\n## D. RED-2: faction holding 9 of 15 over time (large pool)\n")
    print("| f | r | q (seat prob.) | Rule | Share of time >= 9 seats | Mean spell (months) "
          "| P(still >= 9 at second reading given >= 9 at decision) | Decisions sampled |")
    print("|---|---|---|---|---|---|---|---|")
    for f, r in ((0.10, 0.9), (0.05, 0.94), (0.20, 0.6), (0.20, 0.8)):
        q = f / (f + (1 - f) * (1 - r))
        for label, lo, hi, fixed, k in (("fixed 6 months", 0, 0, FIXED, 8),
                                        ("H6 3-6 months, K=8", *RANGE15, None, 8),
                                        ("H6 3-6 months, K=12", *RANGE15, None, 12)):
            h, s, c, nn = faction_runs(q, lo, hi, fixed, reps, rng, k)
            print(f"| {f:.2f} | {r} | {q:.2f} | {label} | {h:.1%} | {s:.2f} | {c:.2f} | {nn} |")
    print("\nUnder fixed mandates the second reading is held by the next council (all new), "
          "so it is independent of the first; under H6, 15 - K of the members are retained.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=2000)
    ap.add_argument("--seed", type=int, default=SEED)
    a = ap.parse_args()
    rng = random.Random(a.seed)
    print("SIM-QA-19 H5/H6 — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)")
    print(f"reps={a.reps} seed={a.seed}; learning time {LEARN} month; retained members anchored")
    part_a()
    part_b(a.reps, rng)
    part_c(max(20, a.reps // 50), rng)
    part_d(max(100, a.reps // 4), rng)


if __name__ == "__main__":
    main()
