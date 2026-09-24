import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles, user } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { profileMissing } from "@/lib/roles";
import { isOffice } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session || !isOffice(session.user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  const students = await db.select().from(user).where(eq(user.role, "student"));
  const profiles = await db.select().from(studentProfiles);
  const byId = new Map(profiles.map((p) => [p.studentId, p]));
  const rows = students.map((s) => {
    const p = byId.get(s.id) ?? null;
    const missing = profileMissing(p);
    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      grade: s.grade,
      username: s.username,
      missing,
    };
  }).filter((r) => r.missing.length > 0);
  return NextResponse.json({ students: rows });
}
