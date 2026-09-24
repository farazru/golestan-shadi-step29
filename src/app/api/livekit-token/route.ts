import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { classSessions, courses, enrollments, studentProfiles } from "@/db/schema";
import { db } from "@/db";
import { getSession } from "@/lib/get-session";
import { createLiveKitToken } from "@/lib/livekit";
import { rateLimit } from "@/lib/rate-limit";
import { errorMessage } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "برای ورود به کلاس باید وارد حساب شوید." }, { status: 401 });
  }

  const limit = rateLimit(`livekit-token:${session.user.id}`, 20, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "درخواست بیش از حد. کمی صبر کنید." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  if (!roomId) {
    return NextResponse.json({ error: "شناسه اتاق الزامی است." }, { status: 400 });
  }

  const classSession = await db.query.classSessions.findFirst({
    where: eq(classSessions.roomId, roomId),
  });
  if (!classSession) {
    return NextResponse.json({ error: "این کلاس وجود ندارد." }, { status: 404 });
  }

  if (session.user.role === "parent") {
    return NextResponse.json({ error: "والدین به کلاس زنده دسترسی ندارند." }, { status: 403 });
  }

  if (classSession.status === "ended") {
    return NextResponse.json({ error: "این جلسه کلاس به پایان رسیده است." }, { status: 403 });
  }

  const isStaffJoining =
    session.user.role === "teacher" ||
    session.user.role === "manager" ||
    session.user.role === "deputy";
  if (classSession.status === "scheduled" && !isStaffJoining) {
    return NextResponse.json({ error: "WAITING", status: "scheduled" }, { status: 409 });
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, classSession.courseId),
  });
  if (!course) {
    return NextResponse.json({ error: "این دوره وجود ندارد." }, { status: 404 });
  }

  const role = session.user.role as "student" | "teacher" | "manager" | "deputy";
  const isTeacher = course.teacherId === session.user.id;
  const isOffice = role === "manager" || role === "deputy";
  let isEnrolled = false;
  if (!isTeacher && !isOffice) {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.studentId, session.user.id), eq(enrollments.courseId, course.id)),
    });
    isEnrolled = Boolean(enrollment);
  }

  if (!isTeacher && !isOffice && !isEnrolled) {
    return NextResponse.json({ error: "شما اجازه ورود به این کلاس را ندارید." }, { status: 403 });
  }

  if (role === "student") {
    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.studentId, session.user.id),
    });
    if (!profile?.complete) {
      return NextResponse.json(
        {
          error: "PROFILE_INCOMPLETE",
          message: "پیش از ورود به کلاس، باید پرونده خود را تکمیل کنید.",
        },
        { status: 412 },
      );
    }
  }

  try {
    const token = await createLiveKitToken({
      roomId,
      identity: session.user.id,
      name: `${session.user.firstName} ${session.user.lastName}`,
      role,
      avatar: session.user.image,
    });
    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;
    if (!url) {
      return NextResponse.json(
        { error: "آدرس سرور ویدیو تنظیم نشده است. فایل .env.local را ببینید." },
        { status: 500 },
      );
    }
    return NextResponse.json({
      token,
      url,
      role,
      courseName: course.name,
      courseId: course.id,
      sessionId: classSession.id,
      status: classSession.status,
      recording: classSession.recording,
      whiteboardJson: classSession.whiteboardJson,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err, "ساخت توکن ویدیو ممکن نشد.") }, { status: 500 });
  }
}
