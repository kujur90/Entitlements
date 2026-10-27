import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { listSchemes } from "@/lib/db";
import Filters from "@/components/Filters";
import SchemeCard from "@/components/SchemeCard";

export const dynamic = "force-dynamic";

export default async function SchemesPage({ searchParams }) {
  const locale = getLocale();
  const schemes = await listSchemes({
    state: searchParams.state,
    category: searchParams.category,
    onlyNew: searchParams.new === "1",
    q: searchParams.q,
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold text-paddy-900">
        {t(locale, "nav.schemes")}
      </h1>

      <div className="mt-6 rounded-lg border border-paddy-200 bg-white/60 p-5">
        <Filters locale={locale} searchParams={searchParams} />
      </div>

      {schemes.length === 0 ? (
        <div className="mt-12 max-w-measure">
          <h2 className="font-display text-xl font-semibold text-paddy-900">
            {t(locale, "empty.title")}
          </h2>
          <p className="mt-2 text-ink/70">{t(locale, "empty.body")}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
