# Archive: Round 2 O-ASIS Stress-Test & Patches

## Overview
This archive preserves the complete multi-agent adversarial stress-test suite (`ENG-01` through `ENG-10`) conducted against the patched Constitution of Open Networked Earth (O.N.E.) in English.

- **Date Captured:** 2026-09-14
- **Model Used:** Google Gemini (`gemini-3.8-flash` with Extended Thinking, 8192–16384 token budget)
- **Target Baseline:** Patched Constitution incorporating Round 1 amendments

## Summary of Results
- **Fully Neutralized (`patch_required: false`):**
  - `ENG-02` (Chapter II): `SV-4_INFORMATIONAL` (ISDS & bank embargoes neutralized by DvP risk transfer and 36-month reserves)
  - `ENG-09` (Chapter IX): `SV-4_INFORMATIONAL` (Central bank clearinghouse embargoes absorbed by domestic demonetization)
  - `ENG-10` (Chapter X): `SV-4_INFORMATIONAL` (Subsidiarity limits prevent watershed transit refugee closures)
- **Downgraded from Critical to Moderate:**
  - `ENG-05` (Chapter V): `SV-3_MODERATE` (Squatter's fortress deadlock solved by Non-Kinetic Metabolic Decoupling)
- **Second-Order Edge Cases Patched:**
  - `ENG-01` (Chapter I): `SV-3_MODERATE` (Non-disclosed TWAP/barter escrow against 24h front-running)
  - `ENG-03` (Chapter III): `SV-2_CRITICAL` (Thermodynamic Lexicographic Viability Operator $\mathcal{L}_{\min}$)
  - `ENG-04` (Chapter IV): `SV-2_CRITICAL` (Ratchet mechanism for 41-delegate blocking deadlock)
  - `ENG-06` (Chapter VI): `SV-2_CRITICAL` (Sub-second Joukowsky fluid damping & parameterized runtime rheology)
  - `ENG-07` (Chapter VII): `SV-2_CRITICAL` (Semantic compilation equivalence vs cross-ISA binary hashing; batched trip reviews)
  - `ENG-08` (Chapter VIII): `SV-2_CRITICAL` (Origin-vector counter-battery suppression against out-of-boundary standoff firing platforms)

## Contents
1. `transcripts/`: Verifiable multi-agent dialogues (Phases 1–6) for all 10 engagements.
2. `patches/`: 7 formal Unified Diff (`.diff`) files compiled by Purple Team.
3. `knowledge_base_exports/`: 10-entry dataset (`epistemic_qa_pairs.jsonl`) generated across Round 2 for downstream RAG retrieval.
