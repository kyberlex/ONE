/**
 * Dual-Track Open Hardware & FabLab Tech Tree Controller (Agent SIM-4)
 * Fully internationalized with t() and integrated with the Interactive 3D WebGL Studio.
 * Allows player to inspect, rotate, and download real dual-scale .STL models
 * with the embossed O.N.E. logo, and export Home Assistant YAML.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { TECH_TREE_ITEMS } from '../data/tech_tree.js';
import { BLUEPRINT_ARCHETYPES } from '../data/models3d.js';
import { Studio3DViewer } from './viewer3d.js';
import { t } from '../i18n/index.js';

export class PanelDualTrackController {
  constructor(sim) {
    this.sim = sim;
    this.modalEl = document.getElementById('modal-dualtrack');
    this.contentEl = document.getElementById('dualtrack-content');
    this.closeBtn = document.getElementById('btn-close-dualtrack-modal');
    this.activeTab = 'blueprints3d'; // 'blueprints3d' or 'techTree'
    this.viewer3d = null;
    this.selectedArchetypeId = 'autonomous_mobility_pod';
    this.scaleMode = 'model'; // 'model' (1:50) or 'real' (1:1)

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
    window.addEventListener('resize', () => {
      if (this.viewer3d) this.viewer3d.resize();
    });
  }

  open(tab = 'blueprints3d') {
    if (!this.modalEl) return;
    this.activeTab = tab;
    this.modalEl.classList.remove('hidden');
    this.render();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
    if (this.viewer3d) {
      this.viewer3d.destroy();
      this.viewer3d = null;
    }
  }

  render() {
    const node = this.sim.node;
    const thermo = this.sim.thermo;
    const mats = thermo.circularMaterials;
    const currentArch = BLUEPRINT_ARCHETYPES.find(a => a.id === this.selectedArchetypeId) || BLUEPRINT_ARCHETYPES[0];

    let html = `
      <div class="dualtrack-container">
        <!-- Dual-Track Tabs -->
        <div class="modal-tabs">
          <button class="tab-btn ${this.activeTab === 'blueprints3d' ? 'active' : ''}" data-dtab="blueprints3d">
            📐 3D Solarpunk Blueprints (Dual-Scale & Logo Stamped)
          </button>
          <button class="tab-btn ${this.activeTab === 'techTree' ? 'active' : ''}" data-dtab="techTree">
            🤖 FabLab Automation Robots
          </button>
        </div>

        <div class="tab-body">
    `;

    // -------------------------------------------------------------
    // TAB 1: 3D SOLARPUNK BLUEPRINTS (DUAL-SCALE & EMBOSSED LOGO)
    // -------------------------------------------------------------
    if (this.activeTab === 'blueprints3d') {
      html += `
        <div class="blueprints-3d-layout">
          <div class="archetype-selector-bar">
            ${BLUEPRINT_ARCHETYPES.map(arch => `
              <button class="btn-arch-pill ${arch.id === this.selectedArchetypeId ? 'active' : ''}" data-arch-id="${arch.id}">
                ${arch.name.split(' ')[0]} ${arch.name.split(' ')[1] || ''}
              </button>
            `).join('')}
          </div>

          <!-- 3D WebGL Canvas Container -->
          <div class="viewer-3d-wrapper">
            <div id="three-canvas-viewport" class="three-viewport"></div>

            <!-- Logo Stamped Badge Indicator -->
            <div class="stamped-logo-badge">
              <img src="/one-logo-white.svg" alt="O.N.E. Logo" class="stamped-logo-icon" />
              <span>OFFICIAL O.N.E. EMBLEM EMBOSSED ON GEOMETRY</span>
            </div>

            <!-- Scale Mode Switcher Overlay -->
            <div class="scale-mode-pill-box">
              <button class="scale-toggle-btn ${this.scaleMode === 'model' ? 'active' : ''}" data-scale="model">
                🔍 1:50 Miniature (Desktop 3D Print)
              </button>
              <button class="scale-toggle-btn ${this.scaleMode === 'real' ? 'active' : ''}" data-scale="real">
                📐 1:1 Real Scale (Engineering CAD)
              </button>
            </div>
          </div>

          <!-- Blueprint Details & Export Section -->
          <div class="blueprint-meta-card">
            <div class="meta-header-row">
              <div>
                <div class="meta-title-row">
                  <h4 class="meta-title">${currentArch.name}</h4>
                  <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> EMBOSSED LOGO ACTIVE</span>
                </div>
                <p class="meta-tagline">${currentArch.tagline}</p>
              </div>
              <div class="export-actions-row">
                <button id="btn-export-stl" class="btn-primary-export" title="Export watertight binary .STL with embossed O.N.E. logo and license header">
                  📥 Download Watertight .STL (${this.scaleMode.toUpperCase()} • Logo Stamped)
                </button>
                <button id="btn-copy-yaml" class="btn-secondary-export" title="Copy tested Home Assistant YAML with official O.N.E. banner">
                  📄 Copy Home Assistant YAML
                </button>
              </div>
            </div>

            <p class="meta-description">${currentArch.description}</p>

            <div class="specs-chips-grid">
              <div class="spec-chip">
                <strong>Current Scale:</strong>
                <span>${this.scaleMode === 'model' ? currentArch.scaleMiniature : currentArch.scaleReal}</span>
              </div>
              <div class="spec-chip">
                <strong>Layer Height:</strong>
                <span>${currentArch.printSpecs.layerHeight}</span>
              </div>
              <div class="spec-chip">
                <strong>Infill & Material:</strong>
                <span>${currentArch.printSpecs.infill} (${currentArch.printSpecs.material})</span>
              </div>
              <div class="spec-chip">
                <strong>Supports:</strong>
                <span>${currentArch.printSpecs.supports}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // TAB 2: FABLAB AUTOMATION ROBOTS
    // -------------------------------------------------------------
    else if (this.activeTab === 'techTree') {
      html += `
        <div class="summary-card">
          <div class="summary-header-row">
            <h4>${t('dualTrackTitle', '🤖 FabLab Robot Tech Tree & Dual-Track Hardware Bridge')}</h4>
            <span class="one-stamp-tag"><img src="/one-logo-white.svg" alt="O.N.E." /> DUAL-TRACK BLUEPRINTS</span>
          </div>
          <p>${t('dualTrackSubtitle', 'Building automations permanently cancels daily chore hours from human rosters.')}</p>
          <div class="materials-bar">
            <span>${t('availableStocks', 'Available FabLab Stocks:')}</span>
            <span class="badge">🧱 ${mats.aluminumIngotsKg}kg ${t('matAluminum', 'Aluminum')}</span>
            <span class="badge">🧵 ${mats.petgFilamentSpools} ${t('matFilament', 'PETG Spools')}</span>
            <span class="badge">⚡ ${mats.copperWireMeters}m ${t('matCopper', 'Wire')}</span>
          </div>
        </div>

        <div class="tech-grid">
          ${TECH_TREE_ITEMS.map(item => {
            const currentCount = node.robots[item.id]?.count || 0;
            const canAfford =
              mats.aluminumIngotsKg >= item.materialCost.aluminumIngotsKg &&
              mats.petgFilamentSpools >= item.materialCost.petgFilamentSpools &&
              mats.copperWireMeters >= item.materialCost.copperWireMeters;

            return `
              <div class="tech-item-card">
                <div class="tech-item-header">
                  <div>
                    <h5>${item.name}</h5>
                    <span class="one-stamp-tag" style="margin-top: 4px;"><img src="/one-logo-white.svg" alt="O.N.E." /> FABLAB OPEN BLUEPRINT</span>
                  </div>
                  <span class="count-badge">${currentCount} ${t('activeRobotsBadge', 'Active')}</span>
                </div>
                <p class="tech-desc">${item.description}</p>
                <div class="tech-perks">
                  <span class="text-green">⚡ ${t('cancelsHumanChore', 'Cancels daily human chores by')} <strong>${item.hoursCancelledDaily}h</strong></span>
                </div>
                <div class="tech-cost">
                  <strong>${t('costLabel', 'Cost:')}</strong>
                  ${item.materialCost.aluminumIngotsKg > 0 ? `<span>${item.materialCost.aluminumIngotsKg}kg Al</span>` : ''}
                  ${item.materialCost.petgFilamentSpools > 0 ? `<span>${item.materialCost.petgFilamentSpools} spools PETG</span>` : ''}
                  ${item.materialCost.copperWireMeters > 0 ? `<span>${item.materialCost.copperWireMeters}m Wire</span>` : ''}
                </div>

                <div class="tech-action-row">
                  <button class="btn-sm btn-build-robot" data-robot-id="${item.id}" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? t('btnFabricateRobot', '🛠️ Fabricate in FabLab') : t('btnInsufficientMaterials', '❌ Insufficient Materials')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.contentEl.innerHTML = html;
    this.attachListeners(currentArch);

    // Initialize or re-mount 3D Viewer if on blueprints tab
    if (this.activeTab === 'blueprints3d') {
      const container = document.getElementById('three-canvas-viewport');
      if (container) {
        if (this.viewer3d) this.viewer3d.destroy();
        this.viewer3d = new Studio3DViewer(container);
        this.viewer3d.setScaleMode(this.scaleMode);
        this.viewer3d.loadArchetype(this.selectedArchetypeId);
      }
    }
  }

  attachListeners(currentArch) {
    // Tab switching
    this.contentEl.querySelectorAll('[data-dtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.dtab;
        this.render();
      });
    });

    // Archetype selection pills
    this.contentEl.querySelectorAll('[data-arch-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedArchetypeId = btn.dataset.archId;
        this.render();
      });
    });

    // Scale toggle
    this.contentEl.querySelectorAll('[data-scale]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.scaleMode = btn.dataset.scale;
        this.render();
      });
    });

    // Export STL button
    const btnStl = document.getElementById('btn-export-stl');
    if (btnStl && this.viewer3d) {
      btnStl.addEventListener('click', () => {
        this.viewer3d.exportSTL();
      });
    }

    // Copy YAML button
    const btnYaml = document.getElementById('btn-copy-yaml');
    if (btnYaml && currentArch) {
      btnYaml.addEventListener('click', () => {
        navigator.clipboard.writeText(currentArch.yamlContent).then(() => {
          alert(`Home Assistant YAML for "${currentArch.name}" copied to clipboard!`);
        }).catch(() => {
          prompt('Copy YAML configuration:', currentArch.yamlContent);
        });
      });
    }

    // Robot fabrication
    this.contentEl.querySelectorAll('.btn-build-robot').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.robotId;
        const item = TECH_TREE_ITEMS.find(t => t.id === id);
        if (!item) return;

        const mats = this.sim.thermo.circularMaterials;
        mats.aluminumIngotsKg -= item.materialCost.aluminumIngotsKg;
        mats.petgFilamentSpools -= item.materialCost.petgFilamentSpools;
        mats.copperWireMeters -= item.materialCost.copperWireMeters;

        this.sim.node.buildRobot(id);
        this.sim.emitNotification('🤖 Automation Fabricated', `${item.name} deployed. Human chores cancelled!`);
        this.render();
        this.sim.notifyTick();
      });
    });
  }
}
