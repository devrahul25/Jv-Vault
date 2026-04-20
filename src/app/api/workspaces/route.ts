import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  let workspaces = db.prepare("SELECT id, name FROM workspaces").all();
  
  // If no workspaces exist and this is the master user, create the primary one and seed it
  if (workspaces.length === 0 && session.email === "team@jaiveeru.co.in") {
    const wsId = `ws_${Date.now()}`;
    db.prepare("INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run(wsId, "Primary Workspace", Date.now(), Date.now());
    
    // Seed initial data
    const { JV_CLIENT_SEED, DEFAULT_SECTIONS } = require("../../../lib/vault");
    const { encrypt } = require("../../../lib/crypto");
    const { currentKey } = require("../../../lib/auth");
    const { newId } = require("../../../lib/id");
    const key = currentKey();
    
    if (key) {
      JV_CLIENT_SEED.forEach((seed: any, idx: number) => {
        const id = newId("cli");
        db.prepare(
          `INSERT INTO clients (id, workspace_id, name, position, attrs_ct, sections_ct, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          id,
          wsId,
          seed.name,
          idx,
          encrypt(JSON.stringify(seed.attrs || {}), key),
          encrypt(JSON.stringify(DEFAULT_SECTIONS), key),
          Date.now(),
          Date.now()
        );
      });
    }
    
    workspaces = db.prepare("SELECT id, name FROM workspaces").all();
  }

  return NextResponse.json({ workspaces });
}

export async function POST(req: Request) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  const db = getDb();
  const id = `ws_${Date.now()}`;
  db.prepare("INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .run(id, name, Date.now(), Date.now());

  return NextResponse.json({ id, name });
}

export async function DELETE(req: Request) {
  const session = currentSession();
  if (!session || session.email !== "team@jaiveeru.co.in") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM workspaces WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
