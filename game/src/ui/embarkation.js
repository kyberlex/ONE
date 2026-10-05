/**
 * O.N.E. Pioneer Embarkation Desk
 * 3-Stage Guided Onboarding & Planetary Reconnaissance:
 * Stage 1: Select Name + Craft + Look (The 3 Passports) -> Next
 * Stage 2: 3-Stop Civilizational Preview Tour (Yukon Seed -> Monte Sole Ecovillage -> Detroit Superblock) -> Next
 * Stage 3: Place Seed Node (Local Geolocation + Free Planetary Siting) -> Embark to Plot
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import L from 'leaflet';
import { gameState } from '../core/state.js';
import { WorldMapController } from '../map/world_map.js';
import { GLOBAL_STARTER_NODES, getClimateZoneFromLat, createCustomGlobalNode } from '../data/bioregions.js';
import { formatPopulation } from '../data/cities.js';
import { createAvatarCustomizer } from './avatar_customizer.js';
import { soundFX } from '../audio/sound_fx.js';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * 3-Stop Civilizational Progression Tour Datasets (Epic 1.1)
 * Enriched with surrounding major cities and module micro-coordinates for automated zoom reconnaissance.
 */
export const CIVILIZATIONAL_TOUR_STOPS = [
  {
    id: 'stop-1-seed',
    stageNumber: 1,
    stageTitle: 'STAGE 1: THE SEED CAMP (DAYS 1–7)',
    nodeName: 'Yukon Haven Seed Beacon',
    bioregion: 'Subarctic Boreal Shield',
    country: 'Canada / Alaska',
    lat: 64.8378,
    lng: -147.7164,
    zoom: 6.5,
    population: 3,
    populationLabel: '3 Founders (Van Camp)',
    debtUsd: 50000,
    debtLabel: '$50,000 Debt (Ticking Down)',
    summary: 'The humble beginning. Three pioneers living in a mobile camper van with auxiliary AGM batteries, unshaded bifacial solar panels, and emergency water cisterns while laying the thermodynamic foundation of the commons.',
    majorCities: [
      { name: 'Fairbanks', lat: 64.8378, lng: -147.7164, pop: 32500, popFormatted: '32.5k', distanceKm: 12, country: 'United States' },
      { name: 'Anchorage', lat: 61.2181, lng: -149.9003, pop: 291000, popFormatted: '291k', distanceKm: 418, country: 'United States' },
      { name: 'Whitehorse', lat: 60.7212, lng: -135.0568, pop: 25000, popFormatted: '25k', distanceKm: 785, country: 'Canada' }
    ],
    modules: [
      {
        id: 'camper-van',
        name: 'Pioneer Camper Van',
        icon: '🚐',
        role: 'Mobile Basecamp & Auxiliary Storage',
        explanation: 'Provides initial 3-person bunking shelter, 45 kWh AGM battery storage, and 850 L water reserves before permanent timber framing begins.',
        yield: 'Shelter for 3 • 45 kWh Battery Reserve • 850 L Water',
        lat: 64.8378,
        lng: -147.7164
      },
      {
        id: 'solar-array',
        name: 'Bifacial Solar Array',
        icon: '⚡',
        role: 'Southern Photovoltaic Array',
        explanation: 'Sited on unshaded southern clearing; bifacial panels capture both direct high-latitude sun and snow albedo reflections.',
        yield: '+18.5 kWh / clear day (Seasonal sun tracking)',
        lat: 64.8398,
        lng: -147.7120
      },
      {
        id: 'water-flume',
        name: 'Snow-Melt & Rain Flume',
        icon: '💧',
        role: 'Gravity-Fed Hydrological Intake',
        explanation: 'Positioned along natural elevation contour to capture gravity-fed snowmelt and precipitation without electric pumping loads.',
        yield: '+450 L / day baseline inflow (Zero pumping energy)',
        lat: 64.8355,
        lng: -147.7210
      }
    ]
  },
  {
    id: 'stop-2-ecovillage',
    stageNumber: 2,
    stageTitle: 'STAGE 2: THE ECOVILLAGE (DAYS 8–25)',
    nodeName: 'Monte Sole Ecovillage',
    bioregion: 'Apennine Deciduous Bioregion',
    country: 'Italy',
    lat: 44.3330,
    lng: 11.2000,
    zoom: 7.0,
    population: 24,
    populationLabel: '24 Residents (6 Pods)',
    debtUsd: 15000,
    debtLabel: '$15,000 Debt (Drastically Reduced)',
    summary: 'The village emerges. Permanent reciprocal timber Modular Habitat Units (MHUs) house the expanding community. A FabLab machine shop fabricates open-source parts while reed-beds purify water.',
    majorCities: [
      { name: 'Bologna', lat: 44.4949, lng: 11.3426, pop: 390000, popFormatted: '390k', distanceKm: 28, country: 'Italy' },
      { name: 'Firenze', lat: 43.7696, lng: 11.2558, pop: 360000, popFormatted: '360k', distanceKm: 63, country: 'Italy' },
      { name: 'Modena', lat: 44.6471, lng: 10.9252, pop: 185000, popFormatted: '185k', distanceKm: 42, country: 'Italy' }
    ],
    modules: [
      {
        id: 'mhu-clusters',
        name: 'Modular Habitat Units (MHUs)',
        icon: '🏡',
        role: 'Civic Usufruct Dwellings',
        explanation: 'Open-hardware reciprocal timber pods with living sedum roofs and private kitchen garden aprons; 0 rent, strictly dynamic usufruct occupancy.',
        yield: 'Shelter for 24 residents • High thermal mass • 0 Speculation',
        lat: 44.3330,
        lng: 11.2000
      },
      {
        id: 'fablab-shop',
        name: 'FabLab Machine Shop',
        icon: '⚙️',
        role: 'Open-Hardware Tooling & Robotics',
        explanation: 'Houses open-source LinuxCNC gantry mills and 3D printers, manufacturing automated FarmBots and replacement parts to extinguish manual chores.',
        yield: '-12 kWh/day power draw • +100% mechanical repair speed',
        lat: 44.3348,
        lng: 11.2038
      },
      {
        id: 'greywater-reedbed',
        name: 'Greywater Reed-Bed Basin',
        icon: '🌿',
        role: 'Biological Wetland Filtration',
        explanation: 'Constructed wetland with gravel substrates and native reeds that biologically purifies 65% of domestic greywater for crop sub-irrigation.',
        yield: '+650 L / day recycled water (65% return rate)',
        lat: 44.3312,
        lng: 11.1962
      }
    ]
  },
  {
    id: 'stop-3-superblock',
    stageNumber: 3,
    stageTitle: 'STAGE 3: SOVEREIGN SUPERBLOCK (~50 MHUs)',
    nodeName: 'Detroit Delray Sovereign Commons',
    bioregion: 'Great Lakes Basin',
    country: 'United States',
    lat: 42.3015,
    lng: -83.1098,
    zoom: 7.5,
    population: 148,
    populationLabel: '148 Citizens (Dunbar Limit)',
    debtUsd: 0,
    debtLabel: '$0 Debt (100% Sovereign & Free)',
    summary: 'Mature civilizational harmony. The camper van is retired into the Central Agora demarchy hearth. A cargo trike depot and vertiport connect into the bioregional Reticulum federation with 100% solar autonomy.',
    majorCities: [
      { name: 'Detroit', lat: 42.3314, lng: -83.0458, pop: 639000, popFormatted: '639k', distanceKm: 6, country: 'United States' },
      { name: 'Windsor', lat: 42.3149, lng: -83.0364, pop: 230000, popFormatted: '230k', distanceKm: 8, country: 'Canada' },
      { name: 'Ann Arbor', lat: 42.2808, lng: -83.7430, pop: 123000, popFormatted: '123k', distanceKm: 54, country: 'United States' }
    ],
    modules: [
      {
        id: 'central-agora',
        name: 'Central Agora Hearth',
        icon: '🏛️',
        role: 'Athenian Demarchy Assembly',
        explanation: 'Erected on the exact coordinate of the founding camper van; hosts sortition citizen juries (odd parity) to deliberate on civic questions with 75% consensus.',
        yield: 'Demarchic governance • Zero gridlock • +100 Morale',
        lat: 42.3015,
        lng: -83.1098
      },
      {
        id: 'trike-depot',
        name: 'Cargo Trike & Vertiport Hub',
        icon: '🚲',
        role: 'Zero-Emission Inter-Node Logistics',
        explanation: 'Fleet of electric cargo trikes (250 kg freight box) and autonomous VTOL drones linking autonomous sister nodes across regional greenways.',
        yield: '250 kg freight / trike • 60 km range • Zero fuel debt',
        lat: 42.3035,
        lng: -83.1062
      },
      {
        id: 'sovereign-microgrid',
        name: '100% Microgrid & LFP Banks',
        icon: '☀️',
        role: 'Autonomous Energy Abundance',
        explanation: 'Extensive bifacial solar arrays, vertical-axis wind turbines, and stationary LFP battery banks delivering continuous energy surplus with zero utility bills.',
        yield: '+420 kWh / day net surplus • Zero fossil dependence',
        lat: 42.2995,
        lng: -83.1138
      }
    ]
  }
];

/**
 * Established Bioregional Candidate Corridors (Epic 1.1)
 */
export const CANDIDATE_CORRIDORS = [
  { id: 'alps', name: '🏔️ Alps (Val di Susa)', lat: 45.1328, lng: 7.0542, country: 'Italy', seedName: 'Susa-ONE' },
  { id: 'andes', name: '🌄 Andes (Sacred Valley)', lat: -13.3100, lng: -72.0300, country: 'Peru', seedName: 'Cusco-ONE' },
  { id: 'galicia', name: '🌲 Galicia (Atlantic)', lat: 42.8782, lng: -8.5448, country: 'Spain', seedName: 'Galicia-ONE' },
  { id: 'sahel', name: '🏜️ Sahel (Niger Oasis)', lat: 13.5116, lng: 2.1254, country: 'Niger', seedName: 'Sahel-ONE' },
  { id: 'amazon', name: '🌿 Amazon (Canopy)', lat: -3.1190, lng: -60.0217, country: 'Brazil', seedName: 'Amazonas-ONE' },
  { id: 'kerala', name: '🌊 Kerala (Monsoon)', lat: 9.9312, lng: 76.2673, country: 'India', seedName: 'Kerala-ONE' }
];

/**
 * Computes estimated solar irradiance factor and annual rainfall based on latitude and climate zone
 */
export function computeBioregionalEnvironmentalFactors(lat) {
  const absLat = Math.abs(lat);
  let solarFactor = 1.0;
  let annualKwhPerM2 = 1450;
  let annualRainfallMm = 820;

  if (absLat >= 56) {
    solarFactor = 0.65;
    annualKwhPerM2 = 980;
    annualRainfallMm = 340;
  } else if (absLat >= 28 && absLat < 56) {
    solarFactor = 1.0;
    annualKwhPerM2 = 1450;
    annualRainfallMm = 820;
  } else if (absLat >= 14 && absLat < 28) {
    solarFactor = 1.45;
    annualKwhPerM2 = 2150;
    annualRainfallMm = 210;
  } else {
    solarFactor = 1.15;
    annualKwhPerM2 = 1720;
    annualRainfallMm = 1950;
  }

  return { solarFactor, annualKwhPerM2, annualRainfallMm };
}

export class EmbarkationDesk {
  constructor(containerEl, onEmbarkCallback = () => {}) {
    this.container = containerEl;
    this.onEmbark = onEmbarkCallback;

    this.currentStep = 1; // 1 = Name/Job, 2 = Recon Tour, 3 = Siting & Embark

    this.selectedVocation = gameState.data.player.vocationId || 'electrician';
    this.playerName = gameState.data.player.name || 'Alex';
    this.playerAppearance = {
      ...(gameState.data.player.appearance || {
        gender: 'M',
        hairStyle: 'fade',
        hairColor: '#1e293b',
        skinTone: '#fbb77a'
      })
    };
    this.avatarCustomizer = null;
    this.hasManuallyCustomized = false;
    this.hasAutoGeolocated = false;
    
    // Tour automated playback state
    this.currentTourStopIndex = 0;
    this.currentTourSubStep = 0;
    this.isTourPaused = false;
    this.tourTimer = null;
    this.tourModuleMarkers = [];
    this.selectedTourModule = null;
    this.tourMap = null;
    this.tourMarker = null;

    // Seed Node starting state
    this.currentLat = gameState.data.location.lat || 45.138;
    this.currentLng = gameState.data.location.lng || 7.054;
    this.seedName = gameState.data.location.name || 'Susa-ONE';
    this.selectedSeedNode = null;
    this.majorCities = [];

    this.worldMap = null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="embark-container">
        <!-- Persistent Brand Header -->
        <header class="embark-header">
          <div class="embark-logo-row">
            <span class="embark-logo-badge">O.N.E. DUAL-TRACK COMMONS</span>
            <span class="embark-step-badge" id="step-badge">STAGE 1 / 3: NAME & CRAFT</span>
          </div>
          <h1 class="embark-title" id="embark-title">PIONEER EMBARKATION DESK</h1>
          <p class="embark-subtitle" id="embark-subtitle">"Three pioneers. One seed. What is your craft?"</p>
        </header>

        <!-- STAGE 1: NAME + JOB (PASSPORTS) -->
        <div id="stage-1-passports" class="embark-form-wrap stage-panel active">
          <!-- Callsign Input Card -->
          <div class="callsign-card">
            <div class="callsign-info">
              <span class="callsign-label">Pioneer Call-Sign / Name</span>
              <span class="callsign-hint">You are one of the 3 founders traveling in the camper van.</span>
            </div>
            <div class="callsign-input-box">
              <span class="callsign-prefix">★</span>
              <input type="text" id="callsign-input" class="callsign-input" value="${this.playerName}" maxlength="24" placeholder="Your Name">
            </div>
          </div>

          <!-- 3 Passports Grid -->
          <div class="passports-grid">
            <!-- 1. The Builder -->
            <div class="passport-card ${this.selectedVocation === 'builder' ? 'selected' : ''}" data-vocation="builder">
              <div class="passport-status-tag">
                ${this.selectedVocation === 'builder' ? '★ YOUR PASSPORT ★' : 'COMPANION'}
              </div>
              <div class="passport-role-header">
                <div class="passport-icon-badge">🔨</div>
                <div class="passport-role-meta">
                  <div class="passport-role-title">The Builder</div>
                  <div class="passport-name-display" id="name-display-builder">
                    ${this.selectedVocation === 'builder' ? this.playerName : 'Maya'}
                  </div>
                  <span class="passport-craft-tagline">Timber & Structural CNC</span>
                </div>
              </div>
              <p class="passport-desc">
                Constructs rigid timber frames, installs weatherproofing, and repairs mechanical machinery when entropy strikes.
              </p>
              <div class="passport-skills-list">
                <span class="skill-pill">+40% Framing Speed</span>
                <span class="skill-pill">Machinery Repair</span>
                <span class="skill-pill">Workshop CNC</span>
              </div>
            </div>

            <!-- 2. The Electrician -->
            <div class="passport-card ${this.selectedVocation === 'electrician' ? 'selected' : ''}" data-vocation="electrician">
              <div class="passport-status-tag">
                ${this.selectedVocation === 'electrician' ? '★ YOUR PASSPORT ★' : 'COMPANION'}
              </div>
              <div class="passport-role-header">
                <div class="passport-icon-badge">⚡</div>
                <div class="passport-role-meta">
                  <div class="passport-role-title">The Electrician</div>
                  <div class="passport-name-display" id="name-display-electrician">
                    ${this.selectedVocation === 'electrician' ? this.playerName : 'Alex'}
                  </div>
                  <span class="passport-craft-tagline">Solar & DC Microgrids</span>
                </div>
              </div>
              <p class="passport-desc">
                Wired for resilience: mounts photovoltaic panels, tunes battery charge controllers, and keeps lights and pumps running.
              </p>
              <div class="passport-skills-list">
                <span class="skill-pill">+35% Solar Efficiency</span>
                <span class="skill-pill">Battery Balancing</span>
                <span class="skill-pill">LoRa Antenna</span>
              </div>
            </div>

            <!-- 3. The Gardener -->
            <div class="passport-card ${this.selectedVocation === 'gardener' ? 'selected' : ''}" data-vocation="gardener">
              <div class="passport-status-tag">
                ${this.selectedVocation === 'gardener' ? '★ YOUR PASSPORT ★' : 'COMPANION'}
              </div>
              <div class="passport-role-header">
                <div class="passport-icon-badge">🥗</div>
                <div class="passport-role-meta">
                  <div class="passport-role-title">The Gardener</div>
                  <div class="passport-name-display" id="name-display-gardener">
                    ${this.selectedVocation === 'gardener' ? this.playerName : 'Leo'}
                  </div>
                  <span class="passport-craft-tagline">Soil & Rainwater Cycles</span>
                </div>
              </div>
              <p class="passport-desc">
                Roots of life: creates fertile compost, connects biological reed-bed water filters, and grows fresh greens for 2,200 kcal/day.
              </p>
              <div class="passport-skills-list">
                <span class="skill-pill">+50% Crop Yield</span>
                <span class="skill-pill">Greywater Reed-Bed</span>
                <span class="skill-pill">Living Seedbank</span>
              </div>
            </div>
          </div>

          <!-- Avatar Look Customizer Toggle Row -->
          <div class="avatar-customizer-toggle-row">
            <button type="button" id="btn-toggle-avatar-studio" class="btn-avatar-edit-chip">
              <span>🎨 Customize Look (3D Studio, Hairstyle & Biocultural Tones)</span>
              <span id="studio-toggle-arrow">▼</span>
            </button>
          </div>
          <div id="pioneer-avatar-studio-drawer" class="avatar-drawer-box hidden">
            <div id="stage1-avatar-customizer-slot"></div>
          </div>

          <!-- Stage 1 Action Bar -->
          <div class="embark-action-bar">
            <button id="btn-step1-next" class="btn-embark-cta">
              <span>Next: Planetary Reconnaissance Tour</span>
              <span>➔</span>
            </button>
            <p class="embark-footnote">
              Selected: <strong style="color: #fbbf24;">${this.playerName}</strong> (<span id="footnote-role">${this.selectedVocation.toUpperCase()}</span>). Next, witness the 3 stages of O.N.E. progression.
            </p>
          </div>
        </div>

        <!-- STAGE 2: 3-STOP CIVILIZATIONAL PREVIEW TOUR (EPIC 1.1) -->
        <div id="stage-2-tour" class="embark-form-wrap stage-panel hidden">
          <div class="tour-container-card">
            <!-- Map Viewport -->
            <div class="tour-map-viewport">
              <div id="world-leaflet-tour-map" style="width: 100%; height: 100%;"></div>
              
              <!-- Tour Automated Playback Ribbon -->
              <div class="tour-playback-ribbon" id="tour-playback-ribbon">
                <div class="tour-status-pill">
                  <span class="pulse-dot"></span>
                  <span id="tour-step-counter">STOP 1 / 3 • INITIATING</span>
                </div>
                <div class="tour-ticker-text" id="tour-ticker">
                  Initializing Planetary Reconnaissance...
                </div>
                <div class="tour-controls-group">
                  <button type="button" id="btn-tour-pause" class="btn-tour-ctrl" title="Pause or Resume Tour">
                    <span id="tour-pause-icon">⏸️</span>
                    <span id="tour-pause-label">Pause</span>
                  </button>
                  <button type="button" id="btn-tour-skip-substep" class="btn-tour-ctrl" title="Advance to next step">
                    <span>⏭️ Next Step</span>
                  </button>
                  <button type="button" id="btn-tour-next-node" class="btn-tour-ctrl" title="Skip to next stage">
                    <span>⏩ Next Stage</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tour Console Panel -->
            <div class="tour-console-panel" id="tour-console-panel">
              <!-- Dynamically populated via renderTourConsole() -->
            </div>
          </div>

          <!-- Tour Persistent Skip / Quick Action -->
          <div class="stage-nav-row" style="margin-top: 8px;">
            <button id="btn-tour-back" class="btn-secondary-back">
              <span>↩ Back to Craft</span>
            </button>
            <button id="btn-tour-skip-direct" class="btn-tour-skip">
              <span>Skip Tour & Plant My Seed ➔</span>
            </button>
          </div>
        </div>

        <!-- STAGE 3: PLACE SEED NODE (MAP SCREEN) -->
        <div id="stage-3-map" class="embark-form-wrap stage-panel hidden">
          <div class="location-card full-map-card">
            <div class="location-header">
              <div class="location-title-box">
                <div class="location-title">
                  <span>🌍 Place Your Seed Node</span>
                </div>
                <p class="location-subtitle">
                  Auto-centering on your home watershed. Tap <strong>"Nearby"</strong> for browser GPS, pick a <strong>Candidate Corridor</strong>, or <strong>click anywhere freely</strong>.
                </p>
              </div>
              <div class="seed-name-box">
                <span style="font-family: var(--font-mono); font-size: 13px; color: var(--emerald);">🌱</span>
                <input type="text" id="seed-name-input" class="seed-name-input" value="${this.seedName}" maxlength="32" placeholder="Name your seed...">
              </div>
            </div>

            <!-- Candidate Corridors Quick-Select Bar -->
            <div class="candidate-beacons-row">
              <span class="candidate-beacons-label">🌿 Candidate Corridors:</span>
              <div class="candidate-beacons-chips">
                ${CANDIDATE_CORRIDORS.map(c => `
                  <button type="button" class="btn-candidate-chip" data-corridor-id="${c.id}">
                    ${c.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- The Authentic O-ASIS Map Viewport -->
            <div class="regional-map-container" style="height: 360px;">
              <div id="world-leaflet-map"></div>
              <div class="map-controls-floating">
                <button type="button" id="btn-map-gps" class="btn-map-action btn-action-nearby" title="Use browser GPS location">
                  <span>📍 Nearby</span>
                </button>
                <button type="button" id="btn-map-pick" class="btn-map-action" title="Click anywhere on the map to place your seed">
                  <span>🗺️ Pick on Map</span>
                </button>
                <button type="button" id="btn-map-world" class="btn-map-action" title="Zoom out to whole planet">
                  <span>🌍 World</span>
                </button>
              </div>
            </div>

            <!-- Bioregional Telemetry Bar (Rich Environmental Calculations) -->
            <div class="bioregion-telemetry-bar">
              <div class="telemetry-badges-row">
                <div class="telemetry-badge badge-coords" id="telemetry-coords">
                  📍 Site: ${this.currentLat.toFixed(3)}°, ${this.currentLng.toFixed(3)}°
                </div>
                <div class="telemetry-badge badge-climate" id="telemetry-climate">
                  🌿 Bioregion: Calculating...
                </div>
                <div class="telemetry-badge badge-solar" id="telemetry-solar">
                  ☀️ Solar: 1.00x (1,450 kWh/m²/yr)
                </div>
                <div class="telemetry-badge badge-rain" id="telemetry-rain">
                  🌧️ Rain: ~820 mm/yr
                </div>
                <div class="telemetry-badge badge-hubs" id="telemetry-hubs">
                  🏙️ Hubs: Calculating regional network...
                </div>
              </div>
              <span class="telemetry-hint" id="telemetry-hint">Auto-centering on your home watershed. Click anywhere on Earth to plant your seed!</span>
            </div>
          </div>

          <!-- Stage 3 Action Bar -->
          <div class="embark-action-bar stage-nav-row">
            <button id="btn-step3-back" class="btn-secondary-back">
              <span>↩ Back to Tour</span>
            </button>
            <button id="btn-step3-embark" class="btn-embark-cta">
              <span>Next: Embark to Plot</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Callsign live update
    const nameInput = this.container.querySelector('#callsign-input');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.playerName = e.target.value.trim() || 'Alex';
        this.updateCardNames();
      });
    }

    // Passport selection
    const cards = this.container.querySelectorAll('.passport-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const vocation = card.dataset.vocation;
        this.selectVocation(vocation);
      });
    });

    // Seed name input
    const seedInput = this.container.querySelector('#seed-name-input');
    if (seedInput) {
      seedInput.addEventListener('input', (e) => {
        this.seedName = e.target.value.trim() || 'Home Seed';
        if (this.selectedSeedNode) {
          this.selectedSeedNode.name = this.seedName;
        }
      });
    }

    // Avatar Look Customizer Toggle
    const toggleStudioBtn = this.container.querySelector('#btn-toggle-avatar-studio');
    const studioDrawer = this.container.querySelector('#pioneer-avatar-studio-drawer');
    const studioArrow = this.container.querySelector('#studio-toggle-arrow');

    if (toggleStudioBtn && studioDrawer) {
      toggleStudioBtn.addEventListener('click', () => {
        const isHidden = studioDrawer.classList.contains('hidden');
        if (isHidden) {
          studioDrawer.classList.remove('hidden');
          if (studioArrow) studioArrow.textContent = '▲';
          if (!this.avatarCustomizer) {
            const slot = this.container.querySelector('#stage1-avatar-customizer-slot');
            this.avatarCustomizer = createAvatarCustomizer(
              slot,
              this.playerAppearance,
              (updated) => {
                this.playerAppearance = { ...updated };
                this.hasManuallyCustomized = true;
              }
            );
          }
        } else {
          studioDrawer.classList.add('hidden');
          if (studioArrow) studioArrow.textContent = '▼';
          if (this.avatarCustomizer) {
            this.avatarCustomizer.destroy();
            this.avatarCustomizer = null;
          }
        }
      });
    }

    // Step 1 -> Step 2 (Tour)
    const step1Next = this.container.querySelector('#btn-step1-next');
    if (step1Next) {
      step1Next.addEventListener('click', () => {
        this.goToStep(2);
      });
    }

    // Tour Navigation & Automated Playback Controls (Step 2)
    const tourBackBtn = this.container.querySelector('#btn-tour-back');
    if (tourBackBtn) {
      tourBackBtn.addEventListener('click', () => {
        this.goToStep(1);
      });
    }

    const tourSkipDirect = this.container.querySelector('#btn-tour-skip-direct');
    if (tourSkipDirect) {
      tourSkipDirect.addEventListener('click', () => {
        this.goToStep(3);
      });
    }

    const tourPauseBtn = this.container.querySelector('#btn-tour-pause');
    if (tourPauseBtn) {
      tourPauseBtn.addEventListener('click', () => {
        this.toggleTourPause();
      });
    }

    const tourSkipSubStepBtn = this.container.querySelector('#btn-tour-skip-substep');
    if (tourSkipSubStepBtn) {
      tourSkipSubStepBtn.addEventListener('click', () => {
        this.skipTourSubStep();
      });
    }

    const tourNextNodeBtn = this.container.querySelector('#btn-tour-next-node');
    if (tourNextNodeBtn) {
      tourNextNodeBtn.addEventListener('click', () => {
        this.skipToNextTourStop();
      });
    }

    // Step 3 Back -> Step 2 (Tour)
    const step3Back = this.container.querySelector('#btn-step3-back');
    if (step3Back) {
      step3Back.addEventListener('click', () => {
        this.goToStep(2);
      });
    }

    // Step 3 -> Embark to Plot
    const step3Embark = this.container.querySelector('#btn-step3-embark');
    if (step3Embark) {
      step3Embark.addEventListener('click', () => {
        this.startCinematicZoomAndEmbark();
      });
    }

    // Candidate Corridors Quick-Select (Epic 1.1)
    this.container.querySelectorAll('.btn-candidate-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const corridorId = btn.dataset.corridorId;
        const corridor = CANDIDATE_CORRIDORS.find(c => c.id === corridorId);
        if (corridor) {
          this.container.querySelectorAll('.btn-candidate-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          this.currentLat = corridor.lat;
          this.currentLng = corridor.lng;
          this.seedName = corridor.seedName;
          const seedInput = this.container.querySelector('#seed-name-input');
          if (seedInput) seedInput.value = this.seedName;

          const hintEl = this.container.querySelector('#telemetry-hint');
          if (hintEl) {
            hintEl.textContent = `🌿 Selected candidate corridor: "${corridor.name}". Telemetry & regional hubs updated!`;
            hintEl.style.color = '#10b981';
          }

          if (this.worldMap && this.worldMap.map) {
            this.worldMap.map.flyTo([corridor.lat, corridor.lng], 7.0, { duration: 1.2 });
            this.worldMap.resolveLocation(corridor.lat, corridor.lng, true).then(res => {
              this.majorCities = res?.majorCities || [];
              this.updateTelemetry({ lat: corridor.lat, lng: corridor.lng, name: this.seedName }, this.majorCities);
            });
          }
        }
      });
    });
  }

  renderTourConsole(highlightSynoptic = false) {
    const consolePanel = this.container.querySelector('#tour-console-panel');
    if (!consolePanel) return;

    const stop = CIVILIZATIONAL_TOUR_STOPS[this.currentTourStopIndex];
    if (!this.selectedTourModule || !stop.modules.some(m => m.id === this.selectedTourModule.id)) {
      this.selectedTourModule = stop.modules[0];
    }

    const isDebtFree = stop.debtUsd === 0;

    consolePanel.innerHTML = `
      <div class="tour-header-row ${highlightSynoptic ? 'highlight-glow' : ''}">
        <div class="tour-node-title-box">
          <div class="tour-node-name">
            <span>${stop.nodeName}</span>
          </div>
          <span class="tour-node-bioregion">🌿 ${stop.bioregion} (${stop.country})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="tour-stage-tag">${stop.stageTitle}</span>
          <span class="tour-debt-tag ${isDebtFree ? 'zero-debt' : ''}">${stop.debtLabel}</span>
        </div>
      </div>

      <div class="tour-metrics-strip ${highlightSynoptic ? 'highlight-glow' : ''}">
        <div class="metric-item">
          <span>👥</span>
          <strong>${stop.populationLabel}</strong>
        </div>
        <div class="metric-item">
          <span>⚡</span>
          <strong>${this.currentTourStopIndex === 0 ? '45 kWh Reserve' : this.currentTourStopIndex === 1 ? '120 kWh / day' : '420 kWh Surplus'}</strong>
        </div>
        <div class="metric-item">
          <span>💧</span>
          <strong>${this.currentTourStopIndex === 0 ? '850 L Tanks' : this.currentTourStopIndex === 1 ? '+650 L Recycled' : 'Closed Loop'}</strong>
        </div>
        <div class="metric-item">
          <span>🛡️</span>
          <strong>${isDebtFree ? '100% Post-Scarcity Commons' : 'Transition Trajectory'}</strong>
        </div>
      </div>

      <p class="tour-summary-p">${stop.summary}</p>

      <!-- Interactive Synoptic Module Inspection -->
      <div class="tour-modules-section">
        <div class="tour-modules-label">
          <span>📐 Featured Modules (${stop.modules.length} Critical Systems):</span>
        </div>
        <div class="tour-modules-chips-row">
          ${stop.modules.map(mod => `
            <button type="button" class="tour-module-chip ${this.selectedTourModule.id === mod.id ? 'active' : ''}" data-mod-id="${mod.id}">
              <span>${mod.icon}</span>
              <span>${mod.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- 1-Sentence Micro-Tooltip Display -->
        <div class="tour-module-tooltip-box">
          <div class="tour-tooltip-title-row">
            <span class="tour-tooltip-name">${this.selectedTourModule.icon} ${this.selectedTourModule.name}</span>
            <span class="tour-tooltip-role">${this.selectedTourModule.role}</span>
          </div>
          <p class="tour-tooltip-explanation">"${this.selectedTourModule.explanation}"</p>
          <div class="tour-tooltip-yield">
            ⚡ Thermodynamic Yield: <strong>${this.selectedTourModule.yield}</strong>
          </div>
        </div>
      </div>

      <!-- Tour Navigation Controls -->
      <div class="tour-nav-controls-row">
        <div class="tour-nav-group-left">
          <button type="button" id="btn-tour-prev-stop" class="btn-tour-step" ${this.currentTourStopIndex === 0 ? 'disabled' : ''}>
            <span>◀ Previous Stage</span>
          </button>
        </div>
        <div class="tour-nav-group-right">
          ${this.currentTourStopIndex < 2 ? `
            <button type="button" id="btn-tour-next-stop" class="btn-tour-primary-next">
              <span>Next Stage: ${CIVILIZATIONAL_TOUR_STOPS[this.currentTourStopIndex + 1].stageTitle.split(':')[1]?.trim() || 'Next'} ▶</span>
            </button>
          ` : `
            <button type="button" id="btn-tour-finish-siting" class="btn-tour-primary-next" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <span>Plant My Seed Node ➔</span>
            </button>
          `}
        </div>
      </div>
    `;

    // Attach module click events
    consolePanel.querySelectorAll('.tour-module-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.dataset.modId;
        const foundIdx = stop.modules.findIndex(m => m.id === modId);
        if (foundIdx !== -1) {
          this.selectedTourModule = stop.modules[foundIdx];
          this.renderTourConsole(false);
          if (this.tourMap && this.tourMap.map) {
            this.tourMap.map.flyTo([this.selectedTourModule.lat, this.selectedTourModule.lng], 10.8, { duration: 1.0 });
            this.renderTourModuleMarkers(stop, foundIdx);
          }
        }
      });
    });

    // Prev / Next button bindings
    const prevBtn = consolePanel.querySelector('#btn-tour-prev-stop');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentTourStopIndex > 0) {
          this.startAutomatedTour(this.currentTourStopIndex - 1);
        }
      });
    }

    const nextBtn = consolePanel.querySelector('#btn-tour-next-stop');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentTourStopIndex < 2) {
          this.startAutomatedTour(this.currentTourStopIndex + 1);
        }
      });
    }

    const finishBtn = consolePanel.querySelector('#btn-tour-finish-siting');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.goToStep(3);
      });
    }
  }

  startAutomatedTour(stopIndex = 0) {
    this.stopAutomatedTour();
    this.currentTourStopIndex = Math.max(0, Math.min(2, stopIndex));
    this.currentTourSubStep = 0;
    this.isTourPaused = false;
    this.updateTourPauseUI();

    this.executeTourSubStep(0);
  }

  stopAutomatedTour() {
    if (this.tourTimer) {
      clearTimeout(this.tourTimer);
      this.tourTimer = null;
    }
    this.clearTourModuleMarkers();
  }

  toggleTourPause() {
    this.isTourPaused = !this.isTourPaused;
    this.updateTourPauseUI();

    if (this.isTourPaused) {
      if (this.tourTimer) {
        clearTimeout(this.tourTimer);
        this.tourTimer = null;
      }
      const ticker = this.container.querySelector('#tour-ticker');
      if (ticker) {
        ticker.innerHTML = `⏸️ <strong style="color: #fbbf24;">TOUR PAUSED</strong> • Inspect at your own pace or press Resume ▶️`;
      }
    } else {
      this.executeTourSubStep(this.currentTourSubStep + 1);
    }
  }

  updateTourPauseUI() {
    const pauseBtn = this.container.querySelector('#btn-tour-pause');
    const pauseIcon = this.container.querySelector('#tour-pause-icon');
    const pauseLabel = this.container.querySelector('#tour-pause-label');
    if (!pauseBtn) return;

    if (this.isTourPaused) {
      pauseBtn.classList.add('active-paused');
      if (pauseIcon) pauseIcon.textContent = '▶️';
      if (pauseLabel) pauseLabel.textContent = 'Resume';
    } else {
      pauseBtn.classList.remove('active-paused');
      if (pauseIcon) pauseIcon.textContent = '⏸️';
      if (pauseLabel) pauseLabel.textContent = 'Pause';
    }
  }

  skipTourSubStep() {
    if (this.tourTimer) {
      clearTimeout(this.tourTimer);
      this.tourTimer = null;
    }
    this.isTourPaused = false;
    this.updateTourPauseUI();
    this.executeTourSubStep(this.currentTourSubStep + 1);
  }

  skipToNextTourStop() {
    if (this.tourTimer) {
      clearTimeout(this.tourTimer);
      this.tourTimer = null;
    }
    this.isTourPaused = false;
    this.updateTourPauseUI();
    if (this.currentTourStopIndex < 2) {
      this.startAutomatedTour(this.currentTourStopIndex + 1);
    } else {
      this.goToStep(3);
    }
  }

  renderTourModuleMarkers(stop, activeModIndex = -1) {
    this.clearTourModuleMarkers();
    if (!this.tourMap || !this.tourMap.map) return;

    stop.modules.forEach((mod, idx) => {
      const isActive = idx === activeModIndex;
      const icon = L.divIcon({
        className: 'tour-module-map-marker',
        html: `
          <div class="tour-module-pin-badge ${isActive ? 'active' : ''}">
            <span>${mod.icon}</span>
          </div>
          <div class="tour-module-pin-label">${mod.name}</div>
        `,
        iconSize: [110, 56],
        iconAnchor: [55, 28]
      });

      const m = L.marker([mod.lat, mod.lng], { icon, zIndexOffset: isActive ? 600 : 200 }).addTo(this.tourMap.map);
      this.tourModuleMarkers.push(m);
    });
  }

  clearTourModuleMarkers() {
    if (this.tourModuleMarkers) {
      this.tourModuleMarkers.forEach(m => {
        if (this.tourMap && this.tourMap.map) {
          this.tourMap.map.removeLayer(m);
        }
      });
    }
    this.tourModuleMarkers = [];
  }

  executeTourSubStep(subStep) {
    if (!this.tourMap || !this.tourMap.map) return;
    if (this.tourTimer) {
      clearTimeout(this.tourTimer);
      this.tourTimer = null;
    }

    const stop = CIVILIZATIONAL_TOUR_STOPS[this.currentTourStopIndex];
    if (!stop) return;

    this.currentTourSubStep = subStep;
    const counterEl = this.container.querySelector('#tour-step-counter');
    const tickerEl = this.container.querySelector('#tour-ticker');

    const scheduleNext = (delayMs) => {
      if (this.isTourPaused) return;
      this.tourTimer = setTimeout(() => {
        this.executeTourSubStep(subStep + 1);
      }, delayMs);
    };

    if (soundFX && soundFX.playClick) {
      soundFX.playClick();
    }

    switch (subStep) {
      case 0: {
        // 0. Present World Map
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • WORLD OVERVIEW`;
        if (tickerEl) tickerEl.textContent = `🌍 Planetary Cartography: Locating Stop ${this.currentTourStopIndex + 1} of 3 (${stop.nodeName})...`;

        this.clearTourModuleMarkers();
        if (this.tourMap.regionalCitiesLayer) this.tourMap.regionalCitiesLayer.clearLayers();
        if (this.tourMarker) {
          this.tourMarker.remove();
          this.tourMarker = null;
        }

        this.tourMap.map.flyTo([25, 0], 2.8, { duration: 1.5 });
        this.renderTourConsole(false);
        scheduleNext(3200);
        break;
      }

      case 1: {
        // 1. Zoom in to region, give time to understand where we are (read big cities next to node)
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • REGIONAL WATERSHED`;
        const cityNames = (stop.majorCities || []).map(c => c.name).join(', ');
        if (tickerEl) tickerEl.innerHTML = `📍 Zooming to <strong style="color: #fbbf24;">${stop.bioregion}</strong> (${stop.country}) • Major Hubs: <strong style="color: #38bdf8;">${cityNames}</strong>`;

        this.tourMap.map.flyTo([stop.lat, stop.lng], 5.8, { duration: 1.6 });

        if (stop.majorCities && stop.majorCities.length > 0) {
          this.tourMap.renderRegionalCities(stop.majorCities);
        }

        scheduleNext(4500);
        break;
      }

      case 2: {
        // 2. Show node synoptic, give time to read
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • SYNOPTIC CARD`;
        if (tickerEl) tickerEl.innerHTML = `📋 Synoptic: <strong style="color: #10b981;">${stop.nodeName}</strong> • ${stop.populationLabel} • ${stop.debtLabel}`;

        this.tourMap.map.flyTo([stop.lat, stop.lng], 6.5, { duration: 1.2 });

        if (this.tourMarker) this.tourMarker.remove();
        this.tourMarker = L.circleMarker([stop.lat, stop.lng], {
          radius: 16,
          fillColor: this.currentTourStopIndex === 2 ? '#10b981' : this.currentTourStopIndex === 1 ? '#38bdf8' : '#fbbf24',
          fillOpacity: 0.9,
          color: '#ffffff',
          weight: 3
        }).addTo(this.tourMap.map);

        this.selectedTourModule = stop.modules[0];
        this.renderTourConsole(true);
        scheduleNext(4500);
        break;
      }

      case 3: {
        // 3. Zoom in to the node, give time to understand what's shown, highlight 1st module we'll inspect
        const mod1 = stop.modules[0];
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • NODE PERIMETER`;
        if (tickerEl) tickerEl.innerHTML = `🔭 Settlement Layout: Next inspecting Module 1: <strong style="color: #fbbf24;">${mod1.icon} ${mod1.name}</strong>`;

        this.tourMap.map.flyTo([stop.lat, stop.lng], 8.8, { duration: 1.3 });
        this.renderTourModuleMarkers(stop, 0);
        this.selectedTourModule = mod1;
        this.renderTourConsole(false);

        scheduleNext(3400);
        break;
      }

      case 4: {
        // 4. Zoom into 1st module, give some time to understand what's shown
        const mod1 = stop.modules[0];
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • MODULE 1 INSPECTION`;
        if (tickerEl) tickerEl.innerHTML = `🔍 Module 1 Focus: <strong style="color: #fbbf24;">${mod1.name}</strong> (${mod1.role}) • Yield: <strong>${mod1.yield}</strong>`;

        this.tourMap.map.flyTo([mod1.lat, mod1.lng], 10.8, { duration: 1.4 });
        this.renderTourModuleMarkers(stop, 0);
        this.selectedTourModule = mod1;
        this.renderTourConsole(false);

        scheduleNext(5200);
        break;
      }

      case 5: {
        // 5. Zoom back to node, highlight 2nd module we'll inspect
        const mod2 = stop.modules[1];
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • NODE PERIMETER`;
        if (tickerEl) tickerEl.innerHTML = `🔭 Returning to Settlement: Next inspecting Module 2: <strong style="color: #fbbf24;">${mod2.icon} ${mod2.name}</strong>`;

        this.tourMap.map.flyTo([stop.lat, stop.lng], 8.8, { duration: 1.3 });
        this.renderTourModuleMarkers(stop, 1);
        this.selectedTourModule = mod2;
        this.renderTourConsole(false);

        scheduleNext(3400);
        break;
      }

      case 6: {
        // 6. Zoom into 2nd module, give some time to understand what's shown
        const mod2 = stop.modules[1];
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • MODULE 2 INSPECTION`;
        if (tickerEl) tickerEl.innerHTML = `🔍 Module 2 Focus: <strong style="color: #fbbf24;">${mod2.name}</strong> (${mod2.role}) • Yield: <strong>${mod2.yield}</strong>`;

        this.tourMap.map.flyTo([mod2.lat, mod2.lng], 10.8, { duration: 1.4 });
        this.renderTourModuleMarkers(stop, 1);
        this.selectedTourModule = mod2;
        this.renderTourConsole(false);

        scheduleNext(5200);
        break;
      }

      case 7: {
        // 7. Zoom back to node, highlight 3rd module we'll inspect
        const mod3 = stop.modules[2];
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • NODE PERIMETER`;
        if (tickerEl) tickerEl.innerHTML = `🔭 Returning to Settlement: Next inspecting Module 3: <strong style="color: #fbbf24;">${mod3.icon} ${mod3.name}</strong>`;

        this.tourMap.map.flyTo([stop.lat, stop.lng], 8.8, { duration: 1.3 });
        this.renderTourModuleMarkers(stop, 2);
        this.selectedTourModule = mod3;
        this.renderTourConsole(false);

        scheduleNext(3400);
        break;
      }

      case 8: {
        // 8. Zoom into 3rd module, give some time to understand what's shown
        const mod3 = stop.modules[2];
        if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} / 3 • MODULE 3 INSPECTION`;
        if (tickerEl) tickerEl.innerHTML = `🔍 Module 3 Focus: <strong style="color: #fbbf24;">${mod3.name}</strong> (${mod3.role}) • Yield: <strong>${mod3.yield}</strong>`;

        this.tourMap.map.flyTo([mod3.lat, mod3.lng], 10.8, { duration: 1.4 });
        this.renderTourModuleMarkers(stop, 2);
        this.selectedTourModule = mod3;
        this.renderTourConsole(false);

        scheduleNext(5200);
        break;
      }

      case 9: {
        // 9. Repeat above for other nodes or finish!
        if (this.currentTourStopIndex < 2) {
          if (counterEl) counterEl.textContent = `STOP ${this.currentTourStopIndex + 1} COMPLETE`;
          if (tickerEl) tickerEl.innerHTML = `✅ Stage ${this.currentTourStopIndex + 1} Reconnaissance Complete • Transitioning to Stage ${this.currentTourStopIndex + 2}...`;

          setTimeout(() => {
            this.currentTourStopIndex++;
            this.startAutomatedTour(this.currentTourStopIndex);
          }, 1800);
        } else {
          if (counterEl) counterEl.textContent = `TOUR COMPLETE`;
          if (tickerEl) tickerEl.innerHTML = `🎉 Planetary Reconnaissance Completed! All 3 Evolutionary Epochs Witnessed.`;

          const finishBtn = this.container.querySelector('#btn-tour-finish-siting');
          if (finishBtn) {
            finishBtn.classList.add('pulse-glow');
          }
        }
        break;
      }

      default:
        break;
    }
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    const stage1 = this.container.querySelector('#stage-1-passports');
    const stage2 = this.container.querySelector('#stage-2-tour');
    const stage3 = this.container.querySelector('#stage-3-map');
    const titleEl = this.container.querySelector('#embark-title');
    const subtitleEl = this.container.querySelector('#embark-subtitle');
    const badgeEl = this.container.querySelector('#step-badge');

    // Clean up 3D customizer when leaving stage 1
    if (this.avatarCustomizer && stepNumber !== 1) {
      this.avatarCustomizer.destroy();
      this.avatarCustomizer = null;
      const studioDrawer = this.container.querySelector('#pioneer-avatar-studio-drawer');
      const studioArrow = this.container.querySelector('#studio-toggle-arrow');
      if (studioDrawer) studioDrawer.classList.add('hidden');
      if (studioArrow) studioArrow.textContent = '▼';
    }

    // Stop automated tour timers whenever leaving stage 2
    if (stepNumber !== 2) {
      this.stopAutomatedTour();
    }

    if (stepNumber === 1) {
      stage2.classList.add('hidden');
      stage2.classList.remove('active');
      stage3.classList.add('hidden');
      stage3.classList.remove('active');
      stage1.classList.remove('hidden');
      stage1.classList.add('active');

      titleEl.textContent = 'PIONEER EMBARKATION DESK';
      subtitleEl.textContent = '"Three pioneers. One seed. What is your craft?"';
      badgeEl.textContent = 'STAGE 1 / 3: NAME & CRAFT';
    } else if (stepNumber === 2) {
      // Step 2: Reconnaissance Tour
      stage1.classList.add('hidden');
      stage1.classList.remove('active');
      stage3.classList.add('hidden');
      stage3.classList.remove('active');
      stage2.classList.remove('hidden');
      stage2.classList.add('active');

      titleEl.textContent = 'PLANETARY RECONNAISSANCE TOUR';
      subtitleEl.textContent = 'Witness the three evolutionary epochs of an Open Networked Earth settlement.';
      badgeEl.textContent = 'STAGE 2 / 3: CIVILIZATIONAL PROGRESSION';

      this.renderTourConsole();

      setTimeout(() => {
        if (!this.tourMap) {
          this.tourMap = new WorldMapController('world-leaflet-tour-map', () => {}, () => {}, null, null, { isTourMap: true });
          this.tourMap.updateSolarTerminator(12, 80);
        }
        if (this.tourMap && this.tourMap.map) {
          this.tourMap.map.invalidateSize();
          this.startAutomatedTour(0);
        }
      }, 100);

    } else if (stepNumber === 3) {
      // Step 3: Place Seed Node
      stage1.classList.add('hidden');
      stage1.classList.remove('active');
      stage2.classList.add('hidden');
      stage2.classList.remove('active');
      stage3.classList.remove('hidden');
      stage3.classList.add('active');

      titleEl.textContent = 'PLACE YOUR SEED NODE';
      subtitleEl.textContent = `Pioneer ${this.playerName}, where will you plant the seed of O.N.E.?`;
      badgeEl.textContent = 'STAGE 3 / 3: SEED LOCATION';

      setTimeout(() => {
        if (!this.worldMap) {
          this.initSitingMapController();
        } else if (this.worldMap.map) {
          this.worldMap.map.invalidateSize();
          this.worldMap.showRegion(
            this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng },
            false
          );
        }
        // Auto-geolocation with privacy-first Mediterranean fallback (Epic 1.1)
        this.autoGeolocateOnEntrance();
      }, 80);
    }
  }

  autoGeolocateOnEntrance() {
    if (this.hasAutoGeolocated) return;
    this.hasAutoGeolocated = true;

    const hintEl = this.container.querySelector('#telemetry-hint');
    if (hintEl) {
      hintEl.textContent = '📍 Auto-centering on your home watershed (Privacy-first fallback to Mediterranean)...';
      hintEl.style.color = '#38bdf8';
    }

    if (this.worldMap) {
      this.worldMap.locateUser(
        (data) => {
          this.currentLat = data.lat;
          this.currentLng = data.lng;
          this.seedName = data.nodeName;
          this.majorCities = data.majorCities || [];

          const seedNode = createCustomGlobalNode({
            name: this.seedName,
            lat: data.lat,
            lng: data.lng
          });
          this.selectedSeedNode = seedNode;

          const seedInput = this.container.querySelector('#seed-name-input');
          if (seedInput) seedInput.value = this.seedName;

          this.updateTelemetry(seedNode, this.majorCities);
          if (hintEl) {
            hintEl.textContent = `✅ Located near ${data.rawTown || 'town'}! Auto-sited as "${this.seedName}". Click anywhere to adjust.`;
            hintEl.style.color = '#10b981';
          }
        },
        (fallbackData) => {
          // Privacy-First Fallback: Smooth default without popups or alerts
          if (hintEl) {
            hintEl.textContent = `📍 Privacy mode active: Centered on Mediterranean candidate corridor [${this.currentLat.toFixed(2)}°, ${this.currentLng.toFixed(2)}°]. Pick anywhere freely!`;
            hintEl.style.color = '#10b981';
          }
          if (fallbackData && fallbackData.nodeName) {
            this.currentLat = fallbackData.lat;
            this.currentLng = fallbackData.lng;
            this.seedName = fallbackData.nodeName;
            this.majorCities = fallbackData.majorCities || [];
            this.updateTelemetry({ lat: fallbackData.lat, lng: fallbackData.lng, name: this.seedName }, this.majorCities);
          }
        }
      );
    }
  }

  initSitingMapController() {
    const mapEl = document.getElementById('world-leaflet-map');
    if (!mapEl || this.worldMap) return;

    this.worldMap = new WorldMapController(
      'world-leaflet-map',
      (selectedNode) => {
        // User clicked an existing node
        this.selectedSeedNode = selectedNode;
        this.currentLat = selectedNode.lat;
        this.currentLng = selectedNode.lng;
        this.seedName = selectedNode.name;
        const seedInput = this.container.querySelector('#seed-name-input');
        if (seedInput) seedInput.value = this.seedName;
        this.worldMap.resolveLocation(selectedNode.lat, selectedNode.lng, false).then(res => {
          this.majorCities = res?.majorCities || [];
          this.updateTelemetry(selectedNode, this.majorCities);
        });
      },
      (foundedNode) => {
        // User clicked unpopulated land and planted a new beacon
        console.log('🌱 [EmbarkationDesk] Custom seed node placed:', foundedNode);
        this.selectedSeedNode = foundedNode;
        this.currentLat = foundedNode.lat;
        this.currentLng = foundedNode.lng;
        this.seedName = foundedNode.name;
        this.majorCities = foundedNode.majorCities || [];
        const seedInput = this.container.querySelector('#seed-name-input');
        if (seedInput) seedInput.value = this.seedName;
        this.updateTelemetry(foundedNode, this.majorCities);
        const hintEl = this.container.querySelector('#telemetry-hint');
        if (hintEl) {
          hintEl.textContent = `🌱 Placed "${this.seedName}". Top ${this.majorCities.length} regional urban hubs marked on map.`;
          hintEl.style.color = '#10b981';
        }
      },
      null,
      (updatedMajorCities) => {
        if (updatedMajorCities && updatedMajorCities.length > 0) {
          this.majorCities = updatedMajorCities;
          this.updateTelemetry(this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng, name: this.seedName }, this.majorCities);
        }
      }
    );

    this.worldMap.updateSolarTerminator(12, 80);
    this.worldMap.showRegion({ lat: this.currentLat, lng: this.currentLng }, false);
    this.worldMap.resolveLocation(this.currentLat, this.currentLng, false).then(res => {
      if (res) {
        if (!this.seedName || this.seedName === 'Home Seed') {
          this.seedName = res.nodeName;
          const seedInput = this.container.querySelector('#seed-name-input');
          if (seedInput) seedInput.value = this.seedName;
        }
        this.majorCities = res.majorCities || [];
        this.updateTelemetry(this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng, name: this.seedName }, this.majorCities);
      }
    });

    // Map floating buttons for Stage 3
    const gpsBtn = this.container.querySelector('#btn-map-gps');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        const hintEl = this.container.querySelector('#telemetry-hint');
        gpsBtn.innerHTML = `<span>⏳ Locating...</span>`;
        if (hintEl) {
          hintEl.textContent = 'Requesting browser location & searching nearest town...';
          hintEl.style.color = '#38bdf8';
        }

        if (this.worldMap) {
          this.worldMap.locateUser(
            (data) => {
              gpsBtn.innerHTML = `<span>✅ Nearby</span>`;
              this.currentLat = data.lat;
              this.currentLng = data.lng;
              this.seedName = data.nodeName;
              this.majorCities = data.majorCities || [];

              const seedNode = createCustomGlobalNode({
                name: this.seedName,
                lat: data.lat,
                lng: data.lng
              });
              this.selectedSeedNode = seedNode;

              const seedInput = this.container.querySelector('#seed-name-input');
              if (seedInput) seedInput.value = this.seedName;

              this.updateTelemetry(seedNode, this.majorCities);
              if (hintEl) {
                hintEl.textContent = `✅ Located near ${data.rawTown || 'town'}! Sited as "${this.seedName}".`;
                hintEl.style.color = '#10b981';
              }
            },
            (fallbackData) => {
              console.warn('[EmbarkationDesk] Geolocation fallback used:', fallbackData);
              gpsBtn.innerHTML = `<span>📍 Nearby</span>`;
              if (fallbackData && fallbackData.nodeName) {
                this.currentLat = fallbackData.lat;
                this.currentLng = fallbackData.lng;
                this.seedName = fallbackData.nodeName;
                this.majorCities = fallbackData.majorCities || [];

                const seedNode = createCustomGlobalNode({
                  name: this.seedName,
                  lat: fallbackData.lat,
                  lng: fallbackData.lng
                });
                this.selectedSeedNode = seedNode;

                const seedInput = this.container.querySelector('#seed-name-input');
                if (seedInput) seedInput.value = this.seedName;

                this.updateTelemetry(seedNode, this.majorCities);
              }
              if (hintEl) {
                hintEl.textContent = `📍 Browser location unavailable. Sited at [${this.currentLat.toFixed(2)}°, ${this.currentLng.toFixed(2)}°] as "${this.seedName}".`;
                hintEl.style.color = '#f59e0b';
              }
            }
          );
        }
      });
    }

    const pickBtn = this.container.querySelector('#btn-map-pick');
    if (pickBtn) {
      pickBtn.addEventListener('click', () => {
        const hintEl = this.container.querySelector('#telemetry-hint');
        if (hintEl) {
          hintEl.textContent = '👉 Click anywhere on the map: we look up the nearest town, add -ONE, and show regional hubs!';
          hintEl.style.color = '#38bdf8';
        }
        if (this.worldMap) {
          this.worldMap.showRegion(
            this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng },
            true
          );
        }
      });
    }

    const worldBtn = this.container.querySelector('#btn-map-world');
    if (worldBtn) {
      worldBtn.addEventListener('click', () => {
        if (this.worldMap) {
          this.worldMap.showWorld(true);
        }
      });
    }
  }

  updateTelemetry(node = null, majorCities = null) {
    const coordsEl = this.container.querySelector('#telemetry-coords');
    const climateEl = this.container.querySelector('#telemetry-climate');
    const solarEl = this.container.querySelector('#telemetry-solar');
    const rainEl = this.container.querySelector('#telemetry-rain');
    const hubsEl = this.container.querySelector('#telemetry-hubs');

    const lat = node ? node.lat : this.currentLat;
    const lng = node ? node.lng : this.currentLng;
    const name = node ? node.name : this.seedName;

    if (coordsEl) {
      coordsEl.textContent = `📍 ${name} [${lat.toFixed(3)}°, ${lng.toFixed(3)}°]`;
    }

    const climate = getClimateZoneFromLat(lat);
    if (climateEl) {
      climateEl.textContent = `🌿 ${climate.name} (${climate.dwellingType})`;
    }

    const env = computeBioregionalEnvironmentalFactors(lat);
    if (solarEl) {
      solarEl.textContent = `☀️ Solar: ${env.solarFactor.toFixed(2)}x (${env.annualKwhPerM2.toLocaleString()} kWh/m²/yr)`;
    }
    if (rainEl) {
      rainEl.textContent = `🌧️ Rain: ~${env.annualRainfallMm.toLocaleString()} mm/yr`;
    }

    if (hubsEl) {
      const cities = (majorCities && majorCities.length > 0) ? majorCities : (this.majorCities || []);
      if (cities.length > 0) {
        const top3 = cities.slice(0, 3).map(c => `${c.name} (${c.distanceKm} km)`).join(', ');
        hubsEl.textContent = `🏙️ Hubs: ${top3}`;
      } else {
        hubsEl.textContent = `🏙️ Hubs: Calculating regional network...`;
      }
    }
  }

  selectVocation(vocationId) {
    this.selectedVocation = vocationId;
    const cards = this.container.querySelectorAll('.passport-card');
    cards.forEach(c => {
      const isCurrent = c.dataset.vocation === vocationId;
      c.classList.toggle('selected', isCurrent);
      const tag = c.querySelector('.passport-status-tag');
      if (tag) {
        tag.textContent = isCurrent ? '★ YOUR PASSPORT ★' : 'COMPANION';
      }
    });

    if (!this.hasManuallyCustomized) {
      const defaults = {
        builder: { gender: 'F', hairStyle: 'ponytail', hairColor: '#78350f', skinTone: '#fed7aa' },
        electrician: { gender: 'M', hairStyle: 'fade', hairColor: '#1e293b', skinTone: '#fbb77a' },
        gardener: { gender: 'M', hairStyle: 'beard', hairColor: '#3b1d11', skinTone: '#92400e' }
      };
      this.playerAppearance = { ...(defaults[vocationId] || defaults.electrician) };
      if (this.avatarCustomizer) {
        this.avatarCustomizer.setAppearance(this.playerAppearance);
      }
    }

    this.updateCardNames();
  }

  updateCardNames() {
    const roles = {
      builder: 'Maya',
      electrician: 'Alex',
      gardener: 'Leo'
    };

    ['builder', 'electrician', 'gardener'].forEach(role => {
      const displayEl = this.container.querySelector(`#name-display-${role}`);
      if (displayEl) {
        if (this.selectedVocation === role) {
          displayEl.textContent = `${this.playerName} (YOU)`;
        } else {
          displayEl.textContent = roles[role];
        }
      }
    });

    const roleTag = this.container.querySelector('#footnote-role');
    if (roleTag) roleTag.textContent = this.selectedVocation.toUpperCase();
  }

  startCinematicZoomAndEmbark() {
    const climateZone = getClimateZoneFromLat(this.currentLat);

    const locationData = {
      id: this.selectedSeedNode?.id || `node-custom-${Date.now().toString(36)}`,
      name: this.selectedSeedNode?.name || this.seedName || 'Home Seed',
      bioregion: this.selectedSeedNode?.bioregion || `${climateZone.name} Bioregion`,
      dwellingType: climateZone.dwellingType,
      lat: this.currentLat,
      lng: this.currentLng,
      timezoneOffset: Math.round(this.currentLng / 15)
    };

    // Persist to central GameState with customized appearance
    gameState.setPlayerProfile(this.playerName, this.selectedVocation, this.playerAppearance);
    gameState.setLocation(locationData);

    const badgeEl = this.container.querySelector('#step-badge');
    if (badgeEl) badgeEl.textContent = 'STAGE 3 / 3: EMBARKATION TO SITE';

    console.log('🚀 [EmbarkationDesk] Stage 3: Zooming in and starting plot...', locationData, this.playerAppearance);

    // Stage 3: Cinematic Dive into the site!
    if (this.worldMap && this.worldMap.map) {
      const mapEl = document.getElementById('world-leaflet-map');
      if (mapEl) {
        mapEl.style.transition = 'filter 1.2s ease, transform 1.2s ease';
      }
      this.worldMap.map.flyTo([this.currentLat, this.currentLng], 13, { duration: 1.2 });
    }

    setTimeout(() => {
      if (typeof this.onEmbark === 'function') {
        this.onEmbark(gameState.data);
      }
    }, 1300);
  }
}
