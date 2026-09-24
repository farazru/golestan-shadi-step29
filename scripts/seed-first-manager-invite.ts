// Run this ONCE, the very first time you set up the project:
//   npx tsx scripts/seed-first-manager-invite.ts
//
// It creates a single invite code that grants the "manager" role.
// Sign up normally on the website, then enter this code to become
// the school's first manager account. After that, you can create
// more invite codes from inside the site itself (managers can mint them).

import { db } from "../src/db";
import { staffInvites } from "../src/db/schema";
import { randomBytes, randomUUID } from "crypto";

function generateCode() {
  const raw = randomBytes(6).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

async function main() {
  const code = generateCode();
  await db.insert(staffInvites).values({
    id: randomUUID(),
    code,
    role: "manager",
  });

  console.log("\n✅ First manager invite code created!\n");
  console.log(`   ${code}\n`);
  console.log("Sign up on the site, then use this code to become a manager.\n");
}

main().then(() => process.exit(0));
