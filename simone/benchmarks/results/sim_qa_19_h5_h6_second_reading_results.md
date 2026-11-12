# SIM-QA-19 (revision) — H5 Second Reading and H6 Drawn Mandate Length: Results

**Docket:** `SIM-QA-19` ([`oasis/sim_resolutions_qa.md`](../../../oasis/sim_resolutions_qa.md))
**Script:** [`simone/benchmarks/sim_qa_19_h5_h6_second_reading.py`](../sim_qa_19_h5_h6_second_reading.py) (Python 3 standard library only)
**Author persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later
**Status:** `SIMULATION_HYPOTHESIS`. This is not a canonical change to the constitution.

> [!WARNING]
> **Synthetic and uncalibrated.** Opinion shares, the anchoring of retained members (they keep their first vote), faction shares, refusal rates and the one-month learning time are assumptions. Part A is exact arithmetic on those assumptions; Parts B–D are Monte Carlo with a fixed seed.

## Reproduce

```bash
python3 simone/benchmarks/sim_qa_19_h5_h6_second_reading.py --reps 2000 --seed 20261112
```

About 15 seconds; deterministic for a given `--seed` and `--reps`.

## Output

SIM-QA-19 H5/H6 — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)
reps=2000 seed=20261112; learning time 1.0 month; retained members anchored

## A. RED-1: error after one reading vs. second reading (exact; retained members anchored)

### 15 seats (60% = 9 votes)

| New members at second reading | p=0.5: adopted at 1st | p=0.5: survives 2nd | p=0.4: survives 2nd | p=0.7: adopted at 1st | p=0.7: confirmed at 2nd |
|---|---|---|---|---|---|
| 8 of 15 | 0.304 | 0.156 | 0.0287 | 0.869 | 0.784 |
| 10 of 15 | 0.304 | 0.136 | 0.0217 | 0.869 | 0.774 |
| 12 of 15 | 0.304 | 0.118 | 0.0159 | 0.869 | 0.766 |
| 15 of 15 | 0.304 | 0.092 | 0.0090 | 0.869 | 0.755 |

### 101 seats (60% = 61 votes)

| New members at second reading | p=0.5: adopted at 1st | p=0.5: survives 2nd | p=0.4: survives 2nd | p=0.7: adopted at 1st | p=0.7: confirmed at 2nd |
|---|---|---|---|---|---|
| 51 of 101 | 0.023 | 0.004 | 0.0000 | 0.985 | 0.972 |
| 76 of 101 | 0.023 | 0.002 | 0.0000 | 0.985 | 0.971 |
| 101 of 101 | 0.023 | 0.001 | 0.0000 | 0.985 | 0.970 |

p = population share in favour. A 60% decision is wrong when p < 0.6 (p = 0.5, 0.4) and right when p >= 0.6 (p = 0.7). 'Survives 2nd' is the error rate with H5 applied to every adopted decision (upper bound: in practice only contested ones are re-read).

## B. Waiting time until K members are new; learning cost (first 1 month)

| Body | Rule | K | Mean wait (months) | 95th pct wait | Mean share in first month | Mean of per-run peak share |
|---|---|---|---|---|---|---|
| 15 | fixed 6 months (current) | 8 | 3.02 | 5.67 | 16.9% | 99.1% |
| 15 | H6 3-6 months | 8 | 2.24 | 3.15 | 22.3% | 43.9% |
| 15 | H6 3-6 months | 12 | 3.45 | 4.38 | 22.2% | 43.9% |
| 101 | staggered 12 months (current) | 51 | 6.01 | 7.02 | 8.3% | 13.6% |
| 101 | H6 Set A 2-4 months | 51 | 1.50 | 1.74 | 33.3% | 42.5% |
| 101 | H6 Set B 4-8 months | 51 | 3.00 | 3.49 | 16.7% | 24.1% |

Under fixed six-month mandates the whole council changes at once, so the 'same council with 8 new' is the next council (15 new). Peak share = worst sampled month per run.

## C. Smallest node keeping >= 95% of months with a full 15-seat council (monthly MC)

| Refusal r | Fixed 6 months (current) | H6 3-6 months (whole months) |
|---|---|---|
| 0.0 | 45 | 50 |
| 0.3 | 60 | 60 |
| 0.6 | 70 | 60 |
| 0.8 | 120 | 80 |

## D. RED-2: faction holding 9 of 15 over time (large pool)

| f | r | q (seat prob.) | Rule | Share of time >= 9 seats | Mean spell (months) | P(still >= 9 at second reading given >= 9 at decision) | Decisions sampled |
|---|---|---|---|---|---|---|---|
| 0.10 | 0.9 | 0.53 | fixed 6 months | 37.5% | 9.18 | 0.37 | 1954 |
| 0.10 | 0.9 | 0.53 | H6 3-6 months, K=8 | 38.2% | 2.64 | 0.57 | 1851 |
| 0.10 | 0.9 | 0.53 | H6 3-6 months, K=12 | 38.2% | 2.63 | 0.46 | 1915 |
| 0.05 | 0.94 | 0.47 | fixed 6 months | 22.1% | 7.63 | 0.22 | 1077 |
| 0.05 | 0.94 | 0.47 | H6 3-6 months, K=8 | 23.1% | 2.06 | 0.47 | 1195 |
| 0.05 | 0.94 | 0.47 | H6 3-6 months, K=12 | 22.1% | 2.00 | 0.31 | 1059 |
| 0.20 | 0.6 | 0.38 | fixed 6 months | 7.4% | 6.35 | 0.06 | 384 |
| 0.20 | 0.6 | 0.38 | H6 3-6 months, K=8 | 7.5% | 1.44 | 0.27 | 329 |
| 0.20 | 0.6 | 0.38 | H6 3-6 months, K=12 | 7.8% | 1.44 | 0.14 | 390 |
| 0.20 | 0.8 | 0.56 | fixed 6 months | 47.3% | 10.70 | 0.48 | 2399 |
| 0.20 | 0.8 | 0.56 | H6 3-6 months, K=8 | 46.7% | 3.13 | 0.66 | 2344 |
| 0.20 | 0.8 | 0.56 | H6 3-6 months, K=12 | 47.1% | 3.15 | 0.53 | 2334 |

Under fixed mandates the second reading is held by the next council (all new), so it is independent of the first; under H6, 15 - K of the members are retained.

## Reading

- **RED-1.** On a 15-seat council a measure with only 50% support passes a 60% vote 30% of the time. If every such decision went to a second reading with 8 new members, 16% would survive; with 12 new, 12%; with all 15 new, 9%. The cost is that a measure with 70% support, adopted 87% of the time at first reading, is confirmed 77–78% of the time. Retained members are assumed anchored; if they re-deliberate, results move toward the "15 of 15" row. At 101 seats the first-reading error is already 2.3% and a second reading brings it to 0.1–0.4%.
- **Waiting time.** Under fixed six-month mandates the second reading is the next council: mean wait 3.0 months, 95th percentile 5.7. Under H6 (3–6 months) 8 new members arrive in 2.2 months on average (95th percentile 3.2), 12 new in 3.5 (4.4).
- **Adults needed.** H6 needs about the same pool at low refusal (50 vs 45 adults at r = 0; whole-month draws) and fewer at high refusal (60 vs 70 at r = 0.6; 80 vs 120 at r = 0.8), because seats are refilled one at a time from a pool that is never emptied all at once.
- **Lost experience.** Average share of members in their first month rises from 17% to 22%, but the worst month falls from a wholly new council (99%) to about 44%. At 101 seats Set A (2–4 months) keeps a third of members in their first month on average; Set B (4–8 months) a sixth.
- **RED-2.** Continuous renewal does not change how much of the time a faction holds 9 of 15 (same marginal), but cuts the mean length of a majority spell from 6–11 months to 1.4–3 months. It also makes a faction more likely to still hold 9 seats at the second reading of its own decision (K = 8: 0.27–0.66 against 0.06–0.48 under fixed mandates), because 7 members are retained. K = 12 brings this to 0.14–0.53.
