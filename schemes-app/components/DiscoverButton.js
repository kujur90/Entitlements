"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscoverButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleDiscover() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/discover", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not discover schemes.");
        return;
      }
      setMessage(
        data.flagged > 0
          ? `Found ${data.flagged} new scheme${data.flagged === 1 ? "" : "s"} to review below.`
          : "Searched the web but didn't find anything new this time."
      );
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-paddy-200 bg-white/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-paddy-900">Discover new schemes</p>
          <p className="text-sm text-ink/70">
            {
              "Searches the web directly \u2014 no source pages needed \u2014 for government and established-organisation schemes for women farmers across the North-East. Can take up to a minute, and uses your Anthropic account's web search allowance."
            }
          </p>
        </div>
        <button onClick={handleDiscover} disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? "Searching\u2026" : "Discover now"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-terracotta-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-ink/80">{message}</p>}
    </div>
  );
}
