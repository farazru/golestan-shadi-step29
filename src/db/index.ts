import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Local file by default. For Turso / hosted libsql set DATABASE_URL
// (and DATABASE_AUTH_TOKEN). A lone school.db will not survive Vercel.
const url = process.env.DATABASE_URL || "file:./data/school.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });
export const db = drizzle(client, { schema });
