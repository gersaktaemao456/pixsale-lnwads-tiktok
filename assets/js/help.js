/* PIXSALE — service help modal */
(function () {
  "use strict";

  var modal = document.getElementById("helpModal");
  var fab = document.getElementById("helpFab");
  if (!modal) return;

  var card = modal.querySelector(".help-card");
  var closeBtn = modal.querySelector(".help-close");
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("help-open");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("help-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.querySelectorAll("[data-help-open]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  });

  document.querySelectorAll("[data-help-close]").forEach(function (el) {
    el.addEventListener("click", close);
  });

  if (fab) {
    fab.addEventListener("click", open);
  }

  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "Tab" && card) {
      var focusable = card.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
