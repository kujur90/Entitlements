"use client";

import { useState } from "react";
import Link from "next/link";
import { localizedField } from "@/lib/i18n";
import { CATEGORY_LOOKUP } from "@/lib/constants";

export default function AdminSchemeList({ initialSchemes }) {
  const [schemes, setSchemes] = useState(initialSchemes);
  const [busyId, setBusyId] = useState(null);

  async function handleDelete(id) {
    if (!confirm("Delete this scheme? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/schemes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSchemes((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Could not delete that scheme.");
      }
    } finally {
      setBusyId(null);
    }
  }

  if (schemes.length === 0) {
    return <p className="mt-8 text-ink/70">No schemes yet. Add your first one.</p>;
  }

  return (
    <div className="mt-6 divide-y divide-paddy-200 rounded-lg border border-paddy-200 bg-white/60">
      {schemes.map((scheme) => (
        <div key={scheme.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-medium text-paddy-900">{localizedField(scheme.title, "en")}</p>
            <p className="text-xs text-ink/60">
              {CATEGORY_LOOKUP[scheme.category] || scheme.category} &middot;{" "}
              {(scheme.states || []).join(", ")}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/schemes/${scheme.id}/edit`}
              className="text-sm font-medium text-paddy-700 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(scheme.id)}
              disabled={busyId === scheme.id}
              className="text-sm font-medium text-terracotta-600 hover:underline disabled:opacity-50"
            >
              {busyId === scheme.id ? "Deleting\u2026" : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
