import * as cheerio from "cheerio";
import { listScanSources, insertPending } from "./db";

// This deliberately does NOT auto-publish anything. It only reads public
// pages the admin has configured, looks for lines containing a keyword the
// admin chose (e.g. a scheme name, "subsidy", a year), and if that line
// doesn't already match something flagged before, drops it into the
// pending_schemes queue for a human to read, rewrite and publish.
//
// This is a heuristic, not a reliable feed: government sites vary wildly in
// structure, so expect noise and misses. Treat it as a prompt to go look,
// not as a source of truth.

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
  const res = await fetch(source.url, {
    headers: { "User-Agent": "KhetiSahaySchemeScanner/1.0 (+informational, non-commercial)" },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  $("script, style, nav, header, footer").remove();
  const text = $("body").text();

  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 25 && l.length < 400);

  const keywords = (source.keywords || []).map((k) => k.toLowerCase());
  let flagged = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    const matched = keywords.find((k) => lower.includes(k));
    if (!matched) continue;

    const inserted = await insertPending({
      source_name: source.name,
      source_url: source.url,
      excerpt: line,
      matched_keyword: matched,
    });
    if (inserted) flagged += 1;
  }
  return flagged;
}
