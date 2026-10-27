import { listScanSources } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import SourcesManager from "@/components/SourcesManager";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await listScanSources();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-paddy-900">Scan sources</h1>
      <p className="mt-2 text-sm text-ink/70">
        {
          "Add a government page the daily scan should check (a schemes/notifications page works best) and a few keywords (a scheme name, \u201csubsidy\u201d, the current year). Matching lines land in Flagged for review \u2014 nothing publishes automatically."
        }
      </p>
      <SourcesManager initialSources={sources} />
    </div>
  );
}
