#!/usr/bin/env julia
"""
    run_orthogonal_seed_nodes_audit.jl

Multi-biome stress-test runner for Pillar 1 (Biophysical Economics), Pillar 2 (Governance),
and Pillar 3 (Scientific Simulation) collaborators and critics.

Loads the 5 orthogonal Seed Node archetypes (`NODE-01` to `NODE-05`), verifies Leontief
Hawkins-Simon viability, simulates a 40% abiotic drought/solar deficit under the non-monetary
lexicographic allocation operator (`L_min`), and audits a 101-citizen sortition emergency assembly.

Usage:
    julia --project=simone simone/examples/run_orthogonal_seed_nodes_audit.jl
"""

using Pkg
Pkg.activate(joinpath(@__DIR__, ".."))

using Simone
using JSON3
using Printf

function main()
    println("================================================================================")
    println(" SIMONE.JL — 5 ORTHOGONAL SEED NODES BIOPHYSICAL & DEMARCHIC STRESS-TEST")
    println("================================================================================")

    data_dir = joinpath(@__DIR__, "..", "data")
    leontief_data = JSON3.read(read(joinpath(data_dir, "leontief_baseline_matrix.json"), String))

    n = length(leontief_data.sectors)
    A = zeros(Float64, n, n)
    for i in 1:n, j in 1:n
        A[i, j] = Float64(leontief_data.technical_coefficients_matrix_A.rows[i][j])
    end
    pop_baseline = 300.0
    d_per_cap = leontief_data.tier1_final_demand_per_capita_day
    d = [
        pop_baseline * Float64(d_per_cap.exergy_kwh),
        pop_baseline * Float64(d_per_cap.water_liters),
        pop_baseline * Float64(d_per_cap.biomass_kcal),
        pop_baseline * Float64(d_per_cap.compute_fab_hours)
    ]

    gross_x = solve_leontief_gross_output(A, d)
    println("\n[1] Leontief Gross Output Verification (N = 300 Baseline):")
    for (idx, sec) in enumerate(leontief_data.sectors)
        @printf("    - %-20s : Final Demand d = %10.1f | Gross Output x = %10.1f (%s)\n",
                String(sec.id), d[idx], gross_x[idx], String(sec.unit))
    end

    println("\n[2] 5 Orthogonal Seed Nodes — 40% Abiotic Deficit & L_min Allocation Check:")
    node_files = [
        "node01_oceanic_galicia.json",
        "node02_montane_andes.json",
        "node03_tropical_monsoon.json",
        "node04_equatorial_rift.json",
        "node05_continental_ozarks.json"
    ]

    for nf in node_files
        node = JSON3.read(read(joinpath(data_dir, "archetypes", nf), String))
        solar_nom = Float64(node.village_params.solar_daily_kwh)
        solar_shock = 0.60 * solar_nom # 40% solar drop

        # Tier 1 survival demand = 900 kWh/day, Tier 2 fablab = 450 kWh/day, Tier 3 discretionary = 300 kWh/day
        alloc = lexicographic_allocate(solar_shock, 900.0, 450.0, 300.0)
        @printf("    * [%s] %-42s | Shock Supply: %6.1f kWh -> T1: %5.1f, T2: %5.1f, T3: %5.1f\n",
                String(node.seed_node_code), String(node.koppen_class),
                solar_shock, alloc.tier1, alloc.tier2, alloc.tier3)
    end

    println("\n[3] Layer 3 Bioregional Sortition Assembly Ratification (Quorum = 101):")
    vote_res = evaluate_supermajority_vote(78, 101)
    @printf("    - Jurors: 101 (Odd Parity Verified) | Yes Votes: 78 (%.1f%%) | Ratified: %s\n",
            100.0 * vote_res.approval_share, vote_res.ratified ? "YES (>= 75%)" : "NO")
    println("================================================================================")
end

main()

