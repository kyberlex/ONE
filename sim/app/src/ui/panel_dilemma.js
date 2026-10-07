/**
 * Athenian Sortition Dilemmas & Crisis Modal Controller (Agent SIM-3)
 * Fully internationalized with t() for English and multilingual support.
 * Displays Reigns-style binary civic choices for the 7-citizen council,
 * and emergency defense decisions against Legacy Adversary strikes.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';
import { interpolateCurrency } from '../data/bioregions.js';

export class PanelDilemmaController {
  constructor(sim) {
    this.sim = sim;
    this.modalEl = document.getElementById('modal-dilemma');
    this.contentEl = document.getElementById('dilemma-content');
    this.closeBtn = document.getElementById('btn-close-dilemma-modal');
    this.activeDilemmaData = null;
    this.activeCrisisData = null;
    this.activePeerReviewData = null;
    this.isCodexMode = false;
    this.pendingCrisis = null;
    this.pendingDilemma = null;
    this.pendingPeerReview = null;
    this.isTemporarilyPaused = false;
    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.modalEl) {
      this.modalEl.addEventListener('click', e => {
        if (e.target === this.modalEl) this.close();
      });
    }
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  pauseForNavGroup() {
    if (this.modalEl && !this.modalEl.classList.contains('hidden')) {
      this.isTemporarilyPaused = true;
      this.modalEl.classList.add('hidden');
      document.body.classList.remove('has-dilemma-open');
    }
  }

  resumeFromNavGroup() {
    if (this.isTemporarilyPaused) {
      this.isTemporarilyPaused = false;
      this.modalEl.classList.remove('hidden');
      document.body.classList.add('has-dilemma-open');
      this.render();
    } else {
      this.flushPending();
    }
  }

  flushPending() {
    if (this.pendingCrisis) {
      const c = this.pendingCrisis;
      this.pendingCrisis = null;
      this.openCrisis(c);
    } else if (this.pendingDilemma) {
      const d = this.pendingDilemma;
      this.pendingDilemma = null;
      this.openDilemma(d);
    } else if (this.pendingPeerReview) {
      const p = this.pendingPeerReview;
      this.pendingPeerReview = null;
      this.openPeerReview(p);
    }
  }

  openDilemma(dilemmaData) {
    if (!this.modalEl) return;
    if (window.isAnyNavGroupExpanded && window.isAnyNavGroupExpanded()) {
      this.pendingDilemma = dilemmaData;
      return;
    }
    this.activeDilemmaData = dilemmaData;
    this.activeCrisisData = null;
    this.activePeerReviewData = null;
    this.isCodexMode = false;
    if (window.app?.guideTour?.isActive) return;
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('has-dilemma-open');
    this.render();
  }

  openCrisis(crisis) {
    if (!this.modalEl) return;
    if (window.isAnyNavGroupExpanded && window.isAnyNavGroupExpanded()) {
      this.pendingCrisis = crisis;
      return;
    }
    this.activeCrisisData = crisis;
    this.activeDilemmaData = null;
    this.activePeerReviewData = null;
    this.isCodexMode = false;
    if (window.app?.guideTour?.isActive) return;
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('has-dilemma-open');
    this.render();
  }

  openPeerReview(peerReviewData) {
    if (!this.modalEl) return;
    if (window.isAnyNavGroupExpanded && window.isAnyNavGroupExpanded()) {
      this.pendingPeerReview = peerReviewData;
      return;
    }
    this.activePeerReviewData = peerReviewData;
    this.activeDilemmaData = null;
    this.activeCrisisData = null;
    this.isCodexMode = false;
    if (window.app?.guideTour?.isActive) return;
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('has-dilemma-open');
    this.render();
  }

  openAssemblyCodex() {
    if (!this.modalEl) return;
    if (window.app?.guideTour?.isActive) return;
    this.isCodexMode = true;
    this.activeDilemmaData = null;
    this.activeCrisisData = null;
    this.activePeerReviewData = null;
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('has-dilemma-open');
    this.render();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
    document.body.classList.remove('has-dilemma-open');
    this.activeDilemmaData = null;
    this.activeCrisisData = null;
    this.activePeerReviewData = null;
    this.isCodexMode = false;
    this.isTemporarilyPaused = false;
  }

  render() {
    if (this.activePeerReviewData) {
      this.renderPeerReviewDocket(this.activePeerReviewData);
    } else if (this.isCodexMode) {
      this.renderSortitionAssemblyBoard();
    } else if (this.activeDilemmaData) {
      this.renderCivicDilemma(this.activeDilemmaData);
    } else if (this.activeCrisisData) {
      this.renderLegacyCrisis(this.activeCrisisData);
    }
  }

  renderCouncilDonutSvg(tally) {
    const total = tally.total || 1;
    const yes = tally.yes || 0;
    const no = tally.no || 0;
    const radius = 38;
    const circ = 2 * Math.PI * radius; // ~238.761

    const yesLen = (yes / total) * circ;
    const noLen = (no / total) * circ;

    // Threshold indicator line on outer rim (starts at 12 o'clock, which is -90 deg)
    const threshAngleRad = (tally.thresholdPct * 2 * Math.PI) - (Math.PI / 2);
    const tickInnerR = 30;
    const tickOuterR = 46;
    const x1 = (50 + tickInnerR * Math.cos(threshAngleRad)).toFixed(1);
    const y1 = (50 + tickInnerR * Math.sin(threshAngleRad)).toFixed(1);
    const x2 = (50 + tickOuterR * Math.cos(threshAngleRad)).toFixed(1);
    const y2 = (50 + tickOuterR * Math.sin(threshAngleRad)).toFixed(1);

    const statusColor = tally.passed ? '#10b981' : '#f59e0b';
    const statusText = tally.passed ? t('thresholdMet', 'RATIFIED') : t('thresholdPending', 'BELOW');

    return `
      <svg viewBox="0 0 100 100" class="council-donut-svg" aria-label="Sortition Vote Donut Chart">
        <!-- Base Track -->
        <circle cx="50" cy="50" r="${radius}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10" />

        <!-- In Favor (Yes) Arc -->
        ${yes > 0 ? `
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#10b981" stroke-width="10"
            stroke-dasharray="${yesLen.toFixed(1)} ${circ.toFixed(1)}"
            stroke-dashoffset="0"
            transform="rotate(-90 50 50)"
            stroke-linecap="${yes === total ? 'butt' : 'round'}" />
        ` : ''}

        <!-- Against (No) Arc -->
        ${no > 0 ? `
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#ef4444" stroke-width="10"
            stroke-dasharray="${noLen.toFixed(1)} ${circ.toFixed(1)}"
            stroke-dashoffset="-${yesLen.toFixed(1)}"
            transform="rotate(-90 50 50)"
            stroke-linecap="${no === total ? 'butt' : 'round'}" />
        ` : ''}

        <!-- Threshold Indicator Notch (Golden Tick) -->
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />

        <!-- Center Tally Counter -->
        <text x="50" y="47" text-anchor="middle" class="donut-tally-num">${yes}/${total}</text>
        <text x="50" y="59" text-anchor="middle" class="donut-tally-label" fill="${statusColor}">${statusText}</text>
      </svg>
    `;
  }

  renderCivicDilemma(data) {
    const dilemma = data.dilemma || data;
    const council = this.sim.sortition.currentCouncil;
    const tally = this.sim.sortition.getCouncilTally(dilemma);
    const tier = this.sim.sortition.currentTier;
    const tierTitle = tier.titleKey ? t(tier.titleKey, tier.titleDefault) : tier.titleDefault;

    const curSym = this.sim?.node?.currencySymbol || '$';
    const title = interpolateCurrency(dilemma.titleKey ? t(dilemma.titleKey, dilemma.title) : dilemma.title, curSym);
    const summary = interpolateCurrency(dilemma.summaryKey ? t(dilemma.summaryKey, dilemma.summary) : dilemma.summary, curSym);
    const quote = interpolateCurrency(dilemma.quoteKey ? t(dilemma.quoteKey, dilemma.quote) : dilemma.quote, curSym);
    const optALabel = interpolateCurrency(dilemma.optionA.labelKey ? t(dilemma.optionA.labelKey, dilemma.optionA.label) : dilemma.optionA.label, curSym);
    const optADesc = interpolateCurrency(dilemma.optionA.descKey ? t(dilemma.optionA.descKey, dilemma.optionA.description) : dilemma.optionA.description, curSym);
    const optBLabel = interpolateCurrency(dilemma.optionB.labelKey ? t(dilemma.optionB.labelKey, dilemma.optionB.label) : dilemma.optionB.label, curSym);
    const optBDesc = interpolateCurrency(dilemma.optionB.descKey ? t(dilemma.optionB.descKey, dilemma.optionB.description) : dilemma.optionB.description, curSym);

    let html = `
      <div class="dilemma-container">
        <div class="bottom-sheet-drag-handle"></div>
        <div class="dilemma-badge">
          <img src="/one-logo-white.svg" alt="O.N.E." class="dilemma-stamp-icon" />
          <span>${t('councilDeliberationBadge', '🏛️ CITIZENS\' ASSEMBLY DELIBERATION')}</span>
        </div>
        <h3 class="dilemma-title">${title}</h3>
        <p class="dilemma-summary">${summary}</p>

        <div class="quote-box">
          <span class="speaker">${dilemma.speaker}</span>
          <p class="quote-text">${quote}</p>
        </div>

        <!-- Compact Solarpunk Pie-Chart / Donut Deliberation Component -->
        <div class="council-deliberation-visual">
          <div class="donut-graphic-wrapper">
            ${this.renderCouncilDonutSvg(tally)}
          </div>
          <div class="council-tally-details">
            <div class="council-tier-badge">
              <span class="tier-pill">${tierTitle}</span>
              <span class="tier-article">${tier.article} • ${tally.total} ${t('citizensLabel', 'Citizens')}</span>
            </div>

            <div class="tally-breakdown-row">
              <span class="tally-stat text-green">
                <span class="tally-dot dot-green"></span>
                ${t('inFavor', 'in Favor')}: <strong>${tally.yes}</strong> (${Math.round(tally.yesPct)}%)
              </span>
              <span class="tally-stat text-red">
                <span class="tally-dot dot-red"></span>
                ${t('against', 'Against')}: <strong>${tally.no}</strong> (${Math.round(tally.noPct)}%)
              </span>
            </div>

            <div class="tally-threshold-row ${tally.passed ? 'threshold-met' : 'threshold-pending'}">
              <span class="threshold-badge">${tally.passed ? '✅' : '⏳'} ${t('thresholdLabel', 'Required Threshold')}: <strong>${Math.round(tally.thresholdPct * 100)}%</strong> (${tally.requiredVotes}/${tally.total} ${t('votesNeeded', 'votes needed')})</span>
            </div>

            <details class="council-jurors-dropdown">
              <summary>${t('inspectJurors', 'Inspect Seated Jurors')} (${tally.total})</summary>
              <div class="jurors-mini-list">
                ${council.map(c => `
                  <span class="citizen-chip ${c.stance === 'YES' ? 'lean-yes' : 'lean-no'}">
                    ${c.name} (${c.stance})
                  </span>
                `).join('')}
              </div>
            </details>
          </div>
        </div>

        <div class="options-duel">
          <div class="option-card" id="btn-choose-option-a">
            <h4>${optALabel}</h4>
            <p>${optADesc}</p>
            <div class="impacts-list">
              ${dilemma.optionA.energyDeltaKwh ? `<span>⚡ ${dilemma.optionA.energyDeltaKwh} kWh</span>` : ''}
              ${dilemma.optionA.waterDeltaL ? `<span>💧 ${dilemma.optionA.waterDeltaL} L</span>` : ''}
              ${dilemma.optionA.foodDeltaKcal ? `<span>🥗 ${dilemma.optionA.foodDeltaKcal} kcal</span>` : ''}
              ${dilemma.optionA.fiatDeltaEur ? `<span class="${dilemma.optionA.fiatDeltaEur > 0 ? 'text-green' : 'text-red'}">💰 ${dilemma.optionA.fiatDeltaEur > 0 ? '+' : ''}${curSym}${Math.abs(dilemma.optionA.fiatDeltaEur).toLocaleString()} Hardware Fund</span>` : ''}
              ${dilemma.optionA.moraleDelta ? `<span class="text-green">⏳ +${dilemma.optionA.moraleDelta}% ${t('meterMorale', 'Morale')}</span>` : ''}
            </div>
            <button class="btn-primary">${t('btnRatifyA', 'Ratify Option A')}</button>
          </div>

          <div class="option-card" id="btn-choose-option-b">
            <h4>${optBLabel}</h4>
            <p>${optBDesc}</p>
            <div class="impacts-list">
              ${dilemma.optionB.energyDeltaKwh ? `<span>⚡ ${dilemma.optionB.energyDeltaKwh} kWh</span>` : ''}
              ${dilemma.optionB.waterDeltaL ? `<span>💧 ${dilemma.optionB.waterDeltaL} L</span>` : ''}
              ${dilemma.optionB.foodDeltaKcal ? `<span>🥗 ${dilemma.optionB.foodDeltaKcal} kcal</span>` : ''}
              ${dilemma.optionB.fiatDeltaEur ? `<span class="${dilemma.optionB.fiatDeltaEur > 0 ? 'text-green' : 'text-red'}">💰 ${dilemma.optionB.fiatDeltaEur > 0 ? '+' : ''}${curSym}${Math.abs(dilemma.optionB.fiatDeltaEur).toLocaleString()} Hardware Fund</span>` : ''}
              ${dilemma.optionB.moraleDelta ? `<span class="${dilemma.optionB.moraleDelta >= 0 ? 'text-green' : 'text-red'}">⏳ ${dilemma.optionB.moraleDelta}% ${t('meterMorale', 'Morale')}</span>` : ''}
            </div>
            <button class="btn-secondary">${t('btnRatifyB', 'Ratify Option B')}</button>
          </div>
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;

    document.getElementById('btn-choose-option-a')?.addEventListener('click', () => {
      this.executeDilemmaChoice('OPTION_A', dilemma);
    });
    document.getElementById('btn-choose-option-b')?.addEventListener('click', () => {
      this.executeDilemmaChoice('OPTION_B', dilemma);
    });
  }

  executeDilemmaChoice(choiceKey, dilemma) {
    const outcome = choiceKey === 'OPTION_A' ? dilemma.optionA : dilemma.optionB;

    if (outcome.energyDeltaKwh) this.sim.thermo.energy.batteryStoredKwh += outcome.energyDeltaKwh;
    if (outcome.waterDeltaL) this.sim.thermo.water.cisternStoredL += outcome.waterDeltaL;
    if (outcome.foodDeltaKcal) this.sim.thermo.food.granaryStoredKcal += outcome.foodDeltaKcal;
    if (outcome.moraleDelta) this.sim.node.communityMorale = Math.max(10, Math.min(100, this.sim.node.communityMorale + outcome.moraleDelta));
    if (outcome.fiatDeltaEur) this.sim.node.externalFiatTreasuryEur += outcome.fiatDeltaEur;
    if (outcome.populationDelta) {
      this.sim.node.population += outcome.populationDelta;
      this.sim.node.initCitizens();
    }

    this.sim.sortition.activeDilemma = null;
    const title = dilemma.titleKey ? t(dilemma.titleKey, dilemma.title) : dilemma.title;
    this.sim.emitNotification('🏛️ Assembly Ratified', title);
    this.sim.notifyTick();
    this.close();
  }

  renderPeerReviewDocket(data) {
    const docket = data.docket || data;
    const council = this.sim.sortition.currentCouncil;
    const tally = this.sim.peerReview.getDocketTally(docket, council);
    const tier = this.sim.sortition.currentTier;
    const tierTitle = tier.titleKey ? t(tier.titleKey, tier.titleDefault) : tier.titleDefault;

    const title = docket.titleKey ? t(docket.titleKey, docket.title) : docket.title;
    const quote = docket.quoteKey ? t(docket.quoteKey, docket.quote) : docket.quote;
    const problem = docket.problemKey ? t(docket.problemKey, docket.problem) : docket.problem;
    const hypothesis = docket.hypothesisKey ? t(docket.hypothesisKey, docket.hypothesis) : docket.hypothesis;
    const telemetry = docket.telemetryKey ? t(docket.telemetryKey, docket.telemetry) : docket.telemetry;

    const optALabel = docket.optionA.labelKey ? t(docket.optionA.labelKey, docket.optionA.label) : docket.optionA.label;
    const optADesc = docket.optionA.descKey ? t(docket.optionA.descKey, docket.optionA.description) : docket.optionA.description;
    const optBLabel = docket.optionB.labelKey ? t(docket.optionB.labelKey, docket.optionB.label) : docket.optionB.label;
    const optBDesc = docket.optionB.descKey ? t(docket.optionB.descKey, docket.optionB.description) : docket.optionB.description;

    let html = `
      <div class="dilemma-container peer-review-mode">
        <div class="bottom-sheet-drag-handle"></div>
        <div class="dilemma-badge">
          <img src="/one-logo-white.svg" alt="O.N.E." class="dilemma-stamp-icon" />
          <span>🏛️ ${t('councilDeliberationBadge', 'CITIZEN ASSEMBLY DELIBERATION')} • ${docket.originBioregionIcon || '🌱'} ${docket.originNodeName}</span>
          <a href="https://one-commons.github.io/#constitution" target="_blank" rel="noopener noreferrer" class="meta-pill meta-pill-link" style="margin-left: auto; text-decoration: none; color: #34d399; font-size: 0.78rem;" title="Read O.N.E. Living Constitution on main platform">
            📜 ${docket.targetArticles} ↗
          </a>
        </div>

        <h3 class="dilemma-title" style="margin-top: 6px; font-size: 1.25rem;">${title}</h3>

        <div class="quote-box" style="margin-top: 10px; margin-bottom: 12px; padding: 12px 14px;">
          <span class="speaker">${docket.speaker}</span>
          <p class="quote-text" style="font-size: 0.95rem; margin-bottom: 6px;">${quote}</p>
          <p class="dilemma-summary" style="font-size: 0.88rem; color: #94a3b8; margin: 0; line-height: 1.4;">${problem}</p>
        </div>

        <!-- Compact Donut Deliberation Visual -->
        <div class="council-deliberation-visual compact" style="margin-bottom: 12px; padding: 10px 14px;">
          <div class="donut-graphic-wrapper">
            ${this.renderCouncilDonutSvg(tally)}
          </div>
          <div class="council-tally-details">
            <div class="council-tier-badge">
              <span class="tier-pill">${tierTitle}</span>
              <span class="tier-article">${tally.total} ${t('citizensLabel', 'Citizens')}</span>
            </div>

            <div class="tally-breakdown-row">
              <span class="tally-stat text-green">
                <span class="tally-dot dot-green"></span>
                ${t('inFavor', 'in Favor')}: <strong>${tally.yes}</strong> (${Math.round(tally.yesPct)}%)
              </span>
              <span class="tally-stat text-red">
                <span class="tally-dot dot-red"></span>
                ${t('against', 'Against')}: <strong>${tally.no}</strong> (${Math.round(tally.noPct)}%)
              </span>
            </div>

            <div class="tally-threshold-row ${tally.passed ? 'threshold-met' : 'threshold-pending'}">
              <span class="threshold-badge">${tally.passed ? '✅' : '⏳'} ${t('thresholdLabel', 'Soglia richiesta')}: <strong>75%</strong> (${tally.requiredVotes}/${tally.total} ${t('votesNeeded', 'voti')})</span>
            </div>
          </div>
        </div>

        <div class="options-duel">
          <div class="option-card" id="btn-ratify-docket">
            <h4>${optALabel}</h4>
            <p>${optADesc}</p>
            <div class="impacts-list">
              <span class="text-green">📜 ${docket.optionA.perkKey ? t(docket.optionA.perkKey, docket.optionA.perkSummary) : docket.optionA.perkSummary}</span>
              <span class="text-green">⏳ +${docket.optionA.moraleDelta}% ${t('meterMorale', 'Morale')}</span>
              <span class="text-cyan">🌐 +${docket.optionA.confederalTrust} ${t('confederalTrust', 'Trust')}</span>
            </div>
            <button class="btn-primary">${t('btnRatifyDocket', '📜 Approve Precedent')}</button>
          </div>

          <div class="option-card" id="btn-reject-docket">
            <h4>${optBLabel}</h4>
            <p>${optBDesc}</p>
            <div class="impacts-list">
              <span class="text-dim">⚠️ ${docket.optionB.perkKey ? t(docket.optionB.perkKey, docket.optionB.perkSummary) : docket.optionB.perkSummary}</span>
              <span class="${docket.optionB.moraleDelta >= 0 ? 'text-green' : 'text-red'}">⏳ ${docket.optionB.moraleDelta}% ${t('meterMorale', 'Morale')}</span>
            </div>
            <button class="btn-secondary">${t('btnRejectDocket', '🛑 Reject Precedent')}</button>
          </div>
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;

    document.getElementById('btn-ratify-docket')?.addEventListener('click', () => {
      this.executeDocketChoice('OPTION_A', docket);
    });
    document.getElementById('btn-reject-docket')?.addEventListener('click', () => {
      this.executeDocketChoice('OPTION_B', docket);
    });
  }

  executeDocketChoice(choiceKey, docket) {
    this.sim.peerReview.resolveDocket(choiceKey, docket);
    this.activePeerReviewData = null;

    const title = docket.titleKey ? t(docket.titleKey, docket.title) : docket.title;
    const msg = choiceKey === 'OPTION_A'
      ? t('docketRatifiedMsg', 'Precedent ratified by the assembly!')
      : t('docketRejectedMsg', 'Precedent rejected by the assembly.');
    this.sim.emitNotification(t('assemblyBoardTitle', '🏛️ Citizen Assembly'), `${title}: ${msg}`);
    this.sim.notifyTick();
    this.close();
  }

  renderSortitionAssemblyBoard() {
    const council = this.sim.sortition.currentCouncil;
    const tier = this.sim.sortition.currentTier;
    const tierTitle = tier.titleKey ? t(tier.titleKey, tier.titleDefault) : tier.titleDefault;
    const daysSinceRot = Math.floor((this.sim.tickCount - this.sim.sortition.lastRotationTick) / 24);
    const dayInTerm = Math.min(30, daysSinceRot + 1);
    const hoursToNextRot = Math.max(0, this.sim.sortition.mandateDurationTicks - ((this.sim.tickCount - this.sim.sortition.lastRotationTick) % this.sim.sortition.mandateDurationTicks));

    const pendingDockets = this.sim.peerReview.getAvailableDockets();
    const ratifiedPrecedents = this.sim.peerReview.getRatifiedPrecedents();

    let html = `
      <div class="dilemma-container assembly-board-mode">
        <div class="bottom-sheet-drag-handle"></div>
        <div class="assembly-header-stack">
          <div class="dilemma-badge">
            <img src="/one-logo-white.svg" alt="O.N.E." class="dilemma-stamp-icon" />
            <span>${t('assemblyBoardTitle', '🏛️ Athenian Sortition Council & Confederal Codex')}</span>
          </div>
          <h3 class="assembly-main-title">${tierTitle} (${tier.article})</h3>
          <p class="assembly-subtitle">${t('assemblyBoardSubtitle', 'Randomly drawn citizen juries deliberating on local dilemmas and confederated peer-review dockets (Chapter IV).')}</p>
          <div class="assembly-meta-row">
            <span class="meta-pill">👥 ${council.length} ${t('citizensLabel', 'Citizens')}</span>
            <span class="meta-pill">⚖️ ${tier.descriptionKey ? t(tier.descriptionKey, tier.descriptionDefault) : tier.descriptionDefault}</span>
            <span class="meta-pill text-cyan">⏱️ ${t('mandateTermDays', 'Day {day} of 30 • Next Rotation in {hours}h').replace('{day}', dayInTerm).replace('{hours}', hoursToNextRot)}</span>
            <span class="meta-pill text-green">🌐 ${t('confederalTrust', 'Confederal Trust')}: ${this.sim.peerReview.confederalTrust}/100</span>
            <a href="https://one-commons.github.io/#constitution" target="_blank" rel="noopener noreferrer" class="meta-pill meta-pill-link" style="text-decoration: none; color: #34d399; font-weight: 600;" title="Explore the 46 Articles of the Living Constitution">
              📜 ${t('readConstitutionLink', 'Living Constitution (46 Articles) ↗')}
            </a>
          </div>
        </div>

        <!-- 1. Seated Jurors Section -->
        <div class="assembly-section">
          <div class="section-sub-header">
            <h4>${t('seatedJurorsTitle', 'Current Seated Jurors (Selected by Lot)')}</h4>
            <span class="sub-badge">${t('mandateActiveBadge', 'Mandate Active')}</span>
          </div>
          <div class="seated-jurors-grid">
            ${council.map((c, i) => `
              <div class="juror-chip-card">
                <div class="juror-avatar">🏛️</div>
                <div class="juror-info">
                  <div class="juror-name">${c.name}</div>
                  <div class="juror-role">Juror #${i + 1} • Morale: ${c.morale ?? 75}%</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Pending Confederated Dockets Section -->
        <div class="assembly-section">
          <div class="section-sub-header">
            <h4>${t('pendingDocketsTitle', 'Confederated Peer-Review Dockets (Incoming from Network)')}</h4>
            <span class="sub-badge">${pendingDockets.length} ${t('pendingBadge', 'Pending')}</span>
          </div>
          <p class="section-help-text">${t('pendingDocketsSubtitle', 'Autonomous partner nodes have tested institutional adaptations. Impanel your council to deliberate and vote on confederated precedents.')}</p>

          ${pendingDockets.length === 0 ? `
            <div class="empty-dockets-box">
              <span>✅</span> ${t('noPendingDockets', 'All available confederated dockets have been reviewed by this council.')}
            </div>
          ` : `
            <div class="dockets-preview-grid">
              ${pendingDockets.map(docket => `
                <div class="docket-preview-card" data-docket-id="${docket.id}">
                  <div class="docket-card-top">
                    <span class="docket-code-pill">${docket.code}</span>
                    <span class="docket-origin-badge">${docket.originBioregionIcon} ${docket.originNodeName}</span>
                    <span class="docket-articles-pill">${docket.targetArticles}</span>
                  </div>
                  <h4 class="docket-preview-title">${docket.titleKey ? t(docket.titleKey, docket.title) : docket.title}</h4>
                  <p class="docket-preview-problem">${docket.problemKey ? t(docket.problemKey, docket.problem) : docket.problem}</p>
                  <button class="btn-convene-jury" data-docket-id="${docket.id}">
                    ${t('conveneJuryBtn', '🏛️ Impanel Sortition Jury & Deliberate')}
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- 3. Ratified Precedents Codex Section -->
        <div class="assembly-section">
          <div class="section-sub-header">
            <h4>${t('ratifiedCodexTitle', 'Ratified Case Law Precedents (Active Codex)')}</h4>
            <span class="sub-badge text-green">${ratifiedPrecedents.length} ${t('ratifiedBadge', 'Ratified')}</span>
          </div>
          <p class="section-help-text">${t('ratifiedCodexSubtitle', 'Constitutional adaptations formally ratified by this assembly and active across the confederation.')}</p>

          ${ratifiedPrecedents.length === 0 ? `
            <div class="empty-dockets-box">
              <span>📜</span> ${t('noRatifiedYet', 'No confederated precedents ratified yet. Deliberate on incoming dockets to establish case law.')}
            </div>
          ` : `
            <div class="ratified-precedents-list">
              ${ratifiedPrecedents.map(docket => `
                <div class="ratified-precedent-card">
                  <div class="precedent-card-header">
                    <span class="docket-code-pill">${docket.code}</span>
                    <span class="precedent-title">${docket.titleKey ? t(docket.titleKey, docket.title) : docket.title}</span>
                    <span class="status-ratified-badge">${t('ratifiedStatusTag', 'RATIFIED ✅')}</span>
                  </div>
                  <p class="precedent-perk">⚡ <strong>${t('activePrecedentPerk', 'Active Precedent Perk:')}</strong> ${docket.optionA.perkKey ? t(docket.optionA.perkKey, docket.optionA.perkSummary) : docket.optionA.perkSummary}</p>
                  <span class="precedent-origin-tag">${docket.originBioregionIcon} ${t('originBadge', 'Origin Node')}: ${docket.originNodeName} • ${docket.targetArticles}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;

    // Attach click listeners to "Convene Jury" buttons
    this.contentEl.querySelectorAll('.btn-convene-jury').forEach(btn => {
      btn.addEventListener('click', () => {
        const docketId = btn.getAttribute('data-docket-id');
        const docket = pendingDockets.find(d => d.id === docketId);
        if (docket) {
          const reviewData = this.sim.peerReview.presentDocket(docket, this.sim.sortition.currentCouncil);
          this.openPeerReview(reviewData);
        }
      });
    });
  }

  renderLegacyCrisis(crisis) {
    const curSym = this.sim?.node?.currencySymbol || '$';
    const name = interpolateCurrency(crisis.nameKey ? t(crisis.nameKey, crisis.name) : crisis.name, curSym);
    const desc = interpolateCurrency(crisis.descKey ? t(crisis.descKey, crisis.description) : crisis.description, curSym);
    const impact = interpolateCurrency(crisis.impactKey ? t(crisis.impactKey, crisis.impact) : crisis.impact, curSym);

    let html = `
      <div class="dilemma-container crisis-alert-mode">
        <div class="bottom-sheet-drag-handle"></div>
        <div class="crisis-badge">
          <img src="/one-logo-white.svg" alt="O.N.E." class="dilemma-stamp-icon" />
          <span>${t('systemAttackBadge', '⚠️ SYSTEM STRESS ATTACK DETECTED')}</span>
        </div>
        <h3 class="crisis-title">${name}</h3>
        <p class="crisis-desc">${desc}</p>
        <div class="crisis-impact">
          <strong>${t('threatConsequenceTitle', 'Threat Consequence:')}</strong> ${impact}
        </div>

        <div class="options-duel">
          ${crisis.options.map(opt => {
            const optLabel = interpolateCurrency(opt.labelKey ? t(opt.labelKey, opt.label) : opt.label, curSym);
            const optCost = interpolateCurrency(opt.costKey ? t(opt.costKey, opt.costSummary) : opt.costSummary, curSym);
            return `
              <div class="option-card crisis-option" data-option-id="${opt.id}">
                <h4>${optLabel}</h4>
                <p class="cost-summary"><em>${optCost}</em></p>
                <div class="impacts-list">
                  <span class="text-green">${t('threatLabel', 'Threat:')} ${opt.threatDelta}%</span>
                  <span class="${opt.moraleDelta >= 0 ? 'text-green' : 'text-red'}">${t('meterMorale', 'Morale')}: ${opt.moraleDelta > 0 ? '+' : ''}${opt.moraleDelta}%</span>
                </div>
                <button class="btn-primary btn-resolve-crisis">${t('btnDeployCountermeasure', 'Deploy Countermeasure')}</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;

    this.contentEl.querySelectorAll('.btn-resolve-crisis').forEach(btn => {
      btn.addEventListener('click', e => {
        const card = e.target.closest('.crisis-option');
        const optId = card.dataset.optionId;
        const resolution = this.sim.adversary.resolveCrisis(optId);
        if (resolution) {
          if (resolution.fiatCost) this.sim.node.externalFiatTreasuryEur = Math.max(0, this.sim.node.externalFiatTreasuryEur - resolution.fiatCost);
          if (resolution.batteryCostKwh) this.sim.thermo.energy.batteryStoredKwh = Math.max(0, this.sim.thermo.energy.batteryStoredKwh - resolution.batteryCostKwh);
          if (resolution.moraleDelta) this.sim.node.communityMorale = Math.max(10, Math.min(100, this.sim.node.communityMorale + resolution.moraleDelta));
          const chosenLabel = resolution.chosenOption.labelKey ? t(resolution.chosenOption.labelKey, resolution.chosenOption.label) : resolution.chosenOption.label;
          this.sim.emitNotification(t('crisisCounteredTitle', '🛡️ Crisis Countered'), chosenLabel);
          this.sim.notifyTick();
        }
        this.close();
      });
    });
  }
}
