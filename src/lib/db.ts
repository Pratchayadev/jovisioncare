import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "@/db/schema";
import { dbAuthToken, dbUrl, isLocalFileDb } from "./env";

const g = globalThis as unknown as { libsql?: Client };
const client = g.libsql ?? createClient({ url: dbUrl, authToken: dbAuthToken });
if (!g.libsql) {
  g.libsql = client;
  // ไฟล์ SQLite ในเครื่อง (ตอนพัฒนา): WAL + รอ lock แทนการ error + เปิด foreign key
  if (isLocalFileDb)
    client.executeMultiple("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;").catch(() => {});
}

export const db = drizzle(client, { schema });
export * as t from "@/db/schema";
