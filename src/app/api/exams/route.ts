import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { exams, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isOffice, teacherOwnsCourse } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  if (isOffice(session.user.role)) {
    const rows = await db.select().from(exams);
    return NextResponse.json({ exams: rows });
  }

  if (session.user.role === "teacher") {
    const mine = await db.select({ id: courses.id }).from(courses).where(eq(courses.teacherId, session.user.id));
    const ids = mine.map((c) => c.id);
    if (ids.length === 0) return NextResponse.json({ exams: [] });
    const rows = await db.select().from(exams).where(inArray(exams.courseId, ids));
    return NextResponse.json({ exams: rows });
  }

  const rows = await db.select().from(exams);
  return NextResponse.json({ exams: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const day = typeof body?.day === "string" ? body.day.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const courseId = body?.courseId ? Number(body.courseId) : null;
  if (!title || !day) {
    return NextResponse.json({ error: "عنوان و تاریخ الزامی است." }, { status: 400 });
  }

  if (isOffice(session.user.role)) {
    const [exam] = await db.insert(exams).values({ title, day, note: note || null, courseId }).returning();
    return NextResponse.json({ exam });
  }

  if (session.user.role !== "teacher" || !courseId) {
    return NextResponse.json({ error: "فقط برای درس خودتان." }, { status: 403 });
  }
  if (!(await teacherOwnsCourse(session.user.id, courseId))) {
    return NextResponse.json({ error: "این درس مال شما نیست." }, { status: 403 });
  }

  const [exam] = await db.insert(exams).values({ title, day, note: note || null, courseId }).returning();
  return NextResponse.json({ exam });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id الزامی است." }, { status: 400 });

  const exam = await db.query.exams.findFirst({ where: eq(exams.id, id) });
  if (!exam) return NextResponse.json({ error: "پیدا نشد." }, { status: 404 });

  if (isOffice(session.user.role)) {
    await db.delete(exams).where(eq(exams.id, id));
    return NextResponse.json({ success: true });
  }
  if (session.user.role === "teacher" && exam.courseId && (await teacherOwnsCourse(session.user.id, exam.courseId))) {
    await db.delete(exams).where(eq(exams.id, id));
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
}
