# **SIM-QA-10 — Hawkins-Simon Viability Under Resource Embargo: Results**

**Author:** Kyberlex (`kyberlex@proton.me`)
**Docket:** `SIM-QA-10` in [`oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md`](../../../oasis/external_critics_round2/CRITIC_ADVERSARIAL_DOCKETS_STAGE2.md)
**Script:** [`simone/benchmarks/sim_qa_10_embargo.jl`](../sim_qa_10_embargo.jl)
**Raw output:** [`sim_qa_10_raw_output.md`](sim_qa_10_raw_output.md) (also appended verbatim at the end of this file)
**Constitutional targets (read only):** Art. 3.1.5, Art. 3.3, Art. 3.5
**License:** AGPL-3.0-or-later

---

## **0. Reproduce**

```bash
cd simone
julia --project=. benchmarks/sim_qa_10_embargo.jl > benchmarks/results/sim_qa_10_raw_output.md
```

Dependencies: `LinearAlgebra`, `Printf` (stdlib) and `JSON3` (already declared in `simone/Project.toml`). Run on Julia 1.13.2. The run is deterministic (no random numbers); runtime is a few seconds after package load.

---

## **1. Verdict**

| Question | Result |
| :--- | :--- |
| Hawkins-Simon conditions on the 12-sector matrix | **PASS.** rho(A) = 0.1523, det(I-A) = 0.9541, all 12 leading principal minors > 0, L = (I-A)^-1 >= 0. The values claimed in the JSON metadata are reproduced exactly. |
| Docket's literal proof requirement ("x >= 0 under a 50% reduction") | **PASS, but tautological.** For any A >= 0 with rho(A) < 1, L = sum A^k >= 0, so x = L d >= 0 for every d >= 0. Cutting d or A by 50% cannot produce negative output. The test cannot fail, so it proves nothing about embargo resilience. |
| Can an embargo be represented in the data? | **No.** The matrix is a closed technology matrix with no import row, no primary-factor row (land, aquifer, solar income, labour pool) and no capacity vector. An embargo has no entry point. |
| Is Tier 1 protected by cutting Tier 3 to zero? | **Not testable.** The 12-sector matrix contains **no Tier 3 sector**. The only possible lever is cutting Tier 2 final demand, which frees little capacity in Tier 1 sectors (Tier 1 already takes 89.9–100% of their output). |
| Maximum embargo depth with Tier 1 fully met | **Entirely determined by assumptions not present in the repository** (import-dependence vector m, spare capacity h). Range across tested scenarios: **e\* = 0** (no spare capacity, any import dependence in Tier 1 sectors) to **e\* = 1.0** (Tier 1 sectors fully autarkic). Central scenario: e\* = 0 at h = 0; e\* = 0.667 at h = 0.25. |
| Do Art. 3.5 strategic reserves bridge the gap? | **Not with the listed reserve types.** In every infeasible case the binding gaps include district heat, water and fresh produce, which a grain/staple reserve cannot substitute. A staple-only reserve bridges **0** of the tested infeasible cases. |

**Overall verdict: `RED_WINS`** on the docket's proof standard and on the constitutional claim as it stands. Hawkins-Simon viability is a necessary condition for a productive economy. It is **not** evidence of embargo resilience. The quantitative embargo question is **unfalsifiable at current data quality**, because the result swings from total failure to total success depending on two parameter sets (import dependence, spare capacity) that do not exist in the repository.

---

## **2. Method**

### 2.1 Hawkins-Simon and baseline output
`A` comes from `simone/data/leontief_12sector_matrix.json`. Final demand is `d = per_capita_daily_tier1_baseline × N` with N = 300. Gross output is `x = (I-A)^-1 d`.

| idx | sector | JSON tier | d (per day) | x (per day) | Tier-1 share of x |
|---|---|---|---|---|---|
| 0 | exergy_elec_kwh | 1 | 1,350 | 2,405.21 | 0.8994 |
| 1 | thermal_heat_kwh | 1 | 1,140 | 1,457.25 | 0.9923 |
| 2 | water_potable_l | 1 | 15,000 | 15,102.76 | 0.9998 |
| 3 | water_agri_l | 1 | 135,000 | 371,390 | 0.9992 |
| 4 | food_staple_kcal | 1 | 630,000 | 660,830 | 0.9987 |
| 5 | food_fresh_kg | 1 | 255 | 255.00 | 1.0000 |
| 6 | timber_structural_kg | 2 | 45 | 45.00 | 0.0000 |
| 7 | basalt_mineral_kg | 2 | 24 | 27.96 | 0.0021 |
| 8 | electronics_compute_ch | 2 | 450 | 552.07 | 0.0422 |
| 9 | fablab_machining_h | 2 | 75 | 79.12 | 0.0146 |
| 10 | circular_scrap_kg | 2 | 360 | 514.70 | 0.2813 |
| 11 | preventive_maint_h | 1 | 120 | 205.52 | 0.9731 |

"Tier-1 share of x" is `(L f1)_j / x_j`, where `f1` keeps baseline demand on the JSON Tier-1 sectors and sets every other sector to zero. Tier 1 also draws on Tier-2 sectors through intermediate use: 28% of circular scrap, 4.2% of compute, 1.5% of FabLab hours.

### 2.2 Embargo modeling choice (documented assumption)
The matrix does not represent imports, so the embargo is modeled as a **capacity cap**:

```
c_j = x_base_j · (1 + h) · (1 − e · m_j)
```

- `e` is the embargo depth (0.30, 0.50, 0.60, 0.80, plus a bisection for e\*).
- `m_j` is the **assumed** fraction of sector j's capacity that depends on external supply: replacement parts, consumables, feedstock.
- `h` is spare capacity above baseline: 0 or 0.25.

The **central `m` vector is an assumption, not data**: electricity 0.40, heat 0.30, potable water 0.20, irrigation water 0.20, staples 0.30, fresh produce 0.30, timber 0.10, basalt/steel 0.80, electronics 0.95, FabLab 0.60, circular scrap 0.00, maintenance labour 0.00. Sensitivity scenarios: low (0.5×), high (min(1, 1.5×)), uniform (m = 1), and Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere).

### 2.3 Feasibility criterion (exact, no LP needed)
L >= 0, so any x >= 0 with (I-A)x >= f satisfies x >= L f. Final demand f is therefore producible under caps c **iff** L f <= c. The largest deliverable uniform fraction of f is `alpha = min_j c_j / (L f)_j`. Infeasible sectors are those with `(L f)_j > c_j`.

### 2.4 Reserves
- **Staple-only reserve (Art. 3.5 grains/preserved staples):** find the smallest daily draw r of stored staple kcal such that `L(f1 − r·e_staple) <= c`. It is "not bridgeable" if any binding sector has no input pathway through staples, or if r would exceed staple demand. The reserve is sized at 12 or 24 months of Tier-1 staple final demand (2.2995e8 kcal per 12 months ≈ 65,700 kg grain at 3,500 kcal/kg).
- **Full-basket reserve (optimistic upper bound):** assumes 12/24 months of *every* Tier-1 final good is held in store, including heat, water and fresh produce. Drawing `(1 − alpha) f1` per day makes the rest producible, so the reserve lasts `365/(1 − alpha)` or `730/(1 − alpha)` days.

---

## **3. Key Results**

### 3.1 Tier-1-only alpha (all non-Tier-1 final demand cut to zero)

| m scenario | h | e = 0.30 | e = 0.50 | e = 0.60 | e = 0.80 | e\* (max depth, Tier 1 fully met) |
|---|---|---|---|---|---|---|
| low | 0 | 0.9550 | 0.9250 | 0.9100 | 0.8800 | 0.0000 |
| central | 0 | 0.9100 | 0.8500 | 0.8200 | 0.7560 | 0.0000 |
| high | 0 | 0.8650 | 0.7750 | 0.7116 | 0.5781 | 0.0000 |
| uniform | 0 | 0.7000 | 0.5000 | 0.4000 | 0.2000 | 0.0000 |
| Tier-1 autarky | 0 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 (0.0000 if shelter/timber is added to Tier 1) |
| low | 0.25 | 1.1938 | 1.1562 | 1.1375 | 1.1000 | 1.0000 |
| central | 0.25 | 1.1375 | 1.0625 | 1.0250 | 0.9450 | 0.6667 |
| high | 0.25 | 1.0813 | 0.9688 | 0.8894 | 0.7227 | 0.4444 |
| uniform | 0.25 | 0.8750 | 0.6250 | 0.5000 | 0.2500 | 0.2000 |
| Tier-1 autarky | 0.25 | 1.2500 | 1.2500 | 1.2500 | 1.2500 | 1.0000 |

At the docket's headline depth (**e = 0.60**), Tier 1 is fully met only if spare capacity exists (h = 0.25) **and** import dependence is at or below the central assumption, or if Tier-1 sectors are autarkic. Binding sectors are fresh produce (no slack, m = 0.30) and, at deep embargo, electricity.

### 3.2 Reserves
- **Staple-only reserve:** "not bridgeable" in **every** infeasible case. District heat always appears in the gap, and heat has no staple input pathway in A. Water and fresh produce gaps behave the same way.
- **Full-basket reserve (upper bound, assumes heat/water/fresh produce are storable):** central, h = 0, e = 0.60 → 2,028 / 4,056 days. Uniform, h = 0, e = 0.80 → 456 / 912 days. Only an all-good stockpile covers the 12–24 month horizon, and that stockpile is not physically realistic for fresh produce and district heat.
- **Energy-buffer clause:** Tier-1 gross electricity requirement is 2,163.34 kWh/day. Covering it from storage for 12 months needs 7.90e5 kWh (1.58e6 kWh for 24 months) for 300 people. That is several orders of magnitude beyond any plausible stationary battery bank. The reading "battery buffers support 12–24 months of Tier 1" is physically implausible. Energy resilience must come from embargo-proof *generation and repair capacity*, not storage.

### 3.3 Substitution-penalty test
An embargo may force less efficient local substitutes, i.e. coefficients rise. The whole matrix tolerates a uniform penalty of k\* = 1/rho = **6.57×** before Hawkins-Simon fails. Per-row tolerances are 33× (electricity row), 62× (staple-food row), 62× (maintenance-labour row), and larger for the others. Hawkins-Simon collapse is therefore **not** the realistic failure mode; capacity loss is.

### 3.4 Structural defects found
1. **No primary-factor or import rows.** Art. 3.1.4 replenishment ceilings and any embargo are invisible to the model. In a closed matrix, output scales without limit as d grows.
2. **No Tier 3 sector.** The L_min promise "Tier 3 is cut first" cannot be exercised.
3. **Tier mapping mismatch with Art. 3.3.** "Secure residential shelter" is Tier 1 in the constitution, but the matching sector (timber) is tagged Tier 2 in the JSON. **Healthcare and pharmaceuticals have no sector at all.** `preventive_maint_h` is machine maintenance, not healthcare. Adding shelter to Tier 1 drops e\* from 1.0 to 0.0 in the h = 0 autarky scenario.
4. **Coded L_min is scalar.** `lexicographic_allocate` in `simone/src/layer1_leontief.jl` allocates one stock across three tier demands and never consults A. Allocating final Tier-1 goods without reserving their intermediate inputs under-counts requirements by 1.60× (electricity), 1.27× (heat), 2.75× (irrigation water) and 1.67× (maintenance labour).
5. **Two inconsistent demand baselines.** The 4-sector file uses 5.0 kWh, 150 L and 2,500 kcal per person per day; the 12-sector file uses 4.5 kWh, 50 L potable + 450 L irrigation, and 2,100 kcal. Irrigation appears both as final demand (450 L/person) and as intermediate input to food (0.35 L/kcal), which risks double counting.
6. **Calibration status.** `simone/data/calibration_sources.md` documents provenance only for the **4-sector** matrix (three coefficients and the demand vector). The 12-sector coefficients have **no documented provenance** and should be treated as **illustrative**.

### 3.5 4-sector cross-check
rho = 0.1207, det(I-A) = 0.7862, Hawkins-Simon passes. Under a uniform capacity cap with no spare capacity, Tier-1 alpha equals exactly 1 − e (0.70 / 0.50 / 0.40 / 0.20), so e\* = 0.

---

## **4. Limitations**
- The `m` (import dependence) and `h` (spare capacity) vectors are **assumptions**. The conclusions are about the *structure* of the claim, not about any real site.
- The model is static and single-period. It has no inventories, no Weibull degradation of installed capital under a parts embargo (capacity loss would grow over time), no substitution between sectors, and no seasonal profile. A dynamic version should link `m_j` to cumulative unreplaced failures `1 − R(t)` from the Weibull functions already in `layer1_leontief.jl`.
- The uniform-fraction metric alpha is conservative for non-uniform rationing, but lexicographic Tier-1 demand is by definition non-negotiable, so a full-fulfilment criterion (alpha >= 1) is the right test.
- 12-sector coefficients are uncalibrated (see 3.4.6), and units are mixed (kWh, L, kcal, kg, hours). Spectral radius is invariant to unit rescaling, but individual coefficients have not been audited.

---

## **5. Proposed Purple Patch (not merged)**

> **Not merged.** This proposal is for the sortition/O-ASIS pipeline only. The Living Constitution is unchanged.

**Art. 3.1.5 (addendum):**
> Viability of the input-output system shall be demonstrated not only by non-negative gross output, but by a Tier 1 Autarkic Closure: the set of all sectors that directly or indirectly supply Tier 1 needs, including shelter and healthcare, must be able to meet full Tier 1 demand from local primary resources and installed capacity alone, with all external inputs set to zero, at a published reserve margin.

**Art. 3.5.2 (replacement):**
> Strategic Physical Reserves shall be composed according to the gaps identified by the Tier 1 Autarkic Closure audit. They shall combine storable goods with spare parts, consumables and redundant productive capacity sufficient to sustain Tier 1 output for 12–24 months without external inputs. Reserves of goods that cannot be stored shall take the form of reserve capacity.

(≈115 words combined; functional and technology-neutral.)

Recommended engineering follow-ups (non-constitutional):
- add an import/primary-factor row and a capacity vector to the 12-sector JSON;
- add a Tier 3 sector and a healthcare sector, and re-tag shelter as Tier 1;
- replace the scalar `lexicographic_allocate` with a matrix-aware check `L f1 <= c`;
- document coefficient provenance for all 144 entries.

---

## **6. Post-merge status of the engineering follow-ups**

The Purple Patch was later merged as Art. 3.1.6 and Art. 3.5.2. The follow-ups are implemented in SIMONE:
- `simone/data/leontief_14sector_matrix.json` (v2): import-dependence vector, installed capacity, primary resources, healthcare and Tier 3 sectors, shelter re-tagged Tier 1. Values remain **ILLUSTRATIVE — uncalibrated** (`calibration_sources.md` §5); coefficient provenance is still open.
- `autarkic_closure_audit` and the matrix-aware `lexicographic_allocate(A, capacity, d1, d2, d3)` in `simone/src/layer1_leontief.jl`; demo in `simone/examples/run_autarkic_closure_audit.jl`.
- This docket's script still reads the frozen v1 12-sector file. A re-run on Julia 1.10.12 reproduces the raw output exactly; only the Julia version header line differs, so the numbers above are unchanged.

---

## **Appendix — Verbatim script output**

```text
# SIM-QA-10 raw output (generated by simone/benchmarks/sim_qa_10_embargo.jl)

Julia 1.13.2

### Hawkins-Simon check: 12-sector matrix
- dimension: 12x12
- spectral radius rho(A) = 0.1523
- det(I-A) = 0.9541
- leading principal minors of (I-A): min = 0.9541, all > 0: true
- min entry of L=(I-A)^-1 = 0 (numerical zero, |v| < 1e-12) (non-negative: true)
- max substitution penalty k* = 1/rho (A -> k*A stays viable for k < k*): 6.5663

- claimed in JSON: rho = 0.1523, det = 0.954131

### Baseline gross output x = (I-A)^-1 d  (N = 300, per day)

| idx | sector | tier (JSON) | final demand d | gross output x | intermediate share 1-d/x |
|---|---|---|---|---|---|
| 0 | exergy_elec_kwh | 1 | 1350.0000 | 2405.2050 | 0.4387 |
| 1 | thermal_heat_kwh | 1 | 1140.0000 | 1457.2500 | 0.2177 |
| 2 | water_potable_l | 1 | 15000.0000 | 15102.7589 | 0.0068 |
| 3 | water_agri_l | 1 | 1.3500e+05 | 3.7139e+05 | 0.6365 |
| 4 | food_staple_kcal | 1 | 6.3000e+05 | 6.6083e+05 | 0.0467 |
| 5 | food_fresh_kg | 1 | 255.0000 | 255.0000 | 0.0000 |
| 6 | timber_structural_kg | 2 | 45.0000 | 45.0000 | 0.0000 |
| 7 | basalt_mineral_kg | 2 | 24.0000 | 27.9559 | 0.1415 |
| 8 | electronics_compute_ch | 2 | 450.0000 | 552.0746 | 0.1849 |
| 9 | fablab_machining_h | 2 | 75.0000 | 79.1176 | 0.0520 |
| 10 | circular_scrap_kg | 2 | 360.0000 | 514.7001 | 0.3006 |
| 11 | preventive_maint_h | 1 | 120.0000 | 205.5178 | 0.4161 |

All x >= 0: true

### Structural audit
- sectors never used as an input by any sector (zero rows): food_fresh_kg, timber_structural_kg
- primary-factor / import / abiotic-resource rows present in JSON: NONE (closed technology matrix only)
- Tier 3 sectors present: false

### Literal docket test ("50% vector reduction in secondary inputs")
- (a) d -> 0.5 d: min x = 13.9779; x scales exactly by 0.5: true
- (b) A -> 0.5 A: rho = 0.0761, min x = 25.9185
- Both pass trivially: for A >= 0 with rho(A) < 1, L = sum_k A^k >= 0, so x = L d >= 0 for every d >= 0.
  The literal proof requirement therefore cannot fail and carries no information about embargo resilience.

### Substitution-penalty test (one input row i multiplied by k; k at which rho(A) reaches 1)
| row scaled | k* (rho = 1) |
|---|---|
| exergy_elec_kwh | 33.3059 |
| thermal_heat_kwh | > 1e9 (no loop through this row) |
| water_potable_l | 39190.5012 |
| water_agri_l | 935.5298 |
| food_staple_kcal | 62.0042 |
| basalt_mineral_kg | 7136.0100 |
| electronics_compute_ch | 13928.6095 |
| fablab_machining_h | 6557.7869 |
| circular_scrap_kg | 4674.2381 |
| preventive_maint_h | 61.7207 |

### Capacity-cap embargo model
Capacity c_j = x_base_j * (1 + h) * (1 - e * m_j). Tier-1 demand f1 = baseline d on JSON tier-1 sectors, 0 elsewhere.
alpha = largest uniform fraction of f1 deliverable; alpha >= 1 means Tier 1 fully met.

Tier-1 demand share of baseline gross output (L f1)_j / x_j:
- exergy_elec_kwh: 0.8994
- thermal_heat_kwh: 0.9923
- water_potable_l: 0.9998
- water_agri_l: 0.9992
- food_staple_kcal: 0.9987
- food_fresh_kg: 1.0000
- timber_structural_kg: 0.0000
- basalt_mineral_kg: 0.0021
- electronics_compute_ch: 0.0422
- fablab_machining_h: 0.0146
- circular_scrap_kg: 0.2813
- preventive_maint_h: 0.9731

#### Headroom h = 0.0

| m scenario | e | alpha full baseline d | alpha Tier-1 only | binding sector | infeasible sectors (Tier-1 only) | alpha Tier-1 + shelter | staple reserve draw / day (kcal) | 12-mo staple reserve lasts (days) | 24-mo staple reserve lasts (days) | 12-mo / 24-mo full Tier-1 basket reserve lasts (days) |
|---|---|---|---|---|---|---|---|---|---|---|
| low (0.5 x central) | 0.30 | 0.8575 | 0.9550 | food_fresh_kg | thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.9550 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 8111 / 16222 |
| low (0.5 x central) | 0.50 | 0.7625 | 0.9250 | food_fresh_kg | thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.9250 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 4867 / 9733 |
| low (0.5 x central) | 0.60 | 0.7150 | 0.9100 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.9100 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 4056 / 8111 |
| low (0.5 x central) | 0.80 | 0.6200 | 0.8800 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.8800 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 3042 / 6083 |
| central | 0.30 | 0.7150 | 0.9100 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.9100 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 4056 / 8111 |
| central | 0.50 | 0.5250 | 0.8500 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.8500 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 2433 / 4867 |
| central | 0.60 | 0.4300 | 0.8200 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.8200 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 2028 / 4056 |
| central | 0.80 | 0.2400 | 0.7560 | exergy_elec_kwh | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.7536 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 1496 / 2992 |
| high (min(1, 1.5 x central)) | 0.30 | 0.7000 | 0.8650 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.8650 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 2704 / 5407 |
| high (min(1, 1.5 x central)) | 0.50 | 0.5000 | 0.7750 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.7750 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 1622 / 3244 |
| high (min(1, 1.5 x central)) | 0.60 | 0.4000 | 0.7116 | exergy_elec_kwh | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.7093 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 1265 / 2531 |
| high (min(1, 1.5 x central)) | 0.80 | 0.2000 | 0.5781 | exergy_elec_kwh | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.5763 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 865 / 1730 |
| uniform (m = 1 everywhere) | 0.30 | 0.7000 | 0.7000 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, preventive_maint_h | 0.7000 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 1217 / 2433 |
| uniform (m = 1 everywhere) | 0.50 | 0.5000 | 0.5000 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, preventive_maint_h | 0.5000 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 730 / 1460 |
| uniform (m = 1 everywhere) | 0.60 | 0.4000 | 0.4000 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, preventive_maint_h | 0.4000 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 608 / 1217 |
| uniform (m = 1 everywhere) | 0.80 | 0.2000 | 0.2000 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, circular_scrap_kg, preventive_maint_h | 0.2000 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 456 / 912 |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.30 | 0.7150 | 1.0000 | food_fresh_kg | none | 0.9700 | 0 (not needed) | n/a | n/a | n/a |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.50 | 0.5250 | 1.0000 | food_fresh_kg | none | 0.9500 | 0 (not needed) | n/a | n/a | n/a |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.60 | 0.4300 | 1.0000 | food_fresh_kg | none | 0.9400 | 0 (not needed) | n/a | n/a | n/a |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.80 | 0.2400 | 1.0000 | food_fresh_kg | none | 0.9200 | 0 (not needed) | n/a | n/a | n/a |

Maximum embargo depth e* with Tier 1 fully satisfiable (bisection, tol 1e-7):

| m scenario | e* (Tier-1 only) | e* (Tier-1 + shelter) | e* (full baseline d) |
|---|---|---|---|
| low (0.5 x central) | 0.0000 | 0.0000 | 0.0000 |
| central | 0.0000 | 0.0000 | 0.0000 |
| high (min(1, 1.5 x central)) | 0.0000 | 0.0000 | 0.0000 |
| uniform (m = 1 everywhere) | 0.0000 | 0.0000 | 0.0000 |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 1.0000 | 0.0000 | 0.0000 |

#### Headroom h = 0.25

| m scenario | e | alpha full baseline d | alpha Tier-1 only | binding sector | infeasible sectors (Tier-1 only) | alpha Tier-1 + shelter | staple reserve draw / day (kcal) | 12-mo staple reserve lasts (days) | 24-mo staple reserve lasts (days) | 12-mo / 24-mo full Tier-1 basket reserve lasts (days) |
|---|---|---|---|---|---|---|---|---|---|---|
| low (0.5 x central) | 0.30 | 1.0719 | 1.1938 | food_fresh_kg | none | 1.1937 | 0 (not needed) | n/a | n/a | n/a |
| low (0.5 x central) | 0.50 | 0.9531 | 1.1562 | food_fresh_kg | none | 1.1562 | 0 (not needed) | n/a | n/a | n/a |
| low (0.5 x central) | 0.60 | 0.8938 | 1.1375 | food_fresh_kg | none | 1.1375 | 0 (not needed) | n/a | n/a | n/a |
| low (0.5 x central) | 0.80 | 0.7750 | 1.1000 | food_fresh_kg | none | 1.1000 | 0 (not needed) | n/a | n/a | n/a |
| central | 0.30 | 0.8938 | 1.1375 | food_fresh_kg | none | 1.1375 | 0 (not needed) | n/a | n/a | n/a |
| central | 0.50 | 0.6563 | 1.0625 | food_fresh_kg | none | 1.0625 | 0 (not needed) | n/a | n/a | n/a |
| central | 0.60 | 0.5375 | 1.0250 | food_fresh_kg | none | 1.0250 | 0 (not needed) | n/a | n/a | n/a |
| central | 0.80 | 0.3000 | 0.9450 | exergy_elec_kwh | exergy_elec_kwh, thermal_heat_kwh, food_staple_kcal, food_fresh_kg | 0.9420 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 6640 / 13280 |
| high (min(1, 1.5 x central)) | 0.30 | 0.8750 | 1.0813 | food_fresh_kg | none | 1.0813 | 0 (not needed) | n/a | n/a | n/a |
| high (min(1, 1.5 x central)) | 0.50 | 0.6250 | 0.9688 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, food_staple_kcal, food_fresh_kg | 0.9688 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 11680 / 23360 |
| high (min(1, 1.5 x central)) | 0.60 | 0.5000 | 0.8894 | exergy_elec_kwh | exergy_elec_kwh, thermal_heat_kwh, food_staple_kcal, food_fresh_kg | 0.8866 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 3301 / 6603 |
| high (min(1, 1.5 x central)) | 0.80 | 0.2500 | 0.7227 | exergy_elec_kwh | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg | 0.7203 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 1316 / 2632 |
| uniform (m = 1 everywhere) | 0.30 | 0.8750 | 0.8750 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, preventive_maint_h | 0.8750 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 2920 / 5840 |
| uniform (m = 1 everywhere) | 0.50 | 0.6250 | 0.6250 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, preventive_maint_h | 0.6250 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 973 / 1947 |
| uniform (m = 1 everywhere) | 0.60 | 0.5000 | 0.5000 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, preventive_maint_h | 0.5000 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 730 / 1460 |
| uniform (m = 1 everywhere) | 0.80 | 0.2500 | 0.2500 | food_fresh_kg | exergy_elec_kwh, thermal_heat_kwh, water_potable_l, water_agri_l, food_staple_kcal, food_fresh_kg, circular_scrap_kg, preventive_maint_h | 0.2500 | not bridgeable (gap in thermal_heat_kwh has no staple pathway) | - | - | 487 / 973 |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.30 | 0.8938 | 1.2500 | food_fresh_kg | none | 1.2125 | 0 (not needed) | n/a | n/a | n/a |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.50 | 0.6563 | 1.2500 | food_fresh_kg | none | 1.1875 | 0 (not needed) | n/a | n/a | n/a |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.60 | 0.5375 | 1.2500 | food_fresh_kg | none | 1.1750 | 0 (not needed) | n/a | n/a | n/a |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 0.80 | 0.3000 | 1.2500 | food_fresh_kg | none | 1.1500 | 0 (not needed) | n/a | n/a | n/a |

Maximum embargo depth e* with Tier 1 fully satisfiable (bisection, tol 1e-7):

| m scenario | e* (Tier-1 only) | e* (Tier-1 + shelter) | e* (full baseline d) |
|---|---|---|---|
| low (0.5 x central) | 1.0000 | 1.0000 | 0.4211 |
| central | 0.6667 | 0.6667 | 0.2105 |
| high (min(1, 1.5 x central)) | 0.4444 | 0.4444 | 0.2000 |
| uniform (m = 1 everywhere) | 0.2000 | 0.2000 | 0.2000 |
| Tier-1 autarky (m = 0 on Tier-1 sectors, central elsewhere) | 1.0000 | 1.0000 | 0.2105 |

### Strategic reserve magnitudes implied by Art. 3.5 ("12-24 months of Tier 1 without external inputs")
- staple reserve, 12 months of Tier-1 final staple demand: 2.2995e+08 kcal (65700.0000 kg grain at 3,500 kcal/kg)
- staple gross requirement incl. intermediate use (L f1), 12 months: 2.4090e+08 kcal
- electrical exergy for Tier 1 (L f1)_elec per day: 2163.3420 kWh; 12 months: 7.8962e+05 kWh; 24 months: 1.5792e+06 kWh
  (i.e. the stated 'stationary energy buffer' clause would require this much stored energy if it were to cover Tier-1 electricity alone for the full horizon)

### Coded L_min operator vs. inter-industry coupling
`lexicographic_allocate` in simone/src/layer1_leontief.jl allocates ONE scalar stock across three tier demands.
It does not see A: allocating final Tier-1 goods without reserving their intermediate inputs under-counts requirements by:
- exergy_elec_kwh: final Tier-1 demand 1350.0000 vs gross requirement 2163.3420 (ratio 1.6025)
- thermal_heat_kwh: final Tier-1 demand 1140.0000 vs gross requirement 1446.0000 (ratio 1.2684)
- water_potable_l: final Tier-1 demand 15000.0000 vs gross requirement 15099.9988 (ratio 1.0067)
- water_agri_l: final Tier-1 demand 1.3500e+05 vs gross requirement 3.7110e+05 (ratio 2.7489)
- food_staple_kcal: final Tier-1 demand 6.3000e+05 vs gross requirement 6.6000e+05 (ratio 1.0476)
- food_fresh_kg: final Tier-1 demand 255.0000 vs gross requirement 255.0000 (ratio 1.0000)
- preventive_maint_h: final Tier-1 demand 120.0000 vs gross requirement 199.9976 (ratio 1.6666)

### Hawkins-Simon check: 4-sector baseline matrix
- dimension: 4x4
- spectral radius rho(A) = 0.1207
- det(I-A) = 0.7862
- leading principal minors of (I-A): min = 0.7862, all > 0: true
- min entry of L=(I-A)^-1 = 0 (numerical zero, |v| < 1e-12) (non-negative: true)
- max substitution penalty k* = 1/rho (A -> k*A stays viable for k < k*): 8.2876

- baseline (N=300) d = ["1500.0000", "45000.0000", "7.5000e+05", "600.0000"]
- x = ["2393.1109", "57261.5368", "7.9787e+05", "752.8112"]
- uniform capacity-cap embargo (m = 1, h = 0): Tier-1-only alpha by depth:
  - e = 0.30: alpha = 0.7000
  - e = 0.50: alpha = 0.5000
  - e = 0.60: alpha = 0.4000
  - e = 0.80: alpha = 0.2000
- e* (Tier-1 only, m = 1, h = 0) = 0.0000
```
