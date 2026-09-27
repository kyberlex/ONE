/**
 * Legacy Adversary AI Director - "The Storyteller" (Agent SIM-3)
 * Evaluates node thermodynamic vulnerabilities and executes system stress events:
 * 1. NPL Debt Strike (Foreclosure & Lawfare)
 * 2. Grid Severing (Power Cutoff during Cold Snap)
 * 3. Tax Inspection & Roadblocks (Trade Interdiction)
 * 4. False UBI Cooptation (Black Market Infiltration)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { interpolateCurrency } from '../data/bioregions.js';

export class LegacyAdversaryDirector {
  constructor(config = {}) {
    this.threatLevel = 15; // [0, 100]% (System Alert & Encroachment)
    this.eventHistory = [];
    this.activeCrisis = null;
    this.crisisCooldownTicks = 48; // Minimum 2 days between major events
    this.lastCrisisTick = -999;
    this.currencySymbol = config.currencySymbol || '$';
  }

  /**
   * Scans node physical & legal state to compute vulnerability scores
   */
  evaluateVulnerabilities(thermoSnapshot, nodeSnapshot) {
    let vulnerabilityScore = 0;
    const factors = [];

    // 1. Energy vulnerability (low battery or high grid dependence)
    if (thermoSnapshot.energy.percent < 25) {
      vulnerabilityScore += 25;
      factors.push('Low battery reserve buffer (<25%)');
    }

    // 2. Food vulnerability (< 10 days)
    if (thermoSnapshot.food.daysRemaining < 10) {
      vulnerabilityScore += 25;
      factors.push('Food stock below 10-day safety floor');
    }

    // 3. Water buffer vulnerability
    if (thermoSnapshot.water.percent < 20) {
      vulnerabilityScore += 20;
      factors.push('Water cistern buffer critically low (<20%)');
    }

    // 4. Infrastructure wear & tear
    let wornMachines = 0;
    for (const key of Object.keys(thermoSnapshot.machinery)) {
      if (thermoSnapshot.machinery[key].durability < 25) {
        wornMachines++;
      }
    }
    if (wornMachines > 0) {
      vulnerabilityScore += wornMachines * 10;
      factors.push(`${wornMachines} vital machine(s) near breakdown threshold`);
    }

    // 5. Morale & Social friction
    if (nodeSnapshot.communityMorale < 60) {
      vulnerabilityScore += 20;
      factors.push('Citizen morale compromised by overwork');
    }

    // 6. Active Meteorological Disaster stress
    if (thermoSnapshot.weather?.activeDisaster) {
      const d = thermoSnapshot.weather.activeDisaster;
      vulnerabilityScore += 25;
      factors.push(`Severe meteorological alert active: ${d.name}`);
      if (d.id === 'HEAT_DOME' && thermoSnapshot.energy.percent < 40) {
        vulnerabilityScore += 20;
        factors.push('Heat dome straining battery thermal chiller');
      } else if (d.id === 'ATMOSPHERIC_RIVER' && thermoSnapshot.water.percent > 85) {
        vulnerabilityScore += 15;
        factors.push('Atmospheric river flooding cistern silt buffers');
      }
    }

    this.threatLevel = Math.min(100, Math.max(10, vulnerabilityScore));
    return {
      threatLevel: this.threatLevel,
      factors
    };
  }

  /**
   * Tick step for the Legacy AI Storyteller
   * Evaluates if a systemic attack should be triggered
   */
  tick(currentTick, thermoSnapshot, nodeSnapshot) {
    if (nodeSnapshot?.currencySymbol) {
      this.currencySymbol = nodeSnapshot.currencySymbol;
    }

    // If a crisis is already active, advance it
    if (this.activeCrisis) {
      this.activeCrisis.durationTicksRemaining--;
      if (this.activeCrisis.durationTicksRemaining <= 0) {
        // Crisis ended with default resolution
        const finishedCrisis = this.activeCrisis;
        this.activeCrisis = null;
        this.eventHistory.unshift({
          tick: currentTick,
          title: `Crisis Concluded: ${finishedCrisis.name}`,
          outcome: finishedCrisis.resolutionSummary || 'Resolved by community resilience.'
        });
        return { type: 'CRISIS_RESOLVED', crisis: finishedCrisis };
      }
      return { type: 'CRISIS_ACTIVE', crisis: this.activeCrisis };
    }

    // Check cooldown
    if (currentTick - this.lastCrisisTick < this.crisisCooldownTicks) {
      return null;
    }

    // Vulnerability check
    const evalResult = this.evaluateVulnerabilities(thermoSnapshot, nodeSnapshot);

    // Probability of strike scales with threat level
    // At threat 20: ~2% chance per tick; at threat 70: ~8% chance per tick
    const strikeProbability = (this.threatLevel / 100) * 0.06;
    if (Math.random() < strikeProbability) {
      const newCrisis = this.generateTargetedCrisis(currentTick, evalResult, thermoSnapshot);
      this.activeCrisis = newCrisis;
      this.lastCrisisTick = currentTick;
      this.eventHistory.unshift({
        tick: currentTick,
        title: `⚠️ LEGACY ADVERSARY STRIKE: ${newCrisis.name}`,
        description: newCrisis.description
      });
      return { type: 'CRISIS_STARTED', crisis: newCrisis };
    }

    return null;
  }

  generateTargetedCrisis(currentTick, evalResult, thermoSnapshot) {
    const crisisPrototypes = [
      {
        id: 'npl_debt_strike',
        nameKey: 'crisis_npl_name',
        name: 'Foreclosure Threat',
        category: 'LEGAL_FINANCIAL',
        severity: 'HIGH',
        durationTicksRemaining: 18,
        descKey: 'crisis_npl_desc',
        description:
          'A debt collector demands money for an old mortgage and threatens to seize our workshop tools!',
        impactKey: 'crisis_npl_impact',
        impact: 'If unresolved: we risk losing a third of our workshop machinery.',
        options: [
          {
            id: 'custodia_civilis',
            labelKey: 'crisis_npl_opt1_label',
            label: 'Peaceful Citizen Defense (Human Presence)',
            costKey: 'crisis_npl_opt1_cost',
            costSummary: 'Takes 4 hours of community time, zero money',
            moraleDelta: +10,
            threatDelta: -25,
            action: 'DECLARE_CUSTODIA_CIVILIS'
          },
          {
            id: 'fiat_settlement',
            labelKey: 'crisis_npl_opt2_label',
            label: 'Pay off the collector to avoid trouble',
            costKey: 'crisis_npl_opt2_cost',
            costSummary: 'Costs €2,500 from community savings',
            fiatCost: 2500,
            moraleDelta: -15,
            threatDelta: -10,
            action: 'PAY_SETTLEMENT'
          }
        ]
      },
      {
        id: 'grid_severing',
        nameKey: 'crisis_grid_name',
        name: 'Sudden Power Cut',
        category: 'INFRASTRUCTURE',
        severity: 'CRITICAL',
        durationTicksRemaining: 12,
        descKey: 'crisis_grid_desc',
        description:
          'The power company cut off the lines claiming our solar equipment disrupted their grid.',
        impactKey: 'crisis_grid_impact',
        impact: 'If unresolved: water pumps stop and greenhouses will chill overnight.',
        options: [
          {
            id: 'island_galvanic',
            labelKey: 'crisis_grid_opt1_label',
            label: 'Switch to our battery reserves and shut down non-essentials',
            costKey: 'crisis_grid_opt1_cost',
            costSummary: 'Uses 30 kWh of battery storage and makes us fully independent',
            batteryCostKwh: 30,
            moraleDelta: +5,
            threatDelta: -20,
            action: 'ENGAGE_ISLAND_MODE'
          },
          {
            id: 'diesel_generator',
            labelKey: 'crisis_grid_opt2_label',
            label: 'Start the diesel generator',
            costKey: 'crisis_grid_opt2_cost',
            costSummary: 'Costs €450 in fuel and produces toxic smoke',
            fiatCost: 450,
            moraleDelta: -10,
            threatDelta: +5,
            action: 'START_DIESEL'
          }
        ]
      },
      {
        id: 'tax_inspection_roadblock',
        nameKey: 'crisis_tax_name',
        name: 'Supply Van Stopped for Inspection',
        category: 'COMMERCE',
        severity: 'MODERATE',
        durationTicksRemaining: 14,
        descKey: 'crisis_tax_desc',
        description:
          'Police stopped our community supply van carrying fresh vegetables and spare parts to friends.',
        impactKey: 'crisis_tax_impact',
        impact: 'Cargo might be seized and direct trade halted.',
        options: [
          {
            id: 'mesh_reroute',
            labelKey: 'crisis_tax_opt1_label',
            label: 'Use backroads and trade directly',
            costKey: 'crisis_tax_opt1_cost',
            costSummary: 'Trade directly with partner villages without middlemen',
            moraleDelta: +8,
            threatDelta: -15,
            action: 'REROUTE_MESH_BARTER'
          },
          {
            id: 'pay_fine',
            labelKey: 'crisis_tax_opt2_label',
            label: 'Pay the road fee',
            costKey: 'crisis_tax_opt2_cost',
            costSummary: 'Costs €950 in cash',
            fiatCost: 950,
            moraleDelta: -5,
            threatDelta: 0,
            action: 'PAY_FINE'
          }
        ]
      },
      {
        id: 'false_ubi_cooptation',
        nameKey: 'crisis_ubi_name',
        name: 'Suspicious Cash Offer',
        category: 'SOCIAL_CORRUPTION',
        severity: 'MODERATE',
        durationTicksRemaining: 20,
        descKey: 'crisis_ubi_desc',
        description:
          'A real estate group is handing cash to young residents to convince them to sublet community homes to tourists.',
        impactKey: 'crisis_ubi_impact',
        impact: 'If left unchecked: homes become tourist rentals and free housing for locals disappears.',
        options: [
          {
            id: 'public_assembly_audit',
            labelKey: 'crisis_ubi_opt1_label',
            label: 'Explain to the assembly why homes must stay free for all',
            costKey: 'crisis_ubi_opt1_cost',
            costSummary: 'Strengthens community trust and stops speculation',
            moraleDelta: +12,
            threatDelta: -30,
            action: 'EXPOSE_SPECULATION'
          },
          {
            id: 'ignore_bribe',
            labelKey: 'crisis_ubi_opt2_label',
            label: 'Do nothing and hope common sense prevails',
            costKey: 'crisis_ubi_opt2_cost',
            costSummary: 'Zero cost today, risk of conflicts tomorrow',
            moraleDelta: -12,
            threatDelta: +20,
            action: 'IGNORE_COOPTATION'
          }
        ]
      },
      {
        id: 'surge_pricing_blackout',
        nameKey: 'crisis_surge_name',
        name: 'Electricity Surcharge Demand',
        category: 'ENERGY_EXTORTION',
        severity: 'CRITICAL',
        durationTicksRemaining: 16,
        descKey: 'crisis_surge_desc',
        description:
          'During a heatwave the regional grid is strained and demands an exorbitant fee to keep our power on.',
        impactKey: 'crisis_surge_impact',
        impact: 'If unresolved: cooling stops and medical clinic fridges could lose power.',
        options: [
          {
            id: 'island_shedding',
            labelKey: 'crisis_surge_opt1_label',
            label: 'Rely on our batteries and shut down luxuries',
            costKey: 'crisis_surge_opt1_cost',
            costSummary: 'Uses 25 kWh of battery reserves to protect medicines and food',
            batteryCostKwh: 25,
            moraleDelta: +10,
            threatDelta: -25,
            action: 'ISLAND_PRIORITY_SHED'
          },
          {
            id: 'pay_surge_fee',
            labelKey: 'crisis_surge_opt2_label',
            label: 'Pay the demanded surcharge',
            costKey: 'crisis_surge_opt2_cost',
            costSummary: 'Costs €3,500 from our savings',
            fiatCost: 3500,
            moraleDelta: -12,
            threatDelta: +10,
            action: 'PAY_SURGE_FEE'
          }
        ]
      },
      {
        id: 'toxic_runoff_flood',
        nameKey: 'crisis_toxic_name',
        name: 'Mud Runoff Toward Cisterns',
        category: 'ECOLOGICAL_THREAT',
        severity: 'HIGH',
        durationTicksRemaining: 18,
        descKey: 'crisis_toxic_desc',
        description:
          'After heavy rain, a nearby dump failed and polluted mud is washing toward our stream!',
        impactKey: 'crisis_toxic_impact',
        impact: 'If unresolved: half our water reserves could become unusable.',
        options: [
          {
            id: 'mycelial_biochar_bund',
            labelKey: 'crisis_toxic_opt1_label',
            label: 'Build natural dirt and biochar berms to divert runoff',
            costKey: 'crisis_toxic_opt1_cost',
            costSummary: 'Takes 4 hours of team effort, zero money spent',
            moraleDelta: +12,
            threatDelta: -30,
            action: 'DEPLOY_BIOFILTER'
          },
          {
            id: 'commercial_cartridges',
            labelKey: 'crisis_toxic_opt2_label',
            label: 'Rush-order commercial filter cartridges',
            costKey: 'crisis_toxic_opt2_cost',
            costSummary: 'Costs €1,800 from emergency funds',
            fiatCost: 1800,
            moraleDelta: -8,
            threatDelta: -5,
            action: 'BUY_COMMERCIAL_FILTERS'
          }
        ]
      }
    ];

    // Select crisis: prioritize meteorological synergy if active disaster is underway
    let candidateCrises = [...crisisPrototypes];
    if (thermoSnapshot.weather?.activeDisaster) {
      const disasterId = thermoSnapshot.weather.activeDisaster.id;
      if (disasterId === 'HEAT_DOME' || disasterId === 'HEATWAVE_DROUGHT') {
        const heatCrisis = crisisPrototypes.find(c => c.id === 'surge_pricing_blackout');
        if (heatCrisis && Math.random() < 0.75) candidateCrises = [heatCrisis];
      } else if (disasterId === 'ATMOSPHERIC_RIVER' || disasterId === 'FLASH_FLOOD') {
        const riverCrisis = crisisPrototypes.find(c => c.id === 'toxic_runoff_flood');
        if (riverCrisis && Math.random() < 0.75) candidateCrises = [riverCrisis];
      }
    }

    const cur = this.currencySymbol || '$';
    const rawCrisis = candidateCrises[Math.floor(Math.random() * candidateCrises.length)];
    const crisis = {
      ...rawCrisis,
      spawnTick: currentTick,
      currencySymbol: cur,
      description: interpolateCurrency(rawCrisis.description, cur),
      impact: interpolateCurrency(rawCrisis.impact, cur),
      options: rawCrisis.options.map(opt => ({
        ...opt,
        label: interpolateCurrency(opt.label, cur),
        costSummary: interpolateCurrency(opt.costSummary, cur)
      }))
    };
    return crisis;
  }

  /**
   * Resolve an active crisis via player choice
   */
  resolveCrisis(optionId) {
    if (!this.activeCrisis) return null;

    const chosenOption = this.activeCrisis.options.find(o => o.id === optionId);
    if (!chosenOption) return null;

    const resolution = {
      crisisId: this.activeCrisis.id,
      crisisName: this.activeCrisis.name,
      chosenOption,
      threatDelta: chosenOption.threatDelta,
      moraleDelta: chosenOption.moraleDelta,
      fiatCost: chosenOption.fiatCost || 0,
      batteryCostKwh: chosenOption.batteryCostKwh || 0
    };

    this.threatLevel = Math.max(5, Math.min(100, this.threatLevel + chosenOption.threatDelta));
    this.activeCrisis = null;
    return resolution;
  }
}
