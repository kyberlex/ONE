/**
 * Sovereign Citizen Cryptographic Passport & P2P Sync Modal Controller (Agent SIM-5 & SIM-0)
 * Class-0 Invariant: Zero-Registration, Zero-Passwords, 100% Client-Side WebCrypto.
 *
 * Implements:
 * 1. Solarpunk Holographic Identity Card with Vitruvian Emblem & ECDSA P-256 fingerprint.
 * 2. 2D SVG QR Code multi-device pairing generator for seamless PC ↔ Phone ↔ Tablet sync.
 * 3. Local-First IndexedDB state inspection and append-only signed action logs.
 * 4. Token copy & import handler (zero-server identity replication).
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { storageIDB } from '../engine/storage_idb.js';
import { CitizenPassportManager } from '../engine/citizen_passport.js';
import { QRCodeSVG } from '../engine/qr_generator.js';
import { COMMUNITY_VOCATIONS } from '../data/vocations.js';
import { PlayerProfileManager } from '../engine/player_profile.js';
import { t } from '../i18n/index.js';
import { Avatar3DViewer } from './avatar_3d_viewer.js';
import { getCitizenAppearance } from '../settlement/interior_renderer.js';

const OUTFIT_OPTIONS = [
  { id: 'F', label: 'Tunica Solarpunk', icon: '🌿' },
  { id: 'M', label: 'Tuta da Lavoro', icon: '🛠️' }
];

const ALL_HAIRSTYLES = [
  { id: 'short', label: 'Corti Classici', icon: '💇' },
  { id: 'ponytail', label: 'Coda di Cavallo', icon: '🐎' },
  { id: 'long', label: 'Lunghi Fluenti', icon: '✨' },
  { id: 'bob', label: 'Caschetto', icon: '💁' },
  { id: 'bun', label: 'Chignon Alto', icon: '🌸' },
  { id: 'pigtails', label: 'Doppio Chignon', icon: '👧' },
  { id: 'messy', label: 'Mossi Spettinati', icon: '🌊' },
  { id: 'fade', label: 'Sfumati Moderni', icon: '⚡' },
  { id: 'beard', label: 'Barba Solarpunk', icon: '🧔' }
];

const HAIR_COLORS = [
  { color: '#1e293b', name: 'Jet Black' },
  { color: '#3b1d11', name: 'Dark Brown' },
  { color: '#78350f', name: 'Chestnut' },
  { color: '#d97706', name: 'Honey Blonde' },
  { color: '#9a3412', name: 'Auburn' },
  { color: '#e2e8f0', name: 'Silver' }
];

const SKIN_TONES = [
  { color: '#fed7aa', name: 'Fair Peach' },
  { color: '#fcd34d', name: 'Warm Beige' },
  { color: '#fbb77a', name: 'Golden Olive' },
  { color: '#d97706', name: 'Caramel' },
  { color: '#92400e', name: 'Bronze' },
  { color: '#78350f', name: 'Rich Espresso' }
];

export class PanelPassportController {
  constructor(sim, onIdentityChangedCallback = () => {}, p2pMesh = null) {
    this.sim = sim;
    this.onIdentityChanged = onIdentityChangedCallback;
    this.p2pMesh = p2pMesh;

    this.modalEl = document.getElementById('modal-passport');
    this.contentEl = document.getElementById('passport-modal-content');
    this.closeBtn = document.getElementById('btn-close-passport-modal');
    this.hudBadgeBtn = document.getElementById('btn-open-passport');
    this.hudBadgeLabel = document.getElementById('passport-btn-label');

    this.activeIdentity = null;
    this.privateKeyJwk = null;
    this.isImportMode = false;
    this.avatar3DViewer = null;
    this.cardAvatar3DViewer = null;
    this.drawerAvatar3DViewer = null;
    this.wizardAvatar = {
      gender: 'F',
      hairStyle: 'ponytail',
      hairColor: '#1e293b',
      skinTone: '#fbb77a'
    };
    this.hasManuallyCustomized = false;

    this.bindEvents();
    this.init();

    if (this.p2pMesh) {
      this.p2pMesh.onStatusChange(status => {
        const statusEl = document.getElementById('p2p-mesh-status-val');
        if (statusEl) {
          statusEl.innerHTML = status.peerCount > 0
            ? `<span style="color: #10b981;">● Active (${status.peerCount} peer${status.peerCount > 1 ? 's' : ''} connected)</span>`
            : `<span style="color: #94a3b8;">● Ready (0 peers connected)</span>`;
        }
      });
    }
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

    if (this.hudBadgeBtn) {
      this.hudBadgeBtn.addEventListener('click', () => this.open());
    }
  }

  async init() {
    // 1. Initialize IndexedDB
    await storageIDB.init();

    // 2. Check for URL parameter ?passport=ONE:... (scanned from QR code)
    const urlParams = new URLSearchParams(window.location.search);
    const passportParam = urlParams.get('passport');
    if (passportParam && passportParam.startsWith('ONE:')) {
      const parsed = CitizenPassportManager.parseToken(passportParam);
      if (parsed) {
        console.log('📲 [Passport] Detected passport in URL query param:', parsed.name);
        await this.adoptImportedToken(passportParam);
        // Clean URL without reloading
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    // 3. Load active identity from IndexedDB
    this.activeIdentity = await storageIDB.getActiveIdentity();
    if (this.activeIdentity && this.activeIdentity.privateKeyJwk) {
      this.privateKeyJwk = this.activeIdentity.privateKeyJwk;
    }

    this.updateHudBadge();

    // 4. First-Time Arrival: automatically prompt player to create their citizen passport
    if (!this.activeIdentity || this.activeIdentity.id?.startsWith('cit-legacy-') || this.activeIdentity.pubKeyHex === 'legacy_key') {
      console.log('🌱 [Passport] First-time arrival detected: launching sovereign onboarding wizard...');
      setTimeout(() => {
        this.open();
      }, 400);
    }
  }

  updateHudBadge() {
    if (!this.hudBadgeLabel) return;
    if (this.activeIdentity) {
      const vocation = COMMUNITY_VOCATIONS.find(v => v.id === this.activeIdentity.vocationId);
      const icon = vocation ? vocation.icon : '👤';
      this.hudBadgeLabel.textContent = `${icon} ${this.activeIdentity.name}`;
      if (this.hudBadgeBtn) {
        this.hudBadgeBtn.title = `Sovereign Citizen: ${this.activeIdentity.name} (${this.activeIdentity.shortFingerprint})`;
        this.hudBadgeBtn.classList.add('has-passport');
      }
    } else {
      this.hudBadgeLabel.textContent = '🔑 Issue Passport';
      if (this.hudBadgeBtn) {
        this.hudBadgeBtn.title = 'Issue Sovereign Cryptographic Identity (Zero-Registration)';
        this.hudBadgeBtn.classList.remove('has-passport');
      }
    }
  }

  async open() {
    // Refresh latest identity and event count
    this.activeIdentity = await storageIDB.getActiveIdentity();
    if (this.activeIdentity && this.activeIdentity.privateKeyJwk) {
      this.privateKeyJwk = this.activeIdentity.privateKeyJwk;
    }

    this.render();
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  close() {
    this.destroy3DViewers();
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  destroy3DViewers() {
    if (this.avatar3DViewer) {
      this.avatar3DViewer.destroy();
      this.avatar3DViewer = null;
    }
    if (this.cardAvatar3DViewer) {
      this.cardAvatar3DViewer.destroy();
      this.cardAvatar3DViewer = null;
    }
    if (this.drawerAvatar3DViewer) {
      this.drawerAvatar3DViewer.destroy();
      this.drawerAvatar3DViewer = null;
    }
  }

  getCustomizerControlsHtml(avatarState, prefix = 'wiz') {
    const gender = avatarState.gender || 'F';
    const activeHairStyle = avatarState.hairStyle || 'short';
    const activeHairColor = avatarState.hairColor || '#1e293b';
    const activeSkinTone = avatarState.skinTone || '#fbb77a';

    const outfitButtonsHtml = OUTFIT_OPTIONS.map(o => `
      <button type="button" class="btn-avatar-pill ${gender === o.id ? 'selected' : ''}" data-prefix="${prefix}" data-gender="${o.id}">
        <span>${o.icon}</span> ${o.label}
      </button>
    `).join('');

    const hairStylesHtml = ALL_HAIRSTYLES.map(h => `
      <button type="button" class="btn-avatar-pill ${activeHairStyle === h.id ? 'selected' : ''}" data-prefix="${prefix}" data-hairstyle="${h.id}">
        <span>${h.icon}</span> ${h.label}
      </button>
    `).join('');

    const hairColorsHtml = HAIR_COLORS.map(c => `
      <div class="swatch-circle ${activeHairColor === c.color ? 'selected' : ''}" 
           style="background-color: ${c.color};" 
           data-prefix="${prefix}" 
           data-haircolor="${c.color}" 
           title="${c.name}"></div>
    `).join('');

    const skinTonesHtml = SKIN_TONES.map(s => `
      <div class="swatch-circle ${activeSkinTone === s.color ? 'selected' : ''}" 
           style="background-color: ${s.color};" 
           data-prefix="${prefix}" 
           data-skintone="${s.color}" 
           title="${s.name}"></div>
    `).join('');

    return `
      <div class="avatar-3d-layout">
        <div class="avatar-3d-viewport-box">
          <div class="avatar-3d-badge-header">
            <span class="badge-3d-pill">✨ STUDIO PIONIERE</span>
            <span class="badge-3d-hint">🖱️ Ruota 360° • Zoom</span>
          </div>
          <div id="${prefix}-avatar-3d-container" class="avatar-3d-canvas-container"></div>
        </div>

        <div class="avatar-3d-controls">
          <div class="custom-control-group">
            <span class="custom-control-title">Abito & Silhouette:</span>
            <div class="btn-pills-row" id="${prefix}-gender-container">
              ${outfitButtonsHtml}
            </div>
          </div>

          <div class="custom-control-group">
            <span class="custom-control-title">Acconciatura:</span>
            <div class="btn-pills-row" id="${prefix}-hairstyle-container">
              ${hairStylesHtml}
            </div>
          </div>

          <div class="custom-control-group">
            <span class="custom-control-title">Colore Capelli:</span>
            <div class="color-swatches-row" id="${prefix}-haircolor-container">
              ${hairColorsHtml}
            </div>
          </div>

          <div class="custom-control-group">
            <span class="custom-control-title">Tonalità Carnagione:</span>
            <div class="color-swatches-row" id="${prefix}-skintone-container">
              ${skinTonesHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupCustomizerInteractions(rootEl, avatarState, prefix, onChange) {
    const stageContainer = rootEl.querySelector(`#${prefix}-avatar-3d-container`);
    let viewer = null;
    if (stageContainer) {
      viewer = new Avatar3DViewer(stageContainer, avatarState);
    }

    const refreshPills = () => {
      const hairContainer = rootEl.querySelector(`#${prefix}-hairstyle-container`);
      if (hairContainer) {
        hairContainer.innerHTML = ALL_HAIRSTYLES.map(h => `
          <button type="button" class="btn-avatar-pill ${avatarState.hairStyle === h.id ? 'selected' : ''}" data-prefix="${prefix}" data-hairstyle="${h.id}">
            <span>${h.icon}</span> ${h.label}
          </button>
        `).join('');

        hairContainer.querySelectorAll(`button[data-hairstyle]`).forEach(btn => {
          btn.addEventListener('click', () => {
            avatarState.hairStyle = btn.dataset.hairstyle;
            hairContainer.querySelectorAll(`button[data-hairstyle]`).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            if (viewer) viewer.updateAppearance(avatarState);
            onChange(avatarState);
          });
        });
      }
    };

    rootEl.querySelectorAll(`button[data-prefix="${prefix}"][data-gender]`).forEach(btn => {
      btn.addEventListener('click', () => {
        avatarState.gender = btn.dataset.gender;
        rootEl.querySelectorAll(`button[data-prefix="${prefix}"][data-gender]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        refreshPills();
        if (viewer) viewer.updateAppearance(avatarState);
        onChange(avatarState);
      });
    });

    refreshPills();

    rootEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-haircolor]`).forEach(sw => {
      sw.addEventListener('click', () => {
        avatarState.hairColor = sw.dataset.haircolor;
        rootEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-haircolor]`).forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        if (viewer) viewer.updateAppearance(avatarState);
        onChange(avatarState);
      });
    });

    rootEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-skintone]`).forEach(sw => {
      sw.addEventListener('click', () => {
        avatarState.skinTone = sw.dataset.skintone;
        rootEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-skintone]`).forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        if (viewer) viewer.updateAppearance(avatarState);
        onChange(avatarState);
      });
    });

    return viewer;
  }

  async render() {
    this.destroy3DViewers();
    if (!this.contentEl) return;

    if (!this.activeIdentity && !this.isImportMode) {
      this.renderCreationWizard();
    } else if (this.isImportMode) {
      this.renderImportView();
    } else {
      await this.renderPassportCard();
    }
  }

  /**
   * Wizard for creating a new sovereign cryptographic passport
   */
  renderCreationWizard() {
    const vocationsHtml = COMMUNITY_VOCATIONS.map((voc, idx) => `
      <label class="vocation-radio-label ${idx === 0 ? 'selected' : ''}">
        <input type="radio" name="passport-vocation" value="${voc.id}" ${idx === 0 ? 'checked' : ''} />
        <span class="vocation-radio-card">
          <span class="voc-card-icon">${voc.icon}</span>
          <span class="voc-card-title">${voc.defaultName}</span>
          <span class="voc-card-desc">${voc.defaultBonus}</span>
        </span>
      </label>
    `).join('');

    this.contentEl.innerHTML = `
      <div class="passport-wizard-box">
        <div class="wizard-header">
          <div class="wizard-emblem-ring">
            <img src="/one-logo-white.svg" alt="O.N.E. Vitruvian Logo" class="wizard-emblem-icon" />
          </div>
          <h3>Benvenuto in O.N.E. • Rilascio Passaporto del Cittadino</h3>
          <p class="wizard-subtitle">Nessun account centrale, nessuna password o server esterno. I tuoi dati restano al 100% sul tuo dispositivo.</p>
        </div>

        <div class="wizard-form">
          <div class="form-group">
            <label for="passport-avatar-name" style="font-weight: 700; color: #f8fafc;">
              👤 Qual è il tuo nome / soprannome da pioniere?
            </label>
            <input type="text" id="passport-avatar-name" class="passport-input" placeholder="es. Maya, Elena, Sol_Builder, Marco..." maxlength="24" value="" autofocus />
            <span class="form-hint">Unico e salvato localmente, senza registrazione o e-mail esterne.</span>
          </div>

          <!-- Studio Pioniere Section -->
          <div class="form-group avatar-3d-customizer-section">
            <label style="font-weight: 700; color: #f8fafc; margin-bottom: 8px; display: block;">
              🎨 Aspetto del Tuo Pioniere (Studio Personaggio):
            </label>
            ${this.getCustomizerControlsHtml(this.wizardAvatar, 'wiz')}
          </div>

          <div class="form-group">
            <label style="font-weight: 700; color: #f8fafc;">
              🛠️ Scegli la tua vocazione o mestiere iniziale:
            </label>
            <div class="vocations-grid-select">
              ${vocationsHtml}
            </div>
          </div>

          <!-- Notice: Vocational Academy / Training School -->
          <div class="vocation-polytech-callout">
            <div class="polytech-header">
              <span class="polytech-icon">🎓</span>
              <div class="polytech-title-wrap">
                <h4>Accademia Civica & Apprendimento Continuo</h4>
                <span class="polytech-sub">Evoluzione delle Competenze</span>
              </div>
            </div>
            <p class="polytech-text">
              La vocazione iniziale <strong>non è vincolante né definitiva</strong>. In O.N.E. puoi cambiare mestiere, apprendere nuove abilità e formarti quando vuoi presso l'<strong>Accademia Politecnica</strong> della comunità.
            </p>
          </div>

          <div class="wizard-actions" style="margin-top: 10px;">
            <button id="btn-generate-passport" class="btn-primary btn-generate-keys">
              ⚡ Crea Identità & Emetti Passaporto
            </button>
            <button id="btn-show-import" class="btn-secondary">
              📥 Ho già un passaporto (Importa token da altro dispositivo)
            </button>
          </div>
        </div>
      </div>
    `;

    // Focus on avatar name input
    setTimeout(() => {
      const nameInput = this.contentEl.querySelector('#passport-avatar-name');
      if (nameInput) nameInput.focus();
    }, 100);

    // Mount 3D Studio in Wizard
    this.avatar3DViewer = this.setupCustomizerInteractions(this.contentEl, this.wizardAvatar, 'wiz', (updated) => {
      this.wizardAvatar = updated;
      this.hasManuallyCustomized = true;
    });

    // Suggest default appearance from name if not manually modified
    const nameInput = this.contentEl.querySelector('#passport-avatar-name');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (!this.hasManuallyCustomized) {
          const suggested = getCitizenAppearance(nameInput.value.trim() || 'Pioneer');
          this.wizardAvatar.gender = suggested.gender;
          this.wizardAvatar.hairStyle = suggested.hairStyle;
          this.wizardAvatar.hairColor = suggested.hairColor;
          this.wizardAvatar.skinTone = suggested.skinTone;
          if (this.avatar3DViewer) this.avatar3DViewer.updateAppearance(this.wizardAvatar);

          // Update active buttons in UI
          const rootEl = this.contentEl;
          rootEl.querySelectorAll(`button[data-prefix="wiz"][data-gender]`).forEach(b => {
            b.classList.toggle('selected', b.dataset.gender === this.wizardAvatar.gender);
          });
          const hairContainer = rootEl.querySelector(`#wiz-hairstyle-container`);
          if (hairContainer) {
            hairContainer.innerHTML = ALL_HAIRSTYLES.map(h => `
              <button type="button" class="btn-avatar-pill ${this.wizardAvatar.hairStyle === h.id ? 'selected' : ''}" data-prefix="wiz" data-hairstyle="${h.id}">
                <span>${h.icon}</span> ${h.label}
              </button>
            `).join('');
          }
          rootEl.querySelectorAll(`.swatch-circle[data-prefix="wiz"][data-haircolor]`).forEach(s => {
            s.classList.toggle('selected', s.dataset.haircolor === this.wizardAvatar.hairColor);
          });
          rootEl.querySelectorAll(`.swatch-circle[data-prefix="wiz"][data-skintone]`).forEach(s => {
            s.classList.toggle('selected', s.dataset.skintone === this.wizardAvatar.skinTone);
          });
        }
      });
    }

    // Radio select interactions
    const radioLabels = this.contentEl.querySelectorAll('.vocation-radio-label');
    radioLabels.forEach(label => {
      label.addEventListener('click', () => {
        radioLabels.forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
      });
    });

    const generateBtn = this.contentEl.querySelector('#btn-generate-passport');
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        const nameInput = this.contentEl.querySelector('#passport-avatar-name');
        const selectedRadio = this.contentEl.querySelector('input[name="passport-vocation"]:checked');
        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Pioneer';
        const vocation = selectedRadio ? selectedRadio.value : 'farmer';

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span>⏳ Creazione Identità & Chiavi Locali…</span>`;

        try {
          const { passport, privateKeyJwk } = await CitizenPassportManager.issueSovereignPassport(name, vocation, this.wizardAvatar);
          await storageIDB.saveIdentity(passport, privateKeyJwk);
          this.activeIdentity = passport;
          this.privateKeyJwk = privateKeyJwk;

          // Update player profile manager
          PlayerProfileManager.claimDwelling('node-detroit', 'Detroit Delray Commons', { id: 'dwelling-1', number: 1 }, vocation, this.wizardAvatar);
          PlayerProfileManager.updateAppearance(this.wizardAvatar);

          // Log founding event delta
          const foundingDelta = await CitizenPassportManager.createSignedDelta(
            'CITIZEN_SOVEREIGN_ISSUANCE',
            { avatarName: name, vocation, timestamp: passport.timestampMs },
            passport,
            privateKeyJwk,
            this.sim.tickCount
          );
          await storageIDB.appendEvent(foundingDelta);

          // Broadcast to P2P mesh
          if (this.p2pMesh) {
            this.p2pMesh.setIdentity(passport);
            this.p2pMesh.broadcastDelta(foundingDelta);
          }

          this.updateHudBadge();
          this.onIdentityChanged(this.activeIdentity);
          await this.render();
        } catch (err) {
          console.error('[Passport] Issuance error:', err);
          generateBtn.disabled = false;
          generateBtn.textContent = '❌ Generation Error. Please retry';
        }
      });
    }

    const showImportBtn = this.contentEl.querySelector('#btn-show-import');
    if (showImportBtn) {
      showImportBtn.addEventListener('click', () => {
        this.isImportMode = true;
        this.render();
      });
    }
  }

  /**
   * View for pasting/importing an existing token from another device
   */
  renderImportView() {
    this.contentEl.innerHTML = `
      <div class="passport-import-box">
        <div class="wizard-header">
          <span style="font-size: 32px;">📥</span>
          <h3>Pair Device / Import Citizen Token</h3>
          <p class="wizard-subtitle">Paste your sovereign token (copied from another PC, phone, or tablet) to clone your citizen identity.</p>
        </div>

        <div class="import-form">
          <div class="form-group">
            <label for="import-token-input">Paste Sovereign Token (ONE:...):</label>
            <textarea id="import-token-input" class="token-textarea" placeholder="ONE:John:1774345632145:7f9a:0451..."></textarea>
          </div>

          <div id="import-validation-msg" class="import-validation-msg hidden"></div>

          <div class="wizard-actions">
            <button id="btn-confirm-import" class="btn-primary">
              🔑 Confirm & Pair Identity
            </button>
            <button id="btn-cancel-import" class="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    const cancelBtn = this.contentEl.querySelector('#btn-cancel-import');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.isImportMode = false;
        this.render();
      });
    }

    const confirmBtn = this.contentEl.querySelector('#btn-confirm-import');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const textarea = this.contentEl.querySelector('#import-token-input');
        const token = textarea ? textarea.value.trim() : '';
        const msgEl = this.contentEl.querySelector('#import-validation-msg');

        if (!token.startsWith('ONE:')) {
          msgEl.textContent = '⚠️ Invalid token format. Must start with "ONE:".';
          msgEl.className = 'import-validation-msg error';
          msgEl.classList.remove('hidden');
          return;
        }

        const success = await this.adoptImportedToken(token);
        if (success) {
          this.isImportMode = false;
          await this.render();
        } else {
          msgEl.textContent = '❌ Failed to decode token. Ensure complete cryptographic payload is copied.';
          msgEl.className = 'import-validation-msg error';
          msgEl.classList.remove('hidden');
        }
      });
    }
  }

  /**
   * Adopts and stores an imported passport token
   */
  async adoptImportedToken(token) {
    const parsed = CitizenPassportManager.parseToken(token);
    if (!parsed) return false;

    const importedIdentity = {
      ...parsed,
      vocationId: 'farmer',
      active: true,
      importedAt: Date.now()
    };

    await storageIDB.saveIdentity(importedIdentity);
    this.activeIdentity = importedIdentity;
    this.updateHudBadge();
    this.onIdentityChanged(this.activeIdentity);
    return true;
  }

  /**
   * Renders the complete holographic Solarpunk Passport Card & QR Code
   */
  async renderPassportCard() {
    const p = this.activeIdentity;
    const vocation = COMMUNITY_VOCATIONS.find(v => v.id === p.vocationId) || COMMUNITY_VOCATIONS[0];
    const eventCount = await storageIDB.getEventCount();
    const recentEvents = await storageIDB.getEventHistory(5);

    // Dynamic Pairing URL for QR code
    const currentOrigin = window.location.origin + window.location.pathname;
    const pairingUrl = `${currentOrigin}?passport=${p.token}`;
    const qrSvg = QRCodeSVG.generateSVG(pairingUrl, {
      size: 190,
      color: '#10b981',
      background: 'transparent'
    });

    const eventsListHtml = recentEvents.length > 0
      ? recentEvents.map(ev => `
        <div class="event-mini-row">
          <span class="ev-time">Tick ${ev.tick || 0}</span>
          <span class="ev-type">${ev.type || 'ACTION'}</span>
          <span class="ev-sig" title="${ev.signature}">🔒 ${ev.signature ? ev.signature.slice(0, 10) + '…' : 'valid'}</span>
        </div>
      `).join('')
      : `<div class="text-dim" style="font-size: 12px; padding: 6px;">No actions logged yet in local IndexedDB.</div>`;

    this.contentEl.innerHTML = `
      <div class="passport-display-container">
        <!-- Holographic Passport Badge -->
        <div class="sovereign-passport-card">
          <div class="passport-hologram-strip"></div>
          
          <div class="passport-top-row">
            <div class="passport-emblem">
              <img src="/one-logo-white.svg" alt="Vitruvian Logo" class="passport-vitruvian-logo" />
            </div>
            <div class="passport-avatar-photo" id="passport-card-photo-box" title="Sovereign 3D Avatar (click to rotate or customize)">
              <div id="passport-card-3d-avatar" class="passport-card-3d-container"></div>
            </div>
            <div class="passport-title-meta">
              <span class="passport-org-tag">O.N.E. DUAL-TRACK COMMONS</span>
              <h2 class="passport-citizen-name">${p.name}</h2>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <div class="passport-vocation-pill">
                  <span>${vocation.icon}</span>
                  <span>${vocation.defaultName}</span>
                </div>
                <button type="button" id="btn-toggle-avatar-editor" class="btn-avatar-edit-chip" title="Modify your 3D avatar appearance">
                  <span>🎨</span> Appearance (3D)
                </button>
              </div>
            </div>
            <div class="passport-qr-stamp">
              <span class="qr-stamp-label">PEER SYNC</span>
              <div class="qr-thumbnail-box">${qrSvg}</div>
            </div>
          </div>

          <!-- Collapsible 3D Avatar Customizer Drawer -->
          <div id="avatar-card-editor-drawer" class="avatar-drawer-box hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="margin: 0; font-size: 14px; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
                <span>✨</span> Sovereign Avatar Appearance Studio (3D)
              </h4>
              <button type="button" id="btn-close-avatar-drawer" class="btn-action-small">✕ Close</button>
            </div>
            <div id="drawer-customizer-slot"></div>
            <div style="margin-top: 14px; display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btn-save-avatar-changes" class="btn-primary" style="padding: 6px 18px; font-size: 13px;">
                💾 Save Appearance Changes
              </button>
            </div>
          </div>

          <div class="passport-details-grid">
            <div class="passport-detail-item">
              <span class="detail-label">ID PASSAPORTO CITTADINO</span>
              <span class="detail-value mono">${p.id}</span>
            </div>
            <div class="passport-detail-item">
              <span class="detail-label">CHIAVE UNICA DISPOSITIVO</span>
              <span class="detail-value mono text-emerald">${p.shortFingerprint}</span>
            </div>
            <div class="passport-detail-item">
              <span class="detail-label">DATA DI EMISSIONE</span>
              <span class="detail-value">${new Date(p.timestampMs).toLocaleDateString()}</span>
            </div>
            <div class="passport-detail-item">
              <span class="detail-label">ALLOGGIO IN USUFRUTTO</span>
              <span class="detail-value">Dimora #1 • Detroit Commons</span>
            </div>
          </div>

          <div class="passport-token-box">
            <span class="token-box-label">Codice Personale del Cittadino (Ripristinabile senza server):</span>
            <div class="token-copy-row">
              <input type="text" readonly class="token-copy-input" value="${p.token}" id="passport-token-val" />
              <button id="btn-copy-token" class="btn-copy-token" title="Copia negli appunti">
                📋 Copia
              </button>
            </div>
          </div>
        </div>

        <!-- Multi-Device P2P Pairing Section -->
        <div class="p2p-sync-section">
          <div class="p2p-header">
            <h4>📲 Sincronizzazione Dispositivi con QR Code</h4>
            <span class="badge badge-success">ZERO-SERVER</span>
          </div>
          <div class="p2p-pairing-body">
            <div class="p2p-qr-large">
              ${qrSvg}
              <div class="qr-instructions">
                <strong>Inquadra con la fotocamera del telefono o tablet:</strong>
                <span>Associazione diretta e immediata: clona il profilo senza digitare codici.</span>
              </div>
            </div>

            <div class="p2p-mesh-status-card">
              <h5>Archiviazione Locale & Sicurezza</h5>
              <div class="db-stat-row">
                <span>Memoria Locale:</span>
                <strong class="text-emerald">IndexedDB (60 FPS)</strong>
              </div>
              <div class="db-stat-row">
                <span>Sicurezza:</span>
                <strong>Crittografia Locale del Dispositivo</strong>
              </div>
              <div class="db-stat-row">
                <span>Azioni Registrate:</span>
                <strong id="db-event-count">${eventCount} azioni registrate</strong>
              </div>
              <div class="db-stat-row">
                <span>Connessione Diretta Rete:</span>
                <span id="p2p-mesh-status-val" class="status-indicator-ready">
                  ${this.p2pMesh && this.p2pMesh.getStatus().peerCount > 0 
                    ? `● Attiva (${this.p2pMesh.getStatus().peerCount} connession${this.p2pMesh.getStatus().peerCount > 1 ? 'i' : 'e'})` 
                    : '● Pronta (Rete Locale / Wi-Fi)'}
                </span>
              </div>

              <!-- Signed Event Deltas Mini Feed -->
              <div class="signed-events-feed">
                <div class="feed-header">Ultime azioni registrate:</div>
                <div class="feed-list">
                  ${eventsListHtml}
                </div>
              </div>

              <!-- WebRTC Air-Gapped Handshake Drawer -->
              <div class="webrtc-handshake-box">
                <div class="webrtc-box-header">
                  <span>📡 Canale Diretto Senza Server</span>
                  <button id="btn-create-webrtc-ticket" class="btn-action-small">
                    🎫 Crea Invito
                  </button>
                </div>
                <div id="webrtc-ticket-display" class="webrtc-ticket-display hidden"></div>
                <div class="webrtc-input-row">
                  <input type="text" id="input-webrtc-remote" class="webrtc-input" placeholder="Incolla invito ONE_OFFER: o ONE_ANSWER:..." />
                  <button id="btn-accept-webrtc-remote" class="btn-action-small">
                    🔗 Connetti
                  </button>
                </div>
                <div id="webrtc-feedback-msg" class="webrtc-feedback hidden"></div>
              </div>

              <div class="p2p-action-btns">
                <button id="btn-sign-test" class="btn-action-small">
                  ✍️ Prova Firma Digitale
                </button>
                <button id="btn-p2p-sync-now" class="btn-action-small btn-secondary">
                  🔄 Sincronizza Ora
                </button>
                <button id="btn-switch-passport" class="btn-action-small btn-secondary">
                  🔄 Cambia Pioniere
                </button>
              </div>

              <!-- Danger Zone: Right to Oblivion / Sovereign Departure -->
              <div class="passport-danger-zone">
                <button id="btn-burn-identity" class="btn-burn-identity" title="Diritto all'Oblio">
                  🔥 Elimina Dati & Riparti da Zero (Diritto all'Oblio)
                </button>
                <span class="danger-zone-hint">
                  Distrugge in modo sicuro e definitivo le chiavi locali da questo dispositivo e restituisce la dimora al bene comune.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Mount Mini 3D Avatar Photo in Passport Card
    const photoContainer = this.contentEl.querySelector('#passport-card-3d-avatar');
    if (photoContainer) {
      const activeAppearance = p.appearance || getCitizenAppearance(p.name);
      this.cardAvatar3DViewer = new Avatar3DViewer(photoContainer, activeAppearance, { isMiniPhoto: true });
    }

    // Bind Toggle 3D Avatar Customizer Drawer
    const toggleAvatarBtn = this.contentEl.querySelector('#btn-toggle-avatar-editor');
    const photoBox = this.contentEl.querySelector('#passport-card-photo-box');
    const drawerEl = this.contentEl.querySelector('#avatar-card-editor-drawer');
    const drawerSlot = this.contentEl.querySelector('#drawer-customizer-slot');
    const closeDrawerBtn = this.contentEl.querySelector('#btn-close-avatar-drawer');
    const saveAvatarBtn = this.contentEl.querySelector('#btn-save-avatar-changes');

    let currentEditingAppearance = {
      gender: p.appearance?.gender || 'F',
      hairStyle: p.appearance?.hairStyle || 'ponytail',
      hairColor: p.appearance?.hairColor || '#1e293b',
      skinTone: p.appearance?.skinTone || '#fbb77a'
    };

    const openDrawer = () => {
      if (!drawerEl || !drawerSlot) return;
      drawerEl.classList.remove('hidden');
      if (!this.drawerAvatar3DViewer) {
        drawerSlot.innerHTML = this.getCustomizerControlsHtml(currentEditingAppearance, 'card-drawer');
        this.drawerAvatar3DViewer = this.setupCustomizerInteractions(
          drawerEl,
          currentEditingAppearance,
          'card-drawer',
          (updated) => {
            currentEditingAppearance = updated;
            if (this.cardAvatar3DViewer) {
              this.cardAvatar3DViewer.updateAppearance(updated);
            }
          }
        );
      }
    };

    const closeDrawer = () => {
      if (!drawerEl) return;
      drawerEl.classList.add('hidden');
      if (this.drawerAvatar3DViewer) {
        this.drawerAvatar3DViewer.destroy();
        this.drawerAvatar3DViewer = null;
      }
    };

    if (toggleAvatarBtn) {
      toggleAvatarBtn.addEventListener('click', () => {
        if (drawerEl?.classList.contains('hidden')) openDrawer();
        else closeDrawer();
      });
    }

    if (photoBox) {
      photoBox.addEventListener('click', () => {
        if (drawerEl?.classList.contains('hidden')) openDrawer();
      });
    }

    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);

    if (saveAvatarBtn) {
      saveAvatarBtn.addEventListener('click', async () => {
        saveAvatarBtn.disabled = true;
        saveAvatarBtn.textContent = '⏳ Saving…';

        p.appearance = { ...currentEditingAppearance };
        await storageIDB.saveIdentity(p);
        PlayerProfileManager.updateAppearance(p.appearance);

        if (this.cardAvatar3DViewer) {
          this.cardAvatar3DViewer.updateAppearance(p.appearance);
        }

        this.onIdentityChanged(p);

        saveAvatarBtn.disabled = false;
        saveAvatarBtn.textContent = '✅ Appearance Saved!';
        setTimeout(() => {
          if (saveAvatarBtn) saveAvatarBtn.textContent = '💾 Save Appearance Changes';
          closeDrawer();
        }, 600);
      });
    }

    // Bind Copy Button
    const copyBtn = this.contentEl.querySelector('#btn-copy-token');
    const tokenInput = this.contentEl.querySelector('#passport-token-val');
    if (copyBtn && tokenInput) {
      copyBtn.addEventListener('click', () => {
        tokenInput.select();
        navigator.clipboard.writeText(tokenInput.value).then(() => {
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
        });
      });
    }

    // Bind WebRTC Create Offer Ticket
    const createTicketBtn = this.contentEl.querySelector('#btn-create-webrtc-ticket');
    const ticketDisplay = this.contentEl.querySelector('#webrtc-ticket-display');
    if (createTicketBtn && ticketDisplay && this.p2pMesh) {
      createTicketBtn.addEventListener('click', async () => {
        createTicketBtn.disabled = true;
        createTicketBtn.textContent = '⏳ Gathering ICE Candidates…';
        try {
          const offerTicket = await this.p2pMesh.createOfferTicket();
          const qrSvgTicket = QRCodeSVG.generateSVG(offerTicket.slice(0, 300), { size: 140, color: '#38bdf8' });
          ticketDisplay.innerHTML = `
            <div class="ticket-qr-box">
              ${qrSvgTicket}
              <div class="ticket-copy-box">
                <span style="font-size: 10px; color: #38bdf8; font-weight: bold;">WebRTC Offer Ticket Generated:</span>
                <input type="text" readonly class="token-copy-input" value="${offerTicket}" id="webrtc-offer-val" />
                <button id="btn-copy-webrtc-offer" class="btn-copy-token">📋 Copy Offer</button>
              </div>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Paste this ticket on Device B, then paste its generated Answer back here.</div>
          `;
          ticketDisplay.classList.remove('hidden');

          const copyOfferBtn = ticketDisplay.querySelector('#btn-copy-webrtc-offer');
          const offerInput = ticketDisplay.querySelector('#webrtc-offer-val');
          if (copyOfferBtn && offerInput) {
            copyOfferBtn.addEventListener('click', () => {
              offerInput.select();
              navigator.clipboard.writeText(offerInput.value).then(() => {
                copyOfferBtn.textContent = '✅ Copied!';
                setTimeout(() => (copyOfferBtn.textContent = '📋 Copy Offer'), 2000);
              });
            });
          }
        } catch (err) {
          console.error('[WebRTC] Offer generation error:', err);
          alert('Failed to generate WebRTC ticket: ' + err.message);
        } finally {
          createTicketBtn.disabled = false;
          createTicketBtn.textContent = '🎫 Create Offer Ticket';
        }
      });
    }

    // Bind WebRTC Accept Remote Ticket (Offer or Answer)
    const acceptRemoteBtn = this.contentEl.querySelector('#btn-accept-webrtc-remote');
    const inputRemote = this.contentEl.querySelector('#input-webrtc-remote');
    const feedbackMsg = this.contentEl.querySelector('#webrtc-feedback-msg');
    if (acceptRemoteBtn && inputRemote && feedbackMsg && this.p2pMesh) {
      acceptRemoteBtn.addEventListener('click', async () => {
        const ticket = inputRemote.value.trim();
        if (!ticket) return;

        acceptRemoteBtn.disabled = true;
        feedbackMsg.classList.remove('hidden');

        try {
          if (ticket.startsWith('ONE_OFFER:')) {
            feedbackMsg.innerHTML = '<span style="color: #38bdf8;">Processing Offer & generating Answer…</span>';
            const answerTicket = await this.p2pMesh.acceptOfferAndGenerateAnswerTicket(ticket);
            feedbackMsg.innerHTML = `
              <div style="margin-top: 6px;">
                <span style="color: #10b981; font-weight: bold;">✅ Answer Ticket Ready! Copy back to Device A:</span>
                <input type="text" readonly class="token-copy-input" value="${answerTicket}" id="webrtc-answer-val" style="margin-top: 4px;" />
                <button id="btn-copy-webrtc-answer" class="btn-copy-token" style="margin-top: 4px;">📋 Copy Answer</button>
              </div>
            `;
            const copyAnsBtn = feedbackMsg.querySelector('#btn-copy-webrtc-answer');
            const ansInput = feedbackMsg.querySelector('#webrtc-answer-val');
            if (copyAnsBtn && ansInput) {
              copyAnsBtn.addEventListener('click', () => {
                ansInput.select();
                navigator.clipboard.writeText(ansInput.value).then(() => {
                  copyAnsBtn.textContent = '✅ Copied!';
                  setTimeout(() => (copyAnsBtn.textContent = '📋 Copy Answer'), 2000);
                });
              });
            }
          } else if (ticket.startsWith('ONE_ANSWER:')) {
            feedbackMsg.innerHTML = '<span style="color: #38bdf8;">Accepting Answer…</span>';
            await this.p2pMesh.acceptAnswerTicket(ticket);
            feedbackMsg.innerHTML = '<span style="color: #10b981; font-weight: bold;">🎉 WebRTC P2P DataChannel Connected!</span>';
            inputRemote.value = '';
          } else {
            feedbackMsg.innerHTML = '<span style="color: #f87171;">⚠️ Ticket must start with ONE_OFFER: or ONE_ANSWER:</span>';
          }
        } catch (err) {
          console.error('[WebRTC] Handshake error:', err);
          feedbackMsg.innerHTML = `<span style="color: #f87171;">❌ Handshake failed: ${err.message}</span>`;
        } finally {
          acceptRemoteBtn.disabled = false;
        }
      });
    }

    // Bind P2P Sync Now Button
    const syncNowBtn = this.contentEl.querySelector('#btn-p2p-sync-now');
    if (syncNowBtn && this.p2pMesh) {
      syncNowBtn.addEventListener('click', async () => {
        syncNowBtn.disabled = true;
        syncNowBtn.textContent = '📡 Broadcasting Pulse…';
        await this.p2pMesh.broadcastPresence();
        setTimeout(() => {
          syncNowBtn.disabled = false;
          syncNowBtn.textContent = '🔄 Sync Peers Now';
          this.render();
        }, 800);
      });
    }

    // Bind Test Signature Button
    const testSignBtn = this.contentEl.querySelector('#btn-sign-test');
    if (testSignBtn) {
      testSignBtn.addEventListener('click', async () => {
        testSignBtn.disabled = true;
        testSignBtn.textContent = '⏳ Signing with ECDSA Private Key…';

        const testDelta = await CitizenPassportManager.createSignedDelta(
          'TEST_VERIFICATION_PULSE',
          { message: 'Live biometric proof of usufruct', tick: this.sim.tickCount },
          this.activeIdentity,
          this.privateKeyJwk,
          this.sim.tickCount
        );

        await storageIDB.appendEvent(testDelta);
        const isValid = await CitizenPassportManager.verifyAction(
          {
            type: testDelta.type,
            payload: testDelta.payload,
            tick: testDelta.tick,
            authorToken: testDelta.authorToken,
            authorName: testDelta.authorName,
            timestamp: testDelta.timestamp
          },
          testDelta.signature,
          this.activeIdentity.pubKeyHex
        );

        testSignBtn.disabled = false;
        testSignBtn.textContent = isValid ? '✅ Signature Verified Valid!' : '⚠️ Verification Error';
        setTimeout(() => this.render(), 1200);
      });
    }

    // Bind Switch / Import Button
    const switchBtn = this.contentEl.querySelector('#btn-switch-passport');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.renderCreationWizard();
      });
    }

    // Bind Burn Identity / Right to Oblivion Button
    const burnBtn = this.contentEl.querySelector('#btn-burn-identity');
    if (burnBtn) {
      burnBtn.addEventListener('click', async () => {
        const confirmMsg = `⚠️ CONFIRM RIGHT TO OBLIVION & PERMANENT DEPARTURE FROM O.N.E.\n\n` +
          `You are about to permanently destroy your Sovereign Passport (${p.name} - ${p.shortFingerprint}).\n\n` +
          `What will happen:\n` +
          `1. Your private cryptographic keys (ECDSA P-256) will be permanently purged from this device.\n` +
          `2. Your usufruct home will be immediately returned to the civic pool for other citizens.\n` +
          `3. Because O.N.E. has no central servers and collects zero personal data, NO trace of you will remain.\n\n` +
          `Do you really want to burn your identity and leave the simulation?`;

        if (window.confirm(confirmMsg)) {
          burnBtn.disabled = true;
          burnBtn.textContent = '🔥 Purging private keys from device…';

          // Broadcast departure delta to peers if P2P mesh connected
          if (this.p2pMesh && this.privateKeyJwk) {
            try {
              const departureDelta = await CitizenPassportManager.createSignedDelta(
                'CITIZEN_SOVEREIGN_DEPARTURE',
                {
                  id: p.id,
                  name: p.name,
                  reason: 'Right to Oblivion / Voluntary Sovereign Departure'
                },
                p,
                this.privateKeyJwk,
                this.sim.tickCount
              );
              this.p2pMesh.broadcastDelta(departureDelta);
            } catch (err) {
              console.warn('[Passport] Could not broadcast departure delta:', err);
            }
          }

          // Release usufruct dwelling
          PlayerProfileManager.releaseDwelling();

          // Purge from IndexedDB and local storage
          await storageIDB.purgeCitizenIdentity(p.id);

          this.activeIdentity = null;
          this.privateKeyJwk = null;

          // Notify callbacks
          this.updateHudBadge();
          this.onIdentityChanged(null);

          // Re-render onboarding wizard
          this.renderCreationWizard();
        }
      });
    }
  }
}
