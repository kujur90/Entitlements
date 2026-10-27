import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { listScanSources, createScanSource } from "@/lib/db";

export async function GET() {
  const sources = await listScanSources();
  return NextResponse.json({ sources });
}

export async function POST(request) {
  try {
    const { name, url, keywords } = await request.json();
    if (!name || !url || !keywords?.length) {
      return NextResponse.json(
        { error: "Name, URL and at least one keyword are required." },
        { status: 400 }
      );
    }
    const source = await createScanSource({ name, url, keywords });
    return NextResponse.json({ source }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not add source." }, { status: 500 });
  }
}
