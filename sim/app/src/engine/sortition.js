/**
 * Athenian Sortition Engine & Demarchy Director (Agent SIM-3)
 * Implements:
 * 1. Random lottery selection of 7 citizens for the Community Council.
 * 2. Regular rotation with cooling-off period.
 * 3. Reigns-style civic dilemmas with voting deliberations.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class AthenianSortitionEngine {
  constructor() {
    this.councilSize = 7;
    this.mandateDurationTicks = 720; // 30 simulated days
    this.currentCouncil = [];
    this.lastRotationTick = 0;
    this.rotationCount = 0;
    this.coolingOffCitizenIds = new Set();
    this.activeDilemma = null;
  }

  /**
   * Conducts a random sortition lottery to assemble a new 7-citizen council
   */
  seatNewCouncil(citizens, currentTick) {
    if (!citizens || citizens.length < this.councilSize) {
      this.currentCouncil = citizens.slice(0, this.councilSize);
      return this.currentCouncil;
    }

    // Filter out citizens currently in cooling-off (served in recent term)
    let eligible = citizens.filter(c => !this.coolingOffCitizenIds.has(c.id));
    if (eligible.length < this.councilSize) {
      // Clear cooling-off if pool is exhausted
      this.coolingOffCitizenIds.clear();
      eligible = [...citizens];
    }

    // Shuffle and pick 7
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    this.currentCouncil = shuffled.slice(0, this.councilSize).map(c => ({
      id: c.id,
      name: c.name,
      greed: c.greed,
      tribalBias: c.tribalBias,
      morale: c.morale,
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
      // Greed or bias influences leaning
      let leanScore = 0.5; // neutral
      if (dilemma.type === 'REFUGEE_ASYLUM') {
        // High tribal bias leans against welcoming out-groups
        leanScore -= councilor.tribalBias * 0.6;
      } else if (dilemma.type === 'COMMONS_INVESTMENT') {
        // High greed prefers short-term private vouchers over collective infrastructure
        leanScore -= councilor.greed * 0.5;
      } else if (dilemma.type === 'ENERGY_SURPLUS') {
        leanScore += 0.2;
      }

      councilor.stance = Math.random() < leanScore ? 'YES' : 'NO';
    }

    return {
      dilemma: this.activeDilemma,
      councilVotes: this.getCouncilTally()
    };
  }

  getCouncilTally() {
    const yesCount = this.currentCouncil.filter(c => c.stance === 'YES').length;
    const noCount = this.currentCouncil.filter(c => c.stance === 'NO').length;
    return {
      yes: yesCount,
      no: noCount,
      total: this.currentCouncil.length,
      passed: yesCount >= 4 // Simple majority (4/7) or qualified (5/7)
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
