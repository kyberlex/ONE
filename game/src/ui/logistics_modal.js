/**
 * O.N.E. Living Commons — Transit & Vertiport Logistics Desk Modal
 * Canonical inter-node logistics, fleet management, and trade manifest configuration.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { soundFX } from '../audio/sound_fx.js';

export class LogisticsDeskModal {
  constructor() {
    this.overlayEl = null;
    this.activeTab = 'manifest'; // 'manifest' | 'fleet' | 'radar'
    this.selectedVehicleId = null;
    this.selectedDestination = 'val_di_cecina';
    this.selectedDriverId = null;

    // Outbound cargo quantities
    this.cargoFoodKcal = 4000;
    this.cargoEnergyKwh = 10.0;
    this.cargoWaterL = 100;
    this.cargoTools = [];

    this.radarAnimTimer = null;
    this.ensureDom();
  }

  ensureDom() {
    let existing = document.getElementById('logistics-desk-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'logistics-desk-modal-overlay';
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

  open(initialTab = 'manifest') {
    this.activeTab = initialTab;

    // Pick first available docked vehicle if none selected
    const fleet = gameState.getFleet ? gameState.getFleet() : (gameState.data.fleet || []);
    const docked = fleet.filter(v => v.status === 'docked');
    if (!this.selectedVehicleId && docked.length > 0) {
      this.selectedVehicleId = docked[0].id;
    }

    // Pick first companion as default driver
    const companions = gameState.data.companions || [];
    if (!this.selectedDriverId && companions.length > 0) {
      this.selectedDriverId = companions[0].id;
    }

    this.render();
    this.overlayEl.classList.remove('hidden');

    if (this.activeTab === 'radar') {
      this.startRadarAnimation();
    }
  }

  close() {
    if (this.radarAnimTimer) {
      clearInterval(this.radarAnimTimer);
      this.radarAnimTimer = null;
    }
    this.overlayEl.classList.add('hidden');
  }

  startRadarAnimation() {
    if (this.radarAnimTimer) clearInterval(this.radarAnimTimer);
    this.radarAnimTimer = setInterval(() => {
      if (this.overlayEl.classList.contains('hidden') || this.activeTab !== 'radar') {
        clearInterval(this.radarAnimTimer);
        this.radarAnimTimer = null;
        return;
      }
      this.updateRadarPositions();
    }, 100);
  }

  updateRadarPositions() {
    const radarContainer = this.overlayEl.querySelector('#reticulum-mesh-radar-view');
    if (!radarContainer) return;
    const convoys = gameState.data.convoys || [];
    convoys.forEach(c => {
      const pulseEl = radarContainer.querySelector(`#radar-convoy-pulse-${c.id}`);
      if (!pulseEl) return;
      const progress = Math.max(0.05, Math.min(0.95, (c.daysRemaining ? (1 - (c.daysRemaining / Math.max(1, (c.etaDay - c.departureDay) || 1))) : 0.5)));
      // Node coordinates on the 600x340 radar canvas
      const nodeCoords = {
        'val_di_cecina': { x: 130, y: 160 },
        'campi_flegrei': { x: 380, y: 260 },
        'alburni': { x: 490, y: 280 },
        'barbagia': { x: 150, y: 270 },
        'node_02': { x: 460, y: 90 },
        'monte_sole': { x: 300, y: 50 },
        'default': { x: 300, y: 80 }
      };
      const destPos = nodeCoords[c.destination] || nodeCoords['default'];
      const homeX = 300, homeY = 170;
      const currX = homeX + (destPos.x - homeX) * progress;
      const currY = homeY + (destPos.y - homeY) * progress;
      pulseEl.setAttribute('cx', currX);
      pulseEl.setAttribute('cy', currY);

      const tagEl = radarContainer.querySelector(`#radar-convoy-tag-${c.id}`);
      if (tagEl) {
        tagEl.setAttribute('x', currX);
        tagEl.setAttribute('y', currY - 14);
      }
    });
  }

  render() {
    const fleet = gameState.getFleet ? gameState.getFleet() : (gameState.data.fleet || []);
    const dockedVehicles = fleet.filter(v => v.status === 'docked');
    const inTransitVehicles = fleet.filter(v => v.status === 'in_transit');
    const totalCapacityKg = fleet.reduce((acc, v) => acc + (v.payloadCapacityKg || 0), 0);
    const storedEnergyKwh = gameState.data.resources?.energyStoredKwh || 0;
    const convoys = gameState.data.convoys || [];

    this.overlayEl.innerHTML = `
      <div class="modal-card logistics-desk-modal" style="max-width: 820px; width: 95%; background: var(--bg-card, #0f172a); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-lg, 16px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); overflow: hidden; display: flex; flex-direction: column; max-height: 92vh;">
        <!-- Header -->
        <div class="modal-header" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95)); padding: 16px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; font-size: 24px;">
              📦
            </div>
            <div>
              <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #f8fafc; letter-spacing: 0.02em;">
                Transit & Vertiport Logistics Desk
              </h2>
              <span style="font-size: 11.5px; color: #94a3b8;">
                Zero-Emission Regional Freight • Fleet Status • Bioregional Trade Manifests
              </span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-logistics-close" aria-label="Close dialog" style="background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; padding: 4px 8px;">✕</button>
        </div>

        <!-- Telemetry Summary Bar -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px 22px; background: rgba(15, 23, 42, 0.7); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 12px;">
            <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; display: block;">Overland Trikes</span>
            <span style="font-size: 13.5px; font-weight: 800; color: #34d399;">${fleet.filter(v => v.type === 'cargo_trike' && v.status === 'docked').length} / ${fleet.filter(v => v.type === 'cargo_trike').length} Docked</span>
          </div>
          <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 12px;">
            <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; display: block;">Aerial Courier Drones</span>
            <span style="font-size: 13.5px; font-weight: 800; color: #38bdf8;">${fleet.filter(v => v.type === 'vtol_drone' && v.status === 'docked').length} / ${fleet.filter(v => v.type === 'vtol_drone').length} On Pad</span>
          </div>
          <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 12px;">
            <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; display: block;">Total Freight Lift</span>
            <span style="font-size: 13.5px; font-weight: 800; color: #fbbf24;">${totalCapacityKg} kg</span>
          </div>
          <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 12px;">
            <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; display: block;">Microgrid Power</span>
            <span style="font-size: 13.5px; font-weight: 800; color: #38bdf8;">${storedEnergyKwh.toFixed(1)} kWh Available</span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 8px; padding: 10px 22px 0 22px; background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <button type="button" class="tier-tab-btn ${this.activeTab === 'manifest' ? 'active' : ''}" data-tab="manifest" style="padding: 8px 16px; font-size: 12px; font-weight: 700; border-radius: 8px 8px 0 0; border: 1px solid ${this.activeTab === 'manifest' ? '#38bdf8' : 'transparent'}; border-bottom: none; background: ${this.activeTab === 'manifest' ? 'rgba(56, 189, 248, 0.15)' : 'transparent'}; color: ${this.activeTab === 'manifest' ? '#38bdf8' : '#94a3b8'}; cursor: pointer;">
            📋 Configure Trade Manifest
          </button>
          <button type="button" class="tier-tab-btn ${this.activeTab === 'fleet' ? 'active' : ''}" data-tab="fleet" style="padding: 8px 16px; font-size: 12px; font-weight: 700; border-radius: 8px 8px 0 0; border: 1px solid ${this.activeTab === 'fleet' ? '#34d399' : 'transparent'}; border-bottom: none; background: ${this.activeTab === 'fleet' ? 'rgba(52, 211, 153, 0.15)' : 'transparent'}; color: ${this.activeTab === 'fleet' ? '#34d399' : '#94a3b8'}; cursor: pointer;">
            🛠️ Fleet Management & Service (${fleet.length})
          </button>
          <button type="button" class="tier-tab-btn ${this.activeTab === 'radar' ? 'active' : ''}" data-tab="radar" style="padding: 8px 16px; font-size: 12px; font-weight: 700; border-radius: 8px 8px 0 0; border: 1px solid ${this.activeTab === 'radar' ? '#fbbf24' : 'transparent'}; border-bottom: none; background: ${this.activeTab === 'radar' ? 'rgba(251, 191, 36, 0.15)' : 'transparent'}; color: ${this.activeTab === 'radar' ? '#fbbf24' : '#94a3b8'}; cursor: pointer;">
            📡 In-Transit Telemetry & Mesh Radar (${convoys.length})
          </button>
        </div>

        <!-- Body -->
        <div class="logistics-body" style="padding: 18px 22px; overflow-y: auto; flex: 1;">
          ${this.renderTabContent()}
        </div>

        <!-- Footer -->
        <div style="padding: 12px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #64748b;">
            O.N.E. Living Commons • Physical Barter & Zero-Monetary Logistics Protocol
          </span>
          <button type="button" class="btn-secondary" id="btn-logistics-dismiss" style="padding: 6px 14px; font-size: 12px;">Close Desk</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTabContent() {
    if (this.activeTab === 'manifest') {
      return this.renderManifestTab();
    } else if (this.activeTab === 'fleet') {
      return this.renderFleetTab();
    } else {
      return this.renderRadarTab();
    }
  }

  renderManifestTab() {
    const fleet = gameState.getFleet ? gameState.getFleet() : (gameState.data.fleet || []);
    const dockedVehicles = fleet.filter(v => v.status === 'docked');
    const sisterNodes = gameState.getSisterNodes ? gameState.getSisterNodes() : [];
    const companions = gameState.data.companions || [];
    const resources = gameState.data.resources || {};

    const activeVehicle = fleet.find(v => v.id === this.selectedVehicleId) || dockedVehicles[0] || fleet[0];
    const maxPayload = activeVehicle?.payloadCapacityKg || 250;
    const isDrone = activeVehicle?.type === 'vtol_drone';

    // Mass calculations
    const foodMassKg = (this.cargoFoodKcal * 0.0005); // 2000 kcal = 1 kg
    const energyMassKg = (this.cargoEnergyKwh * 7.0); // 1 kWh battery module = 7 kg
    const waterMassKg = (this.cargoWaterL * 1.0); // 1 L = 1 kg
    const toolMassKg = this.cargoTools.length * 5.0;
    const totalMassKg = Math.round((foodMassKg + energyMassKg + waterMassKg + toolMassKg) * 10) / 10;
    const massPct = Math.round((totalMassKg / maxPayload) * 100);
    const isOverweight = totalMassKg > maxPayload;

    // Partner Node details
    const destNode = sisterNodes.find(n => n.id === this.selectedDestination) || sisterNodes[0];
    const distanceKm = destNode?.distanceKm || 45;
    const energyNeededKwh = isDrone ? 0.8 : Math.max(1.5, Math.round(((distanceKm * 2) / 100) * 1.5 * 10) / 10);
    const transitDays = isDrone ? 1 : Math.max(1, Math.round(distanceKm / 40));

    // Can afford checks
    const hasEnoughFood = (resources.foodKcal || 0) >= this.cargoFoodKcal;
    const hasEnoughEnergy = (resources.energyStoredKwh || 0) >= (this.cargoEnergyKwh + energyNeededKwh);
    const hasEnoughWater = (resources.waterLiters || 0) >= this.cargoWaterL;
    const canAfford = hasEnoughFood && hasEnoughEnergy && hasEnoughWater && !isOverweight && dockedVehicles.length > 0;

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Step 1: Vehicle Selection -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">
              1. Select Docked Transport Vehicle:
            </label>
            <span style="font-size: 11px; color: ${dockedVehicles.length > 0 ? '#34d399' : '#f87171'};">
              ${dockedVehicles.length} Docked & Available
            </span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
            ${fleet.map(v => {
              const isSelected = v.id === this.selectedVehicleId;
              const isDocked = v.status === 'docked';
              return `
                <div class="manifest-vehicle-card ${isSelected ? 'active' : ''}" data-vehicle-id="${v.id}" style="border: 1px solid ${isSelected ? '#38bdf8' : (isDocked ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.3)')}; background: ${isSelected ? 'rgba(56,189,248,0.15)' : (isDocked ? 'rgba(30,41,59,0.5)' : 'rgba(15,23,42,0.4)')}; opacity: ${isDocked ? '1' : '0.6'}; border-radius: 8px; padding: 10px; cursor: ${isDocked ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 22px;">${v.type === 'vtol_drone' ? '🚁' : '🚲'}</span>
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between;">
                      <strong style="font-size: 12px; color: #f8fafc;">${v.name}</strong>
                      <span style="font-size: 9.5px; color: ${isDocked ? '#34d399' : '#f87171'}; text-transform: uppercase;">${v.status}</span>
                    </div>
                    <span style="font-size: 10.5px; color: #94a3b8; display: block;">Max Payload: ${v.payloadCapacityKg} kg • SOC: ${v.batterySocPct || 100}%</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Step 2: Destination Sister Node -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
          <label style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 8px;">
            2. Destination Partner Node:
          </label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            ${sisterNodes.map(n => {
              const isSelected = n.id === this.selectedDestination;
              const icon = n.id === 'val_di_cecina' ? '♨️' : (n.id === 'campi_flegrei' ? '🌋' : (n.id === 'alburni' ? '🌲' : (n.id === 'barbagia' ? '🐑' : '🌐')));
              return `
                <button type="button" class="btn-node-dest ${isSelected ? 'active' : ''}" data-node-id="${n.id}" style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; border-radius: 6px; border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; background: ${isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)'}; color: ${isSelected ? '#38bdf8' : '#e2e8f0'}; cursor: pointer;">
                  ${icon} ${n.name.split(' ')[0]} (${n.distanceKm} km)
                </button>
              `;
            }).join('')}
          </div>

          <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px 12px; font-size: 11.5px; display: flex; justify-content: space-between;">
            <div>
              <strong style="color: #38bdf8;">${destNode?.name}:</strong>
              <span style="color: #cbd5e1;">${destNode?.specialty}</span>
            </div>
            <div style="color: #94a3b8;">
              Distance: <strong style="color: #fbbf24;">${distanceKm} km</strong> • Route Terrain: <strong>Overland Greenway</strong>
            </div>
          </div>
        </div>

        <!-- Step 3: Driver Assignment (Trike only) -->
        ${!isDrone ? `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
            <label style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 8px;">
              3. Assigned Pioneer Courier / Driver:
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${companions.map(p => {
                const isSelected = p.id === this.selectedDriverId;
                return `
                  <button type="button" class="btn-driver-select ${isSelected ? 'active' : ''}" data-driver-id="${p.id}" style="padding: 6px 12px; font-size: 11.5px; border-radius: 6px; border: 1px solid ${isSelected ? '#34d399' : 'rgba(255,255,255,0.1)'}; background: ${isSelected ? 'rgba(52,211,153,0.2)' : 'rgba(30,41,59,0.5)'}; color: ${isSelected ? '#34d399' : '#e2e8f0'}; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <span>${p.icon || '👤'}</span>
                    <span>${p.name} (${p.status || 'Available'})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <div style="background: rgba(6, 78, 59, 0.2); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 12px; padding: 10px 14px; font-size: 11.5px; color: #6ee7b7; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">🤖</span>
            <span><strong>Autonomous Flight Mode:</strong> SkyLink VTOL courier executes encrypted GPS waypoints and LoRa mesh collision avoidance automatically with zero human pilot risk.</span>
          </div>
        `}

        <!-- Step 4: Cargo Manifest Sliders -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <label style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">
              4. Pack Outbound Commodities & Payload Mass:
            </label>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-preset" data-preset="light" style="padding: 3px 8px; font-size: 10px; background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #94a3b8; cursor: pointer;">Light Express</button>
              <button type="button" class="btn-preset" data-preset="balanced" style="padding: 3px 8px; font-size: 10px; background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #94a3b8; cursor: pointer;">Balanced Trade</button>
              <button type="button" class="btn-preset" data-preset="max" style="padding: 3px 8px; font-size: 10px; background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #94a3b8; cursor: pointer;">Max Load</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <!-- Food kcal -->
            <div style="background: rgba(30, 41, 59, 0.4); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                <span style="color: #34d399; font-weight: 700;">🥗 Food Produce:</span>
                <span style="color: #f8fafc; font-weight: 800;">${this.cargoFoodKcal.toLocaleString()} kcal (${foodMassKg.toFixed(1)} kg)</span>
              </div>
              <input type="range" class="manifest-slider" id="slider-food" min="0" max="${Math.min(25000, resources.foodKcal || 20000)}" step="500" value="${this.cargoFoodKcal}" style="width: 100%; accent-color: #34d399;">
              <span style="font-size: 10px; color: #94a3b8;">Granary Available: ${(resources.foodKcal || 0).toLocaleString()} kcal</span>
            </div>

            <!-- Energy kWh -->
            <div style="background: rgba(30, 41, 59, 0.4); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                <span style="color: #fbbf24; font-weight: 700;">⚡ Stored Energy (LFP Packs):</span>
                <span style="color: #f8fafc; font-weight: 800;">${this.cargoEnergyKwh.toFixed(1)} kWh (${energyMassKg.toFixed(1)} kg)</span>
              </div>
              <input type="range" class="manifest-slider" id="slider-energy" min="0" max="${Math.max(0, Math.min(30, (resources.energyStoredKwh || 0) - energyNeededKwh))}" step="1" value="${this.cargoEnergyKwh}" style="width: 100%; accent-color: #fbbf24;">
              <span style="font-size: 10px; color: #94a3b8;">Microgrid Stored: ${(resources.energyStoredKwh || 0).toFixed(1)} kWh</span>
            </div>

            <!-- Water Liters -->
            <div style="background: rgba(30, 41, 59, 0.4); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                <span style="color: #38bdf8; font-weight: 700;">💧 Potable Water:</span>
                <span style="color: #f8fafc; font-weight: 800;">${this.cargoWaterL} L (${waterMassKg.toFixed(1)} kg)</span>
              </div>
              <input type="range" class="manifest-slider" id="slider-water" min="0" max="${Math.min(1500, resources.waterLiters || 1000)}" step="50" value="${this.cargoWaterL}" style="width: 100%; accent-color: #38bdf8;">
              <span style="font-size: 10px; color: #94a3b8;">Cistern Stored: ${(resources.waterLiters || 0).toLocaleString()} L</span>
            </div>

            <!-- CNC Tooling -->
            <div style="background: rgba(30, 41, 59, 0.4); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px;">
                <span style="color: #a78bfa; font-weight: 700;">🛠️ FabLab Precision Parts:</span>
                <span style="color: #f8fafc; font-weight: 800;">${toolMassKg} kg</span>
              </div>
              <label style="font-size: 11px; color: #cbd5e1; display: flex; align-items: center; gap: 6px; cursor: pointer; margin-top: 6px;">
                <input type="checkbox" id="chk-laser-spindle" ${this.cargoTools.includes('laser_spindle_bushing') ? 'checked' : ''}>
                <span>Include CNC Milled Bushings & Schematics (+5 kg)</span>
              </label>
              <span style="font-size: 10px; color: #94a3b8;">Unlocks reciprocal engineering schematics</span>
            </div>
          </div>

          <!-- Payload Mass & Energy Budget Telemetry Meter -->
          <div style="margin-top: 14px; background: rgba(15, 23, 42, 0.8); border: 1px solid ${isOverweight ? '#ef4444' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; padding: 10px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">
                PAYLOAD MASS: <strong style="color: ${isOverweight ? '#ef4444' : (massPct > 80 ? '#fbbf24' : '#34d399')}; font-size: 12.5px;">${totalMassKg} kg / ${maxPayload} kg (${massPct}%)</strong>
              </span>
              <span style="font-size: 11px; color: #94a3b8;">
                ROUTE ENERGY BUDGET: <strong style="color: #fbbf24;">${energyNeededKwh} kWh</strong> (${isDrone ? 'Direct Aerial LOS' : '1.5 kWh / 100 km'})
              </span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(100, massPct)}%; height: 100%; background: ${isOverweight ? '#ef4444' : (massPct > 80 ? '#fbbf24' : '#10b981')}; transition: width 0.2s ease;"></div>
            </div>
            ${isOverweight ? `
              <div style="margin-top: 6px; font-size: 11px; color: #f87171; font-weight: 700;">
                ⚠️ Overweight Alert: Total mass exceeds the ${maxPayload} kg payload capacity of ${activeVehicle?.name}! Reduce cargo.
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Step 5: Reciprocal Inbound Return Preview & Dispatch -->
        <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(15, 23, 42, 0.8)); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-bottom: 2px;">
              Estimated Transit: <strong>${transitDays} Dawn${transitDays > 1 ? 's' : ''}</strong> (Arrival on Day ${gameState.data.day + transitDays})
            </div>
            <span style="font-size: 11.5px; color: #38bdf8;">
              Reciprocal Inbound: <strong>${destNode?.name || 'Partner'} Bioregional Commodities</strong> (+Affinity Surge)
            </span>
          </div>

          <button type="button" class="btn-primary" id="btn-dispatch-manifest" ${!canAfford ? 'disabled' : ''} style="font-size: 13px; font-weight: 800; padding: 10px 20px; background: ${canAfford ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#475569'}; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
            🚀 Launch Regional Trade Convoy
          </button>
        </div>
      </div>
    `;
  }

  renderFleetTab() {
    const fleet = gameState.getFleet ? gameState.getFleet() : (gameState.data.fleet || []);
    const storedEnergy = gameState.data.resources?.energyStoredKwh || 0;

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em;">
            Regional Transport Fleet Roster (${fleet.length} Active)
          </h3>
          <button type="button" class="btn-primary" id="btn-fleet-recharge-all" style="padding: 6px 14px; font-size: 11.5px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
            ⚡ Recharge All Docked Vehicles
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${fleet.map(v => {
            const isDrone = v.type === 'vtol_drone';
            const soc = v.batterySocPct !== undefined ? v.batterySocPct : 100;
            const health = v.healthPct !== undefined ? v.healthPct : 100;
            const isDocked = v.status === 'docked';

            return `
              <div class="fleet-vehicle-card" style="background: rgba(15, 23, 42, 0.7); border: 1px solid ${isDocked ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 26px;">${isDrone ? '🚁' : '🚲'}</span>
                      <div>
                        <h4 style="margin: 0; font-size: 13.5px; font-weight: 800; color: #f8fafc;">${v.name}</h4>
                        <span style="font-size: 10.5px; color: #94a3b8;">${isDrone ? 'Autonomous VTOL Quad-Courier' : 'Overland Solar Cargo E-Trike'}</span>
                      </div>
                    </div>
                    <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; background: ${isDocked ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)'}; color: ${isDocked ? '#34d399' : '#fbbf24'}; border: 1px solid currentColor; text-transform: uppercase;">
                      ${v.status}
                    </span>
                  </div>

                  <!-- Battery SOC Gauge -->
                  <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                      <span style="color: #94a3b8;">${isDrone ? 'Flight Pack SOC' : '48V LFP Pack SOC'}</span>
                      <strong style="color: #38bdf8;">${soc}% (${(v.batteryCapacityKwh * (soc / 100)).toFixed(1)} / ${v.batteryCapacityKwh} kWh)</strong>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                      <div style="width: ${soc}%; height: 100%; background: #38bdf8;"></div>
                    </div>
                  </div>

                  <!-- Mechanical Health Gauge -->
                  <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                      <span style="color: #94a3b8;">Mechanical Maintenance</span>
                      <strong style="color: #34d399;">${health}% Optimal</strong>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                      <div style="width: ${health}%; height: 100%; background: #34d399;"></div>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: #cbd5e1; background: rgba(30, 41, 59, 0.4); padding: 6px 10px; border-radius: 6px; margin-bottom: 12px;">
                    <div>Payload: <strong>${v.payloadCapacityKg} kg</strong></div>
                    <div>Range: <strong>${v.rangeKm} km</strong></div>
                    <div>Sorties: <strong>${v.sortiesCompleted || 0}</strong></div>
                    <div>Odometer: <strong>${v.totalDistanceTraveledKm || 0} km</strong></div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
                  <button type="button" class="btn-secondary btn-charge-vehicle" data-vehicle-id="${v.id}" ${!isDocked || soc >= 100 ? 'disabled' : ''} style="flex: 1; font-size: 11px; padding: 6px 8px;">
                    ⚡ Recharge
                  </button>
                  <button type="button" class="btn-secondary btn-service-vehicle" data-vehicle-id="${v.id}" ${!isDocked || health >= 100 ? 'disabled' : ''} style="flex: 1; font-size: 11px; padding: 6px 8px;">
                    🔧 Service
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Assembly Commissioning Section -->
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; margin-top: 6px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #f8fafc;">
            🏭 Open-Source Vehicle Assembly Bay:
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: rgba(15, 23, 42, 0.6); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #f8fafc; font-size: 12px; display: block;">Assemble Cargo Trike</strong>
                <span style="font-size: 10.5px; color: #94a3b8;">Requires: 15 kWh • 250 kg frame</span>
              </div>
              <button type="button" class="btn-primary" id="btn-commission-trike" style="padding: 5px 12px; font-size: 11px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                🚲 Assemble
              </button>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #f8fafc; font-size: 12px; display: block;">Assemble VTOL Courier</strong>
                <span style="font-size: 10.5px; color: #94a3b8;">Requires: 20 kWh • 25 kg avionics</span>
              </div>
              <button type="button" class="btn-primary" id="btn-commission-drone" style="padding: 5px 12px; font-size: 11px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                🚁 Assemble
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRadarTab() {
    const convoys = gameState.data.convoys || [];

    // Partner node map coordinates on our 600x320 SVG radar
    const radarNodes = [
      { id: 'val_di_cecina', name: 'Val di Cecina', icon: '♨️', x: 130, y: 160 },
      { id: 'monte_sole', name: 'Monte Sole', icon: '🌰', x: 300, y: 50 },
      { id: 'node_02', name: 'Sister Node 02', icon: '🧬', x: 460, y: 90 },
      { id: 'campi_flegrei', name: 'Campi Flegrei', icon: '🌋', x: 380, y: 260 },
      { id: 'alburni', name: 'Alburni', icon: '🌲', x: 490, y: 280 },
      { id: 'barbagia', name: 'Barbagia', icon: '🐑', x: 150, y: 270 }
    ];

    const homeX = 300, homeY = 170;

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Reticulum Mesh Animated Radar Canvas/SVG -->
        <div style="background: radial-gradient(circle at center, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.98)); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 10px; left: 14px; font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399;"></span>
            <span>Reticulum Mesh Vector Radar (868 MHz LoRa)</span>
          </div>

          <svg id="reticulum-mesh-radar-view" viewBox="0 0 600 320" style="width: 100%; height: auto; max-height: 280px; display: block;">
            <!-- Radar Range Rings -->
            <circle cx="${homeX}" cy="${homeY}" r="60" fill="none" stroke="rgba(56, 189, 248, 0.12)" stroke-width="1" />
            <circle cx="${homeX}" cy="${homeY}" r="120" fill="none" stroke="rgba(56, 189, 248, 0.10)" stroke-width="1" />
            <circle cx="${homeX}" cy="${homeY}" r="180" fill="none" stroke="rgba(56, 189, 248, 0.08)" stroke-width="1" />

            <!-- Mesh Links -->
            ${radarNodes.map(n => `
              <line x1="${homeX}" y1="${homeY}" x2="${n.x}" y2="${n.y}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4, 6" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite" />
              </line>
            `).join('')}

            <!-- Home Node Center -->
            <circle cx="${homeX}" cy="${homeY}" r="16" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2" />
            <circle cx="${homeX}" cy="${homeY}" r="6" fill="#38bdf8" />
            <text x="${homeX}" y="${homeY + 28}" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">Primary Settlement</text>

            <!-- Partner Sister Nodes -->
            ${radarNodes.map(n => `
              <g class="radar-node-marker" transform="translate(${n.x}, ${n.y})">
                <circle cx="0" cy="0" r="14" fill="rgba(15, 23, 42, 0.8)" stroke="#34d399" stroke-width="1.5" />
                <text x="0" y="4" text-anchor="middle" font-size="12">${n.icon}</text>
                <text x="0" y="24" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">${n.name}</text>
              </g>
            `).join('')}

            <!-- Dynamic Moving Convoy Pulse Dots -->
            ${convoys.map((c, idx) => {
              const destPos = radarNodes.find(n => n.id === c.destination) || radarNodes[0];
              const progress = Math.max(0.05, Math.min(0.95, (c.daysRemaining ? (1 - (c.daysRemaining / Math.max(1, (c.etaDay - c.departureDay) || 1))) : 0.5)));
              const currX = homeX + (destPos.x - homeX) * progress;
              const currY = homeY + (destPos.y - homeY) * progress;
              const isDrone = c.type === 'vtol_drone';

              return `
                <g class="radar-convoy-group" id="radar-convoy-group-${c.id}">
                  <circle id="radar-convoy-pulse-${c.id}" cx="${currX}" cy="${currY}" r="8" fill="${isDrone ? '#38bdf8' : '#fbbf24'}" stroke="#ffffff" stroke-width="1.5">
                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text id="radar-convoy-tag-${c.id}" x="${currX}" y="${currY - 14}" fill="#f8fafc" font-size="9" font-weight="bold" text-anchor="middle" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                    ${isDrone ? '🚁 Drone' : '🚴 Trike'} (ETA: ${c.daysRemaining || 1}d)
                  </text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <!-- Telemetry Cards -->
        <div>
          <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #f8fafc; text-transform: uppercase;">
            Active Regional Convoys in Transit (${convoys.length})
          </h3>
          ${convoys.length === 0 ? `
            <div style="text-align: center; padding: 30px; background: rgba(15, 23, 42, 0.5); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">
              <span style="font-size: 32px; display: block; margin-bottom: 6px;">📡</span>
              <strong style="color: #f8fafc; font-size: 13px;">No Convoys Currently in Transit</strong>
              <p style="font-size: 11.5px; color: #94a3b8; margin: 4px 0 12px 0;">Switch to the Manifest tab to pack surplus produce and launch trade missions.</p>
              <button type="button" class="btn-primary" id="btn-goto-manifest" style="font-size: 11px; padding: 6px 14px;">📋 Plan a Manifest</button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${convoys.map(c => {
                const isDrone = c.type === 'vtol_drone';
                const hasEvent = !!c.transitEvent;

                return `
                  <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid ${hasEvent ? '#f59e0b' : 'rgba(56, 189, 248, 0.3)'}; border-radius: 8px; padding: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">${isDrone ? '🚁' : '🚲'}</span>
                        <strong style="font-size: 13px; color: #f8fafc;">
                          ${isDrone ? 'SkyLink VTOL Courier' : 'Solar Cargo Trike'} ➔ ${c.destination}
                        </strong>
                      </div>
                      <span style="font-size: 11px; font-weight: 800; color: #34d399;">
                        ${c.daysRemaining} Dawn${c.daysRemaining > 1 ? 's' : ''} Remaining (ETA Day ${c.etaDay})
                      </span>
                    </div>

                    ${hasEvent ? `
                      <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #fde047; margin-bottom: 6px;">
                        ⚠️ <strong>Transit Event:</strong> ${c.transitEvent.title} — ${c.transitEvent.desc}
                      </div>
                    ` : ''}

                    <div style="font-size: 11px; color: #cbd5e1; display: flex; justify-content: space-between;">
                      <span>Outbound Cargo: <strong>${c.cargoManifest?.foodKcal || 0} kcal, ${c.cargoManifest?.energyKwh || 0} kWh, ${c.cargoManifest?.waterL || 0} L</strong></span>
                      <span>Return Cargo: <strong style="color: #38bdf8;">${c.returnManifest?.summary || 'Bioregional Imports'}</strong></span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.overlayEl.querySelector('#btn-logistics-close')?.addEventListener('click', () => this.close());
    this.overlayEl.querySelector('#btn-logistics-dismiss')?.addEventListener('click', () => this.close());

    // Tab buttons
    this.overlayEl.querySelectorAll('.tier-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.activeTab = btn.dataset.tab;
        this.render();
        if (this.activeTab === 'radar') {
          this.startRadarAnimation();
        }
      });
    });

    this.overlayEl.querySelector('#btn-goto-manifest')?.addEventListener('click', () => {
      soundFX.playClick();
      this.activeTab = 'manifest';
      this.render();
    });

    // Manifest Tab Events
    if (this.activeTab === 'manifest') {
      // Vehicle selection
      this.overlayEl.querySelectorAll('.manifest-vehicle-card').forEach(card => {
        card.addEventListener('click', () => {
          const vId = card.dataset.vehicleId;
          const v = (gameState.data.fleet || []).find(f => f.id === vId);
          if (v && v.status === 'docked') {
            soundFX.playClick();
            this.selectedVehicleId = vId;
            this.render();
          }
        });
      });

      // Destination selection
      this.overlayEl.querySelectorAll('.btn-node-dest').forEach(btn => {
        btn.addEventListener('click', () => {
          soundFX.playClick();
          this.selectedDestination = btn.dataset.nodeId;
          this.render();
        });
      });

      // Driver selection
      this.overlayEl.querySelectorAll('.btn-driver-select').forEach(btn => {
        btn.addEventListener('click', () => {
          soundFX.playClick();
          this.selectedDriverId = btn.dataset.driverId;
          this.render();
        });
      });

      // Sliders
      const sliderFood = this.overlayEl.querySelector('#slider-food');
      if (sliderFood) {
        sliderFood.addEventListener('input', (e) => {
          this.cargoFoodKcal = parseInt(e.target.value, 10);
          this.render();
        });
      }

      const sliderEnergy = this.overlayEl.querySelector('#slider-energy');
      if (sliderEnergy) {
        sliderEnergy.addEventListener('input', (e) => {
          this.cargoEnergyKwh = parseFloat(e.target.value);
          this.render();
        });
      }

      const sliderWater = this.overlayEl.querySelector('#slider-water');
      if (sliderWater) {
        sliderWater.addEventListener('input', (e) => {
          this.cargoWaterL = parseInt(e.target.value, 10);
          this.render();
        });
      }

      const chkLaser = this.overlayEl.querySelector('#chk-laser-spindle');
      if (chkLaser) {
        chkLaser.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (!this.cargoTools.includes('laser_spindle_bushing')) {
              this.cargoTools.push('laser_spindle_bushing');
            }
          } else {
            this.cargoTools = this.cargoTools.filter(t => t !== 'laser_spindle_bushing');
          }
          this.render();
        });
      }

      // Presets
      this.overlayEl.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          soundFX.playClick();
          const preset = btn.dataset.preset;
          const activeVehicle = (gameState.data.fleet || []).find(v => v.id === this.selectedVehicleId);
          const isDrone = activeVehicle?.type === 'vtol_drone';

          if (preset === 'light') {
            this.cargoFoodKcal = isDrone ? 1000 : 2000;
            this.cargoEnergyKwh = isDrone ? 1.0 : 5.0;
            this.cargoWaterL = isDrone ? 5 : 50;
          } else if (preset === 'balanced') {
            this.cargoFoodKcal = isDrone ? 2500 : 6000;
            this.cargoEnergyKwh = isDrone ? 2.0 : 12.0;
            this.cargoWaterL = isDrone ? 10 : 150;
          } else if (preset === 'max') {
            this.cargoFoodKcal = isDrone ? 5000 : 12000;
            this.cargoEnergyKwh = isDrone ? 3.0 : 20.0;
            this.cargoWaterL = isDrone ? 15 : 200;
          }
          this.render();
        });
      });

      // Dispatch Manifest Action
      this.overlayEl.querySelector('#btn-dispatch-manifest')?.addEventListener('click', () => {
        const fleet = gameState.getFleet ? gameState.getFleet() : (gameState.data.fleet || []);
        const activeVehicle = fleet.find(v => v.id === this.selectedVehicleId) || fleet.find(v => v.status === 'docked');
        if (!activeVehicle) return;

        const manifest = {
          foodKcal: this.cargoFoodKcal,
          energyKwh: this.cargoEnergyKwh,
          waterL: this.cargoWaterL,
          tools: [...this.cargoTools],
          seeds: []
        };

        const result = gameState.dispatchConvoy(
          activeVehicle.type,
          this.selectedDestination,
          manifest,
          {
            pioneerDriverId: activeVehicle.type === 'vtol_drone' ? null : this.selectedDriverId,
            vehicleId: activeVehicle.id
          }
        );

        if (result.ok) {
          soundFX.playChoreExtinctionFanfare();
          this.activeTab = 'radar';
          this.render();
          this.startRadarAnimation();
        } else {
          soundFX.playClick();
          alert(result.reason || 'Failed to dispatch convoy.');
        }
      });
    }

    // Fleet Tab Events
    if (this.activeTab === 'fleet') {
      this.overlayEl.querySelector('#btn-fleet-recharge-all')?.addEventListener('click', () => {
        soundFX.playClick();
        gameState.rechargeFleet();
        this.render();
      });

      this.overlayEl.querySelectorAll('.btn-charge-vehicle').forEach(btn => {
        btn.addEventListener('click', () => {
          soundFX.playClick();
          gameState.chargeVehicle(btn.dataset.vehicleId);
          this.render();
        });
      });

      this.overlayEl.querySelectorAll('.btn-service-vehicle').forEach(btn => {
        btn.addEventListener('click', () => {
          soundFX.playClick();
          gameState.serviceVehicle(btn.dataset.vehicleId);
          this.render();
        });
      });

      this.overlayEl.querySelector('#btn-commission-trike')?.addEventListener('click', () => {
        soundFX.playClick();
        soundFX.playChoreExtinctionFanfare();
        gameState.commissionVehicle('cargo_trike');
        this.render();
      });

      this.overlayEl.querySelector('#btn-commission-drone')?.addEventListener('click', () => {
        soundFX.playClick();
        soundFX.playChoreExtinctionFanfare();
        gameState.commissionVehicle('vtol_drone');
        this.render();
      });
    }
  }
}

export const logisticsModal = new LogisticsDeskModal();
if (typeof window !== 'undefined') {
  window.logisticsModal = logisticsModal;
}
