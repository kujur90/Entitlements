import { LANGUAGES, DEFAULT_LOCALE } from "./i18n";
import { listSchemes, updateScheme } from "./db";

const MODEL = "claude-sonnet-5";
const FIELD_KEYS = ["title", "summary", "description", "eligibility", "benefits", "how_to_apply"];
// Safety cap per click, so one run can't run indefinitely; click again to
// continue with whatever's left.
const MAX_SCHEMES_PER_RUN = 15;

export async function translateScheme(englishFields) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set \u2014 add it in Vercel's Environment Variables.");
  }

  const targets = LANGUAGES.filter((l) => l.code !== DEFAULT_LOCALE);
  if (targets.length === 0) return {};

  const languageList = targets.map((l) => `"${l.code}" (${l.native})`).join(", ");
  const fieldList = FIELD_KEYS.map((k) => `"${k}"`).join(", ");
  const englishBlock = FIELD_KEYS.map((k) => `${k}: ${englishFields[k] || "(empty)"}`).join("\n");

  const prompt = `Translate the following government scheme information from English into each of these languages: ${languageList}.

English text:
${englishBlock}

Keep the meaning accurate and the tone plain and easy to read, for someone reading on a phone in a rural area. Keep scheme names, numbers, and amounts unchanged across languages. If a field is "(empty)" in English, leave it as an empty string "" in every language \u2014 do not invent content for it.

Respond with ONLY a JSON object. Each top-level key is one of these language codes: ${targets.map((l) => `"${l.code}"`).join(", ")}. Each value is an object with exactly these fields: ${fieldList}. No markdown code fences, no explanation \u2014 just the raw JSON object.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) return {};

  const cleaned = textBlock.text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function needsTranslation(scheme) {
  const targets = LANGUAGES.filter((l) => l.code !== DEFAULT_LOCALE);
  return targets.some((l) => !scheme.title?.[l.code] || !scheme.title[l.code].trim());
}

// Finds every published scheme missing at least one language's title, and
// translates each one from its English content. Processes up to
// MAX_SCHEMES_PER_RUN per call; if more remain, the admin can click again.
export async function translateAllSchemes() {
  const schemes = await listSchemes({});
  const todo = schemes.filter(needsTranslation);
  const batch = todo.slice(0, MAX_SCHEMES_PER_RUN);

  let translated = 0;
  for (const scheme of batch) {
    const englishFields = Object.fromEntries(FIELD_KEYS.map((k) => [k, scheme[k]?.en || ""]));
    const translations = await translateScheme(englishFields);
    const langCodes = Object.keys(translations);
    if (langCodes.length === 0) continue;

    const updated = {
      states: scheme.states,
      category: scheme.category,
      deadline: scheme.deadline,
      source_name: scheme.source_name,
      source_url: scheme.source_url,
    };
    for (const key of FIELD_KEYS) {
      const merged = { ...(scheme[key] || {}) };
      for (const code of langCodes) {
        const value = translations[code]?.[key];
        if (typeof value === "string" && value) merged[code] = value;
      }
      updated[key] = merged;
    }
    await updateScheme(scheme.id, updated);
    translated += 1;
  }

  return { translated, remaining: todo.length - batch.length, totalNeeded: todo.length };
}
