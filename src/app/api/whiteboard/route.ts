import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { classSessions, courses, enrollments } from "@/db/schema";
import { db } from "@/db";
import { getSession } from "@/lib/get-session";

// Same authorization shape as the LiveKit token route: only the course's
// own teacher, an enrolled student, or a manager may read/write the
// whiteboard for a given room.
async function canAccessRoom(roomId: string, userId: string, role: string) {
  const session_ = await db.query.classSessions.findFirst({ where: eq(classSessions.roomId, roomId) });
  if (!session_) return { ok: false as const, status: 404, error: "کلاس پیدا نشد." };

  const course = await db.query.courses.findFirst({ where: eq(courses.id, session_.courseId) });
  if (!course) return { ok: false as const, status: 404, error: "دوره پیدا نشد." };

  if (course.teacherId === userId || role === "manager" || role === "deputy") {
    return { ok: true as const, classSessionId: session_.id };
  }

  const enrolled = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.studentId, userId), eq(enrollments.courseId, course.id)),
  });
  if (!enrolled) return { ok: false as const, status: 403, error: "دسترسی غیرمجاز." };
  return { ok: true as const, classSessionId: session_.id };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد نشده‌اید." }, { status: 401 });

  const roomId = request.nextUrl.searchParams.get("roomId") ?? "";
  const access = await canAccessRoom(roomId, session.user.id, session.user.role);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const row = await db.query.classSessions.findFirst({ where: eq(classSessions.roomId, roomId) });
  return NextResponse.json({ whiteboardJson: row?.whiteboardJson ?? null });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد نشده‌اید." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  const whiteboardJson = typeof body?.whiteboardJson === "string" ? body.whiteboardJson : "";

  const access = await canAccessRoom(roomId, session.user.id, session.user.role);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  await db
    .update(classSessions)
    .set({ whiteboardJson })
    .where(eq(classSessions.roomId, roomId));

  return NextResponse.json({ success: true });
}
