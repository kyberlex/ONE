/**
 * Citizen Dossier & 3D Sovereign Avatar Studio Controller (Agent SIM-2 & SIM-5)
 * Displays interactive citizen bios, circadian schedules, usufruct pod rights,
 * and renders the citizen in full 360° 3D WebGL via Avatar3DViewer.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { Avatar3DViewer } from './avatar_3d_viewer.js';
import { getCitizenAppearance } from '../settlement/interior_renderer.js';
import { getRandomDialogue } from '../data/citizen_dialogues.js';
import { t } from '../i18n/index.js';

export class PanelCitizenController {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.options = options;
    this.settlementRenderer = options.settlementRenderer || null;
    this.onLocateDwelling = options.onLocateDwelling || (() => {});
    this.onOpenChat = options.onOpenChat || (() => {});

    this.modalEl = document.getElementById('modal-citizen');
    this.contentEl = document.getElementById('citizen-modal-content');
    this.titleEl = document.getElementById('citizen-modal-name');
    this.iconEl = document.getElementById('citizen-modal-avatar-icon');
    this.badgeEl = document.getElementById('citizen-modal-vocation-badge');
    this.closeBtn = document.getElementById('btn-close-citizen-modal');

    this.activeCitizen = null;
    this.avatar3dViewer = null;

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

  open(citizen) {
    if (!this.modalEl || !citizen) return;
    this.activeCitizen = citizen;
    this.modalEl.classList.remove('hidden');

    this.render();
  }

  close() {
    if (this.avatar3dViewer) {
      if (this.avatar3dViewer.animFrameId) {
        cancelAnimationFrame(this.avatar3dViewer.animFrameId);
      }
      this.avatar3dViewer = null;
    }
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    this.activeCitizen = null;
  }

  render() {
    const c = this.activeCitizen;
    if (!c) return;

    const voc = c.vocation || {};
    const vocName = voc.roleKey ? t(voc.roleKey, voc.defaultName) : (voc.defaultName || 'Citizen Pioneer');
    const vocIcon = voc.icon || (c.isPlayer ? '👑' : (c.isChild ? '🎒' : (c.isElder ? '🧓' : '🌱')));

    if (this.titleEl) this.titleEl.textContent = c.name;
    if (this.iconEl) this.iconEl.textContent = vocIcon;
    if (this.badgeEl) {
      this.badgeEl.textContent = vocName.toUpperCase();
      this.badgeEl.className = c.isPlayer ? 'badge badge-warning' : (c.isHuman ? 'badge badge-info' : 'badge badge-success');
    }

    const homePodNum = c.homeDwelling ? c.homeDwelling.number : (c.dwellingNumber || 'Reserve');
    const homePodType = c.homeDwelling ? (c.homeDwelling.dwellingType || 'Bioclimatic Hex-Loft') : 'Bioclimatic Hex-Loft';
    const activityDesc = c.activityDesc || (c.activity ? `Engaged in ${c.activity}` : 'Active in village life');

    const defaultThought = c.lastSpokenThought || getRandomDialogue('AMBIENT_COMMONS');
    c.lastSpokenThought = defaultThought;
    const moraleVal = Math.round(c.morale || (this.sim.node?.morale || 94));

    const statusBadge = c.isPlayer 
      ? `<span class="status-pill status-player">👑 ${t('citizen.status_player', 'You (Local Player)')}</span>`
      : (c.isHuman 
        ? `<span class="status-pill status-peer">🌐 ${t('citizen.status_peer', 'Network Pioneer (Online)')}</span>`
        : (c.isChild 
          ? `<span class="status-pill status-child">🎒 ${t('citizen.status_child', 'Young Pioneer (Apprentice)')}</span>`
          : (c.isElder 
            ? `<span class="status-pill status-elder">🧓 ${t('citizen.status_elder', 'Community Elder & Mentor')}</span>`
            : `<span class="status-pill status-resident">🤝 ${t('citizen.status_resident', 'Community Resident')}</span>`)));

    const html = `
      <div class="citizen-dossier-layout">
        <!-- Left: Character Studio -->
        <div class="citizen-3d-box">
          <div class="citizen-3d-badge-header">
            <span class="live-3d-dot"></span>
            <span>${t('citizen.character_studio', 'CHARACTER STUDIO')}</span>
          </div>
          <div id="citizen-3d-canvas-container" class="citizen-3d-canvas-container"></div>
          <div class="citizen-3d-controls">
            <button id="btn-citizen-auto-rotate" class="btn-prop-toolbar active" title="${t('citizen.rotate_toggle_tooltip', 'Toggle auto-rotation')}">${t('citizen.rotate_btn', '🔄 Rotate')}</button>
            <button id="btn-citizen-reset-cam" class="btn-prop-toolbar" title="${t('citizen.reset_cam_tooltip', 'Reset camera view')}">${t('citizen.reset_cam_btn', '🔍 Reset')}</button>
          </div>
          <div class="citizen-3d-hint">💡 ${t('citizen.drag_hint', 'Drag to rotate • Zoom with wheel or pinch')}</div>
        </div>

        <!-- Right: Dossier Details & Civic Invariants -->
        <div class="citizen-dossier-info">
          <div class="citizen-dossier-header-row">
            ${statusBadge}
            <span class="usufruct-seal">${t('citizenUsufructHolder', '🛡️ Usufruct Holder')}</span>
          </div>

          <div class="citizen-stats-card">
            <div class="stat-line">
              <span class="stat-label">${t('citizenVocationLabel', 'Vocation:')}</span>
              <span class="stat-value">${vocIcon} <strong>${vocName}</strong></span>
            </div>
            <div class="stat-line">
              <span class="stat-label">${t('citizenSocialLaborLabel', 'Social Labor:')}</span>
              <span class="stat-value"><strong>${c.dailyHours || 4} ${t('citizenHoursPerDay', 'hours / day')}</strong> ${t('citizenSabbaticalSafe', '(Sabbatical Safe)')}</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">${t('citizenMoraleLabel', 'Morale & Wellbeing:')}</span>
              <span class="stat-value"><span class="biometric-tag morale-high">😊 ${moraleVal}% (${t('moraleHighDesc', 'Flourishing')})</span></span>
            </div>
            <div class="stat-line">
              <span class="stat-label">${t('citizenEnergyHydrationLabel', 'Energy & Hydration:')}</span>
              <span class="stat-value text-cyan">⚡ 100% • 💧 100%</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">${t('citizenCurrentRoutineLabel', 'Current Routine:')}</span>
              <span class="stat-value text-green">${activityDesc}</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">${t('citizenUsufructPodLabel', 'Usufruct Pod:')}</span>
              <span class="stat-value">🏡 <strong>Pod #${homePodNum}</strong> (${homePodType})</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">${t('citizenBiometricFloorLabel', 'Biometric Floor:')}</span>
              <span class="stat-value">${t('citizenBiometricFloorDesc', '🥗 2,200 kcal/die • 💧 50 L/die Guaranteed')}</span>
            </div>
          </div>

          <!-- Live Contextual Thought Bubble -->
          <div class="citizen-thought-card">
            <div class="thought-card-header">
              <span class="thought-icon">💭</span>
              <span class="thought-header-title">${t('citizenThoughtHeader', 'CURRENT THOUGHT')}</span>
            </div>
            <p class="thought-card-text" id="citizen-thought-text">"${defaultThought}"</p>
          </div>

          <div class="constitutional-protection-box">
            <div class="quote-header">${t('citizenDefenseHeader', '📜 O.N.E. CONSTITUTION • USURPATION DEFENSE')}</div>
            <p>${t('citizenDefenseDesc', '"No citizen may be evicted, priced out, or subjected to debt servitude. Basic sustenance and dwelling usufruct are unconditional birthrights."')}</p>
          </div>

          <div class="citizen-actions-row">
            ${c.homeDwelling ? `
              <button id="btn-locate-citizen-pod" class="btn-secondary" style="flex: 1;">
                ${t('citizenCenterPodBtn', '🏡 Center on Pod #{num}').replace('{num}', homePodNum)}
              </button>
            ` : ''}
            <button id="btn-greet-citizen" class="btn-action-greet" style="flex: 1;">
              ${t('citizenGreetBtn', '💬 Greet Pioneer')}
            </button>
            <button id="btn-chat-with-citizen" class="btn-primary" style="flex: 1.2;">
              ${t('citizenChatBtn', '💬 Message in Village Chat')}
            </button>
          </div>
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;

    // Initialize 3D Viewer for this Citizen
    const canvasContainer = document.getElementById('citizen-3d-canvas-container');
    if (canvasContainer) {
      const appearance = getCitizenAppearance(c);
      appearance.isPlayer = Boolean(c.isPlayer);
      appearance.color = c.color || '#fbbf24';

      this.avatar3dViewer = new Avatar3DViewer(canvasContainer, appearance, {
        isMiniPhoto: false
      });

      // Bind 3D Studio toolbar buttons
      const autoRotateBtn = document.getElementById('btn-citizen-auto-rotate');
      if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', () => {
          if (this.avatar3dViewer && this.avatar3dViewer.controls) {
            this.avatar3dViewer.controls.autoRotate = !this.avatar3dViewer.controls.autoRotate;
            autoRotateBtn.classList.toggle('active', this.avatar3dViewer.controls.autoRotate);
          }
        });
      }

      const resetCamBtn = document.getElementById('btn-citizen-reset-cam');
      if (resetCamBtn) {
        resetCamBtn.addEventListener('click', () => {
          if (this.avatar3dViewer && this.avatar3dViewer.controls) {
            this.avatar3dViewer.camera.position.set(0, 2.4, 6.2);
            this.avatar3dViewer.controls.target.set(0, 1.8, 0);
            this.avatar3dViewer.controls.update();
          }
        });
      }
    }

    // Bind Action Buttons
    const locateBtn = document.getElementById('btn-locate-citizen-pod');
    if (locateBtn && c.homeDwelling) {
      locateBtn.addEventListener('click', () => {
        this.close();
        this.onLocateDwelling(c.homeDwelling);
      });
    }

    const greetBtn = document.getElementById('btn-greet-citizen');
    if (greetBtn) {
      greetBtn.addEventListener('click', () => {
        let cat = 'AMBIENT_COMMONS';
        const h = this.sim?.currentHour ?? 12;
        if (h >= 21 || h <= 4) cat = 'CIRCADIAN_NIGHT';
        else if (h >= 5 && h <= 8) cat = 'CIRCADIAN_DAWN';
        else if (this.sim?.thermo?.weather?.id === 'RAIN') cat = 'WEATHER_RAIN';
        else if (this.sim?.thermo?.weather?.id === 'STORMY') cat = 'WEATHER_STORMY';
        else if (this.sim?.thermo?.weather?.id === 'HEATWAVE') cat = 'WEATHER_HEATWAVE';

        const newThought = getRandomDialogue(cat);
        c.lastSpokenThought = newThought;

        const thoughtTextEl = document.getElementById('citizen-thought-text');
        if (thoughtTextEl) {
          thoughtTextEl.textContent = `"${newThought}"`;
          thoughtTextEl.classList.remove('pulse-text');
          void thoughtTextEl.offsetWidth;
          thoughtTextEl.classList.add('pulse-text');
        }

        if (this.settlementRenderer) {
          this.settlementRenderer.showCitizenSpeechBubble(c.name, newThought, 7000);
        }

        greetBtn.innerHTML = t('citizenGreetedMsg', '✨ Greeted!');
        greetBtn.classList.add('greeted');
        setTimeout(() => {
          if (greetBtn) {
            greetBtn.innerHTML = t('citizenGreetBtn', '💬 Greet Pioneer');
            greetBtn.classList.remove('greeted');
          }
        }, 1800);
      });
    }

    const chatBtn = document.getElementById('btn-chat-with-citizen');
    if (chatBtn) {
      chatBtn.addEventListener('click', () => {
        this.close();
        this.onOpenChat(c.name);
      });
    }
  }
}
