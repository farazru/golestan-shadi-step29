import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { staffInvites } from "@/db/schema";
import { getSession } from "@/lib/get-session";

function generateCode() {
  // Short, readable code like "K3F9-7QRT"
  const raw = randomBytes(6).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  // Only an existing manager can mint new invite codes.
  if (!session || session.user.role !== "manager") {
    return NextResponse.json({ error: "Only a manager can create invite codes." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validRoles = ["manager", "teacher", "deputy"];
  const role = validRoles.includes(body?.role) ? body.role : "teacher";

  const code = generateCode();
  await db.insert(staffInvites).values({
    id: crypto.randomUUID(),
    code,
    role,
    createdByUserId: session.user.id,
  });

  return NextResponse.json({ code, role });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "manager") {
    return NextResponse.json({ error: "Only a manager can view invite codes." }, { status: 403 });
  }

  const invites = await db.query.staffInvites.findMany({
    orderBy: (staffInvites, { desc }) => [desc(staffInvites.createdAt)],
  });

  return NextResponse.json({ invites });
}
