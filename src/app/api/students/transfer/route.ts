import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, user, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isGradeLevel } from "@/lib/grades";
import { logAction } from "@/lib/audit";
import { requireStudentAccount } from "@/lib/access";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager" && session.user.role !== "deputy")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const grade = typeof body?.grade === "string" ? body.grade.trim() : "";
  const unenroll = Boolean(body?.unenroll);
  const courseId = Number(body?.courseId) || 0;
  if (!studentId) return NextResponse.json({ error: "studentId الزامی است." }, { status: 400 });
  const target = await requireStudentAccount(studentId);
  if (!target) return NextResponse.json({ error: "دانش‌آموز پیدا نشد." }, { status: 404 });

  // Changing a student's grade is a whole-school administrative action —
  // not scoped to any one class — so only manager/deputy may do it.
  if (grade) {
    if (session.user.role === "teacher") {
      return NextResponse.json(
        { error: "تغییر پایه فقط توسط مدیر یا معاون قابل انجام است." },
        { status: 403 },
      );
    }
    if (!isGradeLevel(grade)) {
      return NextResponse.json({ error: "پایه نامعتبر." }, { status: 400 });
    }
    await db.update(user).set({ grade }).where(eq(user.id, studentId));
    await logAction(session.user.id, "transfer_grade", `${studentId}:${grade}`);
  }

  if (unenroll && courseId) {
    // A teacher may only unenroll a student from a course THEY teach —
    // not any course in the school.
    if (session.user.role === "teacher") {
      const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json({ error: "این دوره متعلق به شما نیست." }, { status: 403 });
      }
    }
    await db
      .delete(enrollments)
      .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));
    await logAction(session.user.id, "unenroll", `${studentId}:${courseId}`);
  }
  return NextResponse.json({ success: true });
}
