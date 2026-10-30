#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — SIM-QA-11: DEMARCHIC SORTITION JURY DoS / PETITION FLOODING
File: simone/benchmarks/sim_qa_11_petition_dos.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)

SYNTHETIC MODEL OUTPUT ONLY. Every parameter below is an assumption chosen for a
stylised stress test, not an empirical measurement of any real assembly.

Model (weekly discrete-time, Monte Carlo, Python stdlib only):
  * One Neighborhood Sortition Council (15 jurors, Art. 4.2.2) serving N adults.
  * Organic (good-faith) petitions arrive as Poisson(LAMBDA_ORGANIC) per week.
  * A coordinated faction of share f floods petitions. One identity per human
    (ZK-PoP, Art. 7.4.4) is ASSUMED to hold: Sybil identities are out of scope.
  * The council can fully deliberate at most CAPACITY dockets per week.

Scenarios:
  S0  Status quo text: no intake rule. FIFO queue. Because delegates set the
      agenda themselves (Art. 4.3.4), every juror screens every raw petition.
  S1  Allowance only: equal per-person endorsement allowance (quadratic token
      cost, see TOKENS) + co-signature threshold. FIFO. Council screens only
      qualified petitions.
  S2  Lottery cap only (no allowance, no threshold): hard cap on agenda slots,
      uniform lottery among pending petitions, a 3-citizen triage panel checks
      format / merges duplicates; council reads a one-line digest.
  S3  Full defense: S1 + S2, lottery weighted by divisible support (each
      endorser's weight is split across the petitions they endorse), plus a
      broad-support fast lane (>= FAST_LANE_SHARE of adults).
      The attacker plays both pure strategies (all normal lane / all fast lane);
      the worst case for organic petitioners is reported.

Reproduce:
  python3 simone/benchmarks/sim_qa_11_petition_dos.py             # 400 reps
  python3 simone/benchmarks/sim_qa_11_petition_dos.py --reps 50   # quick run
"""

import argparse
import math
import random
import statistics

# ---------------------------------------------------------------- parameters
N_ADULTS = 300            # node size (Neighborhood Council tier)
WEEKS = 52                # simulated horizon (two 6-month council mandates)
LAMBDA_ORGANIC = 2.0      # good-faith petitions per week (assumption)
P_ORGANIC_SUPPORT = 0.80  # share of organic petitions that gather co-signers
P_ORGANIC_BROAD = 0.15    # share of supported organic petitions reaching fast lane
CAPACITY = 3              # full dockets per week the council can deliberate
H_DOCKET = 4.0            # juror-hours per fully deliberated docket
H_SCREEN_RAW = 0.5        # juror-hours to screen one raw petition (S0/S1)
H_DIGEST = 0.05           # juror-hours per digest line (S2/S3)
H_TRIAGE = 0.25           # triage-panel member hours per entering petition
BURNOUT_H = 15.0          # weekly governance load treated as unsustainable
QUARTER = 13              # allowance refresh period (weeks)
TOKENS = 9                # attention tokens per adult per quarter; making k
                          # endorsements (authoring OR co-signing) costs k^2,
                          # i.e. floor(sqrt(9)) = 3 endorsements per quarter
ENDORSE = math.isqrt(TOKENS)
CO_SIGN_SHARE = 0.02      # co-signers needed = max(3, ceil(share * N))
FAST_LANE_SHARE = 0.10    # distinct co-signers for the fast lane
EXPIRY = 13               # weeks an unheard petition stays in the lottery pool
ATTACK_PER_MEMBER = 1.0   # attack intensity: petitions per member per week
BURST = 50                # one-off burst at week 0 ("50 bad-faith proposals")


def poisson(rng, lam):
    """Knuth Poisson sampler (stdlib only)."""
    l_val, k, p = math.exp(-lam), 0, 1.0
    while True:
        p *= rng.random()
        if p <= l_val:
            return k
        k += 1


def co_signers_needed(n):
    return max(3, math.ceil(CO_SIGN_SHARE * n))


def weighted_sample(rng, items, weights, k):
    """Weighted sampling without replacement (stdlib only)."""
    items, weights, out = list(items), list(weights), []
    for _ in range(min(k, len(items))):
        r, acc = rng.random() * sum(weights), 0.0
        for i, w in enumerate(weights):
            acc += w
            if acc >= r:
                out.append(items.pop(i))
                weights.pop(i)
                break
    return out


def run_once(scenario, faction_share, seed, atk_fast=False):
    rng = random.Random(seed)
    allowance = scenario in ("S1", "S3")
    lottery = scenario in ("S2", "S3")
    weighted = fast_lane = scenario == "S3"
    n_fac = int(round(faction_share * N_ADULTS))
    n_org = N_ADULTS - n_fac
    need = co_signers_needed(N_ADULTS)
    need_fast = math.ceil(FAST_LANE_SHARE * N_ADULTS)

    pending = []
    waits, slots_atk, slots_total = [], 0, 0
    org_submitted = org_expired = 0
    loads, triage_loads = [], []
    org_endorse = fac_endorse = 0

    for week in range(WEEKS):
        if week % QUARTER == 0:
            org_endorse = n_org * ENDORSE   # pooled (organic rarely binds)
            fac_endorse = n_fac * ENDORSE   # pooled (generous to attacker)
        new = []

        # ---- organic arrivals
        for _ in range(poisson(rng, LAMBDA_ORGANIC)):
            org_submitted += 1
            supported = rng.random() < P_ORGANIC_SUPPORT
            broad = supported and rng.random() < P_ORGANIC_BROAD
            if allowance:
                cost = 1 + (need_fast if broad else need)
                if not supported or org_endorse < cost:
                    continue  # remains on the public register, not on agenda
                org_endorse -= cost
                # organic endorsers typically endorse once: undivided weight
                weight = float(cost)
            else:
                weight = 1.0
            new.append({"t": week, "atk": False, "broad": broad, "w": weight})

        # ---- attacker arrivals
        n_atk = 0 if n_fac == 0 else int(ATTACK_PER_MEMBER * n_fac) + (BURST if week == 0 else 0)
        for _ in range(n_atk):
            if allowance:
                use_fast = fast_lane and atk_fast and n_fac >= 1 + need_fast
                cost = 1 + (need_fast if use_fast else need)
                if n_fac < 1 + need or fac_endorse < cost:
                    break
                fac_endorse -= cost
                # flooding members spend all ENDORSE units: weight split ENDORSE ways
                new.append({"t": week, "atk": True, "broad": use_fast, "w": cost / ENDORSE})
            else:
                new.append({"t": week, "atk": True, "broad": False, "w": 1.0})

        # ---- screening load
        if lottery:
            screen_h = H_DIGEST * len(new)
            triage_loads.append(H_TRIAGE * len(new))
        else:
            screen_h = H_SCREEN_RAW * len(new)
            triage_loads.append(0.0)
        pending.extend(new)

        # ---- expiry of stale petitions in lottery pool
        if lottery:
            org_expired += sum(1 for p in pending if not p["atk"] and week - p["t"] >= EXPIRY)
            pending = [p for p in pending if week - p["t"] < EXPIRY]

        # ---- agenda selection
        chosen = []
        if fast_lane:
            chosen = sorted((p for p in pending if p["broad"]), key=lambda p: p["t"])[:CAPACITY]
        cid = set(id(p) for p in chosen)
        rest = [p for p in pending if id(p) not in cid]
        free = CAPACITY - len(chosen)
        if free > 0 and rest:
            if weighted:
                chosen += weighted_sample(rng, rest, [p["w"] for p in rest], free)
            elif lottery:
                chosen += rng.sample(rest, min(free, len(rest)))
            else:
                chosen += rest[:free]  # FIFO
        cid = set(id(p) for p in chosen)
        pending = [p for p in pending if id(p) not in cid]
        for p in chosen:
            slots_total += 1
            if p["atk"]:
                slots_atk += 1
            else:
                waits.append(week - p["t"])
        loads.append(screen_h + H_DOCKET * len(chosen))

    return {
        "org_submitted": org_submitted,
        "waits": waits,
        "atk_share": slots_atk / slots_total if slots_total else 0.0,
        "mean_load": statistics.mean(loads),
        "max_load": max(loads),
        "burnout_weeks": sum(1 for x in loads if x > BURNOUT_H),
        "triage_mean": statistics.mean(triage_loads),
        "org_backlog": sum(1 for p in pending if not p["atk"]),
        "org_expired": org_expired,
    }


def pct(xs, q):
    if not xs:
        return float("nan")
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(q * len(xs)))]


def summarize(scenario, f, reps, base_seed, atk_fast=False):
    rs = [run_once(scenario, f, base_seed + i, atk_fast) for i in range(reps)]
    waits = [w for r in rs for w in r["waits"]]
    sub = sum(r["org_submitted"] for r in rs)
    return {
        "heard_pct": 100.0 * len(waits) / sub,
        "within8_pct": 100.0 * sum(1 for w in waits if w <= 8) / sub,
        "wait_med": pct(waits, 0.5), "wait_p95": pct(waits, 0.95),
        "atk_share": 100.0 * statistics.mean(r["atk_share"] for r in rs),
        "load_mean": statistics.mean(r["mean_load"] for r in rs),
        "load_max": statistics.mean(r["max_load"] for r in rs),
        "burnout": statistics.mean(r["burnout_weeks"] for r in rs),
        "triage": statistics.mean(r["triage_mean"] for r in rs),
        "backlog": statistics.mean(r["org_backlog"] for r in rs),
        "expired": statistics.mean(r["org_expired"] for r in rs),
    }


def faction_cap_per_quarter(f, fast=False):
    """Analytic upper bound on faction petitions per quarter under allowance."""
    n_fac = int(round(f * N_ADULTS))
    signers = math.ceil(FAST_LANE_SHARE * N_ADULTS) if fast else co_signers_needed(N_ADULTS)
    if n_fac < 1 + signers:
        return 0
    return (n_fac * ENDORSE) // (1 + signers)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=400)
    ap.add_argument("--seed", type=int, default=20261030)
    a = ap.parse_args()

    print("SIM-QA-11 petition DoS — SYNTHETIC MODEL OUTPUT (not empirical)")
    print(f"N={N_ADULTS} weeks={WEEKS} reps={a.reps} seed={a.seed} capacity={CAPACITY}/wk "
          f"organic={LAMBDA_ORGANIC}/wk co-signers={co_signers_needed(N_ADULTS)} "
          f"fast-lane={math.ceil(FAST_LANE_SHARE * N_ADULTS)} endorsements={ENDORSE}/adult/qtr "
          f"attack={ATTACK_PER_MEMBER}/member/wk + burst {BURST} burnout>{BURNOUT_H}h/wk")
    hdr = ("scen", "f", "org_heard%", "org<=8wk%", "wait_med_wk", "wait_p95_wk", "atk_slot%",
           "juror_load_mean_h", "juror_load_peak_h", "burnout_wks/52", "triage_h/wk/member",
           "org_backlog_end", "org_expired")
    print("| " + " | ".join(hdr) + " |")
    print("|" + "---|" * len(hdr))
    for f in (0.0, 0.05, 0.10, 0.20):
        for s in ("S0", "S1", "S2", "S3"):
            if s == "S3":
                cand = [summarize(s, f, a.reps, a.seed, af) for af in (False, True)]
                r = min(cand, key=lambda c: c["within8_pct"])
                tag = "S3*"
            else:
                r, tag = summarize(s, f, a.reps, a.seed), s
            print(f"| {tag} | {f:.2f} | {r['heard_pct']:.1f} | {r['within8_pct']:.1f} | "
                  f"{r['wait_med']} | {r['wait_p95']} | {r['atk_share']:.1f} | "
                  f"{r['load_mean']:.1f} | {r['load_max']:.1f} | {r['burnout']:.1f} | "
                  f"{r['triage']:.2f} | {r['backlog']:.1f} | {r['expired']:.1f} |")
    print("(S3* = worst case over attacker pure strategies: all-normal-lane vs all-fast-lane)")

    print(f"\nAnalytic faction ceiling under allowance (petitions/quarter; council "
          f"capacity = {CAPACITY * QUARTER}/quarter):")
    for f in (0.05, 0.10, 0.20):
        print(f"  f={f:.2f}: normal lane <= {faction_cap_per_quarter(f)}, "
              f"fast lane <= {faction_cap_per_quarter(f, fast=True)}")

    print("\nTier-0 (3-person panel) plebiscite-forcing exposure "
          "(Art. 4.2.1: 75% of 3 = unanimity): P(>=1 faction member seated) = 1-(1-f)^3")
    for f in (0.05, 0.10, 0.20):
        print(f"  f={f:.2f}: {1 - (1 - f) ** 3:.3f}")


if __name__ == "__main__":
    main()
