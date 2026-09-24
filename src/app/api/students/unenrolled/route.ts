import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user, enrollments } from "@/db/schema";
import { getSession } from "@/lib/get-session";

// Students who signed up but never enrolled in anything — staff can find
// them here and either enroll them directly or fill in their profile.
export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const enrolledStudentIds = await db
    .selectDistinct({ studentId: enrollments.studentId })
    .from(enrollments);
  const idsWithEnrollment = enrolledStudentIds.map((e) => e.studentId);

  const allStudents = await db
    .select({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      grade: user.grade,
    })
    .from(user)
    .where(eq(user.role, "student"));

  const unenrolled = idsWithEnrollment.length
    ? allStudents.filter((s) => !idsWithEnrollment.includes(s.id))
    : allStudents;

  return NextResponse.json({ students: unenrolled });
}
