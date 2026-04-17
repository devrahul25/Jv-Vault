import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cleanupExpiredSessions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  cleanupExpiredSessions();
  const db = getDb();
  // Get active sessions, deduplicate by email or IP if email is null
  const rows = db.prepare(`
    SELECT DISTINCT email, ip 
    FROM sessions 
    WHERE expires_at > ?
  `).all(Date.now()) as Array<{ email: string | null; ip: string | null }>;

  return NextResponse.json({
    sessions: rows.map(r => ({
      id: r.email || r.ip || "local",
      label: r.email || r.ip || "Unknown",
      initial: (r.email || r.ip || "U").substring(0, 1).toUpperCase()
    }))
  });
}
