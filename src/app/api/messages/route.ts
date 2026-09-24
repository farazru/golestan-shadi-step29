import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { messages, courses, enrollments, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { approvedChildIds, isOffice } from "@/lib/access";

function canSend(role: string) {
  return role === "teacher" || isOffice(role);
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد حساب شوید." }, { status: 401 });
  }

  const rows = await db
    .select({
      id: messages.id,
      title: messages.title,
      content: messages.content,
      courseId: messages.courseId,
      createdAt: messages.createdAt,
      senderFirstName: user.firstName,
      senderLastName: user.lastName,
      senderRole: user.role,
      courseName: courses.name,
    })
    .from(messages)
    .innerJoin(user, eq(messages.senderId, user.id))
    .leftJoin(courses, eq(messages.courseId, courses.id))
    .orderBy(desc(messages.createdAt));

  if (isOffice(session.user.role)) {
    return NextResponse.json({ messages: rows });
  }

  if (session.user.role === "teacher") {
    const mine = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.teacherId, session.user.id));
    const ids = new Set(mine.map((c) => c.id));
    return NextResponse.json({
      messages: rows.filter((m) => m.courseId == null || ids.has(m.courseId)),
    });
  }

  if (session.user.role === "parent") {
    const childIds = await approvedChildIds(session.user.id);
    if (childIds.length === 0) {
      return NextResponse.json({ messages: rows.filter((m) => m.courseId == null), children: [] });
    }
    const links = await db
      .select({ courseId: enrollments.courseId, studentId: enrollments.studentId, name: user.firstName })
      .from(enrollments)
      .innerJoin(user, eq(enrollments.studentId, user.id))
      .where(inArray(enrollments.studentId, childIds));
    const ids = new Set(links.map((row) => row.courseId));
    return NextResponse.json({
      children: [...new Map(links.map((row) => [row.studentId, { id: row.studentId, name: row.name }])).values()],
      messages: rows
        .filter((m) => m.courseId == null || ids.has(m.courseId))
        .map((m) => ({
          ...m,
          forChildren: m.courseId == null
            ? links.map((row) => row.name)
            : links.filter((row) => row.courseId === m.courseId).map((row) => row.name),
        })),
    });
  }

  if (session.user.role !== "student") {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const mine = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, session.user.id));
  const ids = new Set(mine.map((e) => e.courseId));
  return NextResponse.json({
    messages: rows.filter((m) => m.courseId == null || ids.has(m.courseId)),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canSend(session.user.role)) {
    return NextResponse.json({ error: "فقط معلم یا مدیر می‌تواند اطلاعیه بفرستد." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const courseIdRaw = body?.courseId;
  const courseId =
    courseIdRaw === null || courseIdRaw === "" || courseIdRaw === "all"
      ? null
      : Number(courseIdRaw) || null;

  if (!content) {
    return NextResponse.json({ error: "متن اطلاعیه الزامی است." }, { status: 400 });
  }

  if (courseId) {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) {
      return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
    }
    if (session.user.role === "teacher" && course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "فقط برای دوره خودتان اطلاعیه بفرستید." }, { status: 403 });
    }
  } else if (session.user.role === "teacher") {
    return NextResponse.json(
      { error: "معلم فقط می‌تواند برای دوره خودش اطلاعیه بفرستد، نه کل مدرسه." },
      { status: 403 },
    );
  }

  const [row] = await db
    .insert(messages)
    .values({
      senderId: session.user.id,
      courseId,
      title: title || null,
      content,
    })
    .returning();

  return NextResponse.json({ message: row });
}
