import { t } from "@/lib/i18n";

export default function Footer({ locale }) {
  return (
    <footer className="mt-16 border-t border-paddy-200/70">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="max-w-measure text-sm text-ink/70">{t(locale, "footer.disclaimer")}</p>
      </div>
    </footer>
  );
}
