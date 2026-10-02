/**
 * O-ASIS Dual-Track: Interactive Starter Objectives & Progression Controller (Agent SIM-5)
 * Provides progressive onboarding and mid-game guidance for pioneers:
 * - Phase 1: Foundation (Sanctuary, Microgrid, FabLab Automation)
 * - Phase 2: Thermodynamic Autonomy & The Commons (Vocation, Maintenance, Trade Routes)
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
    this.panelConvoys = options.panelConvoys || null;
    this.worldMap = options.worldMap || null;
    this.zoomCoordinator = options.zoomCoordinator || null;
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
        const parsed = JSON.parse(saved);
        return {
          claim_dwelling: Boolean(parsed.claim_dwelling),
          inspect_grid: Boolean(parsed.inspect_grid),
          automate_fablab: Boolean(parsed.automate_fablab),
          choose_vocation: Boolean(parsed.choose_vocation),
          preventive_maintenance: Boolean(parsed.preventive_maintenance),
          explore_trade: Boolean(parsed.explore_trade),
          currentPhase: parsed.currentPhase || 1,
          minimized: Boolean(parsed.minimized),
          dismissed: Boolean(parsed.dismissed)
        };
      }
    } catch (e) {
      console.warn('Failed to load starter objectives state', e);
    }
    return {
      claim_dwelling: false,
      inspect_grid: false,
      automate_fablab: false,
      choose_vocation: false,
      preventive_maintenance: false,
      explore_trade: false,
      currentPhase: 1,
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
    }

    // 2. Check if robots exist
    if (this.sim && this.sim.node && this.sim.node.robots) {
      const totalBots = Object.values(this.sim.node.robots).reduce((sum, r) => sum + (r.count || 0), 0);
      if (totalBots >= 1 && !this.state.automate_fablab) {
        this.state.automate_fablab = true;
      }
    }

    // 3. Phase 2 checks: Vocation specialization
    if (this.sim && this.sim.node) {
      if (this.sim.node.playerVocation && this.sim.node.playerVocation !== 'none' && !this.state.choose_vocation) {
        this.state.choose_vocation = true;
      }
      if (this.sim.trade && this.sim.trade.convoys && this.sim.trade.convoys.length > 0 && !this.state.explore_trade) {
        this.state.explore_trade = true;
      }
    }

    // Auto-advance to Phase 2 if Phase 1 is complete
    if (this.isPhase1Completed() && this.state.currentPhase === 1 && !this.isPhase2Completed()) {
      this.state.currentPhase = 2;
      this.state.minimized = false; // un-minimize to show Phase 2!
    }

    this.saveState();
  }

  isPhase1Completed() {
    return Boolean(this.state.claim_dwelling && this.state.inspect_grid && this.state.automate_fablab);
  }

  isPhase2Completed() {
    return Boolean(this.state.choose_vocation && this.state.preventive_maintenance && this.state.explore_trade);
  }

  isAllCompleted() {
    return this.isPhase1Completed() && this.isPhase2Completed();
  }

  getPhase1Count() {
    let count = 0;
    if (this.state.claim_dwelling) count++;
    if (this.state.inspect_grid) count++;
    if (this.state.automate_fablab) count++;
    return count;
  }

  getPhase2Count() {
    let count = 0;
    if (this.state.choose_vocation) count++;
    if (this.state.preventive_maintenance) count++;
    if (this.state.explore_trade) count++;
    return count;
  }

  getTotalCount() {
    return this.getPhase1Count() + this.getPhase2Count();
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
        automate_fablab: '🤖 ' + t('starterObj3Title', '3. Automate in FabLab'),
        choose_vocation: '🌱 ' + t('starterObj4Title', '4. Specialize Your Vocation'),
        preventive_maintenance: '⚙️ ' + t('starterObj5Title', '5. Machinery Maintenance'),
        explore_trade: '🗺️ ' + t('starterObj6Title', '6. Regional Trade Routes')
      };

      const phase = ['claim_dwelling', 'inspect_grid', 'automate_fablab'].includes(key) ? 1 : 2;
      const count = phase === 1 ? this.getPhase1Count() : this.getPhase2Count();

      this.hud.showNotification({
        title: titles[key] || '🎯 Objective Completed',
        message: `${t('starterDoneBadge', 'COMPLETED ✔')} — (${count}/3)`
      });
    }

    if (this.isPhase1Completed() && this.state.currentPhase === 1) {
      this.state.currentPhase = 2;
      this.state.minimized = false;
      this.saveState();
      this.render();
      if (this.hud) {
        this.hud.showNotification({
          title: '🌟 ' + t('phase2ObjectivesTitle', 'Phase 2: Thermodynamic Autonomy'),
          message: t('phase2ObjectivesSub', 'Balance flows, specialize labor, and prevent entropy')
        });
      }
    } else if (this.isAllCompleted()) {
      if (this.hud) {
        this.hud.showNotification({
          title: t('starterAllDoneTitlePhase2', '🏆 Master of the Commons!'),
          message: t('starterAllDoneDescPhase2', 'All fundamental systems balanced! Free citizen labor via FabLab robotics, build Civic Megaprojects, and resist the Legacy AI.')
        });
      }
      setTimeout(() => {
        if (!this.state.minimized) {
          this.state.minimized = true;
          this.saveState();
          this.render();
        }
      }, 7000);
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

  switchPhase(phaseNum) {
    this.state.currentPhase = phaseNum;
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

    const phase1Done = this.isPhase1Completed();
    const phase2Done = this.isPhase2Completed();
    const allDone = this.isAllCompleted();
    const currentPhase = this.state.currentPhase || (phase1Done ? 2 : 1);
    const activeCount = currentPhase === 1 ? this.getPhase1Count() : this.getPhase2Count();
    const totalCount = this.getTotalCount();

    // Pill badge in header or top corner
    if (this.pillEl) {
      if (this.state.dismissed) {
        this.pillEl.classList.remove('hidden');
        this.pillEl.innerHTML = `🎯 <span>${t('starterBtnExpand', '🎯 Objectives')} (${totalCount}/6)</span>`;
      } else if (this.state.minimized) {
        this.pillEl.classList.remove('hidden');
        this.pillEl.innerHTML = allDone
          ? `🏆 <span>${t('starterDoneBadge', 'COMPLETED ✔')} (6/6)</span>`
          : `🎯 <span>${t('starterBtnExpand', '🎯 Objectives')} (${totalCount}/6)</span>`;
      } else {
        this.pillEl.classList.add('hidden');
      }
    }

    if (this.state.dismissed || this.state.minimized) {
      this.widgetEl.classList.add('hidden');
      return;
    }

    this.widgetEl.classList.remove('hidden');

    const progressPct = Math.round((activeCount / 3) * 100);

    let html = `
      <div class="starter-objectives-card ${allDone ? 'all-completed' : ''}">
        <div class="starter-header">
          <div class="starter-title-group">
            <span class="starter-icon">${allDone ? '🏆' : (currentPhase === 2 ? '⚡' : '🎯')}</span>
            <div class="starter-title-text">
              <h4 class="starter-title">${currentPhase === 1 ? t('starterObjectivesTitle', 'Starter Objectives') : t('phase2ObjectivesTitle', 'Phase 2: Thermodynamic Autonomy')}</h4>
              <span class="starter-sub">${currentPhase === 1 ? t('starterObjectivesSub', 'Your first 3 steps to establish the commons') : t('phase2ObjectivesSub', 'Balance flows, specialize labor, and prevent entropy')}</span>
            </div>
          </div>
          <div class="starter-header-actions">
            <span class="starter-progress-pill">${activeCount}/3</span>
            <button id="btn-minimize-starter" class="starter-btn-icon" title="${t('starterBtnMinimize', 'Minimize')}">✕</button>
          </div>
        </div>

        <!-- Phase Tabs Switcher -->
        <div style="display: flex; gap: 6px; margin: 8px 0 10px 0;">
          <button id="btn-phase-tab-1" style="flex: 1; padding: 4px 8px; font-size: 11px; border-radius: 6px; border: 1px solid ${currentPhase === 1 ? 'var(--emerald-primary, #10b981)' : 'rgba(255,255,255,0.1)'}; background: ${currentPhase === 1 ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.2)'}; color: ${currentPhase === 1 ? '#6ee7b7' : '#94a3b8'}; cursor: pointer;">
            ${phase1Done ? '✅' : '1.'} ${t('phase1Badge', 'Phase 1: Foundation')} (${this.getPhase1Count()}/3)
          </button>
          <button id="btn-phase-tab-2" style="flex: 1; padding: 4px 8px; font-size: 11px; border-radius: 6px; border: 1px solid ${currentPhase === 2 ? 'var(--emerald-primary, #10b981)' : 'rgba(255,255,255,0.1)'}; background: ${currentPhase === 2 ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.2)'}; color: ${currentPhase === 2 ? '#6ee7b7' : '#94a3b8'}; cursor: pointer;">
            ${phase2Done ? '✅' : '2.'} ${t('phase2Badge', 'Phase 2: Commons')} (${this.getPhase2Count()}/3)
          </button>
        </div>

        <div class="starter-progress-track">
          <div class="starter-progress-bar" style="width: ${progressPct}%;"></div>
        </div>

        <div class="starter-list">
          ${currentPhase === 1 ? `
            <!-- Step 1: Claim Dwelling -->
            <div class="starter-item ${this.state.claim_dwelling ? 'done' : ''}">
              <div class="starter-item-check">${this.state.claim_dwelling ? '✅' : '⭕'}</div>
              <div class="starter-item-body">
                <div class="starter-item-title">${t('starterObj1Title', '1. Claim Your Sanctuary')}</div>
                <div class="starter-item-desc">${t('starterObj1Desc', 'Pick any vacant pod or click Claim Usufruct to establish your dwelling.')}</div>
                ${!this.state.claim_dwelling ? `
                  <button id="btn-starter-claim" class="starter-action-btn">${t('starterObj1Btn', 'Claim Dwelling ➔')}</button>
                ` : `
                  <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
                `}
              </div>
            </div>

            <!-- Step 2: Inspect Microgrid -->
            <div class="starter-item ${this.state.inspect_grid ? 'done' : ''}">
              <div class="starter-item-check">${this.state.inspect_grid ? '✅' : '⭕'}</div>
              <div class="starter-item-body">
                <div class="starter-item-title">${t('starterObj2Title', '2. Inspect Solar Microgrid')}</div>
                <div class="starter-item-desc">${t('starterObj2Desc', 'Inspect power generation, seasonal batteries, and machinery wear.')}</div>
                ${!this.state.inspect_grid ? `
                  <button id="btn-starter-grid" class="starter-action-btn">${t('starterObj2Btn', 'Inspect Grid ➔')}</button>
                ` : `
                  <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
                `}
              </div>
            </div>

            <!-- Step 3: Automate in FabLab -->
            <div class="starter-item ${this.state.automate_fablab ? 'done' : ''}">
              <div class="starter-item-check">${this.state.automate_fablab ? '✅' : '⭕'}</div>
              <div class="starter-item-body">
                <div class="starter-item-title">${t('starterObj3Title', '3. Automate in FabLab')}</div>
                <div class="starter-item-desc">${t('starterObj3Desc', 'Queue your first robot to cancel citizen chores and free up human time.')}</div>
                ${!this.state.automate_fablab ? `
                  <button id="btn-starter-fablab" class="starter-action-btn">${t('starterObj3Btn', 'Open FabLab ➔')}</button>
                ` : `
                  <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
                `}
              </div>
            </div>
          ` : `
            <!-- Step 4: Specialize Vocation -->
            <div class="starter-item ${this.state.choose_vocation ? 'done' : ''}">
              <div class="starter-item-check">${this.state.choose_vocation ? '✅' : '⭕'}</div>
              <div class="starter-item-body">
                <div class="starter-item-title">${t('starterObj4Title', '4. Specialize Your Vocation')}</div>
                <div class="starter-item-desc">${t('starterObj4Desc', 'Open Chore Roster ([C]) and pick a guild vocation (e.g. Agro-Ecologist) for 2x social credit and systemic yield bonuses.')}</div>
                ${!this.state.choose_vocation ? `
                  <button id="btn-starter-vocation" class="starter-action-btn">${t('starterObj4Btn', 'Choose Vocation ➔')}</button>
                ` : `
                  <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
                `}
              </div>
            </div>

            <!-- Step 5: Machinery Maintenance -->
            <div class="starter-item ${this.state.preventive_maintenance ? 'done' : ''}">
              <div class="starter-item-check">${this.state.preventive_maintenance ? '✅' : '⭕'}</div>
              <div class="starter-item-body">
                <div class="starter-item-title">${t('starterObj5Title', '5. Machinery Maintenance')}</div>
                <div class="starter-item-desc">${t('starterObj5Desc', 'Inspect Machinery & Entropy to service water pumps and solar inverters before wear causes blackouts.')}</div>
                ${!this.state.preventive_maintenance ? `
                  <button id="btn-starter-maintenance" class="starter-action-btn">${t('starterObj5Btn', 'Service Machinery ➔')}</button>
                ` : `
                  <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
                `}
              </div>
            </div>

            <!-- Step 6: Explore Trade Routes -->
            <div class="starter-item ${this.state.explore_trade ? 'done' : ''}">
              <div class="starter-item-check">${this.state.explore_trade ? '✅' : '⭕'}</div>
              <div class="starter-item-body">
                <div class="starter-item-title">${t('starterObj6Title', '6. Regional Trade Routes')}</div>
                <div class="starter-item-desc">${t('starterObj6Desc', 'Open the Global Map ([M]) or Trade Convoys to discover sister eco-nodes and dispatch barter routes.')}</div>
                ${!this.state.explore_trade ? `
                  <button id="btn-starter-trade" class="starter-action-btn">${t('starterObj6Btn', 'Explore Trade ➔')}</button>
                ` : `
                  <span class="starter-badge-done">${t('starterDoneBadge', 'COMPLETED ✔')}</span>
                `}
              </div>
            </div>
          `}
        </div>

        ${allDone ? `
          <div class="starter-all-done-box">
            <span class="starter-congrats-icon">🏆</span>
            <div class="starter-congrats-text">
              <strong>${t('starterAllDoneTitlePhase2', '🏆 Master of the Commons!')}</strong>
              <p>${t('starterAllDoneDescPhase2', 'All fundamental systems balanced! Free citizen labor via FabLab robotics, build Civic Megaprojects, and resist the Legacy AI.')}</p>
            </div>
          </div>
        ` : (currentPhase === 1 && phase1Done ? `
          <div class="starter-all-done-box">
            <span class="starter-congrats-icon">🎉</span>
            <div class="starter-congrats-text">
              <strong>${t('starterAllDoneTitle', '🎉 Settlement Established!')}</strong>
              <p>${t('starterAllDoneDesc', 'Great job! Keep the 4 vital flows balanced, trade surpluses, and advance to Phase 2.')}</p>
            </div>
          </div>
        ` : '')}
      </div>
    `;

    this.widgetEl.innerHTML = html;

    // Attach dynamic click listeners
    const btnMin = this.widgetEl.querySelector('#btn-minimize-starter');
    if (btnMin) {
      btnMin.addEventListener('click', () => this.toggleMinimize());
    }

    const tab1 = this.widgetEl.querySelector('#btn-phase-tab-1');
    if (tab1) {
      tab1.addEventListener('click', () => this.switchPhase(1));
    }

    const tab2 = this.widgetEl.querySelector('#btn-phase-tab-2');
    if (tab2) {
      tab2.addEventListener('click', () => this.switchPhase(2));
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

    const btnVocation = this.widgetEl.querySelector('#btn-starter-vocation');
    if (btnVocation) {
      btnVocation.addEventListener('click', () => {
        if (this.panelNode) {
          this.panelNode.open('chores');
        }
        this.completeObjective('choose_vocation');
      });
    }

    const btnMaint = this.widgetEl.querySelector('#btn-starter-maintenance');
    if (btnMaint) {
      btnMaint.addEventListener('click', () => {
        if (this.panelNode) {
          this.panelNode.open('machinery');
        }
        this.completeObjective('preventive_maintenance');
      });
    }

    const btnTrade = this.widgetEl.querySelector('#btn-starter-trade');
    if (btnTrade) {
      btnTrade.addEventListener('click', () => {
        if (this.panelConvoys) {
          this.panelConvoys.open();
        } else if (this.zoomCoordinator) {
          const btnZoomWorld = document.getElementById('btn-zoom-world');
          if (btnZoomWorld) btnZoomWorld.click();
        }
        this.completeObjective('explore_trade');
      });
    }
  }
}
