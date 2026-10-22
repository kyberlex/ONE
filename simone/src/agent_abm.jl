"""
    agent_abm.jl

Model B: Discrete Multi-Agent Representation for Single-Village Model (Agents.jl).
In the homogeneous limit, N identical agents consume resources and replicate aggregate flows.
"""

"""
    Villager

Micro-agent representation of an individual resident in the single village.
"""
@agent struct Villager(NoSpaceAgent)
    metabolic_need_kcal::Float64
    hydration_need_l::Float64
    energy_draw_kwh::Float64
    compute_need_core_hours::Float64
    compliance_rate::Float64
end

"""
    VillageABMProperties

Global environment state tracked across agent decision cycles.
"""
mutable struct VillageABMProperties
    params::VillageParams
    current_state::VillageState
    dt_days::Float64
    current_time::Float64
    history_time::Vector{Float64}
    history_energy::Vector{Float64}
    history_water::Vector{Float64}
    history_calories::Vector{Float64}
    history_compute::Vector{Float64}
end

"""
    villager_step!(agent::Villager, model)

Discrete step for individual villager. In the homogeneous limit, villagers draw their
exact daily allocation proportional to dt.
"""
function villager_step!(agent::Villager, model)
    props = abmproperties(model)
    dt = props.dt_days
    # Each agent draws their demand for the interval dt
    draw_E = agent.energy_draw_kwh * dt * agent.compliance_rate
    draw_W = agent.hydration_need_l * dt * agent.compliance_rate
    draw_C = agent.metabolic_need_kcal * dt * agent.compliance_rate
    draw_P = agent.compute_need_core_hours * dt * agent.compliance_rate

    s = props.current_state
    props.current_state = VillageState(
        max(0.0, s.energy_kwh - draw_E),
        max(0.0, s.water_l - draw_W),
        max(0.0, s.calories_kcal - draw_C),
        max(0.0, s.compute_core_hours - draw_P)
    )
    return nothing
end

"""
    village_model_step!(model)

Global environmental step: applies physical inflows and decay over interval dt.
"""
function village_model_step!(model)
    props = abmproperties(model)
    p = props.params
    dt = props.dt_days
    s = props.current_state

    # Inflows over dt
    in_E = p.solar_daily_kwh * dt
    in_W = p.rain_daily_l * dt
    in_C = p.daily_harvest_kcal * dt
    in_P = p.daily_compute_core_hours * dt

    # Physical storage dissipation over dt
    loss_E = p.battery_loss_rate_day * s.energy_kwh * dt
    loss_W = p.water_evap_loss_rate_day * s.water_l * dt
    loss_C = p.caloric_spoilage_rate_day * s.calories_kcal * dt

    new_E = min(p.battery_capacity_kwh, max(0.0, s.energy_kwh + in_E - loss_E))
    new_W = min(p.water_cistern_capacity_l, max(0.0, s.water_l + in_W - loss_W))
    new_C = min(p.caloric_granary_capacity_kcal, max(0.0, s.calories_kcal + in_C - loss_C))
    new_P = min(p.compute_capacity_core_hours, max(0.0, s.compute_core_hours + in_P))

    props.current_state = VillageState(new_E, new_W, new_C, new_P)
    props.current_time += dt

    # Record history
    push!(props.history_time, props.current_time)
    push!(props.history_energy, new_E)
    push!(props.history_water, new_W)
    push!(props.history_calories, new_C)
    push!(props.history_compute, new_P)
    return nothing
end

"""
    initialize_village_abm(params::VillageParams, u0::VillageState; dt_days::Float64=1.0)

Instantiates the standard homogeneous Single-Village ABM with N identical villagers.
"""
function initialize_village_abm(params::VillageParams, u0::VillageState; dt_days::Float64=1.0)
    props = VillageABMProperties(
        params,
        u0,
        dt_days,
        0.0,
        [0.0],
        [u0.energy_kwh],
        [u0.water_l],
        [u0.calories_kcal],
        [u0.compute_core_hours]
    )

    model = StandardABM(
        Villager;
        properties = props,
        agent_step! = villager_step!,
        model_step! = village_model_step!
    )

    # Populate homogeneous agents
    for id in 1:params.population
        add_agent!(
            model;
            metabolic_need_kcal = params.per_capita_calories_day,
            hydration_need_l = params.per_capita_water_day_l,
            energy_draw_kwh = params.per_capita_kwh_day,
            compute_need_core_hours = params.per_capita_compute_core_hours,
            compliance_rate = 1.0
        )
    end

    return model
end

"""
    step_village_abm!(model, steps::Int)

Advances the ABM simulation by the specified number of discrete steps.
"""
function step_village_abm!(model, steps::Int)
    step!(model, steps)
    return model
end
