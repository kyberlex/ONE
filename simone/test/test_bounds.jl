using Test
using Simone

# The aggregate ODE must keep every stock inside [0, capacity] by itself, without the
# comparison code clamping its output afterwards (issue #14).
@testset "Stock bounds (aggregate ODE)" begin
    u0 = VillageState(1500.0, 150_000.0, 45_000_000.0, 3600.0)
    scenarios = (
        default = VillageParams(),                                            # surplus: stocks fill up
        deficit = VillageParams(solar_daily_kwh = 1200.0, rain_daily_l = 40_000.0),  # energy and water run out
    )

    for (name, p) in pairs(scenarios)
        caps = (p.battery_capacity_kwh, p.water_cistern_capacity_l,
                p.caloric_granary_capacity_kcal, p.compute_capacity_core_hours)
        sol = solve_aggregate_ode(p, u0, (0.0, 30.0); saveat = 0.05)
        @testset "$name" begin
            for k in 1:4
                x = [u[k] for u in sol.u]
                @test minimum(x) >= -1e-3 * caps[k]
                @test maximum(x) <= caps[k] * (1 + 1e-3)
            end
        end
    end

    # Surplus case: once full, both models sit at capacity; docking passes without clamping.
    r = run_docking_benchmark(scenarios.default, u0, 30.0; dt_abm = 0.05, tolerance = 0.02)
    @test r.is_docked
    @test r.max_relative_error < 0.01

    # Deficit case: the ODE stays at zero while the ABM, which records its stock after
    # adding one step of inflow, reads inflow * dt. The remaining gap is exactly that
    # sampling artefact and shrinks linearly with the ABM step.
    p = scenarios.deficit
    for dt in (0.05, 0.01)
        r = run_docking_benchmark(p, u0, 30.0; dt_abm = dt, tolerance = 0.05)
        @test isapprox(r.ode_energy[end], 0.0; atol = 1e-2)
        @test isapprox(r.abm_energy[end], p.solar_daily_kwh * dt; rtol = 1e-6)
        @test isapprox(r.max_relative_error, p.solar_daily_kwh * dt / p.battery_capacity_kwh; rtol = 1e-3)
    end
end
