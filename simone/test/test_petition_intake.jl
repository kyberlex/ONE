using Test
using Simone

@testset "Art. 4.3.5 / OL-9 Petition Intake & Art. 5.2.3 Universal Eligibility (SIM-QA-11 follow-up)" begin
    # ---- OL-9 parameters ----------------------------------------------------------------------------
    @test petition_cosigners_required(300) == 6
    @test petition_cosigners_required(15) == 3        # floor of 3
    @test petition_cosigners_required(151) == 4       # ceil(3.02)
    @test petition_fast_lane_threshold(300) == 30
    @test quadratic_endorsement_cost(3) == 9
    @test max_affordable_endorsements(ENDORSEMENT_TOKENS_PER_QUARTER) == 3
    @test max_affordable_endorsements(8) == 2

    # ---- Universal sortition eligibility: labor status never excludes -------------------------------
    citizens = [
        (id = 1, labor_reciprocity_active = false, in_cooldown = false),
        (id = 2, labor_reciprocity_active = true,  in_cooldown = false),
        (id = 3, labor_reciprocity_active = false, in_cooldown = true),
        (id = 4, labor_reciprocity_active = true,  in_cooldown = false),
    ]
    pool = eligible_sortition_pool(citizens)
    @test pool == [1, 2, 4]                           # non-reciprocating citizen 1 stays eligible
    @test eligible_sortition_pool(1:10; cooldown_ids = [2, 5]) == [1, 3, 4, 6, 7, 8, 9, 10]
    @test hasmethod(eligible_sortition_pool, Tuple{Any})
    panel = draw_triage_panel(eligible_sortition_pool(1:50), 42)
    @test length(panel) == TRIAGE_PANEL_SIZE && allunique(panel)
    @test panel == draw_triage_panel(eligible_sortition_pool(1:50), 42)   # reproducible from public seed

    # ---- Beacon RNG determinism ----------------------------------------------------------------------
    r1 = BeaconRNG(7); r2 = BeaconRNG(7)
    @test [Simone.next_unit!(r1) for _ in 1:5] == [Simone.next_unit!(r2) for _ in 1:5]
    @test all(0.0 <= Simone.next_unit!(r1) < 1.0 for _ in 1:1000)

    # ---- Intake pipeline (N = 300, need = 6 co-signers, fast lane = 30) ------------------------------
    N = 300
    reg = [
        Petition(1, 10, "Repair the north cistern pump", 0, collect(11:16)),         # exactly 6 -> pool
        Petition(2, 20, "  repair the NORTH cistern   pump ", 1, collect(21:23)),    # duplicate of 1 -> merged
        Petition(3, 30, "Open a seed library", 0, collect(31:33)),                   # 3 co-signers -> below
        Petition(4, 40, "", 0, collect(41:50)),                                      # form fail
        Petition(5, 60, "Extend the clinic hours", 0, collect(61:95)),               # 35 -> fast lane
        Petition(6, 100, "Plant a hedge corridor", 0, collect(101:110)),             # pool
        Petition(7, 120, "Old request", -20, collect(121:130)),                      # expired from pool
    ]
    res = petition_intake(reg, N, 3; week = 2, seed = 20261030)
    @test res.cosigners_required == 6 && res.fast_lane_threshold == 30
    @test res.status[2] == :merged && res.merged_into[2] == 1
    @test res.valid_cosigners[1] == 10                # 6 + 3 merged co-signers + the duplicate's author
    @test res.status[3] == :below_threshold
    @test res.status[4] == :format_returned
    @test res.status[7] == :expired
    @test res.fast_lane == [5]                        # fast lane is heard first
    @test res.agenda[1] == 5
    @test length(res.agenda) == 3
    @test Set(res.lottery) == Set([1, 6])             # only two pool petitions: both drawn
    @test all(res.status[id] == :scheduled for id in res.agenda)
    # Register is unfiltered: every petition has a status, nothing is deleted.
    @test Set(keys(res.status)) == Set(p.id for p in reg)
    # Determinism
    @test petition_intake(reg, N, 3; week = 2, seed = 20261030).agenda == res.agenda
    # Unused slots stay unused
    @test length(petition_intake(reg, N, 10; week = 2, seed = 1).agenda) == 3
    # Already scheduled petitions are not drawn again
    res_b = petition_intake(reg, N, 3; week = 2, seed = 5, scheduled_ids = [5])
    @test res_b.status[5] == :already_scheduled && !(5 in res_b.agenda)

    # ---- Quadratic allowance: at most 3 endorsements per person per quarter -------------------------
    # Citizen 200 authors 1 petition and tries to co-sign 4 more: only the first 2 co-signatures count.
    spam = [Petition(100 + i, 200 + i, "Action $i", 0, vcat(200, collect(300 - 6i:300 - 6i + 5))) for i in 1:4]
    own = Petition(99, 200, "Own action", 0, Int[])
    rq = petition_intake(vcat([own], spam), N, 10; week = 0, seed = 3)
    void_200 = [pid for (c, pid) in rq.void_endorsements if c == 200]
    @test void_200 == [103, 104]                     # 3rd and 4th co-signatures void (k^2 > 9)

    # ---- Flooding faction cannot crowd out organic petitions (distinct-support weighting) -----------
    # A 10% faction (30 people, ids 1-30) files 30 petitions, each co-signed by the same faction members.
    # With 3 endorsements each, the faction holds 90 valid endorsements; each pool petition needs 6 valid
    # co-signers, so at most 90 / 6 = 15 faction petitions can reach the pool, whatever the filing pattern.
    faction = collect(1:30)
    flood = Petition[]
    for k in 1:30
        author = faction[k]
        cos = [faction[mod1(k + j, 30)] for j in 1:6]
        push!(flood, Petition(1000 + k, author, "Faction demand $k", 0, cos))
    end
    organic = [Petition(2000 + k, 30 + 20k, "Organic need $k", 0, collect(31 + 20k:36 + 20k)) for k in 1:4]
    rf = petition_intake(vcat(flood, organic), N, 4; week = 0, seed = 11)
    faction_in_pool = count(id -> 1000 < id < 2000 && rf.status[id] in (:pool, :scheduled), keys(rf.status))
    @test faction_in_pool <= 15
    # Organic endorsers back one petition each (weight 7, undivided); faction weight is diluted on average.
    fw = [w for (id, w) in rf.weights if id < 2000]
    @test all(rf.weights[id] ≈ 7.0 for id in keys(rf.weights) if id > 2000)
    @test isempty(fw) || sum(fw) / length(fw) < 7.0
    # Average over seeds: organic petitions win a majority of the 4 slots despite being outnumbered.
    org_slots = sum(count(>(2000), petition_intake(vcat(flood, organic), N, 4; week = 0, seed = s).agenda)
                    for s in 1:200)
    @test org_slots / (200 * 4) > 0.5
end
