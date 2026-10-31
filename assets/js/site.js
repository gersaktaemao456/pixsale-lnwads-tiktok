/* PIXSALE — marketing site behaviour */
(function () {
  "use strict";

  var nav = document.getElementById("siteNav");
  var burger = document.getElementById("navBurger");
  var mobileNav = document.getElementById("mobileNav");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "เปิดเมนู");
    }
  }

  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
    });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // Scroll reveals — progressive, respects reduced motion.
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  // Docs anchor highlight
  var docNav = document.querySelector(".doc-nav");
  if (docNav) {
    var links = Array.prototype.slice.call(docNav.querySelectorAll("a[href^='#']"));
    var heads = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var onDocScroll = function () {
      var y = window.scrollY + 140;
      var active = 0;
      heads.forEach(function (h, i) { if (h && h.offsetTop <= y) active = i; });
      links.forEach(function (a, i) { a.classList.toggle("active", i === active); });
    };
    onDocScroll();
    window.addEventListener("scroll", onDocScroll, { passive: true });
  }
})();
