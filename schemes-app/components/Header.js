import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

// The brand name and nav label stay in English always, like a logo wouldn't
// change with the language picker \u2014 only the page content below
// translates. locale is still used to drive the LanguageSwitcher itself.
export default function Header({ locale, hideLanguageSwitcher }) {
  return (
    <header className="border-b border-paddy-200/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold text-paddy-800">Kheti Sahay</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/schemes"
            className="hidden text-sm font-medium text-ink/80 hover:text-paddy-700 sm:inline"
          >
            All schemes
          </Link>
          {!hideLanguageSwitcher && <LanguageSwitcher currentLocale={locale} />}
        </nav>
      </div>
    </header>
  );
}
