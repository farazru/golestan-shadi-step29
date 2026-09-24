import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { languageLeads } from "@/db/schema";
import { getSession } from "@/lib/get-session";

export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== "manager" && session.user.role !== "deputy")) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }
  const items = await db.select().from(languageLeads).orderBy(desc(languageLeads.id)).limit(80);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (!name || !phone) {
    return NextResponse.json({ error: "نام و تلفن لازم است." }, { status: 400 });
  }
  await db.insert(languageLeads).values({ name, phone, note: note || null });
  return NextResponse.json({ success: true });
}
