"""
    Simone

Scientific discrete-event and biophysical co-simulation engine for Open Networked Earth (O.N.E.).
Implements the Single-Village Axtell Docking Discipline and the 4-Layer Architecture (`simone-specs.md`):
  - Layer 0: Biophysical & Hydrological Substrate (`layer0_abiotic.jl`)
  - Layer 1: Leontief Input-Output & Weibull MTBF Logistics (`layer1_leontief.jl` — Pillar 1)
  - Layer 2: Psychometrics & Heterogeneous Agents (`layer2_psychometrics.jl` — Pillar 3)
  - Layer 3: Odd-Parity Sortition & Demarchic State Machines (`layer3_sortition.jl` — Pillar 2)

Governed by Class-0 Hard Constraints:
- Thermodynamic Mass & Energy Conservation (Leontief balances)
- Non-Commercial Purity (AGPL-3.0-or-later)
"""
module Simone

using LinearAlgebra
using StaticArrays
using DataFrames
using JSON3
using DifferentialEquations
using Agents

export VillageParams, VillageState
export solve_aggregate_ode, build_aggregate_ode_problem
export initialize_village_abm, step_village_abm!
export run_docking_benchmark, DockingResult

# 4-Layer Architecture Exports
export AbioticSubstrateParams, darcy_aquifer_step
export solve_leontief_gross_output, lexicographic_allocate, weibull_hazard_rate
export PsychometricProfile, civic_contribution_propensity
export VALID_SORTITION_QUORUMS, CONSTITUTIONAL_SUPERMAJORITY
export verify_odd_parity_quorum, evaluate_supermajority_vote

include("aggregate_ode.jl")
include("agent_abm.jl")
include("docking.jl")
include("layer0_abiotic.jl")
include("layer1_leontief.jl")
include("layer2_psychometrics.jl")
include("layer3_sortition.jl")

end # module Simone
