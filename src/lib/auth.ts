// Server-side Better Auth instance.
// This is the single source of truth for hashing, sessions, and roles.

import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8080",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
  ].filter(Boolean) as string[],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: ["student", "teacher", "manager", "parent", "deputy"],
        required: true,
        defaultValue: "student",
        // input: false means the person signing up CANNOT set their own role,
        // no matter what their browser/request sends. Everyone who
        // self-signs-up becomes a "student" — teacher/manager accounts must
        // be promoted afterward by someone with manager access.
        input: false,
      },
      firstName: { type: "string", required: true, input: true },
      lastName: { type: "string", required: true, input: true },
      // Grade is assigned by staff afterward, never chosen at signup.
      grade: { type: "string", required: false, input: false },
    },
  },
  // Lets people log in with an ID Number instead of an email.
  // Better Auth still needs a unique "email" internally — our signup route
  // auto-generates a hidden placeholder like "1042@school.internal" that
  // nobody ever sees or types.
  plugins: [username(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
