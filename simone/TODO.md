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

- [ ] **Task 1.1: State Vector & Differential Equations Formulation**
  - Define state vector $\mathbf{S}(t) = [E(t), W(t), C(t), P(t)]^T$:
    - $E(t)$: Stored exergy / electrical energy (kWh, battery + thermal storage)
    - $W(t)$: Usable potable and agricultural water volume (L)
    - $C(t)$: Biomass / food calories stock (kcal)
    - $P(t)$: Processing / compute capacity stock (core-hours)
- [ ] **Task 1.2: Stock and Flow Dynamics**
  - Inflow rates: Solar PV generation, rainwater catchment / aquifer infiltration, crop yield kinetics.
  - Outflow / consumption rates: Baseline metabolic subsistence per capita, transmission/piping friction losses, storage decay (self-discharge, evaporation, spoilage).
- [ ] **Task 1.3: Solver Configuration & Numerical Stability**
  - Benchmark ODE solvers under stiff transitions (e.g. sudden cloud cover or grid drop): evaluate `Tsit5()`, `Rodas5P()`, and `Rosenbrock23()`.
  - Enforce non-negativity constraints ($S_i(t) \ge 0$) via integrator callbacks (`ContinuousCallback` or `PositiveDomain`).

---

## **IV. PHASE 2: AGENTS.JL MICRO-MODEL (MODEL B)**

- [ ] **Task 2.1: Human Agent Struct Definition**
  - Define `@agent struct Villager(NoSpaceAgent)`:
    - Biological state: metabolic calorie balance, hydration level, fatigue.
    - Productive state: assigned work domain (farming, microgrid maintenance, water filtration).
    - Psychological baseline: cooperation index, civic duty adherence.
- [ ] **Task 2.2: Continuous-Time Environment Coupling**
  - Couple discrete-time agent stepping (`step!`) with continuous environmental ODEs (`step!(integrator, dt)`).
  - Test time-stepping intervals: determine synchronization frequency (e.g. 1-hour physical ODE step vs. daily agent decision loop) to avoid stiffness artifacts.

---

## **V. PHASE 3: AXTEL DOCKING TEST & CORRECTNESS INVARIANTS**

- [ ] **Task 3.1: Homogeneous Limit Configuration**
  - Configure $N = 300$ identical, non-deviant agents with uniform metabolic demand and 100% compliance.
  - Run Model A (Aggregate ODE) and Model B (Agents.jl) under identical weather/inflow time-series.
- [ ] **Task 3.2: Automated Statistical Equivalence Test**
  - In `test/test_docking.jl`, verify that trajectory error $||\mathbf{S}_{\text{ODE}}(t) - \mathbf{S}_{\text{ABM}}(t)||$ stays within bounded numerical tolerance ($\epsilon \le 10^{-3}$) across $t \in [0, 365\text{ days}]$.
- [ ] **Task 3.3: Heterogeneity Stress Activation**
  - Incrementally inject behavioral variance:
    - Fatigue variance -> productivity dispersion.
    - Illness/injury rates -> maintenance backlog.
    - Identify the exact tipping point where agent heterogeneity diverges from aggregate predictions.

---

## **VI. PHASE 4: THERMODYNAMIC CONSERVATION INVARIANTS & UNIT AUDIT**

- [ ] **Task 4.1: Physical Leontief Conservation Tests**
  - Unit tests verifying that mass and energy cannot be created from nothing ($\sum \text{Inflows} - \sum \text{Outflows} = \frac{d\mathbf{S}}{dt}$).
  - Second-law entropy destruction checks on all energy conversions.
- [ ] **Task 4.2: Audit of Web Sandbox Formulas**
  - Cross-reference formulas used in the web sandbox (`sim/app/`) against physical thermodynamics and document any toy approximations that require scientific correction in SIMONE.

---

## **VII. PHASE 5: EXTERNAL SCIENTIFIC REVIEW & ADVISORY PIPELINE**

- [ ] **Task 5.1: Review of `Sirens.jl` Co-Simulation Framework**
  - Await Rainer Rodrigues' assessment of `@mjowen` / `Sirens.jl` (`u/i_is_billy_bob`).
  - If approved, evaluate whether to adopt `Sirens.jl` as an architectural dependency or benchmark against its ABM-ODE coupling strategy.
- [ ] **Task 5.2: Formal ODD Protocol Documentation**
  - Author a formal Overview, Design concepts, and Details (ODD) protocol paper for peer review across the JuliaDynamics community.

---

## **VIII. PHASE 6: P2P SUBSTRATE COUPLING & REA EVENT DOCKING**

- [ ] **Task 6.1: Ingestion Adapter for Elohim `epr-rea` Biophysical Events**
  - As defined in the O.N.E. / Elohim Translation Map (October 2026), create a Julia JSON deserializer for external `FlowEvent` payloads from Elohim Protocol's content-addressed Rust substrate (`elohim/epr-rea`).
  - Map incoming raw event streams (kWh energy generation/consumption, liters of water, kg of food/biomass, machine wear cycle hours) directly into SIMONE's state vectors $\mathbf{S}_{\text{ODE}}(t)$.
  - Verify that the discrete REA event folds agree with SIMONE's continuous differential equation trajectories (docking validation between P2P economic log and physical conservation laws).

---

## **IX. PHASE 7: HIGH-FIDELITY 4-LAYER INTEGRATION (`simone-specs.md`)**

- [ ] **Task 7.1: Layer 0 — Abiotic & Hydrological Substrate**
  - Implement Darcy aquifer drawdowns, soil N-P-K depletion kinetics, and stochastic weather flux in continuous ODEs.
- [ ] **Task 7.2: Layer 1 — Technical-Productive Logistics & Leontief Invariants (Pillar 1 Integration)**
  - Calibrate input-output matrices (exergy in kWh, dry mass in kg, circular turnover times).
  - Implement non-monetary lexicographic viability operator ($L_{\min}$) and Weibull MTBF component wear.
- [ ] **Task 7.3: Layer 2 — Heterogeneous Agent Psychometrics**
  - Integrate HEXACO-H honest-humility distributions, Camerer k-depth rationality, and social burnout friction.
- [ ] **Task 7.4: Layer 3 — Institutional State Machines & Demarchy (Pillar 2 Integration)**
  - Model stratified sortition assemblies with odd-parity juror quorums (3, 15, 101, 301, 1001).
  - Simulate deliberative case law ratifications under the 75% constitutional supermajority rule.

---

## **X. PHASE 8: DUAL-PILLAR INTEGRATION & SWISS FOUNDATION GENESIS LOCK**

- [ ] **Task 8.1: Pillar 1 (Biophysical Economics) Stress-Test**
  - Co-Steward of Economy runs abiotic deficit shocks through `Simone.jl` with external heterodox/ecological economists.
- [ ] **Task 8.2: Pillar 2 (Governance & Law) Stress-Test**
  - Co-Steward of Governance verifies demarchic immunity against factional capture and oligarchic drift.
- [ ] **Task 8.3: Swiss Foundation Genesis Lock (ZGB Art. 80 ff.)**
  - Deposit hardened constitutional diff as Statutory Annex I upon formal notarial incorporation.

