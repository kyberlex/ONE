/**
 * Community Vocations & Specialized Roles in O.N.E. Commons (Agent SIM-1 & SIM-5)
 * Defines the 11 indispensable roles required for biophysical and social autonomy.
 * Each role features an effort multiplier (heavy strenuous jobs earn up to 2.0x credit),
 * associated domain, and systemic in-game benefits.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const COMMUNITY_VOCATIONS = [
  // 1. Land & Food Sovereignty (Agriculture)
  {
    id: 'farmer',
    domain: 'agriculture',
    icon: '🌾',
    multiplier: 2.0,
    isHeavyLabor: true,
    nameKey: 'voc_farmer_name',
    defaultName: 'Regenerative Agro-Ecologist & Farmer',
    descKey: 'voc_farmer_desc',
    defaultDesc: 'Aeroponic greenhouse management, bio-intensive polycultures, thermal composting, and living soil regeneration.',
    bonusKey: 'voc_farmer_bonus',
    defaultBonus: '2.0x Heavy Labor credit. Halves required human hours for food sovereignty.',
    targetLocation: 'FOOD'
  },
  {
    id: 'forester',
    domain: 'agriculture',
    icon: '🌲',
    multiplier: 1.8,
    isHeavyLabor: true,
    nameKey: 'voc_forester_name',
    defaultName: 'Forest Steward & Beekeeper',
    descKey: 'voc_forester_desc',
    defaultDesc: 'Agroforestry food forest, sustainable coppicing, biomass for passive heating, and apiary hives for pollination.',
    bonusKey: 'voc_forester_bonus',
    defaultBonus: '1.8x Labor credit. Produces natural honey, wax, and timber while shielding watershed biodiversity.',
    targetLocation: 'FOOD'
  },

  // 2. Energy, Water & Environmental Infrastructure (Facilities)
  {
    id: 'electrician',
    domain: 'facilities',
    icon: '⚡',
    multiplier: 1.5,
    isHeavyLabor: false,
    nameKey: 'voc_electrician_name',
    defaultName: 'Microgrid & Solar Electrician',
    descKey: 'voc_electrician_desc',
    defaultDesc: 'Bifacial PV inverter tuning, vertical-axis wind turbine mechanics, and LiFePO4 battery cell balancing.',
    bonusKey: 'voc_electrician_bonus',
    defaultBonus: '1.5x Labor credit. Mitigates entropy degradation and secures 24/7 galvanic island microgrid autonomy.',
    targetLocation: 'ENERGY'
  },
  {
    id: 'waterTech',
    domain: 'facilities',
    icon: '💧',
    multiplier: 1.4,
    isHeavyLabor: false,
    nameKey: 'voc_water_name',
    defaultName: 'Water Systems & Sanitation Tech',
    descKey: 'voc_water_desc',
    defaultDesc: 'Rainwater cistern management, reed-bed wetland greywater filtration (65% closed-loop), and solar lift pumps.',
    bonusKey: 'voc_water_bonus',
    defaultBonus: '1.4x Labor credit. Keeps drinking water pure and preserves community aquifer reserves during dry spells.',
    targetLocation: 'WATER'
  },
  {
    id: 'meshHacker',
    domain: 'facilities',
    icon: '📡',
    multiplier: 1.2,
    isHeavyLabor: false,
    nameKey: 'voc_mesh_name',
    defaultName: 'Mesh Telemetry & IoT Engineer',
    descKey: 'voc_mesh_desc',
    defaultDesc: 'LoRa and optical mesh communications, ESP32 environmental sensors, local SCADA, and cryptographic security.',
    bonusKey: 'voc_mesh_bonus',
    defaultBonus: '1.2x Labor credit. Keeps the node federated globally and gives early warning against legacy external strikes.',
    targetLocation: 'MESH'
  },

  // 3. Health, Education & Care (Care)
  {
    id: 'nurse',
    domain: 'care',
    icon: '🩺',
    multiplier: 1.4,
    isHeavyLabor: false,
    nameKey: 'voc_nurse_name',
    defaultName: 'Community Nurse & Medic',
    descKey: 'voc_nurse_desc',
    defaultDesc: 'First aid post, herbal medicine dispensaries, preventative biometric health checks, and palliative care.',
    bonusKey: 'voc_nurse_bonus',
    defaultBonus: '1.4x Labor credit. Enhances community health floor and cushions node morale during seasonal heatwaves.',
    targetLocation: 'AGORA'
  },
  {
    id: 'teacher',
    domain: 'care',
    icon: '📚',
    multiplier: 1.2,
    isHeavyLabor: false,
    nameKey: 'voc_teacher_name',
    defaultName: 'Commons Educator & Teacher',
    descKey: 'voc_teacher_desc',
    defaultDesc: 'Libertarian children education, hands-on workshops (coding, botany, carpentry), and constitutional literacy.',
    bonusKey: 'voc_teacher_bonus',
    defaultBonus: '1.2x Labor credit. Drives long-term social cohesion, raising baseline community morale by +10%.',
    targetLocation: 'AGORA'
  },
  {
    id: 'chef',
    domain: 'care',
    icon: '🍲',
    multiplier: 1.3,
    isHeavyLabor: false,
    nameKey: 'voc_chef_name',
    defaultName: 'Communal Chef & Baker',
    descKey: 'voc_chef_desc',
    defaultDesc: 'Common house kitchen, sourdough fermentation, nutrient density planning, and zero-waste community dining.',
    bonusKey: 'voc_chef_bonus',
    defaultBonus: '1.3x Labor credit. Boosts nutritional exergy efficiency (+10% calorie value extracted from harvest).',
    targetLocation: 'AGORA'
  },
  {
    id: 'mediator',
    domain: 'care',
    icon: '⚖️',
    multiplier: 1.0,
    isHeavyLabor: false,
    nameKey: 'voc_mediator_name',
    defaultName: 'Civic Facilitator & Mediator',
    descKey: 'voc_mediator_desc',
    defaultDesc: 'Sortition Council lottery assembly logistics, nonviolent restorative mediation, and chore rotation scheduling.',
    bonusKey: 'voc_mediator_bonus',
    defaultBonus: '1.0x Labor credit. Defuses internal friction and blocks speculative division during adversary crisis events.',
    targetLocation: 'AGORA'
  },

  // 4. FabLab, Mechanics & Circular Workshop (Workshop)
  {
    id: 'blacksmith',
    domain: 'workshop',
    icon: '🔧',
    multiplier: 2.0,
    isHeavyLabor: true,
    nameKey: 'voc_blacksmith_name',
    defaultName: 'Mechanical Machinist & Blacksmith',
    descKey: 'voc_blacksmith_desc',
    defaultDesc: 'Recycled aluminum induction foundry, welding, agricultural machinery repair, and closed-loop plastic filament shredding.',
    bonusKey: 'voc_blacksmith_bonus',
    defaultBonus: '2.0x Heavy Labor credit. Eliminates breakdown risk and accelerates FabLab metal smelting cycles.',
    targetLocation: 'WORKSHOP'
  },
  {
    id: 'carpenter',
    domain: 'workshop',
    icon: '🪑',
    multiplier: 1.6,
    isHeavyLabor: true,
    nameKey: 'voc_carpenter_name',
    defaultName: 'Carpenter & Circular Furniture Artisan',
    descKey: 'voc_carpenter_desc',
    defaultDesc: 'Crafting modular timber fixtures, repairing reclaimed furniture, and managing the Civic Furniture Swap Shop depot.',
    bonusKey: 'voc_carpenter_bonus',
    defaultBonus: '1.6x Labor credit. Ensures arriving pioneers are immediately supplied with beds, desks, and chairs for free.',
    targetLocation: 'WORKSHOP'
  }
];

export function getVocationById(id) {
  return COMMUNITY_VOCATIONS.find(v => v.id === id) || COMMUNITY_VOCATIONS[0];
}

export function getVocationsByDomain(domain) {
  return COMMUNITY_VOCATIONS.filter(v => v.domain === domain);
}
