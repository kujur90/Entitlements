"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SourcesManager({ initialSources }) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanError, setScanError] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (!name || !url || keywordList.length === 0) {
      setError("Fill in a name, URL and at least one keyword.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, keywords: keywordList }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add source.");
        return;
      }
      setSources((prev) => [...prev, data.source]);
      setName("");
      setUrl("");
      setKeywords("");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleScanNow() {
    setScanning(true);
    setScanError("");
    setScanResults(null);
    try {
      const res = await fetch("/api/admin/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error || "Scan failed.");
        return;
      }
      setScanResults(data.results);
      router.refresh();
    } catch {
      setScanError("Could not reach the server. Try again.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="mt-6">
      {sources.length > 0 && (
        <div className="mb-6 rounded-lg border border-paddy-200 bg-white/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-paddy-900">Scan now</p>
              <p className="text-sm text-ink/70">
                Checks every source below right away, instead of waiting for the daily run.
                Can take up to a minute.
              </p>
            </div>
            <button onClick={handleScanNow} disabled={scanning} className="btn-primary whitespace-nowrap">
              {scanning ? "Scanning\u2026" : "Scan now"}
            </button>
          </div>

          {scanError && <p className="mt-3 text-sm text-terracotta-600">{scanError}</p>}

          {scanResults && (
            <div className="mt-4 space-y-2 border-t border-paddy-200 pt-4">
              {scanResults.map((r, i) => (
                <p key={i} className="text-sm text-ink/80">
                  <span className="font-medium">{r.source}:</span>{" "}
                  {r.error ? (
                    <span className="text-terracotta-600">{r.error}</span>
                  ) : r.flagged > 0 ? (
                    `found ${r.flagged} new scheme${r.flagged === 1 ? "" : "s"} to review`
                  ) : (
                    "nothing new found"
                  )}
                </p>
              ))}
              <p className="pt-1 text-sm">
                <a href="/admin/pending" className="font-medium text-paddy-700 hover:underline">
                  Go to Flagged for review &rarr;
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleAdd} className="grid gap-4 rounded-lg border border-paddy-200 bg-white/60 p-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Source name</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Page URL</label>
          <input
            className="field-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Keywords (comma-separated)</label>
          <input
            className="field-input"
            placeholder="subsidy, women farmer, 2026"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
        {error && <p className="sm:col-span-2 text-sm text-terracotta-600">{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Adding\u2026" : "Add source"}
          </button>
        </div>
      </form>

      <div className="mt-6 divide-y divide-paddy-200 rounded-lg border border-paddy-200 bg-white/60">
        {sources.length === 0 && <p className="p-4 text-sm text-ink/70">No sources configured yet.</p>}
        {sources.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-paddy-900">{s.name}</p>
              <p className="text-xs text-ink/60 break-all">{s.url}</p>
              <p className="text-xs text-ink/60">Keywords: {(s.keywords || []).join(", ")}</p>
            </div>
            <button
              onClick={() => handleRemove(s.id)}
              className="text-sm font-medium text-terracotta-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
