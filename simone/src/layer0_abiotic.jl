"""
    layer0_abiotic.jl

Layer 0: Biophysical, Hydrological & Thermodynamic Substrate (`simone-specs.md` §2.1).
Models Darcy groundwater aquifer mass balance, closed-loop soil N-P-K mineral kinetics,
and stochastic solar/hydrological drought shock multipliers across the 5 Seed Node biomes.

Pillar Alignment: Pillar 3 (Scientific Simulation) + Pillar 1 (Biophysical Economics)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

"""
    AbioticSubstrateParams

Physical parameters governing the local watershed and soil nutrient stock of a Seed Node:
- `aquifer_capacity_l`: Maximum usable unconfined aquifer storage volume (`L`).
- `darcy_recharge_coeff`: Fraction of surface precipitation infiltrating the aquifer (`[0, 1]`).
- `natural_baseflow_loss_rate`: Daily fractional lateral baseflow discharge (`day⁻¹`).
- `soil_nitrogen_kg_ha`: Baseline mineralized soil nitrogen stock (`kg N / ha`).
- `compost_return_efficiency`: Closed-loop humanure/thermophilic compost N-recovery fraction (`[0, 1]`).
- `arable_area_ha`: Cultivated agroforestry/aeroponic footprint (`ha`).
"""
Base.@kwdef struct AbioticSubstrateParams
    aquifer_capacity_l::Float64 = 5.0e7
    darcy_recharge_coeff::Float64 = 0.35
    natural_baseflow_loss_rate::Float64 = 0.001
    soil_nitrogen_kg_ha::Float64 = 180.0
    compost_return_efficiency::Float64 = 0.92
    arable_area_ha::Float64 = 12.0
end

"""
    darcy_aquifer_step(storage_l, precip_l, extraction_l, p::AbioticSubstrateParams)

Computes the next daily aquifer volume (`L`) obeying strict physical mass conservation:
`V(t + Δt) = clamp(V(t) + α_darcy * P(t) - k_base * V(t) - E_ext(t), 0, V_max)`.
"""
function darcy_aquifer_step(storage_l::Real, precip_l::Real, extraction_l::Real, p::AbioticSubstrateParams)
    recharge_l = p.darcy_recharge_coeff * max(0.0, Float64(precip_l))
    baseflow_out_l = p.natural_baseflow_loss_rate * max(0.0, Float64(storage_l))
    next_vol = Float64(storage_l) + recharge_l - baseflow_out_l - max(0.0, Float64(extraction_l))
    return clamp(next_vol, 0.0, p.aquifer_capacity_l)
end

"""
    soil_nitrogen_step(current_n_kg_ha::Real, crop_uptake_kg_ha::Real, p::AbioticSubstrateParams;
                       legume_fixation_kg_ha::Real = 0.08)

Advances daily soil available nitrogen (`kg N / ha`) under closed-loop thermophilic compost recovery
and biological nitrogen fixation. Prevents artificial creation of matter (6th Class-0 Invariant).
"""
function soil_nitrogen_step(current_n_kg_ha::Real, crop_uptake_kg_ha::Real, p::AbioticSubstrateParams;
                            legume_fixation_kg_ha::Real = 0.08)
    uptake = max(0.0, Float64(crop_uptake_kg_ha))
    returned_n = p.compost_return_efficiency * uptake
    next_n = Float64(current_n_kg_ha) - uptake + returned_n + max(0.0, Float64(legume_fixation_kg_ha))
    return max(0.0, next_n)
end

"""
    abiotic_drought_shock_multiplier(day_of_year::Real; shock_start::Real = 180.0,
                                     shock_duration::Real = 60.0, severity::Real = 0.40)

Returns a dimensionless reduction multiplier in `[1.0 - severity, 1.0]` for stress-testing
solar irradiance or precipitation drops during PoW 1B and PoW 3A.

# Open Proof-of-Work Hook (`PoW 1B` / `PoW 3A`):
Incoming Collaborators can replace this deterministic box-shock with a continuous Ornstein-Uhlenbeck
or Markov-switching weather generator calibrated to ERA5 / Copernicus time-series.
"""
function abiotic_drought_shock_multiplier(day_of_year::Real; shock_start::Real = 180.0,
                                          shock_duration::Real = 60.0, severity::Real = 0.40)
    sev = clamp(Float64(severity), 0.0, 1.0)
    t = Float64(day_of_year)
    if shock_start <= t <= (shock_start + shock_duration)
        return 1.0 - sev
    end
    return 1.0
end
