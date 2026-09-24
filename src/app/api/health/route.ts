import { NextResponse } from "next/server";
import { db } from "@/db";
import { publicNews } from "@/db/schema";

export async function GET() {
  try {
    await db.select({ id: publicNews.id }).from(publicNews).limit(1);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "database" }, { status: 503 });
  }
}
