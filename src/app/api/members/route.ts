import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = currentSession();
  if (!session || session.email !== "team@jaiveeru.co.in") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  const members = db.prepare("SELECT * FROM members ORDER BY created_at DESC").all();

  return NextResponse.json({ members });
}
