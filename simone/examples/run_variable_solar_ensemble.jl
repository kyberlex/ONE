#!/usr/bin/env julia
"""
    run_variable_solar_ensemble.jl

Does the ABM ensemble mean still dock with the aggregate ODE when daily solar varies?

Since the ODE limits flows at the stock bounds (`bounded_net_rate`), the model is not
linear: a full battery spills surplus and an empty one cannot go below zero. With a
random daily solar input, the mean of many ABM runs need not match the ODE fed with the
mean input (Jensen's inequality), and that part of the gap should not shrink with more
runs.

For each variability scenario the script runs N ABM replicates, each with its own seeded
daily solar trace (Gamma-distributed, mean 1800 kWh/day, optional day-to-day persistence),
and compares three references:
  (a) ODE with the mean input (constant 1800 kWh/day),
  (b) ODE driven by the same daily trace as each ABM run (piecewise constant per day),
  (c) the ABM ensemble mean.
Both models come from the package unchanged; only `solar_daily_kwh` is swapped each day.

Usage:
    julia --project=simone simone/examples/run_variable_solar_ensemble.jl [N_max] [days]
"""

using Pkg
Pkg.activate(joinpath(@__DIR__, ".."))

using Simone
using Agents: abmproperties
using Distributions: Gamma, Normal, cdf, quantile
using Random
using Statistics
using Printf

const MEAN_SOLAR = 1800.0
const DT_ABM = 0.05
const BASE_SEED = 20261118
const U0 = VillageState(1500.0, 150_000.0, 45_000_000.0, 3600.0)
const BURN_IN_DAYS = 30           # statistics use days after the initial fill-up

# (label, coefficient of variation of daily solar, lag-1 persistence of the weather)
const SCENARIOS = [
    ("CV 0.2, iid", 0.2, 0.0),
    ("CV 0.4, iid", 0.4, 0.0),
    ("CV 0.6, iid", 0.6, 0.0),
    ("CV 0.4, rho 0.7", 0.4, 0.7),
]

"""Daily solar trace: Gamma marginal (mean `MEAN_SOLAR`, given CV) through a Gaussian AR(1) copula."""
function solar_trace(rng, days, cv, rho)
    g = Gamma(1 / cv^2, MEAN_SOLAR * cv^2)
    z = randn(rng)
    trace = Vector{Float64}(undef, days)
    for d in 1:days
        d > 1 && (z = rho * z + sqrt(1 - rho^2) * randn(rng))
        trace[d] = quantile(g, cdf(Normal(), z))
    end
    return trace
end

with_solar(p::VillageParams, s) = VillageParams(; (k => getfield(p, k) for k in fieldnames(VillageParams) if k != :solar_daily_kwh)..., solar_daily_kwh = s)

"""
ABM run on a daily trace. Returns end-of-day battery and unmet energy per day.
Identical agents draw in turn, each clamped at zero, so the total drawn in a step is
min(stock, demand * dt); unmet demand is the rest.
"""
function run_abm(base, trace)
    model = initialize_village_abm(base, U0; dt_days = DT_ABM)
    props = abmproperties(model)
    steps = round(Int, 1 / DT_ABM)
    demand_step = base.population * base.per_capita_kwh_day * DT_ABM
    E = zeros(length(trace)); unmet = zeros(length(trace))
    for (d, s) in enumerate(trace)
        props.params = with_solar(base, s)
        for _ in 1:steps
            unmet[d] += max(0.0, demand_step - props.current_state.energy_kwh)
            step_village_abm!(model, 1)
        end
        E[d] = props.current_state.energy_kwh
    end
    return E, unmet
end

"""
ODE solved one day at a time with that day's solar (reference b; with a constant
trace this is reference a). On a deficit day the battery only falls, nothing spills,
so unmet = demand + loss - solar - drawdown.
"""
function run_ode(base, trace; kwargs...)
    demand = base.population * base.per_capita_kwh_day
    u = Vector(U0)
    E = zeros(length(trace)); unmet = zeros(length(trace))
    for (d, s) in enumerate(trace)
        sol = solve_aggregate_ode(with_solar(base, s), VillageState(u), (0.0, 1.0); save_everystep = false, kwargs...)
        unew = sol.u[end]
        if s < demand
            loss = base.battery_loss_rate_day * 0.5 * (u[1] + unew[1])
            unmet[d] = max(0.0, demand + loss - s - (u[1] - unew[1]))
        end
        u = unew
        E[d] = u[1]
    end
    return E, unmet
end

function run_scenario(base, label, cv, rho, n_max, days, ode_a, unmet_a)
    abm_E = zeros(n_max, days); abm_unmet = zeros(n_max, days)
    odeb_E = zeros(n_max, days); odeb_unmet = zeros(n_max, days); solver_err = zeros(n_max)
    for i in 1:n_max
        trace = solar_trace(Xoshiro(BASE_SEED + i), days, cv, rho)  # same seed i in every scenario
        abm_E[i, :], abm_unmet[i, :] = run_abm(base, trace)
        odeb_E[i, :], odeb_unmet[i, :] = run_ode(base, trace)
        # solver check: the same ODE with a 25x smaller step cap
        fine, _ = run_ode(base, trace; dtmax = base.bound_time_constant_day / 25)
        solver_err[i] = maximum(abs.(odeb_E[i, :] .- fine))
    end

    cap = base.battery_capacity_kwh
    w = (BURN_IN_DAYS + 1):days
    demand = base.population * base.per_capita_kwh_day
    println("\n--- ", label, " ---")
    @printf("%6s | %11s %8s %10s | %11s | %10s | %12s %12s\n", "N", "gap vs (a)", "SE", "max|gap|",
            "gap vs ODEb", "|ABM-ODEb|", "short days", "unmet/day")
    for n in (50, 200, 800)
        n > n_max && continue
        # per-run time-averaged gap (ODE a minus ABM); its spread gives the standard error
        g = [mean(ode_a[w] .- abm_E[i, w]) for i in 1:n]
        mean_abm = vec(mean(abm_E[1:n, w]; dims = 1))
        mean_odeb = vec(mean(odeb_E[1:n, w]; dims = 1))
        per_run_dock = maximum(abs.(abm_E[1:n, w] .- odeb_E[1:n, w]))
        short = abm_unmet[1:n, w] .> 1e-6
        @printf("%6d | %8.1f kWh %8.2f %10.1f | %8.2f kWh | %10.2f | %11.2f%% %8.1f kWh\n", n,
                mean(g), std(g) / sqrt(n), maximum(abs.(ode_a[w] .- mean_abm)),
                mean(mean_odeb .- mean_abm), per_run_dock,
                100 * mean(short .& (unmet_a[w]' .<= 1e-6)), mean(abm_unmet[1:n, w]))
    end
    # same-trace check on shortage: does ODE (b) see the empty-battery days the ABM sees?
    sa = abm_unmet[:, w] .> 1e-6; sb = odeb_unmet[:, w] .> 0.5
    @printf("  share of run-days ABM short: %.2f%% | ODE(b) short: %.2f%% | runs with >=1 short day: %.1f%%\n",
            100 * mean(sa), 100 * mean(sb), 100 * mean(any(sa; dims = 2)))
    # |ABM-ODEb| is bounded by model differences near the bounds: one ABM step of flow when
    # empty (see test_bounds.jl), and up to tau * |solar - demand| when the ODE approaches
    # capacity over tau while the ABM clamps. The solver error below is separate.
    @printf("  ODE(b) solver error vs dtmax = tau/25: max %.2e kWh over all runs and days\n",
            maximum(solver_err))
    @printf("  unmet energy, ABM: %.3f%% of demand | ODE(b): %.3f%% | ODE(a): %.3f%%\n",
            100 * mean(abm_unmet[:, w]) / demand, 100 * mean(odeb_unmet[:, w]) / demand,
            100 * mean(unmet_a[w]) / demand)
    @printf("  mean battery: ODE(a) %.1f | ABM ensemble %.1f | ODE(b) ensemble %.1f kWh (cap %.0f)\n",
            mean(ode_a[w]), mean(abm_E[:, w]), mean(odeb_E[:, w]), cap)
end

function main()
    n_max = length(ARGS) >= 1 ? parse(Int, ARGS[1]) : 800
    days = length(ARGS) >= 2 ? parse(Int, ARGS[2]) : 365
    base = VillageParams()
    println("=========================================================================================")
    println(" SIMONE.JL — VARIABLE SOLAR: ABM ENSEMBLE vs AGGREGATE ODE (N up to $n_max, $days days)")
    println("=========================================================================================")
    @printf("solar mean %.0f kWh/day | demand %.0f | battery %.0f | dt_abm %.2f | seed %d | stats on days %d-%d\n",
            MEAN_SOLAR, base.population * base.per_capita_kwh_day, base.battery_capacity_kwh,
            DT_ABM, BASE_SEED, BURN_IN_DAYS + 1, days)
    ode_a, unmet_a = run_ode(base, fill(MEAN_SOLAR, days))
    @printf("ODE (a), constant mean input: battery %.1f kWh at day %d, unmet days %d\n",
            ode_a[end], days, count(>(1e-6), unmet_a))
    println("gap = ODE(a) - ABM, time-averaged; SE across runs; |ABM-ODEb| = worst same-trace deviation")
    for (label, cv, rho) in SCENARIOS
        run_scenario(base, label, cv, rho, n_max, days, ode_a, unmet_a)
    end
end

main()
