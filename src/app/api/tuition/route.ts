import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { parentLinks, tuitionAccounts, tuitionPayments } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { TUITION_MONTHS, isTuitionClass } from "@/lib/school";

function canEdit(role?: string) {
  return role === "manager" || role === "deputy";
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  const accounts = await db.select().from(tuitionAccounts);
  const payments = await db.select().from(tuitionPayments);

  let visible = accounts;
  if (session.user.role === "student") {
    visible = accounts.filter((a) => a.studentId === session.user.id);
  } else if (session.user.role === "parent") {
    const links = await db
      .select()
      .from(parentLinks)
      .where(and(eq(parentLinks.parentId, session.user.id), eq(parentLinks.status, "approved")));
    const ids = new Set(links.map((l) => l.studentId));
    visible = accounts.filter((a) => a.studentId && ids.has(a.studentId));
  } else if (session.user.role === "teacher") {
    visible = [];
  }

  return NextResponse.json({
    accounts: visible,
    payments: payments.filter((p) => visible.some((a) => a.id === p.accountId)),
    canEdit: canEdit(session.user.role),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canEdit(session.user.role)) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (body?.kind === "account") {
    const fullName = String(body.fullName ?? "").trim();
    const classGroup = String(body.classGroup ?? "");
    const feeToman = Number(body.feeToman) || 0;
    if (!fullName || !isTuitionClass(classGroup) || feeToman <= 0) {
      return NextResponse.json({ error: "نام، کلاس و شهریه لازم است." }, { status: 400 });
    }
    const [row] = await db
      .insert(tuitionAccounts)
      .values({
        fullName,
        classGroup,
        feeToman,
        studentId: body.studentId || null,
        note: body.note || null,
      })
      .returning();
    return NextResponse.json({ account: row });
  }
  if (body?.kind === "payment") {
    const accountId = Number(body.accountId);
    const monthKey = String(body.monthKey ?? "");
    const amountToman = Number(body.amountToman) || 0;
    const account = await db.query.tuitionAccounts.findFirst({ where: eq(tuitionAccounts.id, accountId) });
    if (!account) return NextResponse.json({ error: "حساب شهریه پیدا نشد." }, { status: 404 });
    if (!TUITION_MONTHS.some((m) => m.key === monthKey) || amountToman <= 0) {
      return NextResponse.json({ error: "ماه یا مبلغ نامعتبر است." }, { status: 400 });
    }
    const dup = await db.query.tuitionPayments.findFirst({
      where: and(eq(tuitionPayments.accountId, accountId), eq(tuitionPayments.monthKey, monthKey)),
    });
    if (dup) return NextResponse.json({ error: "برای این ماه قبلاً ثبت شده." }, { status: 409 });
    const [row] = await db
      .insert(tuitionPayments)
      .values({
        accountId,
        monthKey,
        amountToman,
        receipt: body.receipt || null,
      })
      .returning();
    return NextResponse.json({ payment: row });
  }
  return NextResponse.json({ error: "درخواست نامعتبر." }, { status: 400 });
}
