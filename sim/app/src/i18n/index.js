/**
 * Internationalization (i18n) Engine for O-ASIS Dual-Track
 * Supports all 14 official languages from the O.N.E. webapp:
 * en, it, es, fr, de, pt, ru, zh, ja, ko, hi, ar, id, tr
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { en } from './en.js';
import { it } from './it.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { pt } from './pt.js';
import { ru } from './ru.js';
import { zh } from './zh.js';
import { ja } from './ja.js';
import { ko } from './ko.js';
import { hi } from './hi.js';
import { ar } from './ar.js';
import { id } from './id.js';
import { tr } from './tr.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
];

const dictionaries = {
  en,
  it,
  es,
  fr,
  de,
  pt,
  ru,
  zh,
  ja,
  ko,
  hi,
  ar,
  id,
  tr
};

class I18nManager {
  constructor() {
    // English-only mode: all translations hidden/disabled until game is finalized
    try {
      localStorage.removeItem('oasis_lang');
    } catch (e) {
      // ignore
    }
    this.currentLang = 'en';
    this.listeners = [];
  }

  getLanguage() {
    return 'en';
  }

  setLanguage(langCode) {
    // Reserved for future release when string_ids are extracted
    this.currentLang = 'en';
  }

  t(key, fallback = '') {
    // Strictly English dictionary lookup
    if (dictionaries.en && dictionaries.en[key]) {
      return dictionaries.en[key];
    }
    return fallback || key;
  }

  onLanguageChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    for (const cb of this.listeners) {
      try { cb(this.currentLang); } catch (e) { console.error(e); }
    }
  }
}

export const i18n = new I18nManager();
export const t = (key, fallback) => i18n.t(key, fallback);
