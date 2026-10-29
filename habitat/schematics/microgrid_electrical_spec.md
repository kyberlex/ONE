# **MHU DUAL-BUS DC MICROGRID ELECTRICAL SPECIFICATION & SINGLE-LINE ARCHITECTURE**

**Document Path:** `habitat/schematics/microgrid_electrical_spec.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 4B (Smart-Home, Microgrid & Utility Spine Specialist)  
**Governing Standards:** IEC 60364-7-712 (Solar PV Power Supply Systems), IEC 62619 (Safety for Secondary Lithium Cells), NFPA 70 Article 706 (Energy Storage Systems)  
**License:** AGPL-3.0-or-later (Class-0 Non-Commercial Open Hardware)  

---

## **1. Topology Overview: Zero-Inverter DC Nanogrid**

The MHU rejects continuous AC-DC-AC conversion cycles, capturing a **12% to 18% net daily exergy savings** by operating natively on Direct Current (DC). The electrical backbone is partitioned into two galvanically separated voltage domains:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              BIOREGIONAL 380V DC NANOGRID RING (INTER-NODE)                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                [Two-Pole DC Switch-Disconnector 1000V / 32A]
                                       │
                                [Class-T DC Fuse]
                                       │
                                       ▼
         [Isolated Bidirectional Dual Active Bridge (DAB) 380V / 48V]
                         (3.0 kW Peak, η = 97.5%)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DOMESTIC 48V DC LIFE-SUPPORT BUS (51.2V NOMINAL)            │
│               16S LiFePO4 Battery Pack (15.0 kWh / 300 Ah @ 0.5C)           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ TIER 1 (NEVER SHED — SoC > 5%):      │ TIER 2 (SHED < 25% SoC):             │
│ • Enthalpic HRV (28W continuous)     │ • R290 Domestic Heat Pump (650W)     │
│ • Potable Cistern UV-C (12W)         │ • Induction Cooktop (1800W peak)     │
│ • ESP32 Utility Spine + LoRa (12W)   │ • DHW Stratified Boost (1200W)       │
│ • LED Lighting & Cold Storage (45W)  ├──────────────────────────────────────┤
│                                      │ TIER 3 (SHED < 50% SoC):             │
│                                      │ • FabLab CNC Router & Power Tools    │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## **2. Single-Line Diagram Component Schedule**

| Ref Des | Subsystem | Component Description | Rating & Protocol | Fail-Safe Default |
| :--- | :--- | :--- | :--- | :--- |
| **Q1** | Grid Airlock | 2-Pole High-Voltage DC Circuit Breaker | $1000\text{V DC} / 32\text{A}$ ($I_{cu} = 10\text{ kA}$) | Mechanical trip on overcurrent |
| **F1** | Backbone Fuse | Fast-Acting Class-T Current-Limiting Fuse | $450\text{V DC} / 40\text{A}$ ($200\text{ kA}$ AIC) | Irreversible physical blow |
| **U1** | Isolation Conv | Bidirectional Isolated Dual Active Bridge (DAB) | $380\text{V} \leftrightarrow 48\text{V DC}$, $3.0\text{ kW}$ | Galvanic isolation ($4\text{ kV}_{\text{RMS}}$) |
| **BAT1** | Energy Storage | 16S LiFePO4 Grade-A Prismatic Cells | $51.2\text{V}_{\text{nom}} / 300\text{ Ah}$ ($15.36\text{ kWh}$) | Internal pressure safety vents |
| **BMS1** | Battery Mgmt | Open Hardware RS485 Modbus RTU BMS | $16\text{S} / 200\text{A}$ Continuous | Hardware shunt trip on OVP/UVP |
| **K1** | Low-Temp Lock | Normally-Open Cryo Lockout Contactor | $48\text{V DC} / 150\text{A}$ coil | **De-energizes below $+2^\circ\text{C}$** |
| **K2** | Tier 2 Shedding | Latching High-Current Relay (Tier 2 Loads) | $48\text{V DC} / 80\text{A}$ | Drops out when SoC $\le 25\%$ |
| **K3** | Tier 3 Shedding | Latching High-Current Relay (Tier 3 Workshop) | $48\text{V DC} / 63\text{A}$ | Drops out when SoC $\le 50\%$ |
| **M1** | Utility Spine | Olimex ESP32-POE-ISO Telemetry Gateway | Wired Ethernet (802.3af isolated) | Watchdog hardware restart |

---

## **3. Cold-Weather Lithium Protection Invariant ($< 2^\circ\text{C}$)**

Charging LiFePO4 cells at or below freezing temperatures causes irreversible lithium metal plating on the graphite anode, inducing internal micro-shorts and catastrophic thermal runaway risk:
1. **Primary Firmware Interlock (`esphome/bms_modbus_rtu_stub.yaml`):** The ESP32 continuously polls BMS thermistor registers `TEMP_CELL_MIN`. If $T \le 2.0^\circ\text{C}$, the charging control signal is set to `0.0A`.
2. **Secondary Hardware Analog Lockout:** Contactor `K1` coil power is routed in series through a bimetallic thermal switch rated for contact break at $+2^\circ\text{C} \pm 1^\circ\text{C}$. Even in the event of complete software microcontroller failure, **charge current is physically cut**.

