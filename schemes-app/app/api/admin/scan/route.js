import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { scanAllSources } from "@/lib/scraper";

// On-demand version of the daily cron scan, for the admin's "Scan now"
// button. Already protected by middleware (everything under /api/admin/
// requires a valid admin session cookie).
export async function POST() {
  try {
    const results = await scanAllSources();
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Scan failed." }, { status: 500 });
  }
}
