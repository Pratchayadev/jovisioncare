import { seed } from "./seed";
seed().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
