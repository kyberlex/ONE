using Test
using Simone

@testset "Axtell Docking Equivalence Tests (Model A vs Model B)" begin
    params = VillageParams(
        population = 100,
        battery_capacity_kwh = 2000.0,
        water_cistern_capacity_l = 100_000.0,
        caloric_granary_capacity_kcal = 30_000_000.0,
        compute_capacity_core_hours = 2400.0,
        solar_daily_kwh = 600.0,
        rain_daily_l = 20_000.0,
        daily_harvest_kcal = 300_000.0,
        daily_compute_core_hours = 1200.0,
        per_capita_kwh_day = 5.0,
        per_capita_water_day_l = 150.0,
        per_capita_calories_day = 2500.0,
        per_capita_compute_core_hours = 8.0,
        battery_loss_rate_day = 0.001,
        water_evap_loss_rate_day = 0.002,
        caloric_spoilage_rate_day = 0.0005
    )

    u0 = VillageState(1000.0, 50_000.0, 15_000_000.0, 1000.0)

    # Run docking benchmark over a 14-day horizon
    result = run_docking_benchmark(params, u0, 14.0; dt_abm=0.1, tolerance=0.05)

    @test length(result.time_points) > 10
    @test result.is_docked == true
    @test result.max_relative_error <= 0.05
end
