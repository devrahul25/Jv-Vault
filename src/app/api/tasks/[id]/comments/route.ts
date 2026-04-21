import { NextResponse } from "next/server";
import { getDb, TaskCommentRow } from "@/lib/db";
import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  
  // Verify access to the task first
  const task = db.prepare("SELECT assigned_email FROM tasks WHERE id = ?").get(params.id) as any;
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const isMaster = session.email === "team@jaiveeru.co.in";
  if (!isMaster && task.assigned_email !== session.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = db.prepare(`
    SELECT * FROM task_comments 
    WHERE task_id = ? 
    ORDER BY created_at ASC
  `).all(params.id);

  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content } = body;

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const db = getDb();
  
  // Verify access
  const task = db.prepare("SELECT assigned_email FROM tasks WHERE id = ?").get(params.id) as any;
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const isMaster = session.email === "team@jaiveeru.co.in";
  if (!isMaster && task.assigned_email !== session.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const commentId = `comment_${Date.now()}`;
  db.prepare(`
    INSERT INTO task_comments (id, task_id, author_email, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(commentId, params.id, session.email || "Unknown", content, Date.now());

  return NextResponse.json({ success: true, commentId });
}
