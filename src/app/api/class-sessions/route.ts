import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { logAction } from "@/lib/audit";
import { startRecording } from "@/lib/livekit-admin";
import { authorizeClassroom } from "@/lib/access";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const roomId = request.nextUrl.searchParams.get("roomId") ?? "";
  if (!roomId) return NextResponse.json({ error: "roomId الزامی است." }, { status: 400 });
  const access = await authorizeClassroom(roomId, session.user.id, session.user.role);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const row = access.classSession;
  return NextResponse.json({
    status: row.status,
    recording: row.recording,
    whiteboardJson: row.whiteboardJson,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  if (!roomId) return NextResponse.json({ error: "roomId الزامی است." }, { status: 400 });

  const access = await authorizeClassroom(roomId, session.user.id, session.user.role);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  if (typeof body?.whiteboardJson === "string") {
    await db
      .update(classSessions)
      .set({ whiteboardJson: body.whiteboardJson })
      .where(eq(classSessions.id, access.classSession.id));
    return NextResponse.json({ success: true });
  }

  if (!access.staff) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });

  const patch: { status?: "ended" | "live" | "scheduled"; recording?: boolean } = {};
  if (body?.status === "ended" || body?.status === "live" || body?.status === "scheduled") {
    patch.status = body.status;
  }
  if (typeof body?.recording === "boolean") patch.recording = body.recording;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "چیزی برای به‌روزرسانی نیست." }, { status: 400 });
  }

  await db.update(classSessions).set(patch).where(eq(classSessions.id, access.classSession.id));
  await logAction(session.user.id, "update_session", `${roomId}:${JSON.stringify(patch)}`);

  if (patch.recording === true) {
    try {
      await startRecording(roomId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ضبط شروع نشد.";
      return NextResponse.json({ success: true, recordingWarning: message });
    }
  }

  return NextResponse.json({ success: true, ...patch });
}
