"""
    layer3_sortition.jl

Layer 3: Institutional State Machines & Odd-Parity Demarchic Sortition (`simone-specs.md` §2.4).
Enforces the Constitutional Drafting Invariants (`foundation/SORTITION_PROTOCOL_SPEC.md`):
  1. Strict Odd-Number Parity for all deliberative assemblies (3, 15, 101, 301, 1001)
  2. Universal 75% Qualified Supermajority Rule for structural/constitutional ratifications
  3. Post-service cooldown exclusion preventing permanent political careerism
  4. Universal sortition eligibility (Art. 5.2.3): eligibility and political rights are NEVER conditioned on
     labor reciprocity; the only exclusion applied here is the post-service cooldown/hiatus
  5. Petition intake (Art. 4.3.5, Organic Law OL-9; adversarial source SIM-QA-11): unfiltered public register,
     quadratic endorsement allowance, co-signer threshold, 10% fast lane, 3-citizen triage panel (form checks and
     duplicate merging only), finite agenda slots filled by a lottery weighted by distinct support

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

# =============================================================================================================
# Universal eligibility (Art. 5.2.3)
# =============================================================================================================

"""
    eligible_sortition_pool(citizens; cooldown_ids = ())

Returns the sorted ids of citizens eligible for sortition. `citizens` is either a collection of integer ids or a
collection of records with an `id` field (any other fields, e.g. labor or reciprocity status, are deliberately
ignored). The only exclusion is the post-service cooldown/hiatus (`cooldown_ids`, or a record field
`in_cooldown == true`). Art. 5.2.3: sortition eligibility and political rights are never conditioned on labor
reciprocity.
"""
function eligible_sortition_pool(citizens; cooldown_ids = ())
    cool = Set{Int}(cooldown_ids)
    out = Int[]
    for c in citizens
        if c isa Integer
            id = Int(c); in_cd = false
        else
            id = Int(c.id)
            in_cd = hasproperty(c, :in_cooldown) && c.in_cooldown === true
        end
        (in_cd || id in cool) && continue
        push!(out, id)
    end
    return sort!(unique!(out))
end

# =============================================================================================================
# Petition intake (Art. 4.3.5 / OL-9)
# =============================================================================================================

"OL-9 §1: civic attention tokens per adult per quarter (equal for every person, never conditioned on labor)."
const ENDORSEMENT_TOKENS_PER_QUARTER = 9
"OL-9 §2: minimum co-signers and co-signer share of constituents."
const PETITION_MIN_COSIGNERS = 3
const PETITION_COSIGNER_SHARE = 0.02
"OL-9 §2: share of constituents whose endorsement places a petition in the fast lane."
const PETITION_FAST_LANE_SHARE = 0.10
"OL-9 §4: weeks after which an unscheduled petition leaves the lottery pool (it may be renewed)."
const PETITION_POOL_EXPIRY_WEEKS = 13
"OL-9 §5: triage panel size (odd parity)."
const TRIAGE_PANEL_SIZE = 3

"""
    Petition(id, author, action, submitted_week, cosigners)

A petition on the open civic register. `action` is the requested action (free text); the triage panel only uses its
normalized form to merge identical requests and to check that it is non-empty. `cosigners` are the ids of
co-endorsing citizens (the author's own endorsement is implicit).
"""
struct Petition
    id::Int
    author::Int
    action::String
    submitted_week::Int
    cosigners::Vector{Int}
end

"Co-signers required for agenda placement: `max(3, ceil(2% of constituents))` (OL-9 §2)."
petition_cosigners_required(n_constituents::Integer) =
    max(PETITION_MIN_COSIGNERS, ceil(Int, PETITION_COSIGNER_SHARE * n_constituents - 1e-9))

"Endorsements required for the fast lane: `ceil(10% of constituents)` (OL-9 §2)."
petition_fast_lane_threshold(n_constituents::Integer) = ceil(Int, PETITION_FAST_LANE_SHARE * n_constituents - 1e-9)

"Quadratic cost of `k` endorsements in one quarter: `k^2` tokens (OL-9 §1)."
quadratic_endorsement_cost(k::Integer) = k^2

"Maximum endorsements affordable with `tokens` under quadratic cost (9 tokens → 3)."
max_affordable_endorsements(tokens::Integer = ENDORSEMENT_TOKENS_PER_QUARTER) = isqrt(max(tokens, 0))

"""
    BeaconRNG(seed)

Minimal SplitMix64 generator standing in for the public verifiable random beacon of the sortition protocol. It is
defined here (instead of `Random`) so that a published seed reproduces the same draw on every Julia version.
"""
mutable struct BeaconRNG
    state::UInt64
end
BeaconRNG(seed::Integer) = BeaconRNG(UInt64(seed % UInt64))

function next_u64!(r::BeaconRNG)
    r.state += 0x9e3779b97f4a7c15
    z = r.state
    z = (z ⊻ (z >> 30)) * 0xbf58476d1ce4e5b9
    z = (z ⊻ (z >> 27)) * 0x94d049bb133111eb
    return z ⊻ (z >> 31)
end
"Uniform Float64 in [0, 1)."
next_unit!(r::BeaconRNG) = (next_u64!(r) >> 11) * 2.0^-53

"Weighted sampling of `k` items without replacement (deterministic for a given `BeaconRNG` state)."
function weighted_sample_without_replacement!(rng::BeaconRNG, items::AbstractVector, weights::AbstractVector{<:Real}, k::Integer)
    its = collect(items); ws = Float64.(weights)
    out = eltype(its)[]
    while length(out) < k && !isempty(its)
        total = sum(ws)
        total <= 0 && break
        u = next_unit!(rng) * total
        acc = 0.0; pick = length(its)
        for i in eachindex(ws)
            acc += ws[i]
            if acc > u
                pick = i; break
            end
        end
        push!(out, its[pick]); deleteat!(its, pick); deleteat!(ws, pick)
    end
    return out
end

"""
    draw_triage_panel(eligible_ids, seed)

Draws the 3-citizen Triage Panel (OL-9 §5) by lot from an eligibility pool built with `eligible_sortition_pool`.
"""
function draw_triage_panel(eligible_ids::AbstractVector{<:Integer}, seed::Integer)
    length(eligible_ids) >= TRIAGE_PANEL_SIZE || throw(ArgumentError("Eligible pool smaller than triage panel."))
    pool = sort(unique(Int.(eligible_ids)))
    return sort(weighted_sample_without_replacement!(BeaconRNG(seed), pool, ones(length(pool)), TRIAGE_PANEL_SIZE))
end

_normalize_action(s::AbstractString) = join(split(lowercase(strip(s))), " ")

"""
    petition_intake(register, n_constituents, agenda_slots; week, seed,
                    tokens = ENDORSEMENT_TOKENS_PER_QUARTER, expiry_weeks = PETITION_POOL_EXPIRY_WEEKS,
                    scheduled_ids = Int[])

One agenda session of the Art. 4.3.5 / OL-9 petition intake. `register` holds every petition of the current
endorsement quarter (unfiltered: nothing is ever removed from it). Deterministic for a given `seed`.

Pipeline:
1. **Allowance (OL-9 §1).** Every person has the same `tokens`; `k` endorsements (authored or co-signed) cost
   `k^2`, so at most `isqrt(tokens)` count. Excess endorsements are void, oldest kept first (by week, then id).
   No labor, conduct or opinion input exists in this function.
2. **Triage (OL-9 §5).** Form check only: a non-empty action and an author inside the constituency. Petitions
   requesting the same (normalized) action are merged into the earliest one; endorsements are unioned. No merit
   judgment is possible: the action text is never scored.
3. **Thresholds (OL-9 §2).** A petition enters the lottery pool with at least `petition_cosigners_required`
   valid co-signers (author excluded); with at least `petition_fast_lane_threshold` co-signers it enters the
   fast lane.
4. **Expiry (OL-9 §4).** Pool petitions older than `expiry_weeks` leave the pool (status `:expired`).
5. **Slots (OL-9 §3-4).** Fast-lane petitions are heard first (oldest first). Remaining slots are filled by a
   lottery weighted by distinct support: an endorser backing `k` pool petitions adds `1/k` to each.
   Unused slots stay unused.

Returns a NamedTuple: `agenda` (ordered ids), `fast_lane`, `lottery`, `status::Dict{Int,Symbol}` (one of
`:scheduled, :pool, :fast_lane_waiting, :below_threshold, :merged, :format_returned, :expired, :already_scheduled`),
`merged_into::Dict{Int,Int}`, `weights::Dict{Int,Float64}`, `valid_cosigners::Dict{Int,Int}`,
`void_endorsements` (vector of `(citizen, petition)`), `cosigners_required`, `fast_lane_threshold`.
"""
function petition_intake(register::AbstractVector{Petition}, n_constituents::Integer, agenda_slots::Integer;
                         week::Integer, seed::Integer, tokens::Integer = ENDORSEMENT_TOKENS_PER_QUARTER,
                         expiry_weeks::Integer = PETITION_POOL_EXPIRY_WEEKS,
                         scheduled_ids::AbstractVector{<:Integer} = Int[])
    n_constituents > 0 || throw(ArgumentError("n_constituents must be positive."))
    agenda_slots >= 0 || throw(ArgumentError("agenda_slots must be non-negative."))
    length(unique(p.id for p in register)) == length(register) || throw(ArgumentError("Duplicate petition ids."))
    need = petition_cosigners_required(n_constituents)
    need_fast = petition_fast_lane_threshold(n_constituents)
    kmax = max_affordable_endorsements(tokens)
    in_const(c) = 1 <= c <= n_constituents
    status = Dict{Int,Symbol}()
    order = sort(collect(register); by = p -> (p.submitted_week, p.id))

    # 1. Quadratic allowance: count endorsements per citizen in register order; void those beyond kmax.
    used = Dict{Int,Int}()
    endorsers = Dict{Int,Set{Int}}()
    void = Tuple{Int,Int}[]
    for p in order
        s = Set{Int}()
        for c in vcat(p.author, p.cosigners)
            (in_const(c) && !(c in s)) || continue
            if get(used, c, 0) < kmax
                used[c] = get(used, c, 0) + 1
                push!(s, c)
            else
                push!(void, (c, p.id))
            end
        end
        endorsers[p.id] = s
    end

    # 2. Triage: form check, then merge identical requests into the earliest petition.
    merged_into = Dict{Int,Int}()
    canonical = Dict{String,Int}()
    live = Int[]
    for p in order
        key = _normalize_action(p.action)
        if isempty(key) || !in_const(p.author)
            status[p.id] = :format_returned
            continue
        end
        if haskey(canonical, key)
            target = canonical[key]
            merged_into[p.id] = target
            union!(endorsers[target], endorsers[p.id])
            status[p.id] = :merged
        else
            canonical[key] = p.id
            push!(live, p.id)
        end
    end
    byid = Dict(p.id => p for p in register)
    done = Set{Int}(scheduled_ids)

    # 3-4. Thresholds and expiry.
    cos = Dict{Int,Int}()
    pool = Int[]; fast = Int[]
    for id in live
        p = byid[id]
        n_co = length(setdiff(endorsers[id], (p.author,)))
        cos[id] = n_co
        if id in done
            status[id] = :already_scheduled
        elseif n_co < need
            status[id] = :below_threshold          # stays on the public register
        elseif week - p.submitted_week >= expiry_weeks
            status[id] = :expired                  # may be renewed by its author
        elseif n_co >= need_fast
            push!(fast, id)
        else
            push!(pool, id)
        end
    end

    # 5. Slots: fast lane first, then lottery weighted by distinct support.
    sort!(fast; by = id -> (byid[id].submitted_week, id))
    fast_chosen = fast[1:min(agenda_slots, length(fast))]
    for id in fast
        status[id] = id in fast_chosen ? :scheduled : :fast_lane_waiting
    end
    backing = Dict{Int,Int}()
    for id in vcat(pool, fast), c in endorsers[id]
        backing[c] = get(backing, c, 0) + 1
    end
    weights = Dict{Int,Float64}(id => sum((1.0 / backing[c] for c in endorsers[id]); init = 0.0) for id in pool)
    free = agenda_slots - length(fast_chosen)
    lot = free > 0 ? weighted_sample_without_replacement!(BeaconRNG(seed), pool, [weights[id] for id in pool], free) : Int[]
    for id in pool
        status[id] = id in lot ? :scheduled : :pool
    end
    return (agenda = vcat(fast_chosen, lot), fast_lane = fast_chosen, lottery = lot, status = status,
            merged_into = merged_into, weights = weights, valid_cosigners = cos, void_endorsements = void,
            cosigners_required = need, fast_lane_threshold = need_fast)
end
