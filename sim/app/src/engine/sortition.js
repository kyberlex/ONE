/**
 * Athenian Sortition Engine & Demarchy Director (Agent SIM-3)
 * Implements:
 * 1. Tiered demarchic assemblies conforming to Chapter IV (Articles 4.2 & 4.5):
 *    - Population < 50: Local Mediation Panel (3 Citizens, Art. 4.2.1)
 *    - Population >= 50: Neighborhood Sortition Council (15 Citizens, Art. 4.2.2)
 * 2. Invariant Odd Parity & rotational cooling-off period (Art. 4.3.3)
 * 3. Graduated Voting Thresholds (60% qualified vs 75% constitutional supermajority, Art. 4.5)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

// PENDING RATIFICATION: SIM-QA-01 (Quorum Scaling for Emerging Nodes < 50 Pop - see oasis/sim_resolutions_qa.md)
export const SORTITION_TIERS = {
  LOCAL_MEDIATION: {
    key: 'LOCAL_MEDIATION',
    minPop: 0,
    maxPop: 49,
    councilSize: 3,
    titleKey: 'councilLocalMediation',
    titleDefault: 'Local Mediation Panel',
    articleKey: 'articleLocalMediation',
    article: 'Art. 4.2.1',
    descriptionDefault: '3-citizen panel for immediate local mediation, housing restitution, and rapid community balancing.'
  },
  NEIGHBORHOOD_COUNCIL: {
    key: 'NEIGHBORHOOD_COUNCIL',
    minPop: 50,
    maxPop: Infinity,
    councilSize: 15,
    titleKey: 'councilNeighborhood',
    titleDefault: 'Neighborhood Sortition Council',
    articleKey: 'articleNeighborhood',
    article: 'Art. 4.2.2',
    descriptionDefault: '15-citizen assembly for neighborhood resource allocation, utility oversight, and communal policy.'
  }
};

export class AthenianSortitionEngine {
  constructor() {
    this.currentTier = SORTITION_TIERS.LOCAL_MEDIATION;
    this.councilSize = this.currentTier.councilSize;
    this.mandateDurationTicks = 720; // 30 simulated days
    this.currentCouncil = [];
    this.lastRotationTick = 0;
    this.rotationCount = 0;
    this.coolingOffCitizenIds = new Set();
    this.activeDilemma = null;
  }

  /**
   * Resolves the appropriate assembly tier based on population count
   */
  getTierInfo(population = 28) {
    if (population >= 50) {
      return SORTITION_TIERS.NEIGHBORHOOD_COUNCIL;
    }
    return SORTITION_TIERS.LOCAL_MEDIATION;
  }

  /**
   * Conducts a random sortition lottery to assemble the appropriate tiered council
   */
  seatNewCouncil(citizens, currentTick) {
    const population = citizens ? citizens.length : 0;
    this.currentTier = this.getTierInfo(population);
    this.councilSize = this.currentTier.councilSize;

    if (!citizens || citizens.length < this.councilSize) {
      this.currentCouncil = (citizens || []).slice(0, this.councilSize).map(c => ({
        id: c.id,
        name: c.name,
        greed: c.greed ?? 0.2,
        tribalBias: c.tribalBias ?? 0.2,
        morale: c.morale ?? 75,
        stance: 'UNDECIDED'
      }));
      return this.currentCouncil;
    }

    // Filter out citizens currently in cooling-off (served in recent term)
    let eligible = citizens.filter(c => !this.coolingOffCitizenIds.has(c.id));
    if (eligible.length < this.councilSize) {
      // Clear cooling-off if pool is exhausted
      this.coolingOffCitizenIds.clear();
      eligible = [...citizens];
    }

    // Shuffle and pick councilSize
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    this.currentCouncil = shuffled.slice(0, this.councilSize).map(c => ({
      id: c.id,
      name: c.name,
      greed: c.greed ?? 0.2,
      tribalBias: c.tribalBias ?? 0.2,
      morale: c.morale ?? 75,
      stance: 'UNDECIDED' // YES | NO | UNDECIDED
    }));

    // Record cooling off
    for (const member of this.currentCouncil) {
      this.coolingOffCitizenIds.add(member.id);
    }

    this.lastRotationTick = currentTick;
    this.rotationCount++;

    return this.currentCouncil;
  }

  /**
   * Presents a civic dilemma to the seated sortition council
   */
  presentDilemma(dilemma) {
    this.activeDilemma = dilemma;
    // Simulate initial councilor stances based on their psychometric bias
    for (const councilor of this.currentCouncil) {
      let leanScore = 0.5; // neutral baseline
      if (dilemma.type === 'REFUGEE_ASYLUM') {
        // High tribal bias leans against welcoming out-groups
        leanScore -= (councilor.tribalBias ?? 0.2) * 0.6;
      } else if (dilemma.type === 'COMMONS_INVESTMENT') {
        // High greed prefers short-term private vouchers over collective infrastructure
        leanScore -= (councilor.greed ?? 0.2) * 0.5;
      } else if (dilemma.type === 'ENERGY_SURPLUS') {
        leanScore += 0.2;
      }

      councilor.stance = Math.random() < leanScore ? 'YES' : 'NO';
    }

    return {
      dilemma: this.activeDilemma,
      tier: this.currentTier,
      councilVotes: this.getCouncilTally(dilemma)
    };
  }

  /**
   * Calculates the council voting tally using graduated thresholds (Art. 4.5)
   * - 60% Qualified Majority for regular allocations and policy
   * - 75% Constitutional Supermajority for structural amendments / ethical dilemmas
   */
  getCouncilTally(dilemma = null) {
    const targetDilemma = dilemma || this.activeDilemma;
    const yesCount = this.currentCouncil.filter(c => c.stance === 'YES').length;
    const noCount = this.currentCouncil.filter(c => c.stance === 'NO').length;
    const total = this.currentCouncil.length;

    // Graduated voting thresholds (Art. 4.5)
    const isConstitutional = targetDilemma && (targetDilemma.constitutional || targetDilemma.type === 'REFUGEE_ASYLUM');
    const thresholdPct = isConstitutional ? 0.75 : 0.60;
    const requiredVotes = Math.ceil(total * thresholdPct);
    const passed = yesCount >= requiredVotes;

    return {
      yes: yesCount,
      no: noCount,
      total,
      yesPct: total > 0 ? (yesCount / total) * 100 : 0,
      noPct: total > 0 ? (noCount / total) * 100 : 0,
      thresholdPct,
      requiredVotes,
      passed,
      isConstitutional
    };
  }

  /**
   * Resolves dilemma and executes chosen constitutional outcome
   */
  resolveDilemma(choiceKey) { // 'OPTION_A' or 'OPTION_B'
    if (!this.activeDilemma) return null;

    const outcome = choiceKey === 'OPTION_A' ? this.activeDilemma.optionA : this.activeDilemma.optionB;
    const resolvedDilemma = this.activeDilemma;
    this.activeDilemma = null;

    return {
      dilemmaId: resolvedDilemma.id,
      title: resolvedDilemma.title,
      choiceKey,
      outcome
    };
  }
}
