# **O-ASIS DUAL-TRACK SIMULATOR: TODO & OPEN GOVERNANCE CHALLENGES**

This document tracks pending architectural features, research frontiers, and unresolved governance dilemmas for the living simulation engine ([`sim/`](./)).

---

## **🔥 0. HIGH PRIORITY (PRE-LAUNCH OCT 13): ONBOARDING OVERHAUL, IN-GAME SURVIVAL ADVISOR & PROGRESSIVE DISCLOSURE**

### **Context & Forensic Problem Statement (The Player Friction Trap)**
Direct playtester feedback (e.g. `Pepisohn` on `r/incremental_games`, `WarningRegular` via Reddit PMs) has highlighted a fatal UX barrier:
* **The Cognitive Overload Trap:** Players land on `https://one-oasis.surge.sh` and are instantly confronted with the "cockpit of a space shuttle" — 4 Leontief biophysical flows, battery day/night degradation, food calorie drain (-1,192 kcal/h perceived as unpayable debt), machine wear-and-tear, Legacy AI strikes, and sortition juries are all active at second 0.
* **The Doctrine Barrier:** Gamers do NOT read the 1,000-page Constitution or the novels before playing. If the game expects players to understand post-labor usufruct and Leontief matrices *in advance*, 95% of players bounce in under 60 seconds thinking the game is broken or unfairly punishing.
* **The Core Invariant:** A great game **teaches the philosophy through play**, peeling complexity like an onion (Progressive Disclosure) rather than dropping an encyclopedia on the player's head.

---

### **A. Architectural Blueprint for the Overhaul**

#### **1. 🧭 The In-Game Survival Advisor ("District Companion / Maya")**
* **Component:** `sim/app/src/ui/survival_advisor.js` + floating HUD widget in `index.html`.
* **Behavior:** A non-intrusive, reactive Solarpunk advisor card (bottom-right corner) translating continuous thermodynamic ODEs into plain, urgent human language in real time:
  * 🔴 **Critical Alert (Power):** *"⚠️ Sunset in 2 minutes. Your battery buffer will only last 2.3 hours tonight! Tap here to load-shed the heavy workshops."*
  * 🟡 **Warning (Food):** *"💡 Calorie buffer dropping: 10 citizens require 22,000 kcal/day (2,200 kcal floor). The Granary has 4 days of reserves. Assign a bot to the Hydroponics Tower to restore positive yield."*
  * 🔵 **Civic / Legacy Threat:** *"🏛️ Legacy Engine has triggered a debt audit! Sortition assembly convened. Click to review the civic docket and vote."*
  * 🟢 **Optimal Equilibrium:** *"✅ District in thermodynamic balance: Energy surplus is charging batteries and FabLab spare parts."*
* **Interactive 1-Click "Action Assist":** Every advisor warning includes a pulsing button that pans the canvas camera directly to the relevant building/module and highlights it with a radiant golden ring.

#### **2. 🪜 Progressive Disclosure & The 5-Step Guided Prologue**
* **Component:** `sim/app/src/engine/onboarding_prologue.js` (Gated progression state machine).
* **Concept:** Lock advanced tabs and modules behind initial survival milestones so the player masters one physical flow at a time:
  * **Stage 1 — The Solar Spark (Energy):** Player starts with just the Solar PV Array and the Battery Bank. Goal: Store 100 kWh before nightfall. Introduces the day/night solar curve.
  * **Stage 2 — The Living Spring (Hydrology):** Deep well pump unlocks. Goal: Fill the 5,000 L potable cistern and route greywater to filtration.
  * **Stage 3 — Caloric Sovereignty (Food):** Vertical Hydroponics Tower unlocks. Explains the biometric 2,200 kcal/day human floor and the Granary buffer (stock vs. flow). Goal: Reach +500 kcal/h surplus.
  * **Stage 4 — Cybernetic Relief (Labor Cancellation):** First bot (`BOT-01` or `ROV-01`) deployed. Player assigns it to maintenance, watching human chore hours drop from 8h to 4h.
  * **Stage 5 — The Extractive Shock & First Assembly (Demarchy):** Legacy AI adversary cuts off the commercial power grid. An Athenian Sortition Council is drawn by cryptographic lottery. Player experiences their first 75% supermajority vote on community self-reliance.
  * *After Stage 5:* Full sandbox mode unlocked with celebratory milestone badge.

#### **3. 🎮 Difficulty & Playstyle Selector (Startup Modal)**
* **Component:** `sim/app/src/ui/panel_difficulty.js`.
* **Modal Trigger:** Displayed automatically on fresh browser sessions (unseeded IndexedDB), with toggle in settings:
  1. 🟢 **Pioneer / Guided Mode (Recommended for First-Time Players):**
     * Caloric and battery depletion rates softened by 30% for the first 3 circadian days.
     * The Survival Advisor is active with step-by-step guidance.
     * Safety net: Battery and Food buffers do not cause catastrophic blackouts on Day 1.
  2. 🔴 **Thermodynamic Hardcore (O.N.E. Canonical Simulation):**
     * Exact biophysical Leontief conservation laws, full Second-Law entropy, immediate Legacy AI strikes.

#### **4. 🏷️ Humanized Tooltips & Granary Buffer Clarification**
* **Component:** `sim/app/src/ui/hud_meters.js` + `style.css`.
* **Fixing the "Negative Calorie Debt" Confusion:**
  * When food production is below consumption, do NOT show a terrifying `-1,192 kcal/h` red alert that looks like monetary debt.
  * Display: `🥗 Food: 1.8M kcal in Granary (29 Days of Safe Buffer)`. Subtitle: `Harvest in progress (-4% daily burn until next crop)`.
  * Tooltip explains: *"Human bodies require 2,200 kcal/day. Your granary holds enough food to feed everyone for 29 days even if no crops grow today."*

---

### **B. Technical File Modification Checklist**

- [ ] **1. Create Survival Advisor UI:** `sim/app/src/ui/survival_advisor.js` (Reactive event listener subscribing to `simulation.js` thermodynamics).
- [ ] **2. Implement Prologue State Machine:** `sim/app/src/engine/onboarding_prologue.js` (Tracks stage `0..5`, unlocks UI elements progressively, persists to IndexedDB).
- [ ] **3. Implement Difficulty Selector Modal:** `sim/app/src/ui/panel_difficulty.js` (Stores mode in `localStorage` / IndexedDB).
- [ ] **4. Canvas Interactive Highlights:** Update `sim/app/src/settlement/settlement_renderer.js` to draw pulsing target reticles over buildings when guided by the Advisor.
- [ ] **5. Update HUD Resource Meters:** Refactor `sim/app/src/ui/hud_meters.js` to show Granary Days Remaining instead of confusing negative debt flows.
- [ ] **6. Multi-Language i18n Sync (Gate D8):** Add advisor phrases and tutorial steps to `scripts/sync_sim_i18n.py` and run synchronization across all 14 official languages.
- [ ] **7. Verification:** Test end-to-end via headless Chrome & `npm run build` to ensure 60 FPS performance without regression.

---

### **C. Post-Completion Operational Checklist**

Once code and simulation behaviors are fully implemented and verified:
- [ ] **Update User Guide(s):** Update `sim/USER_GUIDE.md` with the new 5-step guided prologue, Survival Advisor, and difficulty selector; recompile the vector PDF manual via `python3 sim/generate_handbook.py` (`sim/O-ASIS_User_Handbook.pdf`).
- [ ] **Redeploy Simulator:** Run `python3 scripts/deploy_sim_surge.py` to publish the updated build to `https://one-oasis.surge.sh` (and the itch.io iframe), and synchronize GitHub Pages (`https://kyberlex.github.io/ONE`).
- [ ] **Community Follow-Up & Announcement Campaign:** Reply to user `Pepisohn` on `r/incremental_games` with the onboarding changelog, launch the direct link on `r/WebGames`, and publish the Devlog on `itch.io`.

---

## **1. IN-GAME COMMUNITY FEEDBACK & PROPOSAL BRIDGE (Completed)**

The bridge for reporting operational bugs and proposing civic/gameplay ideas directly from the live client into GitHub has been fully implemented in `sim/` via:
- **In-Game Solarpunk Feedback Modal ([`panel_feedback.js`](app/src/ui/panel_feedback.js)):** Dedicated topbar button (`💡 Ideas & Bugs`) with category selection, automatic node telemetry capture, and tabbed switcher.
- **Anonymous Google Apps Script Privacy Relay ([`scripts/feedback_relay_apps_script.js`](../scripts/feedback_relay_apps_script.js)):** Zero-registration proxy that strips personal metadata and securely posts `[Bug]` and `[Idea / RFC]` issues into [`github.com/kyberlex/ONE`](https://github.com/kyberlex/ONE) using server-side Secrets.
- **Sortition Peer-Review Codex ([`peer_review_engine.js`](app/src/engine/peer_review_engine.js)):** In-game confederal sortition assembly deliberating directly on empirical `SIM-QA-XX` dockets.

---

## **2. DISTRIBUTED DATABASE & CITIZEN IDENTITY SYNC (PC ↔ PHONE ↔ TABLET)**

### **The Vision: Local-First Multi-Device Sync without Accounts or Passwords**

Enable seamless, zero-registration synchronization of simulation states and nodes across any personal device (PC, smartphone, tablet) while preserving absolute OpSec anonymity and offline resilience.

### **A. Citizen Cryptographic Passport (Zero-Registration Identity)**

- **User Input:** Player enters a human-friendly avatar name (e.g. `"John"`).
- **Cryptographic Payload:** The client bundles:  
  `Payload = AvatarName + ":" + Timestamp_ms (Date.now()) + ":" + 4_Random_Salt_Bytes`  
  *(e.g., `John:1774345632145:7f9a`)*.
- **Collision Immunity:** The microsecond timestamp guarantees mathematical uniqueness worldwide—10,000 players can choose "John" without any name collision or central database coordinator.
- **Reversible Decryption:** When pasted or scanned on another device, decrypting the token immediately restores the citizen name (`"John"`) and founding date without asking any central server.

### **B. 2D QR Code Handshake (Zero-Typing Camera Sync)**

- **Device A (e.g. PC or Phone):** Opens *"🔑 My Citizen Passport"* and renders an inline Solarpunk SVG QR Code encoding:  
  `https://<domain>/?passport=ONE:John:1774345632145:7f9a`
- **Device B (e.g. Phone or Tablet):** Player points native phone/tablet camera at Device A's screen.
- **Instant Pair:** Device B opens the browser, reads `?passport=...`, decrypts the identity, and downloads the current node state.
- **Horizontal Chain:** Any device can display the QR code or scan it—no master/slave hierarchy.

### **C. 100% Serverless Distributed DB Architecture (P2P Local-First)**

1. **Inviolable Architectural Rules:**
   - **Zero-Lag Guaranteed (Independent 60 FPS Engine):** The simulation loop runs 100% in local RAM and persistent **IndexedDB**. It never pauses, blocks, or waits for network packets.
   - **Glitch-Free Event-Delta Sync (No Time Glitches):** Devices do NOT sync raw clock timestamps or brute-force snapshots (which cause jarring rewinds). They exchange **signed human action logs (deltas)** (e.g. *"John assigned 2h to hydroponics at tick 14"*, *"Council voted refugee asylum"*). Local engines apply deltas deterministically.
   - **100% Serverless P2P Mesh:**
     - **Local LAN / Same Wi-Fi:** Direct radio WebRTC DataChannel connection between PC, Phone, and Tablet (zero bytes leave the local network, zero external servers).
     - **Remote P2P:** Zero-cost open STUN signaling (standard Mozilla/Google STUN) to negotiate direct end-to-end encrypted P2P data tunnels.
     - **Decentralized Relay Fallback:** Community-operated, open decentralized pub/sub relay (e.g. GunDB / Nostr relays or BitTorrent DHT), with ZERO centralized Cloudflare or proprietary backends.

2. **Distributed DB Pipeline:**
   - **Phase 1 (Storage - Completed):** Local-First storage engine backed by **IndexedDB** (`storage_idb.js`) to record node history, state trees, and signed delta logs without the 5MB `localStorage` limit. Right to Oblivion (`purgeCitizenIdentity`) implemented.
   - **Phase 2 (Identity & Cryptographic Passports - Completed):** Sovereign Citizen ID (`citizen_passport.js`) using Web Crypto API (`crypto.subtle` ECDSA P-256) for zero-registration asymmetric keypairs and action signing. First-time onboarding wizard with vocational polytech notice.
   - **Phase 3 (P2P Mesh Synchronization - Completed):** WebRTC DataChannel (`p2p_mesh.js`) + BroadcastChannel + 2D SVG QR code SDP pairing (`qr_generator.js`) for seamless multi-device peer-to-peer event replication.
   - **Phase 4 (Long-Term Persistence & Git-as-a-State-Anchor - Completed):** Genesis Block activated with canonical state anchor `sim/app/public/world_snapshot.json`, automated GitHub Actions cron workflow, headless ingestion script `scripts/anchor_world_snapshot.py`, and zero-latency client bootstrap.

### **D. Git-as-a-State-Anchor: Long-Term Consensus Snapshots on GitHub (Completed)**

- **Context & Genesis Block Activation:**
  - Settlement mechanics, robotics tech-trees, thermodynamics, and demarchy assemblies have reached feature-freeze. The automated GitHub snapshot anchor is now active as Genesis Block #1.

- **Architecture & Implemented Mechanics:**
  - **Canonical Snapshot File ([`world_snapshot.json`](app/public/world_snapshot.json)):** Strict schema versioning (`schemaVersion: 1`, `network: "O-ASIS Confederated Mesh"`, `genesis: true`, `tick: 0`, `timestamp`, `nodes`, `robots`, `civicProjects`, `thermoConsensusHash`).
  - **Headless Ingestion Engine ([`anchor_world_snapshot.py`](../scripts/anchor_world_snapshot.py)):** Ambient headless peer and CLI tool supporting `--check`, `--generate-genesis`, `--advance`, `--export`, and deterministic SHA-256 state hashing over canonical node states.
  - **Autonomous In-Game Cloud Sync ([`consensus_anchor.js`](app/src/engine/consensus_anchor.js)):** Automatically commits world state snapshots to GitHub as players progress through the simulation (every circadian day / 1 hour), with throttling cooldown (15m) to prevent spamming.
  - **Anonymous Apps Script Relay ([`snapshot_relay_apps_script.js`](../scripts/snapshot_relay_apps_script.js)):** Secure serverless Google Apps Script proxy executing GitHub Contents API `PUT /repos/:repo/contents/sim/app/public/world_snapshot.json` with commit message `chore(sim): consensus world snapshot [Tick <N>]` under `kyberlex-bot <kyberlex@proton.me>` with ZERO token exposure in client code.
  - **Automated GitHub Action Cron ([`world_snapshot_cron.yml`](../.github/workflows/world_snapshot_cron.yml)):** Runs periodically on GitHub Actions (every 12 hours) and manual `workflow_dispatch`, automatically verifying consensus state and committing `chore(sim): consensus world snapshot [Tick <N>]`.
  - **Zero-Latency Client Bootstrap ([`simulation.js`](app/src/engine/simulation.js)):** On startup, client fetches `/world_snapshot.json` statically (cached, 0 lag, zero server cost) to populate initial node thermodynamics, demographics, and projects if IndexedDB is unseeded, and aligns consensus telemetry.
  - **In-Game Consensus Anchor Dashboard ([`panel_node.js`](app/src/ui/panel_node.js)):** Dedicated `⚓ Consensus Git-Anchor` tab in the Village Commons Hub, rendering real-time SHA-256 hash, anchor tick/block, progression status, 1-click JSON snapshot download, Git resync, Auto-Anchor toggle, and manual 1-click `🚀 Push Snapshot to GitHub Now` action.
  - **Invariants Upheld:** 100% free software (AGPL-3.0), zero server costs, zero centralized authority, complete cryptographic transparency.

---

## **3. PENDING SIMULATOR ENGINE TASKS**

- [x] **Dynamic Climate Disaster Events (Completed):** Atmospheric rivers and heat dome stress-tests on crop resilience, PV thermal derating, BMS chiller load, and Legacy Adversary AI synergy.
- [x] **Inter-Node Trade Convoys (Completed):** Multi-hex barter logistics with neighboring autonomous nodes, low-carbon vehicle fleet (Rovers, Maglev Rail, Cargo Dirigibles), bioregional surplus/deficit reciprocity, and real-time Leaflet route tracking.
- [x] **P2P Village Chat & Mesh Telegram (Completed):** Hybrid operational quick-phrases (⚡ Alerts, 🚚 Logistics & Barter, 🏛️ Sortition & Assembly, 🤝 Commons & Mutual Aid) + ECDSA-signed free chat for node neighborhood coordination, 1-click resource claiming/donating, live 60 FPS speech bubbles over canvas citizen avatars, and ambient resident chatter.
- [x] **Sortition Jury Peer-Review System & Confederated Assembly Codex (Completed):**
  - *Constitutional Foundation:* Anchored in Chapter IV (Art. 4.2, 4.3, & 4.5): Athenian demarchic sortition assemblies deliberate on empirical operational and constitutional hypotheses (`SIM-QA-XX` dockets) transmitted across the confederated P2P mesh network, establishing living case law without unilateral or autocratic rule modifications.
  - *Implementation:*
    - **Canonical Confederated Dockets ([`peer_review_dockets.js`](app/src/data/peer_review_dockets.js)):** Bundled 4 canonical dockets derived from [`oasis/sim_resolutions_qa.md`](../oasis/sim_resolutions_qa.md):
      1. `SIM-QA-01`: Quorum Scaling for Emerging Nodes (< 50 Pop) (Origin: Detroit Delray, Art. 4.2.1).
      2. `SIM-QA-02`: Dual-Tier Tool Classification: Personal Craft vs. Civic Library (Origin: Val di Susa, Art. 3.1 & 3.4).
      3. `SIM-QA-03`: Ecological Sensor Integrity & Analog Citizen Ground-Truthing (Origin: Yukon-Alaska, Art. 2.4).
      4. `SIM-QA-04`: Soulbound FabLab Queuing vs. Priority Favor Brokerage (Origin: Sahel Biome, Art. 5.3 & 6.2).
    - **Confederated Peer-Review Engine ([`peer_review_engine.js`](app/src/engine/peer_review_engine.js)):**
      - Manages available, reviewed, and ratified dockets with deterministic state serialization (`localStorage`).
      - Simulates individual citizen juror stances using psychometric leanings (tribal bias, greed, morale).
      - Enforces the strict 75% constitutional supermajority threshold required by Art. 4.5.
      - Applies active passive precedent perks and confederal trust score adjustments upon ratification.
    - **Sortition Assembly Board & Deliberation UI ([`panel_dilemma.js`](app/src/ui/panel_dilemma.js)):**
      - Upgraded the Sortition modal into a dual-mode interface:
        1. **Athenian Assembly Codex Board:** Displays current seated jurors (drawn by lot), mandate term progress (Day X of 30), incoming confederated dockets with 1-click *"Impanel Sortition Jury"* buttons, and the active Ratified Case Law Precedents Codex.
        2. **Confederated Peer-Review Deliberation Sheet:** Renders incoming transmission telemetry, problem context card, tested solution card, empirical telemetry banner, interactive SVG donut chart with 75% golden threshold notch, individual juror vote breakdown, and Ratify/Reject actions.
    - **Simulation Loop & Event Flow ([`simulation.js`](app/src/engine/simulation.js) & [`main.js`](app/src/main.js)):**
      - Periodic confederal network broadcasts (every 72–120 hours) delivering new dockets to the council.
      - Direct footer drawer navigation (`🏛️ Sortition Council` / `🏛️ Assemblea Civica`) seamlessly opens the Assembly Codex when no acute dilemma is active.
    - **Multilingual i18n & Solarpunk Aesthetics ([`en.js`](app/src/i18n/en.js), [`it.js`](app/src/i18n/it.js), [`style.css`](app/src/style.css)):** Universal English base stringIDs with full Italian translations and custom glassmorphic solarpunk styling.
- [x] **In-Game Community Feedback & Anonymous Apps Script Relay (Completed):**
  - *Architecture & Security:* Zero-registration community reporting bridge replacing complicated manual RFC bridges. Bridges player ideas and bug reports into **GitHub Issues & Discussions** (`kyberlex/ONE`) via an anonymous Google Apps Script privacy relay (`scripts/feedback_relay_apps_script.js`), keeping the private GitHub token securely inside Apps Script `ScriptProperties` with zero exposure to frontend code.
  - *Implementation:*
    - Created Google Apps Script relay (`scripts/feedback_relay_apps_script.js`) with `doGet` health-check and `doPost` GitHub REST API integration for `[Bug]` and `[Idea / RFC]` issues with automatic labeling (`["bug", "community-report"]` / `["idea", "enhancement", "community-rfc"]`).
    - Added dedicated topbar button (`💡 Idee & Bug`) and glassmorphic Solarpunk modal ([`panel_feedback.js`](app/src/ui/panel_feedback.js)) with tabbed switcher between ideas and bug reports, category selection, and automatic telemetry capture (origin bioregion, node name, simulation tick, client version).
    - Includes 1-click fallback to pre-filled GitHub Web issue creation and configurable local endpoint storage in `localStorage`.
    - Full multilingual i18n support in `en.js` and `it.js`.
- [x] **Civic Volunteer Projects Board (Cantieri Civici) (Completed):**
  - *Constitutional Foundation:* Anchored directly in Chapter V (Art. 5.1 & 5.2): beyond essential rotational subsistence maintenance (2–4h/day), citizens freely pool disposable hours and surplus circular materials into enduring communal megaprojects.
  - *Implementation:*
    - Created modular [`CivicProjectsEngine`](app/src/engine/civic_projects.js) managing 5 Solarpunk megaprojects:
      1. **Agora Socratic Amphitheater (`amphitheater` 🏛️):** Tiered stone hemicycle and acoustic shell (+15 community morale, +30% sortition quorum speed, +20% strike resistance).
      2. **Closed-Loop Anaerobic Biogas Digester (`biogasDigester` 🌿):** Organic compost bioreactor (+25% greenhouse crop yield, +25 kWh night thermal buffer).
      3. **Deep Basalt Rain Reservoir & Reed Wetland (`deepRainReservoir` 💧):** Subterranean cistern and biofilter (+8,000 L water storage, -40% heatwave evaporation loss).
      4. **Solar Thermal Molten Salt Spire (`solarTower` ⚡):** Heliostat central receiver tower (+10,000 kWh battery storage, +20 kWh/tick night electricity generation).
      5. **Cryo-Passive Heirloom Seed Vault (`seedVault` 🌾):** Subterranean genomic preservation bank (-75% blight vulnerability, allied biodiversity trade manifests).
    - Added dedicated **🏗️ Civic Megaprojects** tab to the Node Management modal ([`panel_node.js`](app/src/ui/panel_node.js)), featuring real-time progress bars, 2h/4h volunteer shift donation, common surplus allocation, and live contributor rosters.
    - Built modular 2D Canvas visualizer [`CivicProjectsRenderer`](app/src/settlement/civic_projects_renderer.js): renders realistic timber scaffolding, amber hazard beacons, and progress tags during construction, and architectural vector graphics, water ripples, and glowing cores upon completion.
    - Connected ambient daytime volunteering by idle citizens, deterministic state serialization, and P2P mesh replication (`VOLUNTEER_CONTRIBUTION`).


---

## **4. UX, GAMEPLAY & IMMERSION REFINEMENT BACKLOG (ITERATIVE SPRINT)**

Tracks gameplay usability, aesthetic accessibility, circadian simulation pacing, and visual bug fixes. Items will be tackled individually or in small clusters.

### **Sprint Items & Operational Scope:**

- [x] **ITEM 1: Gender-Agnostic Avatar Customization (Freedom of Expression) (Completed):**
  - *Requirement:* Remove binary gender definitions/labels (`Uomo`/`Donna` or `Male`/`Female`).
  - *Implementation:* Completely decoupled aesthetic customization from gender. Pioneers choose outfit silhouette (`Tunica Solarpunk` / `Tuta da Lavoro`) and can select ANY hairstyle (corti, coda di cavallo, lunghi, caschetto, chignon, doppio chignon, mossi, sfumati, barba solarpunk) regardless of outfit or name. Zero gender labels.

- [x] **ITEM 2: Fixed Camera & Discrete Zoom Framing (No Disorienting Free Pan/Zoom) (Completed):**
  - *Requirement:* Disable unconstrained free mouse-wheel zoom and endless position dragging.
  - *Implementation:*
    - **Settlement Canvas:** Disabled arbitrary position drag (`isDragging = false`); locked camera origin to `(0, 0)` with auto-centering lerp so the settlement village is always framed in the viewport.
    - **Discrete Zoom Enforcement:** Removed continuous float-scaling from mouse wheel and touch pinch; wheel and pinch gestures strictly step through discrete levels (World, Region, Node, Building) with calibrated zoom constants.
    - **World & Region Fullscreen Bounds:** Set Leaflet `maxBoundsViscosity: 1.0` and `worldCopyJump: false`; `showWorld()` fits earth bounds (`fitBounds`) to 100% of viewport without gray borders or void margins.
    - **Mobile Landscape Guidance:** Added responsive `#mobile-landscape-overlay` with rotating device animation, solarpunk glassmorphism, and landscape requirement for mobile portrait screens.

- [x] **ITEM 3: Village Chat Deduplication & Readable Smooth Pacing (Completed):**
  - *Requirement:* Fix duplicate message entries in the Village Chat drawer and eliminate rapid unreadable auto-scroll.
  - *Implementation:*
    - Added two-tier deduplication in `chat_engine.js`: exact message ID matching and content + author + 12-second window deduplication for incoming/stored messages.
    - Sanitized `loadHistory()` parser to strip legacy duplicates from `localStorage`.
    - Paced ambient chatter interval from 8h to 16–24h, silencing chatter during nighttime slumber except rare night-watch logs.
    - Upgraded `panel_chat.js` and `main.js` with position-preserving smooth autoscroll (`scrollToBottom(force)`); auto-scroll only activates if the user is already reading at the bottom of the feed (<70px threshold), eliminating jumpiness.

- [x] **ITEM 4: Local Node Time & Bioregional Circadian Alignment (Completed):**
  - *Requirement:* Display the exact local node solar time (adjusted to bioregion longitude/timezone) and reflect local nightfall realistically.
  - *Implementation:*
    - Added `timezoneOffset = Math.round(lng / 15)` and `localHour = (hour + offset) % 24` to `simulation.js`.
    - Linked the HUD clock display in `hud.js` to show local solar time (e.g. `02:00 • Detroit (UTC-5)`) with an active sun/moon indicator tooltip.
    - Aligned circadian schedules, canvas rendering, and day/night transitions to local solar time across all nodes worldwide.

- [x] **ITEM 5: Dynamic Circadian Time Warp (Fast Night, Playable Day) (Completed):**
  - *Requirement:* Dynamic clock speed: accelerate the night phase so players don't wait through inactive slumber, while slowing down daytime for rich active gameplay.
  - *Implementation:*
    - Converted the simulation loop from a fixed `setInterval` to a reactive, dynamic `scheduleNextTick()` timeout scheduler.
    - During local night (21:00–05:59): 500ms base tick interval at 1x (~2 hours/second), swiftly passing inactive slumber.
    - During local day (06:00–20:59): 1600ms base tick interval at 1x (~0.625 hours/second), providing relaxed, thoughtful, interactive gameplay.
    - Seamlessly scales with speed multipliers (Pause 0x, Normal 1x, Fast 2x, Hyper 5x).

- [x] **ITEM 6: Nighttime Atmosphere Polish: Less Crowds, Warm Bioluminescent Lighting (Completed):**
  - *Requirement:* (a) Reduce citizens wandering at night (too many still awake); (b) Increase warm artificial lighting so the village is cozy rather than pitch-black.
  - *Implementation:*
    - Reduced outdoor night crowd: all citizens sleep inside their usufruct pods except 1 solitary night-watch pioneer on Agora celestial watch (`avatar-npc-10`) plus the active player avatar.
    - Softened night ambient canvas overlay from oppressive 0.66 darkness to a luminous, crisp deep indigo (0.36–0.42).
    - Placed glowing warm amber bollard lanterns along inner (r=175) and outer (r=290) boulevards.
    - Expanded Agora hearth central firepit from 24px to 68px with organic pulsating ember glow and golden gradients.
    - Expanded occupied pod window illumination with warm radiating light pools (`rgba(253, 230, 138, 0.65)`).

- [x] **ITEM 7: Plain-Language UI Sanitization (Remove Programmer Jargon) (Completed):**
  - *Requirement:* Replace programmer jargon and obscure academic terminology with accessible, inviting language for everyday players.
  - *Implementation:*
    - Replaced programmer jargon (`P2P dist db` -> `OFFLINE RESILIENTE`, `ECDSA P-256` -> `Chiave Unica Dispositivo`, `3D WebGL Studio` -> `Studio del Personaggio`).
    - Translated academic and political jargon (`Athenian Sortition Deliberation` -> `Consiglio dei Cittadini` / `Assemblea Civica`, `Demarchy` -> `Consiglio & Assemblea`, `Federated Mesh Peer` -> `Pioniere in Rete`).

- [x] **ITEM 8: Canvas Tooltip & Card Text Overflow Fix (Visual Polish) (Completed):**
  - *Requirement:* Fix text escaping card boundaries in canvas tooltips (as seen in screenshots for *Intergenerational Elder Sanctuary* and *Mia Ramos — Child Pioneer*).
  - *Implementation:* Dynamically compute multi-line text wrapping width (`wrapText`) and calculate card height and width dynamically (`Math.min(Math.max(460, w * 0.46), Math.min(w - 32, 620))`). All subtitles, descriptions, and legal rights wrap comfortably inside the card with generous padding. Text NEVER overflows boundaries.

- [x] **ITEM 9: Currency Localization & Bioregional Economic Valuation (Completed):**
  - *Requirement:* Align currency symbols ($ / € / ¥ / R$ / ₹ / CFA) to the active node's bioregion or provide unified `$`. Define `currencySymbol` per node and interpolate across threat cards, trade manifests, and financial defense counters.
  - *Implementation:*
    - Added `currencySymbol`, `currencyCode`, and `currencyName` properties to all starter nodes in `bioregions.js` (Detroit Delray: `$`, Val di Susa: `€`, Yukon-Alaska: `$`, Sahel: `CFA`, Amazonas: `R$`, Kerala: `₹`).
    - Added `getCurrencyForCountry(country)`, `interpolateCurrency(text, symbol)`, and `formatBioregionalCurrency(amount, symbol)` helpers.
    - Synchronized currency state through `SimulationManager`, `NodeManager`, and `LegacyAdversaryDirector`.
    - Localized Adversary crisis options, threat card descriptions, and civic dilemma text via dynamic regex currency symbol interpolation.
    - Added a dedicated **Commons Treasury & Financial Defense** tab to the node management modal (`panel_node.js`), showing the Emergency Hardware Fund, 100% Debt-Free internal usufruct commons ($0.00 / pax), surrounding legacy extractive pressure ($78,000 / pax), and host territory currency.
    - Augmented inter-node trade convoy manifests (`panel_convoys.js`) with an **Estimated Displaced Extractive Cost** counter, showing the fiat extraction saved by commons barter.
    - Updated hex map legacy debt badges to render dynamically with the active node's currency symbol.
    - Enhanced the HUD threat meter with an active emergency hardware reserve tooltip.

- [x] **ITEM 10: Operational Autonomous Robots & Cybernetic Machinery (Living Canvas) (Completed):**
  - *Requirement:* Bring the unlocked robotics tech-tree to life directly on the 2D Canvas village with animated working robots (Agro-Drones, Autonomous Rovers, SCADA Crawlers, FabLab Cobots) executing chores and visibly reducing compulsory human labor shifts.
  - *Implementation:*
    - Created modular [`RobotManager`](app/src/settlement/robot_manager.js) adhering to modularity constraints (Rule 6 in `PROJECT_RULES.md`).
    - Implemented 5 distinct cybernetic autonomous robot models with vector Canvas 2D graphics, kinematics, and particle emissions:
      1. **Autonomous Agro-Rover Mark II (`farmRover` 🚜):** 4-wheel rover with rotating spokes, headlights, oscillating laser weed scanner, and green leaf/soil particles patrolling the greenhouse crop beds (-4h compulsory human labor/day).
      2. **Smart Aeroponic Mist Drone (`esp32Valves` 🛸):** 4-rotor quadcopter with altitude hover bobbing, blinking cyan telemetry strobe, and downward ultrasonic micro-misting aerosol spray (-2h human labor/day).
      3. **SCADA Microgrid Auto-Balancer (`mpptOptimizer` ⚡):** Tracked crawler with caterpillar treads, 360° rotating LiDAR turret, and amber scanning beam patrolling solar panel racks (-3h human labor/day).
      4. **Common House Sanitization Bot (`cleaningBot` 🧼):** Autonomous dome droid with UV-C purple disinfection floor glow, expressive cybernetic digital eyes `(•‿•)`, patrolling the inner circular boulevard (-2h human labor/day).
      5. **FabLab Shredder & Sorter Cobot Arm (`cncSorter` 🦾):** Articulated 2-segment mechanical robotic arm with pneumatic claw picking scrap pellets and loading the recycling shredder with welding spark particles (-4h human labor/day).
    - Initialized node starter counts (`node.js`) to provide immediate cybernetic life to Detroit Delray on canvas, while keeping FabLab fabrication available for scaling.
    - Integrated raycast hover detection: hovering over any robot triggers a dashed cyan reticle and renders a responsive glassmorphic HUD card showing classification, operating domain, active task, human labor hours cancelled, and open-hardware guarantees.
    - Added interactive click behavior: clicking any robot displays an edge telemetry speech bubble above its sprite and opens the FabLab Dual-Track hardware panel.
    - Connected robot fabrication directly to canvas synchronization: building an automation unit in the Dual-Track panel (`panel_dualtrack.js`) immediately spawns the new unit onto the 2D canvas and reduces human chore quotas in real time.

- [x] **ITEM 11: World Map Viewport Bounds & Soft Twilight Terminator (Completed):**
  - *Requirements:*
    1. **Hide Repeated World Copies:** Prevent Leaflet from tiling/repeating the world map endlessly to the left and right. Clamp viewport to the single canonical central world map using `noWrap: true` on ESRI tile layers (`satelliteLayer`, `physicalLayer`, `referenceLayer`) and enforce strict coordinate bounds `[[-85, -180], [85, 180]]` with clean space/ocean background padding.
    2. **Soft Twilight Terminator (Blur/Gradient vs. Cyan Border):** Eliminate the solid cyan contour line (`color: '#38bdf8'`, `weight: 1.5`) bordering the night shadow on the world map. Replace it with a smooth, atmospheric twilight transition / feathered blur (`stroke: false`, CSS `filter: blur(...)` or SVG gradient mask on `terminatorPane`) so day smoothly blends into twilight and night without artificial hard vectors.
  - *Implementation:*
    - Added `noWrap: true` and strict `bounds: [[-85.05112878, -180], [85.05112878, 180]]` to `satelliteLayer`, `physicalLayer`, and `referenceLayer` in [`world_map.js`](app/src/map/world_map.js).
    - Enforced `maxBounds: [[-85, -180], [85, 180]]` and `maxBoundsViscosity: 1.0` on the Leaflet instance, and calibrated `showWorld()` to fit canonical Earth coordinates `[[-60, -175], [75, 175]]` with clean space padding.
    - Set deep cosmic space background `#020817` on `#world-leaflet-map` and `.leaflet-container` in [`style.css`](app/src/style.css).
    - Extended solar terminator longitude bounds from `[-180, 180]` to `[-200, 200]` and `MAX_LAT` to `85.0` in [`solar_terminator.js`](app/src/map/solar_terminator.js) to prevent meridian edge-feathering seams.
    - Removed cyan stroke border (`stroke: false`, `weight: 0`) from `terminatorLayer` in [`world_map.js`](app/src/map/world_map.js), and applied hardware-accelerated `filter: blur(14px)` on `.leaflet-terminatorPane-pane` in CSS and JS.
    - Preserved crisp clarity on node markers, mesh transit links, and UI controls in higher panes while achieving a soft astronomical twilight roll-off between day and night.

- [x] **ITEM 12: Zoom Controls Consolidation (Top Header Bar vs. Floating Bottom Bar Deduplication) (Completed):**
  - *Requirement:* Discrete zoom controls were duplicated in two locations (top header bar and floating bottom bar). Consolidate into a single canonical control ("ne basta una").
  - *Implementation:*
    - Removed redundant HTML elements (`#floating-zoom-control`, `#btn-float-zoom-*`, `#floating-zoom-level-name`) from [`index.html`](app/index.html).
    - Cleaned up event listeners and UI update bindings in [`zoom_coordinator.js`](app/src/engine/zoom_coordinator.js).
    - Removed unused floating widget CSS rules (`.floating-zoom-control`, `.btn-float-step`, `.float-level-badge`) from [`style.css`](app/src/style.css).
    - Preserved 100% responsiveness and direct 1-click level switching (World / Region / Node / Building) in the top header bar alongside pinch/wheel snapping.

- [x] **ITEM 13: 100% Offline-First Earth Cartography & Cinematic Zoom Transitions (Completed):**
  - *Requirement:* Completely eliminate runtime dependence on external map servers (ESRI / OpenStreetMap) for World and Region zoom views, and provide a seamless, cinematic zoom-in / fade-out transition between Region and Node view.
  - *Implementation:*
    - Bundled local dual-resolution WebP rasters in `public/assets/map/`:
      1. `world_low.webp` (2048×2048, ~230 KB): Instantaneous 10ms local render for global planetary Earth view (`ZOOM_LEVELS.WORLD`).
      2. `world_high.webp` (8192×8192, ~4.30 MB): Stitched from 1,024 Zoom 5 tiles covering the entire planet in razor-sharp definition for the regional watershed crop (`ZOOM_LEVELS.REGION`, calibrated at Zoom 7.0 / ~300 km).
    - Removed external `physicalLayer` and `#btn-toggle-map-style`, avoiding all missing-tile watermarks and ensuring 0 KB network egress.
    - Implemented GPU-accelerated cinematic view transitions in `style.css` and `main.js`:
      - **Dive Transition (Region ➔ Node):** The map scales up (zoom-in) and fades out smoothly into soft bioluminescent light while the settlement village canvas expands from 0.78x to 1.0x with gentle blur settle.
      - **Ascend Transition (Node ➔ Region):** The village canvas gently recedes and fades out while the regional map descends into crisp focus.

- [x] **ITEM 14: Solar Terminator Shadow Blur Calibration (Reduce Twilight Feathering Width) (Completed):**
  - *Requirement:* The shadow blur along the day/night solar terminator (`.leaflet-terminatorPane-pane` filter) was too wide (`blur(14px)`), causing the penumbra transition zone to appear excessively broad and washed out over large landmasses.
  - *Implementation:*
    - Calibrated `filter: blur(5px)` in [`style.css`](app/src/style.css) and [`world_map.js`](app/src/map/world_map.js).
    - Retains smooth astronomical twilight roll-off without excessive spread, maintaining crisp visibility of regional coastlines, topography, and settlements near the terminator line.

- [x] **ITEM 15: Cross-Device Passport QR Code & Sovereign Sync (Completed):**
  - *Requirement:* Seamless multi-device identity replication (smartphone, laptop, desktop, tablet) using sovereign user identity without accounts, passwords, or central servers.
  - *Implementation:*
    - **Cryptographic Engine ([`citizen_passport.js`](app/src/engine/citizen_passport.js)):** Asymmetric WebCrypto ECDSA P-256 keypair generation, collision-immune token format (`ONE:<Name>:<Timestamp>:<Salt>:<PubKeyHex>`), and cryptographic action delta signing.
    - **Interactive Solarpunk Studio ([`panel_passport.js`](app/src/ui/panel_passport.js)):** Sovereign onboarding wizard with 3D avatar preview, outfit silhouette selection, hairstyle and color customizers, and community vocations.
    - **Instant QR Pairing ([`qr_generator.js`](app/src/engine/qr_generator.js)):** Inline Solarpunk SVG QR code rendering containing `?passport=ONE:...` pairing URL.
    - **URL Importer & Storage ([`storage_idb.js`](app/src/engine/storage_idb.js)):** Client checks URL query parameters on startup, auto-adopts the imported token into IndexedDB, updates HUD badge, and cleans URL history.

- [x] **ITEM 16: Multi-Device Button Visibility & Layout Audit + Universal English Base & 14-Language i18n (Completed):**
  - *Requirement:* Audit the visibility and hitboxes of all interactive buttons in the top HUD header and bottom action drawer across common form factors (Desktop, Laptop, Tablet, Mobile portrait/landscape). Ensure that 100% of UI strings have a canonical English base and are mapped to `data-i18n` with zero hardcoded non-English strings (Gate D8).
  - *Implementation & Verification:*
    - **Header & Layout Calibration:** Fixed unclosed `.hud-left-brand-row` wrapper tag in `index.html` preventing proper 3-column header flex distribution. Decoupled sovereign utility buttons (`#btn-open-passport` and `#btn-open-feedback`) from the discrete zoom bar into the top-right action stack (`.hud-top-actions`), shrinking the discrete zoom bar from 716px down to 280px.
    - **Multi-Device Responsive Breakpoints (`style.css`):**
      - **Desktop (1920×1080):** Zero overflow (`right = 1906px <= 1920px`). Full text badges, 4 meters, and discrete zoom bar.
      - **Laptop (1366×768):** Zero overflow (`right = 1356px <= 1366px`). Compact meters (82–98px), iconified pills (`🔑`, `💡`), auto-hidden long alert ticker and threat subtitle.
      - **Tablet Landscape (1024×768):** Zero overflow (`right = 1018px <= 1024px`). Compact micro-meters (62–74px), compact zoom buttons (24px, 28px), streamlined footer action drawer.
      - **Mobile Landscape (844×390):** Zero overflow (`right = 840px <= 844px`, `bottom = 267px <= 390px`). Ultra-compact HUD fitting comfortably within 844px landscape width.
      - **Mobile Portrait (390×844):** Responsive `#mobile-landscape-overlay` rotation guidance active; if dismissed, zero document-level horizontal scroll (`scrollWidth <= clientWidth`), with smooth horizontal touch-scrolling on `.hud-meters-row` and `.actions-btn-bar`.
    - **Touch Hitboxes (WCAG 2.5.5 Level AAA):** Enforced minimum 44×44px touch hitboxes using CSS `::after` pseudo-element extensions on all interactive buttons (`.btn-zoom-step`, `.zoom-segment-btn`, `.btn-action-nav`, `.btn-speed`, `.btn-passport-pill`, `.btn-feedback-pill`).
    - **Universal English Base & 14-Language i18n Synchronization (Gate D8):**
      - Audited and converted all hardcoded strings in `index.html`, `panel_dwelling.js`, `panel_citizen.js`, and `prop_3d_viewer.js` to semantic English fallbacks with `data-i18n`, `data-i18n-title`, and `t()` wrappers.
      - Synchronized all 14 official languages (`en`, `it`, `es`, `fr`, `de`, `pt`, `ru`, `zh`, `ja`, `ko`, `hi`, `ar`, `id`, `tr`) via `scripts/sync_sim_i18n.py`.
      - Verified 100% key parity (exactly 692 keys across each of the 14 dictionaries with 0 missing and 0 extra keys).
      - Passed Gate D2 zero-leak OpSec audit and verified production build with Vite.

- [x] **ITEM 17: Interactive Onboarding Guide (First-Time Player Walkthrough) (Completed):**
  - *Requirement:* Guided interactive tutorial / spotlight tour for new players who complete passport creation and arrive in the settlement for the first time.
  - *Scope & Steps:*
    1. **Core Survival Loop (HUD Vital Meters):** Spotlight on the top 4 meters (⚡ Energy, 💧 Water, 🥗 Calories, 💻 Compute), explaining battery buffers, cistern reserves, and the biometric floor (2,200 kcal/die).
    2. **Living Settlement Canvas:** Highlight the central Agora, usufruct pods (how to claim a dwelling), and daily rotational chores.
    3. **Action Bar & Civic Governance:** Introduce the bottom drawer: Sortition Council (Athenian demarchy), Chore Roster (2-4h work shifts), Civic Megaprojects, and Inter-Node Trade Convoys.
    4. **Dual-Track & Cybernetics:** Showcase the FabLab automation tech-tree (building robots to permanently eliminate human chore hours) and open-hardware blueprint exports.
    5. **UX Controls:** Step-by-step tooltip callouts with "Next", "Back", and "Skip Tour", stored in `localStorage` so it only triggers once per citizen.
  - *Implementation & Verification:*
    - **Engine Architecture ([`guide_tour.js`](app/src/ui/guide_tour.js)):** Built `GuideTourController` coordinating dynamic SVG mask cutouts (`#guide-spotlight-mask`), pulsating bioluminescent reticles (`#guide-spotlight-reticle`), and viewport-clamped glassmorphic card positioning.
    - **5 Guided Stages:**
      1. *Core Survival Loop:* Highlights `.hud-meters-row` and explains physical Leontief thermodynamic flows, battery buffers, rain cisterns, and the unconditional 2,200 kcal/die biometric floor.
      2. *Living Village:* Smoothly pans camera to the central Agora hearth and highlights usufruct pods, explaining dynamic usufruct, zero speculation, and sabbatical locks.
      3. *Civic Governance:* Spotlights `.actions-btn-bar` across Athenian sortition councils, rotational chore rosters (2–4h daily shifts), and inter-node trade convoys.
      4. *Dual-Track Cybernetics:* Spotlights `#btn-open-tech` across FabLab autonomous robots (agro-rovers, mist drones, SCADA crawlers) and open-hardware .STL CAD / Home Assistant YAML blueprint exports.
      5. *Sovereign Autonomy:* Spotlights `#btn-open-passport` and discrete zoom bar across zero-server ECDSA P-256 identities, QR pairing, and multi-scale cartography.
    - **Universal English Base & 14-Language i18n Synchronization (Gate D8):**
      - Added 44 new keys to `NEW_KEYS_EN` and `NEW_KEYS_IT` in `scripts/sync_sim_i18n.py`.
      - Executed concurrent multi-threaded synchronization, ensuring 100% key parity (998 keys each across all 14 languages: `en`, `it`, `es`, `fr`, `de`, `pt`, `ru`, `zh`, `ja`, `ko`, `hi`, `ar`, `id`, `tr`).
    - **UI & Replay Controls:**
      - Added `#btn-open-guide` pill to the top HUD header (`.hud-top-actions`) with responsive collapse rules (`#guide-btn-label` auto-hiding on narrow screens).
      - Added interactive CTA banner and `🧭 Interactive Guide` replay button inside the sovereign citizen passport card (`panel_passport.js`).
      - Verified production build (`npm run build`) and complete 5-step interactive browser walkthrough with `browser_subagent`.

- [x] **ITEM 18: One-Click Multiplayer Invite Link & Serverless Signaling (Room URL) (Completed):**
  - *Requirement:* Enable players to easily invite a friend or collaborator into their settlement via a single clickable URL (e.g., `https://<domain>/?joinNode=detroit&invite=<room_id>`).
  - *Implementation & Verification:*
    - **Serverless Decentralized Signaling Bridge ([`p2p_mesh.js`](app/src/engine/p2p_mesh.js)):**
      - Integrated serverless Nostr NIP-01 WebRTC room signaling via decentralized Nostr relays (`relay.damus.io`, `nos.lol`, `relay.primal.net`) using `trystero/nostr`.
      - Built automated room joining (`joinSignalingRoom(roomId)`), room leave (`leaveSignalingRoom()`), and dynamic invite token generation (`oasis-<nodeId>-<randomToken>`).
      - Synchronized P2P message actions (`HANDSHAKE_PULSE`, `DELTA_BROADCAST`, `SYNC_RESPONSE`) across both local multi-tab `BroadcastChannel` and zero-server WebRTC DataChannels with peer status telemetry.
    - **Solarpunk Invite Modal Controller ([`panel_invite.js`](app/src/ui/panel_invite.js)):**
      - Designed interactive glassmorphic invite modal with active node banner, copyable URL input, one-click `📋 Copy Link` with feedback animation, `📲 Share Link` (Web Share API), 2D SVG QR code generator, and `🔄 New Room Code` regeneration.
      - Integrated real-time mesh telemetry card detailing active room ID, Nostr NIP-01 relay network state, WebRTC connection status, and live connected peer badges.
    - **UI Markup & Responsive HUD Header ([`index.html`](app/index.html), [`style.css`](app/src/style.css)):**
      - Added `#btn-invite-friend` pill button with icon (`🔗`) to `.hud-top-actions` alongside Character, Guide, and Ideas buttons.
      - Implemented responsive collapse rules (`#invite-btn-label` auto-hiding on narrow screens) and 44×44px WCAG AAA touch hitboxes across all breakpoints (Desktop, Laptop, Tablet, Mobile).
    - **Passport Integration & Arriving Welcome Flow ([`panel_passport.js`](app/src/ui/panel_passport.js), [`main.js`](app/src/main.js)):**
      - Added quick-access invite CTA banner inside the sovereign citizen passport modal.
      - Added newcomer welcome banner in passport creation wizard (`passport-invite-welcome-banner`) when arriving via invite URL.
      - In `main.js`, auto-detects `invite` and `joinNode` URL query parameters, auto-switches settlement to invited node (bypassing prior home node storage override), auto-connects to the serverless Nostr signaling room, and auto-opens the sovereign passport issuance wizard with a welcoming HUD alert.
    - **Universal English Base & 14-Language i18n Synchronization (Gate D8):**
      - Added 30 new semantic i18n keys to `scripts/sync_sim_i18n.py` across `NEW_KEYS_EN` and `NEW_KEYS_IT`.
      - Executed concurrent synchronization script: 100% key parity (1,028 keys each across all 14 official languages: `en`, `it`, `es`, `fr`, `de`, `pt`, `ru`, `zh`, `ja`, `ko`, `hi`, `ar`, `id`, `tr`).
    - **Build & Browser Verification:**
      - Passed production build (`npm run build`).
      - Verified modal interactions, clipboard copy, room code rotation, and responsive layout via `browser_subagent`.

- [x] **ITEM 19: Direct Human-to-Human P2P Chat & Whisper Verification (Completed):**
  - *Requirement:* Optimize and verify live direct communication between two real human players in the village chat, providing visual distinction between real peers and ambient resident chatter, E2EE private whisper channels, and synchronized in-canvas speech bubbles.
  - *Implementation & Verification:*
    - **Visual Distinction (Real Human Peers vs Ambient Resident NPCs):**
      - **Live Peer Badge & Latency (`panel_chat.js`, `style.css`):** Built prominent live badge (`🌐 Live Peer <ping>ms`) with a pulsating green indicator (`@keyframes pingPulse`) and public key fingerprint badge (`🔑 <shortFingerprint>`), paired with a luminous cyan solarpunk border (`rgba(56, 189, 248, 0.65)`) and avatar highlight.
      - **Muted NPC Resident Styling:** Settlement NPC chatter is cleanly delineated with a muted slate badge (`🌱 Resident`) and soft styling without ping indicators, making incoming peer messages immediately recognizable at a glance.
    - **Sovereign Whisper Channel (E2EE P-256 / AES-GCM Direct Messaging):**
      - **Cryptographic Encryption Engine (`chat_engine.js`):** Integrated Web Crypto API (`crypto.subtle`) key derivation (SHA-256 digest of recipient public key / fingerprint) and AES-GCM 256-bit encryption with random 12-byte IVs for true end-to-end confidential messaging.
      - **Confidential Whisper Privacy Filter:** P2P chat engine filters whisper messages across the mesh so that only the sender and the designated recipient can decrypt and view private direct whispers.
      - **Interactive Recipient Selector (`panel_chat.js`):** Designed dedicated `.whisper-recipient-bar` displaying active target, dropdown switcher between connected WebRTC/local peers and village residents, and live ECDSA key fingerprint chip (`🔑 res-elen`).
      - **Private Whisper Banners:** Outgoing and incoming whispers render with a distinctive violet/purple glassmorphic card, lock badge, recipient/sender indicators, and `🔒 E2EE P-256` tag.
      - **Solo Simulation Testing:** Added responsive simulated reply from ambient residents when whispered to, allowing full offline verification of encryption/decryption loops.
    - **In-Canvas Speech Bubbles on 2D Living Canvas (`settlement_renderer.js`):**
      - **Usufruct Dwelling Pod Speech Bubbles:** Integrated floating solarpunk speech bubbles rendered directly above the roof of claimed or occupied usufruct dwellings with golden borders for the player, cyan for human peers, and emerald for residents.
      - **Dynamic Peer Avatar Generation:** Created `ensurePeerAvatar()` dynamically instantiating avatars for newly connected human peers on the canvas with cyan rings, `🌐 PEER` badges, and synchronized speech bubbles.
      - **Citizen Avatar Speech Bubbles:** Synchronized bubble rendering across both free-text messages and categorized smart quick-phrases with smooth 500ms alpha fadeout.
    - **Mesh Latency & Delta Ingestion Hardening (`p2p_mesh.js`, `main.js`):**
      - Hardened `ingestSignedDelta()` with automatic fallback delta IDs, resolving dropped chat message payloads.
      - Added real-time RTT / ping latency tracking for all connected WebRTC and local tab peers via `getPeerLatency()` and `getConnectedPeers()`.
      - Integrated `panel_citizen.js` `onOpenChat()` callback to auto-open direct whisper targeting the selected citizen or peer.
    - **Universal English Base & 14-Language i18n Synchronization (Gate D8):**
      - Added 13 new semantic i18n keys to `NEW_KEYS_EN` and `NEW_KEYS_IT` in `scripts/sync_sim_i18n.py`.
      - Executed concurrent synchronization script: 100% key parity (1,041 keys each across all 14 official languages: `en`, `it`, `es`, `fr`, `de`, `pt`, `ru`, `zh`, `ja`, `ko`, `hi`, `ar`, `id`, `tr`).
    - **Build & Subagent Browser Verification:**
      - Passed production build (`npm run build` in 722ms).
      - Verified end-to-end in live browser via `browser_subagent`: chat toggle, Whisper recipient switching, E2EE message sending/decryption, Quick-Phrases drawer, live peer badge/latency indicators, and canvas speech bubbles.

- [x] **ITEM 20: User Guide Overhaul & Markdown-to-Vector-PDF Transition (Completed):**
  - *Requirement:* Update the simulator user handbook to reflect all recently introduced features, and modernize the compilation pipeline from a raster PNG-heavy PDF into a structured Markdown (`.md`) document compiled into clean, searchable vector PDF.
  - *Implementation Details:*
    - **Living Field Manual & Architectural Handbook (`sim/USER_GUIDE.md`):**
      - Created comprehensive, structured 9-chapter Markdown manual (37KB) covering all 20 simulation features.
      - **Chapter 1:** Solarpunk Imperative, Leontief Thermodynamics, 4 Vital Flows (Energy, Water, Calories, Compute), and Circadian Warp.
      - **Chapter 2:** Living Settlement Canvas (60 FPS, particle shaders, day/night lighting), 5 Cybernetic Robots (`ROV-01`, `DRN-02`, `SCADA-03`, `LOG-04`, `BOT-05`), and 100% Offline Global Cartography with astronomical solar terminator.
      - **Chapter 3:** Dynamic Usufruct Housing ("Use It or Lose It" invariant, pod claiming, circular furniture swap, personal gear inviolability) and Cryptographic Sabbatical Locks (up to 90 circadian days).
      - **Chapter 4:** Rotational Chores & Civic Guilds (Land, Facilities, Care, Workshop), Second-Law entropy & MTBF, and Cybernetic Labor Cancellation toward zero human chore hours.
      - **Chapter 5:** Athenian Sortition Assembly (tiered odd parity: 3 < 50 pop, 15 >= 50 pop), Legacy Adversary AI dilemmas, and Confederal Case Law Codex (75% supermajority threshold).
      - **Chapter 6:** Cantieri Civici (multi-stage megaprojects: Amphitheater, Geothermal, Induction Smelter, Biogas Sphere, LoRa Mast) and Inter-Node Barter Convoys ($ fiat displacement tracking).
      - **Chapter 7:** Sovereign Cryptographic Passports (local ECDSA P-256 keypair, SVG avatar, 2D QR camera sync), Serverless Multiplayer Rooms (WebRTC mesh + Nostr NIP-01 signaling), and Village Chat with subtle ECDH + AES-256-GCM E2EE Whispers and Quick-Phrases.
      - **Chapter 8:** Dual-Track Open Hardware Bridge, Interactive 3D Prop Inspector (1:50 miniature & 1:1 real scale), one-click `.STL` CAD and `.YAML` Home Assistant exports, and FabLab Robotics Tech Tree.
      - **Chapter 9:** Anonymous Feedback Relay (stateless Google Apps Script to GitHub Issues proxy), 7-Stage Interactive Onboarding Tour, complete keyboard shortcuts cheatsheet, and Pioneer Diagnostics/FAQ.
    - **Modernized Markdown-to-Vector-PDF Pipeline (`sim/generate_handbook.py`):**
      - Direct Markdown compilation via Python `markdown` with extensions (`tables`, `fenced_code`, `toc`, `attr_list`).
      - Injected print-ready Solarpunk CSS template for A4 portrait with CSS Paged Media `@page` margin boxes (`@top-left`, `@top-right`, `@bottom-left`, `@bottom-right`, `counter(page)` of `counter(pages)`), and `@page :first` header suppression.
      - Automated figure transformation converting Markdown image/caption pairs into semantic `<figure>` and `<figcaption>` elements with `break-inside: avoid;`.
      - Executed headless Google Chrome `--print-to-pdf` with `--allow-file-access-from-files` and `--no-pdf-header-footer`, producing a 100% searchable vector PDF (`sim/O-ASIS_User_Handbook.pdf`).
    - **High-DPI In-Game Screenshot Audit (`sim/handbook_assets/`):**
      - Generated 13 high-resolution 3200×1920 (deviceScaleFactor: 2) in-game screenshots capturing all primary gameplay panels and modals via isolated Chrome DevTools Protocol automation:
        - `01_settlement_village.png`, `02_world_map.png`, `03_sortition_council.png`, `04_chores_maintenance.png`, `05_housing_usufruct.png`, `06_dualtrack_robots.png`, `06_dualtrack_hardware_3d.png`, `07_civic_megaprojects.png`, `08_trade_convoys.png`, `09_player_passport.png`, `10_multiplayer_invite.png`, `11_village_chat.png`, `12_feedback_relay.png`.
    - **Verification & Quality Gate Audit:**
      - Verified PDF compilation via `pymupdf`: exact 16-page layout with balanced content and 100% vector text searchability across all core simulation keywords.
      - Zero personal leak matches (Gate D2: `Kyberlex <kyberlex@proton.me>`, zero local workstation paths or personal names).
      - Passed production build (`npm run build` in 1.60s).
---

## **5. LOW-PRIORITY CONTINGENCY BACKLOG (FROZEN / ON-DEMAND)**

- [x] **ITEM 21: itch.io 1KB Iframe Wrapper Proxy (Zero-Maintenance Auto-Sync) [COMPLETED]:**
  - *Context:* Precedentemente la distribuzione su itch.io richiedeva il re-upload manuale di uno zip da 8MB per ogni singolo aggiornamento.
  - *Implementation:* Creato script generatore [`scripts/package_itch_iframe.py`](../scripts/package_itch_iframe.py) che produce [`spread/o-asis-itch-iframe.zip`](../spread/o-asis-itch-iframe.zip) (1.47 KB). Il pacchetto contiene un `index.html` responsive a tutto schermo con iframe diretto verso `https://one-oasis.surge.sh` (con permessi per fullscreen, WebRTC clipboard e QR scan).
  - *Outcome:* Una volta caricato lo zip su itch.io una sola volta, ogni futuro deploy su Surge aggiorna istantaneamente in tempo reale anche la pagina su itch.io, riducendo a zero il costo di manutenzione.
  - *Status:* **COMPLETATO & TESTATO (1.47 KB package pronto in `spread/o-asis-itch-iframe.zip`)**



