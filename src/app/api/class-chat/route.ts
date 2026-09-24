import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classChat, courses, enrollments, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";

async function canAccess(userId: string, role: string, courseId: number) {
  if (role === "manager" || role === "deputy") return true;
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return false;
  if (course.teacherId === userId) return true;
  const en = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.studentId, userId), eq(enrollments.courseId, courseId)),
  });
  return Boolean(en);
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const courseId = Number(request.nextUrl.searchParams.get("courseId")) || 0;
  if (!courseId) return NextResponse.json({ error: "courseId الزامی است." }, { status: 400 });
  if (!(await canAccess(session.user.id, session.user.role, courseId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const rows = await db
    .select({
      id: classChat.id,
      body: classChat.body,
      createdAt: classChat.createdAt,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
    .from(classChat)
    .innerJoin(user, eq(classChat.userId, user.id))
    .where(eq(classChat.courseId, courseId))
    .orderBy(desc(classChat.id))
    .limit(80);
  return NextResponse.json({ messages: rows.reverse() });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId) || 0;
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!courseId || !text) return NextResponse.json({ error: "متن خالی است." }, { status: 400 });
  if (!(await canAccess(session.user.id, session.user.role, courseId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const [inserted] = await db
    .insert(classChat)
    .values({ courseId, userId: session.user.id, body: text })
    .returning();

  return NextResponse.json({
    message: {
      id: inserted.id,
      body: inserted.body,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
    },
  });
}
