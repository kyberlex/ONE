/**
 * Node Demography, Dynamic Usufruct & Labor Allocation (Agent SIM-1 & SIM-0)
 * Implements:
 * 1. Population with psychometric flaw vectors (greed, tribal bias, fatigue).
 * 2. Dynamic Usufruct ("Use it or lose it") for housing + Civic Circular Furniture Swap Shop.
 * 3. 4-hour chore roster (Agriculture, Facilities/Energy, Care/Community, Workshop/FabLab).
 * 4. Robot tech tree labor cancellation (automation permanently removes human chore hours).
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { COMMUNITY_VOCATIONS, getVocationById } from '../data/vocations.js';

export class OneNode {
  constructor(config = {}) {
    this.id = config.id || 'node-delray-01';
    this.name = config.name || 'Detroit Delray Commons';
    this.bioregion = config.bioregion || 'Great Lakes Basin';
    this.hexCoord = config.hexCoord || { q: 0, r: 0 };
    this.foundedDay = config.foundedDay || 1;

    // Demography
    this.population = config.population || 28;
    this.citizens = [];

    // Dynamic Usufruct Housing Units
    this.housingPool = [];

    // Circular Furniture Swap Shop (Circular Re-use Hub)
    this.furnitureSwapShop = {
      beds: 6,
      tables: 4,
      chairs: 16,
      wardrobes: 5,
      workbenches: 2
    };

    // Chore Roster (Baseline Subsistence Contribution)
    // Constitutional Invariant: Strenuous/Heavy physical labor counts for DOUBLE (2.0x) light labor!
    this.choreMultipliers = {
      agriculture: 2.0, // Heavy Strenuous Labor (1h = 2.0h credit!)
      facilities: 1.3,  // Technical Infrastructure (1h = 1.3h credit)
      care: 1.0,        // Social Care & Communal Kitchen (1h = 1.0h credit)
      workshop: 1.8     // Heavy Metal Smelting, Shredding & Repair (1h = 1.8h credit)
    };

    // Daily required credit-hours per domain
    this.choreRequirements = {
      agriculture: 8,   // greenhouse, food forest, compost (with 2x multiplier, only 4 human hours needed!)
      facilities: 6,    // water pumps, inverters, battery monitoring
      care: 6,          // common kitchen, daycare, clinic
      workshop: 8       // maintenance, recycling shredder, fablab
    };

    // Current human citizen assignments (in people assigned)
    this.choreAssignments = {
      agriculture: 3,
      facilities: 2,
      care: 2,
      workshop: 2
    };

    // Free Vocation Choice: Player can specialize in any of the 11 specialized community roles
    this.playerVocation = 'farmer';

    // Automated Robots (FabLab tech tree)
    this.robots = {
      esp32Valves: { name: 'ESP32 Smart Irrigation Valves', count: 0, hoursCancelled: 2, domain: 'agriculture' },
      farmRover: { name: 'Autonomous Agro-Rover (Seeding/Weeding)', count: 0, hoursCancelled: 4, domain: 'agriculture' },
      mpptOptimizer: { name: 'SCADA Microgrid Auto-Balancer', count: 0, hoursCancelled: 3, domain: 'facilities' },
      cleaningBot: { name: 'Common House Sanitization Bot', count: 0, hoursCancelled: 2, domain: 'care' },
      cncSorter: { name: 'FabLab Shredder & Sorter Arm', count: 0, hoursCancelled: 4, domain: 'workshop' }
    };

    // Agro-Ecological Resilience Defenses (Meteorological Hazard Mitigations)
    this.agroResilience = {
      hailNetting: {
        id: 'hailNetting',
        name: 'Tensioned Anti-Hail Canopy Netting',
        installed: false,
        icon: '🛡️',
        costMaterials: '2 PETG spools, 5 kg Al',
        desc: 'Protects open-field vegetable crops and young orchards from physical hail stone shattering.',
        mitigatesDisaster: 'HAIL',
        mitigationFactor: 0.85
      },
      keylineSwales: {
        id: 'keylineSwales',
        name: 'Keyline Bioswales & Contour Infiltration Beds',
        installed: false,
        icon: '🌊',
        costMaterials: 'Earthworks & Gravel Filter',
        desc: 'Chunnels torrential rainfall into deep contour swales, eliminating soil erosion, waterlogging, and root rot.',
        mitigatesDisaster: 'FLOOD',
        mitigationFactor: 0.80
      },
      agroforestryWindbreak: {
        id: 'agroforestryWindbreak',
        name: 'Agroforestry Windbreak Hedgerows',
        installed: false,
        icon: '🌲',
        costMaterials: 'Living Willow & Hazel saplings',
        desc: 'Multi-strata vegetative buffer that dampens gale winds from 80+ km/h to gentle 25 km/h breezes.',
        mitigatesDisaster: 'GALE',
        mitigationFactor: 0.75
      },
      permacultureMulch: {
        id: 'permacultureMulch',
        name: 'Biochar, Deep Straw Mulch & Micro-Misting',
        installed: false,
        icon: '🌾',
        costMaterials: 'Biochar + 4 Straw Bales',
        desc: 'Locks in topsoil moisture and reduces soil temperature by up to 8°C during extreme heatwaves.',
        mitigatesDisaster: 'DROUGHT',
        mitigationFactor: 0.70
      },
      evaporativeMistingShade: {
        id: 'evaporativeMistingShade',
        name: 'Reflective Shade Curtains & Adiabatic Misting',
        installed: false,
        icon: '🔥🛡️',
        costMaterials: '3 PETG spools, 6 kg Al, 15m Cu',
        desc: 'Reflective aluminet screens and ultrasonic adiabatic micro-nozzles reduce dome peak temperature by 12°C during Heat Domes.',
        mitigatesDisaster: 'HEAT_DOME',
        mitigationFactor: 0.80
      },
      sedimentPreFilters: {
        id: 'sedimentPreFilters',
        name: 'Vortex Hydrocyclone & Gravel Pre-Filters',
        installed: false,
        icon: '🌀',
        costMaterials: '12 kg Al, Gravel Bed & Mesh',
        desc: 'Pre-separates sand, silt, and heavy mud before water reaches RO pumps, shielding membranes during Atmospheric Rivers.',
        mitigatesDisaster: 'ATMOSPHERIC_RIVER',
        mitigationFactor: 0.65
      }
    };

    // Free time and community morale
    this.averageFreeHoursPerDay = 16.0;
    this.communityMorale = 85;
    this.externalFiatTreasuryEur = config.externalFiatTreasuryEur || 4200;

    this.initCitizens();
    this.initHousingPool();
  }

  setPlayerVocation(vocationId) {
    const voc = getVocationById(vocationId);
    if (voc) {
      this.playerVocation = voc.id;
      if (voc.domain && this.choreMultipliers[voc.domain]) {
        this.choreMultipliers[voc.domain] = voc.multiplier;
      }
      this.updateLaborAndMorale();
    }
  }

  initCitizens() {
    this.citizens = [];
    const childNames = ['Leo Lin', 'Mia Ramos', 'Noah Dubois', 'Chloe Chen'];
    const elderNames = [
      { name: 'Arthur Pendelton', vocId: 'carpenter', role: 'Master Carpenter & Elder Mentor' },
      { name: 'Evelyn Reed', vocId: 'nurse', role: 'Elder Healer & Herbalist' },
      { name: 'Giacomo Valli', vocId: 'forester', role: 'Forest Elder & Seed Keeper' },
      { name: 'Fatima Zahra', vocId: 'mediator', role: 'Sortition Elder & Civic Mediator' },
      { name: 'Hiroshi Tanaka', vocId: 'electrician', role: 'Senior Grid Engineer' },
      { name: 'Sofia Rossi', vocId: 'chef', role: 'Communal Sourdough & Kitchen Elder' }
    ];

    const adultNames = [
      'Maya Lin', 'Dante Ramos', 'Amina Diallo', 'Marcus Vance',
      'Elena Rostova', 'Tariq Al-Mansoor', 'Kaelen O\'Connor',
      'Siddharth Patel', 'Nia Washington', 'Ingrid Lindholm',
      'Mateo Fernandez', 'Zara Chen', 'Lucas Schmidt',
      'Liam Gallagher', 'Freja Nielsen', 'Ananya Roy', 'Youssef Benali',
      'Olga Petrenko'
    ];

    let citIndex = 1;

    // 1. 👶 Children (Age 5 - 13): 100% Free of labor duty (Art. 5.3 & 5.4), attending Forest School & Nursery
    for (let i = 0; i < childNames.length; i++) {
      this.citizens.push({
        id: `cit-${citIndex++}`,
        name: childNames[i],
        ageGroup: 'child',
        age: 6 + i * 2,
        vocationId: 'student',
        vocationName: 'Pupil & Forest Apprentice',
        vocationDomain: 'care',
        vocationIcon: '🎒',
        dailyHours: 0,
        experienceLevel: 'Apprentice Pupil',
        efficiencyMultiplier: 1.0,
        greed: 0.05,
        tribalBias: 0.05,
        fatigue: 5,
        morale: 95,
        assignedChore: 'education',
        housingId: `house-${i + 1}`,
        sabbaticalActive: false,
        personalInventory: ['Nature Sketchbook', 'Magnifying Glass', 'Seed Packet']
      });
    }

    // 2. 🧑 Able-Bodied Adults (Age 18 - 62): Full rotational chore citizens
    for (let i = 0; i < adultNames.length; i++) {
      const vocation = COMMUNITY_VOCATIONS[i % COMMUNITY_VOCATIONS.length];
      const expLevels = [
        { label: 'Junior Apprentice', mult: 0.85 },
        { label: 'Practitioner', mult: 1.0 },
        { label: 'Senior Artisan', mult: 1.25 },
        { label: 'Master Craftsman', mult: 1.35 }
      ];
      const exp = expLevels[(i * 3) % expLevels.length];

      this.citizens.push({
        id: `cit-${citIndex++}`,
        name: adultNames[i],
        ageGroup: 'adult',
        age: 22 + (i * 2),
        vocationId: vocation.id,
        vocationName: vocation.defaultName,
        vocationDomain: vocation.domain,
        vocationIcon: vocation.icon,
        dailyHours: 4,
        experienceLevel: exp.label,
        efficiencyMultiplier: exp.mult,
        greed: Number((Math.random() * 0.5 + 0.1).toFixed(2)),
        tribalBias: Number((Math.random() * 0.4).toFixed(2)),
        fatigue: Math.floor(Math.random() * 25),
        morale: Math.floor(Math.random() * 25 + 75),
        assignedChore: vocation.domain,
        housingId: `house-${childNames.length + i + 1}`,
        sabbaticalActive: false,
        personalInventory: ['OpenMesh Radio', 'Personal Multitool', 'Cryptographic Biometric Key']
      });
    }

    // 3. 🧓 Elders & Assisted Residents (Age 65 - 84):
    // Exempt from compulsory physical chores (Art. 5.1 & 5.6), living in Intergenerational Sanctuary
    for (let i = 0; i < elderNames.length; i++) {
      const el = elderNames[i];
      const voc = getVocationById(el.vocId) || COMMUNITY_VOCATIONS[0];
      this.citizens.push({
        id: `cit-${citIndex++}`,
        name: el.name,
        ageGroup: 'elder',
        age: 68 + i * 3,
        vocationId: voc.id,
        vocationName: el.role,
        vocationDomain: voc.domain,
        vocationIcon: '🧓',
        dailyHours: 0, // Inalienable rest from physical maintenance!
        experienceLevel: 'Grand Master Mentor',
        efficiencyMultiplier: 1.4,
        isMentor: true,
        mentorBonus: 0.20, // Boosts apprentices in their domain by +20%
        greed: 0.08,
        tribalBias: 0.12,
        fatigue: 12,
        morale: 90,
        assignedChore: 'mentoring',
        housingId: 'intergenerational-sanctuary',
        sabbaticalActive: false,
        personalInventory: ['Handcrafted Cane', 'Vintage Lens', 'Wisdom Chronicles']
      });
    }
  }

  getDemographics() {
    const children = this.citizens.filter(c => c.ageGroup === 'child');
    const adults = this.citizens.filter(c => c.ageGroup === 'adult');
    const elders = this.citizens.filter(c => c.ageGroup === 'elder');
    return {
      childrenCount: children.length,
      adultsCount: adults.length,
      eldersCount: elders.length,
      totalCount: this.citizens.length
    };
  }

  initHousingPool() {
    // 32 modular housing units (28 occupied, 4 reserve buffer for arrivals/sabbaticals)
    for (let i = 1; i <= 32; i++) {
      const isOccupied = i <= this.population;
      this.housingPool.push({
        id: `house-${i}`,
        type: i % 4 === 0 ? 'Family Loft (2-3 pax)' : 'Single Bioclimatic Pod',
        occupiedBy: isOccupied ? `cit-${i}` : null,
        isCivicReserve: !isOccupied,
        sabbaticalLockUntilTick: null,
        lastOccupantActiveTick: 0,
        furnitureSet: {
          bed: true,
          table: true,
          chair: true,
          wardrobe: true
        }
      });
    }
  }

  /**
   * Recalculates effective daily labor hours and free time after robot cancellation & elder mentorship
   */
  updateLaborAndMorale() {
    // Calculate total robot cancelled hours per domain
    const cancelledHours = {
      agriculture: 0,
      facilities: 0,
      care: 0,
      workshop: 0
    };

    for (const key of Object.keys(this.robots)) {
      const r = this.robots[key];
      if (r.count > 0) {
        cancelledHours[r.domain] += r.count * r.hoursCancelled;
      }
    }

    // Elder mentorship bonus: elders provide +15% collective labor efficiency
    const elders = this.citizens.filter(c => c.ageGroup === 'elder');
    const mentorEfficiencyMultiplier = 1 + (elders.length * 0.025); // ~1.15x efficiency

    // Effective daily credit-hours needed per domain (cannot fall below 1 hour human supervision)
    const effectiveAgri = Math.max(1, (this.choreRequirements.agriculture - cancelledHours.agriculture) / mentorEfficiencyMultiplier);
    const effectiveFac = Math.max(1, (this.choreRequirements.facilities - cancelledHours.facilities) / mentorEfficiencyMultiplier);
    const effectiveCare = Math.max(1, (this.choreRequirements.care - cancelledHours.care) / mentorEfficiencyMultiplier);
    const effectiveWork = Math.max(1, (this.choreRequirements.workshop - cancelledHours.workshop) / mentorEfficiencyMultiplier);

    // Constitutional Principle: Heavy/strenuous jobs count 2x, so human physical hours needed are divided by effort multiplier!
    const physicalAgriNeeded = effectiveAgri / this.choreMultipliers.agriculture;
    const physicalFacNeeded = effectiveFac / this.choreMultipliers.facilities;
    const physicalCareNeeded = effectiveCare / this.choreMultipliers.care;
    const physicalWorkNeeded = effectiveWork / this.choreMultipliers.workshop;

    const totalPhysicalHoursNeeded = Number((physicalAgriNeeded + physicalFacNeeded + physicalCareNeeded + physicalWorkNeeded).toFixed(1));
    
    // Physical chores are distributed only among able-bodied adults (children and elders are exempt)
    const activeAdultsCount = Math.max(1, this.citizens.filter(c => c.ageGroup === 'adult').length);
    const choreHoursPerCitizen = Number((totalPhysicalHoursNeeded / activeAdultsCount).toFixed(2));

    // Check for uncovered vital domains ("a meno che non ci sia nessuno...")
    const uncoveredDomains = [];
    if (this.choreAssignments.agriculture === 0 && effectiveAgri > 1) uncoveredDomains.push('agriculture');
    if (this.choreAssignments.facilities === 0 && effectiveFac > 1) uncoveredDomains.push('facilities');
    if (this.choreAssignments.care === 0 && effectiveCare > 1) uncoveredDomains.push('care');
    if (this.choreAssignments.workshop === 0 && effectiveWork > 1) uncoveredDomains.push('workshop');

    const hasUncoveredEmergency = uncoveredDomains.length > 0;

    // 24h day - 8h sleep - chores = Free Time
    this.averageFreeHoursPerDay = Math.max(10, Number((16 - choreHoursPerCitizen).toFixed(1)));

    // Morale formula: boosted by high free time, children presence (+8%), penalized by uncovered vital domains
    const freeTimeBonus = (this.averageFreeHoursPerDay - 12) * 5;
    const emergencyPenalty = hasUncoveredEmergency ? -15 : 0;
    const childrenPresenceBonus = this.citizens.some(c => c.ageGroup === 'child') ? 8 : 0;

    this.communityMorale = Math.max(20, Math.min(100, Math.round(75 + freeTimeBonus + emergencyPenalty + childrenPresenceBonus)));

    return {
      totalChoreHoursNeeded: totalPhysicalHoursNeeded,
      choreHoursPerCitizen,
      averageFreeHoursPerDay: this.averageFreeHoursPerDay,
      communityMorale: this.communityMorale,
      cancelledHours,
      uncoveredDomains,
      hasUncoveredEmergency,
      choreMultipliers: this.choreMultipliers,
      playerVocation: this.playerVocation,
      demographics: this.getDemographics()
    };
  }

  /**
   * Enforces Dynamic Usufruct Invariant ("Use it or lose it")
   * Called periodically (every 24 ticks / 1 day).
   * If a citizen is inactive/abandoned without Sabbatical Lock for > 14 days (336 ticks):
   * 1. House is released back to Civic Housing Pool.
   * 2. Heavy furniture is reclaimed and moved to Furniture Swap Shop.
   * 3. Personal inventory remains 100% untouched.
   */
  auditUsufructHousing(currentTick) {
    const abandonedUnits = [];

    for (const unit of this.housingPool) {
      if (unit.occupiedBy) {
        const citizen = this.citizens.find(c => c.id === unit.occupiedBy);
        // Check if sabbatical is active
        const hasSabbatical = unit.sabbaticalLockUntilTick && unit.sabbaticalLockUntilTick > currentTick;

        if (!hasSabbatical) {
          // If inactive for more than 14 simulated days (336 ticks)
          const inactiveTicks = currentTick - unit.lastOccupantActiveTick;
          if (inactiveTicks > 336) {
            // Reclaim dwelling!
            abandonedUnits.push({
              unitId: unit.id,
              previousOccupant: citizen ? citizen.name : 'Unknown',
              inactiveDays: Math.floor(inactiveTicks / 24)
            });

            // Move furniture to Swap Shop
            if (unit.furnitureSet.bed) this.furnitureSwapShop.beds++;
            if (unit.furnitureSet.table) this.furnitureSwapShop.tables++;
            if (unit.furnitureSet.chair) this.furnitureSwapShop.chairs += 2;
            if (unit.furnitureSet.wardrobe) this.furnitureSwapShop.wardrobes++;

            // Reset unit
            unit.occupiedBy = null;
            unit.isCivicReserve = true;
            unit.furnitureSet = { bed: false, desk: false, chair: false, wardrobe: false };
            if (citizen) {
              citizen.housingId = null;
            }
          }
        }
      }
    }

    return abandonedUnits;
  }

  /**
   * Activate Sabbatical Lock for a citizen's home (protects against reallocation)
   */
  setSabbaticalLock(citizenId, durationTicks = 720) { // Default 30 days
    const citizen = this.citizens.find(c => c.id === citizenId);
    if (!citizen || !citizen.housingId) return false;

    const unit = this.housingPool.find(u => u.id === citizen.housingId);
    if (unit) {
      unit.sabbaticalLockUntilTick = (unit.lastOccupantActiveTick || 0) + durationTicks;
      citizen.sabbaticalActive = true;
      return true;
    }
    return false;
  }

  /**
   * Assemble a robot in FabLab
   */
  buildRobot(robotKey) {
    if (this.robots[robotKey]) {
      this.robots[robotKey].count++;
      this.updateLaborAndMorale();
      return true;
    }
    return false;
  }

  /**
   * Install an open-hardware agro-resilience defense module
   */
  installAgroResilience(key) {
    if (this.agroResilience && this.agroResilience[key]) {
      this.agroResilience[key].installed = true;
      return true;
    }
    return false;
  }
}
