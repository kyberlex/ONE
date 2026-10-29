# **ROUND 2 CRITIC ADVERSARIAL STRESS-TEST DOCKETS (`SIM-QA-10+`)**
## *Active Pipeline Board for External Senior Critics & Co-Stewards*

**Author Persona:** Kyberlex (`kyberlex@proton.me`)  
**Phase:** Phase III — External Adversarial Review (Pre-Genesis Lock)  
**Parent Pipeline:** [`oasis/SIM_QA_TODO.md`](../SIM_QA_TODO.md)  
**Briefing Guide:** [`stewards/CRITIC_BRIEFING_PACK.md`](../../stewards/CRITIC_BRIEFING_PACK.md)  

---

## **1. Active Pipeline Status Board**

| Docket ID | Domain Pillar | Vulnerability / Attack Hypothesis | Target Modules / Articles | Current Stage | Lead Reviewer / Critic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`SIM-QA-10`** | **Pillar 1**<br>*(Biophysical Econ)* | **Hawkins-Simon Matrix Inversion Under Abrupt Embargo:** Verify non-negativity of $(I-A)^{-1}$ when import exergy drops by 60%. | `simone/data/leontief_12sector_matrix.json`<br>`Constitution Art. 3.1.5` | `[STAGE 1: HYPOTHESIS]` | *Heterodox Input-Output Critic* |
| **`SIM-QA-11`** | **Pillar 2**<br>*(Sortition & Law)* | **Demarchic Jury Exhaustion / Griefing Attack:** Coordinated malicious faction submits 50 bad-faith proposals to overwhelm sortition quorums. | `simone/src/layer3_sortition.jl`<br>`foundation/SORTITION_PROTOCOL_SPEC.md` | `[STAGE 1: HYPOTHESIS]` | *Demarchy / Sortition Critic* |
| **`SIM-QA-12`** | **Pillar 3**<br>*(Simone.jl Engine)* | **Stiff Discontinuity Divergence in Coupled Solvers:** Step transitions during storm blackouts inducing numerical solver explosion. | `simone/src/docking.jl`<br>`simone/benchmarks/benchmark_solvers.jl` | `[STAGE 1: HYPOTHESIS]` | *JuliaDynamics / SciML Critic* |
| **`SIM-QA-13`** | **Pillar 4A**<br>*(Timber & Envelope)* | **Accidental Vapor Barrier Breach & Interstitial Rot:** Penetration of smart vapor retarder in continuous $-30^\circ\text{C}$ winter conditions. | `habitat/hygrothermal/glaser_audit_5_biomes.py`<br>`habitat/MHU_MODULAR_HABITAT_UNIT.md` | `[STAGE 1: HYPOTHESIS]` | *Passivhaus Building Physics Critic* |
| **`SIM-QA-14`** | **Pillar 4B**<br>*(DC Microgrid)* | **BMS Contactor Welding & Lithium Plating Plunge:** Microcontroller freeze leading to sub-$0^\circ\text{C}$ charging during rapid temperature drop. | `habitat/schematics/microgrid_electrical_spec.md`<br>`habitat/automation/modbus/` | `[STAGE 1: HYPOTHESIS]` | *DC Microgrid & Battery Safety Critic* |

---

## **2. Detailed Docket Dossiers**

### **`SIM-QA-10`: Abiotic Embargo & $L_{\min}$ Lexicographic Viability**
* **Target:** `simone/data/leontief_12sector_matrix.json` and `simone/src/layer1_leontief.jl`.
* **Vulnerability Hypothesis:** If external supply chain disruptions truncate critical technical inputs (e.g. electrical exergy $x_0$ or agricultural water $x_3$), will the lexicographic operator $L_{\min}$ cleanly safeguard Tier 1 subsistence or induce circular production deadlock?
* **Proof Requirement:** Numerical demonstration that gross output $x = (I - A)^{-1} d$ remains strictly positive ($x \ge 0$) under a 50% vector reduction in secondary inputs.

### **`SIM-QA-11`: Demarchic Jury Denial-of-Service (DoS)**
* **Target:** `foundation/SORTITION_PROTOCOL_SPEC.md` and `simone/src/layer3_sortition.jl`.
* **Vulnerability Hypothesis:** An adversarial actor repeatedly floods neighborhood councils (odd-parity quorum 15) with nuisance petitions, causing cognitive fatigue and voter burnout.
* **Proof Requirement:** Verification that stratified sortition cooldowns, cryptographic VRF lottery exclusion, and multi-stage screening filters prevent cognitive exhaustion while maintaining open civic petition rights.

### **`SIM-QA-12`: High-Stiffness Numerical Stability under Discrete Load-Shedding**
* **Target:** `simone/src/aggregate_ode.jl` and `simone/benchmarks/benchmark_solvers.jl`.
* **Vulnerability Hypothesis:** When the battery SoC drops below 25%, instantaneous discrete relay trips cause step jumps in $d\mathbf{S}/dt$. Explicit Runge-Kutta solvers (`Tsit5`) might take microscopic step sizes or fail convergence.
* **Proof Requirement:** Benchmarking `Rodas5P()` and `Rosenbrock23()` with `ContinuousCallback` state events, confirming zero step rejection explosion.

### **`SIM-QA-13`: Hygrothermal Vapor Retarder Puncture Resilience**
* **Target:** `habitat/hygrothermal/glaser_audit_5_biomes.py`.
* **Vulnerability Hypothesis:** If a tenant accidentally breaches the ProClima INTELLO PLUS retarder ($s_d$ drops from $25\text{ m}$ to $0.5\text{ m}$ locally), does moisture accumulate in the cellulose cavity faster than the rear-ventilated rainscreen can evacuate it?
* **Proof Requirement:** Glaser check showing whether exterior wood-fiber board ($s_d = 0.105\text{ m}$) provides outward drying capacity exceeding puncture moisture ingress.

### **`SIM-QA-14`: Hardware Analog Interlock vs. Lithium Cryo Plating**
* **Target:** `habitat/schematics/microgrid_electrical_spec.md` and `habitat/automation/esphome/bms_modbus_rtu_stub.yaml`.
* **Vulnerability Hypothesis:** In the event that the ESP32 microcontroller crashes, hangs in a loop, or RS485 communication is severed, charging current could continue to flow into frozen cells ($< 2^\circ\text{C}$).
* **Proof Requirement:** Confirmation that the hardware bimetallic mechanical contactor `K1` is wired in series with the charger enable loop, guaranteeing physical open-circuit cutoff regardless of software state.

