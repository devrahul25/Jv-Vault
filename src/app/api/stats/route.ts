import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentSession } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const session = currentSession();
  if (!session || session.email !== "team@jaiveeru.co.in") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  
  // Get DB file size
  let dbSize = "Unknown";
  try {
    const RAW_PATH = process.env.VAULT_DB_PATH || "./data/vault.db";
    const DB_PATH = path.resolve(process.cwd(), RAW_PATH);
    const stats = fs.statSync(DB_PATH);
    dbSize = (stats.size / (1024 * 1024)).toFixed(2) + " MB";
  } catch {}

  const activeSessions = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?").get(Date.now()) as any;

  return NextResponse.json({ 
    dbSize,
    activeSessions: activeSessions?.count || 0
  });
}
