import { NextResponse } from "next/server";

// Deprecated — replaced by the /api/clients sections model.
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use /api/clients." }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/clients." }, { status: 410 });
}
