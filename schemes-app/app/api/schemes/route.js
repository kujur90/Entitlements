import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { listSchemes, createScheme } from "@/lib/db";

function slugify(title) {
  const base = (title?.en || Object.values(title || {})[0] || "scheme")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || undefined;
  const category = searchParams.get("category") || undefined;
  const onlyNew = searchParams.get("new") === "1";
  const q = searchParams.get("q") || undefined;

  try {
    const schemes = await listSchemes({ state, category, onlyNew, q });
    return NextResponse.json({ schemes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load schemes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title?.en || !body.category || !body.states?.length) {
      return NextResponse.json(
        { error: "Title (English), category and at least one state are required." },
        { status: 400 }
      );
    }
    const scheme = await createScheme({ ...body, slug: slugify(body.title) });
    return NextResponse.json({ scheme }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save scheme." }, { status: 500 });
  }
}
