/* GET /api/auth/me — current session */
const { parseCookies, verifyToken } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const secret = process.env.AUTH_SECRET;
  const configured = !!secret;
  if (!configured) {
    return res.status(200).json({ configured: false, authed: false, demo: true, user: null });
  }

  const cookies = parseCookies(req.headers && req.headers.cookie);
  const payload = verifyToken(cookies.pix_session, secret);
  if (!payload || payload.role !== "user") {
    return res.status(401).json({ configured: true, authed: false, user: null });
  }

  return res.status(200).json({
    configured: true,
    authed: true,
    user: {
      username: payload.u,
      plan: payload.p,
      expiresAt: payload.lexp || payload.exp
    }
  });
};
