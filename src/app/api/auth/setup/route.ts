import { NextResponse } from "next/server";
import { createSession, initializeVault, isInitialized } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (isInitialized()) {
      return NextResponse.json({ error: "Vault already initialized" }, { status: 400 });
    }
    const { password, confirm } = await req.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    initializeVault(password);
    const r = createSession(password);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Setup failed" }, { status: 500 });
  }
}
