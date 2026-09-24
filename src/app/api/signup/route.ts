import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { normalizeIdNumber } from "@/lib/digits";
import { db } from "@/db";
import { schoolSettings, studentCodes, parentLinks, user } from "@/db/schema";
import { rateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";
import { authErrorMessage } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const clientKey = clientKeyFromHeaders(request.headers);
  const limit = rateLimit(`signup:${clientKey}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "تعداد تلاش‌های ثبت‌نام بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const idNumber = typeof body?.idNumber === "string" ? normalizeIdNumber(body.idNumber) : "";
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const accountType = body?.accountType === "parent" ? "parent" : "student";
  const studentCode = typeof body?.studentCode === "string" ? body.studentCode.trim() : "";
  const childIdNumber = typeof body?.childIdNumber === "string" ? normalizeIdNumber(body.childIdNumber) : "";

  const signupOpenRow = await db.query.schoolSettings.findFirst({ where: eq(schoolSettings.key, "signupOpen") });
  if (signupOpenRow?.value === "false") {
    return NextResponse.json({ error: "ثبت‌نام آزاد بسته است. به دفتر مدرسه مراجعه کنید." }, { status: 403 });
  }
  if (!idNumber || !firstName || !lastName || !password) {
    return NextResponse.json({ error: "نام، نام خانوادگی، کد ملی و رمز عبور لازم است." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(idNumber)) {
    return NextResponse.json({ error: "کد ملی باید دقیقاً ۱۰ رقم باشد." }, { status: 400 });
  }

  const requireCodeRow = await db.query.schoolSettings.findFirst({ where: eq(schoolSettings.key, "requireStudentCode") });
  const requireCode = accountType === "student" && requireCodeRow?.value === "true";
  let claimedCodeId: string | null = null;
  let claimedGrade: string | null = null;
  if (studentCode) {
    const claimed = await db
      .update(studentCodes)
      .set({ used: true })
      .where(and(eq(studentCodes.code, studentCode), eq(studentCodes.used, false)))
      .returning();
    if (claimed[0]) {
      claimedCodeId = claimed[0].id;
      claimedGrade = claimed[0].grade;
    } else if (requireCode) {
      return NextResponse.json({ error: "کد ثبت‌نام نامعتبر است." }, { status: 400 });
    } else {
      const existingCode = await db.query.studentCodes.findFirst({ where: eq(studentCodes.code, studentCode) });
      if (existingCode?.used) {
        return NextResponse.json({ error: "کد ثبت‌نام قبلاً استفاده شده است." }, { status: 400 });
      }
    }
  } else if (requireCode) {
    return NextResponse.json({ error: "کد ثبت‌نام دفتر الزامی است." }, { status: 400 });
  }

  async function releaseCode() {
    if (!claimedCodeId) return;
    await db
      .update(studentCodes)
      .set({ used: false, usedByUserId: null })
      .where(and(eq(studentCodes.id, claimedCodeId), eq(studentCodes.used, true)));
  }

  const internalEmail = `${idNumber}@school.internal`;

  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: internalEmail,
        password,
        name: `${firstName} ${lastName}`,
        username: idNumber,
        displayUsername: idNumber,
        firstName,
        lastName,
      },
      asResponse: true,
    });
    if (!response.ok) {
        await releaseCode();
        return response;
      }
      const created = await db.query.user.findFirst({ where: eq(user.username, idNumber) });
      if (!created) {
        await releaseCode();
        return response;
      }
      try {
        if (accountType === "parent") {
          await db.update(user).set({ role: "parent" }).where(eq(user.id, created.id));
          if (childIdNumber) {
            const child = await db.query.user.findFirst({ where: eq(user.username, childIdNumber) });
            if (child && child.role === "student") {
              await db.insert(parentLinks).values({
                id: crypto.randomUUID(),
                parentId: created.id,
                studentId: child.id,
                status: "pending",
              });
            }
          }
        }
        if (claimedCodeId) {
          await db
            .update(studentCodes)
            .set({ usedByUserId: created.id })
            .where(eq(studentCodes.id, claimedCodeId));
          if (claimedGrade) {
            await db.update(user).set({ grade: claimedGrade }).where(eq(user.id, created.id));
          }
        }
      } catch (err) {
        await releaseCode();
        await db.delete(user).where(eq(user.id, created.id));
        console.error("[signup-rollback]", err);
        return NextResponse.json({ error: "ثبت‌نام کامل نشد. دوباره تلاش کنید." }, { status: 500 });
      }
      return response;
  } catch (err: unknown) {
    await releaseCode();
    return NextResponse.json({ error: authErrorMessage(err, "حساب ساخته نشد.") }, { status: 400 });
  }
}
