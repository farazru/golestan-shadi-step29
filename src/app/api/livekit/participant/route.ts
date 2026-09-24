import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classSessions, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { muteAllExcept, setCanPublish } from "@/lib/livekit-admin";
import { logAction } from "@/lib/audit";
import { errorMessage } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager")) {
    return NextResponse.json({ error: "فقط معلم یا مدیر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  const action = body?.action as string;
  const identity = typeof body?.identity === "string" ? body.identity : "";
  if (!roomId || !action) {
    return NextResponse.json({ error: "roomId و action الزامی است." }, { status: 400 });
  }

  const cls = await db.query.classSessions.findFirst({ where: eq(classSessions.roomId, roomId) });
  if (!cls) return NextResponse.json({ error: "کلاس پیدا نشد." }, { status: 404 });
  const course = await db.query.courses.findFirst({ where: eq(courses.id, cls.courseId) });
  if (session.user.role === "teacher" && course?.teacherId !== session.user.id) {
    return NextResponse.json({ error: "این دوره مال شما نیست." }, { status: 403 });
  }

  try {
    if (action === "allow") {
      if (!identity) return NextResponse.json({ error: "identity الزامی است." }, { status: 400 });
      await setCanPublish(roomId, identity, true);
      await logAction(session.user.id, "allow_talk", identity);
    } else if (action === "revoke") {
      if (!identity) return NextResponse.json({ error: "identity الزامی است." }, { status: 400 });
      await setCanPublish(roomId, identity, false);
      await logAction(session.user.id, "revoke_talk", identity);
    } else if (action === "mute-all") {
      await muteAllExcept(roomId, session.user.id);
      await logAction(session.user.id, "mute_all", roomId);
    } else {
      return NextResponse.json({ error: "action نامعتبر." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: errorMessage(err, "LiveKit در دسترس نیست.") }, { status: 500 });
  }
}
