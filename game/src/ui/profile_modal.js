/**
 * O.N.E. Pioneer Profile & Sovereign Dossier Modal
 * Allows pioneers to inspect credentials and customize their appearance anytime during gameplay.
 * Class-0 Invariant: 100% Client-Side WebCrypto, Zero-Registration, Zero-Leak.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { createAvatarCustomizer } from './avatar_customizer.js';

export class ProfileModal {
  constructor() {
    this.overlayEl = null;
    this.customizerInstance = null;
    this.editingAppearance = null;
    this.editingName = '';
    this.editingVocation = '';

    this.ensureDom();
  }

  ensureDom() {
    let existing = document.getElementById('profile-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'profile-modal-overlay';
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
    const player = gameState.data.player;
    this.editingName = player.name || 'Alex';
    this.editingVocation = player.vocationId || 'electrician';
    this.editingAppearance = {
      ...(player.appearance || {
        gender: 'M',
        hairStyle: 'fade',
        hairColor: '#1e293b',
        skinTone: '#fbb77a'
      })
    };

    this.overlayEl.innerHTML = `
      <div class="modal-window profile-modal-window">
        <div class="modal-header">
          <div class="modal-title-row">
            <span class="modal-badge-green">🪪 SOVEREIGN CITIZEN DOSSIER</span>
            <h3>PIONEER IDENTITY & APPEARANCE</h3>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-profile" title="Close">✕</button>
        </div>

        <div class="modal-body profile-modal-body">
          <!-- Identity & Craft Row -->
          <div class="profile-identity-grid">
            <div class="profile-field-group">
              <label class="profile-field-label">Pioneer Call-sign / Name</label>
              <div class="profile-input-wrap">
                <span class="input-icon">★</span>
                <input type="text" id="profile-name-input" class="profile-text-input" value="${this.editingName}" maxlength="24">
              </div>
            </div>

            <div class="profile-field-group">
              <label class="profile-field-label">Vocation & Civic Craft</label>
              <div class="profile-vocations-pills">
                <button type="button" class="btn-vocation-pill ${this.editingVocation === 'builder' ? 'selected' : ''}" data-vocation="builder">
                  <span>🔨</span> Builder (Timber & CNC)
                </button>
                <button type="button" class="btn-vocation-pill ${this.editingVocation === 'electrician' ? 'selected' : ''}" data-vocation="electrician">
                  <span>⚡</span> Electrician (Microgrids)
                </button>
                <button type="button" class="btn-vocation-pill ${this.editingVocation === 'gardener' ? 'selected' : ''}" data-vocation="gardener">
                  <span>🥗</span> Gardener (Soil & Water)
                </button>
              </div>
            </div>
          </div>

          <!-- 3D Avatar Customizer Mount Slot -->
          <div class="profile-studio-section">
            <div class="studio-section-header">
              <span class="studio-title">🎨 SOVEREIGN 3D AVATAR STUDIO</span>
              <span class="studio-subtitle">Customize your pioneer appearance, hairstyle, and biocultural tones</span>
            </div>
            <div id="profile-avatar-customizer-slot"></div>
          </div>

          <!-- Dynamic Usufruct & OpSec Invariant Banner -->
          <div class="profile-usufruct-banner">
            <div class="usufruct-status-pill">● ACTIVE DYNAMIC USUFRUCT</div>
            <div class="usufruct-info">
              <span>Class-0 Non-Commercial Purity • 100% Client-Side WebCrypto • Sabbatical Lock: 30 Days</span>
            </div>
          </div>
        </div>

        <div class="modal-footer profile-modal-footer">
          <button type="button" class="btn-modal-cancel" id="btn-cancel-profile">Cancel</button>
          <button type="button" class="btn-modal-save" id="btn-save-profile">
            <span>💾 Save Profile & Appearance</span>
          </button>
        </div>
      </div>
    `;

    this.overlayEl.classList.remove('hidden');

    // Mount 3D Customizer
    const customizerSlot = this.overlayEl.querySelector('#profile-avatar-customizer-slot');
    if (customizerSlot) {
      this.customizerInstance = createAvatarCustomizer(
        customizerSlot,
        this.editingAppearance,
        (updatedAppearance) => {
          this.editingAppearance = { ...updatedAppearance };
        }
      );
    }

    // Attach Event Handlers
    const nameInput = this.overlayEl.querySelector('#profile-name-input');
    nameInput?.addEventListener('input', (e) => {
      this.editingName = e.target.value.trim() || 'Alex';
    });

    const vocationBtns = this.overlayEl.querySelectorAll('.btn-vocation-pill');
    vocationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        vocationBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.editingVocation = btn.dataset.vocation;
      });
    });

    this.canDismiss = false;
    setTimeout(() => {
      this.canDismiss = true;
    }, 400);

    const windowEl = this.overlayEl.querySelector('.modal-window');
    if (windowEl) {
      windowEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    this.overlayEl.querySelector('#btn-close-profile')?.addEventListener('click', () => {
      if (!this.canDismiss) return;
      this.close();
    });
    this.overlayEl.querySelector('#btn-cancel-profile')?.addEventListener('click', () => {
      if (!this.canDismiss) return;
      this.close();
    });

    const saveBtn = this.overlayEl.querySelector('#btn-save-profile');
    saveBtn?.addEventListener('click', () => {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span>⏳ Saving...</span>`;

      // Persist to central GameState
      gameState.setPlayerProfile(this.editingName, this.editingVocation, this.editingAppearance);

      saveBtn.innerHTML = `<span>✅ Saved!</span>`;
      setTimeout(() => {
        this.close();
      }, 350);
    });
  }

  close() {
    if (!this.canDismiss && !this.overlayEl.classList.contains('hidden')) return;
    if (this.customizerInstance) {
      this.customizerInstance.destroy();
      this.customizerInstance = null;
    }
    this.overlayEl.classList.add('hidden');
    this.overlayEl.innerHTML = '';
  }
}

export const profileModal = new ProfileModal();
