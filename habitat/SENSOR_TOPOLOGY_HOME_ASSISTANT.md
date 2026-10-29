# **MHU ABIOTIC SENSOR TOPOLOGY & UTILITY SPINE INTERFACE**

**Document ID:** `habitat/SENSOR_TOPOLOGY_HOME_ASSISTANT.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 4B (Smart-Home, ESPHome & OpenPLC Telemetry)  
**Constitutional Invariant:** Article 3.4.3 & Article 6.4 (Zero Biometric Surveillance / 100% Local Air-Gapped Capable)  
**License:** AGPL-3.0-or-later

---

## **1. The Biometric Privacy Invariant (Abiotic Telemetry Only)**

In strict compliance with the Living Constitution, the MHU automation stack is **physically incapable of surveillance**:
* **Zero Microphones / Zero Cameras:** No voice assistants, acoustic arrays, or optical sensors are permitted inside the habitat specification.
* **Zero Cloud Dependencies:** All sensor polling, PID climate loops, and load-shedding automations execute locally on the Utility Spine controller (`Olimex ESP32-POE-ISO` + local `Home Assistant` / `OpenPLC` instance) over wired RS485 Modbus and local Zigbee/Thread.
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

