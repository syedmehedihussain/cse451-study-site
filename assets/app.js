/* CSE451 study site: shared behaviour.
   Builds header, rail, chips, pager and footer from one lecture list,
   then wires quizzes, classifiers, checklists, progress and the theme toggle. */
(function () {
  "use strict";

  var LECTURES = [
    { n: "01", slug: "01-software-and-se", title: "Software and software engineering", exam: "Mid",
      desc: "What software is, why systems fail, the software crisis, the SDLC, the cost of faults and change, failure curves and the myths." },
    { n: "02", slug: "02-process-models", title: "Software development process models", exam: "Mid",
      desc: "Waterfall to RUP, then agile: the manifesto, XP, Scrum, DSDM and FDD, with velocity, burndown, MoSCoW and feature progress." },
    { n: "03", slug: "03-requirements-engineering", title: "Requirements engineering", exam: "Mid",
      desc: "The seven RE tasks, functional and non-functional requirements, use cases, the SRS and how to validate it." },
    { n: "04", slug: "04-design-and-metrics", title: "Design concepts, UI design and product metrics", exam: "Mid",
      desc: "Abstraction, modularity, cohesion and coupling, the golden rules of UI design, and the metrics that measure a design." },
    { n: "05", slug: "05-quality-and-testing", title: "Quality attributes and testing strategies", exam: "Final",
      desc: "Quality models, reviews, black-box and white-box testing, unit to acceptance testing, and the numbers behind them." },
    { n: "06", slug: "06-configuration-management", title: "Software configuration management", exam: "Final",
      desc: "Configuration items, baselines, version and change control, audits, status reporting and the tools teams use." },
    { n: "07", slug: "07-project-management", title: "Software project management", exam: "Final",
      desc: "The 4 Ps, estimation with LOC, FP and COCOMO, scheduling with WBS, CPM and Gantt charts, and earned value." },
    { n: "08", slug: "08-risk-management", title: "Risk management", exam: "Final",
      desc: "Reactive and proactive strategies, risk types, identification, projection, exposure, RMMM and the risk table." }
  ];
  var EXTRA = [
    { slug: "exam", title: "Exam prep", file: "exam.html" },
    { slug: "project", title: "Project walkthrough", file: "project.html" }
  ];

  var body = document.body;
  var root = body.getAttribute("data-root") || ".";
  var slug = body.getAttribute("data-slug") || "";
  document.documentElement.classList.add("js");

  /* ---------- storage (works in file:// and http; fails quietly) ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("se451:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("se451:" + k, JSON.stringify(v)); } catch (e) {} }
  };

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function href(l) { return root + "/lectures/" + l.slug + ".html"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n, d) {
    if (!isFinite(n)) return "-";
    var p = d === undefined ? (Math.abs(n) < 10 && n % 1 ? 2 : 0) : d;
    return Number(n).toLocaleString("en-US", { minimumFractionDigits: p, maximumFractionDigits: p });
  }

  /* ---------- theme ---------- */
  var moon = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  var sun = '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

  /* ---------- header ---------- */
  var hdr = $("#site-header");
  if (hdr) {
    hdr.className = "site-header";
    hdr.innerHTML =
      '<div class="site-header__bar">' +
      '<a class="brand" href="' + root + '/index.html"><span class="brand-mark">451</span><span class="brand-text">Software Engineering</span></a>' +
      '<nav class="nav" aria-label="Primary">' +
      '<a href="' + root + '/index.html#lectures"' + (slug === "home" ? ' aria-current="page"' : "") + '>Lectures</a>' +
      '<a href="' + root + '/exam.html"' + (slug === "exam" ? ' aria-current="page"' : "") + '>Exam prep</a>' +
      '<a class="opt" href="' + root + '/project.html"' + (slug === "project" ? ' aria-current="page"' : "") + '>Project</a>' +
      '<button class="theme-toggle" type="button" aria-label="Toggle dark mode">' + moon + sun + "</button>" +
      "</nav></div>";
    $(".theme-toggle", hdr).addEventListener("click", function () {
      var d = document.documentElement.classList.toggle("dark");
      try { localStorage.setItem("theme", d ? "dark" : "light"); } catch (e) {}
    });
  }

  /* ---------- sections, rail, chips ---------- */
  var sections = $$(".prose > section[id]");
  var done = store.get("done", {});

  var rail = $("#rail");
  if (rail) {
    var html = '<p class="rail__title">Lectures</p><ol>';
    LECTURES.forEach(function (l) {
      html += '<li><a href="' + href(l) + '"' + (l.slug === slug ? ' aria-current="page"' : "") + '><span class="num">' + l.n +
        "</span><span>" + esc(l.title) + "</span>" + (done[l.slug] ? '<span class="done-tick" title="Studied">done</span>' : "") + "</a></li>";
    });
    EXTRA.forEach(function (x) {
      html += '<li><a href="' + root + "/" + x.file + '"' + (x.slug === slug ? ' aria-current="page"' : "") + '><span class="num">+</span><span>' + x.title + "</span></a></li>";
    });
    html += "</ol>";
    if (sections.length) {
      html += '<p class="rail__title">On this page</p><ol class="toc">';
      sections.forEach(function (s) {
        var h = $("h2", s);
        var t = h ? (h.getAttribute("data-short") || h.textContent.replace(/^\s*\d+\s*/, "")) : s.id;
        html += '<li><a href="#' + s.id + '" data-sec="' + s.id + '">' + esc(t) + "</a></li>";
      });
      html += "</ol>";
    }
    rail.innerHTML = html;
  }
  var chips = $("#chips");
  if (chips && sections.length) {
    chips.innerHTML = sections.map(function (s) {
      var h = $("h2", s);
      var t = h ? (h.getAttribute("data-short") || h.textContent.replace(/^\s*\d+\s*/, "")) : s.id;
      return '<a href="#' + s.id + '" data-sec="' + s.id + '">' + esc(t) + "</a>";
    }).join("");
  } else if (chips) { chips.remove(); }

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('[data-sec]').forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-sec") === e.target.id); });
        var chip = chips && $('[data-sec="' + e.target.id + '"]', chips);
        if (chip) chips.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- pager + done toggle ---------- */
  var idx = -1;
  LECTURES.forEach(function (l, i) { if (l.slug === slug) idx = i; });
  var pager = $("#pager");
  if (pager && idx > -1) {
    var prev = LECTURES[idx - 1], next = LECTURES[idx + 1];
    pager.innerHTML =
      (prev ? '<a href="' + href(prev) + '"><span class="dir">Previous</span><span class="label">' + prev.n + " " + esc(prev.title) + "</span></a>" : "") +
      (next ? '<a class="next" href="' + href(next) + '"><span class="dir">Next</span><span class="label">' + next.n + " " + esc(next.title) + "</span></a>"
            : '<a class="next" href="' + root + '/exam.html"><span class="dir">Next</span><span class="label">Exam prep</span></a>');
  }
  var doneRow = $("#done");
  if (doneRow && idx > -1) {
    var paint = function () {
      var d = store.get("done", {})[slug];
      doneRow.innerHTML = '<p>' + (d ? "You marked this lecture as studied. It shows as done on the home page." : "Finished the quiz and the checklist? Mark this lecture as studied to track your progress.") + "</p>" +
        '<button class="btn ' + (d ? "" : "primary") + '" type="button">' + (d ? "Mark as not studied" : "Mark as studied") + "</button>";
      $("button", doneRow).addEventListener("click", function () {
        var all = store.get("done", {}); all[slug] = !all[slug]; store.set("done", all); paint();
      });
    };
    paint();
  }

  /* ---------- footer ---------- */
  var ftr = $("#site-footer");
  if (ftr) {
    ftr.className = "site-footer";
    ftr.innerHTML = '<div class="site-footer__bar"><p>Built from the CSE451 lecture slides by Professor MM Mahbubul Syeed, Department of CSE, Independent University, Bangladesh. Main text: Pressman, Software Engineering: A Practitioner\'s Approach.</p>' +
      '<p>Runs locally. Progress and notes stay in this browser.</p></div>';
  }

  /* ---------- home page progress ---------- */
  var list = $("#lecture-list");
  if (list) {
    list.innerHTML = LECTURES.map(function (l) {
      var d = done[l.slug];
      return '<a class="lecture-card" href="' + href(l) + '"><span class="num">' + l.n + '</span><span class="body"><h3>' + esc(l.title) +
        "</h3><p>" + esc(l.desc) + '</p></span><span class="st' + (d ? " d" : "") + '">' + (d ? "Studied" : l.exam + " exam") + "</span></a>";
    }).join("");
  }
  $$("[data-prog]").forEach(function (el) {
    var which = el.getAttribute("data-prog");
    var ls = LECTURES.filter(function (l) { return which === "all" || l.exam === which; });
    el.innerHTML = ls.map(function (l) { return '<i class="' + (done[l.slug] ? "d" : "") + '" title="' + l.n + '"></i>'; }).join("");
  });
  $$("[data-prog-text]").forEach(function (el) {
    var which = el.getAttribute("data-prog-text");
    var ls = LECTURES.filter(function (l) { return which === "all" || l.exam === which; });
    var c = ls.filter(function (l) { return done[l.slug]; }).length;
    el.textContent = c + " of " + ls.length + " studied";
  });

  /* ---------- multiple-choice quiz ---------- */
  $$(".quiz").forEach(function (quiz, qi) {
    var key = "quiz:" + slug + ":" + (quiz.id || qi);
    var items = $$(".mcq", quiz);
    var bar = document.createElement("div");
    bar.className = "quiz-bar";
    bar.innerHTML = '<span>Answered <b class="answered mono">0</b> of ' + items.length + '</span><span>Score <span class="score">0</span> <span class="muted mono small best"></span></span><button class="btn reset" type="button">Reset</button>';
    quiz.insertBefore(bar, quiz.firstChild);
    var best = store.get(key, null);
    function showBest() { $(".best", bar).textContent = best !== null ? "(best " + best + "/" + items.length + ")" : ""; }
    showBest();
    function tally() {
      var a = $$(".mcq.answered", quiz).length, s = $$(".mcq.right", quiz).length;
      $(".answered", bar).textContent = a;
      $(".score", bar).textContent = s + "/" + items.length;
      if (a === items.length && (best === null || s > best)) { best = s; store.set(key, s); showBest(); }
    }
    items.forEach(function (m, i) {
      var q = $(".q", m);
      if (q && !$(".idx", q)) q.insertAdjacentHTML("afterbegin", '<span class="idx">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span>");
      $$(".opts button", m).forEach(function (b) {
        b.classList.add("opt-btn"); b.type = "button";
        b.addEventListener("click", function () {
          if (m.classList.contains("answered")) return;
          m.classList.add("answered");
          var ok = b.hasAttribute("data-ok");
          m.classList.add(ok ? "right" : "wrong");
          b.classList.add(ok ? "ok" : "no");
          $$(".opts button", m).forEach(function (o) { o.disabled = true; if (o.hasAttribute("data-ok")) o.classList.add("ok"); });
          tally();
        });
      });
    });
    $(".reset", bar).addEventListener("click", function () {
      items.forEach(function (m) {
        m.classList.remove("answered", "right", "wrong");
        $$(".opts button", m).forEach(function (o) { o.disabled = false; o.classList.remove("ok", "no"); });
      });
      tally();
    });
  });

  /* ---------- classifier ---------- */
  $$(".sorter").forEach(function (sorter) {
    var opts = (sorter.getAttribute("data-options") || "").split("|");
    var items = $$(".sort", sorter);
    var score = $(".score", sorter);
    function tally() { if (score) score.textContent = $$(".sort.ok", sorter).length + " / " + items.length + " correct"; }
    items.forEach(function (it) {
      var ans = it.getAttribute("data-a");
      var why = it.getAttribute("data-why") || "";
      var btns = document.createElement("div"); btns.className = "btns";
      var fb = document.createElement("p"); fb.className = "fb"; fb.setAttribute("aria-live", "polite");
      opts.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "opt-btn"; b.textContent = o;
        b.addEventListener("click", function () {
          if (it.classList.contains("ok")) return;
          var right = ans.split("/").indexOf(o) > -1;
          if (right) {
            it.classList.remove("no"); it.classList.add("ok"); b.classList.add("ok");
            $$("button", btns).forEach(function (x) { x.disabled = true; });
            fb.textContent = "Correct. " + why;
          } else {
            it.classList.add("no"); b.classList.add("no"); b.disabled = true;
            fb.textContent = "Not this one. Try again.";
            it.classList.remove("flash"); void it.offsetWidth; it.classList.add("flash");
          }
          tally();
        });
        btns.appendChild(b);
      });
      it.appendChild(btns); it.appendChild(fb);
    });
    tally();
  });

  /* ---------- checklists ---------- */
  $$(".checklist").forEach(function (ul, ci) {
    var key = "check:" + slug + ":" + (ul.getAttribute("data-key") || ci);
    var state = store.get(key, {});
    var lis = $$("li", ul);
    var prog = $('[data-for="' + (ul.id || "") + '"]');
    function upd() { if (prog) prog.textContent = lis.filter(function (l) { return l.classList.contains("done"); }).length + " of " + lis.length + " ready"; }
    lis.forEach(function (li, i) {
      var inner = li.innerHTML;
      li.innerHTML = '<input type="checkbox" id="' + key.replace(/[^a-z0-9]/gi, "") + i + '"><span>' + inner + "</span>";
      var cb = $("input", li);
      cb.checked = !!state[i]; li.classList.toggle("done", cb.checked);
      cb.addEventListener("change", function () { state[i] = cb.checked; li.classList.toggle("done", cb.checked); store.set(key, state); upd(); });
      $("span", li).addEventListener("click", function () { cb.click(); });
    });
    upd();
  });

  /* ---------- workspace text fields (project page) ---------- */
  $$("[data-ws]").forEach(function (f) {
    var key = "ws:" + f.getAttribute("data-ws");
    f.value = store.get(key, "");
    var t;
    f.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        store.set(key, f.value);
        var s = f.parentNode.querySelector(".saved");
        if (s) { s.classList.add("on"); setTimeout(function () { s.classList.remove("on"); }, 900); }
      }, 300);
    });
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = $$(".prose > section, .reveal-me, .cards");
  revealEls.forEach(function (el) {
    el.classList.add("reveal");
    if (el.classList.contains("cards")) $$(".c", el).forEach(function (c, i) { c.style.setProperty("--i", i); });
  });
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
    // anything already in view or targeted by a hash shows at once
    setTimeout(function () { revealEls.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }); }, 50);
  } else { revealEls.forEach(function (el) { el.classList.add("in"); }); }
  window.addEventListener("hashchange", function () { revealEls.forEach(function (el) { el.classList.add("in"); }); });

  /* ---------- public helpers for page calculators ---------- */
  window.SE = { $: $, $$: $$, fmt: fmt, store: store, esc: esc, LECTURES: LECTURES,
    num: function (el) { var v = parseFloat(typeof el === "string" ? $(el).value : el.value); return isFinite(v) ? v : 0; },
    live: function (scope, fn) { $$("input,select", scope).forEach(function (i) { i.addEventListener("input", fn); i.addEventListener("change", fn); }); fn(); }
  };
})();
