/**
 * The Living Commons Game (game/) Bridge Modal Controller (Agent SIM-5)
 * Explains the division of labor between the systemic diorama (sim/) and
 * the first-person longitudinal gameplay (game/), providing a discrete 1-click bridge.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';

export class PanelGameBridgeController {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.options = options;
    this.modalEl = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    let modal = document.getElementById('modal-game-bridge');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-game-bridge';
      modal.className = 'modal-overlay hidden';
      modal.innerHTML = `
        <div class="modal-window modal-game-bridge-card">
          <div class="modal-header">
            <div class="bridge-header-group">
              <span class="bridge-badge">🎮 DUAL-TRACK BRIDGE</span>
              <h2 class="modal-title" data-i18n="gameBridgeTitle">Step Onto the Soil • The Living Commons Game</h2>
              <span class="modal-subtitle" data-i18n="gameBridgeSub">Experience this Solarpunk settlement from the ground in full 3D</span>
            </div>
            <button id="btn-close-game-bridge" class="modal-btn-close" title="Close (ESC)">✕</button>
          </div>

          <div class="modal-body game-bridge-body">
            <p class="bridge-intro" data-i18n="gameBridgeIntro">
              You are currently observing the settlement from the high-level <strong>What-If Living Diorama</strong>.
              In <strong>The Living Commons Game (<code class="bridge-code">game/</code>)</strong>, active gameplay takes over: you inhabit the settlement directly as a pioneer.
            </p>

            <div class="bridge-pillars-grid">
              <div class="bridge-pillar-card">
                <div class="pillar-icon">🚲</div>
                <h4 class="pillar-title" data-i18n="bridgePillar1Title">Ground Exploration</h4>
                <p class="pillar-desc" data-i18n="bridgePillar1Desc">
                  Drive electric cargo trikes, fly monitoring VTOL drones, and explore bioregional watersheds in first-person 3D.
                </p>
              </div>

              <div class="bridge-pillar-card">
                <div class="pillar-icon">🛠️</div>
                <h4 class="pillar-title" data-i18n="bridgePillar2Title">Hands-On Usufruct Crafting</h4>
                <p class="pillar-desc" data-i18n="bridgePillar2Desc">
                  Physically fabricate modular habitat pods (MHU), manage your personal tool inventory, and print open-hardware CAD parts.
                </p>
              </div>

              <div class="bridge-pillar-card">
                <div class="pillar-icon">🤝</div>
                <h4 class="pillar-title" data-i18n="bridgePillar3Title">Real-Time P2P Mesh</h4>
                <p class="pillar-desc" data-i18n="bridgePillar3Desc">
                  Deliberate directly with peer pioneers via serverless WebRTC, vote on sortition juries, and pool volunteer hours.
                </p>
              </div>
            </div>

            <div class="bridge-invariant-banner">
              <span class="banner-icon">⚖️</span>
              <span class="banner-text" data-i18n="bridgeInvariant">
                Zero microtransactions • 100% free software (AGPL-3.0) • Shared sovereign commons
              </span>
            </div>
          </div>

          <div class="modal-footer game-bridge-footer">
            <button id="btn-bridge-stay-diorama" class="btn-secondary" data-i18n="btnStayDiorama">
              Continue in Diorama
            </button>
            <button id="btn-bridge-launch-game" class="btn-primary btn-launch-highlight" data-i18n="btnLaunchGame">
              🚀 Launch The Living Commons Game ➔
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    this.modalEl = modal;
  }

  bindEvents() {
    const closeBtn = document.getElementById('btn-close-game-bridge');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const stayBtn = document.getElementById('btn-bridge-stay-diorama');
    if (stayBtn) stayBtn.addEventListener('click', () => this.close());

    const launchBtn = document.getElementById('btn-bridge-launch-game');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        this.launchGame();
      });
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  open() {
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  launchGame() {
    // Determine the optimal game URL based on current host
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let targetUrl;

    if (isLocalhost) {
      // In local dev, game runs on adjacent port or path
      targetUrl = 'http://localhost:5174/';
    } else {
      // In production (e.g. Surge or GitHub Pages)
      targetUrl = window.location.origin + '/game/';
    }

    // Open game in new tab
    const win = window.open(targetUrl, '_blank');
    if (!win) {
      window.location.href = targetUrl;
    }
    this.close();
  }
}
