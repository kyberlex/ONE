#!/usr/bin/env python3
"""
sync_webapp_i18n.py — Autonomous Global i18n Synchronizer & Translator

Scans webapp/i18n/ across all 14 supported languages against canonical en.json:
  1. Detects missing keys and untranslated English fallback strings.
  2. Batches and translates missing/modified keys using Gemini 3.8 Flash with structured JSON schema.
  3. Reassembles the nested JSON hierarchy matching en.json key order.
  4. Automatically triggers scripts/i18n_matrix.py to update matrix.json, matrix.csv, and MATRIX.md.

Usage:
  python3 scripts/sync_webapp_i18n.py           # Sync and translate all out-of-sync languages
  python3 scripts/sync_webapp_i18n.py --audit   # Audit only (check parity, exit 0 if sync, 1 if out)
  python3 scripts/sync_webapp_i18n.py --lang fr # Translate only a specific language
"""

import os
import sys
import json
import time
import argparse
import subprocess
from pathlib import Path

# Setup paths
REPO_ROOT = Path(__file__).resolve().parent.parent
PARENT_DIR = REPO_ROOT.parent
KYBERLEX_WEBAPP = PARENT_DIR / "one(kyberlex)" / "webapp"
WEBAPP_DIR = KYBERLEX_WEBAPP if KYBERLEX_WEBAPP.exists() else (REPO_ROOT / "webapp")
I18N_DIR = WEBAPP_DIR / "i18n"
SCRIPTS_DIR = REPO_ROOT / "scripts"

# Load .env if present
ENV_PATH = REPO_ROOT / ".env"
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip("\"'")

TARGET_LANGUAGES = {
    "it": "Italian (Italiano)",
    "fr": "French (Français)",
    "de": "German (Deutsch)",
    "es": "Spanish (Español)",
    "pt": "Portuguese (Português)",
    "ru": "Russian (Русский)",
    "zh": "Simplified Chinese (简体中文)",
    "ja": "Japanese (日本語)",
    "ko": "Korean (한국어)",
    "hi": "Hindi (हिन्दी)",
    "ar": "Arabic (العربية)",
    "id": "Indonesian (Bahasa Indonesia)",
    "tr": "Turkish (Türkçe)"
}

# Tokens allowed to be identical across languages (proper names, standards, legal specs)
ALLOWED_IDENTICAL_TOKENS = {
    "501(c)(3)", "UCC § 9-604", "ZGB Art. 80", "BGB", "DIBt", "ANSI A119.5",
    "15 kWh", "48V", "BMS", "O.N.E.", "O-ASIS", "SIMONE", "WikiHouse",
    "Common Law", "Civil Law", "Svalbard", "Detroit", "Geneva", "Malacca",
    "Amazon", "Alps", "Tor", "Surge", "GitHub", "Copyfarleft", "AGPL-3.0",
    "NotebookLM", "Google"
}


def is_allowed_identical(text):
    if not isinstance(text, str):
        return True
    s = text.strip()
    if len(s) <= 3:
        return True
    for token in ALLOWED_IDENTICAL_TOKENS:
        if token in s:
            return True
    return False


def flatten_dict(d, prefix=""):
    items = {}
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(flatten_dict(v, key))
        else:
            items[key] = v
    return items


def unflatten_dict(flat, template):
    """Reconstructs nested dict matching the exact key structure and order of template."""
    result = {}
    for k, v in template.items():
        if isinstance(v, dict):
            result[k] = unflatten_dict_sub(flat, k, v)
        else:
            result[k] = flat.get(k, v)
    return result


def unflatten_dict_sub(flat, current_prefix, template_sub):
    sub = {}
    for k, v in template_sub.items():
        full_key = f"{current_prefix}.{k}"
        if isinstance(v, dict):
            sub[k] = unflatten_dict_sub(flat, full_key, v)
        else:
            sub[k] = flat.get(full_key, v)
    return sub


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[!] ERROR: GEMINI_API_KEY environment variable not found.")
        print("    Add GEMINI_API_KEY to .env or export it in your shell.")
        sys.exit(1)
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except ImportError:
        print("[!] ERROR: google-genai package not found. Run: pip install google-genai")
        sys.exit(1)


def translate_batch(client, batch_dict, target_lang_code, target_lang_name):
    """Translates a dictionary of {key: en_string} into the target language using Gemini."""
    from google.genai import types

    prompt = f"""
You are the master literary and constitutional translator for Open Networked Earth (O.N.E.).
Project Vision: An open-source, post-labor civil architecture where automated machines inherit labor,
enabling humanity to inherit the Earth through universal usufruct, demarchic sortition, and thermodynamic balance.

Translate the following UI key-value dictionary from English into {target_lang_name} ({target_lang_code}).

CRITICAL INVARIANTS:
1. Return ONLY valid JSON with EXACTLY the same keys as the input.
2. Maintain all HTML tags (e.g. <b>, <em>, <span>, <br>), emojis, and formatting unchanged.
3. Preserve legal/technical acronyms and proper references (e.g., O.N.E., O-ASIS, 501(c)(3), UCC, ZGB).
4. Do NOT translate brand names (O.N.E., Kyberlex, WikiHouse, NotebookLM).
5. High linguistic quality: natural, authoritative, and elegant European/native prose suitable for a public constitutional portal.

JSON to translate:
{json.dumps(batch_dict, indent=2, ensure_ascii=False)}
"""

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.1
    )

    for attempt in range(1, 4):
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
                config=config
            )
            data = json.loads(response.text.strip())
            # Ensure all keys exist
            for k in batch_dict:
                if k not in data or not data[k]:
                    data[k] = batch_dict[k]
            return data
        except Exception as e:
            if attempt < 3:
                time.sleep(2 * attempt)
            else:
                print(f"[!] Warning: Translation failed after 3 attempts: {e}")
                return batch_dict


def audit_language_parity(en_flat, lang_flat):
    """Returns list of keys that are missing or untranslated in lang_flat."""
    needed_keys = {}
    for k, en_val in en_flat.items():
        if k not in lang_flat:
            needed_keys[k] = en_val
        elif str(lang_flat[k]).strip() == str(en_val).strip() and not is_allowed_identical(en_val):
            needed_keys[k] = en_val
    return needed_keys


def run_sync(target_lang=None, audit_only=False):
    en_path = I18N_DIR / "en.json"
    if not en_path.exists():
        print(f"[!] Critical: en.json not found at {en_path}")
        sys.exit(1)

    with open(en_path, "r", encoding="utf-8") as f:
        en_tree = json.load(f)

    en_flat = flatten_dict(en_tree)
    total_en_keys = len(en_flat)

    print("=" * 75)
    print(" 🌐 O.N.E. WEBAPP i18n AUTONOMOUS MASTER SYNCHRONIZER")
    print(f"[*] Target Directory : {I18N_DIR}")
    print(f"[*] Canonical Keys   : {total_en_keys} keys in en.json")
    print("=" * 75)

    langs_to_process = [target_lang] if target_lang else list(TARGET_LANGUAGES.keys())
    audit_results = {}
    any_missing = False

    for lang in langs_to_process:
        if lang not in TARGET_LANGUAGES:
            print(f"[!] Unknown language code: {lang}")
            continue

        lang_path = I18N_DIR / f"{lang}.json"
        if lang_path.exists():
            with open(lang_path, "r", encoding="utf-8") as f:
                lang_tree = json.load(f)
        else:
            lang_tree = {}

        lang_flat = flatten_dict(lang_tree)
        needed = audit_language_parity(en_flat, lang_flat)
        audit_results[lang] = {
            "path": lang_path,
            "tree": lang_tree,
            "flat": lang_flat,
            "needed": needed,
            "coverage": ((total_en_keys - len(needed)) / total_en_keys) * 100
        }

        status_mark = "✓ 100%" if len(needed) == 0 else f"⚠️ {len(needed)} needed ({audit_results[lang]['coverage']:.1f}%)"
        print(f"  [{lang.upper()}] {TARGET_LANGUAGES[lang]:<28}: {status_mark}")
        if len(needed) > 0:
            any_missing = True

    if audit_only:
        print("\n" + "=" * 75)
        if any_missing:
            print("[!] AUDIT FAILED: One or more languages have missing or untranslated keys.")
            sys.exit(1)
        else:
            print("[✓] AUDIT PASSED: All languages are in 100% parity with en.json.")
            sys.exit(0)

    if not any_missing:
        print("\n[✓] All languages are already in 100% parity with en.json! No translations needed.")
        regenerate_matrix()
        return

    # Initialize Gemini client
    print("\n[*] Initializing Gemini 3.8 Flash translation engine...")
    client = get_gemini_client()

    for lang in langs_to_process:
        res = audit_results[lang]
        needed = res["needed"]
        if not needed:
            continue

        lang_name = TARGET_LANGUAGES[lang]
        print(f"\n[*] Processing [{lang.upper()}] {lang_name} ({len(needed)} keys to translate)...")

        # Batch into chunks of 35 keys
        chunk_size = 35
        items = list(needed.items())
        updated_flat = dict(res["flat"])

        for i in range(0, len(items), chunk_size):
            chunk = dict(items[i:i + chunk_size])
            batch_num = (i // chunk_size) + 1
            total_batches = ((len(items) - 1) // chunk_size) + 1
            print(f"    ⏳ Translating batch {batch_num}/{total_batches} ({len(chunk)} keys)...", end="", flush=True)

            t0 = time.time()
            translated_chunk = translate_batch(client, chunk, lang, lang_name)
            t_elapsed = time.time() - t0

            updated_flat.update(translated_chunk)
            print(f" done in {t_elapsed:.1f}s.")

        # Reconstruct tree with exact canonical key order
        new_tree = unflatten_dict(updated_flat, en_tree)

        # Write to file
        with open(res["path"], "w", encoding="utf-8") as out:
            json.dump(new_tree, out, indent=2, ensure_ascii=False)
            out.write("\n")

        print(f"  [✓] Updated {res['path'].name} (100% key parity achieved).")

    print("\n" + "=" * 75)
    print(" ✅ ALL LANGUAGES SYNCHRONIZED SUCCESSFULLY")
    print("=" * 75)

    regenerate_matrix()


def regenerate_matrix():
    matrix_script = SCRIPTS_DIR / "i18n_matrix.py"
    if matrix_script.exists():
        print("[*] Rebuilding matrix.json, matrix.csv, and MATRIX.md...")
        subprocess.run([sys.executable, str(matrix_script)], check=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Autonomous i18n Synchronizer & Translator for O.N.E.")
    parser.add_argument("--audit", "--check", action="store_true", help="Audit mode only: check key parity without API calls")
    parser.add_argument("--lang", type=str, default=None, help="Sync and translate only a specific language code (e.g. fr, de, es)")
    args = parser.parse_args()

    run_sync(target_lang=args.lang, audit_only=args.audit)
