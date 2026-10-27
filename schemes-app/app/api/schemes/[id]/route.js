import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSchemeById, updateScheme, deleteScheme } from "@/lib/db";

export async function GET(request, { params }) {
  const scheme = await getSchemeById(params.id);
  if (!scheme) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ scheme });
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    if (!body.title?.en || !body.category || !body.states?.length) {
      return NextResponse.json(
        { error: "Title (English), category and at least one state are required." },
        { status: 400 }
      );
    }
    const scheme = await updateScheme(params.id, body);
    if (!scheme) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ scheme });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update scheme." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteScheme(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete scheme." }, { status: 500 });
  }
}
