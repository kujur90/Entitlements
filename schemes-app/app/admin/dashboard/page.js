import Link from "next/link";
import { listSchemes } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import AdminSchemeList from "@/components/AdminSchemeList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const schemes = await listSchemes({});

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <AdminNav />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-paddy-900">
          Published schemes ({schemes.length})
        </h1>
        <Link href="/admin/schemes/new" className="btn-primary">
          Add a scheme
        </Link>
      </div>
      <AdminSchemeList initialSchemes={schemes} />
    </div>
  );
}
