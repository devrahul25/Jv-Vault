import { NextResponse } from "next/server";
import { getDb, TaskRow } from "@/lib/db";
import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const task = db.prepare(`
    SELECT t.*, c.name as client_name 
    FROM tasks t 
    JOIN clients c ON t.client_id = c.id
    WHERE t.id = ?
  `).get(params.id) as any;

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Access check
  const isMaster = session.email === "team@jaiveeru.co.in";
  if (!isMaster && task.assigned_email !== session.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status } = body;

  const db = getDb();
  const task = db.prepare("SELECT assigned_email FROM tasks WHERE id = ?").get(params.id) as TaskRow;
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Access check: super admin or the person it's assigned to can update status
  const isMaster = session.email === "team@jaiveeru.co.in";
  if (!isMaster && task.assigned_email !== session.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, Date.now(), params.id);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only super admin can delete tasks
  if (session.email !== "team@jaiveeru.co.in") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(params.id);

  return NextResponse.json({ success: true });
}
