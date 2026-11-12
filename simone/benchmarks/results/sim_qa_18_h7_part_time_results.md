# SIM-QA-18 (addendum) — H7 Part-Time Service: Results

**Docket:** `SIM-QA-18` ([`oasis/sim_resolutions_qa.md`](../../../oasis/sim_resolutions_qa.md))
**Script:** [`simone/benchmarks/sim_qa_18_h7_part_time.py`](../sim_qa_18_h7_part_time.py) (Python 3 standard library only; Part 3 reuses [`sim_qa_18_summons_refusal.py`](../sim_qa_18_summons_refusal.py))
**Author persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later
**Status:** `SIMULATION_HYPOTHESIS`. This is not a canonical change to the constitution.

> [!WARNING]
> **Synthetic and uncalibrated.** Learning times, the acceptance curve (its maximum, its shape and both anchor points), the refusal reductions under H7 (×0.75, ×0.50) and the lower carer multiplier (1.5) are assumptions. No data on refusal under a part-time, duty-based summons exists. Parts 2 and 3 show what H7 would do *if* it lowers refusal by the stated amounts; they do not show that it does.

## Reproduce

```bash
python3 simone/benchmarks/sim_qa_18_h7_part_time.py --reps 200 --seed 20261112
```

About one minute; deterministic for a given `--seed` and `--reps`.

## Output

SIM-QA-18 H7 part-time service — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)
reps=200 seed=20261112; week 40 h; A_MAX=0.8

## Part 1. Service load per tier

Learning time (service hours before a member is up to speed, ASSUMED): 15 seats 12 h, 101 seats 40 h, 301 seats 80 h, 1001 seats 160 h; returners need 25% of it (orientation only at first mandate).

| Set | Seats | h/week | Mandate (months) | Hours per member per mandate | Share before up to speed: first / returning | People needed per year | Standing pool | Burden (FTE-months) |
|---|---|---|---|---|---|---|---|---|
| B0 | 15 | 40 | 6 | 1040 | 1% / 0% | 30 | 45 | 6.0 |
| B0 | 101 | 40 | 12 | 2080 | 2% / 0% | 101 | 303 | 12.0 |
| B0 | 301 | 40 | 18 | 3120 | 3% / 1% | 201 | 903 | 18.0 |
| B0 | 1,001 | 40 | 24 | 4160 | 4% / 1% | 500 | 3,003 | 24.0 |
| A | 15 | 4 | 3-6 | 78 | 15% / 4% | 40 | 45 | 0.5 |
| A | 101 | 8 | 2-4 | 104 | 38% / 10% | 404 | 303 | 0.6 |
| A | 301 | 20 | 4-8 | 520 | 15% / 4% | 602 | 903 | 3.0 |
| A | 1,001 | 40 | 6-12 | 1560 | 10% / 3% | 1335 | 3,003 | 9.0 |
| B | 15 | 4 | 3-6 | 78 | 15% / 4% | 40 | 45 | 0.5 |
| B | 101 | 8 | 4-8 | 208 | 19% / 5% | 202 | 303 | 1.2 |
| B | 301 | 20 | 4-8 | 520 | 15% / 4% | 602 | 903 | 3.0 |
| B | 1,001 | 20 | 6-12 | 780 | 21% / 5% | 1335 | 3,003 | 4.5 |
| C | 15 | 4 | 3-6 | 78 | 15% / 4% | 40 | 45 | 0.5 |
| C | 101 | 8 | 4-8 | 208 | 19% / 5% | 202 | 303 | 1.2 |
| C | 301 | 20 | 4-8 | 520 | 15% / 4% | 602 | 903 | 3.0 |
| C | 1,001 | 20 | 9-15 | 1040 | 15% / 4% | 1001 | 3,003 | 6.0 |

## Part 2. Refusal under an ASSUMED acceptance curve (acceptance = 0.8 x exp(-burden / tau))

* steep: tau = 9.3 FTE-months (current 1,001 tier refusal = 94%)
* shallow: tau = 17.3 FTE-months (current 1,001 tier refusal = 80%)

| Set | Seats | Burden | Refusal (steep) | Refusal (shallow) | RED-2: 5% faction seat share (steep / shallow) |
|---|---|---|---|---|---|
| B0 | 15 | 6.0 | 58% | 43% | 11% / 9% |
| B0 | 101 | 12.0 | 78% | 60% | 19% / 12% |
| B0 | 301 | 18.0 | 89% | 72% | 31% / 16% |
| B0 | 1,001 | 24.0 | 94% | 80% | 47% / 21% |
| A | 15 | 0.5 | 24% | 22% | 6% / 6% |
| A | 101 | 0.6 | 25% | 23% | 7% / 6% |
| A | 301 | 3.0 | 42% | 33% | 8% / 7% |
| A | 1,001 | 9.0 | 70% | 52% | 15% / 10% |
| B | 15 | 0.5 | 24% | 22% | 6% / 6% |
| B | 101 | 1.2 | 30% | 25% | 7% / 7% |
| B | 301 | 3.0 | 42% | 33% | 8% / 7% |
| B | 1,001 | 4.5 | 51% | 38% | 10% / 8% |
| C | 15 | 0.5 | 24% | 22% | 6% / 6% |
| C | 101 | 1.2 | 30% | 25% | 7% / 7% |
| C | 301 | 3.0 | 42% | 33% | 8% / 7% |
| C | 1,001 | 6.0 | 58% | 43% | 11% / 9% |

## Part 3. SIM-QA-18 model re-run with refusal lowered under H7 (ASSUMED reduction)

CORRELATED refusal (age x care load). H7 rows: refusal multiplied by the stated factor and carer multiplier 2.5 -> 1.5 unless marked 'kept'. Both changes are assumptions, not findings.

| Node | Baseline r | Variant | Effective r | Council empty-seat terms | Carer gap B0 | Carer gap ALL (H1-H3) |
|---|---|---|---|---|---|---|
| 150 | 0.6 | current service | 0.60 | 0.00 | -18pp | -2pp |
| 150 | 0.6 | H7, refusal x0.75, carer mult kept | 0.45 | 0.00 | -13pp | -2pp |
| 150 | 0.6 | H7, refusal x0.75 | 0.45 | 0.00 | -5pp | -1pp |
| 150 | 0.6 | H7, refusal x0.50 | 0.30 | 0.00 | -2pp | -0pp |
| 150 | 0.9 | current service | 0.90 | 0.00 | -18pp | -2pp |
| 150 | 0.9 | H7, refusal x0.75, carer mult kept | 0.68 | 0.00 | -19pp | -2pp |
| 150 | 0.9 | H7, refusal x0.75 | 0.68 | 0.00 | -12pp | -2pp |
| 150 | 0.9 | H7, refusal x0.50 | 0.45 | 0.00 | -5pp | -1pp |
| 150 | 0.94 | current service | 0.94 | 0.03 | -18pp | -2pp |
| 150 | 0.94 | H7, refusal x0.75, carer mult kept | 0.70 | 0.00 | -19pp | -3pp |
| 150 | 0.94 | H7, refusal x0.75 | 0.70 | 0.00 | -13pp | -2pp |
| 150 | 0.94 | H7, refusal x0.50 | 0.47 | 0.00 | -5pp | -1pp |
| 500 | 0.6 | current service | 0.60 | 0.00 | -19pp | -2pp |
| 500 | 0.6 | H7, refusal x0.75, carer mult kept | 0.45 | 0.00 | -14pp | -1pp |
| 500 | 0.6 | H7, refusal x0.75 | 0.45 | 0.00 | -6pp | -1pp |
| 500 | 0.6 | H7, refusal x0.50 | 0.30 | 0.00 | -3pp | -0pp |
| 500 | 0.9 | current service | 0.90 | 0.00 | -19pp | -2pp |
| 500 | 0.9 | H7, refusal x0.75, carer mult kept | 0.68 | 0.00 | -19pp | -3pp |
| 500 | 0.9 | H7, refusal x0.75 | 0.68 | 0.00 | -13pp | -2pp |
| 500 | 0.9 | H7, refusal x0.50 | 0.45 | 0.00 | -6pp | -1pp |
| 500 | 0.94 | current service | 0.94 | 0.00 | -19pp | -2pp |
| 500 | 0.94 | H7, refusal x0.75, carer mult kept | 0.70 | 0.00 | -19pp | -2pp |
| 500 | 0.94 | H7, refusal x0.75 | 0.70 | 0.00 | -14pp | -2pp |
| 500 | 0.94 | H7, refusal x0.50 | 0.47 | 0.00 | -6pp | -0pp |

### RED-2 (analytic): seat share of an always-accepting faction

| Faction f | r=0.94 | x0.75 (0.705) | x0.50 (0.47) | r=0.6 | x0.75 (0.45) | x0.50 (0.30) |
|---|---|---|---|---|---|---|
| 0.02 | 25% | 6% | 4% | 5% | 4% | 3% |
| 0.05 | 47% | 15% | 9% | 12% | 9% | 7% |
| 0.10 | 65% | 27% | 17% | 22% | 17% | 14% |
| 0.20 | 81% | 46% | 32% | 38% | 31% | 26% |

## Reading

- **Hours and learning.** Set A gives a 101-seat member 104 service hours per mandate, of which 38% go to getting up to speed (assumed 40 h); Set B doubles the mandate and halves that share (19%) and the number of people needed per year (202 instead of 404). At 1,001 seats Set A keeps full-time service (1,560 h, 10% learning); Set B halves the load (780 h, 21% learning). Set C (1,001: 50%, 9–15 months) sits between them: 1,040 h, 15% learning, 1,001 people a year.
- **Refusal at the 1,001 tier (assumed curve).** Burden falls from 24 full-time-equivalent months today to 9 (A), 4.5 (B) and 6 (C). With the steep curve (94% refusal today) refusal becomes 70% / 51% / 58%; with the shallow curve (80% today) 52% / 38% / 43%. A 5% always-accepting faction would hold 15% / 10% / 11% of seats (steep) instead of 47%.
- **RED-1 re-run.** Lowering overall refusal alone barely moves the carer gap at high refusal (−18/−19 pp → −13 to −19 pp with the carer multiplier kept). The gap closes (−2 to −6 pp) only if part-time service also lowers carers' *extra* refusal (multiplier 2.5 → 1.5). H1–H3 keep it at −0 to −3 pp in every variant.
- **RED-2 re-run.** If H7 cuts a 94% refusal by a quarter, a 5% faction falls from 47% to 15% of seats; by half, to 9%. This is the only lever found against RED-2, and its size is the assumption.
