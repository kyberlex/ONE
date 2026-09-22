/**
 * Dwelling Inspection & Dynamic Usufruct Claiming Controller (Agent SIM-5 & SIM-0)
 * Allows player to inspect bioclimatic dwellings, read architectural specifications,
 * and claim free usufruct housing according to the O.N.E. Constitution.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { CLIMATE_ZONES } from '../data/bioregions.js';
import { t } from '../i18n/index.js';
import { getVocationById } from '../data/vocations.js';
import { PlayerProfileManager } from '../engine/player_profile.js';

export class PanelDwellingController {
  constructor(
    sim, 
    onDwellingClaimedCallback = () => {}, 
    onDwellingReleasedCallback = () => {},
    onEnterInteriorCallback = () => {},
    onKnockCallback = () => {}
  ) {
    this.sim = sim;
    this.onDwellingClaimed = onDwellingClaimedCallback;
    this.onDwellingReleased = onDwellingReleasedCallback;
    this.onEnterInterior = onEnterInteriorCallback;
    this.onKnock = onKnockCallback;
    this.modalEl = document.getElementById('modal-dwelling');
    this.contentEl = document.getElementById('dwelling-modal-content');
    this.closeBtn = document.getElementById('btn-close-dwelling-modal');
    this.currentDwelling = null;
    this.currentNode = null;

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

  open(dwelling, node) {
    this.currentDwelling = dwelling;
    this.currentNode = node;
    this.render();
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    this.currentDwelling = null;
  }

  render() {
    if (!this.contentEl || !this.currentDwelling) return;

    const d = this.currentDwelling;
    const climate = CLIMATE_ZONES[d.climateKey] || CLIMATE_ZONES.TEMPERATE;
    const isPlayer = d.isPlayerHome;
    const isOccupied = d.isOccupied;

    let occupancyHtml = '';

    if (isPlayer) {
      const playerVocId = this.sim?.node?.playerVocation || 'farmer';
      const playerVoc = getVocationById(playerVocId);
      const playerVocName = playerVoc ? t(playerVoc.nameKey, playerVoc.defaultName) : 'Agro-Ecologist';
      const playerVocIcon = playerVoc ? playerVoc.icon : '🌾';
      const playerMult = playerVoc ? playerVoc.multiplier : 2.0;

      occupancyHtml = `
        <div class="dwelling-status-card player-owned">
          <div class="status-badge-gold">👑 ${t('yourHomeBadge', 'Your Primary Usufruct Home')}</div>
          <p>${t('yourHomeDesc', 'You hold active usufruct over this bioclimatic dwelling. Your personal gear is strictly inviolable under Class-0 constitutional invariants.')}</p>
          <div class="resident-info-grid" style="margin-bottom: 12px;">
            <div><strong>${t('yourVocationLabel', 'Your Vocation:')}</strong> ${playerVocIcon} ${playerVocName}</div>
            <div><strong>${t('laborDuty', 'Social Labor:')}</strong> 4h / day (${playerMult}x ${t('vocationEffortCredit', 'Labor Credit')})</div>
            <div><strong>${t('sabbaticalStatus', 'Sabbatical Protection:')}</strong> <span class="text-green">🔒 ${t('sabbaticalActiveBadge', 'Active (30 Days Protected)')}</span></div>
            <div><strong>${t('inviolableGearTitle', 'Personal Belongings:')}</strong> <span class="text-green">🛡️ 100% Inviolable (Class-0)</span></div>
          </div>
          <div class="dwelling-action-row" style="display: flex; gap: 8px;">
            <button id="btn-enter-dwelling-interior" class="btn-primary" style="flex: 1.3;">
              🚪 Enter Interior View
            </button>
            <button id="btn-release-dwelling" class="btn-secondary" style="flex: 1;">
              🔄 ${t('btnReleaseToPool', 'Release to Civic Pool')}
            </button>
          </div>
        </div>
      `;
    } else if (isOccupied) {
      const occ = d.occupant || {};
      const occRole = occ.roleKey ? t(occ.roleKey, occ.role) : (occ.role || 'Citizen Pioneer');
      const occIcon = occ.icon || '👤';
      const occMult = occ.multiplier ? ` (${occ.multiplier}x)` : '';

      occupancyHtml = `
        <div class="dwelling-status-card occupied">
          <div class="status-badge-blue">👤 ${t('dwellingOccupiedTitle', 'Active Usufruct Resident')}</div>
          <div class="resident-info-grid">
            <div><strong>${t('inhabitantName', 'Inhabitant:')}</strong> ${occ.name || 'Citizen'}</div>
            <div><strong>${t('inhabitantRole', 'Vocation:')}</strong> ${occIcon} ${occRole}${occMult}</div>
            <div><strong>${t('laborDuty', 'Social Labor:')}</strong> ${occ.dailyHours || 4}h / day</div>
            <div><strong>${t('sabbaticalStatus', 'Sabbatical Protection:')}</strong> ${t('sabbaticalActiveBadge', 'Active (Protected)')}</div>
          </div>
          <p class="text-dim-small">${t('occupiedWarning', 'This dwelling is currently in use. Housing cannot be bought or evicted.')}</p>
          <div class="dwelling-action-row" style="margin-top: 12px;">
            <button id="btn-knock-dwelling" class="btn-secondary" style="width: 100%;">
              🚪 Knock on Door (Request Invitation)
            </button>
          </div>
        </div>
      `;
    } else {
      occupancyHtml = `
        <div class="dwelling-status-card vacant">
          <div class="status-badge-green">🔑 ${t('vacantReserveTitle', 'Vacant Civic Reserve Pod')}</div>
          <p>${t('vacantReserveDesc', 'This dwelling is free and immediately available for usufruct. Zero rent, zero mortgage, zero debt.')}</p>
          <div class="dwelling-claim-box" style="display: flex; gap: 8px;">
            <button id="btn-enter-dwelling-interior" class="btn-secondary" style="flex: 1;">
              🔍 Inspect Interior
            </button>
            <button id="btn-claim-dwelling" class="btn-primary btn-claim-glow" style="flex: 1.4;">
              🔑 ${t('btnClaimUsufruct', 'Claim Usufruct Dwelling')}
            </button>
          </div>
        </div>
      `;
    }

    this.contentEl.innerHTML = `
      <div class="dwelling-modal-layout">
        <!-- Left: Bioclimatic Architectural Illustration & Specifications -->
        <div class="dwelling-arch-column">
          <div class="arch-header-badge" style="--accent: ${climate.accentColor};">
            <span class="arch-climate-tag">${climate.name}</span>
            <h4>${d.dwellingType}</h4>
          </div>
          <div class="arch-canvas-box">
            <div class="dwelling-pod-preview ${climate.id.toLowerCase()}">
              <span class="preview-icon">${d.isPlayerHome ? '👑' : (d.isOccupied ? '🏡' : '🌱')}</span>
              <div class="preview-label">${d.dwellingType}</div>
              <div class="preview-unit-num">#${d.number} • ${t('usufructBadge', 'USUFRUCT')}</div>
            </div>
          </div>

          <div class="arch-specs-grid">
            <div class="spec-item">
              <span class="spec-label">🧱 ${t('buildingMaterialLabel', 'Building Material:')}</span>
              <span class="spec-val">${climate.buildingMaterial}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">☀️ ${t('solarEfficiencyLabel', 'Solar Efficiency:')}</span>
              <span class="spec-val">${(climate.solarEfficiencyFactor * 100).toFixed(0)}% capture</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">💧 ${t('waterCatchmentLabel', 'Water System:')}</span>
              <span class="spec-val">${climate.waterCatchmentType}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">🔥 ${t('heatingDemandLabel', 'Thermal Factor:')}</span>
              <span class="spec-val">${climate.heatingDemandFactor}x standard</span>
            </div>
          </div>

          <div class="furniture-box">
            <h5>🛋️ ${t('circularFurnitureTitle', 'Civic Circular Furniture Included:')}</h5>
            <div class="furniture-tags">
              ${d.furnitureSet.map(f => `<span class="tag-furniture">✓ ${f}</span>`).join(' ')}
            </div>
            <span class="text-dim-small">${t('furnitureNote', 'Provided by the local Circular Furniture Swap Shop (Circular Re-use Hub).')}</span>
          </div>
        </div>

        <!-- Right: Usufruct Rights & Action Status -->
        <div class="dwelling-usufruct-column">
          ${occupancyHtml}

          <div class="usufruct-legal-principles">
            <h5>📜 ${t('constitutionalGuaranteesTitle', 'Constitutional Guarantees (AGPL-3.0)')}</h5>
            <ul>
              <li><strong>Zero Speculation:</strong> Property cannot be sold, rented, or securitized.</li>
              <li><strong>Dynamic Usufruct:</strong> As long as you dwell here, it is unconditionally yours.</li>
              <li><strong>Sabbatical Lock:</strong> Travel anywhere on Earth for up to 180 days with locked dwelling.</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Bind Claim Button
    const claimBtn = document.getElementById('btn-claim-dwelling');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        d.isOccupied = true;
        d.isPlayerHome = true;
        const vocId = this.sim.node.playerVocation || 'farmer';
        const voc = getVocationById(vocId);
        d.occupant = {
          name: 'Player (You)',
          vocationId: voc.id,
          role: voc.defaultName,
          roleKey: voc.nameKey,
          icon: voc.icon,
          dailyHours: 4,
          multiplier: voc.multiplier
        };

        this.onDwellingClaimed(d);
        this.render();
      });
    }

    // Bind Release Button
    const releaseBtn = document.getElementById('btn-release-dwelling');
    if (releaseBtn) {
      releaseBtn.addEventListener('click', () => {
        PlayerProfileManager.releaseDwelling();
        d.isOccupied = false;
        d.isPlayerHome = false;
        d.occupant = null;
        this.onDwellingReleased(d);
        this.render();
      });
    }

    // Bind Enter Interior Button
    const enterBtn = document.getElementById('btn-enter-dwelling-interior');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        this.close();
        this.onEnterInterior(d);
      });
    }

    // Bind Knock Door Button
    const knockBtn = document.getElementById('btn-knock-dwelling');
    if (knockBtn) {
      knockBtn.addEventListener('click', () => {
        this.close();
        this.onKnock(d);
      });
    }
  }
}
