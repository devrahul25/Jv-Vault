import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const session = currentSession();
  if (!session || session.email !== "team@jaiveeru.co.in") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const RAW_PATH = process.env.VAULT_DB_PATH || "./data/vault.db";
    const DB_PATH = path.resolve(process.cwd(), RAW_PATH);
    const fileBuffer = fs.readFileSync(DB_PATH);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="jv_vault_backup_${new Date().toISOString().split('T')[0]}.db"`
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
