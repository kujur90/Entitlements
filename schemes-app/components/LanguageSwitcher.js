"use client";

import { useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/localeCookie";

export default function LanguageSwitcher({ currentLocale }) {
  const router = useRouter();

  function handleChange(e) {
    const value = e.target.value;
    document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <select
      aria-label="Choose language"
      value={currentLocale}
      onChange={handleChange}
      className="rounded-md border border-paddy-300 bg-white/80 px-2.5 py-1.5 text-sm
        font-medium text-paddy-800 focus:outline-none focus:ring-2 focus:ring-paddy-500"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.native}
        </option>
      ))}
    </select>
  );
}
