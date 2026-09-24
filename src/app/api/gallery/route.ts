import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { getSession } from "@/lib/get-session";

function canManage(role: string) {
  return role === "manager" || role === "deputy";
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  const items = await db.select().from(galleryItems);
  return NextResponse.json({ items });
}

// NOTE ON DEPLOYMENT: this saves real files to the server's own disk
// (public/uploads/gallery). That's fine for a normal always-on Node
// server, but it will NOT work on serverless hosting (e.g. Vercel) —
// that filesystem is read-only/ephemeral at runtime, so uploaded files
// would silently disappear. Before deploying there, this needs to point
// at real object storage (S3-compatible bucket) instead.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "فرم نامعتبر است." }, { status: 400 });
  }

  const file = form.get("image");
  const title = typeof form.get("title") === "string" ? (form.get("title") as string).trim() : "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل تصویر الزامی است." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "فقط تصویر (jpg, png, webp, gif) مجاز است." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم تصویر باید کمتر از ۵ مگابایت باشد." }, { status: 400 });
  }

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const ext = file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  const imageUrl = `/uploads/gallery/${filename}`;
  const [item] = await db.insert(galleryItems).values({ title: title || null, imageUrl }).returning();
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id الزامی است." }, { status: 400 });
  }

  const [existing] = await db.select().from(galleryItems).where(eq(galleryItems.id, id));
  await db.delete(galleryItems).where(eq(galleryItems.id, id));

  // Best-effort cleanup of the actual file on disk — don't fail the
  // request if this doesn't work (e.g. file already gone).
  if (existing?.imageUrl?.startsWith("/uploads/gallery/")) {
    const filePath = path.join(process.cwd(), "public", existing.imageUrl);
    unlink(filePath).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
