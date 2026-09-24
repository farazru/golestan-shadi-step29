import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { courses, classSessions, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { GRADE_LEVELS } from "@/lib/grades";
import { isAlocomUrl } from "@/lib/alocom";
import { isOffice, teacherOwnsCourse } from "@/lib/access";
import { logAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager")) {
    return NextResponse.json({ error: "فقط معلم یا مدیر می‌تواند دوره بسازد." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const grade = typeof body?.grade === "string" ? body.grade.trim() : "";
  const meetingUrl = typeof body?.meetingUrl === "string" ? body.meetingUrl.trim() : "";
  if (!name) return NextResponse.json({ error: "نام دوره لازم است." }, { status: 400 });
  if (!grade) return NextResponse.json({ error: "پایه لازم است." }, { status: 400 });
  if (!GRADE_LEVELS.includes(grade as (typeof GRADE_LEVELS)[number])) {
    return NextResponse.json({ error: "پایه تحصیلی نامعتبر است." }, { status: 400 });
  }
  if (meetingUrl && !isAlocomUrl(meetingUrl)) {
    return NextResponse.json({ error: "فقط لینک https الوکام پذیرفته می‌شود." }, { status: 400 });
  }

  let teacherId: string;
  if (session.user.role === "teacher") {
    teacherId = session.user.id;
  } else {
    const requestedTeacherId = typeof body?.teacherId === "string" ? body.teacherId : "";
    if (!requestedTeacherId) {
      return NextResponse.json({ error: "انتخاب معلم الزامی است." }, { status: 400 });
    }
    const teacher = await db.query.user.findFirst({ where: eq(user.id, requestedTeacherId) });
    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "معلم انتخاب‌شده معتبر نیست." }, { status: 400 });
    }
    teacherId = requestedTeacherId;
  }

  const [course] = await db
    .insert(courses)
    .values({ name, description, grade, teacherId, meetingUrl: meetingUrl || null })
    .returning();

  await db.insert(classSessions).values({
    courseId: course.id,
    scheduledAt: new Date().toISOString(),
    roomId: `room-${randomUUID()}`,
  });
  await logAction(session.user.id, "create_course", name);
  return NextResponse.json({ course });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId) || 0;
  const meetingUrl = typeof body?.meetingUrl === "string" ? body.meetingUrl.trim() : "";
  if (!courseId) return NextResponse.json({ error: "دوره لازم است." }, { status: 400 });
  if (meetingUrl && !isAlocomUrl(meetingUrl)) {
    return NextResponse.json({ error: "فقط لینک https الوکام." }, { status: 400 });
  }
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
  const ok =
    isOffice(session.user.role) || (session.user.role === "teacher" && (await teacherOwnsCourse(session.user.id, courseId)));
  if (!ok) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  await db.update(courses).set({ meetingUrl: meetingUrl || null }).where(eq(courses.id, courseId));
  await logAction(session.user.id, "set_meeting_url", String(courseId));
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  }

  const allCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      grade: courses.grade,
      teacherId: courses.teacherId,
      meetingUrl: courses.meetingUrl,
      teacherFirstName: user.firstName,
      teacherLastName: user.lastName,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .leftJoin(user, eq(courses.teacherId, user.id))
    .orderBy(desc(courses.createdAt));

  return NextResponse.json({ courses: allCourses });
}
