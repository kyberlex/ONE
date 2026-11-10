using Test
using Simone

# Regression: an adaptive step much longer than the bound time constant could straddle
# the capacity kink and land below capacity with retcode Success (found by
# examples/run_variable_solar_ensemble.jl, CV 0.2 run 567, day 229).
@testset "Adaptive step across the capacity kink" begin
    p = VillageParams(solar_daily_kwh = 1833.579656922367)
    # Battery filling at about +330 kWh/day; water and compute already full.
    u0 = VillageState(2860.556810696443, 300_000.0, 7.2474221249986e7, 7200.0)
    sol = solve_aggregate_ode(p, u0, (0.0, 1.0))
    @test isapprox(sol.u[end][1], p.battery_capacity_kwh; rtol = 1e-6)
    @test maximum(diff(sol.t)) <= p.bound_time_constant_day + 1e-12

    # Monotone fill on a surplus day: the battery never falls along the way.
    sol = solve_aggregate_ode(p, u0, (0.0, 1.0); saveat = 0.01)
    E = [u[1] for u in sol.u]
    @test all(diff(E) .>= -1e-6 * p.battery_capacity_kwh)
end
