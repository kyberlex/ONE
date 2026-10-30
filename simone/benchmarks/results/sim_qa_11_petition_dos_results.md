# SIM-QA-11 — Demarchic Sortition Jury DoS / Petition Flooding: Results

**Docket:** `SIM-QA-11` (`oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md`)
**Script:** [`simone/benchmarks/sim_qa_11_petition_dos.py`](../sim_qa_11_petition_dos.py) (Python 3 standard library only)
**Author persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later
**Status:** `SIMULATION_HYPOTHESIS`. This is not a canonical change to the constitution.

> [!WARNING]
> **These numbers are synthetic model output, not empirical findings.** Every rate, hour figure and threshold is an assumption picked for a stylised stress test. The numbers show **relative** behaviour between intake regimes. They do not predict how a real assembly will perform.

## Reproduce

```bash
python3 simone/benchmarks/sim_qa_11_petition_dos.py --reps 400 --seed 20261030
```

Runtime is about 8 s. The output is deterministic for a given `--seed` and `--reps`.

## Model Summary

- One Neighborhood Sortition Council (15 jurors) serves N = 300 adults over 52 weeks.
- Good-faith petitions arrive at Poisson(2.0) per week:
  - 80% can gather co-signers;
  - 15% of those reach broad support (at least 10% of adults).
- Council capacity is 3 fully deliberated dockets per week, at 4 juror-hours each.
- Screening a raw petition costs 0.5 juror-hours. A digest line costs 0.05 h. Triage costs 0.25 h per panel member per entering petition.
- Burnout threshold: more than 15 h of governance per juror per week. This is an assumption and mirrors the 15 h/week maintenance baseline.
- Attacker faction share f ∈ {0, 5%, 10%, 20%}:
  - attack rate is 1 petition per member per week, plus a one-off burst of 50 at week 0;
  - the faction's endorsement pool is shared by all its members, which favours the attacker;
  - ZK-PoP is **assumed to hold**, so there are no Sybil identities.
- Scenarios:
  - **S0:** current text. There is no intake rule and the queue is first-in, first-out (FIFO). Delegates set the agenda (Art. 4.3.4), so every juror screens every raw petition.
  - **S1:** equal endorsement allowance only. Each person gets 9 tokens per quarter, and k endorsements cost k² tokens, so each person has 3 endorsements per quarter. A petition needs at least 6 co-signers (2% of adults). The queue stays FIFO.
  - **S2:** lottery cap only. Uniform lottery, 3-citizen triage panel, digest for jurors. There is no allowance and no co-signer threshold.
  - **S3\*:** full defense, which is S1 + S2 plus two extras:
    - a lottery weighted by divisible support;
    - a fast lane for petitions endorsed by at least 10% of adults.

    The reported row is the worst case for good-faith petitioners across the attacker's pure strategies.

## Main Results (400 reps, seed 20261030)

`org_heard%` and `org<=8wk%` use **all** good-faith petitions submitted as the denominator. Under S1 and S3, the roughly 20% of petitions that never gather co-signers stay on the public register but never reach the agenda. So the ceiling for those scenarios is about 79.9%.

| scen | f | org_heard% | org<=8wk% | wait_med_wk | wait_p95_wk | atk_slot% | juror_load_mean_h | juror_load_peak_h | burnout_wks/52 | triage_h/wk/member | org_backlog_end | org_expired |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S0 | 0.00 | 99.7 | 99.7 | 0 | 1 | 0.0 | 8.9 | 14.8 | 0.2 | 0.00 | 0.4 | 0.0 |
| S1 | 0.00 | 79.9 | 79.9 | 0 | 1 | 0.0 | 7.2 | 14.5 | 0.1 | 0.00 | 0.1 | 0.0 |
| S2 | 0.00 | 99.7 | 99.7 | 0 | 1 | 0.0 | 8.1 | 12.3 | 0.0 | 0.50 | 0.3 | 0.0 |
| S3* | 0.00 | 79.9 | 79.9 | 0 | 1 | 0.0 | 6.4 | 12.3 | 0.0 | 0.40 | 0.2 | 0.0 |
| S0 | 0.05 | 12.9 | 2.0 | 30 | 44 | 91.4 | 21.0 | 45.5 | 52.0 | 0.00 | 90.3 | 0.0 |
| S1 | 0.05 | 79.9 | 79.9 | 0 | 2 | 22.6 | 9.2 | 16.5 | 3.4 | 0.00 | 0.1 | 0.0 |
| S2 | 0.05 | 16.3 | 12.3 | 5 | 12 | 89.2 | 12.9 | 15.4 | 1.0 | 4.49 | 23.3 | 63.6 |
| S3* | 0.05 | 79.9 | 79.9 | 0 | 2 | 22.6 | 8.3 | 12.4 | 0.0 | 0.51 | 0.1 | 0.0 |
| S0 | 0.10 | 7.7 | 2.0 | 34 | 46 | 94.9 | 28.5 | 53.0 | 52.0 | 0.00 | 95.7 | 0.0 |
| S1 | 0.10 | 79.7 | 79.7 | 1 | 4 | 36.9 | 11.3 | 19.5 | 4.1 | 0.00 | 0.3 | 0.0 |
| S2 | 0.10 | 8.8 | 6.6 | 5 | 12 | 94.1 | 13.6 | 16.1 | 1.0 | 8.24 | 24.5 | 70.2 |
| S3* | 0.10 | 79.7 | 79.6 | 0 | 3 | 36.7 | 10.2 | 12.7 | 0.0 | 0.63 | 0.3 | 0.0 |
| S0 | 0.20 | 3.8 | 2.0 | 1 | 37 | 97.5 | 43.5 | 68.0 | 52.0 | 0.00 | 99.7 | 0.0 |
| S1 | 0.20 | 62.3 | 42.3 | 7 | 13 | 58.6 | 13.7 | 26.0 | 4.1 | 0.00 | 18.4 | 0.0 |
| S2 | 0.20 | 4.8 | 3.6 | 5 | 12 | 96.8 | 15.1 | 17.6 | 45.0 | 15.74 | 25.2 | 73.4 |
| S3* | 0.20 | 75.4 | 72.8 | 1 | 8 | 49.9 | 12.2 | 13.4 | 0.0 | 0.88 | 3.2 | 1.4 |

**Analytic ceiling on faction petitions under the allowance** (council capacity = 39 per quarter):

| f | normal lane | fast lane |
|---|---|---|
| 5% | ≤ 6 | 0 |
| 10% | ≤ 12 | 0 |
| 20% | ≤ 25 | ≤ 5 |

**Tier-0 plebiscite-forcing exposure.** Under Art. 4.2.1, a 75% majority of 3 means unanimity. The probability that at least one faction member is seated on a 3-person panel is 1 − (1 − f)³:

| f | probability |
|---|---|
| 5% | 0.143 |
| 10% | 0.271 |
| 20% | 0.488 |

## Sensitivity (200 reps): Tighter Capacity or Higher Demand

| capacity/wk | organic/wk | f | S0 org<=8wk% | S1 org<=8wk% | S3* org<=8wk% | S3* atk_slot% | S3* burnout_wks |
|---|---|---|---|---|---|---|---|
| 2 | 2.0 | 0 | 91.3 | — | 78.2 | 0 | 0 |
| 2 | 2.0 | 0.10 | 1.8 | 35.9 | 65.0 | 29.8 | 0 |
| 2 | 2.0 | 0.20 | 1.8 | 3.5 | 52.5 | 40.3 | 0 |
| 2 | 2.5 | 0 | 58.8 | — | 71.7 | 0 | 0 |
| 2 | 2.5 | 0.10 | 1.9 | 21.4 | 56.0 | 22.6 | 0 |
| 2 | 2.5 | 0.20 | 1.9 | 1.7 | 46.6 | 33.3 | 0 |
| 3 | 2.5 | 0.10 | 1.9 | 76.3 | 77.7 | 30.6 | 0 |
| 3 | 2.5 | 0.20 | 1.9 | 26.3 | 66.2 | 40.9 | 0 |

## Interpretation

1. **Current text (S0) is fully saturated even by a 5% faction.**
   - Good-faith petitions heard within 8 weeks fall from 99.7% to 2.0%.
   - Jurors exceed the burnout threshold in all 52 weeks.
   - Mean juror load is 21–44 h/week, driven by screening every raw petition.
   - The stated cooldowns and VRF draws limit who sits on the council and how long. They do nothing about the workload per session.
2. **A lottery cap alone (S2) bounds juror hours but hands the agenda to the flood.**
   - The faction holds 89–97% of slots, and 64–73 good-faith petitions expire per year.
   - At f = 20%, burnout returns in 45 of 52 weeks.
3. **An allowance alone (S1) mostly protects small nodes.** At f = 20%, FIFO ordering still lets the faction hold 59% of slots, and peak load reaches 26 h.
4. **The combined defense (S3\*) removes burnout in every tested case** (0 burnout weeks):
   - At f ≤ 10%, the share of good-faith petitions heard within 8 weeks stays within 0.3 percentage points of the attack-free S3 baseline.
   - At f = 20%, it is 72.8% against a baseline of 79.9%.
5. **Residual weakness (honest):** a fully mobilised minority still takes a larger share of slots than its population share, because the good-faith majority uses little of its endorsement allowance.
   - At f = 20%, the faction holds about 33–50% of slots.
   - When capacity is tight (2 per week), the share of good-faith petitions heard within 8 weeks falls to 47–65%.
   - The defense **bounds** the flood. It turns an exhaustion attack into a proportional tax on agenda time, but it does not remove it.

## Limitations

- Every parameter is assumed and none is calibrated: arrival rates, hours, the burnout threshold, the 80%/15% support split and node size.
- No field data on deliberative assemblies has been used.
- Endorsement pools are shared within each group. Treating each person separately would weaken the attacker slightly.
- Good-faith endorsers are assumed to endorse only one petition at a time.
- ZK-PoP is assumed to be sound. If credentials can be lent, rented or forged, the allowance scales with the number of fake identities. That makes the attack a ZK-PoP problem (Art. 7.4.4), and this model does not cover it.
- The model does not cover:
  - the 3-person triage panel's own exposure to capture or burnout (only its hours are tracked);
  - Provocatio appeals;
  - precautionary filibusters;
  - restorative-ladder complaint harassment.
- The attacker plays only pure strategies. Mixed or adaptive strategies (for example, timing petitions around refresh dates) are not explored.
- The model treats a juror-hour as interchangeable. It ignores the qualitative fatigue that may come from hostile or repetitive content.

## Post-merge Status (SIMONE Julia implementation)

Art. 4.3.5 and OL-9 are now implemented as `petition_intake` in `simone/src/layer3_sortition.jl`. It covers the unfiltered register, the quadratic allowance (enforced per person rather than pooled per group), co-signers `max(3, ⌈2%⌉)`, the 10% fast lane, triage limited to form checks and duplicate merging, the lottery weighted by distinct support, and 13-week expiry. Draws are deterministic from a public seed. Tests are in `simone/test/test_petition_intake.jl`. The Python script and the numbers above are unchanged. The Julia module is a per-session intake operator, not a re-run of this 52-week Monte Carlo.
