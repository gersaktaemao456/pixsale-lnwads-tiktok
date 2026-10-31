/* POST /api/auth/login — license key + password → session cookie */
const { verifyLicense, createSession, setCookie } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return res.status(503).json({
      ok: false,
      error: "not_configured",
      message: "ระบบสมาชิกยังไม่เปิดใช้งาน — ต้องตั้งค่า AUTH_SECRET ใน Vercel ก่อน"
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "invalid_body" });
  }

  const key = String(body.key || "").trim();
  const password = String(body.password || "");
  if (!key || key.length > 4096 || !password || password.length > 200) {
    return res.status(400).json({ ok: false, error: "missing_credentials", message: "กรอก key และ password ให้ครบ" });
  }

  const result = verifyLicense(key, password, secret);
  if (!result.ok) {
    const messages = {
      invalid_key: "รูปแบบ key ไม่ถูกต้อง",
      invalid_signature: "key ไม่ถูกต้องหรือถูกแก้ไข",
      invalid_payload: "key เสียหาย",
      expired: "สิทธิ์นี้หมดอายุแล้ว",
      invalid_password: "password ไม่ถูกต้อง"
    };
    return res.status(401).json({
      ok: false,
      error: result.reason,
      message: messages[result.reason] || "เข้าสู่ระบบไม่สำเร็จ"
    });
  }

  const session = createSession(result.user, secret, 7 * 24 * 3600);
  setCookie(res, "pix_session", session.token, 7 * 24 * 3600, req);

  return res.status(200).json({
    ok: true,
    user: {
      username: result.user.username,
      plan: result.user.plan,
      expiresAt: result.user.expiresAt
    },
    sessionExpiresAt: session.payload.exp
  });
};
