/**
 * Athenian Sortition Civic Dilemma Cards (Agent SIM-3)
 * Simple, accessible community choices presented to the randomly drawn citizen assembly.
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
    title: 'Arrival of 4 people seeking help',
    summaryKey: 'dil_refugees_summary',
    summary: 'A family left without electricity or water after an eviction has reached our gate asking to join.',
    speaker: 'Amina Diallo (Councilor #3):',
    quoteKey: 'dil_refugees_quote',
    quote: '"We have free homes, but we will share our food reserves among more people."',
    optionA: {
      labelKey: 'dil_refugees_optA_label',
      label: 'Welcome the family and assign a free home',
      descKey: 'dil_refugees_optA_desc',
      description: 'Give them a home, food, and include them in village chores.',
      energyDeltaKwh: -15,
      waterDeltaL: -120,
      foodDeltaKcal: -8800,
      moraleDelta: +15,
      populationDelta: +4,
      threatDelta: -5
    },
    optionB: {
      labelKey: 'dil_refugees_optB_label',
      label: 'Provide food supplies and guide them onward',
      descKey: 'dil_refugees_optB_desc',
      description: 'Give 3 days of rations and help them reach a larger center.',
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
    title: 'What to do with surplus electricity?',
    summaryKey: 'dil_solar_summary',
    summary: 'The sun is blazing today and all batteries are 95% full. We have abundant excess power to put to work.',
    speaker: 'Marcus Vance (Councilor #1):',
    quoteKey: 'dil_solar_quote',
    quote: '"Do we melt scrap metal for robot parts or cool down the greenhouse tanks?"',
    optionA: {
      labelKey: 'dil_solar_optA_label',
      label: 'Melt recycled aluminum into metal bars',
      descKey: 'dil_solar_optA_desc',
      description: 'Run the workshop furnace to make 40kg of metal for spare parts.',
      energyDeltaKwh: -45,
      materialsGained: { aluminumIngotsKg: 40 },
      moraleDelta: +8,
      threatDelta: -5
    },
    optionB: {
      labelKey: 'dil_solar_optB_label',
      label: 'Cool water tanks to protect plants from heat',
      descKey: 'dil_solar_optB_desc',
      description: 'Pump chilled water into greenhouses to protect crops from summer heat.',
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
    title: 'Sell the honey or keep it for ourselves?',
    summaryKey: 'dil_fiat_summary',
    summary: 'Our beehives yielded 180kg of great honey. A store in the city offers €2,200 to buy it all.',
    speaker: 'Sofia Rossi (Councilor #6):',
    quoteKey: 'dil_fiat_quote',
    quote: '"With €2,200 we can buy electronic parts we cannot make ourselves."',
    optionA: {
      labelKey: 'dil_fiat_optA_label',
      label: 'Sell the honey to buy useful tech components',
      descKey: 'dil_fiat_optA_desc',
      description: 'Bank €2,200 to purchase key hardware for the village.',
      fiatDeltaEur: +2200,
      foodDeltaKcal: -54000,
      moraleDelta: +5,
      threatDelta: -10
    },
    optionB: {
      labelKey: 'dil_fiat_optB_label',
      label: 'Keep all honey for our kitchen and clinic',
      descKey: 'dil_fiat_optB_desc',
      description: 'Distribute honey to children, elders, and the sick.',
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
    title: 'Home occupied by someone who has not returned?',
    summaryKey: 'dil_sabbatical_summary',
    summary: 'Tariq left to help a flooded town but has been away for almost two months with no contact. A young couple needs a home.',
    speaker: 'Elena Rostova (Councilor #4):',
    quoteKey: 'dil_sabbatical_quote',
    quote: '"After 45 days without word homes become free, but Tariq was doing good deeds!"',
    optionA: {
      labelKey: 'dil_sabbatical_optA_label',
      label: 'Free the home and assign it to the new couple',
      descKey: 'dil_sabbatical_optA_desc',
      description: 'Safely store Tariq’s belongings and assign the home to the waiting couple.',
      moraleDelta: -2,
      threatDelta: -5,
      actionNote: 'Home reassigned'
    },
    optionB: {
      labelKey: 'dil_sabbatical_optB_label',
      label: 'Wait another 30 days before touching the home',
      descKey: 'dil_sabbatical_optB_desc',
      description: 'Keep Tariq’s home reserved and find temporary lodging for the couple.',
      moraleDelta: +5,
      threatDelta: 0,
      actionNote: 'Temporary exception granted'
    }
  },
  {
    id: 'dil-mesh-cryptography',
    type: 'COMMONS_INVESTMENT',
    titleKey: 'dil_mesh_title',
    title: 'Better radio antenna or a sauna to relax?',
    summaryKey: 'dil_mesh_summary',
    summary: 'The workshop has enough timber and solar parts for only one big project this month.',
    speaker: 'Hiroshi Tanaka (Councilor #7):',
    quoteKey: 'dil_mesh_quote',
    quote: '"A mountain radio connects us to distant villages. A sauna lets hard-working farmers unwind."',
    optionA: {
      labelKey: 'dil_mesh_optA_label',
      label: 'Build the radio antenna to communicate further',
      descKey: 'dil_mesh_optA_desc',
      description: 'Strengthen radio ties with other independent communities.',
      computeDeltaMflops: +2000,
      moraleDelta: +6,
      threatDelta: -20
    },
    optionB: {
      labelKey: 'dil_mesh_optB_label',
      label: 'Build a community sauna to unwind together',
      descKey: 'dil_mesh_optB_desc',
      description: 'Relieve physical fatigue and make everyone happier (+15% morale).',
      moraleDelta: +18,
      threatDelta: 0
    }
  }
];
