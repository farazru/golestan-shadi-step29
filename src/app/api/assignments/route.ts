import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { assignments, courses, enrollments, submissions } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { logAction } from "@/lib/audit";
import { approvedChildIds, teacherOwnsCourse } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      courseId: assignments.courseId,
      courseName: courses.name,
      createdAt: assignments.createdAt,
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .orderBy(desc(assignments.createdAt));

  if (session.user.role === "manager" || session.user.role === "deputy") {
    return NextResponse.json({ assignments: rows });
  }
  if (session.user.role === "teacher") {
    const mine = await db.select({ id: courses.id }).from(courses).where(eq(courses.teacherId, session.user.id));
    const ids = new Set(mine.map((c) => c.id));
    return NextResponse.json({ assignments: rows.filter((a) => ids.has(a.courseId)) });
  }
  if (session.user.role === "parent") {
    const childIds = await approvedChildIds(session.user.id);
    if (childIds.length === 0) return NextResponse.json({ assignments: [] });
    const enrolled = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(inArray(enrollments.studentId, childIds));
    const ids = new Set(enrolled.map((e) => e.courseId));
    return NextResponse.json({ assignments: rows.filter((a) => ids.has(a.courseId)) });
  }
  const mine = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, session.user.id));
  const ids = new Set(mine.map((e) => e.courseId));
  const mineAssign = rows.filter((a) => ids.has(a.courseId));
  const done = await db.select().from(submissions).where(eq(submissions.studentId, session.user.id));
  const doneIds = new Set(done.map((s) => s.assignmentId));
  return NextResponse.json({
    assignments: mineAssign.map((a) => ({ ...a, submitted: doneIds.has(a.id) })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager")) {
    return NextResponse.json({ error: "فقط معلم یا مدیر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const courseId = Number(body?.courseId) || 0;
  if (!title || !courseId) return NextResponse.json({ error: "عنوان و دوره الزامی است." }, { status: 400 });
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
  if (session.user.role === "teacher" && !(await teacherOwnsCourse(session.user.id, courseId))) {
    return NextResponse.json({ error: "این دوره مال شما نیست." }, { status: 403 });
  }
  const [row] = await db
    .insert(assignments)
    .values({
      courseId,
      title,
      instructions: typeof body?.instructions === "string" ? body.instructions : "",
      dueAt: typeof body?.dueAt === "string" ? body.dueAt : null,
      createdBy: session.user.id,
    })
    .returning();
  await logAction(session.user.id, "create_assignment", title);
  return NextResponse.json({ assignment: row });
}
