# **MHU ABIOTIC SENSOR TOPOLOGY & UTILITY SPINE INTERFACE**

**Document ID:** `habitat/SENSOR_TOPOLOGY_HOME_ASSISTANT.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 4B (Smart-Home, ESPHome & OpenPLC Telemetry)  
**Constitutional Invariant:** Article 3.4.3 & Article 6.4 (Zero Biometric Surveillance / 100% Local Air-Gapped Capable)  
**License:** AGPL-3.0-or-later

---

## **1. The 50–100 Year Longevity Architecture (*Shearing Layers* & Zero-Silicon Survival)**

A timber habitat structure is engineered for **80 to 100+ years**, hydronic plumbing for **30 to 50 years**, whereas microcontrollers (`ESP32`), wireless transceivers (`Zigbee`/`Thread`), and software stacks (`Home Assistant`) have a technological obsolescence or MTBF cycle of **7 to 15 years**.

To prevent short-lived electronics from entombing or dating a century-scale building, the MHU enforces **Stewart Brand's *Shearing Layers* separation** and three non-negotiable rules:

| Shearing Layer | Service Lifespan | MHU Physical Implementation | Replacement & Evolution Rule |
| :--- | :--- | :--- | :--- |
| **1. Site & Foundations** | $100+\text{ years}$ | Reversible S355 galvanized helical screw piles | Zero concrete; removable with zero soil destruction. |
| **2. Structure** | $80-100\text{ years}$ | C24 timber portal frames + 18mm birch nodal gussets | Kept strictly dry and ventilated; zero embedded pipes/wires. |
| **3. Skin & Envelope** | $40-60\text{ years}$ | Wood-fiber insulation + ventilated rainscreen | Demountable exterior cladding without disturbing structural bays. |
| **4. Utility Spine & Conduits** | $30-50\text{ years}$ | Accessible $800 \times 800\text{ mm}$ dry inspection shaft + 50mm service cavity | Hinged front panel; all pipes and cable trays open-accessible. |
| **5. Passive Analog Safety** | $50+\text{ years}$ | Bimetallic thermal switches, thermostatic mixing valves, gravity drains, manual ball valves | **100% Zero-Silicon Survival:** The dwelling remains safe, warm, and habitable even if all microcontrollers are removed. |
| **6. Digital Telemetry Nodes** | $7-15\text{ years}$ | **2026 Reference Profile (v1.0):** `ESP32` / `RS485` / `Zigbee` / `Home Assistant` on DIN rail | **Plug-and-Swap:** Future Co-Stewards or residents in 2045 or 2075 can unclip the DIN-rail controller and drop in future open hardware in $<10\text{ minutes}$. |

---

## **2. The Biometric Privacy Invariant (Abiotic Telemetry Only)**

In strict compliance with the Living Constitution, the MHU automation stack is **physically incapable of surveillance**:
* **Zero Microphones / Zero Cameras:** No voice assistants, acoustic arrays, or optical sensors are permitted inside the habitat specification.
* **Zero Cloud Dependencies:** All sensor polling, PID climate loops, and load-shedding automations execute locally on the replaceable DIN-rail Utility Spine controller (in the **2026 Reference Profile v1.0**: `Olimex ESP32-POE-ISO` + local `Home Assistant` / `OpenPLC` instance) over wired fieldbus (`RS485 Modbus`) or local short-range radio.
* **Analog Mechanical Overrides:** Every motorized valve and relay includes a manual mechanical bypass handle accessible via the front panel of the Utility Spine.

---

## **2. The $800 \times 800\text{ mm}$ Ground Docking Chamber & Pinout**

All physical and digital feeds enter the MHU through a single dry-inspection ground chamber positioned directly beneath the Utility Spine:

```
┌────────────────────────────────────────────────────────────────────┐
│          MHU 800x800mm GROUND DOCKING CHAMBER (TOP VIEW)           │
│                                                                    │
│   [PORT A: HIGH/LOW DC EXERGY]      [PORT B: OPTICAL & TELEMETRY]  │
│    • 380V DC Inter-Node Bus          • Single-Mode Fiber (BiDi)    │
│    • 48V DC Domestic Backup          • RS485 Modbus RTU Differential│
│    • Galvanic Grounding Rod (Cu)     • Hardwired E-Stop Loop       │
│                                                                    │
│   [PORT C: POTABLE WATER IN]        [PORT D: DUAL GRAVITY DRAIN]   │
│    • DN32 PE100 Potable Feed         • DN110 Greywater -> Reed Bed │
│    • Brass Spring Check Valve        • DN110 Blackwater -> Digester│
└────────────────────────────────────────────────────────────────────┘
```

---

## **3. Standardized Sensor & Actuator Register (`ESPHome` / `Modbus`)**

| Entity ID (`Home Assistant`) | Physical Sensor / Actuator | Interface / Bus | Physical Range | Safety Fail-Safe Default |
| :--- | :--- | :--- | :--- | :--- |
| `sensor.mhu_indoor_co2_ppm` | Sensirion SCD41 Photoacoustic $\text{CO}_2$ | $\text{I}^2\text{C}$ (`0x62`) | $400 - 5000\text{ ppm}$ | Boosts HRV to $100\%$ above $1000\text{ ppm}$ |
| `sensor.mhu_indoor_temp_c` | Sensirion SHT45 Precision Temp/RH | $\text{I}^2\text{C}$ (`0x44`) | $-40^\circ\text{C}$ to $+125^\circ\text{C}$ | Triggers frost protection below $+5^\circ\text{C}$ |
| `sensor.mhu_indoor_voc_index` | Sensirion SGP41 VOC / $\text{NO}_x$ | $\text{I}^2\text{C}$ (`0x59`) | $1 - 500\text{ Index}$ | Purges indoor air above Index $150$ |
| `sensor.mhu_battery_soc_pct` | Victron SmartShunt / RS485 BMS | Modbus RTU (`9600 8N1`) | $0.0\% - 100.0\%$ | Sheds Tier 2 loads below $25.0\%$ SoC |
| `sensor.mhu_dc_bus_voltage_v` | INA226 High-Side 48V DC Shunt | $\text{I}^2\text{C}$ (`0x40`) | $40.0\text{ V} - 58.4\text{ V}$ | Hardware contactor cutout at $42.0\text{ V}$ |
| `sensor.mhu_cistern_level_pct` | JSN-SR04T Waterproof Ultrasonic | GPIO UART / Pulse | $0 - 4000\text{ Liters}$ | Switches to rainwater conservation mode $< 20\%$ |
| `fan.mhu_enthalpic_hrv` | Dual EC Brushless HRV Fans | $0-10\text{ V}$ PWM (`GPIO25`) | $0\% - 100\%$ Airflow | Defaults to $35\%$ Trickle Ventilation on MCU reset |
| `switch.mhu_tier2_hvac_relay` | 48V DC 40A Normally-Closed Contactor | GPIO Relay (`GPIO16`) | `ON` / `SHED` | Manual mechanical latch override on Spine door |
| `switch.mhu_greywater_diverter`| 24V Motorized 3-Way Brass Ball Valve | GPIO Relay (`GPIO17`) | `REED_BED` / `BYPASS` | Spring-return to `REED_BED` on power loss |

---

## **4. Reference Implementation Files**

* **Home Assistant Automation Package:** [`habitat/automation/homeassistant/mhu_abiotic_core.yaml`](automation/homeassistant/mhu_abiotic_core.yaml)
* **ESPHome Utility Spine Firmware:** [`habitat/automation/esphome/utility_spine_esp32.yaml`](automation/esphome/utility_spine_esp32.yaml)

