import { NextResponse } from "next/server";
import { currentKey } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { encrypt, tryDecrypt } from "@/lib/crypto";
import { JV_CLIENT_COLUMNS as DEFAULT_TOP_COLUMNS, ColumnDef } from "@/lib/vault";

export const runtime = "nodejs";

function getPrimaryWorkspaceId(): string {
  const db = getDb();
  let row = db.prepare("SELECT id FROM workspaces ORDER BY position ASC, created_at ASC LIMIT 1").get() as { id: string } | undefined;
  if (!row) {
    const defaultId = "ws_" + Date.now();
    db.prepare("INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(defaultId, "Primary Workspace", Date.now(), Date.now());
    return defaultId;
  }
  return row.id;
}

function readColumns(key: Buffer): ColumnDef[] {
  const db = getDb();
  const wsId = getPrimaryWorkspaceId();
  const row = db.prepare("SELECT top_columns_ct FROM workspaces WHERE id = ?").get(wsId) as { top_columns_ct: string | null } | undefined;
  if (!row || !row.top_columns_ct) return DEFAULT_TOP_COLUMNS;
  const pt = tryDecrypt(row.top_columns_ct, key);
  if (!pt) return DEFAULT_TOP_COLUMNS;
  try {
    const parsed = JSON.parse(pt);
    if (Array.isArray(parsed)) return parsed as ColumnDef[];
    return DEFAULT_TOP_COLUMNS;
  } catch {
    return DEFAULT_TOP_COLUMNS;
  }
}

function writeColumns(cols: ColumnDef[], key: Buffer) {
  const db = getDb();
  const wsId = getPrimaryWorkspaceId();
  const ct = encrypt(JSON.stringify(cols), key);
  const now = Date.now();
  db.prepare(
    `UPDATE workspaces SET top_columns_ct = ?, updated_at = ? WHERE id = ?`
  ).run(ct, now, wsId);
}

export async function GET() {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ columns: readColumns(key) });
}

export async function PUT(req: Request) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!Array.isArray(body.columns)) {
      return NextResponse.json({ error: "columns must be an array" }, { status: 400 });
    }
    writeColumns(body.columns as ColumnDef[], key);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
