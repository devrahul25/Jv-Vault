import { NextResponse } from "next/server";
import { currentKey } from "@/lib/auth";
import { ClientRow, getDb } from "@/lib/db";
import { encrypt, tryDecrypt } from "@/lib/crypto";
import { newId } from "@/lib/id";
import { DEFAULT_SECTIONS, Section, ClientRecord } from "@/lib/vault";

export const runtime = "nodejs";

function parseJson<T>(raw: string | null, key: Buffer, fallback: T): T {
  if (!raw) return fallback;
  const pt = tryDecrypt(raw, key);
  if (!pt) return fallback;
  try {
    return JSON.parse(pt) as T;
  } catch {
    return fallback;
  }
}

function serialize(r: ClientRow, key: Buffer): ClientRecord {
  return {
    id: r.id,
    workspace_id: r.workspace_id,
    name: r.name,
    position: r.position,
    attrs: parseJson<Record<string, string>>(r.attrs_ct, key, {}),
    sections: parseJson<Section[]>(r.sections_ct, key, []),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function GET(req: Request) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  
  const db = getDb();
  let query = "SELECT * FROM clients";
  let params: any[] = [];
  
  if (workspaceId) {
    query += " WHERE workspace_id = ?";
    params.push(workspaceId);
  }
  
  query += " ORDER BY position ASC, created_at ASC";
  
  const rows = db.prepare(query).all(...params) as ClientRow[];
  return NextResponse.json({ clients: rows.map((r) => serialize(r, key)) });
}

function getPrimaryWorkspaceId(db: any): string {
  let row = db.prepare("SELECT id FROM workspaces ORDER BY position ASC, created_at ASC LIMIT 1").get() as { id: string } | undefined;
  if (!row) {
    const defaultId = "ws_" + Date.now();
    db.prepare("INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(defaultId, "Primary Workspace", Date.now(), Date.now());
    return defaultId;
  }
  return row.id;
}

export async function POST(req: Request) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "Untitled client").trim() || "Untitled client";
    const db = getDb();
    const wsId = body.workspace_id || getPrimaryWorkspaceId(db);
    const id = newId("cli");
    const now = Date.now();
    const positionRow = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM clients WHERE workspace_id = ?").get(wsId) as {
      p: number;
    };
    const attrs = body.attrs && typeof body.attrs === "object" ? body.attrs : {};
    const sections: Section[] = Array.isArray(body.sections) ? body.sections : DEFAULT_SECTIONS;
    db.prepare(
      `INSERT INTO clients (id, workspace_id, name, position, attrs_ct, sections_ct, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      wsId,
      name,
      positionRow.p,
      encrypt(JSON.stringify(attrs), key),
      encrypt(JSON.stringify(sections), key),
      now,
      now
    );
    const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(id) as ClientRow;
    return NextResponse.json({ client: serialize(row, key) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
