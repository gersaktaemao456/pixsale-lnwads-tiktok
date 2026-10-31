#!/usr/bin/env node
/* PIXSALE — offline integrity + renderer + GitHub adapter checks. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const passes = [];

function ok(label, detail) {
  passes.push(label + (detail ? " — " + detail : ""));
}
function fail(label, detail) {
  failures.push(label + (detail ? " — " + detail : ""));
}
function must(cond, label, detail) {
  cond ? ok(label, detail) : fail(label, detail);
}
function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const required = [
  "index.html",
  "app/index.html",
  "app/editor.html",
  "app/settings.html",
  "p/index.html",
  "docs/index.html",
  "assets/css/tokens.css",
  "assets/css/site.css",
  "assets/css/app.css",
  "assets/css/page.css",
  "assets/js/config.js",
  "assets/js/github.js",
  "assets/js/seed.js",
  "assets/js/store.js",
  "assets/js/render.js",
  "assets/js/ui.js",
  "assets/js/site.js",
  "assets/js/help.js",
  "assets/js/dashboard.js",
  "assets/js/editor.js",
  "assets/js/settings.js",
  "assets/js/public.js",
  "assets/js/pix-tracking.js",
  "api/events.js",
  "assets/img/og.png",
  "assets/brand/logo.svg",
  "assets/brand/favicon.svg",
  "assets/img/kit.svg",
  "assets/img/serum.svg",
  "vercel.json",
  "README.md",
  "data/site.json"
];

required.forEach((rel) => must(exists(rel), "file exists", rel));

// ---------- JSON data ----------
const pageDir = path.join(root, "data", "pages");
const files = fs.readdirSync(pageDir).filter((f) => f.endsWith(".json"));
must(files.length >= 3, "seed pages present", files.length + " files");

const allowedTypes = new Set(["hero", "product", "benefits", "gallery", "reviews", "countdown", "faq", "links", "cta", "footer"]);
let published = 0;
for (const f of files) {
  let page;
  try {
    page = JSON.parse(fs.readFileSync(path.join(pageDir, f), "utf8"));
  } catch (e) {
    fail("page JSON parses", f + ": " + e.message);
    continue;
  }
  must(page.slug === f.replace(/\.json$/, ""), "slug matches filename", f);
  must(typeof page.title === "string" && page.title.length > 0, "page has title", f);
  must(Array.isArray(page.blocks) && page.blocks.length >= 3, "page has blocks", f + " " + (page.blocks || []).length);
  must(/^#[0-9a-f]{6}$/i.test((page.theme || {}).accent || ""), "theme accent is hex", f);
  must(["light", "dark"].includes((page.theme || {}).mode), "theme mode valid", f);
  if (page.status === "published") published++;
  for (const b of page.blocks || []) {
    if (!allowedTypes.has(b.type)) fail("known block type", f + " → " + b.type);
  }
}
must(published >= 2, "at least two published pages", String(published));

// ---------- renderer in a VM ----------
const sandbox = {
  window: {},
  console,
  TextEncoder,
  TextDecoder,
  btoa,
  atob,
  URL,
  setTimeout,
  clearTimeout
};
vm.createContext(sandbox);
vm.runInContext(read("assets/js/render.js"), sandbox, { filename: "render.js" });
const R = sandbox.window.PIXRender;
must(!!R && typeof R.render === "function", "renderer exposes render()");

const kit = JSON.parse(read("data/pages/tiktok-shop-starter-kit.json"));
const html = R.render(kit);
must(html.includes('class="ps-page'), "renderer outputs page shell");
must(html.includes("ps-product-card"), "product block renders");
must(html.includes("฿690"), "price is formatted");
must(html.includes("ps-countdown"), "countdown block renders");
must(html.includes("ps-sticky"), "sticky buy bar renders");
must(!html.includes("undefined"), "no undefined leaked into markup");

// escaping check
const xss = R.render({
  slug: "xss",
  title: "xss",
  brand: "<script>alert(1)</script>",
  theme: { accent: "#d91e36", mode: "light" },
  blocks: [{ id: "h", type: "hero", props: { title: "<img src=x onerror=alert(1)>", subtitle: "ok" } }]
});
must(!xss.includes("<img src=x onerror"), "user text is HTML-escaped");

// ---------- GitHub adapter with a mocked API ----------
sandbox.window = {};
let lastPutBody = null;
sandbox.fetch = async (url, init) => {
  const href = String(url);
  if (init && init.method === "PUT") {
    lastPutBody = JSON.parse(init.body);
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        content: { path: lastPutBody && "data/pages/a.json", sha: "newsha" },
        commit: { sha: "commit123", html_url: "https://github.com/x/y/commit/commit123" }
      })
    };
  }
  if (/\/repos\/o\/r(\?|$)/.test(href)) {
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        full_name: "o/r", default_branch: "main", private: false,
        permissions: { push: true }, html_url: "https://github.com/o/r"
      })
    };
  }
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ path: "data/pages/a.json", sha: "sha123", size: 10, content: btoa("{}") })
  };
};
vm.runInContext(read("assets/js/github.js"), sandbox, { filename: "github.js" });
const GH = sandbox.window.PIXGH;
must(!!GH, "GitHub adapter loaded");
must(GH.decodeBase64(GH.encodeBase64("ทดสอบ UTF-8")) === "ทดสอบ UTF-8", "base64 round-trips Thai text");
must(GH.rawUrl({ owner: "o", repo: "r", branch: "main" }, "data/site.json") === "https://raw.githubusercontent.com/o/r/main/data/site.json", "raw URL is correct");
must(GH.friendly({ status: 403 }).includes("Contents"), "403 error explains permissions");
must(GH.isMissing({ status: 409, message: "Git Repository is empty." }) === true, "empty repository is treated as a missing file");
must(GH.isMissing({ status: 404 }) === true && GH.isMissing({ status: 500 }) === false, "isMissing only matches 404/empty-409");

const cfg = { owner: "o", repo: "r", branch: "main", token: "t", path: "data" };
const put = await GH.putFile(cfg, "data/pages/a.json", '{"ok":true,"name":"ทดสอบ"}', "test", null, false);
must(put.commit === "commit123", "putFile returns commit SHA");
must(!!lastPutBody && !!lastPutBody.content, "putFile sends a content field");
const sent = JSON.parse(Buffer.from((lastPutBody && lastPutBody.content) || "", "base64").toString("utf8"));
must(sent.ok === true && sent.name === "ทดสอบ", "putFile base64 payload decodes with Thai text");

const test = await GH.test(cfg);
must(test.fullName === "o/r" && test.branch === "main", "test() parses repository response");

// ---------- license / session crypto ----------
const require = createRequire(import.meta.url);
const A = require("../lib/auth.js");
const secret = "check-secret-0123456789";
const licence = A.createLicense({ username: "pix-check01", password: "Abcdef123456", plan: "pro", days: 30 }, secret);
must(licence.key.startsWith("PX1."), "license key has PX1 prefix", String(licence.key.length) + " chars");
must(A.verifyLicense(licence.key, "Abcdef123456", secret).ok, "license verifies with correct password");
must(!A.verifyLicense(licence.key, "wrong-password", secret).ok, "license rejects wrong password");
must(!A.verifyLicense(licence.key.slice(0, -2) + "aa", "Abcdef123456", secret).ok, "license rejects tampering");
const session = A.createSession({ username: "pix-check01", plan: "pro", expiresAt: licence.payload.expiresAt }, secret, 3600);
must(A.verifyToken(session.token, secret).u === "pix-check01", "session token verifies");
must(A.verifyToken(session.token, "other-secret") === null, "session rejects wrong secret");
const adminSession = A.createAdminSession(secret, 3600);
must(A.verifyToken(adminSession.token, secret).role === "admin", "admin session verifies");
must(A.safeEqual("abc", "abc") && !A.safeEqual("abc", "abd"), "constant-time comparison works");

// ---------- text hygiene ----------
const textFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".openclaw" || entry.name === ".vercel") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(html|css|js|json|md)$/.test(entry.name)) textFiles.push(full);
  }
}
walk(root);

const banned = ["TODO", "Lorem ipsum", "\u043f\u0443\u0431\u043b\u0438\u043a", "\u76ee\u524d\u5728", "ap\u00f3s", "\u043a\u0440\u043e\u043c\u0435"]; // unicode escapes keep this file clean
for (const f of textFiles) {
  const text = fs.readFileSync(f, "utf8");
  for (const b of banned) {
    if (text.includes(b)) fail("no placeholder/leaked text", path.relative(root, f) + " → " + b);
  }
}

// local link check
const htmlFiles = textFiles.filter((f) => f.endsWith(".html"));
let broken = 0;
for (const f of htmlFiles) {
  const text = fs.readFileSync(f, "utf8");
  const dir = path.dirname(f);
  const re = /(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) {
    let u = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(u)) continue;
    if (u.startsWith("/")) continue; // root-absolute, checked separately
    u = u.split("#")[0].split("?")[0];
    if (!u) continue;
    const target = path.resolve(dir, u);
    if (!fs.existsSync(target)) {
      broken++;
      fail("local link resolves", path.relative(root, f) + " → " + m[1]);
    }
  }
}
if (!broken) ok("local links resolve", htmlFiles.length + " HTML files");

// absolute asset paths used by the renderer
for (const rel of ["assets/brand/favicon.svg", "assets/img/kit.svg", "assets/img/serum.svg", "assets/img/avatar-1.svg"]) {
  must(exists(rel), "root-absolute asset exists", "/" + rel);
}

// ---------- summary ----------
console.log("PIXSALE checks");
console.log("==============");
passes.forEach((p) => console.log("PASS  " + p));
if (failures.length) {
  console.log("");
  failures.forEach((f) => console.log("FAIL  " + f));
  console.log(`\n${passes.length} passed, ${failures.length} failed`);
  process.exit(1);
}
console.log(`\nAll ${passes.length} checks passed.`);
