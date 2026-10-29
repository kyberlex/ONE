using Test
using Simone

@testset "4-Layer Constitutional & Biophysical Modules (Layers 0-3)" begin
    # Layer 0: Abiotic Darcy Aquifer Step, Soil N-P-K & Drought Shock
    p_abio = AbioticSubstrateParams()
    next_aq = darcy_aquifer_step(1.0e6, 10000.0, 2000.0, p_abio)
    @test next_aq > 1.0e6
    @test soil_nitrogen_step(180.0, 0.5, p_abio) > 179.9
    @test abiotic_drought_shock_multiplier(200.0; shock_start=180.0, shock_duration=60.0, severity=0.4) ≈ 0.6

    # Layer 1: Leontief Gross Output, Hawkins-Simon & Lexicographic Operator (Pillar 1)
    A = [
        0.08  0.002 0.0005 0.25;
        0.15  0.04  0.012  0.05;
        0.0   0.0   0.06   0.0;
        0.01  0.0002 0.0001 0.05
    ]
    hs = check_hawkins_simon(A)
    @test hs.viable == true
    @test hs.spectral_radius < 1.0
    d = [1500.0, 45000.0, 750000.0, 600.0]
    x = solve_leontief_gross_output(A, d)
    @test all(x .>= d)

    # Lexicographic allocation (L_min): Tier 1 must be satisfied first under deficit
    alloc = lexicographic_allocate(1200.0, 1000.0, 500.0, 300.0)
    @test alloc.tier1 == 1000.0
    @test alloc.tier2 == 200.0
    @test alloc.tier3 == 0.0

    # Weibull MTBF hazard increases with operating hours when k > 1
    h_early = weibull_hazard_rate(1000.0, 2.4, 65000.0)
    h_late  = weibull_hazard_rate(20000.0, 2.4, 65000.0)
    @test h_late > h_early

    # Layer 2: Psychometrics (Pillar 3)
    prof_coop = PsychometricProfile(4.5, 1, 0.1)
    prof_free = PsychometricProfile(1.3, 2, 0.6)
    @test civic_contribution_propensity(prof_coop, 0.8) > civic_contribution_propensity(prof_free, 0.8)

    # Layer 3: Sortition Odd Parity & 75% Supermajority (Pillar 2)
    for q in VALID_SORTITION_QUORUMS
        @test verify_odd_parity_quorum(q)
    end
    @test !verify_odd_parity_quorum(100)
    @test_throws ArgumentError evaluate_supermajority_vote(80, 100)

    res_pass = evaluate_supermajority_vote(76, 101)
    res_fail = evaluate_supermajority_vote(75, 101)
    @test res_pass.ratified == true
    @test res_fail.ratified == false

    # Verify all 5 Orthogonal Seed Node archetype JSON datasets
    arch_dir = joinpath(@__DIR__, "..", "data", "archetypes")
    for nf in [
        "node01_oceanic_galicia.json",
        "node02_montane_andes.json",
        "node03_tropical_monsoon.json",
        "node04_equatorial_rift.json",
        "node05_continental_ozarks.json"
    ]
        fpath = joinpath(arch_dir, nf)
        @test isfile(fpath)
    end

    # Verify 12-Sector Leontief matrix and REA Adapter (Tasks 1.1 & 6.1)
    matrix12_path = joinpath(@__DIR__, "..", "data", "leontief_12sector_matrix.json")
    @test isfile(matrix12_path)

    events_path = joinpath(@__DIR__, "..", "data", "sample_rea_events.json")
    @test isfile(events_path)

    # REA FlowEvent structure and folding
    sample_events = [
        REAFlowEvent("e1", 1.0, :produce, :exergy_kwh, 100.0, "pv", "battery"),
        REAFlowEvent("e2", 2.0, :consume, :exergy_kwh, 30.0, "battery", "home"),
        REAFlowEvent("e3", 3.0, :produce, :water_liters, 500.0, "weir", "tank"),
        REAFlowEvent("e4", 4.0, :consume, :water_liters, 200.0, "tank", "irrigation"),
    ]
    deltas = fold_rea_events(sample_events)
    @test deltas[:exergy_kwh] ≈ 70.0
    @test deltas[:water_liters] ≈ 300.0

    ode_match = Dict(:exergy_kwh => 68.0, :water_liters => 295.0, :biomass_kcal => 0.0, :compute_fab_hours => 0.0)
    reconciled, errors = reconcile_rea_with_ode_delta(sample_events, ode_match; tolerance_pct=5.0)
    @test reconciled == true
end

