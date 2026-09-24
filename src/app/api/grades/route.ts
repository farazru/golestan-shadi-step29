import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { grades, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { logAction } from "@/lib/audit";
import { approvedParentOf, isEnrolled, parseScore, requireStudentAccount, teacherOwnsCourse } from "@/lib/access";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const studentId = request.nextUrl.searchParams.get("studentId") || session.user.id;

  if (session.user.role === "student" && studentId !== session.user.id) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  if (session.user.role === "parent") {
    if (!(await approvedParentOf(session.user.id, studentId))) {
      return NextResponse.json({ error: "این فرزند به شما وصل نیست." }, { status: 403 });
    }
  }
  if (session.user.role === "teacher") {
    const mine = await db.select({ id: courses.id }).from(courses).where(eq(courses.teacherId, session.user.id));
    const ids = mine.map((c) => c.id);
    if (ids.length === 0) return NextResponse.json({ grades: [] });
    const rows = await db
      .select({
        id: grades.id,
        kind: grades.kind,
        score: grades.score,
        note: grades.note,
        courseName: courses.name,
        recordedAt: grades.recordedAt,
        studentId: grades.studentId,
      })
      .from(grades)
      .innerJoin(courses, eq(grades.courseId, courses.id))
      .where(and(eq(grades.studentId, studentId), inArray(grades.courseId, ids)))
      .orderBy(desc(grades.recordedAt));
    return NextResponse.json({ grades: rows });
  }

  const rows = await db
    .select({
      id: grades.id,
      kind: grades.kind,
      score: grades.score,
      note: grades.note,
      courseName: courses.name,
      recordedAt: grades.recordedAt,
      studentId: grades.studentId,
    })
    .from(grades)
    .innerJoin(courses, eq(grades.courseId, courses.id))
    .where(eq(grades.studentId, studentId))
    .orderBy(desc(grades.recordedAt));
  return NextResponse.json({ grades: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager" && session.user.role !== "deputy")) {
    return NextResponse.json({ error: "فقط معلم یا دفتر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId) || 0;
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const kind = body?.kind === "midterm" || body?.kind === "final" ? body.kind : "continuous";
  const scoreNum = parseScore(body?.score);
  if (!courseId || !studentId || scoreNum === null) {
    return NextResponse.json({ error: "دوره، دانش‌آموز و نمره ۰ تا ۲۰ الزامی است." }, { status: 400 });
  }
  const student = await requireStudentAccount(studentId);
  if (!student) return NextResponse.json({ error: "این حساب دانش‌آموز نیست." }, { status: 400 });
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
  if (session.user.role === "teacher" && !(await teacherOwnsCourse(session.user.id, courseId))) {
    return NextResponse.json({ error: "این دوره مال شما نیست." }, { status: 403 });
  }
  if (!(await isEnrolled(studentId, courseId))) {
    return NextResponse.json({ error: "این دانش‌آموز در این درس ثبت نشده." }, { status: 403 });
  }
  await db.insert(grades).values({
    courseId,
    studentId,
    kind,
    score: String(scoreNum),
    note: typeof body?.note === "string" ? body.note : "",
    recordedBy: session.user.id,
  });
  await logAction(session.user.id, "record_grade", `${studentId}:${scoreNum}`);
  return NextResponse.json({ success: true });
}
