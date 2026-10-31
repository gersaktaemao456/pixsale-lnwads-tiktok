/* PIXSALE — license + session cryptography (Node runtime) */
const crypto = require("crypto");

const LICENSE_PREFIX = "PX1";
const SESSION_PREFIX = "S1";
const ADMIN_PREFIX = "S1";
const ITERATIONS = 120000;
const KEY_BYTES = 32;

function b64u(input) {
  return Buffer.from(input).toString("base64url");
}

function unb64u(value) {
  return Buffer.from(String(value || ""), "base64url");
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a, b) {
  const A = Buffer.from(String(a || ""));
  const B = Buffer.from(String(b || ""));
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

function hashPassword(password, salt, iterations) {
  return crypto.pbkdf2Sync(String(password), salt, iterations || ITERATIONS, KEY_BYTES, "sha256");
}

function createLicense(input, secret) {
  const username = String(input.username || "").trim();
  const password = String(input.password || "");
  const plan = ["starter", "pro", "studio"].includes(input.plan) ? input.plan : "starter";
  const days = Math.max(1, Math.min(3650, Number(input.days) || 30));
  const salt = crypto.randomBytes(16);
  const hash = hashPassword(password, salt, ITERATIONS);
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: 1,
    u: username,
    p: plan,
    exp: now + days * 86400,
    iat: now,
    h: b64u(hash),
    s: b64u(salt),
    i: ITERATIONS
  };
  const body = b64u(JSON.stringify(payload));
  return {
    key: LICENSE_PREFIX + "." + body + "." + sign(body, secret),
    payload: {
      username,
      plan,
      expiresAt: payload.exp,
      issuedAt: payload.iat
    }
  };
}

function verifyLicense(key, password, secret) {
  const parts = String(key || "").trim().split(".");
  if (parts.length !== 3 || parts[0] !== LICENSE_PREFIX) {
    return { ok: false, reason: "invalid_key" };
  }
  if (!safeEqual(parts[2], sign(parts[1], secret))) {
    return { ok: false, reason: "invalid_signature" };
  }
  let payload;
  try {
    payload = JSON.parse(unb64u(parts[1]).toString("utf8"));
  } catch (e) {
    return { ok: false, reason: "invalid_payload" };
  }
  if (!payload || payload.v !== 1 || !payload.u || !payload.exp) {
    return { ok: false, reason: "invalid_payload" };
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }
  let actual;
  try {
    actual = hashPassword(password, unb64u(payload.s), payload.i || ITERATIONS);
  } catch (e) {
    return { ok: false, reason: "invalid_payload" };
  }
  if (!safeEqual(b64u(actual), payload.h)) {
    return { ok: false, reason: "invalid_password" };
  }
  return {
    ok: true,
    user: {
      username: payload.u,
      plan: payload.p,
      expiresAt: payload.exp,
      issuedAt: payload.iat || null
    }
  };
}

function createSession(user, secret, maxAgeSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const exp = Math.min(now + (maxAgeSeconds || 604800), Number(user.expiresAt) || now + 604800);
  const payload = {
    v: 1,
    role: "user",
    u: user.username,
    p: user.plan,
    exp,
    lexp: Number(user.expiresAt) || exp
  };
  const body = b64u(JSON.stringify(payload));
  return { token: SESSION_PREFIX + "." + body + "." + sign(body, secret), payload };
}

function createAdminSession(secret, maxAgeSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { v: 1, role: "admin", exp: now + (maxAgeSeconds || 43200) };
  const body = b64u(JSON.stringify(payload));
  return { token: ADMIN_PREFIX + "." + body + "." + sign(body, secret), payload };
}

function verifyToken(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  if (!safeEqual(parts[2], sign(parts[1], secret))) return null;
  try {
    const payload = JSON.parse(unb64u(parts[1]).toString("utf8"));
    if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  String(header || "").split(";").forEach(function (pair) {
    const idx = pair.indexOf("=");
    if (idx < 0) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function setCookie(res, name, value, maxAge, req) {
  const secure = !!process.env.VERCEL || (req && req.headers && req.headers["x-forwarded-proto"] === "https");
  const parts = [
    name + "=" + value,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=" + maxAge
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
  res.setHeader("Set-Cookie", name + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function getBearer(req) {
  const header = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || "");
  if (header.indexOf("Bearer ") === 0) return header.slice(7).trim();
  return "";
}

function isAdmin(req, secret) {
  if (!secret) return false;
  const cookies = parseCookies(req.headers && req.headers.cookie);
  const payload = verifyToken(cookies.pix_admin || getBearer(req), secret);
  return !!(payload && payload.role === "admin");
}

function isUser(req, secret) {
  if (!secret) return false;
  const cookies = parseCookies(req.headers && req.headers.cookie);
  const payload = verifyToken(cookies.pix_session || getBearer(req), secret);
  return !!(payload && payload.role === "user");
}

module.exports = {
  b64u,
  unb64u,
  sign,
  safeEqual,
  createLicense,
  verifyLicense,
  createSession,
  createAdminSession,
  verifyToken,
  parseCookies,
  setCookie,
  clearCookie,
  isAdmin,
  isUser,
  hashPassword
};
