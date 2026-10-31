import en from "./locales/en.json";
import as from "./locales/as.json";
import nag from "./locales/nag.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import kha from "./locales/kha.json";

// To add a language: drop a new locales/<code>.json (copy en.json as a
// starting point), then add one line here and one entry in LANGUAGES below.
const DICTIONARIES = { en, as, nag, hi, bn, kha };

export const DEFAULT_LOCALE = "en";

export const LANGUAGES = [
  { code: "en", native: "English" },
  { code: "as", native: "অসমীয়া" },
  { code: "nag", native: "Nagamese" },
  { code: "hi", native: "हिन्दी" },
  { code: "bn", native: "বাংলা" },
  { code: "kha", native: "Khasi" },
];

export function getDictionary(locale) {
  return DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
}

export function t(locale, key) {
  const dict = getDictionary(locale);
  return dict[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
}

// Pulls a per-language field out of a scheme's jsonb content (e.g. title,
// description), falling back to English, then to any language that has it.
export function localizedField(jsonField, locale) {
  if (!jsonField) return "";
  if (typeof jsonField === "string") return jsonField;
  if (jsonField[locale]) return jsonField[locale];
  if (jsonField[DEFAULT_LOCALE]) return jsonField[DEFAULT_LOCALE];
  const firstAvailable = Object.values(jsonField).find(Boolean);
  return firstAvailable || "";
}

export const SUPPORTED_LOCALE_CODES = LANGUAGES.map((l) => l.code);
