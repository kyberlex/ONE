---
name: game-engine
description: >-
  Operational protocol for O.N.E. Living Commons Game (game/).
  Enforces the 'Sim Reuse First' mandate: always audit, extract, and reuse proven graphics,
  animations, math, maps, and styles from sim/ before creating anything new.
---

# **GAME-ENGINE: O.N.E. LIVING COMMONS GAME & "SIM REUSE FIRST" MANDATE**

Operational protocol governing all development within [`game/`](game/) under persona **Kyberlex** (`kyberlex@proton.me`).

---

## **I. THE CARDINAL RULE: "SIM REUSE FIRST" (NEVER REINVENT THE WHEEL)**

Before writing a single line of canvas rendering, animation math, thermodynamic formula, cartography layer, CSS token, SVG icon, or translation in `game/`, the agent **MUST ALWAYS** inspect and reuse what is already working in [`sim/`](../sim/):

```
┌────────────────────────────────────────────────────────────────────────┐
│               MANDATORY WORKFLOW FOR ALL TASKS IN game/                │
│                                                                        │
│  1. SEARCH sim/       Check if the asset, math, or component exists    │
│                       in sim/app/src/ (settlement, map, engine, ui).   │
│                               ▼                                        │
│  2. TRANSPLANT        Copy the proven routine into game/src/.          │
│                               ▼                                        │
│  3. REFINE & FILTER   Strip legacy spaghetti, remove full-screen       │
│                       modals, and enforce the 5 Non-Negotiable Rules.  │
│                               ▼                                        │
│  4. VERIFY ON 5174    Validate in browser on desktop & mobile viewports.│
└────────────────────────────────────────────────────────────────────────┘
```

---

## **II. EXACT REUSE REGISTRY FROM `sim/`**

| Game Feature | Source in `sim/` to Re-Use | What to Transplant & Preserve |
| :--- | :--- | :--- |
| **Living 2D Canvas & Sprites** | [`sim/app/src/settlement/settlement_renderer.js`](../sim/app/src/settlement/settlement_renderer.js) | • Camper van sprite & shadow.<br>• Animated walking pioneer sprites, tool animations, footstep cadence.<br>• Sun-tracking solar panels, spinning wind turbines, rainwater tanks with level indicators, greenhouses with growing crop rows.<br>• Weather particle systems (rain, wind gusts, lightning flashes, heat haze, night sky stars).<br>• Dynamic circadian lighting (dawn orange, bright noon, dusk amber, deep blue night). |
| **Planetary Cartography & Regional Maps** | [`sim/app/src/map/`](../sim/app/src/map/) | • `world_map.js` (`WorldMapController`).<br>• `solar_terminator.js` (astronomical subsolar calculations & night shadow).<br>• `hex.js` (H3 hexagonal coordinates & math).<br>• `public/assets/map/world_low.webp` & `world_high.webp` (offline Earth raster layers).<br>• Regional dive-in / world zoom transitions. |
| **Thermodynamics & Leontief Physics** | [`sim/app/src/engine/thermodynamics.js`](../sim/app/src/engine/thermodynamics.js) | • 4 conserved physical balances: ⚡ kWh, 💧 Liters, 🥗 Food kcal (2,200 kcal/day floor), 💻 Compute.<br>• Solar irradiance curves (latitude/season/clouds).<br>• Betz limit wind turbine generation.<br>• Greywater reed-bed biological filtration (65% return).<br>• Second-Law entropy & wear-and-tear degradation curves. |
| **Demographics & Labor Chores** | [`sim/app/src/engine/node.js`](../sim/app/src/engine/node.js) | • The 14h/week chore pool (2h/day per citizen = 6h daily team pool for 3 pioneers).<br>• Health, morale, and skill proficiencies.<br>• Dynamic Usufruct housing registry and anti-speculation rules. |
| **Solarpunk Styles & CSS Tokens** | [`sim/app/src/style.css`](../sim/app/src/style.css) | • Solarpunk design tokens (`--bg-dark`, `--emerald-primary`, `--amber-solar`, `--cyan-water`).<br>• Glassmorphism backdrop filters (`backdrop-filter: blur(14px)`).<br>• Glowing node markers, pulsating rings, and dark Leaflet popups. |
| **Bioregions & Climate Data** | [`sim/app/src/data/bioregions.js`](../sim/app/src/data/bioregions.js) | • Climate zones (`ARCTIC`, `TEMPERATE`, `ARID`, `TROPICAL`) with architectural dwelling recommendations.<br>• Latitude-to-climate zone resolver (`getClimateZoneFromLat`).<br>• `GLOBAL_STARTER_NODES` reference beacons. |
| **3D CAD & Hardware Blueprints** | [`sim/app/src/data/models3d.js`](../sim/app/src/data/models3d.js), [`sim/app/src/ui/viewer3d.js`](../sim/app/src/ui/viewer3d.js) | • Three.js 3D STL viewer.<br>• Real-world open-hardware blueprints (.STL / .3MF) and Home Assistant Zigbee/MQTT YAML links. |
| **Storage & P2P Networking** | [`sim/app/src/engine/storage_idb.js`](../sim/app/src/engine/storage_idb.js), [`sim/app/src/engine/p2p_mesh.js`](../sim/app/src/engine/p2p_mesh.js) | • High-capacity IndexedDB local-first database.<br>• Zero-network multi-tab `BroadcastChannel`.<br>• Serverless WebRTC DataChannels via `trystero`. |
| **Multilingual Dictionaries** | [`sim/app/src/i18n/`](../sim/app/src/i18n/) | • 14 complete language dictionaries (en, it, es, fr, de, pt, ru, zh, ja, ko, hi, ar, id, tr).<br>• Dynamic `t(key, fallback)` lookup helper. |

---

## **III. THE 5 NON-NEGOTIABLE REFACTORING FILTERS**

When transplanting code from `sim/` into `game/`, **NEVER** copy the legacy UX friction:

1. **Filter 1 — Ultra-Simple & Direct Copy (Rule 1):**
   * Formula: `[Problem in 5 words] + [Action] + [Benefit]` (max 1–2 short sentences).
   * Zero textbook, academic, or bureaucratic filler.
2. **Filter 2 — Instant Sensory Feedback ("Juice") (Rule 2):**
   * Every click, placement, or assignment MUST produce an instant visual reaction on the canvas (spring bounces, dust puffs, floating `+15 kWh` deltas).
3. **Filter 3 — Terra Nil-Style Bottom Dock (Rule 3):**
   * Never more than 3–4 contextually active buttons visible at once (`[⚡ Solar]`, `[💧 Cistern]`, `[🥗 Garden]`, `[🏕️ Rest]`).
   * Zero full-screen modal tables covering the village canvas.
4. **Filter 4 — Always-On Primary Objective Card (Rule 4):**
   * Pinned at top-left with immediate goal, progress counter (`120 / 500 L`), and reward preview.
5. **Filter 5 — Strict Progressive Disclosure ("The Gated Horizon") (Rule 5):**
   * **Days 1–6 (Van Camp & Pure Survival):** ONLY local village view. No global map, no 3D CAD viewer, no Agora codex. One goal at a time.
   * **Day 7 (The Radio Antenna):** Erecting the LoRa mast triggers *"📡 Signals Detected!"* and unlocks the **Regional Map** & P2P mesh.
   * **Day 15 (The FabLab Workshop):** Constructing the workshop unlocks **Robotics** & the **[Inspect 3D Blueprint 📐]** CAD viewer.
   * **When 3 MHUs Built:** All 3 pioneers sleep in the camper van until 3 Modular Habitat Units are built. Building the 3rd MHU unlocks the **Civic Housing & Usufruct Ledger**.
   * **Day 25 (The Cargo E-Bike):** Crafting the bike unlocks **Inter-Node Travel & Trade Convoys**.
   * **Day 30+ (Resilience & Adversary):** Extreme climate disasters (Atmospheric Rivers, Heat Domes) begin testing physical infrastructure. The Legacy Engine Adversary begins land debt monitoring.
   * **Day 35+ (The Agora Circle):** Expanding to 10+ residents and building the Agora unlocks the **Athenian Demarchy Sortition Engine**.

---

## **IV. QUALITY ASSURANCE GATES FOR `game/`**

Before presenting any completed milestone to the user:
1. **Gate G1 (Reuse Verification):** Did you check if a graphic, formula, or asset already existed in `sim/`? If yes, did you reuse it instead of rewriting it?
2. **Gate G2 (Day-by-Day User OK):** Only proceed to the next day/milestone after receiving the user's explicit OK.
3. **Gate G3 (Zero Console Errors):** Open `http://localhost:5174/` via `browser_subagent` and confirm zero red errors in the console.
4. **Gate G4 (Mobile & Desktop Responsive):** Verify touch-friendly hitboxes (min 44px) and zero horizontal overflow on small screens (390px to 1920px).
5. **Gate G5 (OpSec Zero-Leak):** Never commit personal names or local workstation paths (`/Users/<username>/...`). Public author attribution is exclusively **Kyberlex** (`kyberlex@proton.me`).
