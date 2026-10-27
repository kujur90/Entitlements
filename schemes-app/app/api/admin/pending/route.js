import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { listPending } from "@/lib/db";

export async function GET() {
  try {
    const pending = await listPending();
    return NextResponse.json({ pending });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load pending items." }, { status: 500 });
  }
}
