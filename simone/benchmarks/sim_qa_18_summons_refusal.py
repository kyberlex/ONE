#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-18: REFUSAL OF A SORTITION SUMMONS
File: simone/benchmarks/sim_qa_18_summons_refusal.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC AND UNCALIBRATED. Every share, multiplier and effect size below is an
assumption picked for a stylised stress test, not a measurement of any real
population or assembly. Read the output as relative behaviour between rules.

Model (quarterly steps, 10-year horizon, Monte Carlo, Python stdlib only):
  * A node of N adults with age band (3), gender (2), geography zone (3) and a
    care-load flag. Care load is more frequent among women and ages 35-64.
  * Neighborhood Sortition Council: 15 seats, six-month mandates, then a
    twelve-month hiatus in that tier (Art. 4.3.3: twice the mandate).
  * Local Mediation Panel: 3 seats, three-month mandates, six-month hiatus.
  * Nobody sits on both bodies at once (assumption). Hiatus is per tier.
  * Each term: a quota-fill draw on the age, gender and geography marginals
    (Art. 4.3.1) picks the summoned list; each summoned person refuses with
    probability r_i; refusals are replaced until seats are full or the eligible
    pool is exhausted.
  * Refusal modes: UNIFORM (r_i = r) and CORRELATED (r_i proportional to an age
    multiplier times a care multiplier, rescaled so the population mean is r,
    capped at 0.99).

Rules compared:
  B0  current text (procedure undefined): refusal is free; a refuser is
      replaced by the next random eligible person, with no stratum check.
  H1  duty to attend orientation, right to withdraw: a share ORIENT_RETAIN of
      would-be refusers stays after orientation (assumed effect size).
  H2  one deferral, listed excusals: a refuser is re-summoned first at the next
      term of the same body; a deferred carer is re-summoned with care support
      pre-arranged, so the care multiplier no longer applies.
  H3  stratum-matched alternates: a refuser is replaced from the same
      age x gender x zone cell (fallback: same age and gender, then anyone).
  ALL H1 + H2 + H3.

Outputs:
  (a) fill failure: share of terms with at least one empty seat, and the
      lowest swept r at which that share reaches 5%;
  (b) composition drift: total-variation distance (TVD) between seated and
      population shares for age, gender and geography, and the carer share
      among seated members vs the population.

Reproduce:
  python3 simone/benchmarks/sim_qa_18_summons_refusal.py              # 200 reps
  python3 simone/benchmarks/sim_qa_18_summons_refusal.py --reps 40    # quick
"""

import argparse
import math
import random
import statistics

NODES = (50, 150, 500)
QUARTERS = 40
COUNCIL = {"seats": 15, "mandate": 2, "hiatus": 4, "every": 2}   # in quarters
PANEL = {"seats": 3, "mandate": 1, "hiatus": 2, "every": 1}
SWEEP = (0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.94, 0.95)
REPORT_R = (0.3, 0.6, 0.9, 0.94)
FAIL_LEVEL = 0.05
ORIENT_RETAIN = 0.30          # H1 assumption: 30% of would-be refusers stay
AGE = (0.30, 0.45, 0.25)      # 18-34, 35-64, 65+
GENDER = (0.5, 0.5)           # f, m
ZONE = (1 / 3, 1 / 3, 1 / 3)
CARE_P = {(0, 0): 0.20, (0, 1): 0.10, (1, 0): 0.35, (1, 1): 0.20,
          (2, 0): 0.15, (2, 1): 0.10}     # P(care load | age, gender)
AGE_MULT = (1.3, 1.0, 0.8)    # younger adults refuse more (assumption)
CARE_MULT = 2.5               # carers refuse more (assumption)
RULES = ("B0", "H1", "H2", "H3", "ALL")


def largest_remainder(seats, shares, rng=None):
    raw = [seats * s for s in shares]
    base = [int(math.floor(x + 1e-9)) for x in raw]
    idx = list(range(len(shares)))
    if rng:
        rng.shuffle(idx)                      # random tie-break
    idx.sort(key=lambda i: raw[i] - base[i], reverse=True)
    for i in idx[: seats - sum(base)]:
        base[i] += 1
    return base


def build_node(n, rng):
    keys, shares = [], []
    for a, sa in enumerate(AGE):
        for g, sg in enumerate(GENDER):
            for z, sz in enumerate(ZONE):
                keys.append((a, g, z))
                shares.append(sa * sg * sz)
    people = []
    for (a, g, z), cnt in zip(keys, largest_remainder(n, shares)):
        for _ in range(cnt):
            people.append({"a": a, "g": g, "z": z, "care": rng.random() < CARE_P[(a, g)]})
    return people


def refusal_probs(people, r, correlated):
    if not correlated:
        return [r] * len(people), [r] * len(people)
    m = [AGE_MULT[p["a"]] * (CARE_MULT if p["care"] else 1.0) for p in people]
    m_nocare = [AGE_MULT[p["a"]] for p in people]
    mean_m = statistics.mean(m)
    cap = lambda x: min(0.99, x)
    return [cap(r * x / mean_m) for x in m], [cap(r * x / mean_m) for x in m_nocare]


def quota_list(rng, pool, people, seats, priority=()):
    """Quota-fill on the three marginals over a shuffled eligible pool.
    `priority` (deferred citizens, H2) is tried first, still under quotas.
    If quotas cannot be met from the pool, remaining seats are filled
    without quotas (relaxation) rather than left empty."""
    qa = largest_remainder(seats, AGE, rng)
    qg = largest_remainder(seats, GENDER, rng)
    qz = largest_remainder(seats, ZONE, rng)
    pri = set(priority)
    order = [i for i in pool if i not in pri]
    rng.shuffle(order)
    order = [i for i in priority if i in set(pool)] + order
    picked, rest = [], []
    for i in order:
        p = people[i]
        if len(picked) < seats and qa[p["a"]] and qg[p["g"]] and qz[p["z"]]:
            qa[p["a"]] -= 1
            qg[p["g"]] -= 1
            qz[p["z"]] -= 1
            picked.append(i)
        else:
            rest.append(i)
    relaxed = min(seats - len(picked), len(rest))
    picked += rest[:relaxed]
    return picked, rest[relaxed:], relaxed


RULE_SETS = {"B0": set(), "H1": {"H1"}, "H2": {"H2"}, "H3": {"H3"}, "ALL": {"H1", "H2", "H3"}}


def fill_term(rng, people, body, pool, rules, probs, deferred, stats):
    on = RULE_SETS[rules]
    h1, h2, h3 = "H1" in on, "H2" in on, "H3" in on
    p_ref, p_ref_nocare = probs
    was_deferred = set(deferred) if h2 else set()
    summons, reserve, relaxed = quota_list(rng, pool, people, body["seats"],
                                           priority=deferred if h2 else ())
    stats["relaxed"] += relaxed
    new_deferred, seated, used = [], [], set(summons)
    ptr = 0

    def refuses(i):
        pr = p_ref_nocare[i] if i in was_deferred else p_ref[i]
        if h1:
            pr *= 1.0 - ORIENT_RETAIN
        return rng.random() < pr

    def next_free(test):
        for j in reserve[ptr:]:
            if j not in used and test(people[j]):
                return j
        return None

    queue = list(summons)
    while queue:
        i = queue.pop(0)
        if not refuses(i):
            seated.append(i)
            continue
        if h2 and i not in was_deferred:
            new_deferred.append(i)
        p, j = people[i], None
        if h3:
            tests = (lambda q: q["a"] == p["a"] and q["g"] == p["g"] and q["z"] == p["z"],
                     lambda q: q["a"] == p["a"] and q["g"] == p["g"],
                     lambda q: True)
            for level, test in enumerate(tests):
                j = next_free(test)
                if j is not None:
                    stats["fallback"] += level > 0
                    break
        else:
            while ptr < len(reserve) and reserve[ptr] in used:
                ptr += 1
            j = reserve[ptr] if ptr < len(reserve) else None
        if j is not None:
            used.add(j)
            queue.append(j)
        while ptr < len(reserve) and reserve[ptr] in used:
            ptr += 1
    return seated, new_deferred


def tvd(counts, target):
    tot = sum(counts)
    if tot == 0:
        return 1.0
    return 0.5 * sum(abs(c / tot - t) for c, t in zip(counts, target))


def run(n, r, correlated, rules, seed, council_hiatus=None):
    rng = random.Random(seed)
    people = build_node(n, rng)
    probs = refusal_probs(people, r, correlated)
    care_pop = sum(p["care"] for p in people) / n
    mean_ref = statistics.mean(probs[0])
    council = dict(COUNCIL, hiatus=council_hiatus) if council_hiatus is not None else COUNCIL
    bodies = {"council": council, "panel": PANEL}
    serving = {b: {} for b in bodies}     # person -> quarter mandate ends
    hiatus = {b: {} for b in bodies}      # person -> quarter hiatus ends
    deferred = {b: [] for b in bodies}
    out = {b: {"terms": 0, "short": 0, "empty": 0, "tvd_a": [], "tvd_g": [], "tvd_z": [],
               "care": []} for b in bodies}
    stats = {"fallback": 0, "relaxed": 0}
    for q in range(QUARTERS):
        for b in ("council", "panel"):
            body = bodies[b]
            for d in (serving[b],):
                for i in [i for i, end in d.items() if end <= q]:
                    del d[i]
                    hiatus[b][i] = q + body["hiatus"]
            if q % body["every"]:
                continue
            busy = set(serving["council"]) | set(serving["panel"])
            pool = [i for i in range(n) if i not in busy and hiatus[b].get(i, -1) <= q]
            seated, deferred[b] = fill_term(rng, people, body, pool, rules, probs, deferred[b], stats)
            for i in seated:
                serving[b][i] = q + body["mandate"]
            o = out[b]
            o["terms"] += 1
            gap = body["seats"] - len(seated)
            o["short"] += gap > 0
            o["empty"] += gap
            if seated:
                o["tvd_a"].append(tvd([sum(people[i]["a"] == k for i in seated) for k in range(3)], AGE))
                o["tvd_g"].append(tvd([sum(people[i]["g"] == k for i in seated) for k in range(2)], GENDER))
                o["tvd_z"].append(tvd([sum(people[i]["z"] == k for i in seated) for k in range(3)], ZONE))
                o["care"].append(sum(people[i]["care"] for i in seated) / len(seated) - care_pop)
    return out, (care_pop, mean_ref), stats


def summarize(n, r, correlated, rules, reps, seed, council_hiatus=None):
    acc = {b: {"short": 0, "terms": 0, "empty": 0, "a": [], "g": [], "z": [], "care": []}
           for b in ("council", "panel")}
    care_pops, refs = [], []
    for k in range(reps):
        out, (care_pop, mean_ref), _ = run(n, r, correlated, rules, seed + 7919 * k, council_hiatus)
        care_pops.append(care_pop)
        refs.append(mean_ref)
        for b, o in out.items():
            x = acc[b]
            x["short"] += o["short"]
            x["terms"] += o["terms"]
            x["empty"] += o["empty"]
            x["a"] += o["tvd_a"]
            x["g"] += o["tvd_g"]
            x["z"] += o["tvd_z"]
            x["care"] += o["care"]
    res = {}
    for b, x in acc.items():
        m = lambda v: statistics.mean(v) if v else float("nan")
        res[b] = {"fail": x["short"] / x["terms"], "empty": x["empty"] / x["terms"],
                  "a": m(x["a"]), "g": m(x["g"]), "z": m(x["z"]), "care": m(x["care"])}
    return res, statistics.mean(care_pops), statistics.mean(refs)


def faction_capture():
    """RED-2, analytic: a faction of share f that always accepts while everyone
    else refuses with probability r holds an expected seat share of
    f / (f + (1 - f)(1 - r)) under free refusal (any rule that replaces
    refusers from the same pool, H3 included, since the faction is spread
    across strata)."""
    print("\n## RED-2 (analytic): expected seat share of an always-accepting faction\n")
    print("| Faction share f | " + " | ".join(f"r={r}" for r in (0.3, 0.6, 0.9, 0.94)) + " |")
    print("|---|" + "---|" * 4)
    for f in (0.02, 0.05, 0.10, 0.20):
        cells = [f / (f + (1 - f) * (1 - r)) for r in (0.3, 0.6, 0.9, 0.94)]
        print(f"| {f:.2f} | " + " | ".join(f"{c:.0%}" for c in cells) + " |")


def hiatus_sensitivity(reps, seed):
    print("\n## Sensitivity: node of 50, council hiatus = mandate (6 months) instead of 12 months\n")
    print("Share of council terms with an empty seat (UNIFORM refusal).\n")
    print("| Hiatus | Rule | " + " | ".join(f"r={r}" for r in SWEEP) + " |")
    print("|---|---|" + "---|" * len(SWEEP))
    for hq, label in ((4, "12 months"), (2, "6 months")):
        for rule in ("B0", "ALL"):
            row = [summarize(50, r, False, rule, reps, seed, hq)[0]["council"]["fail"] for r in SWEEP]
            print(f"| {label} | {rule} | " + " | ".join(f"{x:.2f}" for x in row) + " |")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=200)
    ap.add_argument("--seed", type=int, default=20261112)
    ap.add_argument("--extras-only", action="store_true",
                    help="print only the RED-2 analytic table and the hiatus sensitivity")
    a = ap.parse_args()
    if a.extras_only:
        faction_capture()
        hiatus_sensitivity(a.reps, a.seed)
        return
    print("SIM-QA-18 summons refusal — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)")
    print(f"reps={a.reps} seed={a.seed} horizon={QUARTERS} quarters; council 15 seats / 2q mandate / "
          f"4q hiatus; panel 3 seats / 1q mandate / 2q hiatus; H1 retain={ORIENT_RETAIN:.0%}; "
          f"age mult={AGE_MULT}; care mult={CARE_MULT}")
    grid = {}
    for correlated in (False, True):
        for n in NODES:
            for rule in RULES:
                for r in SWEEP:
                    grid[(correlated, n, rule, r)] = summarize(n, r, correlated, rule, a.reps, a.seed)

    for correlated in (False, True):
        mode = "CORRELATED (age x care load)" if correlated else "UNIFORM"
        print(f"\n## {mode} refusal\n")
        print("### (a) Lowest swept refusal rate at which >= 5% of terms leave a seat empty\n")
        print("| Node | Body | " + " | ".join(RULES) + " |")
        print("|---|---|" + "---|" * len(RULES))
        for n in NODES:
            for b in ("council", "panel"):
                cells = []
                for rule in RULES:
                    hit = [r for r in SWEEP if grid[(correlated, n, rule, r)][0][b]["fail"] >= FAIL_LEVEL]
                    cells.append(f"{hit[0]:.2f}" if hit else "> 0.95")
                print(f"| {n} | {b} | " + " | ".join(cells) + " |")
        print("\n### (a') Share of council terms with an empty seat, by refusal rate (rule B0)\n")
        print("| Node | " + " | ".join(f"r={r}" for r in SWEEP) + " |")
        print("|---|" + "---|" * len(SWEEP))
        for n in NODES:
            print(f"| {n} | " + " | ".join(f"{grid[(correlated, n, 'B0', r)][0]['council']['fail']:.2f}"
                                          for r in SWEEP) + " |")
        print("\n### (b) Council composition drift (mean TVD age / gender / zone; carer share "
              "seated minus population, percentage points)\n")
        print("| Node | r | " + " | ".join(RULES) + " |")
        print("|---|---|" + "---|" * len(RULES))
        for n in NODES:
            for r in (0.0,) + REPORT_R:
                cells = []
                for rule in RULES:
                    c = grid[(correlated, n, rule, r)][0]["council"]
                    cells.append(f"{c['a']:.2f}/{c['g']:.2f}/{c['z']:.2f}; {100 * c['care']:+.0f}pp")
                print(f"| {n} | {r} | " + " | ".join(cells) + " |")
    print("\nRealised mean refusal probability in CORRELATED mode (node 500; individual "
          "values capped at 0.99, so the mean falls below the nominal r at the top of the sweep):")
    print("  " + ", ".join(f"r={r}: {grid[(True, 500, 'B0', r)][2]:.3f}" for r in SWEEP))
    faction_capture()
    hiatus_sensitivity(a.reps, a.seed)
    care = grid[(True, 500, "B0", 0.0)][1]
    print(f"\nPopulation carer share (node 500, mean over reps): {care:.1%}. "
          "TVD 0 = seated body matches targets; TVD at r=0 under B0 is the quota-fill floor.")


if __name__ == "__main__":
    main()
