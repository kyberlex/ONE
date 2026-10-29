# **SIMONE Implementation Roadmap & Engineering Taskboard (`TODO.md`)**

**Document Version:** `0.2.0-HIGH-FIDELITY`  
**Target Package:** `Simone.jl` (Scientific Co-Simulation Engine)  
**Lead Technical Co-Steward (Pillar 3):** 🔍 **OPEN POSITION (Priority Search: Lead Julia Systems Modeler)** — See [GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11)  
**Phase 1 Contributor (Docking Proposal):** Rainer Rodrigues ([`@rainerrodrigues`](https://github.com/rainerrodrigues))  
**Architectural Authority:** Kyberlex ([`kyberlex@proton.me`](mailto:kyberlex@proton.me))  
**Governing Invariants:** Class-0 Non-Commercial (AGPL-3.0-or-later), Thermodynamic Mass/Energy Conservation, Pure Julia Implementation.

---

## **I. OVERVIEW & STRATEGIC RATIONALE (THE PATH TO THE FOUNDATION)**

The full formal specification for SIMONE is defined in [`simone/simone-specs.md`](simone-specs.md).

### **The Foundation Mandate (Class-0 Constraint):**
Foundation ONE will **only** be legally chartered under Swiss Civil Law (ZGB Art. 80 ff.) **AFTER** the Living Constitution is simulated in `Simone.jl` at the highest possible level of fidelity across all 4 bio-socio-technical layers, and the results are subjected to a second adversarial stress-test by external domain critics.

### **The Multi-Phase Roadmap:**
1. **Phases 1–3 (Single-Village Docking Baseline):** Follows the **Axtell Docking Discipline (1996)** originally proposed by Rainer Rodrigues ([Discussion #11](https://github.com/kyberlex/ONE/discussions/11)) to verify that aggregate continuous ODEs match discrete micro-agent ABM trajectories in the homogeneous limit.
2. **Phases 4–6 (Thermodynamic & Peer Substrate Integration):** Leontief physical conservation audits, ODD documentation, and REA event stream ingestion.
3. **Phases 7–8 (High-Fidelity 4-Layer Architecture & Genesis Lock):** Multi-layer scaling integrating **Pillar 1 (Biophysical Economics)** and **Pillar 2 (Governance & Sortition)** for final constitutional hardening prior to the Genesis Lock.

```
┌─────────────────────────────────────────────────────────┐
│               THE AXTELL DOCKING DISCIPLINE             │
│                                                         │
│  [Model A: Aggregate ODE Stock-Flow]                    │
│    Stocks: Energy (kWh), Water (L), Calories (kcal)     │
│                         │                               │
│                         ▼                               │
│               Docking Benchmark (1996)                  │
│       Does ABM match ODE in homogeneous limit?          │
│                         ▲                               │
│                         │                               │
│  [Model B: Agents.jl + DiffEq Micro-Agents]             │
│    Homogeneous agents -> Heterogeneous agents           │
└─────────────────────────────────────────────────────────┘
```

---

## **II. PHASE 0: PACKAGE SCAFFOLDING & ENVIRONMENT INITIALIZATION**

- [x] **Task 0.1: Standard Julia Package Layout (Docking-First Architecture)**
  - Initialize `Project.toml` with uuid `b2b61d84-dce6-43b0-95cf-c312a3dc4fc9`, authors Kyberlex & Rainer Rodrigues, AGPL-3.0-or-later license, and Julia `>= 1.10` compatibility.
  - Setup streamlined directory hierarchy without premature empty layers:
    ```
    simone/
    ├── Project.toml              # Package definition, registered Julia dependencies
    ├── README.md                 # Scientific overview, docking discipline, quickstart
    ├── simone-specs.md           # Formal multi-layer systems engineering specification
    ├── TODO.md                   # Engineering taskboard & Single-Village roadmap
    ├── src/
    │   ├── Simone.jl             # Main module entrypoint & API exports
    │   ├── aggregate_ode.jl      # Model A: Continuous stock-flow ODE system
    │   ├── agent_abm.jl          # Model B: Discrete-agent model via Agents.jl
    │   └── docking.jl            # Axtell docking benchmark and error metrics
    └── test/
        ├── runtests.jl           # Top-level test runner
        ├── test_conservation.jl  # Leontief physical mass & energy balance invariants
        └── test_docking.jl       # Statistical equivalence tests (Model A vs Model B)
    ```
- [x] **Task 0.2: Core Dependency Definition**
  - Differential equation solvers: `DifferentialEquations.jl`, `ModelingToolkit.jl`
  - Agent-based framework: `Agents.jl` (v6+)
  - Linear algebra & optimization: `LinearAlgebra.jl`
  - Data structures & IO: `DataFrames.jl`, `StaticArrays.jl`, `JSON3.jl`
  - Testing suite: `Test.jl`, `BenchmarkTools.jl`

---

## **III. PHASE 1: SINGLE-VILLAGE AGGREGATE ODE MODEL (MODEL A)**

- [x] **Task 1.1: State Vector & Differential Equations Formulation** *(Baseline in `src/aggregate_ode.jl`)*
  - Define state vector $\mathbf{S}(t) = [E(t), W(t), C(t), P(t)]^T$ in strict physical units.
- [x] **Task 1.2: Stock and Flow Dynamics** *(Baseline in `src/aggregate_ode.jl`)*
  - Inflows (solar, rain, crops) vs outflows (metabolism, transmission, decay).
- [x] **Task 1.3: Solver Configuration & Numerical Stability** *(Benchmark in `benchmarks/benchmark_solvers.jl`)*
  - Evaluated `Tsit5()`, `Rodas5P()`, and `Rosenbrock23()` under stiff cloud/grid drops.

---

## **IV. PHASE 2: AGENTS.JL MICRO-MODEL (MODEL B)**

- [x] **Task 2.1: Human Agent Struct Definition** *(Baseline in `src/agent_abm.jl`)*
  - `@agent struct Villager(NoSpaceAgent)` with biological, productive, and psychological states.
- [x] **Task 2.2: Continuous-Time Environment Coupling** *(Baseline in `src/docking.jl`)*
  - Couple discrete-time agent stepping with continuous environmental stock updates.

---

## **V. PHASE 3: AXTEL DOCKING TEST & CORRECTNESS INVARIANTS**

- [x] **Task 3.1: Homogeneous Limit Configuration** *(Verified in `test/test_docking.jl`)*
  - $N = 300$ homogeneous agents under identical inflows.
- [x] **Task 3.2: Automated Statistical Equivalence Test** *(Verified in `test/test_docking.jl`)*
  - $||\mathbf{S}_{\text{ODE}}(t) - \mathbf{S}_{\text{ABM}}(t)|| \le 10^{-3}$ verified.
- [x] **Task 3.3: Heterogeneity Stress Activation** *(Implemented in `examples/run_hexaco_tipping_point.jl`)*
  - Sweeps behavioral variance $\sigma_H$ to identify critical tipping threshold.

---

## **VI. PHASE 4: THERMODYNAMIC CONSERVATION INVARIANTS & UNIT AUDIT**

- [x] **Task 4.1: Physical Leontief Conservation Tests** *(Verified in `test/test_conservation.jl`)*
  - First and second law conservation checks ($\sum \text{Inflows} - \sum \text{Outflows} = \frac{d\mathbf{S}}{dt}$).
- [x] **Task 4.2: Audit of Web Sandbox Formulas** *(Documented in `data/calibration_sources.md`)*
  - Cross-referenced toy web formulas against physical thermodynamics.

---

## **VII. PHASE 5: EXTERNAL SCIENTIFIC REVIEW & ADVISORY PIPELINE**

- [ ] **Task 5.1: Review of `Sirens.jl` Co-Simulation Framework** *(Awaiting external community assessment)*
- [x] **Task 5.2: Formal ODD Protocol Documentation** *(Published in `ODD_PROTOCOL.md`)*
  - Full Overview, Design concepts, and Details protocol paper for peer review.

---

## **VIII. PHASE 6: P2P SUBSTRATE COUPLING & REA EVENT DOCKING**

- [x] **Task 6.1: Ingestion Adapter for Elohim `epr-rea` Biophysical Events** *(Implemented in `src/rea_adapter.jl`)*
  - JSON deserializer for FlowEvents (`data/sample_rea_events.json`) mapped into state vectors.

---

## **IX. PHASE 7: HIGH-FIDELITY 4-LAYER INTEGRATION (`simone-specs.md`)**

- [x] **Task 7.1: Layer 0 — Abiotic & Hydrological Substrate** *(Baseline in `src/layer0_abiotic.jl`)*
- [x] **Task 7.2: Layer 1 — Technical-Productive Logistics & Leontief Invariants** *(Baseline in `src/layer1_leontief.jl` & `data/leontief_12sector_matrix.json`)*
- [x] **Task 7.3: Layer 2 — Heterogeneous Agent Psychometrics** *(Baseline in `src/layer2_psychometrics.jl`)*
- [x] **Task 7.4: Layer 3 — Institutional State Machines & Demarchy** *(Baseline in `src/layer3_sortition.jl` & `examples/run_sybil_sortition_attack.jl`)*

---

## **X. PHASE 8: DUAL-PILLAR INTEGRATION & SWISS FOUNDATION GENESIS LOCK**

- [ ] **Task 8.1: Pillar 1 (Biophysical Economics) Stress-Test**
  - Co-Steward of Economy runs abiotic deficit shocks through `Simone.jl` with external heterodox/ecological economists.
- [ ] **Task 8.2: Pillar 2 (Governance & Law) Stress-Test**
  - Co-Steward of Governance verifies demarchic immunity against factional capture and oligarchic drift.
- [ ] **Task 8.3: Swiss Foundation Genesis Lock (ZGB Art. 80 ff.)**
  - Deposit hardened constitutional diff as Statutory Annex I upon formal notarial incorporation.

