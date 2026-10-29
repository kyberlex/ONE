"""
    layer1_leontief.jl

Layer 1: Technical-Productive Networks, Leontief Input-Output Balances & Weibull MTBF Wear (`simone-specs.md` §2.2).
Implements:
  1. Hawkins-Simon thermodynamic viability check and gross output solver x = (I - A)^(-1) * d
  2. Non-monetary lexicographic allocation operator (L_min, Constitution Art. 3.1.5)
  3. Weibull MTBF instantaneous hazard rate h(t) for physical machinery degradation

Pillar Alignment: Pillar 1 (Biophysical & Leontief Economics)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

"""
    solve_leontief_gross_output(A::AbstractMatrix, d::AbstractVector)

Solves `(I - A) * x = d` for total physical gross output `x`.
Throws an ArgumentError if the Hawkins-Simon viability condition is violated (negative output required).
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
Tier 1 (biological survival baseline) is satisfied 100% before any single unit is allocated to Tier 2 (civic/fablab)
or Tier 3 (discretionary projects).
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
    weibull_hazard_rate(operating_hours::Real, shape_k::Real, scale_lambda::Real)

Computes the instantaneous Weibull component failure hazard rate `h(t) = (k / λ) * (t / λ)^(k - 1)`.
"""
function weibull_hazard_rate(operating_hours::Real, shape_k::Real, scale_lambda::Real)
    t = max(0.0, Float64(operating_hours))
    k = Float64(shape_k)
    lam = Float64(scale_lambda)
    return (k / lam) * ((t / lam) ^ (k - 1.0))
end

