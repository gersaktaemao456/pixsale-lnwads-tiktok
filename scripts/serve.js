#!/usr/bin/env node
/* Minimal static server for local preview — no dependencies. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2"
};

const API_ROUTES = {
  "/api/auth/login": "../api/auth/login.js",
  "/api/auth/me": "../api/auth/me.js",
  "/api/auth/logout": "../api/auth/logout.js",
  "/api/admin/session": "../api/admin/session.js",
  "/api/admin/license": "../api/admin/license.js",
  "/api/events": "../api/events.js"
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch (e) {
    return send(res, 400, "Bad request");
  }

  // Clean URL support, mirrors vercel.json rewrites.
  if (/^\/p\/[^/.]+$/.test(urlPath)) urlPath = "/p/index.html";

  // Local API runtime for development and smoke tests.
  if (urlPath.indexOf("/api/") === 0) {
    const route = API_ROUTES[urlPath];
    res.setHeader("Cache-Control", "no-store");
    if (!route) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: false, error: "not_found" }));
    }
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; if (raw.length > 2e6) req.destroy(); });
    req.on("end", async () => {
      let body = null;
      if (raw) {
        try { body = JSON.parse(raw); } catch (e) { body = raw; }
      }
      const handler = require(route);
      const mockReq = { method: req.method, headers: req.headers, body: body };
      const mockRes = {
        statusCode: 200,
        setHeader(k, v) { res.setHeader(k, v); },
        status(code) { res.statusCode = code; return this; },
        json(obj) {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(obj));
          return this;
        }
      };
      try {
        await handler(mockReq, mockRes);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: false, error: "server_error" }));
      }
    });
    return;
  }

  let filePath = path.join(root, urlPath);
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return send(res, 403, "Forbidden");

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        if (!path.extname(filePath)) {
          return fs.readFile(path.join(root, "index.html"), (e2, home) => {
            if (e2) return send(res, 404, "Not found");
            send(res, 200, home, MIME[".html"]);
          });
        }
        return send(res, 404, "Not found: " + urlPath);
      }
      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, MIME[ext] || "application/octet-stream");
    });
  });
});

server.listen(port, host, () => {
  console.log(`PIXSALE dev server → http://${host}:${port}`);
  console.log(`Dashboard        → http://${host}:${port}/app/`);
  console.log(`Demo page        → http://${host}:${port}/p/?id=tiktok-shop-starter-kit`);
});
