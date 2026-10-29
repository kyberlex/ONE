#!/usr/bin/env julia
"""
    run_single_village_docking.jl

Quick-start executable benchmark for Pillar 3 (Simulation) & Pillar 1 (Economics) collaborators.
Runs the Axtell (1996) Single-Village Docking Benchmark comparing:
  - Model A: Continuous-time ODE stock-flow system (`DifferentialEquations.jl`)
  - Model B: Discrete micro-agent ABM (`Agents.jl`) in the homogeneous limit (N = 300)

Usage:
    julia --project=simone simone/examples/run_single_village_docking.jl
"""

using Pkg
Pkg.activate(joinpath(@__DIR__, ".."))

using Simone
using Printf

function main()
    println("======================================================================")
    println(" SIMONE.JL — AXTELL (1996) SINGLE-VILLAGE DOCKING BENCHMARK (N = 300)")
    println("======================================================================")

    params = VillageParams()
    u0 = VillageState(1500.0, 150_000.0, 45_000_000.0, 3600.0)
    horizon_days = 30.0

    res = run_docking_benchmark(params, u0, horizon_days; dt_abm = 0.05, tolerance = 0.02)

    @printf("Simulation Horizon : %.1f days (dt_abm = 0.05 days)\n", horizon_days)
    @printf("Final ODE Stocks   : E = %.1f kWh | W = %.1f L | C = %.1f kcal | P = %.1f core-h\n",
            res.ode_energy[end], res.ode_water[end], res.ode_calories[end], res.ode_compute[end])
    @printf("Final ABM Stocks   : E = %.1f kWh | W = %.1f L | C = %.1f kcal | P = %.1f core-h\n",
            res.abm_energy[end], res.abm_water[end], res.abm_calories[end], res.abm_compute[end])
    @printf("Max Relative Error : %.6f (Threshold <= 0.020)\n", res.max_relative_error)
    println("Docking Status     : ", res.is_docked ? "PASS (DOCKED)" : "FAIL (DIVERGED)")
    println("======================================================================")
end

main()

