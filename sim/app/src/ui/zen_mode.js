/**
 * Zen / Screensaver Mode Controller (Agent SIM-5)
 * Unclutters the viewport completely, leaving 100% of the screen for the living
 * Solarpunk diorama canvas with cinematic slow-camera drift and ambient soundscape.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';

export class ZenModeController {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.settlementRenderer = options.settlementRenderer || null;
    this.ambienceAudio = options.ambienceAudio || null;
    this.hud = options.hud || null;

    this.isActive = false;
    this.exitPillEl = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    let pill = document.getElementById('zen-exit-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'zen-exit-pill';
      pill.className = 'zen-exit-pill hidden';
      pill.setAttribute('title', 'Click to exit Zen Mode (or press ESC / Z)');
      pill.innerHTML = `
        <span class="zen-pill-icon">🧘</span>
        <span class="zen-pill-text" data-i18n="zenExitHint">ZEN DIORAMA • Click or press [ESC] to exit</span>
      `;
      document.body.appendChild(pill);
    }
    this.exitPillEl = pill;
  }

  bindEvents() {
    if (this.exitPillEl) {
      this.exitPillEl.addEventListener('click', () => this.exit());
    }

    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;

      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Toggle Zen Mode
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isActive) {
        e.preventDefault();
        this.exit();
      }
    });
  }

  toggle() {
    if (this.isActive) {
      this.exit();
    } else {
      this.enter();
    }
  }

  enter() {
    this.isActive = true;
    document.body.classList.add('zen-mode-active');

    if (this.exitPillEl) {
      this.exitPillEl.classList.remove('hidden');
    }

    if (this.settlementRenderer) {
      this.settlementRenderer.zenDrift = true;
    }

    // Auto-unmute sound if user enters Zen mode and audio is available
    if (this.ambienceAudio && this.ambienceAudio.isMuted) {
      this.ambienceAudio.setMuted(false);
      this.updateAudioIcons(false);
    }

    if (this.hud) {
      this.hud.showNotification({
        title: '🧘 Zen Diorama Screensaver',
        message: 'Pure living landscape active. Sit back and watch the settlement flow. Press [ESC] or [Z] to exit.'
      });
    }
  }

  exit() {
    this.isActive = false;
    document.body.classList.remove('zen-mode-active');

    if (this.exitPillEl) {
      this.exitPillEl.classList.add('hidden');
    }

    if (this.settlementRenderer) {
      this.settlementRenderer.zenDrift = false;
      this.settlementRenderer.camera.targetX = 0;
      this.settlementRenderer.camera.targetY = 0;
      this.settlementRenderer.camera.targetZoom = 1.0;
    }
  }

  updateAudioIcons(isMuted) {
    const audioIcon = document.getElementById('audio-icon');
    const audioLabel = document.getElementById('audio-label');
    if (audioIcon) audioIcon.textContent = isMuted ? '🔇' : '🔊';
    if (audioLabel) audioLabel.textContent = isMuted ? 'Sound: Off' : 'Sound: On';

    const menuIcon = document.getElementById('menu-audio-icon');
    const menuLabel = document.getElementById('menu-audio-label');
    if (menuIcon) menuIcon.textContent = isMuted ? '🔇' : '🔊';
    if (menuLabel) menuLabel.textContent = isMuted ? 'Ambience Sound (Off)' : 'Ambience Sound (On)';
  }
}
