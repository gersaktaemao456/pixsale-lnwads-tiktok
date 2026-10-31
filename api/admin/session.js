/* /api/admin/session — admin login state */
const { safeEqual, createAdminSession, setCookie, clearCookie, isAdmin } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.AUTH_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const configured = !!(secret && adminPassword);

  if (req.method === "GET") {
    if (!configured) {
      return res.status(200).json({ configured: false, authed: false, message: "ยังไม่ได้ตั้งค่า AUTH_SECRET และ ADMIN_PASSWORD" });
    }
    return res.status(200).json({ configured: true, authed: isAdmin(req, secret) });
  }

  if (req.method === "POST") {
    if (!configured) {
      return res.status(503).json({
        ok: false,
        error: "not_configured",
        message: "ตั้งค่า AUTH_SECRET และ ADMIN_PASSWORD ใน Vercel ก่อนใช้งาน"
      });
    }
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = null; }
    }
    const password = body && typeof body.password === "string" ? body.password : "";
    if (!password || password.length > 200 || !safeEqual(password, adminPassword)) {
      return res.status(401).json({ ok: false, error: "invalid_admin_password", message: "รหัสผู้ดูแลไม่ถูกต้อง" });
    }
    const session = createAdminSession(secret, 12 * 3600);
    setCookie(res, "pix_admin", session.token, 12 * 3600, req);
    return res.status(200).json({ ok: true, expiresAt: session.payload.exp });
  }

  if (req.method === "DELETE") {
    clearCookie(res, "pix_admin");
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, error: "method_not_allowed" });
};
