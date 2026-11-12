# SIM-QA-19 — Statistical Representativeness of the Sortition Tiers: Results

**Docket:** `SIM-QA-19` ([`oasis/sim_resolutions_qa.md`](../../../oasis/sim_resolutions_qa.md))
**Script:** [`simone/benchmarks/sim_qa_19_tier_representativeness.py`](../sim_qa_19_tier_representativeness.py) (Python 3 standard library only)
**Author persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later
**Status:** `SIMULATION_HYPOTHESIS`. This is not a canonical change to the constitution.

> [!WARNING]
> **Parts A and B are exact arithmetic on stated assumptions; Part C rests on invented strata.** The 60% support, the 10% minority, the age/gender/geography shares and the age-opinion correlation are assumptions for a stylised test, not measurements of any real population. The numbers describe what simple and stratified lotteries can and cannot guarantee; they do not predict any real assembly.

## Reproduce

```bash
python3 simone/benchmarks/sim_qa_19_tier_representativeness.py --reps 20000 --seed 20261112
```

Runtime is about 6 s. Parts A, B, C1, C3 and C4 are exact and do not depend on the seed. C2 is Monte Carlo and is deterministic for a given `--seed` and `--reps`.

## Definitions

- Simple majority = floor(n/2)+1 seats; 60% threshold = ceil(0.6 n) seats of all seated members (Art. 4.5.4).
- Q2: the population is 60% in favour, the body has fewer than a simple majority in favour.
- Q3: the population is split 50/50, the body still reaches the 60% threshold.
- Q4: a 10% minority holds no seat.
- The 95% margin of error column of the docket uses the normal approximation 1.96·sqrt(0.25/n). For n = 3 the approximation is meaningless; the exact Clopper-Pearson half-width is shown next to it.

## Output


### Part A: infinite population, simple random draw (exact binomial)

| Seats | 95% MoE normal | 95% CP half-width at 50% | Q2: 60% pop, no simple majority | Q3: 50/50 pop, reaches 60% | Q4: 10% minority, no seat |
|---|---|---|---|---|---|
| 3 | ±57% (0.566) | ±45% | 35% (0.352) | 50% (0.500) | 73% (0.729) |
| 15 | ±25% (0.253) | ±26% | 21% (0.213) | 30% (0.304) | 21% (0.206) |
| 101 | ±10% (0.098) | ±10% | 2% (0.021) | 2% (0.023) | ~0 (2.4e-05) |
| 301 | ±6% (0.056) | ±6% | ~0 (2.3e-04) | ~0 (2.6e-04) | ~0 (1.7e-14) |
| 1001 | ±3% (0.031) | ±3% | ~0 (8.1e-11) | ~0 (1.1e-10) | ~0 (1.6e-46) |

Thresholds used: simple majority = floor(n/2)+1; 60% = ceil(0.6 n) (3 -> 2, 15 -> 9, 101 -> 61, 301 -> 181, 1001 -> 601).

### Part B: finite node, draw without replacement (exact hypergeometric)

Body sizes drawn from each node: 3 and 15, plus 101 where the node is large enough.
Shares are rounded to whole persons (e.g. 60% of 50 = 30 in favour).

| Node adults | Seats | 95% MoE with FPC | Q2: 60% pop, no simple majority | Q3: 50/50 pop, reaches 60% | Q4: 10% minority, no seat |
|---|---|---|---|---|---|
| 50 | 3 | ±55% | 35% (0.349) | 50% (0.500) | 72% (0.724) |
| 50 | 15 | ±21% | 17% (0.172) | 27% (0.269) | 15% (0.153) |
| 150 | 3 | ±56% | 35% (0.351) | 50% (0.500) | 73% (0.727) |
| 150 | 15 | ±24% | 20% (0.201) | 29% (0.294) | 19% (0.189) |
| 150 | 101 | ±6% | ~0 (1.1e-04) | ~0 (2.2e-04) | ~0 (9.7e-09) |
| 500 | 3 | ±56% | 35% (0.352) | 50% (0.500) | 73% (0.729) |
| 500 | 15 | ±25% | 21% (0.210) | 30% (0.301) | 20% (0.201) |
| 500 | 101 | ±9% | 1% (0.011) | 1% (0.013) | ~0 (6.4e-06) |

### Part C: stratified variants (synthetic strata, uncalibrated)

Assumed strata: age 18-34 30%, 35-64 45%, 65+ 25%; gender 50/50; geography three equal zones.
Assumed support for the measure by age band: 18-34 45%, 35-64 60%, 65+ 78% (mean 60%).

Full cross-stratification needs 18 cells. A body of 3 or 15 cannot fill them: at 15 seats at least 3 cells are empty, so only marginal quotas are feasible.

#### C1: exact, proportional age stratification vs simple random draw (Q2: 60% pop, no simple majority)

| Seats | Age seats | Simple random | Age-stratified | Ratio |
|---|---|---|---|---|
| 3 | 1/1/1 | 35% (0.352) | 33% (0.332) | 0.94 |
| 15 | 4/7/4 | 21% (0.213) | 19% (0.187) | 0.88 |
| 101 | 30/46/25 | 2% (0.021) | 2% (0.018) | 0.85 |
| 301 | 90/136/75 | ~0 (2.3e-04) | ~0 (1.4e-04) | 0.64 |
| 1001 | 300/451/250 | ~0 (8.1e-11) | ~0 (1.9e-11) | 0.24 |

#### C2: Monte Carlo quota fill on age x gender x geography marginals (reps=20000, seed=20261112)

| Node adults | Seats | Realised support in node | Q2 simple random (exact) | Q2 quota fill (MC) | Mean seats held by 65+ |
|---|---|---|---|---|---|
| 50 | 3 | 60.0% | 35% (0.349) | 30% (0.300) | 1.00 |
| 50 | 15 | 60.0% | 17% (0.172) | 12% (0.120) | 3.97 |
| 150 | 3 | 60.0% | 35% (0.351) | 32% (0.315) | 1.00 |
| 150 | 15 | 60.0% | 20% (0.201) | 14% (0.144) | 4.00 |
| 150 | 101 | 60.0% | ~0 (1.1e-04) | ~0 (5.0e-05) | 24.83 |
| 500 | 3 | 60.0% | 35% (0.352) | 33% (0.331) | 1.00 |
| 500 | 15 | 60.0% | 21% (0.210) | 18% (0.183) | 4.00 |
| 500 | 101 | 60.0% | 1% (0.011) | 1% (0.008) | 25.00 |

#### C3: 10% minority concentrated in one geography zone (30% of that zone)

| Seats | Zone seats | Q4 simple random | Q4 geography-stratified |
|---|---|---|---|
| 3 | 1 | 73% (0.729) | 70% (0.700) |
| 15 | 5 | 21% (0.206) | 17% (0.168) |
| 101 | 34 | ~0 (2.4e-05) | ~0 (5.4e-06) |

#### C4: Global Commons Assembly, 1,001 seats for 8.1e+09 persons (one seat per 8.1 million)

| Group size | Expected seats | P(no seat), simple random |
|---|---|---|
| 200,000 | 0.025 | 0.976 |
| 1,000,000 | 0.124 | 0.884 |
| 5,000,000 | 0.618 | 0.539 |
| 10,000,000 | 1.236 | 0.290 |
| 50,000,000 | 6.179 | 0.002 |

## Findings

1. **The docket table is reproduced exactly.** Every figure in the SIM-QA-19 table matches Part A to the stated rounding. No correction to the docket table is needed. One clarification is added: the ±57% figure for 3 seats is a normal approximation; the exact interval is ±45%, and either way a body of 3 measures nothing.
2. **A finite node does not rescue small bodies.** Drawing 15 from 50 adults (finite-population correction) lowers Q2 from 21% to 17% and Q3 from 30% to 27%. A 15-seat council remains a jury, not a sample, at every node size tested.
3. **Stratification helps little at 3 and 15 seats.** Even with a strong assumed age-opinion gradient (45% / 60% / 78%), proportional age stratification cuts Q2 by 6% (3 seats) and 12% (15 seats) in relative terms. Quota fill on all three marginals cuts Q2 at 15 seats from 17–21% to 12–18%. The gain grows only at 301 and 1,001 seats, where error is already negligible.
4. **Full cross-stratification is infeasible below 18 seats.** Age (3) × gender (2) × geography (3) gives 18 cells; at 15 seats at least 3 cells are empty, so Art. 4.3.1 can only be met on marginals.
5. **Quotas do not over-seat a concentrated minority.** A 10% minority concentrated in one zone is slightly *better* protected by geographic quotas (Q4 21% → 17% at 15 seats). The RED-3 risk is variance inside small cells, not systematic bias.
6. **Small peoples are usually unseated at 1,001 seats.** A group of one million has 0.12 expected seats and an 88% chance of no seat; a group of five million, 54%. Only groups above about 10 million are likely to hold a seat.

## Not covered

- Non-response (SIM-QA-18): every figure assumes everyone drawn sits.
- SIMONE falsification challenge 2 (faction capture over three rotations) is not run here.
