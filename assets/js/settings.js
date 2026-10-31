/* PIXSALE — settings */
(function () {
  "use strict";

  var S = window.PIXStore;
  var U = window.PIXUI;
  var GH = window.PIXGH;

  var els = {
    studio: document.getElementById("pStudio"),
    owner: document.getElementById("pOwner"),
    email: document.getElementById("pEmail"),
    line: document.getElementById("pLine"),
    gOwner: document.getElementById("gOwner"),
    gRepo: document.getElementById("gRepo"),
    gBranch: document.getElementById("gBranch"),
    gPath: document.getElementById("gPath"),
    gToken: document.getElementById("gToken"),
    hint: document.getElementById("ghHint"),
    syncInfo: document.getElementById("syncInfo"),
    progress: document.getElementById("syncProgress"),
    localStats: document.getElementById("localStats")
  };

  function loadProfile() {
    var p = S.profile();
    els.studio.value = p.studio || "";
    els.owner.value = p.owner || "";
    els.email.value = p.email || "";
    els.line.value = p.line || "";
    document.getElementById("userName").textContent = p.studio || "PIXSALE Studio";
    document.getElementById("userAv").textContent = (p.studio || "P").charAt(0).toUpperCase();
  }

  function loadGH() {
    var cfg = S.github();
    if (cfg) {
      els.gOwner.value = cfg.owner || "";
      els.gRepo.value = cfg.repo || "";
      els.gBranch.value = cfg.branch || "main";
      els.gPath.value = cfg.path || "data";
      els.gToken.value = cfg.token || "";
    }
    updateGHUI();
  }

  function updateGHUI() {
    var cfg = S.github();
    var card = document.getElementById("ghCard");
    var tag = document.getElementById("ghTag");
    var badge = document.getElementById("connBadge");
    var on = !!cfg;

    document.getElementById("pushAll").disabled = !on;
    document.getElementById("pullAll").disabled = !on;

    if (on) {
      card.classList.add("on");
      document.getElementById("ghLabel").textContent = "GitHub · เชื่อมต่อแล้ว";
      document.getElementById("ghRepo").textContent = cfg.owner + "/" + cfg.repo;
      document.getElementById("connTitle").textContent = cfg.owner + "/" + cfg.repo;
      document.getElementById("connSub").textContent = "branch " + cfg.branch + " · path " + cfg.path;
      tag.className = "tag tag-ok";
      tag.innerHTML = '<span class="dot"></span>เชื่อมต่อแล้ว';
      badge.textContent = "connected";
      badge.className = "tag tag-ok";
      els.syncInfo.textContent = "พร้อมซิงก์ " + S.list().length + " หน้าไปยัง " + cfg.owner + "/" + cfg.repo;
    } else {
      card.classList.remove("on");
      document.getElementById("ghLabel").textContent = "GitHub";
      document.getElementById("ghRepo").textContent = "ยังไม่เชื่อมต่อ";
      document.getElementById("connTitle").textContent = "ยังไม่ได้เชื่อมต่อ";
      document.getElementById("connSub").textContent = "ข้อมูลจะถูกเก็บในเบราว์เซอร์จนกว่าจะเชื่อม";
      tag.className = "tag";
      tag.innerHTML = '<span class="dot"></span>ยังไม่เชื่อมต่อ';
      badge.textContent = "local";
      badge.className = "tag";
      els.syncInfo.textContent = "ยังไม่ได้เชื่อมต่อ GitHub — ใช้ปุ่มด้านล่างเพื่อสำรองข้อมูลในเครื่อง";
    }

    var count = S.list().length;
    var published = S.list().filter(function (p) { return p.status === "published"; }).length;
    els.localStats.textContent = count + " เผยแพร่ " + published + " หน้า · เก็บใน localStorage ของเบราว์เซอร์นี้";
  }

  function readGHForm() {
    return {
      owner: els.gOwner.value.trim(),
      repo: els.gRepo.value.trim(),
      branch: els.gBranch.value.trim() || "main",
      path: els.gPath.value.trim() || "data",
      token: els.gToken.value.trim()
    };
  }

  function setHint(text, kind) {
    els.hint.textContent = text || "";
    els.hint.style.color = kind === "err" ? "var(--err)" : kind === "ok" ? "var(--ok)" : "var(--muted)";
  }

  document.getElementById("saveProfile").addEventListener("click", function () {
    var p = {
      studio: els.studio.value.trim() || "PIXSALE Studio",
      owner: els.owner.value.trim(),
      email: els.email.value.trim(),
      line: els.line.value.trim(),
      avatar: ""
    };
    S.saveProfile(p);
    document.getElementById("userName").textContent = p.studio;
    document.getElementById("userAv").textContent = p.studio.charAt(0).toUpperCase();
    U.toast("บันทึกโปรไฟล์แล้ว", p.studio, "ok");
  });

  document.getElementById("toggleToken").addEventListener("click", function () {
    els.gToken.type = els.gToken.type === "password" ? "text" : "password";
  });

  document.getElementById("testGH").addEventListener("click", function () {
    var cfg = readGHForm();
    var btn = this;
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      setHint("กรอก owner, repository และ token ให้ครบก่อนทดสอบ", "err");
      return;
    }
    btn.disabled = true;
    btn.textContent = "กำลังทดสอบ…";
    setHint("กำลังตรวจสอบสิทธิ์กับ GitHub…");
    GH.test(cfg).then(function (repo) {
      var access = repo.canPush ? "เขียนได้" : "อ่านอย่างเดียว — ต้องให้ Contents: Read and write";
      setHint("เชื่อมต่อได้: " + repo.fullName + " · branch " + repo.branch + (repo.private ? " · private" : " · public") + " · " + access, repo.canPush ? "ok" : "err");
      U.toast("ทดสอบ GitHub แล้ว", repo.fullName + " · " + access, repo.canPush ? "ok" : "err");
    }).catch(function (err) {
      setHint("ทดสอบไม่สำเร็จ (" + cfg.owner + "/" + cfg.repo + "): " + GH.friendly(err), "err");
      U.toast("ทดสอบไม่สำเร็จ", GH.friendly(err), "err");
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "ทดสอบการเชื่อมต่อ";
    });
  });

  document.getElementById("saveGH").addEventListener("click", function () {
    var cfg = readGHForm();
    var btn = this;
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      setHint("กรอก owner, repository และ token ให้ครบ", "err");
      return;
    }
    btn.disabled = true;
    btn.textContent = "กำลังเชื่อมต่อ…";
    GH.test(cfg).then(function (repo) {
      if (repo.permissions && repo.permissions.push === false) {
        throw new Error("token มีสิทธิ์อ่านอย่างเดียว — ต้องให้ Contents: Read and write");
      }
      // A private repo can still be used for editing; only public sales pages
      // cannot read raw JSON without a token. Warn instead of blocking.
      // Always follow the repository's real default branch; an empty repo has
      // no "main" ref yet, so this is what makes the first commit possible.
      if (repo.branch) {
        cfg.branch = repo.branch;
        els.gBranch.value = repo.branch;
      }
      S.connect(cfg);
      els.progress.textContent = "กำลังซิงก์หน้าเว็บทั้งหมด…";
      return S.pushAll(function (done, total, slug) {
        els.progress.textContent = "กำลังอัปโหลด " + done + "/" + total + " · " + slug;
      }).then(function (res) {
        if (!res.pushed) {
          S.disconnect();
          throw new Error("ซิงก์ไม่สำเร็จ — ตรวจสิทธิ์ Contents: Read and write");
        }
        return { repo: repo, res: res };
      });
    }).then(function (out) {
      var repo = out.repo;
      var res = out.res;
      updateGHUI();
      els.progress.textContent = "ซิงก์แล้ว " + res.pushed + "/" + res.total + " หน้า";
      var warn = res.failed.length ? " · ล้มเหลว " + res.failed.length + " หน้า" : "";
      setHint("เชื่อมต่อและซิงก์แล้ว: " + repo.fullName + " · " + res.pushed + "/" + res.total + " หน้า" + warn, res.failed.length ? "err" : "ok");
      U.toast("เชื่อมต่อ GitHub แล้ว", res.pushed + "/" + res.total + " หน้า" + (res.failed.length ? " · ล้มเหลว " + res.failed.length : " · Vercel กำลังดีพลอย"), res.failed.length ? "warn" : "ok");
    }).catch(function (err) {
      els.progress.textContent = "";
      setHint("เชื่อมต่อไม่สำเร็จ (" + cfg.owner + "/" + cfg.repo + "): " + GH.friendly(err), "err");
      U.toast("เชื่อมต่อไม่สำเร็จ", GH.friendly(err), "err");
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "เชื่อมต่อและซิงก์ทั้งหมด";
    });
  });

  document.getElementById("disconnectGH").addEventListener("click", function () {
    U.confirm({
      title: "ยกเลิกการเชื่อมต่อ?",
      message: "token จะถูกลบออกจากเบราว์เซอร์นี้ ข้อมูลใน GitHub ยังอยู่ครบ",
      confirmText: "ยกเลิกการเชื่อมต่อ",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      S.disconnect();
      els.gToken.value = "";
      updateGHUI();
      setHint("ยกเลิกการเชื่อมต่อแล้ว", "ok");
      U.toast("ยกเลิกการเชื่อมต่อแล้ว", "", "ok");
    });
  });

  document.getElementById("pushAll").addEventListener("click", function () {
    var btn = this;
    btn.disabled = true;
    els.progress.textContent = "กำลังอัปโหลด…";
    S.pushAll(function (done, total, slug) {
      els.progress.textContent = "อัปโหลด " + done + "/" + total + " · " + slug;
    }).then(function (res) {
      els.progress.textContent = "อัปโหลดสำเร็จ " + res.pushed + "/" + res.total + " หน้า" + (res.failed.length ? " · ล้มเหลว " + res.failed.length : "");
      U.toast("ซิงก์ขึ้น GitHub แล้ว", res.pushed + "/" + res.total + " หน้า", res.failed.length ? "warn" : "ok");
      if (res.failed.length) {
        setHint("บางหน้าไม่สำเร็จ: " + res.failed.map(function (f) { return f.slug; }).join(", "), "err");
      }
    }).catch(function (err) {
      els.progress.textContent = "";
      U.toast("ซิงก์ไม่สำเร็จ", GH.friendly(err), "err");
    }).then(function () {
      btn.disabled = !S.github();
    });
  });

  document.getElementById("pullAll").addEventListener("click", function () {
    U.confirm({
      title: "ดึงข้อมูลจาก GitHub?",
      message: "เซลเพจในเครื่องนี้จะถูกแทนที่ด้วยไฟล์จาก repo — แนะนำให้สำรองข้อมูลก่อน",
      confirmText: "ดึงข้อมูล"
    }).then(function (ok) {
      if (!ok) return;
      els.progress.textContent = "กำลังดึงข้อมูล…";
      S.pullAll().then(function (pages) {
        els.progress.textContent = "ดึงสำเร็จ " + pages.length + " หน้า";
        U.toast("ดึงข้อมูลแล้ว", pages.length + " หน้า", "ok");
        setTimeout(function () { window.location.reload(); }, 700);
      }).catch(function (err) {
        els.progress.textContent = "";
        U.toast("ดึงข้อมูลไม่สำเร็จ", GH.friendly(err), "err");
      });
    });
  });

  document.getElementById("exportData").addEventListener("click", function () {
    var payload = {
      app: "PIXSALE",
      version: window.PIX.version,
      exportedAt: new Date().toISOString(),
      pages: S.list()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "pixsale-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
    U.toast("ดาวน์โหลดแล้ว", "ไฟล์สำรองข้อมูล PIXSALE", "ok");
  });

  document.getElementById("importData").addEventListener("click", function () {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var pages = Array.isArray(data) ? data : data.pages;
        if (!Array.isArray(pages) || !pages.length) throw new Error("ไม่พบรายการ pages");
        var valid = pages.filter(function (p) { return p && p.slug && Array.isArray(p.blocks); });
        if (!valid.length) throw new Error("รูปแบบไฟล์ไม่ถูกต้อง");
        U.confirm({
          title: "นำเข้าข้อมูล?",
          message: "จะแทนที่เซลเพจในเครื่องด้วย " + valid.length + " หน้า",
          confirmText: "นำเข้า"
        }).then(function (ok) {
          if (!ok) return;
          localStorage.setItem(window.PIX.keys.pages, JSON.stringify(valid));
          window.location.reload();
        });
      } catch (err) {
        U.toast("นำเข้าไม่สำเร็จ", err.message, "err");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("resetData").addEventListener("click", function () {
    U.confirm({
      title: "รีเซ็ตข้อมูลทั้งหมด?",
      message: "เซลเพจที่แก้ไขในเครื่องจะหายไป และกลับไปใช้ข้อมูลตัวอย่าง 3 หน้า",
      confirmText: "รีเซ็ต",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      localStorage.removeItem(window.PIX.keys.pages);
      window.location.reload();
    });
  });

  loadProfile();
  loadGH();
  document.getElementById("navCount").textContent = S.list().length;
})();
