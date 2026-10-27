"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PendingList({ initialPending }) {
  const router = useRouter();
  const [items, setItems] = useState(initialPending);
  const [busyId, setBusyId] = useState(null);

  async function act(id, action) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/pending/${id}/${action}`, { method: "POST" });
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        if (action === "approve") {
          const data = await res.json();
          router.push(`/admin/schemes/${data.scheme.id}/edit`);
        }
      } else {
        alert("Something went wrong.");
      }
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-ink/70">
        Nothing flagged right now. The scanner checks your configured sources once a day.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-paddy-200 bg-white/60 p-4">
          <p className="text-sm text-ink/85">{item.excerpt}</p>
          <p className="mt-2 text-xs text-ink/55">
            From {item.source_name} &middot; matched &ldquo;{item.matched_keyword}&rdquo;
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => act(item.id, "approve")}
              disabled={busyId === item.id}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              Publish this
            </button>
            <button
              onClick={() => act(item.id, "reject")}
              disabled={busyId === item.id}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
