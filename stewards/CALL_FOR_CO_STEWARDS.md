# **CO-STEWARDS & CRITICS (`stewards/CALL_FOR_CO_STEWARDS.md`)**

**Author:** Kyberlex (`kyberlex@proton.me`)  
**Phase:** Phase 0 — Genesis Architectural Hardening (before Foundation ONE)  
**Canonical Repository:** [https://github.com/kyberlex/ONE](https://github.com/kyberlex/ONE)  
**Portal:** [https://one-commons.github.io](https://one-commons.github.io)

---

## **I. THE OPERATIONAL MODEL (1 CO-STEWARD + COLLABORATORS + ≥1 SENIOR CRITIC)**

```
                 ┌──────────────────────────────┐
                 │          KYBERLEX            │
                 │  vision, architecture, rules │
                 └──────────────┬───────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
┌───────▼───────────────────────┐       ┌───────────────▼───────────────────┐
│ PILLAR 0: COMMUNITY / DEVREL  │       │ 4 TECHNICAL PILLARS (BUILDERS)    │
│ r/OpenNetworkedEarth, DevRel  │       │ 1. Economy (Leontief / Energy)    │
│ Triage, Technical Headhunting │       │ 2. Governance (Sortition / ZGB)   │
│ • 1 Lead Co-Steward           │       │ 3. Simulation (SIMONE Julia)      │
│ • Open Collaborators          │       │ 4. Habitat (4A CAD + 4B YAML)     │
│ [PHASE 0 PRIORITY 0 SEARCH]   │       │ • 1 Lead Co-Steward per role      │
└───────┬───────────────────────┘       │ • Open Collaborators (always on)  │
        │                               └───────────────┬───────────────────┘
        │ drives campaign & recruitment                 │
        └───────────────────────┬───────────────────────┘
                                │ invite, debate & stress-test
                 ┌──────────────▼───────────────┐
                 │  EXTERNAL CRITICS (≥1 / PIL) │
                 │   Senior domain specialists  │
                 │    They try to BREAK O.N.E.  │
                 └──────────────────────────────┘
```

### **The 3-Tier Pillar Structure & Anti-Stall Rules:**

1. **1 Active Co-Steward + Open Collaborators + $\ge 1$ Senior Critic per Pillar:**
   - **Co-Steward (1 per Pillar, plus 4A/4B in Habitat):** A single, high-ownership builder is sufficient to lead each pillar. We do not artificially wait for 15 co-stewards before launching Foundation ONE.
   - **Collaborators (Always Open):** Every pillar remains **permanently open to Collaborators** who contribute to specific modules, PRs, CAD files, YAML configurations, or data calibration. Collaborators ensure continuous velocity and provide an immediate succession bench if a Lead Co-Steward slows down.
   - **External Critics ($\ge 1$ Top-Tier Specialist per Domain):** Each technical pillar (1–4) must be stress-tested by at least one top-tier independent domain critic whose mandate is strictly adversarial (*"Read/run this, tell us where it breaks"*).
2. **The Anti-Stall Rule ("Earned by Delivery, Never Closed on Promises"):**
   - **Entry as Collaborator:** Nobody is appointed Lead Co-Steward upon initial contact or verbal interest alone. Every newcomer starts as a **Collaborator** on a bounded, concrete deliverable.
   - **Promotion by Delivery:** A collaborator becomes the pillar's **Co-Steward** only after demonstrating consistent, real delivery in the repository.
   - **Automatic Re-Opening on Inactivity:** Even when a Co-Steward is seated, collaborator doors stay open. If a Co-Steward goes inactive (>14 days without commits or check-ins), they transition to *Phase 1 Contributor / Collaborator* status and the Lead Co-Steward search remains 100% open.
3. **Strategic Inversion (Phase 0 Priority 0):**
   - To eliminate the "Solo Creator Trap", Kyberlex first onboards the **Pillar 0 Co-Steward (Open-Source Community Manager, DevRel & Technical Headhunter)** and collaborators. Pillar 0 takes operational ownership of `r/OpenNetworkedEarth`, post pipeline publishing, comment triage, and active headhunting to seat the builders and critics across Pillars 1–4.
4. **Outcome-Driven Genesis Lock (Phase 1 Transition to Foundation ONE):**
   - **Foundation ONE is formally incorporated in Switzerland (ZGB Art. 80 ff.)** and the Living Constitution is locked as Statutory Annex I once:
     1. `Simone.jl` (`simone/`) is completed at full fidelity across all 4 layers (`simone-specs.md`);
     2. `habitat/` is populated with verified 4A Open-BIM CAD models (`.FCStd`/`.ifc`/`.dxf`) and 4B Smart-Home/Microgrid packages (`.yaml`/DC schematics);
     3. Each domain pillar (1–4) has passed its second adversarial stress-test with **at least 1 senior External Critic**, and all resulting patches are merged into the Constitution.

*(Note: The web simulation tool is simply called **Sandbox**. The standalone game and fiction tracks are frozen so zero time is wasted on entertainment features).*

---

## **II. THE CO-STEWARD PILLARS (PHASE 0 ROSTER)**

| # | Pillar | Focus / Mandate | Structure & Status | Target Profile |
| :--- | :--- | :--- | :--- | :--- |
| **0** | **Community, DevRel & Headhunting** | **Co-moderating `r/OpenNetworkedEarth`, post pipeline publishing, comment triage, and leading technical recruitment campaigns.** | 🔍 **PRIORITY 0 (Seeking 1 Co-Steward + Collaborators)** | Open-source community manager, FOSS DevRel, technical recruiter, Solarpunk/Commons organizer. |
| **1** | **Biophysical Economics** | **Calibrate Leontief matrices, $L_{\min}$ operator, and abiotic shocks inside `Simone.jl`, leading economic critic reviews.** | 🔍 **Open (Seeking 1 Co-Steward + Collaborators + ≥1 Critic)** | Ecological / heterodox economist, Leontief input-output specialist. |
| **2** | **Governance & Law** | **Validate sortition state machines (Layer 3 of `Simone.jl`), lead constitutional stress-tests, and draft Foundation statutes.** | 🔍 **Open (Seeking 1 Co-Steward + Collaborators + ≥1 Critic)** | Jurist (commons / Swiss civil law), deliberative democracy / sortition scholar. |
| **3** | **Scientific Simulation (`Simone.jl`)** | **Lead the 4-layer co-simulation engine in Julia (`Agents.jl` + ODEs) to stress-test the Constitution before Genesis Lock.** | 🔍 **PRIORITY LEAD SEARCH (Seeking 1 Co-Steward + Collaborators [1 Contributor] + ≥1 Critic)** | Complex systems modeler, Julia scientific developer (`DiffEq`/`Agents.jl`). |
| **4** | **Physical Habitat & Microgrid** | **Produce & maintain real engineering files: 4A (FreeCAD/IFC CAD models & CNC sheets) + 4B (Home Assistant/ESPHome YAML & DC schematics).** | 🔍 **Open (Seeking 4A & 4B Co-Stewards + Collaborators + ≥1 Critic)** | **4A:** Open-BIM & Timber Architect (`FreeCAD`/`BlenderBIM`)<br>**4B:** Smart-Home & Microgrid Specialist (`Home Assistant`/`ESPHome`) |

---

### **Pillar 0 Deep-Dive: Open-Source Community Manager, DevRel & Technical Headhunter**

* **Strategic Rationale:** Kyberlex cannot simultaneously maintain the Julia simulation engine, legal constitution, and biophysical models while spending full-time hours managing `r/OpenNetworkedEarth`, publishing post pipelines, answering comments, and hunting for developers. The Pillar 0 Co-Steward team is Kyberlex's primary operational partner to **take over daily community operations and scout the technical builders**.
* **Core Mandate:**
  1. **Community Leadership:** Co-moderate `r/OpenNetworkedEarth`, publish the prepared 10-post pipeline, manage organic crossposts, and handle first-level comment triage.
  2. **Technical Headhunting & DevRel:** Conduct proactive scouting and recruitment across domain hubs (`Julia Discourse`, `OSArch`, `r/FreeCAD`, `Home Assistant`, `INET YSI`) to seat Co-Stewards 1–4 and invite domain Critics.
  3. **Contributor Onboarding:** Welcome inbound open-source contributors and route domain discussions into GitHub Discussions and working groups.
  4. **Deploying the Arsenal:** Leverage the completed catalog (10 prepared deep-dive posts, 6 novels, 6 audiobooks on Internet Archive, 8-minute explainer, cinematic trailers, web diorama, and 15-language portal).
* **Inviolable Constraints:**
  1. *Non-Commercial Purity (Class-0):* Zero advertising monetization, zero token launches, zero paywalls. Everything is AGPL-3.0 / CC-BY-SA.
  2. *OpSec & Pseudonymity:* Kyberlex remains strictly anonymous (`kyberlex@proton.me`). The Community Co-Steward can be public-facing or pseudonymous, but never breaches Kyberlex's private workstation identity.

---

### **Pillar 4 Deep-Dive: Physical Habitat, Open-BIM & Microgrid Infrastructure**

* **Strategic Rationale (The Reality Gap in `habitat/`):**
  - Today in `habitat/` we have codified architectural specifications (`MHU_MODULAR_HABITAT_UNIT.md`, `PASSIVHAUS_ENERGY_SYSTEMS.md`, `SENSOR_TOPOLOGY_HOME_ASSISTANT.md`) but **zero native parametric CAD models (`.FCStd`, `.ifc`, `.dxf`, `.stl`) and zero deployment `.yaml` configuration files**.
  - Kyberlex provides the architectural framework, biophysical equations, and legal covenants, but will **not** draw the timber joinery in FreeCAD nor write the Home Assistant YAML automation packages.
  - To turn O.N.E. into buildable reality, we are seeking **2 hands-on builder profiles** to populate and maintain `habitat/`:

* **Co-Steward 4A — Open-BIM & Timber Architect (`FreeCAD` / `BlenderBIM IFC4` / `Eurocode 5`):**
  - **Mandate & Deliverables in `habitat/`:**
    1. Translate `habitat/MHU_MODULAR_HABITAT_UNIT.md` into parametric 3D CAD files (`.FCStd` in FreeCAD and `.ifc` via BlenderBIM IFC4).
    2. Generate CNC cutting sheets (`.dxf`) for the demountable mass-timber chassis (WikiHouse Skylark compatible, hybrid C24/plywood, reversible ground screws).
    3. Produce structural and thermal calculation sheets complying with Eurocode 5 (timber design) and Passivhaus standards ($U < 0.12\text{ W/m}^2\text{K}$).
  - **Target Profile:** Open-source architect, structural timber designer, digital fabrication / CNC specialist, OSArch contributor.

* **Co-Steward 4B — Smart-Home & Microgrid Specialist (`Home Assistant` / `ESPHome` / `OpenPLC` / `48V DC`):**
  - **Mandate & Deliverables in `habitat/`:**
    1. Author and maintain modular Home Assistant and ESPHome packages (`.yaml`) implementing the telemetry topology in `habitat/SENSOR_TOPOLOGY_HOME_ASSISTANT.md` (air quality, thermal comfort, cistern tank levels, greywater biofiltration).
    2. Draft complete single-line electrical schematics for the dual-bus DC microgrid (380V inter-node distribution + 48V domestic bus, eliminating AC inverter idle losses).
    3. Compile the open Bill of Materials (BOM) for the standardized 800×800 mm dry inspection docking chamber and *Utility Spine*.
  - **Target Profile:** Home Assistant package maintainer, ESP32/ESPHome hardware developer, off-grid microgrid engineer, OpenPLC automation technician.

---

## **III. WHO THE CO-STEWARDS ARE & LIFECYCLE STATES**

* Domain practitioners and focused builders rather than senior career academics.
* They believe in the goals of O.N.E. and want to carry it forward.
* They can engage with external critics at a high technical level.
* They work collaboratively to improve the specifications based on what the critics find.
* Status is earned: someone becomes co-steward after showing real, continued work.

### **Co-Steward & Collaborator Lifecycle States:**
* **Active Co-Steward (Lead Builder):** Regularly active in technical discussions, reviewing PRs, and delivering code or engineering specifications. Holds operational co-leadership of the pillar.
* **Open Collaborator / Phase 1 Contributor:** Contributes to bounded tasks, modules, or proposals (e.g. *Rodrigues* single-village docking proposal on SIMONE), or is completing their initial proof-of-work task. Collaborators are credited in the repository registry, and **the Lead Co-Steward position remains 100% open** until a contributor demonstrates sustained lead delivery.
* **Emeritus / Retired:** Formally stepped down after completing or handing over active modules.

### **High-Density Ecosystems of Focus:**
1. **Pillar 0 (Community, DevRel & Headhunting):** Work on Climate (`#volunteer-board`, `#projects-and-collaborations`), ClimateAction.tech (`#jobs-and-volunteering`), RadicalxChange Discord, Metagov, `r/communitymanagement`, FOSDEM/FOSS community boards, Open Source Design.
2. **Pillar 1 (Biophysical & Heterodox Economics):** INET YSI (*Young Scholars Initiative* - Sustainability & Ecological Economics WG), ISEE / ESEE Boards, Nate Hagens (*The Great Simplification*), W. Paul Cockshott (*Towards a New Socialism* cybernetic planning).
3. **Pillar 2 (Governance & Commons Jurisprudence):** Metagov Seminars, Sortition Foundation (Hélène Landemore, Claudia Chwalisz / DemocracyNext), Dark Matter Labs (Indy Johar - territorial usufruct), Swiss Civil Law faculties (UZH / HSG).
4. **Pillar 3 (Scientific Simulation & SIMONE):** JuliaLang Discourse (`Modelling`), Julia Slack/Zulip (`#agents`, `#sciml`), Sirens.jl network. *(Current status: Seeking 1 Lead Co-Steward + Open Collaborators [1 Phase 1 Contributor] + ≥1 Senior Critic)*.
5. **Pillar 4 (Habitat & Microgrid Engineering):** WikiHouse Community / OSArch (Discussion #3674), Open Source Ecology (Marcin Jakubowski), Low-Tech Magazine (Kris De Decker), Home Assistant Architecture Forum, Hackaday.

---

## **IV. WHO THE CRITICS ARE**

* More specialized than the co-stewards: senior researchers, professionals, maintainers of reference tools.
* They do not need to believe in O.N.E. A short, bounded commitment is enough: *"Read this, tell us where it breaks"*.
* Each co-steward finds and invites at least **1 top-tier critic** in their own field.
* Example profiles identified: George Datseris (Agents.jl, simulation), Konstantin Stadler (pymrio, input-output economics), Stefan Feilmeier (OpenEMS, microgrids), Isaac Arthur (SFIA / National Space Society, peer review on thermodynamic failure modes & orbital scale).

---

## **V. LIVE DISCUSSIONS & ADVERSARIAL RFC KITS**

* **Live GitHub Discussions (Announcements & Working Hubs):**
  * 0. **Community & DevRel:** [Discussion #13 — [Call for Co-Steward] 0. Open-Source Community Manager, DevRel & Technical Headhunter](https://github.com/kyberlex/ONE/discussions/13) *(Active Search — Priority 0: 1 Co-Steward + Collaborators)*
  * 1. **Economy:** [Discussion #9 — [Call for Co-Steward] 1. Biophysical & Leontief Economics](https://github.com/kyberlex/ONE/discussions/9) *(Seeking 1 Co-Steward + Collaborators + ≥1 Senior Critic)*
  * 2. **Governance & Law:** [Discussion #10 — [Call for Co-Steward] 2. Governance, Sortition & Swiss Foundation Law](https://github.com/kyberlex/ONE/discussions/10) *(Seeking 1 Co-Steward + Collaborators + ≥1 Senior Critic)*
  * 3. **Simulation & Scientific Co-Engine:** [Discussion #11 — [Call for Co-Steward] 3. Simulation & Scientific Co-Engine (Simone.jl)](https://github.com/kyberlex/ONE/discussions/11) *(Active Lead Search: 1 Lead Co-Steward + Open Collaborators + ≥1 Senior Critic)*
  * 4. **Energy & Habitat:** [Discussion #12 — [Call for Co-Steward] 4. Decentralized Microgrids & Modular Habitat (MHU)](https://github.com/kyberlex/ONE/discussions/12) *(Seeking 4A Open-BIM Architect & 4B Smart-Home YAML Specialist + Collaborators + ≥1 Senior Critic)*

