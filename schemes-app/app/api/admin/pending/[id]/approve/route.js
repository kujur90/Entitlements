import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getPendingById, setPendingStatus, createScheme } from "@/lib/db";

// Approving a flagged excerpt creates a draft-ish published scheme pre-filled
// from the scraped text, which the admin should open and tidy up (translate,
// pick states/category) right after.
export async function POST(request, { params }) {
  try {
    const pending = await getPendingById(params.id);
    if (!pending) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const slug = `${pending.source_name}-${params.id}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const scheme = await createScheme({
      slug,
      states: ["all"],
      category: "other",
      title: { en: pending.excerpt.slice(0, 120) },
      summary: { en: pending.excerpt.slice(0, 200) },
      description: { en: pending.excerpt },
      eligibility: { en: "" },
      benefits: { en: "" },
      how_to_apply: { en: "" },
      deadline: null,
      source_name: pending.source_name,
      source_url: pending.source_url,
    });

    await setPendingStatus(params.id, "approved");
    return NextResponse.json({ scheme });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not approve." }, { status: 500 });
  }
}
