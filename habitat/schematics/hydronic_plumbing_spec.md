# **MHU HYDRONIC, POTABLE WATER & GREYWATER P&ID SPECIFICATION**

**Document Path:** `habitat/schematics/hydronic_plumbing_spec.md`  
**Companion Schematic:** [`habitat/schematics/hydronic_greywater_p_and_id.svg`](hydronic_greywater_p_and_id.svg)  
**Author:** Kyberlex (`kyberlex@proton.me`)  
**Pillar Alignment:** Pillar 4A & 4B (Utility Spine, Closed-Loop Water & Passive Analog Safety)  
**Governing Standards:** EN 806 (Potable Water Installations), EN 1717 (Backflow Prevention), EN 1111 (Thermostatic Mixing Valves), ISO 21542 (Accessible Wet-Room)  
**License:** AGPL-3.0-or-later

---

## **1. The 50-Year Zero-Silicon Hydraulic Survival Principle**

While optional digital telemetry monitors tank levels and water temperatures, **every life-safety and sanitary function of the MHU plumbing core operates 100% mechanically and passively for 50+ years without electricity or microcontrollers**:

1. **Passive Anti-Scald Protection (`TMV-1`):** A wax-element mechanical Thermostatic Mixing Valve (EN 1111) physically limits domestic hot water delivery to $\le 48^\circ\text{C}$ and shuts off flow in $<1.5\text{ s}$ if the cold supply fails, preventing thermal burns even if the DHW tank is heated to $65^\circ\text{C}$ for *Legionella* pasteurization.
2. **Passive Drain-Water Heat Recovery (`DWHR-1`):** A vertical copper falling-film heat exchanger inside the $800 \times 800\text{ mm}$ Utility Spine pre-heats incoming cold shower water from $10^\circ\text{C}$ to $24^\circ\text{C}$ ($\eta \approx 52\%$) using zero moving parts and zero pumps.
3. **Spring-Return Frost Bypass (`V-divert`):** A normally-closed spring-return brass 3-way valve coupled with a mechanical wax freeze stat automatically diverts greywater away from shallow surface reed beds when ambient temperatures drop below $+2^\circ\text{C}$.
4. **Full Accessibility (`800x800mm` Utility Spine):** Zero pipes are embedded inside structural timber walls. All manifolds use color-coded PEX-a radial home-run lines accessible behind a hinged dry acoustic panel.

---

## **2. Hydraulic Component Schedule**

| Tag | Subsystem | Component Description | Material / Standard | 50-Year Passive Fail-Safe |
| :--- | :--- | :--- | :--- | :--- |
| **BF-1** | Potable Inlet | Type BA Reduced-Pressure Backflow Preventer | Lead-Free CW617N Brass (EN 1717) | Mechanical differential relief |
| **PRV-1** | Pressure Reg | Diaphragm Pressure Reducing Valve ($3.0\text{ bar}$) | Brass + EPDM Diaphragm | Spring-loaded pressure cap |
| **UV-1** | Disinfection | Low-Pressure Amalgam UV-C Reactor ($40\text{ mJ/cm}^2$) | AISI 316L Stainless Steel | Solenoid closes on lamp fault |
| **DHW-1** | Thermal Store | $180\text{ L}$ Vacuum-Insulated R290 Heat Pump Tank | Duplex 2205 Stainless Steel | $6.0\text{ bar}$ mechanical T&P relief |
| **TMV-1** | Anti-Scald | Mechanical Wax-Element Thermostatic Mixer | EN 1111 Fail-Safe ($\le 48^\circ\text{C}$) | Hard cold-drop shutoff $<1.5\text{ s}$ |
| **DWHR-1**| Exergy Recov | Vertical Coaxial Copper Falling-Film Exchanger | Cu-DHP $\varnothing 54\text{ mm}$, $L = 1600\text{ mm}$ | Passive gravity film conduction |
| **V-DIV** | Greywater | 3-Way Brass Diverter + Wax Thermal Actuator | DN50 Brass + Spring Return | Diverts to deep drain $< +2^\circ\text{C}$ |
| **TRAP-1**| Sanitary Seal | Dry Silicone Membrane + Deep Seal Trap ($75\text{ mm}$) | Polypropylene (PP-H) | Prevents sewer gas back-draft |

---

## **3. Separation of Water Streams (Port C & Port D)**

* **Potable Feed (`Port C`, DN32 PE100):** Enters through the ground docking chamber, passes through `BF-1`, `PRV-1`, `5 µm` sediment cartridge, and `UV-1` before splitting at the cold manifold and `DWHR-1` pre-heat coil.
* **Greywater Stream (`Port D-1`, DN110 PP):** Collects shower, washbasin, and laundry discharge ($\sim 75\%$ of domestic volume), recovers thermal exergy via `DWHR-1`, filters lint via an accessible basket strainer, and feeds the subsurface horizontal-flow *Phragmites australis* reed bed.
* **Blackwater Stream (`Port D-2`, DN110 PP):** Collects ultra-low-flush ($1.2\text{ L}$ / $3.0\text{ L}$) toilet discharge via an independent gravity line directly to the sealed anaerobic biodigester / thermophilic vault.

