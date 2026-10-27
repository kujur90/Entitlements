"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin/dashboard", label: "Schemes" },
  { href: "/admin/pending", label: "Flagged for review" },
  { href: "/admin/sources", label: "Scan sources" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-paddy-200 pb-4">
      <nav className="flex gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium ${
              pathname === link.href ? "text-paddy-900 underline" : "text-ink/70 hover:text-paddy-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button onClick={signOut} className="text-sm font-medium text-terracotta-600 hover:underline">
        Sign out
      </button>
    </div>
  );
}
