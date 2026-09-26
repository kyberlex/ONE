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

  openDilemma(dilemmaData) {
    if (!this.modalEl) return;
    this.activeDilemmaData = dilemmaData;
    this.activeCrisisData = null;
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('has-dilemma-open');
    this.render();
  }

  openCrisis(crisis) {
    if (!this.modalEl) return;
    this.activeCrisisData = crisis;
    this.activeDilemmaData = null;
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('has-dilemma-open');
    this.render();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
    document.body.classList.remove('has-dilemma-open');
    this.activeDilemmaData = null;
    this.activeCrisisData = null;
  }

  render() {
    if (this.activeDilemmaData) {
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
          this.sim.emitNotification('🛡️ Crisis Countered', chosenLabel);
          this.sim.notifyTick();
        }
        this.close();
      });
    });
  }
}
