import { t } from "@/lib/i18n";
import { STATES, CATEGORIES } from "@/lib/constants";

export default function Filters({ locale, searchParams }) {
  const state = searchParams.state || "";
  const category = searchParams.category || "";
  const onlyNew = searchParams.new === "1";
  const q = searchParams.q || "";

  return (
    <form method="get" action="/schemes" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="field-label" htmlFor="state">
          {t(locale, "filter.state")}
        </label>
        <select id="state" name="state" defaultValue={state} className="field-input">
          <option value="">{t(locale, "filter.state")}</option>
          {STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="category">
          {t(locale, "filter.category")}
        </label>
        <select id="category" name="category" defaultValue={category} className="field-input">
          <option value="">{t(locale, "filter.category")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <label className="field-label" htmlFor="q">
          {t(locale, "filter.search")}
        </label>
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={q}
          placeholder={t(locale, "filter.searchPlaceholder")}
          className="field-input"
        />
      </div>

      <div className="flex flex-col justify-end gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
          <input
            type="checkbox"
            name="new"
            value="1"
            defaultChecked={onlyNew}
            className="h-4 w-4 rounded border-paddy-300 text-paddy-600 focus:ring-paddy-500"
          />
          {t(locale, "filter.new")}
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {t(locale, "filter.search")}
          </button>
          <a href="/schemes" className="btn-secondary">
            {t(locale, "filter.clear")}
          </a>
        </div>
      </div>
    </form>
  );
}
