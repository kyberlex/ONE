/**
 * Dual-Track 3D Model Inspector for Interior Props & Furniture (Agent SIM-4 & SIM-5)
 * Renders interactive 3D WebGL models (Three.js) of fixtures, tools, machinery, and furniture
 * found inside O.N.E. common facilities and private usufruct dwellings.
 *
 * Supports 360° orbit, auto-rotation, CAD .STL blueprint export, and Home Assistant YAML generation.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export class Prop3DViewer {
  constructor() {
    this.modalEl = document.getElementById('modal-prop-3d');
    this.canvasContainer = document.getElementById('prop-3d-canvas-container');
    this.closeBtn = document.getElementById('btn-close-prop-3d');

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animFrameId = null;
    this.currentModelGroup = null;
    this.autoRotate = true;
    this.currentProp = null;

    this.initDom();
  }

  initDom() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', e => {
        if (e.target === this.modalEl) this.close();
      });
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.close();
      }
    });

    // Auto rotate toggle button
    const autoRotateBtn = document.getElementById('btn-prop-auto-rotate');
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        autoRotateBtn.classList.toggle('active', this.autoRotate);
      });
    }

    // Reset camera button
    const resetCamBtn = document.getElementById('btn-prop-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        this.resetCamera();
      });
    }

    // Download STL button
    const downloadStlBtn = document.getElementById('btn-prop-download-stl');
    if (downloadStlBtn) {
      downloadStlBtn.addEventListener('click', () => {
        this.exportStl();
      });
    }

    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  initThree() {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const width = this.canvasContainer.clientWidth || 560;
    const height = this.canvasContainer.clientHeight || 420;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101d);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(5, 3.8, 5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvasContainer.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Stay above ground plane
    this.controls.minDistance = 2;
    this.controls.maxDistance = 16;
    this.controls.target.set(0, 1.2, 0);

    // 5. Lighting Setup (Soft Solarpunk Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.85);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.5);
    keyLight.position.set(8, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-8, -4, -8);
    this.scene.add(rimLight);

    const greenAccentLight = new THREE.PointLight(0x10b981, 1.2, 10);
    greenAccentLight.position.set(0, 2.5, 3);
    this.scene.add(greenAccentLight);

    // 6. Solarpunk Polar Ground Grid
    const grid = new THREE.PolarGridHelper(6, 16, 6, 32, 0x10b981, 0x1e3a34);
    grid.position.y = 0;
    this.scene.add(grid);

    // Shadow catcher floor disc
    const floorGeo = new THREE.CircleGeometry(3.5, 32);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 7. Render Animation Loop
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls.update();

      if (this.currentModelGroup && this.autoRotate && !this.controls.state) {
        this.currentModelGroup.rotation.y += 0.005;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  handleResize() {
    if (!this.canvasContainer || !this.renderer || !this.camera) return;
    const width = this.canvasContainer.clientWidth;
    const height = this.canvasContainer.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  resetCamera() {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(5, 3.8, 5);
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
  }

  open(prop) {
    this.currentProp = prop;
    if (!this.modalEl) return;

    this.modalEl.classList.remove('hidden');

    if (!this.renderer) {
      this.initThree();
    } else {
      setTimeout(() => this.handleResize(), 50);
    }

    this.loadPropMesh(prop);
    this.renderSidebar(prop);
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  loadPropMesh(prop) {
    if (!this.scene) return;

    if (this.currentModelGroup) {
      this.scene.remove(this.currentModelGroup);
      this.currentModelGroup = null;
    }

    const type = prop.type || 'WORKBENCH';
    const group = this.buildProceduralMesh(type, prop);
    this.currentModelGroup = group;
    this.scene.add(group);

    this.resetCamera();
  }

  buildProceduralMesh(type, prop) {
    const group = new THREE.Group();

    // Standard PBR Materials
    const matAluminum = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.85,
      roughness: 0.25
    });

    const matChrome = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.1
    });

    const matWood = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.65,
      metalness: 0.05
    });

    const matLightWood = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.7,
      metalness: 0.0
    });

    const matWhitePlastic = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1
    });

    const matOrangeAccent = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
      metalness: 0.2
    });

    const matTealAccent = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.35,
      metalness: 0.3,
      emissive: 0x059669,
      emissiveIntensity: 0.3
    });

    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.65
    });

    const matFoliage = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.6,
      metalness: 0.0
    });

    const matDarkStone = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.05
    });

    const matGlowingEmber = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xf97316,
      emissiveIntensity: 1.8,
      roughness: 0.5
    });

    switch (type) {
      case 'PRINTER_3D': {
        // CoreXY 3D Printer (Prusa MK4 / Voron style)
        // 1. Frame: 4 Vertical extruded profiles
        for (let x of [-0.9, 0.9]) {
          for (let z of [-0.9, 0.9]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), matAluminum);
            leg.position.set(x, 1.1, z);
            leg.castShadow = true;
            group.add(leg);
          }
        }
        // Top and bottom cross bars
        for (let y of [0.08, 2.15]) {
          const barF = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.12, 0.12), matAluminum);
          barF.position.set(0, y, 0.9);
          group.add(barF);
          const barB = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.12, 0.12), matAluminum);
          barB.position.set(0, y, -0.9);
          group.add(barB);
          const barL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.68), matAluminum);
          barL.position.set(-0.9, y, 0);
          group.add(barL);
          const barR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.68), matAluminum);
          barR.position.set(0.9, y, 0);
          group.add(barR);
        }
        // Heated Bed Platform
        const bedPlate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.4), matOrangeAccent);
        bedPlate.position.set(0, 0.75, 0);
        bedPlate.castShadow = true;
        group.add(bedPlate);
        // Build surface sheet (black PEI)
        const peiSheet = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 1.3), matAluminum);
        peiSheet.position.set(0, 0.8, 0);
        group.add(peiSheet);
        // Dual Z rods (Chrome)
        for (let x of [-0.75, 0.75]) {
          const zRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 16), matChrome);
          zRod.position.set(x, 1.1, -0.7);
          group.add(zRod);
        }
        // X-Gantry Beam
        const xGantry = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.1), matChrome);
        xGantry.position.set(0, 1.45, 0);
        group.add(xGantry);
        // Extruder Printhead
        const printHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), matOrangeAccent);
        printHead.position.set(0.1, 1.45, 0);
        printHead.castShadow = true;
        group.add(printHead);
        // Brass Nozzle
        const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 12), matLightWood);
        nozzle.rotation.x = Math.PI;
        nozzle.position.set(0.1, 1.22, 0);
        group.add(nozzle);
        // Filament Spool on top
        const spool = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.12, 16, 32), matOrangeAccent);
        spool.position.set(-0.35, 2.5, 0);
        spool.rotation.y = Math.PI / 2;
        group.add(spool);
        break;
      }

      case 'CNC_MILL': {
        // 3-Axis CNC Router & Milling Station
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 2.0), matAluminum);
        base.position.set(0, 0.125, 0);
        base.castShadow = true;
        group.add(base);
        // Aluminum T-slot sacrificial bed
        const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.6), matChrome);
        bed.position.set(0, 0.28, 0);
        group.add(bed);
        // Heavy vertical gantry bridge
        const bridgeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.4), matAluminum);
        bridgeL.position.set(-1.1, 1.0, 0);
        bridgeL.castShadow = true;
        group.add(bridgeL);
        const bridgeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.4), matAluminum);
        bridgeR.position.set(1.1, 1.0, 0);
        bridgeR.castShadow = true;
        group.add(bridgeR);
        const bridgeTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.4), matAluminum);
        bridgeTop.position.set(0, 1.85, 0);
        group.add(bridgeTop);
        // High-frequency water cooled spindle router
        const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.85, 24), matChrome);
        spindle.position.set(0, 1.25, 0);
        group.add(spindle);
        // Endmill bit
        const bit = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16), matChrome);
        bit.position.set(0, 0.72, 0);
        group.add(bit);
        // Vacuum dust extraction hose
        const hose = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 12, 24, Math.PI), matOrangeAccent);
        hose.position.set(0, 1.7, 0.3);
        group.add(hose);
        break;
      }

      case 'BATTERY_RACK': {
        // 48V LiFePO4 Server Rack Energy Storage
        // Cabinet Chassis
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 1.2), matAluminum);
        cabinet.position.set(0, 1.25, 0);
        cabinet.castShadow = true;
        group.add(cabinet);
        // 4 Battery Blades
        for (let i = 0; i < 4; i++) {
          const y = 0.5 + i * 0.52;
          const blade = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.42, 1.15), matChrome);
          blade.position.set(0, y, 0.05);
          group.add(blade);
          // Green LED SOC bar
          const ledBar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.05), matTealAccent);
          ledBar.position.set(-0.25, y, 0.63);
          group.add(ledBar);
          // Handles
          const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), matAluminum);
          handleL.position.set(-0.62, y, 0.64);
          group.add(handleL);
          const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), matAluminum);
          handleR.position.set(0.62, y, 0.64);
          group.add(handleR);
        }
        // Top Digital Voltmeter / BMS LCD
        const lcdScreen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.05), matTealAccent);
        lcdScreen.position.set(0, 2.3, 0.61);
        group.add(lcdScreen);
        break;
      }

      case 'SOLAR_INVERTER': {
        // Hybrid MPPT Solar Inverter
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.6), matWhitePlastic);
        body.position.set(0, 1.2, 0);
        body.castShadow = true;
        group.add(body);
        // Rear heatsink fins
        for (let i = -0.9; i <= 0.9; i += 0.2) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.1, 0.3), matAluminum);
          fin.position.set(i, 1.2, -0.4);
          group.add(fin);
        }
        // Cyan LCD display
        const lcd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.05), matTealAccent);
        lcd.position.set(0, 1.45, 0.31);
        group.add(lcd);
        // Rotary isolator switch
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 24), matOrangeAccent);
        knob.rotation.x = Math.PI / 2;
        knob.position.set(0, 0.6, 0.32);
        group.add(knob);
        break;
      }

      case 'HYDROPONIC_TOWER': {
        // Vertical Aeroponic Food Tower
        // Reservoir Base
        const reservoir = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.85, 0.7, 32), matWhitePlastic);
        reservoir.position.set(0, 0.35, 0);
        reservoir.castShadow = true;
        group.add(reservoir);
        // Main Vertical Tower Column
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.5, 32), matWhitePlastic);
        column.position.set(0, 1.95, 0);
        group.add(column);
        // Staggered Pods with Leafy Green Foliage
        const podAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        for (let level = 0; level < 5; level++) {
          const y = 0.9 + level * 0.42;
          const offsetAngle = (level % 2 === 0) ? 0 : Math.PI / 4;
          for (const angle of podAngles) {
            const totalAngle = angle + offsetAngle;
            const px = Math.cos(totalAngle) * 0.45;
            const pz = Math.sin(totalAngle) * 0.45;
            // Planting Cup
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.2, 16), matWhitePlastic);
            cup.position.set(px, y, pz);
            cup.rotation.z = Math.PI / 4 * Math.cos(totalAngle);
            cup.rotation.x = Math.PI / 4 * Math.sin(totalAngle);
            group.add(cup);
            // Leaf cluster
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), matFoliage);
            leaf.scale.set(1.4, 0.8, 1.2);
            leaf.position.set(px * 1.35, y + 0.08, pz * 1.35);
            group.add(leaf);
          }
        }
        break;
      }

      case 'CISTERN_TANK': {
        // Atmospheric Rainwater Reservoir & Ceramic Filter Bank
        // Tank Shell (Translucent Poly)
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.4, 32), matGlass);
        tank.position.set(0, 1.2, 0);
        group.add(tank);
        // Water volume inside
        const water = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.8, 32), matTealAccent);
        water.position.set(0, 0.9, 0);
        group.add(water);
        // Heavy base feet
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          const foot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.4), matAluminum);
          foot.position.set(Math.cos(a) * 0.95, 0.15, Math.sin(a) * 0.95);
          group.add(foot);
        }
        // Stainless filter cartridge array
        for (let i of [-0.35, 0, 0.35]) {
          const filter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16), matChrome);
          filter.position.set(1.35, 1.2 + i * 0.15, i);
          group.add(filter);
        }
        // Brass discharge valve
        const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16), matLightWood);
        valve.rotation.z = Math.PI / 2;
        valve.position.set(1.2, 0.3, 0);
        group.add(valve);
        break;
      }

      case 'WOOD_FIREPLACE':
      case 'STOVE_HEARTH': {
        // River-stone & Cast-iron Veranda Fireplace
        // Stone Masonry Base & Hearth
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.6), matDarkStone);
        base.position.set(0, 0.175, 0);
        base.castShadow = true;
        group.add(base);
        // Stone Surround Structure
        const surround = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 1.2), matDarkStone);
        surround.position.set(0, 1.45, 0);
        surround.castShadow = true;
        group.add(surround);
        // Firebox Cavity (Cast iron interior)
        const firebox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.8), matAluminum);
        firebox.position.set(0, 1.05, 0.25);
        group.add(firebox);
        // Birch Firewood Logs
        for (let i = 0; i < 3; i++) {
          const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 12), matLightWood);
          log.rotation.z = Math.PI / 2;
          log.rotation.y = (i - 1) * 0.25;
          log.position.set((i - 1) * 0.15, 0.68 + i * 0.08, 0.25);
          group.add(log);
        }
        // Glowing Fire Embers
        const ember = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.45), matGlowingEmber);
        ember.position.set(0, 0.62, 0.25);
        group.add(ember);
        // Stainless Chimney Pipe
        const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 24), matChrome);
        flue.position.set(0, 2.8, 0);
        group.add(flue);
        break;
      }

      case 'CAD_LAPTOP':
      case 'CAD_WORKSTATION':
      case 'ELECTRONICS':
      case 'AGRO_SCADA': {
        // Dual-Track Workstation & Telemetry Laptop
        // Bamboo Desk Surface
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), matLightWood);
        desk.position.set(0, 1.2, 0);
        desk.castShadow = true;
        group.add(desk);
        // 4 Steel Legs
        for (let x of [-0.95, 0.95]) {
          for (let z of [-0.48, 0.48]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16), matAluminum);
            leg.position.set(x, 0.6, z);
            group.add(leg);
          }
        }
        // Curved Ultrawide Display
        const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, 0.5, 16), matAluminum);
        monitorStand.position.set(0, 1.45, -0.3);
        group.add(monitorStand);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.04), matTealAccent);
        screen.position.set(0, 1.75, -0.3);
        group.add(screen);
        // Laptop base
        const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.45), matChrome);
        laptop.position.set(0, 1.25, 0.15);
        group.add(laptop);
        const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.02), matTealAccent);
        laptopScreen.position.set(0, 1.48, -0.05);
        laptopScreen.rotation.x = -0.15;
        group.add(laptopScreen);
        break;
      }

      case 'BED':
      case 'BEDROOM_SET': {
        // Usufruct Beechwood Platform Bed
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.4), matLightWood);
        frame.position.set(0, 0.2, 0);
        frame.castShadow = true;
        group.add(frame);
        // Headboard
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.12), matLightWood);
        headboard.position.set(0, 0.9, -1.15);
        group.add(headboard);
        // Mattress
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 2.15), matWhitePlastic);
        mattress.position.set(0, 0.55, 0.05);
        group.add(mattress);
        // Duvet Blanket (Solarpunk Emerald)
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.15, 1.6), matTealAccent);
        duvet.position.set(0, 0.68, 0.3);
        group.add(duvet);
        // 2 Pillows
        for (let x of [-0.5, 0.5]) {
          const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.45), matWhitePlastic);
          pillow.position.set(x, 0.76, -0.75);
          group.add(pillow);
        }
        break;
      }

      case 'WORKBENCH':
      default: {
        // Heavy Craftsman Timber Workbench
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.2), matWood);
        top.position.set(0, 1.2, 0);
        top.castShadow = true;
        group.add(top);
        // 4 Heavy timber posts
        for (let x of [-1.0, 1.0]) {
          for (let z of [-0.45, 0.45]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 0.18), matWood);
            leg.position.set(x, 0.575, z);
            leg.castShadow = true;
            group.add(leg);
          }
        }
        // Lower tool shelf
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.9), matLightWood);
        shelf.position.set(0, 0.3, 0);
        group.add(shelf);
        // Cast iron front vise
        const viseJaw = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.15), matAluminum);
        viseJaw.position.set(-0.8, 1.15, 0.65);
        group.add(viseJaw);
        const viseScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), matChrome);
        viseScrew.rotation.x = Math.PI / 2;
        viseScrew.position.set(-0.8, 1.15, 0.8);
        group.add(viseScrew);
        break;
      }
    }

    return group;
  }

  renderSidebar(prop) {
    const titleEl = document.getElementById('prop-3d-title');
    const badgeEl = document.getElementById('prop-3d-category');
    const descEl = document.getElementById('prop-3d-desc');
    const specsTableEl = document.getElementById('prop-3d-specs-table');
    const yamlContainerEl = document.getElementById('prop-3d-yaml-preview');

    if (titleEl) titleEl.textContent = prop.name || 'Component';
    if (badgeEl) badgeEl.textContent = prop.type || 'OPEN HARDWARE';
    if (descEl) descEl.textContent = prop.desc || 'Dual-Track open source hardware module.';

    // Generate specifications based on prop type
    const specs = this.getPropSpecs(prop.type);
    if (specsTableEl) {
      specsTableEl.innerHTML = `
        <tr><td>Dual-Track Blueprint:</td><td><strong style="color: var(--emerald-primary);">Verified AGPL-3.0</strong></td></tr>
        <tr><td>Thermodynamic Flow:</td><td>${specs.thermoFlow}</td></tr>
        <tr><td>Material Composition:</td><td>${specs.materials}</td></tr>
        <tr><td>Fabrication Method:</td><td>${specs.fabrication}</td></tr>
        <tr><td>CAD Resolution:</td><td>Watertight .STL / Parametric 1:1</td></tr>
      `;
    }

    // YAML automation snippet
    if (yamlContainerEl) {
      yamlContainerEl.textContent = specs.yaml;
    }
  }

  getPropSpecs(type) {
    switch (type) {
      case 'PRINTER_3D':
        return {
          thermoFlow: '⚡ 0.25 kWh/hr • 100% PV Islanded',
          materials: '6061-T6 Aluminum Extrusion, Recycled PETG, Brass',
          fabrication: 'Open CoreXY / Prusa MK4 Self-Replicating RepRap',
          yaml: `sensor:\n  - platform: mqtt\n    name: 'FabLab Prusa Hotend Temp'\n    state_topic: 'one/fablab/printer01/hotend_temp'\n    unit_of_measurement: '°C'\nautomation:\n  - id: 'power_off_at_print_completion'\n    trigger:\n      - platform: state\n        entity_id: sensor.prusa_status\n        to: 'FINISHED'`
        };
      case 'BATTERY_RACK':
        return {
          thermoFlow: '⚡ 5.12 kWh Conserved Reserve • 98% Round-Trip',
          materials: 'Prismatic LiFePO4 Cells, Copper Busbars, Steel Chassis',
          fabrication: '19-inch Modular Open-Compute Enclosure',
          yaml: `sensor:\n  - platform: mqtt\n    name: 'Commons Microgrid Battery SOC'\n    state_topic: 'one/energy/battery/soc'\n    unit_of_measurement: '%'\nautomation:\n  - id: 'shed_non_critical_at_25_soc'\n    trigger:\n      - platform: numeric_state\n        entity_id: sensor.commons_microgrid_battery_soc\n        below: 25`
        };
      case 'HYDROPONIC_TOWER':
        return {
          thermoFlow: '🥗 18,000 kcal/yr • 💧 95% Water Recycled',
          materials: 'Food-Grade Recycled HDPE, Submersible 12V DC Pump',
          fabrication: 'Additive Manufactured 3D Modular Net Cups',
          yaml: `sensor:\n  - platform: mqtt\n    name: 'Tower pH Level'\n    state_topic: 'one/greenhouse/tower01/ph'\nautomation:\n  - id: 'mist_cycle_interval'\n    trigger:\n      - platform: time_pattern\n        minutes: '/15'`
        };
      case 'WOOD_FIREPLACE':
        return {
          thermoFlow: '🔥 8.5 kW Thermal Output • Clean Biomass Flue',
          materials: 'River Stone, Refractory Clay, Cast Iron, Stainless Steel',
          fabrication: 'Local Masonry & Vernacular Thermal Mass Design',
          yaml: `sensor:\n  - platform: mqtt\n    name: 'Veranda Hearth Flue Temp'\n    state_topic: 'one/hearth/flue_temp_c'\n    unit_of_measurement: '°C'`
        };
      default:
        return {
          thermoFlow: '⚡ Passive Zero-Watt Usufruct Fixture',
          materials: 'Sustainably Harvested Timber, Recycled Metals',
          fabrication: 'FabLab CNC Routed Flatpack Joinery',
          yaml: `# Verified Usufruct Equipment Blueprint\nstatus: AGPL-3.0-or-later\ntelemetry: passive`
        };
    }
  }

  exportStl() {
    if (!this.currentModelGroup) return;

    const exporter = new STLExporter();
    const result = exporter.parse(this.currentModelGroup, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    const filename = `ONE_${this.currentProp?.type || 'MODULE'}_blueprint.stl`.toLowerCase();

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}
