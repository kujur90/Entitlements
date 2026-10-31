import * as cheerio from "cheerio";
import { listScanSources, insertPending } from "./db";

// This fetches each configured source's page, hands the extracted text to
// Claude (via the Anthropic API) to identify and describe any government
// schemes relevant to farmers, and drops each one into the pending_schemes
// queue for a human to review before anything is published. It never
// auto-publishes anything.
//
// Claude also has web search available here: if a source page only names a
// scheme without real details (common on "directory" pages that just link
// out to each scheme's own page), it can search for and read that page
// itself before answering. And if our own fetch of the source page fails
// entirely \u2014 some .gov.in sites block requests from cloud/datacenter IP
// ranges like Vercel's, even though the page is fine for an ordinary
// visitor \u2014 Claude's web search is also used as the fallback way in.

const MODEL = "claude-sonnet-5";
// Raised from 15000: pages with long navigation menus or sidebars were
// eating the budget before any real content got included.
const MAX_PAGE_CHARS = 45000;
// A realistic browser UA, since some sites block requests whose UA looks
// like an obvious bot/scraper rather than blocking by IP.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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

  const focus = (source.keywords || []).join(", ");
  const pageText = await tryFetchPageText(source.url);

  const entries = pageText
    ? await extractSchemesWithClaude({ apiKey, url: source.url, pageText, focus })
    : await extractSchemesByUrlOnly({ apiKey, url: source.url, focus });

  let flagged = 0;
  for (const entry of entries) {
    if (!entry || typeof entry.title !== "string" || !entry.title.trim()) continue;
    const inserted = await insertPending({
      source_name: entry.source_name || source.name,
      source_url: entry.source_url || source.url,
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

// Returns extracted page text, or null if the fetch failed/blocked/empty
// (never throws \u2014 the caller falls back to Claude's own web search).
async function tryFetchPageText(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
    if (!res.ok) return null;
    const html = await res.text();

    const $ = cheerio.load(html);
    $(
      "script, style, nav, header, footer, aside, form, .breadcrumb, .breadcrumbs, " +
        "#sidebar, .sidebar, .navbar, .nav, .menu, .pagination, .cookie-banner"
    ).remove();
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_PAGE_CHARS);
    return text || null;
  } catch {
    return null;
  }
}

function sanitizeStates(states) {
  if (!Array.isArray(states)) return ["all"];
  const filtered = states.filter((s) => VALID_STATES.has(s));
  return filtered.length ? filtered : ["all"];
}

function parseJsonArray(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

const RESULT_SCHEMA_INSTRUCTIONS = `For each scheme found, output an object with exactly these fields:
- "title": the scheme's name
- "category": one of "credit", "subsidy", "insurance", "training", "marketing", "land", "welfare", "other"
- "states": an array using only these codes: "assam", "nagaland", "meghalaya", "manipur", "mizoram", "tripura", "arunachal", "sikkim", "all" (use ["all"] if national or unclear)
- "summary": one plain-language sentence
- "description": a short paragraph, plain language
- "eligibility": who can apply, in plain language
- "benefits": what they get
- "how_to_apply": how to apply, if you found this
- "source_name": the site or department name the DETAILED information actually came from
- "source_url": the URL of that same detailed page

When you're done, respond with ONLY a JSON array of these objects (use [] if nothing relevant is found) as your final message. No markdown code fences, no explanation \u2014 just the raw JSON array.`;

async function callClaudeWithSearch(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text);
  return parseJsonArray(textBlocks.join("\n").trim());
}

async function extractSchemesWithClaude({ url, pageText, focus }) {
  const prompt = `You are extracting government scheme information from a webpage for women farmers in North-East India (Assam, Nagaland, Meghalaya, Manipur, Mizoram, Tripura, Arunachal Pradesh, Sikkim).

Page URL: ${url}
${focus ? `This source was added to watch for: ${focus}\n` : ""}
Text extracted from the page:
---
${pageText}
---

Find every distinct government scheme, program, or benefit mentioned on this page that could matter to farmers, especially women farmers (loans, subsidies, insurance, training, market linkage, land/irrigation support, welfare/pension). Ignore navigation menus, unrelated news, and anything that is not an actual scheme or benefit.

Some pages only list a scheme's name with no real detail (a "directory" page linking out to each scheme's own page). When that happens, use web search to find that scheme's actual official page and read it before answering, so you can fill in real eligibility, benefits, and how-to-apply information instead of leaving them blank. Only leave a field empty if you still can't find it after searching.

${RESULT_SCHEMA_INSTRUCTIONS}`;

  return callClaudeWithSearch(prompt);
}

// Used when we couldn't fetch the source page ourselves at all (network
// error, or the site refused the request \u2014 some .gov.in sites block
// requests from cloud hosting providers). Claude tries via its own web
// search instead, which runs through different infrastructure.
async function extractSchemesByUrlOnly({ url, focus }) {
  const prompt = `I could not directly fetch this government webpage from my own server (the site may be blocking automated requests from cloud hosting providers): ${url}

Please use web search to find and read this exact page yourself, for women farmers in North-East India (Assam, Nagaland, Meghalaya, Manipur, Mizoram, Tripura, Arunachal Pradesh, Sikkim).
${focus ? `Look especially for anything related to: ${focus}\n` : ""}
If you can retrieve this page (directly, or through search results that include enough of its content), find every distinct government scheme, program, or benefit on it that could matter to farmers, especially women farmers (loans, subsidies, insurance, training, market linkage, land/irrigation support, welfare/pension). If you cannot access this page at all or find nothing relevant on it, respond with an empty array \u2014 do not guess or invent schemes that aren't actually on the page.

${RESULT_SCHEMA_INSTRUCTIONS}`;

  return callClaudeWithSearch(prompt);
}
