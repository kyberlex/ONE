# 🌐 O.N.E. Master Internationalization (i18n) & Translation Matrix

> **Last Audit Generated:** `2026-09-19 13:50:54`  
> **Canon:** English (`en`) is the immutable master source of truth.  
> **Coverage Model:** Reflects the **100% REAL current state** across UI Shell, Content Datasets, E-Books, and Novel Chapters.

## 1. Executive Summary & Language Readiness Dashboard

| Flag | Code | Language | Overall Readiness | UI Shell (282 keys) | Constitution (60 arts) | Challenge QA (315) | E-Books (7 ePubs) | Status |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 🇬🇧 | `en` | **English** | **100.0%** | 100.0% (282/282) | 60/60 | 315/315 | 7/7 | 🟢 Fully Supported |
| 🇮🇹 | `it` | **Italiano** | **99.3%** | 98.2% (277/282) | 60/60 | 315/315 | 7/7 | 🟢 Fully Supported |
| 🇫🇷 | `fr` | **Français** | **81.6%** | 91.5% (258/282) | 60/60 | 315/315 | 0/7 | 🟡 Substantially Ready |
| 🇩🇪 | `de` | **Deutsch** | **85.9%** | 91.5% (258/282) | 60/60 | 315/315 | 2/7 | 🟡 Substantially Ready |
| 🇪🇸 | `es` | **Español** | **96.7%** | 91.8% (259/282) | 60/60 | 315/315 | 7/7 | 🟢 Fully Supported |
| 🇵🇹 | `pt` | **Português** | **96.7%** | 91.8% (259/282) | 60/60 | 315/315 | 7/7 | 🟢 Fully Supported |
| 🇨🇳 | `zh` | **中文** | **97.0%** | 92.6% (261/282) | 60/60 | 315/315 | 7/7 | 🟢 Fully Supported |
| 🇯🇵 | `ja` | **日本語** | **82.0%** | 92.6% (261/282) | 60/60 | 315/315 | 0/7 | 🟡 Substantially Ready |
| 🇰🇷 | `ko` | **한국어** | **84.7%** | 99.3% (280/282) | 60/60 | 315/315 | 0/7 | 🟡 Substantially Ready |
| 🇮🇳 | `hi` | **हिन्दी** | **99.7%** | 99.3% (280/282) | 60/60 | 315/315 | 7/7 | 🟢 Fully Supported |
| 🇸🇦 | `ar` | **العربية** | **82.0%** | 92.6% (261/282) | 60/60 | 315/315 | 0/7 | 🟡 Substantially Ready |
| 🇷🇺 | `ru` | **Русский** | **89.0%** | 99.3% (280/282) | 60/60 | 315/315 | 2/7 | 🟡 Substantially Ready |
| 🇮🇩 | `id` | **Bahasa Indonesia** | **84.3%** | 98.2% (277/282) | 60/60 | 315/315 | 0/7 | 🟡 Substantially Ready |
| 🇹🇷 | `tr` | **Türkçe** | **84.4%** | 98.6% (278/282) | 60/60 | 315/315 | 0/7 | 🟡 Substantially Ready |

---

## 2. E-Books (.ePub) Availability Matrix (Autonomous Discovery)

> **Decoupled Architecture:** The webapp automatically senses which `.epub` files are present in `webapp/assets/ebooks/`. When a new translation is published, **no code changes to `app.js` or `index.html` are required**.

| Volume / Title | 🇬🇧 `en` | 🇮🇹 `it` | 🇫🇷 `fr` | 🇩🇪 `de` | 🇪🇸 `es` | 🇵🇹 `pt` | 🇨🇳 `zh` | 🇯🇵 `ja` | 🇰🇷 `ko` | 🇮🇳 `hi` | 🇸🇦 `ar` | 🇷🇺 `ru` | 🇮🇩 `id` | 🇹🇷 `tr` |
|:---| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Constitution: Open Networked Earth (O.N.E.)** | ✅ | ✅ | ⏳ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 0: Genesis (The Conclave)** | ✅ | ✅ | ⏳ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ✅ | ⏳ | ⏳ |
| **Volume 1: Day Zero (The Ignition)** | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ✅ | ⏳ | ⏳ |
| **Volume 2: The Transalpine Corridor** | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 3: The Forest of Shadows** | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 4: The Maritime Trench** | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 5: The Geneva Conclave** | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |

---

## 3. Novel Volumes & Chapters Translation Breakdown (274 Chapters + Constitution)

> **Canon Architecture:** 1 Master Constitution (10 statutory parts) + 6 Volumes (Vol 0 has 24 chapters; Vols 1–5 have 50 chapters each) = **284 chapters per language** (3,976 total across 14 languages).

| Volume / Section | Target | 🇬🇧 `en` | 🇮🇹 `it` | 🇫🇷 `fr` | 🇩🇪 `de` | 🇪🇸 `es` | 🇵🇹 `pt` | 🇨🇳 `zh` | 🇯🇵 `ja` | 🇰🇷 `ko` | 🇮🇳 `hi` | 🇸🇦 `ar` | 🇷🇺 `ru` | 🇮🇩 `id` | 🇹🇷 `tr` |
|:---|:---:| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Constitution (10 Parts)** | 10 | ✅ | ✅ | ⏳ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 0: Genesis (24 Ch)** | 24 | ✅ | ✅ | ⏳ | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ✅ | ⏳ | ⏳ |
| **Volume 1: Ground Zero (50 Ch)** | 50 | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ✅ | ⏳ | ⏳ |
| **Volume 2: Transalpine Corridor (50 Ch)** | 50 | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⚡ 27/50 | ⏳ | ⏳ |
| **Volume 3: Forest of Shadows (50 Ch)** | 50 | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 4: Maritime Trench (50 Ch)** | 50 | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **Volume 5: Geneva Conclave (50 Ch)** | 50 | ✅ | ✅ | ⏳ | ⏳ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| **TOTAL CHAPTERS COMPLETED** | **284** | **284/284** | **284/284** | **0/284** | **34/284** | **284/284** | **284/284** | **284/284** | **0/284** | **0/284** | **284/284** | **0/284** | **101/284** | **0/284** | **0/284** |

---

## 4. Nightly Autonomous Pipeline & Cost Ledger (01:00 AM – 07:00 AM)

> **Engine:** `scripts/autonomous_translation_daemon.py` using `gemini-3.1-flash-lite` with `thinking_budget=0`.  
> **Empirical Metrics:** 0.00139 CHF / chapter • 9.4s / chapter • Google Prepay Balance: **28.67 CHF**.

| Flag | Code | Language | Completed | Remaining | Estimated Cost | Est. Duration | Schedule Window | Status |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---|:---|
| 🇬🇧 | `en` | **English** | 284/284 | 0 cap | 0.00 CHF | 0h | Archived | 🟢 Completed |
| 🇮🇹 | `it` | **Italiano** | 284/284 | 0 cap | 0.00 CHF | 0h | Archived | 🟢 Completed |
| 🇫🇷 | `fr` | **Français** | 0/284 | 284 cap | 0.39 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued |
| 🇩🇪 | `de` | **Deutsch** | 34/284 | 250 cap | 0.35 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued (Priority 2) |
| 🇪🇸 | `es` | **Español** | 284/284 | 0 cap | 0.00 CHF | 0h | Archived | 🟢 Completed |
| 🇵🇹 | `pt` | **Português** | 284/284 | 0 cap | 0.00 CHF | 0h | Archived | 🟢 Completed |
| 🇨🇳 | `zh` | **中文** | 284/284 | 0 cap | 0.00 CHF | 0h | Archived | 🟢 Completed |
| 🇯🇵 | `ja` | **日本語** | 0/284 | 284 cap | 0.39 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued |
| 🇰🇷 | `ko` | **한국어** | 0/284 | 284 cap | 0.39 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued |
| 🇮🇳 | `hi` | **हिन्दी** | 284/284 | 0 cap | 0.00 CHF | 0h | Archived | 🟢 Completed |
| 🇸🇦 | `ar` | **العربية** | 0/284 | 284 cap | 0.39 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued |
| 🇷🇺 | `ru` | **Русский** | 101/284 | 183 cap | 0.25 CHF | 0.5h | Tonight 01:00 AM | ⚡ In Progress (Priority 1) |
| 🇮🇩 | `id` | **Bahasa Indonesia** | 0/284 | 284 cap | 0.39 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued |
| 🇹🇷 | `tr` | **Türkçe** | 0/284 | 284 cap | 0.39 CHF | 0.7h | Tonight 01:00–07:00 | ⏳ Queued |
| 🌐 | `ALL` | **TOTAL REMAINING CATALOG** | **1839/3976** | **2137 cap** | **2.97 CHF** | **5.6h (0.9 nights)** | **01:00 – 07:00 Window** | **28.67 CHF Prepay Covers 100%** |

---

## 5. Structured Content Datasets Status (Deep Text)

| Dataset | Target Units | Fully Translated Languages | Fallback to English Languages | Notes |
|:---|:---:|:---|:---|:---|
| **Constitution Articles** (`constitution_<lang>.json`) | 60 Articles | `en`, `it`, `fr`, `de`, `es`, `pt`, `zh`, `ja`, `ko`, `hi`, `ar`, `ru`, `id`, `tr` |  | High-stakes legal text, fully synchronized for 6 languages |
| **Challenge Q&A Scenarios** (`epistemic_qa_<lang>.json`) | 315 Scenarios | `en`, `it`, `fr`, `de`, `es`, `pt`, `zh`, `ja`, `ko`, `hi`, `ar`, `ru`, `id`, `tr` |  | Adversarial simulation scenarios & proofs |

---

## 6. UI Shell Strings Breakdown by Webapp Section

| Section | Keys | IT | FR | DE | ES | PT | ZH | JA | KO | HI | AR | RU | ID | TR |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`books`** | 17 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`challenge`** | 40 | 100% | 95% | 95% | 95% | 95% | 95% | 95% | 95% | 95% | 95% | 95% | 95% | 95% |
| **`const`** | 14 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`features`** | 8 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`footer`** | 2 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`gateway`** | 18 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`general`** | 2 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`hero`** | 7 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`modal`** | 3 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`nav`** | 5 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`primer_content`** | 4 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`roadmap`** | 71 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`roadmap_config`** | 50 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`roadmap_stepper`** | 2 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`synoptic`** | 9 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| **`volume_details`** | 30 | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |

---

## 5. Mandatory "English-First" Translation Workflow

Whenever a UI string, dataset, or ebook is modified or added:
1. **Always edit English first (`webapp/i18n/en.json`, `webapp/data/constitution.json`, etc.)**:
   English is the single canonical source of truth.
2. **Run the Matrix Audit**:
   ```bash
   python3 scripts/i18n_matrix.py
   ```
   This will immediately identify untranslated keys across all 13 target languages and update `matrix.json`, `matrix.csv`, and `MATRIX.md`.
3. **Update Translations in Batches**:
   Add corresponding keys to the target `webapp/i18n/<lang>.json` files or generate `constitution_<lang>.json` / `epistemic_qa_<lang>.json`.
4. **Publishing New E-Books (.epub)**:
   - Place the compiled `.epub` file into `webapp/assets/ebooks/`.
   - Name format: `O.N.E._Vol{N}_Open_Networked_Earth_{lang}.epub` (or `ONE NETWORKED EARTH (O.N.E.)_{lang}.epub` for Constitution).
   - Re-run `python3 scripts/i18n_matrix.py` (which automatically updates `available_ebooks.json`).
   - **Zero code changes** required in `app.js` or `index.html`: the client automatically discovers and renders the download buttons.

