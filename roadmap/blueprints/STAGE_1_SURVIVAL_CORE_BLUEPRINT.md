# O.N.E. REAL-WORLD FIELD BLUEPRINT
## STAGE 1: THE 30-DAY SURVIVAL CORE & CALORIC BUFFER
**Timeline:** Years 1–3 | **Target Autonomy:** ~40% Decoupled (30-to-60-Day Grid Independence)  
**Classification:** Operational Field Manual & Thermodynamic Engineering  
**Canonical Anchors:** [`bible/ONE NETWORKED EARTH (O.N.E.).md`](../../bible/ONE%20NETWORKED%20EARTH%20(O.N.E.).md) (Arts. 3, 5, 6) | [`roadmap/roadmap.md`](../roadmap.md)

---

## 1. Objectives & Engineering Principles
Stage 1 establishes the physical life-support baseline. A node cannot negotiate with the host system from a position of biological weakness. If utility water, grocery trucks, or the electric grid are cut, the node must survive in comfort for a minimum of 30 to 60 days without external support.

---

## 2. Hydrological Infrastructure & Water Sovereignty

```
  [ Rain Catchment / Deep Well ] 
                 │
                 ▼
     ┌───────────────────────┐
     │ 40,000L GRAVITY TANK  │ ──► [ Gravity Flow (0 kW) ] ──► Domestic Supply
     └───────────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │  DUAL-VOLTAGE PUMP    │
     │ Primary: 230V AC      │ ──► [ Manual Transfer Switch ] ──► 48V DC Emergency
     │ Backup: 48V DC Bypass │
     └───────────────────────┘
```

### 2.1. Water Storage & Borehole Pump Specification
* **Total Storage:** Minimum 40,000 liters (gravity-fed concrete/food-grade polyethylene cistern buried below the regional frost line, typically 1.2–1.5m depth).
* **Deep Borehole Pump with MTS Bypass:**
  * Primary: High-efficiency 230V single-phase or 400V 3-phase submersible solar pump.
  * Secondary / Emergency Bypass: Low-voltage 48V DC submersible pump installed in the well casing on an isolated **Manual Transfer Switch (MTS)**. If the central inverter blows, the 48V pump connects directly to the battery bank, delivering 8–12 L/min gravity feed without AC inversion.
  * Freeze Protection: Wellhead features insulated weep-back drain valves and pneumatic chimney draft dampers preventing surface frost from creeping down the casing.

---

## 3. Electrical Microgrid & 48V LFP Battery Architecture

```
  [ Solar PV Array: 10–15 kW ] ──► [ MPPT Charge Controllers ]
                                               │
                                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 48V LFP BATTERY VAULT (20–40 kWh)                           │
  │ - Cold-weather charge throttling (<= 0.15C below 15°C)      │
  │ - Hard charge cutoff at 0°C (Prevents lithium dendrites)     │
  │ - Subgrade vented enclosure (> 150 CFM positive exhaust)    │
  │ - Castell trapped-key interlocks on high-voltage contactors │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [ 48V DC Critical Bus ]          [ 230V AC Inverter ]
       - LED lighting                   - Household refrigeration
       - Wellhead bypass pump           - Heavy appliances
       - LoRa & satellite comms         - Fab-lab (sheds < 80% SOC)
```

### 3.1. Cold-Weather BMS Protection Protocol
1. **The Lithium Plating Hazard:** Charging Lithium Iron Phosphate (LFP) cells below 0°C creates irreversible metallic lithium plating, causing internal short circuits and cell destruction.
2. **Automated Multi-Step Charge Throttling:**
   * **Cell Temp > 15°C:** Normal charge up to 0.5C.
   * **Cell Temp 5°C to 15°C:** Charge throttled automatically by BMS to `<= 0.15C`.
   * **Cell Temp 0°C to 5°C:** Charge throttled to `<= 0.05C` (trickle float only).
   * **Cell Temp <= 0°C:** Charge contactor opens permanently. Solar power is automatically diverted to DC heating pads underneath the cell trays.
3. **Backup Prime Mover Heat Ducting:** Diesel/syngas backup generator exhaust is routed through a stainless heat exchanger, direct-ducting warm air into the battery vault during extended overcast freezes.

---

## 4. The 180-Day Caloric Buffer & Sprouting Protocol

A node must not starve during winter or supply chain blockades. Food security is split into two complementary reserves:

### 4.1. Caloric Reserve Breakdown (Per Person for 180 Days)
* **Hard Grains (Wheat berries, oats, barley, rice):** 80 kg (stored in sealed 20L food-grade buckets with oxygen absorbers).
* **Protein Legumes (Lentils, chickpeas, black beans):** 40 kg.
* **Essential Fats (Cold-pressed vegetable oils, lard, ghee):** 15 L.
* **Salt & Electrolytes:** 5 kg unrefined salt, baking soda, potassium citrate.
* **Heirloom Sprouting Seeds (Alfalfa, radish, broccoli, clover):** 5 kg.

### 4.2. The Enzymatic Sprouting Protocol (Anti-Scurvy Protocol)
Dry grains and legumes contain phytic acid, which inhibits mineral absorption, and lack Vitamin C. To generate fresh greens during deep winter without artificial grow lights:
1. Soak 100g of dry lentils or seeds in fresh water for 8 hours.
2. Drain and place in an angled quart jar with a breathable mesh lid in a dark cupboard (18–22°C).
3. Rinse twice daily with cold water.
4. By Day 4, the seeds produce green enzyme sprouts with a **600% increase in Vitamin C, 300% increase in B-vitamins**, and 90% reduction in phytic acid.

---

## 5. The 50 m² Thermal Core (Surviving -25°F Polar Freezes)

Heating a 200 m² multi-room house during a polar vortex will drain the entire battery bank in hours. Nodes utilize a **Shelter-in-Place Thermal Core**:
* **The Core Zone:** A centrally located, super-insulated 50 m² communal room insulated to R-40 (walls) and R-60 (ceiling) with heavy thermal mass (brick hearth / water drums).
* **Canadian Earth Tubes (Rehau Awadukt Thermo):** Sub-soil intake tubes buried 2m deep pre-warm -25°F outside air to +38°F (+3°C) purely from ground thermal inertia before entering the heat recovery ventilator (HRV).
* **Masonry Rocket Mass Heater:** Burns 1/5th the firewood of a conventional metal stove, storing heat in 3 tons of cob or masonry benches that radiate warmth for 24 hours per burn.

---

## 6. The Stage 1 Human Maintenance Protocol (The 5-Lever Chore Architecture)

Stage 1 operates before open-source humanoid robotics arrive in Stage 2/3. To prevent chore friction, burnout, and social resentment across the non-waivable **5 to 7 hours/week per adult** metabolic chore baseline, nodes deploy the five complementary levers:

1. **Ergonomic Engineering Pre-Emption:** Primitive manual drudgery is systematically engineered away:
   - *Sanitation:* Continuous-batch thermophilic composting chambers with solar-powered Archimedes augers (eliminating manual bucket hauling).
   - *Weeding:* 15 cm ramial chipped wood (RCW) sheet-mulch and perennial polycultures reduce weeding by 90%.
   - *Greywater:* Siphon-flushed gravity phytodepuration reed beds eliminate manual filter scrubbing.
2. **Dynamic Dutch Auction (Time-Multiplier Bidding):** Unpopular high-friction tasks (e.g. digester cleaning, filter maintenance) are posted on the digital mesh. Unclaimed tasks tick up algorithmically in time credits (1.5x $\to$ 2.0x $\to$ 3.5x $\to$ 5.0x per Art. 5.1.3). A resident completing 1 hour of a 5.0x-rated task clears their entire 5-hour weekly requirement in a single hour, voluntarily clearing dirty jobs without coercion.
3. **The Weekly "Talkoot" Communal Sprint:** Rather than atomizing maintenance into lonely, alienated shifts, 70% of routine upkeep is executed in a **Weekly 3-Hour Commons Sprint** (modeled on the Finnish *Talkoot*, Amish *Barn Raising*, and Andean *Minka*). The entire community works collectively with music and teamwork, followed by a shared communal feast.
4. **Radically Transparent Stage 1 Onboarding:** The Stage 1 Pioneer Covenant filters out utopian tourists. Incoming pioneers explicitly affirm the 5–7 hr/wk physical maintenance compact before moving on-site, ensuring the pioneer cohort consists entirely of active builders.
5. **Apprenticeship Pairs & Non-Carceral Reintegration (Arts. 5.1 & 5.2):** High-stakes chores are always paired (1 mentor + 1 apprentice), transforming maintenance into pedagogical empowerment. Defection is addressed via Article 5.2's non-carceral sanction ladder, restoring full standing *ipso jure* upon shift resumption.

---

## 7. Stage 1 Bill of Materials (BOM) & Equipment Checklist

| Item | Specification / Model | Est. Cost (USD/EUR) | Purpose |
| :--- | :--- | :--- | :--- |
| **Cistern** | 40,000L subterranean concrete or dual polyethylene | $4,500–$7,000 | Gravity water buffer |
| **Solar Array** | 12 kW Monocrystalline Tier-1 panels | $4,000–$6,000 | Primary energy capture |
| **LFP Cells** | 16x 3.2V 280Ah Eve LF280K grade-A cells (14.3 kWh) | $2,200–$3,000 | 48V energy bank |
| **BMS** | Seplos or Batrium with CANbus & low-temp cutoffs | $400–$700 | Thermal throttling |
| **Inverter/Charger** | 8 kW 48V Victron MultiPlus-II or Deye hybrid | $1,800–$2,800 | 230V AC inversion |
| **Borehole Backup** | Shurflo 9300 48V DC submersible pump + MTS switch | $800–$1,200 | Direct battery pumping |
| **Food Storage** | 180-day bulk food per capita + gamma-seal buckets | $600–$900 / pers | Caloric security |
| **Earth Tubes** | 50m Rehau Awadukt Thermo antimicrobial pipe (200mm) | $1,500–$2,500 | Sub-soil air tempering |
