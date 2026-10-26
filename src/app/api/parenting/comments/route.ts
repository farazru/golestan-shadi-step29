import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parentingComments, parentingPosts } from "@/db/schema";
import { rateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limit = rateLimit(`comment:${clientKeyFromHeaders(request.headers)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "تعداد نظرها زیاد است. بعداً تلاش کنید." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const postId = Number(body?.postId);
  const authorName = typeof body?.authorName === "string" ? body.authorName.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!postId || !authorName || !text) {
    return NextResponse.json({ error: "نام و نظر الزامی است." }, { status: 400 });
  }
  if (authorName.length > 40 || text.length > 500) {
    return NextResponse.json({ error: "متن خیلی طولانی است." }, { status: 400 });
  }
  const post = await db.query.parentingPosts.findFirst({ where: eq(parentingPosts.id, postId) });
  if (!post) return NextResponse.json({ error: "مطلب پیدا نشد." }, { status: 404 });

  const [comment] = await db
    .insert(parentingComments)
    .values({ postId, authorName, body: text })
    .returning();
  return NextResponse.json({ comment });
}