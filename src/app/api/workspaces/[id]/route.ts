import { NextResponse } from "next/server";
import { currentKey } from "@/lib/auth";
import { getDb, WorkspaceRow } from "@/lib/db";
import { encrypt, tryDecrypt } from "@/lib/crypto";
import { ColumnDef, Workspace } from "@/lib/vault";

export const runtime = "nodejs";

function serialize(row: WorkspaceRow, key: Buffer): Workspace {
  let columns: ColumnDef[] = [];
  if (row.top_columns_ct) {
    const pt = tryDecrypt(row.top_columns_ct, key);
    if (pt) {
      try {
        const v = JSON.parse(pt);
        if (Array.isArray(v)) columns = v;
      } catch {}
    }
  }
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    position: row.position,
    columns,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const row = db.prepare("SELECT * FROM workspaces WHERE id = ?").get(params.id) as
    | WorkspaceRow
    | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workspace: serialize(row, key) });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const db = getDb();
  const existing = db.prepare("SELECT * FROM workspaces WHERE id = ?").get(params.id) as
    | WorkspaceRow
    | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = body.name !== undefined ? String(body.name) : existing.name;
  const icon = body.icon === undefined ? existing.icon : body.icon ? String(body.icon) : null;
  const position = body.position !== undefined ? Number(body.position) : existing.position;
  const cols_ct =
    body.columns !== undefined
      ? encrypt(JSON.stringify(body.columns || []), key)
      : existing.top_columns_ct;

  db.prepare(
    `UPDATE workspaces SET name = ?, icon = ?, position = ?, top_columns_ct = ?, updated_at = ? WHERE id = ?`
  ).run(name, icon, position, cols_ct, Date.now(), params.id);

  const row = db.prepare("SELECT * FROM workspaces WHERE id = ?").get(params.id) as WorkspaceRow;
  return NextResponse.json({ workspace: serialize(row, key) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!currentKey()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  db.prepare("DELETE FROM workspaces WHERE id = ?").run(params.id); // cascades clients
  return NextResponse.json({ ok: true });
}
