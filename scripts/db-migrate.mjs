import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

mkdirSync("data", { recursive: true });
mkdirSync("data/private/avatars", { recursive: true });
mkdirSync("data/private/karnameh", { recursive: true });
mkdirSync("data/private/submissions", { recursive: true });

const url = process.env.DATABASE_URL || "file:./data/school.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });
const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));

async function hasColumn(table, column) {
  try {
    const info = await client.execute(`PRAGMA table_info("${table}")`);
    return info.rows.some((row) => row.name === column);
  } catch {
    return false;
  }
}

const alreadyCurrent = (await hasColumn("user", "first_name")) && (await hasColumn("gallery_items", "image_url"));
let stamped = 0;
if (alreadyCurrent) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash text NOT NULL,
      created_at numeric
    )
  `);
  const existing = await client.execute("SELECT hash FROM __drizzle_migrations");
  const seen = new Set(existing.rows.map((row) => String(row.hash)));
  for (const entry of journal.entries) {
    const query = readFileSync(`drizzle/${entry.tag}.sql`);
    const hash = createHash("sha256").update(query).digest("hex");
    if (seen.has(hash)) continue;
    await client.execute({
      sql: 'INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)',
      args: [hash, entry.when],
    });
    stamped += 1;
  }
}

if (stamped > 0) {
  console.log(`stamped ${stamped} migrations on an existing schema; no SQL replay`);
}

execSync("npx drizzle-kit migrate", { stdio: "inherit" });

const required = ["gallery_items", "calendar_events", "grades", "assignments", "parent_links", "tuition_accounts", "report_cards", "exams"];
for (const table of required) {
  const found = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [table],
  });
  if (found.rows.length === 0) {
    console.error(`migration finished but table missing: ${table}`);
    process.exit(1);
  }
}
console.log("migrate ok");
