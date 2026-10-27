# **O.N.E. WEB APPLICATION REDESIGN & ARCHITECTURAL REFACTORING SPEC (`webapp/TODO.md`)**

## **I. EXECUTIVE SUMMARY & STRATEGIC PIVOT**

The current web portal (`webapp/index.html`, `styles.css`, and `app.js`) historically evolved by continuous accumulation. While it successfully serves as a comprehensive archive of the project's intellectual depth, it currently suffers from **monolithic cognitive overload** (1,320 lines of dense HTML, 9 stacked sections, and 5 competing hero CTAs) and a visual language rooted in **dark cyberpunk / Web3 glassmorphism** that inadvertently signals "crypto token / sci-fi video game" rather than an authoritative, physical commons and constitutional foundation.

This specification outlines the comprehensive refactoring of the web portal toward **timeless architectural minimalism, editorial elegance, and focused user conversion**, drawing visual and spatial inspiration from benchmarks such as **[WikiHouse.cc](https://wikihouse.cc)** and **[Riverview Consulting](https://riverviewconsulting.co.nz)**, while **strictly preserving the complete 15-language multilingual engine (`i18n/`)** and zero-tracker privacy standards.

---

## **II. CORE OBJECTIVES & INVARIANTS**

1. **The Architectural Paradigm (WikiHouse / Riverview Consulting Benchmark):**
   * Transition from *deep-space carbon (`#06090e`), neon cyan/emerald glows, and frosted glass cards* to an **architectural, material, and editorial aesthetic**: warm chalk/paper background, crisp graphite/ink typography, 1px hairline grid structures, generous white space, technical line drawings, and authentic material textures (timber, earth, steel).
2. **From Monolithic Encyclopedia to "Grand Hall" Navigation:**
   * Break the single 15-scroll vertical dump into a clean, decisive **Front Door (Grand Hall)** leading to focused, modular rooms/views.
3. **Elevating the Call for Co-Stewards:**
   * Move the recruitment of the 4 Domain Co-Stewards (and the Media/Community Steward) from the very bottom (Section 9, line 1125) to a prominent, immediate position on the front door.
4. **Reduction of Choice Paralysis (Hero CTAs):**
   * Replace the 5 competing hero buttons with **2 decisive primary paths**:
     - `[ Discover Track B ]` (Orientation, 3-min explainer & core contrast).
     - `[ Join as Co-Steward / Builder ]` (Direct recruitment & technical RFCs).
5. **Preserving 100% of the Multilingual Infrastructure (`i18n/`):**
   * Retain all 15 localized language dictionaries (`en`, `it`, `de`, `fr`, `es`, `pt`, `ru`, `zh`, `ja`, `ko`, `hi`, `ar`, `id`, `tr`).
   * Preserve all existing `data-i18n` attributes, language selector dropdown, dynamic RTL support, and multi-script Google Font fallbacks.
6. **Class-0 Hard Constraints Compliance:**
   * 100% free software (AGPL-3.0), zero monetization, zero trackers (GoatCounter privacy analytics only), zero leak of personal workstation metadata (`Kyberlex` / `kyberlex@proton.me` exclusively).

---

## **III. DESIGN SYSTEM OVERHAUL: FROM CYBERPUNK TO ARCHITECTURAL ELEGANCE**

### **1. Color Palette & Materiality**
* **Primary Canvas:** Warm architectural white / matte chalk (`#fbfbfa` or `#f7f7f5`) for light mode, with an optional deeply muted, warm architectural slate/graphite for dark mode (`#121316` without neon dropshadows).
* **Typography & Ink:** Deep charcoal ink (`#18191b`), medium architectural slate (`#4b5563`), subtle technical captions (`#6b7280`).
* **Material Accents (Replacing Neon Glows):**
  - *Warm Terracotta / Cedar:* Earthy structural accent reflecting timber and habitat (`#c25e38` or `#b45309`).
  - *Engineering Blueprint Blue:* Crisp, understated technical contrast (`#1d4ed8` or `#2563eb`).
  - *Sage / Forest Patina:* Subtle ecological reference (`#2d6a4f` or `#059669`).
* **Borders & Dividers:** Clean 1px hairline grid dividers (`rgba(0, 0, 0, 0.08)` or `#e5e7eb`), eliminating fuzzy neon glows, blur filters, and multi-layer box shadows.

### **2. Typography & Layout**
* **Headings & Hierarchy:** High-contrast, elegant Grotesk sans-serif (`Inter`, `Outfit`, or system Swiss Grotesk) with tight tracking and deliberate scale.
* **Editorial & Literature:** Refined serif for philosophical/constitutional passages (`Newsreader`, Georgia).
* **Technical Metadata:** Monospace for articles, Leontief formulas, and RFC specs (`JetBrains Mono`).
* **Grid Discipline:** Asymmetrical, Swiss-style architectural grid with generous breathing room (padding and margins increased by 40-50%), allowing technical diagrams and typography to command the page.

---

## **IV. INFORMATION ARCHITECTURE (IA) RESTRUCTURING**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       O.N.E. FRONT DOOR (GRAND HALL)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Minimal Header & Nav (Brand Acrostic, Language Selector, Clean Links)    │
│ 2. Hero: "Deploy Track B: When Machines Work, Humanity Inherits the Earth"  │
│    - 2 Clear CTAs: [ Discover Track B ] & [ Join as Co-Steward ]            │
│    - Visual Hook: `one-wars-remastered.mp4` (2m 10s Civilizational Prologue)│
│ 3. The Visceral Contrast Matrix: Track A (Legacy Warfare/Debt) vs. Track B  │
│ 4. Immediate Call for Co-Stewards Banner (Phase 0 Genesis Hardening)        │
│ 5. The 4 Gateways (Modular Cards / Hubs):                                  │
│    ├── 🏛️ The Living Constitution & AI Benchmark                           │
│    │   └── Architectural Walkthrough: `O.N.E(8min)Easy_Master.mp4`          │
│    ├── 📚 The 6-Volume Novel Saga & Audio Archive                          │
│    ├── 🎮 The Thermodynamic Sandbox & Living Game (O-ASIS)                  │
│    └── 🛠️ The Seed Node Blueprint & Open Hardware (WikiHouse/MHU)           │
│ 6. Future Growth Tools (e.g., Debt Jubilee Calculator / Watershed Passport) │
│ 7. Sovereign Footer (AGPL-3.0, Swiss Foundation, Tor/Surge/GitHub Mirrors)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **V. ACTIONABLE IMPLEMENTATION CHECKLIST (PHASED)**

### **Phase 1: Design Tokens & CSS Cleanup (`webapp/styles.css`)**
- [x] **CSS Variable Audit:** Replaced neon glow tokens with architectural flat/hairline variables and Swiss typography tokens.
- [x] **Background & Canvas:** Implemented clean architectural canvas (`--bg-body: #0d0f12`, `--card-bg: #14171d`).
- [x] **Card & Panel Reset:** Clean 1px hairline borders (`var(--border-subtle)`), refined hover states and Swiss editorial typography.
- [x] **Button Simplification:** Standardized solid-fill primary buttons and architectural outlined secondary buttons.

### **Phase 2: HTML Structure & Front Door Pruning (`webapp/index.html`)**
- [x] **Hero Section Cleanup & Video Re-allocation:**
  - Pruned buttons down to 2 primary actions: `[ Discover O.N.E. → ]` (`#synoptic`) and `[ Build (Co-Steward) ]` (`#co-stewards`).
  - Featured **`one-wars-remastered.mp4`** (2m 10s) as the high-impact visual prologue right in the Hero/Contrast section with 14-language synchronized subtitles.
- [x] **Constitution Architectural Video:**
  - Placed the 8-minute architectural explainer (**`O.N.E(8min)Easy_Master.mp4`**) in the header of the `#constitution` section with clean opening frame poster, 14-language synchronized subtitles, and direct MP4 / Torrent downloads.
- [x] **Promote Co-Stewards:** Relocated the `#co-stewards` section immediately below the Hero section featuring Pillar 0 Media Co-Steward and technical domain pillars (Economics, Demarchy, SIMONE Simulation, Habitat) linking directly to GitHub Discussions (#13, #9, #10, #11, #12).
- [x] **Create Modular Gateway Sections:** Implemented the 4 Gateway Hubs (`#gateways`): Step 1 Understand (`#synoptic`), Step 2 Inspect (`#constitution`), Step 3 Challenge (`#challenge`), Step 4 Experience (`#books`).
- [x] **Dialectic Chat Refinement:** Cleaned up `#challenge` section into a sleek Stress-Test Arena with prompt chips and deterministic fallback firewall.

### **Phase 3: Multilingual & JavaScript Synchronization (`webapp/app.js` & `webapp/i18n/`)**
- [x] **i18n Dictionary Integrity:** Verified all 15 JSON files in `webapp/i18n/` maintain key parity for newly structured headlines, buttons, and gateway descriptions (including `hero_video`, `contrast`, `stewards`, and `gateway`).
- [x] **RTL & Multi-Font Verification:** Confirmed Arabic (`ar.json`), East Asian (`zh`, `ja`, `ko`), and Indic (`hi`) typography scales cleanly under the architectural grid.
- [x] **Video Subtitle Auto-Synchronization:** `syncVideoSubtitles(lang)` synchronizes WebVTT subtitles on both players whenever the user changes the UI language.
- [x] **State & Modal Logic:** Streamlined `app.js` event listeners for modal views (e.g. ebook reader, blueprint viewer, constitution accordion) to ensure zero regressions.

### **Phase 4: Future Interactive Experience Enhancements**
- [x] **Thermodynamic Mass-Energy Balances (Supercedes Fiat Debt Calculator):**
  - *Architectural Decision:* Direct calculation of heterogeneous fiat debt instruments (e.g. US student debt vs German rental vs Indian informal agricultural credit) was audited and retired as an unreliable "toy slider" that distorts local reality across 14 languages.
  - *Resolution:* Fully grounded in the physical Leontief mass-energy equations (2,200 kcal, potable water, 0.3h daily maintenance) modeled natively in the Living Commons Game (`game/`) and SIMONE scientific engine (`simone/`).
- [x] **Bioregional Watershed Explorer (Architectural Relocation):**
  - *Architectural Decision:* To maintain webapp page-load speed (<500ms), zero bloat, and Swiss-editorial minimalism, the interactive geospatial/hydrological map is relocated from the institutional web portal to the Interactive Platform Hub (`https://kyberlex.github.io/ONE/`), where it serves as the Step 1 Macro-Planetary Gateway leading directly into the O-ASIS Sandbox (Step 2 Meso-Governance) and Living Commons Game (Step 3 Micro-Habitat).

---

## **VI. VERIFICATION CRITERIA**

1. **Visual Test:** Does the site feel like an authoritative, timeless architectural and civic foundation (comparable to WikiHouse.cc or a Swiss design archive) rather than a crypto/gaming project?
2. **Speed & Lightweight Performance:** Page load remains instantaneous, zero layout shift, fully accessible, and mobile responsive.
3. **i18n Test:** Switching between all 15 languages seamlessly updates 100% of visible UI text without breaking layout grids.
4. **Conversion Clarity:** Can a new visitor understand what O.N.E. is within 10 seconds, and can a prospective Co-Steward find the application path within one scroll?
