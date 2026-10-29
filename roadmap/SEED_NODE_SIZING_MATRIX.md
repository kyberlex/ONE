# **O.N.E. SEED NODE SIZING & CAPEX MATRIX (`roadmap/SEED_NODE_SIZING_MATRIX.md`)**

> **Biophysical Scaling, Thermodynamic Sizing & Capital Discipline Across 5 Planetary Biomes.**  
> **Author Persona:** Kyberlex (`kyberlex@proton.me`) | **Repository:** [`https://github.com/kyberlex/ONE`](https://github.com/kyberlex/ONE)  
> **Pillars:** **Pillar 1** (Biophysical Economics), **Pillar 2** (Sortition), **Pillar 4** (Habitat & Microgrid)  
> **Tool:** Interactive CLI script [`roadmap/calculate_seed_node_metabolism.py`](calculate_seed_node_metabolism.py)  
> **Licenses:** AGPL-3.0-or-later & CC-BY-SA 4.0

---

## **1. Purpose & Methodological Framework**

A pioneer commons settlement cannot rely on vague utopian ideals. Every physical Seed Node requires exact, closed-loop mass and energy balances calibrated to its local bioregional climate (Köppen classification).

This document establishes the canonical sizing matrix across the **4 Population Scales**:
1. **Founder Core ($N = 15$):** Initial legal shield, exploratory land stewardship, and Stage 0 inception.
2. **Micro-Village ($N = 50$):** Functional food & energy autonomy, first Passivhaus cluster, 15-juror sortition council.
3. **Dunbar Cohort ($N = 150$):** The classic human organic coordination scale; internal FabLab machine shop and full biological recycling.
4. **Full Watershed Seed Node ($N = 300$):** Complete biophysical baseline matching the `Simone.jl` 4-layer co-simulation standard and 101-juror sortition assembly.

---

## **2. Bioregional Metabolic Benchmark Matrix (Scales $N = 50$, $150$, $300$)**

| Biome & Archetype Code | Scale ($N$) | MHU Units ($54\text{ m}^2$) | Solar PV ($\text{kWp}$) | LFP Storage ($\text{kWh}$) | Cistern Buffer ($\text{Liters}$) | Agroforestry ($\text{ha}$) | Est. CapEx (EUR) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`NODE-01` Oceanic Galicia**<br>*(Atlantic Temperate — `Cfb`)* | 50<br>150<br>300 | 25<br>75<br>150 | 86.7<br>260.0<br>520.0 | 780.0<br>2,340.0<br>4,680.0 | 225,000<br>675,000<br>1,350,000 | 2.96<br>8.88<br>17.77 | €2,296,657<br>€6,865,970<br>€13,719,941 |
| **`NODE-02` Montane Andes**<br>*(Highland Subtropical — `Cwb`)* | 50<br>150<br>300 | 25<br>75<br>150 | 70.4<br>211.2<br>422.3 | 915.0<br>2,745.0<br>5,490.0 | 450,000<br>1,350,000<br>2,700,000 | 3.91<br>11.74<br>23.48 | €2,407,823<br>€7,199,468<br>€14,386,937 |
| **`NODE-03` Tropical Monsoon**<br>*(Western Ghats — `Am`)* | 50<br>150<br>300 | 25<br>75<br>150 | 40.0<br>120.0<br>240.0 | 450.0<br>1,350.0<br>2,700.0 | 600,000<br>1,800,000<br>3,600,000 | 2.28<br>6.85<br>13.70 | €2,252,812<br>€6,734,438<br>€13,456,875 |
| **`NODE-04` Equatorial Rift**<br>*(East African Rift — `Aw`)* | 50<br>150<br>300 | 25<br>75<br>150 | 38.9<br>116.7<br>233.3 | 525.0<br>1,575.0<br>3,150.0 | 375,000<br>1,125,000<br>2,250,000 | 2.74<br>8.22<br>16.44 | €2,203,472<br>€6,586,417<br>€13,160,833 |
| **`NODE-05` Continental Ozarks**<br>*(Four-Season Continental — `Dfa`)* | 50<br>150<br>300 | 25<br>75<br>150 | 109.8<br>329.3<br>658.5 | 1,125.0<br>3,375.0<br>6,750.0 | 300,000<br>900,000<br>1,800,000 | 3.32<br>9.96<br>19.92 | €2,467,068<br>€7,377,204<br>€14,742,407 |

---

## **3. Per-Capita Economic Efficiency & Transition Mechanics**

Notice the structural capital efficiency:
- **Average Total Capital per Resident:** **€44,000 – €49,000**.
- **What this capital purchases unconditionally:**
  1. Permanent Passivhaus modular home ($54\text{ m}^2$ per 2 adults, €72,690 BOM L6).
  2. 3-day islanded LFP battery storage vault + rooftop PV microgrid.
  3. Continuous gravity-fed drinking water filtration and historic drought buffer cistern.
  4. Vertical subsurface reed bed phytodepuration treating 100% of black/greywater.
  5. Bio-intensive agroforestry and perennial food nursery land.
  6. Swiss legal trust asset lock ([`foundation/statutes_foundation_one.md`](../foundation/statutes_foundation_one.md)) permanently exempting the land from rent and property speculation.
- **Comparison to Legacy Real Estate:** In modern Western metropolitan areas, €46,000 is barely enough for a 10% mortgage down-payment on an extractive, energy-inefficient suburban apartment. Within O.N.E., the exact same sum achieves 100% debt-free thermodynamic and habitat sovereignty.

---

## **4. Demarchic Governance Sizing Rules**

| Population ($N$) | Statutory Governance Tier | Sortition Jury ($n$) | 75% Supermajority Quorum | Jurisdiction & Authority |
| :---: | :--- | :---: | :---: | :--- |
| **$N \le 30$** | Pioneer Cohort / Direct Assembly | **3** | **3 of 3** | Mediation, chore scheduling, local safety protocols. Zero legislative powers. |
| **$30 < N \le 100$** | Neighborhood Commons Council | **15** | **12 of 15** | Resource prioritization, harvest allocations, usufruct dispute arbitration. |
| **$N > 100$** | Bioregional Seed Assembly | **101** | **76 of 101** | Statutory covenants, External Trade Airlock (ETI) quotas, inter-node exergy swaps. |

---

## **5. How to Run the Parametric Calculator**

The sizing tool is zero-dependency and executable in any Python 3 environment:

```bash
# Calculate sizing for a specific population and biome
python3 roadmap/calculate_seed_node_metabolism.py --pop 150 --biome NODE-01

# Display full benchmark table across all biomes
python3 roadmap/calculate_seed_node_metabolism.py --all
```
