#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-19: STATISTICAL REPRESENTATIVENESS OF THE SORTITION TIERS
File: simone/benchmarks/sim_qa_19_tier_representativeness.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

Part A is exact arithmetic (no randomness). Parts B and C use exact
hypergeometric / convolved-binomial formulas; part C adds a Monte Carlo
quota-fill draw with a fixed seed. Opinion shares, age/gender/geography
shares and the age-opinion correlation are ASSUMPTIONS for a stylised test.
SYNTHETIC MODEL OUTPUT ONLY, NOT CALIBRATED ON ANY REAL POPULATION.

Questions per body size n (Arts. 4.2, 4.5.4):
  Q1  95% margin of error of a share, normal approximation 1.96*sqrt(.25/n)
      (exact Clopper-Pearson half-width at k = n/2 shown alongside).
  Q2  Population 60% in favour: P(body has fewer than a simple majority,
      i.e. fewer than floor(n/2)+1 yes votes).
  Q3  Population split 50/50: P(body reaches the 60% threshold,
      i.e. at least ceil(0.6 n) yes votes, Art. 4.5.4).
  Q4  A 10% minority holds no seat: P(X = 0).

Part A  infinite population, simple random draw (binomial)   -> docket table
Part B  finite node of 50 / 150 / 500 adults (hypergeometric) + FPC margin
Part C  stratified draws: (C1) exact proportional age stratification,
        (C2) Monte Carlo marginal quotas on age x gender x geography,
        (C3) concentrated minority, (C4) expected seats at 1,001 seats.

Reproduce:
  python3 simone/benchmarks/sim_qa_19_tier_representativeness.py
  python3 simone/benchmarks/sim_qa_19_tier_representativeness.py --reps 2000
"""

import argparse
import math
import random

TIERS = (3, 15, 101, 301, 1001)
NODES = (50, 150, 500)
P_FAVOUR = 0.60
MINORITY = 0.10
WORLD_ADULTS = 8.1e9          # assumption: planetary population base for one seat
# ---- stratification assumptions (synthetic) -------------------------------
AGE = (("18-34", 0.30), ("35-64", 0.45), ("65+", 0.25))
AGE_SUPPORT = (0.45, 0.60, 0.78)          # P(yes | age band); mean = 0.60
GENDER = (("f", 0.5), ("m", 0.5))
GEO = (("zone-A", 1 / 3), ("zone-B", 1 / 3), ("zone-C", 1 / 3))


def majority(n):
    return n // 2 + 1


def threshold(n, share):
    """Smallest whole number of votes >= share of n (Art. 4.5.4)."""
    return math.ceil(round(share * n, 9))


def log_comb(n, k):
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def binom_pmf(n, p):
    if p <= 0.0 or p >= 1.0:
        return [1.0 if k == round(p * n) else 0.0 for k in range(n + 1)]
    lp, lq = math.log(p), math.log1p(-p)
    return [math.exp(log_comb(n, k) + k * lp + (n - k) * lq) for k in range(n + 1)]


def hyper_pmf(pop, succ, n):
    """P(k successes in n draws without replacement from pop with succ successes)."""
    denom = log_comb(pop, n)
    out = []
    for k in range(n + 1):
        if k > succ or n - k > pop - succ:
            out.append(0.0)
        else:
            out.append(math.exp(log_comb(succ, k) + log_comb(pop - succ, n - k) - denom))
    return out


def convolve(a, b):
    out = [0.0] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        if x:
            for j, y in enumerate(b):
                out[i + j] += x * y
    return out


def lower(pmf, k_max):
    return sum(pmf[: k_max + 1])


def upper(pmf, k_min):
    return sum(pmf[k_min:])


def beta_quantile(q, a, b):
    """Quantile of Beta(a, b) by bisection on the regularized incomplete beta
    computed as a binomial tail (valid for integer a, b)."""
    # I_x(a, b) = P(Binomial(a+b-1, x) >= a)
    n = a + b - 1
    lo, hi = 0.0, 1.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if upper(binom_pmf(n, mid), a) < q:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def clopper_pearson_half(n):
    k = n // 2
    lo = 0.0 if k == 0 else beta_quantile(0.025, k, n - k + 1)
    hi = 1.0 if k == n else beta_quantile(0.975, k + 1, n - k)
    return (hi - lo) / 2


def fmt(p):
    if p < 0.005:
        return f"~0 ({p:.1e})"
    return f"{100 * p:.0f}% ({p:.3f})"


def largest_remainder(seats, shares):
    raw = [seats * s for s in shares]
    base = [int(math.floor(r)) for r in raw]
    rem = sorted(range(len(shares)), key=lambda i: raw[i] - base[i], reverse=True)
    for i in rem[: seats - sum(base)]:
        base[i] += 1
    return base


# ------------------------------------------------------------------ part A
def part_a():
    print("\n## Part A: infinite population, simple random draw (exact binomial)\n")
    print("| Seats | 95% MoE normal | 95% CP half-width at 50% | Q2: 60% pop, no simple majority "
          "| Q3: 50/50 pop, reaches 60% | Q4: 10% minority, no seat |")
    print("|---|---|---|---|---|---|")
    for n in TIERS:
        moe = 1.96 * math.sqrt(0.25 / n)
        q2 = lower(binom_pmf(n, P_FAVOUR), majority(n) - 1)
        q3 = upper(binom_pmf(n, 0.5), threshold(n, 0.6))
        q4 = (1 - MINORITY) ** n
        print(f"| {n} | ±{100 * moe:.0f}% ({moe:.3f}) | ±{100 * clopper_pearson_half(n):.0f}% "
              f"| {fmt(q2)} | {fmt(q3)} | {fmt(q4)} |")
    print("\nThresholds used: simple majority = floor(n/2)+1; 60% = ceil(0.6 n) "
          "(3 -> 2, 15 -> 9, 101 -> 61, 301 -> 181, 1001 -> 601).")


# ------------------------------------------------------------------ part B
def part_b():
    print("\n## Part B: finite node, draw without replacement (exact hypergeometric)\n")
    print("Body sizes drawn from each node: 3 and 15, plus 101 where the node is large enough.")
    print("Shares are rounded to whole persons (e.g. 60% of 50 = 30 in favour).\n")
    print("| Node adults | Seats | 95% MoE with FPC | Q2: 60% pop, no simple majority "
          "| Q3: 50/50 pop, reaches 60% | Q4: 10% minority, no seat |")
    print("|---|---|---|---|---|---|")
    for pop in NODES:
        for n in (3, 15, 101):
            if n >= pop:
                continue
            fpc = math.sqrt((pop - n) / (pop - 1))
            moe = 1.96 * math.sqrt(0.25 / n) * fpc
            q2 = lower(hyper_pmf(pop, round(P_FAVOUR * pop), n), majority(n) - 1)
            q3 = upper(hyper_pmf(pop, pop // 2, n), threshold(n, 0.6))
            q4 = hyper_pmf(pop, round(MINORITY * pop), n)[0]
            print(f"| {pop} | {n} | ±{100 * moe:.0f}% | {fmt(q2)} | {fmt(q3)} | {fmt(q4)} |")


# ------------------------------------------------------------------ part C
def stratified_exact(n, pop_support):
    """Proportional age-stratified draw from an infinite population."""
    seats = largest_remainder(n, [s for _, s in AGE])
    pmf = [1.0]
    for k, p in zip(seats, pop_support):
        pmf = convolve(pmf, binom_pmf(k, p))
    return seats, pmf


def build_population(pop):
    """Exactly `pop` adults split over the 18 cells by largest remainder; inside
    each cell the yes-count is fixed (rounded), so node support stays near 60%."""
    keys, shares = [], []
    for a_i, (_, a_s) in enumerate(AGE):
        for g_i, (_, g_s) in enumerate(GENDER):
            for z_i, (_, z_s) in enumerate(GEO):
                keys.append((a_i, g_i, z_i))
                shares.append(a_s * g_s * z_s)
    counts = largest_remainder(pop, shares)
    want = [c * AGE_SUPPORT[k[0]] for k, c in zip(keys, counts)]
    yes_counts = largest_remainder(round(P_FAVOUR * pop), [w / sum(want) for w in want])
    people = []
    for (a_i, g_i, z_i), cnt, yes in zip(keys, counts, yes_counts):
        yes = min(yes, cnt)
        people += [(a_i, g_i, z_i, k < yes) for k in range(cnt)]
    return people


def quota_fill(rng, people, n):
    """Sequential quota fill on the three marginals (common assembly practice):
    shuffle the register, admit a person only if no marginal quota is full."""
    qa = largest_remainder(n, [s for _, s in AGE])
    qg = largest_remainder(n, [s for _, s in GENDER])
    qz = largest_remainder(n, [s for _, s in GEO])
    order = list(range(len(people)))
    rng.shuffle(order)
    body = []
    for i in order:
        a, g, z, _ = people[i]
        if qa[a] and qg[g] and qz[z]:
            qa[a] -= 1
            qg[g] -= 1
            qz[z] -= 1
            body.append(people[i])
            if len(body) == n:
                return body
    return body


def part_c(reps, seed):
    print("\n## Part C: stratified variants (synthetic strata, uncalibrated)\n")
    print("Assumed strata: age " + ", ".join(f"{a} {s:.0%}" for a, s in AGE)
          + "; gender 50/50; geography three equal zones.")
    print("Assumed support for the measure by age band: "
          + ", ".join(f"{a} {p:.0%}" for (a, _), p in zip(AGE, AGE_SUPPORT)) + " (mean 60%).")
    cells = len(AGE) * len(GENDER) * len(GEO)
    print(f"\nFull cross-stratification needs {cells} cells. A body of 3 or 15 cannot fill them: "
          f"at 15 seats at least {cells - 15} cells are empty, so only marginal quotas are feasible.")

    print("\n### C1: exact, proportional age stratification vs simple random draw "
          "(Q2: 60% pop, no simple majority)\n")
    print("| Seats | Age seats | Simple random | Age-stratified | Ratio |")
    print("|---|---|---|---|---|")
    for n in TIERS:
        seats, pmf = stratified_exact(n, AGE_SUPPORT)
        srs = lower(binom_pmf(n, P_FAVOUR), majority(n) - 1)
        st = lower(pmf, majority(n) - 1)
        ratio = st / srs if srs > 0 else float("nan")
        print(f"| {n} | {'/'.join(map(str, seats))} | {fmt(srs)} | {fmt(st)} | {ratio:.2f} |")

    print(f"\n### C2: Monte Carlo quota fill on age x gender x geography marginals "
          f"(reps={reps}, seed={seed})\n")
    print("| Node adults | Seats | Realised support in node | Q2 simple random (exact) "
          "| Q2 quota fill (MC) | Mean seats held by 65+ |")
    print("|---|---|---|---|---|---|")
    for pop in NODES:
        rng = random.Random(seed + pop)
        people = build_population(pop)
        support = sum(p[3] for p in people)
        for n in (3, 15, 101):
            if n >= len(people):
                continue
            fails, old = 0, 0
            for _ in range(reps):
                body = quota_fill(rng, people, n)
                fails += sum(b[3] for b in body) < majority(n)
                old += sum(1 for b in body if b[0] == 2)
            srs = lower(hyper_pmf(len(people), support, n), majority(n) - 1)
            print(f"| {len(people)} | {n} | {support / len(people):.1%} | {fmt(srs)} "
                  f"| {fmt(fails / reps)} | {old / reps:.2f} |")

    print("\n### C3: 10% minority concentrated in one geography zone (30% of that zone)\n")
    print("| Seats | Zone seats | Q4 simple random | Q4 geography-stratified |")
    print("|---|---|---|---|")
    for n in (3, 15, 101):
        zs = largest_remainder(n, [s for _, s in GEO])[0]
        print(f"| {n} | {zs} | {fmt((1 - MINORITY) ** n)} | {fmt(0.7 ** zs)} |")

    print(f"\n### C4: Global Commons Assembly, 1,001 seats for {WORLD_ADULTS:.1e} persons "
          f"(one seat per {WORLD_ADULTS / 1001 / 1e6:.1f} million)\n")
    print("| Group size | Expected seats | P(no seat), simple random |")
    print("|---|---|---|")
    for g in (2e5, 1e6, 5e6, 1e7, 5e7):
        share = g / WORLD_ADULTS
        print(f"| {g:,.0f} | {1001 * share:.3f} | {(1 - share) ** 1001:.3f} |")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=20000)
    ap.add_argument("--seed", type=int, default=20261112)
    a = ap.parse_args()
    print("SIM-QA-19 tier representativeness — SYNTHETIC MODEL OUTPUT (not empirical)")
    print(f"reps={a.reps} seed={a.seed}  Parts A/B and C1/C3/C4 are exact; C2 is Monte Carlo.")
    part_a()
    part_b()
    part_c(a.reps, a.seed)


if __name__ == "__main__":
    main()
