import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { assignments, courses, submissions } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { approvedParentOf, isEnrolled, isOffice, teacherOwnsCourse } from "@/lib/access";
import { extFor, sniffUpload } from "@/lib/file-magic";

function privateDir() {
  return path.join(process.cwd(), "data", "private", "submissions");
}

const TYPES = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

async function canReadSubmission(
  session: { user: { id: string; role: string } },
  row: { studentId: string; assignmentId: number },
) {
  if (isOffice(session.user.role)) return true;
  if (session.user.role === "student") return session.user.id === row.studentId;
  if (session.user.role === "parent") return approvedParentOf(session.user.id, row.studentId);
  const assignment = await db.query.assignments.findFirst({ where: eq(assignments.id, row.assignmentId) });
  if (!assignment) return false;
  if (session.user.role === "teacher") return teacherOwnsCourse(session.user.id, assignment.courseId);
  return false;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get("id") || 0);
  if (!id) return NextResponse.json({ error: "id الزامی است." }, { status: 400 });
  const row = await db.query.submissions.findFirst({ where: eq(submissions.id, id) });
  if (!row || !row.fileUrl || row.fileUrl.startsWith("/")) {
    return NextResponse.json({ error: "فایل پیدا نشد." }, { status: 404 });
  }
  if (!(await canReadSubmission(session, row))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const stored = path.basename(row.fileUrl);
  const buf = await readFile(path.join(privateDir(), stored));
  const ext = stored.split(".").pop() || "";
  const type =
    ext === "pdf" ? TYPES.pdf : ext === "png" ? TYPES.png : ext === "webp" ? TYPES.webp : TYPES.jpeg;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${(row.fileName || stored).replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "فقط دانش‌آموز می‌تواند تکلیف بدهد." }, { status: 403 });
  }
  const form = await request.formData();
  const assignmentId = Number(form.get("assignmentId")) || 0;
  const note = String(form.get("note") ?? "").slice(0, 2000);
  if (!assignmentId) return NextResponse.json({ error: "assignmentId الزامی است." }, { status: 400 });

  const assignment = await db.query.assignments.findFirst({ where: eq(assignments.id, assignmentId) });
  if (!assignment) return NextResponse.json({ error: "تکلیف پیدا نشد." }, { status: 404 });
  if (!(await isEnrolled(session.user.id, assignment.courseId))) {
    return NextResponse.json({ error: "شما در این درس نیستید." }, { status: 403 });
  }
  const course = await db.query.courses.findFirst({ where: eq(courses.id, assignment.courseId) });
  if (!course) return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });

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
    const kind = sniffUpload(buf);
    if (!kind) {
      return NextResponse.json({ error: "فقط PDF یا عکس JPG/PNG/WEBP مجاز است." }, { status: 400 });
    }
    const stored = `${randomUUID()}.${extFor(kind)}`;
    await mkdir(privateDir(), { recursive: true });
    await writeFile(path.join(privateDir(), stored), buf);
    fileName = path.basename(file.name).slice(0, 120) || `upload.${extFor(kind)}`;
    fileUrl = stored;
  }

  const [row] = await db
    .insert(submissions)
    .values({
      assignmentId,
      studentId: session.user.id,
      note,
      fileName,
      fileUrl,
    })
    .returning();
  return NextResponse.json({
    success: true,
    download: fileUrl ? `/api/submissions?id=${row.id}` : null,
  });
}
