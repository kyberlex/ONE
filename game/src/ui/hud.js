/**
 * O.N.E. Game HUD & Terra Nil Bottom Dock
 * Implements the non-negotiable design invariants:
 * 1. Clean Slate Top Status Bar (Battery, Water, Food, Labor, Debt, Profile Chip, Audio & Mesh)
 * 2. Always-On Objective Card with ultra-simple copy
 * 3. Terra Nil-Style Bottom Dock (max 4 choices across all 3 progression tiers)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { profileModal } from './profile_modal.js';
import { choreBoardModal } from './chore_board_modal.js';
import { morningDispatchModal } from './morning_dispatch_modal.js';
import { eventModal } from './event_modal.js';
import { worldMapModal } from './world_map_modal.js';
import { buildingInspector } from './building_inspector.js';
import { soundFX } from '../audio/sound_fx.js';

export class GameHUD {
  constructor(hudContainerEl, dockContainerEl, settlementCanvas) {
    this.hudContainer = hudContainerEl;
    this.dockContainer = dockContainerEl;
    this.canvas = settlementCanvas;

    this.activeDockAction = null;
    this.selectedTier = null; // null = auto
    this.selectedDistrict = 'whole_city';
    this.pendingEarlyRest = false;

    if (typeof window !== 'undefined') {
      window.gameHud = this;
    }

    this.render();
    this.bindEvents();
  }

  render() {
    const data = gameState.data;
    const debt = data.debtUsd !== undefined ? data.debtUsd : 12000;
    const isFeastDay = (data.day % 7 === 0 || data.objective?.id === 'obj-day7-feast') && !data.weekendFeastCelebrated;

    // 1. Render Top HUD Bar, District Quick-Jump Ribbon & Objective Card
    this.hudContainer.innerHTML = `
      <div class="hud-top-bar">
        <!-- Site Name & Bioregion Badge -->
        <div class="hud-site-badge">
          <span class="site-icon">🌱</span>
          <div class="site-meta">
            <span class="site-name">${data.location.name}</span>
            <span class="site-day">DAY ${data.day} • DAWN 06:00</span>
          </div>
        </div>

        <!-- Dynamic Weather & Climate Badge -->
        <button type="button" class="hud-weather-badge ${data.weather?.isCrisis ? 'crisis-pulse' : ''}" id="btn-hud-weather" title="Weather: ${data.weather?.sky || 'Clear'} (${data.weather?.tempC || 22}°C, Rain: ${data.weather?.rainfallMm || 0}mm, Solar: ${Math.round((data.weather?.solarIrradiance || 1.0) * 100)}%) — Click for Climate Radar">
          <span class="weather-icon">${data.weather?.icon || '☀️'}</span>
          <div class="weather-meta">
            <span class="weather-temp">${data.weather?.tempC || 22}°C</span>
            <span class="weather-sky">${data.weather?.sky || 'Crisp Clear Dawn'}</span>
          </div>
        </button>

        <!-- Central Vital Meters -->
        <div class="hud-vitals-group">
          <!-- ⚡ Energy -->
          <div class="vital-pill pill-energy clickable" id="btn-vital-energy" role="button" tabindex="0" title="Click to open Microgrid & Battery Storage Desk">
            <span class="vital-icon">⚡</span>
            <div class="vital-info">
              <span class="vital-val" id="vital-energy-val">${Math.round(data.resources.energyStoredKwh)} / ${data.resources.energyCapacityKwh} kWh</span>
              <div class="vital-bar"><div class="vital-fill fill-energy" id="vital-energy-bar" style="width: ${(data.resources.energyStoredKwh / data.resources.energyCapacityKwh) * 100}%"></div></div>
              <span class="vital-sub" style="color: #fbbf24;">MICROGRID ⚡</span>
            </div>
          </div>

          <!-- 💧 Water -->
          <div class="vital-pill pill-water clickable" id="btn-vital-water" role="button" tabindex="0" title="Click to open Water Management & Emergency Relief Desk">
            <span class="vital-icon">💧</span>
            <div class="vital-info">
              <span class="vital-val" id="vital-water-val">${Math.round(data.resources.waterLiters)} / ${data.resources.waterCapacityL} L</span>
              <div class="vital-bar"><div class="vital-fill fill-water" id="vital-water-bar" style="width: ${(data.resources.waterLiters / data.resources.waterCapacityL) * 100}%"></div></div>
              <span class="vital-sub" style="color: ${data.resources.waterLiters <= 0 ? '#f87171' : '#38bdf8'};">${data.resources.waterLiters <= 0 ? 'WATER CRISIS ⚠️' : 'WATER DESK 💧'}</span>
            </div>
          </div>

          <!-- 🥗 Food -->
          <div class="vital-pill pill-food clickable" id="btn-vital-food" role="button" tabindex="0" title="Click to view food harvest or unseal emergency camper van rations (+25,000 kcal)">
            <span class="vital-icon">🥗</span>
            <div class="vital-info">
              <span class="vital-val" id="vital-food-val">${Math.round(data.resources.foodKcal).toLocaleString()} kcal</span>
              <div class="vital-bar"><div class="vital-fill fill-food" id="vital-food-bar" style="width: ${Math.min(100, (data.resources.foodKcal / 100000) * 100)}%"></div></div>
              <span class="vital-sub" style="color: ${data.resources.foodKcal < 13200 ? '#f87171' : '#34d399'};">${data.resources.foodKcal < 13200 ? 'UNSEAL FOOD 🍚' : 'HARVEST INFO 🌱'}</span>
            </div>
          </div>

          <!-- ⏳ Pioneer Labor Pool & Daily Chores -->
          <div class="vital-pill pill-labor clickable" id="btn-vital-labor" role="button" tabindex="0" title="Click to view Daily Chores & Robot Helpers (Free Time Tracker)">
            <span class="vital-icon">⏳</span>
            <div class="vital-info">
              <span class="vital-val" id="vital-labor-val">${(data.chores?.remainingHours !== undefined ? data.chores.remainingHours : 6).toFixed(1)} / ${(data.chores?.dailyPoolHours || 6).toFixed(1)} h</span>
              <span class="vital-sub" style="color: #38bdf8;">DAILY CHORES 📋</span>
            </div>
          </div>

          <!-- 💰 Extractive Legacy Debt to Zero -->
          <div class="vital-pill pill-debt clickable" id="btn-vital-debt" role="button" tabindex="0" title="Click to open Debt Amortization Desk ($12k to $0)">
            <span class="vital-icon">💰</span>
            <div class="vital-info">
              <span class="vital-val" id="vital-debt-val" style="color: ${debt <= 0 ? '#34d399' : '#f87171'};">$${debt.toLocaleString()}</span>
              <span class="vital-sub">${debt <= 0 ? 'SOVEREIGN 🏆' : 'DEBT TO ZERO'}</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Mesh Map, Audio Toggle, Feast Pill & Profile -->
        <div class="hud-profile-group">
          ${isFeastDay ? `
            <button type="button" id="btn-hud-feast" class="btn-hud-feast-pill" title="Host Saturday Wood-Fired Pizza Feast!">
              <span>🍕 Saturday Feast!</span>
            </button>
          ` : ''}

          <button type="button" id="btn-hud-mesh" class="btn-hud-tool" title="Open Regional Reticulum Mesh Map">
            <span class="tool-icon">📡</span>
            <span class="tool-label">Mesh</span>
          </button>

          <button type="button" id="btn-hud-sound" class="btn-hud-tool" title="Toggle Procedural Synthesizer Audio">
            <span id="sound-icon">${soundFX.isMuted ? '🔇' : '🔊'}</span>
          </button>

          <button type="button" id="btn-hud-profile" class="btn-hud-profile" title="Open Pioneer Profile & 3D Character Studio">
            <span class="profile-star">👑</span>
            <span class="profile-name" id="hud-profile-name">${data.player.name} (${data.player.roleTitle.split(' ')[1] || 'You'})</span>
          </button>
        </div>
      </div>

      <!-- Solarpunk District Quick-Jump Ribbon (Centered Navigation) -->
      <div class="hud-district-ribbon" id="hud-district-ribbon">
        <button type="button" class="district-ribbon-btn ${this.selectedDistrict === 'whole_city' ? 'active' : ''}" data-district="whole_city" title="Macro Bird's-Eye View: Whole Solarpunk Eco-City (1250px Macro Terrain)">
          <span class="ribbon-icon">🌐</span>
          <span class="ribbon-label">City Map</span>
        </button>
        <button type="button" class="district-ribbon-btn ${this.selectedDistrict === 'agora_core' ? 'active' : ''}" data-district="agora_core" title="Center District: Agora Demarchy Core & Socratic Living Commons">
          <span class="ribbon-icon">🏛️</span>
          <span class="ribbon-label">Agora Core</span>
        </button>
        <button type="button" class="district-ribbon-btn ${this.selectedDistrict === 'agro_belt' ? 'active' : ''}" data-district="agro_belt" title="North District: Agro Commons Belt, Aquaponics Domes & Silos">
          <span class="ribbon-icon">🌾</span>
          <span class="ribbon-label">Agro Belt</span>
        </button>
        <button type="button" class="district-ribbon-btn ${this.selectedDistrict === 'fablab_quarter' ? 'active' : ''}" data-district="fablab_quarter" title="East District: Open FabLab Quarter, Gantry Mill & Solar Induction Foundry">
          <span class="ribbon-icon">⚙️</span>
          <span class="ribbon-label">FabLab Quarter</span>
        </button>
        <button type="button" class="district-ribbon-btn ${this.selectedDistrict === 'mhu_ecovillage' ? 'active' : ''}" data-district="mhu_ecovillage" title="South District: MHU Ecovillage, Modular Habitats & Passive Solar Cabins">
          <span class="ribbon-icon">🏡</span>
          <span class="ribbon-label">MHU Ecovillage</span>
        </button>
        <button type="button" class="district-ribbon-btn ${this.selectedDistrict === 'transit_hub' ? 'active' : ''}" data-district="transit_hub" title="West District: Logistics & Transit Vertiport, Cargo Trike Depot & Drones">
          <span class="ribbon-icon">🚆</span>
          <span class="ribbon-label">Transit Vertiport</span>
        </button>
      </div>

      <!-- Always-On Objective Card (Top Left) -->
      <div class="hud-objective-card" id="hud-objective-card">
        <div class="objective-header">
          <span class="objective-badge">★ PRIMARY OBJECTIVE</span>
          <span class="objective-counter" id="objective-counter">${data.objective.current} / ${data.objective.target}</span>
        </div>
        <div class="objective-title" id="objective-title">${data.objective.title}</div>
        <p class="objective-desc" id="objective-desc">${data.objective.description}</p>
        <div class="objective-reward" id="objective-reward">
          <span>🎁 ${data.objective.reward}</span>
        </div>
      </div>
    `;

    // 2. Render Terra Nil-Style Bottom Dock (Max 4 Choices)
    this.renderDock();
  }

  getAutoTier() {
    const buildings = gameState.data.buildings || [];
    const has = (t) => buildings.some(b => b.type === t);

    if (!has('solar_array') || !has('rain_cistern') || !has('garden_bed')) return 1;
    if (!has('lora_mast') || !has('guest_dome') || !has('reed_bed')) return 2;
    if (!has('fablab') || !has('farm_bot') || !has('auto_valves')) return 3;
    if (!has('foundry') || !has('kitchen_oven') || !has('clinic')) return 4;
    if (!has('food_forest') || !has('school') || !has('elder_sanctuary')) return 5;
    if (!has('agora')) return 6;
    return 7;
  }

  renderDock() {
    const buildings = gameState.data.buildings || [];
    const hasBuilding = (type) => buildings.some(b => b.type === type);

    const hasSolar = hasBuilding('solar_array');
    const hasCistern = hasBuilding('rain_cistern');
    const hasGarden = hasBuilding('garden_bed');
    const hasLora = hasBuilding('lora_mast');
    const hasGuest = hasBuilding('guest_dome');
    const hasReed = hasBuilding('reed_bed');
    const hasFablab = hasBuilding('fablab');
    const hasFarmBot = hasBuilding('farm_bot');
    const hasValves = hasBuilding('auto_valves');
    const hasFoundry = hasBuilding('foundry');
    const hasKitchen = hasBuilding('kitchen_oven');
    const hasClinic = hasBuilding('clinic');
    const hasForest = hasBuilding('food_forest');
    const hasSchool = hasBuilding('school');
    const hasElder = hasBuilding('elder_sanctuary');

    const autoTier = this.getAutoTier();
    const activeTier = this.selectedTier || autoTier;

    // Helper to generate a standardized dock building button with scalable multi-building support
    const makeSlotHtml = (type, icon, title, costH, reqBuilt, reqMsg) => {
      const kit = gameState.data.starterKits?.[type] || { maxLimit: 1, laborCostH: costH };
      const maxLimit = kit.maxLimit !== undefined ? kit.maxLimit : 1;
      const count = buildings.filter(b => b.type === type).length;
      const isMaxed = count >= maxLimit;

      if (!reqBuilt && count === 0) {
        return `
          <button type="button" class="dock-slot-btn locked" data-building="${type}" data-locked="true" data-req="${reqMsg}" title="Locked: ${reqMsg} — Click for details">
            <div class="dock-slot-icon">🔒</div>
            <div class="dock-slot-meta">
              <span class="dock-slot-title">${title}</span>
              <span class="dock-slot-cost">${reqMsg}</span>
            </div>
          </button>
        `;
      }

      if (isMaxed) {
        return `
          <button type="button" class="dock-slot-btn built" data-building="${type}" data-built="true" title="${title} operational (${count}/${maxLimit}) — Click to inspect and manage">
            <div class="dock-slot-icon">✅</div>
            <div class="dock-slot-meta">
              <span class="dock-slot-title">${title} (${count}/${maxLimit})</span>
              <span class="dock-slot-cost" style="color: #34d399;">Built • Inspect 🔍</span>
            </div>
          </button>
        `;
      }

      let costLabel = `${costH}h Labor`;
      let extraTitle = '';
      if (type === 'garden_bed') {
        costLabel = `${costH}h • +2.2k kcal/d`;
        extraTitle = ' • Yields +2,200 kcal/day fresh harvest every dawn';
      } else if (type === 'solar_array') {
        costLabel = `${costH}h • +1.5 kW`;
        extraTitle = ' • Recharges auxiliary van battery (+15 kWh capacity)';
      } else if (type === 'rain_cistern') {
        costLabel = `${costH}h • +1,000 L`;
        extraTitle = ' • Collects and filters rainwater (+30m² catchment)';
      } else if (type === 'deep_well') {
        costLabel = `${costH}h • +3k L, +250 L/d`;
        extraTitle = ' • Artesian solar pump (+250 L/day continuous flow)';
      } else if (type === 'battery_bank') {
        costLabel = `${costH}h • +50 kWh`;
        extraTitle = ' • Modular Sodium Battery Storage Rack';
      } else if (type === 'retention_swale') {
        costLabel = `${costH}h • +5,000 L`;
        extraTitle = ' • Perennial Rainwater Retention Basin';
      } else if (type === 'aquaponics_greenhouse') {
        costLabel = `${costH}h • +6k kcal/d`;
        extraTitle = ' • Closed-loop circular aquaponics dome in Agro Belt';
      } else if (type === 'grain_silo') {
        costLabel = `${costH}h • +30k kcal`;
        extraTitle = ' • Dry staple reserve storage in Agro Belt';
      } else if (type === 'heavy_gantry_mill') {
        costLabel = `${costH}h • 5-Axis CNC`;
        extraTitle = ' • Heavy automated structural milling in FabLab Quarter';
      } else if (type === 'solar_foundry') {
        costLabel = `${costH}h • Induction`;
        extraTitle = ' • Concentrated solar & induction crucible in FabLab Quarter';
      } else if (type === 'trike_depot') {
        costLabel = `${costH}h • Solar Depot`;
        extraTitle = ' • Open bay depot & solar chargers in Transit Vertiport';
      } else if (type === 'drone_vertiport') {
        costLabel = `${costH}h • Vertiport`;
        extraTitle = ' • Autonomous cargo drone hub in Transit Vertiport';
      } else if (type === 'mhu_dwelling') {
        costLabel = `${costH}h • 3 Pioneers`;
        extraTitle = ' • Cross-Laminated Timber Modular Habitat Unit (houses 3 pioneers)';
      }

      const isSelected = this.activeDockAction === type;
      const countSuffix = maxLimit > 1 ? ` (${count}/${maxLimit})` : '';
      const actionText = count > 0 ? 'Add ➕' : 'Build';

      return `
        <button type="button" class="dock-slot-btn ${isSelected ? 'active' : ''}" data-building="${type}" title="Construct ${title}${countSuffix} (Costs ${costH}h pioneer labor${extraTitle})">
          <div class="dock-slot-icon">${icon}</div>
          <div class="dock-slot-meta">
            <span class="dock-slot-title">${title}${countSuffix}</span>
            <span class="dock-slot-cost">${costLabel} • ${actionText}</span>
          </div>
        </button>
      `;
    };

    let slot1 = '';
    let slot2 = '';
    let slot3 = '';
    let slot4 = '';
    let slot5 = '';
    let slot6 = '';

    if (activeTier === 1) {
      // Tier 1: Survival Triad (Scalable arrays, cisterns and garden beds)
      slot1 = makeSlotHtml('solar_array', '⚡', 'Solar Array', 2.0, true, '');
      slot2 = makeSlotHtml('rain_cistern', '💧', 'Rain Cistern', 2.0, true, '');
      slot3 = makeSlotHtml('garden_bed', '🥗', 'Garden Bed', 2.0, true, '');
    } else if (activeTier === 2) {
      // Tier 2: Hospitality & Mesh & Housing
      slot1 = makeSlotHtml('lora_mast', '📡', 'LoRa Mast', 2.0, hasGarden, 'Needs Garden');
      slot2 = makeSlotHtml('guest_dome', '🏨', 'Guest Pavilion', 3.0, hasLora, 'Needs LoRa');
      slot3 = makeSlotHtml('reed_bed', '🌿', 'Greywater Reeds', 2.0, hasGuest, 'Needs Guest Dome');
      slot4 = makeSlotHtml('mhu_dwelling', '🏡', 'MHU Habitat', 4.0, hasGuest, 'Needs Guest Dome');
    } else if (activeTier === 3) {
      // Tier 3: Automation, Tooling & Scalable Artesian Wells
      slot1 = makeSlotHtml('fablab', '🛠️', 'FabLab Shop', 4.0, hasReed, 'Needs Reed Bed');
      slot2 = makeSlotHtml('farm_bot', '🤖', 'FarmBot CNC', 2.0, hasFablab, 'Needs FabLab');
      slot3 = makeSlotHtml('auto_valves', '💧', 'Auto-Valves', 1.5, hasFarmBot, 'Needs FarmBot');
      slot4 = makeSlotHtml('deep_well', '🚰', 'Artesian Well', 3.5, hasValves, 'Needs Valves');
      slot5 = makeSlotHtml('mhu_dwelling', '🏡', 'MHU Habitat', 4.0, true, '');
    } else if (activeTier === 4) {
      // Tier 4: Craft, Hearth & Scalable Sodium Battery Banks
      slot1 = makeSlotHtml('foundry', '🔥', 'Metal Foundry', 3.5, hasValves, 'Needs Tier 3');
      slot2 = makeSlotHtml('kitchen_oven', '🍲', 'Communal Hearth', 3.0, hasFoundry, 'Needs Foundry');
      slot3 = makeSlotHtml('clinic', '🩺', 'Health Clinic', 3.0, hasKitchen, 'Needs Hearth');
      slot4 = makeSlotHtml('battery_bank', '🔋', 'Battery Bank', 3.0, hasFoundry, 'Needs Foundry');
      slot5 = makeSlotHtml('mhu_dwelling', '🏡', 'MHU Habitat', 4.0, true, '');
    } else if (activeTier === 5) {
      // Tier 5: Ecology, Knowledge & Scalable Retention Swales
      slot1 = makeSlotHtml('food_forest', '🌲', 'Food Forest', 3.0, hasClinic, 'Needs Clinic');
      slot2 = makeSlotHtml('school', '📚', 'Open School', 3.0, hasForest, 'Needs Forest');
      slot3 = makeSlotHtml('elder_sanctuary', '👵', 'Elder Cabins', 3.0, hasSchool, 'Needs School');
      slot4 = makeSlotHtml('retention_swale', '🌿', 'Water Swale', 3.5, hasForest, 'Needs Forest');
      slot5 = makeSlotHtml('mhu_dwelling', '🏡', 'MHU Habitat', 4.0, true, '');
    } else if (activeTier === 6) {
      // Tier 6: The Agora & Megaprojects
      slot1 = makeSlotHtml('agora', '🏛️', 'Agora Ring', 4.0, hasElder, 'Needs Elder Cabins');
      slot2 = makeSlotHtml('biogas_digester', '♻️', 'Biogas Digester', 4.0, hasBuilding('agora'), 'Needs Agora');
      slot3 = makeSlotHtml('seed_vault', '🌾', 'Seed Vault', 3.5, hasBuilding('biogas_digester'), 'Needs Biogas');
      slot4 = makeSlotHtml('solar_thermal_tower', '🗼', 'Thermal Tower', 5.0, hasBuilding('seed_vault'), 'Needs Seed Vault');
      slot5 = makeSlotHtml('mhu_dwelling', '🏡', 'MHU Habitat', 4.0, true, '');
    } else {
      // Tier 7: District-Scale Eco-City Infrastructure
      slot1 = makeSlotHtml('aquaponics_greenhouse', '🥬', 'Aquaponics Dome', 3.5, hasBuilding('agora'), 'Needs Agora');
      slot2 = makeSlotHtml('grain_silo', '🌾', 'Grain Silo', 3.0, hasBuilding('agora'), 'Needs Agora');
      slot3 = makeSlotHtml('heavy_gantry_mill', '⚙️', 'Gantry Mill', 4.5, hasBuilding('agora'), 'Needs Agora');
      slot4 = makeSlotHtml('solar_foundry', '🔥', 'Solar Foundry', 4.0, hasBuilding('agora'), 'Needs Agora');
      slot5 = makeSlotHtml('trike_depot', '🚲', 'Trike Depot', 3.0, hasBuilding('agora'), 'Needs Agora');
      slot6 = makeSlotHtml('drone_vertiport', '🚁', 'Drone Vertiport', 4.0, hasBuilding('agora'), 'Needs Agora');
    }

    this.dockContainer.innerHTML = `
      <!-- Tier Switcher Navigation (Clean Solarpunk Tabs) -->
      <div class="dock-tier-switcher">
        <button type="button" class="tier-tab-btn ${activeTier === 1 ? 'active' : ''}" data-tier="1">
          🌱 1: Survival
        </button>
        <button type="button" class="tier-tab-btn ${activeTier === 2 ? 'active' : ''} ${!hasGarden ? 'tab-locked' : ''}" data-tier="2" data-locked="${!hasGarden}" data-req="Complete Tier 1 first" title="${!hasGarden ? 'Locked: Complete Tier 1' : 'Tier 2: Mesh & Hospitality'}">
          🏨 2: Mesh
        </button>
        <button type="button" class="tier-tab-btn ${activeTier === 3 ? 'active' : ''} ${!hasReed ? 'tab-locked' : ''}" data-tier="3" data-locked="${!hasReed}" data-req="Complete Tier 2 first" title="${!hasReed ? 'Locked: Complete Tier 2' : 'Tier 3: Tooling & FabLab'}">
          🤖 3: Tools
        </button>
        <button type="button" class="tier-tab-btn ${activeTier === 4 ? 'active' : ''} ${!hasValves ? 'tab-locked' : ''}" data-tier="4" data-locked="${!hasValves}" data-req="Complete Tier 3 first" title="${!hasValves ? 'Locked: Complete Tier 3' : 'Tier 4: Craft & Hearth'}">
          🔥 4: Hearth
        </button>
        <button type="button" class="tier-tab-btn ${activeTier === 5 ? 'active' : ''} ${!hasClinic ? 'tab-locked' : ''}" data-tier="5" data-locked="${!hasClinic}" data-req="Complete Tier 4 first" title="${!hasClinic ? 'Locked: Complete Tier 4' : 'Tier 5: Ecology & Knowledge'}">
          🌲 5: Ecology
        </button>
        <button type="button" class="tier-tab-btn ${activeTier === 6 ? 'active' : ''} ${!hasElder ? 'tab-locked' : ''}" data-tier="6" data-locked="${!hasElder}" data-req="Complete Tier 5 first" title="${!hasElder ? 'Locked: Complete Tier 5' : 'Tier 6: Agora & Megaprojects'}">
          🏛️ 6: Agora
        </button>
        <button type="button" class="tier-tab-btn ${activeTier === 7 ? 'active' : ''} ${!hasBuilding('agora') ? 'tab-locked' : ''}" data-tier="7" data-locked="${!hasBuilding('agora')}" data-req="Complete Agora first" title="${!hasBuilding('agora') ? 'Locked: Complete Agora' : 'Tier 7: District-Scale Eco-City'}">
          🌐 7: Districts
        </button>
      </div>

      <!-- Terra Nil-Style Dock (3 to 6 slots + Rest) -->
      <div class="terra-nil-dock">
        ${slot1}
        ${slot2}
        ${slot3}
        ${slot4 || ''}
        ${slot5 || ''}
        ${slot6 || ''}

        <!-- Slot Rest: Rest & Greet Tomorrow -->
        <button type="button" class="dock-slot-btn dock-btn-rest ${(gameState.data.chores?.remainingHours || 0) < 2.0 ? 'rest-recommended' : ''}" id="btn-dock-rest" title="Advance time to next dawn and restore pioneer labor">
          <div class="dock-slot-icon">🌙</div>
          <div class="dock-slot-meta">
            <span class="dock-slot-title">Rest to Dawn</span>
            <span class="dock-slot-cost">${(gameState.data.chores?.remainingHours || 0) < 2.0 ? '✨ Restore Labor' : 'Greet Tomorrow'}</span>
          </div>
        </button>
      </div>
    `;

    this.bindDockButtons();
  }

  bindEvents() {
    // Profile Modal Trigger
    const profileBtn = this.hudContainer.querySelector('#btn-hud-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        soundFX.playClick();
        profileModal.open();
      });
    }

    // Dynamic Weather Telemetry Trigger
    const weatherBtn = this.hudContainer.querySelector('#btn-hud-weather');
    if (weatherBtn) {
      weatherBtn.addEventListener('click', () => {
        soundFX.playClick();
        eventModal.open('weather_radar');
      });
    }

    // Energy / Microgrid Desk Trigger
    const energyBtn = this.hudContainer.querySelector('#btn-vital-energy');
    if (energyBtn) {
      energyBtn.addEventListener('click', () => {
        soundFX.playClick();
        eventModal.open('energy_management');
      });
    }

    // Water Management & Emergency Relief Trigger
    const waterBtn = this.hudContainer.querySelector('#btn-vital-water');
    if (waterBtn) {
      waterBtn.addEventListener('click', () => {
        soundFX.playClick();
        eventModal.open('water_management');
      });
    }

    // Food Pill Trigger (Emergency Unseal & Harvest Status)
    const foodBtn = this.hudContainer.querySelector('#btn-vital-food');
    if (foodBtn) {
      foodBtn.addEventListener('click', () => {
        soundFX.playClick();
        const food = gameState.data.resources.foodKcal || 0;
        const caches = gameState.data.emergencyPantryCaches !== undefined ? gameState.data.emergencyPantryCaches : 3;

        if (food < 25000 && caches > 0) {
          const res = gameState.unsealEmergencyPantry();
          if (res.ok) {
            soundFX.playChoreExtinctionFanfare();
            this.canvas?.addFloatingText(0, -60, `🍚 Unsealed +25,000 kcal emergency van rations!`, '#34d399');
          }
        } else {
          const gardenCount = gameState.data.buildings.filter(b => b.type === 'garden_bed').length;
          const dailyHarvest = gardenCount * 2200;
          this.canvas?.addFloatingText(0, -60, `🥗 Food: ${Math.round(food).toLocaleString()} kcal (${dailyHarvest > 0 ? `+${dailyHarvest} kcal/day harvest` : 'Place Garden Beds to harvest'})`, '#38bdf8');
        }
      });
    }

    // Labor / Chore Board Trigger
    const laborBtn = this.hudContainer.querySelector('#btn-vital-labor');
    if (laborBtn) {
      laborBtn.addEventListener('click', () => {
        soundFX.playClick();
        choreBoardModal.open();
      });
    }

    // Legacy Debt to Zero Trigger
    const debtBtn = this.hudContainer.querySelector('#btn-vital-debt');
    if (debtBtn) {
      debtBtn.addEventListener('click', () => {
        soundFX.playClick();
        eventModal.open('debt_consulting');
      });
    }

    // Reticulum Mesh Map Trigger
    const meshBtn = this.hudContainer.querySelector('#btn-hud-mesh');
    if (meshBtn) {
      meshBtn.addEventListener('click', () => {
        soundFX.playClick();
        worldMapModal.open();
      });
    }

    // Sound Synthesizer Mute Toggle
    const soundBtn = this.hudContainer.querySelector('#btn-hud-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const unmuted = soundFX.toggleMute();
        const iconEl = this.hudContainer.querySelector('#sound-icon');
        if (iconEl) iconEl.textContent = unmuted ? '🔊' : '🔇';
        if (unmuted) soundFX.playClick();
      });
    }

    // Saturday Feast Banner Trigger
    const feastBtn = this.hudContainer.querySelector('#btn-hud-feast');
    if (feastBtn) {
      feastBtn.addEventListener('click', () => {
        eventModal.open('feast');
      });
    }

    // Solarpunk District Quick-Jump Ribbon Click Listeners
    this.hudContainer.querySelectorAll('.district-ribbon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        const dist = btn.dataset.district;
        this.selectDistrict(dist);
      });
    });

    // Global Solarpunk Hotkeys (1-7 for Progression Tiers, 0/G for Whole City Map, Escape to Cancel)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const hasModal = document.querySelector('.modal-overlay:not(.hidden)');
      if (hasModal) return;

      if (e.key >= '1' && e.key <= '7') {
        const targetTier = parseInt(e.key, 10);
        soundFX.playClick();
        this.selectedTier = targetTier;
        this.renderDock();
      } else if (e.key === '0' || e.key.toLowerCase() === 'g') {
        soundFX.playClick();
        this.selectDistrict('whole_city');
      } else if (e.key === 'Escape') {
        if (this.activeDockAction) {
          this.activeDockAction = null;
          this.canvas?.cancelPlacementMode();
          this.renderDock();
        }
      }
    });

    // Primary Objective Card Click -> Direct Contextual Action
    const objCard = this.hudContainer.querySelector('#hud-objective-card');
    if (objCard) {
      objCard.style.cursor = 'pointer';
      objCard.setAttribute('title', 'Click to take immediate action on this objective');
      objCard.addEventListener('click', () => {
        soundFX.playClick();
        const obj = gameState.data.objective;
        if (!obj) return;

        // If debt objective: open Debt Consulting Desk
        if (obj.id === 'obj-step10-debt' || (gameState.data.debtUsd > 0 && (obj.title?.toLowerCase().includes('debt') || obj.id?.includes('debt')))) {
          eventModal.open('debt_consulting');
          this.canvas?.addFloatingText(0, -60, '💼 Opening Debt Consulting Desk...', '#38bdf8');
          return;
        }

        // If building objective: switch tier and activate placement mode
        const buildingMap = {
          'obj-day1-solar': 'solar_array',
          'obj-tier1-solar': 'solar_array',
          'obj-day2-water': 'rain_cistern',
          'obj-tier1-cistern': 'rain_cistern',
          'obj-day3-food': 'garden_bed',
          'obj-tier1-garden': 'garden_bed',
          'obj-day4-lora': 'lora_mast',
          'obj-tier2-mesh': 'lora_mast',
          'obj-day6-guest': 'guest_dome',
          'obj-tier2-guest': 'guest_dome',
          'obj-day8-reed': 'reed_bed',
          'obj-tier2-reed': 'reed_bed',
          'obj-day10-fablab': 'fablab',
          'obj-day11-fablab': 'fablab',
          'obj-tier3-fablab': 'fablab',
          'obj-day11-farmbot': 'farm_bot',
          'obj-day12-farmbot': 'farm_bot',
          'obj-tier3-farmbot': 'farm_bot',
          'obj-day12-valves': 'auto_valves',
          'obj-day13-valves': 'auto_valves',
          'obj-tier3-valves': 'auto_valves',
          'obj-day15-foundry': 'foundry',
          'obj-tier4-foundry': 'foundry',
          'obj-day16-kitchen': 'kitchen_oven',
          'obj-tier4-kitchen': 'kitchen_oven',
          'obj-tier4-clinic': 'clinic',
          'obj-tier5-forest': 'food_forest',
          'obj-tier5-school': 'school',
          'obj-tier5-elder': 'elder_sanctuary',
          'obj-tier6-agora': 'agora',
          'obj-tier6-biogas': 'biogas_digester',
          'obj-tier6-vault': 'seed_vault'
        };
        const bType = buildingMap[obj.id];
        if (bType) {
          const tierOfBuilding = {
            solar_array: 1, rain_cistern: 1, garden_bed: 1,
            lora_mast: 2, guest_dome: 2, reed_bed: 2,
            fablab: 3, farm_bot: 3, auto_valves: 3,
            foundry: 4, kitchen_oven: 4, clinic: 4,
            food_forest: 5, school: 5, elder_sanctuary: 5,
            agora: 6, biogas_digester: 6, seed_vault: 6
          }[bType] || 1;
          this.selectedTier = tierOfBuilding;
          this.renderDock();
          this.togglePlacement(bType);
          this.canvas?.addFloatingText(0, -60, `📍 Place ${obj.title.split(':')[1] || obj.title} on the plot`, '#38bdf8');
          return;
        }

        // Chores or food
        if (obj.id?.includes('chore') || obj.id?.includes('food')) {
          choreBoardModal.open();
          return;
        }

        if (obj.id === 'obj-day7-feast') {
          eventModal.open('feast');
          return;
        }

        this.canvas?.addFloatingText(0, -60, `★ Goal: ${obj.title}`, '#34d399');
      });
    }

    // React to live game events
    gameState.on('resources_updated', (res) => {
      this.updateResourceMeters(res);
    });

    gameState.on('debt_updated', () => {
      const debtEl = this.hudContainer.querySelector('#vital-debt-val');
      if (debtEl) {
        const debt = gameState.data.debtUsd !== undefined ? gameState.data.debtUsd : 12000;
        debtEl.textContent = `$${debt.toLocaleString()}`;
        debtEl.style.color = debt <= 0 ? '#34d399' : '#f87171';
      }
      this.updateResourceMeters(gameState.data.resources);
      if (gameState.data.objective) {
        this.updateObjective(gameState.data.objective);
      }
      this.renderDock();
    });

    gameState.on('day_advanced', () => {
      this.renderDock();
      this.updateResourceMeters(gameState.data.resources);
      if (gameState.data.objective) {
        this.updateObjective(gameState.data.objective);
      }
    });

    gameState.on('objective_updated', (obj) => {
      this.updateObjective(obj);
      this.renderDock();
    });

    gameState.on('building_added', () => {
      this.renderDock();
      this.updateResourceMeters(gameState.data.resources);
    });

    gameState.on('chore_extinguished', ({ automationName }) => {
      soundFX.playChoreExtinctionFanfare();
      this.canvas?.addFloatingText(0, -60, `🏆 ${automationName} Automated!`, '#34d399');
    });

    gameState.on('day_advanced', (data) => {
      const dayEl = this.hudContainer.querySelector('.site-day');
      if (dayEl) dayEl.textContent = `DAY ${data.day} • DAWN 06:00`;
      this.updateResourceMeters(data.resources);
      this.canvas?.addFloatingText(0, -60, `🌅 Welcome to Day ${data.day} Dawn!`, '#fbbf24');

      // Open Morning Dispatch modal with overnight audit
      morningDispatchModal.open(data.report, () => {
        this.canvas?.addFloatingText(0, -30, `Crew energized • Daily chores ready`, '#34d399');

        // Trigger scheduled event after morning dispatch is dismissed
        const sched = data.report?.scheduledEvent;
        if (sched) {
          setTimeout(() => {
            if (sched.type === 'weather_crisis') {
              eventModal.open('weather_crisis', { id: sched.id, title: sched.title });
            } else if (sched.type === 'legacy_threat') {
              eventModal.open('legacy_threat', { id: sched.id, title: sched.title });
            } else if (sched.type === 'weekend_activity') {
              eventModal.open('weekend_activity', { id: sched.id, title: sched.title });
            } else if (sched.type === 'demarchy_dilemma') {
              eventModal.open('demarchy_dilemma', { id: sched.id, title: sched.title });
            }
          }, 400);
        } else if (data.day % 7 === 0 && !gameState.data.weekendFeastCelebrated) {
          setTimeout(() => {
            eventModal.open('feast');
          }, 400);
        }
      });

      this.render();
    });

    gameState.on('player_updated', (p) => {
      const nameEl = this.hudContainer.querySelector('#hud-profile-name');
      if (nameEl) nameEl.textContent = `${p.name} (${p.roleTitle.split(' ')[1] || 'You'})`;
    });
  }

  bindDockButtons() {
    // Tier Switcher tabs
    this.dockContainer.querySelectorAll('.tier-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        if (btn.dataset.locked === 'true') {
          this.canvas?.addFloatingText(0, -60, `🔒 ${btn.dataset.req || 'Complete previous tier first'}`, '#f87171');
          return;
        }
        this.selectedTier = parseInt(btn.dataset.tier, 10);
        this.renderDock();
      });
    });

    // Built building inspector clicks
    this.dockContainer.querySelectorAll('.dock-slot-btn.built').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        const type = btn.dataset.building;
        const b = gameState.data.buildings.find(item => item.type === type);
        if (b) {
          buildingInspector.open(b);
          this.canvas?.addFloatingText(b.x || 0, (b.y || 0) - 28, `🔍 Inspecting ${b.name || type}`, '#38bdf8');
        }
      });
    });

    // Locked building clicks
    this.dockContainer.querySelectorAll('.dock-slot-btn.locked').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        const type = btn.dataset.building;
        const req = btn.dataset.req || '';
        if (type === 'fablab' || req.includes('Debt')) {
          eventModal.open('debt_consulting');
          this.canvas?.addFloatingText(0, -60, '💼 Earn consulting fees to clear the $12k debt and unlock the FabLab!', '#38bdf8');
        } else {
          this.canvas?.addFloatingText(0, -60, `🔒 Locked: ${req}`, '#f87171');
        }
      });
    });

    // Constructible building placement buttons
    this.dockContainer.querySelectorAll('.dock-slot-btn:not(.built):not(.locked):not(#btn-dock-rest)').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        const type = btn.dataset.building;
        this.togglePlacement(type);
      });
    });

    // Rest to Dawn button
    const restBtn = this.dockContainer.querySelector('#btn-dock-rest');
    if (restBtn) {
      restBtn.addEventListener('click', () => {
        this.canvas?.cancelPlacementMode();
        this.activeDockAction = null;

        const chores = gameState.data.chores || {};
        const remainingH = chores.remainingHours !== undefined ? chores.remainingHours : 6.0;

        // Confirmation toast if unused labor remains
        if (remainingH >= 2.0 && !this.pendingEarlyRest) {
          this.pendingEarlyRest = true;
          const debt = gameState.data.debtUsd || 0;
          if (debt > 0) {
            this.canvas?.addFloatingText(0, -60, `💡 ${remainingH.toFixed(1)}h unused labor! Take consulting to pay debt, or click Rest again.`, '#f59e0b');
          } else {
            this.canvas?.addFloatingText(0, -60, `⚠️ ${remainingH.toFixed(1)}h unused labor! Click Rest again to turn in early.`, '#f59e0b');
          }
          setTimeout(() => {
            this.pendingEarlyRest = false;
          }, 3500);
          return;
        }
        this.pendingEarlyRest = false;

        // Disable button during transition to prevent spamming
        restBtn.disabled = true;

        if (this.canvas?.playNightfallTransition) {
          this.canvas.playNightfallTransition(
            () => {
              gameState.restUntilTomorrow();
            },
            () => {
              restBtn.disabled = false;
            }
          );
        } else {
          gameState.restUntilTomorrow();
          restBtn.disabled = false;
        }
      });
    }
  }

  selectDistrict(districtId) {
    this.selectedDistrict = districtId;
    const ribbonBtns = this.hudContainer?.querySelectorAll('.district-ribbon-btn');
    ribbonBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.district === districtId);
    });
    if (this.canvas) {
      if (districtId === 'whole_city') {
        this.canvas.flyTo(0, 0, 0.35, 1200);
        this.canvas.addFloatingText(0, -100, `🌐 Eco-City Bird's-Eye View`, '#38bdf8');
      } else {
        this.canvas.flyToDistrict(districtId);
      }
    }
  }

  togglePlacement(type) {
    if (this.activeDockAction === type) {
      this.activeDockAction = null;
      this.canvas?.cancelPlacementMode();
    } else {
      this.activeDockAction = type;
      this.canvas?.setPlacementMode(type);

      // Auto-guide camera to designated district if district structure
      const districtMap = {
        aquaponics_greenhouse: 'agro_belt',
        grain_silo: 'agro_belt',
        heavy_gantry_mill: 'fablab_quarter',
        solar_foundry: 'fablab_quarter',
        trike_depot: 'transit_hub',
        drone_vertiport: 'transit_hub',
        agora: 'agora_core'
      };
      const targetDist = districtMap[type];
      if (targetDist) {
        this.selectDistrict(targetDist);
      }
    }
    this.renderDock();
  }

  updateResourceMeters(res) {
    const eVal = this.hudContainer.querySelector('#vital-energy-val');
    const eBar = this.hudContainer.querySelector('#vital-energy-bar');
    if (eVal && eBar) {
      eVal.textContent = `${Math.round(res.energyStoredKwh)} / ${res.energyCapacityKwh} kWh`;
      eBar.style.width = `${Math.min(100, (res.energyStoredKwh / res.energyCapacityKwh) * 100)}%`;
    }

    const wVal = this.hudContainer.querySelector('#vital-water-val');
    const wBar = this.hudContainer.querySelector('#vital-water-bar');
    if (wVal && wBar) {
      wVal.textContent = `${Math.round(res.waterLiters)} / ${res.waterCapacityL} L`;
      wBar.style.width = `${Math.min(100, (res.waterLiters / res.waterCapacityL) * 100)}%`;
    }

    const weatherBtn = this.hudContainer.querySelector('#btn-hud-weather');
    if (weatherBtn && gameState.data.weather) {
      const w = gameState.data.weather;
      weatherBtn.innerHTML = `
        <span class="weather-icon">${w.icon || '☀️'}</span>
        <div class="weather-meta">
          <span class="weather-temp">${w.tempC}°C</span>
          <span class="weather-sky">${w.sky}</span>
        </div>
      `;
    }

    const fVal = this.hudContainer.querySelector('#vital-food-val');
    const fBar = this.hudContainer.querySelector('#vital-food-bar');
    if (fVal && fBar) {
      fVal.textContent = `${Math.round(res.foodKcal).toLocaleString()} kcal`;
      fBar.style.width = `${Math.min(100, (res.foodKcal / 50000) * 100)}%`;
    }

    const lVal = this.hudContainer.querySelector('#vital-labor-val');
    if (lVal && gameState.data.chores) {
      const rem = gameState.data.chores.remainingHours !== undefined ? gameState.data.chores.remainingHours : 6.0;
      const pool = gameState.data.chores.dailyPoolHours || 6.0;
      lVal.textContent = `${rem.toFixed(1)} / ${pool.toFixed(1)} h`;
    }

    const dVal = this.hudContainer.querySelector('#vital-debt-val');
    if (dVal && gameState.data.debtUsd !== undefined) {
      dVal.textContent = `$${gameState.data.debtUsd.toLocaleString()}`;
      dVal.style.color = gameState.data.debtUsd <= 0 ? '#34d399' : '#f87171';
    }
  }

  updateObjective(obj) {
    const cEl = this.hudContainer.querySelector('#objective-counter');
    const tEl = this.hudContainer.querySelector('#objective-title');
    const dEl = this.hudContainer.querySelector('#objective-desc');
    const rEl = this.hudContainer.querySelector('#objective-reward');

    if (cEl) cEl.textContent = `${obj.current} / ${obj.target}`;
    if (tEl) tEl.textContent = obj.title;
    if (dEl) dEl.textContent = obj.description;
    if (rEl) rEl.innerHTML = `<span>🎁 ${obj.reward}</span>`;
  }
}
