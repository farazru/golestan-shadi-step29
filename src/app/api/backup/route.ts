import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isOffice } from "@/lib/access";
import { logAction } from "@/lib/audit";

export async function GET() {
  const session = await getSession();
  if (!session || !isOffice(session.user.role)) {
    return NextResponse.json({ error: "فقط مدیر." }, { status: 403 });
  }
  if (process.env.DATABASE_URL) {
    return NextResponse.json({
      message: "دیتابیس روی Turso/میزبان است. از داشبورد Turso نسخه بگیرید.",
    });
  }
  try {
    const file = path.join(process.cwd(), "data", "school.db");
    const buf = await readFile(file);
    await logAction(session.user.id, "download_backup", "school.db");
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="school-backup-${Date.now()}.db"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "فایل پایگاه داده پیدا نشد." }, { status: 404 });
  }
}
