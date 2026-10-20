import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { toLatinDigits } from "@/lib/digits";

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
  const rawDay = typeof body?.day === "string" ? toLatinDigits(body.day.trim()) : "";
  // Accept Jalali 1405-07-15 or Gregorian YYYY-MM-DD. Store as typed after digit normalize.
  const day = rawDay.replace(/\//g, "-");
  const jalali = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(day);
  if (!title || !jalali) {
    return NextResponse.json({ error: "تاریخ را به شکل ۱۴۰۵-۰۷-۱۵ بنویسید." }, { status: 400 });
  }
  const y = Number(jalali[1]);
  const mo = Number(jalali[2]);
  const d = Number(jalali[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) {
    return NextResponse.json({ error: "تاریخ نامعتبر است." }, { status: 400 });
  }
  const stored = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const kind = KINDS.includes(body?.kind) ? body.kind : "event";

  const [item] = await db.insert(calendarEvents).values({ title, day: stored, kind }).returning();

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

  const removed = await db.delete(calendarEvents).where(eq(calendarEvents.id, id)).returning();
  if (removed.length === 0) return NextResponse.json({ error: "پیدا نشد." }, { status: 404 });
  return NextResponse.json({ success: true });
}
