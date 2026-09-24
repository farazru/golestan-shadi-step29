import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffInvites, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";

// This is the ONLY place in the whole app where a user's role can change
// after signup. Everything here happens on the server, never trusting
// anything the browser claims about itself.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
  }

  const invite = await db.query.staffInvites.findFirst({
    where: eq(staffInvites.code, code),
  });

  if (!invite) {
    return NextResponse.json({ error: "That invite code doesn't exist." }, { status: 404 });
  }
  if (invite.used) {
    return NextResponse.json({ error: "That invite code has already been used." }, { status: 409 });
  }

  // Promote the current user to the role this code grants
  await db.update(user).set({ role: invite.role }).where(eq(user.id, session.user.id));

  // Burn the code so it can never be reused
  await db
    .update(staffInvites)
    .set({ used: true, usedByUserId: session.user.id, usedAt: new Date().toISOString() })
    .where(eq(staffInvites.id, invite.id));

  return NextResponse.json({ success: true, role: invite.role });
}
