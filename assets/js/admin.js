/* PIXSALE — admin console */
(function () {
  "use strict";

  var U = window.PIXUI;
  var state = { configured: false, authed: false, issued: [], current: null };
  var ISSUED_KEY = "pixsale.admin.issued.v1";
  var PLAN_LABEL = { starter: "Starter", pro: "Pro", studio: "Studio" };

  var loginView = document.getElementById("loginView");
  var adminView = document.getElementById("adminView");
  var logoutBtn = document.getElementById("adminLogout");
  var setupBox = document.getElementById("setupBox");
  var loginForm = document.getElementById("adminLoginForm");

  function api(url, options) {
    options = options || {};
    options.headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    return fetch(url, options).then(function (r) {
      return r.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        return { status: r.status, data: data };
      });
    });
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    return new Date(ts * 1000).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function loadIssued() {
    try {
      var list = JSON.parse(localStorage.getItem(ISSUED_KEY) || "[]");
      state.issued = Array.isArray(list) ? list : [];
    } catch (e) {
      state.issued = [];
    }
  }

  function saveIssued() {
    try { localStorage.setItem(ISSUED_KEY, JSON.stringify(state.issued.slice(0, 100))); } catch (e) {}
  }

  function renderIssued() {
    var body = document.getElementById("issuedBody");
    if (!state.issued.length) {
      body.innerHTML = '<tr><td colspan="4" class="empty">ยังไม่มีรายการที่ออกในเครื่องนี้</td></tr>';
      return;
    }
    body.innerHTML = state.issued.map(function (item, i) {
      return "<tr>" +
        '<td class="mono">' + escapeHtml(item.username) + "</td>" +
        "<td>" + escapeHtml(PLAN_LABEL[item.plan] || item.plan) + "</td>" +
        '<td class="mono">' + escapeHtml(fmtDate(item.expiresAt)) + "</td>" +
        '<td><button class="dots-btn" type="button" data-copy-key="' + i + '" title="คัดลอก key">' + U.icon("copy") + "</button></td>" +
      "</tr>";
    }).join("");
  }

  function showLogin() {
    loginView.hidden = false;
    adminView.hidden = true;
    logoutBtn.hidden = true;
  }

  function showAdmin() {
    loginView.hidden = true;
    adminView.hidden = false;
    logoutBtn.hidden = false;
    renderIssued();
  }

  function init() {
    api("/api/admin/session").then(function (res) {
      var data = res.data || {};
      state.configured = !!data.configured;
      state.authed = !!data.authed;
      if (!state.configured) {
        setupBox.hidden = false;
        loginForm.hidden = true;
        showLogin();
        return;
      }
      setupBox.hidden = true;
      loginForm.hidden = false;
      if (state.authed) showAdmin();
      else showLogin();
    }).catch(function () {
      setupBox.hidden = false;
      loginForm.hidden = true;
      showLogin();
    });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var password = document.getElementById("adminPassword").value;
    var err = document.getElementById("adminLoginError");
    var btn = document.getElementById("adminLoginBtn");
    err.classList.remove("on");
    btn.disabled = true;
    btn.textContent = "กำลังตรวจสอบ…";
    api("/api/admin/session", { method: "POST", body: JSON.stringify({ password: password }) }).then(function (res) {
      btn.disabled = false;
      btn.textContent = "เข้าสู่โหมดผู้ดูแล";
      if (res.status === 200 && res.data && res.data.ok) {
        state.authed = true;
        document.getElementById("adminPassword").value = "";
        showAdmin();
        U.toast("เข้าสู่โหมดผู้ดูแลแล้ว", "", "ok");
      } else {
        err.textContent = (res.data && res.data.message) || "รหัสผู้ดูแลไม่ถูกต้อง";
        err.classList.add("on");
      }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "เข้าสู่โหมดผู้ดูแล";
      err.textContent = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
      err.classList.add("on");
    });
  });

  logoutBtn.addEventListener("click", function () {
    api("/api/admin/session", { method: "DELETE" }).then(function () {
      state.authed = false;
      showLogin();
      U.toast("ออกจากโหมดผู้ดูแลแล้ว", "", "ok");
    });
  });

  document.getElementById("issueForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("issueError");
    var btn = document.getElementById("issueBtn");
    err.classList.remove("on");
    btn.disabled = true;
    btn.textContent = "กำลังสร้าง…";
    var payload = {
      plan: document.getElementById("plan").value,
      days: Number(document.getElementById("days").value),
      username: document.getElementById("newUsername").value.trim(),
      password: document.getElementById("newPassword").value
    };
    api("/api/admin/license", { method: "POST", body: JSON.stringify(payload) }).then(function (res) {
      btn.disabled = false;
      btn.textContent = "สร้างสิทธิ์การใช้งาน";
      if (res.status === 200 && res.data && res.data.ok) {
        state.current = res.data;
        document.getElementById("rUser").textContent = res.data.username;
        document.getElementById("rPass").textContent = res.data.password;
        document.getElementById("rPlan").textContent = PLAN_LABEL[res.data.plan] || res.data.plan;
        document.getElementById("rExp").textContent = fmtDate(res.data.expiresAt);
        document.getElementById("rKey").textContent = res.data.licenseKey;
        document.getElementById("issueResult").classList.add("on");
        document.getElementById("newPassword").value = "";
        state.issued.unshift({
          username: res.data.username,
          plan: res.data.plan,
          expiresAt: res.data.expiresAt,
          key: res.data.licenseKey,
          createdAt: Date.now()
        });
        saveIssued();
        renderIssued();
        U.toast("ออกสิทธิ์แล้ว", res.data.username + " · " + (PLAN_LABEL[res.data.plan] || res.data.plan), "ok");
      } else if (res.status === 401) {
        showLogin();
        U.toast("เซสชันผู้ดูแลหมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warn");
      } else {
        err.textContent = (res.data && res.data.message) || "สร้างสิทธิ์ไม่สำเร็จ";
        err.classList.add("on");
      }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "สร้างสิทธิ์การใช้งาน";
      err.textContent = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
      err.classList.add("on");
    });
  });

  function copyText(text, label) {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        U.toast("คัดลอกแล้ว", label || "", "ok");
      }).catch(function () {
        U.toast("คัดลอกไม่สำเร็จ", "เลือกข้อความแล้วคัดลอกเอง", "err");
      });
    }
  }

  document.getElementById("issueResult").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-target]");
    if (!btn) return;
    var el = document.getElementById(btn.getAttribute("data-copy-target"));
    copyText(el ? el.textContent : "", "คัดลอก " + btn.getAttribute("data-copy-target"));
  });

  document.getElementById("issuedBody").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-key]");
    if (!btn) return;
    var item = state.issued[Number(btn.getAttribute("data-copy-key"))];
    if (item) copyText(item.key, "License key");
  });

  document.getElementById("copyAllCred").addEventListener("click", function () {
    if (!state.current) return;
    var c = state.current;
    copyText(
      "PIXSALE — ข้อมูลเข้าใช้งาน\n" +
      "Username: " + c.username + "\n" +
      "Password: " + c.password + "\n" +
      "Plan: " + (PLAN_LABEL[c.plan] || c.plan) + "\n" +
      "หมดอายุ: " + fmtDate(c.expiresAt) + "\n" +
      "License key:\n" + c.licenseKey + "\n",
      "ข้อมูลเข้าใช้งาน"
    );
  });

  document.getElementById("downloadCred").addEventListener("click", function () {
    if (!state.current) return;
    var c = state.current;
    var text =
      "PIXSALE — ใบรับสิทธิ์การใช้งาน\n" +
      "--------------------------------\n" +
      "Username: " + c.username + "\n" +
      "Password: " + c.password + "\n" +
      "Plan: " + (PLAN_LABEL[c.plan] || c.plan) + "\n" +
      "Days: " + c.days + "\n" +
      "หมดอายุ: " + fmtDate(c.expiresAt) + "\n\n" +
      "License key (เก็บเป็นความลับ):\n" + c.licenseKey + "\n\n" +
      "วิธีใช้: เปิด /login แล้ววาง license key กับ password\n";
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "pixsale-license-" + c.username + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("clearIssued").addEventListener("click", function () {
    if (!state.issued.length) return;
    U.confirm({ title: "ล้างประวัติในเครื่อง?", message: "รายการที่ออกจะหายจากตารางนี้ แต่ license ที่ลูกค้าถือยังใช้ได้", confirmText: "ล้างประวัติ", danger: true }).then(function (ok) {
      if (!ok) return;
      state.issued = [];
      saveIssued();
      renderIssued();
    });
  });

  document.getElementById("genSecret").addEventListener("click", function () {
    var bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    var secret = btoa(String.fromCharCode.apply(null, bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    copyText(secret, "AUTH_SECRET");
    document.getElementById("genSecretOut").textContent = "คัดลอก AUTH_SECRET แล้ว — วางใน Vercel → Settings → Environment Variables";
  });

  loadIssued();
  init();
})();
