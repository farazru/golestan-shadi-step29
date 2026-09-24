import { mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";

export async function ensureDatabase() {
  mkdirSync("data/private/avatars", { recursive: true });
  mkdirSync("data/private/karnameh", { recursive: true });
  const url = process.env.DATABASE_URL || "file:./data/school.db";
  const client = createClient({ url });
  try {
    await client.execute("SELECT 1 FROM public_news LIMIT 1");
  } catch {
    execSync("npx drizzle-kit push", { stdio: "inherit" });
  }
}
