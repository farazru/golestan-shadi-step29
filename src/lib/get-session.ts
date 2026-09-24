import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Use this in Server Components / Server Actions.
// Forwards the request cookies so Better Auth can look up the session row.
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
