/**
 * Athenian Sortition Civic Dilemma Cards (Agent SIM-3)
 * Reigns-style community choices presented to the 7-citizen randomly drawn council.
 * Fully internationalized with translation keys.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const CIVIC_DILEMMAS = [
  {
    id: 'dil-refugees',
    type: 'REFUGEE_ASYLUM',
    titleKey: 'dil_refugees_title',
    title: 'Arrival of 4 Thermodynamic Refugees',
    summaryKey: 'dil_refugees_summary',
    summary: 'A family whose suburban apartment lost power and water during a legacy utility shutoff has reached the commons gate seeking sanctuary.',
    speaker: 'Amina Diallo (Councilor #3):',
    quoteKey: 'dil_refugees_quote',
    quote: '"We have 4 empty reserve pods in the Civic Pool, but our granary reserve will burn 15% faster."',
    optionA: {
      labelKey: 'dil_refugees_optA_label',
      label: 'Grant Unconditional Usufruct Sanctuary',
      descKey: 'dil_refugees_optA_desc',
      description: 'Allocate 2 civic reserve modules, provide Tier-1 subsistence floor, integrate into rotation.',
      energyDeltaKwh: -15,
      waterDeltaL: -120,
      foodDeltaKcal: -8800,
      moraleDelta: +15,
      populationDelta: +4,
      threatDelta: -5
    },
    optionB: {
      labelKey: 'dil_refugees_optB_label',
      label: 'Offer Emergency Supplies & Route to Federated Node',
      descKey: 'dil_refugees_optB_desc',
      description: 'Provide 3 days of dry rations and battery packs, guide them to the larger alpine hub.',
      energyDeltaKwh: -5,
      waterDeltaL: -40,
      foodDeltaKcal: -4400,
      moraleDelta: -10,
      populationDelta: 0,
      threatDelta: 0
    }
  },
  {
    id: 'dil-surplus-solar',
    type: 'ENERGY_SURPLUS',
    titleKey: 'dil_solar_title',
    title: 'Peak Summer Solar Surplus Allocation',
    summaryKey: 'dil_solar_summary',
    summary: 'Our PV array is generating 60 kWh/h in excess of daytime demand. The battery bank is 95% full.',
    speaker: 'Marcus Vance (Councilor #1):',
    quoteKey: 'dil_solar_quote',
    quote: '"Do we melt raw aluminum for the new farming rover, or charge thermal buffer tanks for night greenhouse heating?"',
    optionA: {
      labelKey: 'dil_solar_optA_label',
      label: 'Smelt Scrap Aluminum into FabLab Ingots',
      descKey: 'dil_solar_optA_desc',
      description: 'Power induction furnace to cast 40kg of structural grade aluminum for robot parts.',
      energyDeltaKwh: -45,
      materialsGained: { aluminumIngotsKg: 40 },
      moraleDelta: +8,
      threatDelta: -5
    },
    optionB: {
      labelKey: 'dil_solar_optB_label',
      label: 'Pump Thermal Storage & Cold Water Buffer',
      descKey: 'dil_solar_optB_desc',
      description: 'Chill water tanks for greenhouse bioclimatic stabilization against expected heatwave.',
      energyDeltaKwh: -30,
      waterDeltaL: +500,
      moraleDelta: +5,
      threatDelta: -10
    }
  },
  {
    id: 'dil-fiat-trade',
    type: 'COMMERCE',
    titleKey: 'dil_fiat_title',
    title: 'Artisanal Honey Export vs Internal Commons',
    summaryKey: 'dil_fiat_summary',
    summary: 'Our agro-forestry apiary produced 180kg of wildflower honey. A gourmet organic retailer in the city offers €2,200.',
    speaker: 'Sofia Rossi (Councilor #6):',
    quoteKey: 'dil_fiat_quote',
    quote: '"With €2,200 we can purchase 10 specialized high-efficiency MPPT controllers we cannot produce locally."',
    optionA: {
      labelKey: 'dil_fiat_optA_label',
      label: 'Export to External Market for Hardware Fund',
      descKey: 'dil_fiat_optA_desc',
      description: 'Deposit €2,200 in the community import treasury; purchase critical electronics.',
      fiatDeltaEur: +2200,
      foodDeltaKcal: -54000,
      moraleDelta: +5,
      threatDelta: -10
    },
    optionB: {
      labelKey: 'dil_fiat_optB_label',
      label: 'Distribute 100% to Community Kitchens & Medical Clinic',
      descKey: 'dil_fiat_optB_desc',
      description: 'Prioritize biophysical nutrition and natural antibiotic honey syrups for children and elders.',
      fiatDeltaEur: 0,
      foodDeltaKcal: +20000,
      moraleDelta: +12,
      threatDelta: +5
    }
  },
  {
    id: 'dil-sabbatical-overstay',
    type: 'PROPERTY_USUFRUCT',
    titleKey: 'dil_sabbatical_title',
    title: 'Sabbatical Lock Expiration Dispute',
    summaryKey: 'dil_sabbatical_summary',
    summary: 'Citizen Tariq declared a 30-day Sabbatical Lock to assist a flood in a coastal node, but has been absent 52 days without radio contact. A new young couple needs a pod.',
    speaker: 'Elena Rostova (Councilor #4):',
    quoteKey: 'dil_sabbatical_quote',
    quote: '"The Constitution states: after 45 days of uncommunicated absence, the dwelling returns to the Civic Pool. But Tariq is doing mutual aid!"',
    optionA: {
      labelKey: 'dil_sabbatical_optA_label',
      label: 'Reclaim Module to Civic Pool & Move Furniture to Swap Shop',
      descKey: 'dil_sabbatical_optA_desc',
      description: 'Enforce dynamic usufruct strictly; assign pod to the young couple. Secure Tariq’s personal gear in storage.',
      moraleDelta: -2,
      threatDelta: -5,
      actionNote: 'Dwelling reassigned under Constitutional Article 18'
    },
    optionB: {
      labelKey: 'dil_sabbatical_optB_label',
      label: 'Grant Exceptional 30-Day Mutual-Aid Sabbatical Extension',
      descKey: 'dil_sabbatical_optB_desc',
      description: 'Keep Tariq’s home locked; ask the young couple to temporarily use a shared guest pavilion.',
      moraleDelta: +5,
      threatDelta: 0,
      actionNote: 'Civic exception granted by Sortition consensus'
    }
  },
  {
    id: 'dil-mesh-cryptography',
    type: 'COMMONS_INVESTMENT',
    titleKey: 'dil_mesh_title',
    title: 'LoRa Mesh Relay Expansion vs Common Sauna',
    summaryKey: 'dil_mesh_summary',
    summary: 'The FabLab workshop has spare wood, microcontrollers, and solar mini-panels for one major community project this month.',
    speaker: 'Hiroshi Tanaka (Councilor #7):',
    quoteKey: 'dil_mesh_quote',
    quote: '"A mountain LoRa relay connects us to 3 other bioregional hubs. A wood-fired sauna restores citizen spirit after long soil shifts."',
    optionA: {
      labelKey: 'dil_mesh_optA_label',
      label: 'Erect High-Altitude LoRa Cryptographic Relay',
      descKey: 'dil_mesh_optA_desc',
      description: 'Boost bioregional data mesh resilience against legacy telecom censorship.',
      computeDeltaMflops: +2000,
      moraleDelta: +6,
      threatDelta: -20
    },
    optionB: {
      labelKey: 'dil_mesh_optB_label',
      label: 'Build Solar-Biomass Civic Sauna & Bathhouse',
      descKey: 'dil_mesh_optB_desc',
      description: 'Radically reduce physical fatigue and boost community morale by 15%.',
      moraleDelta: +18,
      threatDelta: 0
    }
  }
];
