const placeholders = new Set([
  "",
  "replace-with-openssl-rand-base64-32",
  "better-auth-secret",
  "secret",
  "changeme",
]);

const secret = process.env.BETTER_AUTH_SECRET || "";
const url = process.env.BETTER_AUTH_URL || "http://localhost:8080";

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (secret.length < 32 || placeholders.has(secret)) {
  fail(
    "BETTER_AUTH_SECRET is missing or is a placeholder. Generate one with: openssl rand -base64 32",
  );
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  fail("BETTER_AUTH_URL is not a valid URL.");
}

const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
if (!local && parsed.protocol !== "https:") {
  fail("BETTER_AUTH_URL must be https when it is not localhost.");
}

const dbUrl = process.env.DATABASE_URL || "file:./data/school.db";
if (!dbUrl.startsWith("file:") && !dbUrl.startsWith("libsql:")) {
  fail("DATABASE_URL must be a file: or libsql: URL.");
}
if (dbUrl.startsWith("libsql:") && !process.env.DATABASE_AUTH_TOKEN) {
  fail("DATABASE_AUTH_TOKEN is required for hosted libsql.");
}

console.log("preflight ok");
