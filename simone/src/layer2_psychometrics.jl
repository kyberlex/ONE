"""
    layer2_psychometrics.jl

Layer 2: Heterogeneous Agent Psychometrics & Bounded Rationality (`simone-specs.md` §2.3).
Models HEXACO Honesty-Humility (H) distributions, Camerer cognitive hierarchy k-levels,
and civic contribution propensity without assuming utopian human perfection.

Pillar Alignment: Pillar 3 (Scientific Simulation)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

struct PsychometricProfile
    hexaco_h::Float64       # Honesty-Humility score in [1.0, 5.0] (mean ~3.20, lower tail < 2.0 = free-rider risk)
    camerer_k::Int          # Strategic depth level k in {0, 1, 2, 3}
    fatigue::Float64        # Cumulative metabolic/cognitive fatigue in [0.0, 1.0]
end

"""
    civic_contribution_propensity(prof::PsychometricProfile, community_trust::Real)

Returns the daily probability in `[0.0, 1.0]` that an agent fulfills their 15h/week civic maintenance compact.
"""
function civic_contribution_propensity(prof::PsychometricProfile, community_trust::Real)
    h_norm = clamp((prof.hexaco_h - 1.0) / 4.0, 0.0, 1.0)
    trust_factor = clamp(Float64(community_trust), 0.0, 1.0)
    fatigue_penalty = 0.5 * clamp(prof.fatigue, 0.0, 1.0)
    return clamp(0.35 + 0.45 * h_norm + 0.25 * trust_factor - fatigue_penalty, 0.0, 1.0)
end

