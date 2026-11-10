// main.js: small touches only. Plain JavaScript, no libraries. The page is complete without it.
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Scroll reveal. */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* Numbers count up once when they scroll into view. */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute("data-count"), 10), start = performance.now(), dur = 900;
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = end;
        })(start);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }

  /* Highlight the menu link of the section being read. */
  var navLinks = document.querySelectorAll("nav a[data-nav]");
  if ("IntersectionObserver" in window) {
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["projects", "experience", "case-studies", "how", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) no.observe(s); });
  }
})();
