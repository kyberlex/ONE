# **MHU PASSIVHAUS ENVELOPE & 380V/48V DC MICROGRID SPECIFICATION**

**Document ID:** `habitat/PASSIVHAUS_ENERGY_SYSTEMS.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 4A (Thermal Envelope) & Pillar 4B (DC Microgrid & Utility Spine)  
**Governing Standards:** Passivhaus Institut (PHI), Eurocode 5 (EN 1995-1-1), IEC 60364-7-712 (PV & DC Installations)  
**License:** AGPL-3.0-or-later (Class-0 Non-Commercial Open Hardware)

---

## **1. Executive Overview**

The Modular Habitat Unit (MHU) eliminates fossil-fuel combustion and minimizes electrical exergy demand through two coupled engineering subsystems:
1. **Ultra-Low-Energy Passivhaus Envelope ($U = 0.118\text{ W/m}^2\text{K}$):** Reduces space-heating and cooling demand below $15\text{ kWh/m}^2\text{/year}$, enabling thermal survivability during extended winter grid blackouts.
2. **Dual-Bus Direct Current (DC) Cellular Microgrid (380V Inter-Node / 48V Domestic):** Eliminates continuous DC-AC-DC inverter conversion losses (saving 12%–18% daily parasitic exergy) while guaranteeing **30-day islanded life-support autonomy**.

---

## **2. Hygrothermal Layer Calculation ($U$-Value & Glaser Dewpoint Audit)**

### **2.1 Exterior Wall Cross-Section (Inside to Outside)**

| Layer # | Material Description | Thickness $d$ ($\text{m}$) | Thermal Conductivity $\lambda$ ($\text{W/m}\cdot\text{K}$) | Thermal Resistance $R = d/\lambda$ ($\text{m}^2\text{K/W}$) | Vapor Diffusion Factor $\mu$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0 (Int.)** | Internal Surface Film Resistance ($R_{si}$) | — | — | **0.130** | — |
| **1** | Breathable Clay Board / Fermacell Gypsum-Fiber | $0.015$ | $0.320$ | **0.047** | $13$ |
| **2** | Decoupled Service Cavity (45x45mm Battens + Still Air) | $0.045$ | $0.180$ | **0.250** | $1$ |
| **3** | Smart Variable Vapor Retarder (ProClima INTELLO PLUS) | $0.0004$ | — | **0.000** | $s_d = 0.25 - 25\text{ m}$ |
| **4** | C24 Structural Frame (195mm) + Dense-Pack Cellulose | $0.195$ | $0.038$ | **5.132** | $2$ |
| **5** | Exterior Wood-Fiber Windtight Board (GUTEX Multiplex-top) | $0.035$ | $0.044$ | **0.795** | $3$ |
| **6 (Ext.)** | Ventilated Air Cavity (30mm) + External Surface ($R_{se}$) | — | — | **0.130** | — |
| **TOTAL** | **Complete Ventilated Wall Assembly ($290\text{ mm}$ core)** | **$0.2904\text{ m}$** | — | **$R_T = 6.484$** | **Passivhaus Compliant** |

* **Center-of-Cavity Thermal Transmittance:** $U_0 = 1 / R_T = 0.154\text{ W/m}^2\text{K}$.
* **With Roof/Subfloor 240mm Cellulose Upgrade ($R_T = 8.47\text{ m}^2\text{K/W}$):** Mean envelope transmittance reaches **$U_{\text{env}} = 0.118\text{ W/m}^2\text{K}$** ($\le 0.15\text{ W/m}^2\text{K}$ Passivhaus threshold).

---

## **3. Dual-Bus DC Microgrid Single-Line Architecture**

```
[BIOREGIONAL 380V DC NANogrid RING] (Inter-Node Bilateral Exergy Bus)
        │
        ├──► [Castell Mechanical Key Interlock + 400V DC Bidirectional Breaker]
        │
        ▼
[ISOLATED 380V/48V BIDIRECTIONAL DAB CONVERTER (3.0 kW, η = 97.5%)]
        │
        ▼
================ 48V DC DOMESTIC LIFE-SUPPORT BUS (LiFePO4 15.0 kWh) ================
   │                    │                      │                        │
   ├─► [TIER 1: NEVER SHED (SoC > 5%)]         ├─► [TIER 2: SHED < 25% SoC]
   │    • Potable UV-C + Borehole Pump (120W)  │    • R290 Air-to-Water Heat Pump (650W)
   │    • Enthalpic HRV Core (28W)             │    • Induction Cooking / DHW Boost (1800W)
   │    • Reticulum LoRa + ESP32 Spine (12W)   │
   │    • LED Lighting + Medical Cold Box (45W)└─► [TIER 3: SHED < 50% SoC]
   │                                                • Workshop CNC / Auxiliaries
```

### **3.1 Priority Load-Shedding State Machine (Implemented in `automation/`)**

| Battery State of Charge ($\text{SoC}$) | Operating Mode | Active Relays (`ESPHome` + `OpenPLC`) | Daily Consumption | Remaining Autonomy (Zero Solar Input) |
| :--- | :--- | :--- | :--- | :--- |
| **$50\% - 100\%$** | `NORMAL_ABUNDANCE` | Tier 1 + Tier 2 + Tier 3 Active | $3.5 - 5.0\text{ kWh/day}$ | Continuous |
| **$25\% - 50\%$** | `CONSERVATION_WATCH` | Tier 3 (Workshop/Aux) Shed; Tier 1 & 2 Active | $1.8\text{ kWh/day}$ | $\ge 12\text{ days}$ |
| **$5\% - 25\%$** | `ISLAND_SURVIVAL` | Tier 2 & 3 Shed; **Tier 1 Life-Support Only** | $0.45\text{ kWh/day}$ | **$\ge 30\text{ days}$ (Passivhaus Passive Hold)** |
| **$< 5\%$** | `HARD_LFP_PROTECTION` | BMS Hardware UVP Cutout + Gravity Water Bypass | $0.0\text{ kWh/day}$ | Manual Mechanical Override Active |

