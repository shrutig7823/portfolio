// main.js: the portfolio's motion. Plain JavaScript, no libraries. Everything degrades to a static page
// if JavaScript is off or if the visitor prefers reduced motion.
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* 1. Terminal: types the lines out one character at a time. */
  var term = document.getElementById("term");
  if (term) {
    var lines = [];
    try { lines = JSON.parse(term.getAttribute("data-lines")); } catch (e) { /* leave empty */ }
    var cursor = document.createElement("span"); cursor.className = "cursor";
    if (reduce) {
      term.innerHTML = lines.map(function (l) { return '<span class="' + l[1] + '">' + esc(l[0]) + '</span>'; }).join("\n");
    } else {
      var li = 0;
      (function nextLine() {
        if (li >= lines.length) { term.appendChild(cursor); return; }
        var text = lines[li][0], cls = lines[li][1], span = document.createElement("span");
        span.className = cls; term.appendChild(span); term.appendChild(cursor);
        var ci = 0, speed = cls === "cmd" ? 55 : 22;
        (function typeChar() {
          if (ci <= text.length) { span.textContent = text.slice(0, ci); ci++; setTimeout(typeChar, speed); }
          else { li++; term.insertBefore(document.createTextNode("\n"), cursor); setTimeout(nextLine, cls === "cmd" ? 260 : 120); }
        })();
      })();
    }
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* 2. Scroll reveal. */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* 3. Counters count up when they scroll into view. */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute("data-count"), 10), start = performance.now(), dur = 1200;
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }

  /* 4. Scroll progress bar and the active menu link. */
  var bar = document.getElementById("progress");
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var navLinks = document.querySelectorAll("nav a[data-nav]");
  if ("IntersectionObserver" in window) {
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["projects", "case-studies", "how", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) no.observe(s); });
  }

  /* 5. Cursor spotlight on cards and buttons, and a gentle 3D tilt on case study cards. */
  if (finePointer) {
    document.addEventListener("pointermove", function (e) {
      var t = e.target.closest ? e.target.closest(".spot, .btn") : null;
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
    if (!reduce) {
      document.querySelectorAll(".card").forEach(function (card) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
        });
        card.addEventListener("pointerleave", function () { card.style.transform = ""; });
      });
    }
  }

  /* 6. Background: a slow network of dots and lines that reacts to the pointer. */
  var canvas = document.getElementById("bg");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d"), dots = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), mouse = { x: -999, y: -999 }, running = true;
    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(24, Math.min(80, Math.round(w * h / 22000)));
      dots = [];
      for (var i = 0; i < n; i++) dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28 });
      draw(true);
    }
    function draw(still) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var a = dots[i];
        if (!still) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
          var dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { a.x += dx * 0.0035; a.y += dy * 0.0035; }
        }
        ctx.fillStyle = "rgba(94,234,212,.7)"; ctx.beginPath(); ctx.arc(a.x, a.y, 1.5, 0, 6.283); ctx.fill();
        for (var j = i + 1; j < dots.length; j++) {
          var b = dots[j], ddx = a.x - b.x, ddy = a.y - b.y, dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < 130) { ctx.strokeStyle = "rgba(124,156,255," + (0.22 * (1 - dist / 130)).toFixed(3) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
    }
    function loop() { if (running) { draw(false); requestAnimationFrame(loop); } }
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running && !reduce) loop(); });
    resize();
    if (!reduce) loop();
  }
})();
