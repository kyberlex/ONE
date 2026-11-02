# **CONSOLIDATED BENCHMARK RESULTS: `SIM-QA-12`, `SIM-QA-13`, `SIM-QA-14`**

**Document Path:** `simone/benchmarks/results/sim_qa_12_13_14_consolidated_results.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Parent Board:** [`oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md`](../../../oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md)  
**License:** AGPL-3.0-or-later

---

## **1. `SIM-QA-12`: Stiff Relay Chattering Under Load-Shedding (Pillar 3)**

* **Script:** [`simone/benchmarks/sim_qa_12_stiff_load_shedding.py`](../sim_qa_12_stiff_load_shedding.py)
* **Quantitative Output:**
  - **Naive Zero-Deadband Threshold ($\text{SoC} = 25.0\%$):** Triggers **1,054 relay toggles in 24h** and **4,216 stiff step rejections** (`FAIL_ZENO_CHATTER`), destroying mechanical contactors and stalling ODE integration.
  - **Patched Schmitt-Trigger Deadband ($\text{Shed} \le 25.0\%$, $\text{Restore} \ge 30.0\%$):** Reduces switching to **7 clean relay transitions in 24h** and **0 step rejections** (`PASS_STABLE`).

---

## **2. `SIM-QA-13`: $-25^\circ\text{C}$ Vapor Retarder Puncture & Service Cavity Shield (Pillar 4A)**

* **Script:** [`simone/benchmarks/sim_qa_13_vapor_puncture.py`](../sim_qa_13_vapor_puncture.py)
* **Quantitative Output (ISO 13788 Glaser Check at $T_{\text{in}} = +20^\circ\text{C}/50\%\text{ RH}$, $T_{\text{out}} = -25^\circ\text{C}/85\%\text{ RH}$):**
  - **Intact Smart Retarder ($s_d = 25.0\text{ m}$):** $P_v = 73.1\text{ Pa} \ll P_{\text{sat}} = 109.9\text{ Pa}$ $\to$ **`PASS_DRY`**.
  - **Aged / Relaxed Seam ($s_d = 5.0\text{ m}$):** $P_v = 83.2\text{ Pa} < P_{\text{sat}} = 109.9\text{ Pa}$ $\to$ **`PASS_DRY`** (exterior Steico wood-fiber $s_d = 0.105\text{ m}$ evacuates vapor).
  - **Direct Unprotected Wall Puncture ($s_d = 0.5\text{ m}$):** $P_v = 216.1\text{ Pa} > P_{\text{sat}} = 109.9\text{ Pa}$ $\to$ **`FAIL_CONDENSATION`**.
* **Engineering Resolution:** Confirms the necessity of the **$50\text{ mm}$ decoupled interior service cavity** (Shearing Layer 4) in front of the ProClima INTELLO PLUS membrane so resident screws/fasteners never reach the vapor barrier.

---

## **3. `SIM-QA-14`: Cryo Lithium Lockout & Long-Distance Voltage Drop (Pillar 4B)**

* **Script:** [`simone/benchmarks/sim_qa_14_cryo_and_voltage_drop.py`](../sim_qa_14_cryo_and_voltage_drop.py)
* **Quantitative Output:**
  - **Vector A (ESP32 Firmware Hang at $-12^\circ\text{C}$):**
    - *Software-Only Cutoff:* Fails open at $I_{\text{chg}} = 30.0\text{ A}$ $\to$ **`FAIL_LITHIUM_PLATING`**.
    - *Series Bimetallic Contactor `K1` ($+2.0^\circ\text{C}$ mechanical break):* Physically cuts charge current to **$0.0\text{ A}$** (`PASS_HARDWARE_SAFE`).
  - **Vector B ($15\text{ kW}$ Solar Feeder over $100\text{ m}$, $\Delta V/V \le 2.0\%$):**
    - *At $48\text{ V DC}$:* Requires $1,150\text{ mm}^2$ conductor = **$2,060.8\text{ kg}$ of copper** (`PROHIBITIVE`).
    - *At $800\text{ V DC}$:* Requires $6.0\text{ mm}^2$ conductor = **$10.8\text{ kg}$ of copper** (`PASS`, $99.5\%$ copper reduction).
