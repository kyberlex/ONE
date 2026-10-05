/**
 * O.N.E. Central State Store & Event Hub
 * Pure JavaScript single source of truth for the living sandbox.
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

/**
 * Canonical Vehicle Specifications for Inter-Node Logistics & Regional Convoys (Epic 2.1)
 */
export const VEHICLE_SPECS = {
  cargo_trike: {
    type: 'cargo_trike',
    category: 'overland',
    name: 'Electric Cargo Trike',
    icon: '🚲',
    payloadKg: 250,
    rangeKm: 60,
    energyDrawKwhPer100Km: 1.5,
    batteryCapacityKwh: 1.0,
    batteryVoltage: '48V LFP Swappable Pack',
    routes: ['Overland greenways', 'Regional bike/cart corridors'],
    description: 'Heavy-duty overland cargo trike with 250 kg freight box, regenerative hub motor, and swappable 48V LFP battery packs.'
  },
  vtol_drone: {
    type: 'vtol_drone',
    category: 'aerial',
    name: 'Autonomous VTOL Cargo Drone',
    icon: '🚁',
    payloadKg: 25,
    rangeKm: 45,
    energyDrawKwhPerSortie: 0.8,
    batteryCapacityKwh: 1.2,
    batteryVoltage: 'High-C LFP Pack',
    routes: ['Direct line-of-sight aerial mesh corridors'],
    description: 'Autonomous electric vertical takeoff and landing drone for 25 kg rapid emergency, precision tools, and high-value cargo.'
  }
};

/**
 * Canonical Regional Partner Nodes & Bioregional Specializations (Epic 2.2)
 */
export const REGIONAL_PARTNER_NODES = {
  val_di_cecina: {
    id: 'val_di_cecina',
    name: 'Val di Cecina Geothermal Node',
    region: 'Tuscan Metalliferous Hills (Italy)',
    specialty: 'Geothermal & Agritech',
    distanceKm: 380,
    signal: '95% (Mesh Backbone)',
    affinity: 90,
    tradeHistoryCount: 0,
    icon: '♨️',
    exports: [
      { id: 'steam_ancient_grains', name: 'Geothermal Steam-Dried Ancient Grains', category: 'food', unitValue: 12000, desc: 'High-protein emmer and spelt grains dried using clean geothermal heat exchangers.' },
      { id: 'borate_salts', name: 'Borate Salts', category: 'materials', desc: 'Natural geothermal mineral flux for metallurgy and glass hardening.' },
      { id: 'heavy_copper_cable', name: 'Heavy Copper Cable', category: 'materials', desc: 'Induction-annealed copper busbars and high-current microgrid cabling.' }
    ],
    demands: [
      { id: 'microcontrollers', name: 'Microcontrollers', category: 'electronics', desc: 'ESP32 and RISC-V compute nodes for automated geothermal valve telemetry.' },
      { id: 'cnc_milled_brackets', name: 'Precision CNC Milled Brackets', category: 'tooling', desc: '5-axis milled high-tolerance brackets for superheated steam turbines.' },
      { id: 'medicinal_herbs', name: 'Medicinal Herbs', category: 'botanicals', desc: 'Permaculture apothecary extracts, yarrow, and soothing feverfew.' }
    ]
  },
  campi_flegrei: {
    id: 'campi_flegrei',
    name: 'Campi Flegrei Silica Works',
    region: 'Phlegraean Fields, Tyrrhenian Coast (Italy)',
    specialty: 'Volcanic Silica & Glassworks',
    distanceKm: 440,
    signal: '91% (Coastal LoRa Relay)',
    affinity: 85,
    tradeHistoryCount: 0,
    icon: '🌋',
    exports: [
      { id: 'pozzolana_binder', name: 'Pozzolana Cement Binder', category: 'materials', desc: 'Roman-formula hydraulic volcanic ash binder for waterproof zero-carbon cistern mortar.' },
      { id: 'refractory_glass_tubes', name: 'Refractory Glass Tubes', category: 'materials', desc: 'Thermal shock resistant borosilicate vacuum tubes for solar collectors.' },
      { id: 'volcanic_zeolite_filters', name: 'Volcanic Zeolite Filters', category: 'hydrology', desc: 'High surface-area microporous minerals for greywater and heavy metal purification.' }
    ],
    demands: [
      { id: 'fresh_calories', name: 'Fresh Calories', category: 'food', desc: 'High-density seasonal greens, legumes, and fresh caloric supplies.' },
      { id: 'preserved_vegetables', name: 'Preserved Vegetables', category: 'food', desc: 'Fermented krauts, lacto-pickled roots, and dehydrated tomato pastes.' },
      { id: 'battery_storage_racks', name: 'Battery Storage Racks', category: 'energy', desc: 'Modular 48V stationary battery frame mounts with busbar interconnects.' }
    ]
  },
  alburni: {
    id: 'alburni',
    name: 'Alburni Karst Commons',
    region: 'Cilento & Alburni Karst Massif (Italy)',
    specialty: 'Karst Hydrology & Timber Commons',
    distanceKm: 520,
    signal: '89% (Mountain Ridge LOS)',
    affinity: 90,
    tradeHistoryCount: 0,
    icon: '🌲',
    exports: [
      { id: 'structural_chestnut_beams', name: 'Structural Chestnut Beams', category: 'materials', desc: 'Naturally rot-resistant sustainable timber beams for MHU framing.' },
      { id: 'spring_water_bladders', name: 'Spring Water Bladders', category: 'hydrology', desc: 'Food-grade 200L bladders of mineral-rich high-karst spring water.' },
      { id: 'olive_oil', name: 'Centuries-Old Olive Oil', category: 'food', desc: 'Cold-pressed extra-virgin olive oil rich in caloric and medicinal value.' }
    ],
    demands: [
      { id: 'solar_inverters', name: 'Solar Inverters', category: 'energy', desc: 'High-efficiency pure sine wave MPPT micro-inverters.' },
      { id: 'pump_solenoids', name: 'Water Pump Solenoids', category: 'hydrology', desc: '12V/24V high-reliability solenoids for deep karst siphon networks.' },
      { id: 'mesh_tablets', name: 'Educational Mesh Tablets', category: 'electronics', desc: 'Solar-powered e-paper Reticulum mesh terminals for youth forestry apprentices.' }
    ]
  },
  barbagia: {
    id: 'barbagia',
    name: 'Barbagia Agroforestry Node',
    region: 'Gennargentu Highland Commons, Sardinia (Italy)',
    specialty: 'Highland Agroforestry & Wool Composites',
    distanceKm: 610,
    signal: '86% (Tyrrhenian Island Gateway)',
    affinity: 85,
    tradeHistoryCount: 0,
    icon: '🐑',
    exports: [
      { id: 'wool_insulation_mats', name: 'Compressed Bio-Insulation Wool Mats', category: 'materials', desc: 'Natural sheep wool acoustic and thermal insulation panels for eco-dwellings.' },
      { id: 'goat_cheese', name: 'Aged Mountain Goat Cheese', category: 'food', desc: 'Dense protein and mineral rich hard cheese with multi-year cellar shelf life.' },
      { id: 'heirloom_legume_seeds', name: 'Heirloom Legume Seeds', category: 'agriculture', desc: 'Drought-hardy mountain fava, chickpea, and grass pea landraces.' }
    ],
    demands: [
      { id: '3d_filament', name: '3D Printing Filament', category: 'materials', desc: 'Recycled PETG and PLA spools for repairing pastoral machinery and tools.' },
      { id: 'bio_sensors', name: 'Bio-Sensors', category: 'electronics', desc: 'Soil microbial respiration and rangeland moisture telemetry probes.' },
      { id: 'water_membranes', name: 'Water Purification Membranes', category: 'hydrology', desc: 'Nanofiltration hollow-fiber cartridges for remote pastoral springs.' }
    ]
  }
};

export class GameState {
  constructor() {
    this.listeners = new Map();

    // Default Starting Configuration
    this.data = {
      version: 1,
      day: 1,
      hour: 6, // Dawn arrival at 06:00
      isNight: false,
      speed: 1, // 0 = pause, 1 = normal, 2 = fast, 5 = hyper
      
      // Pioneer Roster (The 3 Travelers)
      player: {
        name: 'Alex',
        vocationId: 'electrician', // 'builder' | 'electrician' | 'gardener'
        roleTitle: 'The Electrician',
        icon: '⚡',
        appearance: {
          gender: 'M',
          hairStyle: 'fade',
          hairColor: '#1e293b',
          skinTone: '#fbb77a'
        }
      },
      companions: [
        {
          id: 'maya',
          name: 'Maya',
          vocationId: 'builder',
          roleTitle: 'The Builder',
          icon: '🔨',
          status: 'Resting by camper van',
          appearance: {
            gender: 'F',
            hairStyle: 'ponytail',
            hairColor: '#78350f',
            skinTone: '#fed7aa'
          }
        },
        {
          id: 'leo',
          name: 'Leo',
          vocationId: 'gardener',
          roleTitle: 'The Gardener',
          icon: '🥗',
          status: 'Inspecting topsoil',
          appearance: {
            gender: 'M',
            hairStyle: 'beard',
            hairColor: '#3b1d11',
            skinTone: '#92400e'
          }
        }
      ],

      // Settlement Coordinates & Bioregion
      location: {
        name: 'Val di Susa Seed',
        bioregion: 'Alpine Temperate Valleys',
        lat: 45.138,
        lng: 7.054,
        timezoneOffset: 1
      },

      // Day 1 Emergency Van Starter Stocks
      resources: {
        energyStoredKwh: 45.0,     // Van auxiliary AGM battery bank
        energyCapacityKwh: 100.0,
        waterLiters: 850.0,        // Van fresh water tanks
        waterCapacityL: 2000.0,
        foodKcal: 132000.0,        // ~20 days baseline dry rations in camper van storage buckets
        emergencyPantryCaches: 3,  // 3 sealed emergency caches in camper van under-bed compartment
        wasteKg: 12.0
      },

      // Bioregional Dynamic Weather Simulation (Matrix 3: Climate & Thermodynamics)
      weather: {
        tempC: 22,
        sky: 'Crisp Clear Dawn',
        icon: '☀️',
        rainfallMm: 0,
        solarIrradiance: 1.0,
        windSpeedKmh: 12,
        cloudCover: 0.1,
        isCrisis: false
      },

      // Constructed Buildings on Grid
      buildings: [
        {
          id: 'van-0',
          type: 'camper_van',
          name: 'Pioneer Camper Van',
          x: 0,
          y: 0,
          status: 'operational',
          shelterCapacity: 3
        }
      ],

      // Daily Chore Labor Pool & The Extinction Queue (Matrix 5 & Art. 5.4 Automation Trajectory)
      chores: {
        stage: 1, // 1: Manual Bootstrap, 2: FabLab Tooling, 3: Automation Horizon
        dailyPoolHours: 6.0,
        remainingHours: 6.0,
        totalRequiredChoreHours: 8.5,
        freeTimePct: 25,
        loggedToday: [],
        queue: [
          {
            id: 'water_hauling',
            name: 'Manual Cistern Pumping & Hauling',
            hours: 2.0,
            vocation: 'The Gardener',
            automated: false,
            automatedBy: 'ESP32 Float Solenoids',
            unlockCondition: 'Auto-Valves required'
          },
          {
            id: 'garden_weeding',
            name: 'Bio-Intensive Weeding & Soil Aeration',
            hours: 2.0,
            vocation: 'The Gardener',
            automated: false,
            automatedBy: 'Open-Source FarmBot Gantry',
            unlockCondition: 'FarmBot required'
          },
          {
            id: 'solar_adjustment',
            name: 'Manual Solar Dusting & Battery Health Check',
            hours: 1.0,
            vocation: 'The Electrician',
            automated: false,
            automatedBy: 'SCADA Crawler Balancer Bot',
            unlockCondition: 'SCADA Bot required'
          },
          {
            id: 'workshop_sorting',
            name: 'Sorting Metal Scrap & Sharpening Drills',
            hours: 1.5,
            vocation: 'The Builder',
            automated: false,
            automatedBy: 'FabLab Cobot Sorter Arm',
            unlockCondition: 'Cobot Arm required'
          },
          {
            id: 'kitchen_prep',
            name: 'Washing Pots, Peeling & Bread Prep',
            hours: 1.0,
            vocation: 'The Chef',
            automated: false,
            automatedBy: 'Sanitization Droid',
            unlockCondition: 'Sanitization Droid required'
          },
          {
            id: 'grounds_sweeping',
            name: 'Sweeping Boardwalks & Clearing Branches',
            hours: 1.0,
            vocation: 'The Builder',
            automated: false,
            automatedBy: 'Aeroponic Mist Drone',
            unlockCondition: 'Mist Drone required'
          }
        ],
        automationsBuilt: []
      },

      // Legacy Debt to Zero ($12,000 baseline)
      debtUsd: 12000,
      fiatEarnedUsd: 0,
      weekendFeastCelebrated: false,
      morale: 100,
      clearingRadius: 340,
      demarchyJuriesCount: 0,
      resolvedDilemmas: [],

      // Construction Kits Catalog (Matrix 1: All 18 Structures + 5 Robots + Capacity Upgrades)
      starterKits: {
        // Tier 1: Survival Triad (Scalable)
        solar_array: { name: 'Bifacial Solar Array', maxLimit: 6, laborCostH: 2.0 },
        rain_cistern: { name: 'Rainwater Cistern', maxLimit: 6, laborCostH: 2.0 },
        garden_bed: { name: 'Permaculture Bed', maxLimit: 8, laborCostH: 2.0, yieldKcalPerDay: 2200 },
        
        // Tier 2: Mesh & Hospitality
        lora_mast: { name: 'LoRa Telemetry Mast', maxLimit: 1, laborCostH: 2.0 },
        guest_dome: { name: 'Geodesic Guest Pavilion', maxLimit: 1, laborCostH: 3.0 },
        reed_bed: { name: 'Greywater Reed Bed', maxLimit: 1, laborCostH: 2.0 },
        
        // Tier 3: Tooling & Automation (Scalable Water & Energy)
        fablab: { name: 'Open-Source FabLab', maxLimit: 1, laborCostH: 4.0 },
        farm_bot: { name: 'FarmBot CNC Gantry', maxLimit: 1, laborCostH: 2.0 },
        auto_valves: { name: 'Auto-Valve Solenoids', maxLimit: 1, laborCostH: 1.5 },
        deep_well: { name: 'Deep Artesian Solar Well', maxLimit: 2, laborCostH: 3.5 },

        // Tier 4: Craft & Hearth (Scalable Battery Storage)
        foundry: { name: 'Metal Foundry & CNC Lathe', maxLimit: 1, laborCostH: 3.5 },
        kitchen_oven: { name: 'Community Kitchen & Hearth', maxLimit: 1, laborCostH: 3.0 },
        clinic: { name: 'Health Clinic & Apothecary', maxLimit: 1, laborCostH: 3.0 },
        battery_bank: { name: 'Sodium Battery Storage Rack', maxLimit: 3, laborCostH: 3.0 },

        // Tier 5: Ecology & Knowledge (Scalable Retention Swales)
        food_forest: { name: 'Food Forest & Apiary Hives', maxLimit: 2, laborCostH: 3.0 },
        school: { name: 'Open School & Seed Library', maxLimit: 1, laborCostH: 3.0 },
        elder_sanctuary: { name: 'Elder Sanctuary Cabins', maxLimit: 2, laborCostH: 3.0 },
        retention_swale: { name: 'Perennial Retention Swale', maxLimit: 2, laborCostH: 3.5 },

        // Tier 6: The Agora & Megaprojects
        agora: { name: 'Agora Socratic Amphitheater', maxLimit: 1, laborCostH: 4.0 },
        biogas_digester: { name: 'Anaerobic Biogas Digester', maxLimit: 1, laborCostH: 4.0 },
        seed_vault: { name: 'Deep Heirloom Seed Vault', maxLimit: 1, laborCostH: 3.5 },
        solar_thermal_tower: { name: 'Solar Molten Salt Tower', maxLimit: 1, laborCostH: 5.0 },

        // Cybernetic Autonomous Units (Matrix 4)
        mist_drone: { name: 'Aeroponic Mist Drone', maxLimit: 1, laborCostH: 2.0 },
        scada_bot: { name: 'SCADA Crawler Balancer Bot', maxLimit: 1, laborCostH: 2.5 },
        sanitization_droid: { name: 'Sanitization Droid', maxLimit: 1, laborCostH: 2.0 },
        cobot_arm: { name: 'FabLab Cobot Sorter Arm', maxLimit: 1, laborCostH: 3.0 },

        // Modular Habitat Units (Art. 4 Usufruct Dwelling Commons)
        mhu_dwelling: { name: 'Modular Habitat Unit (MHU)', maxLimit: 50, laborCostH: 4.0, district: 'mhu_ecovillage' },

        // Bioregional Multi-District Infrastructure (Eco-City Scale)
        aquaponics_greenhouse: { name: 'Solar Aquaponics Greenhouse', maxLimit: 2, laborCostH: 3.5, yieldKcalPerDay: 6000, district: 'agro_belt' },
        grain_silo: { name: 'Heirloom Grain Silo (30k kcal)', maxLimit: 2, laborCostH: 3.0, district: 'agro_belt' },
        heavy_gantry_mill: { name: '5-Axis LinuxCNC Gantry Mill', maxLimit: 1, laborCostH: 4.0, district: 'fablab_quarter' },
        solar_foundry: { name: 'Inductive Solar Foundry', maxLimit: 1, laborCostH: 3.5, district: 'fablab_quarter' },
        trike_depot: { name: 'Electric Cargo Trike Depot', maxLimit: 1, laborCostH: 3.0, district: 'transit_hub' },
        drone_vertiport: { name: 'Autonomous Courier Vertiport', maxLimit: 1, laborCostH: 3.5, district: 'transit_hub' }
      },

      // Reticulum Mesh Inter-Node Logistics & Sabbaticals (Art. 4.2 & Model C Federation)
      fleet: [],
      convoys: [],
      sabbaticals: [],
      unlockedSchematics: [],
      sisterNodes: {
        monte_sole: {
          id: 'monte_sole',
          name: 'Monte Sole Permaculture Hub',
          region: 'Northern Apennines (Italy)',
          distanceKm: 320,
          signal: '98% (LoRa Repeater Chain)',
          specialty: 'Solar Stirling Concentrators & Chestnut Flour',
          affinity: 100,
          tradeHistoryCount: 0,
          icon: '⛰️'
        },
        ...JSON.parse(JSON.stringify(REGIONAL_PARTNER_NODES)),
        serra_estrela: {
          id: 'serra_estrela',
          name: 'Serra da Estrela Mountain Node',
          region: 'Central Massif (Portugal)',
          distanceKm: 1740,
          signal: '88% (Mesh Gateway)',
          specialty: 'Micro-Hydro Pelton Wheels & Lanital Wool Insulation',
          affinity: 85,
          tradeHistoryCount: 0,
          icon: '🏔️'
        },
        detroit_delray: {
          id: 'detroit_delray',
          name: 'Detroit Delray Anchor Node',
          region: 'Rust Belt Great Lakes (USA)',
          distanceKm: 6850,
          signal: '92% (LoRa via Satellite Gateway)',
          specialty: 'Heavy 5-Axis Gantry Milling & Cast Iron Metallurgy',
          affinity: 80,
          tradeHistoryCount: 0,
          icon: '🏭'
        },
        rojava: {
          id: 'rojava',
          name: 'Rojava Agroecological Node',
          region: 'Fertile Crescent (Syria)',
          distanceKm: 2840,
          signal: '90% (Decentralized Mesh Repeater)',
          specialty: 'Heritage Emmer Grains & Demarchic Agora Sortition',
          affinity: 85,
          tradeHistoryCount: 0,
          icon: '🌾'
        }
      },

      // Bioregional Multi-District Eco-City Network (5 Canonical Districts)
      districts: {
        agora_core: {
          id: 'agora_core',
          name: 'Civic Agora & Demarchy Core',
          icon: '🏛️',
          tag: 'Art. 2 & 3 Assembly',
          center: { x: 0, y: -115 },
          radius: 140,
          unlocked: true,
          description: 'Athenian sortition amphitheater, living constitution archive, elder sanctuary, LoRa mesh mast.',
          vocationFocus: ['mediator', 'elder', 'telemetry'],
          color: '#38bdf8',
          stats: { residents: 4, powerDrawKw: 3.5, output: 'Demarchic Consensus' }
        },
        agro_belt: {
          id: 'agro_belt',
          name: 'Agroecological Commons Belt',
          icon: '🌾',
          tag: 'Permaculture & Food Forestry',
          center: { x: -320, y: 220 },
          radius: 200,
          unlocked: true,
          description: 'Syntropic food forest, keyline swales, automated FarmBot rows, aquaponics passive solar greenhouse.',
          vocationFocus: ['gardener', 'farmer', 'scout'],
          color: '#10b981',
          stats: { residents: 6, powerDrawKw: 2.0, output: '+18.5k kcal/day' }
        },
        fablab_quarter: {
          id: 'fablab_quarter',
          name: 'FabLab & Circular Industrial Quarter',
          icon: '⚙️',
          tag: 'Open Hardware & Heavy Tooling',
          center: { x: 340, y: -30 },
          radius: 190,
          unlocked: true,
          description: '5-axis LinuxCNC gantry mill, recycled filament extruder, induction solar foundry, cobots.',
          vocationFocus: ['builder', 'electrician', 'machinist'],
          color: '#f59e0b',
          stats: { residents: 5, powerDrawKw: 6.5, output: '4.0x Tooling & Drones' }
        },
        mhu_ecovillage: {
          id: 'mhu_ecovillage',
          name: 'Modular Habitat (MHU) Ecovillage',
          icon: '🏡',
          tag: 'Dynamic Usufruct Living (Art. 4)',
          center: { x: -340, y: -80 },
          radius: 190,
          unlocked: true,
          description: 'CLT geodesic residential clusters, greywater reed-bed wetland, communal kitchen hearth, health clinic.',
          vocationFocus: ['water_tech', 'medic', 'chef', 'educator'],
          color: '#a855f7',
          stats: { residents: 8, powerDrawKw: 4.0, output: '65% Water Recycled' }
        },
        transit_hub: {
          id: 'transit_hub',
          name: 'Intermodal Transit & Vertiport Hub',
          icon: '🚆',
          tag: 'Reticulum Regional Logistics',
          center: { x: 300, y: 280 },
          radius: 180,
          unlocked: true,
          description: 'Solar cargo trike maintenance bay, autonomous courier vertiport pads, bulk microgrid battery intertie.',
          vocationFocus: ['logistics', 'pilot', 'courier'],
          color: '#06b6d4',
          stats: { residents: 4, powerDrawKw: 5.0, output: 'Active Convoys' }
        }
      },

      // Pinned Active Objective
      objective: {
        id: 'obj-day1-solar',
        title: 'Step 1: Set Up Solar Array before Sunset',
        description: 'Mount 3 bifacial panels to keep lights, fridge and pumps powered tonight.',
        current: 0,
        target: 1,
        unit: 'array',
        reward: 'Unlocks: Rainwater Cistern blueprint'
      }
    };

    // Load any existing save
    this.load();
  }

  // Pub/Sub Event System
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(fn => {
        try { fn(payload, this.data); } catch (e) { console.error(`[GameState Event Error: ${event}]`, e); }
      });
    }
  }

  // Mutators
  setPlayerProfile(name, vocationId, appearance = null) {
    const roles = {
      builder: {
        id: 'builder',
        title: 'The Builder',
        icon: '🔨',
        defaultName: 'Maya',
        defaultAppearance: { gender: 'F', hairStyle: 'ponytail', hairColor: '#78350f', skinTone: '#fed7aa' }
      },
      electrician: {
        id: 'electrician',
        title: 'The Electrician',
        icon: '⚡',
        defaultName: 'Alex',
        defaultAppearance: { gender: 'M', hairStyle: 'fade', hairColor: '#1e293b', skinTone: '#fbb77a' }
      },
      gardener: {
        id: 'gardener',
        title: 'The Gardener',
        icon: '🥗',
        defaultName: 'Leo',
        defaultAppearance: { gender: 'M', hairStyle: 'beard', hairColor: '#3b1d11', skinTone: '#92400e' }
      }
    };

    const chosen = roles[vocationId] || roles.electrician;
    this.data.player.name = (name || '').trim() || chosen.defaultName;
    this.data.player.vocationId = chosen.id;
    this.data.player.roleTitle = chosen.title;
    this.data.player.icon = chosen.icon;

    if (appearance) {
      this.data.player.appearance = { ...(this.data.player.appearance || chosen.defaultAppearance), ...appearance };
    } else if (!this.data.player.appearance) {
      this.data.player.appearance = { ...chosen.defaultAppearance };
    }

    // Remaining two become loyal companions
    const otherKeys = Object.keys(roles).filter(k => k !== chosen.id);
    this.data.companions = otherKeys.map(k => {
      const r = roles[k];
      return {
        id: r.id,
        name: r.defaultName,
        vocationId: r.id,
        roleTitle: r.title,
        icon: r.icon,
        status: 'Unloading camper van gear',
        appearance: { ...r.defaultAppearance }
      };
    });

    this.save();
    this.emit('player_updated', this.data.player);
  }

  updatePlayerAppearance(appearance) {
    if (!this.data.player.appearance) {
      this.data.player.appearance = {
        gender: 'M',
        hairStyle: 'fade',
        hairColor: '#1e293b',
        skinTone: '#fbb77a'
      };
    }
    this.data.player.appearance = { ...this.data.player.appearance, ...appearance };
    this.save();
    this.emit('appearance_updated', this.data.player.appearance);
    return this.data.player.appearance;
  }

  setLocation(locationObj) {
    this.data.location = { ...this.data.location, ...locationObj };
    this.save();
    this.emit('location_updated', this.data.location);
  }

  recalculateLaborBudget() {
    if (!this.data.chores || !Array.isArray(this.data.chores.queue)) return;
    const manualHours = this.data.chores.queue
      .filter(c => !c.automated)
      .reduce((sum, c) => sum + c.hours, 0);
    this.data.chores.totalRequiredChoreHours = manualHours;
    const freePct = Math.round(((24 - (manualHours * 3)) / 24) * 100);
    this.data.chores.freeTimePct = Math.max(25, Math.min(95, freePct));
    this.save();
    this.emit('chores_updated', this.data.chores);
  }

  extinguishChore(choreId, automationName) {
    if (!this.data.chores || !Array.isArray(this.data.chores.queue)) return;
    const item = this.data.chores.queue.find(c => c.id === choreId);
    if (item && !item.automated) {
      item.automated = true;
      item.automatedAt = Date.now();
      if (!this.data.chores.automationsBuilt.includes(automationName)) {
        this.data.chores.automationsBuilt.push(automationName);
      }
      this.recalculateLaborBudget();
      this.emit('chore_extinguished', { item, automationName });
    }
  }

  reconcileStateAndObjectives() {
    const buildings = this.data.buildings || [];
    const has = (type) => buildings.some(b => b.type === type);
    const debt = this.data.debtUsd !== undefined ? this.data.debtUsd : 12000;

    let target = null;

    if (!has('solar_array')) {
      target = {
        id: 'obj-day1-solar',
        title: 'Step 1: Set Up Solar Array before Sunset',
        description: 'Mount 3 bifacial panels to keep lights, fridge and pumps powered tonight.',
        current: 0,
        target: 1,
        unit: 'array',
        reward: 'Unlocks: Rainwater Cistern blueprint'
      };
    } else if (!has('rain_cistern')) {
      target = {
        id: 'obj-day2-water',
        title: 'Step 2: Collect Rainwater before Day 3',
        description: 'Set up a food-grade cistern to catch clean roof runoff.',
        current: 0,
        target: 1,
        unit: 'cistern',
        reward: 'Unlocks: Permaculture Garden Bed'
      };
    } else if (!has('garden_bed')) {
      target = {
        id: 'obj-day3-food',
        title: 'Step 3: Plant Fresh Greens in Garden Bed',
        description: 'Build a bio-intensive garden bed for fresh daily calories.',
        current: 0,
        target: 1,
        unit: 'bed',
        reward: 'Unlocks: LoRa Radio Mast Blueprint'
      };
    } else if (!has('lora_mast')) {
      target = {
        id: 'obj-day4-lora',
        title: 'Step 4: Erect LoRa Telemetry Mast',
        description: 'Connect to the Reticulum mesh for 48h weather radar and regional trade.',
        current: 0,
        target: 1,
        unit: 'mast',
        reward: 'Unlocks: 48h Weather Forecasts'
      };
    } else if (!has('guest_dome')) {
      target = {
        id: 'obj-day6-guest',
        title: 'Step 6: Welcome Nico & Build Guest Dome',
        description: 'Nico (IoT & Telemetry Engineer) arrives on Day 6! Build the Geodesic Dome to house them.',
        current: 0,
        target: 1,
        unit: 'dome',
        reward: 'Unlocks: Saturday Commons Feast'
      };
    } else if (!has('reed_bed')) {
      target = {
        id: 'obj-day8-reed',
        title: 'Step 8: Construct Greywater Reed Bed',
        description: 'Recycle domestic greywater through biological gravel reed beds.',
        current: 0,
        target: 1,
        unit: 'filter',
        reward: 'Unlocks: Elena Arrival & FabLab Blueprint'
      };
    } else if (!has('fablab')) {
      target = {
        id: 'obj-day10-fablab',
        title: 'Step 9: Construct Open-Source FabLab Shed',
        description: 'Build the workshop with CNC mill and 3D printers to manufacture tools and slash land debt.',
        current: 0,
        target: 1,
        unit: 'shed',
        reward: 'Unlocks: 3D CAD Viewer & CNC Manufacturing Contracts'
      };
    } else if (!has('farm_bot')) {
      target = {
        id: 'obj-day11-farmbot',
        title: 'Step 10: Assemble FarmBot CNC Gantry',
        description: 'Build agricultural CNC robot in FabLab to extinguish garden weeding forever!',
        current: 0,
        target: 1,
        unit: 'robot',
        reward: 'CHORE EXTINCTION: Garden Weeding (-2h toil!)'
      };
    } else if (!has('auto_valves')) {
      target = {
        id: 'obj-day12-valves',
        title: 'Step 11: Deploy ESP32 Subsurface Auto-Valves',
        description: 'Automate gravity cistern pumping with solar micro-relays.',
        current: 0,
        target: 1,
        unit: 'valves',
        reward: 'CHORE EXTINCTION: Water Hauling (-2h toil!)'
      };
    } else if (debt > 0) {
      const paid = Math.max(0, 12000 - debt);
      target = {
        id: 'obj-day13-debt',
        title: 'Step 12: Clear Remaining Land Debt ($12,000 ➔ $0)',
        description: 'Fulfill high-value CNC machining and CAD contracts in the FabLab to achieve total land sovereignty.',
        current: paid,
        target: 12000,
        unit: '$',
        reward: 'Total Land Sovereignty & Unlocks Metal Foundry'
      };
    } else if (!has('foundry')) {
      target = {
        id: 'obj-day15-foundry',
        title: 'Step 15: Erect Open-Source Metal Foundry',
        description: 'Cast local recycled scrap aluminium and brass into heavy structural fittings.',
        current: 0,
        target: 1,
        unit: 'foundry',
        reward: 'Unlocks: Tomas the Blacksmith & Communal Hearth'
      };
    } else if (!has('kitchen_oven')) {
      target = {
        id: 'obj-day16-kitchen',
        title: 'Step 16: Build Community Kitchen with Soraya',
        description: 'Build outdoor dining hearth & bread oven for shared long-table feasts (+15% Nutrition).',
        current: 0,
        target: 1,
        unit: 'kitchen',
        reward: 'Unlocks: Health Clinic & Clara the Medic'
      };
    } else {
      target = {
        id: 'obj-stage-sovereign',
        title: 'Stage Complete: Resilient Haven Thriving',
        description: 'Core infrastructure operational. Continue expanding commons toward full ecological sovereignty.',
        current: 1,
        target: 1,
        unit: 'milestone',
        reward: '🌟 Deep Autonomy Achieved'
      };
    }

    const prev = this.data.objective;
    const changed = !prev || prev.id !== target.id || prev.current !== target.current;
    if (changed) {
      this.data.objective = target;
      this.save();
      this.emit('objective_updated', this.data.objective);
    }
    return target;
  }

  // --- Bioregional District Multi-Scale Governance ---

  getDistricts() {
    return Object.values(this.data.districts || {});
  }

  getDistrict(id) {
    return this.data.districts?.[id] || null;
  }

  getDistrictForCoord(x, y) {
    const districts = this.getDistricts();
    let closest = null;
    let minDistance = Infinity;

    for (const d of districts) {
      const dx = x - d.center.x;
      const dy = y - d.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= d.radius) {
        return d; // Inside district radius
      }
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    }
    return closest || districts[0] || null;
  }

  getDistrictMetrics(districtId) {
    const d = this.getDistrict(districtId);
    if (!d) return null;

    const buildings = (this.data.buildings || []).filter(b => {
      const bd = this.getDistrictForCoord(b.x, b.y);
      return bd && bd.id === districtId;
    });

    const pioneers = (this.data.companions || []).filter(c => {
      return Array.isArray(d.vocationFocus) && d.vocationFocus.includes(c.vocationId);
    });

    return {
      district: d,
      buildingCount: buildings.length,
      buildings,
      workerCount: pioneers.length + (d.id === 'agora_core' ? 1 : 0),
      workers: pioneers,
      powerDrawKw: d.stats?.powerDrawKw || 2.5,
      outputSummary: d.stats?.output || 'Operational'
    };
  }

  unlockDistrict(districtId) {
    if (this.data.districts?.[districtId]) {
      this.data.districts[districtId].unlocked = true;
      this.save();
      this.emit('district_unlocked', this.data.districts[districtId]);
      return { ok: true, district: this.data.districts[districtId] };
    }
    return { ok: false, reason: 'District not found' };
  }

  getClearingRadius() {
    const pop = (this.data.companions?.length || 2) + 1;
    const mhuCount = (this.data.buildings || []).filter(b => ['mhu_dwelling', 'mhu', 'guest_dome'].includes(b.type)).length;
    const day = this.data.day || 1;

    if (pop >= 20 || mhuCount >= 8 || day >= 21) {
      // Stage 3: Full Dunbar cell with 3 residential pods (750px - 900px)
      const extra = Math.min(150, (pop - 20) * 5 + mhuCount * 3);
      return 750 + Math.max(0, extra);
    } else if (pop >= 6 || mhuCount >= 2 || day >= 8) {
      // Stage 2: Pod A & B clearings expand naturally (520px)
      return 520;
    } else {
      // Stage 1: Seed Campsite (340px)
      return 340;
    }
  }

  checkClearingExpansion() {
    const currentRadius = this.getClearingRadius();
    if (!this.data.clearingRadius) {
      this.data.clearingRadius = currentRadius;
    } else if (currentRadius > this.data.clearingRadius) {
      const prevRadius = this.data.clearingRadius;
      this.data.clearingRadius = currentRadius;
      this.emit('clearing_expanded', { prevRadius, newRadius: currentRadius, day: this.data.day });
      this.save();
    }
  }

  canBuild(type) {
    const count = (this.data.buildings || []).filter(b => b.type === type).length;
    const kit = this.data.starterKits?.[type] || { maxLimit: 1, laborCostH: 2.0 };
    const maxAllowed = kit.maxLimit !== undefined ? kit.maxLimit : (kit.maxDays1to5 || 1);
    if (count >= maxAllowed) {
      return { ok: false, reason: `Max built! (${count}/${maxAllowed})` };
    }
    if ((this.data.chores?.remainingHours || 0) < kit.laborCostH) {
      return { ok: false, reason: `Need ${kit.laborCostH}h pioneer labor today! Rest to dawn.` };
    }
    return { ok: true, laborCostH: kit.laborCostH };
  }

  performConsulting(hours = 2.0, payout = null) {
    if ((this.data.chores?.remainingHours || 0) < hours) {
      return { ok: false, reason: `Need ${hours}h pioneer labor today!` };
    }
    this.data.chores.remainingHours -= hours;
    const earned = payout !== null ? payout : Math.round(hours * 150); // $150/hr remote engineering / CAD consulting
    this.data.fiatEarnedUsd = (this.data.fiatEarnedUsd || 0) + earned;
    this.data.debtUsd = Math.max(0, (this.data.debtUsd || 12000) - earned);
    this.reconcileStateAndObjectives();
    this.save();
    this.emit('debt_updated', { debtUsd: this.data.debtUsd, earned });
    return { ok: true, earned, remainingDebt: this.data.debtUsd };
  }

  celebrateWeekendFeast() {
    this.data.weekendFeastCelebrated = true;
    this.data.resources.foodKcal = Math.max(0, this.data.resources.foodKcal - 2500);
    if (this.data.objective?.id === 'obj-day7-feast') {
      this.data.objective = {
        id: 'obj-day8-reed',
        title: 'Step 8: Construct Greywater Reed Bed with Elena',
        description: 'Elena has arrived! Build a horizontal gravel reed bed to recycle 65% of domestic water.',
        current: 0,
        target: 1,
        unit: 'reed bed',
        reward: 'Unlocks: 65% Water Recirculation'
      };
    }
    this.save();
    this.emit('feast_celebrated', { day: this.data.day });
    this.emit('resources_updated', this.data.resources);
    this.emit('objective_updated', this.data.objective);
  }

  orderEmergencyWaterTanker() {
    let cost = 150;
    if ((this.data.fiatEarnedUsd || 0) < cost) {
      if ((this.data.chores?.remainingHours || 0) >= 2.0) {
        this.data.chores.remainingHours -= 2.0;
        this.data.fiatEarnedUsd = (this.data.fiatEarnedUsd || 0) + 150;
      } else {
        return { ok: false, reason: 'Need $150 fiat or 2.0h labor to earn emergency delivery fee!' };
      }
    }
    this.data.fiatEarnedUsd -= cost;
    const addedL = 1000;
    this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + addedL);
    this.save();
    this.emit('resources_updated', this.data.resources);
    return { ok: true, amountL: addedL, remainingFiat: this.data.fiatEarnedUsd };
  }

  pumpEmergencyAquiferWater() {
    if ((this.data.chores?.remainingHours || 0) < 2.0) {
      return { ok: false, reason: 'Need 2.0h pioneer labor to hand-pump groundwater!' };
    }
    this.data.chores.remainingHours -= 2.0;
    const addedL = 300;
    this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + addedL);
    this.save();
    this.emit('resources_updated', this.data.resources);
    return { ok: true, amountL: addedL };
  }

  deployAtmosphericDewCatchers() {
    if ((this.data.chores?.remainingHours || 0) < 1.5) {
      return { ok: false, reason: 'Need 1.5h pioneer labor to deploy dew nets!' };
    }
    this.data.chores.remainingHours -= 1.5;
    const addedL = 150;
    this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + addedL);
    this.save();
    this.emit('resources_updated', this.data.resources);
    return { ok: true, amountL: addedL };
  }

  requestMeshEmergencyWater() {
    const hasLora = this.data.buildings?.some(b => b.type === 'lora_mast');
    if (!hasLora) {
      return { ok: false, reason: 'LoRa Telemetry Mast required to broadcast distress call to sister nodes!' };
    }
    const addedL = 500;
    this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + addedL);
    this.save();
    this.emit('resources_updated', this.data.resources);
    return { ok: true, amountL: addedL };
  }

  /* -------------------------------------------------------------
   * Reticulum Mesh Logistics & Sabbatical Exchange Protocol
   * ----------------------------------------------------------- */
  dispatchCargoConvoy({ targetNodeId, vehicleType = 'trike', offerType, requestType }) {
    const node = this.data.sisterNodes?.[targetNodeId];
    if (!node) return { ok: false, reason: 'Invalid target sister node.' };

    const energyCost = vehicleType === 'drone' ? 6.0 : 3.0;
    if ((this.data.resources.energyStoredKwh || 0) < energyCost) {
      return { ok: false, reason: `Need ${energyCost} kWh stored battery power to charge the ${vehicleType === 'drone' ? 'Courier Drone' : 'Solar Cargo Trike'}!` };
    }

    if (offerType === 'energy') {
      if ((this.data.resources.energyStoredKwh || 0) < energyCost + 15.0) {
        return { ok: false, reason: `Need at least 15 kWh surplus energy (plus ${energyCost} kWh vehicle charge) to pack a power canister!` };
      }
      this.data.resources.energyStoredKwh -= (energyCost + 15.0);
    } else if (offerType === 'food') {
      if ((this.data.resources.foodKcal || 0) < 4000) {
        return { ok: false, reason: 'Need at least 4,000 kcal food reserve to export organic harvest produce!' };
      }
      this.data.resources.energyStoredKwh -= energyCost;
      this.data.resources.foodKcal -= 4000;
    } else if (offerType === 'water') {
      if ((this.data.resources.waterLiters || 0) < 1000) {
        return { ok: false, reason: 'Need at least 1,000 L water reserve to export pure filtered rainwater!' };
      }
      this.data.resources.energyStoredKwh -= energyCost;
      this.data.resources.waterLiters -= 1000;
    } else if (offerType === 'tooling') {
      const hasFablab = this.data.buildings?.some(b => b.type === 'fablab');
      if (!hasFablab) {
        return { ok: false, reason: 'Open-Source FabLab required to machine precision tooling exports!' };
      }
      if ((this.data.chores?.remainingHours || 0) < 2.0) {
        return { ok: false, reason: 'Need 2.0h pioneer labor to CNC machine precision tooling!' };
      }
      this.data.chores.remainingHours -= 2.0;
      this.data.resources.energyStoredKwh -= energyCost;
    } else {
      return { ok: false, reason: 'Unknown offer cargo type.' };
    }

    let transitDays = 1;
    if (vehicleType === 'drone') {
      transitDays = node.distanceKm > 4000 ? 2 : 1;
    } else {
      if (node.distanceKm > 3000) transitDays = 3;
      else if (node.distanceKm > 500) transitDays = 2;
      else transitDays = 1;
    }

    const convoy = {
      id: `convoy-${Date.now().toString(36)}`,
      targetNodeId,
      targetNodeName: node.name,
      vehicleType,
      offerType,
      requestType,
      departureDay: this.data.day,
      arrivalDay: this.data.day + transitDays,
      daysRemaining: transitDays,
      status: 'in_transit'
    };

    if (!Array.isArray(this.data.convoys)) this.data.convoys = [];
    this.data.convoys.push(convoy);

    this.save();
    this.emit('convoy_dispatched', convoy);
    this.emit('resources_updated', this.data.resources);
    return { ok: true, convoy };
  }

  sendPioneerOnSabbatical({ pioneerId, targetNodeId }) {
    const node = this.data.sisterNodes?.[targetNodeId];
    if (!node) return { ok: false, reason: 'Invalid target sister node.' };

    let pioneer = null;
    let isPlayer = false;
    const pidLower = (pioneerId || '').toLowerCase();
    if (this.data.player?.id === pioneerId || pidLower === 'player' || (this.data.player?.name && this.data.player.name.toLowerCase() === pidLower)) {
      pioneer = this.data.player;
      isPlayer = true;
    } else {
      pioneer = (this.data.companions || []).find(c => 
        c.id === pioneerId || 
        c.id.toLowerCase() === pidLower ||
        (c.name && c.name.toLowerCase() === pidLower)
      );
    }

    if (!pioneer) return { ok: false, reason: 'Pioneer not found.' };
    if (this.data.sabbaticals?.some(s => s.pioneerId === pioneerId && s.status === 'active')) {
      return { ok: false, reason: `${pioneer.name} is already away on sabbatical!` };
    }

    const perkName = `${node.name.split(' ')[0]} Master Scholar`;
    const sabbatical = {
      id: `sabbatical-${Date.now().toString(36)}`,
      pioneerId,
      pioneerName: pioneer.name,
      isPlayer,
      targetNodeId,
      targetNodeName: node.name,
      departureDay: this.data.day,
      arrivalDay: this.data.day + 2,
      daysRemaining: 2,
      perkEarned: perkName,
      status: 'active'
    };

    pioneer.status = `On Sabbatical Exchange at ${node.name}`;

    if (!Array.isArray(this.data.sabbaticals)) this.data.sabbaticals = [];
    this.data.sabbaticals.push(sabbatical);

    this.save();
    this.emit('sabbatical_started', sabbatical);
    return { ok: true, sabbatical };
  }

  deliverConvoyCargo(convoy) {
    const req = convoy.requestType;
    let rewardSummary = '';

    if (!Array.isArray(this.data.unlockedSchematics)) {
      this.data.unlockedSchematics = [];
    }

    if (req === 'chestnuts') {
      const added = 3500;
      this.data.resources.foodKcal += added;
      rewardSummary = `+${added.toLocaleString()} kcal Heirloom Roasted Chestnuts`;
    } else if (req === 'spirulina') {
      const added = 4500;
      this.data.resources.foodKcal += added;
      rewardSummary = `+${added.toLocaleString()} kcal Spirulina Protein Flakes`;
    } else if (req === 'wool_insulation') {
      if (!this.data.unlockedSchematics.includes('lanital_insulation')) {
        this.data.unlockedSchematics.push('lanital_insulation');
      }
      rewardSummary = `Lanital Natural Wool Greenhouse Thermal Burlap (0% Freeze Risk)`;
    } else if (req === 'carbide_bits') {
      if (!this.data.unlockedSchematics.includes('carbide_bits')) {
        this.data.unlockedSchematics.push('carbide_bits');
      }
      rewardSummary = `Tungsten Carbide Precision Tooling (+50% Tooling Speed)`;
    } else if (req === 'emmer_wheat') {
      const added = 5000;
      this.data.resources.foodKcal += added;
      rewardSummary = `+${added.toLocaleString()} kcal Heritage Drought-Resistant Emmer Grains`;
    } else if (req === 'schematic_stirling') {
      if (!this.data.unlockedSchematics.includes('solar_stirling_dish')) {
        this.data.unlockedSchematics.push('solar_stirling_dish');
      }
      rewardSummary = `Solar Stirling Dish Schematic (+25 kWh/day Solar Concentrator Blueprint)`;
    } else if (req === 'schematic_geothermal') {
      if (!this.data.unlockedSchematics.includes('geothermal_exchanger')) {
        this.data.unlockedSchematics.push('geothermal_exchanger');
      }
      rewardSummary = `Geothermal Heat Exchanger Blueprint (Zero Winter Thermal Deficit)`;
    } else if (req === 'schematic_pelton') {
      if (!this.data.unlockedSchematics.includes('pelton_wheel')) {
        this.data.unlockedSchematics.push('pelton_wheel');
      }
      rewardSummary = `Pelton Micro-Hydro Wheel Schematic (24/7 Continuous Stream Power)`;
    } else if (req === 'schematic_heavy_mill') {
      if (!this.data.unlockedSchematics.includes('heavy_gantry_mill')) {
        this.data.unlockedSchematics.push('heavy_gantry_mill');
      }
      rewardSummary = `Heavy 5-Axis Gantry Mill Blueprint (Autonomous Machine Tooling)`;
    } else if (req === 'schematic_sortition') {
      if (!this.data.unlockedSchematics.includes('demarchic_corpus')) {
        this.data.unlockedSchematics.push('demarchic_corpus');
      }
      this.data.morale = Math.min(100, (this.data.morale || 85) + 20);
      rewardSummary = `Demarchic Sortition Juror Corpus (+20 Community Morale Boost)`;
    } else {
      const added = 3000;
      this.data.resources.foodKcal += added;
      rewardSummary = `+${added.toLocaleString()} kcal Regional Solidarity Food Surplus`;
    }

    if (this.data.sisterNodes?.[convoy.targetNodeId]) {
      this.data.sisterNodes[convoy.targetNodeId].tradeHistoryCount = (this.data.sisterNodes[convoy.targetNodeId].tradeHistoryCount || 0) + 1;
      this.data.sisterNodes[convoy.targetNodeId].affinity = Math.min(100, (this.data.sisterNodes[convoy.targetNodeId].affinity || 85) + 5);
    }

    return rewardSummary;
  }

  addBuilding(type, x, y, extraProps = {}) {
    const check = this.canBuild(type);
    if (!check.ok) {
      return { error: check.reason };
    }

    // Deduct pioneer labor from daily chore pool
    if (this.data.chores) {
      this.data.chores.remainingHours = Math.max(0, this.data.chores.remainingHours - check.laborCostH);
      this.data.chores.loggedToday = this.data.chores.loggedToday || [];
      this.data.chores.loggedToday.push({
        type,
        hours: check.laborCostH,
        timestamp: Date.now()
      });
    }

    const id = `${type}-${Date.now().toString(36)}`;
    const building = {
      id,
      type,
      x,
      y,
      createdAt: Date.now(),
      status: 'operational',
      ...extraProps
    };

    if (type === 'solar_array') {
      building.name = 'Bifacial Solar Array';
      building.outputKwh = 1.5;
      this.data.resources.energyCapacityKwh += 15;
      this.data.resources.energyStoredKwh = Math.min(this.data.resources.energyCapacityKwh, this.data.resources.energyStoredKwh + 15);
      
      // Update Day 1 objective if active
      if (this.data.objective?.id === 'obj-day1-solar') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day2-water',
            title: 'Step 2: Collect Rainwater before Day 3',
            description: 'Set up a food-grade cistern to catch clean roof runoff.',
            current: 0,
            target: 1,
            unit: 'cistern',
            reward: 'Unlocks: Permaculture Garden Bed'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'rain_cistern') {
      building.name = 'Rainwater Cistern (1,000 L)';
      building.capacityL = 1000;
      this.data.resources.waterCapacityL += 1000;
      this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + 350);

      if (this.data.objective?.id === 'obj-day2-water') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day3-food',
            title: 'Step 3: Plant Fresh Greens in Garden Bed',
            description: 'Build a bio-intensive garden bed for fresh daily calories.',
            current: 0,
            target: 1,
            unit: 'bed',
            reward: 'Unlocks: LoRa Radio Mast Blueprint'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'garden_bed') {
      building.name = 'Permaculture Garden Bed';
      building.yieldKcal = 2200;
      this.data.resources.foodKcal += 2500;

      if (this.data.objective?.id === 'obj-day3-food') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day4-lora',
            title: 'Step 4: Erect LoRa Telemetry Mast',
            description: 'Connect to the Reticulum mesh for 48h weather radar and regional trade.',
            current: 0,
            target: 1,
            unit: 'mast',
            reward: 'Unlocks: 48h Weather Forecasts'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'lora_mast') {
      building.name = 'LoRa Telemetry Mast (Reticulum Mesh)';
      if (this.data.objective?.id === 'obj-day4-lora') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day6-guest',
            title: 'Step 6: Welcome Nico & Build Guest Dome',
            description: 'Nico (IoT & Telemetry Engineer) arrives on Day 6! Build the Geodesic Dome to house them.',
            current: 0,
            target: 1,
            unit: 'dome',
            reward: 'Unlocks: Saturday Commons Feast'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'guest_dome') {
      building.name = 'Civic Geodesic Guest Pavilion';
      building.shelterCapacity = 4;
      if (this.data.objective?.id === 'obj-day6-guest') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day7-feast',
            title: 'Step 7: Host Saturday Commons Feast',
            description: 'Celebrate the founding week! Bake wood-fired sourdough pizzas with your crew.',
            current: 0,
            target: 1,
            unit: 'feast',
            reward: 'Unlocks: Elena Arrival & Greywater Reed Bed'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'reed_bed') {
      building.name = 'Subsurface Greywater Reed Bed';
      if (this.data.objective?.id === 'obj-day8-reed') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.reconcileStateAndObjectives();
        }, 3000);
      }
    } else if (type === 'fablab') {
      building.name = 'Open-Source FabLab Workshop';
      if (this.data.objective?.id === 'obj-day11-fablab') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day12-farmbot',
            title: 'Step 12: Fabricate Open-Source FarmBot Gantry',
            description: 'Build agricultural CNC robot in FabLab to extinguish garden weeding forever!',
            current: 0,
            target: 1,
            unit: 'robot',
            reward: 'CHORE EXTINCTION: Garden Weeding (-2h toil!)'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'farm_bot') {
      building.name = 'FarmBot Open-Source CNC Gantry';
      this.extinguishChore('garden_weeding', 'FarmBot CNC Gantry');
      if (this.data.objective?.id === 'obj-day12-farmbot') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day13-valves',
            title: 'Step 13: Deploy ESP32 Subsurface Auto-Valves',
            description: 'Automate gravity cistern pumping with solar micro-relays.',
            current: 0,
            target: 1,
            unit: 'valves',
            reward: 'CHORE EXTINCTION: Water Hauling (-2h toil!)'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'auto_valves') {
      building.name = 'ESP32 Subsurface Solenoid Valves';
      this.extinguishChore('water_hauling', 'ESP32 Subsurface Solenoid Relay');
      if (this.data.objective?.id === 'obj-day13-valves') {
        this.data.objective.current = 1;
        setTimeout(() => {
          this.data.objective = {
            id: 'obj-day14-sovereign',
            title: 'Step 14: Reach Post-Work Solarpunk Baseline',
            description: 'Rotational chores reduced to <= 2h/day. Human Discretionary Freedom at 85%+!',
            current: 1,
            target: 1,
            unit: 'victory',
            reward: 'Unlocks: Metal Foundry & Tomas the Blacksmith'
          };
          this.save();
          this.emit('objective_updated', this.data.objective);
        }, 3000);
      }
    } else if (type === 'foundry') {
      building.name = 'Metal Foundry & CNC Lathe';
      this.data.fiatEarnedUsd = (this.data.fiatEarnedUsd || 0) + 1500;
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day15-kitchen',
          title: 'Step 15: Build Community Kitchen with Soraya',
          description: 'Build outdoor dining hearth & bread oven for shared long-table feasts (+15% Nutrition).',
          current: 0,
          target: 1,
          unit: 'kitchen',
          reward: 'Unlocks: Health Clinic & Clara the Medic'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'kitchen_oven') {
      building.name = 'Community Kitchen & Bread Hearth';
      this.data.resources.foodKcal += 5000;
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day18-clinic',
          title: 'Step 18: Build Health Clinic & Apothecary',
          description: 'Place clinic cabin in shaded grove for Clara to heal fatigue & brew herbal remedies.',
          current: 0,
          target: 1,
          unit: 'clinic',
          reward: 'Unlocks: Food Forest & Bram the Beekeeper'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'clinic') {
      building.name = 'Health Clinic & Apothecary';
      this.data.morale = Math.min(100, (this.data.morale || 85) + 15);
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day22-forest',
          title: 'Step 22: Plant Food Forest & Apiary Hives',
          description: 'Plant fruit tree canopy and install cedar beehives with Bram for raw honey and wax.',
          current: 0,
          target: 1,
          unit: 'forest',
          reward: 'Unlocks: Open School & Miriam the Educator'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'food_forest') {
      building.name = 'Permaculture Food Forest & Apiary';
      this.data.resources.foodKcal += 8000;
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day26-school',
          title: 'Step 26: Construct Open School & Seed Library',
          description: 'Build open timber pavilion for youth coding, botany and non-GMO seed cataloging.',
          current: 0,
          target: 1,
          unit: 'school',
          reward: 'Unlocks: Elder Sanctuary Cabins'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'school') {
      building.name = 'Open School & Seed Library';
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day28-elder',
          title: 'Step 28: Erect Elder Sanctuary Cabins',
          description: 'Quiet shaded cottages for retired pioneers. Reduces social dilemma friction by 50%!',
          current: 0,
          target: 1,
          unit: 'sanctuary',
          reward: 'Unlocks: Stone Agora Amphitheater'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'elder_sanctuary') {
      building.name = 'Elder Sanctuary Cabins';
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day31-agora',
          title: 'Step 31: Construct Agora Stone Amphitheater',
          description: 'Build hemicycle stone ring with Zayd to activate Demarchy Sortition Juries!',
          current: 0,
          target: 1,
          unit: 'agora',
          reward: '🏛️ DEMARCHY SORTITION ENGINE ACTIVATED'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'agora') {
      building.name = 'Agora Socratic Amphitheater';
      this.emit('agora_activated', {});
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day35-biogas',
          title: 'Step 35: Civic Megaproject: Anaerobic Biogas Digester',
          description: 'Transform organic food waste into continuous cooking methane gas and liquid fertilizer.',
          current: 0,
          target: 1,
          unit: 'digester',
          reward: 'Unlocks: Deep Heirloom Seed Vault'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'biogas_digester') {
      building.name = 'Anaerobic Biogas Digester';
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day40-vault',
          title: 'Step 40: Subterranean Deep Heirloom Seed Vault',
          description: 'Cool underground vault protecting 500+ heirloom crop varieties from blight & drought.',
          current: 0,
          target: 1,
          unit: 'vault',
          reward: 'Unlocks: Solar Molten Salt Thermal Tower'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'seed_vault') {
      building.name = 'Deep Heirloom Seed Vault';
      setTimeout(() => {
        this.data.objective = {
          id: 'obj-day50-tower',
          title: 'Step 50: Central Molten Salt Solar Thermal Tower',
          description: 'Sovereign baseload spire! 24/7 continuous electricity generation day and night.',
          current: 0,
          target: 1,
          unit: 'tower',
          reward: '🌟 Planetary Autonomous Federation Hub'
        };
        this.save();
        this.emit('objective_updated', this.data.objective);
      }, 3000);
    } else if (type === 'solar_thermal_tower') {
      building.name = 'Molten Salt Solar Thermal Tower';
      this.data.resources.energyCapacityKwh += 200;
      this.data.resources.energyStoredKwh += 100;
    } else if (type === 'deep_well') {
      building.name = 'Deep Artesian Solar Well';
      this.data.resources.waterCapacityL += 3000;
      this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + 1000);
    } else if (type === 'battery_bank') {
      building.name = 'Sodium Battery Storage Rack';
      this.data.resources.energyCapacityKwh += 50;
      this.data.resources.energyStoredKwh = Math.min(this.data.resources.energyCapacityKwh, this.data.resources.energyStoredKwh + 30);
    } else if (type === 'retention_swale') {
      building.name = 'Perennial Retention Swale';
      this.data.resources.waterCapacityL += 5000;
    } else if (type === 'mist_drone') {
      building.name = 'Aeroponic Mist Drone';
      this.extinguishChore('grounds_sweeping', 'Aeroponic Mist Drone');
    } else if (type === 'scada_bot') {
      building.name = 'SCADA Solar Balancer Bot';
      this.extinguishChore('solar_adjustment', 'SCADA Crawler Bot');
    } else if (type === 'sanitization_droid') {
      building.name = 'Sanitization & Kitchen Droid';
      this.extinguishChore('kitchen_prep', 'Sanitization Droid');
    } else if (type === 'cobot_arm') {
      building.name = 'FabLab Cobot Sorter Arm';
      this.extinguishChore('workshop_sorting', 'Cobot Arm Sorter');
    } else if (type === 'aquaponics_greenhouse') {
      building.name = 'Solar Aquaponics Greenhouse';
      building.yieldKcal = 6000;
      this.data.resources.foodKcal += 6000;
    } else if (type === 'grain_silo') {
      building.name = 'Heirloom Grain Silo (30k kcal)';
      this.data.resources.foodCapacityKcal = (this.data.resources.foodCapacityKcal || 100000) + 30000;
    } else if (type === 'heavy_gantry_mill') {
      building.name = '5-Axis LinuxCNC Gantry Mill';
      if (!this.data.unlockedSchematics.includes('heavy_gantry_mill')) {
        this.data.unlockedSchematics.push('heavy_gantry_mill');
      }
    } else if (type === 'solar_foundry') {
      building.name = 'Inductive Solar Foundry';
      this.data.fiatEarnedUsd = (this.data.fiatEarnedUsd || 0) + 2000;
    } else if (type === 'trike_depot') {
      building.name = 'Electric Cargo Trike Depot';
      if (!Array.isArray(this.data.fleet)) this.data.fleet = [];
      if (!this.data.fleet.some(v => v.type === 'cargo_trike')) {
        this.commissionVehicle('cargo_trike', 'Solar Cargo Trike Alpha');
      }
    } else if (type === 'drone_vertiport') {
      building.name = 'Autonomous Courier Vertiport';
      if (!Array.isArray(this.data.fleet)) this.data.fleet = [];
      if (!this.data.fleet.some(v => v.type === 'vtol_drone')) {
        this.commissionVehicle('vtol_drone', 'SkyLink VTOL Courier Alpha');
      }
    } else if (type === 'mhu_dwelling') {
      building.name = 'Modular Habitat Unit (MHU)';
      building.shelterCapacity = 3;
      this.data.shelterCapacity = (this.data.shelterCapacity || 3) + 3;
      this.data.morale = Math.min(100, (this.data.morale || 85) + 5);

      const mhuCount = (this.data.buildings.filter(b => b.type === 'mhu_dwelling').length) + 1;
      if (mhuCount >= 3 && !this.data.camperVanRetired) {
        setTimeout(() => {
          this.retireCamperVanToLogistics();
        }, 300);
      }
      if (mhuCount >= 50 && !this.data.dunbarHorizonReached) {
        setTimeout(() => {
          this.triggerDunbarHorizon();
        }, 600);
      }
    }

    this.data.buildings.push(building);
    this.checkClearingExpansion();
    this.reconcileStateAndObjectives();
    this.save();
    this.emit('building_added', building);
    this.emit('resources_updated', this.data.resources);
    this.emit('objective_updated', this.data.objective);
    return building;
  }

  retireCamperVanToLogistics() {
    if (this.data.camperVanRetired) return;
    this.data.camperVanRetired = true;
    this.data.centralAgoraConsecrated = true;

    // 1. Relocate Camper Van from (0, 0) to Western Logistics/Charging Slipway (-170, 20)
    let van = this.data.buildings.find(b => b.type === 'camper_van');
    if (van) {
      van.x = -170;
      van.y = 20;
      van.name = 'Pioneer Camper Van (Auxiliary Mobile Logistics)';
      van.status = 'auxiliary_standby';
    } else {
      van = {
        id: 'van-0',
        type: 'camper_van',
        name: 'Pioneer Camper Van (Auxiliary Mobile Logistics)',
        x: -170,
        y: 20,
        status: 'auxiliary_standby',
        shelterCapacity: 3
      };
      this.data.buildings.push(van);
    }

    // 2. Consecrate (0, 0) as Central Agora & Pioneer Fire Hearth
    const agoraHearth = {
      id: `central_agora-${Date.now().toString(36)}`,
      type: 'central_agora',
      name: 'Central Agora & Pioneer Fire Hearth',
      x: 0,
      y: 0,
      createdAt: Date.now(),
      status: 'operational',
      consecratedDay: this.data.day || 1
    };
    this.data.buildings.push(agoraHearth);

    // 3. Unseal Camper Van Auxiliary Reserves (+300L fresh water, +15,000 kcal dry cache, +20 morale)
    this.data.resources.waterCapacityL = (this.data.resources.waterCapacityL || 2000) + 300;
    this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, (this.data.resources.waterLiters || 0) + 300);
    this.data.resources.foodKcal = (this.data.resources.foodKcal || 0) + 15000;
    this.data.morale = Math.min(100, (this.data.morale || 85) + 20);

    this.save();
    this.emit('camper_van_retired', { van, agora: agoraHearth });
    this.emit('agora_activated', agoraHearth);
    this.emit('resources_updated', this.data.resources);

    // 4. Milestone Celebration Modal Payload
    const milestonePayload = {
      id: 'milestone-camper-transition',
      title: 'Pioneers Under Their Own Roofs!',
      subtitle: 'Historic Milestone • The Camper Van Passes the Torch',
      heroIcon: '🏛️',
      badgeText: 'MILESTONE ACHIEVED',
      description: 'With 3 Modular Habitat Units (MHUs) framed and weatherproofed, all founding pioneers now sleep under permanent CLT timber roofs! The loyal camper van has been unhitched and retired to the Western Logistics Slipway (-170, 20). Coordinate (0, 0) is now consecrated as the permanent Central Agora & Pioneer Fire Hearth for Demarchy Assemblies.',
      rewards: [
        { icon: '🏛️', label: 'Central Agora Consecrated', desc: 'Demarchy assembly ring and sacred stone fire hearth at (0, 0)' },
        { icon: '💧', label: '+300L Auxiliary Water', desc: 'Camper van backup fresh-water bladder unsealed' },
        { icon: '🥫', label: '+15,000 kcal Dry Cache', desc: 'Camper emergency rations released to the commons' },
        { icon: '❤️', label: '+20 Morale Surge', desc: 'All pioneers sheltered in comfortable CLT dwellings' },
        { icon: '🚐', label: 'Camper Repositioned', desc: 'Western Logistics Slipway (-170, 20) on standby' }
      ]
    };

    if (typeof window !== 'undefined' && window.eventModal) {
      window.eventModal.open('milestone', milestonePayload);
    }
  }

  getDunbarProgress() {
    const mhuCount = (this.data.buildings || []).filter(b => b.type === 'mhu_dwelling').length;
    const target = 50;
    const residents = mhuCount * 3;
    const pct = Math.min(100, Math.round((mhuCount / target) * 100));
    return {
      mhuCount,
      target,
      residents,
      residentsTarget: 150,
      pct,
      isReached: mhuCount >= target || !!this.data.dunbarHorizonReached,
      isMitosisComplete: !!this.data.cellularMitosisComplete
    };
  }

  triggerDunbarHorizon() {
    if (this.data.dunbarHorizonReached) return;
    this.data.dunbarHorizonReached = true;
    this.save();
    this.emit('dunbar_horizon_reached', { mhuCount: 50, residents: 150 });

    const milestonePayload = {
      id: 'milestone-dunbar-horizon',
      title: 'Dunbar Carrying Capacity Reached!',
      subtitle: '50 MHUs • 150 Residents • Ecological Horizon',
      heroIcon: '🧬',
      badgeText: 'CELLULAR MITOSIS READY',
      description: 'The seed cell has reached its full carrying capacity of 50 Modular Habitat Units (~150 residents). The human social fabric and watershed balance are operating at peak Dunbar equilibrium. Instead of expanding into an overcrowded, alienated metropolis, Article 4 mandates Cellular Mitosis: dispatching a 3-pioneer founding expedition with the expedition camper van to seed Node 02 in an adjacent hex cell!',
      rewards: [
        { icon: '🧬', label: 'Cellular Mitosis Unlocked', desc: 'Founding expedition ready in Regional Mesh Map' },
        { icon: '🚴', label: 'Overland Greenway Planned', desc: '12 km cycle & freight corridor route mapped' },
        { icon: '⚡', label: 'HVDC Microgrid Bus Link', desc: 'Direct DC power sharing across valleys' },
        { icon: '📡', label: 'Line-of-Sight Mesh Radio', desc: 'Sub-gigahertz Reticulum telemetry link' }
      ]
    };

    if (typeof window !== 'undefined' && window.eventModal) {
      window.eventModal.open('milestone', milestonePayload);
    }
  }

  launchCellularMitosis(crew = ['maya', 'leo', 'nico'], sisterNodeName = 'Node 02 (Sister Node)') {
    if (this.data.cellularMitosisComplete) return { ok: false, reason: 'Node 02 already founded!' };

    this.data.dunbarHorizonReached = true;
    this.data.cellularMitosisComplete = true;

    // Create Sister Node 02 in adjacent hex cell (12 km away)
    const node02 = {
      id: 'node_02',
      name: sisterNodeName,
      region: 'Adjacent Hex Cell (12 km Greenway)',
      distanceKm: 12,
      signal: '100% (Direct LOS LoRa & Optical Fiber)',
      specialty: 'High-Voltage DC Microgrid Bus & Agroforestry Nursery',
      affinity: 100,
      tradeHistoryCount: 0,
      isMitosisChild: true,
      foundedDay: this.data.day || 50,
      pioneerFounders: crew,
      interconnections: {
        bikeGreenway: true,
        hvdcMicrogrid: true,
        reticulumMeshRadio: true
      }
    };

    if (!this.data.sisterNodes) this.data.sisterNodes = {};
    this.data.sisterNodes.node_02 = node02;

    // Thermodynamic & Social Federation Rewards
    this.data.morale = 100;
    this.data.resources.energyCapacityKwh += 20;
    this.data.resources.energyStoredKwh = Math.min(this.data.resources.energyCapacityKwh, (this.data.resources.energyStoredKwh || 0) + 20);

    this.save();
    this.emit('cellular_mitosis_founded', node02);
    this.emit('resources_updated', this.data.resources);

    const milestonePayload = {
      id: 'milestone-node02-founded',
      title: 'Sister Node 02 Founded!',
      subtitle: 'Cellular Mitosis Successful • Sovereign Federation Expands',
      heroIcon: '🌱',
      badgeText: 'NODE 02 ACTIVE',
      description: `The founding expedition has reached the adjacent hex cell (12 km away) and consecrated Sister Node 02! The expedition camper van is stationed at the new site. The 12 km overland bike greenway, high-voltage DC microgrid bus, and line-of-sight Reticulum mesh link are now fully operational.`,
      rewards: [
        { icon: '🚴', label: '12 km Bike Greenway Active', desc: 'Direct 0.5-day cargo trike shuttle corridor' },
        { icon: '⚡', label: 'HVDC Microgrid Interconnect', desc: '+20 kWh inter-node power balancing buffer' },
        { icon: '📡', label: 'LOS Reticulum Mesh Link', desc: 'Zero-latency telemetry between Node 01 & 02' },
        { icon: '❤️', label: 'Morale Restored to 100%', desc: 'Pioneers celebrate sovereign federation mitosis' }
      ]
    };

    if (typeof window !== 'undefined' && window.eventModal) {
      window.eventModal.open('milestone', milestonePayload);
    }

    return { ok: true, node: node02 };
  }

  // =========================================================================
  // ZERO-EMISSION LOGISTICS FLEET & VEHICLE MANAGEMENT (EPIC 2.1)
  // =========================================================================

  getVehicleSpecs(type = null) {
    if (type) return VEHICLE_SPECS[type] ? { ...VEHICLE_SPECS[type] } : null;
    return JSON.parse(JSON.stringify(VEHICLE_SPECS));
  }

  getFleet(filter = null) {
    if (!Array.isArray(this.data.fleet)) this.data.fleet = [];
    if (!filter) return this.data.fleet;
    if (typeof filter === 'string') {
      return this.data.fleet.filter(v => 
        v.type === filter || v.category === filter || v.status === filter
      );
    }
    if (typeof filter === 'object') {
      return this.data.fleet.filter(v => {
        return Object.entries(filter).every(([k, val]) => v[k] === val);
      });
    }
    return this.data.fleet;
  }

  commissionVehicle(type, customName = null, options = {}) {
    const spec = VEHICLE_SPECS[type];
    if (!spec) {
      console.warn(`[GameState] Unknown vehicle type for commissioning: ${type}`);
      return null;
    }
    if (!Array.isArray(this.data.fleet)) this.data.fleet = [];
    const count = this.data.fleet.filter(v => v.type === type).length + 1;
    const defaultName = type === 'cargo_trike' 
      ? `Electric Cargo Trike #${count.toString().padStart(2, '0')}`
      : `Autonomous VTOL Drone #${count.toString().padStart(2, '0')}`;

    const vehicle = {
      id: options.id || `fleet-${type}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      type,
      category: spec.category,
      name: customName || defaultName,
      icon: spec.icon,
      payloadKg: spec.payloadKg,
      rangeKm: spec.rangeKm,
      energyDrawKwhPer100Km: spec.energyDrawKwhPer100Km || null,
      energyDrawKwhPerSortie: spec.energyDrawKwhPerSortie || null,
      batteryCapacityKwh: spec.batteryCapacityKwh,
      batteryVoltage: spec.batteryVoltage,
      batterySocPct: options.batterySocPct !== undefined ? options.batterySocPct : 100,
      healthPct: options.healthPct !== undefined ? options.healthPct : 100,
      status: options.status || 'docked', // 'docked' | 'in_transit' | 'charging' | 'maintenance'
      routes: [...spec.routes],
      assignedDriverId: options.assignedDriverId || null,
      currentCargoKg: 0,
      cargoManifest: {
        foodKcal: 0,
        energyKwh: 0,
        tools: [],
        seeds: [],
        waterL: 0,
        weightKg: 0
      },
      commissionedDay: this.data.day || 1,
      totalDistanceTraveledKm: 0,
      sortiesCompleted: 0
    };

    this.data.fleet.push(vehicle);
    this.save();
    this.emit('fleet_updated', this.data.fleet);
    this.emit('vehicle_commissioned', vehicle);
    return vehicle;
  }

  chargeVehicle(vehicleId, kwhLimit = null) {
    if (!Array.isArray(this.data.fleet)) return { ok: false, reason: 'No fleet' };
    const vehicle = this.data.fleet.find(v => v.id === vehicleId);
    if (!vehicle) return { ok: false, reason: 'Vehicle not found' };

    const missingSoc = 100 - (vehicle.batterySocPct || 0);
    if (missingSoc <= 0) return { ok: true, chargedKwh: 0, vehicle };

    const neededKwh = (missingSoc / 100) * (vehicle.batteryCapacityKwh || 1.0);
    const availableEnergy = this.data.resources?.energyStoredKwh || this.data.resources?.energyKwh || 0;
    
    let drawKwh = Math.min(neededKwh, availableEnergy);
    if (kwhLimit !== null) drawKwh = Math.min(drawKwh, kwhLimit);

    if (drawKwh <= 0) return { ok: false, reason: 'Insufficient microgrid energy to charge' };

    // Deduct from stored energy
    if (this.data.resources.energyStoredKwh !== undefined) {
      this.data.resources.energyStoredKwh = Math.max(0, this.data.resources.energyStoredKwh - drawKwh);
    }
    if (this.data.resources.energyKwh !== undefined) {
      this.data.resources.energyKwh = Math.max(0, this.data.resources.energyKwh - drawKwh);
    }

    const socAdded = (drawKwh / (vehicle.batteryCapacityKwh || 1.0)) * 100;
    vehicle.batterySocPct = Math.min(100, Math.round((vehicle.batterySocPct || 0) + socAdded));
    if (vehicle.batterySocPct >= 100 && vehicle.status === 'charging') {
      vehicle.status = 'docked';
    }

    this.save();
    this.emit('fleet_updated', this.data.fleet);
    this.emit('resources_updated', this.data.resources);
    return { ok: true, chargedKwh: drawKwh, vehicle };
  }

  serviceVehicle(vehicleId) {
    if (!Array.isArray(this.data.fleet)) return { ok: false, reason: 'No fleet' };
    const vehicle = this.data.fleet.find(v => v.id === vehicleId);
    if (!vehicle) return { ok: false, reason: 'Vehicle not found' };

    vehicle.healthPct = 100;
    if (vehicle.status === 'maintenance') {
      vehicle.status = 'docked';
    }

    this.save();
    this.emit('fleet_updated', this.data.fleet);
    return { ok: true, vehicle };
  }

  rechargeFleet(maxTotalKwh = null) {
    if (!Array.isArray(this.data.fleet)) return { ok: true, totalChargedKwh: 0 };
    let totalChargedKwh = 0;
    for (const vehicle of this.data.fleet) {
      if (vehicle.status === 'docked' || vehicle.status === 'charging') {
        if ((vehicle.batterySocPct || 0) < 100) {
          const res = this.chargeVehicle(vehicle.id, maxTotalKwh ? maxTotalKwh - totalChargedKwh : null);
          if (res.ok) {
            totalChargedKwh += res.chargedKwh;
          }
          if (maxTotalKwh && totalChargedKwh >= maxTotalKwh) break;
        }
      }
    }
    return { ok: true, totalChargedKwh };
  }

  // =========================================================================
  // REGIONAL PARTNER NODES & BIOREGIONAL SPECIALIZATIONS (EPIC 2.2)
  // =========================================================================

  getSisterNodes() {
    return this.data.sisterNodes || {};
  }

  getPartnerNode(nodeId) {
    if (!nodeId) return null;
    return this.data.sisterNodes?.[nodeId] || REGIONAL_PARTNER_NODES[nodeId] || null;
  }

  getRegionalNodePortfolio(nodeId) {
    const node = this.getPartnerNode(nodeId);
    if (!node) return null;
    return {
      id: node.id,
      name: node.name,
      specialty: node.specialty,
      region: node.region,
      distanceKm: node.distanceKm,
      signal: node.signal,
      affinity: node.affinity || 100,
      exports: node.exports || [],
      demands: node.demands || []
    };
  }

  getWeatherForDay(day) {
    // Scheduled Climate Crisis Days (Matrix 3: 48h Advance Triage & Resilience)
    if (day === 5) return { tempC: -3, sky: 'Polar Cold Snap Frost', icon: '❄️', rainfallMm: 0, solarIrradiance: 0.70, windSpeedKmh: 28, cloudCover: 0.30, isCrisis: true, disasterId: 'cold_snap' };
    if (day === 14) return { tempC: 11, sky: 'Severe Ice Hailstorm', icon: '🌨️', rainfallMm: 18, solarIrradiance: 0.25, windSpeedKmh: 48, cloudCover: 0.90, isCrisis: true, disasterId: 'hailstorm' };
    if (day === 21) return { tempC: 15, sky: 'Gale-Force Windstorm', icon: '💨', rainfallMm: 6, solarIrradiance: 0.45, windSpeedKmh: 65, cloudCover: 0.70, isCrisis: true, disasterId: 'windstorm' };
    if (day === 28) return { tempC: 38, sky: 'Scorching Summer Drought', icon: '🔥', rainfallMm: 0, solarIrradiance: 1.0, windSpeedKmh: 12, cloudCover: 0.05, isCrisis: true, disasterId: 'drought' };
    if (day === 35) return { tempC: 16, sky: 'Mountain Flash Flood Cloudburst', icon: '⛈️', rainfallMm: 45, solarIrradiance: 0.15, windSpeedKmh: 42, cloudCover: 0.95, isCrisis: true, disasterId: 'flash_flood' };
    if (day === 42) return { tempC: 14, sky: 'Torrential Atmospheric River', icon: '🌊', rainfallMm: 55, solarIrradiance: 0.10, windSpeedKmh: 52, cloudCover: 1.0, isCrisis: true, disasterId: 'atmospheric_river' };

    // Dynamic Bioregional Weather Pattern
    const patterns = [
      { tempC: 22, sky: 'Crisp Clear Dawn', icon: '☀️', rainfallMm: 0, solarIrradiance: 1.0, windSpeedKmh: 12, cloudCover: 0.10 },
      { tempC: 18, sky: 'Afternoon Rain Showers', icon: '🌧️', rainfallMm: 16, solarIrradiance: 0.45, windSpeedKmh: 18, cloudCover: 0.80 },
      { tempC: 21, sky: 'Warm Golden Sunshine', icon: '🌤️', rainfallMm: 0, solarIrradiance: 0.95, windSpeedKmh: 10, cloudCover: 0.20 },
      { tempC: 17, sky: 'Overcast Coastal Drizzle', icon: '🌦️', rainfallMm: 6, solarIrradiance: 0.60, windSpeedKmh: 16, cloudCover: 0.75 },
      { tempC: 24, sky: 'High Cirrus Clouds', icon: '⛅', rainfallMm: 0, solarIrradiance: 0.85, windSpeedKmh: 14, cloudCover: 0.35 },
      { tempC: 16, sky: 'Steady Mountain Rain', icon: '🌧️', rainfallMm: 22, solarIrradiance: 0.35, windSpeedKmh: 20, cloudCover: 0.85 },
      { tempC: 23, sky: 'Sunny Meadow Breeze', icon: '☀️', rainfallMm: 0, solarIrradiance: 1.0, windSpeedKmh: 12, cloudCover: 0.15 },
      { tempC: 15, sky: 'Rolling Thunderstorm', icon: '⛈️', rainfallMm: 32, solarIrradiance: 0.20, windSpeedKmh: 36, cloudCover: 0.90 },
      { tempC: 19, sky: 'Mild Overcast Canopy', icon: '☁️', rainfallMm: 2, solarIrradiance: 0.65, windSpeedKmh: 14, cloudCover: 0.70 },
      { tempC: 25, sky: 'Brilliant High Sun', icon: '☀️', rainfallMm: 0, solarIrradiance: 1.0, windSpeedKmh: 8, cloudCover: 0.05 }
    ];

    return patterns[(day - 1) % patterns.length];
  }

  restUntilTomorrow() {
    const prevDay = this.data.day;
    this.data.day += 1;
    this.data.hour = 6;
    this.data.isNight = false;

    // Advance weather simulation
    const weather = this.getWeatherForDay(this.data.day);
    this.data.weather = weather;

    // Daily resource flows
    const peopleCount = Math.max(3, (this.data.companions?.length || 2) + 1);
    const dailyFoodNeed = peopleCount * 2200;

    // Daily food harvest from constructed agricultural infrastructure (Art. 1 & Line 196 game.md)
    const gardenBedsCount = this.data.buildings.filter(b => b.type === 'garden_bed').length;
    const foodForestCount = this.data.buildings.filter(b => b.type === 'food_forest').length;
    const greenhouseCount = this.data.buildings.filter(b => b.type === 'aquaponics_greenhouse').length;
    const siloCount = this.data.buildings.filter(b => b.type === 'grain_silo').length;
    const hasKitchen = this.data.buildings.some(b => b.type === 'kitchen_oven');
    const hasBiogas = this.data.buildings.some(b => b.type === 'biogas_digester');

    const foodGenerated = (gardenBedsCount * 2200) + (foodForestCount * 4500) + (greenhouseCount * 6000) + (hasKitchen ? 1200 : 0) + (hasBiogas ? 800 : 0);
    const maxFoodCap = 100000 + (siloCount * 30000);
    this.data.resources.foodCapacityKcal = maxFoodCap;
    this.data.resources.foodKcal = Math.min(maxFoodCap, this.data.resources.foodKcal + foodGenerated);

    const foodConsumed = Math.min(this.data.resources.foodKcal, dailyFoodNeed);
    this.data.resources.foodKcal = Math.max(0, this.data.resources.foodKcal - dailyFoodNeed);
    const netFood = foodGenerated - dailyFoodNeed;

    // Water physical inflows: Cistern rainwater collection, Retention swales, Deep artesian wells & morning dew
    const cisternCount = this.data.buildings.filter(b => b.type === 'rain_cistern').length;
    const swaleCount = this.data.buildings.filter(b => b.type === 'retention_swale').length;
    const wellCount = this.data.buildings.filter(b => b.type === 'deep_well').length;

    // Physical rainwater collection: 1 mm rain over 1 m² = 1 Liter.
    // Each cistern provides 30 m² roof catchment; each swale provides 60 m² runoff basin.
    const rainfallMm = weather.rainfallMm || 0;
    const rainHarvested = Math.round((cisternCount * 30 * rainfallMm) + (swaleCount * 60 * rainfallMm));
    const wellHarvested = wellCount * 250; // Continuous artesian aquifer pumping (250 L/day guaranteed)
    const dewHarvested = (rainfallMm === 0 && weather.tempC < 20) ? 25 : 0; // Natural morning dew condensation
    const totalWaterHarvested = rainHarvested + wellHarvested + dewHarvested;

    this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters + totalWaterHarvested);

    // Domestic water draw: 50 L/person. If greywater reed-bed is built, 65% is recycled!
    const hasReedBed = this.data.buildings.some(b => b.type === 'reed_bed');
    const waterBase = peopleCount * 50;
    const waterDraw = hasReedBed ? Math.round(waterBase * 0.35) : waterBase;
    const waterConsumed = Math.min(this.data.resources.waterLiters, waterDraw);
    this.data.resources.waterLiters = Math.max(0, this.data.resources.waterLiters - waterDraw);
    const isDehydrated = this.data.resources.waterLiters <= 0;

    // Newcomer arrival cadence (Matrix 6: The 11 Canonical Vocations + Multi-Gen)
    // Day 6: Nico (IoT Telemetry Engineer)
    if (this.data.day === 6 && !this.data.companions.some(c => c.id === 'nico')) {
      this.data.companions.push({
        id: 'nico',
        name: 'Nico',
        vocationId: 'telemetry',
        roleTitle: 'IoT Telemetry Engineer',
        icon: '📡',
        status: 'Unpacking LoRa antenna kits in guest pavilion',
        appearance: { gender: 'M', hairStyle: 'crop', hairColor: '#334155', skinTone: '#fed7aa' }
      });
      this.data.chores.dailyPoolHours = 8.0;
    }

    // Day 8: Elena (Water Systems & Sanitation Tech)
    if (this.data.day === 8 && !this.data.companions.some(c => c.id === 'elena')) {
      this.data.companions.push({
        id: 'elena',
        name: 'Elena',
        vocationId: 'water_tech',
        roleTitle: 'Water Systems & Sanitation Tech',
        icon: '💧',
        status: 'Calibrating reed bed gravel bio-filtration',
        appearance: { gender: 'F', hairStyle: 'bob', hairColor: '#b45309', skinTone: '#fbcfe8' }
      });
      this.data.chores.dailyPoolHours = 10.0;
    }

    // Day 12: Tomas (Mechanical Machinist & Blacksmith)
    if (this.data.day === 12 && !this.data.companions.some(c => c.id === 'tomas')) {
      this.data.companions.push({
        id: 'tomas',
        name: 'Tomas',
        vocationId: 'blacksmith',
        roleTitle: 'Machinist & Blacksmith',
        icon: '🔧',
        status: 'Installing LinuxCNC metal milling bed',
        appearance: { gender: 'M', hairStyle: 'beard', hairColor: '#171717', skinTone: '#d97706' }
      });
      this.data.chores.dailyPoolHours = 12.0;
    }

    // Day 15: Soraya (Communal Chef & Baker)
    if (this.data.day === 15 && !this.data.companions.some(c => c.id === 'soraya')) {
      this.data.companions.push({
        id: 'soraya',
        name: 'Soraya',
        vocationId: 'chef',
        roleTitle: 'Communal Chef & Baker',
        icon: '🍲',
        status: 'Baking sourdough bread in hearth oven',
        appearance: { gender: 'F', hairStyle: 'ponytail', hairColor: '#451a03', skinTone: '#fde047' }
      });
      this.data.chores.dailyPoolHours = 14.0;
    }

    // Day 16: Multi-Generational Kids Milo & Tara (Nature Scouts)
    if (this.data.day === 16 && !this.data.companions.some(c => c.id === 'kids_scouts')) {
      this.data.companions.push({
        id: 'kids_scouts',
        name: 'Milo & Tara',
        vocationId: 'scout',
        roleTitle: 'Young Nature Scouts (0h Labor)',
        icon: '👶',
        status: 'Foraging wild heirloom berries & catching ladybugs',
        appearance: { gender: 'M', hairStyle: 'fade', hairColor: '#d97706', skinTone: '#fed7aa' }
      });
      this.data.resources.foodKcal += 1500; // Found wild berries!
    }

    // Day 18: Clara (Community Nurse & Medic)
    if (this.data.day === 18 && !this.data.companions.some(c => c.id === 'clara')) {
      this.data.companions.push({
        id: 'clara',
        name: 'Clara',
        vocationId: 'medic',
        roleTitle: 'Community Nurse & Medic',
        icon: '🩺',
        status: 'Brewing calming elderberry & mint infusions',
        appearance: { gender: 'F', hairStyle: 'bob', hairColor: '#7c2d12', skinTone: '#fed7aa' }
      });
      this.data.chores.dailyPoolHours = 16.0;
    }

    // Day 22: Bram (Forest Steward & Beekeeper)
    if (this.data.day === 22 && !this.data.companions.some(c => c.id === 'bram')) {
      this.data.companions.push({
        id: 'bram',
        name: 'Bram',
        vocationId: 'forester',
        roleTitle: 'Forest Steward & Beekeeper',
        icon: '🌲',
        status: 'Checking honey supers in the cedar apiary',
        appearance: { gender: 'M', hairStyle: 'beard', hairColor: '#78350f', skinTone: '#ea580c' }
      });
      this.data.chores.dailyPoolHours = 18.0;
    }

    // Day 26: Miriam (Commons Educator & Seed Librarian)
    if (this.data.day === 26 && !this.data.companions.some(c => c.id === 'miriam')) {
      this.data.companions.push({
        id: 'miriam',
        name: 'Miriam',
        vocationId: 'educator',
        roleTitle: 'Commons Educator & Seed Librarian',
        icon: '📚',
        status: 'Teaching robotics & categorizing heirloom seeds',
        appearance: { gender: 'F', hairStyle: 'long', hairColor: '#1e293b', skinTone: '#fbcfe8' }
      });
      this.data.chores.dailyPoolHours = 20.0;
    }

    // Day 28: Multi-Generational Elder Rosa (Sanctuary Elder & Mentor)
    if (this.data.day === 28 && !this.data.companions.some(c => c.id === 'elder_rosa')) {
      this.data.companions.push({
        id: 'elder_rosa',
        name: 'Rosa',
        vocationId: 'elder',
        roleTitle: 'Sanctuary Elder & Mediator (0h Labor)',
        icon: '👵',
        status: 'Sharing campfire stories on the porch rocking chair',
        appearance: { gender: 'F', hairStyle: 'long', hairColor: '#94a3b8', skinTone: '#fde047' }
      });
    }

    // Day 30: Zayd (Civic Facilitator & Mediator)
    if (this.data.day === 30 && !this.data.companions.some(c => c.id === 'zayd')) {
      this.data.companions.push({
        id: 'zayd',
        name: 'Zayd',
        vocationId: 'mediator',
        roleTitle: 'Civic Facilitator & Sortition Mediator',
        icon: '⚖️',
        status: 'Preparing sortition urns at the stone Agora ring',
        appearance: { gender: 'M', hairStyle: 'fade', hairColor: '#0f172a', skinTone: '#92400e' }
      });
      this.data.chores.dailyPoolHours = 22.0;
    }

    // Check organic carrying capacity clearing expansion
    this.checkClearingExpansion();

    // Scheduled Event Trigger (Matrix 2 Threats, Matrix 3 Weather, Matrix 7 Weekends, Matrix 7.3 Demarchy)
    let scheduledEvent = null;
    const day = this.data.day;

    if (day === 5) scheduledEvent = { type: 'weather_crisis', id: 'cold_snap', title: 'Polar Cold Snap (-3°C)' };
    else if (day === 7) scheduledEvent = { type: 'weekend_activity', id: 'feast', title: 'Saturday Wood-Fired Pizza Feast' };
    else if (day === 8) scheduledEvent = { type: 'weekend_activity', id: 'sunday_rover_race', title: 'Sunday Solar Toy Rover Drag Race' };
    else if (day === 9) scheduledEvent = { type: 'legacy_threat', id: 'grid_severing', title: 'Sudden Legacy Power Cut' };
    else if (day === 14) scheduledEvent = { type: 'weather_crisis', id: 'hailstorm', title: 'Severe Ice Hailstorm' };
    else if (day === 15) scheduledEvent = { type: 'weekend_activity', id: 'sunday_kite', title: 'Sunday High-Altitude Solar Kite' };
    else if (day === 17) scheduledEvent = { type: 'legacy_threat', id: 'tax_inspection_roadblock', title: 'Cargo Van Roadblock Inspection' };
    else if (day === 21) scheduledEvent = { type: 'weather_crisis', id: 'windstorm', title: 'Gale-Force Windstorm' };
    else if (day === 22) scheduledEvent = { type: 'weekend_activity', id: 'lawn_toss', title: 'Sunday Seed-Sack Lawn Toss' };
    else if (day === 25) scheduledEvent = { type: 'legacy_threat', id: 'false_ubi_cooptation', title: 'Suspicious Real Estate Cash Bribes' };
    else if (day === 28) scheduledEvent = { type: 'weather_crisis', id: 'drought', title: 'Scorching Summer Drought' };
    else if (day === 29) scheduledEvent = { type: 'weekend_activity', id: 'campfire_stargazing', title: 'Sunday Sunset Campfire & Stargazing' };
    else if (day === 31) scheduledEvent = { type: 'demarchy_dilemma', id: 'dil-refugees', title: 'Agora Demarchy Assembly: Refugee Asylum' };
    else if (day === 32) scheduledEvent = { type: 'legacy_threat', id: 'surge_pricing_blackout', title: 'Grid Electricity Extortion Surcharge' };
    else if (day === 35) scheduledEvent = { type: 'weather_crisis', id: 'flash_flood', title: 'Mountain Flash Flood Warning' };
    else if (day === 38) scheduledEvent = { type: 'demarchy_dilemma', id: 'dil-surplus-solar', title: 'Agora Sortition: Surplus Solar Energy' };
    else if (day === 42) scheduledEvent = { type: 'weather_crisis', id: 'atmospheric_river', title: 'Torrential Atmospheric River' };
    else if (day === 45) scheduledEvent = { type: 'demarchy_dilemma', id: 'dil-fiat-trade', title: 'Agora Sortition: Honey Sell or Share?' };
    
    // Solar generation scaled by atmospheric solar irradiance & individual panel placement efficiency
    const solarBuildings = this.data.buildings.filter(b => b.type === 'solar_array');
    const solarMultiplier = weather.solarIrradiance !== undefined ? weather.solarIrradiance : 1.0;
    const solarGenerated = Math.round(solarBuildings.reduce((sum, b) => {
      const placementEff = b.solarModifier !== undefined ? b.solarModifier : 1.0;
      return sum + (15 * solarMultiplier * placementEff);
    }, 0));
    const extraPumpLoadKw = this.data.buildings.reduce((sum, b) => sum + (b.pumpEnergyKw || 0), 0);
    const energyPrev = this.data.resources.energyStoredKwh;
    this.data.resources.energyStoredKwh = Math.min(
      this.data.resources.energyCapacityKwh,
      Math.max(5, this.data.resources.energyStoredKwh - 10 - extraPumpLoadKw + solarGenerated)
    );
    const netEnergy = this.data.resources.energyStoredKwh - energyPrev;

    // Morale bonus or penalty from quiet courtyards vs workshop acoustic noise
    const placementMoraleBonus = this.data.buildings.reduce((sum, b) => sum + (b.moraleBonus || 0), 0);
    if (this.data.morale !== undefined && placementMoraleBonus !== 0) {
      this.data.morale = Math.max(10, Math.min(100, this.data.morale + Math.sign(placementMoraleBonus) * Math.min(5, Math.abs(placementMoraleBonus))));
    }

    // Process active inter-node cargo convoys
    const convoysArrived = [];
    if (Array.isArray(this.data.convoys)) {
      this.data.convoys.forEach(c => {
        c.daysRemaining -= 1;
        if (c.daysRemaining <= 0) {
          const rewardSummary = this.deliverConvoyCargo(c);
          convoysArrived.push({
            nodeName: c.targetNodeName,
            vehicle: c.vehicleType === 'drone' ? 'Autonomous Courier Drone' : 'Solar Cargo Trike',
            deliveredGoods: rewardSummary
          });
        }
      });
      this.data.convoys = this.data.convoys.filter(c => c.daysRemaining > 0);
    }

    // Process active pioneer sabbaticals
    const sabbaticalsReturned = [];
    if (Array.isArray(this.data.sabbaticals)) {
      this.data.sabbaticals.forEach(s => {
        s.daysRemaining -= 1;
        if (s.daysRemaining <= 0) {
          let pioneer = null;
          if (s.isPlayer) {
            pioneer = this.data.player;
          } else {
            pioneer = (this.data.companions || []).find(c => c.id === s.pioneerId);
          }
          if (pioneer) {
            pioneer.status = 'Active (Master Sabbatical Scholar)';
            pioneer.masteryPerk = s.perkEarned;
          }
          sabbaticalsReturned.push({
            pioneerName: s.pioneerName,
            nodeName: s.targetNodeName,
            perkName: s.perkEarned
          });
        }
      });
      this.data.sabbaticals = this.data.sabbaticals.filter(s => s.daysRemaining > 0);
    }

    // Reset chore pool
    this.data.chores.remainingHours = this.data.chores.dailyPoolHours;
    this.data.chores.loggedToday = [];

    // Reconcile state and objectives for the new dawn
    this.reconcileStateAndObjectives();

    const report = {
      prevDay,
      day: this.data.day,
      foodGenerated,
      foodConsumed,
      netFood,
      foodRemaining: this.data.resources.foodKcal,
      totalWaterHarvested,
      rainHarvested,
      wellHarvested,
      waterConsumed,
      waterRemaining: this.data.resources.waterLiters,
      waterCapacityL: this.data.resources.waterCapacityL,
      solarGenerated,
      netEnergy,
      energyStored: this.data.resources.energyStoredKwh,
      energyCapacity: this.data.resources.energyCapacityKwh,
      weather,
      convoysArrived,
      sabbaticalsReturned,
      objective: this.data.objective,
      scheduledEvent,
      isStarving: this.data.resources.foodKcal <= 0,
      isDehydrated: this.data.resources.waterLiters <= 0,
      isLowFood: this.data.resources.foodKcal < 13200
    };

    this.save();
    this.emit('day_advanced', { day: this.data.day, resources: this.data.resources, report });
    this.emit('resources_updated', this.data.resources);
    return report;
  }

  getDemarchyDilemmas() {
    return [
      {
        id: 'dil-refugees',
        title: 'Refugee Asylum at the Gateway',
        icon: '🤝',
        speaker: 'Zayd (Civic Mediator)',
        trigger: '4 evicted people arrive at the gate seeking shelter from regional flooding',
        optionA: {
          key: 'A',
          title: 'Welcome Family into Free Homes',
          desc: 'Share pantry food (-3,000 kcal). Family joins community (+4 citizens, +15 Morale).',
          benefit: '+4 Citizens, +15 Morale, Inviolable Usufruct',
          cost: '-3,000 kcal food'
        },
        optionB: {
          key: 'B',
          title: 'Provide 3-Day Travel Rations',
          desc: 'Direct them safely toward town shelter. Preserves food reserves (-600 kcal).',
          benefit: 'Food reserves protected',
          cost: '-5 Morale'
        }
      },
      {
        id: 'dil-surplus-solar',
        title: 'Surplus Summer Solar Power',
        icon: '⚡',
        speaker: 'Sam (Electrician)',
        trigger: 'Summer noon: battery bank reaches 98% with 4 hours of peak sun remaining',
        optionA: {
          key: 'A',
          title: 'Melt Scrap Aluminum in Foundry',
          desc: 'Cast 40kg of machine brackets and pulleys for the FabLab inventory.',
          benefit: '+40kg Machine Parts for Robotics',
          cost: 'Heavy workshop load'
        },
        optionB: {
          key: 'B',
          title: 'Pump Chilled Water to Greenhouses',
          desc: 'Run evaporative misting chillers to protect sensitive crop beds from heat stress.',
          benefit: '+10% Crop Resilience',
          cost: 'Pumps run at max duty'
        }
      },
      {
        id: 'dil-fiat-trade',
        title: 'Apiary Honey: Sell or Share?',
        icon: '🍯',
        speaker: 'Bram (Beekeeper)',
        trigger: 'Summer harvest yields 180 kg surplus raw wildflower honey',
        optionA: {
          key: 'A',
          title: 'Sell to Regional City Co-op for $2,200',
          desc: 'Use fiat proceeds to purchase imported microchips, sensors, and drone motors.',
          benefit: '+$2,200 Fiat Reserve',
          cost: 'Less honey at camp'
        },
        optionB: {
          key: 'B',
          title: 'Distribute Honey across the Commons',
          desc: 'Distribute jars to children, elders, and the herbal clinic for winter teas.',
          benefit: '+20 Community Happiness, Health Boost',
          cost: 'Zero fiat gained'
        }
      },
      {
        id: 'dil-sabbatical',
        title: 'The 60-Day Sabbatical Overstay',
        icon: '🚪',
        speaker: 'Rosa (Sanctuary Elder)',
        trigger: 'Tariq has been away helping a sister node for 60 days without an active lock',
        optionA: {
          key: 'A',
          title: 'Reassign Cabin to Waiting Newcomer',
          desc: 'Tariq\'s personal belongings are boxed securely into civic storage (Art. 4 Usufruct).',
          benefit: 'Zero housing speculation, newcomer housed',
          cost: 'Tariq must re-request upon return'
        },
        optionB: {
          key: 'B',
          title: 'Grant 30-Day Emergency Extension',
          desc: 'Keep cabin locked. Newcomer sleeps in the temporary guest pavilion.',
          benefit: 'Protects Tariq\'s sabbatical',
          cost: 'Guest pavilion remains occupied'
        }
      },
      {
        id: 'dil-mesh',
        title: 'Cedar Timber: Antenna vs Sauna',
        icon: '🪵',
        speaker: 'Nico & Maya',
        trigger: 'Only 12 seasoned cedar timbers remain in the workshop inventory',
        optionA: {
          key: 'A',
          title: 'Build Mountain Radio Repeater Tower',
          desc: 'Expands regional Reticulum mesh radius by +100 km, connecting 2 sister nodes.',
          benefit: '+100 km Mesh Range, Trade Convoy boost',
          cost: 'No sauna built'
        },
        optionB: {
          key: 'B',
          title: 'Construct Wood-Fired Sauna Pavilion',
          desc: 'Build communal sauna near the creek to relieve physical toil fatigue.',
          benefit: '+18% Morale, Pioneer Stamina +25%',
          cost: 'Mesh range unchanged'
        }
      },
      {
        id: 'dil-tax-strike',
        title: 'Legacy Property Tax Citation',
        icon: '⚖️',
        speaker: 'Maya (Builder)',
        trigger: 'County enforcement sends a $1,200 unzoned land improvement tax bill',
        optionA: {
          key: 'A',
          title: 'Collective Usufruct Legal Defense',
          desc: 'Mount constitutional defense at regional tribunal: non-commercial ecological restoration.',
          benefit: 'Inviolable legal precedent, Zero fines',
          cost: 'Requires 4h pioneer jury preparation'
        },
        optionB: {
          key: 'B',
          title: 'Pay $1,200 Tax from Savings',
          desc: 'Settle the tax quietly to avoid bureaucratic court dates.',
          benefit: 'Avoids legal confrontation',
          cost: '-$1,200 fiat from reserves'
        }
      },
      {
        id: 'dil-chores',
        title: 'Chore Balance Dispute',
        icon: '📋',
        speaker: 'Leo (Farmer)',
        trigger: 'Farm workers argue that digital coders aren\'t sharing outdoor manual toil equally',
        optionA: {
          key: 'A',
          title: 'Mandatory 1 Farm Shift/Week for All',
          desc: 'Every citizen (including engineers & coders) works 1 morning shift in the soil.',
          benefit: 'Deep social empathy, farm labor shared',
          cost: 'Code velocity slightly reduced'
        },
        optionB: {
          key: 'B',
          title: 'Weight Heavy Physical Labor at 1.5x Credit',
          desc: 'Farmers earn their daily chore quota in fewer hours, balancing fairness.',
          benefit: 'Farmer hours reduced by 30%',
          cost: 'Chore tracking complexity'
        }
      }
    ];
  }

  resolveDemarchyDilemma(dilemmaId, choiceKey) {
    const dilemmas = this.getDemarchyDilemmas();
    const d = dilemmas.find(x => x.id === dilemmaId);
    if (!d) return { ok: false, reason: 'Dilemma not found' };

    this.data.demarchyJuriesCount = (this.data.demarchyJuriesCount || 0) + 1;
    if (!this.data.resolvedDilemmas) this.data.resolvedDilemmas = [];
    this.data.resolvedDilemmas.push({
      id: dilemmaId,
      choice: choiceKey,
      day: this.data.day,
      timestamp: Date.now()
    });

    if (dilemmaId === 'dil-refugees') {
      if (choiceKey === 'A') {
        this.data.resources.foodKcal = Math.max(0, this.data.resources.foodKcal - 3000);
        this.data.morale = Math.min(100, (this.data.morale || 85) + 15);
      } else {
        this.data.resources.foodKcal = Math.max(0, this.data.resources.foodKcal - 600);
      }
    } else if (dilemmaId === 'dil-fiat-trade') {
      if (choiceKey === 'A') {
        this.data.fiatEarnedUsd = (this.data.fiatEarnedUsd || 0) + 2200;
      } else {
        this.data.morale = 100;
      }
    } else if (dilemmaId === 'dil-tax-strike') {
      if (choiceKey === 'B') {
        this.data.fiatEarnedUsd = Math.max(0, (this.data.fiatEarnedUsd || 0) - 1200);
      }
    }

    this.save();
    this.emit('demarchy_resolved', { dilemmaId, choiceKey });
    return { ok: true, dilemma: d, choice: choiceKey };
  }

  unsealEmergencyPantry() {
    if ((this.data.emergencyPantryCaches || 3) <= 0) {
      return { ok: false, reason: 'No emergency dry ration caches left in camper van!' };
    }
    this.data.emergencyPantryCaches = (this.data.emergencyPantryCaches || 3) - 1;
    this.data.resources.foodKcal = (this.data.resources.foodKcal || 0) + 25000;
    this.save();
    this.emit('resources_updated', this.data.resources);
    return { ok: true, unsealedKcal: 25000, cachesRemaining: this.data.emergencyPantryCaches };
  }

  forageWildGreens() {
    if ((this.data.chores?.remainingHours || 0) < 1.0) {
      return { ok: false, reason: 'Need 1.0h pioneer labor to forage!' };
    }
    this.data.chores.remainingHours -= 1.0;
    this.data.resources.foodKcal = (this.data.resources.foodKcal || 0) + 3000;
    this.save();
    this.emit('resources_updated', this.data.resources);
    return { ok: true, foragedKcal: 3000, remainingHours: this.data.chores.remainingHours };
  }

  // Persistence (localStorage with clean key)
  save() {
    try {
      localStorage.setItem('one_game_save', JSON.stringify(this.data));
    } catch (e) {
      console.warn('[GameState] Save failed:', e);
    }
  }

  load() {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('reset')) {
        console.log('🧹 [GameState] Detected ?reset in URL, clearing save.');
        localStorage.removeItem('one_game_save');
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {}
        return;
      }

      const raw = localStorage.getItem('one_game_save');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1) {
          this.data = { ...this.data, ...parsed };

          // Recalculate dynamic scalable energy and water capacities across all built units
          if (Array.isArray(this.data.buildings)) {
            const solarCount = this.data.buildings.filter(b => b.type === 'solar_array').length;
            const batteryCount = this.data.buildings.filter(b => b.type === 'battery_bank').length;
            const towerCount = this.data.buildings.filter(b => b.type === 'solar_thermal_tower').length;
            this.data.resources.energyCapacityKwh = 100.0 + (solarCount * 15.0) + (batteryCount * 50.0) + (towerCount * 200.0);
            this.data.resources.energyStoredKwh = Math.min(this.data.resources.energyCapacityKwh, this.data.resources.energyStoredKwh || 45.0);

            const cisternCount = this.data.buildings.filter(b => b.type === 'rain_cistern').length;
            const wellCount = this.data.buildings.filter(b => b.type === 'deep_well').length;
            const swaleCount = this.data.buildings.filter(b => b.type === 'retention_swale').length;
            this.data.resources.waterCapacityL = 2000.0 + (cisternCount * 1000.0) + (wellCount * 3000.0) + (swaleCount * 5000.0);
            this.data.resources.waterLiters = Math.min(this.data.resources.waterCapacityL, this.data.resources.waterLiters !== undefined ? this.data.resources.waterLiters : 850.0);
          }

          if (!this.data.weather) {
            this.data.weather = this.getWeatherForDay(this.data.day || 1);
          }

          // Ensure starterKits contains all canonical buildings and scalable limits
          const canonicalKits = {
            solar_array: { name: 'Bifacial Solar Array', maxLimit: 6, laborCostH: 2.0 },
            rain_cistern: { name: 'Rainwater Cistern', maxLimit: 6, laborCostH: 2.0 },
            garden_bed: { name: 'Permaculture Bed', maxLimit: 8, laborCostH: 2.0, yieldKcalPerDay: 2200 },
            deep_well: { name: 'Deep Artesian Solar Well', maxLimit: 2, laborCostH: 3.5 },
            battery_bank: { name: 'Sodium Battery Storage Rack', maxLimit: 3, laborCostH: 3.0 },
            retention_swale: { name: 'Perennial Retention Swale', maxLimit: 2, laborCostH: 3.5 },
            solar_thermal_tower: { name: 'Solar Molten Salt Tower', maxLimit: 1, laborCostH: 5.0 },
            food_forest: { name: 'Food Forest & Apiary Hives', maxLimit: 2, laborCostH: 3.0 },
            elder_sanctuary: { name: 'Elder Sanctuary Cabins', maxLimit: 2, laborCostH: 3.0 },
            aquaponics_greenhouse: { name: 'Solar Aquaponics Greenhouse', maxLimit: 2, laborCostH: 3.5, yieldKcalPerDay: 6000, district: 'agro_belt' },
            grain_silo: { name: 'Heirloom Grain Silo (30k kcal)', maxLimit: 2, laborCostH: 3.0, district: 'agro_belt' },
            heavy_gantry_mill: { name: '5-Axis LinuxCNC Gantry Mill', maxLimit: 1, laborCostH: 4.0, district: 'fablab_quarter' },
            solar_foundry: { name: 'Inductive Solar Foundry', maxLimit: 1, laborCostH: 3.5, district: 'fablab_quarter' },
            trike_depot: { name: 'Electric Cargo Trike Depot', maxLimit: 1, laborCostH: 3.0, district: 'transit_hub' },
            drone_vertiport: { name: 'Autonomous Courier Vertiport', maxLimit: 1, laborCostH: 3.5, district: 'transit_hub' },
            mhu_dwelling: { name: 'Modular Habitat Unit (MHU)', maxLimit: 50, laborCostH: 4.0, district: 'mhu_ecovillage' }
          };
          if (!this.data.starterKits) this.data.starterKits = {};
          for (const [key, kitDef] of Object.entries(canonicalKits)) {
            if (!this.data.starterKits[key]) {
              this.data.starterKits[key] = { ...kitDef };
            } else {
              this.data.starterKits[key].maxLimit = kitDef.maxLimit;
            }
          }

          // Ensure 5 Bioregional Districts are initialized
          if (!this.data.districts || !this.data.districts.agora_core) {
            this.data.districts = {
              agora_core: {
                id: 'agora_core',
                name: 'Civic Agora & Demarchy Core',
                icon: '🏛️',
                tag: 'Art. 2 & 3 Assembly',
                center: { x: 0, y: -115 },
                radius: 140,
                unlocked: true,
                description: 'Athenian sortition amphitheater, living constitution archive, elder sanctuary, LoRa mesh mast.',
                vocationFocus: ['mediator', 'elder', 'telemetry'],
                color: '#38bdf8',
                stats: { residents: 4, powerDrawKw: 3.5, output: 'Demarchic Consensus' }
              },
              agro_belt: {
                id: 'agro_belt',
                name: 'Agroecological Commons Belt',
                icon: '🌾',
                tag: 'Permaculture & Food Forestry',
                center: { x: -320, y: 220 },
                radius: 200,
                unlocked: true,
                description: 'Syntropic food forest, keyline swales, automated FarmBot rows, aquaponics passive solar greenhouse.',
                vocationFocus: ['gardener', 'farmer', 'scout'],
                color: '#10b981',
                stats: { residents: 6, powerDrawKw: 2.0, output: '+18.5k kcal/day' }
              },
              fablab_quarter: {
                id: 'fablab_quarter',
                name: 'FabLab & Circular Industrial Quarter',
                icon: '⚙️',
                tag: 'Open Hardware & Heavy Tooling',
                center: { x: 340, y: -30 },
                radius: 190,
                unlocked: true,
                description: '5-axis LinuxCNC gantry mill, recycled filament extruder, induction solar foundry, cobots.',
                vocationFocus: ['builder', 'electrician', 'machinist'],
                color: '#f59e0b',
                stats: { residents: 5, powerDrawKw: 6.5, output: '4.0x Tooling & Drones' }
              },
              mhu_ecovillage: {
                id: 'mhu_ecovillage',
                name: 'Modular Habitat (MHU) Ecovillage',
                icon: '🏡',
                tag: 'Dynamic Usufruct Living (Art. 4)',
                center: { x: -340, y: -80 },
                radius: 190,
                unlocked: true,
                description: 'CLT geodesic residential clusters, greywater reed-bed wetland, communal kitchen hearth, health clinic.',
                vocationFocus: ['water_tech', 'medic', 'chef', 'educator'],
                color: '#a855f7',
                stats: { residents: 8, powerDrawKw: 4.0, output: '65% Water Recycled' }
              },
              transit_hub: {
                id: 'transit_hub',
                name: 'Intermodal Transit & Vertiport Hub',
                icon: '🚆',
                tag: 'Reticulum Regional Logistics',
                center: { x: 300, y: 280 },
                radius: 180,
                unlocked: true,
                description: 'Solar cargo trike maintenance bay, autonomous courier vertiport pads, bulk microgrid battery intertie.',
                vocationFocus: ['logistics', 'pilot', 'courier'],
                color: '#06b6d4',
                stats: { residents: 4, powerDrawKw: 5.0, output: 'Active Convoys' }
              }
            };
          }

          // Heal depleted food reserve in existing test saves if zero
          if (this.data.resources.foodKcal === undefined || this.data.resources.foodKcal <= 0) {
            console.log('🌾 [GameState] Healing depleted food reserve with van emergency cache.');
            this.data.resources.foodKcal = 66000.0;
          }
          if (this.data.emergencyPantryCaches === undefined) {
            this.data.emergencyPantryCaches = 3;
          }

          // Ensure inter-node mesh logistics and fleet are initialized for existing saves
          if (!Array.isArray(this.data.fleet)) this.data.fleet = [];
          if (this.data.buildings?.some(b => b.type === 'trike_depot') && !this.data.fleet.some(v => v.type === 'cargo_trike')) {
            this.commissionVehicle('cargo_trike', 'Solar Cargo Trike Alpha');
          }
          if (this.data.buildings?.some(b => b.type === 'drone_vertiport') && !this.data.fleet.some(v => v.type === 'vtol_drone')) {
            this.commissionVehicle('vtol_drone', 'SkyLink VTOL Courier Alpha');
          }
          if (!Array.isArray(this.data.convoys)) this.data.convoys = [];
          if (!Array.isArray(this.data.sabbaticals)) this.data.sabbaticals = [];
          if (!Array.isArray(this.data.unlockedSchematics)) this.data.unlockedSchematics = [];
          if (!this.data.sisterNodes) this.data.sisterNodes = {};
          if (!this.data.sisterNodes.monte_sole) {
            this.data.sisterNodes.monte_sole = {
              id: 'monte_sole',
              name: 'Monte Sole Permaculture Hub',
              region: 'Northern Apennines (Italy)',
              distanceKm: 320,
              signal: '98% (LoRa Repeater Chain)',
              specialty: 'Solar Stirling Concentrators & Chestnut Flour',
              affinity: 100,
              tradeHistoryCount: 0,
              icon: '⛰️'
            };
          }
          for (const [key, partnerDef] of Object.entries(REGIONAL_PARTNER_NODES)) {
            if (!this.data.sisterNodes[key]) {
              this.data.sisterNodes[key] = JSON.parse(JSON.stringify(partnerDef));
            } else {
              this.data.sisterNodes[key].exports = JSON.parse(JSON.stringify(partnerDef.exports));
              this.data.sisterNodes[key].demands = JSON.parse(JSON.stringify(partnerDef.demands));
              this.data.sisterNodes[key].specialty = partnerDef.specialty;
              this.data.sisterNodes[key].icon = partnerDef.icon;
            }
          }
          if (!this.data.sisterNodes.serra_estrela) {
            this.data.sisterNodes.serra_estrela = {
              id: 'serra_estrela',
              name: 'Serra da Estrela Mountain Node',
              region: 'Central Massif (Portugal)',
              distanceKm: 1740,
              signal: '88% (Mesh Gateway)',
              specialty: 'Micro-Hydro Pelton Wheels & Lanital Wool Insulation',
              affinity: 85,
              tradeHistoryCount: 0,
              icon: '🏔️'
            };
          }
          if (!this.data.sisterNodes.detroit_delray) {
            this.data.sisterNodes.detroit_delray = {
              id: 'detroit_delray',
              name: 'Detroit Delray Anchor Node',
              region: 'Rust Belt Great Lakes (USA)',
              distanceKm: 6850,
              signal: '92% (LoRa via Satellite Gateway)',
              specialty: 'Heavy 5-Axis Gantry Milling & Cast Iron Metallurgy',
              affinity: 80,
              tradeHistoryCount: 0,
              icon: '🏭'
            };
          }
          if (!this.data.sisterNodes.rojava) {
            this.data.sisterNodes.rojava = {
              id: 'rojava',
              name: 'Rojava Agroecological Node',
              region: 'Fertile Crescent (Syria)',
              distanceKm: 2840,
              signal: '90% (Decentralized Mesh Repeater)',
              specialty: 'Heritage Emmer Grains & Demarchic Agora Sortition',
              affinity: 85,
              tradeHistoryCount: 0,
              icon: '🌾'
            };
          }

          // Ensure chore queue and metabolic horizon are present for existing saves
          if (!this.data.chores?.queue || !this.data.chores.queue.length) {
            this.data.chores = {
              stage: 1,
              dailyPoolHours: 6.0,
              remainingHours: 6.0,
              totalRequiredChoreHours: 6.0,
              freeTimePct: 25,
              loggedToday: [],
              queue: [
                {
                  id: 'water_hauling',
                  name: 'Manual Cistern Pumping & Hauling',
                  hours: 2.0,
                  vocation: 'The Gardener',
                  automated: false,
                  automatedBy: 'ESP32 Subsurface Solenoid Relay',
                  unlockCondition: 'Stage 2 FabLab required'
                },
                {
                  id: 'garden_weeding',
                  name: 'Bio-Intensive Weeding & Soil Aeration',
                  hours: 2.0,
                  vocation: 'The Gardener',
                  automated: false,
                  automatedBy: 'Open-Source FarmBot Gantry',
                  unlockCondition: 'Stage 2 FabLab required'
                },
                {
                  id: 'solar_adjustment',
                  name: 'Manual Solar Tilt & Battery Hydrometer Check',
                  hours: 1.0,
                  vocation: 'The Electrician',
                  automated: false,
                  automatedBy: 'Dual-Axis PLC Actuator Kit',
                  unlockCondition: 'Stage 2 FabLab required'
                },
                {
                  id: 'thermal_hygiene',
                  name: 'Compost Toilet Aeration & Camp Firewood',
                  hours: 1.0,
                  vocation: 'The Builder',
                  automated: false,
                  automatedBy: 'Thermophilic Air Blower & Log Splitter',
                  unlockCondition: 'Stage 2 FabLab required'
                }
              ],
              automationsBuilt: []
            };
            this.save();
          }

          // Deterministically reconcile objectives with actual constructed buildings
          this.reconcileStateAndObjectives();
        }
      }
    } catch (e) {
      console.warn('[GameState] Load failed, using defaults:', e);
    }
  }

  reset() {
    try {
      localStorage.removeItem('one_game_save');
      window.location.reload();
    } catch (e) {}
  }
}

export const gameState = new GameState();
