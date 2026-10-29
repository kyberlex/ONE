# **CO-STEWARD 4A & 4B ENGINEERING ONBOARDING GUIDE (`habitat/CONTRIBUTING_4A_4B.md`)**

> **Technical Standards, Open-BIM Toolchains & Verification Checklist for Pillar 4 Co-Stewards and Collaborators.**  
> **Author Persona:** Kyberlex (`kyberlex@proton.me`) | **Live Hub:** [GitHub Discussion #12](https://github.com/kyberlex/ONE/discussions/12)  
> **License:** AGPL-3.0-or-later

---

## **1. Overview: Two Tracks, One Integrated Dwelling**

The **Modular Habitat Unit (MHU)** is an open-source, Passivhaus-grade ($U = 0.118\text{ W/m}^2\text{K}$), demountable timber dwelling designed to guarantee the unconditional Tier 1 Housing Baseline (Constitution Art. 1.3 & Art. 2.3) across all **5 Orthogonal Planetary Seed Biomes** ([`roadmap/blueprints/SEED_NODE_CANDIDATE_REGISTRY.md`](../roadmap/blueprints/SEED_NODE_CANDIDATE_REGISTRY.md)).

Development in `habitat/` is divided into two complementary tracks:
* **Track 4A (Open-BIM, Timber Chassis & Hygrothermal Envelope):** Parametric FreeCAD macros (`.FCMacro`), IFC4 architectural models (`.ifc`), 3-axis CNC cutting sheets (`.dxf`), and Eurocode 5 structural calculations.
* **Track 4B (Zero-Cloud Automation, Sensor Topology & 380V/48V DC Microgrid):** Local Home Assistant packages (`habitat/automation/homeassistant/`), ESPHome microcontroller firmware (`habitat/automation/esphome/`), and analog fail-safe electrical schematics.

---

## **2. Track 4A Standards & Open-BIM Toolchain**

### **Required Software Stack (100% Free & Open Source):**
* **CAD & Parametric Solids:** `FreeCAD` (v0.21+ / v1.0+, `Part` and `BIM` workbenches)
* **Open-BIM Schema:** `BlenderBIM` / `Bonsai` outputting native **IFC4** (`IfcStructuralAnalysisModel`, `IfcElementAssembly`)
* **2D CNC Router Output:** `ezdxf` R2010 `.dxf` with standardized layer naming:
  - `CNC_PERIMETER_CUT` (Color 5 — Blue)
  - `CNC_M12_BOLT_DRILL` (Color 3 — Green)
  - `CNC_ETA_SCREW_DRILL` (Color 2 — Yellow)
  - `CNC_MORTISE_POCKET` (Color 6 — Magenta)
  - `CNC_DOGBONE_RELIEF` (Color 1 — Red, $\varnothing 6.4\text{ mm}$ for $6\text{ mm}$ flat endmill)

### **Open Engineering Tasks for Track 4A Co-Steward & Collaborators:**
- [x] **Module 4A.1 (Completed Baseline):** C24 $45 \times 195\text{ mm}$ + $2 \times 18\text{ mm}$ Birch Plywood Nodal Gusset with Eurocode 5 Johansen yield solver (`cad/generate_mhu_gusset.FCMacro` & `cad/mhu_nodal_gusset_18mm.dxf`).
- [x] **Module 4A.2 (Completed Baseline):** Reversible S355 Helical Pile Cap Flange & $800 \times 800\text{ mm}$ Utility Spine Docking Frame (`cad/generate_helical_pile_docking.FCMacro`).
- [x] **Module 4A.3 (Baseline Live — Open for Detailing):** Full 3-Bay ($54\text{ m}^2$, $6.0\text{ m} \times 9.0\text{ m}$) Portal Frame Assembly combining sole plates, wall studs, ridge gussets, and roof rafters (`cad/generate_mhu_portal_frame.FCMacro`), exported to native IFC4 (`cad/export_mhu_ifc4.py` & `cad/mhu_portal_frame_3bay.ifc`).
- [x] **Module 4A.4 (Baseline Live — Open for Detailing):** Accessible Zero-Step Threshold & $\varnothing 1500\text{ mm}$ Wet-Room Core CAD module complying with ISO 21542 / DIN 18040-2 (`cad/generate_wetroom_core_iso21542.FCMacro` & `.dxf`/`.stl`).
- [x] **Module 4A.5 (Baseline Live — Open for Multi-Layer WUFI):** Glaser hygrothermal condensation verification scripts across the 5 orthogonal climates (`hygrothermal/glaser_audit_5_biomes.py` & `glaser_audit_report.md`).

---

## **3. Track 4B Standards & Microgrid Automation Toolchain**

### **Required Hardware & Firmware Stack:**
* **Microcontroller Baseline:** `Olimex ESP32-POE-ISO` (wired Ethernet with galvanic isolation; zero cloud dependency)
* **Communication Buses:** $\text{I}^2\text{C}$ for local abiotic board sensors; **RS485 Modbus RTU** for BMS, MPPT solar charge controllers, and utility metering
* **Inviolable Privacy & Safety Rules:**
  1. **Abiotic Telemetry Only:** Strictly $\text{CO}_2$ (`SCD41`), VOC, temperature, relative humidity, cistern ultrasonic head, and DC bus voltage/current (`INA226`). **Zero cameras, zero microphones, zero occupancy tracking.**
  2. **Analog Mechanical Fail-Safes:** Every software-controlled relay or valve must be backed by a physical, non-programmable fail-safe (spring-return gravity bypass valves, Class-T DC fuses, bimetallic thermal cutouts).

### **Open Engineering Tasks for Track 4B Co-Steward & Collaborators:**
- [x] **Module 4B.1 (Completed Baseline):** 48V DC 3-Tier Priority Load-Shedding ($< 25\%$ SoC survival lock) & Passivhaus HRV $\text{CO}_2$ demand control (`automation/homeassistant/mhu_abiotic_core.yaml`).
- [x] **Module 4B.2 (Completed Baseline):** Utility Spine ESP32-POE-ISO firmware with local hardware load-shedding fallback (`automation/esphome/utility_spine_esp32.yaml`).
- [x] **Module 4B.3 (Completed Baseline):** Closed-loop potable cistern drought lock & greywater reed-bed sub-zero frost diversion (`automation/homeassistant/mhu_water_loop.yaml`).
- [x] **Module 4B.4 (Baseline Live — Open for KiCad Detailing):** Electrical Schematic (`.svg` / `.md`) for the $380\text{V DC}$ inter-node nanogrid + $48\text{V DC}$ domestic bus (`schematics/microgrid_380v_48v_single_line.svg` & `microgrid_electrical_spec.md`).
- [x] **Module 4B.5 (Baseline Live — Open for Hardware Benchmarking):** RS485 Modbus RTU register map for open-source 16S LFP Battery Management Systems (`automation/modbus/lfp_bms_modbus_registers.json` & `automation/esphome/bms_modbus_rtu_stub.yaml`).

---

## **4. Pull Request Verification Checklist**

Before submitting a PR to `habitat/`:
1. **Run Python / FreeCAD Macros:** Verify that any `.FCMacro` executes cleanly in standard Python 3 (`python3 habitat/cad/<script>.FCMacro`) to output its structural engineering audit and `.dxf` geometry without syntax errors.
2. **Validate YAML Syntax:** Ensure all Home Assistant and ESPHome `.yaml` files contain zero hard-coded secrets, cloud webhooks, or proprietary API keys.
3. **Update BOM if Needed:** If adding structural fasteners, sensors, or breakers, update the corresponding level in [`habitat/bom/mhu_bom_6_levels.csv`](bom/mhu_bom_6_levels.csv).

