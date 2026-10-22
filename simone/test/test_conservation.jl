using Test
using Simone

@testset "Thermodynamic & Mass Conservation Invariants" begin
    # 1. Closed Equilibrium Test: Inflow == Demand + Decay implies dS/dt == 0
    p = VillageParams(
        population = 100,
        solar_daily_kwh = 500.0,
        per_capita_kwh_day = 5.0,
        battery_loss_rate_day = 0.0,
        rain_daily_l = 15000.0,
        per_capita_water_day_l = 150.0,
        water_evap_loss_rate_day = 0.0,
        daily_harvest_kcal = 250000.0,
        per_capita_calories_day = 2500.0,
        caloric_spoilage_rate_day = 0.0,
        daily_compute_core_hours = 800.0,
        per_capita_compute_core_hours = 8.0
    )

    u0 = VillageState(1000.0, 50000.0, 10000000.0, 1000.0)
    sol = solve_aggregate_ode(p, u0, (0.0, 30.0))

    # At any point in time, state must equal initial state under exact balance
    u_end = sol(30.0)
    @test isapprox(u_end[1], u0.energy_kwh, atol=1e-3)
    @test isapprox(u_end[2], u0.water_l, atol=1e-3)
    @test isapprox(u_end[3], u0.calories_kcal, atol=1e-3)
    @test isapprox(u_end[4], u0.compute_core_hours, atol=1e-3)

    # 2. Strict Depletion Test: Zero inflows must strictly decrease stocks
    p_deplete = VillageParams(
        population = 300,
        solar_daily_kwh = 0.0,
        rain_daily_l = 0.0,
        daily_harvest_kcal = 0.0,
        daily_compute_core_hours = 0.0
    )

    u0_full = VillageState(2000.0, 100000.0, 20000000.0, 2000.0)
    sol_deplete = solve_aggregate_ode(p_deplete, u0_full, (0.0, 10.0))

    u_mid = sol_deplete(5.0)
    u_final = sol_deplete(10.0)

    @test u_mid[1] < u0_full.energy_kwh
    @test u_final[1] < u_mid[1]
    @test u_mid[2] < u0_full.water_l
    @test u_final[2] < u_mid[2]
    @test u_mid[3] < u0_full.calories_kcal
    @test u_final[3] < u_mid[3]
end
