import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getPendingById, setPendingStatus, createScheme } from "@/lib/db";

// Approving a flagged item creates a published scheme pre-filled from
// Claude's extraction, which the admin should open and tidy up (verify
// facts, add translations) right after.
export async function POST(request, { params }) {
  try {
    const pending = await getPendingById(params.id);
    if (!pending) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const title = pending.suggested_title || "Untitled scheme";
    const slug = `${title}-${params.id}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const scheme = await createScheme({
      slug,
      states: pending.suggested_states?.length ? pending.suggested_states : ["all"],
      category: pending.suggested_category || "other",
      title: { en: title },
      summary: { en: pending.suggested_summary || "" },
      description: { en: pending.suggested_description || "" },
      eligibility: { en: pending.suggested_eligibility || "" },
      benefits: { en: pending.suggested_benefits || "" },
      how_to_apply: { en: pending.suggested_how_to_apply || "" },
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
