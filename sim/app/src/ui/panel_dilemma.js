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
  }

  openDilemma(dilemmaData) {
    if (!this.modalEl) return;
    this.activeDilemmaData = dilemmaData;
    this.activeCrisisData = null;
    this.modalEl.classList.remove('hidden');
    this.render();
  }

  openCrisis(crisis) {
    if (!this.modalEl) return;
    this.activeCrisisData = crisis;
    this.activeDilemmaData = null;
    this.modalEl.classList.remove('hidden');
    this.render();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
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

  renderCivicDilemma(data) {
    const dilemma = data.dilemma || data;
    const council = this.sim.sortition.currentCouncil;
    const tally = this.sim.sortition.getCouncilTally();

    const title = dilemma.titleKey ? t(dilemma.titleKey, dilemma.title) : dilemma.title;
    const summary = dilemma.summaryKey ? t(dilemma.summaryKey, dilemma.summary) : dilemma.summary;
    const quote = dilemma.quoteKey ? t(dilemma.quoteKey, dilemma.quote) : dilemma.quote;
    const optALabel = dilemma.optionA.labelKey ? t(dilemma.optionA.labelKey, dilemma.optionA.label) : dilemma.optionA.label;
    const optADesc = dilemma.optionA.descKey ? t(dilemma.optionA.descKey, dilemma.optionA.description) : dilemma.optionA.description;
    const optBLabel = dilemma.optionB.labelKey ? t(dilemma.optionB.labelKey, dilemma.optionB.label) : dilemma.optionB.label;
    const optBDesc = dilemma.optionB.descKey ? t(dilemma.optionB.descKey, dilemma.optionB.description) : dilemma.optionB.description;

    let html = `
      <div class="dilemma-container">
        <div class="dilemma-badge">
          <img src="/one-logo-white.svg" alt="O.N.E." class="dilemma-stamp-icon" />
          <span>${t('councilDeliberationBadge', '🏛️ ATHENIAN SORTITION COUNCIL DELIBERATION')}</span>
        </div>
        <h3 class="dilemma-title">${title}</h3>
        <p class="dilemma-summary">${summary}</p>

        <div class="quote-box">
          <span class="speaker">${dilemma.speaker}</span>
          <p class="quote-text">${quote}</p>
        </div>

        <div class="council-tally-bar">
          <strong>${t('councilStanceTitle', 'Council Stance (7 Citizens):')}</strong>
          <span class="text-green">${tally.yes} ${t('inFavor', 'in Favor')}</span> /
          <span class="text-red">${tally.no} ${t('against', 'Against')}</span>
        </div>

        <div class="council-chips">
          ${council.map(c => `
            <span class="citizen-chip ${c.stance === 'YES' ? 'lean-yes' : 'lean-no'}">
              ${c.name} (${c.stance})
            </span>
          `).join('')}
        </div>

        <div class="options-duel">
          <div class="option-card" id="btn-choose-option-a">
            <h4>${optALabel}</h4>
            <p>${optADesc}</p>
            <div class="impacts-list">
              ${dilemma.optionA.energyDeltaKwh ? `<span>⚡ ${dilemma.optionA.energyDeltaKwh} kWh</span>` : ''}
              ${dilemma.optionA.waterDeltaL ? `<span>💧 ${dilemma.optionA.waterDeltaL} L</span>` : ''}
              ${dilemma.optionA.foodDeltaKcal ? `<span>🥗 ${dilemma.optionA.foodDeltaKcal} kcal</span>` : ''}
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
    const name = crisis.nameKey ? t(crisis.nameKey, crisis.name) : crisis.name;
    const desc = crisis.descKey ? t(crisis.descKey, crisis.description) : crisis.description;
    const impact = crisis.impactKey ? t(crisis.impactKey, crisis.impact) : crisis.impact;

    let html = `
      <div class="dilemma-container crisis-alert-mode">
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
            const optLabel = opt.labelKey ? t(opt.labelKey, opt.label) : opt.label;
            const optCost = opt.costKey ? t(opt.costKey, opt.costSummary) : opt.costSummary;
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
