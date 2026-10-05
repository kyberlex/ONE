/**
 * O.N.E. Morning Dispatch & Overnight Life Support Modal
 * Grounded in canonical O.N.E. circadian rhythm and biophysical balance.
 * Renders on each dawn transition to report overnight thermodynamic consumption,
 * solar recharge, weather forecasts, and primary mission objectives.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { soundFX } from '../audio/sound_fx.js';
import { eventModal } from './event_modal.js';

export class MorningDispatchModal {
  constructor() {
    this.overlayEl = null;
    this.onDismiss = null;
    this.ensureDom();
  }

  ensureDom() {
    let existing = document.getElementById('morning-dispatch-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'morning-dispatch-modal-overlay';
      existing.className = 'modal-overlay hidden';
      document.body.appendChild(existing);
    }
    this.overlayEl = existing;
  }

  open(report = {}, onDismiss = null) {
    this.onDismiss = onDismiss;
    const player = gameState.data.player || { name: 'Alex' };
    const day = report.day || gameState.data.day || 2;
    const season = report.season || gameState.getSeason();
    const weather = report.weather || { tempC: 22, sky: 'Crisp Clear Dawn', icon: '☀️', solarIrradiance: '100%' };
    const objective = report.objective || gameState.data.objective || { title: 'Maintain Settlement', description: 'Survive in comfort.', reward: 'Stability' };

    const foodRemaining = report.foodRemaining !== undefined ? report.foodRemaining : gameState.data.resources.foodKcal;
    const waterRemaining = report.waterRemaining !== undefined ? report.waterRemaining : gameState.data.resources.waterLiters;
    const energyStored = report.energyStored !== undefined ? report.energyStored : gameState.data.resources.energyStoredKwh;
    const energyCapacity = report.energyCapacity !== undefined ? report.energyCapacity : gameState.data.resources.energyCapacityKwh;

    const daysOfFood = (foodRemaining / 6600).toFixed(1);

    // Alert Banner
    let alertBannerHtml = '';
    if (report.isDehydrated || waterRemaining <= 0) {
      alertBannerHtml = `
        <div class="dispatch-alert-banner alert-critical">
          <span class="alert-icon">🚨</span>
          <div class="alert-info">
            <strong>CRITICAL WATER SHORTAGE — POTABLE WATER AT 0 LITERS:</strong>
            <p style="margin: 4px 0 8px 0; font-size: 12px; color: #fecaca; line-height: 1.4;">
              Settlement cisterns are dry! Pioneers cannot hydrate and crops cannot be watered.
              Work for legacy to order an emergency bulk tanker ($150 / 2h CAD consulting), hand-pump groundwater, or deploy dew nets.
            </p>
            <div class="dispatch-emergency-actions">
              <button type="button" class="btn-emergency-food" id="btn-open-water-desk" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                💧 Open Emergency Water Relief Desk
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (report.isStarving || foodRemaining <= 0) {
      alertBannerHtml = `
        <div class="dispatch-alert-banner alert-critical">
          <span class="alert-icon">🚨</span>
          <div class="alert-info">
            <strong>CRITICAL FOOD EMERGENCY — PIONEERS NEED CALORIES:</strong>
            <p style="margin: 4px 0 8px 0; font-size: 12px; color: #fecaca; line-height: 1.4;">
              Rations are depleted! Click below to unseal dry rations from the camper van emergency pantry, or forage wild dandelion & berries to keep pioneers fed today.
            </p>
            <div class="dispatch-emergency-actions">
              <button type="button" class="btn-emergency-food" id="btn-unseal-cache">
                🍚 Unseal Camper Van Emergency Pantry (+25,000 kcal)
              </button>
              <button type="button" class="btn-emergency-food" id="btn-forage-greens">
                🌿 Forage Wild Roots & Berries (+3,000 kcal • 1h Labor)
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (report.isLowFood || foodRemaining < 13200) {
      alertBannerHtml = `
        <div class="dispatch-alert-banner alert-warning">
          <span class="alert-icon">⚠️</span>
          <div class="alert-info">
            <strong>FOOD RESERVES LOW:</strong> Only ${daysOfFood} days of dry rations remaining. Place Permaculture Beds on your plot to produce +2,200 kcal/day fresh harvest!
            <div class="dispatch-emergency-actions" style="margin-top: 6px;">
              <button type="button" class="btn-emergency-food" id="btn-unseal-cache">
                🍚 Unseal Camper Van Emergency Pantry (+25,000 kcal)
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      alertBannerHtml = `
        <div class="dispatch-alert-banner alert-good">
          <span class="alert-icon">✅</span>
          <div class="alert-info">
            <strong>OVERNIGHT BIOPHYSICAL BALANCE:</strong> Camp life-support systems operational. 3 pioneers well-rested.
          </div>
        </div>
      `;
    }

    // Inter-Node Cargo Convoy Arrivals & Sabbaticals
    let convoysHtml = '';
    if (report.convoysArrived && report.convoysArrived.length > 0) {
      convoysHtml = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">📦</span>
            <strong style="color: #6ee7b7; font-size: 13px;">INTER-NODE CARGO CONVOY ARRIVAL:</strong>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${report.convoysArrived.map(c => `
              <div style="font-size: 12px; color: #f8fafc; background: rgba(0, 0, 0, 0.25); padding: 6px 10px; border-radius: 6px;">
                <strong>${c.vehicle}</strong> returned safely from <strong>${c.nodeName}</strong>!
                <div style="color: #34d399; font-weight: 700; margin-top: 2px;">➔ Delivered: ${c.deliveredGoods}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let sabbaticalsHtml = '';
    if (report.sabbaticalsReturned && report.sabbaticalsReturned.length > 0) {
      sabbaticalsHtml = `
        <div style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🎓</span>
            <strong style="color: #fde047; font-size: 13px;">PIONEER SABBATICAL RETURN (ART. 4.2):</strong>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${report.sabbaticalsReturned.map(s => `
              <div style="font-size: 12px; color: #f8fafc; background: rgba(0, 0, 0, 0.25); padding: 6px 10px; border-radius: 6px;">
                <strong>${s.pioneerName}</strong> has returned home from <strong>${s.nodeName}</strong>!
                <div style="color: #fbbf24; font-weight: 700; margin-top: 2px;">➔ Mastery Perk Earned: ${s.perkName}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.overlayEl.innerHTML = `
      <div class="modal-window morning-dispatch-window">
        <div class="modal-header dispatch-header">
          <div class="modal-title-row">
            <span class="modal-badge-gold">🌅 ${season.icon} ${season.name.toUpperCase()} (D${season.dayOfSeason}/7 • Y${season.year})</span>
            <h3>DAY ${day} DAWN REPORT</h3>
          </div>
          <span class="dispatch-tag">${season.name} • 06:00 Dawn</span>
        </div>

        <div class="modal-body dispatch-modal-body">
          ${convoysHtml}
          ${sabbaticalsHtml}
          ${alertBannerHtml}

          <!-- 3-Column Stock & Flow Audit -->
          <div class="dispatch-audit-grid">
            <!-- 🥗 Food -->
            <div class="audit-card">
              <div class="audit-card-top">
                <span class="audit-icon">🥗</span>
                <span class="audit-title">Food Balance</span>
              </div>
              <div class="audit-flow ${(report.netFood || 0) >= 0 ? 'flow-recharged' : 'flow-consumed'}">
                ${(report.foodGenerated || 0) > 0 ? `+${report.foodGenerated.toLocaleString()} / -${(report.foodConsumed || 6600).toLocaleString()} kcal` : `-${(report.foodConsumed || 6600).toLocaleString()} kcal`}
              </div>
              <div class="audit-stock" id="dispatch-food-stock">${Math.round(foodRemaining).toLocaleString()} kcal</div>
              <div class="audit-sub">${(report.foodGenerated || 0) > 0 ? `Harvest: +${report.foodGenerated.toLocaleString()} kcal/day (${Math.round((report.cropGrowthMult || 1.0) * 100)}% ${season.name})` : `~${daysOfFood} days dry reserve`}</div>
            </div>

            <!-- 💧 Water -->
            <div class="audit-card">
              <div class="audit-card-top">
                <span class="audit-icon">💧</span>
                <span class="audit-title">Clean Water</span>
              </div>
              <div class="audit-flow ${(report.totalWaterHarvested || 0) > 0 ? 'flow-recharged' : 'flow-consumed'}">
                ${(report.totalWaterHarvested || 0) > 0 ? `+${report.totalWaterHarvested} L (Rain/Well)` : `-${report.waterConsumed || 150} L`}
              </div>
              <div class="audit-stock">${Math.round(waterRemaining).toLocaleString()} / ${report.waterCapacityL || gameState.data.resources.waterCapacityL} L</div>
              <div class="audit-sub">${(report.totalWaterHarvested || 0) > 0 ? `+${report.totalWaterHarvested} L harvested` : 'Draw: -' + (report.waterConsumed || 150) + ' L'}${ (report.evaporationLossL || 0) > 0 ? ` • Evap: -${report.evaporationLossL} L` : ''}</div>
            </div>

            <!-- ⚡ Solar & Battery -->
            <div class="audit-card">
              <div class="audit-card-top">
                <span class="audit-icon">⚡</span>
                <span class="audit-title">Solar & Microgrid</span>
              </div>
              <div class="audit-flow flow-recharged">+${report.solarGenerated || 0} kWh</div>
              <div class="audit-stock">${Math.round(energyStored)} / ${energyCapacity} kWh</div>
              <div class="audit-sub">${(report.heatingLoadKwh || 0) > 0 ? `Heating: -${report.heatingLoadKwh} kWh • Buffer` : 'Morning battery buffer'}</div>
            </div>
          </div>

          <!-- Weather & Pioneer Status Row -->
          <div class="dispatch-meta-grid">
            <div class="dispatch-meta-card">
              <div class="meta-card-header">
                <span class="meta-icon">${weather.icon}</span>
                <span class="meta-title">Morning Forecast: ${weather.sky}</span>
              </div>
              <div class="meta-detail-row">
                <span>Temperature: <strong>${weather.tempC}°C</strong></span>
                <span>Solar Irradiance: <strong style="color: #fbbf24;">${weather.solarIrradiance}</strong></span>
              </div>
              <div class="meta-detail-row" style="margin-top: 4px; font-size: 11px; color: #94a3b8;">
                <span>Season: <strong>${season.icon} ${season.name} (Year ${season.year})</strong></span>
                <span>Agro Yield: <strong style="color: #34d399;">${Math.round((report.cropGrowthMult || 1.0) * 100)}%</strong></span>
              </div>
            </div>

            <div class="dispatch-meta-card">
              <div class="meta-card-header">
                <span class="meta-icon">⏳</span>
                <span class="meta-title">Pioneer Labor: Restored to 6.0h</span>
              </div>
              <div class="meta-detail-row">
                <span>Active Crew: <strong>${player.name} & 2 Companions</strong></span>
                <span>Morale: <strong style="color: #34d399;">100% Ready</strong></span>
              </div>
            </div>
          </div>

          <!-- Primary Objective Focus Card -->
          <div class="dispatch-objective-card">
            <div class="dispatch-objective-header">
              <span class="objective-badge-gold">★ TODAY'S STRATEGIC OBJECTIVE</span>
              <span class="objective-step-tag">STEP ${day} OF 5</span>
            </div>
            <h4 class="dispatch-objective-title">${objective.title}</h4>
            <p class="dispatch-objective-desc">${objective.description}</p>
            <div class="dispatch-objective-reward">
              <span>🎁 Reward on completion: <strong>${objective.reward}</strong></span>
            </div>
          </div>

          <!-- Bottom Action Button -->
          <div class="dispatch-action-row">
            <button type="button" class="btn-greet-dawn" id="btn-greet-dawn">
              <span>🌅 Greet Day ${day} Dawn</span>
            </button>
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
    }, 500);

    const btn = this.overlayEl.querySelector('#btn-greet-dawn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.canDismiss) return;
        this.close();
      });
    }

    const waterDeskBtn = this.overlayEl.querySelector('#btn-open-water-desk');
    if (waterDeskBtn) {
      waterDeskBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
        eventModal.open('water_management', { isEmergency: true });
      });
    }

    const unsealBtn = this.overlayEl.querySelector('#btn-unseal-cache');
    if (unsealBtn) {
      unsealBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = gameState.unsealEmergencyPantry();
        if (res.ok) {
          soundFX.playChoreExtinctionFanfare();
          unsealBtn.textContent = '✅ Emergency Pantry Unsealed (+25,000 kcal)!';
          unsealBtn.disabled = true;
          const stockEl = this.overlayEl.querySelector('#dispatch-food-stock');
          if (stockEl) stockEl.textContent = `${Math.round(gameState.data.resources.foodKcal).toLocaleString()} kcal`;
          const alertEl = this.overlayEl.querySelector('.dispatch-alert-banner');
          if (alertEl) {
            alertEl.className = 'dispatch-alert-banner alert-good';
            alertEl.innerHTML = `<span class="alert-icon">✅</span><div class="alert-info"><strong>RATIONS UNSEALED:</strong> Camper van dry beans & oats unsealed (+25,000 kcal)! Place Permaculture Beds on your plot to produce +2,200 kcal/day fresh harvest.</div>`;
          }
        } else {
          unsealBtn.textContent = `⚠️ ${res.reason}`;
        }
      });
    }

    const forageBtn = this.overlayEl.querySelector('#btn-forage-greens');
    if (forageBtn) {
      forageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = gameState.forageWildGreens();
        if (res.ok) {
          soundFX.playClick();
          forageBtn.textContent = '✅ Wild Greens Foraged (+3,000 kcal)!';
          forageBtn.disabled = true;
          const stockEl = this.overlayEl.querySelector('#dispatch-food-stock');
          if (stockEl) stockEl.textContent = `${Math.round(gameState.data.resources.foodKcal).toLocaleString()} kcal`;
        } else {
          forageBtn.textContent = `⚠️ ${res.reason}`;
        }
      });
    }

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
    if (typeof this.onDismiss === 'function') {
      this.onDismiss();
      this.onDismiss = null;
    }
  }
}

export const morningDispatchModal = new MorningDispatchModal();
