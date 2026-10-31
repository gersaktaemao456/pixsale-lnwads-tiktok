/* PIXSALE — tracking pixels + custom CSS
   Loads third-party pixels only on the public page, never in the editor.
   The TikTok Events API token never lives in page JSON. */
(function () {
  "use strict";

  var loaded = { fb: false, tt: false, line: false };

  function sanitizeCss(css) {
    return String(css || "")
      .replace(/<\/?style/gi, "")
      .replace(/</g, "")
      .replace(/>/g, "")
      .replace(/@import/gi, "")
      .replace(/expression\s*\(/gi, "")
      .replace(/javascript:/gi, "")
      .slice(0, 20000);
  }

  function applyCss(page) {
    var el = document.getElementById("pix-custom-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "pix-custom-css";
      document.head.appendChild(el);
    }
    var css = sanitizeCss(page && page.customCss);
    if (!css) {
      el.textContent = "";
      return;
    }
    // Keep custom CSS inside the sales page so it cannot restyle the Studio.
    el.textContent = "@scope (.ps-page) {\n" + css + "\n}";
  }

  function loadFacebook(id) {
    if (loaded.fb || !id) return;
    loaded.fb = true;
    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  function loadTikTok(id) {
    if (loaded.tt || !id) return;
    loaded.tt = true;
    /* eslint-disable */
    (function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      ttq.setAndDefer = function (target, method) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (id) {
        var inst = ttq._i[id] || [];
        for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(inst, ttq.methods[n]);
        return inst;
      };
      ttq.load = function (id, opts) {
        var url = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = opts || {};
        var script = d.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = url + "?sdkid=" + id + "&lib=ttq";
        var first = d.getElementsByTagName("script")[0];
        first.parentNode.insertBefore(script, first);
      };
      ttq.load(id);
      ttq.page();
    })(window, document, "ttq");
    /* eslint-enable */
  }

  function loadLine(id) {
    if (loaded.line || !id) return;
    loaded.line = true;
    /* eslint-disable */
    (function (g, d) {
      g._ltq = g._ltq || [];
      g._lt = g._lt || function () {
        g._ltq.push(arguments);
      };
      var host = location.protocol === "https:" ? "https://d.line-scdn.net" : "http://d.line-cdn.net";
      var s = d.createElement("script");
      s.async = true;
      s.src = host + "/n/line_tag/public/release/v1/lt.js";
      var t = d.getElementsByTagName("script")[0];
      t.parentNode.insertBefore(s, t);
    })(window, document);
    /* eslint-enable */
    window._lt("init", { customerType: "lap", tagId: id });
    window._lt("send", "pv", [id]);
  }

  function sendServerEvent(page, eventName, extra) {
    var t = (page && page.tracking) || {};
    if (!t.tiktokPixelId) return;
    var body = {
      pixelId: t.tiktokPixelId,
      event: eventName || "ClickButton",
      event_id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      url: location.href,
      properties: extra || {}
    };
    try {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  function bindClicks(page) {
    var ctas = document.querySelectorAll(".ps-page .ps-cta, .ps-page .ps-link");
    ctas.forEach(function (el) {
      el.addEventListener("click", function () {
        if (window.fbq) window.fbq("track", "InitiateCheckout");
        if (window.ttq && window.ttq.track) window.ttq.track("ClickButton");
        sendServerEvent(page, "ClickButton");
      });
    });
  }

  function init(page) {
    if (!page) return;
    var t = page.tracking || {};
    if (t.facebookPixelId) loadFacebook(t.facebookPixelId);
    if (t.tiktokPixelId) loadTikTok(t.tiktokPixelId);
    if (t.lineTagId) loadLine(t.lineTagId);
    bindClicks(page);
  }

  function secretKey(slug) {
    return "pixsale.secret." + slug;
  }

  function getSecret(slug) {
    try {
      return JSON.parse(localStorage.getItem(secretKey(slug)) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveSecret(slug, data) {
    try {
      localStorage.setItem(secretKey(slug), JSON.stringify(data || {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function eventsStatus() {
    return fetch("/api/events?status=1", { cache: "no-store" }).then(function (r) {
      return r.json().then(function (data) {
        return { ok: r.ok, configured: !!(data && data.configured) };
      });
    }).catch(function () {
      return { ok: false, configured: false };
    });
  }

  window.PIXTrack = {
    applyCss: applyCss,
    init: init,
    getSecret: getSecret,
    saveSecret: saveSecret,
    eventsStatus: eventsStatus,
    sanitizeCss: sanitizeCss
  };
})();
