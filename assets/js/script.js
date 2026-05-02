/* portfolio v-2.0.0
   theme toggle, scroll progress, scroll-spy nav, reveal observer,
   count-up, cursor-aware hero glow, console hello.
   no deps. */

(function () {
  "use strict";

  /* ---------- theme toggle ---------- */

  var root = document.documentElement;
  var toggleBtn = document.querySelector("[data-theme-toggle]");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }

  function nextTheme() {
    var current = root.getAttribute("data-theme") || "dark";
    return current === "dark" ? "light" : "dark";
  }

  function toggleThemeWithSpread(event) {
    var target = nextTheme();
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduced) {
      setTheme(target);
      return;
    }

    var x = event.clientX;
    var y = event.clientY;
    var endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    var transition = document.startViewTransition(function () {
      setTheme(target);
    });

    transition.ready.then(function () {
      document.documentElement.animate(
        {
          clipPath: [
            "circle(0px at " + x + "px " + y + "px)",
            "circle(" + endRadius + "px at " + x + "px " + y + "px)"
          ]
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleThemeWithSpread);
  }

  // follow system changes if user hasn't picked manually
  try {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
  } catch (e) {}

  /* ---------- scroll progress bar ---------- */

  var progress = document.querySelector(".scroll-progress");

  function updateProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + "%";
  }

  /* ---------- topnav scrolled state ---------- */

  var topnav = document.querySelector(".topnav");
  function updateTopnav() {
    if (!topnav) return;
    if (window.scrollY > 8) topnav.classList.add("is-scrolled");
    else topnav.classList.remove("is-scrolled");
  }

  /* ---------- scroll-spy: highlight active nav link ---------- */

  var navLinks = document.querySelectorAll(".topnav-links a");
  var sections = Array.prototype.map.call(navLinks, function (link) {
    var id = link.getAttribute("href").slice(1);
    return { link: link, el: document.getElementById(id) };
  });

  function updateActiveNav() {
    var y = window.scrollY + 120;
    var current = null;
    sections.forEach(function (s) {
      if (s.el && s.el.offsetTop <= y) current = s;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle("is-active", s === current);
    });
  }

  /* ---------- combined scroll handler with rAF throttle ---------- */

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        updateTopnav();
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal-on-scroll observer ---------- */

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  /* ---------- stat count-up ---------- */

  var statNums = document.querySelectorAll(".stat-num[data-count-to]");

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count-to")) || 0;
    var suffix = el.getAttribute("data-count-suffix") || "";
    var duration = 1400;
    var start = performance.now();

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (t < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    var statIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach(function (el) {
      statIo.observe(el);
    });
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------- cursor-aware hero glow ---------- */

  var glow = document.querySelector("[data-cursor-glow]");
  if (glow && window.matchMedia("(pointer: fine)").matches) {
    glow.addEventListener("mousemove", function (e) {
      var rect = glow.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      glow.style.setProperty("--mx", x + "%");
      glow.style.setProperty("--my", y + "%");
    });
  }

  /* ---------- console hello ---------- */

  if (typeof console !== "undefined" && console.log) {
    console.log(
      "%cHi.%c\nhassan-arif on github, ihassanmahmood on linkedin. say hello.",
      "font: 600 18px/1.2 -apple-system, sans-serif; color: #4d8fcc;",
      "font: 14px/1.4 -apple-system, sans-serif; color: #b0b5c2;"
    );
  }
})();
