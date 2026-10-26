import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { staffInvites, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { rateLimit, clientKeyFromHeaders } from "@/lib/rate-limit";
import { logAction } from "@/lib/audit";

// This is the ONLY place in the whole app where a user's role can change
// after signup. Everything here happens on the server, never trusting
// anything the browser claims about itself.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const limit = rateLimit(`redeem:${session.user.id}:${clientKeyFromHeaders(request.headers)}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
  }

  // Atomically claim an unused code. If another request already claimed it, this returns no row.
  const claimed = await db
    .update(staffInvites)
    .set({ used: true, usedByUserId: session.user.id, usedAt: new Date().toISOString() })
    .where(and(eq(staffInvites.code, code), eq(staffInvites.used, false)))
    .returning();

  if (claimed.length === 0) {
    return NextResponse.json({ error: "That invite code is invalid or already used." }, { status: 409 });
  }

  const invite = claimed[0];
  await db.update(user).set({ role: invite.role }).where(eq(user.id, session.user.id));
  await logAction(session.user.id, "redeem_invite", invite.role);

  return NextResponse.json({ success: true, role: invite.role });
}