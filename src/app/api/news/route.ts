import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publicNews } from "@/db/schema";
import { getSession } from "@/lib/get-session";

function canManage(role: string) {
  return role === "manager" || role === "deputy";
}

export async function GET() {
  const items = await db.query.publicNews.findMany({
    orderBy: (publicNews, { desc }) => [desc(publicNews.createdAt)],
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const newsBody = typeof body?.body === "string" ? body.body.trim() : "";
  const link = typeof body?.link === "string" ? body.link.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });
  }

  const [item] = await db
    .insert(publicNews)
    .values({ title, body: newsBody || null, link: link || null })
    .returning();

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

  const removed = await db.delete(publicNews).where(eq(publicNews.id, id)).returning();
  if (removed.length === 0) return NextResponse.json({ error: "پیدا نشد." }, { status: 404 });
  return NextResponse.json({ success: true });
}
