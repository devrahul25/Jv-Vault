import { NextResponse } from "next/server";
import { currentKey } from "@/lib/auth";
import { generatePassword } from "@/lib/crypto";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!currentKey()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const length = Math.min(64, Math.max(8, Number(url.searchParams.get("length") || 20)));
  const symbols = url.searchParams.get("symbols") !== "false";
  const pwd = generatePassword({ length, symbols });
  return NextResponse.json({ password: pwd });
}
