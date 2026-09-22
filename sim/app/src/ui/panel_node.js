/**
 * Node Management & Chores Drawer Controller (Agent SIM-5)
 * Fully internationalized with t() for English and multilingual support.
 * Allows player to reallocate subsistence labor, inspect dynamic usufruct housing,
 * view the circular furniture swap shop, and perform preventive maintenance.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';
import { COMMUNITY_VOCATIONS, getVocationById, getVocationsByDomain } from '../data/vocations.js';

export class PanelNodeController {
  constructor(sim, onActionCallback = () => {}) {
    this.sim = sim;
    this.onAction = onActionCallback;
    this.modalEl = document.getElementById('modal-node-management');
    this.contentEl = document.getElementById('node-management-content');
    this.closeBtn = document.getElementById('btn-close-node-modal');
    this.currentTab = 'chores';
    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    // Close on backdrop click
    if (this.modalEl) {
      this.modalEl.addEventListener('click', e => {
        if (e.target === this.modalEl) this.close();
      });
    }
  }

  open(tab = 'chores') {
    if (!this.modalEl) return;
    this.currentTab = tab;
    this.modalEl.classList.remove('hidden');
    this.render(this.currentTab);
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }

  render(activeTab = 'chores') {
    this.currentTab = activeTab;
    if (!this.contentEl) return;
    const node = this.sim.node;
    const thermo = this.sim.thermo;

    let html = `
      <div class="modal-tabs">
        <button class="tab-btn ${activeTab === 'chores' ? 'active' : ''}" data-tab="chores">${t('tabChores', '📋 Chore Roster')}</button>
        <button class="tab-btn ${activeTab === 'housing' ? 'active' : ''}" data-tab="housing">${t('tabHousing', '🏘️ Usufruct Housing & Reuse')}</button>
        <button class="tab-btn ${activeTab === 'agriculture' ? 'active' : ''}" data-tab="agriculture">🥗 Agriculture & Resilience</button>
        <button class="tab-btn ${activeTab === 'machinery' ? 'active' : ''}" data-tab="machinery">${t('tabMachinery', '⚙️ Machinery & Entropy')}</button>
      </div>
      <div class="tab-body">
    `;

    if (activeTab === 'chores') {
      const stats = node.updateLaborAndMorale();
      const activeVoc = getVocationById(node.playerVocation) || COMMUNITY_VOCATIONS[0];
      
      const vocationCounts = {};
      if (node.citizens) {
        for (const c of node.citizens) {
          const vid = c.vocationId || 'farmer';
          vocationCounts[vid] = (vocationCounts[vid] || 0) + 1;
        }
      }

      html += `
        <div class="chores-view">
          ${stats.hasUncoveredEmergency ? `
            <div class="uncovered-emergency-banner">
              <span class="emergency-icon">⚠️</span>
              <div>
                <strong>${t('uncoveredAlertTitle', 'Civic Rotation Required:')}</strong>
                <span>${t('uncoveredAlertDesc', 'Uncovered vital sector:')} <strong>${stats.uncoveredDomains.join(', ').toUpperCase()}</strong>. ${t('uncoveredAlertNote', 'In O.N.E. everyone has freedom of vocation, but if an essential post has 0 workers, the community triggers a temporary civic rotation!')}</span>
              </div>
            </div>
          ` : ''}

          <div class="summary-card">
            <div class="summary-header-row">
              <h4>${t('choresTitle', 'Subsistence Labor Allocation (Voluntary Vocations)')}</h4>
              <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> O.N.E. CIVIC ROSTER</span>
            </div>
            <p>${t('choresSubtitle', 'In O.N.E. you choose your vocation freely. Heavy physical labor counts for DOUBLE (2.0x credit), fulfilling social obligations in half the time! Robots built in the FabLab eliminate remaining hours.')}</p>
            
            <!-- Active Vocation Spotlight Card -->
            <div class="active-vocation-spotlight">
              <div class="vocation-card-top">
                <div class="vocation-icon-glow">${activeVoc.icon}</div>
                <div class="vocation-spotlight-text">
                  <div class="vocation-title-row">
                    <h5>${t(activeVoc.nameKey, activeVoc.defaultName)}</h5>
                    <span class="multiplier-badge-glow ${activeVoc.isHeavyLabor ? 'heavy' : 'standard'}">
                      ${activeVoc.multiplier}x ${t('vocationEffortCredit', 'Labor Credit')} ${activeVoc.isHeavyLabor ? '🏋️' : ''}
                    </span>
                  </div>
                  <p class="vocation-desc-line">${t(activeVoc.descKey, activeVoc.defaultDesc)}</p>
                  <div class="vocation-bonus-tag">
                    <span class="bonus-label">✨ ${t('vocationBonusLabel', 'Systemic Bonus:')}</span>
                    <span class="bonus-val">${t(activeVoc.bonusKey, activeVoc.defaultBonus)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 11 Community Vocations Selector -->
            <div class="vocation-selection-cluster">
              <div class="vocation-cluster-header">
                <span>🌱 ${t('vocationSelectorTitle', 'Your Preferred Vocation (Free Choice):')}</span>
                <span class="text-dim-small">${t('vocationChangePrompt', 'Click any role to specialize')}</span>
              </div>

              <!-- Domain Groups -->
              <div class="vocation-domains-grid">
                <!-- 1. Land -->
                <div class="domain-group">
                  <div class="domain-header"><span>${t('vocationDomainAgri', '🌾 Land & Agro-Ecology')}</span></div>
                  <div class="vocation-pills">
                    ${getVocationsByDomain('agriculture').map(v => `
                      <button class="btn-vocation-pill ${node.playerVocation === v.id ? 'active' : ''} ${v.isHeavyLabor ? 'heavy-pill' : ''}" data-vocation="${v.id}" title="${t(v.descKey, v.defaultDesc)}">
                        <span class="voc-pill-icon">${v.icon}</span>
                        <span class="voc-pill-name">${t(v.nameKey, v.defaultName)}</span>
                        <span class="voc-pill-mult">${v.multiplier}x ${v.isHeavyLabor ? '🏋️' : ''}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- 2. Facilities -->
                <div class="domain-group">
                  <div class="domain-header"><span>${t('vocationDomainFac', '⚡ Energy, Water & Mesh')}</span></div>
                  <div class="vocation-pills">
                    ${getVocationsByDomain('facilities').map(v => `
                      <button class="btn-vocation-pill ${node.playerVocation === v.id ? 'active' : ''}" data-vocation="${v.id}" title="${t(v.descKey, v.defaultDesc)}">
                        <span class="voc-pill-icon">${v.icon}</span>
                        <span class="voc-pill-name">${t(v.nameKey, v.defaultName)}</span>
                        <span class="voc-pill-mult">${v.multiplier}x</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- 3. Care -->
                <div class="domain-group">
                  <div class="domain-header"><span>${t('vocationDomainCare', '❤️ Health, Education & Care')}</span></div>
                  <div class="vocation-pills">
                    ${getVocationsByDomain('care').map(v => `
                      <button class="btn-vocation-pill ${node.playerVocation === v.id ? 'active' : ''}" data-vocation="${v.id}" title="${t(v.descKey, v.defaultDesc)}">
                        <span class="voc-pill-icon">${v.icon}</span>
                        <span class="voc-pill-name">${t(v.nameKey, v.defaultName)}</span>
                        <span class="voc-pill-mult">${v.multiplier}x</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- 4. Workshop -->
                <div class="domain-group">
                  <div class="domain-header"><span>${t('vocationDomainWork', '🛠️ FabLab & Circular Workshop')}</span></div>
                  <div class="vocation-pills">
                    ${getVocationsByDomain('workshop').map(v => `
                      <button class="btn-vocation-pill ${node.playerVocation === v.id ? 'active' : ''} ${v.isHeavyLabor ? 'heavy-pill' : ''}" data-vocation="${v.id}" title="${t(v.descKey, v.defaultDesc)}">
                        <span class="voc-pill-icon">${v.icon}</span>
                        <span class="voc-pill-name">${t(v.nameKey, v.defaultName)}</span>
                        <span class="voc-pill-mult">${v.multiplier}x ${v.isHeavyLabor ? '🏋️' : ''}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Demographic Age & Generation Breakdown -->
            <div class="demographic-pyramid-box" style="margin-bottom: 16px; padding: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px;">
              <div class="census-header-row" style="margin-bottom: 8px;">
                <span>👥 ${t('nodeAgeDemographicsTitle', 'Demographic Generation & Life Stages')}</span>
                <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> INTERGENERATIONAL COMMONS</span>
              </div>
              <div class="demographics-pills" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div class="demo-pill" style="flex: 1; min-width: 140px; padding: 8px 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: 6px;">
                  <strong style="color: #fb7185;">👶 ${stats.demographics?.childrenCount || 4} Children & Pupils</strong>
                  <div style="font-size: 11px; color: #cbd5e1;">Commons School & Nursery • 0h Labor Duty (Art. 5.3)</div>
                </div>
                <div class="demo-pill" style="flex: 1; min-width: 140px; padding: 8px 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px;">
                  <strong style="color: #34d399;">🧑 ${stats.demographics?.adultsCount || 18} Active Adults</strong>
                  <div style="font-size: 11px; color: #cbd5e1;">Rotational maintenance chores (${stats.choreHoursPerCitizen || 1.8}h/day)</div>
                </div>
                <div class="demo-pill" style="flex: 1; min-width: 140px; padding: 8px 12px; background: rgba(148, 163, 184, 0.15); border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 6px;">
                  <strong style="color: #e2e8f0;">🧓 ${stats.demographics?.eldersCount || 6} Elders & Mentors</strong>
                  <div style="font-size: 11px; color: #cbd5e1;">Intergenerational Sanctuary • Exempt from physical toil (Art. 5.6)</div>
                </div>
              </div>
            </div>

            <!-- Demographics Census by Vocation -->
            <div class="vocation-census-box">
              <div class="census-header-row">
                <span>📊 ${t('nodeDemographicsTitle', 'Adult Vocations & Specializations')}</span>
                <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> CIVIC CENSUS</span>
              </div>
              <div class="census-chips-grid">
                ${COMMUNITY_VOCATIONS.map(v => {
                  const count = vocationCounts[v.id] || 0;
                  return `
                    <div class="census-chip ${count > 0 ? '' : 'empty'}">
                      <span class="census-icon">${v.icon}</span>
                      <span class="census-name">${t(v.nameKey, v.defaultName).split('&')[0].trim()}</span>
                      <span class="census-count">${count}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="metrics-grid">
              <div><strong>${t('populationLabel', 'Population:')}</strong> ${node.population} ${t('meterCitizens', 'citizens')}</div>
              <div><strong>${t('freeTimeLabel', 'Free Time:')}</strong> ${stats.averageFreeHoursPerDay} hrs/day</div>
              <div><strong>${t('moraleLabel', 'Morale:')}</strong> ${stats.communityMorale}% (+8% youth vitality)</div>
              <div><strong>${t('dailyChoresLabel', 'Physical Work Needed:')}</strong> ${stats.totalChoreHoursNeeded} ${t('workerHoursTotal', 'hrs/day (weighted)')}</div>
            </div>
          </div>

          <div class="chore-cards-grid">
            <!-- 1. LAND / AGRICULTURE (2.0x HEAVY LABOR) -->
            <div class="chore-card ${stats.uncoveredDomains?.includes('agriculture') ? 'uncovered-card' : ''}">
              <div class="chore-header">
                <div>
                  <h5>${t('choreAgriName', '🥗 Land Shift (Agriculture)')}</h5>
                  <span class="multiplier-tag heavy">🏋️ ${t('heavyLaborBadge', 'Heavy Labor: 2.0x Credit (1h = 2h fulfilled!)')}</span>
                </div>
                <span class="badge ${node.choreAssignments.agriculture === 0 ? 'badge-danger' : ''}">${node.choreAssignments.agriculture} ${t('meterCitizens', 'citizens')}</span>
              </div>
              <p>${t('choreAgriDesc', 'Greenhouses, micro-farms, composting, mushroom cellars.')}</p>
              <div class="chore-stats">
                <span>${t('requiredLabel', 'Required:')} ${node.choreRequirements.agriculture} credit-h/day</span>
                <span class="text-green">${t('robotCancelledLabel', 'Robot cancelled:')} -${stats.cancelledHours.agriculture}h</span>
              </div>
              <div class="btn-group">
                <button class="btn-sm" data-chore-action="sub" data-chore="agriculture">-</button>
                <button class="btn-sm" data-chore-action="add" data-chore="agriculture">+</button>
              </div>
            </div>

            <!-- 2. FACILITIES (1.3x TECHNICAL LABOR) -->
            <div class="chore-card ${stats.uncoveredDomains?.includes('facilities') ? 'uncovered-card' : ''}">
              <div class="chore-header">
                <div>
                  <h5>${t('choreFacName', '⚡ Facilities Shift (Infrastructure)')}</h5>
                  <span class="multiplier-tag medium">⚙️ ${t('technicalLaborBadge', 'Technical Labor: 1.3x Credit')}</span>
                </div>
                <span class="badge ${node.choreAssignments.facilities === 0 ? 'badge-danger' : ''}">${node.choreAssignments.facilities} ${t('meterCitizens', 'citizens')}</span>
              </div>
              <p>${t('choreFacDesc', 'Solar inverters, battery monitoring, water pumps, greywater.')}</p>
              <div class="chore-stats">
                <span>${t('requiredLabel', 'Required:')} ${node.choreRequirements.facilities} credit-h/day</span>
                <span class="text-green">${t('robotCancelledLabel', 'Robot cancelled:')} -${stats.cancelledHours.facilities}h</span>
              </div>
              <div class="btn-group">
                <button class="btn-sm" data-chore-action="sub" data-chore="facilities">-</button>
                <button class="btn-sm" data-chore-action="add" data-chore="facilities">+</button>
              </div>
            </div>

            <!-- 3. CARE (1.0x SOCIAL LABOR) -->
            <div class="chore-card ${stats.uncoveredDomains?.includes('care') ? 'uncovered-card' : ''}">
              <div class="chore-header">
                <div>
                  <h5>${t('choreCareName', '❤️ Care Shift (Community Health)')}</h5>
                  <span class="multiplier-tag">❤️ ${t('socialLaborBadge', 'Social Care: 1.0x Credit')}</span>
                </div>
                <span class="badge ${node.choreAssignments.care === 0 ? 'badge-danger' : ''}">${node.choreAssignments.care} ${t('meterCitizens', 'citizens')}</span>
              </div>
              <p>${t('choreCareDesc', 'Common kitchen, child daycare, wellness clinic, sanitation.')}</p>
              <div class="chore-stats">
                <span>${t('requiredLabel', 'Required:')} ${node.choreRequirements.care} credit-h/day</span>
                <span class="text-green">${t('robotCancelledLabel', 'Robot cancelled:')} -${stats.cancelledHours.care}h</span>
              </div>
              <div class="btn-group">
                <button class="btn-sm" data-chore-action="sub" data-chore="care">-</button>
                <button class="btn-sm" data-chore-action="add" data-chore="care">+</button>
              </div>
            </div>

            <!-- 4. WORKSHOP / FABLAB (1.8x HEAVY MECHANICAL) -->
            <div class="chore-card ${stats.uncoveredDomains?.includes('workshop') ? 'uncovered-card' : ''}">
              <div class="chore-header">
                <div>
                  <h5>${t('choreWorkName', '🔧 Workshop Shift (FabLab & Repair)')}</h5>
                  <span class="multiplier-tag heavy">🔨 ${t('workshopLaborBadge', 'Heavy Mechanical: 1.8x Credit')}</span>
                </div>
                <span class="badge ${node.choreAssignments.workshop === 0 ? 'badge-danger' : ''}">${node.choreAssignments.workshop} ${t('meterCitizens', 'citizens')}</span>
              </div>
              <p>${t('choreWorkDesc', 'Preventive maintenance, CNC milling, closed-loop plastic shredder.')}</p>
              <div class="chore-stats">
                <span>${t('requiredLabel', 'Required:')} ${node.choreRequirements.workshop} credit-h/day</span>
                <span class="text-green">${t('robotCancelledLabel', 'Robot cancelled:')} -${stats.cancelledHours.workshop}h</span>
              </div>
              <div class="btn-group">
                <button class="btn-sm" data-chore-action="sub" data-chore="workshop">-</button>
                <button class="btn-sm" data-chore-action="add" data-chore="workshop">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'housing') {
      const occupiedCount = node.housingPool.filter(h => h.occupiedBy).length;
      const reserveCount = node.housingPool.length - occupiedCount;

      html += `
        <div class="housing-view">
          <div class="summary-card">
            <div class="summary-header-row">
              <h4>${t('usufructTitle', 'Dynamic Usufruct ("Use It or Lose It")')}</h4>
              <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> DYNAMIC USUFRUCT</span>
            </div>
            <p>${t('usufructSubtitle', 'Speculative rent and eviction are physically impossible. Abandoned dwellings return to the community; personal belongings are 100% inviolable.')}</p>
            <div class="metrics-grid">
              <div><strong>${t('totalPodsLabel', 'Total Pods:')}</strong> ${node.housingPool.length}</div>
              <div><strong>${t('occupiedLabel', 'Occupied:')}</strong> ${occupiedCount}</div>
              <div><strong>${t('civicReserveLabel', 'Civic Reserve:')}</strong> ${reserveCount}</div>
            </div>
          </div>

          <div class="furniture-shop-box">
            <div class="summary-header-row">
              <h4>${t('furnitureShopTitle', '🛋️ Civic Furniture Reuse Depot (Furniture Swap Shop)')}</h4>
              <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> CIRCULAR COMMONS</span>
            </div>
            <p>${t('furnitureShopSubtitle', 'Heavy furniture left from reclaimed pods is freely available to any new arrival at zero cost:')}</p>
            <div class="furniture-chips">
              <span class="chip">${t('furnitureBeds', '🛏️ Beds:')} <strong>${node.furnitureSwapShop.beds}</strong></span>
              <span class="chip">${t('furnitureChairs', '🪑 Chairs:')} <strong>${node.furnitureSwapShop.chairs}</strong></span>
              <span class="chip">${t('furnitureTables', '🪵 Tables:')} <strong>${node.furnitureSwapShop.tables}</strong></span>
              <span class="chip">${t('furnitureWardrobes', '🚪 Wardrobes:')} <strong>${node.furnitureSwapShop.wardrobes}</strong></span>
              <span class="chip">${t('furnitureWorkbenches', '🔨 Workbenches:')} <strong>${node.furnitureSwapShop.workbenches}</strong></span>
            </div>
          </div>

          <h4>${t('bioclimaticHousingUnitsTitle', 'Bioclimatic Housing Units')}</h4>
          <div class="housing-grid">
            ${node.housingPool.slice(0, 16).map(u => `
              <div class="pod-card ${u.occupiedBy ? 'occupied' : 'reserve'}">
                <div class="pod-header-stamp">
                  <span class="pod-id">${u.id}</span>
                  <img src="/one-logo-white.svg" alt="O.N.E." class="pod-mini-stamp" title="O.N.E. Usufruct Certified" />
                </div>
                <div class="pod-type">${u.type}</div>
                <div class="pod-status">${u.occupiedBy ? `${t('podOccupied', 'Occupied')} (${u.occupiedBy})` : t('podCivicReserve', '🟢 Civic Reserve')}</div>
                ${u.sabbaticalLockUntilTick ? `<div class="badge-lock">${t('sabbaticalActiveBadge', '🔒 Sabbatical Active')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'machinery') {
      html += `
        <div class="machinery-view">
          <div class="summary-card">
            <div class="summary-header-row">
              <h4>${t('entropyTitle', 'Second-Law Thermodynamics (Entropy & Wear)')}</h4>
              <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> THERMODYNAMIC CORE</span>
            </div>
            <p>${t('entropySubtitle', 'Machines degrade with load. If durability drops below 25%, efficiency falls and leakage occurs. Perform artisan repair or closed-loop shredding/smelting.')}</p>
          </div>

          <div class="machinery-list">
            ${Object.entries(thermo.machinery).map(([key, item]) => `
              <div class="machine-row" style="margin-bottom: 12px; padding: 10px; background: rgba(15, 23, 42, 0.4); border-radius: 8px;">
                <div class="machine-info" style="display: flex; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                  <div>
                    <strong>${item.name}</strong>
                    <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">⏳ ${item.ageYears || 1.2} yrs (${item.operatingHours || 4000}h runtime)</span>
                  </div>
                  <div style="display: flex; gap: 12px;">
                    <span class="${item.durability < 25 ? 'text-red' : 'text-green'}">${Math.round(item.durability)}% ${t('durabilityLabel', 'Durability')}</span>
                    <span style="color: #38bdf8;">${Math.round(item.lifecycleHealth || 95)}% Nominal Capacity</span>
                  </div>
                </div>
                <div class="progress-bar-container" style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <div style="flex: 1;">
                    <div style="font-size: 10px; color: #94a3b8; margin-bottom: 2px;">Short-term Wear (Durability):</div>
                    <div class="progress-bar ${item.durability < 25 ? 'bg-red' : 'bg-emerald'}" style="width: ${item.durability}%; height: 6px;"></div>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-size: 10px; color: #94a3b8; margin-bottom: 2px;">Long-term Lifecycle Health:</div>
                    <div class="progress-bar" style="width: ${item.lifecycleHealth || 95}%; height: 6px; background: #06b6d4;"></div>
                  </div>
                </div>
                <div class="machine-actions" style="display: flex; gap: 8px;">
                  <button class="btn-sm btn-repair" data-repair-key="${key}">${t('btnArtisanRepair', '🔧 Artisan Repair')}</button>
                  <button class="btn-sm btn-rebuild" data-rebuild-key="${key}" title="Consume 10kg Al, 3 spools PETG, 15m Cu in FabLab to restore 100% factory-fresh capacity">♻️ FabLab Full Overhaul</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="recycling-box">
            <div class="summary-header-row">
              <h4>${t('circularBufferTitle', '♻️ FabLab Closed-Loop Material Buffer')}</h4>
              <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> CLOSED-LOOP FABLAB</span>
            </div>
            <div class="materials-chips">
              <span class="chip">${t('matAluminum', '🧱 Aluminum:')} <strong>${thermo.circularMaterials.aluminumIngotsKg} kg</strong></span>
              <span class="chip">${t('matFilament', '🧵 PETG Filament:')} <strong>${thermo.circularMaterials.petgFilamentSpools} spools</strong></span>
              <span class="chip">${t('matCopper', '⚡ Copper Wire:')} <strong>${thermo.circularMaterials.copperWireMeters} m</strong></span>
              <span class="chip">${t('matBiochar', '🌱 Biochar:')} <strong>${thermo.circularMaterials.biocharKg} kg</strong></span>
            </div>
            <div class="recycle-actions">
              <button class="btn-sm btn-recycle" data-recycle-cat="metals">${t('btnSmeltMetals', 'Smelt Scrap Metals')}</button>
              <button class="btn-sm btn-recycle" data-recycle-cat="plastics">${t('btnShredPlastics', 'Shred Scrap Plastics')}</button>
              <button class="btn-sm btn-recycle" data-recycle-cat="biomass">${t('btnCompostBiochar', 'Compost Biochar')}</button>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'agriculture') {
      const snap = thermo.getSnapshot();
      const food = snap.food;
      const weather = snap.weather;
      const agroResilience = node.agroResilience || {};
      const stress = food.activeAgroStress;

      html += `
        <div class="agriculture-view">
          <!-- 1. Top Summary Banner -->
          <div class="summary-card">
            <div class="summary-header-row">
              <h4>🥗 Agro-Ecological Food Sovereignty & Resilience</h4>
              <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> BIOCLIMATIC FOOD</span>
            </div>
            <p class="text-dim" style="font-size: 13px; margin: 4px 0 16px 0;">
              O.N.E. combines indoor aeroponic domes (shielded high-yield microclimates) with outdoor regenerative permaculture, agroforestry, and closed-loop biochar composting. Open fields are vulnerable to meteorological hazards unless protected by open-hardware resilience infrastructure.
            </p>

            <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <div class="kpi-box">
                <span class="kpi-label">Hourly Harvest</span>
                <span class="kpi-val text-green">${food.lastTotalHarvestKcal.toLocaleString()} kcal/h</span>
                <span class="kpi-sub">Demand: ${food.lastDemandKcal.toLocaleString()} kcal/h</span>
              </div>
              <div class="kpi-box">
                <span class="kpi-label">Granary Reserve</span>
                <span class="kpi-val text-cyan">${food.daysRemaining} days</span>
                <span class="kpi-sub">${food.currentKcal.toLocaleString()} / ${food.capacityKcal.toLocaleString()} kcal</span>
              </div>
              <div class="kpi-box">
                <span class="kpi-label">Topsoil Hydration</span>
                <span class="kpi-val ${food.soilMoisturePct < 35 ? 'text-amber' : 'text-emerald'}">${food.soilMoisturePct}%</span>
                <span class="kpi-sub">${food.soilMoisturePct < 35 ? '⚠️ Drought Stress' : 'Optimal Hydration'}</span>
              </div>
              <div class="kpi-box">
                <span class="kpi-label">Net Caloric Flow</span>
                <span class="kpi-val ${food.netDelta >= 0 ? 'text-green' : 'text-red'}">${food.netDelta >= 0 ? '+' : ''}${food.netDelta.toLocaleString()} kcal/h</span>
                <span class="kpi-sub">${food.netDelta >= 0 ? 'Granary Accumulating' : 'Cushioning Deficit'}</span>
              </div>
            </div>
          </div>

          <!-- 2. Dual-Pillar Production Cards -->
          <div class="dual-pillar-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
            <!-- Pillar 1: Indoor Aeroponics -->
            <div class="chores-group-card" style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h5 style="margin: 0; color: #34d399; font-size: 15px;">🏢 Indoor Bioclimatic Hydroponics</h5>
                <span class="badge" style="background: rgba(52, 211, 153, 0.15); color: #34d399;">Shielded Dome</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
                Vertical aeroponic misting towers inside the geodesic greenhouse dome. 100% immune to direct hailstorms and gale winds, but requires reliable electric power and active HVAC thermal management during heatwaves.
              </p>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Current Yield:</span>
                  <strong class="text-green">${food.lastIndoorHarvestKcal.toLocaleString()} kcal/h</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Battery Power Status:</span>
                  <span class="${snap.energy.currentKwh < 8 ? 'text-red' : 'text-green'}">${snap.energy.currentKwh} kWh (${snap.energy.percent}%)</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Greenhouse HVAC Health:</span>
                  <span>${thermo.machinery.greenhouseHvac.durability}% (Lifespan: ${thermo.machinery.greenhouseHvac.lifecycleHealth}%)</span>
                </div>
              </div>
            </div>

            <!-- Pillar 2: Outdoor Permaculture -->
            <div class="chores-group-card" style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h5 style="margin: 0; color: #fbbf24; font-size: 15px;">🌱 Outdoor Permaculture & Agroforestry</h5>
                <span class="badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24;">Open Atmosphere</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
                Open raised beds, food forest, berry corridors, and biochar living soil. Thrives under solar radiation and natural rain, but directly exposed to meteorological hazards (hail, floods, gales, heatwaves).
              </p>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Current Yield:</span>
                  <strong class="${stress ? 'text-amber' : 'text-green'}">${food.lastOutdoorHarvestKcal.toLocaleString()} kcal/h</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Atmospheric Weather:</span>
                  <span>${weather.icon} ${weather.name} (${weather.temperatureC}°C)</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Exposure Hazard:</span>
                  <span class="${stress ? 'text-red' : 'text-green'}">${stress ? `⚠️ Active: ${stress.name}` : '✅ No Active Threat'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Meteorological Disaster & Agro-Stress Alert Card -->
          ${stress ? `
            <div class="disaster-stress-banner" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                  <strong style="color: #f87171; font-size: 15px;">Meteorological Hazard Impacting Open Crops: ${stress.name}</strong>
                  <div style="font-size: 12px; color: var(--text-muted);">Unprotected crops suffer physical damage, root rot or evapotranspiration stress.</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 13px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 8px;">
                <div>
                  <span class="text-dim">Gross Crop Damage:</span>
                  <div style="color: #f87171; font-weight: bold;">-${stress.grossLossPct}%</div>
                </div>
                <div>
                  <span class="text-dim">Resilience Mitigated:</span>
                  <div style="color: #34d399; font-weight: bold;">+${stress.mitigatedPct}%</div>
                </div>
                <div>
                  <span class="text-dim">Net Yield Loss:</span>
                  <div style="color: #fbbf24; font-weight: bold;">-${stress.netLossPct}% (${stress.lostKcalPerHour} kcal/h)</div>
                </div>
                <div>
                  <span class="text-dim">Harvest Saved:</span>
                  <div style="color: #10b981; font-weight: bold;">+${stress.savedKcalPerHour} kcal/h</div>
                </div>
              </div>
              ${stress.activeMitigations && stress.activeMitigations.length > 0 ? `
                <div style="margin-top: 8px; font-size: 12px; color: #34d399;">
                  🛡️ Active Defenses: <strong>${stress.activeMitigations.join(', ')}</strong>
                </div>
              ` : `
                <div style="margin-top: 8px; font-size: 12px; color: #f87171;">
                  ⚠️ No protective infrastructure installed for this hazard! Deploy defenses below to save food reserves.
                </div>
              `}
            </div>
          ` : `
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 13px; color: #6ee7b7;">🌤️ Ambient weather is within normal bounds. Outdoor crops are photosynthesizing at optimal rates.</span>
              <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">Crops Nominal</span>
            </div>
          `}

          <!-- 4. Agro-Ecological Resilience Defenses (Dual-Track Hardware) -->
          <div class="summary-card">
            <div class="summary-header-row">
              <h4>🛡️ Open-Hardware Agro-Resilience Modules</h4>
              <span class="badge badge-outline">Resilience Shielding</span>
            </div>
            <p class="text-dim" style="font-size: 12px; margin-bottom: 14px;">
              Manufactured using FabLab circular materials, local earthworks, and biological agroforestry. Once installed, these physical modules automatically dampen the kinetic shock and moisture stresses of extreme weather.
            </p>

            <div class="resilience-modules-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              ${Object.values(agroResilience).map(mod => `
                <div class="chore-card ${mod.installed ? 'installed-card' : ''}" style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div class="chore-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <h5 style="margin: 0; font-size: 14px;">${mod.icon} ${mod.name}</h5>
                      <span class="badge ${mod.installed ? 'badge-success' : 'badge-outline'}" style="font-size: 11px;">
                        ${mod.installed ? 'Installed & Active ✅' : 'Uninstalled'}
                      </span>
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted); margin: 6px 0 8px 0;">${mod.desc}</p>
                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">
                      <span>Mitigates: <strong>${mod.mitigatesDisaster}</strong> (cancels up to ${Math.round(mod.mitigationFactor * 100)}% damage)</span><br/>
                      <span class="text-dim">Materials: ${mod.costMaterials}</span>
                    </div>
                  </div>
                  <div>
                    ${mod.installed ? `
                      <button class="btn-sm" style="width: 100%; opacity: 0.7; cursor: default;" disabled>Active Shielding</button>
                    ` : `
                      <button class="btn-sm btn-install-agro" data-resilience-key="${mod.id}" style="width: 100%; background: var(--emerald-primary); color: #06261c; font-weight: bold; cursor: pointer;">
                        🔨 Construct & Deploy
                      </button>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    this.contentEl.innerHTML = html;
    this.attachDynamicListeners(activeTab);
  }

  attachDynamicListeners(currentTab) {
    // Tab switching
    this.contentEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.render(btn.dataset.tab);
      });
    });

    // Agro-Resilience construct & deploy
    this.contentEl.querySelectorAll('.btn-install-agro').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.resilienceKey;
        this.sim.node.installAgroResilience(key);
        this.render('agriculture');
        this.sim.notifyTick();
      });
    });

    // Vocation Selection (Voluntary Specialization)
    this.contentEl.querySelectorAll('[data-vocation]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.node.setPlayerVocation(btn.dataset.vocation);
        this.render('chores');
        this.sim.notifyTick();
      });
    });

    // Chore assignments (+ / -)
    this.contentEl.querySelectorAll('[data-chore-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const chore = btn.dataset.chore;
        const action = btn.dataset.choreAction;
        if (action === 'add') {
          this.sim.node.choreAssignments[chore]++;
        } else if (action === 'sub') {
          // Allow reducing to 0, which triggers uncovered emergency if unautomated!
          this.sim.node.choreAssignments[chore] = Math.max(0, this.sim.node.choreAssignments[chore] - 1);
        }
        this.sim.node.updateLaborAndMorale();
        this.render('chores');
        this.sim.notifyTick();

        // Emit for P2P mesh replication
        this.onAction('CHORE_ALLOCATION', { chore, hours: this.sim.node.choreAssignments[chore] });
      });
    });

    // Artisan Repair
    this.contentEl.querySelectorAll('.btn-repair').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.repairKey;
        this.sim.thermo.repairMachinery(key);
        this.render('machinery');
        this.sim.notifyTick();

        // Emit for P2P mesh replication
        this.onAction('MACHINERY_REPAIR', { machineryKey: key });
      });
    });

    // FabLab Full Overhaul / Rebuild
    this.contentEl.querySelectorAll('.btn-rebuild').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.rebuildKey;
        const success = this.sim.thermo.rebuildMachinery(key);
        if (!success) {
          alert('Not enough circular raw materials in FabLab! (Requires 10kg Al, 3 spools PETG, 15m Cu). Smelt scrap first.');
        }
        this.render('machinery');
        this.sim.notifyTick();
      });
    });

    // Closed-loop Recycling
    this.contentEl.querySelectorAll('.btn-recycle').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.recycleCat;
        this.sim.thermo.recycleHardware(cat);
        this.render('machinery');
        this.sim.notifyTick();
      });
    });
  }
}
