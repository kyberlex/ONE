"""
    aggregate_ode.jl

Model A: Continuous-Time Stock-Flow Dynamical System for Single-Village Model.
Models aggregate biophysical inflows, baseline metabolic demands, and physical losses.
"""

"""
    VillageParams

Parameter set defining the single village (Model A and Model B baseline).
All rates are normalized per day (t in days).
"""
Base.@kwdef struct VillageParams
    population::Int = 300

    # Stock capacities
    battery_capacity_kwh::Float64 = 3000.0
    water_cistern_capacity_l::Float64 = 300_000.0
    caloric_granary_capacity_kcal::Float64 = 90_000_000.0
    compute_capacity_core_hours::Float64 = 7200.0

    # Daily gross inflows
    solar_daily_kwh::Float64 = 1800.0             # e.g., 6 kWh/capita/day gross solar
    rain_daily_l::Float64 = 60_000.0              # 200 L/capita/day catchment
    daily_harvest_kcal::Float64 = 900_000.0       # 3000 kcal/capita/day harvest
    daily_compute_core_hours::Float64 = 3600.0    # 12 core-hours/capita/day

    # Daily baseline per-capita demands
    per_capita_kwh_day::Float64 = 5.0
    per_capita_water_day_l::Float64 = 150.0
    per_capita_calories_day::Float64 = 2500.0
    per_capita_compute_core_hours::Float64 = 8.0

    # Storage decay / dissipation coefficients (fraction per day)
    battery_loss_rate_day::Float64 = 0.001        # 0.1% per day self-discharge
    water_evap_loss_rate_day::Float64 = 0.002     # 0.2% per day evaporation
    caloric_spoilage_rate_day::Float64 = 0.0005   # 0.05% per day spoilage

    # Time constant (days) over which a stock can be emptied or filled at the bounds.
    # Outflow is capped at inflow + stock/τ and inflow at outflow + headroom/τ, so stocks
    # stay inside [0, capacity] (Sterman, Business Dynamics, "first-order control").
    # The ABM's per-step clamp is roughly the same rule with τ = dt_abm.
    bound_time_constant_day::Float64 = 0.05
end

"""
    VillageState

Physical stocks tracked in the single village:
- `energy_kwh`: Stored electrical/thermal exergy (kWh)
- `water_l`: Potable & irrigation water stock (L)
- `calories_kcal`: Granary/pantry food stock (kcal)
- `compute_core_hours`: Local compute buffer (core-hours)
"""
struct VillageState
    energy_kwh::Float64
    water_l::Float64
    calories_kcal::Float64
    compute_core_hours::Float64
end

VillageState(v::AbstractVector{<:Real}) = VillageState(v[1], v[2], v[3], v[4])
Base.Vector(s::VillageState) = [s.energy_kwh, s.water_l, s.calories_kcal, s.compute_core_hours]

"""
    bounded_net_rate(stock, capacity, inflow, demand, loss, τ)

Net rate of change for one stock that must stay inside `[0, capacity]`.

Outflow (demand plus loss) is capped at what is available: the current inflow plus
the stock drained over `τ`. Inflow is capped at what fits: the actual outflow plus
the remaining headroom filled over `τ`. Away from the bounds both caps are inactive
and the rate is simply `inflow - demand - loss`.

The stock is not clamped inside the formula. If a solver step lands slightly below
zero, outflow drops to zero and the stock refills at the inflow rate; slightly above
capacity, inflow drops to zero and the stock drains at the outflow rate. If that flow
is zero, the stock stays where it is, so a small overshoot never grows.
"""
@inline function bounded_net_rate(stock, capacity, inflow, demand, loss, τ)
    outflow = max(0.0, min(demand + loss, inflow + stock / τ))
    inflow_used = max(0.0, min(inflow, outflow + (capacity - stock) / τ))
    return inflow_used - outflow
end

"""
    village_ode_system!(du, u, p::VillageParams, t)

Differential equations governing the 4 physical stocks:
dE/dt = Solar - Demand - Loss
dW/dt = Rain - Demand - Loss
dC/dt = Harvest - Demand - Loss
dP/dt = ComputeGen - Demand

Each stock is kept inside `[0, capacity]` by `bounded_net_rate`: an empty stock can
only pass on what flows into it, and a full stock only accepts what flows out.
"""
function village_ode_system!(du, u, p::VillageParams, t)
    τ = p.bound_time_constant_day

    # Aggregate consumption demands
    demand_E = p.population * p.per_capita_kwh_day
    demand_W = p.population * p.per_capita_water_day_l
    demand_C = p.population * p.per_capita_calories_day
    demand_P = p.population * p.per_capita_compute_core_hours

    # Losses are proportional to the stock; a slightly negative solver value gives no loss.
    loss_E = p.battery_loss_rate_day * max(0.0, u[1])
    loss_W = p.water_evap_loss_rate_day * max(0.0, u[2])
    loss_C = p.caloric_spoilage_rate_day * max(0.0, u[3])

    du[1] = bounded_net_rate(u[1], p.battery_capacity_kwh, p.solar_daily_kwh, demand_E, loss_E, τ)
    du[2] = bounded_net_rate(u[2], p.water_cistern_capacity_l, p.rain_daily_l, demand_W, loss_W, τ)
    du[3] = bounded_net_rate(u[3], p.caloric_granary_capacity_kcal, p.daily_harvest_kcal, demand_C, loss_C, τ)
    du[4] = bounded_net_rate(u[4], p.compute_capacity_core_hours, p.daily_compute_core_hours, demand_P, 0.0, τ)
    return nothing
end

"""
    build_aggregate_ode_problem(params::VillageParams, u0::VillageState, tspan::Tuple{Float64, Float64})

Builds an ODEProblem instance from VillageParams and initial VillageState.
"""
function build_aggregate_ode_problem(params::VillageParams, u0::VillageState, tspan::Tuple{Float64, Float64})
    u0_vec = Vector(u0)
    return ODEProblem(village_ode_system!, u0_vec, tspan, params)
end

"""
    solve_aggregate_ode(params::VillageParams, u0::VillageState, tspan::Tuple{Float64, Float64};
                        solver=Tsit5(), reltol=1e-6, abstol=1e-6,
                        dtmax=params.bound_time_constant_day, kwargs...)

Solves the aggregate single-village ODE model over tspan.

The tolerances are tighter than the OrdinaryDiffEq defaults (1e-3 / 1e-6) because the
right-hand side has kinks at the stock bounds: with the defaults a stock can overshoot
its capacity by up to about 1.5%; at 1e-6 the overshoot stays around 1e-6.

The step is also capped at the bound time constant τ. While a stock fills at a constant
rate the solution is linear, the error estimate is near zero and the adaptive step keeps
growing; a step much longer than τ can then straddle the capacity kink, with some stages
filling and others draining, and the embedded error estimate does not notice. Seen with
Tsit5: battery at 2860.6 kWh, net +330 kWh/day, other stocks full, one 0.72-day step
ending at 2803.7 kWh instead of 3000 with retcode Success. Steps of at most τ resolve
the first-order control near the bounds.
"""
function solve_aggregate_ode(params::VillageParams, u0::VillageState, tspan::Tuple{Float64, Float64};
                             solver=Tsit5(), reltol=1e-6, abstol=1e-6,
                             dtmax=params.bound_time_constant_day, kwargs...)
    prob = build_aggregate_ode_problem(params, u0, tspan)
    return solve(prob, solver; reltol=reltol, abstol=abstol, dtmax=dtmax, kwargs...)
end
