# Deploy PIXSALE ขึ้น GitHub + Vercel

คู่มือนี้ใช้เวลาประมาณ 5–10 นาที และไม่ต้องใช้บัตรเครดิต

---

## 0. สิ่งที่ต้องมี

- บัญชี GitHub — <https://github.com/signup>
- บัญชี Vercel — <https://vercel.com/signup> (สมัครด้วย GitHub ได้)
- Node.js 18+ สำหรับรันในเครื่อง (ไม่จำเป็นถ้าแก้ไฟล์บน GitHub โดยตรง)

---

## 1. สร้าง repository

เปิด <https://github.com/new>

| ช่อง | ค่า |
|---|---|
| Repository name | `pixsale-lnwads-tiktok` |
| Description | PIXSALE — mobile-first sales pages for TikTok sellers |
| Visibility | **Public** |
| Initialize | ไม่ต้องติ๊กใด ๆ |

กด **Create repository**

> ทำไมต้อง Public: หน้าเซลเพจที่ deploy จะอ่าน JSON จาก `raw.githubusercontent.com` โดยไม่ต้องใช้ token ถ้าเป็น private ลูกค้าจะโหลดข้อมูลไม่ได้

---

## 2. อัปโหลดโค้ด

### วิธี A — ใช้ Git CLI

```bash
cd pixsale-lnwads-tiktok
git init
git add .
git commit -m "feat: PIXSALE v1"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/pixsale-lnwads-tiktok.git
git push -u origin main
```

### วิธี B — อัปโหลดผ่านหน้าเว็บ

1. ในหน้า repo ว่าง กด **uploading an existing file**
2. ลากโฟลเดอร์/ไฟล์ทั้งหมดจาก `pixsale-lnwads-tiktok/` ขึ้นไป
3. ใส่ข้อความ commit แล้วกด **Commit changes**

> ต้องคงโครงสร้างโฟลเดอร์ `app/`, `p/`, `assets/`, `data/` ให้เหมือนเดิม

---

## 3. Deploy บน Vercel

1. ไปที่ <https://vercel.com/new>
2. เลือก **Import Git Repository** → `pixsale-lnwads-tiktok`
3. ตั้งค่า:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | *(เว้นว่าง)* |
| Output Directory | `.` |
| Install Command | *(เว้นว่าง)* |

4. กด **Deploy** (ใช้เวลาประมาณ 20–40 วินาที)
5. ได้ URL เช่น `https://pixsale-lnwads-tiktok.vercel.app`

ตรวจหน้าเหล่านี้หลัง deploy:

- `/` — หน้าแบรนด์
- `/app/` — Studio
- `/p/tiktok-shop-starter-kit` — หน้าเซลเพจตัวอย่าง (clean URL)
- `/p/?id=tiktok-shop-starter-kit` — รูปแบบ query
- `/docs/` — คู่มือ

---

## 4. เชื่อม GitHub ในแอป (เพื่อเขียนข้อมูลกลับ)

1. สร้าง fine-grained token: <https://github.com/settings/personal-access-tokens/new>
   - Repository access → **Only select repositories** → `pixsale-lnwads-tiktok`
   - Permissions → Repository permissions → **Contents: Read and write**
   - Generate token แล้วคัดลอก
2. เปิด `https://<your-domain>/app/settings.html`
3. กรอก owner / repo / branch `main` / token
4. กด **ทดสอบการเชื่อมต่อ** → **เชื่อมต่อและบันทึก**
5. ไปที่ **ซิงก์ข้อมูล** → **อัปโหลดทุกหน้าขึ้น GitHub**

หลังเชื่อมแล้ว:

- การกด **บันทึก** ในหน้าแก้ไข = commit ไฟล์ `data/pages/{slug}.json`
- การกด **เผยแพร่** = เปลี่ยน `status` เป็น `published` และ commit
- แอปจะเขียน `data/site.json` เพื่อให้หน้า สาธารณะ รู้ที่อยู่ repo

> Token เก็บเฉพาะในเบราว์เซอร์เครื่องที่กรอก — ถ้าเปิดแอปจากเครื่องอื่นต้องเชื่อมใหม่ (ข้อมูลใน GitHub ยังอยู่ครบ)

---

## 4.1 เปิดระบบสมาชิกและ Pixel (ไม่บังคับแต่แนะนำ)

ไปที่ Vercel → Project → **Settings → Environment Variables** แล้วเพิ่ม:

| Name | Value | ใช้ทำอะไร |
|---|---|---|
| `AUTH_SECRET` | สุ่ม 32 ไบต์ | เซ็น license key + session |
| `ADMIN_PASSWORD` | รหัสผ่านผู้ดูแล | เข้า `/admin` เพื่อออกสิทธิ์ |
| `TIKTOK_EVENTS_TOKEN` | token จาก TikTok Events API | ส่ง event ฝั่งเซิร์ฟเวอร์ |

หลังเพิ่มแล้วกด **Redeploy** หนึ่งครั้ง

- `/admin` — ออก username / password / license key ให้ลูกค้า
- `/login` — ลูกค้าเข้าด้วย license key + password
- `/api/events` — endpoint สำหรับ TikTok Events API

> ถ้าไม่ตั้ง `AUTH_SECRET` และ `ADMIN_PASSWORD` เว็บจะอยู่ในโหมด demo และ `/app` เปิดได้โดยไม่ต้องล็อกอิน

## 5. ผูกโดเมน (ไม่บังคับ)

1. Vercel → Project → **Settings → Domains**
2. เพิ่มโดเมน เช่น `pixsale.co`
3. ตั้ง DNS ตามที่ Vercel แสดง (A record `76.76.21.21` หรือ CNAME `cname.vercel-dns.com`)
4. รอ propagation แล้ว Vercel จะออก SSL ให้อัตโนมัติ

---

## 6. อัปเดตเว็บในอนาคต

- แก้โค้ด → `git push` → Vercel deploy อัตโนมัติ
- แก้เนื้อหาเซลเพจ → ทำใน Studio แล้วกดบันทึก (ไม่ต้อง deploy ใหม่ เพราะหน้า สาธารณะ อ่าน JSON ล่าสุดจาก GitHub)
- เปลี่ยนข้อมูลตัวอย่าง → แก้ `assets/js/seed.js` แล้วสร้างไฟล์ใน `data/pages` ใหม่

---

## Troubleshooting

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| 403 Resource not accessible | token ไม่มีสิทธิ์ Contents: Read and write |
| 404 ตอนบันทึก | owner/repo/branch ผิด หรือ repo ยังว่างและbranch ยังไม่ถูกสร้าง — push ไฟล์แรกก่อน |
| หน้า สาธารณะ 404 | ยังไม่ได้ตั้ง `status: published` หรือ slug ไม่ตรง |
| หน้าโหลดข้อมูลเก่า | แคช raw GitHub ~5 นาที — refresh หรือ deploy ใหม่ |
| ฟอนต์ไม่โหลด | ตรวจการเชื่อมต่อ Google Fonts หรือเปลี่ยนไปใช้ system font |
| Vercel ขึ้น 404 ทั้งเว็บ | Output Directory ต้องเป็น `.` และไม่มี Build Command |
