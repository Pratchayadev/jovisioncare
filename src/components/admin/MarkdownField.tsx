"use client";
import { useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { uploadContentImage } from "@/app/admin/actions";
import { compressInput } from "./compressImages";

/** ช่องเขียนเนื้อหาแบบ markdown พร้อมปุ่มลัดและพรีวิว */
export default function MarkdownField({ name, label, defaultValue, placeholder, minHeight = 320 }: { name: string; label: string; defaultValue?: string | null; placeholder?: string; minHeight?: number }) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState("");

  function insert(before: string, after = "", fallback = "") {
    const el = ta.current!;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = value.slice(a, b) || fallback;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + sel.length);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  const line = (prefix: string, fallback: string) => {
    const a = ta.current!.selectionStart;
    const atStart = a === 0 || value[a - 1] === "\n";
    insert((atStart ? "" : "\n\n") + prefix, "", fallback);
  };

  async function onImage() {
    const input = file.current!;
    if (!input.files?.length) return;
    setBusy("กำลังอัปโหลดรูป…");
    await compressInput(input);
    const fd = new FormData();
    fd.append("image", input.files[0]);
    const r = await uploadContentImage(fd);
    input.value = "";
    setBusy(r.error ?? "");
    if (r.url) {
      const a = ta.current!.selectionStart;
      const atStart = a === 0 || value[a - 1] === "\n";
      insert(`${atStart ? "" : "\n\n"}![`, `](${r.url})\n\n`, "คำอธิบายรูป");
    }
  }

  return (
    <div className="fld md-field">
      <span>{label}</span>
      <div className="md-tools" role="toolbar" aria-label="เครื่องมือจัดรูปแบบ">
        <button type="button" onClick={() => line("## ", "หัวข้อ")}>H2</button>
        <button type="button" onClick={() => line("### ", "หัวข้อย่อย")}>H3</button>
        <button type="button" onClick={() => insert("**", "**", "ตัวหนา")}><b>B</b></button>
        <button type="button" onClick={() => line("- ", "รายการ")}>• รายการ</button>
        <button type="button" onClick={() => insert("[", "](/udon-thani)", "ข้อความลิงก์")}>ลิงก์</button>
        <button type="button" onClick={() => file.current?.click()}>รูป</button>
        <input ref={file} type="file" accept="image/*" hidden onChange={onImage} />
        <button type="button" className={preview ? "on" : ""} onClick={() => setPreview((p) => !p)} style={{ marginLeft: "auto" }}>{preview ? "แก้ไข" : "พรีวิว"}</button>
      </div>
      {busy && <small>{busy}</small>}
      <textarea ref={ta} name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} style={{ minHeight, display: preview ? "none" : undefined, fontFamily: "var(--font-mono, monospace)", fontSize: 13, lineHeight: 1.7 }} />
      {preview && <div className="md-preview prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(value).html || "<p><i>ยังไม่มีเนื้อหา</i></p>" }} />}
      <small>## หัวข้อ · **ตัวหนา** · - รายการ · [ข้อความ](/ลิงก์) · เว้น 1 บรรทัดเพื่อขึ้นย่อหน้าใหม่</small>
    </div>
  );
}
