import { NextResponse } from "next/server";
import { currentKey } from "@/lib/auth";
import { ClientRow, getDb } from "@/lib/db";
import { encrypt, tryDecrypt } from "@/lib/crypto";
import { ClientRecord, Section } from "@/lib/vault";

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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(params.id) as
    | ClientRow
    | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ client: serialize(row, key) });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const db = getDb();
  const existing = db.prepare("SELECT * FROM clients WHERE id = ?").get(params.id) as
    | ClientRow
    | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = body.name !== undefined ? String(body.name) : existing.name;
  const position = body.position !== undefined ? Number(body.position) : existing.position;

  const attrs_ct =
    body.attrs !== undefined
      ? encrypt(JSON.stringify(body.attrs || {}), key)
      : existing.attrs_ct;

  const sections_ct =
    body.sections !== undefined
      ? encrypt(JSON.stringify(body.sections || []), key)
      : existing.sections_ct;

  db.prepare(
    `UPDATE clients SET name = ?, position = ?, attrs_ct = ?, sections_ct = ?, updated_at = ? WHERE id = ?`
  ).run(name, position, attrs_ct, sections_ct, Date.now(), params.id);

  const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(params.id) as ClientRow;
  return NextResponse.json({ client: serialize(row, key) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!currentKey()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  db.prepare("DELETE FROM clients WHERE id = ?").run(params.id);
  return NextResponse.json({ ok: true });
}
