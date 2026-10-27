import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, messages, attendance, classSessions } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { todayIsoDate } from "@/lib/semester";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  const next = await db.query.courses.findFirst({ orderBy: desc(courses.id) });
  const ann = await db.query.messages.findFirst({ orderBy: desc(messages.id) });

  const today = todayIsoDate();
  const taken = await db
    .select({ id: attendance.id })
    .from(attendance)
    .innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
    .where(eq(attendance.studentId, session.user.id))
    .limit(1);

  return NextResponse.json({
    nextClass: next?.name ?? null,
    announcement: ann?.title ?? null,
    attendanceTaken: taken.length > 0,
  });
}
