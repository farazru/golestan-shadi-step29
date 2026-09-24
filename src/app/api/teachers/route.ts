import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getSession } from "@/lib/get-session";

// Only a manager needs this — to pick which real teacher a new course
// belongs to, instead of the manager silently becoming the teacher.
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "manager") {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const teachers = await db
    .select({ id: user.id, firstName: user.firstName, lastName: user.lastName })
    .from(user)
    .where(eq(user.role, "teacher"));

  return NextResponse.json({ teachers });
}
