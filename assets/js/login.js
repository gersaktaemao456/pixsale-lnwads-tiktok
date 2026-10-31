/* PIXSALE — login */
(function () {
  "use strict";

  var form = document.getElementById("loginForm");
  var keyEl = document.getElementById("licenseKey");
  var passEl = document.getElementById("password");
  var errEl = document.getElementById("loginError");
  var btn = document.getElementById("loginBtn");
  var note = document.getElementById("setupNote");

  var params = new URLSearchParams(window.location.search);
  var next = params.get("next") || "/app";
  if (!/^\/(?!\/)/.test(next)) next = "/app";

  function showError(msg) {
    errEl.textContent = msg;
    errEl.classList.add("on");
  }

  function clearError() {
    errEl.classList.remove("on");
    errEl.textContent = "";
  }

  // Already signed in? Skip the form.
  fetch("/api/auth/me", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && data.authed) window.location.replace(next);
      if (data && data.configured === false) note.hidden = false;
    })
    .catch(function () {});

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    var key = keyEl.value.trim();
    var password = passEl.value;
    if (!key || !password) {
      showError("กรอก key และ password ให้ครบ");
      return;
    }
    btn.disabled = true;
    btn.textContent = "กำลังตรวจสอบ…";
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key, password: password })
    }).then(function (r) {
      return r.json().then(function (data) { return { status: r.status, data: data }; });
    }).then(function (res) {
      if (res.status === 200 && res.data.ok) {
        window.location.replace(next);
        return;
      }
      if (res.status === 503) {
        note.hidden = false;
        showError("ระบบสมาชิกยังไม่เปิดใช้งาน — แจ้งผู้ดูแลเพื่อตั้งค่าเซิร์ฟเวอร์");
      } else {
        showError((res.data && res.data.message) || "เข้าสู่ระบบไม่สำเร็จ");
      }
      btn.disabled = false;
      btn.textContent = "เข้าสู่ Studio";
    }).catch(function () {
      showError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง");
      btn.disabled = false;
      btn.textContent = "เข้าสู่ Studio";
    });
  });
})();
