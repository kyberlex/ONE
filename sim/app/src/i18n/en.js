/**
 * English (EN) Canonical Translation Dictionary
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const en = {
  // Brand & Meta
  appTitle: 'O-ASIS Dual-Track | Living Thermodynamic Sandbox & Resilience MMO',
  appSubtitle: 'Persistent cooperative planetary simulator based on Leontief thermodynamics, dynamic usufruct, Athenian demarchy, and dual-track open hardware.',

  // Top HUD Resource Meters
  meterEnergyTitle: '⚡ Energy / Power',
  meterEnergyTooltip: 'Conserved Energy Flow (kWh) & LiFePO4 Storage Buffer',
  meterWaterTitle: '💧 Water / Cistern',
  meterWaterTooltip: 'Conserved Potable & Greywater Reservoir (Liters)',
  meterFoodTitle: '🥗 Food / Granary',
  meterFoodTooltip: 'Food Reserves & Biometric Subsistence Floor (2,200 kcal/die)',
  meterMoraleTitle: '⏳ Free Time / Morale',
  meterMoraleTooltip: 'Free Discretionary Hours & Social Cohesion',

  meterMeshOk: 'Mesh OK',
  meterGreywaterLoop: '65% Loop',
  meterDays: 'days',
  meterMorale: 'Morale',
  meterCitizens: 'Citizens',
  meterFreePerDay: 'Free/day',

  // Right Stack & Ticker
  legacySystemAlert: '🏦 Legacy System Alert:',
  defaultTicker: '🌱 O-ASIS Dual-Track initialized. Detroit Delray node operational.',

  // Time & Controls
  dayPrefix: 'Day',
  speedPause: '⏸ Pause',
  speed1x: '1x Normal',
  speed2x: '2x Fast',
  speed5x: '5x Hyper',

  // Bottom Navigation Buttons
  navChores: '📋 Chores & Maintenance',
  navHousing: '🏘️ Housing & Usufruct',
  navTech: '🤖 Robots & Dual-Track STL',
  navCouncil: '🏛️ Sortition Council',

  // Node Operational Hub Modal
  nodeHubTitle: 'Detroit Delray Commons — Operational Hub',
  tabChores: '📋 Chore Roster',
  tabHousing: '🏘️ Usufruct Housing & Reuse',
  tabMachinery: '⚙️ Machinery & Entropy',

  // Chore Roster
  choresTitle: 'Subsistence Labor Allocation (4h/day base)',
  choresSubtitle: 'Robots built in the FabLab permanently eliminate human labor hours, liberating citizen time!',
  populationLabel: 'Population:',
  freeTimeLabel: 'Free Time:',
  moraleLabel: 'Morale:',
  dailyChoresLabel: 'Daily Chores:',
  workerHoursTotal: 'worker-hours total',
  requiredLabel: 'Required:',
  robotCancelledLabel: 'Robot cancelled:',

  choreAgriName: '🥗 Land Shift (Agriculture)',
  choreAgriDesc: 'Greenhouses, micro-farms, composting, mushroom cellars.',
  choreFacName: '⚡ Facilities Shift (Infrastructure)',
  choreFacDesc: 'Solar inverters, battery monitoring, water pumps, greywater.',
  choreCareName: '❤️ Care Shift (Community Health)',
  choreCareDesc: 'Common kitchen, child daycare, wellness clinic, sanitation.',
  choreWorkName: '🔧 Workshop Shift (FabLab & Repair)',
  choreWorkDesc: 'Preventive maintenance, CNC milling, closed-loop plastic shredder.',

  // Community Vocations & Specialized Roles
  vocationSelectorTitle: 'Your Preferred Vocation (Free Choice):',
  vocationSelectorSub: 'In O.N.E. you choose your vocation freely. Heavy strenuous labor is awarded up to 2.0x credit, fulfilling community duties in half the time!',
  vocationDomainAgri: '🌾 Land & Agro-Ecology',
  vocationDomainFac: '⚡ Energy, Water & Mesh',
  vocationDomainCare: '❤️ Health, Education & Care',
  vocationDomainWork: '🛠️ FabLab & Circular Workshop',
  vocationBonusLabel: 'Systemic In-Game Bonus:',
  vocationEffortCredit: 'Labor Credit',
  heavyLaborBadge: 'Heavy Labor: 2.0x Credit 🏋️ (Halves duty hours!)',
  technicalLaborBadge: 'Technical Labor: 1.5x Credit ⚙️',
  socialLaborBadge: 'Social Care: 1.2x - 1.4x Credit ❤️',
  workshopLaborBadge: 'Artisan Workshop: 1.6x - 2.0x Credit 🔨',
  vocationActiveStatus: 'Active Vocation',
  vocationChangePrompt: 'Click any role to specialize',
  yourVocationLabel: 'Your Vocation:',
  laborCreditBadge: 'Labor Credit Multiplier:',
  nodeDemographicsTitle: 'Community Demographics by Vocation',

  // 11 Community Vocations (Names, Descriptions, Bonuses)
  voc_farmer_name: 'Regenerative Agro-Ecologist & Farmer',
  voc_farmer_desc: 'Aeroponic greenhouse management, bio-intensive polycultures, thermal composting, and living soil regeneration.',
  voc_farmer_bonus: '2.0x Heavy Labor credit. Halves required human hours for food sovereignty.',

  voc_forester_name: 'Forest Steward & Beekeeper',
  voc_forester_desc: 'Agroforestry food forest, sustainable coppicing, biomass for passive heating, and apiary hives for pollination.',
  voc_forester_bonus: '1.8x Labor credit. Produces natural honey, wax, and timber while shielding watershed biodiversity.',

  voc_electrician_name: 'Microgrid & Solar Electrician',
  voc_electrician_desc: 'Bifacial PV inverter tuning, vertical-axis wind turbine mechanics, and LiFePO4 battery cell balancing.',
  voc_electrician_bonus: '1.5x Labor credit. Mitigates entropy degradation and secures 24/7 galvanic island microgrid autonomy.',

  voc_water_name: 'Water Systems & Sanitation Tech',
  voc_water_desc: 'Rainwater cistern management, reed-bed wetland greywater filtration (65% closed-loop), and solar lift pumps.',
  voc_water_bonus: '1.4x Labor credit. Keeps drinking water pure and preserves community aquifer reserves during dry spells.',

  voc_mesh_name: 'Mesh Telemetry & IoT Engineer',
  voc_mesh_desc: 'LoRa and optical mesh communications, ESP32 environmental sensors, local SCADA, and cryptographic security.',
  voc_mesh_bonus: '1.2x Labor credit. Keeps the node federated globally and gives early warning against legacy external strikes.',

  voc_nurse_name: 'Community Nurse & Medic',
  voc_nurse_desc: 'First aid post, herbal medicine dispensaries, preventative biometric health checks, and palliative care.',
  voc_nurse_bonus: '1.4x Labor credit. Enhances community health floor and cushions node morale during seasonal heatwaves.',

  voc_teacher_name: 'Commons Educator & Teacher',
  voc_teacher_desc: 'Libertarian children education, hands-on workshops (coding, botany, carpentry), and constitutional literacy.',
  voc_teacher_bonus: '1.2x Labor credit. Drives long-term social cohesion, raising baseline community morale by +10%.',

  voc_chef_name: 'Communal Chef & Baker',
  voc_chef_desc: 'Common house kitchen, sourdough fermentation, nutrient density planning, and zero-waste community dining.',
  voc_chef_bonus: '1.3x Labor credit. Boosts nutritional exergy efficiency (+10% calorie value extracted from harvest).',

  voc_mediator_name: 'Civic Facilitator & Mediator',
  voc_mediator_desc: 'Sortition Council lottery assembly logistics, nonviolent restorative mediation, and chore rotation scheduling.',
  voc_mediator_bonus: '1.0x Labor credit. Defuses internal friction and blocks speculative division during adversary crisis events.',

  voc_blacksmith_name: 'Mechanical Machinist & Blacksmith',
  voc_blacksmith_desc: 'Recycled aluminum induction foundry, welding, agricultural machinery repair, and closed-loop plastic filament shredding.',
  voc_blacksmith_bonus: '2.0x Heavy Labor credit. Eliminates breakdown risk and accelerates FabLab metal smelting cycles.',

  voc_carpenter_name: 'Carpenter & Circular Furniture Artisan',
  voc_carpenter_desc: 'Crafting modular timber fixtures, repairing reclaimed furniture, and managing the Civic Furniture Swap Shop depot.',
  voc_carpenter_bonus: '1.6x Labor credit. Ensures arriving pioneers are immediately supplied with beds, desks, and chairs for free.',

  // Housing & Usufruct
  usufructTitle: 'Dynamic Usufruct ("Use It or Lose It")',
  usufructSubtitle: 'Speculative rent and eviction are physically impossible. Abandoned dwellings return to the community; personal belongings are 100% inviolable.',
  totalPodsLabel: 'Total Pods:',
  occupiedLabel: 'Occupied:',
  civicReserveLabel: 'Civic Reserve:',
  furnitureShopTitle: '🛋️ Civic Furniture Reuse Depot (Furniture Swap Shop)',
  furnitureShopSubtitle: 'Heavy furniture left from reclaimed pods is freely available to any new arrival at zero cost:',
  furnitureBeds: '🛏️ Beds:',
  furnitureChairs: '🪑 Chairs:',
  furnitureTables: '🪵 Tables:',
  furnitureWardrobes: '🚪 Wardrobes:',
  furnitureWorkbenches: '🔨 Workbenches:',
  bioclimaticHousingUnitsTitle: 'Bioclimatic Housing Units',
  podOccupied: 'Occupied',
  podCivicReserve: '🟢 Civic Reserve',
  sabbaticalActiveBadge: '🔒 Sabbatical Active',

  // Machinery & Entropy
  entropyTitle: 'Second-Law Thermodynamics (Entropy & Wear)',
  entropySubtitle: 'Machines degrade with load. If durability drops below 25%, efficiency falls and leakage occurs. Perform artisan repair or closed-loop shredding/smelting.',
  durabilityLabel: 'Durability',
  btnArtisanRepair: '🔧 Artisan Repair',
  circularBufferTitle: '♻️ FabLab Closed-Loop Material Buffer',
  matAluminum: '🧱 Aluminum:',
  matFilament: '🧵 PETG Filament:',
  matCopper: '⚡ Copper Wire:',
  matBiochar: '🌱 Biochar:',
  btnSmeltMetals: 'Smelt Scrap Metals',
  btnShredPlastics: 'Shred Scrap Plastics',
  btnCompostBiochar: 'Compost Biochar',

  // Dual-Track & Tech Tree
  dualTrackTitle: '🤖 FabLab Robot Tech Tree & Dual-Track Hardware Bridge',
  dualTrackSubtitle: 'Building automations permanently cancels daily chore hours from human rosters. Each in-game milestone unlocks verified real-world open hardware blueprints for 3D printing and Home Assistant!',
  availableStocks: 'Available FabLab Stocks:',
  activeRobotsBadge: 'Active',
  cancelsHumanChore: 'Cancels daily human chores by',
  costLabel: 'Cost:',
  btnFabricateRobot: '🛠️ Fabricate in FabLab',
  btnInsufficientMaterials: '❌ Insufficient Materials',
  realHardwareBlueprintTitle: '🔌 REAL HARDWARE BLUEPRINT',
  btnDownloadStl: '📥 Download CAD (.STL)',
  btnViewYaml: '📄 View Home Assistant YAML',
  yamlCopiedAlert: 'Home Assistant YAML copied to clipboard!',

  // Athenian Sortition Council & Dilemmas
  councilDeliberationBadge: '🏛️ ATHENIAN SORTITION DELIBERATION',
  councilLocalMediation: 'Local Mediation Panel',
  councilNeighborhood: 'Neighborhood Sortition Council',
  councilStanceTitle: 'Assembly Deliberation Stance',
  thresholdLabel: 'Required Threshold',
  votesNeeded: 'votes needed',
  thresholdMet: 'RATIFIED',
  thresholdPending: 'BELOW',
  inspectJurors: 'Inspect Seated Jurors',
  citizensLabel: 'Citizens',
  inFavor: 'in Favor',
  against: 'Against',
  btnRatifyA: 'Ratify Option A',
  btnRatifyB: 'Ratify Option B',
  councilInRecess: 'Assembly is in recess. Deliberation begins when a community dilemma emerges.',

  // Legacy Adversary Stress Events
  systemAttackBadge: '⚠️ SYSTEM STRESS ATTACK DETECTED',
  threatConsequenceTitle: 'Threat Consequence:',
  threatLabel: 'Threat:',
  btnDeployCountermeasure: 'Deploy Countermeasure',

  // Map & Hex Tooltips
  usufructBadge: 'USUFRUCT',
  legacyDebtBadge: 'DEBT ZONE',
  commonsLabel: '🌱 Commons',
  unclaimedTerritoryDesc: 'Unclaimed territory ready for cooperative founding!',

  // World Map, Geolocation & Bioclimatic Settlement
  viewWorldMap: '🌍 World Map',
  viewVillage: '🏘️ Village View',
  btnLocateMe: '📍 Locate My Bioregion',
  btnBackToMap: '🌍 Back to World Map',
  btnVisitVillage: '🔭 Visit & Enter Village',
  mapSatellite: 'Satellite Earth',
  mapPhysical: 'Physical Topo',
  foundNodeTitle: 'Found New O.N.E. Node',

  foundNodeDesc: 'Establish a new self-sufficient resilient haven here according to the local climate zone:',
  btnConfirmFound: 'Plant O.N.E. Beacon',
  btnClaimUsufruct: 'Claim Usufruct Dwelling',
  yourHomeBadge: 'Your Primary Usufruct Home',
  yourHomeDesc: 'You hold active usufruct over this bioclimatic dwelling. Your personal gear is strictly inviolable under Class-0 constitutional invariants.',
  btnReleaseToPool: 'Release to Civic Pool',
  dwellingOccupiedTitle: 'Active Usufruct Resident',
  inhabitantName: 'Inhabitant:',
  inhabitantRole: 'Vocation:',
  laborDuty: 'Social Labor:',
  sabbaticalStatus: 'Sabbatical Protection:',
  occupiedWarning: 'This dwelling is currently in use. Housing cannot be bought or evicted.',
  vacantReserveTitle: 'Vacant Civic Reserve Pod',
  vacantReserveDesc: 'This dwelling is free and immediately available for usufruct. Zero rent, zero mortgage, zero debt.',
  buildingMaterialLabel: 'Building Material:',
  solarEfficiencyLabel: 'Solar Efficiency:',
  waterCatchmentLabel: 'Water System:',
  heatingDemandLabel: 'Thermal Factor:',
  circularFurnitureTitle: 'Civic Circular Furniture Included:',
  furnitureNote: 'Provided by the local Circular Furniture Swap Shop (Circular Re-use Hub).',
  constitutionalGuaranteesTitle: 'Constitutional Guarantees (AGPL-3.0)',
  welcomeBackHomeTitle: 'Welcome Back Home!',
  welcomeBackHomeMsg: 'Your usufruct dwelling in',
  welcomeBackHomeSub: 'is secure. Sabbatical Lock: 30 days protected.',
  inviolableGearTitle: 'Personal Belongings:',
  sabbaticalDesc: 'Protects your dwelling for up to 180 days while offline or traveling elsewhere on Earth. Reassignment is locked.',
  myHomePill: 'My Dwelling',
  myDwelling: 'My Dwelling',
  uncoveredAlertTitle: 'Civic Rotation Required:',
  uncoveredAlertDesc: 'Uncovered vital sector:',
  uncoveredAlertNote: 'In O.N.E. everyone has freedom of vocation, but if an essential post has 0 workers, the community triggers a temporary civic rotation!',

  // Legacy Adversary Crises (English)
  crisis_npl_name: 'NPL Debt Strike (Foreclosure Lawfare)',
  crisis_npl_desc: 'A vulture debt fund has purchased an unserviced 2011 mortgage on the node territory. Judicial bailiffs and private security have posted a 24-hour seizure notice at the gate!',
  crisis_npl_impact: 'If unresolved: 30% of FabLab machinery sequestered and external trade frozen.',
  crisis_npl_opt1_label: 'Affidavit of Civil Custody (Non-Violent Human Chain)',
  crisis_npl_opt1_cost: 'Requires 4h community vigil, zero fiat paid',
  crisis_npl_opt2_label: 'Pay Extortion Settlement from Emergency Fiat Fund',
  crisis_npl_opt2_cost: 'Costs €2,500 from hardware reserve',

  crisis_grid_name: 'Grid Severing & Sudden Blackout',
  crisis_grid_desc: 'The regional monopoly utility has arbitrarily cut the high-voltage transmission tie during an unseasonal frost, citing uncertified microgrid feed-in harmonics.',
  crisis_grid_impact: 'If islanding fails: water pumps stop, greenhouse heating drops below 8°C.',
  crisis_grid_opt1_label: 'Engage Galvanic Island Isolation & Battery Priority Shedding',
  crisis_grid_opt1_cost: 'Consumes 30 kWh battery buffer, isolates node completely',
  crisis_grid_opt2_label: 'Cough up Dirty Diesel Backup',
  crisis_grid_opt2_cost: 'Costs €450 in fossil fuel, creates toxic exhaust',

  crisis_tax_name: 'Tax Inspection & Highway Roadblock',
  crisis_tax_desc: 'Highway police and revenue inspectors have impounded the node’s transport van delivering organic preserves and precision CNC prototypes to an ethical buyers collective.',
  crisis_tax_impact: 'External fiat revenue stalled; export goods confiscated unless countered.',
  crisis_tax_opt1_label: 'Reroute Logistics via Local Byways & Mutual Credit Swap',
  crisis_tax_opt1_cost: 'Shifts 100% of trade into direct barter with federated nodes',
  crisis_tax_opt2_label: 'Submit and Pay Statutory Transport Fine',
  crisis_tax_opt2_cost: 'Costs €950 in fiat currency',

  crisis_ubi_name: 'False UBI & Speculative Infiltration',
  crisis_ubi_desc: 'A speculative crypto-proptech firm is distributing €500 prepaid debit cards to young residents, trying to convince them to sublet common housing modules for fiat cash.',
  crisis_ubi_impact: 'If unchecked: black market rent emerges, undermining dynamic usufruct.',
  crisis_ubi_opt1_label: 'Convene Sortition Council & Open Leontief Exergy Audit',
  crisis_ubi_opt1_cost: 'Demonstrates physical superiority of usufruct; reinforces non-speculative pact',
  crisis_ubi_opt2_label: 'Ignore & Hope Individual Morality Prevails',
  crisis_ubi_opt2_cost: 'Zero cost today, risk of internal division tomorrow',

  // Athenian Sortition Dilemmas (English)
  dil_refugees_title: 'Arrival of 4 Thermodynamic Refugees',
  dil_refugees_summary: 'A family whose suburban apartment lost power and water during a legacy utility shutoff has reached the commons gate seeking sanctuary.',
  dil_refugees_quote: '"We have empty reserve pods in the Civic Pool, but our granary reserve will burn faster."',
  dil_refugees_optA_label: 'Grant Unconditional Usufruct Sanctuary',
  dil_refugees_optA_desc: 'Allocate 2 civic reserve modules, provide Tier-1 subsistence floor, integrate into rotation.',
  dil_refugees_optB_label: 'Offer Emergency Supplies & Route to Federated Node',
  dil_refugees_optB_desc: 'Provide 3 days of dry rations and battery packs, guide them to the larger alpine hub.',

  dil_solar_title: 'Peak Summer Solar Surplus Allocation',
  dil_solar_summary: 'Our PV array is generating 60 kWh/h in excess of daytime demand. The battery bank is 95% full.',
  dil_solar_quote: '"Do we melt raw aluminum for the new farming rover, or charge thermal buffer tanks for night greenhouse heating?"',
  dil_solar_optA_label: 'Smelt Scrap Aluminum into FabLab Ingots',
  dil_solar_optA_desc: 'Power induction furnace to cast 40kg of structural grade aluminum for robot parts.',
  dil_solar_optB_label: 'Pump Thermal Storage & Cold Water Buffer',
  dil_solar_optB_desc: 'Chill water tanks for greenhouse bioclimatic stabilization against expected heatwave.',

  dil_fiat_title: 'Artisanal Honey Export vs Internal Commons',
  dil_fiat_summary: 'Our agro-forestry apiary produced 180kg of wildflower honey. A gourmet organic retailer in the city offers €2,200.',
  dil_fiat_quote: '"With €2,200 we can purchase specialized high-efficiency MPPT controllers we cannot produce locally."',
  dil_fiat_optA_label: 'Export to External Market for Hardware Fund',
  dil_fiat_optA_desc: 'Deposit €2,200 in the community import treasury; purchase critical electronics.',
  dil_fiat_optB_label: 'Distribute 100% to Community Kitchens & Medical Clinic',
  dil_fiat_optB_desc: 'Prioritize biophysical nutrition and natural antibiotic honey syrups for children and elders.',

  dil_sabbatical_title: 'Sabbatical Lock Expiration Dispute',
  dil_sabbatical_summary: 'A citizen declared a 30-day Sabbatical Lock to assist a flood in a coastal node, but has been absent 52 days without radio contact. A new young couple needs a pod.',
  dil_sabbatical_quote: '"The Constitution states: after 45 days of uncommunicated absence, the dwelling returns to the Civic Pool. But this was mutual aid!"',
  dil_sabbatical_optA_label: 'Reclaim Module to Civic Pool & Move Furniture to Swap Shop',
  dil_sabbatical_optA_desc: 'Enforce dynamic usufruct strictly; assign pod to the young couple. Secure personal gear in storage.',
  dil_sabbatical_optB_label: 'Grant Exceptional 30-Day Mutual-Aid Extension',
  dil_sabbatical_optB_desc: 'Keep the home locked; ask the young couple to temporarily use a shared guest pavilion.',

  dil_mesh_title: 'LoRa Mesh Relay Expansion vs Common Sauna',
  dil_mesh_summary: 'The FabLab workshop has spare wood, microcontrollers, and solar mini-panels for one major community project this month.',
  dil_mesh_quote: '"A mountain LoRa relay connects us to 3 other bioregional hubs. A wood-fired sauna restores citizen spirit after long soil shifts."',
  dil_mesh_optA_label: 'Erect High-Altitude LoRa Cryptographic Relay',
  dil_mesh_optA_desc: 'Boost bioregional data mesh resilience against legacy telecom censorship.',
  dil_mesh_optB_label: 'Build Solar-Biomass Civic Sauna & Bathhouse',
  dil_mesh_optB_desc: 'Radically reduce physical fatigue and boost community morale by 15%.'
};


