import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { listSchemes } from "@/lib/db";
import { STATES } from "@/lib/constants";
import SchemeCard from "@/components/SchemeCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = getLocale();
  const newSchemes = await listSchemes({ onlyNew: true });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <section className="max-w-measure">
        <h1 className="font-display text-4xl font-semibold leading-tight text-paddy-900 sm:text-5xl">
          {t(locale, "home.heroTitle")}
        </h1>
        <p className="mt-4 text-lg text-ink/80">{t(locale, "home.heroBody")}</p>
        <Link href="/schemes" className="btn-primary mt-6">
          {t(locale, "home.cta")}
        </Link>
      </section>

      {newSchemes.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-paddy-900">
            {t(locale, "home.newSectionTitle")}
          </h2>
          <p className="mt-1 text-sm text-ink/70">{t(locale, "home.newSectionBody")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newSchemes.slice(0, 6).map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-paddy-900">
          {t(locale, "home.statesTitle")}
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {STATES.map((s) => (
            <Link
              key={s.code}
              href={`/schemes?state=${s.code}`}
              className="rounded-full border border-paddy-300 bg-white/70 px-4 py-2
                text-sm font-medium text-paddy-800 hover:bg-paddy-50"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
