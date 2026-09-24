import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { user, account } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { normalizeIdNumber } from "@/lib/digits";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "manager") {
    return NextResponse.json({ error: "فقط مدیر می‌تواند رمز را عوض کند." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const idNumber = normalizeIdNumber(String(body?.idNumber ?? ""));
  if (!idNumber) return NextResponse.json({ error: "کد ملی الزامی است." }, { status: 400 });

  const target = await db.query.user.findFirst({ where: eq(user.username, idNumber) });
  if (!target) return NextResponse.json({ error: "کاربر پیدا نشد." }, { status: 404 });

  const temp = typeof body?.password === "string" && body.password.length >= 8
    ? body.password
    : `Tmp-${randomBytes(4).toString("hex")}`;

  const acc = await db.query.account.findFirst({
    where: eq(account.userId, target.id),
  });
  if (!acc) return NextResponse.json({ error: "حساب ورود پیدا نشد." }, { status: 404 });

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(temp);
  await db.update(account).set({ password: hash }).where(eq(account.id, acc.id));
  await logAction(session.user.id, "reset_password", target.id);
  return NextResponse.json({ success: true, temporaryPassword: temp, name: `${target.firstName} ${target.lastName}` });
}
