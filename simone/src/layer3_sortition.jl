"""
    layer3_sortition.jl

Layer 3: Institutional State Machines & Odd-Parity Demarchic Sortition (`simone-specs.md` §2.4).
Enforces the Constitutional Drafting Invariants:
  1. Strict Odd-Number Parity for all deliberative assemblies (3, 15, 101, 301, 1001)
  2. Universal 75% Qualified Supermajority Rule for structural/constitutional ratifications

Pillar Alignment: Pillar 2 (Governance, Sortition & Swiss Foundation Law)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

const VALID_SORTITION_QUORUMS = (3, 15, 101, 301, 1001)
const CONSTITUTIONAL_SUPERMAJORITY = 0.75

"""
    verify_odd_parity_quorum(n_jurors::Integer)

Verifies that a seated sortition assembly strictly obeys odd-number parity to prevent mathematical deadlock.
"""
function verify_odd_parity_quorum(n_jurors::Integer)
    return n_jurors > 0 && isodd(n_jurors)
end

"""
    evaluate_supermajority_vote(yes_votes::Integer, total_jurors::Integer; threshold::Real = CONSTITUTIONAL_SUPERMAJORITY)

Evaluates a deliberative assembly vote under the strict odd-parity and 75% supermajority rule.
"""
function evaluate_supermajority_vote(yes_votes::Integer, total_jurors::Integer; threshold::Real = CONSTITUTIONAL_SUPERMAJORITY)
    verify_odd_parity_quorum(total_jurors) || throw(ArgumentError("Sortition assembly size ($total_jurors) violates strict odd-number parity."))
    (0 <= yes_votes <= total_jurors) || throw(ArgumentError("Invalid yes_votes count ($yes_votes / $total_jurors)."))

    share = Float64(yes_votes) / Float64(total_jurors)
    return (ratified = share >= Float64(threshold), approval_share = share, required_votes = ceil(Int, Float64(threshold) * total_jurors))
end

