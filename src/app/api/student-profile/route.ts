import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles, user, parentLinks } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isGradeLevel } from "@/lib/grades";
import { profileMissing } from "@/lib/roles";
import { isOffice, teacherOwnsStudent } from "@/lib/access";
import { logAction } from "@/lib/audit";

function publicSlice(profile: Record<string, unknown> | null) {
  if (!profile) return null;
  return {
    dateOfBirth: profile.dateOfBirth ?? null,
    notes: profile.notes ?? null,
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const studentId = request.nextUrl.searchParams.get("studentId") || session.user.id;

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.studentId, studentId),
  });
  const student = await db.query.user.findFirst({ where: eq(user.id, studentId) });

  if (session.user.id === studentId || isOffice(session.user.role)) {
    return NextResponse.json({
      profile: profile ?? null,
      grade: student?.grade ?? null,
      missing: profileMissing(profile ?? null),
    });
  }

  if (session.user.role === "parent") {
    const link = await db.query.parentLinks.findFirst({
      where: and(eq(parentLinks.parentId, session.user.id), eq(parentLinks.studentId, studentId)),
    });
    const ok = link && link.status === "approved";
    if (!ok) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
    return NextResponse.json({
      profile: profile ?? null,
      grade: student?.grade ?? null,
      missing: profileMissing(profile ?? null),
    });
  }

  if (session.user.role === "teacher") {
    if (!(await teacherOwnsStudent(session.user.id, studentId))) {
      return NextResponse.json({ error: "این دانش‌آموز در کلاس شما نیست." }, { status: 403 });
    }
    return NextResponse.json({
      profile: publicSlice(profile as unknown as Record<string, unknown> | null),
      grade: student?.grade ?? null,
      firstName: student?.firstName,
      lastName: student?.lastName,
      missing: [],
      readOnly: true,
    });
  }

  return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const studentId =
    session.user.role === "student"
      ? session.user.id
      : typeof body?.studentId === "string"
        ? body.studentId
        : session.user.id;

  const allowed =
    session.user.id === studentId ||
    isOffice(session.user.role) ||
    (session.user.role === "parent" && studentId !== session.user.id);
  if (session.user.role === "teacher") {
    return NextResponse.json({ error: "معلم نمی‌تواند اطلاعات منزل را ویرایش کند." }, { status: 403 });
  }
  if (!allowed && session.user.role !== "parent") {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  if (session.user.role === "parent") {
    const link = await db.query.parentLinks.findFirst({
      where: and(eq(parentLinks.parentId, session.user.id), eq(parentLinks.studentId, studentId)),
    });
    if (!link || link.status !== "approved") {
      return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
    }
  }

  const existing = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.studentId, studentId),
  });
  const isParent = session.user.role === "parent";
  const contact = {
    address: body?.address || null,
    studentPhone: body?.studentPhone || null,
    fatherName: body?.fatherName || null,
    fatherPhone: body?.fatherPhone || null,
    motherName: body?.motherName || null,
    motherPhone: body?.motherPhone || null,
  };
  const fields = isParent
    ? {
        ...contact,
        dateOfBirth: existing?.dateOfBirth ?? null,
        notes: existing?.notes ?? null,
        updatedAt: new Date().toISOString(),
      }
    : {
        ...contact,
        dateOfBirth: body?.dateOfBirth || null,
        notes: isOffice(session.user.role) ? body?.notes || null : existing?.notes ?? null,
        updatedAt: new Date().toISOString(),
      };
  const missing = profileMissing(fields);
  const complete = missing.length === 0;

  if (existing) {
    await db.update(studentProfiles).set({ ...fields, complete }).where(eq(studentProfiles.studentId, studentId));
  } else {
    await db.insert(studentProfiles).values({ id: randomUUID(), studentId, ...fields, complete });
  }

  if (typeof body?.grade === "string" && body.grade.trim() && isOffice(session.user.role)) {
    if (!isGradeLevel(body.grade.trim())) {
      return NextResponse.json({ error: "پایه تحصیلی نامعتبر است." }, { status: 400 });
    }
    await db.update(user).set({ grade: body.grade.trim() }).where(eq(user.id, studentId));
  }

  await logAction(session.user.id, "profile_update", `${studentId}:${isParent ? "parent-contact" : session.user.role}`);
  return NextResponse.json({ success: true, complete, missing });
}
