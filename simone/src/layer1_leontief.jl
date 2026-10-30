"""
    layer1_leontief.jl

Layer 1: Technical-Productive Networks, Leontief Input-Output Balances & Weibull MTBF Wear (`simone-specs.md` §2.2).
Implements:
  1. Hawkins-Simon thermodynamic viability check (`check_hawkins_simon`) and gross output solver `x = (I - A)^(-1) * d`
  2. Non-monetary lexicographic allocation operator (`L_min`, Constitution Art. 3.1.5): scalar shortcut and a
     matrix-aware method that charges each tier its full gross requirement `(I - A)^(-1) d` (SIM-QA-10)
  3. Tier 1 Autarkic Closure audit (`autarkic_closure_audit`, Art. 3.1.6) with reserve-gap composition (Art. 3.5.2)
  4. Weibull MTBF instantaneous hazard rate `h(t)` and cumulative survival probability `R(t)` for physical machinery

Pillar Alignment: Pillar 1 (Biophysical & Leontief Economics)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

"""
    check_hawkins_simon(A::AbstractMatrix{<:Real})

Verifies the Hawkins-Simon thermodynamic viability conditions on a physical input-output matrix `A`:
1. All leading principal minors of `(I - A)` are strictly positive.
2. Spectral radius `ρ(A) < 1.0` (no sector consumes more embodied physical exergy/mass than it yields).
Returns `(viable = Bool, determinant = Float64, spectral_radius = Float64)`.
"""
function check_hawkins_simon(A::AbstractMatrix{<:Real})
    n = size(A, 1)
    size(A, 2) == n || throw(DimensionMismatch("Leontief matrix A must be square."))
    I_minus_A = Matrix{Float64}(I, n, n) .- Float64.(A)

    all_minors_pos = true
    for k in 1:n
        if det(@view I_minus_A[1:k, 1:k]) <= 0.0
            all_minors_pos = false
            break
        end
    end
    vals = eigvals(Float64.(A))
    rho = maximum(abs.(vals))
    return (viable = all_minors_pos && (rho < 1.0), determinant = det(I_minus_A), spectral_radius = rho)
end

"""
    solve_leontief_gross_output(A::AbstractMatrix, d::AbstractVector)

Solves `(I - A) * x = d` for total physical gross output `x` (in physical units: `kWh`, `L`, `kcal`, `core-hours`).
Throws an `ArgumentError` if the Hawkins-Simon viability condition is violated (negative output required).

# Open Proof-of-Work Hook (`PoW 1A`):
Expand `simone/data/leontief_baseline_matrix.json` from 4×4 to an 8×8 or 12×12 disaggregated physical matrix
and verify `check_hawkins_simon(A).viable == true`.
"""
function solve_leontief_gross_output(A::AbstractMatrix{<:Real}, d::AbstractVector{<:Real})
    n = size(A, 1)
    size(A, 2) == n || throw(DimensionMismatch("Leontief matrix A must be square."))
    length(d) == n || throw(DimensionMismatch("Demand vector d must match dimension of A."))

    I_minus_A = Matrix{Float64}(I, n, n) .- Float64.(A)
    x = I_minus_A \ Float64.(d)
    if any(xi -> xi < -1e-9, x)
        throw(ArgumentError("Hawkins-Simon thermodynamic viability violated: (I - A)^(-1) * d produced negative physical output."))
    end
    return max.(x, 0.0)
end

"""
    lexicographic_allocate(available_stock::Real, tier1_demand::Real, tier2_demand::Real, tier3_demand::Real)

Implements the non-monetary lexicographic operator `L_min` (Constitution Art. 3.1.5):
Tier 1 (unconditional biological survival baseline) is satisfied 100% before any single unit is allocated
to Tier 2 (civic/FabLab infrastructure) or Tier 3 (discretionary cultural/exploratory projects).

Scalar shortcut for a single stock with no inter-industry coupling. It under-counts Tier 1 requirements whenever
the good is also an intermediate input (SIM-QA-10); use the matrix method
`lexicographic_allocate(A, capacity, d1, d2, d3)` for any multi-sector economy.
"""
function lexicographic_allocate(available_stock::Real, tier1_demand::Real, tier2_demand::Real, tier3_demand::Real)
    rem = max(0.0, Float64(available_stock))
    alloc_t1 = min(rem, max(0.0, Float64(tier1_demand)))
    rem -= alloc_t1

    alloc_t2 = min(rem, max(0.0, Float64(tier2_demand)))
    rem -= alloc_t2

    alloc_t3 = min(rem, max(0.0, Float64(tier3_demand)))
    return (tier1 = alloc_t1, tier2 = alloc_t2, tier3 = alloc_t3, unallocated = rem - alloc_t3)
end

"""
    leontief_inverse(A::AbstractMatrix{<:Real})

Returns `L = (I - A)^(-1)` after checking Hawkins-Simon viability. Throws `ArgumentError` if `A` is not viable
or if `L` has a materially negative entry.
"""
function leontief_inverse(A::AbstractMatrix{<:Real})
    hs = check_hawkins_simon(A)
    hs.viable || throw(ArgumentError("Hawkins-Simon viability violated (spectral radius $(hs.spectral_radius))."))
    n = size(A, 1)
    L = inv(Matrix{Float64}(I, n, n) .- Float64.(A))
    minimum(L) < -1e-9 && throw(ArgumentError("Leontief inverse has negative entries."))
    return max.(L, 0.0)
end

# Largest uniform fraction alpha of final demand f such that L*(alpha f) <= cap. Returns (alpha, req = L f).
function _max_uniform_fraction(L::AbstractMatrix{Float64}, f::AbstractVector{Float64}, cap::AbstractVector{Float64})
    req = L * f
    alpha = Inf
    for j in eachindex(req)
        req[j] > 1e-12 && (alpha = min(alpha, max(cap[j], 0.0) / req[j]))
    end
    return (alpha = alpha, req = req)
end

"""
    lexicographic_allocate(A::AbstractMatrix, capacity::AbstractVector, d_tier1, d_tier2, d_tier3)

Matrix-aware lexicographic operator `L_min` (Constitution Art. 3.1.5), replacing the scalar shortcut flagged by
SIM-QA-10. Each tier's demand is a final-demand *vector*; its true requirement is the gross output `L d`
(`L = (I - A)^(-1)`), i.e. it includes all intermediate inputs.

Allocation order:
1. Tier 1 receives the largest uniform fraction `α₁ ≤ 1` of `d_tier1` with `L(α₁ d_tier1) ≤ capacity`.
2. Only if `α₁ == 1`, Tier 2 receives the largest `α₂ ≤ 1` within the residual capacity; then Tier 3 likewise.

Uniform scaling inside a tier is a conservative rationing rule (it is exact for the Tier 1 full-fulfilment
test, which is the constitutional criterion). Returns a NamedTuple with fractions, delivered final goods,
gross output used per tier, residual capacity, and the binding sectors of the first unmet tier.
"""
function lexicographic_allocate(A::AbstractMatrix{<:Real}, capacity::AbstractVector{<:Real},
                                d_tier1::AbstractVector{<:Real}, d_tier2::AbstractVector{<:Real},
                                d_tier3::AbstractVector{<:Real})
    n = size(A, 1)
    for v in (capacity, d_tier1, d_tier2, d_tier3)
        length(v) == n || throw(DimensionMismatch("All vectors must match the dimension of A ($n)."))
    end
    L = leontief_inverse(A)
    rem = max.(Float64.(capacity), 0.0)
    fractions = zeros(3)
    delivered = Vector{Vector{Float64}}(undef, 3)
    gross = Vector{Vector{Float64}}(undef, 3)
    binding = Int[]
    blocked = false
    for (t, d) in enumerate((d_tier1, d_tier2, d_tier3))
        dt = max.(Float64.(d), 0.0)
        if blocked
            delivered[t] = zeros(n); gross[t] = zeros(n)
            continue
        end
        r = _max_uniform_fraction(L, dt, rem)
        a = min(1.0, r.alpha)
        fractions[t] = isfinite(a) ? a : 1.0
        delivered[t] = fractions[t] .* dt
        gross[t] = fractions[t] .* r.req
        rem = max.(rem .- gross[t], 0.0)
        if fractions[t] < 1.0 - 1e-12
            # strict lexicographic order: lower tiers receive nothing while a higher tier is unmet
            binding = [j for j in 1:n if r.req[j] > 1e-12 && rem[j] <= 1e-9 * max(1.0, r.req[j])]
            blocked = true
        end
    end
    return (tier1_fraction = fractions[1], tier2_fraction = fractions[2], tier3_fraction = fractions[3],
            tier1_delivered = delivered[1], tier2_delivered = delivered[2], tier3_delivered = delivered[3],
            tier1_gross = gross[1], tier2_gross = gross[2], tier3_gross = gross[3],
            unallocated_capacity = rem, binding_sectors = binding)
end

"""
    load_leontief_model(path::AbstractString)

Loads a SIMONE Leontief JSON (v1 12-sector or v2 14-sector schema) into a NamedTuple:
`ids, names, units, tiers, reserve_form, A, d, population, import_dependence, capacity, R, resource_ids,
resource_ceiling`. Fields absent from the file (e.g. capacity in v1) are returned as `nothing`.
"""
function load_leontief_model(path::AbstractString)
    j = JSON3.read(read(path, String))
    ids = [String(s.id) for s in j.sectors]
    n = length(ids)
    A = reduce(vcat, [permutedims(Float64.(collect(r))) for r in j.technical_coefficients_matrix_A.rows])
    size(A) == (n, n) || throw(DimensionMismatch("Matrix A is $(size(A)) but $n sectors are declared."))
    tiers = [Int(s.lexicographic_tier) for s in j.sectors]
    rform = [Symbol(String(get(s, :reserve_form, "unspecified"))) for s in j.sectors]
    pc = haskey(j, :per_capita_daily_final_demand) ? j.per_capita_daily_final_demand : j.per_capita_daily_tier1_baseline
    N = Float64(pc.population_n)
    d = [Float64(get(pc, Symbol(id), 0.0)) * N for id in ids]
    vec_or_nothing(key) = haskey(j, key) ? [Float64(get(j[key], Symbol(id), 0.0)) for id in ids] : nothing
    m = vec_or_nothing(:import_dependence_m)
    cap = vec_or_nothing(:installed_capacity_per_day)
    R = nothing; rids = String[]; rceil = nothing
    if haskey(j, :primary_resources)
        res = j.primary_resources.resources
        rids = [String(r.id) for r in res]
        R = zeros(length(res), n)
        for (k, r) in enumerate(res), (i, id) in enumerate(ids)
            R[k, i] = Float64(get(r.coefficients, Symbol(id), 0.0))
        end
        rceil = [Float64(r.ceiling_per_day) for r in res]
    end
    return (ids = ids, names = [String(s.name) for s in j.sectors], units = [String(s.unit) for s in j.sectors],
            tiers = tiers, reserve_form = rform, A = A, d = d, population = N, import_dependence = m,
            capacity = cap, R = R, resource_ids = rids, resource_ceiling = rceil)
end

"""
    autarkic_closure_audit(A, tier1_demand, installed_capacity; import_dependence = zeros,
                           R = nothing, resource_ceiling = nothing, reserve_form = nothing,
                           sector_ids = nothing, resource_ids = nothing,
                           target_margin = 0.0, reserve_months = 12)

Tier 1 Autarkic Closure audit (Constitution Art. 3.1.6) with reserve-gap composition (Art. 3.5.2).

Test performed (static, per day):
- **External inputs at zero:** local capacity `c = installed_capacity .* (1 .- import_dependence)`.
- **Full Tier 1 demand incl. intermediate inputs:** requirement `q = (I - A)^(-1) * tier1_demand`.
  Because `L ≥ 0`, any feasible `x ≥ 0` with `(I - A)x ≥ f₁` satisfies `x ≥ q`, so the test `q ≤ c` is exact.
- **Supply chain:** every sector with `q_j > 0` directly or indirectly supplies Tier 1 and is audited,
  whatever its own tier tag.
- **Local primary resources (optional):** `R q ≤ resource_ceiling`.

Returns a NamedTuple:
- `feasible` — `true` iff every audited sector and resource has margin `≥ target_margin`;
- `reserve_margin` — published margin `min_j (c_j - q_j)/q_j` over audited sectors and resources;
- `alpha` — largest deliverable uniform fraction of Tier 1 demand (`≥ 1` means fully met);
- `supply_chain`, `binding_sectors`, `binding_resources` (ids if given, else indices);
- `requirement`, `local_capacity`, `sector_margin`, `daily_gap` (per sector, gap to `target_margin`);
- `reserve_gap` — one entry per sector with a gap: `(sector, form, daily_gap, horizon_quantity)`, where
  `form ∈ (:storable_stock, :spare_parts, :redundant_capacity)` and `horizon_quantity` is the stock (or the
  capacity-days of output kept running by spare parts) needed for `reserve_months`; for
  `:redundant_capacity` it is the additional import-free installed capacity per day;
- `reserve_by_form` — the same gaps grouped by form;
- `resource_overshoot` — per resource, local overshoot beyond the ceiling (cannot be fixed by reserves of
  capacity; a primary-resource overshoot is reported separately because only storable stocks bridge it).

Limitations: single-period, no seasonality, no Weibull decay of capacity during the reserve horizon,
uniform rationing. Spare-part quantities are expressed in sector output units, not a bill of materials.
"""
function autarkic_closure_audit(A::AbstractMatrix{<:Real}, tier1_demand::AbstractVector{<:Real},
                                installed_capacity::AbstractVector{<:Real};
                                import_dependence::Union{Nothing,AbstractVector{<:Real}} = nothing,
                                R::Union{Nothing,AbstractMatrix{<:Real}} = nothing,
                                resource_ceiling::Union{Nothing,AbstractVector{<:Real}} = nothing,
                                reserve_form::Union{Nothing,AbstractVector{Symbol}} = nothing,
                                sector_ids::Union{Nothing,AbstractVector{<:AbstractString}} = nothing,
                                resource_ids::Union{Nothing,AbstractVector{<:AbstractString}} = nothing,
                                target_margin::Real = 0.0, reserve_months::Real = 12)
    n = size(A, 1)
    length(tier1_demand) == n || throw(DimensionMismatch("tier1_demand must have length $n."))
    length(installed_capacity) == n || throw(DimensionMismatch("installed_capacity must have length $n."))
    m = import_dependence === nothing ? zeros(n) : Float64.(import_dependence)
    length(m) == n || throw(DimensionMismatch("import_dependence must have length $n."))
    all(x -> 0.0 <= x <= 1.0, m) || throw(ArgumentError("import_dependence entries must lie in [0, 1]."))
    (R === nothing) == (resource_ceiling === nothing) ||
        throw(ArgumentError("R and resource_ceiling must be given together."))
    (12 <= reserve_months <= 24) || @warn "Art. 3.5.2 reserve horizon is 12–24 months; got $reserve_months."
    label(i) = sector_ids === nothing ? i : sector_ids[i]
    rlabel(k) = resource_ids === nothing ? k : resource_ids[k]
    form(i) = reserve_form === nothing ? :redundant_capacity : reserve_form[i]

    L = leontief_inverse(A)
    f1 = max.(Float64.(tier1_demand), 0.0)
    q = L * f1
    c = max.(Float64.(installed_capacity), 0.0) .* (1.0 .- m)       # external inputs set to zero
    tol = 1e-12
    chain = [i for i in 1:n if q[i] > tol]
    tm = Float64(target_margin)
    margin = [q[i] > tol ? (c[i] - q[i]) / q[i] : Inf for i in 1:n]
    gap = [q[i] > tol ? max(0.0, (1.0 + tm) * q[i] - c[i]) : 0.0 for i in 1:n]
    alpha = isempty(chain) ? Inf : minimum(c[i] / q[i] for i in chain)

    rmargin = Float64[]; overshoot = Float64[]; rbinding = Any[]
    if R !== nothing
        size(R, 2) == n || throw(DimensionMismatch("R must have $n columns."))
        use = Float64.(R) * q
        ceil_r = Float64.(resource_ceiling)
        rmargin = [use[k] > tol ? (ceil_r[k] - use[k]) / use[k] : Inf for k in eachindex(use)]
        overshoot = [max(0.0, (1.0 + tm) * use[k] - ceil_r[k]) for k in eachindex(use)]
        rbinding = [rlabel(k) for k in eachindex(use) if rmargin[k] < tm - 1e-12]
        alpha = min(alpha, minimum((use[k] > tol ? ceil_r[k] / use[k] : Inf) for k in eachindex(use)))
    end

    all_margins = vcat([margin[i] for i in chain], rmargin)
    reserve_margin = isempty(all_margins) ? Inf : minimum(all_margins)
    binding = [label(i) for i in chain if margin[i] < tm - 1e-12]
    feasible = isempty(binding) && isempty(rbinding)

    days = Float64(reserve_months) * 365.0 / 12.0
    entries = NamedTuple[]
    for i in chain
        gap[i] > 0 || continue
        fm = form(i)
        qty = fm === :redundant_capacity ? gap[i] : gap[i] * days
        push!(entries, (sector = label(i), form = fm, daily_gap = gap[i], horizon_quantity = qty))
    end
    by_form = Dict{Symbol,Vector{NamedTuple}}()
    for e in entries
        push!(get!(by_form, e.form, NamedTuple[]), e)
    end
    return (feasible = feasible, reserve_margin = reserve_margin, alpha = alpha,
            supply_chain = [label(i) for i in chain], binding_sectors = binding, binding_resources = rbinding,
            requirement = q, local_capacity = c, sector_margin = margin, daily_gap = gap,
            reserve_gap = entries, reserve_by_form = by_form, resource_margin = rmargin,
            resource_overshoot = overshoot, reserve_months = Float64(reserve_months))
end

"""
    autarkic_closure_audit(model::NamedTuple; kwargs...)

Convenience method for a model returned by `load_leontief_model` (needs `capacity`). Tier 1 demand is the
model's final demand restricted to sectors tagged `lexicographic_tier == 1`.
"""
function autarkic_closure_audit(model::NamedTuple; kwargs...)
    model.capacity === nothing && throw(ArgumentError("Model has no installed_capacity_per_day vector."))
    f1 = model.d .* (model.tiers .== 1)
    return autarkic_closure_audit(model.A, f1, model.capacity;
                                  import_dependence = model.import_dependence, R = model.R,
                                  resource_ceiling = model.resource_ceiling, reserve_form = model.reserve_form,
                                  sector_ids = model.ids,
                                  resource_ids = isempty(model.resource_ids) ? nothing : model.resource_ids,
                                  kwargs...)
end

"""
    weibull_hazard_rate(operating_hours::Real, shape_k::Real, scale_lambda::Real)

Computes the instantaneous Weibull component failure hazard rate:
`h(t) = (k / λ) * (t / λ)^(k - 1)` (`hours⁻¹`).
"""
function weibull_hazard_rate(operating_hours::Real, shape_k::Real, scale_lambda::Real)
    t = max(0.0, Float64(operating_hours))
    k = Float64(shape_k)
    lam = Float64(scale_lambda)
    return (k / lam) * ((t / lam) ^ (k - 1.0))
end

"""
    weibull_survival_prob(operating_hours::Real, shape_k::Real, scale_lambda::Real)

Computes the cumulative survival reliability `R(t) = exp(-(t / λ)^k)` in `[0.0, 1.0]`.

# Open Proof-of-Work Hook (`PoW 1C`):
Couple `1 - R(t)` to closed-loop scrap recovery mass balance and FabLab CNC spare-part remanufacturing energy demand.
"""
function weibull_survival_prob(operating_hours::Real, shape_k::Real, scale_lambda::Real)
    t = max(0.0, Float64(operating_hours))
    k = Float64(shape_k)
    lam = Float64(scale_lambda)
    return exp(-((t / lam) ^ k))
end
