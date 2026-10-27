import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t, localizedField } from "@/lib/i18n";
import { getSchemeBySlug } from "@/lib/db";
import { CATEGORY_LOOKUP, STATE_LOOKUP, isNew } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const scheme = await getSchemeBySlug(params.slug);
  if (!scheme) return {};
  return { title: `${localizedField(scheme.title, "en")} \u2014 Kheti Sahay` };
}

function Block({ title, children }) {
  if (!children) return null;
  return (
    <div className="mt-8">
      <h2 className="font-display text-lg font-semibold text-paddy-900">{title}</h2>
      <p className="mt-2 max-w-measure whitespace-pre-line text-ink/85">{children}</p>
    </div>
  );
}

export default async function SchemeDetailPage({ params }) {
  const locale = getLocale();
  const scheme = await getSchemeBySlug(params.slug);
  if (!scheme) notFound();

  const title = localizedField(scheme.title, locale);
  const description = localizedField(scheme.description, locale);
  const eligibility = localizedField(scheme.eligibility, locale);
  const benefits = localizedField(scheme.benefits, locale);
  const howToApply = localizedField(scheme.how_to_apply, locale);
  const stateLabels = (scheme.states || [])
    .map((code) => STATE_LOOKUP[code] || code)
    .join(", ");

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link href="/schemes" className="text-sm font-medium text-paddy-700 hover:underline">
        &larr; {t(locale, "scheme.backToList")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-turmeric-100 px-2.5 py-0.5 text-xs font-semibold text-turmeric-800">
          {CATEGORY_LOOKUP[scheme.category] || scheme.category}
        </span>
        {isNew(scheme.created_at) && (
          <span className="rounded-full bg-terracotta-100 px-2.5 py-0.5 text-xs font-semibold text-terracotta-700">
            {t(locale, "badge.new")}
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-paddy-900 sm:text-4xl">
        {title}
      </h1>

      {stateLabels && (
        <p className="mt-2 text-sm font-medium text-ink/70">
          {t(locale, "scheme.states")}: {stateLabels}
        </p>
      )}

      <Block title={t(locale, "admin.descriptionField")}>{description}</Block>
      <Block title={t(locale, "scheme.eligibility")}>{eligibility}</Block>
      <Block title={t(locale, "scheme.benefits")}>{benefits}</Block>
      <Block title={t(locale, "scheme.howToApply")}>{howToApply}</Block>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-paddy-900">
          {t(locale, "scheme.deadline")}
        </h2>
        <p className="mt-2 text-ink/85">
          {scheme.deadline
            ? new Date(scheme.deadline).toLocaleDateString(locale)
            : t(locale, "scheme.noDeadline")}
        </p>
      </div>

      {scheme.source_url && (
        <div className="mt-8 rounded-lg border border-paddy-200 bg-white/60 p-4">
          <h2 className="font-display text-base font-semibold text-paddy-900">
            {t(locale, "scheme.source")}
          </h2>
          <a
            href={scheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm font-medium text-paddy-700 hover:underline"
          >
            {scheme.source_name || scheme.source_url}
          </a>
        </div>
      )}
    </div>
  );
}
