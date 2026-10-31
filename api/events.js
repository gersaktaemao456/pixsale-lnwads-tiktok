/* Vercel serverless function — TikTok Events API
   The access token is read from TIKTOK_EVENTS_TOKEN and never returned to the client. */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      configured: !!process.env.TIKTOK_EVENTS_TOKEN,
      pixelConfigured: !!process.env.TIKTOK_PIXEL_ID
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  var token = process.env.TIKTOK_EVENTS_TOKEN;
  if (!token) {
    return res.status(503).json({
      ok: false,
      error: "not_configured",
      message: "ยังไม่ได้ตั้งค่า TIKTOK_EVENTS_TOKEN ใน Vercel Environment Variables"
    });
  }

  var body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "invalid_body" });
  }

  var pixelId = String(body.pixelId || process.env.TIKTOK_PIXEL_ID || "").trim();
  if (!/^[A-Z0-9]{10,40}$/i.test(pixelId)) {
    return res.status(400).json({ ok: false, error: "invalid_pixel_id" });
  }

  var allowed = ["PageView", "ClickButton", "InitiateCheckout", "AddToCart", "Purchase", "SubmitForm", "Contact"];
  var eventName = allowed.indexOf(body.event) >= 0 ? body.event : "ClickButton";
  var url = typeof body.url === "string" ? body.url.slice(0, 2000) : "";
  var eventId = typeof body.event_id === "string" ? body.event_id.slice(0, 80) : "evt_" + Date.now();

  var payload = {
    event_source: "web",
    event_source_id: pixelId,
    data: [
      {
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: body.user && typeof body.user === "object" ? body.user : {},
        properties: body.properties && typeof body.properties === "object" ? body.properties : {},
        page: url ? { url: url } : undefined
      }
    ]
  };

  try {
    var upstream = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Access-Token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    var data = await upstream.json().catch(function () { return {}; });
    return res.status(upstream.status).json({
      ok: upstream.ok && data.code === 0,
      code: data.code,
      message: data.message || (upstream.ok ? "ok" : "upstream_error")
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "upstream_unreachable" });
  }
};
