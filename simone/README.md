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

Originally proposed as a Phase 1 docking baseline by contributor Rainer Rodrigues ([GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11)), development adheres to rigorous alignment between aggregate mathematics and micro-agent simulations:

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
├── Manifest.toml             # Pinned reproducible dependency graph
├── README.md                 # Scientific overview, docking discipline, quickstart
├── ODD_PROTOCOL.md           # Formal Overview, Design concepts & Details specification
├── simone-specs.md           # Formal multi-layer systems engineering specification
├── TODO.md                   # Engineering taskboard & Single-Village roadmap
├── benchmarks/
│   ├── benchmark_solvers.jl  # Stiff ODE benchmark: Tsit5 vs Rodas5P vs Rosenbrock23
│   ├── sim_qa_10_embargo.jl  # SIM-QA-10 adversarial docket: Hawkins-Simon under embargo
│   ├── sim_qa_11_petition_dos.py # SIM-QA-11 adversarial docket: petition flooding (Python stdlib)
│   └── results/              # Docket result reports and raw outputs
├── data/
│   ├── leontief_baseline_matrix.json # 4x4 physical Leontief I-O baseline (N = 300)
│   ├── leontief_12sector_matrix.json # 12-sector matrix (v1, frozen: audited input of SIM-QA-10)
│   ├── leontief_14sector_matrix.json # 14-sector v2: shelter Tier 1, healthcare, Tier 3, imports, capacity (ILLUSTRATIVE)
│   ├── sample_rea_events.json        # Elohim epr-rea FlowEvent JSON sample streams
│   ├── calibration_sources.md        # Academic and empirical data calibration citations
│   └── archetypes/                   # 5 Orthogonal Seed Node datasets (NODE-01 to NODE-05)
├── examples/
│   ├── run_single_village_docking.jl      # Quickstart ODE vs ABM Axtell docking runner
│   ├── run_orthogonal_seed_nodes_audit.jl # 5-biome abiotic shock & Leontief L_min runner
│   ├── run_full_4layer_year.jl            # Integrated 365-day 4-layer co-simulation runner
│   ├── run_lmin_drought_stress_test.jl    # Pillar 1: 90-day drought & L_min allocation stress-test
│   ├── run_sybil_sortition_attack.jl      # Pillar 2: Sybil / factional capture Monte Carlo
│   ├── run_hexaco_tipping_point.jl        # Pillar 3: HEXACO-H psychometric tipping point sweep
│   └── run_autarkic_closure_audit.jl      # Art. 3.1.6 Tier 1 Autarkic Closure audit & Art. 3.5.2 reserve gaps
├── src/
│   ├── Simone.jl             # Main module entrypoint & API exports
│   ├── aggregate_ode.jl      # Model A: Continuous stock-flow ODE system
│   ├── agent_abm.jl          # Model B: Discrete-agent model via Agents.jl
│   ├── docking.jl            # Axtell docking benchmark and error metrics
│   ├── layer0_abiotic.jl     # Layer 0: Darcy hydrology & abiotic substrate
│   ├── layer1_leontief.jl    # Layer 1: Leontief I-O, matrix-aware L_min, Art. 3.1.6 audit & Weibull MTBF (Pillar 1)
│   ├── layer2_psychometrics.jl # Layer 2: HEXACO-H & bounded rationality (Pillar 3)
│   ├── layer3_sortition.jl   # Layer 3: Odd-parity sortition, 75% rule, Art. 4.3.5 petition intake (Pillar 2)
│   └── rea_adapter.jl        # P2P event-stream deserializer for Elohim REA events
└── test/
    ├── runtests.jl           # Top-level test runner
    ├── test_conservation.jl  # Leontief physical mass & energy balance invariants
    ├── test_docking.jl       # Statistical equivalence tests (Model A vs Model B)
    ├── test_layers.jl        # Unit tests for Layers 0-3 and 5 Seed Node archetypes
    ├── test_autarkic_closure.jl # Art. 3.1.6 audit, matrix-aware L_min, v2 14-sector data
    └── test_petition_intake.jl  # Art. 4.3.5 / OL-9 petition intake, Art. 5.2.3 universal eligibility
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

## **IV-bis. Constitutional Follow-ups Implemented (SIM-QA-10, SIM-QA-11)**

* **Art. 3.1.6 Tier 1 Autarkic Closure** — `autarkic_closure_audit` (`src/layer1_leontief.jl`) sets external inputs to zero (`c = capacity .* (1 .- m)`), computes the full Tier 1 requirement including intermediate inputs (`(I - A)^(-1) f₁`), audits every sector that directly or indirectly supplies Tier 1, checks optional primary-resource ceilings, and returns feasibility, binding sectors, the published reserve margin, and the **Art. 3.5.2 reserve-gap composition** (storable stock / spare parts / redundant capacity).
* **Matrix-aware `L_min`** — `lexicographic_allocate(A, capacity, d1, d2, d3)` charges each tier its gross requirement; the scalar method is kept for backward compatibility.
* **Data v2** — `data/leontief_14sector_matrix.json`: shelter re-tagged Tier 1, new healthcare (Tier 1) and discretionary (Tier 3) sectors, import-dependence, installed capacity, primary resources. **All of it is ILLUSTRATIVE — uncalibrated** (see `data/calibration_sources.md` §5). The v1 12-sector file is frozen so SIM-QA-10 stays reproducible.
* **Art. 4.3.5 / OL-9 petition intake** — `petition_intake` (`src/layer3_sortition.jl`): unfiltered register, equal quadratic allowance (9 tokens/quarter, `k` endorsements cost `k²`), co-signers `max(3, ⌈2%⌉)`, 10% fast lane, 3-citizen triage (form check + duplicate merge only), finite slots filled by a lottery weighted by distinct support (`1/k` per endorser), 13-week pool expiry. Deterministic from a public seed (`BeaconRNG`, SplitMix64).
* **Art. 5.2.3 universal eligibility** — `eligible_sortition_pool` excludes only citizens in post-service cooldown; labor or reciprocity status is never an input. (No labor-based exclusion existed in the previous code; this makes the invariant explicit and tested.)

```bash
julia --project=simone simone/examples/run_autarkic_closure_audit.jl
```

---

## **V. Governance, Invariants & Co-Stewardship**

* **License:** GNU Affero General Public License v3.0 or later ([AGPL-3.0-or-later](../../LICENSE)).
* **Architectural Authority:** Kyberlex ([`kyberlex@proton.me`](mailto:kyberlex@proton.me))
* **Lead Technical Co-Steward (Pillar 3):** 🔍 **OPEN POSITION (Actively Seeking Lead Co-Steward & Scientific Modelers)** — See [GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11).
* **Phase 1 Contributor (Docking Proposal):** Rainer Rodrigues ([`@rainerrodrigues`](https://github.com/rainerrodrigues))
* **Scientific Review & Dialectic:** Community feedback is coordinated via [GitHub Discussion #11](https://github.com/kyberlex/ONE/discussions/11) and [JuliaLang Discourse Topic #140143](https://discourse.julialang.org).

> [!IMPORTANT]
> ### 🔬 **Call for Lead Technical Co-Steward & Multi-Layer Modelers (`Simone.jl`)**
> `Simone.jl` is the empirical backbone of Open Networked Earth. **Foundation ONE will only be chartered under Swiss Civil Law (ZGB Art. 80 ff.) AFTER the Living Constitution is simulated at the highest possible fidelity** across all 4 layers specified in [`simone-specs.md`](simone-specs.md):
> 1. **Layer 0 (Biophysical/Abiotic):** Groundwater hydrology (Darcy flow), soil N-P-K depletion, thermodynamic solar/wind flux.
> 2. **Layer 1 (Technical-Productive / Leontief):** Inter-industry mass/energy input-output matrices, Weibull MTBF component wear, and non-monetary lexicographic allocation ($L_{\min}$). *(Anchored directly to **Pillar 1: Biophysical Economics**)*.
> 3. **Layer 2 (Psychometrics & Heterogeneous Agents):** HEXACO-H personality variance, Dunbar scale limits, informal reciprocity, and labor burnout.
> 4. **Layer 3 (Institutional State Machines):** Odd-parity sortition assemblies, demarchic juries, and constitutional case law. *(Anchored directly to **Pillar 2: Governance & Sortition**)*.
> 
> The position of **Lead Technical Co-Steward (Pillar 3)** is **open and top priority**. We are actively seeking experienced Julia systems modelers and scientific developers (`DifferentialEquations.jl`, `Agents.jl`, `ModelingToolkit.jl`) to take co-leadership of the package.

