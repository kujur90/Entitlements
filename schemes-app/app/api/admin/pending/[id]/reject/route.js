import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { setPendingStatus } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    await setPendingStatus(params.id, "rejected");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not dismiss." }, { status: 500 });
  }
}
