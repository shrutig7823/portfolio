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

  /* The Zomato card: the arrow expands it across the row and reveals its four stages. */
  var ex = document.querySelector(".expander");
  if (ex) {
    ex.addEventListener("click", function () {
      var c = ex.closest(".card"), open = c.classList.toggle("wide");
      ex.setAttribute("aria-expanded", open ? "true" : "false");
      ex.setAttribute("aria-label", open ? "Hide the four stages" : "Show the four stages");
      if (open) c.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
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

/* Project cards open their full case in place. */
(function () {
  function openCase(id, scroll) {
    var d = document.getElementById(id);
    if (d && d.tagName === "DETAILS") { d.open = true; if (scroll) d.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-open]");
    if (a) { e.preventDefault(); openCase(a.getAttribute("data-open"), true); }
  });
  window.addEventListener("hashchange", function () { openCase(location.hash.slice(1), false); });
  if (location.hash) openCase(location.hash.slice(1), false);
})();


/* Experience journey: the train rides from the first stop to where I am now, then parks there. Tap a stop to go there. */
(function () {
  var jr = document.getElementById("journey"); if (!jr) return;
  var stops = [].slice.call(jr.querySelectorAll(".stop")), items = [].slice.call(jr.querySelectorAll(".jitem"));
  var train = document.getElementById("train"), lit = document.getElementById("lit"), rail = jr.querySelector(".rail"), scroller = jr.querySelector(".jscroll");
  var n = stops.length, last = n - 1, cur = 0, raf = 0, started = false;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pos = function (i) { return i / last; };
  var curP = function () { var l = parseFloat(train.style.left); return isNaN(l) ? 0 : 1 - l / 100; };
  function paint(p) {                                   // p is 0 to 1 along the rail
    train.style.left = ((1 - p) * 100) + "%"; lit.style.width = (p * 100) + "%";
    stops.forEach(function (s, i) { s.classList.toggle("passed", pos(i) <= p + 0.001); });
  }
  function show(i) {
    items.forEach(function (it, k) { if (k === i) it.removeAttribute("data-off"); else it.setAttribute("data-off", ""); });
    stops.forEach(function (s, k) { s.classList.toggle("active", k === i); });
  }
  function centre(i) {
    var s = stops[i]; if (scroller.scrollWidth > scroller.clientWidth) scroller.scrollTo({ left: s.offsetLeft + rail.offsetLeft - scroller.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }
  function travel(from, to, ms, done) {
    clearTimeout(raf); train.classList.remove("parked");
    if (reduce || from === to) { paint(to); train.classList.add("parked"); if (done) done(); return; }
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      paint(from + (to - from) * e);
      if (k < 1) raf = setTimeout(function () { step(performance.now()); }, 16); else { train.classList.add("parked"); if (done) done(); }
    })(t0);
  }
  function go(i) { var from = curP(); cur = i; show(i); centre(i); travel(from, pos(i), 700 + Math.abs(pos(i) - from) * 1400); }
  stops.forEach(function (s, i) { s.addEventListener("click", function () { go(i); }); });
  show(last); paint(0);                                  // the panel shows where I am now; the train starts at the beginning
  function start() {
    if (started) return; started = true;
    scroller.scrollLeft = scroller.scrollWidth;
    travel(0, 1, 4200, function () { cur = last; centre(last); });
    if (!reduce) { var f = function () { var p = curP(); if (p < 1) { var sc = scroller; if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = Math.max(0, (1 - p) * rail.offsetWidth - sc.clientWidth / 2 + 44); setTimeout(f, 60); } }; setTimeout(f, 60); }
  }
  if ("IntersectionObserver" in window) { new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { o.disconnect(); start(); } }, { threshold: 0.35 }).observe(jr); } else { start(); }
})();

/* journey: hide the tip once someone uses it; the train's label says where it is */
(function () {
  var jr = document.getElementById("journey"); if (!jr) return;
  var tip = document.getElementById("jtip"), here = jr.querySelector(".here"), stops = [].slice.call(jr.querySelectorAll(".stop"));
  jr.addEventListener("click", function (e) {
    var s = e.target.closest(".stop"); if (!s) return;
    if (tip) tip.classList.add("off");
    if (here) here.textContent = s.classList.contains("now") ? "You are here" : s.querySelector(".sname").textContent;
  });
  setTimeout(function () { if (here && !jr.querySelector(".stop.active.now")) return; }, 0);
})();

/* Full case: the card's CTA opens the whole write-up over the page */
(function () {
  var box = document.getElementById("casebox"), body = document.getElementById("casebody"); if (!box) return;
  var lastFocus = null;
  function open(id) {
    var t = document.getElementById("case-" + id); if (!t) return false;
    body.replaceChildren(t.content.cloneNode(true)); box.hidden = false; box.scrollTop = 0; document.body.classList.add("case-open");
    lastFocus = document.activeElement; document.getElementById("caseClose").focus();
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignore */ }
    return true;
  }
  function close() { if (box.hidden) return; box.hidden = true; body.replaceChildren(); document.body.classList.remove("case-open"); try { history.replaceState(null, "", location.pathname + location.search + "#projects"); } catch (e) { /* ignore */ } if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-open]"); if (a && open(a.getAttribute("data-open"))) { e.preventDefault(); return; }
    if (e.target === box || e.target.closest("#caseClose")) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  if (location.hash && document.getElementById("case-" + location.hash.slice(1))) open(location.hash.slice(1));
})();

/* Full experience list: opening it hides the single-role panel; tapping a stop then opens that role in the list */
(function () {
  var jr = document.getElementById("journey"), all = document.getElementById("allxp"); if (!jr || !all) return;
  var rows = [].slice.call(all.querySelectorAll(".xpfull")), n = jr.querySelectorAll(".stop").length;
  all.addEventListener("toggle", function () { jr.classList.toggle("listmode", all.open); });
  jr.addEventListener("click", function (e) {
    var s = e.target.closest(".stop"); if (!s) return;
    var row = rows[n - 1 - Number(s.getAttribute("data-i"))]; if (!row) return;
    rows.forEach(function (r) { r.open = r === row; });
    row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
