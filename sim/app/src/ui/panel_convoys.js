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

  renderActiveTab(convoys) {
    if (convoys.length === 0) {
      return `
        <div class="convoys-empty-state">
          <div class="empty-icon">🚚💤</div>
          <h4>${t('noActiveConvoysTitle', 'No Active Convoys in Transit')}</h4>
          <p>${t('noActiveConvoysDesc', 'Your settlement is not currently exchanging goods with federated sister nodes. Launch a barter trade or solidarity caravan to balance local thermodynamics!')}</p>
          <button class="btn-primary btn-goto-dispatch" style="margin-top: 14px;">
            🚀 ${t('btnLaunchConvoyNow', 'Launch Convoy Now')}
          </button>
        </div>
      `;
    }

    return `
      <div class="convoys-list">
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
    const availableNodes = trade.allNodes.filter(n => n.id !== trade.playerNodeId);
    const originNode = trade.getNodeById(trade.playerNodeId) || { lat: 42.3, lng: -83.1, name: 'Detroit Delray' };
    const destNode = trade.getNodeById(this.selectedDestNodeId) || availableNodes[0];
    const vehicle = CONVOY_VEHICLES[this.selectedVehicleId];
    const commodity = COMMODITY_TYPES[this.selectedCommodity];

    const distKm = destNode ? calculateHaversineDistanceKm(originNode.lat, originNode.lng, destNode.lat, destNode.lng) : 1000;
    const transitHours = destNode ? trade.calculateTransitTicks(originNode, destNode, vehicle) : 12;
    const destProfile = trade.getTradeProfile(this.selectedDestNodeId);

    // Max available stocks
    let maxAvail = 0;
    if (this.selectedCommodity === 'ENERGY') maxAvail = Math.floor(thermo.energy.batteryStoredKwh);
    else if (this.selectedCommodity === 'WATER') maxAvail = Math.floor(thermo.water.cisternStoredL);
    else if (this.selectedCommodity === 'FOOD') maxAvail = Math.floor(thermo.food.granaryStoredKcal);
    else if (this.selectedCommodity === 'MATERIALS') maxAvail = Math.floor((thermo.circularMaterials?.recycledAluminiumKg || 0) + (thermo.circularMaterials?.recycledPetgKg || 0));
    else if (this.selectedCommodity === 'SPARE_PARTS') maxAvail = 10;

    const clampedAmount = Math.min(this.dispatchAmount, maxAvail);
    const returnEstimate = !this.isSolidarity 
      ? trade.calculateBarterReturn(trade.playerNodeId, this.selectedDestNodeId, this.selectedCommodity, clampedAmount)
      : null;

    return `
      <div class="dispatch-form-layout">
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

        <!-- Right: Cargo, Amount & Reciprocal Preview -->
        <div class="dispatch-col">
          <div class="dispatch-section">
            <label class="dispatch-label">3. Select Cargo Commodity</label>
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
              <input type="range" id="input-dispatch-amount" min="10" max="${Math.max(10, maxAvail)}" value="${clampedAmount}" step="${this.selectedCommodity === 'FOOD' ? 10000 : (this.selectedCommodity === 'WATER' ? 500 : 10)}" />
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
              🚀 Launch Convoy to ${destNode.name}
            </button>
          </div>
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

    // Go to dispatch from empty state
    const gotoBtn = this.contentEl.querySelector('.btn-goto-dispatch');
    if (gotoBtn) {
      gotoBtn.onclick = () => {
        this.currentTab = 'dispatch';
        this.render();
      };
    }

    // Node select cards in dispatch tab
    this.contentEl.querySelectorAll('.node-select-card').forEach(card => {
      card.onclick = () => {
        this.selectedDestNodeId = card.getAttribute('data-dest-id');
        this.render();
      };
    });

    // Vehicle select cards
    this.contentEl.querySelectorAll('.vehicle-select-card').forEach(card => {
      card.onclick = () => {
        this.selectedVehicleId = card.getAttribute('data-veh-id');
        this.render();
      };
    });

    // Commodity pills
    this.contentEl.querySelectorAll('.btn-commodity-pill').forEach(pill => {
      pill.onclick = () => {
        this.selectedCommodity = pill.getAttribute('data-comm-id');
        // Reset reasonable default amount
        if (this.selectedCommodity === 'FOOD') this.dispatchAmount = 100000;
        else if (this.selectedCommodity === 'WATER') this.dispatchAmount = 3000;
        else if (this.selectedCommodity === 'ENERGY') this.dispatchAmount = 80;
        else if (this.selectedCommodity === 'MATERIALS') this.dispatchAmount = 50;
        else if (this.selectedCommodity === 'SPARE_PARTS') this.dispatchAmount = 2;
        this.render();
      };
    });

    // Amount slider
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

    // Solidarity checkbox
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
        this.render();
      };
    });

    // Submit Dispatch Button
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
