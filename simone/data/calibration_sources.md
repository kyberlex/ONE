# **SIMONE DATA CALIBRATION SOURCES & EMPIRICAL LITERATURE REGISTRY**

**Document ID:** `simone/data/calibration_sources.md`  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 1 (Biophysical & Leontief Economics) & Pillar 3 (`Simone.jl` Co-Simulation)  
**License:** AGPL-3.0-or-later / CC-BY-SA 4.0

---

## **1. Purpose & Empirical Grounding Rule**

Every parameter in `simone/data/leontief_baseline_matrix.json` and `simone/data/archetypes/*.json` represents a measurable physical quantity (`kWh`, `L`, `kcal`, `kg`, `hours`). No synthetic "game tokens" or arbitrary utility weights are permitted.

This document records the baseline literature sources and defines the **8×8 Disaggregation Schema** prepared for **Proof-of-Work Challenge 1A (`PoW 1A`)**.

---

## **2. Baseline Parameter Provenance (`leontief_baseline_matrix.json`)**

| Sector / Parameter | Baseline Value | Physical Unit | Primary Empirical Reference |
| :--- | :--- | :--- | :--- |
| **Tier 1 Exergy Subsistence ($d_1$)** | $5.0$ | $\text{kWh / person / day}$ | Passivhaus Institut (PHI) Primary Energy Renewable (PER) standard + MHU 48V DC Domestic Bus audit (`habitat/PASSIVHAUS_ENERGY_SYSTEMS.md`). |
| **Tier 1 Water Subsistence ($d_2$)** | $150.0$ | $\text{L / person / day}$ | WHO *Domestic Water Quantity, Service Level and Health* ($100\text{ L/day}$ domestic potable/hygiene + $50\text{ L/day}$ closed-loop aeroponic/garden makeup). |
| **Tier 1 Caloric Subsistence ($d_3$)** | $2,500.0$ | $\text{kcal / person / day}$ | FAO / WHO / UNU *Human Energy Requirements* (moderate physical activity baseline including 5–7 hrs/wk metabolic floor). |
| **Tier 2 FabLab & Telemetry ($d_4$)** | $2.0$ | $\text{machine-or-core-h / day}$ | Open-Hardware CNC / 3D printer spare-parts replacement duty cycle + local `ESP32`/`Simone.jl` edge compute allocation. |
| **Water-to-Exergy Coefficient ($A_{2,1}$)** | $0.15$ | $\text{L / kWh}$ | PV panel washing, micro-hydro / thermal buffer makeup, and LFP battery manufacturing embodied water amortized over 6,000 cycles (Ecoinvent v3.9). |
| **Exergy-to-Water Coefficient ($A_{1,2}$)** | $0.002$ | $\text{kWh / L}$ | Submersible 48V DC helical borehole pump at $45\text{ m}$ total dynamic head ($\eta = 62\%$) + low-pressure UV-C LED disinfection ($0.4\text{ kWh/m}^3$). |
| **Water-to-Biomass Coefficient ($A_{2,3}$)** | $0.012$ | $\text{L / kcal}$ | Hybrid closed-loop greenhouse/aeroponics ($90\%$ transpiration recovery) blended with mulched syntropic agroforestry (FAO Irrigation & Drainage Paper 56). |
| **Weibull Solar MPPT ($\beta, \eta$)** | $k = 2.4,\ \lambda = 65,000\text{ h}$ | $\text{hours}$ | NREL *Photovoltaic Inverter Reliability and Power Electronics MTBF Field Data* (electrolytic film capacitor & MOSFET thermal cycling). |
| **Weibull Borehole Pump ($\beta, \eta$)** | $k = 2.1,\ \lambda = 42,000\text{ h}$ | $\text{hours}$ | Grundfos / IEC 60034 submersible brushless DC motor bearing & mechanical seal wear curves under grit filtration. |

---

## **3. The 5 Orthogonal Seed Node Biome Calibrations (`simone/data/archetypes/`)**

| Archetype File | Köppen Zone | Solar Insolation ($\text{kWh/m}^2/\text{day}$) | Annual Precip ($\text{mm/yr}$) | Winter Design Temp ($^\circ\text{C}$) | Primary Stress Vector Tested in `Simone.jl` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`node01_oceanic_galicia.json`](archetypes/node01_oceanic_galicia.json) | `Cfb` (Oceanic) | $3.6$ | $1,450$ | $+2.0^\circ\text{C}$ | Prolonged winter overcast (solar lull) + high relative humidity vapor drive. |
| [`node02_montane_andes.json`](archetypes/node02_montane_andes.json) | `Cwb` (Subtropical Highland) | $5.8$ | $820$ | $-4.0^\circ\text{C}$ | High diurnal $\Delta T$, seismic lateral shear, and dry-season aquifer drawdown. |
| [`node03_tropical_monsoon.json`](archetypes/node03_tropical_monsoon.json) | `Am` (Tropical Monsoon) | $4.9$ | $2,600$ | $+19.0^\circ\text{C}$ | Extreme monsoon deluge vs. dry-season cistern sizing & biological fouling. |
| [`node04_equatorial_rift.json`](archetypes/node04_equatorial_rift.json) | `Aw` (Tropical Savanna) | $6.1$ | $680$ | $+14.0^\circ\text{C}$ | Multi-month hydrological drought shock & high evapotranspiration ($ET_0$). |
| [`node05_continental_ozarks.json`](archetypes/node05_continental_ozarks.json) | `Dfa` (Humid Continental) | $4.5$ | $1,120$ | $-22.0^\circ\text{C}$ | Polar vortex deep freeze ($< 2^\circ\text{C}$ LFP BMS charge lockout & reed-bed frost diversion). |

---

## **4. Open Proof-of-Work Schema: 8×8 Sector Disaggregation (`PoW 1A`)**

Prospective **Pillar 1 Collaborators & Co-Stewards** tackling **PoW 1A** ([`stewards/TECHNICAL_PILLARS_COMPACT.md#pillar-1`](../../stewards/TECHNICAL_PILLARS_COMPACT.md)) are invited to expand the 4-sector matrix into the following standardized **8-sector physical table**:

1. `S1_ELECTRICAL_EXERGY` ($\text{kWh/day}$ — 380V/48V DC solar/micro-hydro bus)
2. `S2_THERMAL_EXERGY` ($\text{kWh}_{\text{th}}\text{/day}$ — R290 heat pump, solar thermal & compost heat recovery)
3. `S3_POTABLE_WATER` ($\text{L/day}$ — UV-C / ultrafiltered domestic drinking & cooking loop)
4. `S4_IRRIGATION_GREYWATER` ($\text{L/day}$ — Subsurface reed-bed recycled & rainwater irrigation loop)
5. `S5_STAPLE_CALORIES` ($\text{kcal/day}$ — Field grains, tubers, legumes & oilseeds)
6. `S6_PROTECTED_HORTICULTURE` ($\text{kcal/day}$ — Greenhouse / aeroponic micronutrient & protein greens)
7. `S7_STRUCTURAL_MATERIALS` ($\text{kg/day}$ — C24 timber, birch plywood, S355 steel & lime/clay mass turnover)
8. `S8_FABLAB_SPARE_PARTS` ($\text{machine-hours/day}$ — CNC / 3D print remanufacturing offsetting Weibull wear)


---

## **5. 12-Sector (v1) and 14-Sector (v2) Matrices — Provenance Status (SIM-QA-10 follow-up)**

> [!WARNING]
> **Honest status: ILLUSTRATIVE — uncalibrated.** No entry in `leontief_12sector_matrix.json` or `leontief_14sector_matrix.json` has a documented empirical source. They are internally consistent scenario values chosen to exercise the code paths (Hawkins-Simon, matrix-aware `L_min`, Art. 3.1.6 audit). Do not quote them as properties of any real site.

### 5.1 Files

| File | Status | Use |
| :--- | :--- | :--- |
| `leontief_12sector_matrix.json` (v1.0.0) | **Frozen.** Audited input of SIM-QA-10; kept byte-identical in its numbers so `benchmarks/sim_qa_10_embargo.jl` stays reproducible. | Historical / regression |
| `leontief_14sector_matrix.json` (v2.0.0) | **Current.** Superset of v1: block `A[0:11, 0:11]` is identical to v1 (enforced by `test/test_autarkic_closure.jl`). | `load_leontief_model`, `autarkic_closure_audit` |

### 5.2 v2 changes and their provenance

| Item | Value(s) | Provenance |
| :--- | :--- | :--- |
| A, sectors 0–11 (144 coefficients) | copied from v1 | **No documented source** (ILLUSTRATIVE). Known issue: irrigation water appears both as final demand (450 L/person/day) and as an intermediate input to food (0.35 L/kcal), so it may be double counted (SIM-QA-10 §3.4.5). |
| Shelter re-tag | `timber_structural_kg` → Tier 1 | Constitutional mapping (Art. 3.3: "secure residential shelter" is Tier 1). Not a calibration. |
| New sector 12 `healthcare_care_h` (Tier 1) | inputs per care-hour: 2.5 kWh elec, 1.5 kWh heat, 60 L potable water, 0.05 kg timber, 0.02 kg basalt/steel, 0.5 core-h, 0.05 FabLab-h, 0.2 kg secondary materials, 0.05 maintenance-h; final demand 0.05 care-h/person/day (≈ 18 h/person/year) | **ILLUSTRATIVE — uncalibrated.** Order of magnitude only. Pharmaceuticals are folded into this sector's import dependence, not modeled as a separate good. |
| New sector 13 `discretionary_t3_h` (Tier 3) | inputs per project-hour: 0.8 kWh elec, 0.3 kWh heat, 2 L water, 0.4 kg timber, 0.15 kg basalt/steel, 0.3 core-h, 0.25 FabLab-h, 0.3 kg secondary materials, 0.02 maintenance-h; final demand 0.5 h/person/day | **ILLUSTRATIVE — uncalibrated.** Exists so the "Tier 3 is cut first" property of `L_min` can be exercised. |
| Rows 12–13 | zero | Modeling choice: healthcare and Tier 3 output are not intermediate inputs. Consequence: ρ(A) and det(I−A) are unchanged from v1 (0.1523, 0.9541). |
| `import_dependence_m` | 0.00–0.95 per sector | **ILLUSTRATIVE.** Sectors 0–11 reuse the SIM-QA-10 "central" scenario assumption; healthcare 0.60 and Tier 3 0.50 are new assumptions. |
| `installed_capacity_per_day` | ≈ 1.25 × baseline gross output, rounded | **ILLUSTRATIVE.** Derived from the model itself, not from a surveyed installation. |
| `primary_resources` | renewable water 450,000 L/day; arable land 300,000 m²; woodland 200,000 m² | **ILLUSTRATIVE — order of magnitude.** Land coefficients assume typical temperate yields (~1,000 kcal/m²/yr staples, ~3 kg/m²/yr vegetables, ~2.25 t/ha/yr timber increment); raw-water coefficient 1.15 L per L potable assumes 15% treatment loss. Not site data. |
| `reserve_form` | `storable_stock` / `spare_parts` / `redundant_capacity` | Classification for Art. 3.5.2 at a 12–24-month horizon (e.g. electricity, heat, water and fresh produce cannot be stocked for a year and must be covered by redundant import-free capacity). Healthcare is classed as `storable_stock` (critical pharmaceuticals, listed in Art. 3.5.2), a simplification. |

### 5.3 What the illustrative audit shows

With the illustrative import-dependence vector, the Art. 3.1.6 audit **fails** (reserve margin ≈ −0.49, deliverable Tier 1 fraction ≈ 0.51; binding: electricity, heat, potable water, staples, fresh produce, healthcare). With all external inputs available, it passes with margin ≈ +0.10 (binding resource: arable land). These numbers demonstrate the procedure only. Reproduce with `julia --project=simone simone/examples/run_autarkic_closure_audit.jl`.

### 5.4 Calibration needed (open)

1. Measured input coefficients for every non-zero entry of A (Ecoinvent, FAO, utility data), with units audited.
2. Site-specific installed capacity and import-dependence surveys (bill of materials per asset, share of consumables and parts sourced externally).
3. Seasonal profiles (the audit is static per day) and Weibull-driven capacity decay over the reserve horizon.
