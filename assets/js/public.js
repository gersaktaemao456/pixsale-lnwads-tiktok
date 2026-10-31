/* PIXSALE — public sales page */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("id") || params.get("slug");
  var preview = params.get("preview") === "1";

  if (!slug) {
    var parts = window.location.pathname.split("/").filter(Boolean);
    var last = parts[parts.length - 1] || "";
    if (last && last !== "p" && last !== "index.html" && !/\.html?$/i.test(last)) slug = decodeURIComponent(last);
  }

  var boot = document.getElementById("boot");
  var root = document.getElementById("pageRoot");
  var errorEl = document.getElementById("errorState");

  function showError(code, title, copy) {
    boot.hidden = true;
    root.innerHTML = "";
    errorEl.hidden = false;
    document.getElementById("errCode").textContent = code;
    document.getElementById("errTitle").textContent = title;
    document.getElementById("errCopy").textContent = copy;
    document.title = title + " — PIXSALE";
  }

  function setMeta(page) {
    var seo = page.seo || {};
    var title = seo.title || page.title || "PIXSALE";
    var desc = seo.description || "";
    document.title = title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", desc);
    var ogT = document.querySelector('meta[property="og:title"]');
    if (ogT) ogT.setAttribute("content", title);
    var ogD = document.querySelector('meta[property="og:description"]');
    if (ogD) ogD.setAttribute("content", desc);
    var hero = (page.blocks || []).filter(function (b) { return b.type === "hero"; })[0];
    var img = (hero && hero.props && hero.props.image) || "";
    var ogI = document.querySelector('meta[property="og:image"]');
    if (!ogI) {
      ogI = document.createElement("meta");
      ogI.setAttribute("property", "og:image");
      document.head.appendChild(ogI);
    }
    ogI.setAttribute("content", new URL(img || "/assets/img/og.png", window.location.origin).href);
    var theme = page.theme || {};
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", theme.mode === "dark" ? "#0b0b0c" : "#fbfaf7");
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("on");
    setTimeout(function () { el.classList.remove("on"); }, 2200);
  }

  function bindShare(page) {
    var btn = root.querySelector("[data-share]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var url = window.location.href;
      var title = (page.seo && page.seo.title) || page.title || "PIXSALE";
      if (navigator.share) {
        navigator.share({ title: title, text: title, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { toast("คัดลอกลิงก์แล้ว"); });
      }
    });
  }

  if (!slug) {
    showError("404 / NO PAGE", "ไม่พบหน้านี้", "ลิงก์ไม่ได้ระบุชื่อเซลเพจ — ตรวจสอบลิงก์อีกครั้ง");
    return;
  }

  window.PIXStore.loadPublic(slug).then(function (page) {
    if (!page) {
      showError("404 / NOT FOUND", "ไม่พบหน้านี้", "ลิงก์อาจถูกเปลี่ยนชื่อ หรือหน้านี้ยังไม่ได้สร้างใน PIXSALE Studio");
      return;
    }

    if (page.status !== "published" && !preview) {
      showError("403 / DRAFT", "หน้านี้ยังไม่เผยแพร่", "เจ้าของร้านยังไม่ได้เปิดให้ลูกค้าเข้าชม — หากคุณคือเจ้าของ ให้เปิดจากโหมดพรีวิวใน PIXSALE Studio");
      return;
    }

    if (page.status !== "published" && preview) {
      var bar = document.getElementById("draftBar");
      bar.className = "ps-draft-bar";
      bar.textContent = "พรีวิวฉบับร่าง — ยังไม่เผยแพร่ให้ลูกค้า";
    }

    setMeta(page);
    boot.hidden = true;
    root.innerHTML = window.PIXRender.render(page);
    window.PIXTrack.applyCss(page);
    window.PIXRender.startCountdowns(root);
    window.PIXTrack.init(page);
    bindShare(page);

    // gentle entrance
    var el = root.querySelector(".ps-page");
    if (el) {
      el.style.opacity = "0";
      requestAnimationFrame(function () {
        el.style.transition = "opacity .5s ease";
        el.style.opacity = "1";
      });
    }
  }).catch(function () {
    showError("500 / LOAD FAILED", "โหลดหน้านี้ไม่สำเร็จ", "ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง หากยังไม่หาย ให้เปิดจาก PIXSALE Studio อีกครั้ง");
  });
})();
