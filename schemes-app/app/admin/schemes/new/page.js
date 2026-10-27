import AdminNav from "@/components/AdminNav";
import SchemeForm from "@/components/SchemeForm";

export default function NewSchemePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-paddy-900">Add a scheme</h1>
      <SchemeForm />
    </div>
  );
}
