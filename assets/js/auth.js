/* PIXSALE — session gate + account chip */
(function () {
  "use strict";

  var PLAN_LABEL = { starter: "Starter", pro: "Pro", studio: "Studio" };

  function fmtDate(ts) {
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  }

  function applyDemo() {
    document.querySelectorAll("[data-auth-name]").forEach(function (el) {
      if (!el.textContent.trim() || el.textContent.trim() === "PIXSALE Studio") el.textContent = "Demo mode";
    });
    document.querySelectorAll("[data-auth-plan]").forEach(function (el) {
      el.textContent = "ยังไม่เปิดระบบสมาชิก";
    });
    document.querySelectorAll("[data-auth-logout]").forEach(function (el) {
      el.hidden = true;
    });
    document.querySelectorAll("[data-auth-badge]").forEach(function (el) {
      el.textContent = "Demo";
    });
  }

  function applyUser(user) {
    var plan = PLAN_LABEL[user.plan] || user.plan || "Member";
    var exp = user.expiresAt ? " · ถึง " + fmtDate(user.expiresAt) : "";
    document.querySelectorAll("[data-auth-name]").forEach(function (el) {
      el.textContent = user.username || "Member";
    });
    document.querySelectorAll("[data-auth-plan]").forEach(function (el) {
      el.textContent = plan + exp;
    });
    document.querySelectorAll("[data-auth-badge]").forEach(function (el) {
      el.textContent = plan;
    });
    document.querySelectorAll("[data-auth-logout]").forEach(function (el) {
      el.hidden = false;
      el.addEventListener("click", function () {
        el.disabled = true;
        fetch("/api/auth/logout", { method: "POST" }).then(function () {
          window.location.href = "/login";
        }).catch(function () {
          window.location.href = "/login";
        });
      });
    });
    window.PIX_SESSION = user;
  }

  fetch("/api/auth/me", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || data.configured === false) {
        applyDemo();
        return;
      }
      if (!data.authed) {
        var next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace("/login?next=" + next);
        return;
      }
      applyUser(data.user || {});
    })
    .catch(function () {
      // Local static preview without serverless functions: stay in demo mode.
      applyDemo();
    });
})();
