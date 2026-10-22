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

    props = abm_model.properties
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

        push!(ode_E, u_ode[1])
        push!(ode_W, u_ode[2])
        push!(ode_C, u_ode[3])
        push!(ode_P, u_ode[4])

        # Relative error against non-zero baselines
        err_E = abs(u_ode[1] - abm_E[i]) / max(1.0, params.battery_capacity_kwh)
        err_W = abs(u_ode[2] - abm_W[i]) / max(1.0, params.water_cistern_capacity_l)
        err_C = abs(u_ode[3] - abm_C[i]) / max(1.0, params.caloric_granary_capacity_kcal)
        err_P = abs(u_ode[4] - abm_P[i]) / max(1.0, params.compute_capacity_core_hours)

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
