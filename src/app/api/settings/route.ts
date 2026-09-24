import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { logAction } from "@/lib/audit";

async function getValue(key: string, fallback: string) {
  const row = await db.query.schoolSettings.findFirst({ where: eq(schoolSettings.key, key) });
  return row?.value ?? fallback;
}

export async function GET() {
  const signupOpen = (await getValue("signupOpen", "true")) === "true";
  const requireStudentCode = (await getValue("requireStudentCode", "false")) === "true";
  const contactPhone = await getValue("contactPhone", "");
  const contactFax = await getValue("contactFax", "");
  const contactAddress = await getValue("contactAddress", "");
  return NextResponse.json({
    signupOpen,
    requireStudentCode,
    contactPhone,
    contactFax,
    contactAddress,
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "manager" && session.user.role !== "deputy")) {
    return NextResponse.json({ error: "فقط مدیر یا معاون." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const entries: [string, string][] = [];
  if (typeof body?.signupOpen === "boolean") entries.push(["signupOpen", String(body.signupOpen)]);
  if (typeof body?.requireStudentCode === "boolean") {
    entries.push(["requireStudentCode", String(body.requireStudentCode)]);
  }
  if (typeof body?.contactPhone === "string") entries.push(["contactPhone", body.contactPhone.trim()]);
  if (typeof body?.contactFax === "string") entries.push(["contactFax", body.contactFax.trim()]);
  if (typeof body?.contactAddress === "string") {
    entries.push(["contactAddress", body.contactAddress.trim()]);
  }
  for (const [key, value] of entries) {
    const existing = await db.query.schoolSettings.findFirst({ where: eq(schoolSettings.key, key) });
    if (existing) await db.update(schoolSettings).set({ value }).where(eq(schoolSettings.key, key));
    else await db.insert(schoolSettings).values({ key, value });
  }
  await logAction(session.user.id, "update_settings", JSON.stringify(body));
  return NextResponse.json({ success: true });
}
