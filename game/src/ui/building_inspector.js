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
import { logisticsModal } from './logistics_modal.js';
import { blueprintExportModal } from './blueprint_export_modal.js';

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
            <span class="metric-sub">Covered tank: 0% evaporation loss</span>
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
    } else if (b.type === 'retention_swale') {
      icon = '🌿';
      title = 'Perennial Retention Swale (15 m²)';
      subtitle = 'Keyline Earthwork & Infiltration Swale';
      const weather = data.weather || { tempC: 22 };
      const season = gameState.getSeason();
      const tempDelta = Math.max(0, weather.tempC - 15);
      const estLoss = Math.round(15 * tempDelta * (season.evapCoeff || 0.08));
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">RUNOFF BASIN</span>
            <span class="metric-value text-cyan">60 L/mm Rain</span>
            <span class="metric-sub">15 m² natural percolation basin</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">EVAPORATION RATE</span>
            <span class="metric-value text-gold">~${estLoss} L/day</span>
            <span class="metric-sub">Open water surface at ${weather.tempC}°C</span>
          </div>
        </div>
      `;

      actionsHtml = `
        <div class="inspector-actions-box">
          <button type="button" class="btn-inspector-action" id="btn-inspect-clear-swale">
            <span>🌿 Clear Bio-Filter Silt</span>
            <small>Rake organic mulch and inspect overflow berm</small>
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
      title = 'Electric Cargo Trike Depot';
      subtitle = 'Transit Hub • Zero-Emission Freight Logistics & Greenways';
      const trikes = (gameState.getFleet ? gameState.getFleet('cargo_trike') : []) || [];
      const totalTrikes = trikes.length || 1;
      const dockedTrikes = trikes.filter(v => v.status === 'docked').length;
      const avgSoc = totalTrikes > 0
        ? Math.round(trikes.reduce((acc, v) => acc + (v.batterySocPct !== undefined ? v.batterySocPct : 100), 0) / totalTrikes)
        : 100;
      const totalPayload = totalTrikes * 250;

      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">OVERLAND FLEET</span>
            <span class="metric-value text-emerald">${dockedTrikes} / ${totalTrikes} Ready</span>
            <span class="metric-sub">${totalPayload} kg total freight capacity</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">RANGE & EFFICIENCY</span>
            <span class="metric-value text-gold">60 km Range</span>
            <span class="metric-sub">1.5 kWh / 100 km (Overland Corridors)</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">BATTERY STORAGE</span>
            <span class="metric-value text-cyan">48V LFP Packs</span>
            <span class="metric-sub">${avgSoc}% Average State of Charge (SOC)</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">GREENWAY CORRIDORS</span>
            <span class="metric-value text-emerald">Active Mesh Trails</span>
            <span class="metric-sub">Overland greenways & regional bike paths</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🚲 Depot & Fleet Operations:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-trike-logistics-desk" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(15, 23, 42, 0.6)); border-color: rgba(56, 189, 248, 0.4);">
            <span>📦 Open Regional Logistics Desk</span>
            <small>Configure trade manifests, calculate payload & energy budgets</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-trike-recharge">
            <span>⚡ Recharge Swappable 48V LFP Packs</span>
            <small>Top off docked cargo trikes from solar microgrid</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-trike-commission">
            <span>🚲 Commission Additional Cargo Trike</span>
            <small>Assemble new overland trike (250 kg freight box)</small>
          </button>
        </div>
      `;
    } else if (b.type === 'drone_vertiport') {
      icon = '🚁';
      title = 'Autonomous Courier Vertiport';
      subtitle = 'Transit Hub • Regional Aerial Mesh & Rapid Logistics';
      const drones = (gameState.getFleet ? gameState.getFleet('vtol_drone') : []) || [];
      const totalDrones = drones.length || 1;
      const dockedDrones = drones.filter(v => v.status === 'docked').length;
      const avgSoc = totalDrones > 0
        ? Math.round(drones.reduce((acc, v) => acc + (v.batterySocPct !== undefined ? v.batterySocPct : 100), 0) / totalDrones)
        : 100;

      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">AERIAL COURIER FLEET</span>
            <span class="metric-value text-cyan">${dockedDrones} / ${totalDrones} Docked on Pad</span>
            <span class="metric-sub">Autonomous VTOL quad-rotors</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">PRECISION PAYLOAD</span>
            <span class="metric-value text-emerald">25 kg VTOL Box</span>
            <span class="metric-sub">Rapid medical, seed drops & CNC spares</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">MESH FLIGHT RADIUS</span>
            <span class="metric-value text-gold">45 km Direct LOS</span>
            <span class="metric-sub">Point-to-point over ridges & valleys</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">ENERGY DRAW</span>
            <span class="metric-value text-cyan">0.8 kWh / Sortie</span>
            <span class="metric-sub">${avgSoc}% Flight Battery SOC</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🚁 Vertiport Flight Operations:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-drone-logistics-desk" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(15, 23, 42, 0.6)); border-color: rgba(56, 189, 248, 0.4);">
            <span>📦 Open Regional Logistics Desk</span>
            <small>Configure aerial couriers, precision drops & regional manifests</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-drone-recharge">
            <span>⚡ Rapid Charge Flight Batteries</span>
            <small>Direct high-current recharge on landing pads</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-drone-commission">
            <span>🚁 Assemble New VTOL Cargo Drone</span>
            <small>Commission autonomous 25 kg air courier</small>
          </button>
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
    } else if (b.type === 'mhu_dwelling' || b.type === 'mhu_couple') {
      icon = '🏡';
      title = b.name || 'MHU Couple Pod (Cap 4)';
      subtitle = 'C24 Hybrid Timber Chassis • 24 m² Net Living Area';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">SHELTER CAPACITY</span>
            <span class="metric-value text-emerald">4 Pioneers</span>
            <span class="metric-sub">2 Permanent + 2 Universal Guest Buffer</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">ATTACHED KITCHEN APRON</span>
            <span class="metric-value text-cyan">30 m² Bio-Intensive</span>
            <span class="metric-sub">15 m²/person invariant (+250 kcal/d)</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">HYGROTHERMAL ENVELOPE</span>
            <span class="metric-value text-gold">U = 0.118 W/m²K</span>
            <span class="metric-sub">Passivhaus GUTEX wood-fiber + Intello</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">DYNAMIC USUFRUCT</span>
            <span class="metric-value text-emerald">Active Usufruct</span>
            <span class="metric-sub">Sabbatical Lock Eligible (Art. 4)</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🏡 Dwelling Evolution & Maintenance:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-expand-mhu-family">
            <span>🔨 Bolt-on CNC Family Extension Cassette</span>
            <small>Expand to 6-Person Family Cluster with 60 m² Kitchen Apron</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-forage-apron">
            <span>🥗 Harvest Herbs & Greens from Attached Apron</span>
            <small>Pluck fresh organic basil, spinach & mint (+150 kcal)</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-tend-sedum">
            <span>🌿 Inspect Sedum Living Roof & Air Drafts</span>
            <small>Verify natural ventilation & succulent hydration</small>
          </button>
        </div>
      `;
    } else if (b.type === 'mhu_family') {
      icon = '👨‍👩‍👧‍👦';
      title = b.name || 'MHU Family Cluster (Cap 6)';
      subtitle = 'Multi-Bay Modular Timber Chassis • 54 m² with Central Atrium';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">SHELTER CAPACITY</span>
            <span class="metric-value text-emerald">6 Pioneers</span>
            <span class="metric-sub">4 Permanent + 2 Universal Guest Buffer</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">ATTACHED KITCHEN APRON</span>
            <span class="metric-value text-cyan">60 m² Bio-Intensive</span>
            <span class="metric-sub">15 m²/person invariant (+500 kcal/d)</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">UNIVERSAL ACCESSIBILITY</span>
            <span class="metric-value text-gold">DIN 18040-2 Flush</span>
            <span class="metric-sub">Zero-step entrance ramp & roll-in wet core</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">CENTRAL GLAZED ATRIUM</span>
            <span class="metric-value text-emerald">Passive Solar</span>
            <span class="metric-sub">Clerestory cross-ventilation corridor</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">👨‍👩‍👧‍👦 Family Habitat Care:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-forage-apron">
            <span>🍓 Harvest Strawberries & Kale from Family Yard</span>
            <small>Gather fresh berries from attached permaculture apron (+250 kcal)</small>
          </button>
          <button type="button" class="btn-inspector-action" id="btn-inspect-tend-sedum">
            <span>🌿 Tend Chamomile & Sedum Living Roofs</span>
            <small>Check succulent coverage across dual bedroom wings</small>
          </button>
        </div>
      `;
    } else if (b.type === 'mhu_studio') {
      icon = '📐';
      title = b.name || 'MHU Workshop Loft (Cap 3)';
      subtitle = 'Two-Story Hybrid Chassis • Craft Workshop & Prototyping Laboratory';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">SHELTER CAPACITY</span>
            <span class="metric-value text-emerald">3 Pioneers</span>
            <span class="metric-sub">1 Permanent Resident + 2 Sabbatical Guests</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">RESEARCH VELOCITY</span>
            <span class="metric-value text-cyan">+15% Speed</span>
            <span class="metric-sub">Accelerates schematic and CAD prototyping</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">HARDWARE BENCH</span>
            <span class="metric-value text-gold">LinuxCNC & 3D Dock</span>
            <span class="metric-sub">Direct FabLab sub-bus connection</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">ROOFTOP SOLAR</span>
            <span class="metric-value text-emerald">Dedicated PV</span>
            <span class="metric-sub">Zero-loss DC power to prototyping tools</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">🔬 Prototyping & Craft Actions:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-studio-cad">
            <span>💻 Run FreeCAD Parametric Modeling Session</span>
            <small>Generate open-source timber joinery blueprints</small>
          </button>
        </div>
      `;
    } else if (b.type === 'mhu_bathhouse') {
      icon = '♨️';
      title = b.name || 'Communal Bathhouse & Sauna';
      subtitle = 'Solar Thermal Vacuum Tube Core • Closed-Loop Reed Bed Greywater';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">CEDAR SAUNA CORE</span>
            <span class="metric-value text-gold">85°C Wood-Fired</span>
            <span class="metric-sub">Heated with pruned agroforestry billets</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">SOLAR THERMAL TUBES</span>
            <span class="metric-value text-cyan">400 L / Day</span>
            <span class="metric-sub">65°C hot water for community showers</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">GREYWATER CLOSED-LOOP</span>
            <span class="metric-value text-emerald">100% Recycled</span>
            <span class="metric-sub">Subsurface gravity flow to gravel reed bed</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">COMMUNITY HYGIENE</span>
            <span class="metric-value text-emerald">+15 Morale</span>
            <span class="metric-sub">Eliminates physical fatigue & muscle aches</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">♨️ Wellness & Thermal Comfort:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-sauna-session">
            <span>🔥 Host Evening Communal Sauna Session</span>
            <small>Pioneers relax with herbal sauna steam infusions (+10 Morale)</small>
          </button>
        </div>
      `;
    } else if (b.type === 'school_nursery' || b.type === 'school') {
      icon = '🌲';
      title = b.name || 'Open Forest School & Community Nursery';
      subtitle = 'Natural Timber-Frame Pavilion • Outdoor Classroom & Sandpit';
      metricsHtml = `
        <div class="inspector-metrics-grid">
          <div class="inspector-metric-card">
            <span class="metric-label">FUTURE HOPE SURGE</span>
            <span class="metric-value text-emerald">+15% Resilience</span>
            <span class="metric-sub">Permanent buffer against climate despair</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">YOUTH MICRO-CHORES</span>
            <span class="metric-value text-cyan">+250 kcal/child</span>
            <span class="metric-sub">Daily wild berry foraging & seed sorting</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">OPEN CURRICULUM</span>
            <span class="metric-value text-gold">Nature Scouting</span>
            <span class="metric-sub">Syntropic agroforestry, robotics, oral history</span>
          </div>
          <div class="inspector-metric-card">
            <span class="metric-label">INTERGENERATIONAL</span>
            <span class="metric-value text-emerald">Elder Mentorship</span>
            <span class="metric-sub">Seasoned citizens share lore & crafts</span>
          </div>
        </div>
      `;
      actionsHtml = `
        <div class="inspector-actions-box">
          <h4 class="inspector-actions-title">📚 Forest School Activities:</h4>
          <button type="button" class="btn-inspector-action" id="btn-inspect-school-workshop">
            <span>📖 Host Botany & Robotics Discovery Circle</span>
            <small>Children sort heirloom seeds and test ESP32 moisture sensors (+5 Morale)</small>
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

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn-primary" id="btn-inspector-export-bp" style="background: linear-gradient(135deg, #059669, #0284c7); border: none; font-size: 0.82rem; padding: 7px 14px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-weight: 600;">
              📐 Export Blueprints & CAD (.STL / YAML)
            </button>
            ${b.type !== 'camper_van' && b.type !== 'central_agora' ? `
              <button type="button" class="btn-secondary btn-relocate-building" id="btn-inspector-relocate" title="Pick up and move this module to a new plot without penalty" style="border: 1px solid rgba(56, 189, 248, 0.45); color: #38bdf8; background: rgba(56, 189, 248, 0.12); font-size: 0.82rem; padding: 7px 12px; border-radius: 6px; font-weight: 600; display: flex; align-items: center; gap: 5px;">
                📦 Relocate
              </button>
              <button type="button" class="btn-secondary btn-dismantle-building" id="btn-inspector-dismantle" title="Dismantle module into circular reusable parts (100% recirculation)" style="border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; background: rgba(239, 68, 68, 0.10); font-size: 0.82rem; padding: 7px 12px; border-radius: 6px; font-weight: 600; display: flex; align-items: center; gap: 5px;">
                ♻️ Dismantle
              </button>
            ` : ''}
          </div>
          <button type="button" class="btn-secondary" id="btn-inspector-done">${b.type === 'camper_van' ? 'Return to Haven' : 'Back to Settlement'}</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.overlayEl.querySelector('#btn-inspector-close')?.addEventListener('click', () => this.close());
    this.overlayEl.querySelector('#btn-inspector-done')?.addEventListener('click', () => this.close());

    // Relocate Module
    this.overlayEl.querySelector('#btn-inspector-relocate')?.addEventListener('click', () => {
      soundFX.playClick();
      const b = this.currentBuilding;
      this.close();
      if (window.settlementCanvas) {
        window.settlementCanvas.startRelocatingBuilding(b);
      }
    });

    // Dismantle Module
    this.overlayEl.querySelector('#btn-inspector-dismantle')?.addEventListener('click', () => {
      soundFX.playClick();
      const b = this.currentBuilding;
      this.close();
      const res = gameState.dismantleBuilding(b.id);
      if (res.ok) {
        soundFX.playBuildThunk();
        if (window.settlementCanvas) {
          window.settlementCanvas.spawnDust(b.x || 0, b.y || 0);
          window.settlementCanvas.addFloatingText(b.x || 0, (b.y || 0) - 20, `♻️ Dismantled ${res.name}! Reusable parts returned.`, '#f87171');
        }
        if (window.gameHUD) {
          window.gameHUD.renderDock();
        }
      }
    });

    // Dual-Track Blueprint & STL Export
    this.overlayEl.querySelector('#btn-inspector-export-bp')?.addEventListener('click', () => {
      soundFX.playClick();
      blueprintExportModal.open(this.currentBuilding?.type || 'mhu_couple');
    });

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
    addDiag('#btn-inspect-clear-swale', 'Berm & Silt Cleared');
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

    // Trike Depot operations
    this.overlayEl.querySelector('#btn-inspect-trike-logistics-desk')?.addEventListener('click', () => {
      soundFX.playClick();
      this.close();
      logisticsModal.open('manifest');
    });

    this.overlayEl.querySelector('#btn-inspect-trike-recharge')?.addEventListener('click', () => {
      soundFX.playClick();
      gameState.rechargeFleet();
      this.render();
    });

    this.overlayEl.querySelector('#btn-inspect-trike-commission')?.addEventListener('click', () => {
      soundFX.playClick();
      soundFX.playChoreExtinctionFanfare();
      gameState.commissionVehicle('cargo_trike');
      this.render();
    });

    // Drone Vertiport operations
    this.overlayEl.querySelector('#btn-inspect-drone-logistics-desk')?.addEventListener('click', () => {
      soundFX.playClick();
      this.close();
      logisticsModal.open('manifest');
    });

    this.overlayEl.querySelector('#btn-inspect-drone-recharge')?.addEventListener('click', () => {
      soundFX.playClick();
      gameState.rechargeFleet();
      this.render();
    });

    this.overlayEl.querySelector('#btn-inspect-drone-commission')?.addEventListener('click', () => {
      soundFX.playClick();
      soundFX.playChoreExtinctionFanfare();
      gameState.commissionVehicle('vtol_drone');
      this.render();
    });

    // Epic 4: MHU Family In-Situ Expansion
    this.overlayEl.querySelector('#btn-inspect-expand-mhu-family')?.addEventListener('click', () => {
      if (!this.selectedBuilding) return;
      soundFX.playClick();
      soundFX.playChoreExtinctionFanfare();
      const res = gameState.expandMHUToFamily(this.selectedBuilding.id);
      if (res.ok) {
        this.selectedBuilding = res.building;
        this.render();
      }
    });

    // Epic 4: Harvest from attached kitchen garden apron
    this.overlayEl.querySelector('#btn-inspect-forage-apron')?.addEventListener('click', () => {
      soundFX.playClick();
      soundFX.playChoreExtinctionFanfare();
      const yieldKcal = this.selectedBuilding?.type === 'mhu_family' ? 250 : 150;
      gameState.data.resources.foodKcal = Math.min(
        gameState.data.resources.foodCapacityKcal || 100000,
        (gameState.data.resources.foodKcal || 0) + yieldKcal
      );
      gameState.data.morale = Math.min(100, (gameState.data.morale || 85) + 3);
      gameState.save();
      gameState.emit('resources_updated', gameState.data.resources);
      const btn = this.overlayEl.querySelector('#btn-inspect-forage-apron');
      if (btn) {
        btn.innerHTML = `<span>✅ Harvested +${yieldKcal} kcal!</span><small>Fresh organic herbs, strawberries & greens enjoyed</small>`;
        btn.style.borderColor = '#10b981';
      }
    });

    // Epic 4: FreeCAD modeling session in MHU studio
    this.overlayEl.querySelector('#btn-inspect-studio-cad')?.addEventListener('click', () => {
      soundFX.playClick();
      soundFX.playChoreExtinctionFanfare();
      gameState.data.morale = Math.min(100, (gameState.data.morale || 85) + 5);
      gameState.save();
      const btn = this.overlayEl.querySelector('#btn-inspect-studio-cad');
      if (btn) {
        btn.innerHTML = `<span>✅ IFC4 Blueprints Compiled!</span><small>Standard C24 timber joinery exported to FabLab</small>`;
        btn.style.borderColor = '#38bdf8';
      }
    });

    // Epic 4: Communal Sauna session
    this.overlayEl.querySelector('#btn-inspect-sauna-session')?.addEventListener('click', () => {
      soundFX.playAcousticStrum();
      soundFX.playChoreExtinctionFanfare();
      gameState.data.morale = Math.min(100, (gameState.data.morale || 85) + 10);
      gameState.save();
      const btn = this.overlayEl.querySelector('#btn-inspect-sauna-session');
      if (btn) {
        btn.innerHTML = `<span>✅ 85°C Herbal Sauna Infusion!</span><small>Pioneers rejuvenated (+10 Morale Surge)</small>`;
        btn.style.borderColor = '#f59e0b';
      }
    });

    // Epic 4: Forest School workshop
    this.overlayEl.querySelector('#btn-inspect-school-workshop')?.addEventListener('click', () => {
      soundFX.playAcousticStrum();
      soundFX.playChoreExtinctionFanfare();
      gameState.data.morale = Math.min(100, (gameState.data.morale || 85) + 5);
      gameState.save();
      const btn = this.overlayEl.querySelector('#btn-inspect-school-workshop');
      if (btn) {
        btn.innerHTML = `<span>✅ Discovery Circle Concluded!</span><small>Nature scouts sorted 40 heirloom seed varieties (+5 Morale)</small>`;
        btn.style.borderColor = '#10b981';
      }
    });
  }
}

export const buildingInspector = new BuildingInspectorModal();
