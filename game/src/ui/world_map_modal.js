/**
 * O.N.E. Regional Reticulum Mesh Map, Trade Convoys & Sabbatical Exchange Modal
 * Implements Model C: Sovereign Local Seed + Global Solarpunk Federation.
 * Enables dispatching Solar Cargo Trikes and Autonomous Drones to sister nodes,
 * exchanging surplus energy, water, food, and CNC tooling for rare technologies,
 * and embarking pioneers on reciprocal 2-day sabbatical mastery exchanges.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { soundFX } from '../audio/sound_fx.js';

export class WorldMapModal {
  constructor() {
    this.modalEl = null;
    this.canDismiss = false;
    this.activeTab = 'nodes'; // 'nodes' | 'trade' | 'sabbatical' | 'radar'
    this.selectedNodeId = 'monte_sole';
    this.selectedVehicle = 'trike';
    this.selectedOffer = 'energy';
    this.selectedRequest = 'chestnuts';
    this.selectedPioneerId = 'player';
    this.init();
  }

  init() {
    let existing = document.getElementById('mesh-map-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'mesh-map-overlay';
      existing.className = 'modal-overlay hidden';
      document.body.appendChild(existing);
    }
    this.modalEl = existing;

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl && this.canDismiss) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalEl.classList.contains('hidden') && this.canDismiss) {
        this.close();
      }
    });
  }

  open(defaultTab = 'nodes', targetNodeId = null) {
    soundFX.playClick();
    this.canDismiss = false;
    this.activeTab = defaultTab;
    if (targetNodeId) {
      this.selectedNodeId = targetNodeId;
    }
    setTimeout(() => {
      this.canDismiss = true;
    }, 400);

    this.render();
    this.modalEl.classList.remove('hidden');
    this.modalEl.classList.add('active');
  }

  close() {
    soundFX.playClick();
    this.modalEl.classList.remove('active');
    this.modalEl.classList.add('hidden');
  }

  getNodeCatalog() {
    const raw = gameState.data.sisterNodes || {};
    return Object.values(raw);
  }

  getPioneersList() {
    const list = [];
    if (gameState.data.player) {
      list.push({
        id: 'player',
        name: gameState.data.player.name,
        role: gameState.data.player.roleTitle,
        icon: '👑',
        status: gameState.data.player.status || 'Active'
      });
    }
    (gameState.data.companions || []).forEach(c => {
      list.push({
        id: c.id,
        name: c.name,
        role: c.roleTitle,
        icon: c.icon || '🧑',
        status: c.status || 'Active'
      });
    });
    return list;
  }

  render() {
    const hasMast = (gameState.data.buildings || []).some(b => b.type === 'lora_mast');
    const nodes = this.getNodeCatalog();
    const activeConvoys = gameState.data.convoys || [];
    const activeSabbaticals = gameState.data.sabbaticals || [];

    this.modalEl.innerHTML = `
      <div class="modal-window mesh-map-window" style="max-width: 780px;" role="dialog" aria-modal="true">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">📡</span>
            <div>
              <h2 class="modal-title">Regional Reticulum Mesh & Inter-Node Logistics</h2>
              <span class="modal-subtitle">Encrypted Peer-to-Peer Telemetry (868/915 MHz) • Physical Trade • Sabbatical Exchanges</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-mesh-close" aria-label="Close dialog">✕</button>
        </div>

        <!-- Telemetry Status Bar -->
        ${!hasMast ? `
          <div class="mesh-mast-warning" style="margin: 0 20px 10px 20px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 10px 14px; display: flex; align-items: center; gap: 10px; color: #fca5a5;">
            <span style="font-size: 18px;">⚠️</span>
            <div style="font-size: 12px; line-height: 1.4;">
              <strong>LoRa Telemetry Mast Offline:</strong> Long-range RF packet telemetry is operating on low-power backup radios. Build the Tier 2 LoRa Mast to boost signal clarity and unlock autonomous drone flight corridors!
            </div>
          </div>
        ` : `
          <div class="mesh-mast-active-bar" style="margin: 0 20px 10px 20px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #6ee7b7;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="active-pulse" style="color: #34d399;">●</span>
              <span><strong>Reticulum Mesh Active:</strong> 5 Bioregional Hubs Synced • Zero Central Server</span>
            </div>
            <span style="color: #94a3b8;">Active Convoys: <strong>${activeConvoys.length}</strong> • Sabbaticals: <strong>${activeSabbaticals.length}</strong></span>
          </div>
        `}

        <!-- solarpunk Tab Navigation -->
        <div class="dock-tier-switcher" style="padding: 0 20px; margin-bottom: 12px;">
          <button type="button" class="tier-tab-btn ${this.activeTab === 'nodes' ? 'active' : ''}" data-tab="nodes">
            🌐 Regional Nodes (${nodes.length})
          </button>
          <button type="button" class="tier-tab-btn ${this.activeTab === 'trade' ? 'active' : ''}" data-tab="trade">
            🚴 Dispatch Trade Convoy
          </button>
          <button type="button" class="tier-tab-btn ${this.activeTab === 'sabbatical' ? 'active' : ''}" data-tab="sabbatical">
            🎓 Sabbatical Exchange (Art. 4.2)
          </button>
          <button type="button" class="tier-tab-btn ${this.activeTab === 'radar' ? 'active' : ''}" data-tab="radar">
            📦 In-Transit Telemetry (${activeConvoys.length + activeSabbaticals.length})
          </button>
        </div>

        <!-- Body Container -->
        <div class="mesh-map-body" style="padding: 0 20px 16px 20px; max-height: 520px; overflow-y: auto;">
          ${this.renderTabContent()}
        </div>

        <!-- Footer -->
        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;">
          <button type="button" class="btn-secondary" id="btn-mesh-dismiss">Close Mesh Console</button>
          <span style="font-size: 11px; color: #94a3b8;">O.N.E. Living Commons • P2P Logistics & Mutual Aid Protocol</span>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTabContent() {
    if (this.activeTab === 'nodes') {
      return this.renderNodesTab();
    } else if (this.activeTab === 'trade') {
      return this.renderTradeTab();
    } else if (this.activeTab === 'sabbatical') {
      return this.renderSabbaticalTab();
    } else {
      return this.renderRadarTab();
    }
  }

  /* -------------------------------------------------------------
   * Tab 1: Regional Sister Nodes Topology
   * ----------------------------------------------------------- */
  renderNodesTab() {
    const nodes = this.getNodeCatalog();

    return `
      <div class="mesh-nodes-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
        ${nodes.map(n => `
          <div class="mesh-node-card" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 24px;">${this.getNodeIcon(n.id)}</span>
                  <div>
                    <h3 style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 0;">${n.name}</h3>
                    <span style="font-size: 11px; color: #94a3b8;">${n.region}</span>
                  </div>
                </div>
                <span class="node-status-pill" style="font-size: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 8px; border-radius: 12px; font-weight: 700;">
                  ${n.distanceKm} km
                </span>
              </div>

              <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.4;">
                <strong>Commons Specialization:</strong> ${n.specialty}
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 12px;">
                <span>Signal: <strong style="color: #34d399;">${n.signal}</strong></span>
                <span>Affinity: <strong style="color: #fbbf24;">${n.affinity || 100}%</strong></span>
                <span>Trade Convoys: <strong>${n.tradeHistoryCount || 0}</strong></span>
              </div>
            </div>

            <div style="display: flex; gap: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
              <button type="button" class="btn-primary btn-node-trade" data-id="${n.id}" style="flex: 1; font-size: 11.5px; padding: 6px 10px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                🚴 Trade Goods
              </button>
              <button type="button" class="btn-secondary btn-node-sabbatical" data-id="${n.id}" style="flex: 1; font-size: 11.5px; padding: 6px 10px;">
                🎓 Send Sabbatical
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * Tab 2: Dispatch Trade Convoy
   * ----------------------------------------------------------- */
  renderTradeTab() {
    const nodes = this.getNodeCatalog();
    const currentNode = nodes.find(n => n.id === this.selectedNodeId) || nodes[0];
    const energy = Math.round(gameState.data.resources.energyStoredKwh || 0);
    const food = Math.round(gameState.data.resources.foodKcal || 0);
    const water = Math.round(gameState.data.resources.waterLiters || 0);
    const choreH = gameState.data.chores?.remainingHours !== undefined ? gameState.data.chores.remainingHours : 6.0;
    const hasFablab = (gameState.data.buildings || []).some(b => b.type === 'fablab');

    // Vehicle specs
    const isDrone = this.selectedVehicle === 'drone';
    const energyCost = isDrone ? 6.0 : 3.0;
    let transitDays = 1;
    if (isDrone) {
      transitDays = currentNode.distanceKm > 4000 ? 2 : 1;
    } else {
      if (currentNode.distanceKm > 3000) transitDays = 3;
      else if (currentNode.distanceKm > 500) transitDays = 2;
      else transitDays = 1;
    }

    // Node-specific import catalog
    const importCatalog = this.getImportsForNode(currentNode.id);

    // Validation
    let canAffordOffer = false;
    let offerReason = '';
    if (this.selectedOffer === 'energy') {
      canAffordOffer = energy >= (energyCost + 15);
      offerReason = `Need 15 kWh battery canister + ${energyCost} kWh vehicle charge (Available: ${energy} kWh)`;
    } else if (this.selectedOffer === 'food') {
      canAffordOffer = food >= 4000 && energy >= energyCost;
      offerReason = `Need 4,000 kcal produce + ${energyCost} kWh vehicle charge (Available: ${food.toLocaleString()} kcal)`;
    } else if (this.selectedOffer === 'water') {
      canAffordOffer = water >= 1000 && energy >= energyCost;
      offerReason = `Need 1,000 L filtered water + ${energyCost} kWh vehicle charge (Available: ${water.toLocaleString()} L)`;
    } else if (this.selectedOffer === 'tooling') {
      canAffordOffer = hasFablab && choreH >= 2.0 && energy >= energyCost;
      offerReason = hasFablab ? `Need 2.0h CNC machining labor + ${energyCost} kWh vehicle charge` : 'FabLab required to machine parts';
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Step 1: Destination Node Selector -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px;">
          <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 6px;">
            1. Destination Sister Node:
          </label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${nodes.map(n => `
              <button type="button" class="btn-node-select ${this.selectedNodeId === n.id ? 'active' : ''}" data-id="${n.id}" style="padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid ${this.selectedNodeId === n.id ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedNodeId === n.id ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)'}; color: ${this.selectedNodeId === n.id ? '#38bdf8' : '#e2e8f0'}; cursor: pointer;">
                ${this.getNodeIcon(n.id)} ${n.name.split(' ')[0]} (${n.distanceKm} km)
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Step 2: Vehicle Choice -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px;">
          <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 6px;">
            2. Logistics Vehicle:
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="vehicle-card ${this.selectedVehicle === 'trike' ? 'active' : ''}" data-v="trike" style="border: 1px solid ${this.selectedVehicle === 'trike' ? '#34d399' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedVehicle === 'trike' ? 'rgba(52,211,153,0.15)' : 'rgba(15,23,42,0.5)'}; border-radius: var(--radius-md); padding: 10px; cursor: pointer;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #f8fafc; font-size: 13px;">🚴 Solar Cargo E-Trike</span>
                <span style="font-size: 10.5px; color: #34d399;">3.0 kWh Charge</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.3;">
                Payload: 60 kg • Ground transit along secondary mountain roads • Highly robust & weather resilient.
              </p>
            </div>

            <div class="vehicle-card ${this.selectedVehicle === 'drone' ? 'active' : ''}" data-v="drone" style="border: 1px solid ${this.selectedVehicle === 'drone' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedVehicle === 'drone' ? 'rgba(56,189,248,0.15)' : 'rgba(15,23,42,0.5)'}; border-radius: var(--radius-md); padding: 10px; cursor: pointer;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 700; color: #f8fafc; font-size: 13px;">🛸 Autonomous Courier Quad</span>
                <span style="font-size: 10.5px; color: #38bdf8;">6.0 kWh Charge</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.3;">
                Payload: 15 kg • Express high-speed aerial courier • Arrives 1 dawn earlier than ground trike.
              </p>
            </div>
          </div>
        </div>

        <!-- Step 3: Outbound Surplus (What you send) -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
              3. Pack Outbound Commons Surplus:
            </label>
            <span style="font-size: 11px; color: #cbd5e1;">Available: ⚡ ${energy} kWh • 🥗 ${food.toLocaleString()} kcal • 💧 ${water.toLocaleString()} L</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px;">
            <button type="button" class="btn-offer-select ${this.selectedOffer === 'energy' ? 'active' : ''}" data-offer="energy" style="padding: 8px; border-radius: 8px; border: 1px solid ${this.selectedOffer === 'energy' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedOffer === 'energy' ? 'rgba(251,191,36,0.18)' : 'rgba(30,41,59,0.5)'}; color: #f8fafc; text-align: left; cursor: pointer;">
              <span style="font-weight: 700; display: block; font-size: 12px;">⚡ 15 kWh Canister</span>
              <span style="font-size: 10.5px; color: #fbbf24;">Surplus Solar Battery</span>
            </button>
            <button type="button" class="btn-offer-select ${this.selectedOffer === 'food' ? 'active' : ''}" data-offer="food" style="padding: 8px; border-radius: 8px; border: 1px solid ${this.selectedOffer === 'food' ? '#34d399' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedOffer === 'food' ? 'rgba(52,211,153,0.18)' : 'rgba(30,41,59,0.5)'}; color: #f8fafc; text-align: left; cursor: pointer;">
              <span style="font-weight: 700; display: block; font-size: 12px;">🥗 4,000 kcal Produce</span>
              <span style="font-size: 10.5px; color: #34d399;">Fresh Permaculture Greens</span>
            </button>
            <button type="button" class="btn-offer-select ${this.selectedOffer === 'water' ? 'active' : ''}" data-offer="water" style="padding: 8px; border-radius: 8px; border: 1px solid ${this.selectedOffer === 'water' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedOffer === 'water' ? 'rgba(56,189,248,0.18)' : 'rgba(30,41,59,0.5)'}; color: #f8fafc; text-align: left; cursor: pointer;">
              <span style="font-weight: 700; display: block; font-size: 12px;">💧 1,000 L Water</span>
              <span style="font-size: 10.5px; color: #38bdf8;">Filtered Cistern Supply</span>
            </button>
            <button type="button" class="btn-offer-select ${this.selectedOffer === 'tooling' ? 'active' : ''}" data-offer="tooling" style="padding: 8px; border-radius: 8px; border: 1px solid ${this.selectedOffer === 'tooling' ? '#a78bfa' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedOffer === 'tooling' ? 'rgba(167,139,250,0.18)' : 'rgba(30,41,59,0.5)'}; color: #f8fafc; text-align: left; cursor: pointer;">
              <span style="font-weight: 700; display: block; font-size: 12px;">🛠️ FabLab CNC Parts</span>
              <span style="font-size: 10.5px; color: #a78bfa;">2h Machining Labor</span>
            </button>
          </div>
        </div>

        <!-- Step 4: Inbound Import (What you receive) -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px;">
          <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 6px;">
            4. Requested Sister Node Import from ${currentNode.name}:
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${importCatalog.map(item => `
              <div class="request-item-card ${this.selectedRequest === item.id ? 'active' : ''}" data-req="${item.id}" style="border: 1px solid ${this.selectedRequest === item.id ? '#10b981' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedRequest === item.id ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.5)'}; border-radius: var(--radius-md); padding: 10px; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 20px;">${item.icon}</span>
                  <div>
                    <span style="font-weight: 700; font-size: 12.5px; color: #f8fafc;">${item.name}</span>
                    <span style="font-size: 10px; color: #34d399; display: block;">${item.benefit}</span>
                  </div>
                </div>
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.3;">
                  ${item.desc}
                </p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Summary & Dispatch Button -->
        <div style="background: rgba(2, 132, 199, 0.12); border: 1px solid rgba(2, 132, 199, 0.3); border-radius: var(--radius-md); padding: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12.5px; font-weight: 700; color: #f8fafc;">
              Estimated Transit: <strong>${transitDays} Dawn${transitDays > 1 ? 's' : ''}</strong> (Arrives Day ${gameState.data.day + transitDays})
            </div>
            <span style="font-size: 11px; color: ${canAffordOffer ? '#38bdf8' : '#f87171'};">
              ${canAffordOffer ? `✓ Resource requirement satisfied (+${energyCost} kWh charge deducted)` : `⚠️ ${offerReason}`}
            </span>
          </div>

          <button type="button" class="btn-primary" id="btn-dispatch-convoy" ${!canAffordOffer ? 'disabled' : ''} style="font-size: 13px; font-weight: 700; padding: 10px 18px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            🚀 Launch Cargo Convoy
          </button>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * Tab 3: Pioneer Sabbatical Exchange
   * ----------------------------------------------------------- */
  renderSabbaticalTab() {
    const pioneers = this.getPioneersList();
    const nodes = this.getNodeCatalog();
    const currentNode = nodes.find(n => n.id === this.selectedNodeId) || nodes[0];
    const currentPioneer = pioneers.find(p => p.id === this.selectedPioneerId) || pioneers[0];

    const activeSabbatical = (gameState.data.sabbaticals || []).find(s => s.pioneerId === currentPioneer.id);

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 14px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 0 0 6px 0;">
            🎓 Constitutional Sabbatical & Mentorship Protocol (Art. 4.2)
          </h3>
          <p style="font-size: 12px; color: #cbd5e1; line-height: 1.4; margin: 0;">
            Every pioneer has the inviolable constitutional right to take sabbatical mentorship exchanges to partner nodes.
            During their 2-day residency, they collaborate with sister-city masters, study local agroecological or robotic adaptations,
            and return with a permanent <strong>Master Scholar Perk</strong> and shared open schematics.
          </p>
        </div>

        <!-- Pioneer Selection Grid -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px;">
          <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 8px;">
            1. Select Active Pioneer for Sabbatical:
          </label>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            ${pioneers.map(p => `
              <div class="pioneer-sabbatical-card ${this.selectedPioneerId === p.id ? 'active' : ''}" data-p="${p.id}" style="border: 1px solid ${this.selectedPioneerId === p.id ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedPioneerId === p.id ? 'rgba(251,191,36,0.15)' : 'rgba(15,23,42,0.5)'}; border-radius: var(--radius-md); padding: 8px 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">${p.icon}</span>
                <div style="flex: 1; overflow: hidden;">
                  <span style="font-weight: 700; font-size: 12px; color: #f8fafc; display: block; text-overflow: ellipsis; white-space: nowrap;">${p.name}</span>
                  <span style="font-size: 10px; color: #94a3b8; display: block;">${p.role}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Host Sister Node -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px;">
          <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 8px;">
            2. Host Sister Node & Vocational Curriculum:
          </label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            ${nodes.map(n => `
              <button type="button" class="btn-node-select ${this.selectedNodeId === n.id ? 'active' : ''}" data-id="${n.id}" style="padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid ${this.selectedNodeId === n.id ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; background: ${this.selectedNodeId === n.id ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)'}; color: ${this.selectedNodeId === n.id ? '#38bdf8' : '#e2e8f0'}; cursor: pointer;">
                ${this.getNodeIcon(n.id)} ${n.name}
              </button>
            `).join('')}
          </div>

          <div style="background: rgba(2, 132, 199, 0.1); border: 1px solid rgba(2, 132, 199, 0.25); border-radius: var(--radius-md); padding: 10px 12px;">
            <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">
              Curriculum: ${currentNode.specialty}
            </div>
            <div style="font-size: 11.5px; color: #cbd5e1;">
              Expected Perk: <strong style="color: #34d399;">${currentNode.name.split(' ')[0]} Master Scholar (+30% Vocational Mastery)</strong>
            </div>
          </div>
        </div>

        <!-- Sabbatical Dispatch Action -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12.5px; font-weight: 700; color: #f8fafc;">
              Tenure: <strong>2 Dawns</strong> (Leaves today • Returns on Day ${gameState.data.day + 2})
            </div>
            <span style="font-size: 11px; color: #94a3b8;">
              ${activeSabbatical ? `⚠️ ${currentPioneer.name} is currently on sabbatical at ${activeSabbatical.targetNodeName}` : 'Pioneer travel covered by solar e-trike.'}
            </span>
          </div>

          <button type="button" class="btn-primary" id="btn-embark-sabbatical" ${activeSabbatical ? 'disabled' : ''} style="font-size: 13px; font-weight: 700; padding: 10px 18px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            🎒 Embark on Reciprocal Sabbatical
          </button>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * Tab 4: Active Convoys & In-Transit Radar
   * ----------------------------------------------------------- */
  renderRadarTab() {
    const convoys = gameState.data.convoys || [];
    const sabbaticals = gameState.data.sabbaticals || [];

    if (convoys.length === 0 && sabbaticals.length === 0) {
      return `
        <div style="text-align: center; padding: 40px 20px;">
          <span style="font-size: 48px; display: block; margin-bottom: 12px;">📡</span>
          <h3 style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Reticulum Skies Clear</h3>
          <p style="font-size: 12px; color: #94a3b8; max-width: 440px; margin: 0 auto 16px auto;">
            No cargo trikes or courier drones currently on the mountain trail.
            Switch to the <strong>Dispatch Trade Convoy</strong> tab to exchange surplus resources with sister nodes!
          </p>
          <button type="button" class="btn-primary" id="btn-quick-to-trade" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
            🚴 Plan a Trade Convoy
          </button>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${convoys.length > 0 ? `
          <h3 class="consulting-title" style="margin: 0;">🚴 Active Cargo Convoys on the Road:</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${convoys.map(c => `
              <div class="consulting-order-card" style="border: 1px solid rgba(56, 189, 248, 0.3);">
                <span style="font-size: 24px;">${c.vehicleType === 'drone' ? '🛸' : '🚴'}</span>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 class="order-name" style="margin: 0; font-size: 13px;">
                      ${c.vehicleType === 'drone' ? 'Courier Drone' : 'Solar Cargo Trike'} ➔ ${c.targetNodeName}
                    </h4>
                    <span style="font-size: 11px; color: #34d399; font-weight: 700;">
                      ${c.daysRemaining} Dawn${c.daysRemaining > 1 ? 's' : ''} Remaining (Arrival Day ${c.arrivalDay})
                    </span>
                  </div>
                  <span class="order-desc" style="display: block; margin-top: 4px;">
                    Outbound Cargo: <strong>${c.offerType}</strong> • Requesting: <strong>${c.requestType}</strong>
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${sabbaticals.length > 0 ? `
          <h3 class="consulting-title" style="margin: 8px 0 0 0;">🎓 Active Pioneer Sabbaticals:</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${sabbaticals.map(s => `
              <div class="consulting-order-card" style="border: 1px solid rgba(251, 191, 36, 0.3);">
                <span style="font-size: 24px;">🎒</span>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 class="order-name" style="margin: 0; font-size: 13px;">
                      ${s.pioneerName} @ ${s.targetNodeName}
                    </h4>
                    <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">
                      Returns Day ${s.arrivalDay} (${s.daysRemaining} Dawn remaining)
                    </span>
                  </div>
                  <span class="order-desc" style="display: block; margin-top: 4px;">
                    Studying: <strong>${s.perkEarned}</strong>
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* -------------------------------------------------------------
   * Helper Catalogs
   * ----------------------------------------------------------- */
  getNodeIcon(nodeId) {
    const map = {
      monte_sole: '⛰️',
      val_di_cecina: '♨️',
      serra_estrela: '🏔️',
      detroit_delray: '🏭',
      rojava: '🌾'
    };
    return map[nodeId] || '🌱';
  }

  getImportsForNode(nodeId) {
    if (nodeId === 'monte_sole') {
      return [
        {
          id: 'chestnuts',
          name: 'Heirloom Roasted Chestnuts',
          icon: '🌰',
          benefit: '+3,500 kcal Food',
          desc: 'High-calorie, mineral-rich mountain tree harvest flour.'
        },
        {
          id: 'schematic_stirling',
          name: 'Solar Stirling Concentrator Schematic',
          icon: '📜',
          benefit: '+25 kWh/d Peak Blueprint',
          desc: 'Parabolic solar dish with closed-cycle helium expansion engine.'
        }
      ];
    } else if (nodeId === 'val_di_cecina') {
      return [
        {
          id: 'spirulina',
          name: 'Spirulina Superfood Flakes',
          icon: '🧪',
          benefit: '+4,500 kcal Food',
          desc: 'Geothermally warmed cyanobacteria packed with complete amino acids.'
        },
        {
          id: 'schematic_geothermal',
          name: 'Geothermal Heat Exchanger Blueprint',
          icon: '📜',
          benefit: 'Zero Winter Heating Deficit',
          desc: 'Closed-loop titanium coaxial ground-source heat pump schematic.'
        }
      ];
    } else if (nodeId === 'serra_estrela') {
      return [
        {
          id: 'wool_insulation',
          name: 'Lanital Natural Wool Burlap',
          icon: '🐑',
          benefit: '0% Crop Freeze Risk',
          desc: 'Thick lanolin-treated natural thermal wraps for greenhouse beds.'
        },
        {
          id: 'schematic_pelton',
          name: 'Pelton Micro-Hydro Wheel Schematic',
          icon: '📜',
          benefit: '+30 kWh Continuous Power',
          desc: 'Precision spoon-runner turbine capturing steep alpine creek head.'
        }
      ];
    } else if (nodeId === 'detroit_delray') {
      return [
        {
          id: 'carbide_bits',
          name: 'Tungsten Carbide Precision Tooling',
          icon: '⚙️',
          benefit: '+50% FabLab Crafting Speed',
          desc: 'High-hardness mill endmills for machining steel & bronze.'
        },
        {
          id: 'schematic_heavy_mill',
          name: 'Heavy 5-Axis Gantry Mill Blueprint',
          icon: '📜',
          benefit: 'Autonomous Machine Tooling',
          desc: 'Cast-iron bed CNC framework for building robotic cobots.'
        }
      ];
    } else { // rojava
      return [
        {
          id: 'emmer_wheat',
          name: 'Heritage Drought-Resistant Emmer Grains',
          icon: '🌾',
          benefit: '+5,000 kcal Food',
          desc: 'Ancestral 8,000-year deep-root grain thriving without irrigation.'
        },
        {
          id: 'schematic_sortition',
          name: 'Demarchic Sortition Juror Corpus',
          icon: '📜',
          benefit: '+20 Community Morale',
          desc: 'Civic constitutional statutes eliminating factional political friction.'
        }
      ];
    }
  }

  bindEvents() {
    // Modal Close
    this.modalEl.querySelector('#btn-mesh-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-mesh-dismiss')?.addEventListener('click', () => this.close());

    // Tab buttons
    this.modalEl.querySelectorAll('.tier-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Quick node trade click in Nodes tab
    this.modalEl.querySelectorAll('.btn-node-trade').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedNodeId = btn.dataset.id;
        this.activeTab = 'trade';
        const imports = this.getImportsForNode(this.selectedNodeId);
        if (imports.length > 0) this.selectedRequest = imports[0].id;
        this.render();
      });
    });

    // Quick node sabbatical click in Nodes tab
    this.modalEl.querySelectorAll('.btn-node-sabbatical').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedNodeId = btn.dataset.id;
        this.activeTab = 'sabbatical';
        this.render();
      });
    });

    // Node selector buttons
    this.modalEl.querySelectorAll('.btn-node-select').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedNodeId = btn.dataset.id;
        const imports = this.getImportsForNode(this.selectedNodeId);
        if (imports.length > 0) this.selectedRequest = imports[0].id;
        this.render();
      });
    });

    // Vehicle cards
    this.modalEl.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedVehicle = card.dataset.v;
        this.render();
      });
    });

    // Offer selection buttons
    this.modalEl.querySelectorAll('.btn-offer-select').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedOffer = btn.dataset.offer;
        this.render();
      });
    });

    // Request items
    this.modalEl.querySelectorAll('.request-item-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedRequest = card.dataset.req;
        this.render();
      });
    });

    // Pioneer selection cards
    this.modalEl.querySelectorAll('.pioneer-sabbatical-card').forEach(card => {
      card.addEventListener('click', () => {
        soundFX.playClick();
        this.selectedPioneerId = card.dataset.p;
        this.render();
      });
    });

    // Quick to trade button in empty radar
    this.modalEl.querySelector('#btn-quick-to-trade')?.addEventListener('click', () => {
      soundFX.playClick();
      this.activeTab = 'trade';
      this.render();
    });

    // Dispatch Convoy Action
    this.modalEl.querySelector('#btn-dispatch-convoy')?.addEventListener('click', () => {
      const res = gameState.dispatchCargoConvoy({
        targetNodeId: this.selectedNodeId,
        vehicleType: this.selectedVehicle,
        offerType: this.selectedOffer,
        requestType: this.selectedRequest
      });

      if (res.ok) {
        soundFX.playCargoDispatch();
        this.activeTab = 'radar';
        this.render();
      } else {
        alert(res.reason || 'Failed to dispatch convoy');
      }
    });

    // Embark on Sabbatical Action
    this.modalEl.querySelector('#btn-embark-sabbatical')?.addEventListener('click', () => {
      const res = gameState.sendPioneerOnSabbatical({
        pioneerId: this.selectedPioneerId,
        targetNodeId: this.selectedNodeId
      });

      if (res.ok) {
        soundFX.playCargoDispatch();
        this.activeTab = 'radar';
        this.render();
      } else {
        alert(res.reason || 'Failed to embark on sabbatical');
      }
    });
  }
}

export const worldMapModal = new WorldMapModal();
if (typeof window !== 'undefined') {
  window.worldMapModal = worldMapModal;
}
