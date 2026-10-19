# J.O. Vision Care — เว็บไซต์ร้านแว่น + ระบบหลังบ้าน

สร้างจากดีไซน์ `JO Vision Care.dc.html` (Claude Design) เน้น SEO และรองรับมือถือเป็นหลัก · Deploy บน **Vercel**

## Tech stack

| ส่วน | ใช้ |
|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** — Server Components, ISR |
| Hosting | **Vercel** — function region `iad1` ให้อยู่ที่เดียวกับฐานข้อมูล Turso (us-east-1) · หน้าเว็บ cache ที่ CDN ทั่วโลก |
| ฐานข้อมูล | **Turso** (SQLite บนคลาวด์) + **Drizzle ORM** — ตอนพัฒนาใช้ไฟล์ SQLite ในเครื่อง |
| รูปที่อัปโหลด | **Cloudflare R2** · ย่อรูปในเบราว์เซอร์ก่อนส่ง + แปลง WebP ด้วย `sharp` · แสดงผลผ่าน `next/image` (AVIF/WebP) |
| หลังบ้าน | `/admin` — Server Actions, เซสชัน cookie แบบเซ็น HMAC, รหัสผ่านแบบ scrypt |
| สไตล์ | CSS ธรรมดา (แปลงจากดีไซน์) + ฟอนต์ IBM Plex Sans Thai / Bebas Neue / IBM Plex Mono แบบ self-host |

## พัฒนาบนเครื่อง

ต้องมี Node.js 20 ขึ้นไป

```bash
npm install
cp .env.example .env
npm run hash-password -- "รหัสผ่านของคุณ"   # นำบรรทัดที่ได้ไปใส่ใน .env
openssl rand -hex 32                        # นำค่าที่ได้ไปใส่ SESSION_SECRET ใน .env
npm run setup                               # สร้างตาราง + ใส่ข้อมูลตั้งต้นจากดีไซน์
npm run dev                                 # http://localhost:3000  ·  หลังบ้าน /admin
```

ตอนพัฒนาไม่ต้องตั้งค่า R2 ก็ได้ รูปที่อัปโหลดจะเก็บที่ `data/uploads`

## Deploy ขึ้น Vercel (ครั้งแรก)

### 1. เอาโค้ดขึ้น GitHub

```bash
git init && git add . && git commit -m "J.O. Vision Care"
# สร้าง repo (แนะนำ private) บน GitHub แล้ว push ขึ้นไป
```

ไฟล์ `.env` และ `data/` จะไม่ถูกอัปโหลดขึ้นไป (`.gitignore` กันไว้แล้ว)

### 2. สร้างโปรเจกต์บน Vercel

vercel.com → **Add New → Project** → เลือก repo → **อย่าเพิ่งกด Deploy** ให้ทำข้อ 3–4 ก่อน

### 3. ฐานข้อมูล Turso

เปิด [vercel.com/marketplace/tursocloud](https://vercel.com/marketplace/tursocloud) → **Install** → สร้างฐานข้อมูล → Connect กับโปรเจกต์ Vercel จะใส่ `<ชื่อ>_TURSO_DATABASE_URL` และ `<ชื่อ>_TURSO_AUTH_TOKEN` ให้อัตโนมัติ (โค้ดอ่านได้ทั้งแบบมีและไม่มีคำนำหน้า)

ถ้าฐานข้อมูลไม่ได้อยู่ที่ us-east-1 ให้แก้ `regions` ใน `vercel.json` ให้ตรงกับที่ตั้งฐานข้อมูล (เช่น สิงคโปร์ = `sin1`, โตเกียว = `hnd1`)

(หรือสร้างที่ turso.tech เองแล้วใส่ 2 ค่านี้ใน Environment Variables)

### 4. Cloudflare R2 สำหรับรูป

1. Cloudflare → R2 → **Create bucket** (เช่น `jovisioncare`)
2. Bucket → Settings → **Custom Domain** → ผูกโดเมน เช่น `cdn.jovisioncare.com` (หรือเปิด r2.dev สำหรับทดสอบ)
3. R2 → **Manage API Tokens** → สร้าง token สิทธิ์ *Object Read & Write* เฉพาะ bucket นี้

### 5. Environment Variables (Vercel → Settings → Environment Variables)

| ชื่อ | ค่า |
|---|---|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD_HASH` | ผลจาก `npm run hash-password -- "รหัสผ่าน"` (ใส่เฉพาะค่า ไม่ต้องมีเครื่องหมายคำพูด) |
| `SESSION_SECRET` | ผลจาก `openssl rand -hex 32` |
| `SITE_URL` | `https://jovisioncare.com` (โดเมนจริง — ถ้ายังไม่มี เว้นไว้ได้ ระบบจะใช้ .vercel.app) |
| `R2_ACCOUNT_ID` | Account ID ของ Cloudflare |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | จาก API token ข้อ 4 |
| `R2_BUCKET` | `jovisioncare` |
| `R2_PUBLIC_URL` | `https://cdn.jovisioncare.com` |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | ได้มาอัตโนมัติจากข้อ 3 |

### 6. Deploy

กด **Deploy** ได้เลย ระหว่าง build ระบบจะรัน `vercel-build` ซึ่งจะ:
1. migrate ฐานข้อมูล
2. ใส่ข้อมูลตั้งต้นจากดีไซน์ให้ **เฉพาะครั้งแรก** (ครั้งต่อไปไม่ใส่ซ้ำ ข้อมูลที่แก้ในหลังบ้านจึงไม่หาย)
3. build เว็บ

### 7. โดเมน

Vercel → Settings → **Domains** → เพิ่ม `jovisioncare.com` และ `www.jovisioncare.com` (ตั้งให้ www redirect ไปโดเมนหลัก) → ตั้ง DNS ตามที่ Vercel บอก → อัปเดต `SITE_URL` แล้ว Redeploy

หลังจากนี้ ทุกครั้งที่ push ขึ้น GitHub ระบบจะ deploy ให้อัตโนมัติ

## ถ้าแก้โครงสร้างฐานข้อมูล

```bash
# แก้ src/db/schema.ts แล้ว
npm run db:generate     # สร้างไฟล์ migration ใน drizzle/
npm run db:migrate      # ใช้กับฐานข้อมูลในเครื่อง
git add drizzle && git commit && git push   # Vercel จะ migrate Turso ให้ตอน build
```

## ระบบหลังบ้าน

- **สินค้า**: เพิ่ม ลบ แก้ไข ค้นหา และกรองตามหมวดหมู่หรือแบรนด์ · อัปโหลดได้หลายรูปพร้อมกัน (รูปจากมือถือถูกย่อให้ก่อนส่ง) · แก้ alt และลำดับรูป หรือลบรูปได้ · กดสลับเผยแพร่/ซ่อนได้ในคลิกเดียว · เลือกได้ว่าจะแสดงในคอลเลกชันหน้าแรกหรือไม่
- **หมวดหมู่ / แบรนด์**: เพิ่ม ลบ แก้ไข พร้อมคำอธิบายและลำดับ · แบรนด์อัปโหลดโลโก้ได้ · เมื่อลบหมวดหมู่หรือแบรนด์ สินค้าข้างในจะไม่ถูกลบ
- **SEO ทุกหน้า**: ตั้ง Slug, Meta title และ Meta description ได้ พร้อมพรีวิวหน้าตาบน Google
- **ตรวจ SEO**: ฟอร์มสินค้า หมวด แบรนด์ และบทความ ให้คะแนนและบอกสิ่งที่ควรปรับแบบสด ๆ · รายการสินค้า/บทความแสดงคะแนน
- **บทความ** (`/admin/articles`): เขียนด้วย markdown ง่าย ๆ มีปุ่มลัด อัปโหลดรูปในเนื้อหา รูปปก FAQ และฉบับร่าง → `/articles`
- **หมวดหมู่/แบรนด์**: มีเนื้อหาแนะนำใต้รายการสินค้า และ FAQ
- **Redirect 301** (`/admin/redirects`): สร้างอัตโนมัติเมื่อเปลี่ยน slug หรือลบสินค้า/หมวด/แบรนด์/บทความ เพิ่มเองได้
- เมื่อบันทึก หน้าเว็บและ sitemap จะอัปเดตทันที

## SEO ที่ทำไว้แล้ว

- HTML ถูก render ฝั่ง server ทั้งหมด · ใช้ ISR (cache 1 ชั่วโมง และล้าง cache ทันทีเมื่อแก้ข้อมูลในหลังบ้าน)
- มีหน้าแยกที่ index ได้: `/products/[slug]`, `/category/[slug]`, `/brand/[slug]`, `/products`
- JSON-LD: `Optician` ×2 สาขา, `WebSite`, `Product` (+`Offer` เมื่อใส่ราคา), `BreadcrumbList`, `CollectionPage`/`ItemList`
- `sitemap.xml` (รวม image sitemap), `robots.txt` (กัน `/admin`), canonical, Open Graph, Twitter card, `lang="th"`, manifest
- Core Web Vitals: preload ฟอนต์ไทย, รูป hero เป็น priority, รูปอื่น lazy-load พร้อม `srcset` ที่เหมาะกับมือถือ

## สิ่งที่ต้องแก้ก่อนเปิดใช้จริง

1. `src/lib/site.ts` — ใส่ **ที่อยู่ เวลาเปิด-ปิด และเบอร์โทร** ทั้ง 2 สาขา (ตอนนี้ยังเป็น `[ใส่ที่อยู่…]` ตามดีไซน์)
2. รูปบรรยากาศร้าน 4 ช่อง และรูปรีวิว IG ยังเป็น placeholder ตามดีไซน์
3. หลังขึ้นโดเมนจริง: ลงทะเบียน Google Search Console แล้วส่ง `https://โดเมน/sitemap.xml` · สร้าง Google Business Profile ทั้ง 2 สาขา

## โครงสร้าง

```
src/
  app/(site)/        หน้าเว็บสาธารณะ (หน้าแรก, สินค้า, หมวดหมู่, แบรนด์)
  app/admin/         หลังบ้าน + server actions
  app/uploads/       เสิร์ฟรูปที่อัปโหลด (เฉพาะตอนพัฒนาโดยไม่มี R2)
  app/sitemap.ts, robots.ts, manifest.ts
  components/        ส่วนประกอบหน้าเว็บ (Hero, LensLab, Collection, Gallery…)
  components/admin/  ฟอร์มหลังบ้าน + ตัวย่อรูป
  db/schema.ts       โครงสร้างตาราง · migrate.ts · seed.ts
  lib/               db, env, queries, auth, storage (R2 / local), site config
drizzle/             ไฟล์ migration
vercel.json          ตั้ง function region ให้ตรงกับฐานข้อมูล
```

คำสั่งอื่น: `npm run db:studio` (เปิดดู/แก้ฐานข้อมูลผ่านเว็บ)
