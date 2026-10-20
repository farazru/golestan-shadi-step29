import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { parentingPosts, parentingComments } from "@/db/schema";
import { getSession } from "@/lib/get-session";

function canManage(role: string) {
  return role === "manager" || role === "deputy";
}

export async function GET() {
  const posts = await db.select().from(parentingPosts).orderBy(desc(parentingPosts.createdAt));
  const comments = await db.select().from(parentingComments).orderBy(desc(parentingComments.createdAt));
  const byPost = new Map<number, typeof comments>();
  for (const c of comments) {
    const list = byPost.get(c.postId) ?? [];
    list.push(c);
    byPost.set(c.postId, list);
  }
  const items = posts.map((p) => ({ ...p, comments: byPost.get(p.id) ?? [] }));
  return NextResponse.json({ posts: items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!title || !text) {
    return NextResponse.json({ error: "عنوان و متن الزامی است." }, { status: 400 });
  }
  const [post] = await db
    .insert(parentingPosts)
    .values({ title, body: text, imageUrl: imageUrl || null })
    .returning();
  return NextResponse.json({ post });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || !canManage(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id الزامی است." }, { status: 400 });
  await db.delete(parentingComments).where(eq(parentingComments.postId, id));
  const removed = await db.delete(parentingPosts).where(eq(parentingPosts.id, id)).returning();
  if (removed.length === 0) return NextResponse.json({ error: "پیدا نشد." }, { status: 404 });
  return NextResponse.json({ success: true });
}
