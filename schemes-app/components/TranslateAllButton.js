"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TranslateAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/translate-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not translate.");
        return;
      }
      if (data.totalNeeded === 0) {
        setMessage("Every scheme already has a translation in each language.");
      } else {
        setMessage(
          `Translated ${data.translated} scheme${data.translated === 1 ? "" : "s"}.` +
            (data.remaining > 0
              ? ` ${data.remaining} more still need it \u2014 click again to continue.`
              : " All done.")
        );
      }
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
          <p className="font-medium text-paddy-900">Translate all schemes</p>
          <p className="text-sm text-ink/70">
            {
              "Finds every published scheme missing a language and translates it from English, up to 15 at a time. Can take a minute or two \u2014 check a few afterwards before trusting the rest."
            }
          </p>
        </div>
        <button onClick={handleClick} disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? "Translating\u2026" : "Translate all"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-terracotta-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-ink/80">{message}</p>}
    </div>
  );
}
