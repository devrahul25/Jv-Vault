import { NextResponse } from "next/server";
import { currentKey, isInitialized } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    initialized: isInitialized(),
    authenticated: !!currentKey(),
  });
}
