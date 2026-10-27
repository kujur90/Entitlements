import { notFound } from "next/navigation";
import { getSchemeById } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import SchemeForm from "@/components/SchemeForm";

export const dynamic = "force-dynamic";

export default async function EditSchemePage({ params }) {
  const scheme = await getSchemeById(params.id);
  if (!scheme) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-paddy-900">Edit scheme</h1>
      <SchemeForm scheme={scheme} />
    </div>
  );
}
