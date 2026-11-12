# SIM-QA-18 — Refusal of a Sortition Summons: Results

**Docket:** `SIM-QA-18` ([`oasis/sim_resolutions_qa.md`](../../../oasis/sim_resolutions_qa.md))
**Script:** [`simone/benchmarks/sim_qa_18_summons_refusal.py`](../sim_qa_18_summons_refusal.py) (Python 3 standard library only)
**Author persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later
**Status:** `SIMULATION_HYPOTHESIS`. This is not a canonical change to the constitution.

> [!WARNING]
> **Synthetic and uncalibrated.** Carer prevalence, the age and care refusal multipliers, the 30% orientation retention of H1 and the care-support effect of H2 are assumptions. No dataset of refusal under a duty-based summons without sanction exists to calibrate them. The numbers show how the rules act relative to each other, not how a real node will behave.

## Reproduce

```bash
python3 simone/benchmarks/sim_qa_18_summons_refusal.py --reps 200 --seed 20261112
python3 simone/benchmarks/sim_qa_18_summons_refusal.py --extras-only   # RED-2 table + hiatus sensitivity, ~15 s
```

The full run takes about 6 minutes and is deterministic for a given `--seed` and `--reps`.

## Model Summary

- Quarterly steps over 10 years. Node of 50, 150 or 500 adults with age band, gender, geography zone and a care-load flag (about 20% of adults; more frequent among women and ages 35–64).
- Council: 15 seats, six-month mandates, twelve-month hiatus (Art. 4.3.3). Mediation panel: 3 seats, three-month mandates, six-month hiatus. No concurrent service on both bodies.
- Each term a quota draw on the age, gender and geography marginals picks the summoned list; if the pool cannot meet the quotas, remaining seats are filled without them.
- Rules: **B0** free refusal, replacement from the general pool (current text read literally); **H1** orientation then withdrawal (30% of would-be refusers stay); **H2** one deferral, deferred carers re-summoned with care support arranged; **H3** stratum-matched alternates; **ALL** = H1+H2+H3.
- Drift is the total-variation distance (TVD) between seated and population shares; carer gap is seated carer share minus population carer share.
- Run parameters: `reps=200 seed=20261112 horizon=40 quarters; council 15 seats / 2q mandate / 4q hiatus; panel 3 seats / 1q mandate / 2q hiatus; H1 retain=30%; age mult=(1.3, 1.0, 0.8); care mult=2.5`

## Output

### UNIFORM refusal

#### (a) Lowest swept refusal rate at which >= 5% of terms leave a seat empty

| Node | Body | B0 | H1 | H2 | H3 | ALL |
|---|---|---|---|---|---|---|
| 50 | council | 0.10 | 0.20 | 0.10 | 0.10 | 0.20 |
| 50 | panel | 0.90 | > 0.95 | 0.90 | 0.90 | > 0.95 |
| 150 | council | 0.90 | > 0.95 | 0.90 | 0.90 | > 0.95 |
| 150 | panel | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |
| 500 | council | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |
| 500 | panel | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |

#### (a') Share of council terms with an empty seat, by refusal rate (rule B0)

| Node | r=0.0 | r=0.1 | r=0.2 | r=0.3 | r=0.4 | r=0.5 | r=0.6 | r=0.7 | r=0.8 | r=0.9 | r=0.94 | r=0.95 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 50 | 0.00 | 0.07 | 0.28 | 0.47 | 0.61 | 0.73 | 0.86 | 0.95 | 1.00 | 1.00 | 1.00 | 1.00 |
| 150 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.02 | 0.72 | 0.99 | 1.00 |
| 500 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.02 |

#### (b) Council composition drift (mean TVD age / gender / zone; carer share seated minus population, percentage points)

| Node | r | B0 | H1 | H2 | H3 | ALL |
|---|---|---|---|---|---|---|
| 50 | 0.0 | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp |
| 50 | 0.3 | 0.12/0.09/0.12; +0pp | 0.11/0.08/0.11; -0pp | 0.12/0.09/0.12; -0pp | 0.11/0.08/0.11; -0pp | 0.10/0.08/0.11; -0pp |
| 50 | 0.6 | 0.16/0.11/0.16; +0pp | 0.14/0.10/0.14; +0pp | 0.16/0.11/0.16; +0pp | 0.15/0.11/0.16; +0pp | 0.13/0.09/0.14; +0pp |
| 50 | 0.9 | 0.32/0.22/0.32; +0pp | 0.16/0.12/0.16; -0pp | 0.30/0.22/0.31; +0pp | 0.31/0.22/0.31; +0pp | 0.16/0.11/0.17; -0pp |
| 50 | 0.94 | 0.39/0.28/0.40; +0pp | 0.17/0.12/0.17; +0pp | 0.40/0.28/0.40; +0pp | 0.39/0.28/0.40; -0pp | 0.16/0.12/0.17; -0pp |
| 150 | 0.0 | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp |
| 150 | 0.3 | 0.11/0.08/0.10; -0pp | 0.09/0.07/0.08; +0pp | 0.11/0.08/0.10; -0pp | 0.03/0.03/0.01; +0pp | 0.03/0.03/0.00; +0pp |
| 150 | 0.6 | 0.13/0.10/0.13; +0pp | 0.12/0.09/0.12; +0pp | 0.14/0.10/0.13; -0pp | 0.03/0.03/0.06; +0pp | 0.03/0.03/0.04; +0pp |
| 150 | 0.9 | 0.16/0.12/0.16; -0pp | 0.13/0.10/0.13; +0pp | 0.16/0.11/0.16; +0pp | 0.15/0.11/0.16; -0pp | 0.04/0.04/0.10; +0pp |
| 150 | 0.94 | 0.21/0.15/0.21; +0pp | 0.14/0.10/0.13; -0pp | 0.21/0.14/0.21; -0pp | 0.21/0.15/0.21; +0pp | 0.05/0.04/0.11; +0pp |
| 500 | 0.0 | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp |
| 500 | 0.3 | 0.11/0.08/0.10; -0pp | 0.09/0.07/0.09; -0pp | 0.11/0.08/0.10; -0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp |
| 500 | 0.6 | 0.14/0.10/0.13; -0pp | 0.12/0.09/0.12; -0pp | 0.14/0.10/0.13; -0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp |
| 500 | 0.9 | 0.14/0.10/0.14; -0pp | 0.14/0.10/0.14; -0pp | 0.14/0.10/0.14; -0pp | 0.04/0.04/0.08; +0pp | 0.03/0.03/0.00; +0pp |
| 500 | 0.94 | 0.14/0.10/0.14; +0pp | 0.14/0.10/0.14; +0pp | 0.14/0.10/0.14; +0pp | 0.06/0.05/0.12; +0pp | 0.03/0.03/0.00; -0pp |

### CORRELATED (age x care load) refusal

#### (a) Lowest swept refusal rate at which >= 5% of terms leave a seat empty

| Node | Body | B0 | H1 | H2 | H3 | ALL |
|---|---|---|---|---|---|---|
| 50 | council | 0.10 | 0.20 | 0.10 | 0.10 | 0.20 |
| 50 | panel | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |
| 150 | council | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |
| 150 | panel | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |
| 500 | council | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |
| 500 | panel | > 0.95 | > 0.95 | > 0.95 | > 0.95 | > 0.95 |

#### (a') Share of council terms with an empty seat, by refusal rate (rule B0)

| Node | r=0.0 | r=0.1 | r=0.2 | r=0.3 | r=0.4 | r=0.5 | r=0.6 | r=0.7 | r=0.8 | r=0.9 | r=0.94 | r=0.95 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 50 | 0.00 | 0.07 | 0.29 | 0.50 | 0.67 | 0.83 | 0.90 | 0.93 | 0.97 | 0.99 | 0.99 | 1.00 |
| 150 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.03 | 0.03 |
| 500 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

#### (b) Council composition drift (mean TVD age / gender / zone; carer share seated minus population, percentage points)

| Node | r | B0 | H1 | H2 | H3 | ALL |
|---|---|---|---|---|---|---|
| 50 | 0.0 | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp | 0.07/0.05/0.05; -0pp |
| 50 | 0.3 | 0.13/0.09/0.12; -4pp | 0.11/0.08/0.11; -2pp | 0.12/0.09/0.12; -3pp | 0.11/0.08/0.12; -4pp | 0.10/0.07/0.10; -2pp |
| 50 | 0.6 | 0.17/0.12/0.16; -18pp | 0.13/0.10/0.13; -6pp | 0.16/0.11/0.15; -6pp | 0.16/0.11/0.16; -18pp | 0.12/0.09/0.13; -3pp |
| 50 | 0.9 | 0.25/0.15/0.21; -19pp | 0.15/0.11/0.15; -4pp | 0.23/0.14/0.19; -7pp | 0.25/0.14/0.21; -19pp | 0.14/0.10/0.15; -2pp |
| 50 | 0.94 | 0.27/0.16/0.23; -19pp | 0.16/0.11/0.15; -4pp | 0.26/0.14/0.21; -7pp | 0.27/0.16/0.22; -19pp | 0.15/0.10/0.15; -2pp |
| 150 | 0.0 | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp |
| 150 | 0.3 | 0.11/0.08/0.10; -7pp | 0.09/0.07/0.09; -4pp | 0.11/0.08/0.10; -2pp | 0.03/0.03/0.00; -6pp | 0.03/0.03/0.00; -1pp |
| 150 | 0.6 | 0.15/0.10/0.13; -18pp | 0.12/0.09/0.11; -8pp | 0.13/0.09/0.12; -6pp | 0.03/0.03/0.06; -18pp | 0.03/0.03/0.02; -2pp |
| 150 | 0.9 | 0.18/0.10/0.14; -18pp | 0.14/0.09/0.13; -6pp | 0.18/0.10/0.13; -6pp | 0.10/0.06/0.11; -18pp | 0.04/0.03/0.07; -2pp |
| 150 | 0.94 | 0.20/0.10/0.13; -18pp | 0.14/0.09/0.13; -5pp | 0.20/0.10/0.13; -7pp | 0.14/0.07/0.12; -18pp | 0.04/0.04/0.07; -2pp |
| 500 | 0.0 | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp | 0.03/0.03/0.00; +0pp |
| 500 | 0.3 | 0.12/0.08/0.10; -8pp | 0.10/0.07/0.09; -5pp | 0.11/0.08/0.10; -2pp | 0.03/0.03/0.00; -7pp | 0.03/0.03/0.00; -0pp |
| 500 | 0.6 | 0.16/0.10/0.13; -19pp | 0.13/0.09/0.12; -9pp | 0.14/0.10/0.13; -5pp | 0.03/0.03/0.00; -19pp | 0.03/0.03/0.00; -2pp |
| 500 | 0.9 | 0.21/0.11/0.14; -19pp | 0.14/0.10/0.13; -7pp | 0.20/0.10/0.14; -7pp | 0.03/0.03/0.03; -19pp | 0.03/0.03/0.00; -2pp |
| 500 | 0.94 | 0.24/0.11/0.14; -19pp | 0.15/0.10/0.13; -6pp | 0.22/0.10/0.14; -7pp | 0.04/0.04/0.05; -19pp | 0.03/0.03/0.00; -2pp |

Realised mean refusal probability in CORRELATED mode (node 500; individual values capped at 0.99, so the mean falls below the nominal r at the top of the sweep):
  r=0.0: 0.000, r=0.1: 0.100, r=0.2: 0.200, r=0.3: 0.300, r=0.4: 0.400, r=0.5: 0.491, r=0.6: 0.565, r=0.7: 0.630, r=0.8: 0.692, r=0.9: 0.754, r=0.94: 0.778, r=0.95: 0.785

### RED-2 (analytic): expected seat share of an always-accepting faction

| Faction share f | r=0.3 | r=0.6 | r=0.9 | r=0.94 |
|---|---|---|---|---|
| 0.02 | 3% | 5% | 17% | 25% |
| 0.05 | 7% | 12% | 34% | 47% |
| 0.10 | 14% | 22% | 53% | 65% |
| 0.20 | 26% | 38% | 71% | 81% |

### Sensitivity: node of 50, council hiatus = mandate (6 months) instead of 12 months

Share of council terms with an empty seat (UNIFORM refusal).

| Hiatus | Rule | r=0.0 | r=0.1 | r=0.2 | r=0.3 | r=0.4 | r=0.5 | r=0.6 | r=0.7 | r=0.8 | r=0.9 | r=0.94 | r=0.95 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 12 months | B0 | 0.00 | 0.07 | 0.28 | 0.47 | 0.61 | 0.73 | 0.86 | 0.95 | 1.00 | 1.00 | 1.00 | 1.00 |
| 12 months | ALL | 0.00 | 0.03 | 0.15 | 0.30 | 0.42 | 0.53 | 0.64 | 0.73 | 0.82 | 0.89 | 0.91 | 0.92 |
| 6 months | B0 | 0.00 | 0.00 | 0.00 | 0.00 | 0.04 | 0.26 | 0.61 | 0.87 | 0.99 | 1.00 | 1.00 | 1.00 |
| 6 months | ALL | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.01 | 0.07 | 0.22 | 0.47 | 0.70 | 0.77 | 0.80 |

Population carer share (node 500, mean over reps): 19.9%. TVD 0 = seated body matches targets; TVD at r=0 under B0 is the quota-fill floor.

## Findings

1. **50-adult nodes cannot staff a 15-seat council.** The twelve-month hiatus leaves 17–20 eligible people; 7% of terms have an empty seat at 10% refusal and about half at 30%. H1–H3 together barely help. A hiatus equal to the mandate moves the 5% failure point to 50% refusal (B0) or 60% (ALL).
2. **150 adults fill a council until refusal reaches about 80–90%; 500 adults until 95%.** At an invitation-style 94% refusal only the 500-adult node fills.
3. **Correlated refusal erases carers while quotas pass.** From 60% refusal, carers fall from 20% of adults to about 1–2% of seats. H3 restores age, gender and geography but not carers.
4. **H1 + H2 + H3 is the best tested combination**: carer gap about −2 points and composition at the quota floor at 150 and 500 adults. The size of the H1 and H2 effects is assumed.
5. **An always-accepting faction is not stopped by any tested rule** (analytic table): a 5% faction holds 47% of seats at 94% refusal.
6. In correlated mode individual refusal is capped at 0.99, so the realised mean is below the nominal r from r = 0.5 upward (0.785 at r = 0.95); correlated fill-failure points are not comparable with the uniform ones at the top of the sweep.
