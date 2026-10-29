# **O.N.E. NON-COMMERCIAL OPEN-SOURCE GRANTS KIT (`stewards/OPEN_SOURCE_GRANTS_KIT.md`)**
## **Ready-to-Submit R&D Grant Templates for Co-Stewards (NLnet NGI Zero, Prototype Fund & NumFOCUS / Julia Grants)**

**Document ID:** `stewards/OPEN_SOURCE_GRANTS_KIT.md`  
**Author Persona:** Kyberlex (`kyberlex@proton.me`) | **Repository:** [`https://github.com/kyberlex/ONE`](https://github.com/kyberlex/ONE)  
**Governing Constraint:** **1st Class-0 Invariant (Non-Commercial Purity)** — 100% Free/Libre Open-Source Software & Hardware (`AGPL-3.0-or-later` / `CC-BY-SA 4.0`). Zero venture equity, zero tokens, zero proprietary lock-in.

---

## **1. Purpose: Funding Co-Steward Engineering Without Commercial Corruption**

Open Networked Earth (O.N.E.) permanently prohibits venture capital, token sales, paywalls, and commercial monetization. However, high-fidelity scientific modeling (`Simone.jl`), open-BIM structural engineering (`habitat/cad/`), and zero-cloud firmware development (`habitat/automation/`) can and should be supported by **European and global public-interest open-source research grants**.

Once a Collaborator completes their initial **Proof-of-Work (PoW)** deliverable and steps up as a **Pillar Co-Steward** (recorded in [`stewards/ROSTER_AND_LEDGER.md`](ROSTER_AND_LEDGER.md)), they have full authorization and architectural support to submit the pre-drafted grant proposals below as Principal Applicant / Lead Engineer for their pillar.

> **100% Direct-to-Builder Rule:**  
> All grant disbursements go directly to the executing Co-Steward(s) / Collaborator(s) via milestone completion (e.g., NLnet Foundation pays individual open-source developers directly per merged AGPL-3.0 milestone), or into the audited escrow of *Verein / Stiftung Open Networked Earth* to fund physical hardware prototypes. Kyberlex takes €0 / CHF 0 from any Co-Steward grant.

---

## **2. Target Public-Interest Grant Programs**

| Grant Program | Funding Range | Eligible Pillars | License Requirement | Application Cadence |
| :--- | :--- | :--- | :--- | :--- |
| **NLnet Foundation — NGI Zero Commons Fund** (EU / Global Open Internet) | **€5,000 – €50,000** (Milestone-based direct payment to developers) | **Pillar 1, 2, 3, 4A, 4B** (Open-source simulation, P2P REA accounting, Open-BIM CAD, local-first ESPHome/OpenPLC) | Strictly FOSS (`AGPL-3.0-or-later`, `CERN-OHL-S`, `CC-BY-SA 4.0`) | Bi-monthly open calls (`nlnet.nl/commonsfund`) |
| **NumFOCUS / Julia Ecosystem Small Development Grants** | **\$3,000 – \$10,000** | **Pillar 1 & Pillar 3** (`Simone.jl` multiscale `Agents.jl` + `DifferentialEquations.jl` docking & benchmarks) | OSI-approved open source (`AGPL-3.0-or-later`) | Rolling / Tri-annual calls |
| **Prototype Fund (DE / CH Open-Source Public Interest Tech)** | **€47,500 / CHF 50,000** (6-month sprint) | **Pillar 2, 3 & 4B** (Cryptographic VRF sortition tooling, civic simulation, zero-cloud microgrid resilience) | Strictly Open Source | Bi-annual rounds (`prototypefund.de` / `prototypefund.opendata.ch`) |
| **Shuttleworth / Open-Source Hardware (OSHWA / Horizon Europe Cascade)** | **€10,000 – €50,000** | **Pillar 4A & 4B** (Physical CNC test-rig of the MHU Nodal Gusset & 48V DC Utility Spine bench prototype) | Open Hardware & `AGPL-3.0` | Periodic calls |

---

## **3. Copy-Paste Grant Template A: Pillar 1 & 3 (`Simone.jl` — NLnet NGI Zero / NumFOCUS)**

### **Project Title:**
`Simone.jl`: An Open-Source Multiscale Biophysical & Agent-Based Co-Simulation Engine for Post-Monetary Resource Commons

### **Abstract (Copy-Paste Ready — 150 Words):**
> Communities, cooperatives, and municipal commons lack rigorous, open-source computational tools to test whether decentralized resource allocation and sortition governance can remain physically viable under climate and supply-chain shocks. `Simone.jl` is a 100% free and open-source (`AGPL-3.0-or-later`) scientific co-simulation package written in pure Julia that couples continuous biophysical stock-flow differential equations (`DifferentialEquations.jl`) with heterogeneous discrete micro-agents (`Agents.jl`). Following the Axtell (1996) multi-model docking discipline, `Simone.jl` models physical Leontief input-output balances (`kWh` exergy, `L` water, `kcal` food, `kg` materials), Weibull MTBF equipment wear, non-monetary lexicographic rationing ($L_{\min}$), and odd-parity demarchic sortition assemblies. This grant funds the disaggregation of the physical Leontief matrix, stiff multi-rate ODE-ABM solver coupling, and open validation benchmarks across five orthogonal planetary climate archetypes.

### **Proposed Milestone Breakdown (Total: €25,000 – €35,000):**
* **Milestone 1 (€8,000) — Disaggregated 12×12 Physical Leontief & Weibull Recycling Module (`PoW 1A` & `1C`):**
  Deliver verified physical input-output tables calibrated to Ecoinvent/FAO/PHI standards, Hawkins-Simon viability proofs, and closed-loop Weibull spare-parts mass balance in `simone/src/layer1_leontief.jl`.
* **Milestone 2 (€10,000) — Multi-Rate Stiff ODE–ABM Coupling & Axtell Docking Suite (`PoW 3A` & `3B`):**
  Implement hierarchical time-stepping coupling `DifferentialEquations.jl` (`Rodas5P` / `Tsit5` with `ContinuousCallback` positivity guards) and `Agents.jl` v6+, plus automated heterogeneity tipping-point phase diagrams.
* **Milestone 3 (€9,000) — Cryptographic VRF Sortition & Factional Capture Stress-Test (`PoW 2A` & `2C`):**
  Implement the 5-stage odd-parity sortition state machine and hypergeometric adversarial resistance benchmarks in `simone/src/layer3_sortition.jl`.
* **Milestone 4 (€5,000) — ODD Protocol Paper, Documentation & CI Package Registration:**
  Complete the Grimm et al. (2020) ODD specification (`simone/ODD_PROTOCOL.md`), reproducible Pluto.jl notebooks, and Julia General Registry packaging.

---

## **4. Copy-Paste Grant Template B: Pillar 4A & 4B (`habitat/` — NLnet / Open Hardware)**

### **Project Title:**
`O.N.E. Habitat (MHU)`: Open-BIM Parametric Timber Chassis & Zero-Cloud 380V/48V DC Utility Spine for Resilient Passive Dwellings

### **Abstract (Copy-Paste Ready — 150 Words):**
> Open-source timber housing initiatives often suffer from excessive CNC sheet-material waste (>200 plywood sheets per unit), complex on-site MEP trade penetrations that compromise Passivhaus airtightness, and cloud-tethered smart-home telemetry that violates occupant privacy. The Open Networked Earth **Modular Habitat Unit (MHU)** solves these three bottlenecks under an irrevocable `AGPL-3.0-or-later` open-hardware license. By combining standard sawmill C24 structural studs with CNC-routed 18mm birch nodal gussets (`FreeCAD` / `BlenderBIM IFC4`), the MHU cuts CNC machining time by 90% while achieving $54.55\text{ kN}$ Eurocode 5 joint shear capacity and a $U = 0.118\text{ W/m}^2\text{K}$ Passivhaus envelope on reversible helical piles. All mechanical, water, and 380V/48V DC microgrid systems are consolidated into a plug-and-play $800 \times 800\text{ mm}$ Utility Spine governed by 100% local, zero-camera/zero-microphone `ESPHome` and `Home Assistant` firmware with hardwired analog fail-safes.

### **Proposed Milestone Breakdown (Total: €30,000 – €45,000):**
* **Milestone 1 (€12,000) — Full 3-Bay ($54\text{ m}^2$) FreeCAD / IFC4 Portal Assembly & CNC Nesting Pack (`PoW 4A-1`):**
  Extend `habitat/cad/` macros into a complete open `.ifc` (IFC4) structural model, accessible ISO 21542 zero-step wet-room core, and production-ready R2010 `.dxf` / `.stl` fabrication sheets.
* **Milestone 2 (€8,000) — 5-Biome Hygrothermal Glaser / WUFI & Eurocode 5 Structural Verification (`PoW 4A-2`):**
  Deliver open Python verification scripts proving condensation immunity and structural safety factors across all 5 Seed Node biomes (`-30°C` Polar Vortex to Tropical Monsoon).
* **Milestone 3 (€10,000) — KiCad 380V/48V DC Protection Schematics & RS485 Modbus LFP BMS Firmware (`PoW 4B-1`):**
  Deliver open KiCad electrical schematics and complete `ESPHome` Modbus RTU firmware (`habitat/automation/esphome/`) with hardware $< 2^\circ\text{C}$ LFP cold-charge lockout and 3-tier priority load-shedding.
* **Milestone 4 (€10,000) — Physical 1:1 Nodal Joint Destructive Load Test & Utility Spine Bench Rig:**
  Fabricate and load-test physical C24 + 18mm birch gusset joints and assemble a working 48V DC Olimex ESP32-POE-ISO Utility Spine test bench, publishing all raw telemetry and CAD files.

