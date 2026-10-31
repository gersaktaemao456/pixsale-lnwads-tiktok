/* PIXSALE — dashboard */
(function () {
  "use strict";

  var S = window.PIXStore;
  var U = window.PIXUI;
  var esc = window.PIXRender.esc;

  var state = {
    pages: [],
    filter: "all",
    query: "",
    template: "product"
  };

  function withAccent(color) {
    return color || "#d91e36";
  }

  function pageImage(page) {
    var hero = page.blocks.filter(function (b) { return b.type === "hero"; })[0];
    var prod = page.blocks.filter(function (b) { return b.type === "product"; })[0];
    return (hero && hero.props.image) || (prod && prod.props.image) || "";
  }

  function cardHTML(page) {
    var accent = withAccent(page.theme && page.theme.accent);
    var img = pageImage(page);
    var statusTag = page.status === "published"
      ? '<span class="tag tag-ok"><span class="dot"></span>เผยแพร่</span>'
      : '<span class="tag"><span class="dot"></span>ฉบับร่าง</span>';
    return '<article class="page-card" data-slug="' + esc(page.slug) + '">' +
      '<a class="page-thumb" href="/app/editor.html?id=' + encodeURIComponent(page.slug) + '" aria-label="แก้ไข ' + esc(page.title) + '">' +
        '<div class="mini-page">' +
          '<div class="bar w40"></div><div class="bar w70"></div>' +
          '<div class="img">' + (img ? '<img src="' + esc(img) + '" alt="">' : "") + "</div>" +
          '<div class="bar"></div><div class="bar w70"></div>' +
          '<div class="cta" style="background:' + esc(accent) + '"></div>' +
        "</div>" +
      "</a>" +
      '<div class="page-card-body">' +
        '<div class="row">' + statusTag + "</div>" +
        "<h3>" + esc(page.title) + "</h3>" +
        '<span class="slug">/p/?id=' + esc(page.slug) + "</span>" +
      "</div>" +
      '<div class="page-card-foot">' +
        '<span class="meta">' +
          "<span>" + U.icon("eye") + S.fmtNum(page.stats && page.stats.views) + "</span>" +
          "<span>" + U.icon("link") + S.fmtNum(page.stats && page.stats.clicks) + "</span>" +
          "<span>" + esc(S.timeAgo(page.updatedAt)) + "</span>" +
        "</span>" +
        '<a class="icon-btn" style="width:28px;height:28px" href="/app/editor.html?id=' + encodeURIComponent(page.slug) + '" aria-label="แก้ไข">' + U.icon("edit") + "</a>" +
        '<div class="card-menu-wrap">' +
          '<button class="dots-btn" data-menu aria-label="ตัวเลือกเพิ่มเติม">' + U.icon("dots") + "</button>" +
          '<div class="menu">' +
            '<a href="/app/editor.html?id=' + encodeURIComponent(page.slug) + '">' + U.icon("edit") + "แก้ไข</a>" +
            (page.status === "published" ? '<a href="/p/?id=' + encodeURIComponent(page.slug) + '" target="_blank" rel="noopener">' + U.icon("eye") + "เปิดหน้าเว็บ</a>" : "") +
            '<button data-action="copy" data-slug="' + esc(page.slug) + '">' + U.icon("link") + "คัดลอกลิงก์</button>" +
            '<button data-action="duplicate" data-slug="' + esc(page.slug) + '">' + U.icon("copy") + "ทำสำเนา</button>" +
            '<button class="danger" data-action="delete" data-slug="' + esc(page.slug) + '">' + U.icon("trash") + "ลบหน้า</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function visiblePages() {
    var q = state.query.trim().toLowerCase();
    return state.pages.filter(function (p) {
      if (state.filter !== "all" && p.status !== state.filter) return false;
      if (!q) return true;
      return (p.title + " " + p.slug).toLowerCase().indexOf(q) >= 0;
    });
  }

  function render() {
    var list = visiblePages();
    var grid = document.getElementById("pagesGrid");
    var empty = document.getElementById("emptyState");

    grid.innerHTML = list.map(cardHTML).join("");
    grid.style.display = list.length ? "" : "none";
    empty.hidden = list.length > 0;

    if (!list.length) {
      if (state.pages.length === 0) {
        document.getElementById("emptyTitle").textContent = "ยังไม่มีเซลเพจ";
        document.getElementById("emptyCopy").textContent = "เริ่มจากเทมเพลตที่พร้อมขาย หรือสร้างหน้าว่างแล้วเติมเนื้อหาทีหลัง";
      } else {
        document.getElementById("emptyTitle").textContent = "ไม่พบหน้าที่ตรงกับตัวกรอง";
        document.getElementById("emptyCopy").textContent = "ลองเปลี่ยนคำค้นหาหรือเลือกสถานะอื่น";
      }
    }

    var totalViews = state.pages.reduce(function (a, p) { return a + Number((p.stats && p.stats.views) || 0); }, 0);
    var totalClicks = state.pages.reduce(function (a, p) { return a + Number((p.stats && p.stats.clicks) || 0); }, 0);
    var published = state.pages.filter(function (p) { return p.status === "published"; }).length;
    var cvr = totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

    document.getElementById("kpiPages").innerHTML = state.pages.length + ' <small>หน้า</small>';
    document.getElementById("kpiPagesSub").textContent = S.fmtNum(state.pages.length) + " หน้าในเครื่องนี้";
    document.getElementById("kpiLive").innerHTML = published + ' <small>หน้า</small>';
    document.getElementById("kpiLiveSub").textContent = published ? "พร้อมแชร์ให้ลูกค้า" : "ยังไม่มีหน้าเผยแพร่";
    document.getElementById("kpiViews").textContent = totalViews.toLocaleString("th-TH");
    document.getElementById("kpiClicks").textContent = totalClicks.toLocaleString("th-TH");
    document.getElementById("kpiCvr").textContent = cvr + "%";

    document.getElementById("cAll").textContent = state.pages.length;
    document.getElementById("cPub").textContent = published;
    document.getElementById("cDraft").textContent = state.pages.length - published;
    document.getElementById("navCount").textContent = state.pages.length;
  }

  function renderGH() {
    var cfg = S.github();
    var card = document.getElementById("ghCard");
    if (cfg) {
      card.classList.add("on");
      document.getElementById("ghLabel").textContent = "GitHub · เชื่อมต่อแล้ว";
      document.getElementById("ghRepo").textContent = cfg.owner + "/" + cfg.repo;
      card.querySelector("a").textContent = "จัดการการเชื่อมต่อ →";
    } else {
      card.classList.remove("on");
      document.getElementById("ghLabel").textContent = "GitHub";
      document.getElementById("ghRepo").textContent = "ยังไม่เชื่อมต่อ";
      card.querySelector("a").textContent = "เชื่อมต่อ repository →";
    }
  }

  function renderProfile() {
    var p = S.profile();
    document.getElementById("studioName").textContent = p.studio || "PIXSALE Studio";
    document.getElementById("userName").textContent = p.studio || "PIXSALE Studio";
    document.getElementById("userAv").textContent = (p.studio || "P").trim().charAt(0).toUpperCase();
  }

  function renderTemplates() {
    var host = document.getElementById("tplGrid");
    host.innerHTML = window.PIXSeed.templates.map(function (t) {
      var artClass = t.key === "flash" ? "ink" : t.key === "bio" ? "silver" : "";
      return '<button class="tpl" data-tpl="' + esc(t.key) + '">' +
        '<div class="art ' + artClass + '"><span class="a"></span><span class="b"></span><span class="c"></span><span class="d"></span></div>' +
        "<div><h4>" + esc(t.name) + "</h4><p>" + esc(t.desc) + "</p></div>" +
      "</button>";
    }).join("");
  }

  function renderTplPick() {
    var host = document.getElementById("tplPick");
    host.innerHTML = window.PIXSeed.templates.map(function (t) {
      return '<button type="button" data-pick="' + esc(t.key) + '" class="' + (state.template === t.key ? "on" : "") + '">' +
        '<span class="sw"></span>' + esc(t.name) + "</button>";
    }).join("");
  }

  // ---------- create modal ----------
  var modal = document.getElementById("createModal");
  var titleInput = document.getElementById("newTitle");
  var slugInput = document.getElementById("newSlug");
  var slugTouched = false;

  function openCreate(tpl) {
    if (tpl) state.template = tpl;
    renderTplPick();
    document.getElementById("createHint").textContent = "";
    modal.classList.add("open");
    setTimeout(function () { titleInput.focus(); }, 120);
  }

  function closeCreate() {
    modal.classList.remove("open");
    document.getElementById("createForm").reset();
    slugTouched = false;
    document.getElementById("slugPreview").textContent = "/p/?id=glow-serum";
  }

  document.querySelectorAll("[data-open-create]").forEach(function (b) {
    b.addEventListener("click", function () { openCreate(); });
  });
  document.querySelectorAll("[data-close-create]").forEach(function (b) {
    b.addEventListener("click", closeCreate);
  });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeCreate(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeCreate();
  });

  titleInput.addEventListener("input", function () {
    if (slugTouched) return;
    var ascii = titleInput.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim();
    var slug = S.slugify(ascii || "");
    if (ascii) {
      slugInput.value = slug;
      document.getElementById("slugPreview").textContent = "/p/?id=" + slug;
    }
  });

  slugInput.addEventListener("input", function () {
    slugTouched = true;
    var slug = S.slugify(slugInput.value);
    slugInput.value = slug;
    document.getElementById("slugPreview").textContent = "/p/?id=" + slug;
  });

  document.getElementById("tplPick").addEventListener("click", function (e) {
    var b = e.target.closest("[data-pick]");
    if (!b) return;
    state.template = b.getAttribute("data-pick");
    renderTplPick();
  });

  document.getElementById("createForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    var slug = S.slugify(slugInput.value || title);
    if (!title) return;
    if (state.pages.some(function (p) { return p.slug === slug; })) {
      document.getElementById("createHint").textContent = "slug นี้ถูกใช้แล้ว — ลองชื่ออื่น";
      slugInput.focus();
      return;
    }
    var page = window.PIXSeed.create(state.template, title, slug);
    S.save(page, { remote: false }).then(function () {
      window.location.href = "/app/editor.html?id=" + encodeURIComponent(slug);
    });
  });

  // ---------- filters ----------
  document.querySelectorAll("[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.filter = btn.getAttribute("data-filter");
      document.querySelectorAll("[data-filter]").forEach(function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      render();
    });
  });

  document.getElementById("searchInput").addEventListener("input", function (e) {
    state.query = e.target.value;
    render();
  });

  // ---------- card actions ----------
  document.getElementById("pagesGrid").addEventListener("click", function (e) {
    var menuBtn = e.target.closest("[data-menu]");
    if (menuBtn) {
      var wrap = menuBtn.parentElement;
      var isOpen = wrap.querySelector(".menu").classList.contains("open");
      document.querySelectorAll(".menu.open").forEach(function (m) { m.classList.remove("open"); });
      if (!isOpen) wrap.querySelector(".menu").classList.add("open");
      e.stopPropagation();
      return;
    }

    var act = e.target.closest("[data-action]");
    if (!act) return;
    var slug = act.getAttribute("data-slug");
    var action = act.getAttribute("data-action");

    if (action === "copy") {
      var url = new URL("/p/?id=" + encodeURIComponent(slug), window.location.href).href;
      U.copy(url).then(function () { U.toast("คัดลอกลิงก์แล้ว", url, "ok"); })
        .catch(function () { U.toast("คัดลอกไม่สำเร็จ", "คัดลอกลิงก์จากช่องทางอื่นแทน", "err"); });
    }

    if (action === "duplicate") {
      var src = S.get(slug);
      if (!src) return;
      var copy = S.clone(src);
      var n = 2;
      var base = src.slug;
      while (S.get(base + "-" + n)) n++;
      copy.slug = base + "-" + n;
      copy.id = copy.slug;
      copy.title = src.title + " (สำเนา)";
      copy.status = "draft";
      copy.stats = { views: 0, clicks: 0 };
      copy.blocks = copy.blocks.map(function (b) { return { id: S.uid(b.type), type: b.type, props: b.props }; });
      S.save(copy, { remote: false }).then(function () {
        state.pages = S.list();
        render();
        U.toast("สร้างสำเนาแล้ว", copy.title, "ok");
      });
    }

    if (action === "delete") {
      U.confirm({
        title: "ลบเซลเพจนี้?",
        message: "หน้า “" + esc(S.get(slug) ? S.get(slug).title : slug) + "” จะถูกลบออกจากเครื่อง และจาก GitHub หากเชื่อมไว้",
        confirmText: "ลบหน้า",
        danger: true
      }).then(function (ok) {
        if (!ok) return;
        S.remove(slug).then(function () {
          state.pages = S.list();
          render();
          U.toast("ลบแล้ว", "ลบ " + slug, "ok");
        }).catch(function (err) {
          state.pages = S.list();
          render();
          U.toast("ลบในเครื่องแล้ว", "แต่ลบบน GitHub ไม่สำเร็จ: " + window.PIXGH.friendly(err), "warn");
        });
      });
    }
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".menu.open").forEach(function (m) { m.classList.remove("open"); });
  });

  document.getElementById("tplGrid").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tpl]");
    if (!b) return;
    openCreate(b.getAttribute("data-tpl"));
  });

  // ---------- boot ----------
  state.pages = S.list();
  renderProfile();
  renderGH();
  renderTemplates();
  render();

  var d = new Date();
  var dateText = d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("todayLine").textContent = dateText + " · เซลเพจทั้งหมด " + state.pages.length + " หน้า";

  // keep localStorage in sync across tabs
  window.addEventListener("storage", function (e) {
    if (e.key === window.PIX.keys.pages) {
      state.pages = S.list();
      render();
    }
  });
})();
