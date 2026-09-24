import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { assignments, submissions } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { isEnrolled } from "@/lib/access";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "فقط دانش‌آموز می‌تواند تکلیف بدهد." }, { status: 403 });
  }
  const form = await request.formData();
  const assignmentId = Number(form.get("assignmentId")) || 0;
  const note = String(form.get("note") ?? "");
  if (!assignmentId) return NextResponse.json({ error: "assignmentId الزامی است." }, { status: 400 });

  const assignment = await db.query.assignments.findFirst({ where: eq(assignments.id, assignmentId) });
  if (!assignment) return NextResponse.json({ error: "تکلیف پیدا نشد." }, { status: 404 });
  if (!(await isEnrolled(session.user.id, assignment.courseId))) {
    return NextResponse.json({ error: "شما در این درس نیستید." }, { status: 403 });
  }

  const existing = await db.query.submissions.findFirst({
    where: and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, session.user.id)),
  });
  if (existing) return NextResponse.json({ error: "قبلاً تحویل داده شده." }, { status: 409 });

  let fileName: string | null = null;
  let fileUrl: string | null = null;
  const file = form.get("file");
  if (file && file instanceof File && file.size > 0) {
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 8_000_000) {
      return NextResponse.json({ error: "حجم فایل بیش از ۸ مگابایت است." }, { status: 400 });
    }
    const safe = file.name.replace(/[^\w.\u0600-\u06FF-]+/g, "_").slice(-80);
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const stored = `${Date.now()}-${safe}`;
    await writeFile(path.join(dir, stored), buf);
    fileName = file.name;
    fileUrl = `/uploads/${stored}`;
  }

  await db.insert(submissions).values({
    assignmentId,
    studentId: session.user.id,
    note,
    fileName,
    fileUrl,
  });
  return NextResponse.json({ success: true });
}
