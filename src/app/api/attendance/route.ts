import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { db } from "@/db";
import { attendance, classSessions, courses, enrollments, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isEnrolled, isOffice, requireStudentAccount } from "@/lib/access";
import { academicYearRange, todayIsoDate } from "@/lib/semester";

const STATUSES = ["present", "absent", "late"] as const;

function canStaff(role: string) {
  return role === "teacher" || isOffice(role);
}

// Teacher/manager marks a student, or a student self-reports present on join.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد حساب شوید." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const status = STATUSES.includes(body?.status) ? body.status : "present";
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  let classSessionId = Number(body?.classSessionId) || 0;
  let studentId = typeof body?.studentId === "string" ? body.studentId : "";

  if (roomId && !classSessionId) {
    const found = await db.query.classSessions.findFirst({
      where: eq(classSessions.roomId, roomId),
    });
    if (!found) {
      return NextResponse.json({ error: "جلسه کلاس پیدا نشد." }, { status: 404 });
    }
    classSessionId = found.id;
  }

  if (!classSessionId) {
    return NextResponse.json({ error: "classSessionId یا roomId الزامی است." }, { status: 400 });
  }

  const classSession = await db.query.classSessions.findFirst({
    where: eq(classSessions.id, classSessionId),
  });
  if (!classSession) {
    return NextResponse.json({ error: "جلسه کلاس پیدا نشد." }, { status: 404 });
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, classSession.courseId),
  });
  if (!course) {
    return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
  }

  if (session.user.role === "student") {
    studentId = session.user.id;
    const enrolled = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, course.id)),
    });
    if (!enrolled) {
      return NextResponse.json({ error: "شما در این دوره ثبت‌نام نیستید." }, { status: 403 });
    }
  } else if (canStaff(session.user.role)) {
    if (!studentId) {
      return NextResponse.json({ error: "studentId الزامی است." }, { status: 400 });
    }
    if (session.user.role === "teacher" && course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "فقط معلم همین دوره می‌تواند حضور را ثبت کند." }, { status: 403 });
    }
    const student = await requireStudentAccount(studentId);
    if (!student) {
      return NextResponse.json({ error: "دانش‌آموز پیدا نشد." }, { status: 404 });
    }
    if (!(await isEnrolled(studentId, course.id))) {
      return NextResponse.json({ error: "این دانش‌آموز در این دوره نیست." }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const existing = await db.query.attendance.findFirst({
    where: and(
      eq(attendance.classSessionId, classSessionId),
      eq(attendance.studentId, studentId),
    ),
  });

  if (existing) {
    await db
      .update(attendance)
      .set({ status, recordedAt: new Date().toISOString() })
      .where(eq(attendance.id, existing.id));
  } else {
    await db.insert(attendance).values({
      classSessionId,
      studentId,
      status,
      recordedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !canStaff(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const view = request.nextUrl.searchParams.get("view") ?? "daily";
  const date = request.nextUrl.searchParams.get("date") ?? todayIsoDate();
  const courseId = Number(request.nextUrl.searchParams.get("courseId")) || 0;

  if (view === "semester") {
    const year = academicYearRange();
    const rows = await db
      .select({
        id: attendance.id,
        status: attendance.status,
        recordedAt: attendance.recordedAt,
        studentId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        grade: user.grade,
        courseId: courses.id,
        courseName: courses.name,
        roomId: classSessions.roomId,
      })
      .from(attendance)
      .innerJoin(user, eq(attendance.studentId, user.id))
      .innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
      .innerJoin(courses, eq(classSessions.courseId, courses.id))
      .where(
        and(
          gte(attendance.recordedAt, year.startIso),
          lte(attendance.recordedAt, year.endIso),
          courseId ? eq(courses.id, courseId) : undefined,
          session.user.role === "teacher" ? eq(courses.teacherId, session.user.id) : undefined,
        ),
      )
      .orderBy(desc(attendance.recordedAt));

    const byStudent: Record<
      string,
      {
        studentId: string;
        firstName: string;
        lastName: string;
        grade: string | null;
        present: number;
        absent: number;
        late: number;
        total: number;
      }
    > = {};

    for (const row of rows) {
      if (!byStudent[row.studentId]) {
        byStudent[row.studentId] = {
          studentId: row.studentId,
          firstName: row.firstName,
          lastName: row.lastName,
          grade: row.grade,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      byStudent[row.studentId][row.status as "present" | "absent" | "late"] += 1;
      byStudent[row.studentId].total += 1;
    }

    return NextResponse.json({
      view: "semester",
      year: year.label,
      summary: Object.values(byStudent),
      records: rows,
    });
  }

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const rows = await db
    .select({
      id: attendance.id,
      status: attendance.status,
      recordedAt: attendance.recordedAt,
      studentId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      grade: user.grade,
      courseId: courses.id,
      courseName: courses.name,
      classSessionId: classSessions.id,
    })
    .from(attendance)
    .innerJoin(user, eq(attendance.studentId, user.id))
    .innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
    .innerJoin(courses, eq(classSessions.courseId, courses.id))
    .where(
      and(
        gte(attendance.recordedAt, dayStart),
        lte(attendance.recordedAt, dayEnd),
        courseId ? eq(courses.id, courseId) : undefined,
        session.user.role === "teacher" ? eq(courses.teacherId, session.user.id) : undefined,
      ),
    )
    .orderBy(courses.name, user.lastName);

  return NextResponse.json({ view: "daily", date, records: rows });
}
