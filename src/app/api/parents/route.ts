import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { parentLinks, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { normalizeIdNumber } from "@/lib/digits";
import { logAction } from "@/lib/audit";
import { requireParentAccount } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  if (session.user.role === "parent") {
    const rows = await db
      .select({
        studentId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        grade: user.grade,
        username: user.username,
      })
      .from(parentLinks)
      .innerJoin(user, eq(parentLinks.studentId, user.id))
      .where(and(eq(parentLinks.parentId, session.user.id), eq(parentLinks.status, "approved")));
    return NextResponse.json({ children: rows });
  }
  if (session.user.role !== "manager" && session.user.role !== "teacher" && session.user.role !== "deputy") {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const parentUser = alias(user, "parent_user");
  const rows = await db
    .select({
      id: parentLinks.id,
      status: parentLinks.status,
      parentFirstName: parentUser.firstName,
      parentLastName: parentUser.lastName,
      parentUsername: parentUser.username,
      studentFirstName: user.firstName,
      studentLastName: user.lastName,
      studentUsername: user.username,
    })
    .from(parentLinks)
    .innerJoin(user, eq(parentLinks.studentId, user.id))
    .innerJoin(parentUser, eq(parentLinks.parentId, parentUser.id));
  return NextResponse.json({ links: rows });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "manager" && session.user.role !== "parent")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const childId = normalizeIdNumber(String(body?.childIdNumber ?? ""));
  const parentId = session.user.role === "parent" ? session.user.id : String(body?.parentId ?? "");
  const parent = await requireParentAccount(parentId);
  if (!parent) return NextResponse.json({ error: "این حساب ولی نیست." }, { status: 400 });
  const child = await db.query.user.findFirst({ where: eq(user.username, childId) });
  if (!child || child.role !== "student") {
    return NextResponse.json({ error: "دانش‌آموز با این کد ملی پیدا نشد." }, { status: 404 });
  }
  const dup = await db.query.parentLinks.findFirst({
    where: and(eq(parentLinks.parentId, parentId), eq(parentLinks.studentId, child.id)),
  });
  if (dup) return NextResponse.json({ error: "این پیوند از قبل هست." }, { status: 409 });
  await db.insert(parentLinks).values({
    id: crypto.randomUUID(),
    parentId,
    studentId: child.id,
    status: session.user.role === "manager" ? "approved" : "pending",
  });
  await logAction(session.user.id, "link_parent", `${parentId}:${child.id}`);
  return NextResponse.json({ success: true, status: session.user.role === "manager" ? "approved" : "pending" });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.user.role !== "manager" && session.user.role !== "deputy")) {
    return NextResponse.json({ error: "فقط دفتر." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? "");
  const status = body?.status === "approved" || body?.status === "rejected" ? body.status : "";
  if (!id || !status) return NextResponse.json({ error: "ناقص." }, { status: 400 });
  await db.update(parentLinks).set({ status }).where(eq(parentLinks.id, id));
  await logAction(session.user.id, "parent_link_" + status, id);
  return NextResponse.json({ success: true });
}
