# **O-ASIS PURPLE PATCHES — AUDIT RECORD**

> **Merged 2026-10-30.** `PURPLE_PATCH_SIM-QA-10_11_15_17.patch` has been applied to the Living Constitution; the Organic Law Annex now lives at [`ORGANIC_LAW_ANNEX.md`](../../ORGANIC_LAW_ANNEX.md). This folder is kept as the audit trail of the exact diff.

This folder holds compiled Purple Patches that have passed Stage 3 of the [hardening lifecycle](../SIM_QA_TODO.md) but are **not yet merged** into the Living Constitution.

The master constitution file is write-locked at filesystem level (canonical immutability), so no agent applies these patches automatically. A human steward must review them and merge them deliberately.

| File | Content |
| :--- | :--- |
| [`PURPLE_PATCH_SIM-QA-10_11_15_17.patch`](PURPLE_PATCH_SIM-QA-10_11_15_17.patch) | Unified diff covering the master constitution and the mirrored `bible/chapters/` files (38 hunks). |
| [`ORGANIC_LAW_ANNEX_DRAFT.md`](ORGANIC_LAW_ANNEX_DRAFT.md) | Draft Organic Law Annex (OL-1 to OL-9) that receives the technical detail moved out of the Constitution. |

## **What the patch changes**

* **SIM-QA-10:**
  * new Art. 3.1.6, Tier 1 Autarkic Closure audit;
  * Art. 3.5.2 reserves are composed by audit gaps and include redundant capacity.
* **SIM-QA-11:**
  * new Art. 4.3.5, petition intake and deliberative capacity;
  * Art. 4.2.1 Provocatio standing and joinder.
* **SIM-QA-15, internal coherence:**
  * weapons (7.1.2, 8.1.3, 8.1.4);
  * the 66% threshold in 10.5.3 normalized;
  * threshold arithmetic (new 4.5.4);
  * small-panel veto (2.6.2);
  * labor sanction no longer touches political rights or Tier 1 shelter (5.2);
  * Constitutional Review Jury (new 4.6);
  * association vs. faction ban (4.1.3);
  * supermajorities can no longer diminish Chapter I (4.5.1, 8.6.2).
* **SIM-QA-17:**
  * technology-neutral wording in Arts. 1.4.3, 3.3.3, 3.5.2, 6.2.2, 6.3.2, 6.4.2, 8.1.4, 8.2.2, 10.5.3, 11.1.1, 11.3.1, 11.4.3 and 11.6.2;
  * new Art. 10.6.4 anchors the Organic Law Annex.

Chapter word counts after the patch:
* Chapter III: 903 words.
* Chapter IV: 939 words, above the 900-word drafting target because it gains two new mechanisms.
* All other chapters: 727 to 891 words.

## **Merge procedure (human steward)**

1. Review the diff: `git apply --stat` and then read it in full.
2. Temporarily lift the immutability flag on the master file, using the steward's own documented procedure.
3. Apply from the repository root: `git apply oasis/purple_patches/PURPLE_PATCH_SIM-QA-10_11_15_17.patch`
4. Restore the immutability flag.
5. Move `ORGANIC_LAW_ANNEX_DRAFT.md` to `bible/organic_law_annex.md` and update its status line.
6. Flip the docket statuses to `CANONICAL_MERGED` in `oasis/sim_resolutions_qa.md` and `oasis/SIM_QA_TODO.md`.
7. Regenerate the translations (`bible/*_xx.md`, `bible/chapters_xx/`) and the EPUB through the usual localization pipeline.

