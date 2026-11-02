# **O.N.E. SEED NODE FIELD BLUEPRINTS (`roadmap/blueprints/`)**

> **Stage-by-Stage Operational Field Guides for Bootstrapping Bioregional Seed Nodes.**  
> **Author:** Kyberlex (`kyberlex@proton.me`) | **Pillar Alignment:** Pillars 1, 2, 4A, 4B  
> **License:** AGPL-3.0-or-later / CC-BY-SA 4.0

---

## **1. Progressive Deployment Architecture (Stages 0 to 3)**

Every blueprint in this directory translates the macro-transition timeline of [`roadmap/roadmap.md`](../roadmap.md) and the biophysical sizing model [`roadmap/calculate_seed_node_metabolism.py`](../calculate_seed_node_metabolism.py) into actionable field instructions:

| Blueprint File | Transition Stage | Target Population & Scope | Key Deliverables |
| :--- | :--- | :--- | :--- |
| [`SITE_DUE_DILIGENCE_CHECKLIST.md`](SITE_DUE_DILIGENCE_CHECKLIST.md) | **Pre-Stage 0** | Land Scouting ($5 - 50\text{ ha}$) | Quantitative scoring matrix for hydrogeology, solar yield, zoning, and soil fertility. |
| [`SEED_NODE_CANDIDATE_REGISTRY.md`](SEED_NODE_CANDIDATE_REGISTRY.md) | **Stage 0** | 5 Orthogonal Biomes (`NODE-01`..`05`) | Comparative climatic, legal, and metabolic parameters across 5 reference regions. |
| [`STAGE_0_LEGAL_INCEPTION_BLUEPRINT.md`](STAGE_0_LEGAL_INCEPTION_BLUEPRINT.md) | **Stage 0** | $15 - 50$ Pioneers | Community Land Trust (CLT) / Swiss Verein asset-lock + usufruct lease covenants. |
| [`STAGE_1_SURVIVAL_CORE_BLUEPRINT.md`](STAGE_1_SURVIVAL_CORE_BLUEPRINT.md) | **Stage 1** | $50 - 150$ Residents | $40,000\text{ L}$ cisterns, solar microgrid, Passivhaus MHU clusters, 180-day calorie buffer. |
| [`STAGE_2_FABLAB_METABOLIC_BLUEPRINT.md`](STAGE_2_FABLAB_METABOLIC_BLUEPRINT.md) | **Stage 2** | $150 - 500$ Residents | CNC timber mill, air-gapped machine shop, reed-bed greywater loop, thermophilic compost. |
| [`STAGE_3_WATERSHED_FEDERATION_BLUEPRINT.md`](STAGE_3_WATERSHED_FEDERATION_BLUEPRINT.md) | **Stage 3** | $500 - 5,000+$ Federated | Reticulum LoRa mesh, bilateral non-monetary exergy clearing, odd-parity sortition councils. |
| [`SEED_NODE_QUICKSTART_HANDBOOK.md`](SEED_NODE_QUICKSTART_HANDBOOK.md) | **All Stages** | Field Coordinators | Condensed operational checklist from Day 1 land acquisition to full metabolic closure. |

---

## **2. Parametric Metabolic Sizing Command**

Before acquiring land or sizing cisterns/solar arrays, run the metabolic calculator for your target population and biome:

```bash
python3 roadmap/calculate_seed_node_metabolism.py --pop 50 --biome NODE-01
```

