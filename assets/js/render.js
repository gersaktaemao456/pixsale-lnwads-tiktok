/* PIXSALE — shared sales page renderer
   Used by the public page and the editor preview, so both stay identical. */
(function () {
  "use strict";

  var ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5Z"/><path d="M8 7h7"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.6-4.4A8 8 0 1 1 21 12Z"/><path d="M8 11h8M8 15h5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
    verified: '<path d="m12 3 2.4 1.8 3-.2 1 2.8 2.6 1.5-.8 3 .8 3-2.6 1.5-1 2.8-3-.2L12 21l-2.4-1.8-3 .2-1-2.8L3 15.1l.8-3-.8-3 2.6-1.5 1-2.8 3 .2L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    truck: '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
    return: '<path d="M4 10h11a4 4 0 0 1 0 8H9"/><path d="m7 6-3 4 3 4"/>',
    tiktok: '<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.6 2.3 2 3.6 4.5 3.8"/>',
    shop: '<path d="M4 8h16l-1.4 11H5.4L4 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    line: '<path d="M21 11.5c0 4.4-4 8-9 8-1 0-2-.1-2.9-.4L5 21l1.1-3.6C4.2 15.9 3 13.8 3 11.5c0-4.4 4-8 9-8s9 3.6 9 8Z"/><path d="M8 10v3M8 10l2.5 3V10M13 13v-3M13 13h2"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || ICONS.check;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function text(v) {
    return esc(v).replace(/\n/g, "<br>");
  }

  function safeUrl(url) {
    var u = String(url || "").trim();
    if (!u) return "#";
    if (/^(https?:|mailto:|tel:)/i.test(u)) return esc(u);
    if (u.charAt(0) === "#" || u.charAt(0) === "/") return esc(u);
    return "#";
  }

  function safeImg(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    if (/^(https?:\/\/|\/|data:image\/)/i.test(u)) return esc(u);
    return "";
  }

  function money(n) {
    var num = Number(n || 0);
    return "฿" + num.toLocaleString("th-TH", { maximumFractionDigits: 0 });
  }

  function stars(rating, cls) {
    var r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    var out = '<span class="ps-stars ' + (cls || "") + '" aria-label="' + r + ' จาก 5 ดาว">';
    for (var i = 0; i < 5; i++) {
      out += '<svg viewBox="0 0 24 24" fill="' + (i < r ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' + ICONS.star + "</svg>";
    }
    return out + "</span>";
  }

  var C = {
    hero: function (p) {
      var media = "";
      if (p.image && p.avatar) {
        media = '<div class="ps-avatar"><img src="' + safeImg(p.image) + '" alt="' + esc(p.imageAlt || p.title || "") + '" loading="eager"></div>';
      } else if (p.image) {
        media = '<div class="ps-hero-media">' + (p.badge ? '<span class="tag">' + esc(p.badge) + "</span>" : "") +
          '<img src="' + safeImg(p.image) + '" alt="' + esc(p.imageAlt || p.title || "") + '" loading="eager">' +
          "</div>";
      }
      var cta = p.ctaText ? '<a class="ps-cta block" href="' + safeUrl(p.ctaUrl) + '">' + esc(p.ctaText) + icon("arrow") + "</a>" : "";
      var trust = (p.trust || []).filter(Boolean).length
        ? '<div class="ps-micro">' + (p.trust || []).filter(Boolean).map(function (t) {
            return "<span>" + icon("check") + esc(t) + "</span>";
          }).join("") + "</div>"
        : "";
      return (p.kicker ? '<span class="ps-kicker">' + esc(p.kicker) + "</span>" : "") +
        '<h1 class="ps-h1">' + text(p.title) + (p.titleAccent ? "<br><b>" + text(p.titleAccent) + "</b>" : "") + "</h1>" +
        (p.subtitle ? '<p class="ps-sub">' + text(p.subtitle) + "</p>" : "") +
        media + cta + trust;
    },

    product: function (p, page) {
      var price = Number(p.price || 0);
      var compare = Number(p.compareAt || 0);
      var off = compare > price ? Math.round((1 - price / compare) * 100) : 0;
      var left = Number(p.stockLeft || 0);
      var total = Number(p.stockTotal || 0);
      var pct = total > 0 ? Math.max(4, Math.min(100, Math.round((left / total) * 100))) : 0;
      return '<div class="ps-product-card" id="product">' +
        (p.image ? '<div class="ps-product-media"><img src="' + safeImg(p.image) + '" alt="' + esc(p.name || "") + '" loading="lazy"></div>' : "") +
        '<div class="ps-product-body">' +
          '<h2 class="ps-product-name">' + esc(p.name || "") + "</h2>" +
          (p.description ? '<p class="ps-product-desc">' + text(p.description) + "</p>" : "") +
          '<div class="ps-price-row"><span class="ps-price">' + money(price) + "</span>" +
            (compare > price ? '<s class="ps-compare">' + money(compare) + "</s>" : "") +
            (off ? '<span class="ps-discount">-' + off + "%</span>" : "") +
          "</div>" +
          (total ? '<div class="ps-stock"><div class="bar"><i style="width:' + pct + '%"></i></div><div class="lbl"><span>เหลือ ' + left + " ชิ้น</span><span>ขายแล้ว " + Math.max(0, total - left) + "</span></div></div>" : "") +
          '<a class="ps-cta" href="' + safeUrl(p.ctaUrl || "#product") + '">' + esc(p.ctaText || "สั่งซื้อตอนนี้") + icon("arrow") + "</a>" +
          '<div class="ps-micro"><span>' + icon("lock") + "ชำระเงินปลอดภัย</span><span>" + icon("truck") + "จัดส่งไว</span></div>" +
        "</div></div>";
    },

    benefits: function (p) {
      return (p.title ? '<h2 class="ps-h2">' + text(p.title) + "</h2>" : "") +
        '<div class="ps-benefits">' + (p.items || []).map(function (it) {
          return '<div class="ps-benefit"><span class="ic">' + icon(it.icon || "check") + "</span><div><h3>" + esc(it.title || "") + "</h3>" +
            (it.desc ? "<p>" + text(it.desc) + "</p>" : "") + "</div></div>";
        }).join("") + "</div>";
    },

    gallery: function (p) {
      var imgs = (p.images || []).filter(function (i) { return i && i.src; });
      if (!imgs.length) return "";
      return (p.title ? '<h2 class="ps-h2">' + text(p.title) + "</h2>" : "") +
        '<div class="ps-gallery">' + imgs.slice(0, 5).map(function (i) {
          return '<figure><img src="' + safeImg(i.src) + '" alt="' + esc(i.alt || "") + '" loading="lazy"></figure>';
        }).join("") + "</div>";
    },

    reviews: function (p) {
      var items = p.items || [];
      return '<div class="ps-reviews-head"><span class="ps-rating-big">' + (Number(p.rating || 0).toFixed(1)) + "</span>" +
        stars(p.rating) +
        '<span style="font-size:11.5px;color:var(--ps-muted)">' + esc(String(p.count || items.length)) + " รีวิว</span></div>" +
        (p.title ? '<h2 class="ps-h2">' + text(p.title) + "</h2>" : "") +
        '<div class="ps-reviews">' + items.map(function (r) {
          return '<article class="ps-review"><div class="top">' +
            (r.avatar ? '<span class="av"><img src="' + safeImg(r.avatar) + '" alt="" loading="lazy"></span>' : "") +
            '<div><div class="nm">' + esc(r.name || "ลูกค้า") + '</div>' +
            (r.verified ? '<span class="vf">' + icon("verified") + "ซื้อจริง</span>" : "") + "</div>" +
            '<span class="st">' + stars(r.rating || 5) + "</span></div>" +
            (r.text ? "<p>" + text(r.text) + "</p>" : "") + "</article>";
        }).join("") + "</div>";
    },

    countdown: function (p) {
      return '<div class="ps-countdown" data-ends="' + esc(p.endsAt || "") + '">' +
        '<div class="t">' + esc(p.title || "ข้อเสนอจำกัดเวลา") + "</div>" +
        (p.subtitle ? '<div class="s">' + esc(p.subtitle) + "</div>" : "") +
        '<div class="ps-clock" aria-live="off">' +
          '<div class="unit"><b data-u="d">00</b><span>วัน</span></div>' +
          '<div class="unit"><b data-u="h">00</b><span>ชั่วโมง</span></div>' +
          '<div class="unit"><b data-u="m">00</b><span>นาที</span></div>' +
          '<div class="unit"><b data-u="s">00</b><span>วินาที</span></div>' +
        "</div></div>";
    },

    faq: function (p) {
      return (p.title ? '<h2 class="ps-h2">' + text(p.title) + "</h2>" : "") +
        '<div class="ps-faq">' + (p.items || []).map(function (it, i) {
          return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(it.q || "") + "</summary><p>" + text(it.a || "") + "</p></details>";
        }).join("") + "</div>";
    },

    links: function (p) {
      return (p.title ? '<h2 class="ps-h2">' + text(p.title) + "</h2>" : "") +
        '<div class="ps-links">' + (p.items || []).map(function (l) {
          return '<a class="ps-link" href="' + safeUrl(l.url) + '" target="_blank" rel="noopener">' +
            '<span class="ic">' + icon(l.icon || "link") + "</span>" +
            "<span>" + esc(l.label || "ลิงก์") + (l.sub ? "<small>" + esc(l.sub) + "</small>" : "") + "</span>" +
            '<span class="ar">' + icon("arrow") + "</span></a>";
        }).join("") + "</div>";
    },

    cta: function (p) {
      return '<div class="ps-final"><h2 class="ps-h2">' + text(p.title || "พร้อมหรือยัง?") + "</h2>" +
        (p.subtitle ? "<p>" + text(p.subtitle) + "</p>" : "") +
        (p.buttonText ? '<a class="ps-cta block" href="' + safeUrl(p.buttonUrl) + '">' + esc(p.buttonText) + icon("arrow") + "</a>" : "") +
        (p.note ? '<div class="ps-micro" style="margin-top:10px"><span>' + icon("lock") + esc(p.note) + "</span></div>" : "") +
        "</div>";
    },

    footer: function (p, page) {
      return '<div class="ps-footer">' +
        (p.showBadge !== false ? '<div class="mk"><img src="/assets/brand/favicon.svg" alt=""> สร้างด้วย PIXSALE</div>' : "") +
        "<div>" + esc(p.note || ("© " + new Date().getFullYear() + " " + (page.brand || ""))) + "</div>" +
        "</div>";
    }
  };

  function render(page, options) {
    options = options || {};
    var blocks = (page && page.blocks) || [];
    var theme = (page && page.theme) || {};
    var accent = theme.accent || "#d91e36";
    var html = '<div class="ps-page' + (options.preview ? " is-preview" : "") + '" data-mode="' + esc(theme.mode || "light") + '" data-font="' + esc(theme.font || "sans") + '" style="--ps-accent:' + esc(accent) + '">';

    html += '<header class="ps-top"><span class="ps-brand">' +
      '<img src="/assets/brand/favicon.svg" alt="">' + esc(page.brand || "PIXSALE") +
      "</span>" +
      '<button class="ps-share" type="button" aria-label="แชร์หน้านี้" data-share>' + icon("share") + "</button></header>";

    html += '<main class="ps-wrap">';
    blocks.forEach(function (block) {
      if (!block || !block.props) return;
      var fn = C[block.type];
      if (!fn) return;
      var inner = fn(block.props, page);
      if (!inner) return;
      html += '<section class="ps-block" data-block-id="' + esc(block.id || "") + '" data-type="' + esc(block.type) + '">' + inner + "</section>";
    });
    html += "</main>";

    var product = blocks.filter(function (b) { return b.type === "product"; })[0];
    if (product && !options.hideSticky) {
      var price = Number(product.props.price || 0);
      var compare = Number(product.props.compareAt || 0);
      html += '<div class="ps-sticky"><div class="pr"><div class="p">' + money(price) + "</div>" +
        (compare > price ? '<div class="c">' + money(compare) + "</div>" : "") + "</div>" +
        '<a class="ps-cta" href="' + safeUrl(product.props.ctaUrl || "#product") + '">' + esc(product.props.ctaText || "สั่งซื้อตอนนี้") + "</a></div>";
    }

    html += "</div>";

    // countdown needs a scope; public.js and editor.js call PIXRender.startCountdowns(el)
    return html;
  }

  function startCountdowns(root) {
    var nodes = (root || document).querySelectorAll(".ps-countdown[data-ends]");
    if (!nodes.length) return;
    function tick() {
      var now = Date.now();
      nodes.forEach(function (node) {
        var end = new Date(node.getAttribute("data-ends")).getTime();
        var diff = Math.max(0, end - now);
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        var set = function (u, v) {
          var el = node.querySelector('[data-u="' + u + '"]');
          if (el) el.textContent = String(v).padStart(2, "0");
        };
        set("d", d); set("h", h); set("m", m); set("s", s);
      });
    }
    tick();
    if (root && root.__pixCountdown) clearInterval(root.__pixCountdown);
    var timer = setInterval(tick, 1000);
    if (root) root.__pixCountdown = timer;
    return timer;
  }

  window.PIXRender = { render: render, icon: icon, esc: esc, money: money, stars: stars, startCountdowns: startCountdowns };
})();
