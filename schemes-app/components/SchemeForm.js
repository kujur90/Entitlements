"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/i18n";
import { STATES, CATEGORIES } from "@/lib/constants";

const TEXT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "summary", label: "One-line summary" },
  { key: "description", label: "Full description" },
  { key: "eligibility", label: "Eligibility \u2014 who can apply" },
  { key: "benefits", label: "Benefits \u2014 what they get" },
  { key: "how_to_apply", label: "How to apply" },
];

function emptyLangObject() {
  return Object.fromEntries(LANGUAGES.map((l) => [l.code, ""]));
}

function toFormState(scheme) {
  const base = {
    states: scheme?.states || [],
    category: scheme?.category || CATEGORIES[0].code,
    deadline: scheme?.deadline ? scheme.deadline.slice(0, 10) : "",
    source_name: scheme?.source_name || "",
    source_url: scheme?.source_url || "",
  };
  for (const f of TEXT_FIELDS) {
    base[f.key] = { ...emptyLangObject(), ...(scheme?.[f.key] || {}) };
  }
  return base;
}

export default function SchemeForm({ scheme }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toFormState(scheme));
  const [activeLang, setActiveLang] = useState("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [translateNote, setTranslateNote] = useState("");

  function setTextField(fieldKey, value) {
    setForm((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], [activeLang]: value },
    }));
  }

  async function handleTranslate() {
    if (!form.title.en.trim()) {
      setTranslateError("Fill in the English title first.");
      return;
    }
    setTranslating(true);
    setTranslateError("");
    setTranslateNote("");
    try {
      const englishFields = Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, form[f.key].en]));
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(englishFields),
      });
      const data = await res.json();
      if (!res.ok) {
        setTranslateError(data.error || "Could not translate.");
        return;
      }
      const translations = data.translations || {};
      const langCodes = Object.keys(translations);
      if (langCodes.length === 0) {
        setTranslateError("Didn't get anything back. Try again.");
        return;
      }
      setForm((prev) => {
        const next = { ...prev };
        for (const f of TEXT_FIELDS) {
          const updatedField = { ...prev[f.key] };
          for (const code of langCodes) {
            if (translations[code] && typeof translations[code][f.key] === "string") {
              updatedField[code] = translations[code][f.key];
            }
          }
          next[f.key] = updatedField;
        }
        return next;
      });
      setTranslateNote(`Filled in ${langCodes.length} language${langCodes.length === 1 ? "" : "s"} \u2014 check each tab before saving.`);
    } catch {
      setTranslateError("Could not reach the server. Try again.");
    } finally {
      setTranslating(false);
    }
  }

  function toggleState(code) {
    setForm((prev) => ({
      ...prev,
      states: prev.states.includes(code)
        ? prev.states.filter((s) => s !== code)
        : [...prev.states, code],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.en.trim()) return setError("Title in English is required.");
    if (form.states.length === 0) return setError("Pick at least one state.");

    setSaving(true);
    try {
      const url = scheme ? `/api/schemes/${scheme.id}` : "/api/schemes";
      const method = scheme ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-8">
      <div>
        <p className="field-label">States this applies to</p>
        <div className="flex flex-wrap gap-2">
          {STATES.filter((s) => s.code !== "all").map((s) => (
            <label
              key={s.code}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium ${
                form.states.includes(s.code)
                  ? "border-paddy-600 bg-paddy-600 text-white"
                  : "border-paddy-300 bg-white text-paddy-800"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.states.includes(s.code)}
                onChange={() => toggleState(s.code)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="field-input"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="deadline">
            Deadline (optional)
          </label>
          <input
            id="deadline"
            type="date"
            className="field-input"
            value={form.deadline}
            onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="source_name">
            Source name
          </label>
          <input
            id="source_name"
            className="field-input"
            value={form.source_name}
            onChange={(e) => setForm((p) => ({ ...p, source_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="source_url">
            Source URL
          </label>
          <input
            id="source_url"
            type="url"
            className="field-input"
            value={form.source_url}
            onChange={(e) => setForm((p) => ({ ...p, source_url: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-paddy-200 bg-white/60 p-5">
        <p className="mb-4 text-sm text-ink/70">
          {"Fill in English first. Other languages are optional \u2014 the site falls back to English if a translation is missing."}
        </p>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                type="button"
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  activeLang === lang.code
                    ? "bg-paddy-600 text-white"
                    : "bg-paddy-50 text-paddy-800 hover:bg-paddy-100"
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            className="btn-secondary whitespace-nowrap text-sm"
          >
            {translating ? "Translating\u2026" : "Translate with AI"}
          </button>
        </div>
        {translateError && <p className="mb-4 text-sm text-terracotta-600">{translateError}</p>}
        {translateNote && <p className="mb-4 text-sm text-ink/70">{translateNote}</p>}

        <div className="space-y-4">
          {TEXT_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="field-label">{f.label}</label>
              {f.key === "title" || f.key === "summary" ? (
                <input
                  className="field-input"
                  value={form[f.key][activeLang]}
                  onChange={(e) => setTextField(f.key, e.target.value)}
                />
              ) : (
                <textarea
                  rows={4}
                  className="field-input"
                  value={form[f.key][activeLang]}
                  onChange={(e) => setTextField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-terracotta-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving\u2026" : "Save"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
