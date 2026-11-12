# SIM-QA-11 Re-Run with the Restated Petition Budget (1.5 h per member per week): Results

**Dockets:** SIM-QA-18 X-4 (OL-9.3 restated), cross-docket Y-11 (2026-11-13). **Script:** [`simone/benchmarks/sim_qa_11_petition_dos.py`](../sim_qa_11_petition_dos.py) `--reps 400 --budget-h 1.5` (seed 20261030). **Synthetic, uncalibrated.** Capacity = 1.5 h / 4 h per docket = 0.375 dockets a week, carried as credit. Every other parameter as in the merged run ([results](sim_qa_11_petition_dos_results.md)); without the flag the script reproduces those figures exactly.

```
SIM-QA-11 petition DoS — SYNTHETIC MODEL OUTPUT (not empirical)
N=300 weeks=52 reps=400 seed=20261030 capacity=3/wk (budget 1.5 h: 0.375 dockets/wk) organic=2.0/wk co-signers=6 fast-lane=30 endorsements=3/adult/qtr attack=1.0/member/wk + burst 50 burnout>15.0h/wk
| scen | f | org_heard% | org<=8wk% | wait_med_wk | wait_p95_wk | atk_slot% | juror_load_mean_h | juror_load_peak_h | burnout_wks/52 | triage_h/wk/member | org_backlog_end | org_expired |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S0 | 0.00 | 18.3 | 3.4 | 21 | 40 | 0.0 | 2.5 | 6.4 | 0.0 | 0.00 | 84.7 | 0.0 |
| S1 | 0.00 | 18.3 | 3.6 | 20 | 38 | 0.0 | 2.3 | 6.1 | 0.0 | 0.00 | 63.9 | 0.0 |
| S2 | 0.00 | 18.2 | 14.1 | 5 | 12 | 0.0 | 1.6 | 4.2 | 0.0 | 0.50 | 23.2 | 61.9 |
| S3* | 0.00 | 18.4 | 16.4 | 2 | 10 | 0.0 | 1.5 | 4.2 | 0.0 | 0.40 | 17.0 | 46.7 |
| S0 | 0.05 | 2.0 | 1.7 | 5 | 10 | 89.4 | 10.4 | 33.5 | 1.0 | 0.00 | 101.6 | 0.0 |
| S1 | 0.05 | 12.5 | 1.5 | 30 | 42 | 31.7 | 2.5 | 8.3 | 0.0 | 0.00 | 69.9 | 0.0 |
| S2 | 0.05 | 2.1 | 1.5 | 5 | 12 | 88.7 | 2.4 | 5.0 | 0.0 | 4.49 | 25.7 | 76.5 |
| S3* | 0.05 | 17.3 | 15.5 | 2 | 10 | 6.0 | 1.6 | 4.4 | 0.0 | 0.51 | 17.1 | 47.7 |
| S0 | 0.10 | 2.0 | 1.7 | 5 | 10 | 89.4 | 17.9 | 41.0 | 47.6 | 0.00 | 101.6 | 0.0 |
| S1 | 0.10 | 6.8 | 1.5 | 40 | 47 | 63.2 | 2.7 | 11.3 | 0.0 | 0.00 | 75.9 | 0.0 |
| S2 | 0.10 | 1.1 | 0.8 | 5 | 12 | 94.1 | 3.1 | 5.7 | 0.0 | 8.24 | 26.1 | 77.0 |
| S3* | 0.10 | 16.5 | 14.8 | 2 | 10 | 10.2 | 1.6 | 4.7 | 0.0 | 0.63 | 17.2 | 48.4 |
| S0 | 0.20 | 2.0 | 1.7 | 5 | 10 | 89.4 | 32.9 | 56.0 | 52.0 | 0.00 | 101.6 | 0.0 |
| S1 | 0.20 | 1.6 | 1.5 | 5 | 10 | 91.4 | 3.2 | 17.8 | 3.0 | 0.00 | 81.3 | 0.0 |
| S2 | 0.20 | 0.5 | 0.3 | 6 | 12 | 97.2 | 4.6 | 7.2 | 0.0 | 15.74 | 26.1 | 78.0 |
| S3* | 0.20 | 8.1 | 3.2 | 9 | 12 | 55.8 | 1.6 | 4.4 | 0.0 | 0.49 | 20.2 | 54.3 |
(S3* = worst case over attacker pure strategies: all-normal-lane vs all-fast-lane)

Analytic faction ceiling under allowance (petitions/quarter; council capacity = 4.9/quarter):
  f=0.05: normal lane <= 6, fast lane <= 0
  f=0.10: normal lane <= 12, fast lane <= 0
  f=0.20: normal lane <= 25, fast lane <= 5

Tier-0 (3-person panel) plebiscite-forcing exposure (Art. 4.2.1: 75% of 3 = unanimity): P(>=1 faction member seated) = 1-(1-f)^3
  f=0.05: 0.143
  f=0.10: 0.271
  f=0.20: 0.488
```
