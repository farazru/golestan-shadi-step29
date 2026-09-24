import { mkdirSync } from "node:fs";

export async function ensureDatabase() {
  mkdirSync("data/private/avatars", { recursive: true });
  mkdirSync("data/private/karnameh", { recursive: true });
  mkdirSync("data/private/submissions", { recursive: true });
}
