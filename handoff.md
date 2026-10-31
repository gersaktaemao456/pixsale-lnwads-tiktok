# PIXSALE — Handoff

อัปเดต: 31 ตุลาคม 2026

## สถานะล่าสุด

- Vercel Production ใช้งานได้: https://pixsale-lnwads-tiktok.vercel.app
- ลิงก์ Studio ส่วนตัว: https://pixsale-studio.vercel.app → redirect ไป `/login` (คนอื่นไม่มี key/password เข้าไม่ได้)
- ระบบสมาชิกเปิดใช้งานแล้ว: `/api/auth/*` และ `/api/admin/session`
- ออกบัญชีแล้ว 3 บัญชี: `pixsale01`, `pixsale02`, `pixsale03` (Pro 365 วัน)
- ข้อมูลเข้าใช้งานอยู่ใน `pixsale-accounts.txt` นอกโปรเจกต์ — ห้าม commit ไฟล์นี้

## ลิงก์ที่ใช้งานจริง

| หน้า | URL |
|---|---|
| เว็บแบรนด์ | https://pixsale-lnwads-tiktok.vercel.app |
| ล็อกอินลูกค้า | https://pixsale-lnwads-tiktok.vercel.app/login |
| Back Office | https://pixsale-lnwads-tiktok.vercel.app/admin |
| Studio | https://pixsale-lnwads-tiktok.vercel.app/app |
| ตัวอย่างเซลเพจ | https://pixsale-lnwads-tiktok.vercel.app/p/tiktok-shop-starter-kit |
| คู่มือ | https://pixsale-lnwads-tiktok.vercel.app/docs |

โปรเจกต์ Vercel: `fin69s-projects/pixsale-lnwads-tiktok`

## สิ่งที่ส่งมอบ

- แบรนด์ PIXSALE + หน้าเว็บ marketing (ดีไซน์ Build minimal, ฟอนต์ไทย Noto Sans Thai + IBM Plex Sans Thai)
- Studio: แดชบอร์ด, ตัวแก้ไข 10 บล็อก, พรีวิวสด, ธีม, SEO, เผยแพร่
- หน้าเซลเพจ public + clean URL `/p/{slug}` + sticky buy bar
- ระบบสมาชิก:
  - `/login` — ลูกค้าเข้าด้วย license key + password
  - `/admin` — Back Office สำหรับออก username/password/license key
  - API: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/admin/session`, `/api/admin/license`
  - License เซ็นด้วย HMAC + password hash PBKDF2 (ไม่มีฐานข้อมูลกลาง)
- Pixel & tracking:
  - แท็บ **ติดตาม** ใน editor: Facebook Pixel, LINE Tag, TikTok Pixel
  - TikTok Events API endpoint `/api/events` (token อยู่ใน env เท่านั้น)
  - Custom CSS (scope เฉพาะ `.ps-page`)
- ศูนย์ช่วยเหลือ:
  - ปุ่มลอย + ป๊อปอัพ “ศูนย์ช่วยเหลือบริการ”
  - ปุ่ม “เปิดใช้บริการ” และช่องทาง LINE: https://line.me/ti/p/~@932iqmdj

## วิธีเปิดระบบสมาชิก (ต้องทำครั้งเดียว)

1. เปิด Vercel → Project → **Settings → Environment Variables**
2. เพิ่ม:
   - `AUTH_SECRET` — สุ่มอย่างน้อย 32 ไบต์ (หน้า `/admin` มีปุ่มสร้างให้)
   - `ADMIN_PASSWORD` — รหัสผ่านผู้ดูแลที่คุณตั้งเอง
3. Redeploy
4. เปิด `/admin` → ล็อกอิน → ออกสิทธิ์ให้ลูกค้า

ถ้ายังไม่ตั้งสองค่านี้ เว็บจะอยู่ใน **demo mode** และ `/app` เปิดได้โดยไม่ต้องล็อกอิน

## วิธีใช้ Pixel

1. เปิดหน้าเซลเพจใน Studio → แท็บ **ติดตาม**
2. ใส่ Facebook Pixel ID / LINE Tag ID / TikTok Pixel ID
3. กดบันทึก (และเผยแพร่)
4. TikTok Events API: เพิ่ม `TIKTOK_EVENTS_TOKEN` ใน Vercel Environment Variables แล้ว redeploy

> Token ที่เคยแชร์ในภาพจากระบบเดิมควร revoke และออกใหม่ — ระบบนี้ไม่เก็บ token ลง JSON/GitHub

## GitHub

แอปพร้อมซิงก์ข้อมูลลง GitHub ผ่าน fine-grained PAT (Contents: Read and write) แต่ในรอบนี้ **ยังไม่ได้ผูก repo จริง** เพราะ GitHub connector ที่เชื่อมอยู่เป็นแบบอ่านอย่างเดียว

วิธีเชื่อม:

1. สร้าง repo `pixsale-lnwads-tiktok` แบบ Public
2. สร้าง fine-grained token (Contents: Read and write)
3. เปิด `/app/settings` → GitHub repository → ใส่ owner/repo/token
4. กด **ทดสอบการเชื่อมต่อ** → **เชื่อมต่อและบันทึก** → **อัปโหลดทุกหน้าขึ้น GitHub**

## ผลตรวจสอบ

- `npm run check` — ผ่าน 80/80 (ไฟล์, JSON, renderer, GitHub adapter, auth crypto, ลิงก์)
- UI flow — 15/15 (สร้างหน้า, แก้ไข, พรีวิว, บันทึก, เผยแพร่, ลบ, mobile nav)
- Auth flow — 10/10 (admin login, ออก license, user login, session, wrong password, admin guard)
- Tracking/CSS — 8/8 (tab, fields, CSS preview, token ไม่หลุดลง page JSON)
- Help modal — 9/9 (เปิด/ปิด, ESC, backdrop, LINE link, mobile fit)
- Production routes — 200 ทุกหน้า, API ตอบถูกต้องใน demo mode, CSP อนุญาต TikTok/Facebook/LINE

## ข้อจำกัดที่ควรรู้

- ระบบ license เป็นการป้องกันระดับแอป static ไม่ใช่ DRM — ผู้เชี่ยวชาญสามารถอ่าน JS ได้ แต่ต้องมี license ถึงจะออกสิทธิ์/ใช้งานตาม flow
- ไม่มีฐานข้อมูลกลาง: license ทุกใบถูกเซ็นและตรวจสอบแบบ stateless; การ revoke ทั้งหมดทำได้โดยเปลี่ยน `AUTH_SECRET`
- ยังไม่มีระบบชำระเงินในตัว — ขายผ่านช่องทางของคุณแล้วออก license จาก `/admin`
- Custom CSS ใช้ `@scope` (เบราว์เซอร์ใหม่รองรับ); CSS ที่ซับซ้อนมากอาจต้องทดสอบเพิ่ม
- ตัวเลข views/clicks ในข้อมูลตัวอย่างเป็นค่าสาธิต
