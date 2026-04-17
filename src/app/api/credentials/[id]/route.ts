import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use /api/clients/[id]." }, { status: 410 });
}
export async function PATCH() {
  return NextResponse.json({ error: "Deprecated. Use /api/clients/[id]." }, { status: 410 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Deprecated. Use /api/clients/[id]." }, { status: 410 });
}
