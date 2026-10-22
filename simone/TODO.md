# **SIMONE Implementation Roadmap & Engineering Taskboard (`TODO.md`)**

**Document Version:** `0.1.0-DRAFT`  
**Target Package:** `Simone.jl` (Scientific Co-Simulation Engine)  
**Technical Lead & Co-Steward:** Rainer Rodrigues ([`@rainerrodrigues`](https://github.com/rainerrodrigues))  
**Architectural Authority:** Kyberlex ([`kyberlex@proton.me`](mailto:kyberlex@proton.me))  
**Governing Invariants:** Class-0 Non-Commercial (AGPL-3.0-or-later), Thermodynamic Mass/Energy Conservation, Pure Julia Implementation.

---

## **I. OVERVIEW & STRATEGIC RATIONALE**

The full formal specification for SIMONE is defined in [`simone/simone-specs.md`](simone-specs.md). To avoid uncalibrated complexity, premature scaling, or AI-hallucinated modeling artifacts, the development of SIMONE follows the **Single-Village Docking Strategy** proposed by Rainer Rodrigues ([GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11)):

```
┌─────────────────────────────────────────────────────────┐
│               THE AXTEL DOCKING DISCIPLINE               │
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
