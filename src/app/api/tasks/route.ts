import { NextResponse } from "next/server";
import { getDb, TaskRow } from "@/lib/db";
import { currentSession } from "@/lib/auth";
import { sendTaskAssignmentEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  let query = "SELECT t.*, c.name as client_name FROM tasks t JOIN clients c ON t.client_id = c.id";
  const params: any[] = [];

  // Super-admin (team@jaiveeru.co.in) sees everything. Others see tasks assigned to them.
  const isMaster = session.email === "team@jaiveeru.co.in";
  
  if (!isMaster) {
    query += " WHERE t.assigned_email = ?";
    params.push(session.email);
    if (clientId) {
      query += " AND t.client_id = ?";
      params.push(clientId);
    }
  } else if (clientId) {
    query += " WHERE t.client_id = ?";
    params.push(clientId);
  }

  query += " ORDER BY t.created_at DESC";

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only super-admin can create tasks
  const isMaster = session.email === "team@jaiveeru.co.in";
  if (!isMaster) return NextResponse.json({ error: "Only super-admin can create tasks" }, { status: 403 });

  const body = await req.json();
  const { clientId, assignedEmail, title, description, dueDate } = body;

  if (!clientId || !assignedEmail || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const taskId = `task_${Date.now()}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO tasks (id, client_id, assigned_email, creator_email, title, description, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(taskId, clientId, assignedEmail, session.email, title, description || null, dueDate || null, now, now);

  // Send notification email
  const client = db.prepare("SELECT name FROM clients WHERE id = ?").get(clientId) as any;
  if (client) {
    await sendTaskAssignmentEmail({
      to: assignedEmail,
      taskTitle: title,
      clientName: client.name,
      dueDate: dueDate ? new Date(dueDate).toDateString() : null,
      creatorEmail: session.email || "Super Admin"
    });
  }

  return NextResponse.json({ success: true, taskId });
}
