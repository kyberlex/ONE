using Test
using Simone
using LinearAlgebra

@testset "Art. 3.1.6 Tier 1 Autarkic Closure & matrix-aware L_min (SIM-QA-10 follow-up)" begin
    # ---- Toy 3-sector economy with an exact hand-computable inverse ---------------------------------
    # Sector 1 (Tier 1 food) needs 0.5 units of sector 2 (energy) per unit; sector 2 needs nothing.
    A = [0.0 0.0 0.0;
         0.5 0.0 0.2;
         0.0 0.0 0.0]
    L = leontief_inverse(A)
    @test L ≈ [1.0 0.0 0.0; 0.5 1.0 0.2; 0.0 0.0 1.0]

    # Matrix-aware L_min: Tier 1 requirement includes intermediate energy (100 food -> 50 energy).
    cap = [100.0, 60.0, 100.0]
    la = lexicographic_allocate(A, cap, [100.0, 0.0, 0.0], [0.0, 20.0, 0.0], [0.0, 0.0, 100.0])
    @test la.tier1_fraction ≈ 1.0
    @test la.tier1_gross ≈ [100.0, 50.0, 0.0]
    @test la.tier2_fraction ≈ 0.5                  # only 10 energy left for 20 of Tier 2 demand
    @test la.tier3_fraction == 0.0                 # strict lexicographic order: Tier 3 blocked
    @test la.binding_sectors == [2]
    # The scalar shortcut would wrongly report full Tier 2 service from the same 60 energy units.
    @test lexicographic_allocate(60.0, 0.0, 20.0, 0.0).tier2 == 20.0

    # Tier 1 shortfall: lower tiers receive nothing.
    la2 = lexicographic_allocate(A, [100.0, 40.0, 100.0], [100.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0])
    @test la2.tier1_fraction ≈ 0.8
    @test la2.tier2_fraction == 0.0 && la2.tier3_fraction == 0.0
    @test la2.binding_sectors == [2]

    # Autarkic closure audit: external inputs at zero via import dependence.
    f1 = [100.0, 0.0, 0.0]
    ok = autarkic_closure_audit(A, f1, [120.0, 60.0, 0.0]; sector_ids = ["food", "energy", "t3"])
    @test ok.feasible
    @test ok.supply_chain == ["food", "energy"]       # energy audited although it has no Tier 1 final demand
    @test ok.reserve_margin ≈ 0.2
    @test isempty(ok.reserve_gap)

    bad = autarkic_closure_audit(A, f1, [120.0, 60.0, 0.0]; import_dependence = [0.0, 0.5, 0.0],
                                 reserve_form = [:storable_stock, :redundant_capacity, :none],
                                 sector_ids = ["food", "energy", "t3"], reserve_months = 12)
    @test !bad.feasible
    @test bad.binding_sectors == ["energy"]
    @test bad.local_capacity ≈ [120.0, 30.0, 0.0]
    @test bad.reserve_margin ≈ -0.4
    @test bad.alpha ≈ 0.6
    @test length(bad.reserve_gap) == 1
    @test bad.reserve_gap[1].form == :redundant_capacity
    @test bad.reserve_gap[1].daily_gap ≈ 20.0
    @test bad.reserve_gap[1].horizon_quantity ≈ 20.0  # redundant capacity is a per-day capacity, not a stock

    # Storable sector gap becomes a 12-month stock; target margin enlarges the gap.
    st = autarkic_closure_audit(A, f1, [90.0, 100.0, 0.0]; reserve_form = [:storable_stock, :spare_parts, :none],
                                target_margin = 0.1)
    @test st.binding_sectors == [1]
    @test st.reserve_gap[1].daily_gap ≈ 20.0          # 1.1 * 100 - 90
    @test st.reserve_gap[1].horizon_quantity ≈ 20.0 * 365.0
    @test haskey(st.reserve_by_form, :storable_stock)

    # Primary-resource ceilings are part of the closure.
    rs = autarkic_closure_audit(A, f1, [200.0, 200.0, 0.0]; R = [2.0 0.0 0.0], resource_ceiling = [150.0],
                                resource_ids = ["land"])
    @test !rs.feasible && rs.binding_resources == ["land"]
    @test rs.resource_overshoot ≈ [50.0]
    @test_throws ArgumentError autarkic_closure_audit(A, f1, cap; R = [1.0 0.0 0.0])
    @test_throws ArgumentError autarkic_closure_audit(A, f1, cap; import_dependence = [1.5, 0.0, 0.0])
    @test_throws ArgumentError leontief_inverse([1.2 0.0; 0.0 0.1])

    # ---- v2 14-sector data file ----------------------------------------------------------------------
    path14 = joinpath(@__DIR__, "..", "data", "leontief_14sector_matrix.json")
    m = load_leontief_model(path14)
    n = length(m.ids)
    @test n == 14
    @test size(m.A) == (14, 14)
    hs = check_hawkins_simon(m.A)
    @test hs.viable
    @test hs.spectral_radius < 1.0
    @test minimum(leontief_inverse(m.A)) >= 0.0
    tier_of(id) = m.tiers[findfirst(==(id), m.ids)]
    @test tier_of("timber_structural_kg") == 1        # shelter is Tier 1 (Art. 3.3)
    @test tier_of("healthcare_care_h") == 1           # healthcare sector exists and is Tier 1
    @test any(==(3), m.tiers)                         # a Tier 3 sector exists
    @test m.import_dependence !== nothing && all(x -> 0.0 <= x <= 1.0, m.import_dependence)
    @test m.capacity !== nothing && all(>(0.0), m.capacity)
    @test m.R !== nothing && size(m.R) == (length(m.resource_ids), 14)
    # Rows/columns 0-11 must stay identical to the frozen v1 matrix audited by SIM-QA-10.
    m12 = load_leontief_model(joinpath(@__DIR__, "..", "data", "leontief_12sector_matrix.json"))
    @test m.A[1:12, 1:12] == m12.A
    @test m12.capacity === nothing

    # Installed capacity covers full baseline demand when external inputs are available.
    x = solve_leontief_gross_output(m.A, m.d)
    @test all(m.capacity .>= x)
    full = lexicographic_allocate(m.A, m.capacity, m.d .* (m.tiers .== 1), m.d .* (m.tiers .== 2),
                                  m.d .* (m.tiers .== 3))
    @test full.tier1_fraction ≈ 1.0 && full.tier2_fraction ≈ 1.0 && full.tier3_fraction ≈ 1.0

    # Audit with all imports available (m = 0) passes; Tier 3 never enters the Tier 1 supply chain.
    a0 = autarkic_closure_audit(merge(m, (import_dependence = zeros(n),)))
    @test a0.feasible
    @test a0.reserve_margin > 0.0
    @test !("discretionary_t3_h" in a0.supply_chain)
    @test "electronics_compute_ch" in a0.supply_chain  # Tier 2 sector indirectly supplying Tier 1

    # Audit with the ILLUSTRATIVE import-dependence vector: honest expected outcome is FAIL.
    a = autarkic_closure_audit(m)
    @test !a.feasible
    @test a.reserve_margin < 0.0
    @test a.alpha < 1.0
    @test "healthcare_care_h" in a.binding_sectors
    forms = Set(e.form for e in a.reserve_gap)
    @test :storable_stock in forms && :redundant_capacity in forms
    for e in a.reserve_gap
        @test e.daily_gap > 0.0
        @test e.sector in a.binding_sectors
    end
    # Gap closes once the audited gaps are filled (Art. 3.5.2 loop): add the gaps as import-free capacity.
    cap_fixed = copy(m.capacity)
    for e in a.reserve_gap
        i = findfirst(==(e.sector), m.ids)
        cap_fixed[i] += e.daily_gap / (1.0 - m.import_dependence[i]) * (1 + 1e-9)
    end
    afix = autarkic_closure_audit(merge(m, (capacity = cap_fixed,)))
    @test isempty(afix.binding_sectors)
    @test afix.reserve_margin >= -1e-9
end

