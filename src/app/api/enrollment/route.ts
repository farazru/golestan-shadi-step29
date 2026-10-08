import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles, studentRecords, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { approvedParentOf, isOffice, teacherOwnsStudent } from "@/lib/access";
import { cleanPayload, emptyPayload, teacherSlice, type RecordPayload } from "@/lib/enrollment";
import { isGradeLevel } from "@/lib/grades";
import { logAction } from "@/lib/audit";
import { profileMissing } from "@/lib/roles";

function parsePayload(raw: string | null | undefined): RecordPayload {
  try {
    const { payload } = cleanPayload(JSON.parse(raw || "{}"));
    return payload;
  } catch {
    return emptyPayload();
  }
}

async function canRead(role: string, userId: string, studentId: string) {
  if (userId === studentId || isOffice(role)) return "full" as const;
  if (role === "parent" && (await approvedParentOf(userId, studentId))) return "full" as const;
  if (role === "teacher" && (await teacherOwnsStudent(userId, studentId))) return "teacher" as const;
  return null;
}

async function canWrite(role: string, userId: string, studentId: string) {
  if (role === "teacher") return false;
  if (userId === studentId || isOffice(role)) return true;
  if (role === "parent") return approvedParentOf(userId, studentId);
  return false;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const studentId = request.nextUrl.searchParams.get("studentId") || session.user.id;

  if (request.nextUrl.searchParams.get("list") === "1") {
    if (!isOffice(session.user.role)) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
    const students = await db
      .select({ id: user.id, firstName: user.firstName, lastName: user.lastName, grade: user.grade })
      .from(user)
      .where(eq(user.role, "student"));
    const records = await db.select().from(studentRecords);
    const byStudent = new Map(records.map((r) => [r.studentId, r]));
    return NextResponse.json({
      students: students.map((s) => {
        const rec = byStudent.get(s.id);
        return {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          grade: s.grade,
          signed: Boolean(rec?.signedAt),
          updatedAt: rec?.updatedAt ?? null,
        };
      }),
    });
  }

  const access = await canRead(session.user.role, session.user.id, studentId);
  if (!access) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  const student = await db.query.user.findFirst({ where: eq(user.id, studentId) });
  if (!student || student.role !== "student") return NextResponse.json({ error: "دانش‌آموز پیدا نشد." }, { status: 404 });
  const rec = await db.query.studentRecords.findFirst({ where: eq(studentRecords.studentId, studentId) });
  const payload = parsePayload(rec?.payload);
  if (!payload.fullName) payload.fullName = `${student.firstName} ${student.lastName}`.trim();
  if (!payload.grade && student.grade) payload.grade = student.grade;
  if (!payload.nationalId && student.username) payload.nationalId = student.username;

  if (access === "teacher") {
    return NextResponse.json({
      access: "teacher",
      studentId,
      card: teacherSlice(payload, `${student.firstName} ${student.lastName}`, student.grade),
    });
  }

  return NextResponse.json({
    access: "full",
    studentId,
    payload,
    signedAt: rec?.signedAt ?? null,
    signerName: rec?.signerName ?? null,
    canEdit: await canWrite(session.user.role, session.user.id, studentId),
  });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const studentId = session.user.role === "student" ? session.user.id : String(body?.studentId || session.user.id);
  if (!(await canWrite(session.user.role, session.user.id, studentId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const student = await db.query.user.findFirst({ where: eq(user.id, studentId) });
  if (!student || student.role !== "student") return NextResponse.json({ error: "دانش‌آموز پیدا نشد." }, { status: 404 });

  const cleaned = cleanPayload(body?.payload ?? body);
  if (cleaned.error) return NextResponse.json({ error: cleaned.error }, { status: 400 });
  const payload = cleaned.payload;

  const existing = await db.query.studentRecords.findFirst({ where: eq(studentRecords.studentId, studentId) });
  const now = new Date().toISOString();
  if (existing) {
    await db
      .update(studentRecords)
      .set({ payload: JSON.stringify(payload), updatedAt: now })
      .where(eq(studentRecords.studentId, studentId));
  } else {
    await db.insert(studentRecords).values({
      id: randomUUID(),
      studentId,
      payload: JSON.stringify(payload),
      updatedAt: now,
    });
  }

  const profileFields = {
    dateOfBirth: /^\d{4}-\d{2}-\d{2}$/.test(payload.birthDate) ? payload.birthDate : null,
    address: payload.homeAddress || null,
    studentPhone: payload.emergencyPhone || null,
    fatherName: `${payload.fatherFirst} ${payload.fatherLast}`.trim() || null,
    fatherPhone: payload.fatherPhone || null,
    motherName: `${payload.motherFirst} ${payload.motherLast}`.trim() || null,
    motherPhone: payload.motherPhone || null,
    updatedAt: now,
  };
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.studentId, studentId) });
  const complete = profileMissing(profileFields).length === 0;
  if (profile) {
    await db.update(studentProfiles).set({ ...profileFields, complete }).where(eq(studentProfiles.studentId, studentId));
  } else {
    await db.insert(studentProfiles).values({ id: randomUUID(), studentId, ...profileFields, notes: null, complete });
  }
  if (payload.grade && isGradeLevel(payload.grade)) {
    await db.update(user).set({ grade: payload.grade }).where(eq(user.id, studentId));
  }

  await logAction(session.user.id, "enrollment_save", studentId);
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const studentId = session.user.role === "student" ? session.user.id : String(body?.studentId || "");
  if (!studentId || !(await canWrite(session.user.role, session.user.id, studentId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const rec = await db.query.studentRecords.findFirst({ where: eq(studentRecords.studentId, studentId) });
  if (!rec) return NextResponse.json({ error: "اول مشخصات را ذخیره کنید." }, { status: 400 });
  const signerName = String(body?.signerName ?? "").trim().slice(0, 80);
  if (signerName.length < 3) return NextResponse.json({ error: "نام ولی را برای امضا بنویسید." }, { status: 400 });
  if (body?.accepted !== true) return NextResponse.json({ error: "پذیرش قرارداد لازم است." }, { status: 400 });
  const now = new Date().toISOString();
  await db
    .update(studentRecords)
    .set({ signedAt: now, signerName, updatedAt: now })
    .where(eq(studentRecords.studentId, studentId));
  await logAction(session.user.id, "enrollment_sign", studentId);
  return NextResponse.json({ success: true, signedAt: now });
}
