import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { attendance, courses, tuitionAccounts, tuitionPayments } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { requireRole } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session || !requireRole(session.user.role, ["manager", "deputy"])) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }

  const [att] = await db.select({ n: sql<number>`count(*)` }).from(attendance);
  const [cls] = await db.select({ n: sql<number>`count(*)` }).from(courses);
  const accounts = await db.select().from(tuitionAccounts);
  const payments = await db.select().from(tuitionPayments);

  const paid = payments.reduce((s, p) => s + (p.amountToman ?? 0), 0);
  const due = accounts.reduce((s, a) => s + (a.feeToman ?? 0), 0);

  return NextResponse.json({
    attendanceRecords: att?.n ?? 0,
    activeClasses: cls?.n ?? 0,
    unpaidToman: Math.max(0, due - paid),
  });
}
