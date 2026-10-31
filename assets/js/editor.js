/* PIXSALE — editor */
(function () {
  "use strict";

  var S = window.PIXStore;
  var U = window.PIXUI;
  var R = window.PIXRender;
  var esc = R.esc;

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("id");
  var page = slug ? S.get(slug) : null;
  if (!page) {
    window.location.replace("/app/");
    return;
  }
  page.seo = page.seo || { title: page.title, description: "" };
  page.theme = page.theme || { accent: "#d91e36", mode: "light", font: "sans" };
  page.stats = page.stats || { views: 0, clicks: 0 };
  page.tracking = page.tracking || { facebookPixelId: "", lineTagId: "", tiktokPixelId: "" };
  page.customCss = page.customCss || "";

  var state = {
    page: page,
    selected: (page.blocks[0] && page.blocks[0].id) || null,
    tab: "content",
    dirty: false,
    localDirty: false,
    saving: false,
    pendingUpload: null,
    oldSlug: page.slug
  };

  var ICON_CHOICES = [
    ["check", "เครื่องหมายถูก"], ["spark", "ประกาย"], ["shield", "โล่"], ["calendar", "ปฏิทิน"],
    ["book", "หนังสือ"], ["chat", "แชต"], ["star", "ดาว"], ["clock", "เวลา"], ["truck", "จัดส่ง"], ["lock", "ปลอดภัย"]
  ];
  var LINK_ICONS = [["tiktok", "TikTok"], ["shop", "ร้านค้า"], ["line", "LINE"], ["youtube", "YouTube"], ["link", "ลิงก์"], ["mail", "อีเมล"]];

  var TYPES = [
    {
      type: "hero", name: "ฮีโร่", icon: "hero",
      defaults: {
        kicker: "ข้อเสนอพิเศษ", title: "หัวข้อหลักของหน้า", titleAccent: "ข้อความเน้น", subtitle: "อธิบายสินค้าและประโยชน์สั้น ๆ",
        badge: "ใหม่", image: "", imageAlt: "", ctaText: "สั่งซื้อตอนนี้", ctaUrl: "#product", trust: ["ส่งไว", "ของแท้"]
      },
      fields: [
        { key: "kicker", label: "ป้ายเล็กเหนือหัวข้อ", type: "text" },
        { key: "title", label: "หัวข้อบรรทัดแรก", type: "textarea", rows: 2 },
        { key: "titleAccent", label: "หัวข้อบรรทัดเน้น", type: "textarea", rows: 2 },
        { key: "subtitle", label: "คำอธิบาย", type: "textarea" },
        { key: "image", label: "รูปหลัก", type: "image" },
        { key: "imageAlt", label: "คำอธิบายรูป (alt)", type: "text" },
        { key: "avatar", label: "แสดงรูปเป็นโปรไฟล์กลม (สำหรับหน้าครีเอเตอร์)", type: "checkbox" },
        { key: "badge", label: "ป้ายบนรูป", type: "text" },
        { key: "ctaText", label: "ข้อความปุ่ม", type: "text" },
        { key: "ctaUrl", label: "ลิงก์ปุ่ม", type: "text", placeholder: "#product หรือ https://" },
        { key: "trust", label: "จุดยืนยัน (บรรทัดละข้อ)", type: "strings" }
      ]
    },
    {
      type: "product", name: "สินค้า", icon: "box",
      defaults: { name: "ชื่อสินค้า", description: "รายละเอียดสินค้า", image: "", price: 590, compareAt: 790, stockLeft: 20, stockTotal: 50, ctaText: "สั่งซื้อตอนนี้", ctaUrl: "#product" },
      fields: [
        { key: "name", label: "ชื่อสินค้า", type: "text" },
        { key: "description", label: "รายละเอียด", type: "textarea" },
        { key: "image", label: "รูปสินค้า", type: "image" },
        { key: "price", label: "ราคาขาย (บาท)", type: "number" },
        { key: "compareAt", label: "ราคาก่อนลด", type: "number" },
        { key: "stockLeft", label: "เหลือกี่ชิ้น", type: "number" },
        { key: "stockTotal", label: "ทั้งหมดกี่ชิ้น", type: "number" },
        { key: "ctaText", label: "ข้อความปุ่ม", type: "text" },
        { key: "ctaUrl", label: "ลิงก์ปุ่ม", type: "text" }
      ]
    },
    {
      type: "benefits", name: "จุดเด่น", icon: "spark",
      defaults: { title: "จุดเด่น", items: [{ icon: "check", title: "จุดเด่นข้อที่หนึ่ง", desc: "อธิบายสั้น ๆ" }] },
      fields: [
        { key: "title", label: "หัวข้อSection", type: "text" },
        { key: "items", label: "รายการ", type: "list", addLabel: "เพิ่มจุดเด่น", itemLabel: "จุดเด่น", fields: [
          { key: "icon", label: "ไอคอน", type: "select", options: ICON_CHOICES },
          { key: "title", label: "หัวข้อ", type: "text" },
          { key: "desc", label: "คำอธิบาย", type: "textarea", rows: 2 }
        ] }
      ]
    },
    {
      type: "gallery", name: "แกลเลอรี", icon: "image",
      defaults: { title: "ภาพสินค้า", images: [{ src: "", alt: "" }] },
      fields: [
        { key: "title", label: "หัวข้อ", type: "text" },
        { key: "images", label: "รูปภาพ", type: "list", addLabel: "เพิ่มรูป", itemLabel: "รูป", fields: [
          { key: "src", label: "รูป", type: "image" },
          { key: "alt", label: "คำอธิบายรูป", type: "text" }
        ] }
      ]
    },
    {
      type: "reviews", name: "รีวิว", icon: "star",
      defaults: { title: "รีวิวจากลูกค้า", rating: 5, count: 1, items: [{ name: "ลูกค้า", text: "รีวิว", rating: 5, avatar: "", verified: true }] },
      fields: [
        { key: "title", label: "หัวข้อ", type: "text" },
        { key: "rating", label: "คะแนนเฉลี่ย", type: "number", step: "0.1" },
        { key: "count", label: "จำนวนรีวิว", type: "number" },
        { key: "items", label: "รีวิว", type: "list", addLabel: "เพิ่มรีวิว", itemLabel: "รีวิว", fields: [
          { key: "name", label: "ชื่อลูกค้า", type: "text" },
          { key: "text", label: "ข้อความรีวิว", type: "textarea", rows: 2 },
          { key: "rating", label: "ดาว (1-5)", type: "number" },
          { key: "avatar", label: "รูปโปรไฟล์", type: "image" },
          { key: "verified", label: "ยืนยันว่าซื้อจริง", type: "checkbox" }
        ] }
      ]
    },
    {
      type: "countdown", name: "นับถอยหลัง", icon: "clock",
      defaults: { title: "ข้อเสนอจำกัดเวลา", subtitle: "ราคานี้ใช้ได้ถึงเวลาที่กำหนด", endsAt: "2026-12-31T23:59:00+07:00" },
      fields: [
        { key: "title", label: "หัวข้อ", type: "text" },
        { key: "subtitle", label: "คำอธิบาย", type: "text" },
        { key: "endsAt", label: "สิ้นสุดเวลา", type: "datetime" }
      ]
    },
    {
      type: "faq", name: "คำถาม", icon: "help",
      defaults: { title: "คำถามที่พบบ่อย", items: [{ q: "คำถาม", a: "คำตอบ" }] },
      fields: [
        { key: "title", label: "หัวข้อ", type: "text" },
        { key: "items", label: "รายการคำถาม", type: "list", addLabel: "เพิ่มคำถาม", itemLabel: "คำถาม", fields: [
          { key: "q", label: "คำถาม", type: "text" },
          { key: "a", label: "คำตอบ", type: "textarea", rows: 2 }
        ] }
      ]
    },
    {
      type: "links", name: "ลิงก์", icon: "link",
      defaults: { title: "ลิงก์ทั้งหมด", items: [{ icon: "link", label: "ลิงก์", sub: "", url: "https://" }] },
      fields: [
        { key: "title", label: "หัวข้อ", type: "text" },
        { key: "items", label: "ลิงก์", type: "list", addLabel: "เพิ่มลิงก์", itemLabel: "ลิงก์", fields: [
          { key: "icon", label: "ไอคอน", type: "select", options: LINK_ICONS },
          { key: "label", label: "ชื่อลิงก์", type: "text" },
          { key: "sub", label: "คำอธิบายใต้ชื่อ", type: "text" },
          { key: "url", label: "URL", type: "text", placeholder: "https://" }
        ] }
      ]
    },
    {
      type: "cta", name: "ปิดการขาย", icon: "bolt",
      defaults: { title: "พร้อมสั่งซื้อหรือยัง?", subtitle: "กดปุ่มด้านล่างได้เลย", buttonText: "สั่งซื้อตอนนี้", buttonUrl: "#product", note: "" },
      fields: [
        { key: "title", label: "หัวข้อ", type: "text" },
        { key: "subtitle", label: "คำอธิบาย", type: "textarea", rows: 2 },
        { key: "buttonText", label: "ข้อความปุ่ม", type: "text" },
        { key: "buttonUrl", label: "ลิงก์ปุ่ม", type: "text" },
        { key: "note", label: "หมายเหตุใต้ปุ่ม", type: "text" }
      ]
    },
    {
      type: "footer", name: "ฟุตเตอร์", icon: "layout",
      defaults: { note: "© 2026 แบรนด์ของคุณ", showBadge: true },
      fields: [
        { key: "note", label: "ข้อความลิขสิทธิ์", type: "text" },
        { key: "showBadge", label: "แสดงป้าย “สร้างด้วย PIXSALE”", type: "checkbox" }
      ]
    }
  ];

  function typeDef(type) {
    return TYPES.filter(function (t) { return t.type === type; })[0];
  }

  function blockIndex(id) {
    for (var i = 0; i < state.page.blocks.length; i++) {
      if (state.page.blocks[i].id === id) return i;
    }
    return -1;
  }

  function selectedBlock() {
    var i = blockIndex(state.selected);
    return i >= 0 ? state.page.blocks[i] : null;
  }

  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  function setPath(obj, path, value) {
    var keys = path.split(".");
    var cur = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var k = keys[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[keys[keys.length - 1]] = value;
  }

  // ---------- block list ----------
  function renderPalette() {
    document.getElementById("palette").innerHTML = TYPES.map(function (t) {
      return '<button type="button" data-add="' + t.type + '">' + U.icon(t.icon) + "<span>" + t.name + '</span><span class="plus">+</span></button>';
    }).join("");
  }

  function renderBlockList() {
    var host = document.getElementById("blockList");
    host.innerHTML = state.page.blocks.map(function (b, i) {
      var def = typeDef(b.type) || { name: b.type, icon: "layout" };
      return '<div class="block-item ' + (b.id === state.selected ? "sel" : "") + '" data-block="' + esc(b.id) + '" role="button" tabindex="0">' +
        '<span class="drag" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="ico">' + U.icon(def.icon) + "</span>" +
        "<span><span class=\"nm\">" + esc(blockLabel(b)) + "</span><span class=\"ty\">" + esc(def.name) + "</span></span>" +
        '<span class="handle">' +
          '<button type="button" data-move="up" data-i="' + i + '" aria-label="เลื่อนขึ้น"' + (i === 0 ? " disabled" : "") + ">" + U.icon("up") + "</button>" +
          '<button type="button" data-move="down" data-i="' + i + '" aria-label="เลื่อนลง"' + (i === state.page.blocks.length - 1 ? " disabled" : "") + ">" + U.icon("down") + "</button>" +
        "</span>" +
      "</div>";
    }).join("");
    document.getElementById("blockCount").textContent = state.page.blocks.length + " บล็อก";
  }

  function blockLabel(b) {
    var p = b.props || {};
    var v = p.title || p.name || p.label || p.text || p.note;
    if (Array.isArray(v)) v = v[0];
    var def = typeDef(b.type);
    if (v) return String(v).slice(0, 40);
    return def ? def.name : b.type;
  }

  // ---------- fields ----------
  function fieldHTML(f, value, path) {
    var id = "f_" + Math.random().toString(36).slice(2, 8);
    var label = '<label for="' + id + '">' + esc(f.label) + "</label>";
    var v = value == null ? "" : value;

    if (f.type === "textarea") {
      return '<div class="field">' + label + '<textarea class="textarea" id="' + id + '" data-path="' + esc(path) + '" rows="' + (f.rows || 3) + '">' + esc(v) + "</textarea></div>";
    }
    if (f.type === "number") {
      return '<div class="field">' + label + '<input class="input" id="' + id + '" type="number" min="0" step="' + (f.step || "1") + '" data-path="' + esc(path) + '" data-type="number" value="' + esc(v) + '"></div>';
    }
    if (f.type === "checkbox") {
      return '<label class="checkline"><input type="checkbox" data-path="' + esc(path) + '" data-type="checkbox"' + (v ? " checked" : "") + "> " + esc(f.label) + "</label>";
    }
    if (f.type === "select") {
      return '<div class="field">' + label + '<select class="select" id="' + id + '" data-path="' + esc(path) + '">' +
        f.options.map(function (o) {
          return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? " selected" : "") + ">" + esc(o[1]) + "</option>";
        }).join("") + "</select></div>";
    }
    if (f.type === "strings") {
      var lines = Array.isArray(v) ? v.join("\n") : String(v || "");
      return '<div class="field">' + label + '<textarea class="textarea" id="' + id + '" data-path="' + esc(path) + '" data-type="strings" rows="3" placeholder="หนึ่งบรรทัดต่อหนึ่งข้อ">' + esc(lines) + "</textarea></div>";
    }
    if (f.type === "image") {
      return '<div class="field">' + label +
        '<div class="img-field">' +
          '<span class="thumb">' + (v ? '<img src="' + esc(v) + '" alt="">' : U.icon("image")) + "</span>" +
          '<div class="img-inputs">' +
            '<input class="input" id="' + id + '" data-path="' + esc(path) + '" value="' + esc(v) + '" placeholder="/assets/img/... หรือ https://">' +
            '<button type="button" class="btn btn-ghost btn-sm" data-upload="' + esc(path) + '">อัปโหลด</button>' +
          "</div>" +
        "</div>" +
        '<span class="hint">' + (S.github() ? "อัปโหลดจะเก็บไว้ที่ assets/uploads ใน repo" : "ยังไม่เชื่อม GitHub — รูปจะถูกฝังในไฟล์ (ควรใช้ URL ถ้าเป็นไปได้)") + "</span>" +
      "</div>";
    }
    if (f.type === "datetime") {
      var local = "";
      if (v) {
        var d = new Date(v);
        if (!isNaN(d.getTime())) {
          var pad = function (n) { return String(n).padStart(2, "0"); };
          local = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
        }
      }
      return '<div class="field">' + label + '<input class="input" id="' + id + '" type="datetime-local" data-path="' + esc(path) + '" data-type="datetime" value="' + esc(local) + '"></div>';
    }
    if (f.type === "list") {
      var items = Array.isArray(v) ? v : [];
      return '<div class="list-field">' +
        '<div class="list-head"><span class="label">' + esc(f.label) + '</span><button type="button" class="mini-btn" data-add-item="' + esc(path) + '">+ ' + esc(f.addLabel || "เพิ่ม") + "</button></div>" +
        '<div class="list-items">' + items.map(function (item, i) {
          return '<div class="list-item">' +
            '<div class="list-item-head"><span>' + esc(f.itemLabel || "รายการ") + " " + (i + 1) + '</span><button type="button" data-remove-item="' + esc(path) + '" data-index="' + i + '" aria-label="ลบรายการ">' + U.icon("close") + "</button></div>" +
            f.fields.map(function (sub) {
              return fieldHTML(sub, item[sub.key], path + "." + i + "." + sub.key);
            }).join("") +
          "</div>";
        }).join("") + "</div>" +
        (items.length ? "" : '<p class="hint" style="margin-top:8px">ยังไม่มีรายการ — กด “' + esc(f.addLabel || "เพิ่ม") + "”</p>") +
      "</div>";
    }
    return '<div class="field">' + label + '<input class="input" id="' + id + '" data-path="' + esc(path) + '" value="' + esc(v) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + "></div>";
  }

  function renderBlockForm() {
    var host = document.getElementById("blockForm");
    var b = selectedBlock();
    if (!b) {
      host.innerHTML = '<div class="block-empty">' +
        '<p style="margin-bottom:14px">เลือกบล็อกทางซ้ายเพื่อแก้ไข<br>หรือเพิ่มบล็อกใหม่จากรายการด้านบน</p>' +
        "</div>";
      return;
    }
    var def = typeDef(b.type);
    if (!def) {
      host.innerHTML = '<div class="block-empty">ไม่รู้จักบล็อกประเภทนี้ (' + esc(b.type) + ")</div>";
      return;
    }
    var fields = def.fields.map(function (f) {
      return fieldHTML(f, getPath(b.props, f.key), "blocks." + blockIndex(b.id) + ".props." + f.key);
    }).join("");

    host.innerHTML =
      '<div class="form-section">' +
        '<div class="fs-head"><h3>' + esc(def.name) + '</h3><span class="badge">' + esc(b.type) + "</span></div>" +
        fields +
      "</div>" +
      '<div class="form-section">' +
        '<div class="fs-head"><h3>จัดการบล็อก</h3></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn btn-ghost btn-sm" data-block-action="duplicate">ทำสำเนา</button>' +
          '<button class="btn btn-ghost btn-sm" data-block-action="down">เลื่อนลง</button>' +
          '<button class="btn btn-ghost btn-sm" data-block-action="delete" style="color:var(--err);border-color:#e2b4ae">ลบบล็อก</button>' +
        "</div>" +
      "</div>";
  }

  // ---------- settings tabs ----------
  function renderTheme() {
    var sw = ["#d91e36", "#111114", "#b07a3c", "#1f5e8f", "#1c7a4c", "#7a4bb3"];
    document.getElementById("accentSwatches").innerHTML = sw.map(function (c) {
      return '<button type="button" class="swatch' + (state.page.theme.accent.toLowerCase() === c ? " sel" : "") + '" style="background:' + c + '" data-accent="' + c + '" aria-label="สี ' + c + '"></button>';
    }).join("");
    document.getElementById("accentCustom").value = state.page.theme.accent;
    document.getElementById("accentHex").value = state.page.theme.accent;
    document.getElementById("brandInput").value = state.page.brand || "";
    U.qsa("#modeSeg button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-mode") === state.page.theme.mode); });
  }

  function renderSEO() {
    document.getElementById("seoTitle").value = (state.page.seo && state.page.seo.title) || "";
    document.getElementById("seoDesc").value = (state.page.seo && state.page.seo.description) || "";
    updateSerp();
  }

  function updateSerp() {
    var t = document.getElementById("seoTitle").value || state.page.title;
    var d = document.getElementById("seoDesc").value || "คำอธิบายหน้า";
    document.getElementById("serpTitle").textContent = t;
    document.getElementById("serpDesc").textContent = d;
    document.getElementById("serpUrl").textContent = "pixsale.app/p/?id=" + state.page.slug;
  }

  function renderPageTab() {
    document.getElementById("slugInput").value = state.page.slug;
    document.getElementById("fullUrl").value = new URL("/p/?id=" + encodeURIComponent(state.page.slug), window.location.href).href;
    document.getElementById("publishToggle").checked = state.page.status === "published";
    document.getElementById("publishToggle2").checked = state.page.status === "published";
    var created = new Date(state.page.createdAt);
    var updated = new Date(state.page.updatedAt);
    document.getElementById("pageMeta").innerHTML =
      "สร้างเมื่อ " + esc(created.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })) +
      "<br>แก้ไขล่าสุด " + esc(updated.toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) +
      "<br>บล็อก " + state.page.blocks.length + " รายการ · " + S.fmtNum(state.page.stats.views) + " เข้าชม";
  }

  function renderTrack() {
    document.getElementById("fbPixel").value = page.tracking.facebookPixelId || "";
    document.getElementById("lineTag").value = page.tracking.lineTagId || "";
    document.getElementById("ttPixel").value = page.tracking.tiktokPixelId || "";
    var secret = window.PIXTrack.getSecret(page.slug);
    document.getElementById("ttToken").value = secret.tiktokEventsToken || "";
    document.getElementById("customCss").value = page.customCss || "";
    updateCssCount();
  }

  function updateCssCount() {
    var n = (document.getElementById("customCss").value || "").length;
    document.getElementById("cssCount").textContent = n.toLocaleString("th-TH") + " ตัวอักษร";
  }

  function renderHeader() {
    document.getElementById("titleInput").value = state.page.title;
    var tag = document.getElementById("statusTag");
    tag.innerHTML = state.page.status === "published"
      ? '<span class="dot" style="background:var(--ok)"></span>เผยแพร่'
      : '<span class="dot"></span>ฉบับร่าง';
    document.getElementById("pubLabel").textContent = state.page.status === "published" ? "เผยแพร่แล้ว" : "เผยแพร่";
    var view = document.getElementById("viewBtn");
    view.href = "/p/?id=" + encodeURIComponent(state.page.slug) + (state.page.status === "published" ? "" : "&preview=1");
  }

  function renderAll() {
    renderBlockList();
    renderBlockForm();
    renderTheme();
    renderSEO();
    renderPageTab();
    renderTrack();
    renderHeader();
    updatePreview(true);
  }

  // ---------- preview ----------
  var previewTimer = null;
  function updatePreview(resetScroll) {
    var root = document.getElementById("previewRoot");
    var scrollTop = root.scrollTop;
    root.innerHTML = R.render(state.page, { preview: true });
    window.PIXTrack.applyCss(state.page);
    R.startCountdowns(root);
    if (!resetScroll) root.scrollTop = scrollTop;

    // share button inside preview is inert
    var share = root.querySelector("[data-share]");
    if (share) share.addEventListener("click", function () {
      U.toast("นี่คือพรีวิว", "เปิดหน้าเว็บจริงเพื่อแชร์ลิงก์", "warn");
    });
  }

  function queuePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () { updatePreview(false); }, 140);
  }

  // ---------- save ----------
  var autosaveTimer = null;
  var saveStateEl = document.getElementById("saveState");

  function markDirty() {
    state.dirty = true;
    state.localDirty = true;
    saveStateEl.className = "save-state dirty";
    saveStateEl.textContent = "มีการแก้ไข";
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () { localSave(); }, 900);
  }

  function localSave() {
    if (!state.dirty) return Promise.resolve();
    return S.save(state.page, { remote: false }).then(function () {
      state.localDirty = false;
      if (state.saving) return;
      saveStateEl.className = "save-state";
      var now = new Date();
      saveStateEl.textContent = (S.github() ? "บันทึกในเครื่อง · " : "บันทึกแล้ว · ") + U.timeShort(now);
    });
  }

  function explicitSave() {
    if (state.saving) return Promise.resolve();
    clearTimeout(autosaveTimer);
    state.saving = true;
    saveStateEl.className = "save-state saving";
    saveStateEl.textContent = "กำลังบันทึก…";
    return S.save(state.page, { remote: true }).then(function (res) {
      state.saving = false;
      state.dirty = false;
      state.localDirty = false;
      saveStateEl.className = "save-state";
      saveStateEl.textContent = res.remote ? "ซิงก์ GitHub แล้ว · " + U.timeShort(new Date()) : "บันทึกในเครื่องแล้ว · " + U.timeShort(new Date());
      if (res.remote) U.toast("บันทึกลง GitHub แล้ว", "commit: " + (res.remoteResult.commit || "").slice(0, 7), "ok");
      else U.toast("บันทึกในเครื่องแล้ว", "เชื่อม GitHub เพื่อเก็บข้อมูลถาวรนอกเครื่องนี้", "warn");
      renderPageTab();
      return res;
    }).catch(function (err) {
      state.saving = false;
      saveStateEl.className = "save-state dirty";
      saveStateEl.textContent = "ซิงก์ไม่สำเร็จ";
      U.toast("บันทึกไม่สำเร็จ", window.PIXGH.friendly(err), "err");
      throw err;
    });
  }

  // ---------- block operations ----------
  function addBlock(type, index) {
    var def = typeDef(type);
    if (!def) return;
    var block = { id: S.uid(type), type: type, props: S.clone(def.defaults) };
    if (typeof index === "number") state.page.blocks.splice(index, 0, block);
    else state.page.blocks.push(block);
    state.selected = block.id;
    markDirty();
    renderBlockList();
    renderBlockForm();
    renderPageTab();
    queuePreview();
    switchTab("content");
    if (window.innerWidth <= 860) switchMobile("settings");
    U.toast("เพิ่มบล็อกแล้ว", def.name, "ok");
  }

  function moveBlock(i, dir) {
    var j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= state.page.blocks.length) return;
    var tmp = state.page.blocks[i];
    state.page.blocks[i] = state.page.blocks[j];
    state.page.blocks[j] = tmp;
    markDirty();
    renderBlockList();
    renderBlockForm();
    queuePreview();
  }

  function duplicateBlock() {
    var b = selectedBlock();
    if (!b) return;
    var copy = S.clone(b);
    copy.id = S.uid(b.type);
    var i = blockIndex(b.id);
    state.page.blocks.splice(i + 1, 0, copy);
    state.selected = copy.id;
    markDirty();
    renderBlockList();
    renderBlockForm();
    queuePreview();
    U.toast("ทำสำเนาบล็อกแล้ว", "", "ok");
  }

  function deleteBlock() {
    var b = selectedBlock();
    if (!b) return;
    U.confirm({ title: "ลบบล็อกนี้?", message: "บล็อกจะหายจากหน้า — บันทึกแล้วกู้คืนไม่ได้", confirmText: "ลบบล็อก", danger: true }).then(function (ok) {
      if (!ok) return;
      var i = blockIndex(b.id);
      state.page.blocks.splice(i, 1);
      state.selected = state.page.blocks[Math.min(i, state.page.blocks.length - 1)] ? state.page.blocks[Math.min(i, state.page.blocks.length - 1)].id : null;
      markDirty();
      renderBlockList();
      renderBlockForm();
      queuePreview();
    });
  }

  // ---------- events ----------
  document.getElementById("palette").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var idx = blockIndex(state.selected);
    addBlock(b.getAttribute("data-add"), idx >= 0 ? idx + 1 : undefined);
  });

  document.getElementById("blockList").addEventListener("click", function (e) {
    var move = e.target.closest("[data-move]");
    if (move) {
      e.stopPropagation();
      moveBlock(Number(move.getAttribute("data-i")), move.getAttribute("data-move"));
      return;
    }
    var item = e.target.closest("[data-block]");
    if (!item) return;
    state.selected = item.getAttribute("data-block");
    renderBlockList();
    renderBlockForm();
    switchTab("content");
    if (window.innerWidth <= 860) switchMobile("settings");
  });

  document.getElementById("blockList").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var item = e.target.closest("[data-block]");
      if (item) { e.preventDefault(); item.click(); }
    }
  });

  // inputs inside settings
  var settingsPane = document.querySelector(".settings-pane");
  settingsPane.addEventListener("input", function (e) {
    var el = e.target.closest("[data-path]");
    if (!el) return;
    var path = el.getAttribute("data-path");
    var type = el.getAttribute("data-type");
    var value = el.value;
    if (type === "checkbox") value = el.checked;
    else if (type === "number") value = Number(value || 0);
    else if (type === "strings") value = value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    else if (type === "datetime") value = value ? new Date(value).toISOString() : "";
    setPath(state.page, path, value);

    if (path === "title") renderHeader();
    if (path.indexOf("seo.") === 0) updateSerp();
    if (path === "theme.accent") {
      document.querySelectorAll("#accentSwatches .swatch").forEach(function (s) {
        s.classList.toggle("sel", s.getAttribute("data-accent") === value);
      });
      document.getElementById("accentCustom").value = value;
      document.getElementById("accentHex").value = value;
    }
    markDirty();
    queuePreview();
  });

  settingsPane.addEventListener("change", function (e) {
    var el = e.target.closest("[data-path]");
    if (el && el.getAttribute("data-type") === "checkbox") {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (el && el.type === "color") {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (el && el.getAttribute("data-type") === "datetime") {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  // add / remove list items
  settingsPane.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add-item]");
    if (add) {
      var path = add.getAttribute("data-add-item");
      var arr = getPath(state.page, path);
      if (!Array.isArray(arr)) return;
      var f = findListField(path);
      var item = {};
      if (f) f.fields.forEach(function (sub) { item[sub.key] = sub.type === "checkbox" ? false : ""; });
      arr.push(item);
      markDirty();
      renderBlockForm();
      queuePreview();
      return;
    }
    var rem = e.target.closest("[data-remove-item]");
    if (rem) {
      var rpath = rem.getAttribute("data-remove-item");
      var idx = Number(rem.getAttribute("data-index"));
      var list = getPath(state.page, rpath);
      if (Array.isArray(list)) list.splice(idx, 1);
      markDirty();
      renderBlockForm();
      queuePreview();
      return;
    }
    var act = e.target.closest("[data-block-action]");
    if (act) {
      var a = act.getAttribute("data-block-action");
      if (a === "duplicate") duplicateBlock();
      if (a === "delete") deleteBlock();
      if (a === "down") {
        var i = blockIndex(state.selected);
        moveBlock(i, "down");
      }
    }
    var upload = e.target.closest("[data-upload]");
    if (upload) {
      state.pendingUpload = upload.getAttribute("data-upload");
      document.getElementById("imagePicker").click();
    }
  });

  function findListField(path) {
    var b = selectedBlock();
    if (!b) return null;
    var def = typeDef(b.type);
    if (!def) return null;
    var key = path.split(".").pop();
    return def.fields.filter(function (f) { return f.key === key && f.type === "list"; })[0] || null;
  }

  // image picker
  document.getElementById("imagePicker").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    var path = state.pendingUpload;
    e.target.value = "";
    if (!file || !path) return;
    saveStateEl.textContent = "กำลังอัปโหลดรูป…";
    saveStateEl.className = "save-state saving";
    S.uploadImage(file, state.page.slug).then(function (res) {
      var val = res.remote ? res.url : res.url;
      setPath(state.page, path, val);
      markDirty();
      renderBlockForm();
      queuePreview();
      U.toast(res.remote ? "อัปโหลดขึ้น GitHub แล้ว" : "เพิ่มรูปในเครื่องแล้ว", res.remote ? "assets/uploads" : "รูปจะถูกฝังในไฟล์ JSON", res.remote ? "ok" : "warn");
    }).catch(function (err) {
      U.toast("อัปโหลดไม่สำเร็จ", err.message, "err");
      saveStateEl.textContent = "บันทึกไม่สำเร็จ";
    });
  });

  // theme controls
  document.getElementById("accentSwatches").addEventListener("click", function (e) {
    var b = e.target.closest("[data-accent]");
    if (!b) return;
    state.page.theme.accent = b.getAttribute("data-accent");
    markDirty();
    renderTheme();
    queuePreview();
  });
  document.getElementById("accentCustom").addEventListener("input", function (e) {
    state.page.theme.accent = e.target.value;
    document.getElementById("accentHex").value = e.target.value;
    markDirty();
    queuePreview();
  });
  document.getElementById("accentHex").addEventListener("input", function (e) {
    var v = e.target.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      state.page.theme.accent = v;
      document.getElementById("accentCustom").value = v;
      markDirty();
      queuePreview();
    }
  });
  document.getElementById("modeSeg").addEventListener("click", function (e) {
    var b = e.target.closest("[data-mode]");
    if (!b) return;
    state.page.theme.mode = b.getAttribute("data-mode");
    markDirty();
    renderTheme();
    queuePreview();
  });
  document.getElementById("brandInput").addEventListener("input", function (e) {
    state.page.brand = e.target.value;
    markDirty();
    queuePreview();
  });

  // SEO
  document.getElementById("seoTitle").addEventListener("input", function (e) {
    state.page.seo.title = e.target.value;
    updateSerp();
    markDirty();
  });
  document.getElementById("seoDesc").addEventListener("input", function (e) {
    state.page.seo.description = e.target.value;
    updateSerp();
    markDirty();
  });

  // ---------- tracking pixels + custom CSS ----------
  [
    ["fbPixel", "facebookPixelId"],
    ["lineTag", "lineTagId"],
    ["ttPixel", "tiktokPixelId"]
  ].forEach(function (pair) {
    document.getElementById(pair[0]).addEventListener("input", function (e) {
      state.page.tracking[pair[1]] = e.target.value.trim();
      markDirty();
    });
  });

  document.getElementById("toggleTrackToken").addEventListener("click", function () {
    var el = document.getElementById("ttToken");
    el.type = el.type === "password" ? "text" : "password";
  });

  document.getElementById("ttToken").addEventListener("input", function (e) {
    var ok = window.PIXTrack.saveSecret(state.page.slug, { tiktokEventsToken: e.target.value.trim() });
    document.getElementById("eventsState").textContent = ok
      ? "บันทึก token ในเครื่องนี้แล้ว (ไม่ซิงก์ GitHub)"
      : "บันทึก token ไม่สำเร็จ — พื้นที่เก็บในเบราว์เซอร์เต็ม";
  });

  document.getElementById("checkEvents").addEventListener("click", function () {
    var btn = this;
    var out = document.getElementById("eventsState");
    btn.disabled = true;
    out.textContent = "กำลังตรวจสอบ…";
    window.PIXTrack.eventsStatus().then(function (s) {
      btn.disabled = false;
      if (s.configured) {
        out.textContent = "พร้อมใช้งาน · พบ TIKTOK_EVENTS_TOKEN บนเซิร์ฟเวอร์";
        out.style.color = "var(--ok)";
      } else {
        out.textContent = "ยังไม่ตั้งค่า · เพิ่ม TIKTOK_EVENTS_TOKEN ใน Vercel แล้ว redeploy";
        out.style.color = "var(--warn)";
      }
    });
  });

  var cssArea = document.getElementById("customCss");
  cssArea.addEventListener("input", function () {
    state.page.customCss = cssArea.value;
    updateCssCount();
    window.PIXTrack.applyCss(state.page);
    markDirty();
  });

  document.querySelector("[data-css-example]").addEventListener("click", function () {
    cssArea.value = ".ps-h1 { letter-spacing: -0.018em; }\n.ps-cta { border-radius: 16px; }\n.ps-hero-media { border-radius: 24px; }";
    cssArea.dispatchEvent(new Event("input", { bubbles: true }));
    cssArea.focus();
  });

  document.querySelector("[data-css-clear]").addEventListener("click", function () {
    cssArea.value = "";
    cssArea.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // title
  document.getElementById("titleInput").addEventListener("input", function (e) {
    state.page.title = e.target.value;
    markDirty();
  });

  // tabs
  function switchTab(name) {
    state.tab = name;
    U.qsa("#editorTabs .tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-tab") === name);
    });
    ["content", "theme", "seo", "track", "page"].forEach(function (n) {
      document.getElementById("tab-" + n).hidden = n !== name;
    });
  }
  document.getElementById("editorTabs").addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab]");
    if (t) switchTab(t.getAttribute("data-tab"));
  });

  // mobile panes
  function switchMobile(name) {
    U.qsa("[data-pane]").forEach(function (p) {
      p.classList.toggle("mobile-active", p.getAttribute("data-pane") === name);
    });
    U.qsa("[data-mobile]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-mobile") === name);
    });
  }
  U.qsa("[data-mobile]").forEach(function (b) {
    b.addEventListener("click", function () { switchMobile(b.getAttribute("data-mobile")); });
  });

  // header actions
  document.getElementById("saveBtn").addEventListener("click", explicitSave);
  document.getElementById("reloadPreview").addEventListener("click", function () { updatePreview(true); });

  function setPublished(on) {
    state.page.status = on ? "published" : "draft";
    markDirty();
    renderHeader();
    renderPageTab();
    explicitSave().then(function () {
      if (!on) return;
      if (S.github()) {
        U.toast("เผยแพร่แล้ว", "เปิดลิงก์หน้าเว็บเพื่อแชร์ให้ลูกค้า", "ok");
      } else {
        U.toast("เผยแพร่ในเครื่องนี้แล้ว", "เชื่อม GitHub และ deploy บน Vercel ก่อนแชร์ลิงก์ให้ลูกค้า", "warn");
      }
    }).catch(function () {
      /* error already surfaced by explicitSave */
    });
  }

  document.getElementById("publishToggle").addEventListener("change", function (e) {
    var on = e.target.checked;
    if (!on) { setPublished(false); return; }
    U.confirm({
      title: "เผยแพร่หน้านี้?",
      message: "หน้า “" + esc(state.page.title) + "” จะพร้อมใช้งานที่ /p/?id=" + esc(state.page.slug),
      confirmText: "เผยแพร่"
    }).then(function (ok) {
      if (!ok) { e.target.checked = false; return; }
      setPublished(true);
    });
  });

  document.getElementById("publishToggle2").addEventListener("change", function (e) {
    document.getElementById("publishToggle").checked = e.target.checked;
    document.getElementById("publishToggle").dispatchEvent(new Event("change"));
  });

  document.getElementById("copyUrl").addEventListener("click", function () {
    U.copy(document.getElementById("fullUrl").value).then(function () {
      U.toast("คัดลอกลิงก์แล้ว", document.getElementById("fullUrl").value, "ok");
    });
  });

  // slug rename
  var slugInput = document.getElementById("slugInput");
  slugInput.addEventListener("change", function () {
    var next = S.slugify(slugInput.value);
    if (!next || next === state.page.slug) { slugInput.value = state.page.slug; return; }
    if (S.get(next)) {
      U.toast("slug นี้ถูกใช้แล้ว", "เลือกชื่ออื่น", "err");
      slugInput.value = state.page.slug;
      return;
    }
    var old = state.page.slug;
    state.page.slug = next;
    state.page.id = next;
    S.rename(old, state.page).then(function () {
      state.oldSlug = next;
      renderPageTab();
      renderHeader();
      U.toast("เปลี่ยนลิงก์แล้ว", "/p/?id=" + next, "ok");
    }).catch(function (err) {
      U.toast("เปลี่ยนลิงก์ไม่สำเร็จ", window.PIXGH.friendly(err), "err");
    });
  });

  document.getElementById("deletePage").addEventListener("click", function () {
    U.confirm({
      title: "ลบเซลเพจนี้?",
      message: "ลบ “" + esc(state.page.title) + "” ออกจากเครื่องและ GitHub (ถ้าเชื่อมไว้) — กู้คืนไม่ได้",
      confirmText: "ลบหน้า",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      S.remove(state.page.slug).then(function () {
        window.location.href = "/app/";
      }).catch(function () {
        window.location.href = "/app/";
      });
    });
  });

  window.addEventListener("beforeunload", function (e) {
    if (!state.localDirty) return;
    e.preventDefault();
    e.returnValue = "";
  });

  // boot
  renderPalette();
  renderAll();
  if (window.innerWidth <= 860) switchMobile("blocks");
})();
