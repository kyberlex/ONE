# -*- coding: utf-8 -*-
"""
Applies all 12 handbook translations into sim/app/src/i18n/{lang}.js files.
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later
"""

import os
import sys

# Import language modules
from i18n_handbook_es_fr_pt import ES_HANDBOOK, FR_HANDBOOK, PT_HANDBOOK
from i18n_handbook_de_ru_tr import DE_HANDBOOK, RU_HANDBOOK, TR_HANDBOOK
from i18n_handbook_zh_ja_ko import ZH_HANDBOOK, JA_HANDBOOK, KO_HANDBOOK
from i18n_handbook_ar_hi_id import AR_HANDBOOK, HI_HANDBOOK, ID_HANDBOOK

LANG_MAP = {
    'es': ES_HANDBOOK,
    'fr': FR_HANDBOOK,
    'pt': PT_HANDBOOK,
    'de': DE_HANDBOOK,
    'ru': RU_HANDBOOK,
    'tr': TR_HANDBOOK,
    'zh': ZH_HANDBOOK,
    'ja': JA_HANDBOOK,
    'ko': KO_HANDBOOK,
    'ar': AR_HANDBOOK,
    'hi': HI_HANDBOOK,
    'id': ID_HANDBOOK
}

def escape_js_val(val: str) -> str:
    # Escape single quotes and newlines safely for single-quoted JS strings
    escaped = val.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')
    return f"'{escaped}'"

def apply_translations():
    i18n_dir = os.path.join(os.path.dirname(__file__), 'app', 'src', 'i18n')
    
    # Read keys order from en.js
    en_path = os.path.join(i18n_dir, 'en.js')
    with open(en_path, 'r', encoding='utf-8') as f:
        en_lines = f.readlines()
    
    en_keys = []
    for line in en_lines:
        s = line.strip()
        if s.startswith('handbook') or s.startswith('badgeRulebook') or s.startswith('winMilestone') or \
           s.startswith('loseCondition') or s.startswith('quickstart') or s.startswith('qsStep') or \
           s.startswith('resources') or s.startswith('res') or s.startswith('backpackRule') or \
           s.startswith('rules') or s.startswith('rule') or s.startswith('robots') or \
           s.startswith('bot') or s.startswith('robotZeroHour') or s.startswith('controls') or \
           s.startswith('ctrl') or s.startswith('faq'):
            parts = s.split(':', 1)
            if len(parts) == 2:
                en_keys.append(parts[0].strip())
    
    print(f"Total handbook keys extracted from en.js: {len(en_keys)}")
    
    for lang, trans_dict in LANG_MAP.items():
        lang_path = os.path.join(i18n_dir, f"{lang}.js")
        if not os.path.exists(lang_path):
            print(f"Error: {lang_path} does not exist!")
            continue
        
        with open(lang_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Find where handbook begins
        start_idx = -1
        for idx, line in enumerate(lines):
            if line.strip().startswith('handbookBtnLabel:'):
                start_idx = idx
                break
        
        if start_idx == -1:
            print(f"Warning: Could not find handbookBtnLabel in {lang}.js")
            continue
        
        # Find end of object (closing };)
        end_idx = -1
        for idx in range(len(lines) - 1, start_idx, -1):
            if lines[idx].strip().startswith('};'):
                end_idx = idx
                break
        
        if end_idx == -1:
            print(f"Warning: Could not find closing '}};' in {lang}.js")
            continue
        
        # Build new handbook lines
        new_handbook_lines = []
        for key in en_keys:
            val = trans_dict.get(key)
            if val is None:
                print(f"Missing key in {lang}: {key}")
                # Fallback to en
                continue
            formatted_line = f"  {key}: {escape_js_val(val)},\n"
            new_handbook_lines.append(formatted_line)
        
        # Reconstruct file
        new_file_lines = lines[:start_idx] + new_handbook_lines + lines[end_idx:]
        
        with open(lang_path, 'w', encoding='utf-8') as f:
            f.writelines(new_file_lines)
        
        print(f"✅ Successfully updated {lang}.js ({len(new_handbook_lines)} keys injected)")

if __name__ == '__main__':
    apply_translations()
