import { insertPending } from "./db";

// Unlike scraper.js (which reads one page you've configured), this lets
// Claude search the web itself \u2014 via Anthropic's server-side web search
// tool \u2014 to find government and established-organisation schemes for
// women farmers across the North-East, with no source page required.
// Exactly like the configured-source scanner, nothing here is published
// automatically; every result lands in pending_schemes for a human to
// review first.

const MODEL = "claude-sonnet-5";

const VALID_CATEGORIES = new Set([
  "credit", "subsidy", "insurance", "training", "marketing", "land", "welfare", "other",
]);
const VALID_STATES = new Set([
  "assam", "nagaland", "meghalaya", "manipur", "mizoram", "tripura", "arunachal", "sikkim", "all",
]);

function sanitizeCategory(category) {
  return VALID_CATEGORIES.has(category) ? category : "other";
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

export async function discoverSchemes() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set \u2014 add it in Vercel's Environment Variables.");
  }

  const prompt = `You have web search available. Search the web for government schemes, and well-established NGO or institutional programs, that give direct support (loans, subsidies, insurance, training, market linkage, land/irrigation support, welfare) to farmers \u2014 especially women farmers \u2014 in North-East India: Assam, Nagaland, Meghalaya, Manipur, Mizoram, Tripura, Arunachal Pradesh, and Sikkim.

Do several searches covering different states and different kinds of support (credit, subsidy, insurance, training, marketing, land, welfare) so the results are varied, not just the one or two most famous national schemes.

For each distinct scheme or program you find and can describe with reasonable confidence from what you found, output an object with exactly these fields:
- "title": the scheme's name
- "category": one of "credit", "subsidy", "insurance", "training", "marketing", "land", "welfare", "other"
- "states": an array using only these codes: "assam", "nagaland", "meghalaya", "manipur", "mizoram", "tripura", "arunachal", "sikkim", "all" (use ["all"] if national or unclear)
- "summary": one plain-language sentence
- "description": a short paragraph, plain language
- "eligibility": who can apply, in plain language ("" if you couldn't find this)
- "benefits": what they get ("" if you couldn't find this)
- "how_to_apply": how to apply, if you found this ("" if not)
- "source_name": the name of the website or organisation you found it on
- "source_url": the exact URL of the page where you found it

Find up to 10 distinct schemes. Favor official government sources, but a well-established NGO, SHG federation, or cooperative bank program is fine too if it genuinely gives farmers direct support. Don't list the same scheme twice under different names.

When you're done searching, respond with ONLY a JSON array of these objects as your final message \u2014 no markdown code fences, no explanation outside the JSON.`;

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
  const entries = parseJsonArray(textBlocks.join("\n").trim());

  let flagged = 0;
  for (const entry of entries) {
    if (!entry || typeof entry.title !== "string" || !entry.title.trim()) continue;
    const inserted = await insertPending({
      source_name: entry.source_name || "Web search",
      source_url: entry.source_url || "",
      suggested_title: entry.title.trim(),
      suggested_category: sanitizeCategory(entry.category),
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
