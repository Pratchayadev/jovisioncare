// ใช้: npm run hash-password -- "รหัสผ่าน"
import { scryptSync, randomBytes } from "node:crypto";
const pw = process.argv[2];
if (!pw) { console.error('ใช้: npm run hash-password -- "รหัสผ่าน"'); process.exit(1); }
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(pw, salt, 64).toString("hex");
console.log(`ADMIN_PASSWORD_HASH="${salt}:${hash}"`);
