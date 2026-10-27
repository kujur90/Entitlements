import { NextResponse } from "next/server";
import { scanAllSources } from "@/lib/scraper";

export const maxDuration = 60;

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const results = await scanAllSources();
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Scan failed." }, { status: 500 });
  }
}
