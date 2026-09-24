import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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
  const requireCodeRow = await db.query.schoolSettings.findFirst({ where: eq(schoolSettings.key, "requireStudentCode") });
  if (accountType === "student" && requireCodeRow?.value === "true") {
    if (!studentCode) return NextResponse.json({ error: "کد ثبت‌نام دفتر الزامی است." }, { status: 400 });
    const codeRow = await db.query.studentCodes.findFirst({ where: eq(studentCodes.code, studentCode) });
    if (!codeRow || codeRow.used) return NextResponse.json({ error: "کد ثبت‌نام نامعتبر است." }, { status: 400 });
  }

  if (!idNumber || !firstName || !lastName || !password) {
    return NextResponse.json({ error: "نام، نام خانوادگی، کد ملی و رمز عبور لازم است." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(idNumber)) {
    return NextResponse.json({ error: "کد ملی باید دقیقاً ۱۰ رقم باشد." }, { status: 400 });
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
    if (response.ok) {
      const created = await db.query.user.findFirst({ where: eq(user.username, idNumber) });
      if (created && accountType === "parent") {
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
      if (created && studentCode) {
        const codeRow = await db.query.studentCodes.findFirst({ where: eq(studentCodes.code, studentCode) });
        if (codeRow && !codeRow.used) {
          await db
            .update(studentCodes)
            .set({ used: true, usedByUserId: created.id })
            .where(eq(studentCodes.id, codeRow.id));
          if (codeRow.grade) {
            await db.update(user).set({ grade: codeRow.grade }).where(eq(user.id, created.id));
          }
        }
      }
    }
    return response;
  } catch (err: unknown) {
    return NextResponse.json({ error: authErrorMessage(err, "حساب ساخته نشد.") }, { status: 400 });
  }
}
