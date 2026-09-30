# OPEN NETWORKED EARTH (O.N.E.)
## Modular Habitat Unit (MHU) — Architectural & Engineering Specification v1.0
### Canonical Blueprint for Scalable, Open-Source, Passive Modular Dwellings

---

## 1. Executive Summary & Design Invariants

The **Modular Habitat Unit (MHU)** is the standardized residential infrastructure for Open Networked Earth (O.N.E.) seed nodes. Designed to fulfill the unconditional **Tier 1 Biological Baseline** (Article 1.3, Article 2.3), the MHU rejects both low-comfort ascetic austerity and proprietary industrial housing monopolies.

```
+---------------------------------------+
|     REGIONAL BIOCLIMATIC ENVELOPE     |
| (Insulated cladding / Solar shading)  |
+---------------------------------------+
                   |
+---------------------------------------+
|     STRUCTURAL CNC TIMBER CHASSIS     |
|   (Interlocking dry-joint blocks)     |
|                                       |
|    +-------------------------------+  |
|    |       THE UTILITY SPINE       |  |
|    | - DC Microgrid Sub-Panel      |  |
|    | - Enthalpic HRV/ERV Core      |  |
|    | - Compact Sanitary Module     |  |
|    +-------------------------------+  |
+---------------------------------------+
                   |
+---------------------------------------+
|     STANDARDIZED GROUND DOCKING       |
|  (Single-point vertical interface)    |
+---------------------------------------+
```

### Core Design Invariants:
1. **Passivhaus Thermal Envelope:** Net-zero operational energy requirement; interior comfort maintained by passive orientation, insulation, and high-efficiency heat recovery.
2. **Fixed-Base Ground Docking:** Zero kinetic wear. Replaces moving interfaces with static, zero-leak vertical utility connections.
3. **Bit-for-Bit Open Fabrication:** 100% of structural and mechanical components can be cut, milled, or printed on open 3-axis CNC machines and fab-lab tooling.
4. **Universal Usufruct & Demountability:** Built on dry-stack, non-concrete foundations. Units can be disassembled, reconfigured, or relocated with zero site contamination.

---

## 2. Structural Architecture & Chassis

The MHU structure is built upon the **Open Building Principle** (separation of permanent base and modular infill) using structural digital timber manufacturing.

* **Structural Material:** 18 mm to 24 mm Structural Birch Plywood (EN 636-3) or Cross-Laminated Timber (CLT) panels.
* **Joinery:** CNC-milled interlocking comb-joints, friction pegs, and mechanical wedges. Zero wet mortars, zero polyurethane toxic adhesives.
* **Foundation:** Hot-dip galvanized ground screws (helical piles) or dry ballast pads. Zero continuous concrete slabs, preserving topsoil and natural hydrological infiltration.
* **Dimensional Grid:** 600 mm x 600 mm module sub-grid; 1200 mm structural bay width matching standard sheet stock.

---

## 3. The Standardized Ground Docking Interface

The ground interface consolidates all municipal connections into a single **$800 \times 800\text{ mm}$ dry inspection chamber** positioned beneath the Utility Spine.

```
+-----------------------------------------------------------+
|                   MHU FLOOR SUB-CHASSIS                   |
+-----------------------------------------------------------+
         ||               ||             ||              ||
    (Quick-Disc)      (Push-Fit)    (Dry-Disconnect)     ||
+-------------||-------------||--------------||-------------+
|   DC BUS    ||  POTABLE    ||  WASTEWATER  ||   OPTICAL   |
| 380V / 48V  ||  WATER IN   ||  OUT (DN110) ||  DATA MESH  |
+-----------------------------------------------------------+
                              |
+-----------------------------------------------------------+
|           STANDARDIZED GROUND RECEPTION CHAMBER           |
|                 (Sub-surface frost-free)                  |
+-----------------------------------------------------------+
```

### Interface Specifications:
* **Electrical (DC Microgrid):** 
  * Primary: 380V DC backbone distribution (reduced copper cross-section, zero AC inverter loss).
  * Secondary Domestic: 48V DC native bus for lighting, compute, and variable-speed fan motors.
  * Termination: High-current, IP67-rated Anderson Powerpole / Mennekes DC connectors.
* **Hydraulics (Potable & Gravity Feed):**
  * Inlet: 1" food-grade HDPE / Stainless steel quick-connect dry-disconnect coupling.
  * Supply dynamic pressure: $1.5 - 2.5\text{ bar}$ via community gravity break-tanks (Article 6.1.3).
* **Sanitation & Drainage:**
  * Outflow: DN110 push-fit polypropylene piping with EPDM lip seals.
  * Dual-circuit routing: Isolated greywater (showers, sinks) routed directly to sub-surface reed bed phytodepuration; blackwater/solids routed to aerobic thermophilic batch-composting chambers.
* **Telemetry & Communications:**
  * Armored multi-mode LC optical fiber pair + shielded Cat6A STP connecting directly to the node's local mesh backbone.

---

## 4. The Utility Spine (Internal Core)

All active mechanical and thermodynamic machinery is concentrated in a sound-isolated, centralized column ($1200 \times 2400\text{ mm}$ footprint):

1. **Controlled Mechanical Ventilation (HRV/ERV):**
   * Counter-flow cross-current enthalpic heat exchanger (>90% thermal recovery rate).
   * Constant-volume DC EC brushless centrifugal fans.
   * G4 coarse pre-filtration + F7/HEPA pollen and particulate filtration.
2. **Thermal Conditioning:**
   * Air-to-Water / Air-to-Air variable-speed DC inverter heat pump (R290 propane refrigerant, low Global Warming Potential).
   * Direct integration with floor-level hydronic radiant panels.
3. **Open Hardware Building Automation:**
   * Micro-PLC hardware running verified open-source firmware.
   * Physical sensor arrays restricted to abiotic parameters (CO2 ppm, RH%, VOC, Temperature).
   * Zero biometric capture, zero continuous voice/audio logging (Article 3.4.4, Article 8.2.2).

---

## 5. Bioclimatic Adaptations by Seed-Node Climate

The internal core and chassis remain invariant across all geographies; the **external envelope adjusts to the thermodynamic realities of the bioregion**:

| Zone / Climate | Envelope Insulation | Solar Shading Strategy | Fenestration & Glazing |
| :--- | :--- | :--- | :--- |
| **Temperate / Continental** *(Node-01, Node-05)* | 300 mm wood-fiber / dense-pack cellulose ($U < 0.12\text{ W/m}^2\text{K}$) | Fixed south-facing brise-soleil calculated for winter gain / summer shadow | Triple-pane low-E argon-filled ($U_g < 0.6\text{ W/m}^2\text{K}$); maximized south exposure |
| **Montane Subtropical** *(Node-02)* | 200 mm cellulose + internal rammed earth / stone thermal mass | Adjustable timber louvers; morning sun priority | Double/Triple-pane; tight air infiltration control |
| **Tropical Monsoonal** *(Node-03, Node-04)* | 100 mm ventilated cork/bamboo cavity; double ventilated roof | Expansive wrap-around verandas; continuous dynamic louver arrays | Operable louvers, insect mesh; maximize natural stack-effect buoyancy |

---

## 6. Open-Source Ecosystem & Existing Repositories

The MHU does not reinvent wheels; it integrates verified open-source hardware, building platforms, and software engines:

### Structural & Modular Chassis
* **WikiHouse Skylark System:** Complete open-source structural building system cut from standard plywood sheets on CNC routers.
  * *Repository & Specs:* [https://www.wikihouse.cc](https://www.wikihouse.cc)
  * *GitHub Source Files:* [https://github.com/wikihouseproject](https://github.com/wikihouseproject)
* **OpenStructures (OS):** Modular construction grid protocol ensuring interoperability across parts, components, and appliances.
  * *Design Protocol & Standards:* [https://openstructures.net](https://openstructures.net)

### Architecture, CAD & BIM Modeling Toolchains
* **OSArch / BlenderBIM:** Native Open-BIM (IFC4) authoring platform built entirely on open-source code.
  * *Community & Docs:* [https://osarch.org](https://osarch.org)
  * *Software:* [https://blenderbim.org](https://blenderbim.org)
* **FreeCAD (BIM & Arch Workbench):** Parametric 3D CAD modeler for drafting structural joinery and mechanical component machining paths.
  * *Repository:* [https://www.freecad.org](https://www.freecad.org)
* **Appropedia — Open Architecture Library:** Collaborative database for passive solar design, low-tech water purification, and thermal performance calculations.
  * *Knowledge Base:* [https://www.appropedia.org](https://www.appropedia.org)

### Automation & Microgrid Hardware
* **OpenPLC Project:** Open-hardware, deterministic programmable logic controller firmware complying with IEC 61131-3, compatible with Arduino, ESP32, and Raspberry Pi hardware.
  * *Platform:* [https://openplcproject.com](https://openplcproject.com)
* **ESPHome / Home Assistant Open Core:** Local-first, private automation engine with zero cloud dependency.
  * *Source:* [https://www.home-assistant.io](https://www.home-assistant.io) | [https://esphome.io](https://esphome.io)

---

## 7. Fabrication & Assembly Sequence

```
1. SITE LEVELING      2. CHASSIS MILLING     3. ASSEMBLY            4. DOCKING
   No concrete.          Standard CNC.          4-5 People.            Plug & Play.
+---------------+     +---------------+      +---------------+      +---------------+
| Helical piles | --> | 3-Axis router |  --> | Dry-lock pegs |  --> | Push-fit DC,  |
| screwed into  |     | cuts cassettes|      | mallet-driven |      | water, waste, |
| sub-soil.     |     | in Fab-Lab.   |      | in 10-14 days.|      | & mesh data.  |
+---------------+     +---------------+      +---------------+      +---------------+
```

1. **Step 1: Ground Point Setting (Day 1–2):** Ground screws installed to bedrock or firm subsoil using a handheld hydraulic drive head. Laser-leveled; zero grading or earth-stripping required.
2. **Step 2: Component Nesting & Routing (Off-site Fab-Lab):** Plywood and timber panels nested and cut on standard $2440 \times 1220\text{ mm}$ CNC flatbeds. Blocks pre-insulated with wood-fiber batts.
3. **Step 3: Chassis Dry Assembly (Day 3–10):** Floor cassettes positioned over helical pile brackets. Wall blocks erected sequentially using wooden wedges and mallets. Roof cassettes hoisted and locked.
4. **Step 4: Utility Spine Insertion & Docking (Day 11–14):** Pre-assembled utility column dropped into place above the reception chamber. Flexible DC cables, water lines, and wastewater collectors clicked into ground docking sockets.
5. **Step 5: Enclosure & Commissioning:** EPDM continuous airtight membrane wrapped; external rainscreen / ventilated facade attached; mechanical air exchange balanced. Unit ready for occupancy under usufruct stewardship.
