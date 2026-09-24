import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { getSession } from "@/lib/get-session";

function canManage(role: string) {
  return role === "manager" || role === "deputy";
}

const KINDS = ["event", "holiday", "exam"] as const;

export async function GET() {
  const items = await db.select().from(calendarEvents);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const day = typeof body?.day === "string" ? body.day.trim() : ""; // YYYY-MM-DD
  const kind = KINDS.includes(body?.kind) ? body.kind : "event";
  if (!title || !day) {
    return NextResponse.json({ error: "عنوان و تاریخ الزامی است." }, { status: 400 });
  }
  const { isIsoDay } = await import("@/lib/access");
  if (!isIsoDay(day) && !/^\d{4}-\d{1,2}-\d{1,2}$/.test(day)) {
    return NextResponse.json({ error: "تاریخ را به شکل ۱۴۰۵-۰۷-۱۵ یا 2026-09-11 بنویسید." }, { status: 400 });
  }

  const [item] = await db.insert(calendarEvents).values({ title, day, kind }).returning();

  if (body?.remind) {
    const { messages } = await import("@/db/schema");
    await db.insert(messages).values({
      senderId: session.user.id,
      courseId: null,
      title: "یادآور تقویم",
      content: `${title} — ${day}`,
    });
  }

  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id الزامی است." }, { status: 400 });
  }

  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  return NextResponse.json({ success: true });
}
