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
    modules: [
      {
        id: 'camper-van',
        name: 'Pioneer Camper Van',
        icon: '🚐',
        role: 'Mobile Basecamp & Auxiliary Storage',
        explanation: 'Provides initial 3-person bunking shelter, 45 kWh AGM battery storage, and 850 L water reserves before permanent timber framing begins.',
        yield: 'Shelter for 3 • 45 kWh Battery Reserve • 850 L Water'
      },
      {
        id: 'solar-array',
        name: 'Bifacial Solar Array',
        icon: '⚡',
        role: 'Southern Photovoltaic Array',
        explanation: 'Sited on unshaded southern clearing; bifacial panels capture both direct high-latitude sun and snow albedo reflections.',
        yield: '+18.5 kWh / clear day (Seasonal sun tracking)'
      },
      {
        id: 'water-flume',
        name: 'Snow-Melt & Rain Flume',
        icon: '💧',
        role: 'Gravity-Fed Hydrological Intake',
        explanation: 'Positioned along natural elevation contour to capture gravity-fed snowmelt and precipitation without electric pumping loads.',
        yield: '+450 L / day baseline inflow (Zero pumping energy)'
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
    lat: 44.333,
    lng: 11.200,
    zoom: 7.0,
    population: 24,
    populationLabel: '24 Residents (6 Pods)',
    debtUsd: 15000,
    debtLabel: '$15,000 Debt (Drastically Reduced)',
    summary: 'The village emerges. Permanent reciprocal timber Modular Habitat Units (MHUs) house the expanding community. A FabLab machine shop fabricates open-source parts while reed-beds purify water.',
    modules: [
      {
        id: 'mhu-clusters',
        name: 'Modular Habitat Units (MHUs)',
        icon: '🏡',
        role: 'Civic Usufruct Dwellings',
        explanation: 'Open-hardware reciprocal timber pods with living sedum roofs and private kitchen garden aprons; 0 rent, strictly dynamic usufruct occupancy.',
        yield: 'Shelter for 24 residents • High thermal mass • 0 Speculation'
      },
      {
        id: 'fablab-shop',
        name: 'FabLab Machine Shop',
        icon: '⚙️',
        role: 'Open-Hardware Tooling & Robotics',
        explanation: 'Houses open-source LinuxCNC gantry mills and 3D printers, manufacturing automated FarmBots and replacement parts to extinguish manual chores.',
        yield: '-12 kWh/day power draw • +100% mechanical repair speed'
      },
      {
        id: 'greywater-reedbed',
        name: 'Greywater Reed-Bed Basin',
        icon: '🌿',
        role: 'Biological Wetland Filtration',
        explanation: 'Constructed wetland with gravel substrates and native reeds that biologically purifies 65% of domestic greywater for crop sub-irrigation.',
        yield: '+650 L / day recycled water (65% return rate)'
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
    modules: [
      {
        id: 'central-agora',
        name: 'Central Agora Hearth',
        icon: '🏛️',
        role: 'Athenian Demarchy Assembly',
        explanation: 'Erected on the exact coordinate of the founding camper van; hosts sortition citizen juries (odd parity) to deliberate on civic questions with 75% consensus.',
        yield: 'Demarchic governance • Zero gridlock • +100 Morale'
      },
      {
        id: 'trike-depot',
        name: 'Cargo Trike & Vertiport Hub',
        icon: '🚲',
        role: 'Zero-Emission Inter-Node Logistics',
        explanation: 'Fleet of electric cargo trikes (250 kg freight box) and autonomous VTOL drones linking autonomous sister nodes across regional greenways.',
        yield: '250 kg freight / trike • 60 km range • Zero fuel debt'
      },
      {
        id: 'sovereign-microgrid',
        name: '100% Microgrid & LFP Banks',
        icon: '☀️',
        role: 'Autonomous Energy Abundance',
        explanation: 'Extensive bifacial solar arrays, vertical-axis wind turbines, and stationary LFP battery banks delivering continuous energy surplus with zero utility bills.',
        yield: '+420 kWh / day net surplus • Zero fossil dependence'
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
    
    // Tour state
    this.currentTourStopIndex = 0;
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
              <div class="tour-map-overlay-badge">
                <span class="pulse-dot"></span>
                <span id="tour-map-stop-indicator">RECONNAISSANCE: STOP 1 OF 3</span>
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

    // Tour Navigation (Step 2)
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

  renderTourConsole() {
    const consolePanel = this.container.querySelector('#tour-console-panel');
    if (!consolePanel) return;

    const stop = CIVILIZATIONAL_TOUR_STOPS[this.currentTourStopIndex];
    const indicatorEl = this.container.querySelector('#tour-map-stop-indicator');
    if (indicatorEl) {
      indicatorEl.textContent = `RECONNAISSANCE: STOP ${this.currentTourStopIndex + 1} OF 3 • STAGE ${stop.stageNumber}`;
    }

    // Default select first module of this stop if none selected or invalid
    if (!this.selectedTourModule || !stop.modules.some(m => m.id === this.selectedTourModule.id)) {
      this.selectedTourModule = stop.modules[0];
    }

    const isDebtFree = stop.debtUsd === 0;

    consolePanel.innerHTML = `
      <div class="tour-header-row">
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

      <div class="tour-metrics-strip">
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
          <span>📐 Tap Featured Modules to Inspect Thermodynamic Architecture:</span>
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
            <button type="button" id="btn-tour-finish-siting" class="btn-tour-primary-next" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
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
        const found = stop.modules.find(m => m.id === modId);
        if (found) {
          this.selectedTourModule = found;
          this.renderTourConsole();
        }
      });
    });

    // Prev / Next button bindings
    const prevBtn = consolePanel.querySelector('#btn-tour-prev-stop');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentTourStopIndex > 0) {
          this.currentTourStopIndex--;
          this.flyToTourStop(this.currentTourStopIndex);
        }
      });
    }

    const nextBtn = consolePanel.querySelector('#btn-tour-next-stop');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentTourStopIndex < 2) {
          this.currentTourStopIndex++;
          this.flyToTourStop(this.currentTourStopIndex);
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

  flyToTourStop(stopIndex) {
    const stop = CIVILIZATIONAL_TOUR_STOPS[stopIndex];
    if (!stop) return;

    this.selectedTourModule = stop.modules[0];
    this.renderTourConsole();

    if (this.tourMap && this.tourMap.map) {
      this.tourMap.map.flyTo([stop.lat, stop.lng], stop.zoom, { duration: 1.4 });

      // Update or create pulsing beacon marker
      if (this.tourMarker) {
        this.tourMarker.remove();
      }

      this.tourMarker = L.circleMarker([stop.lat, stop.lng], {
        radius: 14,
        fillColor: stopIndex === 2 ? '#10b981' : stopIndex === 1 ? '#38bdf8' : '#fbbf24',
        fillOpacity: 0.9,
        color: '#ffffff',
        weight: 3
      }).addTo(this.tourMap.map);

      this.tourMarker.bindPopup(`
        <div style="font-family: var(--font-heading); font-size: 13px; font-weight: 700; color: #020617; padding: 4px;">
          ${stop.stageTitle}<br>
          <span style="font-weight: 400; color: #475569;">${stop.nodeName}</span>
        </div>
      `).openPopup();
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
          this.tourMap = new WorldMapController('world-leaflet-tour-map', () => {}, () => {});
          this.tourMap.updateSolarTerminator(12, 80);
        }
        if (this.tourMap && this.tourMap.map) {
          this.tourMap.map.invalidateSize();
          this.flyToTourStop(this.currentTourStopIndex);
        }
      }, 80);

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
