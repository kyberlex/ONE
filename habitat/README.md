# **O.N.E. HABITAT & BIOREGIONAL INFRASTRUCTURE (`habitat/`)**

> **Canonical Engineering, Open-BIM CAD & Automation Packages for Passive Modular Dwellings and Regenerative Urbanism.**  
> **Author Persona:** Kyberlex (`kyberlex@proton.me`) | **Repository:** [`https://github.com/kyberlex/ONE`](https://github.com/kyberlex/ONE)  
> **Pillar Alignment:** **Pillar 4A** (Open-BIM & Timber Architect) & **Pillar 4B** (Smart-Home & Microgrid Specialist)  
> **License:** GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later) & Open Knowledge Commons.

---

## 1. Vision & The Physical Commons

The **Habitat** directory establishes the real-world physical and architectural substrate of Open Networked Earth (O.N.E.). In accordance with **The Dual-Track Handshake** (Article 9.1), the living simulations of O-ASIS and SIMONE directly correspond to verifiable, bit-for-bit open-source engineering blueprints.

Human settlement within O.N.E. operates across two interconnected fractal scales:

1. **Micro-Scale (The Resilient Dwelling):** The **Modular Habitat Unit (MHU)** fulfills the unconditional Tier 1 Biological Baseline (Article 1.3, Article 2.3) through open-source CNC timber nodal gussets paired with standard C24 lumber, Passivhaus thermal envelopes ($U = 0.118\text{ W/m}^2\text{K}$), centralized utility spines, and standardized ground docking interfaces.
2. **Macro-Scale (The Regenerative Metropolis):** The **Urban Scaling & Transition Blueprint** provides the structural, infrastructural, and demarchic methodology for retrofitting existing legacy cities into federated bioregional commons without destructive tabula rasa demolitions.

---

## 2. Repository Layout & Engineering Deliverables

```
habitat/
├── README.md                                 # Directory index & contributor guide
├── CONTRIBUTING_4A_4B.md                     # Onboarding, Open-BIM standards & PoW tasks for Co-Stewards 4A & 4B
├── MHU_MODULAR_HABITAT_UNIT.md               # Core MHU structural & Eurocode 5 specification
├── PASSIVHAUS_ENERGY_SYSTEMS.md              # Hygrothermal U-value audit & 380V/48V DC microgrid spec
├── SENSOR_TOPOLOGY_HOME_ASSISTANT.md         # Zero-cloud abiotic telemetry & 800x800mm Utility Spine pinout
├── URBAN_SCALING_TRANSITION.md               # Metropolitan transition (Superblocks, Energiesprong, Open Building)
├── cad/                                      # [Track 4A] Parametric FreeCAD macros, 3D STL meshes & 2D CNC DXF files
│   ├── export_mhu_ifc4.py                    # ISO 16739-1 (IFC4) Open-BIM STEP exporter for 3-bay timber frame
│   ├── mhu_portal_frame_3bay.ifc             # Native IFC4 model (FreeCAD / BlenderBIM / Bonsai ready)
│   ├── generate_mhu_gusset.FCMacro           # Parametric C24 + 18mm birch nodal gusset generator & EC5 solver
│   ├── generate_helical_pile_docking.FCMacro # S355 Helical Pile Flange & 800x800mm Utility Spine Docking CAD
│   ├── generate_mhu_portal_frame.FCMacro     # 3-Bay (54 m²) full portal frame macro & EC5 bending solver
│   ├── generate_wetroom_core_iso21542.FCMacro# Accessible bathroom & Utility Spine docking macro (ISO 21542 / DIN 18040-2)
│   ├── mhu_nodal_gusset_18mm.dxf             # R2010 2D CNC router toolpath sheet (with Ø 6.4mm dog-bone reliefs)
│   ├── mhu_nodal_gusset_18mm.stl             # 3D STL assembly of C24 timber + 18mm birch nodal gusset (browser 3D viewer)
│   ├── helical_pile_docking_flange_s355.dxf  # R2010 2D cutting/drilling template for S355 flange & 800x800mm Utility Spine
│   ├── helical_pile_docking_flange_s355.stl  # 3D STL model of S355 helical pile flange, U-saddle & termite shield
│   ├── mhu_portal_frame_3bay.dxf             # Structural elevation & layout DXF for 3-bay portal frame
│   ├── mhu_portal_frame_3bay.stl             # 3D STL model of the complete 3-bay portal frame assembly
│   ├── mhu_wetroom_core_iso21542.dxf         # 2D DXF plan view of accessible wet-room & utility spine docking
│   └── mhu_wetroom_core_iso21542.stl         # 3D STL solid of accessible wet-room floor cassette & vertical riser
├── automation/                               # [Track 4B] Local Home Assistant & ESPHome firmware configs
│   ├── homeassistant/
│   │   ├── mhu_abiotic_core.yaml             # 48V DC load-shedding (<25% SoC) & Passivhaus HRV CO2 automation
│   │   └── mhu_water_loop.yaml               # Potable cistern drought lock & greywater reed-bed frost diversion
│   ├── esphome/
│   │   ├── utility_spine_esp32.yaml          # Olimex ESP32-POE-ISO firmware (SCD41 CO2, INA226 48V shunt, ultrasonic)
│   │   └── bms_modbus_rtu_stub.yaml          # RS485 Modbus RTU 16S LFP BMS & <2°C cold-charge lockout starter stub
│   └── modbus/
│       └── lfp_bms_modbus_registers.json     # 16S LFP BMS RS485 register map (Seplos / JK / LibreSolar)
├── hygrothermal/                             # Passivhaus Glaser / WUFI condensation audit
│   ├── glaser_audit_5_biomes.py              # Automated Glaser method audit script across 5 seed biomes
│   └── glaser_audit_report.md                # Quantitative condensation verification report (ISO 13788)
├── schematics/                               # Electrical microgrid schematics
│   ├── microgrid_380v_48v_single_line.svg    # Single-line schematic for 380V inter-node DC + 48V domestic bus
│   └── microgrid_electrical_spec.md          # Earthing, arc-fault, and galvanically isolated DC specifications
├── bom/                                      # Machine-readable Bill of Materials & Leontief cost tables
│   └── mhu_bom_6_levels.csv                  # Complete 6-level BOM (MHU Open Chassis vs. WikiHouse Skylark)
├── renders/                                  # Architectural & CAD visual references
│   ├── mhu_nodal_gusset_freecad_render.png   # 4-Viewport FreeCAD technical sheet & Eurocode 5 audit
│   ├── mhu_exterior_concept.jpg              # MHU Passivhaus exterior visualization
│   └── mhu_interior_axonometric.jpg          # MHU interior axonometric layout
└── test_habitat_specs.py                     # Zero-dependency automated CAD, BOM & Privacy verification suite
```

---

## 3. Specification & File Index

| Path | Track | Primary Standards & Toolchains | Description |
| :--- | :--- | :--- | :--- |
| [`MHU_MODULAR_HABITAT_UNIT.md`](MHU_MODULAR_HABITAT_UNIT.md) | 4A + 4B | FreeCAD, BlenderBIM IFC4, Eurocode 5 (EN 1995-1-1), OpenStructures | Hybrid digital timber chassis combining standard C24 studs with 18mm CNC birch nodal gussets (54% structural savings, <4% scrap) and decoupled 50mm service cavity. |
| [`PASSIVHAUS_ENERGY_SYSTEMS.md`](PASSIVHAUS_ENERGY_SYSTEMS.md) | 4A + 4B | Passivhaus Institut (PHI), IEC 60364-7-712 | Layer-by-layer hygrothermal resistance table ($U = 0.118\text{ W/m}^2\text{K}$) and 380V/48V DC cellular microgrid single-line schematic with 30-day islanded autonomy. |
| [`SENSOR_TOPOLOGY_HOME_ASSISTANT.md`](SENSOR_TOPOLOGY_HOME_ASSISTANT.md) | 4B | Home Assistant, ESPHome, OpenPLC, RS485 Modbus | Abiotic-only sensor register (zero cameras/microphones), $800 \times 800\text{ mm}$ ground docking chamber pinout, and hardware fail-safe defaults. |
| [`URBAN_SCALING_TRANSITION.md`](URBAN_SCALING_TRANSITION.md) | Urban | Superilles, Energiesprong, Habraken Open Building | Five-pillar methodology for retrofitting $10^4 - 10^6+$ pop cities into federated bioregional commons. |
| [`cad/generate_mhu_gusset.FCMacro`](cad/generate_mhu_gusset.FCMacro) | 4A | FreeCAD 0.21+ (`Part`), Python 3, `ezdxf` | Parametric generator for the double-shear M12 bolted nodal joint, outputting 3D solids, `.dxf` CNC sheets, and Johansen shear capacity ($F_{v,Rk} = 54.55\text{ kN}$). |
| [`cad/generate_helical_pile_docking.FCMacro`](cad/generate_helical_pile_docking.FCMacro) | 4A | FreeCAD 0.21+ (`Part`), Eurocode 3, ISO 1461 | Parametric S355 helical pile cap flange, termite barrier collar, and $800 \times 800\text{ mm}$ Utility Spine ground docking frame with geotechnical bearing audit. |
| [`automation/homeassistant/mhu_abiotic_core.yaml`](automation/homeassistant/mhu_abiotic_core.yaml) | 4B | Home Assistant Core | Local automation package governing 3-tier 48V DC battery load-shedding and demand-controlled enthalpic HRV ventilation. |
| [`automation/homeassistant/mhu_water_loop.yaml`](automation/homeassistant/mhu_water_loop.yaml) | 4B | Home Assistant Core | Closed-loop potable cistern drought rationing ($<20\%$) and subsurface greywater reed-bed pulse dosing with $-30^\circ\text{C}$ polar vortex frost diversion. |
| [`automation/esphome/utility_spine_esp32.yaml`](automation/esphome/utility_spine_esp32.yaml) | 4B | ESPHome (`esp-idf`), Olimex ESP32-POE-ISO | Wired Ethernet microcontroller configuration reading $\text{I}^2\text{C}$ SCD41 $\text{CO}_2$, INA226 48V shunt, and ultrasonic cistern level with local hardware cutout. |
| [`CONTRIBUTING_4A_4B.md`](CONTRIBUTING_4A_4B.md) | 4A + 4B | FreeCAD, BlenderBIM IFC4, ESPHome, KiCad | Technical onboarding guide, CNC layer standards, and modular Proof-of-Work tasks for Track 4A and Track 4B Co-Stewards. |
| [`bom/mhu_bom_6_levels.csv`](bom/mhu_bom_6_levels.csv) | 4A + 4B | CSV / Open-BIM Cost Schedule | Machine-readable 6-level Bill of Materials (€72,690 Tier A self-build total for $54\text{ m}^2$ module). |

---

## 4. Inviolable Design Invariants

All habitat designs and blueprints within this repository adhere strictly to the **7 Inviolable Class-0 Constraints**:

* **Non-Commercial Purity (Class-0):** Zero proprietary software, zero paywalls, zero closed BIM schemas.
* **Universal Usufruct:** Abolition of absentee real estate speculation. Built on non-permanent, reversible dry foundations (helical piles/ballast) or reclaimed into municipal Commons Trusts.
* **Thermodynamic Conservation:** Passivhaus energy conservation, closed-loop local material flows, short-loop metallurgical recycling.
* **Biometric Privacy:** Abiotic telemetry only ($\text{CO}_2$, VOC, humidity, temperature). Zero continuous audio capture or biometric tracking.
* **Universal Accessibility & Barrier-Free Design:** 100% of dwelling chassis are wheelchair-accessible by default (ISO 21542 / DIN 18040-2). Zero-step continuous finished floor plane, modular reversible ramps, $\ge 900\text{ mm}$ clear doorways, $\varnothing 1500\text{ mm}$ turning circles, roll-in showers, and reinforced cavedio backing for modular grab bars.
