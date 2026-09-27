/**
 * Confederated Sortition Peer-Review Engine (Agent SIM-3)
 * Manages inter-node demarchic peer-review of constitutional hypotheses
 * between autonomous federated nodes (Detroit, Val di Susa, Yukon, Sahel, etc.)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { CONFEDERATED_DOCKETS } from '../data/peer_review_dockets.js';
import { t } from '../i18n/index.js';

export class ConfederatedPeerReviewEngine {
  constructor(sim) {
    this.sim = sim;
    this.dockets = [...CONFEDERATED_DOCKETS];
    this.ratifiedDocketIds = new Set();
    this.rejectedDocketIds = new Set();
    this.activeDocket = null;
    this.confederalTrust = 50; // 0 - 100 baseline confederal solidarity
    this.lastPeerReviewTick = 0;
    this.peerReviewIntervalTicks = 480; // approx every 20 simulated days
  }

  getAvailableDockets() {
    return this.dockets.filter(d => !this.ratifiedDocketIds.has(d.id) && !this.rejectedDocketIds.has(d.id));
  }

  getRatifiedPrecedents() {
    return this.dockets.filter(d => this.ratifiedDocketIds.has(d.id));
  }

  getNextPendingDocket() {
    const available = this.getAvailableDockets();
    if (available.length === 0) return null;
    // Prefer dockets originating from nodes other than the current one
    const currentId = this.sim?.node?.id;
    const foreign = available.filter(d => d.originNodeId !== currentId);
    return foreign.length > 0 ? foreign[0] : available[0];
  }

  /**
   * Impanels the seated Sortition Council as a Confederated Review Jury
   */
  presentDocket(docket, council = null) {
    this.activeDocket = docket;
    const currentCouncil = council || this.sim.sortition.currentCouncil;

    // Simulate councilor stances based on psychometric traits and docket subject
    for (const councilor of currentCouncil) {
      let lean = 0.55; // baseline favorable to confederal mutual aid

      // Tribal bias resists foreign influence
      if (councilor.tribalBias) {
        lean -= councilor.tribalBias * 0.45;
      }

      // Community morale boosts solidarity
      if (councilor.morale) {
        lean += (councilor.morale / 100) * 0.25;
      }

      // Context-specific biases
      if (docket.code === 'SIM-QA-01') {
        // Small settlements passionately favor labor-saving micro-quorums
        const pop = this.sim?.node?.population || 28;
        if (pop < 50) lean += 0.35;
      } else if (docket.code === 'SIM-QA-02') {
        // High greed / craftspeople strongly favor inviolable personal craft gear
        if (councilor.greed > 0.4) lean += 0.25;
      } else if (docket.code === 'SIM-QA-03') {
        // Ecological ground truthing
        lean += 0.15;
      } else if (docket.code === 'SIM-QA-04') {
        // Anti-brokerage in FabLabs
        lean += 0.20;
      }

      councilor.stance = Math.random() < Math.max(0.1, Math.min(0.95, lean)) ? 'YES' : 'NO';
    }

    return {
      docket: this.activeDocket,
      tier: this.sim.sortition.currentTier,
      tally: this.getDocketTally(docket, currentCouncil)
    };
  }

  /**
   * Calculates tally under graduated constitutional supermajority thresholds (Art. 4.5)
   */
  getDocketTally(docket = null, council = null) {
    const targetCouncil = council || this.sim.sortition.currentCouncil;
    const yesCount = targetCouncil.filter(c => c.stance === 'YES').length;
    const noCount = targetCouncil.filter(c => c.stance === 'NO').length;
    const total = targetCouncil.length || 1;

    // Confederated constitutional precedents require 75% supermajority (Art. 4.5)
    const thresholdPct = 0.75;
    const requiredVotes = Math.ceil(total * thresholdPct);
    const passed = yesCount >= requiredVotes;

    return {
      yes: yesCount,
      no: noCount,
      total,
      yesPct: (yesCount / total) * 100,
      noPct: (noCount / total) * 100,
      thresholdPct,
      requiredVotes,
      passed
    };
  }

  /**
   * Resolves the docket deliberation and executes systemic perks
   */
  resolveDocket(choiceKey, docket = null) {
    const targetDocket = docket || this.activeDocket;
    if (!targetDocket) return null;

    const outcome = choiceKey === 'OPTION_A' ? targetDocket.optionA : targetDocket.optionB;

    if (choiceKey === 'OPTION_A') {
      this.ratifiedDocketIds.add(targetDocket.id);
      this.confederalTrust = Math.min(100, this.confederalTrust + (outcome.confederalTrust || 15));
      if (outcome.moraleDelta) {
        this.sim.node.communityMorale = Math.max(10, Math.min(100, this.sim.node.communityMorale + outcome.moraleDelta));
      }
      if (outcome.materialsGained && this.sim.thermo?.materials) {
        if (outcome.materialsGained.steelKg) {
          this.sim.thermo.materials.structuralSteelKg = (this.sim.thermo.materials.structuralSteelKg || 0) + outcome.materialsGained.steelKg;
        }
      }

      // Add dispatch notice to village chat
      if (this.sim.chatEngine) {
        const docketTitle = targetDocket.titleKey ? t(targetDocket.titleKey, targetDocket.title) : targetDocket.title;
        const msgText = t('confederatedRatifiedChatNotice', '📜 Confederated Precedent Ratified: [{code}] "{title}" has been incorporated into our node case law! (+{trust} Confederal Trust)')
          .replace('{code}', targetDocket.code)
          .replace('{title}', docketTitle)
          .replace('{trust}', outcome.confederalTrust || 15);
        this.sim.chatEngine.addMessage({
          id: `msg_ratify_${Date.now()}`,
          author: t('assemblyAuthorTag', '🏛️ Sortition Council'),
          text: msgText,
          category: 'assembly',
          timestamp: Date.now()
        });
      }
    } else {
      this.rejectedDocketIds.add(targetDocket.id);
      this.confederalTrust = Math.max(0, this.confederalTrust + (outcome.confederalTrust || -5));
      if (outcome.moraleDelta) {
        this.sim.node.communityMorale = Math.max(10, Math.min(100, this.sim.node.communityMorale + outcome.moraleDelta));
      }
    }

    this.activeDocket = null;
    this.lastPeerReviewTick = this.sim.tickCount;

    return {
      docketId: targetDocket.id,
      code: targetDocket.code,
      title: targetDocket.title,
      choiceKey,
      outcome
    };
  }

  /**
   * Evaluates active passive perks granted by ratified precedents
   */
  getActivePerks() {
    const perks = {
      subsidiarityQuorum: false,
      dualTierTools: false,
      analogGroundTruthing: false,
      soulboundFabLabQueues: false
    };

    for (const id of this.ratifiedDocketIds) {
      const d = this.dockets.find(doc => doc.id === id);
      if (d?.optionA?.perkId) {
        perks[d.optionA.perkId] = true;
      }
    }

    return perks;
  }

  serialize() {
    return {
      ratifiedDocketIds: Array.from(this.ratifiedDocketIds),
      rejectedDocketIds: Array.from(this.rejectedDocketIds),
      confederalTrust: this.confederalTrust,
      lastPeerReviewTick: this.lastPeerReviewTick
    };
  }

  deserialize(data) {
    if (!data) return;
    if (data.ratifiedDocketIds) {
      this.ratifiedDocketIds = new Set(data.ratifiedDocketIds);
    }
    if (data.rejectedDocketIds) {
      this.rejectedDocketIds = new Set(data.rejectedDocketIds);
    }
    if (typeof data.confederalTrust === 'number') {
      this.confederalTrust = data.confederalTrust;
    }
    if (typeof data.lastPeerReviewTick === 'number') {
      this.lastPeerReviewTick = data.lastPeerReviewTick;
    }
  }
}
