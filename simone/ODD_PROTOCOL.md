# **SIMONE ODD PROTOCOL SPECIFICATION (GRIMM ET AL., 2020)**
## **Overview, Design Concepts, and Details for `Simone.jl` Multiscale Co-Simulation**

**Document ID:** `simone/ODD_PROTOCOL.md`  
**Author:** Kyberlex (`kyberlex@proton.me`) & Pillar 3 Contributors  
**Target Ecosystem:** `Agents.jl` (v6+) / `DifferentialEquations.jl` / `JuliaDynamics`  
**Governing Standard:** Grimm et al. (2020), *The ODD Protocol for Describing Agent-Based and Other Simulation Models: A Second Update*, JASSS 23(2):7.  
**License:** AGPL-3.0-or-later

---

## **1. OVERVIEW**

### **1.1 Purpose and Patterns**
The purpose of `Simone.jl` (**S**imulated **I**ntegrated **M**etabolism for **O**pen **N**etworked **E**arth) is to falsify or validate the biophysical and institutional viability of a post-monetary, demarchic village node ($N = 150 \text{ to } 500$ citizens) prior to the legal chartering of **Foundation ONE** under Swiss Civil Law (ZGB Art. 80 ff.).

`Simone.jl` evaluates whether the system simultaneously satisfies three macro-patterns over multi-year horizons ($t \in [0, 3650\text{ days}]$):
1. **Axtell Docking Equivalence (Homogeneous Limit):** When micro-agent behavioral variance is zeroed ($\sigma_{\text{HEXACO}} = 0$, $\sigma_{\text{fatigue}} = 0$), the discrete `Agents.jl` trajectory $\mathbf{S}_{\text{ABM}}(t)$ matches the continuous `DifferentialEquations.jl` stock-flow trajectory $\mathbf{S}_{\text{ODE}}(t)$ within $\epsilon \le 10^{-3}$.
2. **Tier 1 Biological Survival Invariance:** Under severe abiotic shocks (e.g., 40% solar/hydrological deficit for 60 days), the non-monetary lexicographic allocation operator ($L_{\min}$, Constitution Art. 3.1.5) preserves 100% of human caloric ($2,500\text{ kcal/day}$), potable water ($150\text{ L/day}$), and domestic exergy ($5.0\text{ kWh/day}$) baselines by throttling Tier 2/3 discretionary sectors.
3. **Demarchic Anti-Capture Stability:** Under coordinated factional behaviour in the lower tail of the HEXACO Honesty-Humility distribution ($H < 2.0$), stratified odd-parity sortition juries ($Q \in \{3, 15, 101, 301, 1001\}$) with a $75\%$ qualified supermajority prevent oligarchic capture and deadlock.

---

### **1.2 Entities, State Variables, and Scales**

`Simone.jl` couples two primary entity classes across four structural layers:

#### **A. Global / Environmental Substrate (`VillageState` & `AbioticSubstrateParams`)**
| State Variable | Symbol | Unit | Layer | Description |
| :--- | :--- | :--- | :--- | :--- |
| Stored Exergy | $E(t)$ | $\text{kWh}$ | Layer 0/1 | Usable electrical (48V/380V LFP) and thermal storage stock. |
| Potable & Ag Water | $W(t)$ | $\text{L}$ | Layer 0/1 | Combined cistern and Darcy unconfined aquifer usable volume. |
| Caloric Biomass | $C(t)$ | $\text{kcal}$ | Layer 0/1 | Stored dry-bulk staple calories + active greenhouse yield buffer. |
| Compute & Fab Capacity | $P(t)$ | $\text{core-h}$ | Layer 1 | Available CNC/FabLab machine hours and local telemetry capacity. |
| Soil Available Nitrogen | $N_{\text{soil}}(t)$ | $\text{kg N/ha}$ | Layer 0 | Mineralized soil nitrogen replenished via $92\%$ thermophilic compost loop. |

#### **B. Micro-Agent Entity (`Villager <: AbstractAgent` in `src/agent_abm.jl`)**
| Attribute | Type | Range / Domain | Layer | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `Int` | $1 \dots N$ | Core | Unique `Agents.jl` identifier. |
| `role` | `Symbol` | `:energy`, `:water`, `:food`, `:fablab` | Layer 1 | Primary technical guild assignment. |
| `metabolic_kcal` | `Float64` | $[0, 5000]\text{ kcal}$ | Layer 0 | Daily somatic energy balance. |
| `hydration_l` | `Float64` | $[0, 10]\text{ L}$ | Layer 0 | Daily somatic hydration balance. |
| `fatigue` | `Float64` | $[0.0, 1.0]$ | Layer 2 | Cumulative physical/cognitive burnout index (`update_agent_fatigue`). |
| `cooperation` | `Float64` | $[0.0, 1.0]$ | Layer 2 | Realized civic contribution propensity derived from `PsychometricProfile`. |

#### **C. Temporal Scales (Hierarchical Multi-Rate Stepping)**
* **Continuous Biophysical ODEs:** Adaptive integration (`Tsit5()` / `Rodas5P()`) with sub-hourly accuracy.
* **Discrete Agent Action Tick:** $\Delta t_{\text{ABM}} = 1.0\text{ day}$ (configurable to $1.0\text{ hour}$ in multi-rate coupling, `PoW 3A`).
* **Institutional Sortition Cycle:** Triggered asynchronously upon resource deficit alerts or constitutional proposals ($\Delta t_{\text{gov}} \in [7, 30]\text{ days}$).

---

### **1.3 Process Overview and Scheduling**

During each daily simulation cycle $t \to t + 1$:
1. **Abiotic Inflow & Weather Forcing (`layer0_abiotic.jl`):** Solar insolation, precipitation recharge (`darcy_aquifer_step`), and optional drought shock multipliers (`abiotic_drought_shock_multiplier`) are evaluated.
2. **Leontief Gross Output & Weibull Wear (`layer1_leontief.jl`):** Gross sector requirements $\mathbf{x} = (I - A)^{-1}\mathbf{d}$ and equipment hazard rates $h(t)$ (`weibull_hazard_rate`) are computed.
3. **Lexicographic Rationing ($L_{\min}$):** Available stocks are allocated strictly in order: Tier 1 (Survival) $\succ$ Tier 2 (FabLab/Maintenance) $\succ$ Tier 3 (Surplus).
4. **Agent Contribution & Fatigue Update (`agent_abm.jl` & `layer2_psychometrics.jl`):** Each `Villager` executes their guild production scaled by `civic_contribution_propensity` and updates somatic fatigue.
5. **Sortition Governance Trigger (`layer3_sortition.jl`):** If any stock drops below safety thresholds or a policy dispute arises, an odd-parity jury (`draw_stratified_odd_jury`) votes under the $75\%$ supermajority rule (`evaluate_supermajority_vote`).

---

## **2. DESIGN CONCEPTS**

* **Basic Principles:** Strict obedience to the First and Second Laws of Thermodynamics (Hawkins-Simon viability $\rho(A) < 1.0$, non-negative stocks, irreversible entropy decay) and Athenian demarchic sortition.
* **Emergence:** Systemic resilience or collapse emerges from the interaction between Weibull equipment degradation, abiotic droughts, and the lower tail of agent cooperation (`HEXACO-H < 2.0`), rather than centralized price signals.
* **Heterogeneity:** Agents differ in `hexaco_h`, strategic depth `camerer_k`, and accumulated `fatigue`.
* **Stochasticity:** Weather shocks, Weibull failure arrival times, and VRF sortition jury sampling are stochastic (seeded via deterministic RNG for bit-for-bit reproducibility).

---

## **3. DETAILS & OPEN CO-STEWARD CALIBRATION HOOKS**

### **3.1 Initialization**
Default initialization (`VillageParams()` and `VillageState()` in `src/aggregate_ode.jl`) configures a $N = 300$ village with 10-day initial buffers ($E_0 = 15,000\text{ kWh}$, $W_0 = 450,000\text{ L}$, $C_0 = 7.5 \times 10^6\text{ kcal}$, $P_0 = 6,000\text{ core-h}$).

### **3.2 Input Data**
Archetype boundary conditions are loaded from `simone/data/archetypes/node01_*.json` through `node05_*.json` and `simone/data/leontief_baseline_matrix.json` (documented in [`simone/data/calibration_sources.md`](data/calibration_sources.md)).

### **3.3 Open Proof-of-Work Extensions (`[OPEN FOR PILLAR 3 CO-STEWARD]`)**
* **`PoW 3A`:** Stiff solver benchmarking (`Rodas5P()` vs `Tsit5()`) with `ContinuousCallback` zero-crossing guards at $S_i(t) = 0$.
* **`PoW 3B`:** Phase-diagram sweep of $(\mu_{\text{HEXACO}}, \sigma_{\text{HEXACO}})$ vs. docking divergence metric $\Delta_{\text{L2}}$.
* **`PoW 3C`:** Full 365-day 4-layer coupled runner in `simone/examples/`.

