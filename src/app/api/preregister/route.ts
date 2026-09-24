import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { preregister } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isOffice } from "@/lib/roles";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const childName = typeof body?.childName === "string" ? body.childName.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!childName || !phone) return NextResponse.json({ error: "نام و تلفن الزامی است." }, { status: 400 });
  await db.insert(preregister).values({
    childName,
    parentName: typeof body?.parentName === "string" ? body.parentName : "",
    phone,
    grade: typeof body?.grade === "string" ? body.grade : "",
    note: typeof body?.note === "string" ? body.note : "",
  });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session || !isOffice(session.user.role)) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }
  const rows = await db.select().from(preregister).orderBy(desc(preregister.id));
  return NextResponse.json({ rows });
}
