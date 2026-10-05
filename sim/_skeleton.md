# **O-ASIS Dual-Track Simulation — Legacy Architectural Codebase Skeleton (`_skeleton.md`)**

**Document Version:** 1.0.0  
**Repository Path:** `sim/`  
**Persona & Author:** Kyberlex (`kyberlex@proton.me`)  
**License:** AGPL-3.0-or-later  
**Updated:** 2026-10-05  

---

## **1. SYSTEM DIRECTORY TREE & LEGACY COMPONENT OVERVIEW**

```
sim/
├── USER_GUIDE.md                # Comprehensive user guide for O-ASIS sandbox
├── GAME_DESIGN.md               # Scientific design document & thermodynamic formulas
├── TODO.md                      # QA bug tracking, stress test matrix & historical backlog
├── README.md                    # Public simulator overview & architectural summary
├── O-ASIS_User_Handbook.pdf     # 16-page compiled visual PDF handbook
├── generate_handbook.py         # Python/ReportLab script generating the official PDF handbook
├── apply_handbook_translations.py # Multilingual handbook injection script
├── i18n_handbook_*.py           # Multilingual translation dictionaries for handbook generator
├── prototype_oasis_mini.py      # CLI prototype testing ODE thermodynamic balances
├── handbook_assets/             # High-resolution screenshots of simulation features
└── app/                         # Frontend Web Application (Vite + Vanilla JS)
    ├── index.html               # Main HTML entrypoint with modal DOM containers
    ├── vite.config.js           # Vite development & build configuration
    ├── package.json             # NPM dependencies (Leaflet, Three.js, Trystero)
    ├── public/                  # Static assets (maps, logos, world snapshot)
    └── src/
        ├── main.js              # Monolithic application bootstrap & event bus coordinator
        ├── style.css            # Legacy 9,100+ line master CSS stylesheet
        ├── engine/              # Core discrete-event simulation & thermodynamic logic
        │   ├── simulation.js    # Discrete-event tick loop & Leontief matrix solvers
        │   ├── node.js          # Settlement node state, resources, chore pool & usufruct ledger
        │   ├── thermodynamics.js# Solar PV, Betz wind, greywater bio-filtration & MTBF degradation
        │   ├── adversary.js     # Legacy Engine AI simulating debt, interest & land speculation
        │   ├── sortition.js     # Athenian demarchy sortition algorithm with odd parity
        │   ├── trade_convoy.js  # Inter-node logistics, cargo trikes, VTOL drones & trade routes
        │   ├── p2p_mesh.js      # Serverless WebRTC peer-to-peer data mesh (Trystero)
        │   ├── storage_idb.js   # IndexedDB local-first persistent storage
        │   ├── consensus_anchor.js # SHA-256 state snapshot hashing & blockchain/git anchor
        │   ├── civic_projects.js   # Municipal infrastructure construction projects
        │   ├── peer_review_engine.js # Blueprint verification & demarchic peer review
        │   ├── chat_engine.js   # Village & inter-node encrypted P2P chat
        │   ├── citizen_passport.js # Cryptographic citizen identity & usufruct credentials
        │   ├── player_profile.js   # Player vocation, skill proficiencies & personal gear
        │   ├── qr_generator.js  # Client-side SVG QR code generator for peering
        │   └── zoom_coordinator.js # Multi-scale zoom transitions (Village -> Hex -> World)
        ├── settlement/          # Canvas rendering & visual simulation
        │   ├── settlement_renderer.js # 2D Canvas settlement renderer (camper, pioneers, modules)
        │   ├── interior_renderer.js   # 2D cross-section interior renderer for MHUs & camper van
        │   ├── civic_projects_renderer.js # Canvas renderer for large civic megaprojects
        │   ├── robot_manager.js # Autonomous robot fleet management (FarmBots, SCADA bots)
        │   └── prop_3d_viewer.js# Three.js interactive 3D prop visualizer
        ├── map/                 # Planetary cartography & Leaflet map
        │   ├── world_map.js     # Leaflet global map controller with offline textures
        │   ├── solar_terminator.js # Astronomical solar terminator day/night shadow calculations
        │   ├── renderer.js      # Leaflet custom canvas vector rendering layer
        │   ├── hex.js           # H3 hexagonal grid coordinate calculations
        │   └── world.js         # Shoreline & watershed vector boundaries
        ├── ui/                  # User interface panels, modals & HUD
        │   ├── hud.js           # Top HUD resource counters & legacy navigation tabs
        │   ├── nav_groups.js    # Bottom navigation grouping tabs into functional domains
        │   ├── guide_tour.js    # Step-by-step interactive onboarding tutorial
        │   ├── panel_node.js    # Main settlement dashboard & debt ticker
        │   ├── panel_citizen.js # Census & chore labor pool panel
        │   ├── panel_dwelling.js# Housing usufruct allocation & sabbatical locks
        │   ├── panel_dilemma.js # Demarchic assembly voting on governance dilemmas
        │   ├── panel_convoys.js # Trade convoy dispatch & route tracking
        │   ├── panel_dualtrack.js # Dual-track open-hardware blueprint catalogue
        │   ├── viewer3d.js      # Three.js CAD viewer for .STL / .3MF files
        │   ├── panel_passport.js# Citizen passport, skill matrix & QR badge
        │   ├── panel_chat.js    # Multi-room P2P mesh chat
        │   ├── panel_handbook.js# In-game handbook & constitutional codex viewer
        │   ├── panel_invite.js  # WebRTC invite code exchange
        │   ├── panel_feedback.js# User feedback & bug report relay
        │   ├── starter_objectives.js # Starter objective checklist
        │   └── avatar_3d_viewer.js # Three.js avatar visualizer
        ├── data/                # Static configuration & reference registries
        │   ├── bioregions.js    # Bioregional climate parameters & solar factors
        │   ├── initial_nodes.js # Global starter beacons & federated sister nodes
        │   ├── tech_tree.js     # Open-hardware research progression tree
        │   ├── models3d.js      # Open-hardware 3D model specifications & BOMs
        │   ├── dilemmas.js      # Constitutional & ecological demarchy dilemmas
        │   ├── peer_review_dockets.js # Blueprint verification review queues
        │   └── vocations.js     # Pioneer vocations & skill bonuses
        └── i18n/                # Multilingual localization
            ├── index.js         # Translation lookup resolver `t(key, fallback)`
            └── [14 locales].js  # Complete dictionaries (en, it, es, fr, de, pt, ru, zh, ja, ko, hi, ar, id, tr)
```

---

## **2. PER-FILE CODE SKELETON & STRUCTURAL BREAKDOWN**

### **2.1. Top-Level Documentation & Build Scripts**

* **`sim/USER_GUIDE.md`** (312 lines, 10.9 KB): Comprehensive user documentation explaining simulator mechanics, conserved thermodynamic flows, usufruct housing, demarchic sortition assemblies, and dual-track open-hardware links.
* **`sim/GAME_DESIGN.md`** (288 lines, 11.2 KB): Technical game design document specifying mathematical formulations (Betz limit for wind, solar irradiance curves, Leontief input-output matrices, second-law entropy degradation curves).
* **`sim/TODO.md`** (453 lines, 21.3 KB): Development backlog and historical stress-test matrix detailing completed and open QA tasks across the legacy simulator.
* **`sim/README.md`** (141 lines, 5.8 KB): High-level overview of the O-ASIS Dual-Track Simulator, including architectural diagrams and local deployment instructions.
* **`sim/generate_handbook.py`** (340 lines, 12.8 KB): ReportLab Python script that programmatically compiles the 16-page official PDF handbook (`O-ASIS_User_Handbook.pdf`) with embedded vector diagrams and localized typography.
* **`sim/prototype_oasis_mini.py`** (83 lines, 2.7 KB): Minimal Python CLI prototype executing thermodynamic differential equations for fast headless verification.

---

### **2.2. Web Application Core & Styling (`sim/app/`)**

* **`sim/app/index.html`** (629 lines, 35.8 KB): Monolithic HTML document containing structural skeletons for all full-screen modal panels (`#panel-node`, `#panel-citizen`, `#panel-dilemma`, etc.), Leaflet map container, Three.js 3D viewport, and top HUD.
* **`sim/app/src/main.js`** (1,168 lines, 45.2 KB): Application entrypoint. Instantiates all engine classes (`SimulationEngine`, `NodeEngine`, `P2PMesh`, `AdversaryEngine`, `SortitionEngine`), binds UI panels to the DOM, wires up keyboard shortcuts, and orchestrates the primary render/tick loop.
* **`sim/app/src/style.css`** (9,173 lines, 142.6 KB): Comprehensive legacy Solarpunk CSS stylesheet containing design tokens, glassmorphism panel backdrops (`backdrop-filter: blur(14px)`), animations, table layouts, and responsive media queries.

---

### **2.3. Simulation & Thermodynamic Engine (`sim/app/src/engine/`)**

* **`sim/app/src/engine/simulation.js`** (606 lines, 23.4 KB): Core discrete-event tick engine. Executes periodic thermodynamic simulation steps, advances diurnal time, handles simulation speeds (pause, 1x, 5x, 20x), and propagates state changes to listening modules.
* **`sim/app/src/engine/node.js`** (471 lines, 18.2 KB): Settlement node model. Tracks resource stocks (kWh, L, kcal, compute), physical buildings on the grid, citizen census, housing usufruct occupancy, and chore labor allocations.
* **`sim/app/src/engine/thermodynamics.js`** (826 lines, 32.7 KB): Conserved physical balances engine. Solves mathematical equations for:
  - Solar PV generation based on latitude, date, hour, tilt angle, and cloud cover.
  - Wind turbine generation capped at the Betz limit ($C_p \le 16/27$).
  - Evapotranspiration and greywater reed-bed biological filtration (65% return).
  - Second-Law component wear and MTBF failure probabilities.
* **`sim/app/src/engine/adversary.js`** (420 lines, 16.5 KB): Legacy Engine AI simulator. Models the hostile financial economy surrounding the settlement (predatory debt accumulation, compound interest, speculative land appreciation, and private enclosure threats).
* **`sim/app/src/engine/sortition.js`** (189 lines, 7.1 KB): Nomothetic demarchy engine. Executes cryptographic sortition by lot to select citizen juries with strict odd-parity rules (3, 5, 7, or 9 jurors) to deliberate on civic dilemmas.
* **`sim/app/src/engine/trade_convoy.js`** (501 lines, 19.3 KB): Inter-node trade and logistics engine. Manages overland cargo trikes and aerial VTOL drones, computing battery consumption, payload limits, travel durations, and manifest exchanges between federated nodes.
* **`sim/app/src/engine/p2p_mesh.js`** (609 lines, 22.8 KB): Local-first serverless P2P mesh network using WebRTC (via Trystero) and local multi-tab `BroadcastChannel`, allowing real-time state synchronization without centralized servers.
* **`sim/app/src/engine/storage_idb.js`** (425 lines, 15.6 KB): High-capacity IndexedDB wrapper for local browser persistence, supporting save-state versioning, migration, and export/import.
* **`sim/app/src/engine/consensus_anchor.js`** (172 lines, 6.2 KB): Periodic SHA-256 state hashing and public consensus anchoring, formatting state snapshots for GitHub Actions cron commits.
* **`sim/app/src/engine/civic_projects.js`** (425 lines, 16.1 KB): Civic megaprojects manager (Central Agora, Geothermal Deep Well, High-Speed Rail Spur, FabLab Gantry).
* **`sim/app/src/engine/peer_review_engine.js`** (216 lines, 8.4 KB): Demarchic peer review protocol for validating open-hardware blueprints before physical construction.
* **`sim/app/src/engine/chat_engine.js`** (718 lines, 26.5 KB): Decentralized multi-room chat engine supporting village channels, inter-node trade hailing, and direct pioneer messaging.
* **`sim/app/src/engine/citizen_passport.js`** (257 lines, 9.8 KB): Citizen identity manager generating unique cryptographic badges, vocation credentials, and usufruct housing deeds.
* **`sim/app/src/engine/player_profile.js`** (126 lines, 4.8 KB): Player character configuration, skill trees, and inventory.
* **`sim/app/src/engine/qr_generator.js`** (344 lines, 12.1 KB): Lightweight client-side SVG QR code generator for passport scanning and peer invitation links.
* **`sim/app/src/engine/zoom_coordinator.js`** (149 lines, 5.6 KB): Seamless zoom state machine coordinating transitions between Village canvas, Hexagonal regional view, and Planetary Leaflet map.

---

### **2.4. Settlement Rendering & Visuals (`sim/app/src/settlement/`)**

* **`sim/app/src/settlement/settlement_renderer.js`** (3,944 lines, 158.2 KB): Monolithic 2D Canvas renderer. Renders the village campsite, camper van with drop-down awning, animated walking pioneers, solar panel tracking, spinning wind turbines, greenhouse crop rows, weather particles (rain, wind, lightning), and circadian dawn/noon/dusk/night overlays.
* **`sim/app/src/settlement/interior_renderer.js`** (2,037 lines, 81.3 KB): Detailed 2D cross-section interior renderer allowing players to inspect the inside of camper vans and Modular Habitat Units (sleeping bunks, galley kitchens, battery compartments, rainwater filters).
* **`sim/app/src/settlement/civic_projects_renderer.js`** (433 lines, 16.9 KB): Procedural canvas renderer displaying large civic megaprojects under construction.
* **`sim/app/src/settlement/robot_manager.js`** (776 lines, 29.4 KB): Autonomous robot fleet simulation (FarmBot gantries, SCADA solar crawlers, and aerial survey drones).
* **`sim/app/src/settlement/prop_3d_viewer.js`** (735 lines, 28.1 KB): Three.js interactive 3D prop visualizer for inspecting individual settlement equipment.

---

### **2.5. Planetary Cartography (`sim/app/src/map/`)**

* **`sim/app/src/map/world_map.js`** (508 lines, 18.9 KB): Leaflet-based global map controller. Renders offline earth rasters (`world_low.webp`, `world_high.webp`), pulsating node beacons, trade convoy paths, and night terminator shadows.
* **`sim/app/src/map/solar_terminator.js`** (100 lines, 3.2 KB): Calculates real-time astronomical solar terminator curves and generates the SVG/GeoJSON night shadow polygon.
* **`sim/app/src/map/renderer.js`** (452 lines, 16.4 KB): Custom Canvas overlay layer for Leaflet map rendering hex grids and convoy motion.
* **`sim/app/src/map/hex.js`** (158 lines, 4.9 KB): Mathematical H3 hexagonal grid coordinate library.
* **`sim/app/src/map/world.js`** (112 lines, 3.9 KB): Geospatial continental shorelines and watershed basin boundaries.

---

### **2.6. User Interface & Modals (`sim/app/src/ui/`)**

* **`sim/app/src/ui/hud.js`** (293 lines, 11.2 KB): Legacy top HUD displaying ⚡ kWh, 💧 Liters, 🥗 Food kcal, debt ticker, simulation clock, and primary navigation buttons.
* **`sim/app/src/ui/nav_groups.js`** (176 lines, 6.8 KB): Bottom navigation bar grouping UI panels into logical clusters (Village, Society, Regional, System).
* **`sim/app/src/ui/guide_tour.js`** (515 lines, 19.8 KB): Interactive onboarding step-by-step tutorial tour highlighting key UI elements.
* **`sim/app/src/ui/panel_node.js`** (1,172 lines, 47.1 KB): Comprehensive settlement dashboard showing building rosters, infrastructure condition, and debt metrics.
* **`sim/app/src/ui/panel_citizen.js`** (218 lines, 8.6 KB): Citizen census modal managing chore assignments and labor pool allocations.
* **`sim/app/src/ui/panel_dwelling.js`** (269 lines, 10.4 KB): Usufruct housing ledger managing MHU occupancy, vacancy reclamation, and sabbatical locks.
* **`sim/app/src/ui/panel_dilemma.js`** (650 lines, 26.1 KB): Demarchic sortition jury assembly voting modal for constitutional and ethical dilemmas.
* **`sim/app/src/ui/panel_convoys.js`** (828 lines, 33.2 KB): Trade convoy dispatching, route configuration, and manifest inspection modal.
* **`sim/app/src/ui/panel_dualtrack.js`** (309 lines, 12.1 KB): Dual-track open-hardware catalogue linking virtual modules to real-world .STL CAD files and Home Assistant YAML automations.
* **`sim/app/src/ui/viewer3d.js`** (163 lines, 5.8 KB): Three.js CAD viewer loading and rendering 3D STL/3MF models in the browser.
* **`sim/app/src/ui/panel_passport.js`** (1,226 lines, 49.3 KB): Citizen passport modal displaying cryptographic identity, skill proficiencies, and QR badges.
* **`sim/app/src/ui/panel_chat.js`** (501 lines, 18.9 KB): Decentralized chat panel connecting local and remote P2P mesh peers.
* **`sim/app/src/ui/panel_handbook.js`** (600 lines, 23.7 KB): Interactive in-game manual and constitutional codex viewer.
* **`sim/app/src/ui/panel_invite.js`** (284 lines, 10.8 KB): P2P multiplayer invite link and QR code modal.
* **`sim/app/src/ui/panel_feedback.js`** (354 lines, 13.9 KB): User feedback and bug reporting relay modal.
* **`sim/app/src/ui/starter_objectives.js`** (495 lines, 19.2 KB): Starter mission checklist and tutorial goals.
* **`sim/app/src/ui/avatar_3d_viewer.js`** (515 lines, 18.4 KB): Three.js 3D character preview and customization visualizer.

---

### **2.7. Static Data & Multilingual Engine**

* **`sim/app/src/data/`** (7 files):
  - `bioregions.js` (296 lines): Bioregion climate parameters and solar irradiance baselines.
  - `initial_nodes.js` (121 lines): Global reference beacons and federated sister nodes.
  - `tech_tree.js` (204 lines): Technology unlock tree.
  - `models3d.js` (748 lines): 3D CAD model catalogue with download links and bills of materials (BOM).
  - `dilemmas.js` (165 lines): Governance dilemmas for demarchic assembly deliberation.
  - `peer_review_dockets.js` (186 lines): Blueprint verification review queues.
  - `vocations.js` (181 lines): Pioneer vocations, skill trees, and labor bonuses.
* **`sim/app/src/i18n/`** (15 files):
  - `index.js` (110 lines): Dynamic translation lookup function `t(key, fallback)`.
  - 14 complete language dictionaries (en, it, es, fr, de, pt, ru, zh, ja, ko, hi, ar, id, tr) with 1,266 translation keys each.
