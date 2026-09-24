import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role === "student" || session.user.role === "parent") {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const idNumber = request.nextUrl.searchParams.get("idNumber")?.trim();
  if (!idNumber) return NextResponse.json({ error: "کد ملی الزامی است." }, { status: 400 });

  const student = await db.query.user.findFirst({ where: eq(user.username, idNumber) });
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "دانش‌آموزی با این کد ملی پیدا نشد." }, { status: 404 });
  }

  return NextResponse.json({
    student: { id: student.id, firstName: student.firstName, lastName: student.lastName, grade: student.grade },
  });
}
