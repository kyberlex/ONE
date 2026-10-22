# **Simone.jl: Scientific Discrete-Event & Biophysical Co-Simulation Engine**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Julia: 1.10+](https://img.shields.io/badge/Julia-1.10+-9558B2.svg)](https://julialang.org)
[![Docking: Axtell 1996](https://img.shields.io/badge/Docking-Axtell_1996-green.svg)](https://doi.org/10.1007/BF00127394)

`Simone.jl` is the scientific co-simulation engine for **Open Networked Earth (O.N.E.)**. It provides an empirical, multi-scale computational framework to stress-test post-labor resource allocation, physical mass/energy balances, and demarchic sortition assemblies without relying on neoclassical equilibrium, arbitrary monetary tallies, or ungrounded generative artifacts.

---

## **I. The Scientific Philosophy: Rejecting Pseudo-Equilibrium**

Conventional economic models collapse under realistic friction because they treat resources as dimensionless financial tallies and assume homogeneous agents operating in frictionless Pareto equilibria.

`Simone.jl` enforces:
1. **Thermodynamic Conservation (Class-0 Hard Constraint):** Mass and exergy are strictly conserved. Energy conversions obey Carnot efficiency limits and second-law entropy destruction ($\Delta H - T_0 \Delta S$).
2. **Physical Stocks & Flows:** Resources are tracked strictly in physical units: Electrical exergy (kWh), potable/irrigation water (L), food calories (kcal), and processing capacity (core-hours).
3. **Multi-Scale Verification via Docking:** Prior to simulating continental networks or behavioral anomalies, we follow the **Axtell Docking Discipline (1996)** on a single-village scale ($N = 300$ residents).

---

## **II. The Axtell Single-Village Docking Architecture**

Proposed by Co-Steward Rainer Rodrigues ([GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11)), development adheres to rigorous alignment between aggregate mathematics and micro-agent simulations:

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

1. **Model A (`src/aggregate_ode.jl`):** An aggregate, continuous-time dynamical system (ODEs via `DifferentialEquations.jl`) modeling whole-village inflows (PV solar, precipitation, agricultural harvest) against baseline metabolic consumption, transmission friction, and decay.
2. **Model B (`src/agent_abm.jl`):** A discrete agent-based model using `Agents.jl`, where individual villagers possess metabolic, hydration, and duty adherence states.
3. **Docking Benchmark (`src/docking.jl`):** In the limit of identical, homogeneous agents, Model B's aggregate trajectories must match Model A within numerical tolerance ($||\mathbf{S}_{\text{ODE}}(t) - \mathbf{S}_{\text{ABM}}(t)|| \le \epsilon$).

Only when docking succeeds are behavioral variance, illness cascades, and sortition governance introduced.

---

## **III. Repository & Package Layout**

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

---

## **IV. Quickstart & Installation**

To activate and run `Simone.jl` locally in the Julia REPL:

```julia
# 1. Clone the repository and enter simone/
cd("path/to/one/simone")

# 2. Activate the package environment
using Pkg
Pkg.activate(".")
Pkg.instantiate()

# 3. Run the automated conservation and docking test suite
Pkg.test("Simone")
```

Or from the command line:

```bash
julia --project=simone -e 'using Pkg; Pkg.test()'
```

---

## **V. Governance, Invariants & Co-Stewardship**

* **License:** GNU Affero General Public License v3.0 or later ([AGPL-3.0-or-later](../../LICENSE)).
* **Architectural Authority:** Kyberlex ([`kyberlex@proton.me`](mailto:kyberlex@proton.me))
* **Technical Lead & Co-Steward:** Rainer Rodrigues ([`@rainerrodrigues`](https://github.com/rainerrodrigues))
* **Scientific Review:** Community feedback is coordinated via [GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11) and [JuliaLang Discourse Topic #140143](https://discourse.julialang.org).

> [!NOTE]
> **Open Co-Steward Mandate for Rainer Rodrigues (`@rainerrodrigues`):**  
> This initial scaffolding represents a working baseline prepared to kickstart your proposed *Single-Village Docking Strategy* ([Discussion #11](https://github.com/kyberlex/ONE/discussions/11)). **Please feel completely free to alter, refactor, reorganize, or replace any part of this layout, file hierarchy, module names, or dependency choices** if you believe an alternative setup is better suited for idiomatic Julia, numerical performance, or scientific clarity. You have full architectural freedom on the `Simone.jl` codebase.

