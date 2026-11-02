# **MHU BILL OF MATERIALS & LEONTIEF PHYSICAL ACCOUNTING (`habitat/bom/`)**

> **6-Level Open-BIM Material Schedule & Shearing-Layer Replacement Audit.**  
> **Author:** Kyberlex (`kyberlex@proton.me`) | **Pillar:** 4A & 4B  
> **License:** AGPL-3.0-or-later

---

## **1. Purpose & Structure**

All material bills in `habitat/bom/` link the physical engineering of the **Modular Habitat Unit (MHU)** directly to the biophysical input-output sectors in [`simone/data/leontief_14sector_matrix.json`](../../simone/data/leontief_14sector_matrix.json).

### **Files in this Directory**
1. [`mhu_bom_6_levels.csv`](mhu_bom_6_levels.csv): Master 6-level Work Breakdown Structure (WBS) comparing the MHU hybrid C24 + 18mm birch nodal gusset chassis against a pure CNC cassette baseline (WikiHouse Skylark), arranged across the 6 building levels:
   - **Level 1:** Reversible Helical Pile Foundations & Ground Docking (`100+ yr` lifespan)
   - **Level 2:** Primary Structural Timber Chassis & Nodal Gussets (`80–100 yr` lifespan)
   - **Level 3:** Passivhaus Wood-Fiber Thermal Envelope & Triple Glazing (`40–60 yr` lifespan)
   - **Level 4:** Accessible $800 \times 800\text{ mm}$ Utility Spine & Hydronic Core (`30–50 yr` lifespan)
   - **Level 5:** Modular Energy Storage, Solar MPPT & DC/AC Conversion (`10–20 yr` lifespan)
   - **Level 6:** Replaceable DIN-Rail Telemetry & Interior Fit-Out (`7–15 yr` electronics / `30 yr` joinery)
2. [`utility_spine_800x800_bom.csv`](utility_spine_800x800_bom.csv): Sub-component schedule for the $800 \times 800\text{ mm}$ Utility Spine, explicitly tagging each item as either **50-Year Passive Analog Core** or **Replaceable DIN-Rail Module**.
3. [`validate_bom.py`](validate_bom.py): Zero-dependency verification script auditing cost conservation, mass totals, and shearing-layer service lifespans.

---

## **2. Running the BOM Verification Script**

```bash
python3 habitat/bom/validate_bom.py
```

