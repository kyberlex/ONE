/**
 * 2D Bioclimatic Settlement / Village Visualizer (Agent SIM-2 & SIM-4)
 * Renders an interactive 60 FPS living village on Canvas 2D:
 * - Adapts architecture to bioregion (Arctic Snow Domes, Temperate Hex-Lofts, Arid Cool-Towers, Tropical Bamboo Stilts)
 * - Animated infrastructures: Solar PV, rotating wind turbines, aeroponic greenhouses, FabLab with sparks, water cistern
 * - Animated pioneer avatars walking between paths and gathering at the central Agora
 * - Interactive dwellings: hover inspection and "Claim Dwelling in Usufruct"
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { CLIMATE_ZONES } from '../data/bioregions.js';
import { COMMUNITY_VOCATIONS, getVocationById } from '../data/vocations.js';
import { PlayerProfileManager } from '../engine/player_profile.js';
import { t } from '../i18n/index.js';
import { InteriorRenderer } from './interior_renderer.js';

export class SettlementRenderer {

  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.sim = options.sim || null;
    this.node = options.node || null;
    this.climate = options.climate || CLIMATE_ZONES.TEMPERATE;
    this.onSelectDwelling = options.onSelectDwelling || (() => {});
    this.onSelectBuilding = options.onSelectBuilding || (() => {});
    this.onSelectCitizen = options.onSelectCitizen || (() => {});
    this.onDiscreteZoomGesture = options.onDiscreteZoomGesture || null;
    this.onInteriorStateChange = options.onInteriorStateChange || null;

    // Camera transform (pan & zoom)
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetZoom: 1.0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    };

    // Entities in village
    this.dwellings = [];
    this.infrastructures = [];
    this.citizens = [];
    this.particles = [];
    this.hoveredEntity = null;

    // Deep Zoom-In Interior Architecture State
    this.activeInterior = null; // null or { type, entity, isGuest, name, scene }
    this.savedOverviewCamera = null;
    this.hoveredInteriorProp = null;
    this.interiorTick = 0;

    // Animation timer
    this.animFrameId = null;
    this.lastTime = performance.now();
    this.windAngle = 0;
    this.auroraOffset = 0;

    // Setup viewport & input listeners
    this.setupResize();
    this.setupInteractions();
    this.buildSettlementLayout();
  }

  setNode(nodeData) {
    this.node = nodeData;
    this.climate = CLIMATE_ZONES[nodeData.climateKey] || CLIMATE_ZONES.TEMPERATE;
    this.buildSettlementLayout();
    this.resetCamera();
  }

  buildSettlementLayout() {
    this.dwellings = [];
    this.infrastructures = [];
    this.citizens = [];
    this.particles = [];

    const pop = this.node ? this.node.population : 24;
    const buffer = this.node ? (this.node.freeHousingBuffer || 4) : 4;
    const totalDwellings = pop + buffer;

    // 1. Central Solarpunk Agora
    this.agora = {
      id: 'agora',
      name: 'Central Agora & Demarchy Amphitheater',
      type: 'AGORA',
      x: 0,
      y: 0,
      radius: 65,
      desc: 'Democratic assembly pavilion where the sortition lottery council meets.'
    };

    // 2. Core Infrastructures & Intergenerational Campus (Zoned spatial layout)
    this.infrastructures = [
      // ⚡ Energy Quadrant (North-West)
      {
        id: 'infra-solar',
        name: '⚡ Solar PV & Wind Microgrid',
        type: 'ENERGY',
        x: -280,
        y: -140,
        width: 140,
        height: 90,
        desc: 'Bifacial solar arrays, vertical-axis wind turbines, and LiFePO4 battery banks.'
      },
      // 💧 Water Quadrant (North-East)
      {
        id: 'infra-water',
        name: '💧 Rain Catchment & Cistern',
        type: 'WATER',
        x: 280,
        y: -140,
        width: 130,
        height: 90,
        desc: `${this.climate.waterCatchmentType}, greywater wetland reed filters, and filtration towers.`
      },
      // 📡 Telemetry Mast (Far North)
      {
        id: 'infra-mesh',
        name: '📡 Bioregional Mesh Telemetry Tower',
        type: 'MESH',
        x: 0,
        y: -245,
        width: 44,
        height: 70,
        desc: 'Solar-powered LoRa and optical mesh node connecting to federated O.N.E. communities.'
      },
      // 💻 FabLab & Circular Workshop (Mid-West)
      {
        id: 'infra-fablab',
        name: '💻 FabLab & Circular Workshop',
        type: 'WORKSHOP',
        x: -290,
        y: 75,
        width: 140,
        height: 95,
        desc: '3D printers, CNC mills, shredders for closed-loop filament recycling, and repair shop.'
      },
      // 🥗 Aeroponic Greenhouse & Food Commons (Mid-East)
      {
        id: 'infra-food',
        name: '🥗 Aeroponic Greenhouse & Food Commons',
        type: 'FOOD',
        x: 290,
        y: 75,
        width: 150,
        height: 100,
        desc: 'Closed-loop nutrient aeroponics, mushroom fruiting chambers, and agroforestry nursery.'
      },
      // 📚 Commons School & Forest Nursery (South-West Care Campus)
      {
        id: 'infra-school',
        name: '📚 Commons School & Forest Nursery',
        type: 'SCHOOL',
        x: -150,
        y: 250,
        width: 130,
        height: 85,
        desc: 'Alloparenting campus, sensory nature lab, open-air blackboards, and discovery atelier.'
      },
      // 🌸 Shared Intergenerational Garden & Pergola (South-Center Care Campus)
      {
        id: 'infra-garden',
        name: '🌸 Shared Intergenerational Garden',
        type: 'GARDEN',
        x: 0,
        y: 250,
        width: 140,
        height: 85,
        desc: 'Raised vegetable beds, fragrant jasmine pergola, storytelling pond, and resting benches.'
      },
      // 🏡 Intergenerational Elder Sanctuary (South-East Care Campus)
      {
        id: 'infra-elder',
        name: '🏡 Intergenerational Elder Sanctuary',
        type: 'ELDER_CARE',
        x: 150,
        y: 250,
        width: 130,
        height: 85,
        desc: 'Accessible single-story residences with verandas, 24/7 care monitoring, and reading patio.'
      }
    ];

    // 3. Bioclimatic Dwellings arranged in two dedicated Residential Hamlet Wings
    // Collision detection ensures NO dwelling ever overlaps an infrastructure building!
    const isCollidingWithInfra = (x, y, radius = 30) => {
      // Agora clearance
      if (Math.hypot(x - this.agora.x, y - this.agora.y) < this.agora.radius + radius + 15) return true;
      // Infrastructures clearance with safety buffer
      for (const inf of this.infrastructures) {
        const padX = inf.width / 2 + radius + 22;
        const padY = inf.height / 2 + radius + 22;
        if (Math.abs(x - inf.x) < padX && Math.abs(y - inf.y) < padY) return true;
      }
      return false;
    };

    const sampleNames = [
      'Maya Lin', 'Dante Ramos', 'Amina Diallo', 'Marcus Vance', 'Elena Rostova',
      'Tariq Al-Mansoor', 'Chloe Dubois', 'Kaelen O\'Connor', 'Siddharth Patel', 'Nia Washington',
      'Hiroshi Tanaka', 'Ingrid Lindholm', 'Mateo Fernandez', 'Zara Chen', 'Lucas Schmidt',
      'Sofia Rossi', 'Liam Gallagher', 'Freja Nielsen', 'Ananya Roy', 'Youssef Benali',
      'Olga Petrenko', 'Giacomo Valli', 'Fatima Zahra', 'Arthur Pendelton', 'Lucia Morales',
      'Kenji Sato', 'Evelyn Reed', 'Bao Nguyen', 'Clara Vega', 'Dmitri Volkov', 'Sora Takahashi'
    ];

    const playerProfile = PlayerProfileManager.getProfile();
    const isCurrentNodePlayerHome = playerProfile && (playerProfile.nodeId === this.node.id || playerProfile.nodeName === this.node.name);

    // Pre-calculate clean, non-overlapping dwelling positions across residential garden hamlets
    const dwellingPositions = [];
    
    // West Hamlet cluster (mid-west between Agora and FabLab)
    const westSlots = [
      { x: -145, y: -70 }, { x: -145, y: -15 }, { x: -145, y: 40 }, { x: -145, y: 95 },
      { x: -105, y: -90 }, { x: -95, y: -35 }, { x: -95, y: 25 }, { x: -95, y: 80 },
      { x: -185, y: -40 }, { x: -185, y: 15 }, { x: -185, y: 70 }
    ];

    // East Hamlet cluster (mid-east between Agora and Greenhouses)
    const eastSlots = [
      { x: 145, y: -70 }, { x: 145, y: -15 }, { x: 145, y: 40 }, { x: 145, y: 95 },
      { x: 105, y: -90 }, { x: 95, y: -35 }, { x: 95, y: 25 }, { x: 95, y: 80 },
      { x: 185, y: -40 }, { x: 185, y: 15 }, { x: 185, y: 70 }
    ];

    // North Hamlet & South garden border slots
    const peripheralSlots = [
      { x: -70, y: -145 }, { x: 70, y: -145 }, { x: -130, y: -150 }, { x: 130, y: -150 },
      { x: -70, y: 155 }, { x: 70, y: 155 }, { x: -245, y: 240 }, { x: 245, y: 240 },
      { x: -210, y: -120 }, { x: 210, y: -120 }
    ];

    const candidateSlots = [...westSlots, ...eastSlots, ...peripheralSlots];

    for (const slot of candidateSlots) {
      if (dwellingPositions.length >= totalDwellings) break;
      if (!isCollidingWithInfra(slot.x, slot.y, 26)) {
        dwellingPositions.push(slot);
      }
    }

    // Fill any remaining required pods organically while enforcing clearance
    let angleSearch = 0;
    let radiusSearch = 120;
    while (dwellingPositions.length < totalDwellings && radiusSearch < 380) {
      angleSearch += 0.28;
      if (angleSearch > Math.PI * 2) {
        angleSearch = 0;
        radiusSearch += 35;
      }
      const testX = Math.cos(angleSearch) * radiusSearch;
      const testY = Math.sin(angleSearch) * radiusSearch;
      const tooCloseToOtherDwelling = dwellingPositions.some(p => Math.hypot(p.x - testX, p.y - testY) < 36);
      if (!tooCloseToOtherDwelling && !isCollidingWithInfra(testX, testY, 26)) {
        dwellingPositions.push({ x: testX, y: testY });
      }
    }

    for (let i = 0; i < totalDwellings; i++) {
      const pos = dwellingPositions[i] || { x: (i % 5) * 35 - 70, y: Math.floor(i / 5) * 35 - 70 };
      const isThisPlayerDwelling = isCurrentNodePlayerHome && (
        playerProfile.dwellingId === `dwelling-${i + 1}` || 
        playerProfile.dwellingNumber === (i + 1)
      );

      const isOccupied = isThisPlayerDwelling ? true : (i < pop);
      const occupantName = isOccupied ? (sampleNames[i % sampleNames.length] + (i >= sampleNames.length ? ` ${Math.floor(i / sampleNames.length) + 1}` : '')) : null;
      const voc = COMMUNITY_VOCATIONS[i % COMMUNITY_VOCATIONS.length];

      let occupant = null;
      if (isThisPlayerDwelling) {
        const pVoc = getVocationById(playerProfile.vocationId || 'farmer');
        occupant = {
          name: 'Player (You)',
          vocationId: pVoc.id,
          role: pVoc.defaultName,
          roleKey: pVoc.nameKey,
          icon: pVoc.icon,
          dailyHours: 4,
          multiplier: pVoc.multiplier,
          sabbaticalUntil: playerProfile.sabbaticalUntil
        };
      } else if (isOccupied) {
        occupant = {
          name: occupantName,
          vocationId: voc.id,
          role: voc.defaultName,
          roleKey: voc.nameKey,
          icon: voc.icon,
          dailyHours: 4,
          multiplier: voc.multiplier
        };
      }

      this.dwellings.push({
        id: `dwelling-${i + 1}`,
        number: i + 1,
        x: pos.x,
        y: pos.y,
        radius: 26,
        climateKey: this.climate.id,
        dwellingType: this.climate.dwellingType,
        isOccupied,
        isPlayerHome: isThisPlayerDwelling,
        occupant,
        furnitureSet: ['Sedum Bed', 'Local Desk', 'Timber Chair', 'Modular Wardrobe']
      });
    }

    // 4. Animated Citizen Avatars (Player, Human Peers, Children, Elders, and Adult Pioneers)
    const profile = PlayerProfileManager.getProfile();

    // Avatar 0: The Local Player (YOU)
    const playerVocId = this.sim?.node?.playerVocation || profile?.vocationId || 'farmer';
    const playerVoc = getVocationById(playerVocId);
    const playerHome = this.dwellings.find(d => d.isPlayerHome);
    const startX = playerHome ? playerHome.x + 10 : 0;
    const startY = playerHome ? playerHome.y + 10 : 25;

    this.citizens.push({
      id: 'avatar-player',
      name: 'Player (You)',
      isPlayer: true,
      isHuman: true,
      isChild: false,
      isElder: false,
      vocation: playerVoc,
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      speed: 0.52,
      pauseTicks: 30,
      color: '#fbbf24',
      bubble: null,
      bubbleTimer: 140
    });

    // Avatars 1 to 3: Connected Human Peers
    const humanPeerNames = [
      { name: 'Elena Rostova', vocId: 'nurse' },
      { name: 'Marcus Vance', vocId: 'electrician' },
      { name: 'Tariq Al-Mansoor', vocId: 'blacksmith' }
    ];
    for (let i = 0; i < humanPeerNames.length; i++) {
      const peer = humanPeerNames[i];
      const voc = getVocationById(peer.vocId);
      this.citizens.push({
        id: `avatar-human-${i}`,
        name: peer.name,
        isPlayer: false,
        isHuman: true,
        isChild: false,
        isElder: false,
        vocation: voc,
        x: (Math.random() - 0.5) * 140,
        y: (Math.random() - 0.5) * 140,
        targetX: 0,
        targetY: 0,
        speed: 0.45 + Math.random() * 0.2,
        pauseTicks: Math.floor(Math.random() * 80),
        color: '#38bdf8',
        bubble: null,
        bubbleTimer: Math.floor(Math.random() * 200)
      });
    }

    // Avatars 4 to 6: 👶 Children (Playing in School, Garden, Agora)
    const childConfigs = [
      { name: 'Leo Lin', age: 7, color: '#f43f5e' },
      { name: 'Mia Ramos', age: 9, color: '#fb7185' },
      { name: 'Noah Dubois', age: 6, color: '#ec4899' }
    ];
    for (let i = 0; i < childConfigs.length; i++) {
      const cConf = childConfigs[i];
      this.citizens.push({
        id: `avatar-child-${i}`,
        name: cConf.name,
        isPlayer: false,
        isHuman: false,
        isChild: true,
        isElder: false,
        age: cConf.age,
        vocation: { defaultName: 'Pupil', icon: '🎒', targetLocation: 'SCHOOL' },
        x: -120 + i * 20,
        y: 240 + (Math.random() - 0.5) * 20,
        targetX: -140,
        targetY: 250,
        speed: 0.68 + Math.random() * 0.15, // Children run fast and bouncy!
        pauseTicks: Math.floor(Math.random() * 40),
        color: cConf.color,
        bubble: null,
        bubbleTimer: 90
      });
    }

    // Avatars 7 to 9: 🧓 Elders (Mentoring in Sanctuary, Garden benches, Agora)
    const elderConfigs = [
      { name: 'Arthur Pendelton', role: 'Master Mentor', vocId: 'carpenter' },
      { name: 'Evelyn Reed', role: 'Elder Healer', vocId: 'nurse' },
      { name: 'Giacomo Valli', role: 'Seed Keeper', vocId: 'forester' }
    ];
    for (let i = 0; i < elderConfigs.length; i++) {
      const eConf = elderConfigs[i];
      const voc = getVocationById(eConf.vocId);
      this.citizens.push({
        id: `avatar-elder-${i}`,
        name: eConf.name,
        isPlayer: false,
        isHuman: false,
        isChild: false,
        isElder: true,
        vocation: { ...voc, defaultName: eConf.role, icon: '🧓', targetLocation: 'ELDER_CARE' },
        x: 130 + i * 15,
        y: 250 + (Math.random() - 0.5) * 15,
        targetX: 150,
        targetY: 250,
        speed: 0.22 + Math.random() * 0.08, // Elders walk slowly and gracefully
        pauseTicks: Math.floor(Math.random() * 120),
        color: '#e2e8f0', // Silver / pearl
        bubble: null,
        bubbleTimer: 180
      });
    }

    // Avatars 10+: Adult Simulated Pioneers
    for (let i = 10; i < 18; i++) {
      const voc = COMMUNITY_VOCATIONS[i % COMMUNITY_VOCATIONS.length];
      this.citizens.push({
        id: `avatar-npc-${i}`,
        name: sampleNames[i % sampleNames.length],
        isPlayer: false,
        isHuman: false,
        isChild: false,
        isElder: false,
        vocation: voc,
        x: (Math.random() - 0.5) * 180,
        y: (Math.random() - 0.5) * 180,
        targetX: 0,
        targetY: 0,
        speed: 0.38 + Math.random() * 0.2,
        pauseTicks: Math.floor(Math.random() * 100),
        color: ['#10b981', '#a855f7', '#14b8a6', '#f59e0b', '#06b6d4'][i % 5],
        bubble: null,
        bubbleTimer: Math.floor(Math.random() * 200)
      });
    }
  }

  setupResize() {
    this.resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  setupInteractions() {
    // Mouse Pan
    this.canvas.addEventListener('mousedown', e => {
      this.camera.isDragging = true;
      this.camera.lastMouseX = e.clientX;
      this.camera.lastMouseY = e.clientY;
      this.mouseDownScreenPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', e => {
      if (this.camera.isDragging) {
        const dx = e.clientX - this.camera.lastMouseX;
        const dy = e.clientY - this.camera.lastMouseY;
        this.camera.x += dx / this.camera.zoom;
        this.camera.y += dy / this.camera.zoom;
        this.camera.lastMouseX = e.clientX;
        this.camera.lastMouseY = e.clientY;
      } else {
        this.handlePointerMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      this.camera.isDragging = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredInteriorProp = null;
      this.updateInteriorPropTooltip(null);
    });

    // Zoom on wheel (Discrete snapping integration)
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (this.onDiscreteZoomGesture) {
        // e.deltaY < 0 is pinch-in / wheel-up (zoom in); e.deltaY > 0 is zoom out
        const delta = e.deltaY < 0 ? 35 : -35;
        const targetEntity = this.hoveredEntity || null;
        const handled = this.onDiscreteZoomGesture(delta, targetEntity);
        if (handled) return;
      }
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      this.setZoom(this.camera.targetZoom * zoomFactor);
    }, { passive: false });

    // Touch events for mobile/tablet
    let initialPinchDistance = null;
    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this.camera.isDragging = true;
        this.camera.lastMouseX = e.touches[0].clientX;
        this.camera.lastMouseY = e.touches[0].clientY;
        this.mouseDownScreenPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.camera.isDragging = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && this.camera.isDragging) {
        const dx = e.touches[0].clientX - this.camera.lastMouseX;
        const dy = e.touches[0].clientY - this.camera.lastMouseY;
        this.camera.x += dx / this.camera.zoom;
        this.camera.y += dy / this.camera.zoom;
        this.camera.lastMouseX = e.touches[0].clientX;
        this.camera.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && initialPinchDistance) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialPinchDistance;

        if (this.onDiscreteZoomGesture) {
          if (factor > 1.18) {
            this.onDiscreteZoomGesture(50, this.hoveredEntity);
            initialPinchDistance = currentDist;
            return;
          } else if (factor < 0.82) {
            this.onDiscreteZoomGesture(-50, this.hoveredEntity);
            initialPinchDistance = currentDist;
            return;
          }
        }

        this.setZoom(this.camera.targetZoom * factor);
        initialPinchDistance = currentDist;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.camera.isDragging = false;
      initialPinchDistance = null;
    });

    // Click handler for selection
    this.canvas.addEventListener('click', e => {
      const clickDist = Math.hypot(
        e.clientX - (this.mouseDownScreenPos?.x || e.clientX),
        e.clientY - (this.mouseDownScreenPos?.y || e.clientY)
      );
      if (clickDist > 8) return; // User was panning/dragging, not clicking!

      if (this.activeInterior) {
        const worldPos = this.screenToWorld(e.clientX, e.clientY);
        const prop = this.findInteriorPropAt(worldPos.x, worldPos.y);
        if (prop) {
          if (this.options.onSelectInteriorProp) {
            this.options.onSelectInteriorProp(prop);
          }
          return;
        }

        // Check if clicked outside the building / room perimeter
        const scene = this.activeInterior.scene;
        if (scene) {
          const halfW = (scene.width || 600) / 2 + 16;
          const halfH = (scene.height || 420) / 2 + 16;
          if (worldPos.x < -halfW || worldPos.x > halfW || worldPos.y < -halfH || worldPos.y > halfH) {
            // Clicked outside building -> smoothly return to NODE zoom level!
            this.exitInterior();
            return;
          }
        }
        return;
      }

      const worldPos = this.screenToWorld(e.clientX, e.clientY);
      const clicked = this.findEntityAt(worldPos.x, worldPos.y);

      if (clicked) {
        if (clicked.isPlayer || clicked.isHuman !== undefined) {
          this.onSelectCitizen(clicked);
        } else if (clicked.dwellingType) {
          this.onSelectDwelling(clicked);
        } else if (clicked.type) {
          this.onSelectBuilding(clicked);
        }
      }
    });

    // Double-click to instantly enter building or dwelling interior
    this.canvas.addEventListener('dblclick', e => {
      if (this.activeInterior) return;
      const worldPos = this.screenToWorld(e.clientX, e.clientY);
      const clicked = this.findEntityAt(worldPos.x, worldPos.y);

      if (clicked) {
        if (clicked.dwellingType || clicked.occupant !== undefined) {
          if (clicked.isPlayer || clicked.isPlayerHome || !clicked.isOccupied) {
            this.enterInterior(clicked);
          } else {
            this.knockOnDwelling(clicked);
          }
        } else if (clicked.type) {
          this.enterInterior(clicked);
        }
      }
    });

    // ESC key to exit interior view
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.activeInterior) {
        this.exitInterior();
      }
    });

    // Exit interior HUD button
    const exitBtn = document.getElementById('btn-exit-interior');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.exitInterior();
      });
    }
  }

  setZoom(target) {
    this.camera.targetZoom = Math.max(0.45, Math.min(2.4, target));
  }

  resetCamera() {
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.targetZoom = 1.0;
    this.camera.zoom = 1.0;
  }

  screenToWorld(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = (screenX - rect.left - cx) / this.camera.zoom - this.camera.x;
    const y = (screenY - rect.top - cy) / this.camera.zoom - this.camera.y;
    return { x, y };
  }

  handlePointerMove(screenX, screenY) {
    const worldPos = this.screenToWorld(screenX, screenY);

    if (this.activeInterior) {
      const hitProp = this.findInteriorPropAt(worldPos.x, worldPos.y);
      this.hoveredInteriorProp = hitProp;
      this.hoveredEntity = null;
      this.updateInteriorPropTooltip(hitProp);

      if (hitProp) {
        this.canvas.style.cursor = 'pointer';
        this.canvas.title = hitProp.name || '';
      } else {
        const scene = this.activeInterior.scene;
        if (scene) {
          const halfW = (scene.width || 600) / 2 + 16;
          const halfH = (scene.height || 420) / 2 + 16;
          const isOutside = worldPos.x < -halfW || worldPos.x > halfW || worldPos.y < -halfH || worldPos.y > halfH;
          if (isOutside) {
            this.canvas.style.cursor = 'zoom-out';
            this.canvas.title = 'Click outside to return to Village (Node view)';
          } else {
            this.canvas.style.cursor = this.camera.isDragging ? 'grabbing' : 'default';
            this.canvas.title = '';
          }
        } else {
          this.canvas.style.cursor = this.camera.isDragging ? 'grabbing' : 'default';
          this.canvas.title = '';
        }
      }
      return;
    }

    const hit = this.findEntityAt(worldPos.x, worldPos.y);
    this.hoveredEntity = hit;
    this.hoveredInteriorProp = null;
    this.updateInteriorPropTooltip(null);
    this.canvas.style.cursor = hit ? 'pointer' : (this.camera.isDragging ? 'grabbing' : 'grab');
  }

  findInteriorPropAt(x, y) {
    if (!this.activeInterior || !this.activeInterior.scene) return null;
    const props = this.activeInterior.scene.props || [];
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      if (x >= p.x - p.w / 2 && x <= p.x + p.w / 2 && y >= p.y - p.h / 2 && y <= p.y + p.h / 2) {
        return p;
      }
    }
    const occupants = this.activeInterior.scene.occupants || [];
    for (let i = occupants.length - 1; i >= 0; i--) {
      const occ = occupants[i];
      if (Math.hypot(x - occ.x, y - (occ.y - 10)) <= 24) {
        return {
          id: 'occupant-' + (occ.name || 'citizen'),
          name: (occ.role ? occ.role + ' ' : '') + occ.name,
          desc: occ.quote || 'Pioneer residing and thriving in the community.'
        };
      }
    }
    return null;
  }

  enterInterior(entity, isGuest = false) {
    if (!entity) return;

    let type = 'AGORA';
    let name = 'Agora';
    let isPlayerHome = false;

    if (entity.dwellingType || entity.occupant !== undefined) {
      type = 'DWELLING';
      isPlayerHome = Boolean(entity.isPlayer || entity.isPlayerHome || (entity.occupant && entity.occupant.isPlayer));
      name = isPlayerHome
        ? '🏡 My Usufruct Home'
        : (entity.isOccupied ? `🏡 ${entity.occupant?.name || 'Citizen'}'s Sanctuary` : '🏡 Civic Reserve Pod');
    } else if (entity.type) {
      type = entity.type;
      name = entity.name || entity.type;
    }

    const interiorData = {
      type,
      name,
      isPlayerHome,
      isGuest,
      entity
    };

    const scene = InteriorRenderer.buildInteriorScene(interiorData, this.climate, this.sim);

    // Save camera before entering
    if (!this.activeInterior) {
      this.savedOverviewCamera = {
        x: this.camera.x,
        y: this.camera.y,
        zoom: this.camera.zoom,
        targetZoom: this.camera.targetZoom
      };
    }

    // Reset camera focal center for interior
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1.0;
    this.camera.targetZoom = 1.0;

    this.activeInterior = {
      ...interiorData,
      scene
    };

    // Update HUD breadcrumb and hide settlement header bar
    const hudBar = document.getElementById('hud-interior-bar');
    const hudFacility = document.getElementById('interior-room-name');
    if (hudBar && hudFacility) {
      hudFacility.textContent = name;
      hudBar.classList.remove('hidden');
    }
    const settlementHeader = document.getElementById('settlement-header-bar');
    if (settlementHeader) {
      settlementHeader.classList.add('hidden');
    }

    if (this.options.onInteriorStateChange) {
      this.options.onInteriorStateChange(true, entity);
    }
  }

  exitInterior() {
    if (!this.activeInterior) return;
    this.activeInterior = null;
    this.hoveredInteriorProp = null;
    this.updateInteriorPropTooltip(null);

    if (this.savedOverviewCamera) {
      this.camera.x = this.savedOverviewCamera.x;
      this.camera.y = this.savedOverviewCamera.y;
      this.camera.zoom = this.savedOverviewCamera.zoom;
      this.camera.targetZoom = this.savedOverviewCamera.targetZoom;
      this.savedOverviewCamera = null;
    }

    const hudBar = document.getElementById('hud-interior-bar');
    if (hudBar) {
      hudBar.classList.add('hidden');
    }
    const settlementHeader = document.getElementById('settlement-header-bar');
    if (settlementHeader) {
      settlementHeader.classList.remove('hidden');
    }

    this.canvas.style.cursor = 'grab';
    this.canvas.title = '';

    if (this.options.onInteriorStateChange) {
      this.options.onInteriorStateChange(false);
    }
  }

  knockOnDwelling(dwelling) {
    const modal = document.getElementById('modal-privacy-lock');
    const closeBtn = document.getElementById('btn-close-privacy-modal');
    const dismissBtn = document.getElementById('btn-respect-privacy');
    const knockBtn = document.getElementById('btn-knock-door');
    const avatarEl = document.getElementById('privacy-occupant-avatar');
    const nameEl = document.getElementById('privacy-occupant-name');
    const vocEl = document.getElementById('privacy-occupant-vocation');
    const resultEl = document.getElementById('privacy-knock-result');

    if (!modal) return;

    const occupant = dwelling.occupant || { name: 'Citizen Pioneer', icon: '🧑', role: 'Autonomous Resident' };
    if (avatarEl) avatarEl.textContent = occupant.icon || '🧑';
    if (nameEl) nameEl.textContent = occupant.name || 'Citizen';
    if (vocEl) vocEl.textContent = occupant.role || occupant.vocationId || 'Community Builder';
    if (resultEl) {
      resultEl.className = 'privacy-knock-result hidden';
      resultEl.textContent = '';
      resultEl.style.display = 'none';
    }
    if (knockBtn) {
      knockBtn.disabled = false;
      knockBtn.textContent = '🚪 Knock on Door';
    }

    const closeModal = () => {
      modal.classList.add('hidden');
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (dismissBtn) dismissBtn.onclick = closeModal;

    if (knockBtn) {
      knockBtn.onclick = () => {
        knockBtn.disabled = true;
        knockBtn.textContent = '⏳ Knocking...';

        setTimeout(() => {
          // 65% chance of friendly invitation; 35% resting/privacy
          const isInvited = Math.random() < 0.65;
          if (resultEl) {
            resultEl.style.display = 'block';
            resultEl.classList.remove('hidden');
            if (isInvited) {
              resultEl.style.background = 'rgba(16, 185, 129, 0.2)';
              resultEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
              resultEl.style.color = '#6ee7b7';
              resultEl.innerHTML = `<strong>✨ Invitation Accepted:</strong> "${occupant.name}: 'Welcome in, neighbor! Come have a warm herbal tea.'"`;
              setTimeout(() => {
                closeModal();
                this.enterInterior(dwelling, true);
              }, 1200);
            } else {
              resultEl.style.background = 'rgba(239, 68, 68, 0.2)';
              resultEl.style.border = '1px solid rgba(239, 68, 68, 0.4)';
              resultEl.style.color = '#fca5a5';
              resultEl.innerHTML = `<strong>🔒 Sanctuary Protected:</strong> "${occupant.name}: 'I am resting right now. Let us talk later at the Agora!'"`;
              knockBtn.textContent = '🚪 No Answer / Resting';
            }
          }
        }, 600);
      };
    }

    modal.classList.remove('hidden');
  }

  renderInteriorView(ctx, w, h) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(this.camera.x, this.camera.y);

    const weather = this.sim?.weatherEngine?.currentWeather || null;
    InteriorRenderer.renderInterior(ctx, w, h, this.activeInterior.scene, this.interiorTick, weather);
    ctx.restore();
  }

  renderInteriorHudOverlay(ctx, w, h) {
    // Prop inspection tooltip is cleanly handled via the DOM overlay #interior-prop-tooltip
    // positioned at bottom: 84px to prevent any occlusion by footer action buttons.
  }

  updateInteriorPropTooltip(prop) {
    const el = document.getElementById('interior-prop-tooltip');
    if (!el) return;
    if (!prop) {
      el.classList.add('hidden');
      return;
    }

    const nameEl = document.getElementById('prop-tooltip-name');
    const descEl = document.getElementById('prop-tooltip-desc');
    if (nameEl) nameEl.textContent = prop.name || 'Component';
    if (descEl) descEl.textContent = prop.desc || 'High-performance bioclimatic usufruct fixture.';

    el.classList.remove('hidden');
  }

  /**
   * Updates living occupant movement, arrivals, deliberation, and departures inside facilities
   */
  updateInteriorSimulation(dt, simSpeed) {
    if (!this.activeInterior || !this.activeInterior.scene) return;
    const scene = this.activeInterior.scene;
    const isAgora = this.activeInterior.type === 'AGORA';

    // Initialize interior dynamic simulation state if needed
    if (!scene._simState) {
      scene._simState = {
        arrivalTimer: 35,
        spawnIntervalMin: isAgora ? 80 : 150,
        spawnIntervalMax: isAgora ? 180 : 300
      };
      // Ensure initial static occupants have valid lifecycle properties
      for (const occ of scene.occupants) {
        if (!occ.state) {
          occ.state = 'ENGAGED';
          occ.isWalking = false;
          occ.stayTimer = occ.stayTimer || 450;
          occ.deliberationTimer = Math.floor(Math.random() * 100 + 40);
          if (occ.activity === 'speaking' || occ.name === 'Fatima Zahra') {
            occ.isPermanent = true;
          }
        }
      }
    }

    // When paused, do not advance timers or movement
    if (simSpeed <= 0) return;

    // 1. Inflow Spawner: Citizens enter visibly from the portals
    const maxCapacity = isAgora ? 9 : (
      this.activeInterior.type === 'GARDEN' ? 7 : (
        this.activeInterior.type === 'SCHOOL' || this.activeInterior.type === 'ELDER_CARE' ? 6 : (
          this.activeInterior.type === 'WORKSHOP' || this.activeInterior.type === 'FOOD' ? 5 : (
            this.activeInterior.type === 'ENERGY' || this.activeInterior.type === 'WATER' ? 4 : 3
          )
        )
      )
    );
    if (scene.occupants.length < maxCapacity) {
      scene._simState.arrivalTimer -= simSpeed;
      if (scene._simState.arrivalTimer <= 0) {
        this.spawnInteriorCitizen(this.activeInterior, simSpeed);
        const minI = scene._simState.spawnIntervalMin;
        const maxI = scene._simState.spawnIntervalMax;
        scene._simState.arrivalTimer = Math.floor((Math.random() * (maxI - minI) + minI) / simSpeed);
      }
    }

    // 2. Update all active occupants inside the interior
    for (let i = scene.occupants.length - 1; i >= 0; i--) {
      const occ = scene.occupants[i];

      if (occ.state === 'ENTERING') {
        occ.isWalking = true;
        const dx = occ.targetX - occ.x;
        const dy = occ.targetY - occ.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 4 * Math.max(1, simSpeed)) {
          // Arrived at destination inside the hall!
          occ.x = occ.targetX;
          occ.y = occ.targetY;
          occ.isWalking = false;
          occ.state = 'ENGAGED';
          occ.stayTimer = Math.floor((Math.random() * 450 + 350) / simSpeed);
          occ.deliberationTimer = Math.floor((Math.random() * 80 + 30) / simSpeed);
          occ.bubble = null;
        } else {
          const moveStep = occ.speed * simSpeed;
          occ.x += (dx / dist) * moveStep;
          occ.y += (dy / dist) * moveStep;
        }

      } else if (occ.state === 'ENGAGED') {
        occ.isWalking = false;
        occ.stayTimer -= simSpeed;

        // Contextual deliberation dialogue (rate-limited so max 2 speech bubbles appear at once)
        occ.deliberationTimer -= simSpeed;
        if (occ.deliberationTimer <= 0) {
          const activeBubbles = scene.occupants.filter(o => o.bubble).length;
          if (activeBubbles < 2) {
            occ.bubble = this.getCitizenDeliberationThought(occ, this.activeInterior);
            occ.bubbleTimer = Math.floor(95 / simSpeed);
            occ.deliberationTimer = Math.floor((Math.random() * 260 + 180) / simSpeed);
          } else {
            occ.deliberationTimer = Math.floor(70 / simSpeed);
          }
        }

        if (occ.bubbleTimer > 0) {
          occ.bubbleTimer -= simSpeed;
          if (occ.bubbleTimer <= 0) {
            occ.bubble = null;
          }
        }

        // Ready to depart and return to the village
        if (occ.stayTimer <= 0) {
          if (occ.isPermanent) {
            occ.stayTimer = Math.floor((Math.random() * 800 + 500) / simSpeed);
          } else {
            occ.state = 'EXITING';
            occ.isWalking = true;
            const exitPoint = this.getInteriorExitPoint(this.activeInterior);
            occ.targetX = exitPoint.x;
            occ.targetY = exitPoint.y;
            occ.bubble = this.getCitizenDepartureFarewell(occ, this.activeInterior);
            occ.bubbleTimer = Math.floor(90 / simSpeed);
          }
        }

      } else if (occ.state === 'EXITING') {
        occ.isWalking = true;
        const dx = occ.targetX - occ.x;
        const dy = occ.targetY - occ.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 5 * Math.max(1, simSpeed)) {
          // Reached portal threshold, stepped out into the village!
          scene.occupants.splice(i, 1);
        } else {
          const moveStep = occ.speed * simSpeed;
          occ.x += (dx / dist) * moveStep;
          occ.y += (dy / dist) * moveStep;
        }

        if (occ.bubbleTimer > 0) {
          occ.bubbleTimer -= simSpeed;
          if (occ.bubbleTimer <= 0) {
            occ.bubble = null;
          }
        }
      }
    }
  }

  /**
   * Spawns an arriving citizen through one of the entrance portals
   */
  spawnInteriorCitizen(interior, simSpeed) {
    const scene = interior.scene;
    const existingNames = new Set(scene.occupants.map(o => o.name));

    // Sample from settlement citizens who are not currently inside this interior
    const candidates = this.citizens.filter(c => !existingNames.has(c.name));
    let chosenCitizen = null;

    if (candidates.length > 0) {
      chosenCitizen = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // Fallback pioneer if all node citizens are already inside
      const fallbackNames = ['Silvia Marini', 'Kenji Sato', 'Amara Diallo', 'Lukas Weber', 'Nadia Petrov'];
      const unpicked = fallbackNames.filter(n => !existingNames.has(n));
      const name = unpicked.length > 0 ? unpicked[0] : `Pioneer ${scene.occupants.length + 1}`;
      chosenCitizen = {
        name,
        isPlayer: false,
        isHuman: false,
        isChild: Math.random() < 0.25,
        isElder: Math.random() < 0.25,
        color: '#38bdf8',
        speed: 1.25,
        vocation: { defaultName: 'Resident', icon: '🌱' }
      };
    }

    const spawnPoint = this.getInteriorSpawnPoint(interior);
    const dest = this.getInteriorDestination(interior, chosenCitizen);

    const isChild = Boolean(chosenCitizen.isChild);
    const isElder = Boolean(chosenCitizen.isElder);
    const speed = isChild ? 1.55 : (isElder ? 0.95 : 1.25);

    const newOcc = {
      name: chosenCitizen.name,
      role: chosenCitizen.vocation?.defaultName || (isChild ? 'Pupil' : (isElder ? 'Elder' : 'Citizen')),
      icon: chosenCitizen.vocation?.icon || (isChild ? '🎒' : (isElder ? '🧓' : '🌱')),
      isPlayer: Boolean(chosenCitizen.isPlayer),
      isChild,
      isElder,
      color: chosenCitizen.color || (isChild ? '#f43f5e' : (isElder ? '#cbd5e1' : '#38bdf8')),
      x: spawnPoint.x,
      y: spawnPoint.y,
      targetX: dest.x,
      targetY: dest.y,
      speed,
      isWalking: true,
      state: 'ENTERING',
      bubble: this.getCitizenArrivalGreeting(chosenCitizen, interior),
      bubbleTimer: Math.floor(90 / (simSpeed || 1)),
      quote: `Engaged community pioneer participating in ${interior.name}.`
    };

    scene.occupants.push(newOcc);
  }

  /**
   * Returns spawn coordinates at the entrance thresholds
   */
  getInteriorSpawnPoint(interior) {
    if (interior.type === 'AGORA') {
      const roll = Math.random();
      if (roll < 0.50) {
        // South Main Village Portal (walking in Northwards)
        return { x: (Math.random() - 0.5) * 40, y: 228 };
      } else if (roll < 0.75) {
        // West Colonnade Portico (walking in Eastwards)
        return { x: -335, y: 60 + (Math.random() - 0.5) * 20 };
      } else {
        // East Colonnade Portico (walking in Westwards)
        return { x: 335, y: 60 + (Math.random() - 0.5) * 20 };
      }
    }
    if (interior.type === 'GARDEN') {
      const roll = Math.random();
      if (roll < 0.40) {
        return { x: (Math.random() - 0.5) * 35, y: 228 };
      } else if (roll < 0.70) {
        // West Gate (connecting to Commons School)
        return { x: -335, y: 35 + (Math.random() - 0.5) * 15 };
      } else {
        // East Gate (connecting to Elder Sanctuary)
        return { x: 335, y: 35 + (Math.random() - 0.5) * 15 };
      }
    }
    // Default South Portal for Energy, Water, Food, Workshop, School, Elder Care, Dwellings
    return { x: (Math.random() - 0.5) * 35, y: 228 };
  }

  /**
   * Returns exit coordinates threshold when departing back to the village
   */
  getInteriorExitPoint(interior) {
    if (interior.type === 'AGORA') {
      const roll = Math.random();
      if (roll < 0.50) {
        return { x: (Math.random() - 0.5) * 35, y: 232 };
      } else if (roll < 0.75) {
        return { x: -340, y: 60 + (Math.random() - 0.5) * 20 };
      } else {
        return { x: 340, y: 60 + (Math.random() - 0.5) * 20 };
      }
    }
    if (interior.type === 'GARDEN') {
      const roll = Math.random();
      if (roll < 0.40) {
        return { x: (Math.random() - 0.5) * 30, y: 232 };
      } else if (roll < 0.70) {
        return { x: -340, y: 35 + (Math.random() - 0.5) * 15 };
      } else {
        return { x: 340, y: 35 + (Math.random() - 0.5) * 15 };
      }
    }
    return { x: (Math.random() - 0.5) * 30, y: 232 };
  }

  /**
   * Returns a suitable interior destination based on room and citizen demographic
   */
  getInteriorDestination(interior, citizen) {
    const scene = interior.scene;
    const occs = scene.occupants || [];

    if (interior.type === 'AGORA') {
      const agoraSpots = [
        // Concentric Stone Benches / Assembly Tiers
        { x: -155, y: 65 }, { x: -120, y: 85 }, { x: -85, y: 100 },
        { x: 155, y: 65 }, { x: 120, y: 85 }, { x: 85, y: 100 },
        { x: -55, y: 75 }, { x: -30, y: 85 },
        { x: 55, y: 75 }, { x: 30, y: 85 },
        { x: -15, y: 95 }, { x: 15, y: 95 },
        // Rostrum Speaker area & discussion
        { x: -25, y: -30 }, { x: 25, y: -30 },
        // Sortition Urn area
        { x: -70, y: -15 },
        // Constitutional Bronze Tablet
        { x: -35, y: -110 }, { x: 35, y: -110 },
        // Colonnade alcoves
        { x: -180, y: 15 }, { x: 180, y: 15 }, { x: -150, y: -35 }, { x: 150, y: -35 }
      ];

      const available = agoraSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: (Math.random() - 0.5) * 260, y: (Math.random() - 0.5) * 100 };
    }

    if (interior.type === 'ENERGY') {
      const energySpots = [
        { x: -160, y: -70 }, // Inverter Bank
        { x: -110, y: -70 },
        { x: 140, y: -65 },  // LiFePO4 Battery Bank
        { x: 180, y: -65 },
        { x: -25, y: 40 },   // SCADA Desk
        { x: 25, y: 40 },
        { x: -170, y: 15 },  // Isolation Switchgear
        { x: 0, y: -10 }     // Central aisle
      ];
      const available = energySpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    if (interior.type === 'WATER') {
      const waterSpots = [
        { x: -150, y: 25 },  // Cistern Tank
        { x: -90, y: -10 },
        { x: 120, y: -70 },  // Filtration Columns
        { x: 160, y: -70 },
        { x: 150, y: 25 },   // UV-C Chamber
        { x: -25, y: 50 },   // Hydro-Purity Lab
        { x: 25, y: 50 },
        { x: 0, y: -20 }     // Central corridor
      ];
      const available = waterSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    if (interior.type === 'FOOD') {
      const foodSpots = [
        { x: -180, y: 0 },   // Aeroponic Column A
        { x: -150, y: -20 },
        { x: -95, y: 0 },    // Aeroponic Column B
        { x: -70, y: -20 },
        { x: 130, y: -45 },  // Germination Nursery
        { x: 170, y: -45 },
        { x: 130, y: 60 },   // Harvest Crates
        { x: 170, y: 60 },
        { x: -150, y: 80 },  // Seed Library
        { x: 0, y: -10 }     // Central Dome Concourse
      ];
      const available = foodSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    if (interior.type === 'WORKSHOP') {
      const workshopSpots = [
        { x: -170, y: -90 }, // 3D Printer
        { x: -110, y: -80 }, // CNC Mill
        { x: -130, y: -10 }, // Assembly bench
        { x: -80, y: -10 },
        { x: 150, y: -90 },  // Plastic shredder
        { x: 150, y: 0 },    // Electronics
        { x: 180, y: 0 },
        { x: -30, y: 60 },   // CAD Workstation
        { x: 160, y: 80 }    // Materials bin
      ];
      const available = workshopSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 30));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    if (interior.type === 'SCHOOL') {
      const schoolSpots = [
        { x: -120, y: 20 },  // Student Desks
        { x: -40, y: 20 },
        { x: 40, y: 20 },
        { x: 120, y: 20 },
        { x: -30, y: -90 },  // Blackboard
        { x: 30, y: -90 },
        { x: -150, y: -80 }, // Microscope Bench
        { x: 150, y: -80 },  // Nature Terrarium
        { x: 0, y: 70 }      // Reading Circle
      ];
      const available = schoolSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    if (interior.type === 'GARDEN') {
      const gardenSpots = [
        { x: -45, y: 25 },   // Lotus Fountain
        { x: 45, y: 25 },
        { x: 0, y: -50 },
        { x: 0, y: 50 },
        { x: -150, y: -10 }, // Wicker Tea Table
        { x: -120, y: -10 },
        { x: 130, y: -10 },  // Raised Herb Bed
        { x: 170, y: -10 },
        { x: 130, y: 70 },   // Seed Swap Bench
        { x: 170, y: 70 },
        { x: -80, y: 50 },   // Pergola path
        { x: 80, y: 50 }
      ];
      const available = gardenSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    if (interior.type === 'ELDER_CARE') {
      const elderSpots = [
        { x: -120, y: -70 }, // Stone Hearth
        { x: -80, y: -70 },
        { x: -100, y: 0 },   // Armchairs
        { x: -40, y: 0 },
        { x: 120, y: -70 },  // Herbal Dispensary
        { x: 150, y: -70 },
        { x: 130, y: 40 },   // Veranda Plants
        { x: 160, y: 40 },
        { x: 20, y: 0 }      // Tea table
      ];
      const available = elderSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
      return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: 0, y: 0 };
    }

    // DWELLING spots
    const dwellingSpots = [
      { x: 100, y: -65 },  // Bed
      { x: 60, y: -65 },
      { x: -90, y: -70 },  // Desk
      { x: -70, y: 40 },   // Dining table
      { x: -40, y: 40 },
      { x: 90, y: 35 },    // Stove/Hearth
      { x: 0, y: -100 }    // Hydroponic window
    ];
    const available = dwellingSpots.filter(pt => !occs.some(o => Math.hypot(o.targetX - pt.x, o.targetY - pt.y) < 28));
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { x: (Math.random() - 0.5) * 160, y: (Math.random() - 0.5) * 80 };
  }

  /**
   * Generates a context-appropriate greeting as a citizen enters
   */
  getCitizenArrivalGreeting(citizen, interior) {
    if (interior.type === 'AGORA') {
      if (citizen.isChild) {
        const childGreetings = [
          '🏺 Can I watch the sortition urn?',
          '📖 Coming to hear the assembly!',
          '🌿 Fresh mint for the council!',
          '🎒 Class is over, here for agora!'
        ];
        return childGreetings[Math.floor(Math.random() * childGreetings.length)];
      }
      if (citizen.isElder) {
        const elderGreetings = [
          '📜 May wisdom guide the assembly.',
          '☀️ Taking a seat on the warm stone tier.',
          '🕊️ Ready to deliberate on civic matters.',
          '🧓 Greetings to the council of sortition.'
        ];
        return elderGreetings[Math.floor(Math.random() * elderGreetings.length)];
      }
      const adultGreetings = [
        '🏛️ Entering the democratic assembly...',
        '⚡ Checking in from the solar PV array!',
        '🥗 Fresh harvest report from greenhouse!',
        '💧 Rainwater cistern at 94% buffer.',
        '🤝 Salve, fellow pioneers!',
        '🗳️ Present for the sortition quorum.'
      ];
      return adultGreetings[Math.floor(Math.random() * adultGreetings.length)];
    }

    if (interior.type === 'ENERGY') {
      return [
        '⚡ Reporting for microgrid inverter check!',
        '🔋 Checking LiFePO4 battery cell balance.',
        '☀️ Peak solar generation incoming!',
        '🔌 Verifying galvanic islanding switchgear.'
      ][Math.floor(Math.random() * 4)];
    }

    if (interior.type === 'WATER') {
      return [
        '💧 Checking rainwater catchment buffers.',
        '🧪 Testing biochar and ultrafiltration columns.',
        '🔬 Taking a sample for the purity lab.',
        '🌊 Cistern level looking exceptional!'
      ][Math.floor(Math.random() * 4)];
    }

    if (interior.type === 'FOOD') {
      return [
        '🥗 Checking on the aeroponic lettuce columns.',
        '🍓 Strawberry runners are blooming!',
        '🌱 Starting a new seed tray in the nursery bed.',
        '🧺 Bringing crates for the morning harvest!'
      ][Math.floor(Math.random() * 4)];
    }

    if (interior.type === 'WORKSHOP') {
      return [
        '🛠️ Good day makers! Starting the 3D printer.',
        '♻️ Dropping off scrap plastic for shredding.',
        '💻 CAD model ready for the CNC router.',
        '🔧 Soldering an ESP32 telemetry sensor.'
      ][Math.floor(Math.random() * 4)];
    }

    if (interior.type === 'GARDEN') {
      if (citizen.isChild) {
        return Math.random() < 0.5 ? '🌸 Playing by the lotus fountain!' : '🦋 Look at all the butterflies!';
      }
      if (citizen.isElder) {
        return Math.random() < 0.5 ? '🧓 Coming for a warm cup of herbal tea.' : '☀️ Beautiful sunshine in the garden.';
      }
      return [
        '🌿 Harvesting fresh rosemary and sage.',
        '🌱 Checking the community seed swap bench.',
        '🌸 Stopping by the lotus fountain...',
        '🫖 Joining for afternoon garden tea.'
      ][Math.floor(Math.random() * 4)];
    }

    if (interior.type === 'SCHOOL') {
      if (citizen.isChild) {
        return [
          '🎒 Ready for morning nature class!',
          '🎨 Today we draw the bioregion map!',
          '🔬 Can we look at plant cells today?'
        ][Math.floor(Math.random() * 3)];
      }
      if (citizen.isElder) {
        return '🧓 Here to share oral history with the pupils.';
      }
      return '📚 Welcome pupils! Inquiry session is open.';
    }

    if (interior.type === 'ELDER_CARE') {
      if (citizen.isChild) {
        return '🌱 Came to visit and play chess!';
      }
      if (citizen.isElder) {
        return '🧓 The warmth of the hearth is comforting.';
      }
      return '❤️ Bringing fresh herbal infusions from the garden.';
    }

    if (interior.type === 'DWELLING') {
      return Math.random() < 0.5 ? '🏡 Home sweet usufruct sanctuary!' : '☕ Time for a warm tea break.';
    }

    return '👋 Hello there!';
  }

  /**
   * Generates a context-appropriate deliberation thought while present
   */
  getCitizenDeliberationThought(occ, interior) {
    if (interior.type === 'AGORA') {
      if (occ.isChild) {
        const childThoughts = [
          '🎒 School starts after the council 🎒',
          '🐦 Watching the sparrows on colonnade 🐦',
          '🎨 Drawing the marble amphitheater 🎨',
          '🌱 Learning how sortition works! 🏺'
        ];
        return childThoughts[Math.floor(Math.random() * childThoughts.length)];
      }
      if (occ.isElder) {
        const elderThoughts = [
          '📜 Solarpunk consensus strengthens us 📜',
          '❤️ Intergenerational care is thriving ❤️',
          '🕊️ Peace through transparent usufruct 🕊️',
          '☕ A balanced and respectful council ☕'
        ];
        return elderThoughts[Math.floor(Math.random() * elderThoughts.length)];
      }
      const adultThoughts = [
        '🗳️ Voting YES on microgrid expansion ⚡',
        '⚡ Thermodynamic Leontief balance closed 💻',
        '🏺 7-Citizen sortition jury convened 🏺',
        '💧 Greywater filtration running at 96% 💧',
        '🏡 Usufruct dwelling returned to pool 🏡',
        '🛠️ Preventive maintenance confirmed 🛠️',
        '🥗 Zero food waste, 100% circular 🥗',
        '📜 Non-commercial purity strictly held 📜'
      ];
      return adultThoughts[Math.floor(Math.random() * adultThoughts.length)];
    }

    if (interior.type === 'ENERGY') {
      return [
        '⚡ Microgrid frequency steady at 50.02 Hz ⚡',
        '🔋 LiFePO4 battery state of charge: 96% 🔋',
        '☀️ MPPT trackers tuned to solar zenith ☀️',
        '🛡️ Galvanic island isolation verified 🛡️',
        '💻 SCADA telemetry synced to mesh 📡'
      ][Math.floor(Math.random() * 5)];
    }

    if (interior.type === 'WATER') {
      return [
        '💧 Water turbidity < 0.1 NTU (pure) 💧',
        '🧪 Ultrafiltration flow: 1,200 L/h 🧪',
        '🟣 UV-C LED sterilization at 99.99% 🟣',
        '🌊 Cistern reserve at 94% capacity 🌊',
        '🌾 Greywater reed beds thriving 🌾'
      ][Math.floor(Math.random() * 5)];
    }

    if (interior.type === 'FOOD') {
      return [
        '🌿 Aeroponic root mist cycling: 5s / 3m 🌿',
        '🍓 Heirloom strawberries ripened sweet 🍓',
        '🥗 Daily caloric yield exceeds 2,400 kcal 🥗',
        '🌸 Photosynthetic spectrum optimized 🌸',
        '🗄️ Bioregional seed vault categorized 🗄️'
      ][Math.floor(Math.random() * 5)];
    }

    if (interior.type === 'WORKSHOP') {
      return [
        '🖨️ CoreXY printer printing PETG bracket 🖨️',
        '♻️ 5 kg scrap plastic re-extruded to spool ♻️',
        '⚙️ CNC mill finished beechwood cabinet ⚙️',
        '⚡ ESP32 Zigbee telemetry node flashed ⚡',
        '🔨 Zero-waste circular repair complete 🛠️'
      ][Math.floor(Math.random() * 5)];
    }

    if (interior.type === 'GARDEN') {
      if (occ.isChild) {
        return Math.random() < 0.5 ? '🦋 Chasing a swallowtail butterfly! 🦋' : '⛲ Watching water ripples in fountain ⛲';
      }
      if (occ.isElder) {
        return Math.random() < 0.5 ? '🧓 Peppermint and lemon balm tea 🫖' : '☀️ Soft breeze through the pergola ☀️';
      }
      return [
        '🌿 Rosemary, chamomile and lavender 🌿',
        '🌱 Propagating fig and berry cuttings 🌱',
        '⛲ Lotus fountain is so peaceful ⛲',
        '🌸 Fragrant jasmine in full bloom 🌸'
      ][Math.floor(Math.random() * 4)];
    }

    if (interior.type === 'SCHOOL') {
      if (occ.isChild) {
        return [
          '🎒 Learning closed-loop thermodynamics! 💻',
          '🎨 Painting the four bioregions 🎨',
          '🔬 Looking at plant cells in microscope 🔬'
        ][Math.floor(Math.random() * 3)];
      }
      if (occ.isElder) {
        return '🧓 Mentoring the next generation 🕊️';
      }
      return '📚 Open inquiry and hands-on discovery 📚';
    }

    if (interior.type === 'ELDER_CARE') {
      if (occ.isElder) {
        return [
          '🔥 Warm hearth fire is soothing 🔥',
          '📜 Sharing memories of node founding 📜',
          '🕊️ Restful and dignified elderhood 🕊️'
        ][Math.floor(Math.random() * 3)];
      }
      return [
        '❤️ Biometrics and comfort nominal ❤️',
        '🌿 Chamomile infusion served ☕'
      ][Math.floor(Math.random() * 2)];
    }

    if (interior.type === 'DWELLING') {
      return [
        '🏡 Usufruct security: peace of mind 🏡',
        '🍵 Herbal infusion brew steaming ☕',
        '🌱 Bioclimatic sedum insulation intact 🌱',
        '📚 Enjoying an evening of quiet study 📖'
      ][Math.floor(Math.random() * 4)];
    }

    return '✨ Community thriving together ✨';
  }

  /**
   * Generates a context-appropriate departure farewell before leaving through portals
   */
  getCitizenDepartureFarewell(occ, interior) {
    if (interior.type === 'AGORA') {
      if (occ.isChild) {
        return Math.random() < 0.5 ? '🦋 Running to the shared garden!' : '⚽ Going to play outside!';
      }
      if (occ.isElder) {
        return Math.random() < 0.5 ? '🧓 Strolling back to sanctuary.' : '🌿 Going to rest by the garden.';
      }
      const departures = [
        '🌱 Returning to the bioclimatic fields!',
        '🔨 Back to the FabLab workshop!',
        '🌬️ Heading to inspect the wind turbines.',
        '🏡 Returning home for dinner.',
        '💻 Resuming telemetry coding.'
      ];
      return departures[Math.floor(Math.random() * departures.length)];
    }

    if (interior.type === 'ENERGY') {
      return Math.random() < 0.5 ? '⚡ Microgrid inspection done, heading out!' : '🔌 Off to check rooftop solar PV!';
    }
    if (interior.type === 'WATER') {
      return Math.random() < 0.5 ? '💧 Water tests passed, returning to village!' : '🌊 Heading to inspect reed beds.';
    }
    if (interior.type === 'FOOD') {
      return Math.random() < 0.5 ? '🥗 Crates loaded, delivering to granary!' : '🧺 Off to cook at communal kitchen!';
    }
    if (interior.type === 'WORKSHOP') {
      return Math.random() < 0.5 ? '🛠️ Part printed! Bringing it to turbine.' : '🔨 Heading to assemble new cabinet.';
    }
    if (interior.type === 'GARDEN') {
      return Math.random() < 0.5 ? '🌸 That was refreshing! Back to chores.' : '🧓 Enjoyed the tea, strolling back home.';
    }
    if (interior.type === 'SCHOOL') {
      return Math.random() < 0.5 ? '🎒 Class dismissed! Running to play!' : '📚 Great lesson today, see you tomorrow!';
    }
    if (interior.type === 'ELDER_CARE') {
      return Math.random() < 0.5 ? '🧓 Heading for a walk in the garden.' : '❤️ Taking leave, rest well neighbors!';
    }
    if (interior.type === 'DWELLING') {
      return Math.random() < 0.5 ? '👋 Heading out to the Agora assembly!' : '🌱 Off to work in aeroponic dome!';
    }

    return '👋 See you later, neighbors!';
  }

  findEntityAt(x, y) {
    // 1. Check Citizens first (precise selection on Player, Human Peers, and Autonomous Residents)
    for (const c of this.citizens) {
      const dist = Math.hypot(x - c.x, y - (c.y - 6));
      if (dist <= 16) return c;
    }

    // 2. Check Dwellings
    for (const d of this.dwellings) {
      const dist = Math.hypot(x - d.x, y - d.y);
      if (dist <= d.radius) return d;
    }

    // Check Infrastructures
    for (const b of this.infrastructures) {
      if (
        x >= b.x - b.width / 2 &&
        x <= b.x + b.width / 2 &&
        y >= b.y - b.height / 2 &&
        y <= b.y + b.height / 2
      ) {
        return b;
      }
    }

    // Check Agora
    if (Math.hypot(x - this.agora.x, y - this.agora.y) <= this.agora.radius) {
      return this.agora;
    }

    return null;
  }

  claimDwelling(dwellingId, vocationId = 'farmer') {
    const voc = getVocationById(vocationId);
    for (const d of this.dwellings) {
      if (d.id === dwellingId) {
        d.isOccupied = true;
        d.isPlayerHome = true;
        d.occupant = {
          name: 'Player (You)',
          vocationId: voc.id,
          role: voc.defaultName,
          roleKey: voc.nameKey,
          icon: voc.icon,
          dailyHours: 4,
          multiplier: voc.multiplier
        };
        PlayerProfileManager.claimDwelling(this.node.id, this.node.name, d, voc.id);
        return d;
      }
    }
    return null;
  }

  releaseDwelling(dwellingId) {
    for (const d of this.dwellings) {
      if (d.id === dwellingId) {
        if (d.isPlayerHome) {
          PlayerProfileManager.releaseDwelling();
        }
        d.isOccupied = false;
        d.isPlayerHome = false;
        d.occupant = null;
        return d;
      }
    }
    return null;
  }

  start() {
    if (this.animFrameId) return;
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  update(dt) {
    if (this.activeInterior) {
      this.interiorTick++;
    }

    // Smooth camera zoom lerp
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.15;

    // Simulation speed factor (0 = paused, 1 = normal, 2 = fast, 5 = hyper)
    const simSpeed = this.sim ? this.sim.speedMultiplier : 1;

    // Living interior simulation (citizens entering, deliberating, and exiting)
    if (this.activeInterior) {
      this.updateInteriorSimulation(dt, simSpeed);
    }

    // Keep player avatar vocation reactive to sim.node.playerVocation
    const playerAvatar = this.citizens.find(c => c.isPlayer);
    if (playerAvatar && this.sim?.node?.playerVocation && playerAvatar.vocation?.id !== this.sim.node.playerVocation) {
      playerAvatar.vocation = getVocationById(this.sim.node.playerVocation);
    }

    // Wind turbines rotation: proportional to simulation speed; subtle idle breeze when paused
    const windSpeed = simSpeed === 0 ? 0.3 : 3.5 * simSpeed;
    this.windAngle += dt * windSpeed;

    // Aurora wave offset
    this.auroraOffset += dt * (simSpeed === 0 ? 0.1 : 0.4 * Math.max(0.5, simSpeed * 0.4));

    // Update citizens AI walking ONLY when simulation is running
    if (simSpeed > 0) {
      for (const c of this.citizens) {
        if (c.pauseTicks > 0) {
          c.pauseTicks -= simSpeed;
        } else {
          const dx = c.targetX - c.x;
          const dy = c.targetY - c.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 4 * Math.max(1, simSpeed * 0.8)) {
            // Arrived at destination, pick new destination based on role & demographic group
            c.pauseTicks = Math.floor((Math.random() * 150 + 50) / simSpeed);

            if (c.isChild) {
              // Children frequent the Commons School, the Shared Garden, and the Agora
              const school = this.infrastructures.find(inf => inf.type === 'SCHOOL');
              const garden = this.infrastructures.find(inf => inf.type === 'GARDEN');
              const childDests = [
                { x: (school ? school.x : -150) + (Math.random() - 0.5) * 45, y: (school ? school.y : 250) + (Math.random() - 0.5) * 30 },
                { x: (garden ? garden.x : 0) + (Math.random() - 0.5) * 55, y: (garden ? garden.y : 250) + (Math.random() - 0.5) * 30 },
                { x: this.agora.x + (Math.random() - 0.5) * 45, y: this.agora.y + (Math.random() - 0.5) * 45 }
              ];
              const dest = childDests[Math.floor(Math.random() * childDests.length)];
              c.targetX = dest.x;
              c.targetY = dest.y;
            } else if (c.isElder) {
              // Elders frequent the Intergenerational Sanctuary, the Shared Garden benches, and the Agora
              const elderSanctuary = this.infrastructures.find(inf => inf.type === 'ELDER_CARE');
              const garden = this.infrastructures.find(inf => inf.type === 'GARDEN');
              const elderDests = [
                { x: (elderSanctuary ? elderSanctuary.x : 150) + (Math.random() - 0.5) * 40, y: (elderSanctuary ? elderSanctuary.y : 250) + (Math.random() - 0.5) * 30 },
                { x: (garden ? garden.x + 36 : 36) + (Math.random() - 0.5) * 20, y: (garden ? garden.y + 10 : 260) + (Math.random() - 0.5) * 10 },
                { x: this.agora.x + (Math.random() - 0.5) * 35, y: this.agora.y + (Math.random() - 0.5) * 35 }
              ];
              const dest = elderDests[Math.floor(Math.random() * elderDests.length)];
              c.targetX = dest.x;
              c.targetY = dest.y;
            } else {
              // Adult citizens go to their vocational infrastructure, dwellings, or Agora
              const cVoc = c.vocation || COMMUNITY_VOCATIONS[0];
              let matchingTarget = this.infrastructures.find(inf => inf.type === cVoc.targetLocation);
              if (!matchingTarget && cVoc.targetLocation === 'AGORA') matchingTarget = this.agora;

              const destinations = [
                { x: this.agora.x + (Math.random() - 0.5) * 50, y: this.agora.y + (Math.random() - 0.5) * 50 },
                ...(matchingTarget ? [{ x: matchingTarget.x + (Math.random() - 0.5) * 35, y: matchingTarget.y + (Math.random() - 0.5) * 35 }] : []),
                ...this.infrastructures.map(inf => ({ x: inf.x + (Math.random() - 0.5) * 40, y: inf.y + (Math.random() - 0.5) * 40 })),
                ...this.dwellings.slice(0, 8).map(dw => ({ x: dw.x, y: dw.y }))
              ];
              const dest = destinations[Math.floor(Math.random() * destinations.length)];
              c.targetX = dest.x;
              c.targetY = dest.y;
            }
          } else {
            c.x += (dx / dist) * c.speed * simSpeed;
            c.y += (dy / dist) * c.speed * simSpeed;
          }
        }

        // Emote speech bubbles
        c.bubbleTimer -= simSpeed;
        if (c.bubbleTimer <= 0) {
          if (c.bubble) {
            c.bubble = null;
            c.bubbleTimer = Math.floor((Math.random() * 300 + 100) / simSpeed);
          } else if (Math.random() < 0.35) {
            if (c.isChild) {
              const childEmotes = ['🎒', '🌱', '🦋', '⚽', '🎨', '📖'];
              c.bubble = childEmotes[Math.floor(Math.random() * childEmotes.length)];
            } else if (c.isElder) {
              const elderEmotes = ['🧓', '☕', '📜', '🌱', '🕊️', '❤️'];
              c.bubble = elderEmotes[Math.floor(Math.random() * elderEmotes.length)];
            } else {
              const vocEmote = c.vocation ? c.vocation.icon : '🌱';
              const genericEmotes = ['🌱', '⚡', '💧', '🤝', '🛠️', '🍲', '☀️', '🏡'];
              c.bubble = Math.random() < 0.6 ? vocEmote : genericEmotes[Math.floor(Math.random() * genericEmotes.length)];
            }
            c.bubbleTimer = 120 / simSpeed;
          }
        }
      }

      // Check for Intergenerational Interaction in the Shared Garden
      const gardenInf = this.infrastructures.find(inf => inf.type === 'GARDEN');
      if (gardenInf) {
        const childrenInGarden = this.citizens.filter(c => c.isChild && Math.hypot(c.x - gardenInf.x, c.y - gardenInf.y) < 70);
        const eldersInGarden = this.citizens.filter(c => c.isElder && Math.hypot(c.x - gardenInf.x, c.y - gardenInf.y) < 70);
        if (childrenInGarden.length > 0 && eldersInGarden.length > 0) {
          for (const ch of childrenInGarden) {
            for (const el of eldersInGarden) {
              if (Math.hypot(ch.x - el.x, ch.y - el.y) < 45) {
                if (!ch.bubble) {
                  ch.bubble = Math.random() < 0.5 ? '📖' : '🌱';
                  ch.bubbleTimer = 100;
                }
                if (!el.bubble) {
                  el.bubble = '❤️';
                  el.bubbleTimer = 100;
                }
              }
            }
          }
        }
      }
    }

    // Rocket stove chimney smoke particles (for Arctic domes)
    if (this.climate.id === 'ARCTIC') {
      if (simSpeed > 0 && Math.random() < 0.25 * simSpeed) {
        const activeDwellings = this.dwellings.filter(d => d.isOccupied);
        if (activeDwellings.length > 0) {
          const dw = activeDwellings[Math.floor(Math.random() * activeDwellings.length)];
          this.particles.push({
            x: dw.x + 8,
            y: dw.y - 18,
            vx: (Math.random() - 0.5) * 0.3 + 0.2,
            vy: -0.8 - Math.random() * 0.5,
            radius: 2.5,
            alpha: 0.6,
            life: 1.0
          });
        }
      }
    }

    // Update particles
    const pScale = simSpeed === 0 ? 0.15 : simSpeed;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * pScale;
      p.y += p.vy * pScale;
      p.radius += 0.05 * pScale;
      p.life -= dt * 0.5 * pScale;
      p.alpha = p.life * 0.5;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // If inside a common facility or private dwelling, render high-detail interior scene
    if (this.activeInterior) {
      this.renderInteriorView(ctx, w, h);
      this.renderInteriorHudOverlay(ctx, w, h);
      ctx.restore();
      return;
    }

    // 1. Bioclimatic Terrain & Sky Background
    this.renderBioclimaticBackground(ctx, w, h);

    // 2. Apply Camera Matrix (Center origin + Pan + Zoom)
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(this.camera.x, this.camera.y);

    // 3. Render Village Ground Roads & Paths
    this.renderPathways(ctx);

    // 4. Render Infrastructures
    for (const b of this.infrastructures) {
      this.renderInfrastructure(ctx, b);
    }

    // 5. Render Central Agora
    this.renderAgora(ctx);

    // 6. Render Dwellings (Bioclimatic Architecture)
    for (const d of this.dwellings) {
      this.renderDwelling(ctx, d);
    }

    // 7. Render Particles (Smoke, Sparks)
    this.renderParticles(ctx);

    // 8. Render Citizens / Pioneers
    for (const c of this.citizens) {
      this.renderCitizen(ctx, c);
    }

    ctx.restore(); // Restore camera matrix

    // 8.5 Render Dynamic Weather Effects (Rain, Overcast shadows, Hail, Lightning, Heatwave)
    this.renderWeatherOverlay(ctx, w, h);

    // 9. Render HUD Overlay & Hover Tooltip
    this.renderHudOverlay(ctx, w, h);

    ctx.restore();
  }

  renderBioclimaticBackground(ctx, w, h) {
    const key = this.climate.id;

    if (key === 'ARCTIC') {
      // Subpolar night sky & snow field
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#060d1f');
      bgGrad.addColorStop(0.45, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Shimmering Aurora Borealis ribbons
      ctx.save();
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.15 + i * 35);
        for (let x = 0; x <= w; x += 40) {
          const wave = Math.sin(x * 0.008 + this.auroraOffset + i) * 35;
          ctx.lineTo(x, h * 0.15 + wave + i * 30);
        }
        ctx.lineTo(w, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        const aurGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        aurGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        aurGrad.addColorStop(0.6, 'rgba(52, 211, 153, 0.4)');
        aurGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = aurGrad;
        ctx.fill();
      }
      ctx.restore();

      // Subtle ice snow sparkle dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 224.3) % h;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    } else if (key === 'ARID') {
      // Warm desert ochre / terracotta gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#2d1305');
      bgGrad.addColorStop(0.5, '#451a03');
      bgGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Sand dune ripples
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.lineWidth = 1.5;
      for (let y = 50; y < h; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 50) {
          ctx.quadraticCurveTo(x + 25, y + 8, x + 50, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    } else if (key === 'TROPICAL') {
      // Deep equatorial rainforest canopy atmosphere
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#011c14');
      bgGrad.addColorStop(0.5, '#022c22');
      bgGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Organic canopy foliage silhouettes
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
      for (let i = 0; i < 12; i++) {
        const cx = (i * 180) % w;
        const cy = (i * 140) % h;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // TEMPERATE (Rich fertile green commons)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#022c22');
      bgGrad.addColorStop(0.6, '#064e3b');
      bgGrad.addColorStop(1, '#065f46');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Soft grass field texture
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 80; i++) {
        const gx = (i * 79.1) % w;
        const gy = (i * 123.7) % h;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + 3, gy - 6);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  renderPathways(ctx) {
    ctx.save();
    ctx.strokeStyle = this.climate.id === 'ARCTIC' ? 'rgba(226, 232, 240, 0.2)' : 'rgba(217, 119, 6, 0.2)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Central circular boulevard
    ctx.beginPath();
    ctx.arc(0, 0, 175, 0, Math.PI * 2);
    ctx.stroke();

    // Outer boulevard
    ctx.beginPath();
    ctx.arc(0, 0, 290, 0, Math.PI * 2);
    ctx.stroke();

    // Radial spokes from Agora to Infrastructures
    for (const b of this.infrastructures) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderAgora(ctx) {
    const isHovered = this.hoveredEntity === this.agora;

    ctx.save();
    ctx.translate(this.agora.x, this.agora.y);

    // Concentric stone amphitheater rings
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.arc(0, 0, this.agora.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#34d399' : '#10b981';
    ctx.lineWidth = isHovered ? 4 : 2;
    ctx.stroke();

    // Inner amphitheater bench rings
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.agora.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, this.agora.radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Central Luminous O.N.E. Emblem
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O.N.E.', 0, 0);

    // Label tag
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillText('🏛️ Agora & Demarchy', 0, this.agora.radius + 16);

    ctx.restore();
  }

  renderInfrastructure(ctx, b) {
    const isHovered = this.hoveredEntity === b;

    ctx.save();
    ctx.translate(b.x, b.y);

    // Base card foundation
    ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = isHovered ? 2.5 : 1.5;

    ctx.beginPath();
    ctx.roundRect(-b.width / 2, -b.height / 2, b.width, b.height, 10);
    ctx.fill();
    ctx.stroke();

    // Type-specific graphical details
    if (b.type === 'ENERGY') {
      // Solar PV blue grid cells
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-b.width / 2 + 10, -b.height / 2 + 12, 50, 32);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.strokeRect(-b.width / 2 + 10, -b.height / 2 + 12, 50, 32);

      // Rotating wind turbine
      ctx.save();
      ctx.translate(35, -5);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 26); // mast
      ctx.stroke();

      ctx.rotate(this.windAngle);
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -18);
        ctx.stroke();
      }
      ctx.restore();
    } else if (b.type === 'WATER') {
      // Water Cistern Glass Tank with dynamic water level
      ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.beginPath();
      ctx.arc(-25, 5, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('💧', -25, 10);

      // Reed filter beds
      ctx.fillStyle = '#065f46';
      ctx.fillRect(10, -15, 45, 40);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(10, -15, 45, 40);
    } else if (b.type === 'FOOD') {
      const agroResilience = this.sim?.node?.agroResilience || {};
      const soilMoisture = this.sim?.thermo?.food?.soilMoisturePct ?? 75;

      // 1. Geodesic Aeroponic Greenhouse Dome (Left)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-35, 5, 34, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Geodesic struts & glowing vertical aeroponic towers
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-69, 5); ctx.lineTo(-1, 5);
      ctx.moveTo(-35, -21); ctx.lineTo(-35, 31);
      ctx.moveTo(-58, -12); ctx.lineTo(-12, 22);
      ctx.moveTo(-58, 22); ctx.lineTo(-12, -12);
      ctx.stroke();

      // Vertical aeroponic grow towers inside
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-45, -8, 4, 24);
      ctx.fillRect(-35, -12, 4, 28);
      ctx.fillRect(-25, -8, 4, 24);

      // 2. Outdoor Permaculture Raised Beds (Right)
      const soilColor = soilMoisture < 35 ? '#78350f' : (soilMoisture > 85 ? '#1c1917' : '#3f2e18');
      
      // Draw 3 raised timber beds
      for (let i = 0; i < 3; i++) {
        const bedY = -22 + (i * 20);
        // Timber bed frame
        ctx.fillStyle = '#713f12';
        ctx.fillRect(10, bedY, 48, 14);
        // Rich organic living soil
        ctx.fillStyle = soilColor;
        ctx.fillRect(12, bedY + 2, 44, 10);

        // Crop foliage / vegetable shoots
        ctx.fillStyle = (soilMoisture < 30 && !agroResilience.permacultureMulch?.installed) ? '#ca8a04' : '#22c55e';
        for (let j = 0; j < 4; j++) {
          ctx.beginPath();
          ctx.arc(17 + j * 10, bedY + 7, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Agro-Resilience Defense Overlays
      // A. Keyline Swales (Contour infiltration ditch)
      if (agroResilience.keylineSwales?.installed) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(6, -26);
        ctx.bezierCurveTo(4, 0, 4, 20, 6, 38);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // B. Protective Hail & Canopy Netting
      if (agroResilience.hailNetting?.installed) {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.18)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.fillRect(8, -26, 52, 64);
        ctx.strokeRect(8, -26, 52, 64);

        // Netting crosshatch pattern
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
        for (let x = 14; x < 60; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, -26); ctx.lineTo(x, 38);
          ctx.stroke();
        }
      }

      // C. Agroforestry Windbreak Hedgerow
      if (agroResilience.agroforestryWindbreak?.installed) {
        ctx.fillStyle = '#15803d';
        for (let t = 0; t < 4; t++) {
          ctx.beginPath();
          ctx.arc(66, -20 + t * 18, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.font = '14px sans-serif';
      ctx.fillText('🥗', -40, -25);
    } else if (b.type === 'WORKSHOP') {
      // 3D printer and tools
      ctx.fillStyle = '#334155';
      ctx.fillRect(-b.width / 2 + 12, -15, 40, 36);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(-b.width / 2 + 12, -15, 40, 36);

      // Sparks animation
      if (Math.random() < 0.4) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-b.width / 2 + 32, 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillText('🤖', 30, 8);
    } else if (b.type === 'MESH') {
      // Slender lattice radio mast
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, b.height / 2);
      ctx.lineTo(0, -b.height / 2);
      ctx.stroke();

      // Pulsing radio wave rings
      const pulseR = (Date.now() / 25) % 25;
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - pulseR / 25})`;
      ctx.beginPath();
      ctx.arc(0, -b.height / 2, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.type === 'SCHOOL') {
      // Warm classroom pavilion & outdoor nature blackboard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-b.width / 2 + 10, -18, 42, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(-b.width / 2 + 10, -18, 42, 30);
      
      // Nature chalkboard drawing
      ctx.fillStyle = '#34d399';
      ctx.font = '8px monospace';
      ctx.fillText('📚 O.N.E.', -b.width / 2 + 14, -6);
      ctx.fillText('🌱 Botany', -b.width / 2 + 14, 4);

      // Playful pitched roof
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(10, 16);
      ctx.lineTo(35, -16);
      ctx.lineTo(60, 16);
      ctx.closePath();
      ctx.fill();

      ctx.font = '16px system-ui';
      ctx.fillText('🎒', 35, 12);
    } else if (b.type === 'GARDEN') {
      // Shared Intergenerational Garden & Pergola
      // Lush grass carpet
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.fillRect(-b.width / 2 + 6, -b.height / 2 + 6, b.width - 12, b.height - 12);
      
      // Raised cedar planter beds
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-b.width / 2 + 14, -18, 34, 14);
      ctx.fillRect(-b.width / 2 + 14, 6, 34, 14);
      ctx.fillStyle = '#22c55e';
      ctx.font = '11px system-ui';
      ctx.fillText('🌱', -b.width / 2 + 22, -8);
      ctx.fillText('🥕', -b.width / 2 + 22, 16);

      // Central stone fountain
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(8, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Shaded wisteria pergola & teak benches
      ctx.font = '15px system-ui';
      ctx.fillText('🌸', 46, -8);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(36, 10, 20, 6);
    } else if (b.type === 'ELDER_CARE') {
      // Intergenerational Sanctuary Pavilion (Accessible veranda, warm wood, rocking chair)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-b.width / 2 + 10, -20, 56, 38);
      ctx.strokeStyle = '#f97316';
      ctx.strokeRect(-b.width / 2 + 10, -20, 56, 38);

      // Warm glowing hearth lantern
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.beginPath();
      ctx.arc(-b.width / 2 + 24, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Rocking chair & hot tea
      ctx.font = '15px system-ui';
      ctx.fillText('🪑', 38, -2);
      ctx.fillText('☕', 38, 16);
    }

    // Name label
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(b.name.split(' ')[0] + ' ' + (b.name.split(' ')[1] || ''), 0, b.height / 2 + 5);

    ctx.restore();
  }

  renderDwelling(ctx, d) {
    const isHovered = this.hoveredEntity === d;
    const isPlayer = d.isPlayerHome;
    const isOccupied = d.isOccupied;

    ctx.save();
    ctx.translate(d.x, d.y);

    // 1. Highlight Ring on Hover / Player Home / Free Pod
    if (isPlayer) {
      ctx.strokeStyle = '#fbbf24'; // Golden glow for player home
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, d.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (isHovered) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, d.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (!isOccupied) {
      // Pulsing cyan border for vacant civic pod
      const pulse = (Math.sin(Date.now() / 300) + 1) * 0.5;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.45})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, d.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Bioclimatic Architectural Render per Climate
    const key = this.climate.id;

    if (key === 'ARCTIC') {
      // Geodesic Earth-Sheltered Snow Dome
      // Earth turf base berm
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 4, d.radius, 0, Math.PI * 2);
      ctx.fill();

      // Dome cap (ice/aerogel white-blue)
      ctx.fillStyle = isOccupied ? '#0f766e' : '#334155';
      ctx.beginPath();
      ctx.arc(0, -2, d.radius - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Geodesic triangle facet lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(0, -20);
      ctx.lineTo(16, -2);
      ctx.closePath();
      ctx.stroke();

      // Rocket stove chimney
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, -24, 4, 10);

      // Warm orange glowing window if occupied
      if (isOccupied) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 3, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'ARID') {
      // Rammed-Earth Nautilus Cool-Tower
      ctx.fillStyle = isOccupied ? '#9a3412' : '#571f0b';
      ctx.beginPath();
      ctx.roundRect(-d.radius + 3, -d.radius + 3, (d.radius - 3) * 2, (d.radius - 3) * 2, 8);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Central Windcatcher Cool-Tower (Malqaf) scoop
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -d.radius - 5, 14, 12);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(-7, -d.radius - 5, 14, 12);

      // Arched recessed window
      ctx.fillStyle = isOccupied ? '#fbbf24' : '#1c1917';
      ctx.fillRect(-4, 0, 8, 8);
    } else if (key === 'TROPICAL') {
      // Elevated Bamboo Stilt Bioclimatic Pavilion
      // Stilts (legs)
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, 6); ctx.lineTo(-14, 20);
      ctx.moveTo(14, 6); ctx.lineTo(14, 20);
      ctx.stroke();

      // Bamboo floor platform
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-18, 2, 36, 6);

      // Breathable thatched peaked roof
      ctx.fillStyle = isOccupied ? '#047857' : '#1e3a2b';
      ctx.beginPath();
      ctx.moveTo(0, -d.radius);
      ctx.lineTo(d.radius - 2, 2);
      ctx.lineTo(-d.radius + 2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Open veranda lantern
      if (isOccupied) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-3, -6, 6, 6);
      }
    } else {
      // TEMPERATE: Modular Hex-Loft Timber Pavilion
      // Hexagon base
      ctx.fillStyle = isOccupied ? '#065f46' : '#1f2937';
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const rad = (a / 6) * Math.PI * 2;
        const hx = Math.cos(rad) * (d.radius - 3);
        const hy = Math.sin(rad) * (d.radius - 3);
        if (a === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Living Sedum green roof center
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Timber frame post markers
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-2, -d.radius + 3, 4, 4);
      ctx.fillRect(-2, d.radius - 7, 4, 4);
    }

    // Pod Number or Player Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isPlayer) {
      ctx.fillText('👑', 0, 0);
    } else if (!isOccupied) {
      ctx.fillText('🔑', 0, 0);
    } else {
      ctx.fillText(`#${d.number}`, 0, 0);
    }

    // Name tag below
    ctx.fillStyle = isPlayer ? '#fbbf24' : (isOccupied ? '#94a3b8' : '#38bdf8');
    ctx.font = isPlayer ? 'bold 10px system-ui' : '9px system-ui';
    ctx.textBaseline = 'top';
    const label = isPlayer ? 'Your Home' : (isOccupied ? `${d.occupant.icon || ''} ${d.occupant.name.split(' ')[0]}` : 'FREE');
    ctx.fillText(label, 0, d.radius + 4);

    ctx.restore();
  }

  renderParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderCitizen(ctx, c) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const now = Date.now();
    const pulse = Math.sin(now * 0.005) * 2;

    // 1. Halo / Ground Rings to distinguish Player vs Human Mesh Peers vs NPCs
    if (c.isPlayer) {
      // Local Player (YOU): Radiant Golden Beacon Ring with pulsing aura
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 4, 15 + pulse, 7.5 + pulse * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 4, 9.5, 4.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (c.isHuman) {
      // Other Human Players: Bioluminescent Cyan Mesh Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 4, 12 + pulse * 0.7, 6 + pulse * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Simulated Resident (NPC): Subtle natural shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Child hopping animation
    if (c.isChild) {
      const hop = Math.abs(Math.sin(now * 0.009 + (c.x || 0))) * 3.5;
      ctx.translate(0, -hop);
    }

    // 2. Body
    const bodyRadius = c.isPlayer ? 5.5 : (c.isChild ? 3.2 : 4.5);
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(0, c.isChild ? -3 : -4, bodyRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Head
    const headY = c.isPlayer ? -11 : (c.isChild ? -8 : -10);
    const headRadius = c.isPlayer ? 3.5 : (c.isChild ? 2.3 : 3);
    ctx.fillStyle = c.isPlayer ? '#fef08a' : (c.isHuman ? '#e0f2fe' : (c.isElder ? '#f1f5f9' : '#fef08a'));
    ctx.beginPath();
    ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Elder silver hair & wooden walking cane
    if (c.isElder) {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, headY - 1, headRadius + 0.6, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(5, -4);
      ctx.lineTo(6, 4);
      ctx.stroke();
    }

    // 4. Over-head Badges & Nameplates
    if (c.isPlayer) {
      // Floating Crown & YOU badge
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -18);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-18, -37, 36, 14, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillText('YOU', 0, -27);
    } else if (c.isHuman) {
      // Floating network peer badge for other real human participants
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-17, -26, 34, 13, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌐 PEER', 0, -17);
    } else if (c.isChild) {
      // Child floating badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-19, -24, 38, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 7.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎒 PUPIL', 0, -16);
    } else if (c.isElder) {
      // Elder floating badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-21, -25, 42, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 7.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧓 ELDER', 0, -17);
    }

    // 5. Speech bubble if active
    if (c.bubble) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = c.isPlayer ? '#fbbf24' : (c.isHuman ? '#38bdf8' : (c.isChild ? '#f43f5e' : (c.isElder ? '#cbd5e1' : '#10b981')));
      ctx.lineWidth = 1;
      const bubbleY = c.isPlayer ? -54 : (c.isHuman ? -42 : -32);
      ctx.beginPath();
      ctx.roundRect(-11, bubbleY, 22, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.bubble, 0, bubbleY + 8);
    }

    ctx.restore();
  }

  renderWeatherOverlay(ctx, w, h) {
    const weather = this.sim?.thermo?.weather;
    if (!weather) return;

    ctx.save();

    const now = Date.now();

    // 1. Rain Streaks (if rain or storm)
    if (weather.rainfallMmPerHour > 0 || weather.type === 'RAIN' || weather.type === 'STORMY') {
      const isStorm = weather.type === 'STORMY';
      const count = isStorm ? 120 : 60;
      ctx.strokeStyle = isStorm ? 'rgba(186, 230, 253, 0.7)' : 'rgba(186, 230, 253, 0.45)';
      ctx.lineWidth = isStorm ? 1.6 : 1.0;
      for (let i = 0; i < count; i++) {
        const speed = isStorm ? 20 : 12;
        const rx = ((i * 37 + now * 0.45) % (w + 100)) - 50;
        const ry = (i * 29 + now * 0.85) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + speed);
        ctx.stroke();
      }

      // Lightning flash during storm
      if (isStorm && Math.random() < 0.012) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(0, 0, w, h);
      }
    }

    // 2. Hail pellets (during Hailstorm)
    if (weather.activeDisaster?.id === 'HAILSTORM') {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const hx = (i * 47 + now * 0.3) % w;
        const hy = (i * 31 + now * 1.2) % h;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Ambient heatwave amber shimmer
    if (weather.type === 'HEATWAVE') {
      const amberPulse = (Math.sin(now * 0.003) + 1) * 0.04;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.05 + amberPulse})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 4. Overcast cloud shadows
    if (weather.cloudCover >= 0.7) {
      ctx.fillStyle = `rgba(15, 23, 42, ${weather.cloudCover * 0.15})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 5. Active Disaster Alert Banner in top-center
    if (weather.activeDisaster) {
      const d = weather.activeDisaster;
      const bannerW = 440;
      const bannerH = 34;
      const bx = (w - bannerW) / 2;
      const by = 68;

      ctx.fillStyle = 'rgba(127, 29, 29, 0.92)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef2f2';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${d.icon} SEVERE ALERT: ${d.name.toUpperCase()} (${d.durationHoursLeft}h left)`, bx + bannerW / 2, by + bannerH / 2);
    }

    ctx.restore();
  }

  renderHudOverlay(ctx, w, h) {
    // 1. Simulation Pause Banner when paused
    const simSpeed = this.sim ? this.sim.speedMultiplier : 1;
    if (simSpeed === 0) {
      ctx.save();
      const pauseW = 220;
      const pauseH = 34;
      const px = w - pauseW - 20;
      const py = 75;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px, py, pauseW, pauseH, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏸️ SIMULATION PAUSED', px + pauseW / 2, py + pauseH / 2);
      ctx.restore();
    }

    // 2. Hover Inspection Card
    if (this.hoveredEntity) {
      const e = this.hoveredEntity;
      ctx.save();

      // Card positioning at bottom center
      const cardW = 380;
      const cardH = 96;
      const cx = (w - cardW) / 2;
      const cy = h - cardH - 85; // above footer

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = e.isPlayer ? '#fbbf24' : (e.isHuman ? '#38bdf8' : (e.isChild ? '#f43f5e' : (e.isElder ? '#cbd5e1' : (e.isHuman === false ? '#10b981' : (e.isPlayerHome ? '#fbbf24' : (e.dwellingType ? (e.isOccupied ? '#10b981' : '#38bdf8') : '#60a5fa'))))));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      if (e.isPlayer) {
        // Player Inspection Card
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`👑 You (Local Player) — O.N.E. Pioneer`, cx + 16, cy + 24);

        const profile = PlayerProfileManager.getProfile();
        const voc = e.vocation || COMMUNITY_VOCATIONS[0];
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`Vocation: ${voc.icon} ${voc.defaultName} (${voc.multiplier}x labor credit)`, cx + 16, cy + 44);

        ctx.fillStyle = profile ? '#34d399' : '#f59e0b';
        const homeTxt = profile ? `🏡 Primary Usufruct Dwelling #${profile.dwellingNumber} (Sabbatical Lock Active)` : `⚠️ No usufruct home claimed yet (Click any vacant pod or 'Claim' header!)`;
        ctx.fillText(homeTxt, cx + 16, cy + 62);
      } else if (e.isHuman) {
        // Human Peer Card
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🌐 ${e.name} — Human Pioneer (Online Mesh Peer)`, cx + 16, cy + 24);

        const voc = e.vocation || COMMUNITY_VOCATIONS[0];
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`Vocation: ${voc.icon} ${voc.defaultName} • Real Connected Participant`, cx + 16, cy + 44);

        ctx.fillStyle = '#34d399';
        ctx.fillText(`⚡ Authenticated via OpenMesh cryptographic protocol. Contributing live.`, cx + 16, cy + 62);
      } else if (e.isChild) {
        // Child Pioneer Card
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🎒 ${e.name} — Child Pioneer (Age ${e.age || 8})`, cx + 16, cy + 24);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`Forest School & Alloparenting Nursery • 0h Labor Obligation`, cx + 16, cy + 44);

        ctx.fillStyle = '#34d399';
        ctx.fillText(`Guaranteed 100% unconditional Tier 1 care under Constitutional Art. 5.3 & 5.4.`, cx + 16, cy + 62);
      } else if (e.isElder) {
        // Elder Mentor Card
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🧓 ${e.name} — Elder Mentor & Wisdom Keeper`, cx + 16, cy + 24);

        const voc = e.vocation || {};
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`${voc.defaultName || 'Senior Resident'} • Intergenerational Sanctuary`, cx + 16, cy + 44);

        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Exempt from compulsory shifts; mentors apprentices (+20% team boost).`, cx + 16, cy + 62);
      } else if (e.isHuman === false) {
        // Simulated Resident Card
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🤖 ${e.name} — Autonomous Resident (Simulated Pioneer)`, cx + 16, cy + 24);

        const voc = e.vocation || COMMUNITY_VOCATIONS[0];
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`Vocation: ${voc.icon} ${voc.defaultName} • Civic Duty Rotation`, cx + 16, cy + 44);

        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Autonomous agent maintaining thermodynamic base flows.`, cx + 16, cy + 62);
      } else if (e.dwellingType) {
        // Dwelling Card
        ctx.fillStyle = e.isPlayerHome ? '#fbbf24' : '#f8fafc';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(e.isPlayerHome ? `👑 Your Usufruct Home (#${e.number})` : `🏡 Dwelling #${e.number}: ${e.dwellingType}`, cx + 16, cy + 24);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        if (e.isOccupied) {
          const occRole = e.occupant.roleKey ? t(e.occupant.roleKey, e.occupant.role) : e.occupant.role;
          const occIcon = e.occupant.icon || '👤';
          ctx.fillText(`Occupant: ${e.occupant.name} • ${occIcon} ${occRole}`, cx + 16, cy + 44);
          ctx.fillText(`Labor: ${e.occupant.dailyHours}h/day (${e.occupant.multiplier || 1.0}x credit) • Sabbatical: Active`, cx + 16, cy + 62);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`🔑 VACANT CIVIC DWELLING — Click to Claim in Usufruct`, cx + 16, cy + 44);
          ctx.fillStyle = '#6ee7b7';
          ctx.fillText(`Free housing pool guaranteed by O.N.E. Constitution.`, cx + 16, cy + 62);
        }
      } else {
        // Infrastructure / Agora Card
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(e.name, cx + 16, cy + 24);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(e.desc || 'Operational commons facility.', cx + 16, cy + 44);
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('Click to inspect live thermodynamic flows & automation.', cx + 16, cy + 64);
      }

      ctx.restore();
    }
  }
}
