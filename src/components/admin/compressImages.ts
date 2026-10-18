// ย่อรูปในเบราว์เซอร์ก่อนอัปโหลด (ด้านยาวสุด 1600px, WebP) — รูปจากมือถือ 5MB เหลือราว 200–400KB
// จำเป็นบน Vercel ที่รับคำขอได้ไม่เกิน 4.5MB และทำให้อัปโหลดผ่านเน็ตมือถือได้เร็วขึ้น
const MAX_SIDE = 1600;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

async function compressOne(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    // Safari เก่าที่ไม่รองรับ WebP จะได้ PNG กลับมา — ใช้ JPEG แทน
    const out = blob && blob.type === "image/webp" ? blob : await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!out || out.size >= file.size) return file;
    const ext = out.type === "image/webp" ? "webp" : "jpg";
    return new File([out], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: out.type });
  } catch {
    return file;
  }
}

/** ย่อทุกไฟล์ใน <input type=file> แล้วใส่กลับเข้า input เดิม คืนค่าขนาดรวม (bytes) */
export async function compressInput(input: HTMLInputElement): Promise<number> {
  const files = Array.from(input.files ?? []);
  if (!files.length) return 0;
  const out = await Promise.all(files.map(compressOne));
  const dt = new DataTransfer();
  out.forEach((f) => dt.items.add(f));
  input.files = dt.files;
  return out.reduce((s, f) => s + f.size, 0);
}
