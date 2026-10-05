# **O.N.E. Living Commons Game — Architectural Codebase Skeleton (`_skeleton.md`)**

**Document Version:** 1.0.0  
**Repository Path:** `game/`  
**Persona & Author:** Kyberlex (`kyberlex@proton.me`)  
**License:** AGPL-3.0-or-later  
**Updated:** 2026-10-05  

---

## **1. SYSTEM DIRECTORY TREE & COMPONENT OVERVIEW**

```
game/
├── index.html                   # HTML5 Entrypoint & viewport configuration
├── vite.config.js               # Vite bundler build & local development server configuration
├── package.json                 # Project dependencies (Leaflet, Three.js, Trystero) & scripts
├── TODO.md                      # Civilization expansion roadmap & backlogged milestones
├── SKILL.md                     # Operational protocol for O.N.E. game engine & sim reuse
├── game.md                      # Game design document & complete mechanics bible
├── public/                      # Static assets served at root
│   ├── world_snapshot.json      # Public anchored world state snapshot
│   ├── icons.svg / favicon.svg  # Solarpunk SVG icons and browser favicons
│   ├── one-logo*.svg / *.png    # Luminous O.N.E. branding assets
│   └── assets/map/              # High & low-resolution offline world map textures (.webp)
└── src/
    ├── main.js                  # Application bootstrap, routing & screen switcher
    ├── style.css                # Solarpunk master CSS token system & glassmorphism UI
    ├── core/
    │   └── state.js             # Central reactive GameState store & thermodynamic physics engine
    ├── render/
    │   └── settlement_canvas.js # 2D Canvas procedural renderer, lighting & sensory juice engine
    ├── audio/
    │   └── sound_fx.js          # Web Audio API procedural soundscape synthesizer
    ├── map/
    │   ├── hex.js               # H3 hexagonal math & spatial index
    │   ├── renderer.js          # Leaflet custom canvas and overlay renderer
    │   ├── solar_terminator.js  # Astronomical solar terminator night-shadow calculations
    │   ├── world.js             # Global geography, oceans, and bioregion boundaries
    │   └── world_map.js         # Interactive Leaflet planetary map controller
    ├── data/
    │   ├── bioregions.js        # Bioregion climate parameters, solar yield & rainfall baselines
    │   └── cities.js            # Global candidate starter beacons & sister nodes
    ├── ui/
    │   ├── hud.js               # Top HUD (tickers, objective card) & Contextual Bottom Dock
    │   ├── embarkation.js       # Milestone 1 onboarding flow & avatar/seed selection
    │   ├── building_inspector.js# Building inspection modal & dual-track hardware specs
    │   ├── event_modal.js       # Crisis dilemmas, milestone achievements & morning alerts
    │   ├── morning_dispatch_modal.js # Dawn simulation report & chore allocation review
    │   ├── chore_board_modal.js # Manual chore board & open-hardware automation tracker
    │   ├── profile_modal.js     # Pioneer profile, skills & usufruct housing status
    │   ├── world_map_modal.js   # Regional Leaflet map modal & convoy dispatching
    │   ├── avatar_customizer.js # Visual avatar editor (hair, skin, clothing, gender)
    │   └── avatar_3d_viewer.js  # Three.js 3D avatar viewport & real-time mesh renderer
    └── i18n/
        ├── index.js             # Dynamic internationalization resolver `t(key, fallback)`
        └── [en, it, es, fr, de, pt, ru, zh, ja, ko, hi, ar, id, tr].js # 14 complete language dictionaries
```

---

## **2. PER-FILE CODE SKELETON & STRUCTURAL BREAKDOWN**

### **2.1. Core Orchestration & Application Lifecycle**

#### **`game/src/main.js`**
* **File Path:** `game/src/main.js` (77 lines, 2.6 KB)
* **Role & Responsibility:** Application entrypoint. Initializes DOM containers, detects previous save states, manages the smooth transition between the Embarkation Desk and the Living Plot Canvas, and instantiates the `SettlementCanvas` and `GameHUD`.
* **Imports:**
  - `gameState` from `./core/state.js`
  - `EmbarkationDesk` from `./ui/embarkation.js`
  - `SettlementCanvas` from `./render/settlement_canvas.js`
  - `GameHUD` from `./ui/hud.js`
* **Exported Objects / Globals:**
  - `window.gameState`: Global state reference for runtime debugging.
  - `window.settlementCanvas`: Active canvas instance.
  - `window.gameHUD`: Active HUD controller.
* **Internal Functions:**
  - `startLivingPlot(data)`: Mounts canvas elements, initializes `SettlementCanvas` and `GameHUD`, triggers dawn landing floating text.
* **State & Lifecycle Flow:**
  - If `gameState.data.embarked` or `gameState.data.day > 1` is true, skips onboarding and resumes directly into the active settlement.
  - Otherwise, displays `EmbarkationDesk` and waits for player completion callback.

---

#### **`game/src/core/state.js`**
* **File Path:** `game/src/core/state.js` (2,226 lines, 93.3 KB)
* **Role & Responsibility:** Central reactive single source of truth. Manages all game data, thermodynamic balances (kWh, L, kcal, waste), demographic rosters, chore labor pool, building catalogue, district spatial zoning, diurnal cycle, daily simulation tick (`restUntilTomorrow`), emergency contingency actions, and IndexedDB/localStorage persistence.
* **Exports:**
  - `GameState` (Class)
  - `gameState` (Default Singleton Instance)
* **Key State Properties (`this.data`):**
  - `day`, `hour`, `isNight`, `speed`: Time progression counters.
  - `player`: Player character object (name, vocationId, roleTitle, appearance, icon).
  - `companions`: Array of pioneer companions (Maya, Leo, etc.) with vocations and statuses.
  - `location`: Bioregional anchor (name, lat, lng, bioregion).
  - `resources`: `energyStoredKwh`, `energyCapacityKwh`, `waterLiters`, `waterCapacityL`, `foodKcal`, `emergencyPantryCaches`, `wasteKg`.
  - `weather`: Ambient temperature, sky condition, rainfallMm, solarIrradiance, windSpeedKmh, cloudCover.
  - `buildings`: Array of placed structure instances (`id`, `type`, `name`, `x`, `y`, `status`, `health`, etc.).
  - `districts`: Spatial zones (`pioneer_commons`, `agro_belt`, `fablab_district`, `residential_ecovillage`, `transit_vertiport`).
  - `chores`: Daily 6-hour chore pool, `remainingHours`, `loggedToday`, and automation progression queue (`extinguishChore`).
  - `objective`: Active primary objective card tracking goals and unlocks.
  - `convoys`: In-transit regional trade convoys (cargo trikes & VTOL drones).
  - `milestones`: Set of completed civilizational milestones.
* **Key Methods:**
  - `on(event, cb)`, `emit(event, payload)`: Custom event emitter for reactive UI updates.
  - `setPlayerProfile(name, vocationId, appearance)`: Initializes character data.
  - `addBuilding(type, x, y)`: Validates placement, checks district zoning, deducts labor/resources, records building.
  - `recalculateLaborBudget()`: Recalculates chore pool based on automated chores and population.
  - `extinguishChore(choreId, automationName)`: Permanently replaces manual chore with open-source automation.
  - `restUntilTomorrow()`: Executes the daily thermodynamic simulation loop:
    * Calculates solar PV generation via bioregional irradiance curves and weather.
    * Computes wind generation via Betz limit and atmospheric speed.
    * Deducts basal metabolic caloric consumption (2,200 kcal/person/day).
    * Calculates water consumption and greywater reed-bed biological filtration return (65%).
    * Simulates component wear-and-tear degradation.
    * Resolves active trade convoys and triggers morning dispatch events.
  - `orderEmergencyWaterTanker()`, `pumpEmergencyAquiferWater()`, `deployAtmosphericDewCatchers()`, `requestMeshEmergencyWater()`: Emergency water contingency actions.
  - `dispatchCargoConvoy(...)`: Dispatches inter-node trade missions.
  - `save()`, `load()`, `reset()`: Local storage persistence handlers.

---

### **2.2. Rendering, Audio & Simulation Mechanics**

#### **`game/src/render/settlement_canvas.js`**
* **File Path:** `game/src/render/settlement_canvas.js` (3,354 lines, 142.1 KB)
* **Role & Responsibility:** High-performance procedural 2D Canvas rendering engine. Renders the living campsite/ecovillage, camper van, animated pioneer sprites, terrain, weather particles, circadian lighting overlays, and tactile visual feedback ("juice").
* **Imports:**
  - `gameState` from `../core/state.js`
  - `soundFX` from `../audio/sound_fx.js`
* **Exports:**
  - `SettlementCanvas` (Class)
* **Key Visual Systems & Rendering Pipelines:**
  - `renderGround(ctx)`: Procedural grass meadows, dirt pathways, stone pavers, organic clearing clearing radius, and district zoning boundary glows.
  - `renderTrees(ctx)`: Procedural forest perimeter with wind swaying and seasonal leaf tinting.
  - `renderCamperVan(ctx)`: Detailed pixel-perfect camper van sprite, deployable awning, rooftop solar array, and under-carriage shadow.
  - `renderBuildings(ctx)`: Vector rendering of all open-hardware modules:
    * Bifacial solar arrays with animated sun-tracking orientation.
    * Vertical-axis and horizontal-axis spinning wind turbines.
    * Rainwater cisterns with dynamic translucent water level indicators.
    * Bio-intensive greenhouses with growing crop rows and misting nozzles.
    * FabLab machine shop with robotic arms and welding sparks.
    * MHU Modular Habitat Units with timber chassis, living roofs, and kitchen gardens.
  - `renderPioneers(ctx)`: Dynamic walking pioneer characters with pathfinding, tool animations (hoeing, soldering, wrenching), and speech bubbles.
  - `renderConvoys(ctx)`: Overland cargo trikes pedaling along logistics pathways and VTOL drones taking off vertically from Vertiports.
  - `renderCircadianOverlay(ctx)`: Dynamic lighting blending dawn orange, bright noon sunlight, amber dusk, and deep starry nightfall.
  - `renderWeather(ctx)`: Raindrop particle streaks, ground water ripples, wind drift particles, and lightning flash effects.
  - `renderJuice(ctx)`: Floating delta text (`+15 kWh`, `-20 L`), dust puffs on construction placement, and spring bounce transforms.
* **Camera & Coordinate Systems:**
  - Smooth pan and zoom (`screenToWorld`, `worldToScreen`, `flyTo`, `flyToDistrict`).
  - Interactive drag-and-drop building placement with collision detection (`checkPlacementCollision`).

---

#### **`game/src/audio/sound_fx.js`**
* **File Path:** `game/src/audio/sound_fx.js` (228 lines, 7.8 KB)
* **Role & Responsibility:** Zero-asset procedural audio synthesizer utilizing the Web Audio API. Generates tactile acoustic feedback for clicks, construction snaps, morning birds, nightfall cricket ambiance, and error alerts without requiring external audio files.
* **Exports:**
  - `SoundFX` (Class)
  - `soundFX` (Default Singleton Instance)
* **Key Methods:**
  - `playClick()`, `playBuild()`, `playSuccess()`, `playChime()`, `playError()`: Procedural tone synthesizers using oscillator and gain envelopes.
  - `playDawnRooster()`, `playNightCrickets()`, `playRain()`: Environmental background soundscapes.

---

### **2.3. Planetary Cartography & Spatial Engine**

#### **`game/src/map/hex.js`**
* **File Path:** `game/src/map/hex.js` (158 lines, 4.9 KB)
* **Role & Responsibility:** Mathematical library for hexagonal H3 grid coordinate calculations, axial conversions, distance metrics, and neighbor lookups.
* **Exports:**
  - Hex coordinate helper functions (`axialToPixel`, `pixelToAxial`, `hexDistance`, `getHexNeighbors`).

---

#### **`game/src/map/solar_terminator.js`**
* **File Path:** `game/src/map/solar_terminator.js` (100 lines, 3.2 KB)
* **Role & Responsibility:** Astronomical calculations computing the subsolar point (declination and Greenwich hour angle) for any given timestamp, generating the real-time night-shadow polygon across the Earth's surface.
* **Exports:**
  - `computeSolarTerminator(date)`: Computes subsolar coordinates and night polygon coordinates.

---

#### **`game/src/map/world.js`**
* **File Path:** `game/src/map/world.js` (112 lines, 3.9 KB)
* **Role & Responsibility:** Geospatial database storing continental shorelines, major watershed basins, and bioregional climate polygons.
* **Exports:**
  - `WORLD_GEOMETRY`, `WATERSHEDS`: GeoJSON geographic fixtures.

---

#### **`game/src/map/world_map.js`**
* **File Path:** `game/src/map/world_map.js` (683 lines, 25.1 KB)
* **Role & Responsibility:** Interactive planetary Leaflet map controller. Manages map tile rendering (offline high/low webp rasters), day/night solar terminator shadow overlays, pulsating federated node beacons, and Reticulum mesh route lines.
* **Imports:**
  - `L` from `leaflet`
  - `computeSolarTerminator` from `./solar_terminator.js`
* **Exports:**
  - `WorldMapController` (Class)

---

#### **`game/src/map/renderer.js`**
* **File Path:** `game/src/map/renderer.js` (452 lines, 16.4 KB)
* **Role & Responsibility:** Custom Canvas renderer for Leaflet rendering vector trade convoys, hex boundaries, and radio signal wave pulses between sister nodes.
* **Exports:**
  - `HexMapCanvasLayer` (Class)

---

### **2.4. User Interface, HUD & Modals**

#### **`game/src/ui/hud.js`**
* **File Path:** `game/src/ui/hud.js` (910 lines, 38.2 KB)
* **Role & Responsibility:** Core user interface manager. Renders the persistent Solarpunk Top HUD (resource bars, weather chip, day counter, and Primary Objective Card) and the context-sensitive Bottom Dock (building placement buttons, quick actions, district shortcuts).
* **Imports:**
  - `gameState` from `../core/state.js`
  - `soundFX` from `../audio/sound_fx.js`
  - `t` from `../i18n/index.js`
  - Modal classes (`BuildingInspectorModal`, `MorningDispatchModal`, `EventModal`, `ChoreBoardModal`, `ProfileModal`, `WorldMapModal`)
* **Exports:**
  - `GameHUD` (Class)
* **Key Components & Features:**
  - Top HUD: Conserved resource tickers (⚡ kWh, 💧 Liters, 🥗 Food, 👥 Population, 🕒 Time).
  - Primary Objective Card: Pinned top-left, displays immediate mission, progress indicator (`120 / 500 L`), and reward badge.
  - Contextual Bottom Dock: 3–4 contextually relevant building cards matching the active milestone, avoiding UI clutter.
  - Action Triggers: "Sleep / Rest Until Dawn", "Chore Board", "Regional Mesh Map", "Citizen Profiles".

---

#### **`game/src/ui/embarkation.js`**
* **File Path:** `game/src/ui/embarkation.js` (785 lines, 32.5 KB)
* **Role & Responsibility:** Milestone 1 Onboarding & Embarkation Desk. Features a 3-Stage guided onboarding flow:
  1. Stage 1 (Name, Craft & Look): Founder passport selection, 3D avatar customizer drawer.
  2. Stage 2 (3-Stop Civilizational Preview Tour): Animated planetary reconnaissance tour flying camera across Yukon Haven (Seed Node), Monte Sole (Ecovillage), and Detroit Delray (Sovereign Superblock) with interactive synoptic module inspection.
  3. Stage 3 (Seed Siting): Browser GPS nearby auto-siting and free planetary placement on Leaflet map.
* **Imports:**
  - `L` from `leaflet`
  - `gameState` from `../core/state.js`
  - `WorldMapController` from `../map/world_map.js`
  - `GLOBAL_STARTER_NODES`, `getClimateZoneFromLat`, `createCustomGlobalNode` from `../data/bioregions.js`
  - `formatPopulation` from `../data/cities.js`
  - `createAvatarCustomizer` from `./avatar_customizer.js`
* **Exports:**
  - `CIVILIZATIONAL_TOUR_STOPS` (Array of tour stop definitions, metrics & module metadata)
  - `EmbarkationDesk` (Class with `renderTourConsole()`, `flyToTourStop()`, `goToStep()`, `startCinematicZoomAndEmbark()`)

---

#### **`game/src/ui/building_inspector.js`**
* **File Path:** `game/src/ui/building_inspector.js` (550 lines, 22.4 KB)
* **Role & Responsibility:** Detailed inspection modal triggered by clicking any structure on the canvas. Displays real-time thermodynamic metrics, component degradation health, open-hardware bill of materials (BOM), maintenance tasks, and relocation/dismantling options.
* **Exports:**
  - `BuildingInspectorModal` (Class)

---

#### **`game/src/ui/event_modal.js`**
* **File Path:** `game/src/ui/event_modal.js` (1,311 lines, 58.4 KB)
* **Role & Responsibility:** Multi-purpose modal engine handling narrative events, climate crises, milestone unlocks, and Athenian Demarchy sortition assemblies.
* **Exports:**
  - `EventModal` (Class)

---

#### **`game/src/ui/morning_dispatch_modal.js`**
* **File Path:** `game/src/ui/morning_dispatch_modal.js` (343 lines, 13.9 KB)
* **Role & Responsibility:** Daily dawn briefing modal presented upon waking. Summarizes overnight battery discharge, water collection from morning dew, greenhouse crop growth, weather forecast, and chore assignments.
* **Exports:**
  - `MorningDispatchModal` (Class)

---

#### **`game/src/ui/chore_board_modal.js`**
* **File Path:** `game/src/ui/chore_board_modal.js` (217 lines, 8.9 KB)
* **Role & Responsibility:** Daily labor management desk. Displays the 6-hour daily chore pool, tracks active manual chores, and displays the "Automation Trajectory" where open-source robotics extinguish drudgery.
* **Exports:**
  - `ChoreBoardModal` (Class)

---

#### **`game/src/ui/profile_modal.js`**
* **File Path:** `game/src/ui/profile_modal.js` (203 lines, 7.8 KB)
* **Role & Responsibility:** Citizen passport and biographical profile viewer for the player and companions, tracking skill proficiencies, morale, health, and dynamic usufruct housing allocation.
* **Exports:**
  - `ProfileModal` (Class)

---

#### **`game/src/ui/world_map_modal.js`**
* **File Path:** `game/src/ui/world_map_modal.js` (782 lines, 30.6 KB)
* **Role & Responsibility:** Full-screen regional cartography modal. Displays federated sister nodes, Reticulum radio signal links, active trade convoys, and allows dispatching cargo trikes and drones.
* **Exports:**
  - `WorldMapModal` (Class)

---

#### **`game/src/ui/avatar_customizer.js` & `avatar_3d_viewer.js`**
* **File Paths:** `avatar_customizer.js` (199 lines), `avatar_3d_viewer.js` (515 lines)
* **Role & Responsibility:** Pioneer appearance configuration suite and Three.js 3D character preview viewport with real-time procedural mesh and palette adjustments.
* **Exports:**
  - `AvatarCustomizer` (Class)
  - `Avatar3DViewer` (Class)

---

### **2.5. Data & Internationalization**

#### **`game/src/data/bioregions.js` & `cities.js`**
* **File Paths:** `bioregions.js` (296 lines), `cities.js` (601 lines)
* **Role & Responsibility:** Bioregional climate database (Alpine, Mediterranean, Temperate, Arid, Tropical) and candidate seed node beacons (Val di Susa, Yukon Haven, Monte Sole, Detroit Delray, etc.).
* **Exports:**
  - `BIOREGIONS`, `CLIMATE_PROFILES`, `GLOBAL_STARTER_NODES`

---

#### **`game/src/i18n/index.js` & Language Dictionaries**
* **File Paths:** `index.js` (110 lines), `[locale].js` (1,266 lines each, 14 languages)
* **Role & Responsibility:** Zero-overhead internationalization system supporting English, Italian, Spanish, French, German, Portuguese, Russian, Chinese, Japanese, Korean, Hindi, Arabic, Indonesian, and Turkish.
* **Exports:**
  - `t(key, fallback)`: Dynamic translation lookup function.
  - `setLocale(localeCode)`: Runtime language switcher.

---

### **2.6. Styling & Build Configuration**

#### **`game/src/style.css`**
* **File Path:** `game/src/style.css` (4,161 lines, 85.8 KB)
* **Role & Responsibility:** Master CSS stylesheet. Implements Solarpunk design tokens (`--bg-dark`, `--emerald-primary`, `--amber-solar`, `--cyan-water`), glassmorphism backdrop filters, fluid responsive layouts (390px mobile to 4K ultra-wide), micro-animations, and modal transitions.

#### **`game/vite.config.js` & `package.json`**
* **File Paths:** `vite.config.js` (14 lines), `package.json` (22 lines)
* **Role & Responsibility:** Development server and production bundling configuration with ES modules and minimal third-party dependencies (`leaflet`, `three`, `trystero`).
