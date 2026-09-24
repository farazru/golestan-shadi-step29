import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classSessions, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { authorizeClassroom, isOffice } from "@/lib/access";
import { isAlocomUrl } from "@/lib/alocom";
import { logAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const roomId = request.nextUrl.searchParams.get("roomId") ?? "";
  const access = await authorizeClassroom(roomId, session.user.id, session.user.role);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  return NextResponse.json({
    courseName: access.course.name,
    meetingUrl: access.course.meetingUrl ?? null,
    status: access.classSession.status,
    canEdit: access.staff,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  const meetingUrl = typeof body?.meetingUrl === "string" ? body.meetingUrl.trim() : "";
  const access = await authorizeClassroom(roomId, session.user.id, session.user.role);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!access.staff && !isOffice(session.user.role)) {
    return NextResponse.json({ error: "فقط معلم یا دفتر لینک می‌گذارد." }, { status: 403 });
  }
  if (meetingUrl && !isAlocomUrl(meetingUrl)) {
    return NextResponse.json({ error: "فقط لینک https الوکام." }, { status: 400 });
  }
  await db.update(courses).set({ meetingUrl: meetingUrl || null }).where(eq(courses.id, access.course.id));
  if (meetingUrl) {
    await db.update(classSessions).set({ status: "live" }).where(eq(classSessions.id, access.classSession.id));
  }
  await logAction(session.user.id, "set_alocom_link", roomId);
  return NextResponse.json({ success: true });
}
