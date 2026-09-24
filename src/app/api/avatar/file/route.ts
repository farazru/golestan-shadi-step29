import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { sniffUpload } from "@/lib/file-magic";

function dir() {
  return path.join(process.cwd(), "data", "private", "avatars");
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id") || session.user.id;
  const row = await db.query.user.findFirst({ where: eq(user.id, id) });
  if (!row?.image || !row.image.startsWith("file:")) {
    return NextResponse.json({ error: "عکس نیست." }, { status: 404 });
  }
  const stored = row.image.slice(5);
  const buf = await readFile(path.join(dir(), stored));
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "student" && session.user.role !== "manager" && session.user.role !== "deputy")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "عکس لازم است." }, { status: 400 });
  }
  if (file.size > 4_000_000) return NextResponse.json({ error: "حجم عکس بیش از ۴ مگابایت." }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniffUpload(buf);
  if (kind !== "jpeg" && kind !== "png" && kind !== "webp") {
    return NextResponse.json({ error: "فقط عکس JPG/PNG." }, { status: 400 });
  }
  const stored = `${session.user.id}.${kind === "png" ? "png" : "jpg"}`;
  await mkdir(dir(), { recursive: true });
  await writeFile(path.join(dir(), stored), buf);
  await db.update(user).set({ image: `file:${stored}` }).where(eq(user.id, session.user.id));
  return NextResponse.json({ success: true, url: `/api/avatar/file?id=${session.user.id}` });
}
