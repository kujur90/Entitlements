import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 290;

import { translateAllSchemes } from "@/lib/translate";

export async function POST() {
  try {
    const result = await translateAllSchemes();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
