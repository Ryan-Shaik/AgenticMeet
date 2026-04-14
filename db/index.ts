import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL is not set. Database operations will fail at runtime.");
}

export const db = drizzle(databaseUrl || "", { schema });
export default db;