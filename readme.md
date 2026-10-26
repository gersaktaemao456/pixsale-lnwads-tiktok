# PIXSALE

**เซลเพจมือถือ-first สำหรับคนขายบน TikTok** — สร้างหน้าเดียวจบ เก็บข้อมูลเป็น JSON ใน GitHub ของคุณ และ deploy จริงบน Vercel

> สถานะ: พร้อมใช้งาน · static site ไม่มี build step · ไม่มีเซิร์ฟเวอร์หลังบ้าน

---

## มีอะไรในโปรเจกต์นี้

| ส่วน | รายละเอียด |
|---|---|
| หน้าแบรนด์ | `/` — hero, ฟีเจอร์, ตัวอย่าง, ราคา, FAQ |
| Studio | `/app/` — แดชบอร์ด, ตัวแก้ไขบล็อก, ตั้งค่า |
| หน้าเซลเพจ | `/p/?id={slug}` หรือ `/p/{slug}` — หน้า สาธารณะที่ลูกค้าเห็น |
| คู่มือ | `/docs/` — วิธีเชื่อม GitHub และ deploy Vercel |
| ข้อมูล | `data/pages/*.json` + `data/site.json` |
| เทมเพลต | Product page, Flash sale, Creator bio |

ฟีเจอร์หลัก:

- บล็อก 10 แบบ: ฮีโร่, สินค้า, จุดเด่น, แกลเลอรี, รีวิว, นับถอยหลัง, คำถาม, ลิงก์, ปิดการขาย, ฟุตเตอร์
- พรีวิวสดในกรอบมือถือ ตรงกับหน้า สาธารณะ 100%
- ธีม: สีหลัก, โหมดสว่าง/มืด, ฟอนต์ IBM Plex Sans Thai
- บันทึกลง GitHub ผ่าน Contents API (commit จริงทุกครั้ง)
- อัปโหลดรูปไป `assets/uploads` บน GitHub
- ทำงานแบบ local-first ได้แม้ยังไม่เชื่อม GitHub
- สำรอง/นำเข้าข้อมูลเป็น JSON

---

## เริ่มใช้งานในเครื่อง

ต้องมี Node.js 18+ (หรือ Python 3)

```bash
npm run dev
# เปิด http://127.0.0.1:4173
```

หรือใช้ Python:

```bash
python -m http.server 4173
```

เปิดหน้าที่สำคัญ:

- แดชบอร์ด — <http://127.0.0.1:4173/app/>
- ตัวอย่างที่เผยแพร่ — <http://127.0.0.1:4173/p/?id=tiktok-shop-starter-kit>
- คู่มือ — <http://127.0.0.1:4173/docs/>

> ต้องเปิดผ่าน HTTP ไม่ใช่ `file://` เพราะหน้า สาธารณะอ่านไฟล์ JSON ด้วย `fetch`

---

## เก็บข้อมูลลง GitHub

1. สร้าง repo ชื่อ `pixsale-lnwads-tiktok` แบบ **Public** (ไม่ต้องมี README)
2. สร้าง fine-grained PAT ที่ <https://github.com/settings/personal-access-tokens/new>
   - Repository access: **Only select repositories** → repo ที่สร้าง
   - Permissions → **Contents: Read and write**
3. เปิด `/app/settings.html` กรอก owner / repo / branch / token
4. กด **ทดสอบการเชื่อมต่อ** → **เชื่อมต่อและบันทึก**
5. ไปที่ **ซิงก์ข้อมูล** → **อัปโหลดทุกหน้าขึ้น GitHub**

โครงสร้างที่ถูกเขียน:

```
data/site.json                 # ข้อมูล repo สาธารณะ (ไม่มี token)
data/pages/{slug}.json         # หนึ่งหน้า = หนึ่งไฟล์
assets/uploads/{file}          # รูปที่อัปโหลดผ่านแอป
```

`data/site.json` ใช้บอกหน้า สาธารณะ ว่าควรอ่านข้อมูลล่าสุดจาก raw GitHub ที่ไหน — ดังนั้นแก้หน้าในแอปแล้วลูกค้าเห็นได้ทันทีโดยไม่ต้อง deploy ใหม่ (มีแคชประมาณ 5 นาที)

---

## Deploy บน Vercel

1. push โค้ดขึ้น GitHub
2. ไปที่ <https://vercel.com/new> เลือก repo
3. ตั้งค่า:
   - Framework Preset: **Other**
   - Build Command: *(เว้นว่าง)*
   - Output Directory: **`.`**
4. กด **Deploy**

ไฟล์ `vercel.json` ตั้งค่า clean URLs, rewrite `/p/:slug`, แคช assets และ security headers ไว้ให้แล้ว

รายละเอียดแบบทีละขั้นอยู่ใน [`DEPLOY.md`](DEPLOY.md)

---

## คำสั่งที่ใช้บ่อย

```bash
npm run dev      # static server สำหรับพัฒนา
npm run check    # ตรวจไฟล์ JSON, renderer, GitHub adapter, ลิงก์ในเครื่อง
```

---

## โครงสร้างไฟล์

```
.
├─ index.html
├─ app/{index,editor,settings}.html
├─ p/index.html
├─ docs/index.html
├─ assets/
│  ├─ brand/{logo,favicon}.svg
│  ├─ css/{tokens,site,app,page}.css
│  ├─ img/*.svg
│  └─ js/{config,github,seed,store,render,ui,site,dashboard,editor,settings,public}.js
├─ data/
│  ├─ site.json
│  └─ pages/*.json
├─ scripts/{serve.js,check.mjs}
├─ vercel.json
├─ package.json
└─ README.md
```

---

## ปรับแต่ง

| ต้องการเปลี่ยน | ไฟล์ |
|---|---|
| สี/ฟอนต์/ระยะทั้งระบบ | `assets/css/tokens.css` |
| หน้าตาเซลเพจ | `assets/css/page.css` + `assets/js/render.js` |
| หน้าแบรนด์ | `assets/css/site.css` + `index.html` |
| ข้อความในหน้าแรก | `index.html` |
| ข้อมูลตัวอย่าง | `assets/js/seed.js` แล้วรันสคริปต์สร้าง `data/pages` ใหม่ |
| ค่าเริ่มต้น repo/แบรนด์ | `assets/js/config.js` |

---

## ระบบสมาชิก (ขายสิทธิ์)

PIXSALE มีระบบ **license key + password** สำหรับจำหน่ายสิทธิ์การใช้งาน โดยไม่ต้องมีฐานข้อมูลกลาง

### เปิดใช้งานครั้งแรก

1. ไปที่ Vercel → Project → **Settings → Environment Variables**
2. เพิ่มตัวแปร:
   - `AUTH_SECRET` — สุ่มอย่างน้อย 32 ไบต์ (ใช้เซ็น license และ session)
   - `ADMIN_PASSWORD` — รหัสผ่านผู้ดูแลที่คุณตั้งเอง (ใช้เข้า `/admin`)
3. Redeploy โปรเจกต์
4. เปิด `/admin` แล้วล็อกอินด้วย `ADMIN_PASSWORD`

> หน้า `/admin` มีปุ่มสร้าง `AUTH_SECRET` แบบสุ่มและคัดลอกให้ พร้อมลิงก์ไปหน้าตั้งค่า Vercel

### ขั้นตอนจำหน่าย

1. `/admin` → กรอกแพ็กเกจ/อายุ → กด **สร้างสิทธิ์การใช้งาน**
2. ระบบจะสร้าง **username + password + license key** (แสดงครั้งเดียว)
3. ดาวน์โหลดใบรับสิทธิ์ หรือคัดลอกส่งให้ลูกค้า
4. ลูกค้าเปิด `/login` วาง license key + password → เข้า `/app` ได้
5. สิทธิ์หมดอายุตามวันที่กำหนด และ session มีอายุสูงสุด 7 วัน

### ข้อควรรู้

- License key ถูกเซ็นด้วย `AUTH_SECRET` และมี password hash (PBKDF2) อยู่ข้างใน — ไม่มีฐานข้อมูลผู้ใช้
- การเปลี่ยน `AUTH_SECRET` จะทำให้ license และ session ทั้งหมดใช้ไม่ได้ (ใช้เป็นมาตรการ revoke ทั้งหมด)
- ไม่มีการเก็บ password แบบ plaintext ในเซิร์ฟเวอร์หรือไฟล์โปรเจกต์
- ระบบนี้เป็น license gate สำหรับแอป static — เหมาะกับการขายสิทธิ์แบบดิจิทัล ไม่ใช่ DRM ระดับองค์กร

## Pixel / TikTok Events API / Custom CSS

เปิดได้ที่แท็บ **ติดตาม** ในหน้าแก้ไขเซลเพจ

- **Facebook Pixel ID**, **LINE Tag ID**, **TikTok Pixel ID** — เก็บใน JSON ของหน้านั้น และโหลดเฉพาะหน้า public (ไม่โหลดใน editor)
- **TikTok Events API token** — ไม่ถูกเก็บใน JSON/GitHub; เก็บเฉพาะ localStorage ของเครื่องที่กรอก หรือใช้ Environment Variable `TIKTOK_EVENTS_TOKEN` บน Vercel
- **Custom CSS** — ถูกจำกัดให้มีผลเฉพาะใน `.ps-page` ด้วย `@scope` และตัด `@import` / `<script>` ออก
- Events API endpoint: `POST /api/events`

> Token ที่ปรากฏในภาพตัวอย่างจากระบบเดิมถือเป็นความลับ — ควร revoke และออกใหม่ถ้าเคยแชร์ที่ไหน

## ความปลอดภัย

- Token เก็บใน `localStorage` ของเบราว์เซอร์เท่านั้น ไม่ถูก commit และไม่ถูกส่งออกนอก `api.github.com`
- ใช้ fine-grained token เฉพาะ repo และเฉพาะสิทธิ์ Contents
- อย่าใส่ข้อมูลลูกค้าที่ละเอียดอ่อนลงในเซลเพจ สาธารณะ
- ตัวเลข views/clicks ในข้อมูลตัวอย่างเป็นค่าสาธิต ไม่ใช่สถิติจริง

---

## หมายเหตุ

- หน้า สาธารณะอ่านข้อมูลจาก `data/site.json` → raw GitHub → ไฟล์ static ในเครื่อง ตามลำดับ
- หาก repo เป็น private หน้า สาธารณะจะอ่าน raw ไม่ได้ (ต้องใช้ token) — แนะนำให้ใช้ repo public สำหรับหน้าร้าน
- ตัวเลขยอดเข้าชมในแดชบอร์ดเป็นข้อมูลตัวอย่างจาก seed; การเก็บสถิติจริงต้องเชื่อม analytics ภายนอก
