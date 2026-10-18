"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveBrand, saveCategory } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import SeoFields from "./SeoFields";
import { compressInput } from "./compressImages";
import type { Brand, Category } from "@/db/schema";

type Kind = "categories" | "brands";
const labels = { categories: { one: "หมวดหมู่", url: "category", ph: "เช่น แว่นสายตา" }, brands: { one: "แบรนด์", url: "brand", ph: "เช่น BOLON" } };

export default function TaxonomyForm({ kind, item, host }: { kind: Kind; item?: Category | Brand; host: string }) {
  const [state, action] = useActionState(kind === "brands" ? saveBrand : saveCategory, undefined);
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const L = labels[kind];
  const logo = kind === "brands" ? (item as Brand | undefined)?.logo : null;
  return (
    <form action={action} className="form">
      {item && <input type="hidden" name="id" value={item.id} />}
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>ข้อมูล{L.one}</h2>
            <label className="fld"><span>ชื่อ{L.one} *</span><input type="text" name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder={L.ph} /></label>
            <label className="fld"><span>คำอธิบาย</span><textarea name="description" defaultValue={item?.description ?? ""} placeholder={`แสดงบนหน้า${L.one} ช่วยเรื่อง SEO`} /></label>
          </div>
          <SeoFields path={`${host}/${L.url}/${slug || "…"}`} defTitle={name || `ชื่อ${L.one}`} defDesc={`${name} แบรนด์แท้ที่ J.O. Vision Care ร้านแว่นอุดรและหนองคาย`} metaTitle={item?.metaTitle} metaDescription={item?.metaDescription} />
        </div>
        <div className="form">
          {kind === "brands" && (
            <div className="panel card">
              <h2>โลโก้แบรนด์</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logo && <img src={logo} alt="" style={{ maxHeight: 60, objectFit: "contain" }} />}
              <input type="file" name="logo" accept="image/*" onChange={(e) => compressInput(e.currentTarget)} />
              {logo && <label className="check"><input type="checkbox" name="removeLogo" /> ลบโลโก้</label>}
              <small style={{ color: "var(--muted)" }}>ไม่มีโลโก้ ระบบจะแสดงเป็นชื่อแบรนด์</small>
            </div>
          )}
          <div className="panel card">
            <h2>URL และลำดับ</h2>
            <label className="fld"><span>Slug</span><input type="text" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="สร้างอัตโนมัติจากชื่อ" /></label>
            <label className="fld"><span>ลำดับการแสดง</span><input type="number" name="sortOrder" defaultValue={item?.sortOrder ?? 0} /></label>
          </div>
        </div>
      </div>
      <div className="sticky-save">
        <Link href={`/admin/${kind}`} className="btn-a">ยกเลิก</Link>
        <SubmitButton>{item ? "บันทึกการแก้ไข" : `เพิ่ม${L.one}`}</SubmitButton>
      </div>
    </form>
  );
}
