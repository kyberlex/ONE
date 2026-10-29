"""
    layer2_psychometrics.jl

Layer 2: Heterogeneous Agent Psychometrics & Bounded Rationality (`simone-specs.md` §2.3).
Models HEXACO Honesty-Humility (H) distributions (Ashton & Lee, 2007), Camerer cognitive
hierarchy `k`-levels (Camerer et al., 2004), and metabolic/civic burnout dynamics without
assuming utopian human altruism.

Pillar Alignment: Pillar 3 (Scientific Co-Simulation)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

"""
    PsychometricProfile

Individual behavioral parameterization for a discrete `Villager` micro-agent:
- `hexaco_h`: Honesty-Humility score in `[1.0, 5.0]` (empirical population mean `~3.20`, SD `~0.65`; lower tail `< 2.0` models opportunistic free-riding propensity).
- `camerer_k`: Strategic reasoning depth `k ∈ {0, 1, 2, 3}` (Poisson `τ ≈ 1.5`).
- `fatigue`: Cumulative physical/cognitive burnout index in `[0.0, 1.0]`.
"""
struct PsychometricProfile
    hexaco_h::Float64
    camerer_k::Int
    fatigue::Float64
end

"""
    civic_contribution_propensity(prof::PsychometricProfile, community_trust::Real)

Returns the daily probability in `[0.0, 1.0]` that an agent fulfills their non-waivable
civic maintenance compact (5–7h/week metabolic floor + technical guild rotation).
"""
function civic_contribution_propensity(prof::PsychometricProfile, community_trust::Real)
    h_norm = clamp((prof.hexaco_h - 1.0) / 4.0, 0.0, 1.0)
    trust_factor = clamp(Float64(community_trust), 0.0, 1.0)
    fatigue_penalty = 0.5 * clamp(prof.fatigue, 0.0, 1.0)
    return clamp(0.35 + 0.45 * h_norm + 0.25 * trust_factor - fatigue_penalty, 0.0, 1.0)
end

"""
    update_agent_fatigue(current_fatigue::Real, hours_worked::Real, rest_quality::Real = 1.0)

Updates daily agent fatigue in `[0.0, 1.0]`. Working beyond the constitutional 15h/week
(`~2.15 h/day`) steady-state target accelerates burnout unless balanced by rest recovery.

# Open Proof-of-Work Hook (`PoW 3B`):
Sweep `hexaco_h` dispersion and `fatigue` accumulation across `N = 300` agents in `agent_abm.jl`
to locate the critical heterogeneity tipping point where Model B diverges from Model A (ODE).
"""
function update_agent_fatigue(current_fatigue::Real, hours_worked::Real, rest_quality::Real = 1.0)
    f0 = clamp(Float64(current_fatigue), 0.0, 1.0)
    strain = 0.035 * max(0.0, Float64(hours_worked) - 2.15)
    recovery = 0.05 * clamp(Float64(rest_quality), 0.0, 1.5)
    return clamp(f0 + strain - recovery, 0.0, 1.0)
end
