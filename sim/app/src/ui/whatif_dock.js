/**
 * What-If? Systemic Macro-Levers & Diorama Controller (Agent SIM-5)
 * Allows users to tweak systemic variables and immediately watch the thermodynamic,
 * physical, and social cascade in the living 2.5D village diorama.
 *
 * Levers:
 * 1. 🤖 Automation & Robotics (0%..100%): spawns robots, cancels chores, moves citizens to Agora.
 * 2. ☀️ Circadian Time Scrubber (00:00..23:00): scrubs sun curve, day/night lighting, and lanterns.
 * 3. 🌤️ Weather Presets (Sun, Overcast, Rain, Storm, Heatwave): affects solar, water inflow, wind speed.
 * 4. ⚡ Resilience Stress-Tests: Sever Grid toggle, +25 Climate Arrivals, Reset Equilibrium.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';

export class WhatIfDockController {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.settlementRenderer = options.settlementRenderer || null;
    this.hud = options.hud || null;
    this.zoomCoordinator = options.zoomCoordinator || null;
    this.ambienceAudio = options.ambienceAudio || null;
    this.zenMode = options.zenMode || null;
    this.panelGameBridge = options.panelGameBridge || null;

    this.isCollapsed = false;
    this.gridSevered = false;
    this.automationPct = 40;
    this.weatherMode = 'AUTO';

    this.initDOM();
    this.bindEvents();
    this.setAutomation(40);
  }

  initDOM() {
    let dock = document.getElementById('whatif-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'whatif-dock';
      dock.className = 'whatif-dock';
      dock.innerHTML = `
        <div class="whatif-header" id="whatif-header">
          <div class="whatif-title-group">
            <span class="whatif-badge" data-i18n="whatifBadge">⚡ WHAT-IF? LAB</span>
            <span class="whatif-sub" data-i18n="whatifSub">Tweak 1 lever & watch the diorama cascade</span>
          </div>
          <div class="whatif-lens-group" id="whatif-lens-group" title="Visual Flow Lenses (Press L to cycle)">
            <span class="lens-label">👁️ LENS:</span>
            <button class="btn-lens active" data-lens="OFF" data-i18n="lensOff">Off</button>
            <button class="btn-lens" data-lens="ENERGY" data-i18n="lensEnergy">⚡ Energy</button>
            <button class="btn-lens" data-lens="WATER" data-i18n="lensWater">💧 Water</button>
            <button class="btn-lens" data-lens="ALL" data-i18n="lensAll">🌐 Both</button>
          </div>
          <div class="whatif-extras-group" id="whatif-extras-group">
            <button id="btn-toggle-audio" class="btn-whatif-extra" title="Toggle Solarpunk Ambience Sound (M)">
              <span id="audio-icon">🔇</span>
              <span id="audio-label" class="extra-label" data-i18n="audioBtn">Sound</span>
            </button>
            <button id="btn-zen-mode" class="btn-whatif-extra" title="Zen Living Screensaver Mode (Z / ESC)">
              <span>🧘</span>
              <span class="extra-label" data-i18n="zenBtn">Zen</span>
            </button>
            <button id="btn-open-game-bridge" class="btn-whatif-extra btn-extra-game" title="Experience settlement from the ground in 3D">
              <span>🎮</span>
              <span class="extra-label" data-i18n="playGameBtn">Play Game ➔</span>
            </button>
          </div>
          <button id="btn-toggle-whatif" class="btn-whatif-toggle" title="Toggle What-If Dock (Space / W)">
            <span id="whatif-toggle-icon" class="whatif-toggle-icon">▼</span>
          </button>
        </div>

        <div class="whatif-body" id="whatif-body">
          <!-- Lever 1: Automation & Robotics -->
          <div class="whatif-lever-card">
            <div class="lever-header">
              <span class="lever-icon">🤖</span>
              <div class="lever-title-box">
                <span class="lever-title" data-i18n="whatifAutomationTitle">Automation & Robotics</span>
                <span id="whatif-val-automation" class="lever-val">40%</span>
              </div>
            </div>
            <input type="range" id="whatif-slider-automation" class="whatif-range" min="0" max="100" step="5" value="40" />
            <div class="lever-scale">
              <span>0% Manual</span>
              <span>50% Hybrid</span>
              <span>100% Solarpunk</span>
            </div>
          </div>

          <!-- Lever 2: Circadian Day/Night Scrubber -->
          <div class="whatif-lever-card">
            <div class="lever-header">
              <span class="lever-icon">☀️</span>
              <div class="lever-title-box">
                <span class="lever-title" data-i18n="whatifCircadianTitle">Circadian Sun Clock</span>
                <span id="whatif-val-time" class="lever-val">12:00</span>
              </div>
            </div>
            <input type="range" id="whatif-slider-time" class="whatif-range" min="0" max="23" step="1" value="12" />
            <div class="lever-scale">
              <span>00:00 Night</span>
              <span>06:00 Dawn</span>
              <span>12:00 Noon</span>
              <span>18:00 Dusk</span>
            </div>
          </div>

          <!-- Lever 3: Atmospheric Weather Presets -->
          <div class="whatif-lever-card">
            <div class="lever-header">
              <span class="lever-icon">🌤️</span>
              <div class="lever-title-box">
                <span class="lever-title" data-i18n="whatifWeatherTitle">Weather & Climate</span>
                <span id="whatif-val-weather" class="lever-val">Dynamic (Auto)</span>
              </div>
            </div>
            <div class="whatif-pill-group" id="whatif-weather-pills">
              <button class="whatif-pill active" data-weather="AUTO" data-i18n="whatifWeatherAuto">🔄 Auto</button>
              <button class="whatif-pill" data-weather="SUNNY">☀️ Sun</button>
              <button class="whatif-pill" data-weather="OVERCAST">☁️ Overcast</button>
              <button class="whatif-pill" data-weather="RAIN">🌧️ Rain</button>
              <button class="whatif-pill" data-weather="STORMY">⛈️ Storm</button>
              <button class="whatif-pill" data-weather="HEATWAVE">🌡️ Heat</button>
            </div>
          </div>

          <!-- Lever 4: Resilience Stress-Tests -->
          <div class="whatif-lever-card whatif-shocks-card">
            <div class="lever-header">
              <span class="lever-icon">⚡</span>
              <div class="lever-title-box">
                <span class="lever-title" data-i18n="whatifStressTitle">Resilience Shocks</span>
                <span class="lever-val" data-i18n="whatifStressSub">1-Click Tests</span>
              </div>
            </div>
            <div class="whatif-buttons-grid">
              <button id="btn-whatif-sever-grid" class="whatif-action-btn btn-shock-grid" title="Cut off external commercial power grid">
                ⚡ <span data-i18n="whatifBtnSeverGrid">Sever Grid</span>
              </button>
              <button id="btn-whatif-refugees" class="whatif-action-btn btn-shock-refugees" title="25 climate arrivals join the settlement">
                👥 <span data-i18n="whatifBtnArrivals">+25 Arrivals</span>
              </button>
              <button id="btn-whatif-reset" class="whatif-action-btn btn-shock-reset" title="Reset all levers to Solarpunk baseline">
                🔄 <span data-i18n="whatifBtnReset">Reset</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Insert dock right inside main-viewport so it floats over canvas
      const viewport = document.getElementById('main-viewport') || document.body;
      viewport.appendChild(dock);
    }
    this.dockEl = dock;
  }

  bindEvents() {
    // Header toggle
    const btnToggle = document.getElementById('btn-toggle-whatif');
    const header = document.getElementById('whatif-header');
    if (btnToggle) btnToggle.addEventListener('click', (e) => { e.stopPropagation(); this.toggleCollapse(); });
    if (header) header.addEventListener('click', () => this.toggleCollapse());

    // Slider 1: Automation
    const sliderAuto = document.getElementById('whatif-slider-automation');
    if (sliderAuto) {
      sliderAuto.addEventListener('input', (e) => {
        this.setAutomation(Number(e.target.value));
      });
      sliderAuto.addEventListener('change', () => {
        if (this.automationPct >= 65) {
          this.settlementRenderer?.triggerContextualDialogue('HIGH_AUTOMATION', 2);
        } else if (this.automationPct <= 25) {
          this.settlementRenderer?.triggerContextualDialogue('LOW_AUTOMATION', 2);
        }
      });
    }

    // Slider 2: Circadian Time
    const sliderTime = document.getElementById('whatif-slider-time');
    if (sliderTime) {
      sliderTime.addEventListener('input', (e) => {
        this.setHour(Number(e.target.value));
      });
      sliderTime.addEventListener('change', () => {
        const h = Number(sliderTime.value);
        let cat = 'AMBIENT_COMMONS';
        if (h >= 5 && h <= 8) cat = 'CIRCADIAN_DAWN';
        else if (h >= 11 && h <= 14) cat = 'CIRCADIAN_NOON';
        else if (h >= 17 && h <= 20) cat = 'CIRCADIAN_DUSK';
        else if (h >= 21 || h <= 4) cat = 'CIRCADIAN_NIGHT';
        this.settlementRenderer?.triggerContextualDialogue(cat, 2);
      });
    }

    // Weather pills
    const pillGroup = document.getElementById('whatif-weather-pills');
    if (pillGroup) {
      pillGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.whatif-pill');
        if (!btn) return;
        const weatherId = btn.getAttribute('data-weather');
        if (weatherId) {
          pillGroup.querySelectorAll('.whatif-pill').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          if (weatherId === 'AUTO') {
            this.setAutoWeather();
          } else {
            this.setWeather(weatherId);
          }
        }
      });
    }

    // Visual Flow Lens buttons (Task 3)
    const lensGroup = document.getElementById('whatif-lens-group');
    if (lensGroup) {
      lensGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-lens');
        if (!btn) return;
        e.stopPropagation();
        const lensId = btn.getAttribute('data-lens');
        if (lensId) {
          this.setLens(lensId);
        }
      });
    }

    // Extra actions (Audio, Zen, Game Bridge)
    const btnAudio = document.getElementById('btn-toggle-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.ambienceAudio) {
          const isMuted = this.ambienceAudio.toggleMute();
          this.updateAudioIcons(isMuted);
        }
      });
    }

    const btnZen = document.getElementById('btn-zen-mode');
    if (btnZen) {
      btnZen.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.zenMode) {
          this.zenMode.toggle();
        }
      });
    }

    const btnBridge = document.getElementById('btn-open-game-bridge');
    if (btnBridge) {
      btnBridge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.panelGameBridge) {
          this.panelGameBridge.open();
        }
      });
    }

    // Keyboard shortcut 'M' for audio mute toggle
    window.addEventListener('keydown', (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (this.ambienceAudio) {
          const isMuted = this.ambienceAudio.toggleMute();
          this.updateAudioIcons(isMuted);
        }
      }
    });

    // Stress test buttons
    const btnSever = document.getElementById('btn-whatif-sever-grid');
    if (btnSever) btnSever.addEventListener('click', () => this.toggleSeverGrid());

    const btnRefugees = document.getElementById('btn-whatif-refugees');
    if (btnRefugees) btnRefugees.addEventListener('click', () => this.addArrivals(25));

    const btnReset = document.getElementById('btn-whatif-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.resetEquilibrium());

    // Subscribe to simulation tick to keep clock display aligned
    if (this.sim?.onTickListeners) {
      this.sim.onTickListeners.push(() => {
        this.updateTickSync();
      });
    }
  }

  updateAudioIcons(isMuted) {
    const icon = document.getElementById('audio-icon');
    const label = document.getElementById('audio-label');
    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    if (label) label.textContent = isMuted ? 'Sound' : 'On';
    if (this.zenMode && typeof this.zenMode.updateAudioIcons === 'function') {
      this.zenMode.updateAudioIcons(isMuted);
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const body = document.getElementById('whatif-body');
    const icon = document.getElementById('whatif-toggle-icon');
    if (this.isCollapsed) {
      this.dockEl.classList.add('collapsed');
      if (body) body.classList.add('hidden');
      if (icon) icon.textContent = '▲';
    } else {
      this.dockEl.classList.remove('collapsed');
      if (body) body.classList.remove('hidden');
      if (icon) icon.textContent = '▼';
    }
  }

  setAutomation(pct) {
    this.automationPct = Math.max(0, Math.min(100, Number(pct)));
    const node = this.sim.node;
    if (!node.robots) node.robots = {};

    // Deploy robot fleet units proportionally
    const roverCount = Math.floor((this.automationPct / 100) * 4);
    const droneCount = Math.floor((this.automationPct / 100) * 4);
    const scadaCount = Math.floor((this.automationPct / 100) * 3);
    const cleanCount = Math.floor((this.automationPct / 100) * 3);
    const sorterCount = Math.floor((this.automationPct / 100) * 2);

    node.robots = {
      farmRover: { count: roverCount, hoursCancelled: 4 },
      esp32Valves: { count: droneCount, hoursCancelled: 2 },
      mpptOptimizer: { count: scadaCount, hoursCancelled: 3 },
      cleaningBot: { count: cleanCount, hoursCancelled: 2 },
      cncSorter: { count: sorterCount, hoursCancelled: 4 }
    };

    // Calculate human chore hours: from 6.0h down to 0.3h/day per person
    const humanHours = Math.max(0.3, +(6.0 * (1 - this.automationPct / 100)).toFixed(1));
    node.dailyChoreTargetHours = humanHours;

    // Synchronize living robot entities on canvas
    if (this.settlementRenderer?.robotManager) {
      this.settlementRenderer.robotManager.syncRobots();
    }

    // Direct citizens to leisure in Agora or work in fields
    if (this.settlementRenderer?.citizens) {
      const isHighAutomation = this.automationPct >= 65;
      for (const c of this.settlementRenderer.citizens) {
        if (!c.isPlayer) {
          if (isHighAutomation) {
            c.preferredDomain = Math.random() < 0.6 ? 'AGORA' : 'GARDEN';
            if (!c.bubble && Math.random() < 0.15) {
              c.bubble = '🎨';
              c.bubbleTimer = 120;
            }
          } else {
            c.preferredDomain = Math.random() < 0.5 ? 'AGRICULTURE' : 'WORKSHOP';
            if (!c.bubble && Math.random() < 0.15) {
              c.bubble = '🌾';
              c.bubbleTimer = 120;
            }
          }
        }
      }
    }

    node.updateLaborAndMorale();
    if (this.hud) this.hud.update(this.sim.getFullState());
    this.updateDomReadouts();
  }

  setHour(hour) {
    if (typeof this.sim.setCircadianHour === 'function') {
      this.sim.setCircadianHour(hour);
    } else {
      const day = Math.floor(this.sim.tickCount / 24);
      this.sim.tickCount = day * 24 + hour;
    }

    if (this.settlementRenderer) {
      this.settlementRenderer.render();
    }
    if (this.ambienceAudio && !this.ambienceAudio.isMuted) {
      const weatherId = this.sim?.thermo?.weather?.id || 'SUNNY';
      this.ambienceAudio.update(hour, weatherId);
    }
    if (this.hud) this.hud.update(this.sim.getFullState());
    this.updateDomReadouts();
  }

  setAutoWeather() {
    this.weatherMode = 'AUTO';
    if (typeof this.sim?.thermo?.setAutoWeather === 'function') {
      this.sim.thermo.setAutoWeather();
    } else if (this.sim?.thermo) {
      this.sim.thermo.weatherManualLock = false;
    }
    if (this.settlementRenderer) {
      this.settlementRenderer.render();
      this.settlementRenderer.triggerContextualDialogue('AMBIENT_COMMONS', 1);
    }
    if (this.ambienceAudio && !this.ambienceAudio.isMuted) {
      const weatherId = this.sim?.thermo?.weather?.id || 'SUNNY';
      this.ambienceAudio.update(this.sim?.hour || 12, weatherId);
    }
    if (this.hud) {
      this.hud.update(this.sim.getFullState());
      this.hud.showNotification({
        title: '🌤️ Weather: Dynamic Auto',
        message: 'Atmospheric simulation unlocked. Meteorological cycles proceed autonomously.'
      });
    }
    this.updateDomReadouts();
  }

  setWeather(weatherTypeId) {
    this.weatherMode = 'MANUAL';
    if (typeof this.sim.thermo.setWeather === 'function') {
      this.sim.thermo.setWeather(weatherTypeId, true);
    }
    if (this.settlementRenderer) {
      this.settlementRenderer.render();
      const weatherDialogues = {
        SUNNY: 'WEATHER_SUNNY',
        OVERCAST: 'WEATHER_OVERCAST',
        RAIN: 'WEATHER_RAIN',
        STORMY: 'WEATHER_STORMY',
        HEATWAVE: 'WEATHER_HEATWAVE'
      };
      const cat = weatherDialogues[weatherTypeId] || 'WEATHER_SUNNY';
      this.settlementRenderer.triggerContextualDialogue(cat, 2);
    }
    if (this.ambienceAudio && !this.ambienceAudio.isMuted) {
      this.ambienceAudio.update(this.sim?.hour || 12, weatherTypeId);
    }
    if (this.hud) {
      this.hud.update(this.sim.getFullState());
      this.hud.showNotification({
        title: `🌤️ Weather: ${this.sim.thermo.weather.name} (Locked)`,
        message: `Cloud cover: ${Math.round(this.sim.thermo.weather.cloudCover * 100)}% • Wind: ${this.sim.thermo.weather.windSpeedKmh} km/h • Temp: ${this.sim.thermo.weather.temperatureC}°C`
      });
    }
    this.updateDomReadouts();
  }

  toggleSeverGrid() {
    this.gridSevered = !this.gridSevered;
    this.sim.thermo.energy.gridConnected = !this.gridSevered;

    const btn = document.getElementById('btn-whatif-sever-grid');
    if (btn) {
      if (this.gridSevered) {
        btn.classList.add('active-shock');
        btn.innerHTML = '⚡ <span data-i18n="whatifBtnIslanded">Islanded (Off-Grid)</span>';
      } else {
        btn.classList.remove('active-shock');
        btn.innerHTML = '⚡ <span data-i18n="whatifBtnSeverGrid">Sever Grid</span>';
      }
    }

    if (this.settlementRenderer) {
      this.settlementRenderer.triggerContextualDialogue(
        this.gridSevered ? 'SHOCK_GRID_SEVERED' : 'SHOCK_GRID_CONNECTED',
        2
      );
    }

    if (this.hud) {
      this.hud.showNotification({
        title: this.gridSevered ? '⚠️ Grid Severed' : '🔌 Grid Reconnected',
        message: this.gridSevered
          ? 'Commercial grid disconnected! Settlement is surviving strictly on local solar, wind, and battery buffers.'
          : 'Bioregional grid connection re-established.'
      });
      this.hud.update(this.sim.getFullState());
    }
  }

  addArrivals(count = 25) {
    this.sim.node.population += count;
    if (this.settlementRenderer) {
      this.settlementRenderer.node = this.sim.node;
      this.settlementRenderer.buildSettlementLayout();
      if (this.settlementRenderer.robotManager) {
        this.settlementRenderer.robotManager.syncRobots();
      }
      this.settlementRenderer.triggerContextualDialogue('SHOCK_ARRIVALS', 3);
    }

    if (this.sim.sortition) {
      this.sim.sortition.seatNewCouncil(this.sim.node.citizens, this.sim.tickCount);
    }

    this.sim.node.updateLaborAndMorale();
    if (this.hud) {
      this.hud.showNotification({
        title: '👥 Climate Arrivals Welcomed',
        message: `${count} new pioneers settled in dynamic usufruct. New MHU pods erected!`
      });
      this.hud.update(this.sim.getFullState());
    }
    this.updateDomReadouts();
  }

  setLens(lensId) {
    if (this.settlementRenderer?.flowLensesRenderer) {
      this.settlementRenderer.flowLensesRenderer.setLens(lensId);
      this.updateLensPills(lensId);
      if (this.hud) {
        const lensNames = {
          OFF: 'Off (Clean Diorama)',
          ENERGY: '⚡ Energy Grid Overlay (Solar/Wind/Battery)',
          WATER: '💧 Hydrological Cycle Overlay (Rain/Aqueduct/Reed Beds)',
          ALL: '🌐 Full Commons Metabolic Flows'
        };
        this.hud.showNotification({
          title: '👁️ Visual Flow Lens',
          message: lensNames[lensId] || lensId
        });
      }
    }
  }

  cycleLens() {
    if (this.settlementRenderer?.flowLensesRenderer) {
      const nextLens = this.settlementRenderer.flowLensesRenderer.cycleLens();
      this.updateLensPills(nextLens);
      if (this.hud) {
        const lensNames = {
          OFF: 'Off (Clean Diorama)',
          ENERGY: '⚡ Energy Grid Overlay (Solar/Wind/Battery)',
          WATER: '💧 Hydrological Cycle Overlay (Rain/Aqueduct/Reed Beds)',
          ALL: '🌐 Full Commons Metabolic Flows'
        };
        this.hud.showNotification({
          title: '👁️ Visual Flow Lens',
          message: lensNames[nextLens] || nextLens
        });
      }
      return nextLens;
    }
    return 'OFF';
  }

  updateLensPills(activeLens) {
    const group = document.getElementById('whatif-lens-group');
    if (group) {
      group.querySelectorAll('.btn-lens').forEach(btn => {
        if (btn.getAttribute('data-lens') === activeLens) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  resetEquilibrium() {
    this.setAutomation(40);
    this.setHour(12);
    this.setWeather('SUNNY');
    this.setLens('OFF');

    if (this.gridSevered) {
      this.toggleSeverGrid();
    }

    this.sim.node.population = 28;
    if (this.settlementRenderer) {
      this.settlementRenderer.node = this.sim.node;
      this.settlementRenderer.buildSettlementLayout();
      if (this.settlementRenderer.robotManager) {
        this.settlementRenderer.robotManager.syncRobots();
      }
      this.settlementRenderer.triggerContextualDialogue('AMBIENT_COMMONS', 2);
    }

    if (this.sim.sortition) {
      this.sim.sortition.seatNewCouncil(this.sim.node.citizens, this.sim.tickCount);
    }

    // Reset weather pills to AUTO
    const pillGroup = document.getElementById('whatif-weather-pills');
    if (pillGroup) {
      pillGroup.querySelectorAll('.whatif-pill').forEach(p => {
        if (p.getAttribute('data-weather') === 'AUTO') p.classList.add('active');
        else p.classList.remove('active');
      });
    }
    this.weatherMode = 'AUTO';
    if (typeof this.sim?.thermo?.setAutoWeather === 'function') {
      this.sim.thermo.setAutoWeather();
    } else if (this.sim?.thermo) {
      this.sim.thermo.weatherManualLock = false;
    }

    // Reset sliders
    const sAuto = document.getElementById('whatif-slider-automation');
    if (sAuto) sAuto.value = 40;
    const sTime = document.getElementById('whatif-slider-time');
    if (sTime) sTime.value = 12;

    if (this.hud) {
      this.hud.showNotification({
        title: '🔄 Equilibrium Restored',
        message: 'Settlement parameters returned to balanced Solarpunk baseline.'
      });
      this.hud.update(this.sim.getFullState());
    }
    this.updateDomReadouts();
  }

  updateTickSync() {
    // Keep time slider aligned if user is not actively dragging
    const sTime = document.getElementById('whatif-slider-time');
    if (sTime && document.activeElement !== sTime) {
      const h = this.sim.currentHour;
      sTime.value = h;
      const valTime = document.getElementById('whatif-val-time');
      if (valTime) {
        valTime.textContent = `${String(h).padStart(2, '0')}:00`;
      }
    }

    // Keep weather readout aligned with active simulation state
    const valWeather = document.getElementById('whatif-val-weather');
    if (valWeather && this.sim?.thermo?.weather) {
      const modeSuffix = this.weatherMode === 'AUTO' ? ' (Auto)' : ' (Locked)';
      valWeather.textContent = `${this.sim.thermo.weather.icon} ${this.sim.thermo.weather.name}${modeSuffix}`;
    }
  }

  updateDomReadouts() {
    const valAuto = document.getElementById('whatif-val-automation');
    if (valAuto) {
      const hours = (6.0 * (1 - this.automationPct / 100)).toFixed(1);
      valAuto.textContent = `${this.automationPct}% (${hours}h chores/day)`;
    }

    const valTime = document.getElementById('whatif-val-time');
    if (valTime) {
      const h = this.sim.currentHour;
      const phase = h >= 6 && h < 18 ? 'Solar Active' : 'Battery Storage';
      valTime.textContent = `${String(h).padStart(2, '0')}:00 (${phase})`;
    }

    const valWeather = document.getElementById('whatif-val-weather');
    if (valWeather && this.sim?.thermo?.weather) {
      const modeSuffix = this.weatherMode === 'AUTO' ? ' (Auto)' : ' (Locked)';
      valWeather.textContent = `${this.sim.thermo.weather.icon} ${this.sim.thermo.weather.name}${modeSuffix}`;
    }
  }
}
