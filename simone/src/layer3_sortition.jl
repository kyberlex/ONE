"""
    layer3_sortition.jl

Layer 3: Institutional State Machines & Odd-Parity Demarchic Sortition (`simone-specs.md` §2.4).
Enforces the Constitutional Drafting Invariants (`foundation/SORTITION_PROTOCOL_SPEC.md`):
  1. Strict Odd-Number Parity for all deliberative assemblies (3, 15, 101, 301, 1001)
  2. Universal 75% Qualified Supermajority Rule for structural/constitutional ratifications
  3. Post-service cooldown exclusion preventing permanent political careerism

Pillar Alignment: Pillar 2 (Governance, Sortition & Swiss Foundation Law)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

const VALID_SORTITION_QUORUMS = (3, 15, 101, 301, 1001)
const CONSTITUTIONAL_SUPERMAJORITY = 0.75

"""
    SortitionProposalState

5-stage deterministic lifecycle of a demarchic assembly proposal (`foundation/SORTITION_PROTOCOL_SPEC.md` §2):
`PROPOSAL_INTAKE` -> `VRF_JURY_SEATED` -> `DELIBERATION_ACTIVE` -> `SUPERMAJORITY_RATIFIED` or `REJECTED_RETURNED_TO_BASELINE`.
"""
@enum SortitionProposalState begin
    PROPOSAL_INTAKE = 1
    VRF_JURY_SEATED = 2
    DELIBERATION_ACTIVE = 3
    SUPERMAJORITY_RATIFIED = 4
    REJECTED_RETURNED_TO_BASELINE = 5
end

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
    req = ceil(Int, Float64(threshold) * total_jurors)
    ratified = yes_votes >= req
    state = ratified ? SUPERMAJORITY_RATIFIED : REJECTED_RETURNED_TO_BASELINE
    return (ratified = ratified, approval_share = share, required_votes = req, terminal_state = state)
end

"""
    draw_stratified_odd_jury(eligible_citizen_ids::AbstractVector{<:Integer}, quorum_size::Integer)

Draws a deterministic odd-parity jury subset from `eligible_citizen_ids` (excluding citizens in cooldown).

# Open Proof-of-Work Hook (`PoW 2A` & `PoW 2C`):
1. Replace deterministic slice with RFC 9381 VRF seed-verifiable sampling and demographic/skill stratification.
2. Simulate Sybil / coordinated factional capture attempts across quorum sizes `(3, 15, 101)` to compute hypergeometric capture probability.
"""
function draw_stratified_odd_jury(eligible_citizen_ids::AbstractVector{<:Integer}, quorum_size::Integer)
    verify_odd_parity_quorum(quorum_size) || throw(ArgumentError("Requested quorum_size ($quorum_size) must be odd."))
    length(eligible_citizen_ids) >= quorum_size || throw(ArgumentError("Eligible pool ($(length(eligible_citizen_ids))) smaller than quorum ($quorum_size)."))
    return collect(eligible_citizen_ids[1:quorum_size])
end
