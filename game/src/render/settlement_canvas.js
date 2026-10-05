/**
 * O.N.E. Living 2D Village Canvas Plot & Camper Van Renderer
 * Milestone 2 Implementation — Sim Reuse First Architecture.
 * Renders the 2D living campsite, parked camper van, animated pioneer sprites,
 * day/night circadian lighting, placement grid, and sensory particle effects.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { soundFX } from '../audio/sound_fx.js';
import { buildingInspector } from '../ui/building_inspector.js';

export class SettlementCanvas {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');

    // Camera transform
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.25,
      targetZoom: 1.25,
      minZoom: 0.30,
      maxZoom: 2.4
    };

    this.cameraFlight = null; // { startX, startY, startZoom, targetX, targetY, targetZoom, startTime, duration }
    this.hoveredDistrict = null;

    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragDistance = 0;
    this.mouseWorldPos = { x: 0, y: 0 };
    this.placementBuilding = null; // 'solar_array' | 'rain_cistern' | 'garden_bed'
    this.hoveredBuilding = null;
    this.selectedBuilding = null;

    // Visual feedback particles
    this.floatingTexts = [];
    this.particles = [];

    // Animated pioneers local simulation state
    this.pioneers = [];
    this.initPioneers();

    // Trees & decorative landscape objects
    this.trees = [
      { x: -160, y: -90, radius: 24, type: 'pine' },
      { x: -130, y: 130, radius: 26, type: 'oak' },
      { x: 170, y: -110, radius: 22, type: 'pine' },
      { x: 190, y: 80, radius: 28, type: 'apple' },
      { x: -80, y: -140, radius: 20, type: 'oak' },
      { x: 110, y: 140, radius: 22, type: 'pine' }
    ];

    this.animFrameId = null;
    this.lastTickTime = performance.now();
    this.tick = 0;
    this.nightAlpha = 0;
    this.isTransitioningNight = false;

    this.initEvents();
    this.resize();
    this.startLoop();
  }

  initPioneers() {
    const player = gameState.data.player;

    this.pioneers = [
      {
        id: 'player',
        name: player.name,
        role: player.roleTitle,
        vocationId: player.vocationId,
        isPlayer: true,
        x: -25,
        y: 40,
        targetX: -25,
        targetY: 40,
        speed: 0.6,
        facing: 1,
        color: '#fbbf24',
        bubble: '⚡ 45 kWh Battery Ready',
        bubbleTimer: 0,
        appearance: player.appearance || { gender: 'M', hairStyle: 'fade', hairColor: '#1e293b', skinTone: '#fbb77a' }
      }
    ];

    // Populate companions dynamically without duplicate static entities
    this.updatePioneers();

    // React to live player profile updates
    gameState.on('player_updated', (p) => {
      const pl = this.pioneers.find(x => x.isPlayer);
      if (pl) {
        pl.name = p.name;
        pl.role = p.roleTitle;
        pl.vocationId = p.vocationId;
      }
      this.updatePioneers();
    });

    gameState.on('appearance_updated', (app) => {
      const pl = this.pioneers.find(x => x.isPlayer);
      if (pl) {
        pl.appearance = { ...app };
      }
    });

    gameState.on('day_advanced', () => {
      this.updatePioneers();
    });
  }

  updatePioneers() {
    const comps = gameState.data.companions || [];

    // Filter out stale or duplicate non-player pioneers
    this.pioneers = this.pioneers.filter(p => p.isPlayer || comps.some(c => c.id === p.id || (c.vocationId === p.vocationId && c.name === p.name)));

    comps.forEach((comp, idx) => {
      let existing = this.pioneers.find(p => p.id === comp.id || (!p.isPlayer && p.vocationId === comp.vocationId && p.name === comp.name));
      if (existing) {
        existing.id = comp.id;
        existing.name = comp.name;
        existing.role = comp.roleTitle;
        existing.vocationId = comp.vocationId;
        if (comp.appearance) existing.appearance = comp.appearance;
      } else {
        const colors = {
          builder: '#ea580c',
          gardener: '#10b981',
          electrician: '#fbbf24',
          telemetry: '#06b6d4',
          water_tech: '#0284c7',
          blacksmith: '#d97706',
          chef: '#f43f5e',
          scout: '#f59e0b',
          medic: '#ec4899',
          forester: '#059669',
          educator: '#8b5cf6',
          elder: '#94a3b8',
          mediator: '#6366f1'
        };
        const pColor = colors[comp.vocationId] || '#8b5cf6';
        const isScout = comp.vocationId === 'scout';
        const isElder = comp.vocationId === 'elder';

        this.pioneers.push({
          id: comp.id,
          name: comp.name,
          role: comp.roleTitle,
          vocationId: comp.vocationId,
          isPlayer: false,
          isScout,
          isElder,
          x: -30 + idx * 24,
          y: 50 + (idx % 2) * 18,
          targetX: -30 + idx * 24,
          targetY: 50 + (idx % 2) * 18,
          speed: isScout ? 0.75 : (isElder ? 0.35 : 0.5),
          facing: 1,
          color: pColor,
          bubble: `👋 ${comp.name} arrived at camp!`,
          bubbleTimer: 180,
          appearance: comp.appearance || { gender: 'M', hairStyle: 'fade', hairColor: '#1e293b', skinTone: '#fed7aa' }
        });
      }
    });
  }

  resize() {
    const parent = this.canvas.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.cssWidth = width;
    this.cssHeight = height;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Drag & Pan
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.cameraFlight = null;
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.dragDistance = 0;
      }
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      // Calculate world coordinates
      this.mouseWorldPos = this.screenToWorld(mouseScreenX, mouseScreenY);

      if (this.isDragging) {
        const dx = (e.clientX - this.dragStart.x) / this.camera.zoom;
        const dy = (e.clientY - this.dragStart.y) / this.camera.zoom;
        this.dragDistance += Math.hypot(dx, dy);
        this.camera.x += dx;
        this.camera.y += dy;
        this.dragStart = { x: e.clientX, y: e.clientY };
      } else if (!this.placementBuilding) {
        const hovered = this.findBuildingAt(this.mouseWorldPos.x, this.mouseWorldPos.y);
        this.hoveredBuilding = hovered;
        this.hoveredDistrict = hovered ? null : this.findDistrictAt(this.mouseWorldPos.x, this.mouseWorldPos.y);
        this.canvas.style.cursor = (hovered || this.hoveredDistrict) ? 'pointer' : 'default';
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Click to Place Building OR Inspect Building OR Fly to District
    this.canvas.addEventListener('click', (e) => {
      if (this.dragDistance > 6) {
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const worldPos = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

      if (this.placementBuilding) {
        this.placeBuildingAt(worldPos.x, worldPos.y);
      } else {
        const clicked = this.findBuildingAt(worldPos.x, worldPos.y);
        if (clicked) {
          soundFX.playClick();
          this.selectedBuilding = clicked;
          buildingInspector.open(clicked);
          this.addFloatingText(clicked.x || 0, (clicked.y || 0) - 28, `🔍 ${clicked.name || 'Inspected'}`, '#38bdf8');
        } else {
          const distClicked = this.findDistrictAt(worldPos.x, worldPos.y);
          if (distClicked) {
            soundFX.playClick();
            this.flyToDistrict(distClicked.id);
            this.addFloatingText(distClicked.center.x, distClicked.center.y - distClicked.radius - 24, `📍 ${distClicked.name}`, distClicked.color);
            if (window.gameHUD && typeof window.gameHUD.selectDistrict === 'function') {
              window.gameHUD.selectDistrict(distClicked.id);
            }
          }
        }
      }
    });

    // Wheel Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.camera.zoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, this.camera.zoom * zoomFactor));
    }, { passive: false });

    // Touch Support for mobile / tablet
    let touchDist = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = (e.touches[0].clientX - this.dragStart.x) / this.camera.zoom;
        const dy = (e.touches[0].clientY - this.dragStart.y) / this.camera.zoom;
        this.camera.x += dx;
        this.camera.y += dy;
        this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchDist;
        this.camera.zoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, this.camera.zoom * factor));
        touchDist = dist;
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  screenToWorld(screenX, screenY) {
    const cx = this.cssWidth / 2;
    const cy = this.cssHeight / 2;
    const worldX = (screenX - cx) / this.camera.zoom - this.camera.x;
    const worldY = (screenY - cy) / this.camera.zoom - this.camera.y;
    return { x: worldX, y: worldY };
  }

  worldToScreen(worldX, worldY) {
    const cx = this.cssWidth / 2;
    const cy = this.cssHeight / 2;
    const screenX = (worldX + this.camera.x) * this.camera.zoom + cx;
    const screenY = (worldY + this.camera.y) * this.camera.zoom + cy;
    return { x: screenX, y: screenY };
  }

  flyTo(targetX, targetY, targetZoom, durationMs = 800) {
    this.cameraFlight = {
      startX: this.camera.x,
      startY: this.camera.y,
      startZoom: this.camera.zoom,
      targetX,
      targetY,
      targetZoom: Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, targetZoom)),
      startTime: performance.now(),
      duration: durationMs
    };
  }

  flyToDistrict(districtId) {
    if (districtId === 'whole_city' || districtId === 'overview') {
      this.flyTo(0, 30, 0.48, 900);
      return;
    }
    const d = gameState.getDistrict ? gameState.getDistrict(districtId) : null;
    if (d && d.center) {
      this.flyTo(-d.center.x, -d.center.y, 1.15, 800);
    }
  }

  findDistrictAt(worldX, worldY) {
    const districts = gameState.getDistricts ? gameState.getDistricts() : [];
    for (const d of districts) {
      const dist = Math.hypot(worldX - d.center.x, worldY - d.center.y);
      if (dist <= d.radius) {
        return d;
      }
    }
    return null;
  }

  setPlacementMode(buildingType) {
    this.placementBuilding = buildingType;
    this.canvas.style.cursor = 'crosshair';
  }

  cancelPlacementMode() {
    this.placementBuilding = null;
    this.canvas.style.cursor = 'default';
  }

  findBuildingAt(worldX, worldY) {
    const buildings = gameState.data.buildings || [];

    // 1. Check constructed buildings
    for (const b of buildings) {
      if (b.type === 'camper_van') continue;
      const r = b.type === 'guest_dome' ? 36 : (b.type === 'fablab' ? 44 : 30);
      const dist = Math.hypot(worldX - b.x, worldY - b.y);
      if (dist <= r) {
        return b;
      }
    }

    // 2. Check camper van (around 0, 0 with box ~92x54)
    if (Math.abs(worldX) < 48 && Math.abs(worldY) < 28) {
      return buildings.find(b => b.type === 'camper_van') || {
        type: 'camper_van',
        name: 'Pioneer Haven (Camper Van)',
        x: 0,
        y: 0
      };
    }

    return null;
  }

  renderHoverHighlight(ctx) {
    if (!this.hoveredBuilding || this.placementBuilding) return;

    const b = this.hoveredBuilding;
    const x = b.x || 0;
    const y = b.y || 0;
    const isVan = b.type === 'camper_van';

    ctx.save();
    ctx.translate(x, y);

    const time = performance.now() / 1000;
    const pulse = 1.0 + Math.sin(time * 5) * 0.06;

    // Glowing selection ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -time * 16;
    ctx.beginPath();
    if (isVan) {
      ctx.roundRect(-46 * pulse, -28 * pulse, 92 * pulse, 56 * pulse, 12);
    } else {
      const r = (b.type === 'guest_dome' ? 36 : (b.type === 'fablab' ? 44 : 30)) * pulse;
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.stroke();

    // Floating tooltip tag above building
    const tagY = isVan ? -36 : -34;
    const name = isVan ? '🚐 Pioneer Haven (Click to Inspect)' : `${b.name || 'Building'} (Click to Inspect)`;

    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(name).width;
    const pad = 6;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - pad, tagY - 14, textWidth + pad * 2, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 0, tagY - 5);

    ctx.restore();
  }

  checkPlacementCollision(worldX, worldY, buildingType) {
    const snapX = Math.round(worldX / 20) * 20;
    const snapY = Math.round(worldY / 20) * 20;

    // 1. Commons Sanctuary & Camper Van clearance (radius 64px & bounding box)
    if (Math.hypot(snapX, snapY) < 64 || (Math.abs(snapX) < 70 && Math.abs(snapY) < 45)) {
      return { valid: false, reason: 'Commons Sanctuary: village hearth must stay clear' };
    }

    // 2. Collision with ANY existing building (clearance of at least 55px)
    const buildings = gameState.data.buildings;
    for (const b of buildings) {
      if (b.type === 'camper_van') continue;
      const dist = Math.hypot(snapX - b.x, snapY - b.y);
      if (dist < 55) {
        return { valid: false, reason: 'Too close to existing structure' };
      }
    }

    // 3. Collision with trees (clearance of at least t.radius + 18px)
    for (const t of this.trees) {
      const dist = Math.hypot(snapX - t.x, snapY - t.y);
      if (dist < t.radius + 18) {
        return { valid: false, reason: 'Area blocked by tree' };
      }
    }

    // 4. Boundary check: allow placement inside central clearing OR any unlocked district
    const distFromCenter = Math.hypot(snapX, snapY);
    const inCentralClearing = distFromCenter <= 340;
    const districts = gameState.getDistricts ? gameState.getDistricts() : [];
    const inDistrict = districts.some(d => {
      if (!d.unlocked) return false;
      const dDist = Math.hypot(snapX - d.center.x, snapY - d.center.y);
      return dDist <= d.radius;
    });

    if (!inCentralClearing && !inDistrict) {
      return { valid: false, reason: 'Outside designated zoning districts' };
    }

    return { valid: true, snapX, snapY };
  }

  placeBuildingAt(x, y) {
    if (!this.placementBuilding) return;

    const canBuild = gameState.canBuild(this.placementBuilding);
    if (!canBuild.ok) {
      this.addFloatingText(x, y - 20, `⚠️ ${canBuild.reason}`, '#f59e0b');
      this.cancelPlacementMode();
      return;
    }

    const collision = this.checkPlacementCollision(x, y, this.placementBuilding);
    if (!collision.valid) {
      this.addFloatingText(x, y - 20, `⚠️ ${collision.reason}!`, '#ef4444');
      return;
    }

    const type = this.placementBuilding;
    const building = gameState.addBuilding(type, collision.snapX, collision.snapY);
    if (building.error) {
      this.addFloatingText(collision.snapX, collision.snapY - 20, `⚠️ ${building.error}`, '#ef4444');
      this.cancelPlacementMode();
      return;
    }

    // Juice audio & visual feedback
    soundFX.playBuildThunk();
    this.spawnDust(collision.snapX, collision.snapY);

    if (type === 'solar_array') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '+1.5 kWh/day Solar Grid!', '#fbbf24');
    } else if (type === 'rain_cistern') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '+1,000 L Water Cistern!', '#38bdf8');
    } else if (type === 'garden_bed') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '+2,200 kcal/day Fresh Greens!', '#10b981');
    } else if (type === 'lora_mast') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '📡 Reticulum Mesh Active (+100 km)!', '#38bdf8');
    } else if (type === 'guest_dome') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🏨 Civic Guest Pavilion Built (4 Beds)!', '#fbbf24');
    } else if (type === 'reed_bed') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🌿 65% Greywater Recycled into Crops!', '#34d399');
    } else if (type === 'fablab') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🛠️ LinuxCNC FabLab Online! Robotics Unlocked!', '#f59e0b');
    } else if (type === 'farm_bot') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🤖 FarmBot Deployed! Garden Weeding Extinguished (-2h)!', '#10b981');
    } else if (type === 'auto_valves') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '💧 Subsurface Solenoids Online! Water Hauling Extinguished (-2h)!', '#38bdf8');
    } else if (type === 'aquaponics_greenhouse') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🌿 Aquaponics Greenhouse Online (+6.0k kcal/d)!', '#10b981');
    } else if (type === 'grain_silo') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🌾 Heirloom Grain Silo Erected (+30k kcal Storage)!', '#fbbf24');
    } else if (type === 'heavy_gantry_mill') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '⚙️ Heavy 5-Axis Gantry Mill Online (4.0x Tooling)!', '#f59e0b');
    } else if (type === 'solar_foundry') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🔥 Inductive Solar Foundry Operational!', '#ef4444');
    } else if (type === 'trike_depot') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🚴 Solar Trike Fleet Depot Online (Express Transit)!', '#06b6d4');
    } else if (type === 'drone_vertiport') {
      this.addFloatingText(collision.snapX, collision.snapY - 30, '🛸 Autonomous Courier Vertiport Active (Air Cargo)!', '#38bdf8');
    }

    // Direct specialized pioneer to walk to the site
    let workerVocation = 'builder';
    if (type === 'solar_array' || type === 'farm_bot') workerVocation = 'electrician';
    else if (type === 'rain_cistern' || type === 'garden_bed') workerVocation = 'gardener';
    else if (type === 'lora_mast') workerVocation = 'telemetry';
    else if (type === 'reed_bed' || type === 'auto_valves') workerVocation = 'water_tech';

    const worker = this.pioneers.find(p => p.vocationId === workerVocation) || this.pioneers[0];
    if (worker) {
      worker.targetX = collision.snapX - 20;
      worker.targetY = collision.snapY + 15;
      worker.bubble = '🛠️ Assembling & Commissioning';
      worker.bubbleTimer = 180;
    }

    this.cancelPlacementMode();
  }

  addFloatingText(x, y, text, color = '#10b981') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      life: 80
    });
  }

  spawnDust(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6,
        radius: 2 + Math.random() * 3.5,
        color: 'rgba(217, 119, 6, 0.4)',
        life: 30,
        maxLife: 30
      });
    }
  }

  startLoop() {
    this.render(); // Immediate synchronous paint
    const loop = (timestamp) => {
      this.animFrameId = requestAnimationFrame(loop);
      const dt = (timestamp - this.lastTickTime) / 1000;
      this.lastTickTime = timestamp;
      this.tick++;

      this.update(dt);
      this.render();
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    // 0. Update camera flight interpolation
    if (this.cameraFlight) {
      const now = performance.now();
      const elapsed = now - this.cameraFlight.startTime;
      const progress = Math.min(1.0, elapsed / this.cameraFlight.duration);
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.x = this.cameraFlight.startX + (this.cameraFlight.targetX - this.cameraFlight.startX) * ease;
      this.camera.y = this.cameraFlight.startY + (this.cameraFlight.targetY - this.cameraFlight.startY) * ease;
      this.camera.zoom = this.cameraFlight.startZoom + (this.cameraFlight.targetZoom - this.cameraFlight.startZoom) * ease;

      if (progress >= 1.0) {
        this.cameraFlight = null;
      }
    }

    // 1. Update pioneer autonomous wandering & animations
    this.pioneers.forEach(p => {
      // Occasional new wander destination: either in their assigned district or near central van
      if (Math.random() < 0.006 && Math.hypot(p.x - p.targetX, p.y - p.targetY) < 5) {
        const districts = gameState.getDistricts ? gameState.getDistricts() : [];
        const distObj = p.vocationId ? districts.find(d => d.vocationFocus && d.vocationFocus.includes(p.vocationId)) : null;
        if (distObj && Math.random() < 0.65) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (distObj.radius * 0.65);
          p.targetX = distObj.center.x + Math.cos(angle) * dist;
          p.targetY = distObj.center.y + Math.sin(angle) * dist;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const dist = 15 + Math.random() * 45;
          p.targetX = Math.cos(angle) * dist;
          p.targetY = 25 + Math.sin(angle) * dist * 0.7; // bias to front patio
        }
      }

      // Move toward target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        p.facing = dx >= 0 ? 1 : -1;
        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;
        p.isMoving = true;
      } else {
        p.isMoving = false;
      }

      // Decrement speech bubble
      if (p.bubbleTimer > 0) {
        p.bubbleTimer--;
        if (p.bubbleTimer <= 0) {
          p.bubble = null;
        }
      }
    });

    // 2. Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.6;
      ft.life--;
      ft.alpha = Math.max(0, ft.life / 30);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 3. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    ctx.save();
    // Center camera
    ctx.translate(this.cssWidth / 2, this.cssHeight / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(this.camera.x, this.camera.y);

    // 1. Terrain & Grid Ground
    this.renderGround(ctx);

    // 2. Landscape Trees & Flora
    this.renderTrees(ctx);

    // 3. Constructed Infrastructure (Placed Buildings)
    this.renderBuildings(ctx);

    // 4. The Camper Van (Centerpiece Base)
    this.renderCamperVan(ctx);

    // 5. Pioneers (Living Animated Sprites)
    this.renderPioneers(ctx);

    // 5.2 Inter-Node Logistics Convoys
    this.renderConvoys(ctx);

    // 5.5 Hover & Click Selection Highlight
    this.renderHoverHighlight(ctx);

    // 6. Placement Guide & Dynamic Zoning Guidelines
    if (this.placementBuilding) {
      this.renderZoningGuidelines(ctx);
      this.renderPlacementPreview(ctx);
    }

    // 7. Particles & Floating Juice
    this.renderJuice(ctx);

    ctx.restore();

    // 8. Circadian Dawn Light Overlay (Screen-space)
    this.renderCircadianOverlay(ctx);

    // 9. Dynamic Bioregional Weather (Rain particles, storm lightning, amber drought shimmer)
    this.renderWeather(ctx);
  }

  renderGround(ctx) {
    // 1. Bioregional Macro-Terrain Base (1250px radius)
    const bgGradient = ctx.createRadialGradient(0, 30, 80, 0, 30, 1200);
    bgGradient.addColorStop(0, '#153123'); // fertile central valley
    bgGradient.addColorStop(0.5, '#0f241a');
    bgGradient.addColorStop(0.85, '#091811');
    bgGradient.addColorStop(1, '#050f0a');

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(0, 30, 1250, 0, Math.PI * 2);
    ctx.fill();

    // 2. Subtle Macro Grid Lines (40px grid)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -800; x <= 800; x += 40) {
      ctx.moveTo(x, -640);
      ctx.lineTo(x, 640);
    }
    for (let y = -640; y <= 640; y += 40) {
      ctx.moveTo(-800, y);
      ctx.lineTo(800, y);
    }
    ctx.stroke();

    // 3. Solarpunk Arterial Pathways
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 3.1 Agora Promenade (North): Central clearing -> Agora Core
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.16)'; // crushed limestone cobble
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -115);
    ctx.stroke();

    // 3.2 Agro Commons Trail (South-West): Central clearing -> Agroecological Belt
    ctx.strokeStyle = 'rgba(41, 31, 20, 0.40)'; // packed organic mulch & clay
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.quadraticCurveTo(-140, 90, -320, 220);
    ctx.stroke();

    // 3.3 FabLab Industrial Road (East): Central clearing -> FabLab Quarter
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.22)'; // terracotta paver track
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.quadraticCurveTo(160, -10, 340, -30);
    ctx.stroke();

    // 3.4 MHU Ecovillage Promenade (West): Central clearing -> Living Ecovillage
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.18)'; // pea-gravel walkway
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.quadraticCurveTo(-150, -30, -340, -80);
    ctx.stroke();

    // 3.5 Intermodal Logistics Corridor (South-East): Central clearing -> Transit Hub
    ctx.strokeStyle = 'rgba(64, 49, 31, 0.45)'; // reinforced logistics dirt/gravel
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.quadraticCurveTo(140, 130, 300, 280);
    ctx.stroke();

    // 3.6 Circumferential Inter-District Ring Road: Agro Belt <-> Transit Hub <-> FabLab
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 16;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(-320, 220);
    ctx.quadraticCurveTo(0, 340, 300, 280);
    ctx.quadraticCurveTo(360, 140, 340, -30);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3.7 Low-Voltage Solar Pathway Bollards along paths (illuminate warm amber at dusk/night)
    const bollardAlpha = Math.max(0.15, this.nightAlpha || 0);
    const bollards = [
      { x: 0, y: -50 }, { x: -80, y: 70 }, { x: -190, y: 140 }, { x: -260, y: 190 },
      { x: 90, y: 5 }, { x: 200, y: -15 }, { x: 280, y: -25 },
      { x: -90, y: -10 }, { x: -210, y: -50 }, { x: -280, y: -70 },
      { x: 80, y: 80 }, { x: 170, y: 170 }, { x: 240, y: 230 }
    ];
    bollards.forEach(b => {
      // Bollard base post
      ctx.fillStyle = '#334155';
      ctx.fillRect(b.x - 2, b.y - 4, 4, 8);
      // Amber solar LED
      ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + bollardAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. The 5 Canonical Bioregional Districts Ground Visuals
    const districts = gameState.getDistricts ? gameState.getDistricts() : [];
    districts.forEach(d => {
      ctx.save();
      const cx = d.center.x;
      const cy = d.center.y;
      const r = d.radius;
      const isHovered = this.hoveredDistrict && this.hoveredDistrict.id === d.id;

      // 4.1 Outer Boundary Zone Ring (Glowing Dashed Solarpunk Halo)
      ctx.strokeStyle = isHovered ? d.color : `${d.color}44`;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4.2 District Specific Ground Character
      if (d.id === 'agora_core') {
        // Tiered concentric stone amphitheater pavers
        ctx.fillStyle = 'rgba(241, 245, 249, 0.05)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(241, 245, 249, 0.12)';
        ctx.lineWidth = 1.2;
        [r * 0.35, r * 0.6, r * 0.85].forEach(tr => {
          ctx.beginPath();
          ctx.arc(cx, cy, tr, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (d.id === 'agro_belt') {
        // Dark fertile humus loam ground with swale contours
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
        ctx.fill();

        // Bioswale contour rills
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(cx, cy - 30, r * 0.7, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + 30, r * 0.75, 1.2 * Math.PI, 1.8 * Math.PI, false);
        ctx.stroke();
      } else if (d.id === 'fablab_quarter') {
        // Terracotta industrial paver apron
        ctx.fillStyle = 'rgba(245, 158, 11, 0.07)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
        ctx.fill();

        // Copper grounding grid lines
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.18)';
        ctx.lineWidth = 1;
        for (let gx = cx - r * 0.7; gx <= cx + r * 0.7; gx += 30) {
          ctx.beginPath();
          ctx.moveTo(gx, cy - r * 0.5);
          ctx.lineTo(gx, cy + r * 0.5);
          ctx.stroke();
        }
      } else if (d.id === 'mhu_ecovillage') {
        // Warm pea-gravel and stepping courts
        ctx.fillStyle = 'rgba(168, 85, 247, 0.06)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
        ctx.fill();

        // Courtyard circular garden borders
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.20)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
        ctx.stroke();
      } else if (d.id === 'transit_hub') {
        // Reinforced concrete landing apron
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
        ctx.fill();

        // Dual Vertiport Octagonal Landing Pads with painted 'H'
        const pads = [{ x: cx - 45, y: cy }, { x: cx + 45, y: cy }];
        pads.forEach((pad, idx) => {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pad.x, pad.y, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Yellow/cyan helipad ring
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pad.x, pad.y, 18, 0, Math.PI * 2);
          ctx.stroke();

          // White Painted 'H'
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H', pad.x, pad.y);

          // Pulsing corner beacon LEDs
          const pulse = (Math.sin(this.tick * 0.08 + idx) + 1) / 2;
          ctx.fillStyle = `rgba(6, 182, 212, ${0.4 + pulse * 0.6})`;
          ctx.beginPath();
          ctx.arc(pad.x - 17, pad.y - 17, 2.5, 0, Math.PI * 2);
          ctx.arc(pad.x + 17, pad.y - 17, 2.5, 0, Math.PI * 2);
          ctx.arc(pad.x - 17, pad.y + 17, 2.5, 0, Math.PI * 2);
          ctx.arc(pad.x + 17, pad.y + 17, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4.3 Floating Solarpunk District Telemetry Banner
      const tagText = `${d.icon} ${d.name.toUpperCase()}`;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx.measureText(tagText);
      const tagW = textMetrics.width + 20;
      const tagH = 20;
      const tagY = cy - r - 12;

      ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.82)';
      ctx.strokeStyle = isHovered ? d.color : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isHovered ? 1.5 : 1.0;
      ctx.beginPath();
      ctx.roundRect(cx - tagW / 2, tagY - tagH / 2, tagW, tagH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#ffffff' : d.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, cx, tagY);

      ctx.restore();
    });

    // 5. Dark Earth Loam Camping Clearing around Van
    ctx.fillStyle = 'rgba(41, 31, 20, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 95, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Wildflower Meadow Specks
    const flowers = [
      { x: -70, y: 70, c: '#fbbf24' },
      { x: -90, y: 30, c: '#f43f5e' },
      { x: 120, y: -40, c: '#38bdf8' },
      { x: -50, y: -70, c: '#a855f7' },
      { x: 60, y: -80, c: '#fbbf24' },
      { x: 130, y: 60, c: '#f43f5e' },
      { x: -180, y: 40, c: '#fbbf24' },
      { x: 210, y: -70, c: '#34d399' },
      { x: -220, y: -120, c: '#f43f5e' },
      { x: 180, y: 150, c: '#38bdf8' }
    ];
    flowers.forEach(f => {
      ctx.fillStyle = f.c;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderTrees(ctx) {
    this.trees.forEach(t => {
      // Tree cast shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(t.x + 8, t.y + 12, t.radius * 0.9, t.radius * 0.45, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(t.x - 3, t.y - 4, 6, 16);

      // Foliage layers with wind sway
      const sway = Math.sin(this.tick * 0.04 + t.x) * 1.5;
      ctx.fillStyle = t.type === 'pine' ? '#064e3b' : (t.type === 'apple' ? '#15803d' : '#047857');
      ctx.beginPath();
      ctx.arc(t.x + sway, t.y - 12, t.radius, 0, Math.PI * 2);
      ctx.fill();

      // Top highlighted canopy
      ctx.fillStyle = t.type === 'pine' ? '#059669' : '#10b981';
      ctx.beginPath();
      ctx.arc(t.x + sway - 3, t.y - 16, t.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderCamperVan(ctx) {
    ctx.save();
    ctx.translate(0, 0);

    // 1. Van Soft Ambient Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 68, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Extended Awning Shaded Patio on Front
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.moveTo(-45, 12);
    ctx.lineTo(45, 12);
    ctx.lineTo(55, 45);
    ctx.lineTo(-55, 45);
    ctx.closePath();
    ctx.fill();

    // Awning Canvas Roof (Striped Green & Cream)
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.moveTo(-44, 4);
    ctx.lineTo(44, 4);
    ctx.lineTo(52, 28);
    ctx.lineTo(-52, 28);
    ctx.closePath();
    ctx.fill();

    // Awning Support Timber Poles
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-52, 28);
    ctx.lineTo(-52, 45);
    ctx.moveTo(52, 28);
    ctx.lineTo(52, 45);
    ctx.stroke();

    // Camping Table & Folding Chairs under Patio
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, 32, 20, 10);
    // Tea Kettle on table
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 34, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Folding camp chairs
    ctx.fillStyle = '#059669';
    ctx.fillRect(-18, 33, 6, 8);
    ctx.fillRect(12, 33, 6, 8);

    // 3. Van Main Chassis & Body
    // Off-white / Sage Solarpunk Body
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-54, -18, 108, 34, [14, 14, 6, 6]);
    ctx.fill();
    ctx.stroke();

    // Teal Accent Solarpunk Stripe
    ctx.fillStyle = '#0d9488';
    ctx.fillRect(-53, 2, 106, 6);

    // 4. Wheels with black rubber
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-38, 14, 14, 6);
    ctx.fillRect(24, 14, 14, 6);

    // 5. Windows
    // Windshield (Front Right)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(30, -14, 18, 14, [2, 10, 2, 2]);
    ctx.fill();

    // Side Living Windows
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-30, -12, 22, 11);
    ctx.fillRect(-2, -12, 22, 11);

    // 6. Roof Rack & Rooftop Solar PV Panel
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-46, -23, 76, 5); // roof rail

    // Mounted Bifacial Solar Panel on Roof
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    ctx.fillRect(-42, -26, 44, 4);
    ctx.strokeRect(-42, -26, 44, 4);

    // Spare tire on rear roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(22, -23, 5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Auxiliary Equipment & Cables
    // Power cable running to DC battery pack on ground
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-45, 10);
    ctx.quadraticCurveTo(-55, 20, -50, 32);
    ctx.stroke();

    // Outdoor Auxiliary Battery Bank (LiFePO4)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.fillRect(-54, 28, 10, 8);
    ctx.strokeRect(-54, 28, 10, 8);

    // Fresh Water Jerrycans by Rear
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-58, 8, 6, 8);

    // Badge Name on Van Door
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('O.N.E. PIONEER', 8, 0);

    ctx.restore();
  }

  renderBuildings(ctx) {
    const buildings = gameState.data.buildings;
    buildings.forEach(b => {
      if (b.type === 'camper_van') return; // rendered separately

      ctx.save();
      ctx.translate(b.x, b.y);

      if (b.type === 'solar_array') {
        // Solar Array Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 28, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Timber A-Frame Supports
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-20, 10);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-8, 10);
        ctx.moveTo(8, 10);
        ctx.lineTo(14, -12);
        ctx.lineTo(20, 10);
        ctx.stroke();

        // 3 Bifacial Blue PV Panels
        ctx.fillStyle = '#1e40af';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-24, -18, 48, 18, 3);
        ctx.fill();
        ctx.stroke();

        // Solar Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(0, 0);
        ctx.moveTo(-24, -9);
        ctx.lineTo(24, -9);
        ctx.stroke();

        // Digital Micro-Inverter with Glowing LED
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5, 4, 10, 7);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 7.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ 1.5 kW', 0, 22);

      } else if (b.type === 'rain_cistern') {
        // Rain Cistern Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cylindrical Cistern Body
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-16, -18, 32, 28, 4);
        ctx.fill();
        ctx.stroke();

        // Water Level Sight Tube on Front
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(-12, -14, 3, 20);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-12, -4, 3, 10); // current water level

        // Brass Outlet Spigot
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(16, 2, 4, 3);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('💧 1,000 L', 0, 22);

      } else if (b.type === 'garden_bed') {
        // Raised Timber Bed Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Framing Box
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-24, -12, 48, 22);

        // Rich Dark Compost Soil
        ctx.fillStyle = '#291e14';
        ctx.fillRect(-21, -9, 42, 16);

        // Fresh Green Seedling Rows
        ctx.fillStyle = '#22c55e';
        for (let gx = -16; gx <= 16; gx += 8) {
          ctx.beginPath();
          ctx.arc(gx, -3, 2.5, 0, Math.PI * 2);
          ctx.arc(gx + 3, 3, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🥗 Crops', 0, 22);

      } else if (b.type === 'lora_mast') {
        // LoRa Telemetry Mast Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Steel Guy-Wires / Stay Cables to ground anchors
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(-24, 8);
        ctx.moveTo(0, -42);
        ctx.lineTo(24, 8);
        ctx.stroke();

        // Ground Anchor Pegs
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-26, 6, 4, 4);
        ctx.fillRect(22, 6, 4, 4);

        // Lattice Triangular Mast Tower
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 8);
        ctx.lineTo(-1, -44);
        ctx.lineTo(1, -44);
        ctx.lineTo(6, 8);
        ctx.stroke();

        // Horizontal Cross-Braces
        ctx.lineWidth = 1;
        for (let my = 4; my >= -40; my -= 8) {
          ctx.beginPath();
          ctx.moveTo(-5 * (1 - (8 - my)/60), my);
          ctx.lineTo(5 * (1 - (8 - my)/60), my);
          ctx.stroke();
        }

        // Dipole Antenna at Top (Red & White fiberglass radome)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-1.5, -54, 3, 6);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-1.5, -48, 3, 6);

        // Blinking Cyan/Green Telemetry Beacon
        const beaconBlink = Math.sin(this.tick * 0.1) > 0;
        ctx.fillStyle = beaconBlink ? '#10b981' : '#059669';
        ctx.beginPath();
        ctx.arc(0, -56, beaconBlink ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();

        // Radiating Solarpunk Radio Pulses (Expanding concentric ripples)
        const pulseRadius = (this.tick % 60) * 0.7;
        const pulseAlpha = Math.max(0, 1 - (pulseRadius / 42));
        ctx.strokeStyle = `rgba(16, 185, 129, ${pulseAlpha * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, -56, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('📡 LoRa Mesh', 0, 20);

      } else if (b.type === 'guest_dome') {
        // Geodesic Dome Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 34, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal Timber Geodesic Strut Framework
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // Warm translucent glow
        ctx.strokeStyle = '#d97706'; // Timber struts
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(24, -14);
        ctx.lineTo(28, 8);
        ctx.lineTo(0, 14);
        ctx.lineTo(-28, 8);
        ctx.lineTo(-24, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Internal Geodesic Triangulation Struts
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(0, 14);
        ctx.moveTo(-24, -14);
        ctx.lineTo(24, -14);
        ctx.moveTo(-28, 8);
        ctx.lineTo(0, -6);
        ctx.lineTo(28, 8);
        ctx.stroke();

        // Warm Amber Lantern Interior Window
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -4, 5, 0, Math.PI * 2);
        ctx.fill();

        // Solarpunk Entryway Arch & Potted Fern
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-6, 6, 12, 9);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-10, 12, 3.5, 0, Math.PI * 2);
        ctx.arc(10, 12, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🏨 Guest Dome (4)', 0, 26);

      } else if (b.type === 'reed_bed') {
        // Oval Gravel Basin Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 30, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // River Stone Retaining Border
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(0, 2, 28, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pea Gravel Bio-filtration Bed
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(0, 2, 25, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water Surface Shimmer
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 3, 21, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated Tall Cattail Reeds & Yellow Water Irises swaying in breeze
        const reedSway = Math.sin(this.tick * 0.05) * 2;
        const reedOffsets = [-16, -10, -4, 2, 8, 14];
        reedOffsets.forEach((rx, idx) => {
          // Green Stalk
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rx, 4);
          ctx.quadraticCurveTo(rx + reedSway * 0.5, -8, rx + reedSway * (idx % 2 === 0 ? 1 : 0.8), -18);
          ctx.stroke();

          // Brown Velvet Cattail Top
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(rx + reedSway - 1.5, -17, 3, 7, 1.5);
          ctx.fill();

          // Yellow Iris Bloom on every 3rd stalk
          if (idx % 3 === 0) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(rx + reedSway + 2, -12, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Inlet Water Flow Tube
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-28, -2, 5, 4);

        // Label Tag
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 65% Recycled', 0, 24);

      } else if (b.type === 'fablab') {
        // Workshop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 38, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Timber Walls & Frame
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-30, -18, 60, 30);

        // Corrugated Metal Roof with Overhang
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(-35, -16);
        ctx.lineTo(0, -32);
        ctx.lineTo(35, -16);
        ctx.lineTo(32, -13);
        ctx.lineTo(0, -29);
        ctx.lineTo(-32, -13);
        ctx.closePath();
        ctx.fill();

        // Roof Skylight Glass
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(-12, -26, 24, 7);

        // Sliding Barn Doors (Open to reveal interior shop)
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(-18, -4, 36, 16);

        // Interior Workbench & 3D Printer glowing
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, 2, 28, 4);
        // Voron 3D printer frame
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -3, 8, 7);
        // Active CNC Torch / Welder Sparks
        if (Math.random() < 0.4) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(6, 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Mini spark particle
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(6 + (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 1.5, 1.5);
        }

        // Scrap Aluminum Storage Bin outside
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(24, 2, 8, 9);

        // Signboard: FABLAB
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('FABLAB', 0, -8);

        // Label Tag
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px system-ui';
        ctx.fillText('🛠️ LinuxCNC Shop', 0, 26);

      } else if (b.type === 'farm_bot') {
        // Gantry Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 32, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Extruded V-Slot Aluminum Rails (Front & Back)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-28, -12, 56, 3);
        ctx.fillRect(-28, 8, 56, 3);

        // Vertical Gantry Columns (Left & Right)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-28, -14, 4, 24);
        ctx.fillRect(24, -14, 4, 24);

        // Moving X-Axis Crossbeam Slide
        const gantryX = Math.sin(this.tick * 0.03) * 18;
        ctx.fillStyle = '#64748b';
        ctx.fillRect(gantryX - 2, -14, 4, 24);

        // Automated Toolhead Carriage with Camera Sensor
        const toolY = -4 + Math.sin(this.tick * 0.06) * 4;
        ctx.fillStyle = '#ef4444'; // Red toolhead
        ctx.fillRect(gantryX - 4, toolY, 8, 6);

        // Red LED Soil Vision Camera
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(gantryX, toolY + 6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny water mist droplet
        if (this.tick % 10 < 5) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(gantryX, toolY + 9, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label Tag
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🤖 FarmBot Rover', 0, 24);

      } else if (b.type === 'auto_valves') {
        // Subsurface Trench Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blue Polyethylene Underground Pipe
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-22, 6);
        ctx.lineTo(22, 6);
        ctx.stroke();

        // Brass Solenoid Valve Body
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-6, 2, 12, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-4, -2, 8, 5); // Solenoid coil

        // IP67 Weatherproof Controller Box
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, -6, 10, 8);

        // Pulsing Green Status LED
        const pulseGreen = Math.sin(this.tick * 0.15) > 0;
        ctx.fillStyle = pulseGreen ? '#10b981' : '#047857';
        ctx.beginPath();
        ctx.arc(11, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Water Flow Dots along pipe
        const flowOffset = (this.tick * 0.8) % 16;
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(-16 + flowOffset, 6, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('💧 Auto-Valves', 0, 20);

      } else if (b.type === 'foundry') {
        // Heavy Cast-Iron Foundry Base Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 36, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Firebrick Kiln & Crucible Furnace
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-24, -18, 48, 28, 4);
        ctx.fill();

        // Molten Crucible Center Glow
        const meltGlow = ctx.createRadialGradient(0, -6, 2, 0, -6, 16);
        meltGlow.addColorStop(0, '#fef08a');
        meltGlow.addColorStop(0.5, '#f97316');
        meltGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = meltGlow;
        ctx.beginPath();
        ctx.arc(0, -6, 16, 0, Math.PI * 2);
        ctx.fill();

        // Crucible Rim & Ladle
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Steel Anvil on Wooden Stump (Left)
        ctx.fillStyle = '#52525b';
        ctx.fillRect(-28, 0, 8, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-30, -3, 12, 4);

        // LinuxCNC Lathe Rails (Right)
        ctx.fillStyle = '#334155';
        ctx.fillRect(16, -4, 14, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(20, -1, 6, 2);

        // Smoke Stack with Subtle Amber Shimmer
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, -34, 8, 18);
        if (this.tick % 8 < 4) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.beginPath();
          ctx.arc(0, -37, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label Tag
        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 Metal Foundry & CNC', 0, 24);

      } else if (b.type === 'kitchen_oven') {
        // Hearth Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 34, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cob Earthen Bread Dome Oven (Left)
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(-14, -4, 16, Math.PI, 0);
        ctx.lineTo(-2, 10);
        ctx.lineTo(-26, 10);
        ctx.closePath();
        ctx.fill();

        // Oven Arch with Roaring Embers
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(-14, 4, 7, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-14, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(-14, 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Communal Wooden Dining Table (Right)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, -2, 28, 12);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(4, 0, 24, 8);

        // Baskets of Fresh Sourdough Bread & Garden Salads
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(10, 2, 2.5, 0, Math.PI * 2);
        ctx.arc(16, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(22, 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🍲 Community Hearth', 0, 24);

      } else if (b.type === 'clinic') {
        // Apothecary Clinic Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 32, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cedar Shingle Cabin Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-24, -16, 48, 26);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-22, -14, 44, 22);

        // Emerald Apothecary Cross on Door
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-4, -6, 8, 2.5);
        ctx.fillRect(-1.25, -9, 2.5, 8.5);

        // Hanging Herbal Bundles (Lavender & Mint)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-18, -12, 3, 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-14, -12, 3, 5);
        ctx.fillRect(12, -12, 3, 6);

        // Frosted Mint Green Gable Roof
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(-28, -14);
        ctx.lineTo(0, -28);
        ctx.lineTo(28, -14);
        ctx.closePath();
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🩺 Health Clinic & Apothecary', 0, 22);

      } else if (b.type === 'food_forest') {
        // Forest Canopy Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 40, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tree Trunks
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-18, -6, 5, 16);
        ctx.fillRect(6, -8, 6, 18);
        ctx.fillRect(20, -4, 4, 14);

        // Lush Layered Tree Canopies
        const forestSway = Math.sin(this.tick * 0.04) * 2;
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(-16 + forestSway, -18, 16, 0, Math.PI * 2);
        ctx.arc(8 + forestSway * 0.8, -22, 19, 0, Math.PI * 2);
        ctx.arc(22 + forestSway * 1.2, -14, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hanging Apples / Fig Fruits
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-14 + forestSway, -14, 2.5, 0, Math.PI * 2);
        ctx.arc(4 + forestSway * 0.8, -16, 2.8, 0, Math.PI * 2);
        ctx.arc(14 + forestSway * 0.8, -20, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Cedar Langstroth Beehive Box (Right front)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(24, 0, 12, 10);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(24, 3, 12, 1.5);
        ctx.fillRect(24, 6, 12, 1.5);

        // Buzzing Pollen Bees
        const beeX = 28 + Math.sin(this.tick * 0.1) * 8;
        const beeY = -4 + Math.cos(this.tick * 0.12) * 5;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(beeX, beeY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🌲 Food Forest & Apiary', 0, 24);

      } else if (b.type === 'school') {
        // Pavilion Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 36, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Timber Frame Columns
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-26, -16, 4, 26);
        ctx.fillRect(22, -16, 4, 26);
        ctx.fillRect(-2, -16, 4, 26);

        // Raised Timber Deck Flooring
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-28, 6, 56, 6);

        // Solar Whiteboard / E-Paper Display Screen
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, -10, 32, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 6px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('KNOWLEDGE COMMONS', 0, -2);
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('Seeds • CAD • Ecology', 0, 2);

        // Curved Canvas Sun-Shade Canopy
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-30, -16);
        ctx.quadraticCurveTo(0, -26, 30, -16);
        ctx.lineTo(28, -12);
        ctx.quadraticCurveTo(0, -22, -28, -12);
        ctx.closePath();
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('📚 Open School & Seed Library', 0, 24);

      } else if (b.type === 'elder_sanctuary') {
        // Cabin Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 34, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cozy Timber Cabin Walls
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-24, -14, 48, 22);

        // Shaded Porch with Rocking Chair
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-26, 4, 52, 6);
        // Miniature rocking chair
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(14, 6);
        ctx.lineTo(17, -2);
        ctx.lineTo(21, 6);
        ctx.stroke();

        // Warm Amber Interior Light in Window
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-14, -8, 10, 10);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(-14, -8, 10, 10);

        // Flowering Honeysuckle Trellis Roof Overhang
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(-28, -14);
        ctx.lineTo(0, -24);
        ctx.lineTo(28, -14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(-10, -18, 2, 0, Math.PI * 2);
        ctx.arc(8, -20, 2, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('👵 Elder Sanctuary', 0, 22);

      } else if (b.type === 'agora') {
        // Socratic Hemicycle Amphitheater Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 42, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stepped Stone Tiers in Semi-Circle
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(0, 0, 38, 22, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 16, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 10, 0, Math.PI, 0);
        ctx.fill();

        // Central Rostrum / Speaker Pedestal
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bronze Sortition Urn on Pedestal
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-2, 0, 4, 5);
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Solarpunk Civic Banner
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('⚖️ DEMARCHY AGORA', 0, -10);

        // Label Tag
        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 8px system-ui';
        ctx.fillText('🏛️ Agora Amphitheater', 0, 22);

      } else if (b.type === 'biogas_digester') {
        // Digester Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 32, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hemispherical Flexible Digester Dome
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(0, 0, 22, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Retaining Ring & Concrete Foundation
        ctx.fillStyle = '#475569';
        ctx.fillRect(-24, 0, 48, 6);

        // Yellow Gas Pipeline to Kitchen Hearth
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(16, -6);
        ctx.lineTo(32, -6);
        ctx.lineTo(32, 8);
        ctx.stroke();

        // Pressure Gauge Manometer
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(16, -6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('♻️ Biogas Digester', 0, 20);

      } else if (b.type === 'seed_vault') {
        // Vault Earth Berm Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 38, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Earth-Sheltered Green Berm Mound
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(0, -2, 34, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reinforced Arched Stone Vault Portal
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 4, 14, Math.PI, 0);
        ctx.fill();

        // Heavy Insulated Airtight Vault Door
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 4, 11, Math.PI, 0);
        ctx.fill();

        // Digital Climate Sensor Display (-4°C)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, -2, 16, 5);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 5px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('-4°C 18%RH', 0, 2);

        // Thermoelectric Cooling Solar Chimney on Berm Top
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-3, -22, 6, 10);

        // Label Tag
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 8px system-ui';
        ctx.fillText('🌾 Heirloom Seed Vault', 0, 22);

      } else if (b.type === 'solar_thermal_tower') {
        // High Spire Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Central Lattice Tower Mast reaching high
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(-2, -56);
        ctx.lineTo(2, -56);
        ctx.lineTo(10, 10);
        ctx.stroke();

        // Molten Salt Thermal Receiver at Tower Apex (Glowing White-Gold)
        const receiverGlow = ctx.createRadialGradient(0, -58, 2, 0, -58, 22);
        receiverGlow.addColorStop(0, '#ffffff');
        receiverGlow.addColorStop(0.3, '#fef08a');
        receiverGlow.addColorStop(0.7, '#f59e0b');
        receiverGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = receiverGlow;
        ctx.beginPath();
        ctx.arc(0, -58, 22, 0, Math.PI * 2);
        ctx.fill();

        // Dual-Axis Ground Heliostat Mirrors reflecting sunlight
        for (let hx = -24; hx <= 24; hx += 16) {
          if (hx === 0) continue;
          ctx.fillStyle = '#93c5fd';
          ctx.fillRect(hx - 4, 6, 8, 4);
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(hx, 6);
          ctx.lineTo(0, -58);
          ctx.stroke();
        }

        // Label Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('☀️ Molten Salt Tower (24/7)', 0, 22);

      } else if (b.type === 'mist_drone') {
        // Hovering Drone Shadow on Ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hover Bobbing Motion
        const droneY = -18 + Math.sin(this.tick * 0.08) * 3;

        // Carbon-Fiber Quadcopter Arms
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, droneY - 6);
        ctx.lineTo(14, droneY + 6);
        ctx.moveTo(-14, droneY + 6);
        ctx.lineTo(14, droneY - 6);
        ctx.stroke();

        // 4 Spinning Rotor Discs
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        const rotorR = 5 + Math.sin(this.tick * 0.4) * 1;
        ctx.beginPath();
        ctx.arc(-14, droneY - 6, rotorR, 0, Math.PI * 2);
        ctx.arc(14, droneY + 6, rotorR, 0, Math.PI * 2);
        ctx.arc(-14, droneY + 6, rotorR, 0, Math.PI * 2);
        ctx.arc(14, droneY - 6, rotorR, 0, Math.PI * 2);
        ctx.fill();

        // Central Avionics Pod & Green Camera Eye
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, droneY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, droneY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Aerosol Water Mist Spray downwards
        if (this.tick % 6 < 4) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.arc(0, droneY + 10, 3, 0, Math.PI * 2);
          ctx.arc(-3, droneY + 16, 4, 0, Math.PI * 2);
          ctx.arc(3, droneY + 18, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🛸 Aeroponic Mist Drone', 0, 22);

      } else if (b.type === 'scada_bot') {
        // Crawler Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rubber Tracks / Wheels
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-16, 2, 32, 6, 3);
        ctx.fill();

        // Chassis & Solar Balancer Electronics
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-12, -6, 24, 10);

        // Rotating Soft Cleaning Brush on Front
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(12, -4, 4, 8);

        // Flashing Dual SCADA LEDs
        const ledOn = Math.sin(this.tick * 0.2) > 0;
        ctx.fillStyle = ledOn ? '#10b981' : '#059669';
        ctx.beginPath();
        ctx.arc(-6, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(6, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🤖 SCADA Balancer Bot', 0, 20);

      } else if (b.type === 'sanitization_droid') {
        // Friendly Droid Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // 254nm Blue UV-C Base Halo Glow
        const uvcGlow = ctx.createRadialGradient(0, 4, 2, 0, 4, 16);
        uvcGlow.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        uvcGlow.addColorStop(0.7, 'rgba(99, 102, 241, 0.25)');
        uvcGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = uvcGlow;
        ctx.beginPath();
        ctx.arc(0, 4, 16, 0, Math.PI * 2);
        ctx.fill();

        // Cylindrical White Body
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(-8, -12, 16, 18, 5);
        ctx.fill();

        // Digital LED Face Matrix Screen [^ _ ^]
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -10, 12, 6);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-3, -7, 1.2, 0, Math.PI * 2);
        ctx.arc(3, -7, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Spinning LiDAR Sensor Puck on Top
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, -15, 6, 3);

        // Label Tag
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🤖 Sanitization Droid', 0, 20);

      } else if (b.type === 'cobot_arm') {
        // Pedestal Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Cast Steel Pedestal Base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, 0, 16, 8);

        // Articulated Arm Kinematics
        const armSwing = Math.sin(this.tick * 0.05) * 12;
        const j1X = 0;
        const j1Y = 0;
        const j2X = armSwing;
        const j2Y = -16;
        const j3X = armSwing + Math.cos(this.tick * 0.05) * 10;
        const j3Y = -26;

        // Lower Arm (Industrial Safety Orange)
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(j1X, j1Y);
        ctx.lineTo(j2X, j2Y);
        ctx.stroke();

        // Upper Arm
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(j2X, j2Y);
        ctx.lineTo(j3X, j3Y);
        ctx.stroke();

        // Pivot Joints
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(j1X, j1Y, 3, 0, Math.PI * 2);
        ctx.arc(j2X, j2Y, 3, 0, Math.PI * 2);
        ctx.arc(j3X, j3Y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Gripper holding a small gear
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(j3X, j3Y + 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🦾 FabLab Cobot Arm', 0, 20);

      } else if (b.type === 'deep_well') {
        // Deep Well Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone Curbing & Base Trough
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-16, -6, 32, 18, 4);
        ctx.fill();
        ctx.stroke();

        // Shimmering Aquifer Water Pool in Trough
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(-12, -2, 24, 10, 2);
        ctx.fill();

        // Timber A-Frame Derrick
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, 8);
        ctx.lineTo(0, -28);
        ctx.lineTo(14, 8);
        ctx.moveTo(-9, -10);
        ctx.lineTo(9, -10);
        ctx.stroke();

        // Solar Pump Head & Pulley
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, -28, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('💧 Artesian Solar Well', 0, 24);

      } else if (b.type === 'battery_bank') {
        // Battery Storage Rack Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Weatherproof Cabinet Body
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-18, -14, 36, 22, 3);
        ctx.fill();
        ctx.stroke();

        // Modular Sodium Battery Blade Slots with Pulsing LED Status
        for (let row = 0; row < 3; row++) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-14, -10 + row * 6, 28, 4);
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(10, -8 + row * 6, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // High-Voltage DC Orange Bus Conduit
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-24, 0);
        ctx.lineTo(-24, 8);
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ +50 kWh Battery Rack', 0, 20);

      } else if (b.type === 'retention_swale') {
        // Earth Swale Basin Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 36, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vegetated Berm / Soil Contour
        ctx.fillStyle = '#1e3a1e';
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shimmering Runoff Water Pond
        ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 2, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cattails & Wetland Sedges along Edge
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        const sedges = [-16, -8, 6, 14];
        sedges.forEach(sx => {
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx + (Math.sin(this.tick * 0.04 + sx) * 2), -10);
          ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.fillRect(sx - 1, -12, 2.5, 4);
        });

        // Label Tag
        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 5,000L Swale Basin', 0, 22);

      } else if (b.type === 'aquaponics_greenhouse') {
        // Aquaponics Greenhouse Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 34, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Foundation Base Curb
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-30, -18, 60, 36, 8);
        ctx.fill();
        ctx.stroke();

        // Translucent Polycarbonate Barrel Arch
        const domeGrad = ctx.createLinearGradient(0, -18, 0, 18);
        domeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        domeGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.35)');
        domeGrad.addColorStop(1, 'rgba(6, 78, 59, 0.55)');
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.roundRect(-28, -16, 56, 32, 6);
        ctx.fill();

        // Ribbed Frame Arches
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        [-18, -6, 6, 18].forEach(rx => {
          ctx.beginPath();
          ctx.moveTo(rx, -16);
          ctx.lineTo(rx, 16);
          ctx.stroke();
        });

        // Glowing Cyan Fish Pond Basin Inside
        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.beginPath();
        ctx.ellipse(-14, 2, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vertical Aeroponic Grow Towers
        ctx.fillStyle = '#10b981';
        [4, 12, 20].forEach(gx => {
          ctx.fillRect(gx - 2, -10, 4, 18);
        });

        // Label Tag
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 Solar Aquaponics (+6k)', 0, 24);

      } else if (b.type === 'grain_silo') {
        // Grain Silo Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cylindrical Corrugated Body
        const siloGrad = ctx.createLinearGradient(-18, 0, 18, 0);
        siloGrad.addColorStop(0, '#64748b');
        siloGrad.addColorStop(0.4, '#cbd5e1');
        siloGrad.addColorStop(1, '#475569');
        ctx.fillStyle = siloGrad;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-18, -20, 36, 34, 4);
        ctx.fill();
        ctx.stroke();

        // Corrugated Horizontal Metal Bands
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        [-12, -4, 4].forEach(by => {
          ctx.beginPath();
          ctx.moveTo(-18, by);
          ctx.lineTo(18, by);
          ctx.stroke();
        });

        // Conical Metal Cap
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(-20, -20);
        ctx.lineTo(0, -32);
        ctx.lineTo(20, -20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top Spire
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(0, -38);
        ctx.stroke();

        // Climbing Ladder on Side
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(14, -18);
        ctx.lineTo(14, 14);
        ctx.moveTo(18, -18);
        ctx.lineTo(18, 14);
        for (let ly = -16; ly <= 12; ly += 5) {
          ctx.moveTo(14, ly);
          ctx.lineTo(18, ly);
        }
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🌾 Grain Silo (30k)', 0, 22);

      } else if (b.type === 'heavy_gantry_mill') {
        // Gantry Mill Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Machine Bed / T-Slot Slotted Table
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-26, -14, 52, 28, 4);
        ctx.fill();
        ctx.stroke();

        // Twin Vertical Steel Bridge Columns
        ctx.fillStyle = '#475569';
        ctx.fillRect(-24, -26, 6, 26);
        ctx.fillRect(18, -26, 6, 26);

        // Overhead Gantry Cross-Beam
        ctx.fillStyle = '#334155';
        ctx.fillRect(-26, -28, 52, 7);

        // Moving Spindle Head
        const spindleX = Math.sin(this.tick * 0.05) * 14;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(spindleX - 4, -24, 8, 14);

        // Machining Sparks
        if (this.tick % 4 === 0) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(spindleX + (Math.random() * 4 - 2), -10, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label Tag
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('⚙️ 5-Axis Gantry Mill', 0, 22);

      } else if (b.type === 'solar_foundry') {
        // Solar Foundry Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 26, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Refractory Brick Hearth Body
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-22, -16, 44, 30, 6);
        ctx.fill();
        ctx.stroke();

        // Copper Induction Heating Coils
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -2, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing Molten Metal Crucible
        const meltGrad = ctx.createRadialGradient(0, -2, 2, 0, -2, 12);
        meltGrad.addColorStop(0, '#fef08a');
        meltGrad.addColorStop(0.6, '#f97316');
        meltGrad.addColorStop(1, '#dc2626');
        ctx.fillStyle = meltGrad;
        ctx.beginPath();
        ctx.arc(0, -2, 11, 0, Math.PI * 2);
        ctx.fill();

        // Label Tag
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 Solar Foundry', 0, 22);

      } else if (b.type === 'trike_depot') {
        // Trike Depot Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Timber Frame Bay
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-24, -18, 48, 32, 4);
        ctx.fill();
        ctx.stroke();

        // Cantilever Solar Roof
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-26, -22, 52, 6);

        // Charging Pedestal & Green LED
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, -12, 6, 12);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(-15, -8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Parked Cargo Trike Icon
        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚴', 6, -2);

        // Label Tag
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🚴 Trike Fleet Depot', 0, 22);

      } else if (b.type === 'drone_vertiport') {
        // Vertiport Platform Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Concrete Hexagonal / Octagonal Landing Pad
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Yellow Outer Circle
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();

        // White Painted 'H'
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', 0, 0);

        // Pulsing Corner Strobe LEDs
        const pulse = (Math.sin(this.tick * 0.1) + 1) / 2;
        ctx.fillStyle = `rgba(6, 182, 212, ${0.4 + pulse * 0.6})`;
        [-15, 15].forEach(lx => {
          [-15, 15].forEach(ly => {
            ctx.beginPath();
            ctx.arc(lx, ly, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        });

        // Label Tag
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('🛸 Courier Vertiport', 0, 22);
      }

      ctx.restore();
    });
  }

  renderPioneers(ctx) {
    const now = performance.now();

    this.pioneers.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      const isMoving = p.isMoving;
      const legSwing = isMoving ? Math.sin(now * 0.015) * 3 : 0;
      const walkBob = isMoving ? Math.abs(Math.sin(now * 0.015)) * 1.5 : Math.sin(now * 0.003) * 0.8;

      // 1. Shadow Underneath
      if (p.isPlayer) {
        // Player: Bioluminescent Golden Pulse
        const pulse = Math.sin(now * 0.005) * 2;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 11 + pulse, 5.5 + pulse * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Animated Legs / Shoes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, 1 + legSwing, 3, 6);
      ctx.fillRect(1, 1 - legSwing, 3, 6);

      // 3. Body / Clothes (Vocation colored)
      const bodyY = -6 - walkBob;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, bodyY, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Solarpunk apron / tunic collar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(0, bodyY, 3.5, 0, Math.PI);
      ctx.fill();

      // 4. Hands & Tools
      const handX = p.facing * 8;
      const handY = bodyY + 1;
      ctx.fillStyle = p.appearance?.skinTone || '#fbb77a';
      ctx.beginPath();
      ctx.arc(handX, handY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Vocation Tool in Hand
      if (p.vocationId === 'electrician') {
        // Yellow Multimeter / Wire Tool
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(handX - 1, handY - 4, 4, 5);
      } else if (p.vocationId === 'builder') {
        // Steel Wrench
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 4);
        ctx.lineTo(handX + p.facing * 4, handY + 3);
        ctx.stroke();
      } else if (p.vocationId === 'gardener') {
        // Garden trowel / plant sprig
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(handX + p.facing * 2, handY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.vocationId === 'telemetry') {
        // Cyan Reticulum Antenna & Micro-Tool
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 6);
        ctx.lineTo(handX, handY + 2);
        ctx.stroke();
      } else if (p.vocationId === 'water_tech') {
        // Sky Blue Water Test Flask / Spanner
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(handX - 1, handY - 4, 3, 5);
      } else if (p.vocationId === 'blacksmith') {
        // Heavy Forging Hammer
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(handX, handY + 2);
        ctx.lineTo(handX, handY - 6);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.fillRect(handX - 3, handY - 7, 6, 3);
      } else if (p.vocationId === 'chef') {
        // Wooden Cooking Spoon
        ctx.fillStyle = '#d97706';
        ctx.fillRect(handX - 1, handY - 5, 2, 7);
        ctx.beginPath();
        ctx.arc(handX, handY - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.vocationId === 'medic') {
        // Green Cross Medicine Pouch
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(handX - 3, handY - 3, 6, 5);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(handX - 1.5, handY - 1, 3, 1);
        ctx.fillRect(handX - 0.5, handY - 2, 1, 3);
      } else if (p.vocationId === 'forester') {
        // Cedar Honey Dipper
        ctx.fillStyle = '#b45309';
        ctx.fillRect(handX - 1, handY - 5, 2, 6);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(handX, handY - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.vocationId === 'educator') {
        // Seed Catalog Leatherbook
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(handX - 3, handY - 4, 6, 6);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(handX - 2, handY - 3, 4, 4);
      } else if (p.vocationId === 'scout') {
        // Red Toy Wagon or Butterfly Net trailing
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 2);
        ctx.lineTo(handX - p.facing * 8, handY + 4);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(handX - p.facing * 14, handY + 2, 8, 4);
      } else if (p.vocationId === 'elder') {
        // Polished Wooden Walking Cane
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 4);
        ctx.lineTo(handX, handY + 6);
        ctx.stroke();
      } else if (p.vocationId === 'mediator') {
        // Agora Bronze Scales / Parchment Scroll
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(handX - 2, handY - 4, 4, 6);
      }

      // 5. Head & Face
      const headY = -14 - walkBob;
      ctx.fillStyle = p.appearance?.skinTone || '#fbb77a';
      ctx.beginPath();
      ctx.arc(0, headY, 4.8, 0, Math.PI * 2);
      ctx.fill();

      // Hairstyle & Hair Color
      const hairStyle = p.appearance?.hairStyle || (p.isPlayer ? 'fade' : (p.id === 'maya' || p.vocationId === 'builder' ? 'ponytail' : (p.id === 'leo' || p.vocationId === 'gardener' ? 'beard' : (p.id === 'elena' || p.vocationId === 'water_tech' ? 'long' : 'fade'))));
      const hairColor = p.appearance?.hairColor || '#1e293b';
      ctx.fillStyle = hairColor;

      if (hairStyle === 'ponytail') {
        ctx.beginPath();
        ctx.arc(0, headY - 1, 5.2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-p.facing * 5.5, headY + 1, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (hairStyle === 'beard') {
        ctx.beginPath();
        ctx.arc(0, headY - 1, 5.2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        // Solarpunk beard around chin
        ctx.beginPath();
        ctx.arc(0, headY + 2.5, 4.2, 0, Math.PI);
        ctx.fill();
      } else if (hairStyle === 'long') {
        ctx.beginPath();
        ctx.arc(0, headY - 1, 5.4, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        ctx.fillRect(-4.5, headY - 1, 2, 8);
        ctx.fillRect(2.5, headY - 1, 2, 8);
      } else {
        // Modern fade / short
        ctx.beginPath();
        ctx.arc(0, headY - 1, 5.1, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
      }

      // 6. Overhead Badges & Solarpunk Crown
      if (p.isPlayer) {
        // Floating Golden Crown / Star
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, headY - 13);

        // YOU Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-16, headY - 30, 32, 13, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px system-ui';
        ctx.fillText('YOU', 0, headY - 20);

        // Name tag below
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px system-ui';
        ctx.fillText(p.name, 0, 8);
      } else {
        // Companion Name tag below
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, 0, 8);
      }

      // 7. Speech Bubble
      if (p.bubble) {
        ctx.save();
        ctx.font = '10px system-ui';
        const textWidth = ctx.measureText(p.bubble).width;
        const bubbleW = textWidth + 14;
        const bubbleH = 18;
        const bubbleY = headY - (p.isPlayer ? 48 : 32);

        ctx.fillStyle = 'rgba(11, 22, 28, 0.92)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-bubbleW / 2, bubbleY, bubbleW, bubbleH, 4);
        ctx.fill();
        ctx.stroke();

        // Pointer triangle
        ctx.beginPath();
        ctx.moveTo(-3, bubbleY + bubbleH);
        ctx.lineTo(0, bubbleY + bubbleH + 4);
        ctx.lineTo(3, bubbleY + bubbleH);
        ctx.fill();

        ctx.fillStyle = '#ecfdf5';
        ctx.textAlign = 'center';
        ctx.fillText(p.bubble, 0, bubbleY + 12);
        ctx.restore();
      }

      ctx.restore();
    });
  }

  /* -------------------------------------------------------------
   * Inter-Node Logistics Convoys (Animated Trikes & Drones)
   * ----------------------------------------------------------- */
  renderConvoys(ctx) {
    const convoys = gameState.data.convoys || [];
    if (convoys.length === 0) return;

    const time = Date.now() * 0.001;
    convoys.forEach((c, idx) => {
      // Interpolate along the road curve: from (0, 35) to (80, 100) to (220, 180)
      const progress = ((time * 0.12 + idx * 0.4) % 1.0);
      const t = progress;
      const x = Math.pow(1 - t, 2) * 20 + 2 * (1 - t) * t * 90 + Math.pow(t, 2) * 230;
      const y = Math.pow(1 - t, 2) * 45 + 2 * (1 - t) * t * 110 + Math.pow(t, 2) * 190;

      ctx.save();
      ctx.translate(x, y);

      if (c.vehicleType === 'drone') {
        // Floating Autonomous Drone
        const hoverY = Math.sin(time * 6) * 4 - 15;
        ctx.translate(0, hoverY);

        // Drone Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 15 - hoverY, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Drone Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, -6, 20, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // 4 Rotors spinning
        const rotorAngle = time * 25;
        [[-8, -8], [8, -8], [-8, 8], [8, 8]].forEach(([rx, ry]) => {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rx - Math.cos(rotorAngle) * 5, ry - Math.sin(rotorAngle) * 5);
          ctx.lineTo(rx + Math.cos(rotorAngle) * 5, ry + Math.sin(rotorAngle) * 5);
          ctx.stroke();
        });

        // Cargo box below
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-6, 6, 12, 8);
      } else {
        // Solar Cargo Trike
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trike Frame (Solarpunk Green)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-12, -4, 24, 8);

        // Rear Cargo Crate
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-14, -8, 14, 12);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(-14, -8, 14, 12);

        // Solar Canopy over crate
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-16, -13, 18, 3);

        // Wheels with spin
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-8, 5, 4, 0, Math.PI * 2);
        ctx.arc(8, 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Rider Pioneer
        ctx.fillStyle = '#f59e0b'; // helmet
        ctx.beginPath();
        ctx.arc(4, -9, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8'; // jacket
        ctx.fillRect(1, -5, 6, 7);
      }

      // Floating Convoy Banner above vehicle
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1;
      const labelText = `${c.vehicleType === 'drone' ? '🛸 Express' : '🚴 Trike'} ➔ ${c.targetNodeName.split(' ')[0]}`;
      ctx.font = 'bold 9px sans-serif';
      const tw = ctx.measureText(labelText).width;
      ctx.fillRect(-tw / 2 - 4, -28, tw + 8, 13);
      ctx.strokeRect(-tw / 2 - 4, -28, tw + 8, 13);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 0, -21);

      ctx.restore();
    });
  }

  renderZoningGuidelines(ctx) {
    if (!this.placementBuilding) return;

    const pb = this.placementBuilding;
    const time = performance.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);

    const isSolar = ['solar_array', 'battery_bank', 'solar_thermal_tower', 'solar_foundry'].includes(pb);
    const isHydro = ['rain_cistern', 'reed_bed', 'deep_well', 'retention_swale', 'aquaponics_greenhouse', 'biogas_digester'].includes(pb);
    const isLogistics = ['fablab', 'foundry', 'heavy_gantry_mill', 'trike_depot', 'drone_vertiport', 'cobot_arm', 'scada_bot'].includes(pb);
    const isResidential = ['guest_dome', 'kitchen_oven', 'clinic', 'school', 'elder_sanctuary', 'garden_bed', 'food_forest', 'mhu_dwelling', 'mhu'].includes(pb);

    ctx.save();

    // 1. Solar & Microgrid Sector (South: y > 0, angle from ~0.15*PI to 0.85*PI)
    // Amber radial arc showing unshaded irradiance zones
    const solarAlpha = isSolar ? (0.12 + 0.08 * pulse) : 0.05;
    const solarBorderAlpha = isSolar ? (0.7 + 0.3 * pulse) : 0.25;

    ctx.beginPath();
    ctx.arc(0, 0, 310, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.arc(0, 0, 90, 0.85 * Math.PI, 0.15 * Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 158, 11, ${solarAlpha})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(245, 158, 11, ${solarBorderAlpha})`;
    ctx.lineWidth = isSolar ? 2.0 : 1.2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 310, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Irradiance radial ray guides
    [0.25 * Math.PI, 0.5 * Math.PI, 0.75 * Math.PI].forEach(ang => {
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 90, Math.sin(ang) * 90);
      ctx.lineTo(Math.cos(ang) * 310, Math.sin(ang) * 310);
      ctx.stroke();
    });

    // Solar badge & label
    ctx.setLineDash([]);
    ctx.fillStyle = isSolar ? '#fbbf24' : 'rgba(251, 191, 36, 0.7)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☀️ SOLAR & MICROGRID SECTOR (SOUTH)', 0, 200);
    ctx.font = '9px system-ui';
    ctx.fillStyle = isSolar ? '#fde68a' : 'rgba(253, 230, 138, 0.6)';
    ctx.fillText('Optimal Unshaded Irradiance (+15 kWh/day peak yield)', 0, 216);

    // 2. Hydrological Spine (North / Slope: y < 0, angle from -0.85*PI to -0.15*PI)
    // Cyan elevation contour showing gravity-feed cistern lines and low-ground reed-bed drainage
    const hydroAlpha = isHydro ? (0.12 + 0.08 * pulse) : 0.05;
    const hydroBorderAlpha = isHydro ? (0.7 + 0.3 * pulse) : 0.25;

    ctx.beginPath();
    ctx.arc(0, 0, 290, -0.85 * Math.PI, -0.15 * Math.PI, false);
    ctx.arc(0, 0, 90, -0.15 * Math.PI, -0.85 * Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = `rgba(6, 182, 212, ${hydroAlpha})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(6, 182, 212, ${hydroBorderAlpha})`;
    ctx.lineWidth = isHydro ? 2.0 : 1.2;
    ctx.setLineDash([8, 6]);

    // Concentric stepped elevation contours
    [150, 210, 270].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r, -0.82 * Math.PI, -0.18 * Math.PI, false);
      ctx.stroke();
    });

    // Hydrological Spine badge & label
    ctx.setLineDash([]);
    ctx.fillStyle = isHydro ? '#22d3ee' : 'rgba(34, 211, 238, 0.7)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('💧 HYDROLOGICAL SPINE (NORTH / SLOPE)', 0, -180);
    ctx.font = '9px system-ui';
    ctx.fillStyle = isHydro ? '#a5f3fc' : 'rgba(165, 243, 252, 0.6)';
    ctx.fillText('Gravity-Feed Runoff & Low-Ground Reed-Bed Infiltration', 0, -164);

    // 3. Machine Shop & Logistics Axis (West: x from -75 to -320, y from -70 to 70)
    // Steel-tinted corridor connecting to the future Trike Depot and freight trails
    const logAlpha = isLogistics ? (0.14 + 0.08 * pulse) : 0.05;
    const logBorderAlpha = isLogistics ? (0.75 + 0.25 * pulse) : 0.25;

    ctx.fillStyle = `rgba(148, 163, 184, ${logAlpha})`;
    ctx.beginPath();
    ctx.roundRect(-320, -65, 240, 130, 8);
    ctx.fill();

    ctx.strokeStyle = `rgba(148, 163, 184, ${logBorderAlpha})`;
    ctx.lineWidth = isLogistics ? 2.0 : 1.2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.roundRect(-320, -65, 240, 130, 8);
    ctx.stroke();

    // Central freight track guide
    ctx.beginPath();
    ctx.moveTo(-310, 0);
    ctx.lineTo(-90, 0);
    ctx.stroke();

    // Directional chevron markers < < <
    ctx.setLineDash([]);
    ctx.fillStyle = isLogistics ? '#e2e8f0' : 'rgba(226, 232, 240, 0.7)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚙️ MACHINE SHOP & LOGISTICS AXIS (WEST)', -200, -35);
    ctx.font = '9px system-ui';
    ctx.fillStyle = isLogistics ? '#cbd5e1' : 'rgba(203, 213, 225, 0.6)';
    ctx.fillText('Heavy Vibration & Trike Depot Freight Access ◀ ◀', -200, -20);

    // 4. Residential Pod Clearings (East / Radial Courtyards: x > 65)
    // Emerald dashed courtyards reserved for future MHUs (timber chassis + kitchen garden aprons)
    const resAlpha = isResidential ? (0.13 + 0.08 * pulse) : 0.05;
    const resBorderAlpha = isResidential ? (0.75 + 0.25 * pulse) : 0.25;

    const pods = [
      { x: 180, y: -65, r: 52, label: 'Pod α' },
      { x: 220, y: 35, r: 56, label: 'Pod β' },
      { x: 160, y: 115, r: 48, label: 'Pod γ' }
    ];

    pods.forEach(pod => {
      // Pod fill
      ctx.fillStyle = `rgba(16, 185, 129, ${resAlpha})`;
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, pod.r, 0, Math.PI * 2);
      ctx.fill();

      // Outer dashed courtyard boundary (kitchen garden apron)
      ctx.strokeStyle = `rgba(16, 185, 129, ${resBorderAlpha})`;
      ctx.lineWidth = isResidential ? 2.0 : 1.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, pod.r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner timber chassis footprint guide (32x32px)
      ctx.strokeStyle = `rgba(52, 211, 153, ${resBorderAlpha * 0.7})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(pod.x - 16, pod.y - 16, 32, 32);

      // Label inside pod
      ctx.setLineDash([]);
      ctx.fillStyle = isResidential ? '#6ee7b7' : 'rgba(110, 231, 183, 0.6)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${pod.label} MHU Chassis + Apron`, pod.x, pod.y + pod.r - 12);
    });

    // Residential header
    ctx.setLineDash([]);
    ctx.fillStyle = isResidential ? '#34d399' : 'rgba(52, 211, 153, 0.7)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏡 RESIDENTIAL POD CLEARINGS (EAST)', 200, -135);
    ctx.font = '9px system-ui';
    ctx.fillStyle = isResidential ? '#a7f3d0' : 'rgba(167, 243, 208, 0.6)';
    ctx.fillText('Quiet Living Courtyards & Permaculture Aprons', 200, -120);

    // 5. Commons Sanctuary (Radius 0–60px around Camper)
    // Warning indicator discouraging heavy industrial machinery at village center
    const mouseDist = Math.hypot(this.mouseWorldPos?.x || 999, this.mouseWorldPos?.y || 999);
    const isOverSanctuary = mouseDist <= 70;

    ctx.save();
    if (isOverSanctuary) {
      // Danger / Warning active pulse
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 + 0.3 * pulse})`;
      ctx.lineWidth = 2.5;
    } else {
      // Peaceful protective boundary
      ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
    }

    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.setLineDash([]);
    if (isOverSanctuary) {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ COMMONS SANCTUARY', 0, -42);
      ctx.font = '8px system-ui';
      ctx.fillText('Keep Village Hearth & Agora Clear of Heavy Industry!', 0, -30);
    } else {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🌿 Commons Sanctuary (60m)', 0, -38);
    }
    ctx.restore();

    ctx.restore();
  }

  renderPlacementPreview(ctx) {
    const collision = this.checkPlacementCollision(this.mouseWorldPos.x, this.mouseWorldPos.y, this.placementBuilding);
    const snapX = collision.snapX || Math.round(this.mouseWorldPos.x / 20) * 20;
    const snapY = collision.snapY || Math.round(this.mouseWorldPos.y / 20) * 20;

    const canBuild = gameState.canBuild(this.placementBuilding);
    const isInvalid = !collision.valid || !canBuild.ok;
    const label = !canBuild.ok ? `⚠️ ${canBuild.reason}` : (!collision.valid ? `⚠️ ${collision.reason}` : '✓ Click to build (2h labor)');

    ctx.save();
    ctx.translate(snapX, snapY);

    ctx.fillStyle = isInvalid ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = isInvalid ? '#ef4444' : '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.roundRect(-24, -16, 48, 32, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isInvalid ? '#ef4444' : '#10b981';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -20);

    ctx.restore();
  }

  renderJuice(ctx) {
    // Floating texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Particles
    this.particles.forEach(pt => {
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius * (pt.life / pt.maxLife), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  playNightfallTransition(onPeak, onComplete) {
    if (this.isTransitioningNight) return;
    this.isTransitioningNight = true;

    // Acoustic Twilight sound
    soundFX.playNightfallChime();
    
    // Settlers gather at van patio
    this.pioneers.forEach((p, idx) => {
      p.targetX = -15 + idx * 15;
      p.targetY = 30;
      p.bubble = '🌙 Turning in for the night...';
      p.bubbleTimer = 90;
    });

    const startTime = performance.now();
    const duration = 1200; // 1.2s total

    const animateNight = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      if (progress < 0.5) {
        this.nightAlpha = progress * 2.0;
      } else {
        if (onPeak) {
          soundFX.playDawnChime();
          onPeak();
          onPeak = null;
        }
        this.nightAlpha = (1.0 - progress) * 2.0;
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateNight);
      } else {
        this.nightAlpha = 0;
        this.isTransitioningNight = false;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    };

    requestAnimationFrame(animateNight);
  }

  renderCircadianOverlay(ctx) {
    if (this.nightAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(5, 12, 22, ${this.nightAlpha * 0.94})`;
      ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

      // Twinkling stars
      const cx = this.cssWidth / 2;
      const cy = this.cssHeight / 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${this.nightAlpha * 0.8})`;
      const starSeeds = [
        [-200, -180, 2], [150, -220, 1.5], [-120, -120, 2], [220, -140, 1],
        [-300, -80, 1.5], [280, -90, 2], [-80, -240, 2.5], [80, -200, 1.5]
      ];
      starSeeds.forEach(([sx, sy, r]) => {
        ctx.beginPath();
        ctx.arc(cx + sx, cy + sy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Warm lantern glow on camper van patio
      const vanScreen = this.worldToScreen(0, 20);
      const lanternGrad = ctx.createRadialGradient(vanScreen.x, vanScreen.y, 5, vanScreen.x, vanScreen.y, 70);
      lanternGrad.addColorStop(0, `rgba(245, 158, 11, ${this.nightAlpha * 0.7})`);
      lanternGrad.addColorStop(0.5, `rgba(251, 146, 60, ${this.nightAlpha * 0.3})`);
      lanternGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lanternGrad;
      ctx.beginPath();
      ctx.arc(vanScreen.x, vanScreen.y, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dawn 06:00 Amber Sunrise Warmth
    const dawnGrad = ctx.createLinearGradient(this.cssWidth, 0, 0, this.cssHeight);
    dawnGrad.addColorStop(0, 'rgba(245, 158, 11, 0.14)');
    dawnGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.06)');
    dawnGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = dawnGrad;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
  }

  renderWeather(ctx) {
    const weather = gameState.data.weather;
    if (!weather) return;

    const w = this.cssWidth;
    const h = this.cssHeight;
    const now = performance.now();

    ctx.save();

    // 1. Overcast cloud shadows
    if (weather.cloudCover >= 0.6) {
      ctx.fillStyle = `rgba(15, 23, 42, ${Math.min(0.35, weather.cloudCover * 0.28)})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Animated Rain Particles (Transplanted from sim/settlement_renderer.js)
    const isStorm = weather.sky?.toLowerCase().includes('storm') || weather.sky?.toLowerCase().includes('flood') || weather.sky?.toLowerCase().includes('river');
    const isRain = (weather.rainfallMm || 0) > 0 || isStorm;

    if (isRain) {
      if (!this.weatherDrops) {
        this.weatherDrops = Array.from({ length: 220 }, () => ({
          x: Math.random() * (w + 200) - 100,
          y: Math.random() * h,
          len: 12 + Math.random() * 16,
          speed: 15 + Math.random() * 12,
          alpha: 0.25 + Math.random() * 0.40,
          thickness: 0.8 + Math.random() * 0.9
        }));
      }

      const count = isStorm ? 180 : Math.min(140, Math.max(35, Math.round(weather.rainfallMm * 6)));
      const windSpeed = weather.windSpeedKmh || 15;
      const slantX = ((windSpeed - 10) / 40) * (isStorm ? 10 : 6);

      ctx.lineCap = 'round';
      for (let i = 0; i < count; i++) {
        const drop = this.weatherDrops[i];
        drop.y += drop.speed * (isStorm ? 1.35 : 1.0);
        drop.x += slantX;

        if (drop.y > h + 25) {
          drop.y = -20 - Math.random() * 20;
          drop.x = Math.random() * (w + 200) - 100;
        }
        if (drop.x < -100) drop.x = w + 50;
        if (drop.x > w + 100) drop.x = -50;

        ctx.strokeStyle = isStorm 
          ? `rgba(186, 230, 253, ${Math.min(0.75, drop.alpha * 1.3)})` 
          : `rgba(186, 230, 253, ${drop.alpha * 0.75})`;
        ctx.lineWidth = drop.thickness * (isStorm ? 1.4 : 1.0);

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - slantX * (drop.len / drop.speed), drop.y - drop.len);
        ctx.stroke();
      }

      // Lightning flash
      if (isStorm && Math.random() < 0.012) {
        ctx.fillStyle = 'rgba(240, 249, 255, 0.25)';
        ctx.fillRect(0, 0, w, h);
      }
    }

    // 3. Hail Pellets (Hailstorm crisis)
    if (weather.disasterId === 'hailstorm') {
      if (!this.hailDrops) {
        this.hailDrops = Array.from({ length: 45 }, () => ({
          x: Math.random() * (w + 100) - 50,
          y: Math.random() * h,
          r: 1.8 + Math.random() * 1.8,
          speed: 18 + Math.random() * 10,
          alpha: 0.4 + Math.random() * 0.5
        }));
      }

      for (const hp of this.hailDrops) {
        hp.y += hp.speed;
        if (hp.y > h + 15) {
          hp.y = -10;
          hp.x = Math.random() * (w + 100) - 50;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${hp.alpha})`;
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, hp.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Heatwave & Drought Amber Shimmer
    const isDrought = weather.disasterId === 'drought' || weather.tempC >= 32;
    if (isDrought) {
      const amberPulse = (Math.sin(now * 0.003) + 1) * 0.04;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.06 + amberPulse})`;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric thermal shimmer ripples
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.10 + amberPulse * 0.4})`;
      ctx.lineWidth = 1.6;
      for (let y = h * 0.5; y < h; y += 50) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 30) {
          const waveY = y + Math.sin(x * 0.015 + now * 0.003) * 3.5;
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
