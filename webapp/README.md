# **O.N.E. Web Portal & Public Divulgation Platform (`webapp/`)**

Welcome to the public web portal of **Open Networked Earth (O.N.E.)**. This application serves as the primary gateway for citizens, researchers, engineers, and activists exploring the post-labor civil architecture.

---

## **I. ARCHITECTURE & TECH STACK**

The web portal is intentionally engineered with **zero required compilation build steps**, ensuring maximum accessibility, longevity, and ease of contribution:

* **Core Engine:** Pure semantic HTML5 + Modern Vanilla JavaScript (ES6+).
* **Design System (`styles.css`):**
  - Warm architectural materiality (`#fbfbfa` canvas, crisp `#18191b` typography, 1px hairline borders).
  - Standardized design tokens with strictly defined CSS variables.
  - Automatic Dark Mode (OS `prefers-color-scheme: dark` + `data-theme` override).
  - Responsive layout optimized for mobile, tablet, and ultra-wide screens.
* **Multilingual Engine (`i18n/`):**
  - 15 official languages (`en`, `it`, `de`, `fr`, `es`, `pt`, `ru`, `zh`, `ja`, `ko`, `hi`, `ar`, `id`, `tr`).
  - Reactive in-memory dictionary caching with instant DOM text replacement via `data-i18n` attributes.
  - Native RTL (Right-to-Left) typography support for Arabic (`Cairo`), and multi-script font fallbacks for CJK (`Noto Sans`) and Indic (`Noto Sans Devanagari`).
* **Live Blueprint & Reader Modals (`blueprints/`):**
  - Dynamic client-side markdown streaming and rendering for field manuals and transition handbooks.
* **Privacy & Compliance:**
  - 100% cookie-free, privacy-preserving analytics via GoatCounter.
  - AGPL-3.0-or-later free software license.

---

## **II. RUNNING LOCALLY**

You do not need `npm install` or complex bundle toolchains. Simply serve the directory with any standard HTTP server:

```bash
# Using Python 3
python3 -m http.server 8080 -d webapp

# OR using Node.js / npx
npx serve webapp

# OR using PHP
php -S localhost:8080 -t webapp
```

Then open [`http://localhost:8080`](http://localhost:8080) in your browser.

---

## **III. DIRECTORY STRUCTURE**

```
webapp/
├── index.html          # Master entry point (Grand Hall)
├── styles.css          # Master design system & CSS custom properties
├── app.js              # State machine, i18n switcher, modal readers, challenge engine
├── CNAME               # Custom domain routing
├── .surgeignore        # Asset filter for edge CDN deployments
├── README.md           # This contributor handbook
├── assets/             # Vector SVGs, icons, audio, and video media
│   ├── subtitles/      # Multilingual WebVTT tracks for video explainers
│   ├── videos/         # 8-minute architectural explainer & volume briefings
│   └── ebooks/         # Compiled EPUB and PDF editions of the Living Constitution
├── blueprints/         # Operational field manuals (Stages 0–3, Seed Node Handbook)
├── data/               # Canonical JSON datasets (Constitution, Books, Synoptic)
└── i18n/               # 15 localized JSON translation dictionaries
```

---

## **IV. CO-STEWARD ROADMAP & OPEN CONTRIBUTIONS**

If you are a frontend developer, UI/UX designer, or technical writer, here are active high-impact tasks ready for contribution:

1. **Hero Section Streamlining (Reducing Choice Paralysis):**
   - Consolidate the 5 competing hero buttons into **2 decisive primary paths**:
     - `[ Discover Track B ]` (Guides to 3-min explainer & core civilizational contrast).
     - `[ Join as Co-Steward ]` (Direct recruitment & technical RFCs).
2. **Elevate Call for Co-Stewards:**
   - Elevate the `#co-stewards` domain recruitment section directly below the manifesto/overview to maximize builder onboarding.
3. **Interactive Debt Jubilee Calculator:**
   - Build a lightweight interactive slider widget comparing biological life-hours lost to fiat debt/rent vs. the unconditional O.N.E. survival baseline.
4. **Bioregional Watershed Explorer:**
   - Develop a minimalist Leaflet/Canvas widget allowing visitors to explore their local hydrological catchment basins without national borders.
5. **Accessibility & Micro-Interactions:**
   - Continuous refinement of keyboard navigation (`Tab` / `Escape` on modals), ARIA labels, and subtle tactile hover feedback.

---

## **V. CONTRIBUTING & PULL REQUESTS**

1. Fork [`https://github.com/kyberlex/ONE`](https://github.com/kyberlex/ONE).
2. Create your feature branch (`git checkout -b feature/portal-refinement`).
3. Test your changes locally across desktop and mobile screen widths.
4. Commit your changes under the persona or attribution of your choice (`git commit -m "feat(webapp): implement debt jubilee calculator"`).
5. Open a Pull Request on GitHub. All contributions are reviewed by the community under AGPL-3.0.

---

*Open Networked Earth — When machines do the work, humanity inherits the Earth.*  
*Maintained under pseudonymous stewardship by Kyberlex (`kyberlex@proton.me`).*
