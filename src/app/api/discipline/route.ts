import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { discipline, user, courses, enrollments } from "@/db/schema";
import { getSession } from "@/lib/get-session";

function canWrite(role: string) {
  return role === "teacher" || role === "deputy" || role === "manager";
}

// A teacher may only write a note for a student who is actually enrolled
// in one of THEIR OWN courses — not any student in the school. Deputy
// and manager have school-wide oversight, so they're exempt from this.
async function teacherOwnsStudent(teacherId: string, studentId: string) {
  const myCourses = await db.select({ id: courses.id }).from(courses).where(eq(courses.teacherId, teacherId));
  for (const c of myCourses) {
    const enrolled = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, c.id)),
    });
    if (enrolled) return true;
  }
  return false;
}

const KINDS = ["note", "warning", "serious"] as const;

// Add a discipline note (تذکر) for a student.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const kind = KINDS.includes(body?.kind) ? body.kind : "note";

  if (!studentId || !note) {
    return NextResponse.json({ error: "دانش‌آموز و متن تذکر الزامی است." }, { status: 400 });
  }

  const student = await db.query.user.findFirst({ where: eq(user.id, studentId) });
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "دانش‌آموز پیدا نشد." }, { status: 404 });
  }

  // Scope check: a teacher can only act on their own students.
  if (session.user.role === "teacher" && !(await teacherOwnsStudent(session.user.id, studentId))) {
    return NextResponse.json(
      { error: "این دانش‌آموز در هیچ‌کدام از کلاس‌های شما نیست." },
      { status: 403 },
    );
  }

  const [item] = await db
    .insert(discipline)
    .values({ studentId, actorId: session.user.id, note, kind })
    .returning();

  return NextResponse.json({ item });
}

// A student's full discipline history — visible to staff, or to the
// student themselves viewing their own record.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  }

  const studentId = request.nextUrl.searchParams.get("studentId") || session.user.id;
  const isSelf = studentId === session.user.id;
  if (!isSelf && !canWrite(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  if (
    !isSelf &&
    session.user.role === "teacher" &&
    !(await teacherOwnsStudent(session.user.id, studentId))
  ) {
    return NextResponse.json(
      { error: "این دانش‌آموز در هیچ‌کدام از کلاس‌های شما نیست." },
      { status: 403 },
    );
  }

  const rows = await db
    .select({
      id: discipline.id,
      note: discipline.note,
      kind: discipline.kind,
      createdAt: discipline.createdAt,
      actorFirstName: user.firstName,
      actorLastName: user.lastName,
    })
    .from(discipline)
    .leftJoin(user, eq(discipline.actorId, user.id))
    .where(eq(discipline.studentId, studentId))
    .orderBy(desc(discipline.createdAt));

  return NextResponse.json({ items: rows });
}
