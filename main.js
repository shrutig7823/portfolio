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

  /* Hero tagline: cycles through what I do. */
  var rot = document.getElementById("rot");
  if (rot && !reduce) {
    var words = [];
    try { words = JSON.parse(rot.getAttribute("data-words")); } catch (e) { words = []; }
    var wi = 0;
    if (words.length > 1) {
      setInterval(function () {
        rot.classList.add("out");
        setTimeout(function () { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove("out"); }, 350);
      }, 2400);
    }
  }

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

  /* Case study filter: All, case study, teardown, RCA, metric questions. */
  var segs = document.getElementById("segs");
  if (segs) {
    var cards = document.querySelectorAll("#grid .card"), empties = document.querySelectorAll("[data-empty]");
    segs.addEventListener("click", function (ev) {
      var b = ev.target.closest(".seg");
      if (!b) return;
      var f = b.getAttribute("data-filter"), shown = 0;
      segs.querySelectorAll(".seg").forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
      cards.forEach(function (c) { var show = f === "all" || (" " + c.getAttribute("data-cat") + " ").indexOf(" " + f + " ") > -1; c.hidden = !show; if (show) shown++; });
      empties.forEach(function (m) { m.hidden = !(shown === 0 && m.getAttribute("data-empty") === f); });
    });
  }

  /* Highlight the menu link of the section being read. */
  var navLinks = document.querySelectorAll("nav a[data-nav]");
  if ("IntersectionObserver" in window) {
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["how", "projects", "experience", "case-studies", "skills", "extracurricular", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) no.observe(s); });
  }
})();
