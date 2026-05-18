import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const session = currentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, avatar } = await req.json();
    const db = getDb();
    
    db.prepare("UPDATE members SET name = ?, avatar = ?, updated_at = ? WHERE email = ?")
      .run(name || null, avatar || null, Date.now(), session.email);

    return NextResponse.json({ 
      success: true,
      user: {
        email: session.email,
        name,
        avatar
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
