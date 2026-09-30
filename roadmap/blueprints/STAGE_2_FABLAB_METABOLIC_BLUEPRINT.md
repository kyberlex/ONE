# O.N.E. REAL-WORLD FIELD BLUEPRINT
## STAGE 2: THE OPEN-SOURCE FAB-LAB & METABOLIC LEVERAGE
**Timeline:** Years 3–7 | **Target Autonomy:** ~70% Decoupled (Tooling & Maintenance Sovereignty)  
**Classification:** Operational Field Manual & Mechanical Infrastructure  
**Canonical Anchors:** [`bible/ONE NETWORKED EARTH (O.N.E.).md`](../../bible/ONE%20NETWORKED%20EARTH%20(O.N.E.).md) (Arts. 5, 7) | [`roadmap/roadmap.md`](../roadmap.md)

---

## 1. Objectives & Mechanical Sovereignty
In Stage 2, the node transitions from merely surviving emergencies to reproducing its own physical infrastructure. When machines break, the node does not pay corporate repair fees or wait for proprietary replacement parts. The node manufactures, welds, turns, and fabricates its own components using **air-gapped open-source hardware and software**.

---

## 2. The Air-Gapped Fab-Lab Machine Shop

```
  ┌─────────────────────────────────────────────────────────────┐
  │ AIR-GAPPED FABRICATION CAD/CAM WORKSTATION                  │
  │ - OS: Debian GNU/Linux 12 (Offline mirror on 2TB NVMe)      │
  │ - CAD: FreeCAD 0.21+ / OpenSCAD / KiCad (Printed Schematics)│
  │ - CAM: LinuxCNC 2.9 (Real-time PREEMPT_RT kernel)           │
  │ - Zero cloud telemetry, zero subscription DRM, zero Wi-Fi   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Direct DB25 / Mesa 7i96S
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ CORE FABRICATION MACHINERY                                  │
  │ 1. 4'x8' CNC Plasma Table (Hypertherm Powermax or open)     │
  │ 2. Manual Precision Metal Lathe (12x36" gear-head)          │
  │ 3. AC/DC TIG Welder (200A aluminum/stainless capable)       │
  │ 4. Heavy-duty Knee Milling Machine (Bridgeport clone)       │
  │ 5. CoreXY 3D Printers (Voron 2.4 / RatRig on Klipper)       │
  └─────────────────────────────────────────────────────────────┘
```

### 2.1. Tooling DRM & Cloud Immunity Invariant
Proprietary cloud-tethered CNC tools (e.g. Fusion 360, Haas remote lockouts, cloud slicers) are strictly prohibited inside the node:
* **The LinuxCNC Standard:** Machine controllers communicate via isolated parallel ports or Mesa Ethernet motion boards directly running local G-code.
* **Local Offline Package Mirror:** The node maintains an air-gapped local Debian repository containing all compiler toolchains, Python packages, and CAD libraries.
* **Automatic Microgrid Load-Shedding:** Heavy workshop circuits (welder, plasma cutter, compressor) are wired through contactors that automatically disconnect whenever microgrid battery State of Charge (SOC) drops below 80%.

---

## 3. Closed-Loop Biological Sanitation & Metabolic Closure

```
  [ Domestic Waste ] ──► [ Thermophilic Compost Vault ] ──► [ Pathogen-Free Humus ] (Tree Crops)
  [ Greywater ]      ──► [ Grease Trap & Reed Bed ]     ──► [ Irrigation Water ]
```

### 3.1. Thermophilic Compost Sanitation (The Jenkins Humanure Protocol)
* **Biological Logic:** Human waste is not toxic waste; it is nitrogen and phosphorus exergy that must return to the soil.
* **Pathogen Destruction:** Vaults operate under aerobic thermophilic conditions, reaching internal temperatures of **55°C to 65°C for a minimum of 72 consecutive hours**, destroying all enteric pathogens, helminth eggs, and viral traces.
* **Curing Cycle:** Two alternating composting chambers: Chamber A fills over 12 months, while Chamber B cures undisturbed for 12 months. The resulting black humus is utilized exclusively around deep-root perennial agroforestry (chestnut and timber trees), never on raw annual leaf crops.

### 3.2. Horizontal Subsurface Flow Greywater Reed Bed
* **Design:** A 60cm deep, EPDM-lined horizontal trench filled with washed pea gravel and volcanic cinder, planted with common reeds (*Phragmites australis*), cattails (*Typha latifolia*), and yellow iris.
* **Biological Mechanism:** Microbial biofilms on the gravel substrate digest soap fatty acids and surfactant residues under anaerobic and aerobic micro-zones. Water never pools on the surface (preventing mosquito breeding and odors) and exits at agricultural irrigation quality.

---

## 4. Staple Agriculture & Agroforestry Guilds

A node cannot sustain human metabolism on salad greens. Stage 2 installs high-density caloric staples:

| Category | Primary Species | Caloric Density | Maintenance Profile |
| :--- | :--- | :--- | :--- |
| **Nut Agroforestry** | Chinese Chestnut (*Castanea mollissima*), Hybrid Hazelnut | High complex carbs + essential fats | Perennial; zero annual tillage; 50-year production lifespan. |
| **Staple Root Crops** | Certified seed potatoes, Sweet potatoes, Sunchokes (*Helianthus tuberosus*) | High carbohydrate yield (> 25 tons / hectare) | High resilience to frost; can overwinter directly in the ground. |
| **Silvopasture Guild** | Hair sheep (Katahdin / St. Croix) or dairy goats rotated under timber | High protein & dairy fat | Browses scrub; eliminates tractor mowing; builds soil carbon. |
| **Nitrogen Fixing Canopy** | Black locust (*Robinia pseudoacacia*), Alder | Soil nitrogen + rot-resistant fenceposts | Coppice wood for tool handles, masonry heaters, and charcoal. |

---

## 5. Stage 2 Machine Shop Procurement Checklist

- [ ] 1x Manual Metal Lathe (12x36" or 13x40" gear head with 3-jaw and 4-jaw chucks).
- [ ] 1x AC/DC TIG/Stick Welder (200A, high-frequency start, argon cylinder).
- [ ] 1x CNC Plasma Cutting Table (open-source design running LinuxCNC / Mesa 7i96S).
- [ ] 1x Heavy-Duty Drill Press / Mill with Morse Taper spindle and machine vise.
- [ ] 2x Voron 2.4 CoreXY 3D Printers with hardened steel nozzles for engineering filaments (PA-CF, PETG).
- [ ] 1x Dual-chamber thermophilic composting toilet vault (100% sawdust/carbon cover material).
- [ ] 1x 25 m² Horizontal subsurface greywater reed bed with EPDM liner and pea gravel.
- [ ] 200x Bare-root perennial nut trees (Chestnut, Hazel, Walnut) planted on contour swales.
