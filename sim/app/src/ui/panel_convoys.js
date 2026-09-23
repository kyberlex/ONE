/**
 * Inter-Node Trade Convoys & Logistics Panel Controller (Agent SIM-5)
 * Solarpunk Glassmorphic UI for multi-hex barter logistics, mutual aid convoys,
 * and planetary federation trade routing.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { CONVOY_VEHICLES, COMMODITY_TYPES, BIOREGIONAL_TRADE_PROFILES, calculateHaversineDistanceKm } from '../engine/trade_convoy.js';
import { t } from '../i18n/index.js';

export class PanelConvoysController {
  constructor(sim, onDispatchCallback = () => {}) {
    this.sim = sim;
    this.onDispatch = onDispatchCallback;
    this.modalEl = document.getElementById('modal-convoys');
    this.contentEl = document.getElementById('convoys-content');
    this.closeBtn = document.getElementById('btn-close-convoys-modal');
    this.currentTab = 'active'; // 'active' | 'dispatch' | 'directory' | 'history'
    this.customDrawerOpen = false;
    this.currentSmartMissions = [];

    // Dispatch form temporary state
    this.selectedDestNodeId = 'node-val-di-susa';
    this.selectedVehicleId = 'MAGLEV_RAIL';
    this.selectedCommodity = 'ENERGY';
    this.dispatchAmount = 100;
    this.isSolidarity = false;

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

  open(tab = 'active') {
    if (!this.modalEl) return;
    this.currentTab = tab;
    this.modalEl.classList.remove('hidden');
    this.render();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }

  render() {
    if (!this.contentEl) return;
    const trade = this.sim.trade;
    const thermo = this.sim.thermo;
    const node = this.sim.node;
    const activeConvoys = trade.convoys;

    let html = `
      <div class="convoys-container">
        <!-- Tabs Header -->
        <div class="modal-tabs">
          <button class="tab-btn ${this.currentTab === 'active' ? 'active' : ''}" data-ctab="active">
            🚚 ${t('tabActiveConvoys', 'Active Convoys')} (${activeConvoys.length})
          </button>
          <button class="tab-btn ${this.currentTab === 'dispatch' ? 'active' : ''}" data-ctab="dispatch">
            🚀 ${t('tabDispatchConvoy', 'Dispatch Convoy')}
          </button>
          <button class="tab-btn ${this.currentTab === 'directory' ? 'active' : ''}" data-ctab="directory">
            🌍 ${t('tabTradeDirectory', 'Bioregional Directory')}
          </button>
          <button class="tab-btn ${this.currentTab === 'history' ? 'active' : ''}" data-ctab="history">
            📜 ${t('tabTradeHistory', 'Logistics Ledger')}
          </button>
        </div>

        <div class="tab-body">
    `;

    if (this.currentTab === 'active') {
      html += this.renderActiveTab(activeConvoys);
    } else if (this.currentTab === 'dispatch') {
      html += this.renderDispatchTab(trade, thermo, node);
    } else if (this.currentTab === 'directory') {
      html += this.renderDirectoryTab(trade);
    } else if (this.currentTab === 'history') {
      html += this.renderHistoryTab(trade);
    }

    html += `
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;
    this.bindTabInteractions();
  }

  getSmartMissions(trade, thermo, node) {
    const originNode = trade.getNodeById(trade.playerNodeId) || trade.allNodes[0] || { id: 'node-detroit', name: 'Detroit Delray', lat: 42.3, lng: -83.1 };
    const availableNodes = trade.allNodes.filter(n => n.id !== originNode.id);
    if (availableNodes.length === 0) return [];

    const missions = [];
    const batteryStored = thermo.energy.batteryStoredKwh;
    const waterStored = thermo.water.cisternStoredL;
    const foodStored = thermo.food.granaryStoredKcal;
    const matStored = (thermo.circularMaterials?.recycledAluminiumKg || 0) + (thermo.circularMaterials?.recycledPetgKg || 0);

    // 1. Mission 1: Reciprocal Barter (Highest Mutual Benefit)
    let barterDest = null;
    let barterComm = 'ENERGY';
    let barterAmt = 40;

    for (const d of availableNodes) {
      const p = trade.getTradeProfile(d.id);
      if (p.deficit === 'ENERGY' && batteryStored > 40) {
        barterDest = d;
        barterComm = 'ENERGY';
        barterAmt = Math.min(60, Math.max(20, Math.floor(batteryStored * 0.25)));
        break;
      } else if (p.deficit === 'WATER' && waterStored > 2000) {
        barterDest = d;
        barterComm = 'WATER';
        barterAmt = Math.min(3000, Math.max(500, Math.floor(waterStored * 0.25)));
        break;
      } else if (p.deficit === 'FOOD' && foodStored > 40000) {
        barterDest = d;
        barterComm = 'FOOD';
        barterAmt = Math.min(80000, Math.max(10000, Math.floor(foodStored * 0.25)));
        break;
      } else if (p.deficit === 'MATERIALS' && matStored > 20) {
        barterDest = d;
        barterComm = 'MATERIALS';
        barterAmt = Math.min(30, Math.max(5, Math.floor(matStored * 0.3)));
        break;
      }
    }

    if (!barterDest && availableNodes.length > 0) {
      barterDest = availableNodes.find(n => n.id === 'node-val-di-susa') || availableNodes[0];
      if (batteryStored > 40) {
        barterComm = 'ENERGY';
        barterAmt = 30;
      } else if (waterStored > 1500) {
        barterComm = 'WATER';
        barterAmt = 1000;
      } else {
        barterComm = 'FOOD';
        barterAmt = 25000;
      }
    }

    const barterReturn = trade.calculateBarterReturn(originNode.id, barterDest.id, barterComm, barterAmt);
    const barterVehicle = CONVOY_VEHICLES.MAGLEV_RAIL;
    const barterHours = trade.calculateTransitTicks(originNode, barterDest, barterVehicle);
    const barterDist = calculateHaversineDistanceKm(originNode.lat, originNode.lng, barterDest.lat, barterDest.lng);

    missions.push({
      id: 'mission-barter',
      type: 'BARTER',
      title: '🌟 Recommended Reciprocal Barter',
      destNode: barterDest,
      vehicleId: 'MAGLEV_RAIL',
      vehicle: barterVehicle,
      commodityType: barterComm,
      amount: barterAmt,
      isSolidarity: false,
      returnCargo: barterReturn,
      distanceKm: barterDist,
      transitHours: barterHours,
      badgeText: '⭐ +35% Bioregional Bonus',
      badgeClass: 'badge-bonus',
      btnText: `🚀 Launch Barter (${barterAmt.toLocaleString()} ${COMMODITY_TYPES[barterComm].unit})`
    });

    // 2. Mission 2: Planetary Solidarity Gift (Mutual Aid)
    const solDest = availableNodes.find(n => n.id === 'node-sahel' || n.id === 'node-amazon') || availableNodes[1] || availableNodes[0];
    const solComm = waterStored > 2000 ? 'WATER' : (batteryStored > 40 ? 'ENERGY' : 'FOOD');
    const solAmt = solComm === 'WATER' ? 1200 : (solComm === 'ENERGY' ? 30 : 20000);
    const solVehicle = CONVOY_VEHICLES.SOLAR_AIRSHIP;
    const solHours = trade.calculateTransitTicks(originNode, solDest, solVehicle);
    const solDist = calculateHaversineDistanceKm(originNode.lat, originNode.lng, solDest.lat, solDest.lng);

    missions.push({
      id: 'mission-solidarity',
      type: 'SOLIDARITY',
      title: '🕊️ Sister Haven Relief Gift',
      destNode: solDest,
      vehicleId: 'SOLAR_AIRSHIP',
      vehicle: solVehicle,
      commodityType: solComm,
      amount: solAmt,
      isSolidarity: true,
      returnCargo: null,
      distanceKm: solDist,
      transitHours: solHours,
      badgeText: '❤️ +8% Morale & Trust',
      badgeClass: 'badge-solidarity',
      btnText: `🕊️ Dispatch Solidarity Aid (${solAmt.toLocaleString()} ${COMMODITY_TYPES[solComm].unit})`
    });

    // 3. Mission 3: Fast Regional Swap
    const regDest = availableNodes.find(n => n.id !== barterDest.id && n.id !== solDest.id) || availableNodes[availableNodes.length - 1];
    const regComm = foodStored > 35000 ? 'FOOD' : (matStored > 15 ? 'MATERIALS' : 'ENERGY');
    const regAmt = regComm === 'FOOD' ? 30000 : (regComm === 'MATERIALS' ? 15 : 25);
    const regReturn = trade.calculateBarterReturn(originNode.id, regDest.id, regComm, regAmt);
    const regVehicle = CONVOY_VEHICLES.SOLAR_ROVER;
    const regHours = trade.calculateTransitTicks(originNode, regDest, regVehicle);
    const regDist = calculateHaversineDistanceKm(originNode.lat, originNode.lng, regDest.lat, regDest.lng);

    missions.push({
      id: 'mission-regional',
      type: 'REGIONAL',
      title: '📦 Quick Regional Exchange',
      destNode: regDest,
      vehicleId: 'SOLAR_ROVER',
      vehicle: regVehicle,
      commodityType: regComm,
      amount: regAmt,
      isSolidarity: false,
      returnCargo: regReturn,
      distanceKm: regDist,
      transitHours: regHours,
      badgeText: '⚡ Fast Rover Route',
      badgeClass: 'badge-speed',
      btnText: `🚀 Launch Regional Trade (${regAmt.toLocaleString()} ${COMMODITY_TYPES[regComm].unit})`
    });

    this.currentSmartMissions = missions;
    return missions;
  }

  renderSmartMissionsCards(trade, thermo, node) {
    const missions = this.getSmartMissions(trade, thermo, node);
    if (missions.length === 0) return '';

    return `
      <div class="smart-missions-container">
        <div class="smart-missions-title-bar">
          <div class="title-with-badge">
            <span class="icon">⚡</span>
            <h4>1-Click Recommended Trade Routes (Auto-Balanced)</h4>
          </div>
          <p class="subtitle">Instant thermodynamic balance. Pre-calculated from your current surpluses and sister havens' critical deficits.</p>
        </div>

        <div class="smart-missions-grid">
          ${missions.map((m, idx) => {
            const outComm = COMMODITY_TYPES[m.commodityType];
            return `
              <div class="smart-mission-card ${m.type.toLowerCase()}-card">
                <div class="smart-mission-header">
                  <div class="smart-mission-title-group">
                    <span class="veh-icon">${m.vehicle.icon}</span>
                    <div>
                      <div class="smart-mission-title">${m.title}</div>
                      <div class="smart-mission-route">
                        ➔ <strong>${m.destNode.name}</strong> (${m.distanceKm} km)
                      </div>
                    </div>
                  </div>
                  <span class="smart-mission-badge ${m.badgeClass}">${m.badgeText}</span>
                </div>

                <div class="smart-mission-exchange">
                  <div class="smart-exchange-row">
                    <span class="label">Outgoing Payload:</span>
                    <span class="val-out">-${m.amount.toLocaleString()} ${outComm.unit} ${outComm.icon}</span>
                  </div>
                  <div class="smart-exchange-row">
                    <span class="label">${m.isSolidarity ? 'Mission Impact:' : 'Expected Return:'}</span>
                    <span class="val-in">
                      ${m.isSolidarity 
                        ? '❤️ +8% Morale & Alliance Pact' 
                        : `+${m.returnCargo?.amount.toLocaleString()} ${m.returnCargo?.unit} ${m.returnCargo?.icon}`}
                    </span>
                  </div>
                </div>

                <div class="smart-mission-meta">
                  <span>⏱️ ETA: ~${m.transitHours}h</span>
                  <span>⚡ Draw: ${m.vehicle.energyDrawKwh} kWh</span>
                </div>

                <button class="btn-smart-launch btn-primary" data-mission-idx="${idx}">
                  ${m.btnText}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderActiveTab(convoys) {
    if (convoys.length === 0) {
      return `
        <div class="convoys-empty-hero">
          <div class="empty-hero-header">
            <span class="empty-hero-icon">🚚</span>
            <div>
              <h4>${t('noActiveConvoysTitle', 'No Active Convoys in Transit')}</h4>
              <p>${t('noActiveConvoysDesc', 'Your settlement is not currently exchanging goods with federated sister nodes. Launch a barter trade or solidarity caravan to balance local thermodynamics!')}</p>
            </div>
          </div>

          ${this.renderSmartMissionsCards(this.sim.trade, this.sim.thermo, this.sim.node)}

          <div class="or-custom-divider">
            <span>or</span>
            <button class="btn-goto-custom">🛠️ Configure custom route & payload ➔</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="convoys-list">
        <div class="convoys-list-top-bar">
          <span>🚚 <strong>${convoys.length}</strong> Convoys in Transit</span>
          <button class="btn-primary btn-quick-dispatch-more" style="font-size: 11px; padding: 6px 12px;">
            🚀 + Dispatch Another Convoy
          </button>
        </div>

        ${convoys.map(c => {
          const pct = Math.min(100, Math.round((c.progressTicks / c.totalTicks) * 100));
          const remainingHours = Math.max(1, c.totalTicks - c.progressTicks);
          const isOutbound = c.status === 'OUTBOUND';

          return `
            <div class="convoy-card ${isOutbound ? 'outbound' : 'inbound'}">
              <div class="convoy-card-top">
                <div class="convoy-vehicle-badge">${c.vehicleIcon}</div>
                <div class="convoy-info">
                  <h4>${c.name}</h4>
                  <span class="convoy-subtitle">
                    ${c.originName} ➔ <strong>${c.destName}</strong> (${c.distanceKm} km)
                  </span>
                </div>
                <span class="convoy-status-pill ${c.status.toLowerCase()}">
                  ${isOutbound ? '🚀 OUTBOUND' : '🔄 RETURNING HOME'}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="convoy-progress-wrapper">
                <div class="convoy-progress-track">
                  <div class="convoy-progress-fill" style="width: ${pct}%;"></div>
                </div>
                <div class="convoy-progress-labels">
                  <span>${isOutbound ? 'Outbound Transit' : 'Inbound Cargo Return'}</span>
                  <span><strong>${pct}%</strong> • ETA: ${remainingHours}h</span>
                </div>
              </div>

              <!-- Manifest Grid -->
              <div class="convoy-manifest-grid">
                <div class="manifest-box">
                  <span class="manifest-label">Outgoing Payload</span>
                  <span class="manifest-val text-yellow">${c.outgoingAmount.toLocaleString()} ${c.outgoingUnit} ${c.outgoingIcon}</span>
                </div>
                <div class="manifest-box">
                  <span class="manifest-label">${c.isSolidarity ? 'Mission Type' : 'Expected Reciprocal Import'}</span>
                  <span class="manifest-val ${c.isSolidarity ? 'text-green' : 'text-cyan'}">
                    ${c.isSolidarity 
                      ? '🕊️ Pure Solidarity Mutual Aid' 
                      : `${c.returnCargo?.amount.toLocaleString()} ${c.returnCargo?.unit} ${c.returnCargo?.icon}`}
                  </span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderDispatchTab(trade, thermo, node) {
    const originNode = trade.getNodeById(trade.playerNodeId) || { lat: 42.3, lng: -83.1, name: 'Detroit Delray' };
    const availableNodes = trade.allNodes.filter(n => n.id !== originNode.id);
    const destNode = trade.getNodeById(this.selectedDestNodeId) || availableNodes[0];
    const vehicle = CONVOY_VEHICLES[this.selectedVehicleId];
    const commodity = COMMODITY_TYPES[this.selectedCommodity];

    const distKm = destNode ? calculateHaversineDistanceKm(originNode.lat, originNode.lng, destNode.lat, destNode.lng) : 1000;
    const transitHours = destNode ? trade.calculateTransitTicks(originNode, destNode, vehicle) : 12;

    // Max available stocks
    let maxAvail = 0;
    if (this.selectedCommodity === 'ENERGY') maxAvail = Math.floor(thermo.energy.batteryStoredKwh);
    else if (this.selectedCommodity === 'WATER') maxAvail = Math.floor(thermo.water.cisternStoredL);
    else if (this.selectedCommodity === 'FOOD') maxAvail = Math.floor(thermo.food.granaryStoredKcal);
    else if (this.selectedCommodity === 'MATERIALS') maxAvail = Math.floor((thermo.circularMaterials?.recycledAluminiumKg || 0) + (thermo.circularMaterials?.recycledPetgKg || 0));
    else if (this.selectedCommodity === 'SPARE_PARTS') maxAvail = 10;

    const clampedAmount = Math.min(this.dispatchAmount, maxAvail);
    const returnEstimate = !this.isSolidarity 
      ? trade.calculateBarterReturn(originNode.id, this.selectedDestNodeId, this.selectedCommodity, clampedAmount)
      : null;

    return `
      <div class="dispatch-view-wrapper">
        <!-- Village Stock Summary Banner -->
        <div class="village-stocks-summary-bar">
          <div class="stock-pill">⚡ Energy: <strong>${Math.floor(thermo.energy.batteryStoredKwh).toLocaleString()}</strong> / ${thermo.energy.batteryCapacityKwh} kWh</div>
          <div class="stock-pill">💧 Water: <strong>${Math.floor(thermo.water.cisternStoredL).toLocaleString()}</strong> / ${thermo.water.cisternCapacityL} L</div>
          <div class="stock-pill">🥗 Granary: <strong>${Math.floor(thermo.food.granaryStoredKcal).toLocaleString()}</strong> kcal</div>
          <div class="stock-pill">♻️ Materials: <strong>${Math.floor((thermo.circularMaterials?.recycledAluminiumKg || 0) + (thermo.circularMaterials?.recycledPetgKg || 0))}</strong> kg</div>
        </div>

        <!-- Section 1: 1-Click Recommended Missions -->
        ${this.renderSmartMissionsCards(trade, thermo, node)}

        <!-- Section 2: Accordion for Custom Route Builder -->
        <div class="custom-route-accordion">
          <div class="btn-toggle-custom-route" id="btn-toggle-custom-route">
            <span>🛠️ Or Build a Custom Route & Cargo (Advanced)</span>
            <span class="custom-toggle-arrow">${this.customDrawerOpen ? '▲ Hide' : '▼ Expand'}</span>
          </div>

          ${this.customDrawerOpen ? `
            <div class="dispatch-form-layout" style="margin-top: 14px;">
              <!-- Left: Destination & Vehicle -->
              <div class="dispatch-col">
                <div class="dispatch-section">
                  <label class="dispatch-label">1. Select Destination Commons</label>
                  <div class="node-select-grid">
                    ${availableNodes.map(n => {
                      const profile = trade.getTradeProfile(n.id);
                      const isSelected = n.id === this.selectedDestNodeId;
                      const dKm = calculateHaversineDistanceKm(originNode.lat, originNode.lng, n.lat, n.lng);
                      return `
                        <div class="node-select-card ${isSelected ? 'selected' : ''}" data-dest-id="${n.id}">
                          <div class="node-card-head">
                            <strong>${n.name}</strong>
                            <span class="dist-badge">${dKm} km</span>
                          </div>
                          <div class="node-trade-tags">
                            <span class="tag-surplus" title="Natural Surplus">Surplus: ${COMMODITY_TYPES[profile.surplus]?.icon || ''} ${profile.surplus}</span>
                            <span class="tag-deficit" title="Critical Deficit">Needs: ${COMMODITY_TYPES[profile.deficit]?.icon || ''} ${profile.deficit}</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <div class="dispatch-section">
                  <label class="dispatch-label">2. Select Transport Vehicle</label>
                  <div class="vehicle-select-grid">
                    ${Object.values(CONVOY_VEHICLES).map(v => `
                      <div class="vehicle-select-card ${v.id === this.selectedVehicleId ? 'selected' : ''}" data-veh-id="${v.id}">
                        <span class="veh-icon">${v.icon}</span>
                        <div class="veh-details">
                          <div class="veh-name">${v.name}</div>
                          <div class="veh-specs">⚡ ${v.energyDrawKwh} kWh • ⏱️ ${v.speedKmH} km/h • 📦 ${v.maxPayload} units</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Right: Cargo, Amount Presets & Reciprocal Preview -->
              <div class="dispatch-col">
                <div class="dispatch-section">
                  <label class="dispatch-label">3. Select Cargo & Amount</label>
                  <div class="commodity-pills-row">
                    ${Object.values(COMMODITY_TYPES).map(c => `
                      <button class="btn-commodity-pill ${c.id === this.selectedCommodity ? 'selected' : ''}" data-comm-id="${c.id}">
                        ${c.icon} ${c.name.split(' ')[0]}
                      </button>
                    `).join('')}
                  </div>

                  <div class="amount-slider-box">
                    <div class="slider-header-row">
                      <span>Payload Amount:</span>
                      <strong id="amount-display-val">${clampedAmount.toLocaleString()} ${commodity.unit}</strong>
                      <span class="text-dim">(Stock: ${maxAvail.toLocaleString()} ${commodity.unit})</span>
                    </div>

                    <div class="amount-presets-row">
                      <button class="btn-amount-preset" data-pct="0.15">15% Safe</button>
                      <button class="btn-amount-preset" data-pct="0.30">30% Balanced</button>
                      <button class="btn-amount-preset" data-pct="0.50">50% Generous</button>
                    </div>

                    <input type="range" id="input-dispatch-amount" min="10" max="${Math.max(10, maxAvail)}" value="${clampedAmount}" step="${this.selectedCommodity === 'FOOD' ? 5000 : (this.selectedCommodity === 'WATER' ? 250 : 5)}" />
                  </div>

                  <!-- Solidarity Mode Toggle -->
                  <div class="solidarity-toggle-card">
                    <label class="toggle-checkbox-label">
                      <input type="checkbox" id="check-solidarity-mode" ${this.isSolidarity ? 'checked' : ''} />
                      <span class="toggle-box-custom"></span>
                      <div>
                        <strong>🕊️ Solidarity Mutual Aid Gift (Non-Barter)</strong>
                        <p>Send unilateral aid without demanding reciprocal cargo. Boosts community morale (+8%) and lowers Legacy Threat level.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Reciprocal Exchange Summary Card -->
                <div class="exchange-preview-card">
                  <h4>🔄 Logistics & Thermodynamic Exchange Manifest</h4>
                  <div class="preview-metric-row">
                    <span>Transit Time (One-Way):</span>
                    <strong>${transitHours} hours (${Math.round(transitHours / 24 * 10) / 10} days)</strong>
                  </div>
                  <div class="preview-metric-row">
                    <span>Propulsion Energy Draw:</span>
                    <strong>${vehicle.energyDrawKwh} kWh battery reserve</strong>
                  </div>

                  ${!this.isSolidarity && returnEstimate ? `
                    <div class="reciprocal-box ${returnEstimate.isBonusApplied ? 'bonus-applied' : ''}">
                      <div class="reciprocal-header">
                        <span>${returnEstimate.isBonusApplied ? '⭐ +35% Bioregional Reciprocity Bonus!' : 'Standard Barter Return:'}</span>
                      </div>
                      <div class="reciprocal-val">
                        ${returnEstimate.icon} <strong>+${returnEstimate.amount.toLocaleString()} ${returnEstimate.unit}</strong> of ${returnEstimate.name}
                      </div>
                      <p class="reciprocal-desc">Partner node reciprocates from their local bioregional surplus upon arrival.</p>
                    </div>
                  ` : `
                    <div class="solidarity-active-banner">
                      <span>🤝 Unconditional mutual aid creates lasting planetary trust and emergency mutual aid pacts.</span>
                    </div>
                  `}

                  <button id="btn-submit-dispatch" class="btn-primary btn-dispatch-large" ${maxAvail <= 0 ? 'disabled' : ''}>
                    🚀 Launch Custom Convoy to ${destNode.name}
                  </button>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderDirectoryTab(trade) {
    return `
      <div class="trade-directory-layout">
        <div class="directory-intro">
          <h4>🌍 Planetary Bioregional Commons Directory</h4>
          <p>Each federated haven is shaped by its local bioregion and climate archetype. True resilience relies on complementary mutual aid rather than corporate supply chains.</p>
        </div>

        <div class="directory-grid">
          ${trade.allNodes.map(n => {
            const profile = trade.getTradeProfile(n.id);
            const isLocal = n.id === trade.playerNodeId;
            const hasPact = trade.solidarityPacts.has(n.id);

            return `
              <div class="directory-card ${isLocal ? 'local-node' : ''}">
                <div class="directory-card-head">
                  <div>
                    <h4>${n.name} ${isLocal ? '🏠 (Your Settlement)' : ''}</h4>
                    <span class="bioregion-subtitle">${n.bioregion} • ${n.country}</span>
                  </div>
                  ${hasPact ? '<span class="pact-badge">🤝 Mutual Aid Pact Active</span>' : ''}
                </div>

                <p class="directory-quote">"${n.quote}"</p>

                <div class="directory-flows">
                  <div class="flow-pill surplus">
                    <span>Abundant Surplus:</span>
                    <strong>${COMMODITY_TYPES[profile.surplus]?.icon || ''} ${COMMODITY_TYPES[profile.surplus]?.name || profile.surplus}</strong>
                  </div>
                  <div class="flow-pill deficit">
                    <span>Critical Need:</span>
                    <strong>${COMMODITY_TYPES[profile.deficit]?.icon || ''} ${COMMODITY_TYPES[profile.deficit]?.name || profile.deficit}</strong>
                  </div>
                </div>

                ${!isLocal ? `
                  <button class="btn-card-dispatch" data-target-node-id="${n.id}">
                    🚚 Plan Convoy Route
                  </button>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderHistoryTab(trade) {
    if (trade.convoyHistory.length === 0) {
      return `
        <div class="convoys-empty-state">
          <div class="empty-icon">📜</div>
          <h4>No Completed Convoys Recorded</h4>
          <p>Convoys that return safely home will deposit their logistical manifest into this ledger.</p>
        </div>
      `;
    }

    return `
      <div class="history-table-wrapper">
        <div class="totals-summary-bar">
          <div>⚡ <strong>${trade.totalGoodsExchanged.energyKwh.toLocaleString()}</strong> kWh</div>
          <div>💧 <strong>${trade.totalGoodsExchanged.waterL.toLocaleString()}</strong> L</div>
          <div>🥗 <strong>${trade.totalGoodsExchanged.foodKcal.toLocaleString()}</strong> kcal</div>
          <div>♻️ <strong>${trade.totalGoodsExchanged.materialsKg.toLocaleString()}</strong> kg</div>
          <div>🧰 <strong>${trade.totalGoodsExchanged.spareParts.toLocaleString()}</strong> parts</div>
        </div>

        <div class="history-list">
          ${trade.convoyHistory.map(h => `
            <div class="history-item-row">
              <span class="hist-icon">${h.vehicleIcon}</span>
              <div class="hist-details">
                <strong>${h.name}</strong>
                <span class="text-dim">${h.originName} ➔ ${h.destName} (${h.distanceKm} km)</span>
              </div>
              <div class="hist-manifest">
                Sent: <span class="text-yellow">${h.outgoingAmount.toLocaleString()} ${h.outgoingUnit}</span>
                ${h.returnCargo ? ` | Received: <span class="text-green">+${h.returnCargo.amount.toLocaleString()} ${h.returnCargo.unit}</span>` : ' | Solidarity Aid'}
              </div>
              <span class="hist-tick text-dim">Tick ${h.completedAtTick || 0}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindTabInteractions() {
    if (!this.contentEl) return;

    // Tab buttons
    this.contentEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.getAttribute('data-ctab');
        this.currentTab = tab;
        this.render();
      };
    });

    // Go to dispatch from empty state or top bar
    this.contentEl.querySelectorAll('.btn-goto-dispatch, .btn-quick-dispatch-more').forEach(btn => {
      btn.onclick = () => {
        this.currentTab = 'dispatch';
        this.render();
      };
    });

    // Go to custom route builder directly from empty state
    const gotoCustomBtn = this.contentEl.querySelector('.btn-goto-custom');
    if (gotoCustomBtn) {
      gotoCustomBtn.onclick = () => {
        this.currentTab = 'dispatch';
        this.customDrawerOpen = true;
        this.render();
      };
    }

    // Toggle Custom Route Builder Accordion
    const toggleCustom = this.contentEl.querySelector('#btn-toggle-custom-route');
    if (toggleCustom) {
      toggleCustom.onclick = () => {
        this.customDrawerOpen = !this.customDrawerOpen;
        this.render();
      };
    }

    // Smart 1-Click Mission Launch buttons
    this.contentEl.querySelectorAll('.btn-smart-launch').forEach(btn => {
      btn.onclick = () => {
        const missionIdx = parseInt(btn.getAttribute('data-mission-idx'), 10);
        const mission = this.currentSmartMissions[missionIdx];
        if (!mission) return;

        const res = this.sim.trade.dispatchConvoy({
          originNodeId: this.sim.node.id,
          destNodeId: mission.destNode.id,
          vehicleId: mission.vehicleId,
          commodityType: mission.commodityType,
          amount: mission.amount,
          isSolidarity: mission.isSolidarity,
          thermo: this.sim.thermo,
          node: this.sim.node
        });

        if (res.success) {
          this.sim.emitNotification('🚀 Convoy Dispatched', res.message);
          this.currentTab = 'active';
          this.render();
          this.onDispatch(res.convoy);
        } else {
          alert(`Cannot dispatch convoy: ${res.reason}`);
        }
      };
    });

    // Preset amount buttons
    this.contentEl.querySelectorAll('.btn-amount-preset').forEach(btn => {
      btn.onclick = () => {
        const pct = parseFloat(btn.getAttribute('data-pct'));
        const thermo = this.sim.thermo;
        let maxAvail = 0;
        if (this.selectedCommodity === 'ENERGY') maxAvail = Math.floor(thermo.energy.batteryStoredKwh);
        else if (this.selectedCommodity === 'WATER') maxAvail = Math.floor(thermo.water.cisternStoredL);
        else if (this.selectedCommodity === 'FOOD') maxAvail = Math.floor(thermo.food.granaryStoredKcal);
        else if (this.selectedCommodity === 'MATERIALS') maxAvail = Math.floor((thermo.circularMaterials?.recycledAluminiumKg || 0) + (thermo.circularMaterials?.recycledPetgKg || 0));
        else if (this.selectedCommodity === 'SPARE_PARTS') maxAvail = 10;

        this.dispatchAmount = Math.max(10, Math.floor(maxAvail * pct));
        this.render();
      };
    });

    // Node select cards in custom dispatch tab
    this.contentEl.querySelectorAll('.node-select-card').forEach(card => {
      card.onclick = () => {
        this.selectedDestNodeId = card.getAttribute('data-dest-id');
        this.render();
      };
    });

    // Vehicle select cards in custom dispatch tab
    this.contentEl.querySelectorAll('.vehicle-select-card').forEach(card => {
      card.onclick = () => {
        this.selectedVehicleId = card.getAttribute('data-veh-id');
        this.render();
      };
    });

    // Commodity pills in custom dispatch tab
    this.contentEl.querySelectorAll('.btn-commodity-pill').forEach(pill => {
      pill.onclick = () => {
        this.selectedCommodity = pill.getAttribute('data-comm-id');
        // Reset reasonable default amount
        if (this.selectedCommodity === 'FOOD') this.dispatchAmount = 60000;
        else if (this.selectedCommodity === 'WATER') this.dispatchAmount = 2000;
        else if (this.selectedCommodity === 'ENERGY') this.dispatchAmount = 50;
        else if (this.selectedCommodity === 'MATERIALS') this.dispatchAmount = 30;
        else if (this.selectedCommodity === 'SPARE_PARTS') this.dispatchAmount = 2;
        this.render();
      };
    });

    // Amount slider in custom dispatch tab
    const slider = this.contentEl.querySelector('#input-dispatch-amount');
    if (slider) {
      slider.oninput = e => {
        this.dispatchAmount = parseInt(e.target.value, 10);
        const display = this.contentEl.querySelector('#amount-display-val');
        const comm = COMMODITY_TYPES[this.selectedCommodity];
        if (display && comm) {
          display.textContent = `${this.dispatchAmount.toLocaleString()} ${comm.unit}`;
        }
      };
      slider.onchange = () => {
        this.render();
      };
    }

    // Solidarity checkbox in custom dispatch tab
    const solidCheck = this.contentEl.querySelector('#check-solidarity-mode');
    if (solidCheck) {
      solidCheck.onchange = e => {
        this.isSolidarity = e.target.checked;
        this.render();
      };
    }

    // Plan convoy from directory card
    this.contentEl.querySelectorAll('.btn-card-dispatch').forEach(btn => {
      btn.onclick = () => {
        this.selectedDestNodeId = btn.getAttribute('data-target-node-id');
        this.currentTab = 'dispatch';
        this.customDrawerOpen = true;
        this.render();
      };
    });

    // Submit Custom Dispatch Button
    const submitBtn = this.contentEl.querySelector('#btn-submit-dispatch');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const res = this.sim.trade.dispatchConvoy({
          originNodeId: this.sim.node.id,
          destNodeId: this.selectedDestNodeId,
          vehicleId: this.selectedVehicleId,
          commodityType: this.selectedCommodity,
          amount: this.dispatchAmount,
          isSolidarity: this.isSolidarity,
          thermo: this.sim.thermo,
          node: this.sim.node
        });

        if (res.success) {
          this.sim.emitNotification('🚀 Convoy Dispatched', res.message);
          this.currentTab = 'active';
          this.render();
          this.onDispatch(res.convoy);
        } else {
          alert(`Cannot dispatch convoy: ${res.reason}`);
        }
      };
    }
  }
}
