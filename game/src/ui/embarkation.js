/**
 * O.N.E. Pioneer Embarkation Desk
 * 3-Stage Guided Onboarding:
 * Stage 1: Select Name + Craft (The 3 Passports) -> Next
 * Stage 2: Place Seed Node (Authentic Sim World/Regional Map + Nearby / Pick on Map) -> Next
 * Stage 3: Cinematic Zoom In & Start Plot
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

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

export class EmbarkationDesk {
  constructor(containerEl, onEmbarkCallback = () => {}) {
    this.container = containerEl;
    this.onEmbark = onEmbarkCallback;

    this.currentStep = 1; // 1 = Name/Job/Look, 2 = Map & Seed Founding

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
              <span>Next: Place Seed Node</span>
              <span>➔</span>
            </button>
            <p class="embark-footnote">
              Selected: <strong style="color: #fbbf24;">${this.playerName}</strong> (<span id="footnote-role">${this.selectedVocation.toUpperCase()}</span>). Next, choose where your van lands.
            </p>
          </div>
        </div>

        <!-- STAGE 2: PLACE SEED NODE (MAP SCREEN) -->
        <div id="stage-2-map" class="embark-form-wrap stage-panel hidden">
          <div class="location-card full-map-card">
            <div class="location-header">
              <div class="location-title-box">
                <div class="location-title">
                  <span>🌍 Place Your Seed Node</span>
                </div>
                <p class="location-subtitle">
                  Tap <strong>"Nearby"</strong> to use your browser location, or <strong>pick freely on the map</strong>.
                </p>
              </div>
              <div class="seed-name-box">
                <span style="font-family: var(--font-mono); font-size: 13px; color: var(--emerald);">🌱</span>
                <input type="text" id="seed-name-input" class="seed-name-input" value="${this.seedName}" maxlength="32" placeholder="Name your seed...">
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

            <!-- Bioregional Telemetry Bar -->
            <div class="bioregion-telemetry-bar">
              <div class="telemetry-badges-row">
                <div class="telemetry-badge badge-coords" id="telemetry-coords">
                  📍 Site: ${this.currentLat.toFixed(3)}°, ${this.currentLng.toFixed(3)}°
                </div>
                <div class="telemetry-badge badge-climate" id="telemetry-climate">
                  🌿 Bioregion: Calculating...
                </div>
                <div class="telemetry-badge badge-beacon" id="telemetry-beacon">
                  🌟 Nearest Anchor: Calculating...
                </div>
              </div>
              <span class="telemetry-hint" id="telemetry-hint">Tap "Nearby" for browser GPS, or click anywhere on the map to plant your beacon!</span>
            </div>
          </div>

          <!-- Stage 2 Action Bar -->
          <div class="embark-action-bar stage-nav-row">
            <button id="btn-step2-back" class="btn-secondary-back">
              <span>↩ Back</span>
            </button>
            <button id="btn-step2-embark" class="btn-embark-cta">
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
    nameInput.addEventListener('input', (e) => {
      this.playerName = e.target.value.trim() || 'Alex';
      this.updateCardNames();
    });

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

    // Step 1 -> Step 2
    const step1Next = this.container.querySelector('#btn-step1-next');
    if (step1Next) {
      step1Next.addEventListener('click', () => {
        this.goToStep(2);
      });
    }

    // Step 2 -> Step 1 (Back)
    const step2Back = this.container.querySelector('#btn-step2-back');
    if (step2Back) {
      step2Back.addEventListener('click', () => {
        this.goToStep(1);
      });
    }

    // Step 2 -> Step 3 (Embark with zoom-in dive)
    const step2Embark = this.container.querySelector('#btn-step2-embark');
    if (step2Embark) {
      step2Embark.addEventListener('click', () => {
        this.startCinematicZoomAndEmbark();
      });
    }
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    const stage1 = this.container.querySelector('#stage-1-passports');
    const stage2 = this.container.querySelector('#stage-2-map');
    const titleEl = this.container.querySelector('#embark-title');
    const subtitleEl = this.container.querySelector('#embark-subtitle');
    const badgeEl = this.container.querySelector('#step-badge');

    if (stepNumber === 1) {
      stage2.classList.add('hidden');
      stage2.classList.remove('active');
      stage1.classList.remove('hidden');
      stage1.classList.add('active');

      titleEl.textContent = 'PIONEER EMBARKATION DESK';
      subtitleEl.textContent = '"Three pioneers. One seed. What is your craft?"';
      badgeEl.textContent = 'STAGE 1 / 3: NAME & CRAFT';
    } else if (stepNumber === 2) {
      // If 3D customizer is open, clean it up before switching to map
      if (this.avatarCustomizer) {
        this.avatarCustomizer.destroy();
        this.avatarCustomizer = null;
        const studioDrawer = this.container.querySelector('#pioneer-avatar-studio-drawer');
        const studioArrow = this.container.querySelector('#studio-toggle-arrow');
        if (studioDrawer) studioDrawer.classList.add('hidden');
        if (studioArrow) studioArrow.textContent = '▼';
      }

      stage1.classList.add('hidden');
      stage1.classList.remove('active');
      stage2.classList.remove('hidden');
      stage2.classList.add('active');

      titleEl.textContent = 'PLACE YOUR SEED NODE';
      subtitleEl.textContent = `Pioneer ${this.playerName}, where will you plant the seed of O.N.E.?`;
      badgeEl.textContent = 'STAGE 2 / 3: SEED LOCATION';

      // Initialize map on first display or invalidate size
      if (!this.worldMap) {
        setTimeout(() => this.initMapController(), 50);
      } else {
        setTimeout(async () => {
          if (this.worldMap.map) {
            this.worldMap.map.invalidateSize();
            this.worldMap.showRegion(
              this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng },
              false
            );
            const res = await this.worldMap.resolveLocation(this.currentLat, this.currentLng, false);
            if (res) {
              if (!this.seedName || this.seedName === 'Home Seed') {
                this.seedName = res.nodeName;
                const seedInput = this.container.querySelector('#seed-name-input');
                if (seedInput) seedInput.value = this.seedName;
              }
              this.majorCities = res.majorCities || [];
              this.updateTelemetry(this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng, name: this.seedName }, this.majorCities);
            }
          }
        }, 100);
      }
    }
  }

  initMapController() {
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
          this.majorCities = res.majorCities || [];
          this.updateTelemetry(selectedNode, this.majorCities);
        });
      },
      (foundedNode) => {
        // User clicked unpopulated land and planted a new beacon
        console.log('🌱 [EmbarkationDesk] Custom seed node placed:', foundedNode);
        this.selectedSeedNode = foundedNode;
        this.currentLat = foundedNode.lat;
        this.currentLng = foundedNode.lng;
        this.seedName = foundedNode.name; // Automatically has -ONE!
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
        // Automatically syncs whenever visible region changes (moveend / zoom / pan)
        if (updatedMajorCities && updatedMajorCities.length > 0) {
          this.majorCities = updatedMajorCities;
          this.updateTelemetry(this.selectedSeedNode || { lat: this.currentLat, lng: this.currentLng, name: this.seedName }, this.majorCities);
        }
      }
    );

    // Initial solar terminator render
    this.worldMap.updateSolarTerminator(12, 80);

    // Center map on region & resolve initial location with nearest town and regional hubs
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

    // Map floating buttons
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
              this.seedName = data.nodeName; // Automatically has -ONE!
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
    const beaconEl = this.container.querySelector('#telemetry-beacon');

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

    let minKm = Infinity;
    let nearest = null;
    GLOBAL_STARTER_NODES.forEach(b => {
      const d = haversineKm(lat, lng, b.lat, b.lng);
      if (d < minKm && d > 1) {
        minKm = d;
        nearest = b;
      }
    });

    if (beaconEl) {
      if (nearest) {
        beaconEl.textContent = `🌟 Nearest Anchor: ${nearest.name.split(' ')[0]} (${minKm.toLocaleString()} km)`;
      } else {
        beaconEl.textContent = `🌟 Anchor Hub`;
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
