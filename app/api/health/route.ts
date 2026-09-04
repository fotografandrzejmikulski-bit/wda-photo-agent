import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "wda-photo-agent", time: new Date().toISOString() });
}
