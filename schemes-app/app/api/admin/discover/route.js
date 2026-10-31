import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { discoverSchemes } from "@/lib/discover";

export async function POST() {
  try {
    const flagged = await discoverSchemes();
    return NextResponse.json({ flagged });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
