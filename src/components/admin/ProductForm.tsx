"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import SeoFields from "./SeoFields";
import SeoCheck from "./SeoCheck";
import { compressInput, MAX_TOTAL_BYTES } from "./compressImages";
import type { Brand, Category, Product, ProductImage } from "@/db/schema";

type Props = { product?: Product & { images: ProductImage[] }; categories: Category[]; brands: Brand[]; host: string };

export default function ProductForm({ product: p, categories, brands, host }: Props) {
  const [state, action] = useActionState(saveProduct, undefined);
  const [del, setDel] = useState<number[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [name, setName] = useState(p?.name ?? "");
  const [slug, setSlug] = useState(p?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [sizeErr, setSizeErr] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    setBusy(true); setSizeErr("");
    const total = await compressInput(input);
    setBusy(false);
    setPreviews(Array.from(input.files ?? []).map((f) => URL.createObjectURL(f)));
    if (total > MAX_TOTAL_BYTES) setSizeErr(`รูปรวมกัน ${(total / 1048576).toFixed(1)}MB เกิน 4MB — กรุณาอัปโหลดทีละน้อยลง (บันทึกแล้วค่อยเพิ่มรูปต่อได้)`);
  }

  return (
    <form action={action} className="form">
      {p && <input type="hidden" name="id" value={p.id} />}
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>ข้อมูลสินค้า</h2>
            <label className="fld"><span>ชื่อสินค้า *</span><input type="text" name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น กรอบโลหะทรงหยดน้ำ" /></label>
            <div className="fld-row">
              <label className="fld"><span>รหัสสินค้า *</span><input type="text" name="code" required defaultValue={p?.code} placeholder="BL-01" style={{ textTransform: "uppercase" }} /></label>
              <label className="fld"><span>ราคา (บาท)</span><input type="number" name="price" min={0} defaultValue={p?.price ?? ""} placeholder="ไม่ระบุ = สอบถามแอดมิน" /></label>
              <label className="fld"><span>ป้าย</span><input type="text" name="tag" defaultValue={p?.tag ?? ""} placeholder="NEW ARRIVAL / BEST SELLER" /></label>
            </div>
            <label className="fld"><span>รายละเอียด</span><textarea name="description" defaultValue={p?.description ?? ""} placeholder="วัสดุ ขนาด สีที่มี จุดเด่น… (เว้นว่างจะใช้ข้อความมาตรฐาน)" /><small>เขียนให้ไม่ซ้ำกับรุ่นอื่น เช่น วัสดุ น้ำหนัก ขนาดเลนส์ สีที่มี เหมาะกับรูปหน้าแบบไหน</small></label>
          </div>

          <div className="panel card">
            <h2>รูปภาพ</h2>
            <p className="hint">รูปแรก (ลำดับน้อยสุด) จะเป็นรูปปก ระบบย่อรูปและแปลงเป็น WebP ให้อัตโนมัติ</p>
            {p && p.images.length > 0 && (
              <div className="imgs">
                {p.images.map((img) => (
                  <div key={img.id} className={"imgbox" + (del.includes(img.id) ? " del" : "")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? ""} />
                    <div className="meta">
                      <input type="text" name={`alt_${img.id}`} defaultValue={img.alt ?? ""} placeholder="คำอธิบายรูป (alt)" aria-label="คำอธิบายรูป" />
                      <label className="fld" style={{ gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 6 }}>
                        <small>ลำดับ</small><input type="number" name={`order_${img.id}`} defaultValue={img.sortOrder} />
                      </label>
                      <label className="check"><input type="checkbox" name="deleteImage" value={img.id} onChange={(e) => setDel((d) => (e.target.checked ? [...d, img.id] : d.filter((x) => x !== img.id)))} /> ลบรูปนี้</label>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="drop">
              <input type="file" name="images" accept="image/*" multiple onChange={onPick} />
              <b>{busy ? "กำลังย่อรูป…" : "+ เพิ่มรูปภาพ"}</b>
              <small>แตะเพื่อเลือกได้หลายรูป ระบบย่อรูปให้ก่อนอัปโหลด</small>
            </label>
            {sizeErr && <div className="flash err">{sizeErr}</div>}
            {previews.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="previews">{previews.map((u) => <img key={u} src={u} alt="" />)}</div>
            )}
          </div>

          <SeoFields
            path={`${host}/products/${slug || "…"}`}
            defTitle={name || "ชื่อสินค้า"}
            defDesc="รายละเอียดสินค้า — J.O. Vision Care ร้านแว่นอุดร หนองคาย"
            metaTitle={p?.metaTitle}
            metaDescription={p?.metaDescription}
          />
        </div>

        <div className="form">
          <SeoCheck kind="product" />
          <div className="panel card">
            <h2>การแสดงผล</h2>
            <label className="check"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> เผยแพร่บนเว็บไซต์</label>
            <label className="check"><input type="checkbox" name="featured" defaultChecked={p?.featured ?? true} /> แสดงในคอลเลกชันหน้าแรก</label>
            <label className="fld"><span>ลำดับการแสดง</span><input type="number" name="sortOrder" defaultValue={p?.sortOrder ?? 0} /><small>เลขน้อยแสดงก่อน</small></label>
          </div>
          <div className="panel card">
            <h2>จัดกลุ่ม</h2>
            <label className="fld"><span>หมวดหมู่</span>
              <select name="categoryId" defaultValue={p?.categoryId ?? ""}>
                <option value="">— ไม่ระบุ —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="fld"><span>แบรนด์</span>
              <select name="brandId" defaultValue={p?.brandId ?? ""}>
                <option value="">— ไม่ระบุ —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            <small style={{ color: "var(--muted)" }}>ยังไม่มีในรายการ? <Link href="/admin/categories/new" style={{ textDecoration: "underline" }}>เพิ่มหมวดหมู่</Link> · <Link href="/admin/brands/new" style={{ textDecoration: "underline" }}>เพิ่มแบรนด์</Link></small>
          </div>
          <div className="panel card">
            <h2>URL</h2>
            <label className="fld"><span>Slug</span><input type="text" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="สร้างอัตโนมัติจากแบรนด์ + รหัส" />
              <small>ใช้ a-z, 0-9, ภาษาไทย และขีด (-) — เปลี่ยนแล้วลิงก์เดิมจะใช้ไม่ได้</small></label>
          </div>
        </div>
      </div>
      <div className="sticky-save">
        <Link href="/admin/products" className="btn-a">ยกเลิก</Link>
        <SubmitButton disabled={busy || !!sizeErr}>{p ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</SubmitButton>
      </div>
    </form>
  );
}
