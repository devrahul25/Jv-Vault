import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session || session.email !== "team@jaiveeru.co.in") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  
  // Check if target member is Super Admin
  const member = db.prepare("SELECT email FROM members WHERE id = ?").get(params.id) as { email: string } | undefined;
  
  let permissions = db.prepare(`
    SELECT p.workspace_id, p.role, w.name as workspace_name
    FROM workspace_permissions p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.member_id = ?
  `).all(params.id) as any[];

  if (member?.email === "team@jaiveeru.co.in") {
    // Inject a global record for Super Admin
    permissions = [{
      workspace_id: "global",
      workspace_name: "ALL WORKSPACES",
      role: "owner"
    }, ...permissions];
  }

  return NextResponse.json({ permissions });
}
