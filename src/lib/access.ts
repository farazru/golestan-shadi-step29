import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { classSessions, courses, enrollments, parentLinks, user } from "@/db/schema";

export function isOffice(role?: string | null) {
  return role === "manager" || role === "deputy";
}

export async function teacherOwnsCourse(teacherId: string, courseId: number) {
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  return !!course && course.teacherId === teacherId;
}

export async function teacherOwnsStudent(teacherId: string, studentId: string) {
  const mine = await db.select({ id: courses.id }).from(courses).where(eq(courses.teacherId, teacherId));
  if (mine.length === 0) return false;
  const row = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.studentId, studentId), inArray(enrollments.courseId, mine.map((c) => c.id))),
  });
  return !!row;
}

export async function canManageCourse(role: string, userId: string, courseId: number | null) {
  if (isOffice(role)) return true;
  if (role !== "teacher" || !courseId) return false;
  return teacherOwnsCourse(userId, courseId);
}

export async function requireStudentAccount(studentId: string) {
  const row = await db.query.user.findFirst({ where: eq(user.id, studentId) });
  if (!row || row.role !== "student") return null;
  return row;
}

export async function requireParentAccount(parentId: string) {
  const row = await db.query.user.findFirst({ where: eq(user.id, parentId) });
  if (!row || row.role !== "parent") return null;
  return row;
}

export async function isEnrolled(studentId: string, courseId: number) {
  const row = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)),
  });
  return !!row;
}

export async function approvedParentOf(parentId: string, studentId: string) {
  const link = await db.query.parentLinks.findFirst({
    where: and(
      eq(parentLinks.parentId, parentId),
      eq(parentLinks.studentId, studentId),
      eq(parentLinks.status, "approved"),
    ),
  });
  return !!link;
}

export async function approvedChildIds(parentId: string) {
  const rows = await db
    .select({ studentId: parentLinks.studentId })
    .from(parentLinks)
    .where(and(eq(parentLinks.parentId, parentId), eq(parentLinks.status, "approved")));
  return rows.map((r) => r.studentId);
}

export async function authorizeClassroom(roomId: string, userId: string, role: string) {
  const sessionRow = await db.query.classSessions.findFirst({ where: eq(classSessions.roomId, roomId) });
  if (!sessionRow) return { ok: false as const, status: 404 as const, error: "کلاس پیدا نشد." };
  const course = await db.query.courses.findFirst({ where: eq(courses.id, sessionRow.courseId) });
  if (!course) return { ok: false as const, status: 404 as const, error: "دوره پیدا نشد." };
  if (course.teacherId === userId || isOffice(role)) {
    return { ok: true as const, classSession: sessionRow, course, staff: true };
  }
  if (role === "student" && (await isEnrolled(userId, course.id))) {
    return { ok: true as const, classSession: sessionRow, course, staff: false };
  }
  return { ok: false as const, status: 403 as const, error: "دسترسی غیرمجاز." };
}

export function parseScore(raw: unknown) {
  const n = Number(String(raw ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 20) return null;
  return n;
}

export function isIsoDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T12:00:00");
  return !Number.isNaN(d.getTime());
}
