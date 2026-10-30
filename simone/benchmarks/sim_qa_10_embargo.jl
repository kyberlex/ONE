#!/usr/bin/env julia
"""
    sim_qa_10_embargo.jl

SIM-QA-10 — Hawkins-Simon Viability Under Resource Embargo (Round 2 adversarial docket).

Reproduce (from the `simone/` directory):

    julia --project=. benchmarks/sim_qa_10_embargo.jl

Dependencies: LinearAlgebra (stdlib), Printf (stdlib), JSON3 (already in simone/Project.toml).

What this script does (all numbers are computed, none are hard-coded results):
  1. Verifies Hawkins-Simon conditions on the 12-sector and 4-sector matrices
     (leading principal minors of I-A, spectral radius of A, sign of the Leontief inverse).
  2. Computes baseline gross output x = (I-A)^-1 d.
  3. Runs the docket's *literal* proof requirement (50% cut of inputs / demand) and shows why it is
     tautological for any non-negative A with rho(A) < 1.
  4. Runs a substitution-penalty test (embargo forces less efficient local substitutes: A -> k*A).
  5. Runs a capacity-cap embargo model (imports are NOT represented in the matrix, so an embargo is modeled
     as a loss of sector capacity proportional to an ASSUMED import-dependence vector m), for embargo depths
     e in {0.30, 0.50, 0.60, 0.80}, and finds the maximum depth at which Tier 1 demand is fully satisfiable
     when all non-Tier-1 final demand is cut to zero (lexicographic L_min priority).
  6. Computes how long a staple-grain strategic reserve (Art. 3.5: 12-24 months) bridges the gap.

Key identity used: because L = (I-A)^-1 >= 0 elementwise, any x >= 0 with (I-A)x >= f satisfies x >= L f.
Hence a final-demand vector f is producible under capacity caps c if and only if L f <= c, and the largest
deliverable uniform fraction of f is alpha = min_j c_j / (L f)_j. No LP solver is needed.

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

using LinearAlgebra
using Printf
using JSON3

const DATA_DIR = joinpath(@__DIR__, "..", "data")

load_json(name) = JSON3.read(read(joinpath(DATA_DIR, name), String))
rows_to_matrix(rows) = reduce(vcat, [permutedims(Float64.(collect(r))) for r in rows])

fmt(v::Real) = abs(v) >= 1e5 || (abs(v) < 1e-3 && v != 0) ? @sprintf("%.4e", v) : @sprintf("%.4f", v)

# ---------------------------------------------------------------------------------------------
# 1. Hawkins-Simon
# ---------------------------------------------------------------------------------------------
function hawkins_simon_report(A, label)
    n = size(A, 1)
    IA = Matrix{Float64}(I, n, n) - A
    minors = [det(IA[1:k, 1:k]) for k in 1:n]
    rho = maximum(abs.(eigvals(A)))
    L = inv(IA)
    println("### Hawkins-Simon check: $label")
    println("- dimension: $(n)x$(n)")
    println("- spectral radius rho(A) = ", fmt(rho))
    println("- det(I-A) = ", fmt(det(IA)))
    println("- leading principal minors of (I-A): min = ", fmt(minimum(minors)),
            ", all > 0: ", all(>(0), minors))
    lmin = minimum(L)
    println("- min entry of L=(I-A)^-1 = ", abs(lmin) < 1e-12 ? "0 (numerical zero, |v| < 1e-12)" : fmt(lmin),
            " (non-negative: ", lmin >= -1e-12, ")")
    println("- max substitution penalty k* = 1/rho (A -> k*A stays viable for k < k*): ", fmt(1 / rho))
    println()
    return (rho = rho, L = L, minors = minors)
end

# ---------------------------------------------------------------------------------------------
# helpers for the capacity-cap embargo model
# ---------------------------------------------------------------------------------------------
"Largest uniform fraction of f deliverable under caps c; returns (alpha, argmin sector index)."
function max_fraction(L, f, c)
    req = L * f
    ratios = [req[j] > 1e-12 ? c[j] / req[j] : Inf for j in eachindex(req)]
    a, j = findmin(ratios)
    return (alpha = a, binding = j, req = req)
end

capacity(xbase, h, e, m) = xbase .* (1 + h) .* (1 .- e .* m)

"Bisection for the largest e in [0,1] at which f is fully producible (alpha >= 1)."
function max_depth(L, f, xbase, h, m; tol = 1e-7)
    max_fraction(L, f, capacity(xbase, h, 1.0, m)).alpha >= 1 && return 1.0
    max_fraction(L, f, capacity(xbase, h, 0.0, m)).alpha < 1 && return 0.0
    lo, hi = 0.0, 1.0
    while hi - lo > tol
        mid = (lo + hi) / 2
        max_fraction(L, f, capacity(xbase, h, mid, m)).alpha >= 1 ? (lo = mid) : (hi = mid)
    end
    return lo
end

"""
Minimum daily draw r (units of sector `s` final good, taken from storage) such that L(f - r e_s) <= c.
Returns (r, bridgeable::Bool, blocking_sector).
"""
function min_reserve_draw(L, f, c, s)
    req = L * f
    Ls = L[:, s]
    r = 0.0
    for j in eachindex(req)
        gap = req[j] - c[j]
        gap <= 1e-12 && continue
        if Ls[j] <= 1e-15
            return (r = Inf, bridgeable = false, blocking = j)
        end
        r = max(r, gap / Ls[j])
    end
    r > f[s] + 1e-9 && return (r = r, bridgeable = false, blocking = 0)
    return (r = r, bridgeable = true, blocking = 0)
end

# ---------------------------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------------------------
function main()
    j12 = load_json("leontief_12sector_matrix.json")
    A = rows_to_matrix(j12.technical_coefficients_matrix_A.rows)
    n = size(A, 1)
    ids = [String(s.id) for s in j12.sectors]
    tier = [Int(s.lexicographic_tier) for s in j12.sectors]
    pc = j12.per_capita_daily_tier1_baseline
    N = Float64(pc.population_n)
    d = [Float64(pc[Symbol(id)]) * N for id in ids]

    println("# SIM-QA-10 raw output (generated by simone/benchmarks/sim_qa_10_embargo.jl)\n")
    println("Julia ", VERSION, "\n")

    # ---- 1. Hawkins-Simon
    hs = hawkins_simon_report(A, "12-sector matrix")
    claimed = j12.hawkins_simon_verification
    println("- claimed in JSON: rho = $(claimed.spectral_radius_rho), det = $(claimed.determinant_I_minus_A)\n")
    L = hs.L

    # ---- 2. Baseline gross output
    x = L * d
    println("### Baseline gross output x = (I-A)^-1 d  (N = $(Int(N)), per day)\n")
    println("| idx | sector | tier (JSON) | final demand d | gross output x | intermediate share 1-d/x |")
    println("|---|---|---|---|---|---|")
    for i in 1:n
        @printf("| %d | %s | %d | %s | %s | %s |\n", i - 1, ids[i], tier[i], fmt(d[i]), fmt(x[i]),
                fmt(x[i] > 0 ? 1 - d[i] / x[i] : 0.0))
    end
    println("\nAll x >= 0: ", all(>=(0), x), "\n")

    # Structural audit
    zero_rows = [ids[i] for i in 1:n if all(==(0), A[i, :])]
    println("### Structural audit")
    println("- sectors never used as an input by any sector (zero rows): ", join(zero_rows, ", "))
    println("- primary-factor / import / abiotic-resource rows present in JSON: NONE (closed technology matrix only)")
    println("- Tier 3 sectors present: ", any(==(3), tier), "\n")

    # ---- 3. Literal docket test
    println("### Literal docket test (\"50% vector reduction in secondary inputs\")")
    x_half_d = L * (0.5 .* d)
    A_half = 0.5 .* A
    x_half_A = inv(Matrix{Float64}(I, n, n) - A_half) * d
    println("- (a) d -> 0.5 d: min x = ", fmt(minimum(x_half_d)), "; x scales exactly by 0.5: ",
            isapprox(x_half_d, 0.5 .* x))
    println("- (b) A -> 0.5 A: rho = ", fmt(maximum(abs.(eigvals(A_half)))), ", min x = ", fmt(minimum(x_half_A)))
    println("- Both pass trivially: for A >= 0 with rho(A) < 1, L = sum_k A^k >= 0, so x = L d >= 0 for every d >= 0.")
    println("  The literal proof requirement therefore cannot fail and carries no information about embargo resilience.\n")

    # ---- 4. Substitution penalty per row (embargo forces higher local input intensity of one good)
    println("### Substitution-penalty test (one input row i multiplied by k; k at which rho(A) reaches 1)")
    println("| row scaled | k* (rho = 1) |")
    println("|---|---|")
    for i in 1:n
        all(==(0), A[i, :]) && continue
        f(k) = (B = copy(A); B[i, :] .*= k; maximum(abs.(eigvals(B))))
        hi = 1.0
        while f(hi) < 1 && hi < 1e9
            hi *= 2
        end
        if f(hi) < 1
            @printf("| %s | > 1e9 (no loop through this row) |\n", ids[i])
            continue
        end
        lo = hi / 2 < 1 ? 1.0 : hi / 2
        for _ in 1:80
            mid = (lo + hi) / 2
            f(mid) < 1 ? (lo = mid) : (hi = mid)
        end
        @printf("| %s | %s |\n", ids[i], fmt(lo))
    end
    println()

    # ---- 5. Capacity-cap embargo
    # Tier 1 final-demand vector: sectors tagged tier 1 in the JSON keep baseline demand; all others -> 0.
    t1 = [tier[i] == 1 for i in 1:n]
    f1 = d .* t1
    # Variant: Art. 3.3 lists "secure residential shelter" as Tier 1; the JSON tags timber as Tier 2.
    i_timber = findfirst(==("timber_structural_kg"), ids)
    f1s = copy(f1); f1s[i_timber] = d[i_timber]

    # ASSUMED import-dependence vector (fraction of a sector's capacity lost per unit embargo depth).
    # These are NOT in the repository data; they are scenario assumptions documented in the results file.
    m_central = Dict(
        "exergy_elec_kwh" => 0.40, "thermal_heat_kwh" => 0.30, "water_potable_l" => 0.20,
        "water_agri_l" => 0.20, "food_staple_kcal" => 0.30, "food_fresh_kg" => 0.30,
        "timber_structural_kg" => 0.10, "basalt_mineral_kg" => 0.80, "electronics_compute_ch" => 0.95,
        "fablab_machining_h" => 0.60, "circular_scrap_kg" => 0.00, "preventive_maint_h" => 0.00)
    mc = [m_central[id] for id in ids]
    scenarios = [
        ("low (0.5 x central)", 0.5 .* mc),
        ("central", mc),
        ("high (min(1, 1.5 x central))", min.(1.0, 1.5 .* mc)),
        ("uniform (m = 1 everywhere)", ones(n)),
        ("Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere)", mc .* .!t1),
    ]
    headrooms = [0.0, 0.25]
    depths = [0.30, 0.50, 0.60, 0.80]

    println("### Capacity-cap embargo model")
    println("Capacity c_j = x_base_j * (1 + h) * (1 - e * m_j). Tier-1 demand f1 = baseline d on JSON tier-1 sectors, 0 elsewhere.")
    println("alpha = largest uniform fraction of f1 deliverable; alpha >= 1 means Tier 1 fully met.\n")
    println("Tier-1 demand share of baseline gross output (L f1)_j / x_j:")
    req1 = L * f1
    for i in 1:n
        @printf("- %s: %s\n", ids[i], fmt(req1[i] / x[i]))
    end
    println()

    # storable reserve sector (staple grains)
    s_staple = findfirst(==("food_staple_kcal"), ids)

    for h in headrooms
        println("#### Headroom h = $(h)\n")
        println("| m scenario | e | alpha full baseline d | alpha Tier-1 only | binding sector | infeasible sectors (Tier-1 only) | alpha Tier-1 + shelter | staple reserve draw / day (kcal) | 12-mo staple reserve lasts (days) | 24-mo staple reserve lasts (days) | 12-mo / 24-mo full Tier-1 basket reserve lasts (days) |")
        println("|---|---|---|---|---|---|---|---|---|---|---|")
        for (sname, m) in scenarios
            for e in depths
                c = capacity(x, h, e, m)
                a_full = max_fraction(L, d, c).alpha
                r1 = max_fraction(L, f1, c)
                infeas = [ids[j] for j in 1:n if r1.req[j] > c[j] + 1e-9]
                a_sh = max_fraction(L, f1s, c).alpha
                R12 = 365 * f1[s_staple]; R24 = 730 * f1[s_staple]
                res = min_reserve_draw(L, f1, c, s_staple)
                if r1.alpha >= 1
                    rd, l12, l24 = "0 (not needed)", "n/a", "n/a"
                elseif res.bridgeable
                    rd = fmt(res.r)
                    l12 = @sprintf("%.0f", R12 / res.r); l24 = @sprintf("%.0f", R24 / res.r)
                else
                    rd = "not bridgeable" * (res.blocking > 0 ? " (gap in $(ids[res.blocking]) has no staple pathway)" : " (draw > staple demand)")
                    l12, l24 = "-", "-"
                end
                # Full-basket reserve: 12/24 months of every Tier-1 final good held in store; drawing
                # r = (1 - alpha) f1 per day makes L(alpha f1) <= c feasible, so it lasts 365/(1-alpha) days.
                basket = r1.alpha >= 1 ? "n/a" : @sprintf("%.0f / %.0f", 365 / (1 - r1.alpha), 730 / (1 - r1.alpha))
                @printf("| %s | %.2f | %s | %s | %s | %s | %s | %s | %s | %s | %s |\n", sname, e, fmt(a_full),
                        fmt(r1.alpha), ids[r1.binding], isempty(infeas) ? "none" : join(infeas, ", "),
                        fmt(a_sh), rd, l12, l24, basket)
            end
        end
        println()
        println("Maximum embargo depth e* with Tier 1 fully satisfiable (bisection, tol 1e-7):\n")
        println("| m scenario | e* (Tier-1 only) | e* (Tier-1 + shelter) | e* (full baseline d) |")
        println("|---|---|---|---|")
        for (sname, m) in scenarios
            @printf("| %s | %.4f | %.4f | %.4f |\n", sname, max_depth(L, f1, x, h, m),
                    max_depth(L, f1s, x, h, m), max_depth(L, d, x, h, m))
        end
        println()
    end

    # ---- 6. Reserve magnitudes (Art. 3.5)
    i_elec = findfirst(==("exergy_elec_kwh"), ids)
    println("### Strategic reserve magnitudes implied by Art. 3.5 (\"12-24 months of Tier 1 without external inputs\")")
    @printf("- staple reserve, 12 months of Tier-1 final staple demand: %s kcal (%s kg grain at 3,500 kcal/kg)\n",
            fmt(365 * f1[s_staple]), fmt(365 * f1[s_staple] / 3500))
    @printf("- staple gross requirement incl. intermediate use (L f1), 12 months: %s kcal\n", fmt(365 * req1[s_staple]))
    @printf("- electrical exergy for Tier 1 (L f1)_elec per day: %s kWh; 12 months: %s kWh; 24 months: %s kWh\n",
            fmt(req1[i_elec]), fmt(365 * req1[i_elec]), fmt(730 * req1[i_elec]))
    println("  (i.e. the stated 'stationary energy buffer' clause would require this much stored energy if it were",
            " to cover Tier-1 electricity alone for the full horizon)\n")

    # ---- 7. Scalar L_min operator in layer1 vs. matrix coupling
    println("### Coded L_min operator vs. inter-industry coupling")
    println("`lexicographic_allocate` in simone/src/layer1_leontief.jl allocates ONE scalar stock across three tier demands.")
    println("It does not see A: allocating final Tier-1 goods without reserving their intermediate inputs under-counts requirements by:")
    for i in 1:n
        t1[i] || continue
        @printf("- %s: final Tier-1 demand %s vs gross requirement %s (ratio %s)\n", ids[i], fmt(f1[i]), fmt(req1[i]),
                fmt(req1[i] / f1[i]))
    end
    println()

    # ---- 8. 4-sector matrix cross-check
    j4 = load_json("leontief_baseline_matrix.json")
    A4 = rows_to_matrix(j4.technical_coefficients_matrix_A.rows)
    hs4 = hawkins_simon_report(A4, "4-sector baseline matrix")
    dpc = j4.tier1_final_demand_per_capita_day
    d4 = [Float64(dpc[Symbol(String(s.id))]) * 300 for s in j4.sectors]
    x4 = hs4.L * d4
    println("- baseline (N=300) d = ", fmt.(d4), "\n- x = ", fmt.(x4))
    t14 = [Int(s.lexicographic_tier) == 1 for s in j4.sectors]
    f14 = d4 .* t14
    println("- uniform capacity-cap embargo (m = 1, h = 0): Tier-1-only alpha by depth:")
    for e in depths
        @printf("  - e = %.2f: alpha = %s\n", e, fmt(max_fraction(hs4.L, f14, capacity(x4, 0.0, e, ones(4))).alpha))
    end
    @printf("- e* (Tier-1 only, m = 1, h = 0) = %.4f\n", max_depth(hs4.L, f14, x4, 0.0, ones(4)))
end

main()
