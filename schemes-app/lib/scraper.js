import * as cheerio from "cheerio";
import { listScanSources, insertPending } from "./db";

// This fetches each configured source's page, hands the extracted text to
// Claude (via the Anthropic API) to identify and describe any government
// schemes relevant to farmers, and drops each one into the pending_schemes
// queue for a human to review before anything is published. It never
// auto-publishes anything.

const MODEL = "claude-sonnet-5";
const MAX_PAGE_CHARS = 15000;

const VALID_CATEGORIES = new Set([
  "credit", "subsidy", "insurance", "training", "marketing", "land", "welfare", "other",
]);
const VALID_STATES = new Set([
  "assam", "nagaland", "meghalaya", "manipur", "mizoram", "tripura", "arunachal", "sikkim", "all",
]);

export async function scanAllSources() {
  const sources = await listScanSources();
  const results = [];

  for (const source of sources) {
    try {
      const flagged = await scanOneSource(source);
      results.push({ source: source.name, flagged, error: null });
    } catch (err) {
      results.push({ source: source.name, flagged: 0, error: String(err) });
    }
  }
  return results;
}

async function scanOneSource(source) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set \u2014 add it in Vercel's Environment Variables.");
  }

  const res = await fetch(source.url, {
    headers: { "User-Agent": "KhetiSahaySchemeScanner/1.0 (+informational, non-commercial)" },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  $("script, style, nav, header, footer").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_PAGE_CHARS);
  if (!text) return 0;

  const entries = await extractSchemesWithClaude({
    apiKey,
    url: source.url,
    pageText: text,
    focus: (source.keywords || []).join(", "),
  });

  let flagged = 0;
  for (const entry of entries) {
    if (!entry || typeof entry.title !== "string" || !entry.title.trim()) continue;
    const inserted = await insertPending({
      source_name: source.name,
      source_url: source.url,
      suggested_title: entry.title.trim(),
      suggested_category: VALID_CATEGORIES.has(entry.category) ? entry.category : "other",
      suggested_states: sanitizeStates(entry.states),
      suggested_summary: entry.summary || "",
      suggested_description: entry.description || "",
      suggested_eligibility: entry.eligibility || "",
      suggested_benefits: entry.benefits || "",
      suggested_how_to_apply: entry.how_to_apply || "",
    });
    if (inserted) flagged += 1;
  }
  return flagged;
}

function sanitizeStates(states) {
  if (!Array.isArray(states)) return ["all"];
  const filtered = states.filter((s) => VALID_STATES.has(s));
  return filtered.length ? filtered : ["all"];
}

async function extractSchemesWithClaude({ apiKey, url, pageText, focus }) {
  const prompt = `You are extracting government scheme information from a webpage for women farmers in North-East India (Assam, Nagaland, Meghalaya, Manipur, Mizoram, Tripura, Arunachal Pradesh, Sikkim).

Page URL: ${url}
${focus ? `This source was added to watch for: ${focus}\n` : ""}
Text extracted from the page:
---
${pageText}
---

Find every distinct government scheme, program, or benefit mentioned on this page that could matter to farmers, especially women farmers (loans, subsidies, insurance, training, market linkage, land/irrigation support, welfare/pension). Ignore navigation menus, unrelated news, and anything that is not an actual scheme or benefit.

For each one found, output an object with exactly these fields:
- "title": the scheme's name
- "category": one of "credit", "subsidy", "insurance", "training", "marketing", "land", "welfare", "other"
- "states": an array using only these codes: "assam", "nagaland", "meghalaya", "manipur", "mizoram", "tripura", "arunachal", "sikkim", "all" (use ["all"] if national or unclear)
- "summary": one plain-language sentence
- "description": a short paragraph, plain language
- "eligibility": who can apply, in plain language ("" if not stated on the page)
- "benefits": what they get ("" if not stated)
- "how_to_apply": how to apply, if stated ("" if not stated)

Respond with ONLY a JSON array of these objects (use [] if nothing relevant is found). No markdown code fences, no explanation \u2014 just the raw JSON array.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) return [];

  const cleaned = textBlock.text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
