import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, user, classSessions } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isOffice, teacherOwnsCourse } from "@/lib/access";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const courseId = Number(request.nextUrl.searchParams.get("courseId")) || 0;
  if (!courseId) return NextResponse.json({ error: "courseId الزامی است." }, { status: 400 });

  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
  const ok = isOffice(session.user.role) || (session.user.role === "teacher" && (await teacherOwnsCourse(session.user.id, courseId)));
  if (!ok && session.user.role !== "student") return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });

  const rows = await db
    .select({ studentId: user.id, firstName: user.firstName, lastName: user.lastName, image: user.image })
    .from(enrollments)
    .innerJoin(user, eq(enrollments.studentId, user.id))
    .where(eq(enrollments.courseId, courseId));

  const sessionRow = await db.query.classSessions.findFirst({ where: eq(classSessions.courseId, courseId) });
  return NextResponse.json({ students: rows, roomId: sessionRow?.roomId ?? null, meetingUrl: course.meetingUrl });
}
