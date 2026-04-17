import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const MASTER_EMAIL = "team@jaiveeru.co.in";

export async function GET(req: Request) {
  const session = currentSession();
  if (!session || session.email !== MASTER_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const requests = db.prepare("SELECT * FROM access_requests WHERE status = 'pending'").all();
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  try {
    const session = currentSession();
    if (!session) {
      console.log("POST /api/access-requests: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await req.json();
    console.log(`POST /api/access-requests: Request from ${session.email} for ${workspaceId}`);
    
    if (!workspaceId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

    const db = getDb();
    const existing = db.prepare("SELECT id FROM access_requests WHERE workspace_id = ? AND email = ? AND status = 'pending'")
      .get(workspaceId, session.email);
    
    if (existing) {
      console.log("POST /api/access-requests: Request already exists");
      return NextResponse.json({ message: "Request already pending" });
    }

    const id = `req_${Date.now()}`;
    db.prepare("INSERT INTO access_requests (id, workspace_id, email, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, workspaceId, session.email, "pending", Date.now(), Date.now());

    console.log("POST /api/access-requests: Successfully inserted request");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/access-requests Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = currentSession();
  if (!session || session.email !== MASTER_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const db = getDb();
  const request = db.prepare("SELECT * FROM access_requests WHERE id = ?").get(id) as any;
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.transaction(() => {
    db.prepare("UPDATE access_requests SET status = ?, updated_at = ? WHERE id = ?")
      .run(status, Date.now(), id);
    
    if (status === "approved") {
      // Create or find member
      let member = db.prepare("SELECT id FROM members WHERE email = ?").get(request.email) as any;
      if (!member) {
        const memberId = `mem_${Date.now()}`;
        db.prepare("INSERT INTO members (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
          .run(memberId, request.email, Date.now(), Date.now());
        member = { id: memberId };
      }
      
      db.prepare(`
        INSERT INTO workspace_permissions (workspace_id, member_id, role)
        VALUES (?, ?, 'edit')
        ON CONFLICT(workspace_id, member_id) DO UPDATE SET role = 'edit'
      `).run(request.workspace_id, member.id);
    }
  })();

  return NextResponse.json({ success: true });
}
