import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { deleteScanSource } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    await deleteScanSource(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not remove source." }, { status: 500 });
  }
}
