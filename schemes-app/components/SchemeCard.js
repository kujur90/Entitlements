import Link from "next/link";
import { t, localizedField } from "@/lib/i18n";
import { CATEGORY_LOOKUP, isNew } from "@/lib/constants";

export default function SchemeCard({ scheme, locale }) {
  const title = localizedField(scheme.title, locale);
  const summary = localizedField(scheme.summary, locale);

  return (
    <Link
      href={`/schemes/${scheme.slug}`}
      className="group block rounded-lg border border-paddy-200 bg-white/70 p-5
        transition-colors hover:border-paddy-400 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-turmeric-100 px-2.5 py-0.5 text-xs font-semibold text-turmeric-800">
          {CATEGORY_LOOKUP[scheme.category] || scheme.category}
        </span>
        {isNew(scheme.created_at) && (
          <span className="rounded-full bg-terracotta-100 px-2.5 py-0.5 text-xs font-semibold text-terracotta-700">
            {t(locale, "badge.new")}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-paddy-900 group-hover:underline">
        {title}
      </h3>
      {summary && <p className="mt-2 text-sm text-ink/75 max-w-measure">{summary}</p>}
      <span className="mt-3 inline-block text-sm font-medium text-paddy-700">
        {t(locale, "scheme.viewDetails")} &rarr;
      </span>
    </Link>
  );
}
