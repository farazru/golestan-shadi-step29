import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { studentCodes } from "@/db/schema";
import { getSession } from "@/lib/get-session";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "manager") {
    return NextResponse.json({ error: "فقط مدیر." }, { status: 403 });
  }
  const rows = await db.select().from(studentCodes);
  return NextResponse.json({ codes: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "manager") {
    return NextResponse.json({ error: "فقط مدیر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const grade = typeof body?.grade === "string" ? body.grade : null;
  const raw = randomBytes(4).toString("hex").toUpperCase();
  const code = `STU-${raw}`;
  await db.insert(studentCodes).values({
    id: crypto.randomUUID(),
    code,
    grade,
  });
  return NextResponse.json({ code, grade });
}
