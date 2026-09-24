import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reportCards } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { approvedParentOf, isOffice, requireStudentAccount } from "@/lib/access";
import { logAction } from "@/lib/audit";
import { extFor, sniffUpload } from "@/lib/file-magic";

function privateDir() {
  return path.join(process.cwd(), "data", "private", "karnameh");
}

async function canRead(session: { user: { id: string; role: string } }, studentId: string) {
  if (session.user.role === "student") return session.user.id === studentId;
  if (session.user.role === "parent") return approvedParentOf(session.user.id, studentId);
  if (isOffice(session.user.role)) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const downloadId = Number(request.nextUrl.searchParams.get("download") || 0);
  if (downloadId) {
    const row = await db.query.reportCards.findFirst({ where: eq(reportCards.id, downloadId) });
    if (!row) return NextResponse.json({ error: "پیدا نشد." }, { status: 404 });
    if (!(await canRead(session, row.studentId))) {
      return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
    }
    const stored = path.basename(row.fileUrl);
    const buf = await readFile(path.join(privateDir(), stored));
    const type = stored.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${row.fileName ?? stored}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const studentId = request.nextUrl.searchParams.get("studentId") || session.user.id;
  if (!(await canRead(session, studentId))) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  if (session.user.role === "teacher") {
    return NextResponse.json({ error: "کارنامه را دفتر بارگذاری می‌کند." }, { status: 403 });
  }
  const rows = await db.select().from(reportCards).where(eq(reportCards.studentId, studentId)).orderBy(desc(reportCards.createdAt));
  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      title: r.title,
      fileName: r.fileName,
      fileUrl: `/api/report-cards?download=${r.id}`,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isOffice(session.user.role)) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }
  const form = await request.formData();
  const studentId = String(form.get("studentId") ?? "");
  const title = String(form.get("title") ?? "کارنامه").trim() || "کارنامه";
  const file = form.get("file");
  const student = await requireStudentAccount(studentId);
  if (!student) return NextResponse.json({ error: "دانش‌آموز پیدا نشد." }, { status: 404 });
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "فایل کارنامه لازم است." }, { status: 400 });
  }
  if (file.size > 12_000_000) return NextResponse.json({ error: "حجم بیش از ۱۲ مگابایت." }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniffUpload(buf);
  if (!kind) return NextResponse.json({ error: "فقط PDF یا تصویر واقعی." }, { status: 400 });
  const stored = `${randomUUID()}.${extFor(kind)}`;
  const dir = privateDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, stored), buf);
  const [row] = await db
    .insert(reportCards)
    .values({
      studentId,
      title,
      fileName: file.name,
      fileUrl: stored,
      uploadedBy: session.user.id,
    })
    .returning();
  await logAction(session.user.id, "upload_report_card", studentId);
  return NextResponse.json({
    item: { ...row, fileUrl: `/api/report-cards?download=${row.id}` },
  });
}
