/**
 * Civic Volunteer Projects & Megaprojects Engine (Agent SIM-1 & SIM-5)
 * Governs Chapter V (Art. 5.1 & 5.2) non-compulsory community construction:
 * - Citizens pool disposable free hours and surplus circular materials
 * - Unlocks permanent thermodynamic, ecological, and governance bonuses
 * - Persists deterministically in LocalStorage and IndexedDB
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const CIVIC_PROJECT_TEMPLATES = [
  {
    id: 'amphitheater',
    name: 'Agora Socratic Amphitheater & Acoustic Shell',
    nameKey: 'projectAmphitheaterName',
    descKey: 'projectAmphitheaterDesc',
    desc: 'Hemicycle stone and curved timber amphitheater with natural acoustic amplification for citizen assemblies, sortition juries, and communal symposiums.',
    category: 'GOVERNANCE',
    icon: '🏛️',
    canvasCoords: { x: 0, y: -95, radius: 46 },
    requiredHours: 100,
    requiredMaterials: {
      energyKwh: 250,
      aluminumIngotsKg: 10,
      petgFilamentSpools: 8
    },
    perks: {
      moraleBonus: 15,
      sortitionConsensusSpeed: 0.30,
      strikeResistanceBonus: 0.20
    },
    perkSummaryKey: 'projectAmphitheaterPerk',
    perkSummary: '+15 Community Morale, +30% faster sortition quorum speed, +20% resilience against institutional adversary strikes.'
  },
  {
    id: 'biogasDigester',
    name: 'Closed-Loop Anaerobic Biogas Digester',
    nameKey: 'projectBiogasName',
    descKey: 'projectBiogasDesc',
    desc: 'Thermophilic anaerobic digester decomposing organic kitchen and greenhouse waste into clean biomethane for heating and mineral-rich liquid bio-fertilizer.',
    category: 'ENERGY_AGRI',
    icon: '🌿',
    canvasCoords: { x: 375, y: 155, width: 80, height: 60 },
    requiredHours: 120,
    requiredMaterials: {
      energyKwh: 350,
      waterL: 1500,
      aluminumIngotsKg: 12,
      petgFilamentSpools: 10,
      copperWireMeters: 30
    },
    perks: {
      cropYieldMultiplier: 1.25,
      nightThermalKwh: 25,
      organicCompostKgPerDay: 40
    },
    perkSummaryKey: 'projectBiogasPerk',
    perkSummary: '+25% greenhouse crop yield boost, +25 kWh night thermal heating buffer, closed-loop organic fertilizer.'
  },
  {
    id: 'deepRainReservoir',
    name: 'Deep Basalt Rain Reservoir & Reed Wetland',
    nameKey: 'projectReservoirName',
    descKey: 'projectReservoirDesc',
    desc: 'Subterranean basalt cistern and engineered horizontal reed-bed wetland maximizing seasonal storm catchment and passive cooling.',
    category: 'WATER',
    icon: '💧',
    canvasCoords: { x: 375, y: -205, width: 85, height: 65 },
    requiredHours: 140,
    requiredMaterials: {
      energyKwh: 400,
      aluminumIngotsKg: 15,
      petgFilamentSpools: 12,
      biocharKg: 50
    },
    perks: {
      extraCisternCapacityL: 8000,
      evaporationReduction: 0.40,
      droughtImmunity: true
    },
    perkSummaryKey: 'projectReservoirPerk',
    perkSummary: '+8,000 Liters extra water storage capacity, -40% heatwave evaporation loss, high-resilience drought buffer.'
  },
  {
    id: 'solarTower',
    name: 'Solar Thermal Molten Salt Tower & Stirling Spire',
    nameKey: 'projectSolarTowerName',
    descKey: 'projectSolarTowerDesc',
    desc: 'Central solar receiver spire with micro-heliostat tracking mirrors concentrating solar flux to melt salts for 24/7 dispatchable green baseload power.',
    category: 'ENERGY',
    icon: '⚡',
    canvasCoords: { x: -375, y: -205, width: 80, height: 75 },
    requiredHours: 180,
    requiredMaterials: {
      energyKwh: 600,
      aluminumIngotsKg: 25,
      petgFilamentSpools: 15,
      copperWireMeters: 50
    },
    perks: {
      extraBatteryCapacityKwh: 10000,
      overnightBaseloadKwh: 20
    },
    perkSummaryKey: 'projectSolarTowerPerk',
    perkSummary: '+10,000 kWh extra battery reserve capacity, +20 kWh/tick continuous nighttime electricity generation.'
  },
  {
    id: 'seedVault',
    name: 'Cryo-Passive Heirloom Seed Vault & Genomic Bank',
    nameKey: 'projectSeedVaultName',
    descKey: 'projectSeedVaultDesc',
    desc: 'Subterranean thermally buffered vault preserving heirloom non-GMO seeds, mycorrhizal cultures, and open crop genetics permanently immune to proprietary patents.',
    category: 'ECOLOGY',
    icon: '🌾',
    canvasCoords: { x: -245, y: 245, width: 75, height: 55 },
    requiredHours: 90,
    requiredMaterials: {
      energyKwh: 200,
      aluminumIngotsKg: 8,
      petgFilamentSpools: 6,
      copperWireMeters: 20
    },
    perks: {
      blightDamageReduction: 0.75,
      freeSeedTrade: true
    },
    perkSummaryKey: 'projectSeedVaultPerk',
    perkSummary: '-75% crop vulnerability during blight events, unlocks heirloom biodiversity seed manifests for inter-node trade.'
  }
];

export class CivicProjectsEngine {
  constructor(sim) {
    this.sim = sim;
    this.projects = new Map();
    this.initProjects();
  }

  initProjects() {
    for (const tmpl of CIVIC_PROJECT_TEMPLATES) {
      this.projects.set(tmpl.id, {
        ...tmpl,
        status: 'PLANNED', // 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
        contributedHours: 0,
        contributedMaterials: {
          energyKwh: 0,
          waterL: 0,
          aluminumIngotsKg: 0,
          petgFilamentSpools: 0,
          copperWireMeters: 0,
          biocharKg: 0
        },
        contributors: [] // { name, hours, timestamp }
      });
    }

    // Set first project to IN_PROGRESS by default for immediate community agency
    const first = this.projects.get('amphitheater');
    if (first) {
      first.status = 'IN_PROGRESS';
      first.contributedHours = 28; // Community already laid stone foundations
      first.contributedMaterials.energyKwh = 100;
      first.contributedMaterials.aluminumIngotsKg = 4;
      first.contributedMaterials.petgFilamentSpools = 3;
      first.contributors.push(
        { name: 'Marcus Vance', hours: 14, timestamp: Date.now() - 36000000 },
        { name: 'Elena Rostova', hours: 14, timestamp: Date.now() - 18000000 }
      );
    }
  }

  getAllProjects() {
    return Array.from(this.projects.values());
  }

  getProject(id) {
    return this.projects.get(id) || null;
  }

  startProject(id) {
    const proj = this.projects.get(id);
    if (!proj) return false;
    if (proj.status === 'PLANNED') {
      proj.status = 'IN_PROGRESS';
      return true;
    }
    return false;
  }

  contributeHours(projectId, hours, contributorName = 'Player (You)') {
    const proj = this.projects.get(projectId);
    if (!proj || proj.status === 'COMPLETED') return false;

    if (proj.status === 'PLANNED') {
      proj.status = 'IN_PROGRESS';
    }

    proj.contributedHours = Math.min(proj.requiredHours, proj.contributedHours + hours);

    // Record contribution log
    const existing = proj.contributors.find(c => c.name === contributorName);
    if (existing) {
      existing.hours += hours;
      existing.timestamp = Date.now();
    } else {
      proj.contributors.unshift({
        name: contributorName,
        hours,
        timestamp: Date.now()
      });
    }

    this.checkCompletion(proj);
    return true;
  }

  contributeMaterial(projectId, materialKey, amount) {
    const proj = this.projects.get(projectId);
    if (!proj || proj.status === 'COMPLETED') return false;

    const required = proj.requiredMaterials[materialKey] || 0;
    const current = proj.contributedMaterials[materialKey] || 0;
    if (current >= required) return false;

    const delta = Math.min(amount, required - current);
    proj.contributedMaterials[materialKey] = current + delta;

    this.checkCompletion(proj);
    return true;
  }

  allocateAllAvailableMaterials(projectId) {
    const proj = this.projects.get(projectId);
    if (!proj || proj.status === 'COMPLETED') return { success: false, allocated: {} };

    const thermo = this.sim.thermo;
    if (!thermo) return { success: false, allocated: {} };

    const allocated = {};

    for (const [matKey, reqAmount] of Object.entries(proj.requiredMaterials)) {
      const current = proj.contributedMaterials[matKey] || 0;
      const needed = reqAmount - current;
      if (needed <= 0) continue;

      if (matKey === 'energyKwh') {
        const available = Math.max(0, (thermo.energy?.batteryStoredKwh || 0) - 200); // Leave 200 kWh safety reserve
        const take = Math.min(needed, Math.floor(available));
        if (take > 0) {
          thermo.energy.batteryStoredKwh -= take;
          proj.contributedMaterials[matKey] = current + take;
          allocated[matKey] = take;
        }
      } else if (matKey === 'waterL') {
        const available = Math.max(0, (thermo.water?.cisternStoredL || 0) - 1000); // Leave 1000 L safety reserve
        const take = Math.min(needed, Math.floor(available));
        if (take > 0) {
          thermo.water.cisternStoredL -= take;
          proj.contributedMaterials[matKey] = current + take;
          allocated[matKey] = take;
        }
      } else if (thermo.circularMaterials && thermo.circularMaterials[matKey] !== undefined) {
        const available = thermo.circularMaterials[matKey];
        const take = Math.min(needed, available);
        if (take > 0) {
          thermo.circularMaterials[matKey] -= take;
          proj.contributedMaterials[matKey] = current + take;
          allocated[matKey] = take;
        }
      }
    }

    this.checkCompletion(proj);
    return { success: Object.keys(allocated).length > 0, allocated };
  }

  checkCompletion(proj) {
    if (proj.status === 'COMPLETED') return true;

    // Check hours
    const hoursDone = proj.contributedHours >= proj.requiredHours;

    // Check materials
    let materialsDone = true;
    for (const [matKey, reqAmount] of Object.entries(proj.requiredMaterials)) {
      if ((proj.contributedMaterials[matKey] || 0) < reqAmount) {
        materialsDone = false;
        break;
      }
    }

    if (hoursDone && materialsDone) {
      proj.status = 'COMPLETED';
      this.applyPerks(proj);

      // Announce on ticker
      const ticker = document.getElementById('hud-alert-ticker');
      if (ticker) {
        ticker.textContent = `🏛️ Cantiere Civico completato: ${proj.name} inaugurato e operativo!`;
      }
      return true;
    }
    return false;
  }

  applyPerks(proj) {
    const thermo = this.sim?.thermo;
    const node = this.sim?.node;

    if (proj.id === 'amphitheater') {
      if (node) {
        node.communityMorale = Math.min(100, (node.communityMorale || 80) + 15);
      }
    } else if (proj.id === 'deepRainReservoir') {
      if (thermo?.water) {
        thermo.water.cisternCapacityL = (thermo.water.cisternCapacityL || 25000) + 8000;
        thermo.water.cisternStoredL += 2000;
      }
    } else if (proj.id === 'solarTower') {
      if (thermo?.energy) {
        thermo.energy.batteryCapacityKwh = (thermo.energy.batteryCapacityKwh || 12000) + 10000;
        thermo.energy.batteryStoredKwh += 2500;
      }
    } else if (proj.id === 'biogasDigester') {
      // Crop boost applied in thermo calculations
    } else if (proj.id === 'seedVault') {
      // Blight resistance applied in agro-resilience
    }
  }

  tick(hour, day) {
    // Ambient volunteer contributions:
    // When essential chores are covered (hasUncoveredEmergency === false) and daytime (8:00 - 18:00),
    // idle citizens donate 1 volunteer hour to the active project every 4 hours!
    if (hour >= 8 && hour <= 18 && hour % 4 === 0) {
      const activeProj = Array.from(this.projects.values()).find(p => p.status === 'IN_PROGRESS');
      if (activeProj && this.sim.node) {
        const stats = this.sim.node.updateLaborAndMorale();
        if (!stats.hasUncoveredEmergency && this.sim.node.communityMorale >= 65) {
          // Select a random adult citizen to volunteer
          const citizens = this.sim.node.citizens || [];
          const adults = citizens.filter(c => c.age >= 18 && c.age < 63 && !c.isPlayer);
          if (adults.length > 0) {
            const volunteer = adults[Math.floor(Math.random() * adults.length)];
            this.contributeHours(activeProj.id, 2, volunteer.name);
          }
        }
      }
    }
  }

  getProgressPercentage(proj) {
    if (proj.status === 'COMPLETED') return 100;
    const hoursRatio = Math.min(1, proj.contributedHours / proj.requiredHours);

    let matSum = 0;
    let matCount = 0;
    for (const [key, req] of Object.entries(proj.requiredMaterials)) {
      matCount++;
      matSum += Math.min(1, (proj.contributedMaterials[key] || 0) / req);
    }
    const matRatio = matCount > 0 ? matSum / matCount : 1;

    return Math.floor((hoursRatio * 0.5 + matRatio * 0.5) * 100);
  }

  getActivePerks() {
    const perks = {
      moraleBonus: 0,
      extraWaterCapacityL: 0,
      extraBatteryCapacityKwh: 0,
      cropYieldMultiplier: 1.0,
      overnightBaseloadKwh: 0,
      blightDamageReduction: 0,
      sortitionConsensusSpeed: 0
    };

    for (const p of this.projects.values()) {
      if (p.status === 'COMPLETED' && p.perks) {
        if (p.perks.moraleBonus) perks.moraleBonus += p.perks.moraleBonus;
        if (p.perks.extraCisternCapacityL) perks.extraWaterCapacityL += p.perks.extraCisternCapacityL;
        if (p.perks.extraBatteryCapacityKwh) perks.extraBatteryCapacityKwh += p.perks.extraBatteryCapacityKwh;
        if (p.perks.cropYieldMultiplier) perks.cropYieldMultiplier *= p.perks.cropYieldMultiplier;
        if (p.perks.overnightBaseloadKwh) perks.overnightBaseloadKwh += p.perks.overnightBaseloadKwh;
        if (p.perks.blightDamageReduction) perks.blightDamageReduction = Math.max(perks.blightDamageReduction, p.perks.blightDamageReduction);
        if (p.perks.sortitionConsensusSpeed) perks.sortitionConsensusSpeed += p.perks.sortitionConsensusSpeed;
      }
    }
    return perks;
  }

  serialize() {
    const data = {};
    for (const [id, p] of this.projects.entries()) {
      data[id] = {
        status: p.status,
        contributedHours: p.contributedHours,
        contributedMaterials: p.contributedMaterials,
        contributors: p.contributors.slice(0, 15) // Keep last 15 entries
      };
    }
    return data;
  }

  deserialize(data) {
    if (!data) return;
    for (const [id, saved] of Object.entries(data)) {
      const proj = this.projects.get(id);
      if (proj) {
        if (saved.status) proj.status = saved.status;
        if (typeof saved.contributedHours === 'number') proj.contributedHours = saved.contributedHours;
        if (saved.contributedMaterials) {
          proj.contributedMaterials = { ...proj.contributedMaterials, ...saved.contributedMaterials };
        }
        if (Array.isArray(saved.contributors)) {
          proj.contributors = saved.contributors;
        }
        if (proj.status === 'COMPLETED') {
          this.applyPerks(proj);
        }
      }
    }
  }
}
