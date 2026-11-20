# **INTER-NODE NETWORK: REQUIREMENTS AND CANDIDATE BUILDING BLOCKS (`roadmap/blueprints/INTER_NODE_NETWORK_REQUIREMENTS.md`)**

> **Working note for the Stage 3 federation network. Not canon.**  
> **Author:** Kyberlex (`kyberlex@proton.me`) | **Companion to:** [`STAGE_3_WATERSHED_FEDERATION_BLUEPRINT.md`](STAGE_3_WATERSHED_FEDERATION_BLUEPRINT.md) (section 2)  
> **License:** CC-BY-SA 4.0 / AGPL-3.0-or-later

**Status:** working note. The Constitution states functional requirements and names no products. The tools listed here are candidates as checked in November 2026 and will go stale.

**When this matters:** Stage 3 (federation of 3 to 5 nodes, Phase 3 in [`roadmap.md`](../roadmap.md)). Before that, a radio mesh inside a single node is enough.

**How the two documents divide the subject:** the Stage 3 blueprint describes the radio hardware and the field checklist. This note holds the requirements every layer must meet, the candidate tools per layer, and the open problems.

---

## 1. What has to travel between nodes

- **Resource accounts:** energy, refined metals and specialized equipment exchanged between basins on open ledgers (Art. 10.3.2).
- **Basin status:** green, amber or red against carrying capacity (Art. 10.4.2), and mutual-aid requests (Art. 10.4.4).
- **Governance by lot:** publicly verifiable draws (Art. 4.3.1), the open civic register and its petitions (Art. 4.3.5), and the decisions of assemblies above neighborhood level (Art. 10.6).
- **Designs and software:** shared blueprints (Art. 6.3.4) and code that every node can rebuild and verify (Art. 7.3).
- **Cross-checks:** for example a forensic audit by a facility drawn by lot from a non-contiguous watershed (Art. 8.4.5).

All of this is small and slow data. None of it needs a fast network.

---

## 2. Requirements

| # | Requirement | Source |
| :--- | :--- | :--- |
| R1 | **Links maintained by the commons:** radio mesh, line-of-sight optical links, fibre along rail and aqueduct corridors. | Art. 6.4 |
| R2 | **Survives disconnection:** every node runs 30 days cut off, and life support never depends on the network. Data syncs when a link is up; nodes work locally in between. | Art. 6.1, Art. 6.5 |
| R3 | **An append-only, signed record** that no single party can rewrite. | Derived from Art. 10.3.2 (open ledgers) and Art. 7.3.3 (auditable build records) |
| R4 | **No master key:** signing keys are split by threshold multi-party computation among assemblies drawn by lot in several watersheds. | Art. 7.4.1 to 7.4.3 |
| R5 | **Open source only, reproducible bit for bit, explainable to ordinary citizens.** | Art. 7.2, Art. 7.3, Art. 7.5 |
| R6 | **Encrypted end to end, no central inspection.** | Art. 6.4.3 |
| R7 | **Zero-knowledge proof of personhood without biometrics.** | Art. 7.4.4 |
| R8 | **Software never decides:** it carries records, people decide. | Art. 7.1 |

---

## 3. Candidate building blocks

| Layer | Meets | Candidates | Maturity and caveats |
| :--- | :--- | :--- | :--- |
| Own links without operators | R1, R2, R6 | Reticulum; community networks such as guifi.net and Freifunk as proof at scale | Reticulum works at small scale across LoRa, Wi-Fi and packet radio. Its manual still calls it an experimental stack. In December 2025 its original author withdrew from public interaction (no support, no issue handling) and said development continues outside the public repository; releases still appear, and a community fork and independent implementations in other languages continue. |
| Signed record that tolerates disconnection | R2, R3, R6 | Git; Radicle (peer-to-peer Git); Holochain | Git is mature. Radicle is active (1.9.0 in May 2026, 1.10.x by September) but disclosed two critical flaws on 23 September 2026 that affect every released version: traffic between nodes is neither encrypted nor authenticated, and a peer can present a node identity that is not its own. Until the announced transport replacement ships as a breaking upgrade, Radicle does not meet R6. Holochain is agent-centric with no global consensus and is less widely deployed. |
| No master key | R4 | Threshold signatures (FROST); Shamir secret sharing for backups only | Sound cryptography with open libraries. FROST signs without ever assembling the key. Plain Shamir sharing rebuilds the key in one place at signing time, so on its own it does not satisfy Art. 7.4. Neither has been run as a ceremony among assemblies drawn by lot. |
| Proof of personhood without biometrics | R7 | BrightID (social graph), Idena (timed puzzles), Human Passport (aggregated credentials) | Weakest link. A well-funded attacker can build convincing fake identities. |
| Open, reproducible software | R5 | Reproducible Builds, Debian, Guix | Mature, in daily use. |

R8 is not a layer. It is a design rule for whatever is built on top: the software records and transports, and no automated step allocates, sanctions or rules.

---

## 4. Open problems

- **Personhood:** who checks that one person is only one person, without biometrics, and who checks the checkers.
- **Key ceremony:** how key splitting among drawn assemblies works as a procedure, not only as a principle.
- **Record format:** the Constitution says "open thermodynamic ledgers" but not what one entry contains.
- **The glue:** nobody has combined these pieces to carry resource accounts and sortition between communities.
- **Transport choice:** the Stage 3 blueprint is written around Reticulum. Given the caveats in section 3, the blueprint treats it as the current candidate and the hardware (LoRa radios, ridge repeaters) stays valid for any replacement stack.

---

## 5. What is used today

The public Git repository already serves as the shared record: every commit is chained by hash to the one before it, and the history is never rewritten. Commits are not yet cryptographically signed, so R3 is met by convention and not by signature. Nothing else needs building until two real nodes exist.
