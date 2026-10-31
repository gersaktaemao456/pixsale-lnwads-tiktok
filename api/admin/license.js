/* POST /api/admin/license — issue a signed user licence */
const crypto = require("crypto");
const { isAdmin, createLicense } = require("../../lib/auth");

const PLANS = ["starter", "pro", "studio"];
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function randomFrom(alphabet, length) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function generatePassword(length) {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  let out = randomFrom(upper, 1) + randomFrom(lower, 3) + randomFrom(digits, 2) + randomFrom(all, length - 6);
  return out.split("").sort(function () { return Math.random() - 0.5; }).join("");
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return res.status(503).json({ ok: false, error: "not_configured", message: "ยังไม่ได้ตั้งค่า AUTH_SECRET" });
  }
  if (!isAdmin(req, secret)) {
    return res.status(401).json({ ok: false, error: "unauthorized", message: "ต้องเข้าสู่ระบบผู้ดูแลก่อน" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  body = body && typeof body === "object" ? body : {};

  const plan = PLANS.indexOf(body.plan) >= 0 ? body.plan : "starter";
  const days = Math.max(1, Math.min(3650, Number(body.days) || 30));
  let username = String(body.username || "").trim().toLowerCase();
  let password = String(body.password || "");

  if (username && !/^[a-z0-9][a-z0-9-]{3,31}$/.test(username)) {
    return res.status(400).json({ ok: false, error: "invalid_username", message: "username ใช้ a-z, 0-9, - ความยาว 4-32 ตัว" });
  }
  if (!username) username = "pix-" + randomFrom(ALPHABET, 6);
  if (password && password.length < 8) {
    return res.status(400).json({ ok: false, error: "weak_password", message: "password ต้องมีอย่างน้อย 8 ตัวอักษร" });
  }
  if (!password) password = generatePassword(12);

  const license = createLicense({ username, password, plan, days }, secret);
  return res.status(200).json({
    ok: true,
    username,
    password,
    licenseKey: license.key,
    plan,
    days,
    expiresAt: license.payload.expiresAt,
    issuedAt: license.payload.issuedAt
  });
};
