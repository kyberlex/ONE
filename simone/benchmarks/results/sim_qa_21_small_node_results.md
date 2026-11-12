# SIM-QA-21 — Governance of Nodes Below the Council Threshold: Results

**Docket:** `SIM-QA-21` ([`oasis/sim_resolutions_qa.md`](../../../oasis/sim_resolutions_qa.md))
**Script:** [`simone/benchmarks/sim_qa_21_small_node.py`](../sim_qa_21_small_node.py) (Python 3 standard library only)
**Author persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later
**Status:** `SIMULATION_HYPOTHESIS`. This is not a canonical change to the constitution.

> [!WARNING]
> **Synthetic and uncalibrated.** Hour budgets per seat and per assembly, turnout, quorum, household sizes, dispute rate, travel overhead, the centre pool of 2,000 and every refusal rate are assumptions. No field data on small-node governance was used. The numbers show how the three regimes behave relative to each other, not how a real settlement will behave.

## Reproduce

```bash
python3 simone/benchmarks/sim_qa_21_small_node.py --reps 2000 --seed 20261112
```

About one minute; deterministic for a given `--seed` and `--reps`.

## Model Summary

- **B0, current text:** under 50 adults a drawn panel of 3 holds municipal administration (three-month mandate, six-month hiatus, no two members from the same household); from 50 adults a 15-seat council (six-month mandate, twelve-month hiatus, Art. 4.3.3) plus a mediation panel of 3.
- **H1, attachment:** below threshold T the node has no body; its adults enter the 15-seat council draw of the nearest larger centre (pool of 2,000 adults including the node).
- **H2, two levels:** below T, internal matters go to an assembly of all adults; other matters to the centre council; disputes to a panel of 3 drawn outside the node.
- At or above T, H1 and H2 use the B0 council. T tested at 50, 100 and 150.
- Seat filling uses the same mechanics as SIM-QA-18 but **without strata**: uniform refusal, refusers replaced from the eligible pool until it runs out. Without quota constraints failure starts a little later than in SIM-QA-18 (1% instead of 7% at 50 adults and r = 0.1); SIM-QA-18 remains the reference for the 50-adult figure.
- Hours: council seat 40 h/week (full release, Art. 4.3.2); B0 administrative panel seat 20 h/week; mediation-only panel seat 4 h/week; assembly 1.5 h/week per attending adult at 60% turnout; centre service +25% for travel; disputes 0.04 per adult-year, 30 panel-hours each.

## Output

SIM-QA-21 small-node governance — SYNTHETIC, UNCALIBRATED MODEL OUTPUT (not empirical)
reps=2000 seed=20261112 horizon=40 quarters; pool=2000; hours: council 40.0, admin panel 20.0, mediation panel 4.0, assembly 1.5 x turnout 0.6; travel x1.25; quorum 0.33

### (a) Seat-fill failure, current text (B0): share of terms with an empty seat

| Node | Body | r=0.0 | r=0.1 | r=0.2 | r=0.3 | r=0.5 | r=0.7 | r=0.8 | r=0.9 |
|---|---|---|---|---|---|---|---|---|---|
| 30 | admin panel of 3 (kin rule) | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.016 | 0.131 | 0.551 |
| 50 | council of 15 | 0.000 | 0.010 | 0.145 | 0.362 | 0.682 | 0.933 | 0.994 | 1.000 |
| 50 | mediation panel of 3 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.013 | 0.211 |
| 100 | council of 15 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.038 | 0.469 | 0.977 |
| 100 | mediation panel of 3 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.006 |
| 150 | council of 15 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.703 |
| 150 | mediation panel of 3 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| 2000 (centre) | council of 15 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |

Council of 15 if it were triggered in smaller nodes (for the threshold test):

| Node | r=0.0 | r=0.1 | r=0.2 | r=0.3 | r=0.5 | r=0.7 | r=0.8 | r=0.9 |
|---|---|---|---|---|---|---|---|---|
| 30 | 0.300 | 0.850 | 0.910 | 0.932 | 0.969 | 0.999 | 1.000 | 1.000 |
| 50 | 0.000 | 0.010 | 0.145 | 0.362 | 0.682 | 0.933 | 0.994 | 1.000 |
| 100 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.038 | 0.469 | 0.977 |
| 150 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.703 |

### (a') Threshold test: worst council fill failure among nodes at or above T

Below T, H1 and H2 draw no seat inside the node (H1: centre council only; H2: centre council and an outside dispute panel), so their node-level fill failure is the centre's value in table (a).

| T | r=0.0 | r=0.1 | r=0.2 | r=0.3 | r=0.5 | r=0.7 | r=0.8 | r=0.9 |
|---|---|---|---|---|---|---|---|---|
| 50 | 0.000 | 0.010 | 0.145 | 0.362 | 0.682 | 0.933 | 0.994 | 1.000 |
| 100 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.038 | 0.469 | 0.977 |
| 150 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.011 | 0.703 |

### (b) Governance hours per node adult per week; share of node adults fully off the work roster

| Node | B0 (T=50) | H1 T=50 | H2 T=50 | H1 T=100 | H2 T=100 | H1 T=150 | H2 T=150 |
|---|---|---|---|---|---|---|---|
| 30 | 2.00 h; 0.0% | 0.38 h; 0.8% | 1.31 h; 0.8% | 0.38 h; 0.8% | 1.31 h; 0.8% | 0.38 h; 0.8% | 1.31 h; 0.8% |
| 50 | 12.24 h; 30.0% | 12.24 h; 30.0% | 12.24 h; 30.0% | 0.38 h; 0.8% | 1.31 h; 0.8% | 0.38 h; 0.8% | 1.31 h; 0.8% |
| 100 | 6.12 h; 15.0% | 6.12 h; 15.0% | 6.12 h; 15.0% | 6.12 h; 15.0% | 6.12 h; 15.0% | 0.38 h; 0.8% | 1.31 h; 0.8% |
| 150 | 4.08 h; 10.0% | 4.08 h; 10.0% | 4.08 h; 10.0% | 4.08 h; 10.0% | 4.08 h; 10.0% | 4.08 h; 10.0% | 4.08 h; 10.0% |

### (c) Node share of the centre council (15 seats, pool 2000 incl. node)

| Node | Expected seats | P(no seat), exact | Binomial check (1-n/pool)^15 |
|---|---|---|---|
| 30 | 0.23 | 0.797 | 0.797 |
| 50 | 0.38 | 0.683 | 0.684 |
| 100 | 0.75 | 0.462 | 0.463 |
| 150 | 1.12 | 0.309 | 0.311 |

Under H1 every matter of a node below T is decided by this council; under H2 only matters that are not internal to the node.

### (d1) Assembly quorum failure, quorum 33% of all adults (H2a)

| Node | turnout 30% | turnout 40% | turnout 50% | turnout 60% |
|---|---|---|---|---|
| 30 | 0.589 | 0.176 | 0.021 | 0.001 |
| 50 | 0.684 | 0.156 | 0.008 | 0.000 |
| 100 | 0.779 | 0.091 | 0.000 | 0.000 |
| 150 | 0.790 | 0.039 | 0.000 | 0.000 |

### (d2) RED-4: bloc (dominant family and allies) of share f, always attending; others attend at rate t. Bloc share of votes cast in the assembly vs. P(bloc holds >= 2 of 3 panel seats) under B0 when the bloc spans several households

| f | t=0.4 | t=0.6 | t=0.8 | B0 panel P(>=2 of 3) |
|---|---|---|---|---|
| 10% | 22% | 16% | 12% | 3% |
| 20% | 38% | 29% | 24% | 10% |
| 30% | 52% | 42% | 35% | 22% |
| 40% | 62% | 53% | 45% | 35% |

Reading: a bloc vote share >= 25% blocks every 75% matter; > 50% carries every simple-majority matter; >= 60% carries every 60% matter.

## Reading

- **Fill failure (threshold test).** A 15-seat council fails in 1% of terms at 50 adults and r = 0.1, 15% at r = 0.2, 36% at r = 0.3. At 100 adults it holds to r = 0.5 and reaches 4% at 0.7 and 47% at 0.8. At 150 adults it holds to 0.8 (1%) and fails at 0.9 (70%). At 30 adults it fails even with no refusal (30%), since 45 distinct people are needed every 18 months. Under H1 and H2 no seat is drawn inside a node below T, so node-level fill failure is zero by construction; the centre's council (2,000 adults) never failed in the sweep.
- **Hours.** At 50 adults the current text puts 30% of adults on full release and costs 12.2 governance hours per adult per week. Below the threshold H1 costs about 0.4 h and H2 about 1.3 h per adult per week, with about 0.8% of adults off the roster (centre seats).
- **Voice in the centre.** A node holds no seat on a 15-seat council drawn from 2,000 adults with probability 0.80 / 0.68 / 0.46 / 0.31 at 30 / 50 / 100 / 150 adults. Under H1 this applies to every matter of the node, under H2 only to matters that are not internal.
- **Assembly risks (H2a).** With a quorum of one third of adults, quorum fails often at 30% turnout (59–79%) and rarely from 50% (≤ 2%). A bloc that always attends gains weight as others stay home: a 20% bloc holds 29% of votes cast at 60% turnout (enough to block every 75% matter); a 30% bloc holds 42–52%.
