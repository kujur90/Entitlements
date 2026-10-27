import { listPending } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import PendingList from "@/components/PendingList";

export const dynamic = "force-dynamic";

export default async function PendingReviewPage() {
  const pending = await listPending();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-paddy-900">Flagged for review</h1>
      <p className="mt-2 text-sm text-ink/70">
        {
          "The daily scan reads your configured sources and flags lines that mention one of your keywords. Nothing here is published automatically \u2014 approve turns it into a draft scheme you still need to open, translate and tidy up; dismiss throws it away."
        }
      </p>
      <PendingList initialPending={pending} />
    </div>
  );
}
