# **MHU AUTOMATION & TELEMETRY STACK (`habitat/automation/`)**

> **50-Year Zero-Silicon Survival Invariant + Replaceable Digital Reference Profiles.**  
> **Author:** Kyberlex (`kyberlex@proton.me`) | **Pillar:** 4B (Smart-Home, Fieldbus & Microgrid)  
> **License:** AGPL-3.0-or-later

---

## **1. Architectural Principle: Why Electronics Are Decoupled from the Building**

A timber Passivhaus structure lasts **80–100+ years**, whereas microcontrollers (`ESP32`), wireless chips (`Zigbee`/`Thread`), and software platforms (`Home Assistant`) become obsolete or fail within **7–15 years**.

Therefore, O.N.E. strictly separates **Long-Term Physical Invariants** from **Epoch-Specific Digital Reference Profiles**:

1. **Tier 0 — 50-Year Passive Analog Survival (Mandatory Invariant):**
   Every critical life-support and safety function works **with zero silicon and zero software**:
   - Bimetallic thermal switch (`< +2°C` lithium charge cutout on Contactor `K1`).
   - Mechanical wax-element Thermostatic Mixing Valve (`<= 48°C` anti-scald protection, EN 1111).
   - Spring-return frost diversion valve on greywater discharge.
   - Manual quarter-turn bypass levers on all valves and mechanical latches on load contactors.
2. **Tier 1 — Accessible DIN-Rail Mounting (`800x800mm` Utility Spine):**
   Zero electronics or wires are buried in walls. All controllers mount on a standard 35mm DIN rail (EN 60715) inside the dry $800 \times 800\text{ mm}$ Utility Spine chamber. In 2040, 2060, or 2080, a resident or Co-Steward can unclip the 2026 controller and snap in future open hardware in under 10 minutes.
3. **Tier 2 — 2026 Reference Implementation Profile (`v1.0 COTS`):**
   The YAML and JSON files in this directory provide a ready-to-flash **2026 baseline** using off-the-shelf open hardware (`Olimex ESP32-POE-ISO`, wired `RS485 Modbus RTU`, and local `Home Assistant` / `ESPHome`). Pillar 4B Co-Stewards may extend or replace this profile with `OpenPLC`, `CANbus`, `KNX-Open`, or future RISC-V controllers.

---

## **2. Directory Contents**

| File Path | Subsystem | Role |
| :--- | :--- | :--- |
| [`homeassistant/mhu_abiotic_core.yaml`](homeassistant/mhu_abiotic_core.yaml) | Exergy & Air | 3-tier battery load-shedding (`<25%` / `<50%` SoC) and $\text{CO}_2$-driven HRV ventilation. |
| [`homeassistant/mhu_water_loop.yaml`](homeassistant/mhu_water_loop.yaml) | Water Loop | Potable cistern drought rationing (`<20%`) and polar-vortex reed-bed frost bypass. |
| [`homeassistant/mhu_hvac_erv_passivhaus.yaml`](homeassistant/mhu_hvac_erv_passivhaus.yaml) | Passivhaus ERV | Enthalpic heat recovery summer night-purge bypass and heat-exchanger frost protection. |
| [`esphome/utility_spine_esp32.yaml`](esphome/utility_spine_esp32.yaml) | Edge MCU | Wired Ethernet DIN-rail node reading $\text{I}^2\text{C}$ environmental sensors and 48V shunt. |
| [`esphome/bms_modbus_rtu_stub.yaml`](esphome/bms_modbus_rtu_stub.yaml) | BMS Safety | RS485 Modbus RTU polling for 16S LiFePO4 pack with primary `<2°C` charge inhibit. |
| [`modbus/lfp_bms_modbus_registers.json`](modbus/lfp_bms_modbus_registers.json) | Register Map | Standardized Modbus holding/input register map for 16S LiFePO4 BMS units. |

---

## **3. Verification**

Run the automated privacy and zero-cloud purity audit before committing changes:
```bash
python3 habitat/test_habitat_specs.py
```

