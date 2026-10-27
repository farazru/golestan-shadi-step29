import { NextResponse } from "next/server";
import { db } from "@/db";
import { tuitionAccounts, tuitionPayments } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isOffice } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session || !isOffice(session.user.role)) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }

  const accounts = await db.select().from(tuitionAccounts);
  const payments = await db.select().from(tuitionPayments);

  const overdue = accounts
    .map((a) => {
      const paid = payments.filter((p) => p.accountId === a.id).reduce((s, p) => s + p.amountToman, 0);
      const due = a.feeToman - paid;
      return { name: a.fullName, classGroup: a.classGroup, due };
    })
    .filter((a) => a.due > 0);

  const text = overdue
    .map((a) => `یادآوری شهریه: ${a.name} (${a.classGroup}) — مانده ${a.due.toLocaleString("fa-IR")} تومان`)
    .join("\n");

  return NextResponse.json({ overdue, text });
}
