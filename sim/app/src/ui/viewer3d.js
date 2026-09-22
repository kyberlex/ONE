/**
 * Interactive 3D WebGL Studio & Dual-Scale CAD Viewer (Agent SIM-4 & SIM-5)
 * Uses Three.js, OrbitControls, and STLExporter to inspect, rotate,
 * and export watertight .STL models with the official O.N.E. logo stamped.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { BLUEPRINT_ARCHETYPES, buildArchetypeMesh } from '../data/models3d.js';
import { t } from '../i18n/index.js';

export class Studio3DViewer {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentArchetypeId = 'autonomous_mobility_pod';
    this.currentScaleMode = 'model'; // 'model' (1:50) or 'real' (1:1)
    this.currentMeshGroup = null;
    this.animFrameId = null;

    this.initThree();
    this.loadArchetype(this.currentArchetypeId);
  }

  initThree() {
    const width = this.container.clientWidth || 640;
    const height = 380;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08131a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(6, 4, 8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go below floor
    this.controls.minDistance = 2;
    this.controls.maxDistance = 40;

    // Lighting (Solarpunk soft natural lighting)
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.75);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    sunLight.position.set(10, 15, 10);
    sunLight.castShadow = true;
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-10, -5, -10);
    this.scene.add(fillLight);

    // Circular Solarpunk Pedestal Grid
    const gridHelper = new THREE.PolarGridHelper(8, 16, 8, 32, 0x10b981, 0x1e3a34);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    // Animation Loop
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls.update();

      // Gentle idle auto-rotation if not dragging
      if (this.currentMeshGroup && !this.controls.state) {
        this.currentMeshGroup.rotation.y += 0.003;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  loadArchetype(archetypeId) {
    this.currentArchetypeId = archetypeId;

    // Remove old mesh
    if (this.currentMeshGroup) {
      this.scene.remove(this.currentMeshGroup);
      this.currentMeshGroup = null;
    }

    // Scale factor: 1.0 for model scale, 2.5 visual representation for real scale
    const visualScale = this.currentScaleMode === 'model' ? 1.0 : 1.3;
    this.currentMeshGroup = buildArchetypeMesh(archetypeId, visualScale);
    this.scene.add(this.currentMeshGroup);

    // Re-center camera
    this.camera.position.set(6, 4, 8);
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
  }

  setScaleMode(mode) {
    this.currentScaleMode = mode;
    this.loadArchetype(this.currentArchetypeId);
  }

  /**
   * Generates and downloads the real watertight STL file
   */
  exportSTL() {
    if (!this.currentMeshGroup) return;

    const exporter = new STLExporter();
    // Use true scale: 1:50 is scaled by 0.02, 1:1 is 1.0
    const exportGroup = buildArchetypeMesh(
      this.currentArchetypeId,
      this.currentScaleMode === 'model' ? 0.02 : 1.0
    );

    const stlData = exporter.parse(exportGroup, { binary: true });
    
    // Stamp official O.N.E. dual-track license and metadata directly into 80-byte STL header
    const headerStr = `O.N.E. DUAL-TRACK OPEN HARDWARE // Blueprint: ${this.currentArchetypeId} // AGPL-3.0`;
    const uint8 = new Uint8Array(stlData.buffer);
    for (let i = 0; i < 80; i++) {
      uint8[i] = i < headerStr.length ? headerStr.charCodeAt(i) : 0x20;
    }

    const filename = `ONE_DUALTRACK_${this.currentArchetypeId}_${this.currentScaleMode}.stl`;

    const blob = new Blob([stlData], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  resize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = 380;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
