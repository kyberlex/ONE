"""
    docking.jl

Axtell (1996) Docking Benchmark between Model A (Aggregate ODE) and Model B (Agents.jl ABM).
Tests whether discrete micro-agents replicate continuous aggregate curves in the homogeneous limit.
"""

"""
    DockingResult

Metrics comparing ODE and ABM simulation trajectories over time.
"""
struct DockingResult
    time_points::Vector{Float64}
    ode_energy::Vector{Float64}
    abm_energy::Vector{Float64}
    ode_water::Vector{Float64}
    abm_water::Vector{Float64}
    ode_calories::Vector{Float64}
    abm_calories::Vector{Float64}
    ode_compute::Vector{Float64}
    abm_compute::Vector{Float64}
    max_relative_error::Float64
    is_docked::Bool
end

"""
    run_docking_benchmark(
        params::VillageParams,
        u0::VillageState,
        total_days::Float64;
        dt_abm::Float64 = 0.05,
        tolerance::Float64 = 0.02
    )

Executes Model A (continuous ODE) and Model B (discrete ABM) over identical initial
conditions and time horizons, comparing trajectories to evaluate numerical docking.
"""
function run_docking_benchmark(
    params::VillageParams,
    u0::VillageState,
    total_days::Float64;
    dt_abm::Float64 = 0.05,
    tolerance::Float64 = 0.02
)
    # 1. Solve Continuous Model A (ODE)
    tspan = (0.0, total_days)
    ode_sol = solve_aggregate_ode(params, u0, tspan; saveat=dt_abm)

    # 2. Run Discrete Model B (ABM)
    abm_model = initialize_village_abm(params, u0; dt_days=dt_abm)
    num_steps = round(Int, total_days / dt_abm)
    step_village_abm!(abm_model, num_steps)

    props = abmproperties(abm_model)
    t_abm = props.history_time
    abm_E = props.history_energy
    abm_W = props.history_water
    abm_C = props.history_calories
    abm_P = props.history_compute

    # 3. Align trajectories and evaluate relative errors
    ode_E = Float64[]
    ode_W = Float64[]
    ode_C = Float64[]
    ode_P = Float64[]

    max_err = 0.0

    for i in eachindex(t_abm)
        t_val = t_abm[i]
        u_ode = ode_sol(t_val)

        # Physical capacity clamping
        val_E = min(params.battery_capacity_kwh, max(0.0, u_ode[1]))
        val_W = min(params.water_cistern_capacity_l, max(0.0, u_ode[2]))
        val_C = min(params.caloric_granary_capacity_kcal, max(0.0, u_ode[3]))
        val_P = min(params.compute_capacity_core_hours, max(0.0, u_ode[4]))

        push!(ode_E, val_E)
        push!(ode_W, val_W)
        push!(ode_C, val_C)
        push!(ode_P, val_P)

        # Relative error against non-zero baselines
        err_E = abs(val_E - abm_E[i]) / max(1.0, params.battery_capacity_kwh)
        err_W = abs(val_W - abm_W[i]) / max(1.0, params.water_cistern_capacity_l)
        err_C = abs(val_C - abm_C[i]) / max(1.0, params.caloric_granary_capacity_kcal)
        err_P = abs(val_P - abm_P[i]) / max(1.0, params.compute_capacity_core_hours)

        step_max = max(err_E, err_W, err_C, err_P)
        if step_max > max_err
            max_err = step_max
        end
    end

    docked = max_err <= tolerance

    return DockingResult(
        t_abm,
        ode_E, abm_E,
        ode_W, abm_W,
        ode_C, abm_C,
        ode_P, abm_P,
        max_err,
        docked
    )
end
