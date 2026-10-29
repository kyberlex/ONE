# **DEMARCHIC SORTITION & SUPERMAJORITY PROTOCOL SPECIFICATION (`foundation/SORTITION_PROTOCOL_SPEC.md`)**
## **Cryptographic Selection, Odd-Parity Quorums & Deliberative State Machine**

**Document ID:** `FOUNDATION-SORTITION-V1`  
**Constitutional Anchor:** Chapter IV (Demarchic Governance & Sortition Assemblies)  
**Simulation Coupling:** [`simone/src/layer3_sortition.jl`](../simone/src/layer3_sortition.jl)  
**Pillar Alignment:** **Pillar 2** (Governance, Sortition & Swiss Law) & **Pillar 3** (`Simone.jl`) — [GitHub Discussion #10](https://github.com/kyberlex/ONE/discussions/10)  
**Author Persona:** Kyberlex (`kyberlex@proton.me`) | **License:** AGPL-3.0-or-later / CC-BY-SA 4.0

---

## **I. CORE INVARIANTS OF O.N.E. DEMARCHY**

To permanently prevent the emergence of career politicians, electoral party machines, lobbying cartels, and tie-vote gridlock, all legislative and adjudicative assemblies in Open Networked Earth obey two mathematical invariants verified in [`simone/src/layer3_sortition.jl`](../simone/src/layer3_sortition.jl):

1. **Strict Odd-Number Parity (`VALID_SORTITION_QUORUMS`):** Every seated deliberative body must contain an odd number of citizens ($2k + 1$), mathematically eliminating 50/50 deadlocks without vesting tie-breaking power in an executive president:
   - **Tier 0 — Local Mediation Panel:** **$3$** citizens (inter-household friction, usufruct sabbatical verification)
   - **Tier 1 — Neighborhood Sortition Council:** **$15$** citizens (village/MHU cluster operations, $N \approx 150\text{–}500$)
   - **Tier 2 — Bioregional Watershed Assembly:** **$101$** delegates (inter-node Leontief logistics, aquifer carrying capacity)
   - **Tier 3 — Continental Federation Council:** **$301$** citizens (trans-regional infrastructure & ecological corridors)
   - **Tier 4 — Global Commons Assembly:** **$1,001$** citizens (Class-1 Constitutional Amendments & Statutory Annex ratifications)
2. **Universal 75% Qualified Supermajority (`CONSTITUTIONAL_SUPERMAJORITY = 0.75`):** All structural rule changes, resource de-commodification acts, and emergency vetoes require $\lceil 0.75 \times N_{\text{jurors}} \rceil$ affirmative votes:
   - For $N = 3 \rightarrow 3/3$ ($100\%$)
   - For $N = 15 \rightarrow 12/15$ ($80.0\%$)
   - For $N = 101 \rightarrow 76/101$ ($75.25\%$)
   - For $N = 301 \rightarrow 226/301$ ($75.08\%$)
   - For $N = 1,001 \rightarrow 751/1,001$ ($75.02\%$)

---

## **II. THE 5-STAGE DELIBERATIVE STATE MACHINE**

```
[ STAGE 1: VRF LOTTERY ] ──► [ STAGE 2: COGNITIVE UNBURDENING ] ──► [ STAGE 3: ADVERSARIAL HEARINGS ]
Stratified random draw       Jurors excused from routine duty       Proponents, Critics & SIMONE runs
Odd parity + Cooldown check  Plain-language brief (<1,500 words)    Thermodynamic impact audit
                                                                               │
[ STAGE 5: ROTATION & AUDIT ] ◄──── [ STAGE 4: 75% SUPERMAJORITY VOTE ] ◄──────┘
Immediate dissolution of jury       Anonymous cryptographic tally
24-month juror cooldown lock        Ratified if Yes >= ceil(0.75 * N)
```

### **Stage 1: Verifiable Random Function (VRF) Lottery & Stratification**
* **Entropy Source:** Public commit-reveal beacon combined with decentralized Verifiable Random Functions (RFC 9381 ECVRF) so that no administrator can predict or bias the draw.
* **Stratified Sampling:** For assemblies of $N \ge 101$, the draw is stratified across bioregional nodes, age cohorts, and technical/care skill domains to prevent accidental demographic skew.
* **Anti-Dynasty Cooldown:** Any citizen who completes a Tier 2–4 assembly term automatically enters a **24-month statutory cooldown** during which they cannot be drawn again for the same tier.

### **Stage 2: Cognitive Unburdening & Plain-Language Mandate**
* **Civic Duty Credit:** Seated jurors are 100% exempted from routine 15h/week maintenance duties during deliberation so that participation never penalizes rest or family life.
* **Anti-Filibuster Brief Cap:** Every proposal submitted to a Sortition Assembly must fit within a **1,500-word plain-language brief** accompanied by a deterministic `Simone.jl` thermodynamic impact report (showing net effect on kWh, L water, and kcal reserves).

### **Stage 3: Adversarial Hearings (Proponents vs. Red-Team Critics)**
* Every assembly hears structured testimony from both the proposal authors and an independent **Adversarial Critic Panel** (tasked with exposing thermodynamic bottlenecks or hidden externalities).

### **Stage 4: Odd-Parity Quorum Check & 75% Supermajority Vote**
* Prior to tallying, the protocol executes `verify_odd_parity_quorum(total_jurors)` and `evaluate_supermajority_vote(yes_votes, total_jurors)` (`simone/src/layer3_sortition.jl`).
* If an individual juror drops out due to illness prior to the vote, an odd-parity alternate drawn from the same VRF seed is seated so that $N_{\text{jurors}}$ remains strictly odd at the moment of the ballot.

### **Stage 5: Dissolution, Cryptographic Audit & Rotation**
* Immediately upon recording the vote hash in the public ledger, the jury is permanently dissolved. Because ad-hoc juries exist only for a single bounded docket and dissolve upon voting, **lobbying, bribery, and partisan horse-trading are rendered structurally unprofitable.**

---

## **III. STATISTICAL IMMUNITY AGAINST FACTIONAL CAPTURE (HYPERGEOMETRIC AUDIT)**

A frequent adversarial critique of sortition is: *"What if a coordinated subversive faction ($f\%$ of the population) gets lucky in the random draw and captures an assembly to pass a self-serving rule?"*

Because O.N.E. combines **Random Sampling Without Replacement (Hypergeometric Distribution)** with the **Universal 75% Qualified Supermajority Rule** ($k \ge \lceil 0.75 \times Q \rceil$), the probability that a minority faction of share $f$ captures a seated assembly of odd quorum $Q$ in a community of $N_{\text{pop}}$ citizens is:

$$P(\text{Capture} \mid N_{\text{pop}}, K_{\text{faction}}, Q) = \sum_{k = \lceil 0.75 Q \rceil}^{Q} \frac{\binom{K_{\text{faction}}}{k} \binom{N_{\text{pop}} - K_{\text{faction}}}{Q - k}}{\binom{N_{\text{pop}}}{Q}}$$

### **Reference Capture Probability Table (Assuming a Hostile Coordinated Faction of $f = 20\%$ of Population)**

| Assembly Tier | Odd Quorum ($Q$) | Votes Needed for 75% ($\lceil 0.75 Q \rceil$) | Probability of Capture by a $20\%$ Faction | Institutional Scope & Safeguard |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0 (Local Mediation)** | **$3$** | $3 / 3$ ($100\%$) | $0.0080$ ($0.8\%$) | Non-binding mediation only; instant appeal to Tier 1 ($Q=15$). |
| **Tier 1 (Neighborhood Council)** | **$15$** | $12 / 15$ ($80.0\%$) | $1.02 \times 10^{-6}$ ($0.0001\%$) | Local operational scheduling; cannot alter property or constitutional rights. |
| **Tier 2 (Bioregional Assembly)** | **$101$** | $76 / 101$ ($75.25\%$) | $< 10^{-31}$ (Virtually Zero) | Watershed Leontief allocation; statistically immune to $20\%$ factional capture. |
| **Tier 3 (Continental Council)** | **$301$** | $226 / 301$ ($75.08\%$) | $< 10^{-90}$ (Zero) | Continental ecological corridors & infrastructure standards. |
| **Tier 4 (Global Assembly)** | **$1,001$** | $751 / 1,001$ ($75.02\%$) | $< 10^{-290}$ (Zero) | Constitutional amendments & Statutory Annex I ratifications. |

---

## **IV. RFC 9381 ECVRF PAYLOAD SCHEMA & OPEN PROOF-OF-WORK (`PoW 2A` & `PoW 2C`)**

Each sortition draw emits a publicly verifiable JSON receipt coupling the cryptographic lottery to [`simone/src/layer3_sortition.jl`](../simone/src/layer3_sortition.jl):

```json
{
  "protocol": "ONE-SORTITION-ECVRF-ED25519-SHA512-TAI",
  "docket_id": "OIP-2026-004-AQUIFER-BUFFER",
  "assembly_tier": 2,
  "odd_quorum_size": 101,
  "supermajority_threshold_votes": 76,
  "eligible_citizen_pool_count": 4500,
  "cooldown_excluded_count": 202,
  "vrf_alpha_seed": "block_hash_commit_reveal || docket_id || timestamp_utc",
  "vrf_pi_proof": "0x9f8a...[80-byte-RFC9381-proof]",
  "seated_juror_ids_odd_verified": true,
  "alternate_pool_size": 15
}
```

### **Open Proof-of-Work Tasks for Pillar 2 Collaborators:**
* **`PoW 2A` (State Machine & Cooldown Rotation in `Simone.jl`):** Expand `simone/src/layer3_sortition.jl` so that `draw_stratified_odd_jury` enforces the 24-month juror cooldown bitmap, handles mid-session juror illness replacement from the pre-drawn alternate list while preserving odd parity, and logs state transitions across `SortitionProposalState`.
* **`PoW 2C` (Adversarial Factional & Sybil Stress-Test):** Simulate a multi-year agent-based attack in `Simone.jl` where a coalition of low-HEXACO agents ($H < 2.0$) attempts to collude across repeated Tier 0 ($Q=3$) and Tier 1 ($Q=15$) draws, measuring the exact false-positive escalation rate to Tier 2.


