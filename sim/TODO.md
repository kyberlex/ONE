# **O-ASIS DUAL-TRACK SIMULATOR: TODO & OPEN GOVERNANCE CHALLENGES**

This document tracks pending architectural features, research frontiers, and unresolved governance dilemmas for the living simulation engine ([`sim/`](./)).

---

## **1. PENDING GOVERNANCE BRIDGES: SIM-TO-DISCUSSIONS PROTOCOL**

### **The Problem: Anti-Autocratic Ratification of Simulation Hypotheses**

When players or developers discover an empirical friction in the game (e.g. `SIM-QA-01`: labor bottleneck when 15 councilors are seated in a 28-citizen node) and test a resolution, **who decides whether this becomes canon?**
If a single player or developer modifies the Constitution or rules unilaterally, it violates the non-oligarchic foundation of O.N.E.

### **The Objective:**

Build an anonymous, automated bridge to export `[SIMULATION_HYPOTHESIS]` entries from the local game client into **GitHub Discussions** ([`github.com/kyberlex/ONE/discussions`](https://github.com/kyberlex/ONE/discussions)) for public debate and sortition peer-review.

### **Architectural Options Explored (To Decide / Implement):**

1. **Option A: Cloudflare Worker Privacy Relay (100% Automated & Anonymous)**
   - *Architecture:* Local client sends JSON payload to `https://worker.kyberlex.workers.dev/api/propose-hypothesis`.
   - *Security / OpSec:*
     - Worker strips player IP, cookies, and fingerprinting headers.
     - Worker injects private `GITHUB_TOKEN` stored as a Cloudflare Secret (token is NEVER exposed to the frontend).
     - Worker executes GraphQL mutation `createDiscussion` on `kyberlex/ONE` or `kyberlex/one-dual-track`.
   - *Status:* Deferred for review when ready to configure Worker GitHub secrets.

2. **Option B: One-Click Pre-filled URL (Zero-Backend / Client-Side)**
   - *Architecture:* In-game button *"Export Hypothesis to GitHub Discussions"* generates a pre-formatted URL:
     `https://github.com/kyberlex/ONE/discussions/new?category=rfc&title=...&body=...`
   - *Security / OpSec:* Zero tokens or secrets required. Player posts under their own GitHub pseudonym if they choose.
   - *Status:* Candidate for quick integration.

3. **Option C: CLI Batch Exporter (`scripts/publish_sim_hypothesis.py`)**
   - *Architecture:* Python script run by Kyberlex that parses [`oasis/sim_resolutions_qa.md`](../oasis/sim_resolutions_qa.md), runs OpSec zero-leak audit, and publishes pending hypotheses via `gh` CLI.
   - *Status:* Useful for batch curation.

### **Developer Protocol: When We Discover Gaps While Coding**

1. **Friction Detection:** Whenever a mathematical bottleneck, resource deadlock, or constitutional contradiction is discovered during simulator engine coding or writing:
   - Developers/AI agents are strictly forbidden from unilaterally declaring a new permanent rule (enforced by Invariant 7 / Gate D7 in `AGENTS.md`).
2. **Immediate Logging:** Add an entry in [`oasis/sim_resolutions_qa.md`](../oasis/sim_resolutions_qa.md) under ID `SIM-QA-XX` with `[STATUS: SIMULATION_HYPOTHESIS]`, detailing the material friction, the tested countermeasure, and the open governance question.
3. **In-Code Annotation:** Implement the interim countermeasure in the simulator source code tagged with:
   `// PENDING RATIFICATION: SIM-QA-XX (see oasis/sim_resolutions_qa.md)`
4. **Community Export:** Export the hypothesis to **GitHub Discussions** (`Ideas / RFC`) using Option B (one-click pre-filled URL) or Option C (batch CLI exporter).
5. **Ratification & Canonization:** Only after sortition review on GitHub Discussions confirms the solution, advance status to `[STATUS: COMMUNITY_SORTITION_RATIFIED]` and submit a formal amendment to the Living Constitution.

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
   - **Phase 4 (Long-Term Persistence & Git-as-a-State-Anchor - Planned for Post-Alpha / Genesis Block):** See Section D below.

### **D. Git-as-a-State-Anchor: Long-Term Consensus Snapshots on GitHub**

- **Context & Timing:**
  - *Current Alpha Phase:* State lives in local browser `IndexedDB` and P2P WebRTC mesh. We deliberately DO NOT commit hourly snapshots to Git yet, in order to avoid polluting repository history with throwaway test commits while database schemas and gameplay mechanics are rapidly evolving.
  - *Genesis Block Activation:* Once settlement mechanics, robotics tech-trees, and thermodynamics reach stable feature-freeze, the automated GitHub snapshot anchor will be activated.

- **Architecture & Mechanics:**
  - **Canonical Snapshot File:** `sim/app/public/world_snapshot.json` with strict schema versioning (`schemaVersion: 1`, `tick`, `timestamp`, `nodes`, `dwellings`, `robots`, `thermoConsensusHash`).
  - **Automated GitHub Action Cron:** `.github/workflows/world_snapshot_cron.yml` running on a periodic schedule (e.g. every 6 to 12 hours).
  - **Headless Ingestion Script:** `scripts/anchor_world_snapshot.py` acting as an ambient headless peer. It connects to the community P2P network, gathers verified ECDSA-signed action deltas, applies them deterministically, updates `world_snapshot.json`, and commits cleanly:
    `chore(sim): consensus world snapshot [Tick <N>]`
    (Author: `kyberlex-bot <kyberlex@proton.me>`).
  - **Zero-Latency Client Bootstrap:** When any player opens the web app, if their local `IndexedDB` is empty or older than the snapshot, the client fetches `/world_snapshot.json` statically (cached, 0 lag, zero-server cost), instantly populating the current state of Detroit and other nodes, and then connects to WebRTC P2P for real-time delta gossip.
  - **Invariants Upheld:** 100% free software, zero server costs, zero centralized authority, complete cryptographic transparency.

---

## **3. PENDING SIMULATOR ENGINE TASKS**

- [x] **Dynamic Climate Disaster Events (Completed):** Atmospheric rivers and heat dome stress-tests on crop resilience, PV thermal derating, BMS chiller load, and Legacy Adversary AI synergy.
- [x] **Inter-Node Trade Convoys (Completed):** Multi-hex barter logistics with neighboring autonomous nodes, low-carbon vehicle fleet (Rovers, Maglev Rail, Cargo Dirigibles), bioregional surplus/deficit reciprocity, and real-time Leaflet route tracking.
- [x] **P2P Village Chat & Mesh Telegram (Completed):** Hybrid operational quick-phrases (⚡ Alerts, 🚚 Logistics & Barter, 🏛️ Sortition & Assembly, 🤝 Commons & Mutual Aid) + ECDSA-signed free chat for node neighborhood coordination, 1-click resource claiming/donating, live 60 FPS speech bubbles over canvas citizen avatars, and ambient resident chatter.
- [ ] **Sortition Jury Peer-Review System:** In-game sortition councils that evaluate hypotheses generated by other simulated nodes.
- [ ] **1-Click Sim-to-Discussions Hypothesis Bridge:** In-game UI button / pre-filled GitHub Discussion RFC generator to export newly discovered SIM-QA dilemmas for sortition community ratification.
- [ ] **Civic Volunteer Projects Board (Cantieri Civici):** Player-initiated extra community megaprojects (free hours donation + shared materials + living canvas expansion).

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

- [ ] **ITEM 9: Currency Localization & Bioregional Economic Valuation**
  - *Scope:* Align currency symbols ($ / € / ¥) to the active node's bioregion or provide unified `$`. Define `currencySymbol` per node and interpolate across threat cards, trade manifests, and financial defense counters.

- [ ] **ITEM 10: Operational Autonomous Robots & Cybernetic Machinery (Living Canvas)**
  - *Scope:* Bring the unlocked robotics tech-tree to life directly on the 2D canvas with animated working robots (Agro-Drones, Autonomous Rovers, FabLab Cobots) executing chores and visibly reducing compulsory human labor shifts.
