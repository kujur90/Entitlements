import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { translateScheme } from "@/lib/translate";

export async function POST(request) {
  try {
    const body = await request.json();
    const translations = await translateScheme(body);
    return NextResponse.json({ translations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
