import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { timetableSlots, courses } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { PERIODS } from "@/lib/periods";
import { logAction } from "@/lib/audit";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const rows = await db
    .select({
      id: timetableSlots.id,
      courseId: timetableSlots.courseId,
      weekday: timetableSlots.weekday,
      period: timetableSlots.period,
      startTime: timetableSlots.startTime,
      endTime: timetableSlots.endTime,
      courseName: courses.name,
      grade: courses.grade,
      teacherId: courses.teacherId,
    })
    .from(timetableSlots)
    .innerJoin(courses, eq(timetableSlots.courseId, courses.id));
  return NextResponse.json({ slots: rows, periods: PERIODS });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "teacher" && session.user.role !== "manager")) {
    return NextResponse.json({ error: "فقط معلم یا مدیر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId) || 0;
  const weekday = Number(body?.weekday);
  const period = Number(body?.period);
  const meta = PERIODS.find((p) => p.period === period);
  if (!courseId || Number.isNaN(weekday) || !meta) {
    return NextResponse.json({ error: "دوره، روز و زنگ الزامی است." }, { status: 400 });
  }
  await db.insert(timetableSlots).values({
    courseId,
    weekday,
    period: meta.period,
    startTime: meta.startTime,
    endTime: meta.endTime,
  });
  await logAction(session.user.id, "add_timetable_slot", `${courseId}-${weekday}-${period}`);
  return NextResponse.json({ success: true });
}
