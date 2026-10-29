# **ADVERSARIAL CRITIC REPORT DOCKET TEMPLATE (`SIM-QA-XX`)**

> **Instructions for External Critics & Co-Stewards:**  
> Use this template to file a formal falsification, failure mode, or constitutional loophole report.  
> File as a new GitHub Issue (template: `04_adversarial_critic_report.md`) or submit a PR into `oasis/external_critics_round2/`.

---

## **1. Docket Header**

* **Docket ID:** `SIM-QA-[XX]` (e.g. `SIM-QA-10`)
* **Title:** [Concise 1-line vulnerability title]
* **Target Pillar:** [Pillar 1: Biophysical Econ | Pillar 2: Governance/Law | Pillar 3: Simone.jl | Pillar 4A: Habitat CAD | Pillar 4B: Microgrid YAML]
* **Target Files / Articles:** [e.g. `simone/src/layer1_leontief.jl`, `Constitution Art. 3.1.5`, `habitat/PASSIVHAUS_ENERGY_SYSTEMS.md`]
* **Reporting Critic / Co-Steward:** [Handle or Pseudonym, Institution/Domain]
* **Date Opened:** [YYYY-MM-DD]
* **Lifecycle Stage:** `[STAGE 1: HYPOTHESIS]`

---

## **2. Adversarial Hypothesis & Threat Model**

### **2.1 The Vulnerability / Failure Mode**
[Explain precisely how the equation, legal clause, or physical configuration breaks down under stress.]

### **2.2 Reproduction Steps / Numerical Proof**
```julia
# Or Python / bash / calculation reproduction snippet
```

### **2.3 Consequences if Unpatched**
[What systemic failure occurs? E.g., Blackout, starvation, real estate capture, juror exhaustion, numerical simulation instability.]

---

## **3. Red-Team Exploitation Vector (`[STAGE 2: RED_STRESS_TEST]`)**

* **Adversarial Scenario:** [Describe the exact attack or extreme physical event.]
* **Boundary Condition:** [Parameter values triggering the failure: e.g. T_ext < -35°C, 45% drought, 100 bad-faith proposals.]
* **Observed Failure:** [Numerical outcome from `Simone.jl` or mechanical stress solver.]

---

## **4. Blue Defense & Purple Patch (`[STAGE 3: PURPLE_PATCH]`)**

### **4.1 Statutory / Algorithmic Patch Specification**
[The exact constitutional diff, Leontief matrix adjustment, or CAD parameter fix.]

### **4.2 Proposed Diff**
```diff
--- a/bible/chapters/chapter_03.md
+++ b/bible/chapters/chapter_03.md
@@ -10,3 +10,4 @@
```

---

## **5. Verification & Canonical Merge Gate (`[STAGE 4: CANONICAL_MERGE]`)**

* [ ] **Automated Test Added:** Unit test in `simone/test/` or `habitat/test_habitat_specs.py` verifying the patch.
* [ ] **Monte Carlo Confirmation:** 10,000 runs in `Simone.jl` confirming stability.
* [ ] **Genesis Lock Hash Updated:** Target article SHA-256 updated.
