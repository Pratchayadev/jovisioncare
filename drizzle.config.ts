import { defineConfig } from "drizzle-kit";

try { process.loadEnvFile(".env"); } catch {}

const find = (s: string) => process.env[s] ?? Object.entries(process.env).find(([k, v]) => k.toUpperCase().endsWith("_" + s) && v)?.[1];
const url = find("DATABASE_URL") || find("TURSO_DATABASE_URL") || "file:./data/jovisioncare.db";
const authToken = find("DATABASE_AUTH_TOKEN") || find("TURSO_AUTH_TOKEN");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: url.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: { url, authToken } as { url: string },
});
