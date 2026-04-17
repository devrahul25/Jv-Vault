import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentKey } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

  const db = getDb();
  const permissions = db.prepare(`
    SELECT m.id, m.email, m.name, p.role
    FROM workspace_permissions p
    JOIN members m ON p.member_id = m.id
    WHERE p.workspace_id = ?
  `).all(workspaceId);

  return NextResponse.json({ permissions });
}

export async function POST(req: Request) {
  const key = currentKey();
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, email, role } = await req.json();
  if (!workspaceId || !email || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  
  // Find or create member
  let member = db.prepare("SELECT id FROM members WHERE email = ?").get(email) as any;
  if (!member) {
    const memberId = `mem_${Date.now()}`;
    db.prepare("INSERT INTO members (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run(memberId, email, Date.now(), Date.now());
    member = { id: memberId };
  }

  // Upsert permission
  db.prepare(`
    INSERT INTO workspace_permissions (workspace_id, member_id, role)
    VALUES (?, ?, ?)
    ON CONFLICT(workspace_id, member_id) DO UPDATE SET role = excluded.role
  `).run(workspaceId, member.id, role);

  return NextResponse.json({ success: true });
}
