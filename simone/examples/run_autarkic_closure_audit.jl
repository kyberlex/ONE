#!/usr/bin/env julia
"""
    run_autarkic_closure_audit.jl

Art. 3.1.6 Tier 1 Autarkic Closure audit on the v2 14-sector data (`simone/data/leontief_14sector_matrix.json`),
with the Art. 3.5.2 reserve-gap composition. All capacity, import-dependence and resource values in the data file
are ILLUSTRATIVE — uncalibrated: the output demonstrates the audit procedure, not the state of any real site.

Run from the repository root:

    julia --project=simone simone/examples/run_autarkic_closure_audit.jl

Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

using Simone
using Printf

const DATA = joinpath(@__DIR__, "..", "data", "leontief_14sector_matrix.json")

function report(label, a, m)
    println("## ", label)
    @printf("- verdict: %s\n- published reserve margin: %+.4f\n- deliverable Tier 1 fraction alpha: %.4f\n",
            a.feasible ? "PASS" : "FAIL", a.reserve_margin, a.alpha)
    println("- audited supply chain (", length(a.supply_chain), " sectors): ", join(a.supply_chain, ", "))
    println("- binding sectors: ", isempty(a.binding_sectors) ? "none" : join(a.binding_sectors, ", "))
    println("- binding primary resources: ", isempty(a.binding_resources) ? "none" : join(a.binding_resources, ", "))
    if !isempty(a.reserve_gap)
        println("\n| sector | reserve form (Art. 3.5.2) | daily gap | quantity for $(Int(a.reserve_months)) months |")
        println("|---|---|---|---|")
        for e in a.reserve_gap
            unit = m.units[findfirst(==(e.sector), m.ids)]
            qty = e.form === :redundant_capacity ? @sprintf("+%.4g %s/day import-free capacity", e.horizon_quantity, unit) :
                  @sprintf("%.4g %s", e.horizon_quantity, unit)
            @printf("| %s | %s | %.4g %s/day | %s |\n", e.sector, e.form, e.daily_gap, unit, qty)
        end
    end
    println()
end

function main()
    m = load_leontief_model(DATA)
    hs = check_hawkins_simon(m.A)
    println("# Tier 1 Autarkic Closure audit (ILLUSTRATIVE data, N = $(Int(m.population)))\n")
    @printf("Hawkins-Simon: viable = %s, rho(A) = %.4f, det(I-A) = %.4f\n\n", hs.viable, hs.spectral_radius, hs.determinant)
    report("A. All external inputs available (m = 0): capacity check only",
           autarkic_closure_audit(merge(m, (import_dependence = zeros(length(m.ids)),))), m)
    report("B. External inputs at zero (illustrative import dependence), 12-month horizon",
           autarkic_closure_audit(m; reserve_months = 12), m)
    report("C. Same, 24-month horizon and 10% target margin",
           autarkic_closure_audit(m; reserve_months = 24, target_margin = 0.10), m)

    f = (t) -> m.d .* (m.tiers .== t)
    la = lexicographic_allocate(m.A, m.capacity .* (1 .- m.import_dependence), f(1), f(2), f(3))
    println("## Matrix-aware L_min under zero external inputs")
    @printf("- Tier 1 fraction %.4f, Tier 2 fraction %.4f, Tier 3 fraction %.4f\n",
            la.tier1_fraction, la.tier2_fraction, la.tier3_fraction)
    println("- first binding sectors: ", join(m.ids[la.binding_sectors], ", "))
end

main()

