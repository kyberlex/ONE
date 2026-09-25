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
import { t } from '../i18n/index.js';

export class PanelCitizenController {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.options = options;
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

    const statusBadge = c.isPlayer 
      ? '<span class="status-pill status-player">👑 Local Player (YOU)</span>'
      : (c.isHuman 
        ? '<span class="status-pill status-peer">🌐 Federated Mesh Peer</span>'
        : (c.isChild 
          ? '<span class="status-pill status-child">🎒 Future Pioneer (Pupil)</span>'
          : (c.isElder 
            ? '<span class="status-pill status-elder">🧓 Community Elder & Mentor</span>'
            : '<span class="status-pill status-resident">🤝 Autonomous Resident</span>')));

    const html = `
      <div class="citizen-dossier-layout">
        <!-- Left: 3D WebGL Studio Viewport -->
        <div class="citizen-3d-box">
          <div class="citizen-3d-badge-header">
            <span class="live-3d-dot"></span>
            <span>3D SOVEREIGN AVATAR STUDIO</span>
          </div>
          <div id="citizen-3d-canvas-container" class="citizen-3d-canvas-container"></div>
          <div class="citizen-3d-controls">
            <button id="btn-citizen-auto-rotate" class="btn-prop-toolbar active" title="Toggle 3D Rotation">🔄 Auto-Rotate</button>
            <button id="btn-citizen-reset-cam" class="btn-prop-toolbar" title="Reset Camera">🔍 Reset View</button>
          </div>
          <div class="citizen-3d-hint">💡 Drag to rotate 360° • Scroll / Pinch to zoom</div>
        </div>

        <!-- Right: Dossier Details & Civic Invariants -->
        <div class="citizen-dossier-info">
          <div class="citizen-dossier-header-row">
            ${statusBadge}
            <span class="usufruct-seal">🛡️ Usufruct Holder</span>
          </div>

          <div class="citizen-stats-card">
            <div class="stat-line">
              <span class="stat-label">Vocation:</span>
              <span class="stat-value">${vocIcon} <strong>${vocName}</strong></span>
            </div>
            <div class="stat-line">
              <span class="stat-label">Social Labor:</span>
              <span class="stat-value"><strong>${c.dailyHours || 4} hours / day</strong> (Sabbatical Safe)</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">Current Routine:</span>
              <span class="stat-value text-green">${activityDesc}</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">Usufruct Pod:</span>
              <span class="stat-value">🏡 <strong>Pod #${homePodNum}</strong> (${homePodType})</span>
            </div>
            <div class="stat-line">
              <span class="stat-label">Biometric Floor:</span>
              <span class="stat-value">🥗 2,200 kcal/die • 💧 50 L/die Guaranteed</span>
            </div>
          </div>

          <div class="constitutional-protection-box">
            <div class="quote-header">📜 O.N.E. CONSTITUTION • USURPATION DEFENSE</div>
            <p>"No citizen may be evicted, priced out, or subjected to debt servitude. Basic sustenance and dwelling usufruct are unconditional birthrights."</p>
          </div>

          <div class="citizen-actions-row">
            ${c.homeDwelling ? `
              <button id="btn-locate-citizen-pod" class="btn-secondary" style="flex: 1;">
                🏡 Center on Pod #${homePodNum}
              </button>
            ` : ''}
            <button id="btn-chat-with-citizen" class="btn-primary" style="flex: 1.2;">
              💬 Message in Village Chat
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

    const chatBtn = document.getElementById('btn-chat-with-citizen');
    if (chatBtn) {
      chatBtn.addEventListener('click', () => {
        this.close();
        this.onOpenChat(c.name);
      });
    }
  }
}
