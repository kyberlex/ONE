/**
 * O.N.E. Dual-Track Blueprint & 3D CAD Export Modal
 * Allows players to inspect real-world open-hardware engineering designs,
 * rotate interactive 3D WebGL models, download watertight 3D-printable .STL files,
 * and copy/download Home Assistant Zigbee/MQTT automation YAML packages.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { BLUEPRINT_ARCHETYPES, getBlueprintForBuildingType, buildWatertight3DMesh } from '../data/blueprints.js';
import { soundFX } from '../audio/sound_fx.js';

export class BlueprintExportModal {
  constructor() {
    this.overlayEl = null;
    this.currentBlueprint = null;
    this.activeTab = 'cad'; // 'cad' | 'yaml' | 'bom'
    this.scaleMode = 'model'; // 'model' (1:50 miniature) or 'real' (1:1)

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animFrameId = null;
    this.currentMesh = null;

    this.ensureDom();
  }

  ensureDom() {
    let existing = document.getElementById('blueprint-export-modal-overlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'blueprint-export-modal-overlay';
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
    this.destroyThree();
    this.overlayEl.classList.remove('active');
    this.overlayEl.classList.add('hidden');
    this.currentBlueprint = null;
  }

  open(buildingTypeOrId) {
    const bp = getBlueprintForBuildingType(buildingTypeOrId);
    if (!bp) return;

    this.currentBlueprint = bp;
    this.activeTab = 'cad';
    this.render();
    this.overlayEl.classList.remove('hidden');
    this.overlayEl.classList.add('active');

    // Initialize 3D preview after modal DOM mounts
    setTimeout(() => {
      this.initThreePreview();
    }, 50);
  }

  render() {
    const bp = this.currentBlueprint;
    if (!bp) return;

    this.overlayEl.innerHTML = `
      <div class="modal-card" style="max-width: 820px; max-height: 90vh; overflow-y: auto; background: rgba(10, 20, 28, 0.95); border: 1px solid rgba(52, 211, 153, 0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
        <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2rem;">📐</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="margin: 0; color: #34d399; font-size: 1.35rem; font-weight: 700;">${bp.name}</h2>
                <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px;">
                  DUAL-TRACK ${bp.category}
                </span>
              </div>
              <p style="margin: 3px 0 0 0; color: #94a3b8; font-size: 0.85rem;">${bp.tagline}</p>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-bp-close" style="background: transparent; border: none; font-size: 1.4rem; color: #94a3b8; cursor: pointer;">&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 8px; margin: 16px 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
          <button type="button" class="btn-secondary bp-tab-btn ${this.activeTab === 'cad' ? 'active' : ''}" data-tab="cad" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 6px;">
            🧊 3D CAD & .STL Model
          </button>
          <button type="button" class="btn-secondary bp-tab-btn ${this.activeTab === 'yaml' ? 'active' : ''}" data-tab="yaml" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 6px;">
            ⚡ Home Assistant YAML
          </button>
          <button type="button" class="btn-secondary bp-tab-btn ${this.activeTab === 'bom' ? 'active' : ''}" data-tab="bom" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 6px;">
            📋 Bill of Materials (BOM)
          </button>
        </div>

        <!-- Tab 1: 3D WebGL CAD Viewer & STL Download -->
        <div id="bp-tab-content-cad" class="${this.activeTab === 'cad' ? '' : 'hidden'}">
          <div style="position: relative; width: 100%; height: 320px; background: #03080c; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; overflow: hidden;" id="bp-canvas-container">
            <div style="position: absolute; top: 10px; left: 12px; color: #38bdf8; font-size: 0.75rem; pointer-events: none; text-shadow: 0 1px 3px black;">
              🖱️ Left-Click: Rotate • Right-Click: Pan • Scroll: Zoom
            </div>
            <div style="position: absolute; bottom: 10px; right: 12px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; color: #94a3b8;">
              Watertight Solid • O.N.E. AGPL-3.0
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 0.82rem; color: #94a3b8;">
              <span style="color: #cbd5e1; font-weight: 600;">3D Printing Specs:</span> Layer: ${bp.printSpecs.layerHeight} • Infill: ${bp.printSpecs.infill} • Material: <span style="color: #34d399;">${bp.printSpecs.material}</span>
            </div>

            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-primary" id="btn-bp-download-stl" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 600; padding: 8px 18px; border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                📥 Download Watertight .STL (1:50)
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 2: Home Assistant Automation YAML -->
        <div id="bp-tab-content-yaml" class="${this.activeTab === 'yaml' ? '' : 'hidden'}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.82rem; color: #94a3b8;">Production Home Assistant ESP32 / MQTT Automation Package:</span>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-secondary" id="btn-bp-copy-yaml" style="padding: 4px 12px; font-size: 0.8rem; border-radius: 4px;">
                📋 Copy YAML
              </button>
              <button type="button" class="btn-primary" id="btn-bp-download-yaml" style="background: #0284c7; border: none; padding: 4px 14px; font-size: 0.8rem; border-radius: 4px;">
                📄 Download .yaml
              </button>
            </div>
          </div>
          <pre style="background: #04090e; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 14px; color: #bae6fd; font-family: 'Fira Code', monospace; font-size: 0.8rem; max-height: 280px; overflow-y: auto; line-height: 1.45;">${this.escapeHtml(bp.yamlContent)}</pre>
        </div>

        <!-- Tab 3: Bill of Materials (BOM) -->
        <div id="bp-tab-content-bom" class="${this.activeTab === 'bom' ? '' : 'hidden'}">
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0;">${bp.description}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left; background: rgba(15, 23, 42, 0.6); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
            <thead>
              <tr style="background: rgba(30, 41, 59, 0.8); color: #34d399;">
                <th style="padding: 10px 14px;">Component / Material</th>
                <th style="padding: 10px 14px;">Quantity / Spec</th>
                <th style="padding: 10px 14px;">Ecological Source</th>
              </tr>
            </thead>
            <tbody>
              ${bp.bom.map(row => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
                  <td style="padding: 8px 14px; font-weight: 500;">${row.item}</td>
                  <td style="padding: 8px 14px; color: #38bdf8;">${row.qty}</td>
                  <td style="padding: 8px 14px; color: #94a3b8;">${row.source}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Usufruct Hard Constraint Footer -->
        <div style="margin-top: 18px; padding: 12px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; font-size: 0.78rem; color: #a7f3d0; line-height: 1.4;">
          <strong>Art. 7 Dual-Track Handshake:</strong> All models are released under AGPL-3.0-or-later and Open Knowledge usufruct. Commercial patenting and proprietary locking of these open-hardware designs is prohibited.
        </div>
      </div>
    `;

    this.attachEvents();
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  attachEvents() {
    this.overlayEl.querySelector('#btn-bp-close')?.addEventListener('click', () => this.close());

    // Tab buttons
    this.overlayEl.querySelectorAll('.bp-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        this.activeTab = btn.dataset.tab;
        this.overlayEl.querySelectorAll('.bp-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.overlayEl.querySelector('#bp-tab-content-cad').classList.toggle('hidden', this.activeTab !== 'cad');
        this.overlayEl.querySelector('#bp-tab-content-yaml').classList.toggle('hidden', this.activeTab !== 'yaml');
        this.overlayEl.querySelector('#bp-tab-content-bom').classList.toggle('hidden', this.activeTab !== 'bom');

        if (this.activeTab === 'cad') {
          setTimeout(() => this.resizeThree(), 50);
        }
      });
    });

    // STL Download
    this.overlayEl.querySelector('#btn-bp-download-stl')?.addEventListener('click', () => {
      soundFX.playClick();
      this.exportSTL();
    });

    // Copy YAML
    this.overlayEl.querySelector('#btn-bp-copy-yaml')?.addEventListener('click', (e) => {
      soundFX.playClick();
      if (this.currentBlueprint?.yamlContent) {
        navigator.clipboard.writeText(this.currentBlueprint.yamlContent).then(() => {
          e.target.textContent = '✅ Copied!';
          setTimeout(() => { e.target.textContent = '📋 Copy YAML'; }, 2000);
        });
      }
    });

    // Download YAML
    this.overlayEl.querySelector('#btn-bp-download-yaml')?.addEventListener('click', () => {
      soundFX.playClick();
      if (this.currentBlueprint?.yamlContent) {
        const blob = new Blob([this.currentBlueprint.yamlContent], { type: 'text/yaml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ONE_AUTOMATION_${this.currentBlueprint.id}.yaml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    });
  }

  initThreePreview() {
    const container = this.overlayEl.querySelector('#bp-canvas-container');
    if (!container) return;

    this.destroyThree();

    const width = container.clientWidth || 760;
    const height = 320;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03080c);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(7, 5, 9);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.7);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    sunLight.position.set(10, 15, 10);
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-10, -5, -10);
    this.scene.add(fillLight);

    // Solarpunk Pedestal Grid
    const grid = new THREE.PolarGridHelper(8, 16, 8, 32, 0x10b981, 0x1e3a34);
    grid.position.y = 0;
    this.scene.add(grid);

    // Mesh
    const archetypeId = this.currentBlueprint.id;
    this.currentMesh = buildWatertight3DMesh(archetypeId, 1.0);
    this.scene.add(this.currentMesh);

    this.controls.target.set(0, 1.5, 0);
    this.controls.update();

    // Render loop
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls.update();
      if (this.currentMesh && !this.controls.state) {
        this.currentMesh.rotation.y += 0.004; // slow rotation
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  resizeThree() {
    const container = this.overlayEl?.querySelector('#bp-canvas-container');
    if (!container || !this.renderer || !this.camera) return;
    const width = container.clientWidth;
    const height = 320;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  exportSTL() {
    if (!this.currentBlueprint) return;

    const exporter = new STLExporter();
    // Build miniature 1:50 scale mesh for 3D printing
    const exportMesh = buildWatertight3DMesh(this.currentBlueprint.id, 0.02);

    const stlData = exporter.parse(exportMesh, { binary: true });

    // Embed 80-byte official O.N.E. license header
    const headerStr = `O.N.E. DUAL-TRACK OPEN HARDWARE // Blueprint: ${this.currentBlueprint.id} // AGPL-3.0`;
    const uint8 = new Uint8Array(stlData.buffer);
    for (let i = 0; i < 80; i++) {
      uint8[i] = i < headerStr.length ? headerStr.charCodeAt(i) : 0x20;
    }

    const filename = `ONE_DUALTRACK_${this.currentBlueprint.id}_1to50.stl`;
    const blob = new Blob([stlData], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  destroyThree() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.currentMesh = null;
  }
}

export const blueprintExportModal = new BlueprintExportModal();
