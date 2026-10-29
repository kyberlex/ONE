# -*- coding: utf-8 -*-
"""
O.N.E. SIMONE — REA / VALUEFLOWS BIOPHYSICAL EVENT ADAPTER
File: simone/src/rea_adapter.jl
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later (Class-0 Non-Commercial)
Standard: Elohim epr-rea / ValueFlows RDF / ISO 15944-4 Accounting Substrate

Description:
Task 6.1 of simone/TODO.md: Ingestion adapter mapping discrete P2P
biophysical accounting events (FlowEvent payloads from Elohim Protocol)
into continuous Simone state vectors S(t) = [E, W, C, P].
Validates the physical conservation handshake between discrete event logs
and continuous differential equations.
"""

struct REAFlowEvent
    event_id::String
    timestamp_hour::Float64
    action::Symbol          # :produce, :consume, :transfer, :wear
    resource::Symbol        # :exergy_kwh, :water_liters, :biomass_kcal, :compute_fab_hours
    quantity::Float64
    provider_id::String
    receiver_id::String
end

"""
    parse_rea_event(dict) -> REAFlowEvent

Parses a raw dictionary/JSON mapping into a strongly-typed REAFlowEvent.
"""
function parse_rea_event(d)::REAFlowEvent
    return REAFlowEvent(
        String(d["event_id"]),
        Float64(d["timestamp_hour"]),
        Symbol(d["action"]),
        Symbol(d["resource"]),
        Float64(d["quantity"]),
        String(d["provider_id"]),
        String(d["receiver_id"])
    )
end

"""
    fold_rea_events(events::Vector{REAFlowEvent}; duration_hours=24.0) -> Dict{Symbol, Float64}

Computes net accumulated physical stock delta across a set of REA flow events.
Actions:
  - :produce  -> +quantity
  - :consume  -> -quantity
  - :wear     -> -quantity
  - :transfer -> neutral (internal reallocation)
"""
function fold_rea_events(events::Vector{REAFlowEvent})::Dict{Symbol, Float64}
    net_deltas = Dict{Symbol, Float64}(
        :exergy_kwh => 0.0,
        :water_liters => 0.0,
        :biomass_kcal => 0.0,
        :compute_fab_hours => 0.0
    )

    for ev in events
        if !haskey(net_deltas, ev.resource)
            continue
        end

        if ev.action == :produce
            net_deltas[ev.resource] += ev.quantity
        elseif ev.action in (:consume, :wear)
            net_deltas[ev.resource] -= ev.quantity
        end
    end

    return net_deltas
end

"""
    reconcile_rea_with_ode_delta(events::Vector{REAFlowEvent}, ode_delta::Dict{Symbol, Float64}; tolerance_pct=5.0) -> Bool

Verifies that discrete REA biophysical events match continuous differential equation integrations
within a specified tolerance band, proving conservation across the discrete/continuous boundary.
"""
function reconcile_rea_with_ode_delta(events::Vector{REAFlowEvent}, ode_delta::Dict{Symbol, Float64}; tolerance_pct=5.0)::Tuple{Bool, Dict{Symbol, Float64}}
    rea_deltas = fold_rea_events(events)
    discrepancies = Dict{Symbol, Float64}()
    all_consistent = true

    for res in keys(rea_deltas)
        r_val = rea_deltas[res]
        o_val = get(ode_delta, res, 0.0)
        denom = max(abs(o_val), 1e-6)
        pct_err = abs(r_val - o_val) / denom * 100.0
        discrepancies[res] = pct_err

        if pct_err > tolerance_pct
            all_consistent = false
        end
    end

    return (all_consistent, discrepancies)
end

