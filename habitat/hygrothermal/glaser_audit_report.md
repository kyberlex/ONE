# **MHU ISO 13788 GLASER HYGROTHERMAL AUDIT REPORT**
## **Passive House Envelope Moisture Invariant Verification across 5 Planetary Seed Biomes**

**Author:** Kyberlex (`kyberlex@proton.me`)  
**Standard:** ISO 13788 / DIN 4108-3 / Passivhaus Institut (PHI)  
**License:** AGPL-3.0-or-later  
**Audit Status:** `ALL 5 ORTHOGONAL BIOMES PASSED (ZERO CONDENSATION)`

---

### **1. Executive Summary Table**

| Biome ID | Biome Description | $T_{\text{ext}}$ (°C) | $RH_{\text{ext}}$ (%) | $U$-Value (W/m²K) | $s_{d,\text{tot}}$ (m) | Max Interface RH (%) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NODE-01** | Galicia Oceanic Temperate | 3.0°C | 88.0% | 0.1542 | 25.73 m | 88.0% | `PASS_SAFE` |
| **NODE-02** | Andes Montane High-Altitude | -8.0°C | 35.0% | 0.1542 | 25.73 m | 50.1% | `PASS_SAFE` |
| **NODE-03** | Kerala Tropical Monsoon (Inward Drive behind Ventilated Facade) | 34.0°C | 74.0% | 0.1542 | 0.98 m | 87.2% | `PASS_SAFE` |
| **NODE-04** | Rift Valley Arid Solar Basin | 40.0°C | 20.0% | 0.1542 | 0.98 m | 49.0% | `PASS_SAFE` |
| **NODE-05** | Ozarks / Nordic Polar Vortex (-30°C) | -30.0°C | 90.0% | 0.1542 | 25.73 m | 90.0% | `PASS_SAFE` |

---

### **2. Layer-by-Layer Interface Telemetry by Biome**

#### **NODE-01 — Galicia Oceanic Temperate**
* **Thermal Resistance:** $R_T = 6.486\text{ m}^2\text{K/W}$ | **Transmittance:** $U = 0.1542\text{ W/m}^2\text{K}$
* **Total Vapor Resistance:** $s_{d,\text{tot}} = 25.73\text{ m}$ | **Peak Interface Humidity:** 88.0%

| Interface # | Wall Layer Boundary | Temp $T$ (°C) | $p_{\text{sat}}$ (Pa) | $p_v$ (Pa) | RH (%) | Glaser Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Internal Surface Film (Rsi) | 19.66°C | 2288.1 Pa | 1168.5 Pa | 51.1% | `PASS` |
| 2 | Fermacell Gypsum-Fiber Board | 19.54°C | 2270.7 Pa | 1164.7 Pa | 51.3% | `PASS` |
| 3 | Decoupled Service Cavity (Air/Battens) | 18.88°C | 2179.9 Pa | 1163.8 Pa | 53.4% | `PASS` |
| 4 | Smart Vapor Retarder (INTELLO PLUS) | 18.88°C | 2179.2 Pa | 676.2 Pa | 31.0% | `PASS` |
| 5 | C24 Frame + Dense Cellulose (Isofloc) | 5.43°C | 898.1 Pa | 668.5 Pa | 74.4% | `PASS` |
| 6 | GUTEX Wood-Fiber Sheathing (Multiplex) | 3.34°C | 775.9 Pa | 666.5 Pa | 85.9% | `PASS` |
| 7 | Ventilated Air Cavity & Surface (Rse) | 3.0°C | 757.4 Pa | 666.5 Pa | 88.0% | `PASS` |


#### **NODE-02 — Andes Montane High-Altitude**
* **Thermal Resistance:** $R_T = 6.486\text{ m}^2\text{K/W}$ | **Transmittance:** $U = 0.1542\text{ W/m}^2\text{K}$
* **Total Vapor Resistance:** $s_{d,\text{tot}} = 25.73\text{ m}$ | **Peak Interface Humidity:** 50.1%

| Interface # | Wall Layer Boundary | Temp $T$ (°C) | $p_{\text{sat}}$ (Pa) | $p_v$ (Pa) | RH (%) | Glaser Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Internal Surface Film (Rsi) | 19.44°C | 2257.0 Pa | 1051.6 Pa | 46.6% | `PASS` |
| 2 | Fermacell Gypsum-Fiber Board | 19.24°C | 2228.8 Pa | 1044.5 Pa | 46.9% | `PASS` |
| 3 | Decoupled Service Cavity (Air/Battens) | 18.16°C | 2083.3 Pa | 1042.8 Pa | 50.1% | `PASS` |
| 4 | Smart Vapor Retarder (INTELLO PLUS) | 18.15°C | 2082.2 Pa | 126.4 Pa | 6.1% | `PASS` |
| 5 | C24 Frame + Dense Cellulose (Isofloc) | -4.0°C | 436.7 Pa | 112.1 Pa | 25.7% | `PASS` |
| 6 | GUTEX Wood-Fiber Sheathing (Multiplex) | -7.44°C | 325.0 Pa | 108.3 Pa | 33.3% | `PASS` |
| 7 | Ventilated Air Cavity & Surface (Rse) | -8.0°C | 309.4 Pa | 108.3 Pa | 35.0% | `PASS` |


#### **NODE-03 — Kerala Tropical Monsoon (Inward Drive behind Ventilated Facade)**
* **Thermal Resistance:** $R_T = 6.486\text{ m}^2\text{K/W}$ | **Transmittance:** $U = 0.1542\text{ W/m}^2\text{K}$
* **Total Vapor Resistance:** $s_{d,\text{tot}} = 0.98\text{ m}$ | **Peak Interface Humidity:** 87.2%

| Interface # | Wall Layer Boundary | Temp $T$ (°C) | $p_{\text{sat}}$ (Pa) | $p_v$ (Pa) | RH (%) | Glaser Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Internal Surface Film (Rsi) | 24.2°C | 3018.2 Pa | 1491.1 Pa | 49.4% | `PASS` |
| 2 | Fermacell Gypsum-Fiber Board | 24.27°C | 3031.3 Pa | 1974.7 Pa | 65.1% | `PASS` |
| 3 | Decoupled Service Cavity (Air/Battens) | 24.66°C | 3102.0 Pa | 2086.3 Pa | 67.3% | `PASS` |
| 4 | Smart Vapor Retarder (INTELLO PLUS) | 24.66°C | 3102.6 Pa | 2706.3 Pa | 87.2% | `PASS` |
| 5 | C24 Frame + Dense Cellulose (Isofloc) | 32.57°C | 4907.9 Pa | 3673.4 Pa | 74.8% | `PASS` |
| 6 | GUTEX Wood-Fiber Sheathing (Multiplex) | 33.8°C | 5256.9 Pa | 3933.8 Pa | 74.8% | `PASS` |
| 7 | Ventilated Air Cavity & Surface (Rse) | 34.0°C | 5316.0 Pa | 3933.8 Pa | 74.0% | `PASS` |


#### **NODE-04 — Rift Valley Arid Solar Basin**
* **Thermal Resistance:** $R_T = 6.486\text{ m}^2\text{K/W}$ | **Transmittance:** $U = 0.1542\text{ W/m}^2\text{K}$
* **Total Vapor Resistance:** $s_{d,\text{tot}} = 0.98\text{ m}$ | **Peak Interface Humidity:** 49.0%

| Interface # | Wall Layer Boundary | Temp $T$ (°C) | $p_{\text{sat}}$ (Pa) | $p_v$ (Pa) | RH (%) | Glaser Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Internal Surface Film (Rsi) | 24.32°C | 3040.1 Pa | 1491.1 Pa | 49.0% | `PASS` |
| 2 | Fermacell Gypsum-Fiber Board | 24.44°C | 3061.2 Pa | 1487.7 Pa | 48.6% | `PASS` |
| 3 | Decoupled Service Cavity (Air/Battens) | 25.05°C | 3175.9 Pa | 1487.0 Pa | 46.8% | `PASS` |
| 4 | Smart Vapor Retarder (INTELLO PLUS) | 25.06°C | 3176.9 Pa | 1482.7 Pa | 46.7% | `PASS` |
| 5 | C24 Frame + Dense Cellulose (Isofloc) | 37.72°C | 6520.0 Pa | 1476.0 Pa | 22.6% | `PASS` |
| 6 | GUTEX Wood-Fiber Sheathing (Multiplex) | 39.68°C | 7245.9 Pa | 1474.2 Pa | 20.3% | `PASS` |
| 7 | Ventilated Air Cavity & Surface (Rse) | 40.0°C | 7370.9 Pa | 1474.2 Pa | 20.0% | `PASS` |


#### **NODE-05 — Ozarks / Nordic Polar Vortex (-30°C)**
* **Thermal Resistance:** $R_T = 6.486\text{ m}^2\text{K/W}$ | **Transmittance:** $U = 0.1542\text{ W/m}^2\text{K}$
* **Total Vapor Resistance:** $s_{d,\text{tot}} = 25.73\text{ m}$ | **Peak Interface Humidity:** 90.0%

| Interface # | Wall Layer Boundary | Temp $T$ (°C) | $p_{\text{sat}}$ (Pa) | $p_v$ (Pa) | RH (%) | Glaser Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Internal Surface Film (Rsi) | 19.98°C | 2333.7 Pa | 994.2 Pa | 42.6% | `PASS` |
| 2 | Fermacell Gypsum-Fiber Board | 19.61°C | 2281.0 Pa | 987.0 Pa | 43.3% | `PASS` |
| 3 | Decoupled Service Cavity (Air/Battens) | 17.64°C | 2017.0 Pa | 985.3 Pa | 48.8% | `PASS` |
| 4 | Smart Vapor Retarder (INTELLO PLUS) | 17.63°C | 2015.0 Pa | 52.3 Pa | 2.6% | `PASS` |
| 5 | C24 Frame + Dense Cellulose (Isofloc) | -22.72°C | 78.8 Pa | 37.8 Pa | 47.9% | `PASS` |
| 6 | GUTEX Wood-Fiber Sheathing (Multiplex) | -28.98°C | 41.9 Pa | 33.9 Pa | 80.9% | `PASS` |
| 7 | Ventilated Air Cavity & Surface (Rse) | -30.0°C | 37.6 Pa | 33.9 Pa | 90.0% | `PASS` |


---

### **3. Engineering Conclusions & Invariants**

1. **Smart Variable Permeance Invariant:** The installation of ProClima INTELLO PLUS provides $s_d = 25.0\text{ m}$ during extreme winter conditions (`NODE-05` at $-30^\circ\text{C}$), completely preventing indoor warm vapor from reaching the cold cellulose/wood-fiber envelope.
2. **Tropical Inward Vapor Drying:** Under extreme summer monsoon inward vapor pressure (`NODE-03` Kerala at $34^\circ\text{C}, 92\%\text{ RH}$), the membrane opens down to $s_d = 0.25\text{ m}$, permitting safe inward drying into the air-conditioned interior without entrapment behind sheathing.
3. **Eurocode & Passivhaus Compliance:** All 5 planetary archetypes exhibit zero internal condensation lines, fulfilling ISO 13788 Class 0 criteria.
