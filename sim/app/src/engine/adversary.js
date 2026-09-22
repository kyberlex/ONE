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

export class LegacyAdversaryDirector {
  constructor() {
    this.threatLevel = 15; // [0, 100]% (System Alert & Encroachment)
    this.eventHistory = [];
    this.activeCrisis = null;
    this.crisisCooldownTicks = 48; // Minimum 2 days between major events
    this.lastCrisisTick = -999;
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
        name: 'NPL Debt Strike (Foreclosure Lawfare)',
        category: 'LEGAL_FINANCIAL',
        severity: 'HIGH',
        durationTicksRemaining: 18,
        descKey: 'crisis_npl_desc',
        description:
          'A vulture debt fund has purchased an unserviced 2011 mortgage on the node territory. Judicial bailiffs and private security have posted a 24-hour seizure notice at the gate!',
        impactKey: 'crisis_npl_impact',
        impact: 'If unresolved: 30% of FabLab machinery sequestered and external trade frozen.',
        options: [
          {
            id: 'custodia_civilis',
            labelKey: 'crisis_npl_opt1_label',
            label: 'Affidavit of Civil Custody (Non-Violent Human Chain)',
            costKey: 'crisis_npl_opt1_cost',
            costSummary: 'Requires 4h community vigil, zero fiat paid',
            moraleDelta: +10,
            threatDelta: -25,
            action: 'DECLARE_CUSTODIA_CIVILIS'
          },
          {
            id: 'fiat_settlement',
            labelKey: 'crisis_npl_opt2_label',
            label: 'Pay Extortion Settlement from Emergency Fiat Fund',
            costKey: 'crisis_npl_opt2_cost',
            costSummary: 'Costs €2,500 from hardware reserve',
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
        name: 'Grid Severing & Sudden Blackout',
        category: 'INFRASTRUCTURE',
        severity: 'CRITICAL',
        durationTicksRemaining: 12,
        descKey: 'crisis_grid_desc',
        description:
          'The regional monopoly utility has arbitrarily cut the high-voltage transmission tie during an unseasonal frost, citing uncertified microgrid feed-in harmonics.',
        impactKey: 'crisis_grid_impact',
        impact: 'If islanding fails: water pumps stop, greenhouse heating drops below 8°C.',
        options: [
          {
            id: 'island_galvanic',
            labelKey: 'crisis_grid_opt1_label',
            label: 'Engage Galvanic Island Isolation & Battery Priority Shedding',
            costKey: 'crisis_grid_opt1_cost',
            costSummary: 'Consumes 30 kWh battery buffer, isolates node completely',
            batteryCostKwh: 30,
            moraleDelta: +5,
            threatDelta: -20,
            action: 'ENGAGE_ISLAND_MODE'
          },
          {
            id: 'diesel_generator',
            labelKey: 'crisis_grid_opt2_label',
            label: 'Cough up Dirty Diesel Backup',
            costKey: 'crisis_grid_opt2_cost',
            costSummary: 'Costs €450 in fossil fuel, creates toxic exhaust',
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
        name: 'Tax Inspection & Highway Roadblock',
        category: 'COMMERCE',
        severity: 'MODERATE',
        durationTicksRemaining: 14,
        descKey: 'crisis_tax_desc',
        description:
          'Highway police and revenue inspectors have impounded the node’s transport van delivering organic preserves and precision CNC prototypes to an ethical buyers collective.',
        impactKey: 'crisis_tax_impact',
        impact: 'External fiat revenue stalled; export goods confiscated unless countered.',
        options: [
          {
            id: 'mesh_reroute',
            labelKey: 'crisis_tax_opt1_label',
            label: 'Reroute Logistics via Local Byways & Mutual Credit Swap',
            costKey: 'crisis_tax_opt1_cost',
            costSummary: 'Shifts 100% of trade into direct barter with federated nodes',
            moraleDelta: +8,
            threatDelta: -15,
            action: 'REROUTE_MESH_BARTER'
          },
          {
            id: 'pay_fine',
            labelKey: 'crisis_tax_opt2_label',
            label: 'Submit and Pay Statutory Transport Fine',
            costKey: 'crisis_tax_opt2_cost',
            costSummary: 'Costs €950 in fiat currency',
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
        name: 'False UBI & Speculative Infiltration',
        category: 'SOCIAL_CORRUPTION',
        severity: 'MODERATE',
        durationTicksRemaining: 20,
        descKey: 'crisis_ubi_desc',
        description:
          'A speculative crypto-proptech firm is distributing €500 prepaid debit cards to young residents, trying to convince them to sublet common housing modules for fiat cash.',
        impactKey: 'crisis_ubi_impact',
        impact: 'If unchecked: black market rent emerges, undermining dynamic usufruct.',
        options: [
          {
            id: 'public_assembly_audit',
            labelKey: 'crisis_ubi_opt1_label',
            label: 'Convene Sortition Council & Open Leontief Exergy Audit',
            costKey: 'crisis_ubi_opt1_cost',
            costSummary: 'Demonstrates physical superiority of usufruct; reinforces non-speculative pact',
            moraleDelta: +12,
            threatDelta: -30,
            action: 'EXPOSE_SPECULATION'
          },
          {
            id: 'ignore_bribe',
            labelKey: 'crisis_ubi_opt2_label',
            label: 'Ignore & Hope Individual Morality Prevails',
            costKey: 'crisis_ubi_opt2_cost',
            costSummary: 'Zero cost today, risk of internal division tomorrow',
            moraleDelta: -12,
            threatDelta: +20,
            action: 'IGNORE_COOPTATION'
          }
        ]
      }
    ];

    // Pick crisis matching highest vulnerability
    const crisis = { ...crisisPrototypes[Math.floor(Math.random() * crisisPrototypes.length)] };
    crisis.spawnTick = currentTick;
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
