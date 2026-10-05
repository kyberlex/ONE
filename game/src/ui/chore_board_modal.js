/**
 * O.N.E. Commons Chore Board & Metabolic Extinction Queue Modal
 * Grounded in Article 5, Section 4 of the Living Constitution:
 * "The Full Automation Trajectory: Mandatory shifts systematically contract toward zero as open robotics expand."
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';

export class ChoreBoardModal {
  constructor() {
    this.overlayEl = null;
    this.ensureDom();
  }

  ensureDom() {
    let existing = document.getElementById('chore-board-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'chore-board-modal-overlay';
      existing.className = 'modal-overlay hidden';
      document.body.appendChild(existing);
    }
    this.overlayEl = existing;

    // Close on click outside window
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        if (!this.canDismiss) return;
        this.close();
      }
    });

    // Close on ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlayEl.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  open() {
    const chores = gameState.data.chores || {};
    const queue = chores.queue || [];
    const freePct = chores.freeTimePct || 25;
    const manualHours = (chores.totalRequiredChoreHours !== undefined ? chores.totalRequiredChoreHours : 6.0).toFixed(1);
    const stage = chores.stage || 1;

    const friendlyChoreNames = {
      'water_hauling': { name: 'Pumping & Carrying Water', machine: 'Smart Water Valves', unlock: 'Build Auto-Valves (Tier 3)' },
      'garden_weeding': { name: 'Weeding the Garden Beds', machine: 'FarmBot Garden Robot', unlock: 'Build FarmBot (Tier 3)' },
      'solar_adjustment': { name: 'Cleaning Solar Panels', machine: 'Solar Cleaning Rover', unlock: 'Deploy SCADA Bot (Tier 4)' },
      'workshop_sorting': { name: 'Organizing Tools & Scrap Metal', machine: 'Workshop Robotic Arm', unlock: 'Build Cobot Arm (Tier 4)' },
      'kitchen_prep': { name: 'Washing Dishes & Kitchen Prep', machine: 'Kitchen Helper Droid', unlock: 'Build Kitchen Droid (Tier 4)' },
      'grounds_sweeping': { name: 'Sweeping Paths & Yard Cleanup', machine: 'Yard Mist Drone', unlock: 'Deploy Mist Drone (Tier 5)' }
    };

    let stageName = 'Stage 1: Doing Chores by Hand';
    let stageDesc = 'No machines built yet! Your crew has to haul water and pull weeds by hand until you build the FabLab workshop and assemble robots.';
    if (stage === 2) {
      stageName = 'Stage 2: Building the FabLab Workshop';
      stageDesc = 'You built the workshop! Now you can manufacture robots and computer boards to take over chores.';
    } else if (stage >= 3) {
      stageName = 'Stage 3: Robots Online! (Post-Work)';
      stageDesc = 'Smart robots handle the daily chores. Your crew has maximum free time to relax, study, and play!';
    }

    const choreCardsHtml = queue.map(c => {
      const isAuto = !!c.automated;
      const meta = friendlyChoreNames[c.id] || { name: c.name, machine: c.automatedBy, unlock: c.unlockCondition };
      return `
        <div class="chore-queue-card ${isAuto ? 'automated' : 'manual'}">
          <div class="chore-card-left">
            <div class="chore-status-badge ${isAuto ? 'badge-auto' : 'badge-manual'}">
              ${isAuto ? '🤖 REPLACED BY MACHINE' : '⏳ DONE BY HAND'}
            </div>
            <h4 class="chore-card-name">${meta.name}</h4>
            <div class="chore-card-meta">
              <span class="meta-vocation">👤 ${c.vocation}</span>
              <span class="meta-hours">${c.hours.toFixed(1)}h / day</span>
            </div>
          </div>
          <div class="chore-card-right">
            <div class="chore-target-box">
              <span class="target-label">${isAuto ? 'Automated by:' : 'Machine needed to automate:'}</span>
              <span class="target-name">${meta.machine}</span>
              <span class="target-condition ${isAuto ? 'condition-done' : ''}">${isAuto ? '✅ Replaced Forever (0h daily work!)' : '🔒 ' + meta.unlock}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.overlayEl.innerHTML = `
      <div class="modal-window chore-modal-window">
        <div class="modal-header">
          <div class="modal-title-row">
            <span class="modal-badge-green">📋 DAILY CHORES & ROBOT HELPERS</span>
            <h3>HOW TO FREE YOUR CREW FROM BORING WORK</h3>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-chore-board" title="Close">✕</button>
        </div>

        <div class="modal-body chore-modal-body">
          <!-- Top Freedom Metric Banner -->
          <div class="metabolic-freedom-banner">
            <div class="freedom-banner-top">
              <div class="freedom-stage-pill">
                <span class="pill-dot"></span>
                <span>${stageName}</span>
              </div>
              <div class="freedom-metric">
                <span class="freedom-label">CREW FREE TIME:</span>
                <span class="freedom-val">${freePct}%</span>
              </div>
            </div>

            <div class="freedom-bar-wrap">
              <div class="freedom-bar-fill" style="width: ${freePct}%"></div>
              <div class="freedom-target-marker" style="left: 85%" title="Goal: 85%+ Free Time"></div>
            </div>

            <div class="freedom-banner-bottom">
              <span class="freedom-sub">Daily Chores: <strong>${manualHours}h / day</strong> shared by your 3 pioneers</span>
              <span class="freedom-goal">🎯 Goal: ≤ 2.0h / day (85%+ Free Time to relax, learn & build)</span>
            </div>
          </div>

          <p class="chore-narrative-note">
            💡 <em>${stageDesc}</em>
          </p>

          <!-- Active Chore List -->
          <div class="chore-queue-container">
            <div class="chore-queue-header">
              <span class="queue-heading">CHORES TO AUTOMATE WITH MACHINES</span>
              <span class="queue-counter">${queue.filter(c => c.automated).length} / ${queue.length} Replaced by Robots</span>
            </div>
            <div class="chore-queue-list">
              ${choreCardsHtml}
            </div>
          </div>

          <!-- Tooling Roadmap -->
          <div class="chore-roadmap-box">
            <h5 class="roadmap-heading">🛠️ HOW AUTOMATION WORKS:</h5>
            <div class="roadmap-steps-grid">
              <div class="roadmap-step ${stage >= 1 ? 'current' : ''}">
                <div class="step-num">STAGE 1</div>
                <div class="step-title">Hand Tools Only</div>
                <div class="step-desc">Doing chores manually from the camper van. Most of the day is spent working.</div>
              </div>
              <div class="roadmap-step ${stage >= 2 ? 'current' : ''}">
                <div class="step-num">STAGE 2</div>
                <div class="step-title">Build the FabLab</div>
                <div class="step-desc">Clear your $12k debt and build the workshop to fabricate robots and computer boards.</div>
              </div>
              <div class="roadmap-step ${stage >= 3 ? 'current' : ''}">
                <div class="step-num">STAGE 3</div>
                <div class="step-title">Deploy Robot Helpers</div>
                <div class="step-desc">Robots take over the chores. Work drops to almost zero, leaving maximum free time!</div>
              </div>
            </div>
          </div>

          <!-- Bottom Note -->
          <div class="chore-modal-footer">
            <div class="constitutional-quote">
              💡 <em>"Why do by hand what a machine can do for you? Build smart machines so humans can relax and enjoy life."</em>
            </div>
            <button type="button" class="btn-primary" id="btn-done-chore-board">Back to Settlement</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.overlayEl.classList.remove('hidden');
  }

  bindEvents() {
    this.canDismiss = false;
    setTimeout(() => {
      this.canDismiss = true;
    }, 400);

    const closeBtn = this.overlayEl.querySelector('#btn-close-chore-board');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      if (!this.canDismiss) return;
      this.close();
    });

    const doneBtn = this.overlayEl.querySelector('#btn-done-chore-board');
    if (doneBtn) doneBtn.addEventListener('click', () => {
      if (!this.canDismiss) return;
      this.close();
    });

    const windowEl = this.overlayEl.querySelector('.modal-window');
    if (windowEl) {
      windowEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  close() {
    if (!this.canDismiss && !this.overlayEl.classList.contains('hidden')) return;
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
  }
}

export const choreBoardModal = new ChoreBoardModal();
