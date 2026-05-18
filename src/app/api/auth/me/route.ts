import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  let roles: Record<string, string> = {};
  let name = null;
  let avatar = null;
  
  if (session.email) {
    const member = db.prepare("SELECT name, avatar FROM members WHERE email = ?").get(session.email) as any;
    if (member) {
      name = member.name;
      avatar = member.avatar;
    }

    const permissions = db.prepare(`
      SELECT p.workspace_id, p.role
      FROM workspace_permissions p
      JOIN members m ON p.member_id = m.id
      WHERE m.email = ?
    `).all(session.email) as any[];
    
    permissions.forEach(p => {
      roles[p.workspace_id] = p.role;
    });
  }

  return NextResponse.json({
    email: session.email,
    name,
    avatar,
    ip: session.ip,
    isMaster: session.email === "team@jaiveeru.co.in",
    roles
  });
}
