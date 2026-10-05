/**
 * O.N.E. Interactive Building & Infrastructure Inspector Modal
 * Allows player to click any physical structure or camper van on the canvas
 * to inspect real-time telemetry and perform direct manual/operational chores.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { soundFX } from '../audio/sound_fx.js';
import { choreBoardModal } from './chore_board_modal.js';
import { eventModal } from './event_modal.js';
import { worldMapModal } from './world_map_modal.js';

export class BuildingInspectorModal {
  constructor() {
    this.overlayEl = null;
    this.currentBuilding = null;
    this.ensureDom();
  }

  ensureDom() {
    let existing = document.getElementById('building-inspector-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'building-inspector-modal-overlay';
      existing.className = 'modal-overlay hidden';
      document.body.appendChild(existing);
    }
    this.overlayEl = existing;

    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlayEl.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  close() {
    soundFX.playClick();
    this.overlayEl.classList.remove('active');
    this.overlayEl.classList.add('hidden');
    this.currentBuilding = null;
  }

  open(building) {
    if (!building) return;
    this.currentBuilding = building;
    this.render();
    this.overlayEl.classList.remove('hidden');
    this.overlayEl.classList.add('active');
  }

  render() {
    const b = this.currentBuilding;
    if (!b) return;

    const data = gameState.data;
    const remainingH = data.chores?.remainingHours !== undefined ? data.chores.remainingHours : 6.0;
    const debt = data.debtUsd !== undefined ? data.debtUsd : 12000;

    let icon = '🏗️';
    let title = b.name || 'Commons Structure';
    let subtitle = 'Physical Infrastructure';
    let metricsHtml = '';
    let actionsHtml = '';

    if (b.type === 'camper_van') {
      icon = '🚐';
      title = 'Pioneer Haven (Camper Van)';
      subtitle = 'Founding Base & Auxiliary Mobile Haven';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">AGM BATTERY BANK</span>
            <span class="metric-value text-gold">${data.resources.energyStoredKwh.toFixed(1)} / ${data.resources.energyCapacityKwh} kWh</span>
            <span class="metric-sub">Charged by solar array</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">FRESH WATER TANK</span>
            <span class="metric-value text-cyan">${data.resources.waterLiters.toLocaleString()} / ${data.resources.waterCapacityL.toLocaleString()} L</span>
            <span class="metric-sub">Van onboard tanks</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">DAILY LABOR REMAINING</span>
            <span class="metric-value text-emerald">${remainingH.toFixed(1)} / ${(data.chores?.dailyPoolHours || 6).toFixed(1)} h</span>
            <span class="metric-sub">Pioneer work shifts</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">BANK LAND LOAN</span>
            <span class="metric-value ${debt <= 0 ? 'text-emerald' : 'text-rose'}">$${debt.toLocaleString()}</span>
            <span class="metric-sub">${debt <= 0 ? 'Paid off completely!' : 'Owed to the bank'}</span>
          </div>
        </div>
        <div class="inspector-pioneers-box">
          <span class="pioneers-title">👥 The 3 Founding Pioneers Resting Here:</span>
          <div class="pioneers-row">
            <span class="pioneer-chip">⚡ <strong>${data.player.name}</strong> (${data.player.roleTitle})</span>
            ${(data.companions || []).map(c => `
              <span class="pioneer-chip">${c.icon} <strong>${c.name}</strong> (${c.roleTitle})</span>
            `).join('')}
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">⚡ Available Pioneer Actions Today:</h4>
          ${debt > 0 ? `
            ${remainingH < 2.0 ? `
              <div class="inspector-labor-notice">
                <span>🌙 <strong>Daily pioneer labor exhausted (${remainingH.toFixed(1)}h remaining).</strong> Click <strong>Rest to Dawn</strong> (🌙 in bottom dock) to advance to tomorrow and restore labor!</span>
              </div>
            ` : ''}
            <button type="button" class="btn-inspector-action btn-action-consult" id="btn-inspect-consult-2h" ${remainingH < 2.0 ? 'disabled' : ''}>
              <span>💼 Do Online Tech Job (Fix Flow Sensors)</span>
              <small>Spend 2.0h laptop work • Pay -$300 off bank loan</small>
            </button>
            <button type="button" class="btn-inspector-action btn-action-consult" id="btn-inspect-consult-4h" ${remainingH < 4.0 ? 'disabled' : ''}>
              <span>💼 Do Big Online Tech Job (Tune 3D Printers)</span>
              <small>Spend 4.0h laptop work • Pay -$600 off bank loan</small>
            </button>
          ` : `
            <div class="inspector-victory-note">
              🏆 <strong>Debt Free!</strong> The land is 100% yours. Total commons sovereignty achieved!
            </div>
          `}
          <button type="button" class="btn-inspector-action" id="btn-inspect-chore-board">
            <span>📋 View Daily Chores & Robot Helpers</span>
            <small>See how smart machines replace daily manual work</small>
          </button>
        </div>
      `;
    } else if (b.type === 'garden_bed') {
      icon = '🥗';
      title = 'Permaculture Garden Bed';
      subtitle = 'Bio-Intensive Raised Timber Bed';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">DAILY HARVEST</span>
            <span class="metric-value text-emerald">+2,200 kcal / day</span>
            <span class="metric-sub">Fresh greens every dawn</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">ACTIVE CROPS</span>
            <span class="metric-value">Kale, Carrots & Tomatoes</span>
            <span class="metric-sub">Organic composted topsoil</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🌱 Garden Operations:</h4>
          <button type="button" class="btn-inspector-action btn-action-harvest" id="btn-inspect-forage" ${remainingH < 1.0 ? 'disabled' : ''}>
            <span>🌾 Tend Crops & Harvest Fresh Greens</span>
            <small>Spend 1.0h labor • Harvest +3,000 kcal immediately</small>
          </button>
        </div>
      `;
    } else if (b.type === 'rain_cistern') {
      icon = '💧';
      title = 'Rainwater Cistern (1,000 L)';
      subtitle = 'Food-Grade Polyethylene Catchment & Filter';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">WATER STORED</span>
            <span class="metric-value text-cyan">${data.resources.waterLiters.toLocaleString()} / ${data.resources.waterCapacityL.toLocaleString()} L</span>
            <span class="metric-sub">Gravity-fed domestic reserve</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">FILTER STATUS</span>
            <span class="metric-value text-emerald">100% Pure Clean</span>
            <span class="metric-sub">Dual 50-micron sediment mesh</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action" id="btn-inspect-test-filter">
            <span>🔧 Check Inlet Gutter & Spigots</span>
            <small>Inspect mechanical integrity & brass spigots</small>
          </button>
        </div>
      `;
    } else if (b.type === 'solar_array') {
      icon = '⚡';
      title = 'Bifacial Solar Array (1.5 kW)';
      subtitle = 'Dual-Glass Photovoltaic Off-Grid Rack';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">PEAK GENERATION</span>
            <span class="metric-value text-gold">1.5 kW Bifacial</span>
            <span class="metric-sub">100% off-grid clean energy</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">SYSTEM VOLTAGE</span>
            <span class="metric-value text-emerald">12V DC / 230V AC</span>
            <span class="metric-sub">Micro-inverter synchronized</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action" id="btn-inspect-test-solar">
            <span>⚡ Run Microgrid Inverter Diagnostics</span>
            <small>Inspect string voltage & battery charge rate</small>
          </button>
        </div>
      `;
    } else if (b.type === 'lora_mast') {
      icon = '📡';
      title = 'LoRa Radio Mast (Reticulum Mesh)';
      subtitle = 'Off-Grid Decentralized Telemetry Relay';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">MESH LINK</span>
            <span class="metric-value text-emerald">Active & Synced</span>
            <span class="metric-sub">Planetary Reticulum node</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">WEATHER RADAR</span>
            <span class="metric-value text-cyan">48h Advance Early Warning</span>
            <span class="metric-sub">High-altitude barometric telemetry</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action" id="btn-inspect-open-mesh">
            <span>🌍 Open Reticulum Planetary Mesh Map</span>
            <small>Inspect federated sister havens & trade routes</small>
          </button>
        </div>
      `;
    } else if (b.type === 'guest_dome') {
      icon = '🏨';
      title = 'Geodesic Guest Pavilion';
      subtitle = 'Civic Modular Habitat • 4 Beds';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">ACCOMMODATION CAPACITY</span>
            <span class="metric-value text-gold">4 Pioneer Berths</span>
            <span class="metric-sub">Ready to receive travelers</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">INCOMING TRAVELERS</span>
            <span class="metric-value text-emerald">Nico arrives on Day 6</span>
            <span class="metric-sub">IoT & Telemetry Engineer</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action" id="btn-inspect-test-guest">
            <span>🛏️ Inspect Guest Pavilion & Linens</span>
            <small>Verify clean solar lanterns and ventilation</small>
          </button>
        </div>
      `;
    } else if (b.type === 'reed_bed') {
      icon = '🌿';
      title = 'Biological Greywater Reed Bed';
      subtitle = 'Subsurface Gravel Filtration Matrix';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">RECYCLING EFFICIENCY</span>
            <span class="metric-value text-cyan">65% Recycled</span>
            <span class="metric-sub">Drastically cuts daily water consumption</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">BIOMASS HEALTH</span>
            <span class="metric-value text-emerald">Phragmites Australis</span>
            <span class="metric-sub">Thriving root microbiology</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action" id="btn-inspect-test-reed">
            <span>💧 Test Discharge Water Purity</span>
            <small>Verify biological nitrogen & phosphate uptake</small>
          </button>
        </div>
      `;
    } else if (b.type === 'agora') {
      icon = '🏛️';
      title = 'Agora Socratic Amphitheater';
      subtitle = 'Civic Hemicycle • Demarchic Assembly';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">GOVERNANCE MODE</span>
            <span class="metric-value text-emerald">Sortition Demarchy</span>
            <span class="metric-sub">Pure lot, zero career politicians</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">CONSENSUS THRESHOLD</span>
            <span class="metric-value text-gold">75% Supermajority</span>
            <span class="metric-sub">Odd-parity citizen juries</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action btn-action-agora" id="btn-inspect-open-demarchy">
            <span>🗳️ Convene Sortition Assembly (Civic Dilemma)</span>
            <small>Draw 5 citizens by lot to deliberate and vote on ethical dilemmas</small>
          </button>
        </div>
      `;
    } else if (b.type === 'aquaponics_greenhouse') {
      icon = '🥬';
      title = 'Closed-Loop Aquaponics Dome';
      subtitle = 'Agro Commons Belt • High-Density Bio-Intensive Food';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">DAILY HARVEST</span>
            <span class="metric-value text-emerald">+6,000 kcal/day</span>
            <span class="metric-sub">Tilapia aquaculture & aeroponics</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">WATER RECIRCULATION</span>
            <span class="metric-value text-cyan">98.5% Closed-Loop</span>
            <span class="metric-sub">Nitrifying bio-filter bed</span>
          </div>
        </div>
      `;
    } else if (b.type === 'grain_silo') {
      icon = '🌾';
      title = 'Galvanized Grain Silo';
      subtitle = 'Agro Commons Belt • Dry Staple Food Reserves';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">STORAGE CAPACITY</span>
            <span class="metric-value text-gold">+30,000 kcal</span>
            <span class="metric-sub">Ancient grains & pulses</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">SEAL INTEGRITY</span>
            <span class="metric-value text-emerald">Hermetic N₂</span>
            <span class="metric-sub">Zero-chemical pest protection</span>
          </div>
        </div>
      `;
    } else if (b.type === 'heavy_gantry_mill') {
      icon = '⚙️';
      title = 'Heavy 5-Axis Gantry Mill';
      subtitle = 'FabLab Quarter • Structural Machining & Beam Milling';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">TOOLING CAPACITY</span>
            <span class="metric-value text-cyan">5-Axis CNC Spindle</span>
            <span class="metric-sub">Recycled aluminum & timber billets</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">REPEATABILITY</span>
            <span class="metric-value text-emerald">±0.02 mm</span>
            <span class="metric-sub">Laser-calibrated linear rails</span>
          </div>
        </div>
      `;
    } else if (b.type === 'solar_foundry') {
      icon = '🔥';
      title = 'Solar Induction Foundry';
      subtitle = 'FabLab Quarter • Closed-Loop Metal Smelting';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">CRUCIBLE TEMP</span>
            <span class="metric-value text-gold">1,450°C</span>
            <span class="metric-sub">Direct heliostat & induction coil</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">OUTPUT ALLOY</span>
            <span class="metric-value text-emerald">Solar-Bronze / Al-Si</span>
            <span class="metric-sub">100% scrap feedstock circularity</span>
          </div>
        </div>
      `;
    } else if (b.type === 'trike_depot') {
      icon = '🚲';
      title = 'Cargo Trike Depot';
      subtitle = 'Transit Vertiport • Zero-Emission Freight Logistics';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">FLEET STATUS</span>
            <span class="metric-value text-emerald">4 Active Cargo Trikes</span>
            <span class="metric-sub">250 kg freight box per trike</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">SOLAR CHARGING</span>
            <span class="metric-value text-gold">1.2 kW Canopy</span>
            <span class="metric-sub">48V LFP modular swappable packs</span>
          </div>
        </div>
      `;
    } else if (b.type === 'drone_vertiport') {
      icon = '🚁';
      title = 'Autonomous Drone Vertiport';
      subtitle = 'Transit Vertiport • Regional Aerial Mesh & Logistics';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">MAX PAYLOAD</span>
            <span class="metric-value text-cyan">25 kg VTOL</span>
            <span class="metric-sub">Emergency medical & seed drops</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">MESH COVERAGE</span>
            <span class="metric-value text-emerald">45 km Bioregion</span>
            <span class="metric-sub">Relay hops across Reticulum nodes</span>
          </div>
        </div>
      `;
    } else if (b.type === 'central_agora') {
      icon = '🏛️';
      title = 'Central Agora & Pioneer Fire Hearth';
      subtitle = 'Civic Demarchy Assembly • Sacred Common Hearth';
      const juries = data.demarchyJuriesCount || 0;
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">ASSEMBLY STATUS</span>
            <span class="metric-value text-gold">Ready for Sortition</span>
            <span class="metric-sub">5-Juror Demarchic Council</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">DELIBERATIONS HELD</span>
            <span class="metric-value text-emerald">${juries} Decisions</span>
            <span class="metric-sub">75% Supermajority Rule</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">COMMUNITY MORALE</span>
            <span class="metric-value text-cyan">${data.morale || 100}%</span>
            <span class="metric-sub">Civic cohesion boost active</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">SACRED HEARTH</span>
            <span class="metric-value text-rose">Perpetual Flame</span>
            <span class="metric-sub">Consecrated Day ${b.consecratedDay || 1}</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🏛️ Demarchy & Civic Hearth Operations:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-open-demarchy">
            <span>🗳️ Convene Demarchy Sortition Assembly</span>
            <small>Draw 5 jurors by lot to deliberate on civic policy</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-agora-gathering">
            <span>🔥 Stoke Pioneer Fire & Strum Guitars</span>
            <small>Gather pioneers around embers • Restore 100% Morale</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-mitosis-hub">
            <span>🧬 Dunbar Horizon & Cellular Mitosis</span>
            <small>Inspect carrying capacity & Sister Node 02 expedition</small>
          </button>
        </div>
      `;
    } else if (b.type === 'mhu_dwelling') {
      icon = '🏡';
      title = b.name || 'Modular Habitat Unit (MHU)';
      subtitle = 'Cross-Laminated Timber (CLT) Bio-Dwelling';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">SHELTER CAPACITY</span>
            <span class="metric-value text-emerald">3 Pioneers</span>
            <span class="metric-sub">Permanent timber bedroom pods</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">SEDUM LIVING ROOF</span>
            <span class="metric-value text-cyan">100% Thermal Cover</span>
            <span class="metric-sub">Passive microclimate regulation</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">GREYWATER LOOP</span>
            <span class="metric-value text-gold">Direct to Reeds</span>
            <span class="metric-sub">Zero potable water wasted</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">STRUCTURAL LIFE</span>
            <span class="metric-value text-emerald">100 Years</span>
            <span class="metric-sub">CO2 negative timber build</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🏡 Dwelling Comfort & Maintenance:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-tend-sedum">
            <span>🌿 Inspect Sedum Living Roof & Air Drafts</span>
            <small>Verify natural ventilation & succulent hydration</small>
          </button>
        </div>
      `;
    } else {
      metricsHtml = `
        <div class="inspector-metric-card">
          <span class="metric-label">STATUS</span>
          <span class="metric-value text-emerald">Operational</span>
          <span class="metric-sub">100% Commons Usufruct</span>
        </div>
      `;
    }

    this.overlayEl.innerHTML = `
      <div class="modal-window inspector-modal-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">${icon}</span>
            <div>
              <h2 class="modal-title">${title}</h2>
              <span class="modal-subtitle">${subtitle}</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-inspector-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="inspector-modal-body">
          ${metricsHtml}
          ${actionsHtml}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-inspector-done">${b.type === 'camper_van' ? 'Return to Haven' : 'Back to Settlement'}</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.overlayEl.querySelector('#btn-inspector-close')?.addEventListener('click', () => this.close());
    this.overlayEl.querySelector('#btn-inspector-done')?.addEventListener('click', () => this.close());

    // Consulting orders from camper van
    this.overlayEl.querySelector('#btn-inspect-consult-2h')?.addEventListener('click', () => {
      const res = gameState.performConsulting(2.0);
      if (res.ok) {
        soundFX.playClick();
        if (res.remainingDebt <= 0) {
          soundFX.playChoreExtinctionFanfare();
        }
        this.render();
      }
    });

    this.overlayEl.querySelector('#btn-inspect-consult-4h')?.addEventListener('click', () => {
      const res = gameState.performConsulting(4.0);
      if (res.ok) {
        soundFX.playClick();
        if (res.remainingDebt <= 0) {
          soundFX.playChoreExtinctionFanfare();
        }
        this.render();
      }
    });

    // Open chore board
    this.overlayEl.querySelector('#btn-inspect-chore-board')?.addEventListener('click', () => {
      this.close();
      choreBoardModal.open();
    });

    // Tend garden bed
    this.overlayEl.querySelector('#btn-inspect-forage')?.addEventListener('click', () => {
      const res = gameState.forageWildGreens();
      if (res.ok) {
        soundFX.playClick();
        soundFX.playChoreExtinctionFanfare();
        this.render();
      }
    });

    // Open mesh map
    this.overlayEl.querySelector('#btn-inspect-open-mesh')?.addEventListener('click', () => {
      this.close();
      worldMapModal.open();
    });

    // Convene Demarchy Sortition Assembly from Agora
    this.overlayEl.querySelector('#btn-inspect-open-demarchy')?.addEventListener('click', () => {
      this.close();
      eventModal.open('demarchy_dilemma');
    });

    // Diagnostics feedback
    const addDiag = (btnId, msg) => {
      const btn = this.overlayEl.querySelector(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          soundFX.playClick();
          btn.innerHTML = `<span>✅ ${msg}</span><small>All systems 100% nominal</small>`;
          btn.style.borderColor = '#10b981';
        });
      }
    };

    addDiag('#btn-inspect-test-filter', 'Filters 100% Clean');
    addDiag('#btn-inspect-test-solar', 'Microgrid Synchronized (1.5 kW)');
    addDiag('#btn-inspect-test-guest', 'Guest Pavilion Prepared');
    addDiag('#btn-inspect-test-reed', 'Water Purity Optimal');
    addDiag('#btn-inspect-tend-sedum', 'Living Roof Thriving');

    this.overlayEl.querySelector('#btn-inspect-agora-gathering')?.addEventListener('click', () => {
      soundFX.playAcousticStrum();
      soundFX.playChoreExtinctionFanfare();
      gameState.data.morale = 100;
      gameState.save();
      this.render();
    });

    this.overlayEl.querySelector('#btn-inspect-mitosis-hub')?.addEventListener('click', () => {
      this.close();
      worldMapModal.open('nodes');
    });
  }
}

export const buildingInspector = new BuildingInspectorModal();
