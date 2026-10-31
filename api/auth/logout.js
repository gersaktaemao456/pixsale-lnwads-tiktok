/* POST /api/auth/logout */
const { clearCookie } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  clearCookie(res, "pix_session");
  return res.status(200).json({ ok: true });
};
