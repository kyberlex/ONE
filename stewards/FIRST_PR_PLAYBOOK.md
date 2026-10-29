# **O.N.E. FIRST PULL REQUEST PLAYBOOK (`stewards/FIRST_PR_PLAYBOOK.md`)**

> **Zero-Friction Guide for Incoming Co-Stewards, Open Collaborators, and External Critics.**  
> **Author Persona:** Kyberlex (`kyberlex@proton.me`) | **Canonical Repository:** [`https://github.com/kyberlex/ONE`](https://github.com/kyberlex/ONE)  
> **Governing Rule:** *Earned by Delivery, Never Closed on Promises*  
> **Licenses:** AGPL-3.0-or-later (Code & Hardware) / CC-BY-SA 4.0 (Documents)

---

## **1. Welcome: How Contributions Work**

Open Networked Earth (O.N.E.) welcomes code, mathematical proofs, CAD drawings, smart-home YAML packages, and legal instruments. There are no preliminary screening interviews or bureaucratic gates.

You move from **curious observer** to **Open Collaborator** (and eventually **Lead Co-Steward**) simply by shipping a verified Proof-of-Work deliverable.

---

## **2. 5-Minute Local Setup**

### **Clone the Repository:**
```bash
git clone https://github.com/kyberlex/ONE.git
cd ONE
```

### **Run Local Verification Suites:**
Verify that your local environment matches canonical baseline standards:

```bash
# 1. Run the Habitat & CAD verification suite (zero extra dependencies)
python3 habitat/test_habitat_specs.py

# 2. Run the full Pillars & OpSec readiness audit gate
python3 scripts/verify_pillars_readiness.py
```

If you are contributing to Julia co-simulation (`simone/`):
```bash
# Activate and test Simone.jl
julia --project=simone -e 'using Pkg; Pkg.instantiate(); Pkg.test()'
```

---

## **3. The 3-Step First PR Workflow**

### **Step 1: Pick a Bounded Proof-of-Work (PoW) Task**
Consult [`stewards/TECHNICAL_PILLARS_COMPACT.md`](TECHNICAL_PILLARS_COMPACT.md) or [`stewards/PILLAR_0_STEWARD_COMPACT.md`](PILLAR_0_STEWARD_COMPACT.md):
- **Pillar 0:** Community curation, moderation scripts, or developer outreach pipelines.
- **Pillar 1:** Expand Leontief matrices or stress-test non-monetary $L_{\min}$ rationing.
- **Pillar 2:** Swiss ZGB legal edge-cases or sortition state machine extensions.
- **Pillar 3:** Multi-rate stiff solvers, agent heterogeneity, or REA adapter integration.
- **Pillar 4A:** Parametric FreeCAD macros, IFC4 BIM models, or Glaser hygrothermal audits.
- **Pillar 4B:** Local Home Assistant / ESPHome configs, Modbus BMS registers, or DC schematics.
- **Track B (Senior Critic):** Pick any module from [`stewards/CRITIC_BRIEFING_PACK.md`](CRITIC_BRIEFING_PACK.md) and demonstrate a failure mode!

### **Step 2: Create a Feature Branch & Implement**
```bash
git checkout -b feature/pow-<pillar>-<topic>
# Example: git checkout -b feature/pow-4a-ifc-export
```

Ensure your commit adheres to the **Inviolable Class-0 Hard Constraints**:
1. **100% Non-Commercial:** No proprietary licenses, paid API dependencies, or paywalls.
2. **Zero-Leak OpSec:** No personal home directory paths (`/Users/...`), personal names, or local IPs. Public attribution is Kyberlex / Foundation ONE.
3. **English-Only:** Canonical documentation and code comments in English (bilingual DE/EN allowed only for Swiss legal filings).

### **Step 3: Open Your Pull Request**
- Push your branch to your fork on GitHub.
- Open a Pull Request using the pre-configured PR template.
- Our automated GitHub Actions (`pillars_readiness_ci.yml` and `simone_ci.yml`) will verify your code automatically.
- Upon merge, your name or pseudonym is added permanently to [`stewards/ROSTER_AND_LEDGER.md`](ROSTER_AND_LEDGER.md).

---

## **4. Quick Reference Directory Map**

| Domain | Key Files & Workspace |
| :--- | :--- |
| **Community & DevRel** | [`stewards/PILLAR_0_STEWARD_COMPACT.md`](PILLAR_0_STEWARD_COMPACT.md), `stewards/CALL_FOR_CO_STEWARDS.md` |
| **Biophysical Economics** | [`simone/src/layer1_leontief.jl`](../simone/src/layer1_leontief.jl), `simone/data/leontief_12sector_matrix.json` |
| **Swiss Law & Sortition** | [`foundation/`](../foundation/), `simone/src/layer3_sortition.jl` |
| **Julia Co-Simulation** | [`simone/src/`](../simone/src/), `simone/examples/`, `simone/test/` |
| **Timber CAD & Passivhaus** | [`habitat/cad/`](../habitat/cad/), `habitat/hygrothermal/`, `habitat/bom/` |
| **Zero-Cloud Smart-Home & DC** | [`habitat/automation/`](../habitat/automation/), `habitat/schematics/` |
| **Seed Node Blueprints** | [`roadmap/blueprints/`](../roadmap/blueprints/), `roadmap/roadmap.md` |

For questions or discussion, jump into the [GitHub Discussions Forum](https://github.com/kyberlex/ONE/discussions).

