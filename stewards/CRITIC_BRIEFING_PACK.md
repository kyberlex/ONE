# **ADVERSARIAL CRITIC BRIEFING PACK (`stewards/CRITIC_BRIEFING_PACK.md`)**
## **30-Minute Falsification & Stress-Test Guide for Senior Domain Specialists**

**Author:** Kyberlex (`kyberlex@proton.me`)  
**Phase:** Phase 0 — Genesis Architectural Hardening  
**Mandate:** *"You do not need to agree with O.N.E. Read or run the module in your domain and tell us exactly where the math, physics, or incentives break."*

---

## **I. WHY WE INVITE ADVERSARIAL CRITICS**

In Phase 0, Open Networked Earth (O.N.E.) treats its Living Constitution, biophysical simulator (`Simone.jl`), and modular habitat engineering (`habitat/`) as **falsifiable scientific hypotheses**.

Before **Foundation ONE** is formally incorporated under Swiss Civil Law (ZGB Art. 80 ff.) and the Constitution is permanently locked as Statutory Annex I, every technical pillar must survive adversarial review by **at least one senior independent domain critic**.

* **Bounded Commitment:** 15 to 30 minutes of targeted inspection. No recurring meetings, no ideological endorsement required.
* **Direct Impact:** Every confirmed failure mode is logged in [`oasis/SIM_QA_TODO.md`](../oasis/SIM_QA_TODO.md), simulated in `Simone.jl`, and compiled into a permanent constitutional or engineering patch with full credit (or anonymous acknowledgment, at the critic's choice).

---

## **II. DOMAIN-BY-DOMAIN FALSIFICATION TARGETS**

### **1. Biophysical & Input-Output Economics (Pillar 1 Critics)**
* **Core Claim Under Test:** A post-monetary society can allocate resources without Hayekian market price signals by combining physical Leontief Input-Output matrices ($x = (I - A)^{-1}d$) for staple baseline needs with a strict non-monetary lexicographic priority operator ($L_{\min}$: Tier 1 Biological Survival $\succ$ Tier 2 Civic Infrastructure $\succ$ Tier 3 Discretionary Projects).
* **Exact Files to Inspect (15 min):**
  1. [`simone/src/layer1_leontief.jl`](../simone/src/layer1_leontief.jl) — Hawkins-Simon viability check, `solve_leontief_gross_output`, `lexicographic_allocate`, and `weibull_hazard_rate`.
  2. [`simone/data/leontief_baseline_matrix.json`](../simone/data/leontief_baseline_matrix.json) & [`simone/data/archetypes/`](../simone/data/archetypes/) — Physical unit calibration across 5 orthogonal biomes.
  3. [`bible/chapters/03_CHAPTER_III_THERMODYNAMIC_ECONOMICS.md`](../bible/chapters/03_CHAPTER_III_THERMODYNAMIC_ECONOMICS.md) — Constitutional Article 3 (Thermodynamic Exergy Accounting & ETI External Trade Airlock).
* **Key Falsification Questions:**
  - *Where does static/dynamic Leontief inversion fail when capital goods suffer stochastic Weibull breakdowns during an abiotic supply shock?*
  - *Can the lexicographic operator $L_{\min}$ induce starvation in Tier 2 spare-parts fabrication that recursively collapses Tier 1 output 90 days later?*

---

### **2. Deliberative Democracy, Sortition & Commons Law (Pillar 2 Critics)**
* **Core Claim Under Test:** Replacing electoral political parties and absentee real estate ownership with **stratified odd-parity sortition assemblies** (3, 15, 101, 301, 1,001 citizens; 75% supermajority rule) and **Dynamic Usufruct ("Use It or Lose It")** prevents both oligarchic capture and tragedy-of-the-commons housing neglect.
* **Exact Files to Inspect (15 min):**
  1. [`simone/src/layer3_sortition.jl`](../simone/src/layer3_sortition.jl) — Odd-parity quorum verification and 75% supermajority threshold logic.
  2. [`foundation/statutes_foundation_one.md`](../foundation/statutes_foundation_one.md) & [`foundation/USUFRUCT_COVENANT_TEMPLATE.md`](../foundation/USUFRUCT_COVENANT_TEMPLATE.md) — Swiss ZGB Art. 80 ff. irrevocable asset lock and *Baurecht* usufruct lease covenants.
  3. [`foundation/SORTITION_PROTOCOL_SPEC.md`](../foundation/SORTITION_PROTOCOL_SPEC.md) — VRF cryptographic lottery, cognitive unburdening, and anti-capture safeguards.
* **Key Falsification Questions:**
  - *Does a 75% supermajority requirement create status-quo paralysis when an urgent ecological or inter-basin water reallocation decision is needed?*
  - *How could a hostile legacy municipality or commercial creditor pierce the Swiss Foundation + local Cooperative two-tier legal shield?*

---

### **3. Complex Systems & Multiscale Co-Simulation (Pillar 3 Critics)**
* **Core Claim Under Test:** `Simone.jl` couples continuous-time differential equations (solar, Darcy hydrology, storage decay) with discrete micro-agents (`Agents.jl`) using the **Axtell Docking Discipline (1996)**: proving mathematical equivalence in the homogeneous limit ($\|\mathbf{S}_{\text{ODE}}(t) - \mathbf{S}_{\text{ABM}}(t)\| \le \epsilon$) before introducing psychometric variance (HEXACO-H) and governance rules.
* **Exact Files to Inspect & Run (15 min):**
  1. [`simone/simone-specs.md`](../simone/simone-specs.md) — Formal 4-layer multiscale mathematical specification.
  2. [`simone/src/aggregate_ode.jl`](../simone/src/aggregate_ode.jl), [`simone/src/agent_abm.jl`](../simone/src/agent_abm.jl), and [`simone/src/docking.jl`](../simone/src/docking.jl).
  3. [`simone/test/test_docking.jl`](../simone/test/test_docking.jl) & [`simone/test/test_conservation.jl`](../simone/test/test_conservation.jl).
  4. Quick CLI execution: `julia --project=simone -e 'using Pkg; Pkg.test()'`
* **Key Falsification Questions:**
  - *Where do multi-rate time-stepping synchronization boundaries (continuous ODE vs. discrete agent tick) introduce numerical drift or stiffness artifacts?*
  - *Is the HEXACO-H behavioral parameterization in [`simone/src/layer2_psychometrics.jl`](../simone/src/layer2_psychometrics.jl) sufficient to capture coordinated free-riding and social burnout?*

---

### **4. Open-BIM Timber Architecture & DC Microgrids (Pillar 4A & 4B Critics)**
* **Core Claim Under Test:** The **Modular Habitat Unit (MHU)** achieves Passivhaus performance ($U = 0.118\text{ W/m}^2\text{K}$), Eurocode 5 structural safety ($F_{v,Rk} = 54.55\text{ kN}$ per double-shear M12 birch gusset), reversible non-concrete helical pile foundations, and 380V/48V DC zero-cloud automation across 5 extreme planetary climates without interstitial rot or single-point software failure.
* **Exact Files to Inspect (15 min):**
  1. [`habitat/MHU_MODULAR_HABITAT_UNIT.md`](../habitat/MHU_MODULAR_HABITAT_UNIT.md) & [`habitat/cad/generate_mhu_gusset.FCMacro`](../habitat/cad/generate_mhu_gusset.FCMacro).
  2. [`habitat/PASSIVHAUS_ENERGY_SYSTEMS.md`](../habitat/PASSIVHAUS_ENERGY_SYSTEMS.md) & [`habitat/SENSOR_TOPOLOGY_HOME_ASSISTANT.md`](../habitat/SENSOR_TOPOLOGY_HOME_ASSISTANT.md).
  3. [`habitat/automation/homeassistant/mhu_abiotic_core.yaml`](../habitat/automation/homeassistant/mhu_abiotic_core.yaml) & [`habitat/automation/esphome/utility_spine_esp32.yaml`](../habitat/automation/esphome/utility_spine_esp32.yaml).
  4. [`roadmap/blueprints/SEED_NODE_CANDIDATE_REGISTRY.md`](../roadmap/blueprints/SEED_NODE_CANDIDATE_REGISTRY.md) — The 5 orthogonal climate testbeds.
* **Key Falsification Questions:**
  - *Under NODE-01 (95% RH Oceanic) or NODE-03 (Tropical Monsoon), where is the highest risk of interstitial condensation or fastener corrosion in the C24 + birch plywood nodal joint?*
  - *In the 380V/48V DC architecture, what fault condition (e.g. DC arc fault, BMS contactor weld, ESP32 hang) could bypass the local automation rules?*

---

## **III. HOW TO SUBMIT YOUR CRITIQUE**

1. **GitHub Issue (Structured Template):** Open an [**Adversarial Critic Report**](https://github.com/kyberlex/ONE/issues/new/choose) using `.github/ISSUE_TEMPLATE/04_adversarial_critic_report.md`.
2. **GitHub Discussions:** Post directly in the domain thread ([Discussion #9 Econ](https://github.com/kyberlex/ONE/discussions/9), [#10 Law](https://github.com/kyberlex/ONE/discussions/10), [#11 Sim](https://github.com/kyberlex/ONE/discussions/11), [#12 Habitat](https://github.com/kyberlex/ONE/discussions/12)).
3. **Direct Encrypted Mail:** Send notes to `kyberlex@proton.me` (subject: `[CRITIC-PILLAR-X]`).

