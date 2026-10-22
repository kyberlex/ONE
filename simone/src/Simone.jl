"""
    Simone

Scientific discrete-event and biophysical co-simulation engine for Open Networked Earth (O.N.E.).
Implements the Single-Village Axtell Docking Discipline between aggregate stock-flow ODEs
and discrete multi-agent behavioral systems.

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

include("aggregate_ode.jl")
include("agent_abm.jl")
include("docking.jl")

end # module Simone
