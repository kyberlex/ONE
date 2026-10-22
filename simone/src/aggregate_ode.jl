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
    village_ode_system!(du, u, p::VillageParams, t)

Differential equations governing the 4 physical stocks:
dE/dt = Solar - Demand - Loss
dW/dt = Rain - Demand - Loss
dC/dt = Harvest - Demand - Loss
dP/dt = ComputeGen - Demand
"""
function village_ode_system!(du, u, p::VillageParams, t)
    E = max(0.0, u[1])
    W = max(0.0, u[2])
    C = max(0.0, u[3])
    P = max(0.0, u[4])

    # Aggregate consumption demands
    demand_E = p.population * p.per_capita_kwh_day
    demand_W = p.population * p.per_capita_water_day_l
    demand_C = p.population * p.per_capita_calories_day
    demand_P = p.population * p.per_capita_compute_core_hours

    # Dissipation / decay
    loss_E = p.battery_loss_rate_day * E
    loss_W = p.water_evap_loss_rate_day * W
    loss_C = p.caloric_spoilage_rate_day * C

    # Net rates
    net_dE = p.solar_daily_kwh - demand_E - loss_E
    net_dW = p.rain_daily_l - demand_W - loss_W
    net_dC = p.daily_harvest_kcal - demand_C - loss_C
    net_dP = p.daily_compute_core_hours - demand_P

    # Capacity clipping on inflows when full
    if u[1] >= p.battery_capacity_kwh && net_dE > 0.0
        net_dE = 0.0
    end
    if u[2] >= p.water_cistern_capacity_l && net_dW > 0.0
        net_dW = 0.0
    end
    if u[3] >= p.caloric_granary_capacity_kcal && net_dC > 0.0
        net_dC = 0.0
    end
    if u[4] >= p.compute_capacity_core_hours && net_dP > 0.0
        net_dP = 0.0
    end

    du[1] = net_dE
    du[2] = net_dW
    du[3] = net_dC
    du[4] = net_dP
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
    solve_aggregate_ode(params::VillageParams, u0::VillageState, tspan::Tuple{Float64, Float64}; solver=Tsit5(), kwargs...)

Solves the aggregate single-village ODE model over tspan.
"""
function solve_aggregate_ode(params::VillageParams, u0::VillageState, tspan::Tuple{Float64, Float64}; solver=Tsit5(), kwargs...)
    prob = build_aggregate_ode_problem(params, u0, tspan)
    return solve(prob, solver; kwargs...)
end
