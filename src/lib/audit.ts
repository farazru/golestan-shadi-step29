import { db } from "@/db";
import { auditLog } from "@/db/schema";

export async function logAction(actorId: string | null | undefined, action: string, detail?: string) {
  try {
    await db.insert(auditLog).values({
      actorId: actorId ?? null,
      action,
      detail: detail ?? null,
    });
  } catch (err) {
    console.error("[audit-failed]", action, err);
  }
}
