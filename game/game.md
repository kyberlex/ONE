# **O-ASIS DUAL-TRACK: GAMEPLAY REDESIGN SPECIFICATION (`sim_new.md`)**
## **The Living Longitudinal Commons Simulator: From Scratch to Global Federation**

**License:** AGPL-3.0-or-later  
**Persona & Lead Architect:** Kyberlex (`kyberlex@proton.me`)  
**Status:** `[STATUS: RATIFIED & CANONICAL — READY FOR PHASED IMPLEMENTATION]`  
**Target Delivery:** Phased refactoring roadmap following full architectural agreement  

---

## **1. THE BIG PICTURE: WHY THIS SIMULATION EXISTS**

### **1.1 The Dual Mission**
This simulation is not an ephemeral arcade game designed to be beaten in two hours and uninstalled. It is designed as:
1. **A Longitudinal Sandbox for Real Players:** Played in **short, satisfying daily sessions (5–15 minutes) over many months**, where players watch a barren plot evolve into a thriving, self-reliant solarpunk community.
2. **An Empirical Crowdsourcing Laboratory for O.N.E.:** By simulating the real thermodynamics, economic frictions, and social dilemmas of intentional communities, thousands of players will test and stress-test the principles of Open Networked Earth. **Their collective solutions, failures, and governance choices directly reveal what real-world O.N.E. communities will encounter.**

### **1.2 Core Architectural Decisions Ratified**
- **Model C (Sovereign Local Seed + Global Federation):**
  - **Local Founding:** Each player founds their own seed-node located in their **real-world living area** (chosen on the global H3 hexagonal grid).
  - **The 4 Global Anchor Nodes:** The 4 established canonical nodes already running in the sim (e.g. *Val di Susa*, *Detroit Delray*, *Atacama*, and *Rojava*) remain active as global hubs, trade partners, and beacon mentors.
  - **Global Visibility:** Whenever any player founds a seed-node, it appears dynamically on the regional and planetary map.
  - **Travel & Interactive Mentorship:** Players can virtually "travel" to other players' nodes. Experienced players can visit new players' nascent seeds to help build, repair broken systems, gift surplus seeds or FabLab blueprints, and offer guidance.
- **Sufficient 2D Animation Level:** We do NOT need complex 3D graphics. The existing 2D/isometric canvas (smooth zooming, animated sprites, day/night circadian cycles, particle effects) is completely sufficient when paired with intuitive, responsive UI mechanics.

---

## **2. NON-NEGOTIABLE DESIGN INVARIANTS & USABILITY RULES**

Every screen, interaction, and line of copy implemented from this specification must obey five hard rules:

### **Rule 1: The Ultra-Simple & Direct Copy Mandate (Zero Fluff, Zero Jargon)**
- **MANDATORY STYLE:** All written copy (dialogues, speech bubbles, buttons, tooltips, alerts, quest cards) MUST ALWAYS be **ultra-simple and direct**.
- **The Golden Formula:** **[Problem in 5 words] + [What to build/do] + [Clear benefit]**.
- **Length Constraint:** Maximum 1 or 2 short sentences per prompt. Zero academic, technical, or bureaucratic filler.
- **Canonical Examples Across the Game:**
  * ❌ *Banned Academic Style:* "Right now, your shower and sink water runs into the dirt and evaporates. If we dig a biological reed-bed with gravel and marsh plants, the roots will naturally filter out all soaps and bacteria. We can recycle 65% of all used water directly back into our crops!"
  * ✅ *Mandatory Ultra-Simple Style:* **"Don't dump dirty sink water! Let's build a plant filter so our garden gets free water every day."**
  * ❌ *Banned:* "Bifacial photovoltaic inverter harmonic phase calibration required to achieve energetic autonomy."
  * ✅ *Mandatory:* **"The van battery is dying! Let's put up solar panels to get free lights and power."**
  * ❌ *Banned:* "Execute P2P WebRTC demurrage-free bilateral clearing of agricultural surplus."
  * ✅ *Mandatory:* **"Our neighbors are hungry! Let's pedal over 20 kg of tomatoes by cargo bike."**
  * ❌ *Banned:* "Subtractive CNC rotary machining of aluminum billets for mechanical asset maintenance."
  * ✅ *Mandatory:* **"Our plastic tools keep breaking! Let's melt recycled metal to make strong parts."**
  * ❌ *Banned:* "Sortition-derived legislative jury constitutional supermajority ratification."
  * ✅ *Mandatory:* **"Time to vote! 5 citizens are picked by lottery to decide the new rule."**

### **Rule 2: Instant Visible & Auditory Sensory Feedback ("Juice")**
- **Zero Silent Actions:** Every click, assignment, or construction MUST produce an immediate, unmistakable visual reaction on the canvas:
  - Placing a building causes a wooden frame to drop with a spring-bounce and dust puff.
  - Assigning a citizen makes their sprite physically walk to the workplace with an animated tool bubble over their head.
  - Power and water generation display floating numbers and pulsing lines (`+15 kWh`, `+50 L`).
  - Machine breakdown triggers visible sparks, smoke, and an alert wrench icon.

### **Rule 3: Terra Nil-Style Bottom Dock (Max 4 Choices)**
- Eliminate deep, multi-tab modal dialogs that obscure the game world.
- The player interacts through a clean, dockable bottom bar displaying only **3 to 4 contextually relevant actions** for their current stage:
  ```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ [🎯 Current Goal: Build Rain Cistern to cut water delivery bill]       │
  ├────────────────────────────────────────────────────────────────────────┤
  │                                                                        │
  │                       [ LIVING 2D VILLAGE CANVAS ]                     │
  │                                                                        │
  ├────────────────────────────────────────────────────────────────────────┤
  │  [⚡ Solar Array]    [💧 Rain Cistern]    [🥗 Garden Bed]   [🛠️ FabLab] │
  └────────────────────────────────────────────────────────────────────────┘
  ```
- Hovering or tapping an item explains its purpose in **one simple sentence**. Clicking it highlights open plots on the ground.

### **Rule 4: The "Always-On" Primary Objective**
- The player must never feel lost or ask *"What do I do now?"*.
- The HUD always features one pinned **Primary Objective Card** with:
  1. The immediate goal (e.g. *"Step 2: Collect 500 L of Rainwater before day 5"*).
  2. A progress indicator (`120 / 500 L`).
  3. A reward preview (*"Unlocks: Permaculture Greenhouse + Dual-Track YAML blueprint"*).

### **Rule 5: Strict Progressive Disclosure ("The Gated Horizon")**
- **Zero Early Feature Bloat:** Never show a tool, menu, panel, or map before the player has physically constructed the infrastructure that enables it.
- **The Progression Ladder:**
  * **Days 1–5 (Pure Survival Plot):** ONLY local village view. No global map, no 3D CAD viewer, no Agora codex. One goal at a time.
  * **Day 7 (The Radio Antenna):** Erecting the LoRa mast triggers *"📡 Signals Detected!"* and unlocks the **Regional Map** for the first time.
  * **Day 15 (The FabLab Shed):** Building the workshop unlocks the **3D CAD & Blueprint Workbench**.
  * **Day 25 (The Cargo E-Bike):** Crafting the bike unlocks **Inter-Node Travel & Mutual Aid**.
  * **Day 35 (The Agora Circle):** Reaching 10 residents unlocks the **Demarchy Sortition Engine & Confederal Codex**.

---

## **3. ONBOARDING & PLAYER IDENTITY: THE 3 PIONEER PASSPORTS**

The player is **not a disembodied god in the sky**; the player is **one of the 3 founding pioneers** on the ground:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   O.N.E. PIONEER EMBARKATION DESK                      │
│             "Three pioneers. One seed. What is your craft?"            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ PASSPORT 1 ]            ★ [ YOUR PASSPORT ] ★        [ PASSPORT 3 ]│
│   ┌───────────────┐         ┌───────────────────┐        ┌────────────┐│
│   │ 🔨 BUILDER    │         │ ⚡ ELECTRICIAN    │        │ 🥗 GARDENER││
│   │ Maya          │  ◄───►  │ [Your Name]       │  ◄───► │ Leo        ││
│   │ Timber & CNC  │         │ Solar & Circuits  │        │ Soil & Food││
│   └───────────────┘         └───────────────────┘        └────────────┘│
│      (Companion)                 (YOU!)                    (Companion) │
│                                                                        │
│                    [ CONFIRM & EMBARK TO PLOT ]                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Step 0 Selection:** The player claims one of 3 Passports:
   - 🔨 **The Builder:** Fast structural framing, timber construction, mechanical maintenance.
   - ⚡ **The Electrician / Tinkerer:** Solar wiring, inverter optimization, battery storage.
   - 🥗 **The Gardener / Ecologist:** Rainwater cycles, soil preparation, high crop yields.
2. **The Founding Crew:** Whichever role the player chooses becomes **YOU** (distinguished in the 2D village by a golden solarpunk star over their sprite). The remaining two roles become your loyal founding companions traveling in the van.
3. **True Cooperation:** No single pioneer can do everything alone. The team divides the work naturally.

---

### **3.2 The 3-Stage Metabolic Horizon & The Chore Extinction Queue**
In O.N.E., there are **zero parasitic rentiers and zero overworked wage slaves**. However, post-work is **not an unearned luxury on Day 1 in the wilderness**; it is the central quest unlocked through open-source tooling, grounded in **Article 5, Section 4 of the Living Constitution** (*"The Full Automation Trajectory"*).

#### **The 3 Stages of Seed Node Metabolic Evolution:**
1. **Stage 1: The Bootstrap Horizon (Days 1–15 • Pioneer Manual Grind):**
   * *The Reality:* No robots or FabLab exist yet. Water must be hauled, frames leveled, and soil prepared by hand.
   * *Why Founders Don't Starve:* The Camper Van carries a **180-Day Caloric Buffer** (sealed gamma buckets of dry grains, legumes, fats, seeds) and pre-fabricated starter kits (1.5 kW solar, IBC tote cistern).
   * *Daily Labor Burden:* **6.0 to 7.0 hours/day of shared manual toil** across the 3 pioneers. Human Discretionary Free Time is low (~25%).
2. **Stage 2: The FabLab Crucible (Days 15–45 • The Tooling Bridge):**
   * *The Goal:* Construct the air-gapped Open-Source FabLab (LinuxCNC plasma table, lathe, TIG welder, Voron 3D printers).
   * *The Bottleneck:* "Building the machines that build the machines." Heavy workshop circuits run on surplus solar power (SOC ≥ 80%).
   * *Daily Labor Burden:* **4.0 to 5.0 hours/day**. Free Time climbs to ~45%.
3. **Stage 3: The Automation Horizon (Days 45+ • Post-Work Solarpunk Realized):**
   * *The Culmination:* The FabLab manufactures open-hardware agricultural robotics and cybernetic automation.
   * *The Victory:* Chores are systematically engineered out of existence. Daily rotational chores collapse to the canonical **≤ 2 hours/day (14h/week)** baseline, and Human Discretionary Freedom climbs to **85%+**!

```
┌────────────────────────────────────────────────────────┐
│ 📋 DAILY COMMONS CHORE BOARD & EXTINCTION QUEUE        │
│ • 💧 Water Cistern Hauling     [2.0h] ➔ Target: Solenoid Relay│
│ • 🥗 Garden Soil Weeding       [2.0h] ➔ Target: FarmBot Gantry │
│ • ⚡ Solar Tilt Adjustment     [1.0h] ➔ Target: Dual-Axis Act.│
│ • 🪵 Thermal Core & Compost    [1.0h] ➔ Target: Auto Blower   │
├────────────────────────────────────────────────────────┤
│ ⏳ Human Free Time: 25% (Pioneering) ➔ Goal: 85% (Post-Work)│
└────────────────────────────────────────────────────────┘
```

* **The Extinction Queue Mechanic:**  
  Every open-hardware automation project fabricated in the FabLab **permanently strikes off a chore from the board forever**:
  * *Fabricate ESP32 Solenoid Relay* ➔ `• 💧 Water Hauling ➔ [🤖 AUTOMATED BY SENSOR RELAY (-2h/day human toil!)]`
  * *Fabricate FarmBot CNC Gantry* ➔ `• 🥗 Garden Weeding ➔ [🤖 AUTOMATED BY FARMBOT (-2h/day human toil!)]`
  * *Fabricate Dual-Axis Solar Actuator* ➔ `• ⚡ Solar Adjustment ➔ [🤖 AUTOMATED BY ACTUATOR (-1h/day human toil!)]`
* **The Living Visual Reward:**  
  As human chore hours collapse from 6.0h down to 1.5h/day, the settlers spend their sunny afternoons relaxing under the awning, reading in the library, playing acoustic music, or inventing in the Heretic's Bench!

---

### **3.3 The 7% "Heretic's Commons" (Culture & Wild Innovation)**
In **Chapter 1, Article 1.3 of the O.N.E. Living Constitution**, there is an inviolable constitutional law:
> *"An inviolable margin of seven percent (7%) of all common fabrication facilities, compute, and laboratories shall remain permanently reserved as a Heretic’s Commons for speculative, non-consensus research without peer gatekeeping or committee approval."*

#### **How it works in the game:**
In the FabLab, 93% of machine time goes to vital infrastructure (brackets, tractor gears, pipe fittings).  
**7% is permanently reserved for the "Wild Idea Tank":**

```
┌────────────────────────────────────────────────────────┐
│ 🧪 THE 7% HERETIC'S BENCH (Non-Consensus Innovation)   │
│ "No committee approval needed. Pure creative freedom!" │
├────────────────────────────────────────────────────────┤
│ Active Experiment: Bioluminescent Mushroom Night-Lamps │
│ • Progress: [████████░░] 80% (Using 7% surplus solar)  │
│ • Creator: Leo (Gardener) & Nico (Tinkerer)            │
│ • Unlocks: Glowing green garden paths (0 electricity!) │
└────────────────────────────────────────────────────────┘
```

* **Weekly Wild Idea Cards:** Every week, citizens propose eccentric, artistic, or high-risk inventions:
  1. *Bioluminescent Fungi:* Glowing organic lanterns that eliminate night pathway power draw.
  2. *Acoustic Wind Organ:* Bamboo pipes tuned to the breeze, creating soothing ambient music on the canvas.
  3. *Magnetic Stirling Cooler:* Speculative solar chiller that protects vaccines during heatwaves.
  4. *Giant Solar Kaleidoscope:* A joyful festival art installation that boosts community hope.
* **Why it matters:** It prevents O.N.E. from becoming a dull, gray survival camp. It guarantees that art, curiosity, and eccentricity are protected by law.

---

## **4. THE HOSPITALITY PROTOCOL & THE 11 VOCATIONS ARRIVAL CADENCE**

### **4.1 The Core Hospitality Invariant ("Growth With Balance")**
In O.N.E., population growth is never chaotic. Whenever a new human being asks to join the seed-node, the community executes the **3-Part Hospitality Protocol**:
1. **The Temporary Welcome:** The newcomer always sleeps in the **Civic Guest House** during their onboarding days (never on someone's floor after Day 6!).
2. **The Permanent Foundation:** The community immediately constructs the newcomer's permanent **Modular Habitat Unit (MHU)**, keeping the Guest House ready and welcoming for the next traveler.
3. **The Thermodynamic Balance Rule:** Every new citizen requires an automatic, proportional expansion of the physical life-support systems before they move in:
   * `+1 Solar Panel (⚡ Power: +1.5 kWh/day)`
   * `+1 Rain Cistern (💧 Water: +35 L/day capacity)`
   * `+1 Permaculture Bed (🥗 Food: +2,200 kcal/day)`
   * *Systemic Result:* The node **never** enters a food or water deficit from welcoming a new soul!

---

### **4.2 The Interleaved Arrival Cadence (The 11 Canonical Vocations)**
Every couple of days, a new pioneer arrives at the dirt road edge, bringing a specialized trade from the canonical O.N.E. vocations list (`sim/app/src/data/vocations.js`). Each arrival unlocks a major technological or social leap:

```
Day 1:  [🔨 Builder] [⚡ Electrician] [🌾 Farmer] (The Founding Trio)
Day 6:  [📡 Nico — Mesh Telemetry & IoT Engineer] ➔ Unlocks LoRa Mast & Regional Map
Day 9:  [💧 Elena — Water Systems & Sanitation Tech] ➔ Unlocks Reed-Bed Greywater Recycling (65% return)
Day 12: [🔧 Tomas — Mechanical Machinist & Blacksmith] ➔ Upgrades FabLab with CNC Metal Milling
Day 15: [🍲 Soraya — Communal Chef & Baker] ➔ Builds Community Kitchen & Bakery (+10% Nutrition)
Day 19: [🩺 Clara — Community Nurse & Medic] ➔ Builds Health Clinic & Apothecary (Fatigue Cure)
Day 23: [🌲 Bram — Forest Steward & Beekeeper] ➔ Establishes Food Forest & Hives (Honey, Wax, Timber)
Day 27: [📚 Miriam — Commons Educator & Teacher] ➔ Builds Open School & Seed Library
Day 31: [⚖️ Zayd — Civic Facilitator & Mediator] ➔ Builds Stone Agora Circle & Activates Demarchy Sortition!
```

* **Rhythmic Progression:** Every 2 to 4 days, the player experiences a joyful milestone:
  1. Meet the new character and hear their backstory.
  2. Put them in the Guest House.
  3. Build their permanent home and expand life-support meters.
  4. Unlock their craft's specialized building or technology!

---

### **4.3 Multi-Generational Commons: Integrating Kids & Elders**

In the legacy world, elders are warehoused in nursing homes and kids are treated as future economic units. In O.N.E., they are the **heart and soul of community life**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE MULTI-GENERATIONAL SPECTRUM                      │
├────────────────────────────────┬───────────────────────────────────────┤
│     👶 CHILDREN (THE FUTURE)   │        👵 ELDERS (THE WISDOM)         │
├────────────────────────────────┼───────────────────────────────────────┤
│ • Facility: Open Forest School │ • Facility: Elder Sanctuary Cabins    │
│ • Chores: ZERO (Zero labor)    │ • Chores: ZERO (Exempt from chores)   │
│ • Activity: Nature foraging,   │ • Activity: Conflict mediation,       │
│   robot coding & playful games │   seed breeding, porch storytelling   │
│ • Perk: Discovers wild seeds & │ • Perk: -50% dilemma friction,        │
│   creates joyful heart emotes  │   +20% workshop craft precision       │
└────────────────────────────────┴───────────────────────────────────────┘
```

#### **How Kids Work on the Canvas:**
1. **Zero Child Labor:** Children never perform chores or industrial work.
2. **Nature Scouts & Foraging:**  
   * 2–3 animated kid sprites run across the grass with magnifying glasses and wooden wagons.
   * They periodically "discover" rare items in the wild:  
     `🌱 Kids found a wild heirloom blackberry bush! (+100 fresh berries)`  
     `🐞 Kids caught garden ladybugs! (+5% natural pest protection)`
3. **The Young Coders:**  
   * In the Open School, Teacher Miriam teaches kids Python and robotics.
   * Kids build the Sunday Solar Toy Rovers and help calibrate the FarmBot!
4. **The Joy Aura:**  
   * Kids playing in the village emit little pink heart bubbles (`💖`). When pioneers walk past playing kids, their fatigue meter drops.

#### **How Elders Work on the Canvas:**
1. **The Elder Sanctuary:**  
   * Peaceful, single-story timber cottages with ramp access, sunny porch rocking chairs, and flower boxes.
   * Elders are 100% exempt from the mandatory 2h chore roster.
2. **The Conflict Mediators (Crisis Damping):**  
   * When an angry social dispute arises (e.g. Sabbatical overstay or chore tension), Elder Rosa walks over with a teapot.
   * **Systemic Perk:** Having an Elder present in an Agora jury **cuts morale penalties by 50%**, guiding the assembly toward peaceful consensus!
3. **Master Craft Mentorship:**  
   * Elders sit on shaded benches near the FabLab and garden.
   * When young pioneers work near an Elder, a gentle golden aura lights up:  
     `👴 Elder Mentorship Active: Machining & Planting Quality +20%!`
4. **Saturday Campfire Storytelling:**  
   * On Saturday nights, an Elder leads the storytelling circle around the fire pit, sharing memories of the transition away from the old world.

---

## **5. THE SESSION RHYTHM: CALM DAYS, CRISIS DAYS & WEEKEND CELEBRATIONS**

### **5.1 The Dynamic Rhythm (4 Calm Days ➔ 1 Event Day ➔ The Weekend)**
* **Calm Weekdays (Monday–Thursday — 3 to 5 Minutes):**
  * Check the Morning Dispatch (overnight recharge, crops).
  * Assign 2h shared chores and place 1 building or FabLab order.
  * Savor steady progress, then close or advance.
* **Crisis Event Days (Occasional Fridays — 10 to 15 Minutes):**
  * Weather shocks or Legacy audits turn the day into an engaging, multi-step emergency puzzle.
* **Weekend Celebrations (Saturday & Sunday — 4 to 5 Minutes):**
  * Heavy industrial contracts pause. The village shifts to food, music, play, and celebration!

### **5.2 Weather Crisis Example ("The Unseasonal Frost" — Day 4 or 5)**
* **The 48-Hour Alert:** Morning Dispatch warns of an arctic cold snap dropping temperatures to `-3°C` by nightfall.
* **The Extended Puzzle (10–12 min):**
  1. *Triage:* Water pipes will freeze; tomato seedlings will perish if exposed.
  2. *Action:* Assign Builder to cut hoop-house frames; assign Gardener to drape thermal burlap; assign Electrician to run low-voltage trace heating to the cistern valve.
  3. *The Event:* Watch twilight turn to freezing blizzard. Frost visibly creeps across the grass. Status bubbles show seedlings protected (`+2°C`).
  4. *Relief:* Dawn melts the frost. Banner: `🎉 Crops Saved! Resilience +10!`

### **5.3 Legacy Threat Example ("The Surprise Utility Audit" — Day 9 or 10)**
* **The Alert:** A Legacy utility vehicle arrives at the road edge demanding a $350 fee for "unmetered grid backfeed" within 5 minutes.
* **The Extended Puzzle (10–12 min):**
  1. *Emergency Pow-wow:* The 3 pioneers gather around the work table.
  2. *Action:* The Electrician rushes to wire a physical isolation breaker switch while the timer counts down.
  3. *Resolution:* The inspector sprite walks to the breaker box, verifies complete physical isolation, frowns, stamps his clipboard *"Compliant"*, and drives away. Banner: `🛡️ Legacy Threat Repelled! Zero Fines Paid!`

### **5.4 The Weekend Rhythm (Saturday Feast & Sunday Play)**
In O.N.E., life is not endless grind. The weekend embodies **conviviality, joy, and celebration**:
* **Saturday: The Commons Feast & Acoustic Jam:**
  * Heavy work orders are closed; daily chores are halved.
  * **The Mini-Feast:** Soraya lights the outdoor wood-fired bread oven. Players drag fresh tomatoes and basil onto sourdough pizzas and slide them into the embers (`*crackle-pop!*`).
  * **The Long-Table Celebration:** Citizens eat together along the big outdoor table. Tomas strums an acoustic guitar on the porch. Heart emotes (`❤️`) float above the camp. Morale hits 100%!
* **Sunday: Creative Inventions & Sunset Coffee:**
  * In the FabLab, pioneers tinker for fun: 3D printing tiny solar toy rovers or flying kites.
  * **The Mini-Race:** Pioneers line up solar toy cars on the dirt road and watch them race under the sunshine.
  * Evening sunset chat: pioneers reflect on the week's accomplishments over hot tea by the campfire.

### **5.5 How to "Play Longer" Without Artificial Gates**
* **In Early Stages (Days 1–5):** If a player wants to keep playing, they are never blocked. They simply tap **"🌙 Rest & Greet Tomorrow"** to immediately begin the next simulation day!
* **In Later Stages (Days 7+):** Unlocked avenues allow deep play:
  * Travel to other players' nodes and help build.
  * Open the FabLab 3D CAD viewer to inspect real-world open-hardware STL models.
  * Lay down stone paths, gardens, and aesthetic village details.
  * Deliberate on Agora Sortition juries.

---

## **6. THE SEED LIFECYCLE: SLOW-PACED MODULAR EVOLUTION (MONTHS 1 TO 6+)**

Rather than unlocking everything at once, modules, social roles, and technologies are revealed **gradually in short daily sessions over months**. This ensures the player always has a fresh, attainable horizon.

```
[MONTH 1: PIONEER CAMP]   ──►  [MONTH 2: HEARTH & FABLAB]   ──►  [MONTH 3: HEALTH & ELDERS]
Survival & Tents              Slashing Utility Bills            Clinic, Elder Sanctuary & FarmBot
        │                                                               │
        ▼                                                               ▼
[MONTH 4: THE CIVIC AGORA] ──► [MONTH 5: SCHOOL & COMMONS]   ──►  [MONTH 6+: SOVEREIGN FEDERATION]
Demarchy Juries & MHUs        Open Education & Research         Zero Debt, Microgrids & Dual-Track
```

### **Stage 1: The Pioneer Camp (Month 1 — Survival & Grounding)**
* **Focus:** 3–5 pioneers arrive on an empty plot with an initial Legacy loan.
* **Modules Unlocked:**
  * Temporary MHU shelters / insulated yurts.
  * Basic Rain Barrel & portable solar panels with 12V lead-acid/LFP pack.
* **The Goal:** Survive the first month with zero power failures; learn the basics of water and battery care.

### **Stage 2: The Hearth & FabLab (Month 2 — Bills & First Production)**
* **Focus:** Slashing recurring legacy bills and generating fiat to amortize debt.
* **Modules Unlocked:**
  * **Pioneer FabLab:** Woodworking, basic 3D printer, soldering bench.
  * **Rainwater Cistern & Raised Garden Beds:** Cuts food and water bills by 70%.
* **The Gameplay Loop:** Accept Legacy custom machining/repair orders at the FabLab to earn fiat for loan principal.

### **Stage 3: Health, Elders & First Automation (Month 3 — Care & FarmBots)**
* **Focus:** Sustaining human health and automating backbreaking physical labor.
* **Modules Unlocked:**
  * **Health Clinic & Apothecary:** Heals citizen fatigue, injuries, and seasonal colds.
  * **Elder Sanctuary:** Provides comfortable, quiet housing for retired pioneers. Elders contribute life experience, conflict mediation, and historical memory, reducing community stress.
  * **The First Open-Hardware Robot (FarmBot / Agro-Rover):** Built in the FabLab! Visibly weeds and waters the garden beds automatically.
  * **The Liberating Shift:** As the FarmBot takes over manual weeding, **human labor hours are freed**—citizens have more time for rest, study, and craft!

### **Stage 4: The Civic Agora & Permanent Housing (Month 4 — Demarchy)**
* **Focus:** Population grows from 8 to 20; permanent digitally fabricated housing.
* **Modules Unlocked:**
  * **Permanent Modular Habitat Units (MHUs):** Insulated, zero-emission homes.
  * **The Central Agora & Community Kitchen:** Daily shared meals, open-air assembly, and sortition juries.
  * **Demarchy Sortition Engine:** Randomly selected juries resolve social dilemmas (housing distribution, sabbatical locks, chore fairness).

### **Stage 5: The Open School & Advanced Robotics (Month 5 — Knowledge Commons)**
* **Focus:** Multi-generational resilience and high-level automation.
* **Modules Unlocked:**
  * **The Community School & Seed Library:** Children and adults study ecology, open hardware, and civic philosophy. Improves component maintenance skills across the whole node.
  * **Automated CNC Router & Courier Bot:** Automates heavy materials transport between the garden, workshop, and construction sites.
  * **Microgrid Battery Storage:** Large-scale sodium-ion / LFP storage pack.

### **Stage 6: Sovereign Autonomy & Inter-Node Federation (Month 6+ — Dual-Track Freedom)**
* **Focus:** Legacy debt hits **$0**! Full independence and regional mutual aid.
* **Modules Unlocked:**
  * Complete disconnection from Legacy utilities.
  * Inter-node cargo bike and solar EV logistics on the regional H3 map.
  * **Dual-Track Handshake:** Verified 3D CAD (.STL/.3MF) and Home Assistant YAML packages unlocked for real-world physical construction.

---

## **7. PACING, WEATHER & THREATS: THE "SELDOM BUT IMPACTFUL" RHYTHM**

To prevent player fatigue and avoid turning the game into a chaotic alert-fest, external pressures are **paced carefully**:

### **7.1 Natural Weather & Seasonal Cycles**
* The node experiences 4 distinct seasons (Spring, Summer, Autumn, Winter), each lasting approximately 3–4 real-world weeks:
  * **Spring:** Planting season; high rainfall, ideal solar generation.
  * **Summer:** High solar output; risk of heatwaves and water drought.
  * **Autumn:** Big harvest; preparing greenhouses and battery insulation for winter.
  * **Winter:** Short solar days; heating demands; reliant on stored firewood/biogas and thermal batteries.
* **The 48-Hour Forecast Rule:** Weather alerts never happen as surprise "gotchas". The Morning Dispatch gives a **2-day advance forecast** (e.g. *"⚠️ Summer heatwave expected in 48 hours: ensure cisterns are full and battery cooling pumps are serviced"*), rewarding foresight and preparation.

### **7.2 Legacy Adversary Threats (Seldom, High-Stakes Narrative Events)**
* Threats do **NOT** spam the player daily. They arrive **seldomly** (once every 2–3 weeks of real play), functioning like compelling narrative boss crises:
  * *The Utility Monopoly Surcharge:* The legacy grid doubles electricity connection fees. (Solution: accelerate off-grid battery installation).
  * *The Zoning Enforcement Citation:* A legacy city inspector arrives demanding permits for the solar canopy. (Solution: assemble the Agora sortition jury to mount a legal defense or negotiate a community exemption).
  * *The Supply Chain Embargo:* Legacy stores run out of 3D printer nozzles. (Solution: fabricate custom brass nozzles in the FabLab or request aid from a neighboring player node).

---

### **7.3 The Demarchy Dilemmas Matrix (Sortition Assembly Deliberations)**
Decisions are never made by career politicians or unilateral diktat. When a civic dilemma arises, an odd-parity sortition jury (3, 5, or 7 citizens picked by random lottery) is convened at the Agora to deliberate and vote with a **75% supermajority threshold**:

| # | Civic Dilemma Card | Trigger & Speaker | Option A (The Commons Path) | Option B (The Pragmatic / Fiat Path) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Refugee Asylum** (`dil-refugees`) | 4 evicted people arrive at the gate seeking shelter | **Welcome family into free homes:** Shares food, gains 4 new workers, +15 Morale. | **Provide 3-day travel rations:** Directs them to town, preserves local food reserves. |
| **2** | **Surplus Solar Power** (`dil-surplus-solar`) | Summer noon: batteries hit 95% with abundant sun | **Melt scrap aluminum in foundry:** Casts 40kg of machine parts for FabLab. | **Pump chilled water to greenhouses:** Protects sensitive crops from heat stress. |
| **3** | **Honey: Sell or Share?** (`dil-fiat-trade`) | Apiary yields 180kg surplus raw honey | **Sell to city gourmet store for $2,200:** Buys imported microchips and sensors. | **Keep honey in the community:** Distributes jars to kids, elders, and the clinic. |
| **4** | **The Sabbatical Overstay** (`dil-sabbatical`) | Tariq has been away helping a flood for 60 days | **Reassign home to waiting newcomer:** Tariq's gear is safely boxed in storage. | **Grant 30-day grace extension:** Keeps home locked; finds temporary cot for newcomer. |
| **5** | **Radio Antenna vs. Sauna** (`dil-mesh`) | Limited cedar timber in the workshop | **Build Mountain Radio Tower:** Boosts regional mesh range by +100 km. | **Build Wood-Fired Sauna:** Relieves physical fatigue; gives +18% community happiness. |
| **6** | **Legacy Property Tax Strike** (`dil-tax-strike`) | County demands $1,200 unzoned land tax | **Collective Legal Defense:** Defends usufruct rights at the regional court. | **Pay the tax in fiat:** Avoids legal trouble, burns $1,200 from community savings. |
| **7** | **Chore Inequality Dispute** (`dil-chores`) | Farmer feels digital coders aren't sweating enough | **Rotate all citizens into 1 farm shift/week:** Shared physical grounding and empathy. | **Weight heavy labor at 2.0x credit:** Cuts farmer's weekly hours in half. |

---

## **8. THE TRAVEL & MUTUAL AID SYSTEM (EXPERIENCED PLAYERS HELPING NEWBIES)**

One of the greatest differentiators of O.N.E. is **Cooperative PvE (Zero Griefing)**. We turn multiplayer into mutual solidarity:

```
[REGIONAL / GLOBAL MAP]
  ├── Node Milan (Day 4: Pioneer Camp) ──► Needs: Water Pump Repair
  └── Node Val di Susa (Day 120: Thriving) ──► Action: Traveling Mentor Visit
```

### **8.1 How Travel Works**
1. An experienced player zooms out to the Regional Map and clicks a glowing green dot representing a newcomer's seed-node.
2. The player selects **"Travel to Node"**.
3. Their avatar appears in the newcomer's 2D village as a friendly **Visiting Specialist**.

### **8.2 Interactive Helping Actions**
Visiting players can perform 4 tangible supportive actions:
- **Lend a Hand (Speed Up Build/Repair):** Clicking a construction site or broken machine accelerates its progress by 50% with cute teamwork spark animations.
- **Gift a Blueprint / Recipe:** An experienced player can deposit an advanced CAD recipe or crop seed into the newcomer's workshop.
- **Send a Relief Convoy:** Dispatch a small cargo bike with spare wire, water filters, or batteries.
- **Leave a Guestbook Tip:** Pin an encouraging note or advice on the newcomer's Agora noticeboard.

### **8.3 The Asynchronous Warmth**
When the new player logs in next morning, their **Morning Dispatch** displays:
> *"🎉 Neighbor Alex from Node Val di Susa visited your camp yesterday! Alex helped calibrate your solar inverter (+15% efficiency) and left 20kg of heirloom seeds in your pantry!"*

This turns the simulation into a positive-sum community where experienced players are celebrated mentors.

---

## **9. COLLECTIVE INTELLIGENCE HARVEST: WHAT WE LEARN FROM REAL PEOPLE**

To fulfill O.N.E.'s purpose as a collective research engine, the simulation tracks anonymized gameplay trends:
1. **Bottleneck Analysis:** Which physical component fails most frequently under real player usage? (Inverters, pump seals, battery degradation). This directly dictates which spares must be included in real-world habitat kits.
2. **Economic Viability Ratios:** What ratio of external Legacy contract work vs internal commons building produces long-term node survival without citizen burnout?
3. **Demarchy Consensus Trends:** Which constitutional dilemma resolutions achieve high stability vs which lead to civic deadlock? Empirical resolutions are logged into `oasis/sim_resolutions_qa.md` to continually refine the Living Constitution.

---

## **10. THE 8 MASTER COVERAGE MATRICES**

These 8 matrices cross-reference every building, threat, weather event, robot, chore, vocation, weekend activity, and mutual-aid vector in our codebase against the redesign to guarantee that **100% of the game is covered without anything left behind**.

### **MATRIX 1: MODULES & BUILDINGS COVERAGE**
*Every structure from founding camp to sovereign megaproject:*

| Building / Module | When Encountered | What the Player Does (Ultra-Simple) | In-Game Benefit & Visual Feedback |
| :--- | :--- | :--- | :--- |
| **🏕️ Pioneer Shelter (MHU)** | Day 1 | Tap to place on clearing | Houses the 3 founding pioneers. Amber window light at night. |
| **💧 Rain Cistern & Filter** | Day 2 | Place next to shelter roof | Roof gutter snaps on. Catches rainwater, eliminates water bills. |
| **⚡ Solar Array & Inverter** | Day 3 | Place in sunny south clearing | Unfolds rack, lens glint. 100% off-grid power, charges van battery. |
| **🥗 Permaculture Beds** | Day 4 | Place near cistern | Wood frame, compost soil. Grows fresh kale, carrots, and tomatoes. |
| **🛠️ Pioneer FabLab Shed** | Day 5 | Build west of shelter | Unlocks 3D CAD viewer. Takes outside orders to slash land debt. |
| **🏨 Civic Guest House** | Day 6 | Build for incoming travelers | Eliminates cramped living. Always ready to welcome new arrivals. |
| **📡 LoRa Radio Mast** | Day 6–7 | Place on roof (Nico) | Emits green radio pulse. **Unlocks the Regional Map & Mesh!** |
| **🌿 Reed-Bed Wetland** | Day 8 | Place between drain & garden | Marsh plants filter wash water. Recycles 65% of water into garden. |
| **🔧 Metal Foundry & CNC** | Day 10 | Upgrade inside FabLab (Tomas) | Molten orange crucible. Melts scrap metal for $1,500 tractor orders. |
| **🍲 Community Kitchen & Oven** | Day 13 | Build outdoor dining hearth (Soraya) | Wood-fired pizza & sourdough. Shared long-table meals boost morale. |
| **🩺 Health Clinic & Apothecary** | Day 18 | Place in quiet grove (Clara) | Cures pioneer fatigue, treats cuts/fevers, brews herbal teas. |
| **🌲 Food Forest & Apiary** | Day 22 | Plant around perimeter (Bram) | Yields raw honey, sealing wax, and firewood for winter heating. |
| **📚 Open School & Seed Library** | Day 26 | Build near Agora (Miriam) | Teaches youth & adults. Improves machine lifespan across the node. |
| **👵 Elder Sanctuary** | Day 28 | Quiet shaded cabins | Houses retired pioneers. Elders resolve social dilemmas peacefully. |
| **🏛️ Agora Socratic Amphitheater** | Day 31 | Hemicycle stone ring (Zayd) | **Activates Demarchy Sortition!** Citizens vote by lottery. |
| **🌿 Anaerobic Biogas Digester** | Month 2 | Civic megaproject | Turns compost into methane for cooking gas + liquid fertilizer. |
| **🌾 Deep Heirloom Seed Vault** | Month 3 | Subterranean cool vault | Protects non-GMO seeds from blight; unlocks inter-node trade. |
| **⚡ Solar Thermal Salt Tower** | Month 4 | Central molten salt spire | 24/7 continuous baseload solar electricity day and night. |

---

### **MATRIX 2: LEGACY ADVERSARY THREATS COVERAGE**
*All 5 institutional attacks from `adversary.js` translated into clear event puzzles:*

| Legacy Threat | Narrative Trigger | What Happens on Screen | How the Player Resolves It (Ultra-Simple) |
| :--- | :--- | :--- | :--- |
| **1. Foreclosure & Lawfare** (`npl_debt_strike`) | Debt collector arrives at road edge | Collector threatens to seize FabLab tools for old land debt | **Option A:** Citizens gather peacefully around the shop to block entry. <br>**Option B:** Pay $2,500 settlement from savings. |
| **2. Sudden Power Cut** (`grid_severing`) | Power company cuts the line | Grid sparks dead; warning sirens sound | **Option A:** Tap `[Island Mode]` to switch 100% to our solar battery. <br>**Option B:** Burn dirty diesel fuel ($450). |
| **3. Roadblock Inspection** (`tax_inspection_roadblock`) | Police stop our cargo van | Supply van carrying tomatoes/parts is detained | **Option A:** Use rural backroads and trade via cargo bikes. <br>**Option B:** Pay $950 toll fee. |
| **4. Suspicious Cash Bribes** (`false_ubi_cooptation`) | Real estate agents in town | Developers offer cash to youths to sublet cabins to tourists | **Option A:** Hold an Agora assembly to explain why homes stay free. <br>**Option B:** Ignore bribe (risks internal housing fights). |
| **5. Electricity Extortion** (`surge_pricing_blackout`) | Heatwave grid tariff spike | Grid demands 5x power fee or threatens blackout | **Option A:** Disconnect grid, shut off luxury lights, save clinic fridge. <br>**Option B:** Pay $1,200 extortion fee. |

---

### **MATRIX 3: WEATHER & METEOROLOGICAL DISASTERS COVERAGE**
*All 6 climate events from `thermodynamics.js` with 48h advance forecasts:*

| Weather Event | Canvas Visual Effect | What Is at Risk? | Player Action (Ultra-Simple Triage) |
| :--- | :--- | :--- | :--- |
| **❄️ Polar Cold Snap** | Frost creeps over grass; snow flurries | Seedlings freeze; water valves burst | Drape thermal cloth; run low-voltage heater wire to pipes. |
| **🧊 Severe Hailstorm** | Ice pellets rattle down (`*ping-clack!*`) | Solar glass & greenhouse panels crack | Pull protective canvas awnings over solar arrays. |
| **🌊 Flash Flood** | Rushing muddy brown water currents | Cistern silt filters clog; basins overflow | Open flood bypass gate; clear gravel drain trenches. |
| **🌪️ Gale-force Windstorm** | Trees bend hard; flying autumn leaves | Wind turbines spin out; LoRa mast shakes | Lock turbine mechanical brakes; lower antenna mast to safety. |
| **☀️ Scorching Drought** | Dried cracked earth; heat shimmer | Water cisterns dry up; crops wilt | Mulch garden beds with straw; recycle 100% greywater. |
| **🔥 Stagnant Heat Dome** | Blinding haze (44°C+); thermometer red | Battery overheating; solar efficiency drops | Turn on misting coolers; shade battery box; keep pioneers hydrated. |
| **🌊⛈️ Atmospheric River** | 60mm/h endless torrential rain | Total darkness (no solar); reservoir flood | Switch to stored biogas power; inspect sump pump drains. |

---

### **MATRIX 4: ROBOTS & AUTOMATION COVERAGE**
*All 5 cybernetic units from `robot_manager.js` and their human-liberation impact:*

| Robot / Automation | When Built in FabLab | Visual Animation on 2D Canvas | Which Chore It Erases (-Hours/Day) |
| :--- | :--- | :--- | :--- |
| **🚜 Agro-Rover / FarmBot** | Day 11–12 | Slides on gantry rails, plucks weeds, mists roots | **🥗 Weeding & Watering (-4h/day human labor!)** |
| **🛸 Aeroponic Mist Drone** | Day 16 | Small quadcopter patrols greenhouse with water mist | **🌱 Greenhouse Misting & Soil Sensing (-2h/day)** |
| **⚡ SCADA Balancer Bot** | Day 20 | Crawler bot rides solar racks, tilts panels to sun | **⚡ Solar Dusting & Battery Cell Tuning (-3h/day)** |
| **🧼 Sanitization Droid** | Day 24 | Wheeled cylinder patrols paths with UV-C blue light | **🧹 Communal Cleaning & Path Sweeping (-2h/day)** |
| **🦾 FabLab Cobot Sorter Arm** | Day 28 | Articulated yellow arm shreds plastics into filament | **🛠️ Metal/Plastic Scrap Sorting (-3h/day)** |

---

### **MATRIX 5: DAILY COMMONS CHORES COVERAGE**
*The 14h/week (= 2h/day) chore board and how robots gradually automate it all:*

| Core Life-Support Domain | Daily 2h Shared Chore | Companion Assigned Early | How It Gets Automated by Robots |
| :--- | :--- | :--- | :--- |
| **⚡ Energy** | Dusting solar panels & checking battery health | Sam / Electrician | **SCADA Crawler Bot** automatically cleans & balances cells. |
| **💧 Water** | Checking cistern levels & cleaning sand filter | Elena / WaterTech | **Smart ESP32 Float Valves** auto-flush silt. |
| **🥗 Food** | Weeding vegetable beds & morning harvest | Leo / Gardener | **FarmBot Rover** plucks weeds and precision-waters crops. |
| **🛠️ Workshop** | Sorting scrap metal, sharpening tools, greasing drills | Tomas / Blacksmith | **Cobot Arm** sorts scrap and winds 3D filament spools. |
| **🍲 Kitchen** | Peeling potatoes, baking bread, washing pots | Soraya / Baker | **Sanitization Droid** washes counters and sweeps floors. |
| **🧹 Community Grounds** | Sweeping boardwalks, clearing fallen branches | Maya / Builder | **Autonomous Boulevard Rover** clears pathways. |

---

### **MATRIX 6: THE 11 CANONICAL VOCATIONS (ALL CITIZENS)**
*Every profession from `vocations.js` mapped to their arrival day, home, and role:*

| # | Pioneer Name & Vocation | Arrival Day | Housing Milestone | What They Unlock for the Community |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **🔨 Maya (Builder)** | Day 1 (Founding) | Pioneer Shelter #1 | Timber cabins, frames, repair speed. |
| **2** | **⚡ Sam (Electrician)** | Day 1 (Founding) | Pioneer Shelter #1 | 3kW Solar array, LiFePO4 inverter, wiring. |
| **3** | **🌾 Leo (Farmer)** | Day 1 (Founding) | Pioneer Shelter #1 | Permaculture beds, heirloom seeds, composting. |
| **4** | **📡 Nico (Mesh Engineer)** | Day 6 (First Arrival) | MHU #2 (Guest House) | **LoRa Radio Mast & The Regional Map!** |
| **5** | **💧 Elena (Water Tech)** | Day 8 | MHU #3 | **Reed-Bed Wetland (65% Water Recycling)**. |
| **6** | **🔧 Tomas (Blacksmith)** | Day 10 | MHU #4 | **Metal Foundry & $1,500 Tractor Contracts**. |
| **7** | **🍲 Soraya (Chef & Baker)** | Day 13 | MHU #5 | **Community Kitchen & Saturday Pizza Feasts**. |
| **8** | **🩺 Clara (Nurse & Medic)** | Day 18 | MHU #6 | **Health Clinic & Apothecary (Fatigue Cure)**. |
| **9** | **🌲 Bram (Forester & Beekeeper)** | Day 22 | MHU #7 | **Food Forest, Apiary Hives, Winter Firewood**. |
| **10** | **📚 Miriam (Educator)** | Day 26 | MHU #8 | **Open School & Seed Library (Skill Boost)**. |
| **11** | **⚖️ Zayd (Mediator)** | Day 30 | MHU #9 | **The Stone Agora & Demarchy Sortition Juries!** |

---

### **MATRIX 7: ALL WEEKEND CONVIVIALITY ACTIVITIES**
*On Saturdays and Sundays, industrial contracts close and chores are halved. The community shifts to food, music, playful inventions, and relaxation:*

| Weekend Activity | Day / Schedule | What the Player Does (Ultra-Simple) | In-Game Reward & Animation |
| :--- | :--- | :--- | :--- |
| **🍕 Wood-Fired Pizza Feast** | Saturday Lunch (Week 2+) | Drag fresh tomatoes, basil, and cheese onto dough; slide into brick oven (`*crackle!*`). | **Morale hits 100%!** All pioneers sit at the long-table eating and laughing (`❤️`). |
| **🎸 Porch Acoustic Jam** | Saturday Afternoon | Tap instruments (guitar, cajón drum, flute). Pick a song tempo. | Music notes float over camp (`🎵`). Boosts pioneer stamina and unlocks personal stories. |
| **☕ Solar Tea & Kombucha Bar** | Saturday Twilight | Brew sun-distilled mint tea or fermented berries from the garden. | Pioneers drink on the porch. Heals citizen stress and builds social warmth. |
| **🎨 Solarpunk Mural Painting** | Saturday Twilight | Pick colors and stencil a sun-and-gear crest onto the cistern or cabin wall. | Visual customization! Your village displays your custom community emblem. |
| **🏎️ Solar Toy Rover Drag Race** | Sunday Morning (Week 2+) | 3D-print tiny solar racers in the FabLab. Drop the checkered flag on the dirt road! | Mini-race animation! Tiny solar cars zoom down the track with confetti at the finish. |
| **🪁 High-Altitude Solar Kite** | Sunday Noon | Build a foil kite with a tiny LoRa camera. Fly it in the breeze. | Takes a wide panoramic aerial snapshot of your growing 2D village canvas! |
| **🎯 Seed-Sack Lawn Toss** | Sunday Afternoon | Friendly lawn toss game on the grass between pioneers and visiting travelers. | Cheerful cheering animations. Winner gets crowned "Lawn Champion" for the week. |
| **🔥 Sunset Campfire & Stargazing** | Sunday Dusk | Light the center fire pit. Tap the telescope to spot solar satellites. | Pioneers reflect on the week's progress. Sets up Monday's goals with peace of mind. |

---

### **MATRIX 8: INTER-NODE TRAVEL & MUTUAL AID (MENTORSHIP)**
*How experienced players travel across the regional map to physically help newer nodes grow:*

```
[REGIONAL MAP]
  1. Click neighbor's node ➔ 2. Tap [🚴 Ride Over on Cargo E-Bike]
  3. Camera sweeps across the regional road (5-sec transit animation)
  4. Your avatar walks right into the neighbor's 2D village as a "Visiting Specialist"!
```

| Travel & Helping Action | How the Visitor Performs It | What Happens in the Host's Village | What the Host Sees in Morning Dispatch |
| :--- | :--- | :--- | :--- |
| **1. 🔨 Lend a Hand (Speed Up Build)** | Walk to their unbuilt cabin or greenhouse ➔ Tap `[Lend a Hand]`. | Your avatar hammers alongside their workers with spark particles. | *"🎉 Traveler Alex visited! Speeded up your greenhouse construction by 50%!"* |
| **2. 🔧 Emergency Repair Assistance** | Walk to a sputtering water pump or broken inverter ➔ Tap `[Fix Machine]`. | You use your specialist tools to repair their broken part for free. | *"🎉 Traveler Alex repaired your broken water pump while you were away!"* |
| **3. 🎁 Leave a Care Package** | Walk to their Civic Delivery Pallet ➔ Tap `[Leave Gift]`. | Drop a wooden crate: 30 heirloom seeds, 3D filament, or spare wire. | *"📦 Alex left 30 heirloom tomato seeds and 1kg of filament in your storage crate!"* |
| **4. 📜 Agora Guestbook Note** | Walk to their Agora Noticeboard ➔ Tap `[Sign Guestbook]`. | Pick a warm tip: e.g. *"Great solar setup! Watch out for tree shade after 3 PM."* | Host opens their noticeboard and reads your advice with your avatar's stamp! |
| **5. ⚡ Microgrid Tuning (Specialist)** | If you are a high-level Electrician: tap their battery bank ➔ `[Balance Cells]`. | Digital sparkles over their inverter. Enhances their battery lifespan by +10%. | *"⚡ Alex calibrated your solar inverter (+10% storage efficiency)!"* |
| **6. 🚴 Inter-Node Trade Convoy** | Load your bike with surplus tomatoes ➔ Ride to neighbor node. | Unloads tomatoes at their kitchen; loads surplus circuit boards to bring home. | Both nodes gain resources without using fiat currency (pure mutual aid). |

---

## **11. STEP-BY-STEP REFACTORING ROADMAP**

To transition from the current monolithic UI to this responsive, phased experience, we execute in 5 sequential steps:

### **Phase 1: Onboarding Passports, HUD & Bottom Dock Streamlining**
- **1.1 The 3 Passports Onboarding (Step 0):**
  - Implement the clean selection screen with 3 Passports: Builder, Electrician, Gardener.
  - Player picks their role and enters their name; the remaining two become founding companions in the van.
  - Mark player sprite in the 2D village canvas with the golden solarpunk chevron/star.
- **1.2 Clean Slate HUD (Hide Monolithic Modals):**
  - Hide all 74KB deep modal popups, diagnostic tables, and top menu clutter by default.
  - Display only the clean 3-part status bar: ⚡ Battery (hours remaining), 💧 Water (Liters stored), 💰 Debt ($12,000 remaining).
- **1.3 Terra Nil-Style Bottom Dock:**
  - Build the dock with 4 clean slots displaying contextually active buttons.
  - On Day 1: Only Slot 1 is active `[🏕️ Pioneer Shelter]`; Slots 2, 3, 4 are locked with clean captions.
  - Hovering/tapping an active button shows the ultra-simple 1-sentence prompt.
- **1.4 Always-On Objective Card:**
  - Pinned at top-left: Primary task, progress counter, and reward preview.
- **1.5 The Daily Shared Chore Board:**
  - Implement the morning chore noticeboard (14h/week = 2h/day baseline).
  - Animate companions performing their morning check before starting specialized tasks.
- **1.6 Ultra-Simple Copy Standard:**
  - Audit and write all strings following the `[Problem in 5 words] + [Action] + [Benefit]` formula.

### **Phase 2: The Seed-Node Lifecycle & Stage Director**
- Implement the stage progression director (Days 1–14 as detailed in the session walkthroughs).
- Implement the "🌙 Rest & Greet Tomorrow" button for players who want to advance immediately.
- Implement the Legacy Debt Counter shrinking as FabLab contracts are fulfilled (`$12,000 ➔ $0`).

### **Phase 3: Visual Sensory Feedback ("Juice")**
- Attach particle bursts, spring-bounce placement, floating numbers (`+15 kWh`, `+120 L`), and worker walking animations to all player commands.
- Ensure every single click has an instant, rewarding visual and audio response on the canvas.

### **Phase 4: Morning Dispatch, Dilemmas & Weekend Feasts**
- Implement the Morning Dispatch popup (nightly summary, visitor notifications, weather alerts).
- Implement the Weekend mode (Saturday wood-fired feast mini-game, Sunday solar rover races).
- Implement the 48-hour weather forecast alert system.

### **Phase 5: Regional Map, Node Spawning & Travel Mentorship**
- Allow players to spawn their seed on any real-world H3 hex.
- Render neighboring player nodes and the 4 anchor nodes on the regional map.
- Implement the "Travel to Node" visiting mode and mutual-aid actions (lend a hand, gift blueprint, send relief convoy).
