# **SIMONE ADVERSARIAL & SOLVER BENCHMARKS (`simone/benchmarks/`)**

> **Reproducible Red-Team Stress-Tests (`SIM-QA-10` to `SIM-QA-14`) & Multi-Rate Solver Benchmarks.**  
> **Author:** Kyberlex (`kyberlex@proton.me`) | **Pillar Alignment:** Pillars 1, 2, 3, 4A, 4B  
> **License:** AGPL-3.0-or-later

---

## **1. Benchmark Suite Overview**

Every Round 2 Adversarial Critic Docket tracked in [`oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md`](../../oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md) is backed by an executable numerical script in this directory and a quantitative report in [`results/`](results/).

| Docket / Script | Pillar | Adversarial Hypothesis Tested | Execution Command |
| :--- | :--- | :--- | :--- |
| [`benchmark_solvers.jl`](benchmark_solvers.jl) | **Pillar 3** | Multi-rate ODE/ABM solver runtime and Axtell docking convergence ($\epsilon \le 10^{-3}$). | `julia --project=simone simone/benchmarks/benchmark_solvers.jl` |
| [`sim_qa_10_embargo.jl`](sim_qa_10_embargo.jl) | **Pillar 1** | **60% Abiotic Import Embargo:** Hawkins-Simon $(I-A)^{-1}$ positivity & $L_{\min}$ rationing. | `julia --project=simone simone/benchmarks/sim_qa_10_embargo.jl` |
| [`sim_qa_11_petition_dos.py`](sim_qa_11_petition_dos.py) | **Pillar 2** | **Demarchic Jury DoS:** 50 coordinated bad-faith petitions vs. epistemic endorsement filters. | `python3 simone/benchmarks/sim_qa_11_petition_dos.py` |
| [`sim_qa_19_tier_representativeness.py`](sim_qa_19_tier_representativeness.py) | **Pillar 2** | **Tier Representativeness:** exact binomial, finite-node and stratified error of 3 / 15 / 101 / 301 / 1,001-seat bodies. | `python3 simone/benchmarks/sim_qa_19_tier_representativeness.py` |
| [`sim_qa_12_stiff_load_shedding.py`](sim_qa_12_stiff_load_shedding.py) | **Pillar 3** | **Stiff Relay Chattering:** Zero-deadband Zeno oscillation vs. $3\%$ Schmitt-trigger hysteresis. | `python3 simone/benchmarks/sim_qa_12_stiff_load_shedding.py` |
| [`sim_qa_13_vapor_puncture.py`](sim_qa_13_vapor_puncture.py) | **Pillar 4A** | **$-25^\circ\text{C}$ Vapor Retarder Puncture:** ISO 13788 condensation limit & $50\text{ mm}$ service cavity protection. | `python3 simone/benchmarks/sim_qa_13_vapor_puncture.py` |
| [`sim_qa_14_cryo_and_voltage_drop.py`](sim_qa_14_cryo_and_voltage_drop.py) | **Pillar 4B** | **MCU Freeze at $-12^\circ\text{C}$ & $48\text{ V}$ Feeder Loss:** Bimetallic `K1` cutout & $800\text{ V DC}$ vs. $48\text{ V DC}$ copper mass. | `python3 simone/benchmarks/sim_qa_14_cryo_and_voltage_drop.py` |

---

## **2. Results Archive (`simone/benchmarks/results/`)**

* [`results/sim_qa_10_embargo_results.md`](results/sim_qa_10_embargo_results.md)
* [`results/sim_qa_11_petition_dos_results.md`](results/sim_qa_11_petition_dos_results.md)
* [`results/sim_qa_12_13_14_consolidated_results.md`](results/sim_qa_12_13_14_consolidated_results.md)
* [`results/sim_qa_19_tier_representativeness_results.md`](results/sim_qa_19_tier_representativeness_results.md)

