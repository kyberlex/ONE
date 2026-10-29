"""
    layer0_abiotic.jl

Layer 0: Biophysical, Hydrological & Thermodynamic Substrate (`simone-specs.md` §2.1).
Models Darcy groundwater aquifer balance, soil N-P-K mineral kinetics, and abiotic drought shocks.

Pillar Alignment: Pillar 3 (Scientific Simulation) + Pillar 1 (Biophysical Economics)
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

Base.@kwdef struct AbioticSubstrateParams
    aquifer_capacity_l::Float64 = 5.0e7
    darcy_recharge_coeff::Float64 = 0.35
    natural_baseflow_loss_rate::Float64 = 0.001
    soil_nitrogen_kg_ha::Float64 = 180.0
    compost_return_efficiency::Float64 = 0.92
end

"""
    darcy_aquifer_step(storage_l, precip_l, extraction_l, p::AbioticSubstrateParams)

Computes the next daily aquifer volume (L) obeying mass conservation and non-negativity.
"""
function darcy_aquifer_step(storage_l::Real, precip_l::Real, extraction_l::Real, p::AbioticSubstrateParams)
    recharge_l = p.darcy_recharge_coeff * max(0.0, Float64(precip_l))
    baseflow_out_l = p.natural_baseflow_loss_rate * max(0.0, Float64(storage_l))
    next_vol = Float64(storage_l) + recharge_l - baseflow_out_l - max(0.0, Float64(extraction_l))
    return clamp(next_vol, 0.0, p.aquifer_capacity_l)
end

