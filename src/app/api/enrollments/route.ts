import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isOffice, requireStudentAccount, teacherOwnsCourse } from "@/lib/access";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId);
  if (!courseId) {
    return NextResponse.json({ error: "درس لازم است." }, { status: 400 });
  }

  let studentId: string;
  if (session.user.role === "student") {
    studentId = session.user.id;
  } else if (session.user.role === "teacher") {
    studentId = typeof body?.studentId === "string" ? body.studentId : "";
    if (!studentId) {
      return NextResponse.json({ error: "دانش‌آموز لازم است." }, { status: 400 });
    }
    if (!(await teacherOwnsCourse(session.user.id, courseId))) {
      return NextResponse.json({ error: "فقط درس خودتان." }, { status: 403 });
    }
  } else if (isOffice(session.user.role)) {
    studentId = typeof body?.studentId === "string" ? body.studentId : "";
    if (!studentId) {
      return NextResponse.json({ error: "دانش‌آموز لازم است." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const target = await requireStudentAccount(studentId);
  if (!target) return NextResponse.json({ error: "این حساب دانش‌آموز نیست." }, { status: 400 });

  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) {
    return NextResponse.json({ error: "این درس وجود ندارد." }, { status: 404 });
  }

  const existing = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)),
  });
  if (existing) {
    return NextResponse.json({ error: "قبلاً در این درس ثبت شده." }, { status: 409 });
  }

  await db.insert(enrollments).values({ studentId, courseId });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  }

  const myEnrollments = await db
    .select({
      courseId: courses.id,
      name: courses.name,
      description: courses.description,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, session.user.id));

  return NextResponse.json({ enrollments: myEnrollments });
}
