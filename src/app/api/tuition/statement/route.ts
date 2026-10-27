import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tuitionAccounts, tuitionPayments } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isOffice } from "@/lib/access";
import { TUITION_MONTHS } from "@/lib/school";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id الزامی است." }, { status: 400 });

  const account = await db.query.tuitionAccounts.findFirst({ where: eq(tuitionAccounts.id, id) });
  if (!account) return NextResponse.json({ error: "حساب پیدا نشد." }, { status: 404 });

  const canSee =
    isOffice(session.user.role) ||
    (session.user.role === "student" && account.studentId === session.user.id);
  if (!canSee) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });

  const payments = await db.select().from(tuitionPayments).where(eq(tuitionPayments.accountId, id));
  const paid = payments.reduce((s, p) => s + p.amountToman, 0);
  const due = account.feeToman - paid;

  const lines = [
    `صورت‌حساب شهریه — ${account.fullName}`,
    `پایه: ${account.classGroup}`,
    `کل: ${account.feeToman.toLocaleString("fa-IR")} تومان`,
    `پرداخت‌شده: ${paid.toLocaleString("fa-IR")} تومان`,
    `مانده: ${due.toLocaleString("fa-IR")} تومان`,
    "",
    ...TUITION_MONTHS.map((m) => {
      const p = payments.find((x) => x.monthKey === m.key);
      return `${m.label}: ${p ? p.amountToman.toLocaleString("fa-IR") : "—"}`;
    }),
  ];

  const text = lines.join("\n");
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="statement-${id}.txt"; filename*=UTF-8''${encodeURIComponent(`صورت‌حساب-${account.fullName}.txt`)}`,
    },
  });
}
