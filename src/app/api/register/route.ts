import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { preregister } from "@/db/schema";
import { rateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";
import { sniffUpload } from "@/lib/file-magic";

export async function POST(request: NextRequest) {
  const limit = rateLimit(`reg:${clientKeyFromHeaders(request.headers)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "تعداد درخواست زیاد است." }, { status: 429 });

  const form = await request.formData();
  const childName = String(form.get("childName") ?? "").trim();
  const parentName = String(form.get("parentName") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const grade = String(form.get("grade") ?? "").trim();
  if (!childName || !parentName || !phone) {
    return NextResponse.json({ error: "نام فرزند، نام والد و تلفن لازم است." }, { status: 400 });
  }

  let fileNote = "";
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > 8_000_000) return NextResponse.json({ error: "حجم فایل بیش از ۸ مگابایت." }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const kind = sniffUpload(buf);
    if (kind !== "pdf" && kind !== "jpeg" && kind !== "png") {
      return NextResponse.json({ error: "فقط PDF یا عکس." }, { status: 400 });
    }
    const code = randomBytes(4).toString("hex");
    const dir = path.join(process.cwd(), "data", "private", "registrations");
    await mkdir(dir, { recursive: true });
    const name = `${code}.${kind === "pdf" ? "pdf" : kind === "png" ? "png" : "jpg"}`;
    await writeFile(path.join(dir, name), buf);
    fileNote = name;
  }

  const trackingCode = randomBytes(4).toString("hex").toUpperCase();
  await db.insert(preregister).values({
    childName,
    parentName,
    phone,
    grade: grade || null,
    note: fileNote || null,
    trackingCode,
  });

  return NextResponse.json({ trackingCode });
}
