# **MHU DUAL-BUS DC MICROGRID ELECTRICAL SPECIFICATION & SINGLE-LINE ARCHITECTURE**

**Document Path:** `habitat/schematics/microgrid_electrical_spec.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 4B (Smart-Home, Microgrid & Utility Spine Specialist)  
**Governing Standards:** IEC 60364-7-712 (Solar PV Power Supply Systems), IEC 62619 (Safety for Secondary Lithium Cells), NFPA 70 Article 706 (Energy Storage Systems)  
**License:** AGPL-3.0-or-later (Class-0 Non-Commercial Open Hardware)  

---

## **1. Open Engineering Mandate: Voltage Domains & $I^2R$ Ohmic Loss Physics**

> **Co-Steward Architectural Note (Pillar 4B Open Design Space):**  
> This specification defines **thermodynamic and safety invariants** ($\Delta V / V \le 2.0\%$, galvanic fault isolation, and passive analog lockouts) alongside a **2026 Reference Baseline**. It does **not** lock future Pillar 4B Co-Stewards into a rigid single-voltage dogma. Co-Stewards are encouraged to use [`calculate_voltage_copper_tradeoff.py`](calculate_voltage_copper_tradeoff.py) to optimize the voltage architecture ($380\text{–}800\text{ V DC}$ vs. $400\text{ V AC}$ 3-phase vs. hybrid architectures) for each specific biome and settlement density.

### **Why 48V DC Must Never Be Used for Solar Arrays or Long Feeders ($P_{\text{loss}} = I^2 R$)**
Ohmic power dissipation in conductors scales with the square of current and inversely with the square of voltage:
$$P_{\text{loss}} = I^2 R = \left(\frac{P}{V}\right)^2 \cdot \frac{2 \rho_{\text{Cu}} L}{A}$$
Connecting large solar PV fields or inter-building feeders at $48\text{ V DC}$ is physically prohibitive: transmitting $15\text{ kW}$ over $80\text{ m}$ at $48\text{ V}$ ($I = 312.5\text{ A}$) with a $\le 2\%$ voltage drop requires **$558\text{ mm}^2$ of copper ($\sim 890\text{ kg}$ Cu)**, whereas transmitting the same $15\text{ kW}$ at **$800\text{ V DC}$** ($I = 18.75\text{ A}$) requires only **$2.5\text{ mm}^2$ ($\sim 4.0\text{ kg}$ Cu) — a $99.5\%$ reduction in copper mass**.

Consequently, the electrical architecture is strictly partitioned by **distance and power scale**:

| Domain Level | Typical Run Length | Permitted Voltage Architecture (Open Trade-Off) | Rationale & Safety Class |
| :--- | :--- | :--- | :--- |
| **Level 0: Solar PV Strings & Wind Feeders** | $20\text{ m} - 500\text{ m}$ | **$600\text{ V} - 1000\text{ V DC}$** (High-Voltage MPPT Strings) or **$400\text{ V AC}$** 3-Phase | Minimizes $I^2R$ line losses and copper embodied exergy over field distances. |
| **Level 1: Village / Inter-Node Distribution Ring** | $15\text{ m} - 300\text{ m}$ | **$380\text{ V} - 800\text{ V DC}$** Nanogrid Ring **OR** **$400\text{ V AC}$** 3-Phase Microgrid | Evaluated per site by Pillar 4B Co-Steward via [`calculate_voltage_copper_tradeoff.py`](calculate_voltage_copper_tradeoff.py). |
| **Level 2: Intra-MHU Domestic Bus (2026 Baseline)** | $< 8\text{ m}$ *(strictly inside single cabin from Utility Spine)* | **$48\text{ V DC}$** ($51.2\text{ V}_{\text{nom}}$ SELV $<60\text{ V DC}$) for low-power electronics/LEDs/ventilation; high-power appliances on high-voltage bus | Safe Extra-Low Voltage (SELV) inside short room runs (<8 m) prevents lethal shock risk during user maintenance. |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│    LEVEL 0 & 1: SOLAR STRING (600–1000V DC) & VILLAGE BUS (380–800V DC / AC)│
│            (Long-Distance Distribution — Minimal Copper Cross-Section)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                [Two-Pole Switch-Disconnector 1000V / 32A]
                                       │
                                [Class-T Fuse]
                                       │
                                       ▼
         [Isolated Bidirectional Converter (DAB) to Intra-Unit Bus]
                         (3.0 kW Peak, η = 97.5%)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│       LEVEL 2: INTRA-MHU SHORT-RUN (<8m) 48V DC SELV LIFE-SUPPORT BUS       │
│               16S LiFePO4 Battery Pack (15.0 kWh / 300 Ah @ 0.5C)           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ TIER 1 (NEVER SHED — SoC > 5%):      │ TIER 2 (SHED < 25% SoC):             │
│ • Enthalpic HRV (28W continuous)     │ • R290 Domestic Heat Pump (650W)     │
│ • Potable Cistern UV-C (12W)         │ • Induction Cooktop (1800W peak)     │
│ • Utility Spine Controller (12W)     │ • DHW Stratified Boost (1200W)       │
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

