import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parentingComments } from "@/db/schema";

export async function POST(request: NextRequest) {
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
  const [comment] = await db
    .insert(parentingComments)
    .values({ postId, authorName, body: text })
    .returning();
  return NextResponse.json({ comment });
}
