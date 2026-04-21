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
  const permissions = db.prepare(`
    SELECT p.workspace_id, p.role, w.name as workspace_name
    FROM workspace_permissions p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.member_id = ?
  `).all(params.id);

  return NextResponse.json({ permissions });
}
