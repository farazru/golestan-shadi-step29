import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/get-session";

const AVATARS = ["🐻", "🦊", "🐸", "🐥", "🦄", "🐼", "🐯", "🐧", "🌼", "⭐", "⚽", "📚"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const avatar = typeof body?.avatar === "string" ? body.avatar : "";
  if (!AVATARS.includes(avatar) && !/^#[0-9a-fA-F]{6}$/.test(avatar)) {
    return NextResponse.json({ error: "آواتار نامعتبر." }, { status: 400 });
  }
  await db.update(user).set({ image: avatar }).where(eq(user.id, session.user.id));
  return NextResponse.json({ success: true, avatar, options: AVATARS });
}

export async function GET() {
  return NextResponse.json({ options: AVATARS });
}
