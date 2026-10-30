# **O.N.E. ORGANIC LAW ANNEX**
## *Technical Implementation Standards Beneath the Living Constitution*

**Status:** `[STATUS: CANONICAL_MERGED]` (2026-10-30) — Anchored by Living Constitution Art. 10.6.4 and reviewable under Art. 4.6. Compiled under dockets `SIM-QA-10`, `SIM-QA-11`, `SIM-QA-15`, `SIM-QA-17`; see [`oasis/sim_resolutions_qa.md`](oasis/sim_resolutions_qa.md).
**Author Persona:** Kyberlex (`kyberlex@proton.me`)

---

### **Purpose and Legal Rank**

The Living Constitution states *what* must be guaranteed (functional requirements). This Annex states *how* it is currently achieved (technologies, parameters, intervals). Separating the two keeps the Constitution technology-neutral and stops engineering details from being frozen behind the 75% supermajority, or behind the absolute entrenchment of Chapter I (Art. 1.7).

1. **Enactment and amendment:** a sixty percent (60%) qualified majority of the competent assembly (Bioregional Assembly for bioregional standards; Global Commons Assembly for planetary and Sol standards).
2. **Ratchet rule:** an Organic Law may strengthen but never weaken the constitutional guarantee it implements.
3. **Review:** any Organic Law can be challenged before a Constitutional Review Jury (Art. 4.6).
4. **Evidence rule:** every quantitative parameter must cite a reproducible source or be explicitly labelled `PROVISIONAL — UNVERIFIED`.

---

### **OL-1 — Biosecurity Interlocks for Biological Synthesis Hardware** *(implements Art. 1.4.3)*
1. Every nucleic-acid synthesis device in the commons runs firmware that screens each requested sequence against the public hazard registry before transcription and refuses matches.
2. Firmware is open-source and bit-for-bit reproducible (Art. 7.3). Its signing keys are dispersed by threshold multi-party computation (Art. 7.4).
3. Devices are tamper-evident: any opening or bypass of the screening path leaves physical evidence and permanently disables synthesis until the device is re-certified.
4. The registry is public, versioned, and limited to sequences of verified mass-casualty potential. It is curated by a rotating sortition panel with rival expert testimony (Art. 4.4), never by a standing agency.

### **OL-2 — Fabrication Slot Anti-Brokerage Parameters** *(implements Art. 3.3.3)*
1. Grace period before an unused high-demand slot is forfeited: **15 minutes** (`PROVISIONAL`, inherited from the SIM-QA-04 game simulation).
2. Repeated-booking dampening: the priority weight of the *n*-th booking by the same person within a rolling 30-day window is 1/n² (quadratic dampening).
3. Execution-Equals-Publication: toolpaths and machine programs executed on communal machinery are published to the open commons. *Open question:* add a personal-artwork exemption period, to reconcile this rule with Art. 2.2.1 (inviolable personal creative works)?

### **OL-3 — Stationary Energy Storage Qualification** *(implements Arts. 3.5.2, 6.2.2)*
Currently qualifying technologies (list reviewed every five years):
* Lithium iron phosphate (LFP) and sodium-ion electrochemical cells.
* Flow batteries free of monopolized scarce minerals.
* Mechanical storage: pumped hydro and gravity systems.
* Thermal storage: sand, rock, or molten-salt heat banks.

Excluded: cobalt-dependent chemistries in stationary use. Every qualifying system must carry hardware-level thermal-runaway and cold-charge interlocks; see docket `SIM-QA-14`.

### **OL-4 — Municipal Fabrication Workshop Baseline** *(implements Art. 6.3.2)*
Reference equipment set:
* Computer Numerical Control (CNC) milling.
* Precision lathes.
* Laser or plasma cutting.
* Induction forging.
* Additive manufacturing (polymer, and metal where exergy budgets allow).

### **OL-5 — Telecommunications Bands and Links** *(implements Art. 6.4.2)*
Reference physical layers:
* Wireless mesh in licence-exempt bands.
* Line-of-sight free-space optical links.
* Directional microwave relays.
* Sub-gigahertz long-range low-power telemetry (e.g. chirp-spread-spectrum radio).

Reserved emergency channel plan: to be defined, linked to open question 1 of `SIM-QA-09`.

### **OL-6 — Ambient Safety Telemetry Purge Interval** *(implements Art. 8.2.2)*
Non-trauma acoustic buffers are purged at intervals of **≤ 500 ms**. Edge devices must prove the purge cycle through open firmware and an independent audit (Art. 3.4.5 split-sample principle applied to code).

### **OL-7 — Transitional Interdiction Means** *(implements Art. 8.1.4)*
1. Permitted means in inhabited or mixed perimeters:
   * directional radio-frequency and optical jamming;
   * high-power microwave disruption of electronics;
   * passive tensioned mesh canopies;
   * entangling capture nets.
2. Prohibited in inhabited or mixed perimeters: explosive or fragmenting effectors, and ionizing effectors.
3. **Human exposure:** emitters must keep public-space field strengths within internationally recognized non-ionizing radiation protection limits. The claim made in the `SIM-QA-09` dossier, that high-power microwave pulses cause "< 0.1 °C transient" tissue heating and are therefore harmless, is `PROVISIONAL — UNVERIFIED` and may not be relied upon until supported by reproducible measurements.
4. **Targeting:** autonomous engagement is limited to uncrewed machines and projectiles. Classifiers that cannot exclude crewed vehicles or persons with high confidence must hand the decision over to human authorization.

### **OL-8 — Deep-Space Engineering Parameters** *(implements Arts. 10.5.3, 11.1.1, 11.3.1, 11.4.3, 11.6.2)*
1. **Solar flux regulation (reference design):**
   * Passive diffractive occulting arrays at the Earth–Sun L1 point.
   * Keep-alive authorization beacons; a lapse longer than **14 days** triggers passive radiation-pressure feathering.
   * Gradual dispersal over **36 months** (`PROVISIONAL`).
2. **Habitat atmosphere reference:** ≈ 21% O₂ / 78% N₂ at nominal sea-level total pressure, or equivalent physiologically safe partial pressures for reduced-pressure habitats.
3. **Reference refinement assets:**
   * vacuum induction furnaces;
   * centrifugal smelters;
   * solar concentrators;
   * silicon zone-refining arrays.
4. **Orbital immune system (reference design):**
   * Infrastructure: phased-array laser stations and autonomous interceptor tugs.
   * Peacetime use: solar-sail propulsion and debris removal.
   * Safety: analog geometric blinders that dump beam power when the pointing vector enters a **15°** exclusion cone around any registered inhabited body or habitat (`PROVISIONAL`).

### **OL-9 — Petition Intake Parameters** *(implements Arts. 4.2.1, 4.3.5; source: `SIM-QA-11`, synthetic model, `PROVISIONAL`)*
1. **Endorsement allowance:**
   * 9 civic attention tokens per adult per quarter;
   * *k* endorsements (authored or co-signed) cost *k*² tokens;
   * tokens are non-transferable and have no monetary form.
2. **Thresholds:**
   * co-signers required = max(3, ⌈2% of constituents⌉);
   * fast lane: petitions endorsed by 10% of constituents are heard first;
   * both are recalculated whenever the register changes.
3. **Agenda slots:**
   * fixed per session by a 50%+1 procedural motion, within a juror-hour budget of roughly ≤ 15 h per juror per week;
   * unused slots stay unused.
4. **Lottery:**
   * an endorser backing *k* petitions adds weight 1/*k* to each;
   * the draw uses the public verifiable random beacon of the sortition protocol;
   * unscheduled petitions leave the pool after 13 weeks and may be renewed.
5. **Triage Panel (3):**
   * drawn monthly, under the hiatus rules of Art. 4.3.3;
   * mandate limited to format checks and merging requests that ask for the same action;
   * authors may un-merge by petitioning the council;
   * all triage decisions are logged publicly;
   * any judgment on merit is an impeachable offense under Art. 4.3.4.
6. **Provocatio:**
   * one appeal per party per ruling;
   * appeals are counted against the receiving panel's slot cap.
7. **Rival expert panels (Art. 4.4.2):**
   * "complex" status is certified by a 60% vote;
   * the number of proposals per session that may require rival panels is capped.
