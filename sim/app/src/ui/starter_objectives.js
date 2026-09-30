/**
 * O-ASIS Dual-Track: Interactive Starter Objectives & First-Quest Controller (Agent SIM-5)
 * Provides immediate actionable onboarding guidance for new players:
 * 1. Claim your sanctuary (dwelling)
 * 2. Inspect the solar microgrid & machinery entropy
 * 3. Automate compulsory chores at the FabLab
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';
import { PlayerProfileManager } from '../engine/player_profile.js';

export class StarterObjectivesController {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.settlementRenderer = options.settlementRenderer || null;
    this.panelDwelling = options.panelDwelling || null;
    this.panelNode = options.panelNode || null;
    this.panelDualTrack = options.panelDualTrack || null;
    this.hud = options.hud || null;
    this.storageKey = 'oasis_starter_objectives_state';

    this.state = this.loadState();

    // DOM containers
    this.widgetEl = document.getElementById('hud-starter-objectives');
    this.pillEl = document.getElementById('btn-starter-objectives-toggle');

    this.init();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load starter objectives state', e);
    }
    return {
      claim_dwelling: false,
      inspect_grid: false,
      automate_fablab: false,
      minimized: false,
      dismissed: false
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save starter objectives state', e);
    }
  }

  init() {
    this.checkAutoCompletion();
    this.bindEvents();
    this.render();
  }

  checkAutoCompletion() {
    // 1. If player already has a profile / claimed home
    const profile = PlayerProfileManager.getProfile();
    if (profile && !this.state.claim_dwelling) {
      this.state.claim_dwelling = true;
      this.saveState();
    }

    // 2. Check if robots or automated systems already exist or were built
    if (this.sim && this.sim.node && this.sim.node.robots) {
      const totalBots = Object.values(this.sim.node.robots).reduce((sum, r) => sum + (r.count || 0), 0);
      if (totalBots > 3 && !this.state.automate_fablab) {
        this.state.automate_fablab = true;
        this.saveState();
      }
    }
  }

  isAllCompleted() {
    return Boolean(this.state.claim_dwelling && this.state.inspect_grid && this.state.automate_fablab);
  }

  getCompletedCount() {
    let count = 0;
    if (this.state.claim_dwelling) count++;
    if (this.state.inspect_grid) count++;
    if (this.state.automate_fablab) count++;
    return count;
  }

  completeObjective(key) {
    if (this.state[key]) return; // already done
    this.state[key] = true;
    this.saveState();
    this.render();

    // Trigger HUD feedback notification
    if (this.hud) {
      const titles = {
        claim_dwelling: '🏡 ' + t('starterObj1Title', '1. Claim Your Sanctuary'),
        inspect_grid: '⚡ ' + t('starterObj2Title', '2. Inspect Solar Microgrid'),
        automate_fablab: '🤖 ' + t('starterObj3Title', '3. Automate in FabLab')
      };
      this.hud.showNotification({
        title: titles[key] || '🎯 Objective Completed',
        message: t('starterDoneBadge', 'COMPLETED ✔') + ' — ' + t('starterObjectivesProgress', '{completed} of {total} completed')
          .replace('{completed}', this.getCompletedCount())
          .replace('{total}', 3)
      });
    }

    if (this.isAllCompleted()) {
      if (this.hud) {
        this.hud.showNotification({
          title: t('starterAllDoneTitle', '🎉 Settlement Established!'),
          message: t('starterAllDoneDesc', 'Great job! Keep the 4 vital flows balanced, trade surpluses, and vote in the Assembly when the Corporate AI attacks.')
        });
      }
      setTimeout(() => {
        if (!this.state.minimized) {
          this.state.minimized = true;
          this.saveState();
          this.render();
        }
      }, 6000);
    }
  }

  toggleMinimize() {
    this.state.minimized = !this.state.minimized;
    this.saveState();
    this.render();
  }

  dismiss() {
    this.state.dismissed = true;
    this.saveState();
    this.render();
  }

  bindEvents() {
    if (this.pillEl) {
      this.pillEl.addEventListener('click', () => {
        this.state.minimized = false;
        this.state.dismissed = false;
        this.saveState();
        this.render();
      });
    }
  }

  render() {
    if (!this.widgetEl) return;
    this.checkAutoCompletion();

    const completed = this.getCompletedCount();
    const allDone = this.isAllCompleted();

    // Pill badge in header or top corner
    if (this.pillEl) {
      if (this.state.dismissed) {
        this.pillEl.classList.remove('hidden');
        this.pillEl.innerHTML = `🎯 <span>${t('starterBtnExpand', '🎯 Objectives')} (${completed}/3)</span>`;
      } else if (this.state.minimized) {
        this.pillEl.classList.remove('hidden');
        this.pillEl.innerHTML = allDone
          ? `🏆 <span>${t('starterDoneBadge', 'COMPLETED ✔')} (3/3)</span>`
          : `🎯 <span>${t('starterBtnExpand', '🎯 Objectives')} (${completed}/3)</span>`;
      } else {
        this.pillEl.classList.add('hidden');
      }
    }

    if (this.state.dismissed || this.state.minimized) {
      this.widgetEl.classList.add('hidden');
      return;
    }

    this.widgetEl.classList.remove('hidden');

    const progressPct = Math.round((completed / 3) * 100);

    let html = `
      <div class="starter-objectives-card ${allDone ? 'all-completed' : ''}">
        <div class="starter-header">
          <div class="starter-title-group">
            <span class="starter-icon">${allDone ? '🏆' : '🎯'}</span>
            <div class="starter-title-text">
              <h4 class="starter-title">${t('starterObjectivesTitle', 'Starter Objectives')}</h4>
              <span class="starter-sub">${t('starterObjectivesSub', 'Your first 3 steps to establish the commons')}</span>
            </div>
          </div>
          <div class="starter-header-actions">
            <span class="starter-progress-pill">${completed}/3</span>
            <button id="btn-minimize-starter" class="starter-btn-icon" title="${t('starterBtnMinimize', 'Minimize')}">✕</button>
          </div>
        </div>

        <div class="starter-progress-track">
          <div class="starter-progress-bar" style="width: ${progressPct}%;"></div>
        </div>

        <div class="starter-list">
          <!-- Step 1: Claim Dwelling -->
          <div class="starter-item ${this.state.claim_dwelling ? 'done' : ''}">
            <div class="starter-item-check">
              ${this.state.claim_dwelling ? '✅' : '⭕'}
            </div>
            <div class="starter-item-body">
              <div class="starter-item-title">${t('starterObj1Title', '1. Claim Your Sanctuary')}</div>
              <div class="starter-item-desc">${t('starterObj1Desc', 'Pick any vacant pod or click Claim Usufruct to establish your dwelling.')}</div>
              ${!this.state.claim_dwelling ? `
                <button id="btn-starter-claim" class="starter-action-btn">
                  ${t('starterObj1Btn', 'Claim Dwelling ➔')}
                </button>
              ` : `
                <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
              `}
            </div>
          </div>

          <!-- Step 2: Inspect Microgrid -->
          <div class="starter-item ${this.state.inspect_grid ? 'done' : ''}">
            <div class="starter-item-check">
              ${this.state.inspect_grid ? '✅' : '⭕'}
            </div>
            <div class="starter-item-body">
              <div class="starter-item-title">${t('starterObj2Title', '2. Inspect Solar Microgrid')}</div>
              <div class="starter-item-desc">${t('starterObj2Desc', 'Inspect power generation, seasonal batteries, and machinery wear.')}</div>
              ${!this.state.inspect_grid ? `
                <button id="btn-starter-grid" class="starter-action-btn">
                  ${t('starterObj2Btn', 'Inspect Grid ➔')}
                </button>
              ` : `
                <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
              `}
            </div>
          </div>

          <!-- Step 3: Automate in FabLab -->
          <div class="starter-item ${this.state.automate_fablab ? 'done' : ''}">
            <div class="starter-item-check">
              ${this.state.automate_fablab ? '✅' : '⭕'}
            </div>
            <div class="starter-item-body">
              <div class="starter-item-title">${t('starterObj3Title', '3. Automate in FabLab')}</div>
              <div class="starter-item-desc">${t('starterObj3Desc', 'Queue your first robot to cancel citizen chores and free up human time.')}</div>
              ${!this.state.automate_fablab ? `
                <button id="btn-starter-fablab" class="starter-action-btn">
                  ${t('starterObj3Btn', 'Open FabLab ➔')}
                </button>
              ` : `
                <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
              `}
            </div>
          </div>
        </div>

        ${allDone ? `
          <div class="starter-all-done-box">
            <span class="starter-congrats-icon">🎉</span>
            <div class="starter-congrats-text">
              <strong>${t('starterAllDoneTitle', '🎉 Settlement Established!')}</strong>
              <p>${t('starterAllDoneDesc', 'Great job! Keep the 4 vital flows balanced, trade surpluses, and vote in the Assembly when the Corporate AI attacks.')}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.widgetEl.innerHTML = html;

    // Attach dynamic click listeners
    const btnMin = this.widgetEl.querySelector('#btn-minimize-starter');
    if (btnMin) {
      btnMin.addEventListener('click', () => this.toggleMinimize());
    }

    const btnClaim = this.widgetEl.querySelector('#btn-starter-claim');
    if (btnClaim) {
      btnClaim.addEventListener('click', () => {
        const btnQuickClaim = document.getElementById('btn-quick-claim');
        if (btnQuickClaim) {
          btnQuickClaim.click();
        } else if (this.panelDwelling && this.settlementRenderer) {
          const vacant = this.settlementRenderer.dwellings.find(d => !d.isOccupied);
          if (vacant) this.panelDwelling.open(vacant, this.sim.node);
        }
      });
    }

    const btnGrid = this.widgetEl.querySelector('#btn-starter-grid');
    if (btnGrid) {
      btnGrid.addEventListener('click', () => {
        if (this.settlementRenderer) {
          this.settlementRenderer.focusOnBuilding('infra-solar');
        }
        if (this.panelNode) {
          this.panelNode.open('machinery');
        }
        this.completeObjective('inspect_grid');
      });
    }

    const btnFabLab = this.widgetEl.querySelector('#btn-starter-fablab');
    if (btnFabLab) {
      btnFabLab.addEventListener('click', () => {
        if (this.settlementRenderer) {
          this.settlementRenderer.focusOnBuilding('infra-fablab');
        }
        if (this.panelDualTrack) {
          this.panelDualTrack.open('techTree');
        }
        this.completeObjective('automate_fablab');
      });
    }
  }
}
