/* Week 1 MVP knowledge base — rendering, search, illustrations,
   fullscreen figures and the Ask panel.
   Classic script (no modules) so it works from a file:// URL. */
(function (global) {
  "use strict";
  var M_ = MVP; // const at top level is NOT a window property

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  var BD = "var(--border)", A = "var(--accent)", MU = "var(--muted)";
  function svg(w, h, body) {
    return '<svg class="illus" viewBox="0 0 ' + w + " " + h + '" role="img" aria-hidden="true">' + body + "</svg>";
  }
  function box(x, y, w, h, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="' + (o.r === undefined ? 10 : o.r) + '" fill="' + (o.fill || "var(--card)") +
      '" stroke="' + (o.stroke || BD) + '" stroke-width="' + (o.sw || 1.5) +
      '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 12) +
      '" font-weight="' + (o.weight || 400) + '" fill="' + (o.fill || "var(--text)") +
      '" text-anchor="' + (o.anchor || "start") + '">' + esc(s) + "</text>";
  }
  function wrapText(s, max) {
    var words = String(s).split(/\s+/), lines = [], cur = "";
    words.forEach(function (w) {
      if ((cur + " " + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
      else cur = (cur ? cur + " " : "") + w;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function multi(x, y, lines, o) {
    o = o || {}; var lh = o.lh || 14;
    return lines.map(function (l, i) { return txt(x, y + i * lh, l, o); }).join("");
  }
  function arrowH(x1, x2, y, label) {
    var d = x2 > x1 ? 1 : -1;
    return '<line x1="' + x1 + '" y1="' + y + '" x2="' + (x2 - 7 * d) + '" y2="' + y +
      '" stroke="' + MU + '" stroke-width="1.8"/>' +
      '<path d="M' + (x2 - 8 * d) + " " + (y - 5) + " L" + x2 + " " + y + " L" + (x2 - 8 * d) + " " + (y + 5) +
      '" fill="' + MU + '"/>' +
      (label ? txt((x1 + x2) / 2, y - 10, label, { size: 10.5, anchor: "middle", fill: MU }) : "");
  }

  /* ---------- tile previews ---------- */
  var THUMBS = {
    bet: svg(200, 106,
      box(16, 30, 44, 46, { r: 7, fill: "var(--slate-tint)" }) +
      arrowH(64, 84, 53) +
      box(88, 22, 58, 62, { r: 8, fill: "var(--accent-soft)", stroke: A, sw: 1.6 }) +
      arrowH(150, 168, 53) +
      '<circle cx="182" cy="53" r="13" fill="var(--good-tint)" stroke="var(--good)" stroke-width="1.8"/>' +
      '<path d="M176 53l4 4 8-8" stroke="var(--good)" stroke-width="2.4" fill="none"/>'),
    week: svg(200, 106, [0, 1, 2, 3, 4].map(function (i) {
      return box(14 + i * 36, 30, 30, 46, { r: 6, fill: i === 4 ? "var(--accent-soft)" : "var(--card)",
        stroke: i === 4 ? A : BD, sw: i === 4 ? 1.8 : 1.2 }) +
        '<rect x="' + (20 + i * 36) + '" y="' + (40 + i * 3) + '" width="18" height="5" rx="2.5" fill="' + A + '" opacity="' + (0.3 + i * 0.16) + '"/>';
    }).join("")),
    cuts: svg(200, 106,
      box(14, 20, 78, 66, { r: 8, fill: "var(--good-tint)", stroke: "var(--good)", sw: 1.5 }) +
      [0, 1].map(function (i) { return '<rect x="24" y="' + (32 + i * 22) + '" width="58" height="14" rx="4" fill="var(--card)" stroke="var(--good)" stroke-width="1"/>'; }).join("") +
      box(108, 20, 78, 66, { r: 8, fill: "var(--risk-tint)", stroke: "var(--risk)", sw: 1.5, dash: "4 3" }) +
      [0, 1, 2].map(function (i) { return '<rect x="118" y="' + (30 + i * 17) + '" width="58" height="11" rx="3" fill="var(--card)" stroke="var(--risk)" stroke-width="1" opacity=".6"/>'; }).join("")),
    mock: svg(200, 106,
      box(18, 14, 164, 78, { r: 7 }) +
      '<rect x="18" y="14" width="164" height="15" rx="7" fill="var(--slate-tint)"/>' +
      '<rect x="27" y="19" width="34" height="5" rx="2.5" fill="' + A + '"/>' +
      '<rect x="27" y="38" width="88" height="7" rx="3.5" fill="var(--text)" opacity=".75"/>' +
      [0, 1, 2].map(function (i) { return '<rect x="27" y="' + (52 + i * 12) + '" width="' + (76 - i * 10) + '" height="6" rx="3" fill="var(--risk)" opacity="' + (0.5 - i * 0.1) + '"/>'; }).join("") +
      '<rect x="126" y="38" width="48" height="46" rx="5" fill="var(--good-tint)" stroke="var(--good)" stroke-width="1"/>'),
    pitch: svg(200, 106,
      '<circle cx="52" cy="53" r="24" fill="var(--accent-soft)" stroke="' + A + '" stroke-width="1.8"/>' +
      txt(52, 60, "45s", { size: 15, weight: 700, anchor: "middle", fill: A }) +
      [0, 1, 2].map(function (i) { return '<rect x="94" y="' + (30 + i * 18) + '" width="' + (88 - i * 16) + '" height="9" rx="4.5" fill="' + A + '" opacity="' + (0.75 - i * 0.2) + '"/>'; }).join("")),
    proof: svg(200, 106,
      '<path d="M100 26 V42 M100 42 L44 60 M100 42 H100 M100 42 L156 60" stroke="' + BD + '" stroke-width="1.5"/>' +
      box(74, 10, 52, 18, { r: 9, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.4 }) +
      [["--good", 20], ["--warn", 76], ["--risk", 132]].map(function (d) {
        return box(d[1], 60, 48, 30, { r: 6, fill: "var(" + d[0] + "-tint)", stroke: "var(" + d[0] + ")", sw: 1.4 });
      }).join("")),
    apx: svg(200, 106, box(42, 14, 54, 74, { r: 6 }) + box(106, 26, 54, 74, { r: 6 }) +
      '<rect x="52" y="26" width="30" height="5" rx="2.5" fill="' + A + '"/>' +
      '<rect x="116" y="38" width="30" height="5" rx="2.5" fill="var(--info)"/>')
  };

  /* ============================================================
     ILLUSTRATIONS
     ============================================================ */
  var ART = {};

  ART.bet = function () {
    var body =
      box(20, 46, 200, 108, { r: 12, fill: "var(--slate-tint)" }) +
      txt(40, 74, "What goes in", { size: 12, weight: 700, fill: MU }) +
      box(40, 86, 160, 26, { r: 6, sw: 1.2 }) + txt(54, 104, "10 anonymised résumés", { size: 11.5, weight: 600 }) +
      box(40, 118, 160, 26, { r: 6, sw: 1.2 }) + txt(54, 136, "3 real job postings", { size: 11.5, weight: 600 }) +
      arrowH(226, 274, 100, "pasted in") +
      box(280, 30, 340, 140, { r: 14, fill: "var(--accent-soft)", stroke: A, sw: 2 }) +
      txt(300, 56, "One page, one endpoint", { size: 13, weight: 700, fill: A }) +
      ["Extract skills, with the line that proves each",
       "Subtract: required minus demonstrated",
       "Attach projects from a hardcoded list of ten"].map(function (t, i) {
        return box(298, 70 + i * 32, 306, 26, { r: 7, fill: "var(--card)", stroke: A, sw: 1 }) +
          txt(312, 88 + i * 32, t, { size: 10.5, weight: 600 });
      }).join("") +
      arrowH(626, 674, 100, "read cold") +
      box(680, 46, 280, 108, { r: 12, fill: "var(--good-tint)", stroke: "var(--good)", sw: 1.8 }) +
      txt(700, 74, "One advisor, on Friday", { size: 12.5, weight: 700, fill: "var(--good)" }) +
      multi(700, 96, wrapText("Reads three reports with nobody explaining anything, then answers one question:", 34),
        { size: 10.5, fill: MU, lh: 12.5 }) +
      txt(700, 140, "“Would you hand this to that student?”", { size: 11.5, weight: 700, fill: "var(--good)" }) +
      txt(490, 194, "Nine of the eleven components in the architecture are deleted. That is the plan.",
        { size: 11.5, weight: 600, fill: MU, anchor: "middle" });
    return svg(980, 208, body);
  };

  ART.week = function () {
    var out = "", n = M_.days.length, w = 176, gap = 12;
    M_.days.forEach(function (d, i) {
      var x = 20 + i * (w + gap), last = i === n - 1;
      out += box(x, 26, w, 132, { r: 12, fill: last ? "var(--accent-soft)" : "var(--card)",
        stroke: last ? A : BD, sw: last ? 2 : 1.4 });
      out += txt(x + 16, 50, d.day.toUpperCase(), { size: 10, weight: 700, fill: last ? A : MU });
      out += multi(x + 16, 70, wrapText(d.outcome, 22), { size: 11.5, weight: 700, lh: 13.5 });
      out += txt(x + 16, 142, d.tasks.length + " tasks", { size: 10.5, fill: MU });
      if (!last) out += arrowH(x + w + 1, x + w + gap - 1, 92);
    });
    out += txt(490, 184, "Each day names an outcome, not an activity.",
      { size: 11.5, weight: 600, fill: MU, anchor: "middle" });
    return svg(980, 196, out);
  };

  ART.cuts = function () {
    var keep = M_.building.length, cut = M_.cuts.length;
    var out = txt(30, 26, "Kept for Week 1", { size: 12.5, weight: 700, fill: "var(--good)" });
    M_.building.forEach(function (b, i) {
      out += box(30, 38 + i * 40, 430, 32, { r: 8, fill: "var(--good-tint)", stroke: "var(--good)", sw: 1.4 });
      out += txt(46, 58 + i * 40, b.what, { size: 11.5, weight: 700 });
    });
    out += txt(510, 26, "Deleted for Week 1", { size: 12.5, weight: 700, fill: "var(--risk)" });
    M_.cuts.forEach(function (c, i) {
      var col = i % 2, row = Math.floor(i / 2);
      out += box(510 + col * 228, 38 + row * 32, 218, 25, { r: 7, fill: "var(--risk-tint)",
        stroke: "var(--risk)", sw: 1.1, dash: "4 3" });
      out += txt(522 + col * 228, 55 + row * 32, c.cut.replace(/ \(.*\)/, ""), { size: 10.5, weight: 600, fill: MU });
    });
    out += txt(30, 218, keep + " things kept · " + cut + " things deleted",
      { size: 12, weight: 700, fill: MU });
    return svg(980, 232, out);
  };

  ART.decision = function () {
    var col = { good: "--good", warn: "--warn", risk: "--risk" };
    var out = box(320, 14, 340, 56, { r: 12, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.8 }) +
      txt(490, 36, "FRIDAY", { size: 10, weight: 700, fill: "var(--warn)", anchor: "middle" }) +
      txt(490, 56, "Would you hand this to that student?", { size: 12.5, weight: 700, anchor: "middle" }) +
      '<path d="M420 70 L180 104 M490 70 V104 M560 70 L800 104" stroke="' + BD + '" stroke-width="2" fill="none"/>';
    M_.outcomes.forEach(function (o, i) {
      var x = 20 + i * 320, c = col[o.kind];
      out += box(x, 104, 300, 116, { r: 12, fill: "var(" + c + "-tint)", stroke: "var(" + c + ")", sw: 1.6 });
      out += txt(x + 18, 128, o.outcome.toUpperCase(), { size: 11, weight: 700, fill: "var(" + c + ")" });
      out += multi(x + 18, 146, wrapText(o.when, 36), { size: 10.5, fill: MU, lh: 12 });
      out += box(x + 18, 172, 264, 34, { r: 7, fill: "var(--card)", stroke: "var(" + c + ")", sw: 1 });
      out += multi(x + 30, 188, wrapText(o.next, 42), { size: 10, weight: 600, lh: 11.5 });
    });
    return svg(980, 232, out);
  };

  ART.screen = function () {
    var out =
      box(150, 16, 680, 250, { r: 12, sw: 1.6 }) +
      '<rect x="150" y="16" width="680" height="34" rx="12" fill="var(--slate-tint)"/>' +
      '<rect x="150" y="42" width="680" height="8" fill="var(--slate-tint)"/>' +
      '<rect x="170" y="27" width="20" height="12" rx="4" fill="' + A + '"/>' +
      txt(200, 38, "Advisor Gap Report", { size: 11, weight: 700, fill: MU }) +
      box(170, 64, 640, 52, { r: 8, sw: 1.2 }) +
      txt(186, 88, "Jordan Reyes", { size: 15, weight: 700 }) +
      txt(186, 106, "Junior Data Analyst — Meridian Regional Health", { size: 10.5, fill: MU }) +
      box(686, 76, 108, 28, { r: 999, fill: "var(--good-tint)", stroke: "var(--good)", sw: 1.2 }) +
      txt(740, 94, "All checks passed", { size: 9.5, weight: 700, fill: "var(--good)", anchor: "middle" }) +
      [0, 1, 2, 3].map(function (i) {
        return box(170 + i * 162, 126, 150, 40, { r: 7, sw: 1.1 }) +
          txt(182 + i * 162, 148, ["3", "3", "6", "35"][i], { size: 15, weight: 700, fill: A }) +
          txt(182 + i * 162, 161, ["gaps", "projects", "weeks", "hours"][i], { size: 9, fill: MU });
      }).join("") +
      [0, 1, 2].map(function (i) {
        return box(170, 178 + i * 30, 440, 24, { r: 6, sw: 1.1 }) +
          '<rect x="170" y="' + (178 + i * 30) + '" width="4" height="24" rx="2" fill="var(--' + (i === 2 ? "warn" : "risk") + ')"/>' +
          txt(186, 194 + i * 30, ["Tableau dashboards", "HIPAA / health data", "Python automation"][i],
            { size: 10.5, weight: 600 }) +
          txt(430, 194 + i * 30, "quoted from the posting", { size: 9, fill: MU, anchor: "middle" });
      }).join("") +
      box(626, 178, 184, 80, { r: 7, fill: "var(--good-tint)", stroke: "var(--good)", sw: 1.2 }) +
      txt(642, 198, "Already proven", { size: 10.5, weight: 700, fill: "var(--good)" }) +
      [0, 1, 2].map(function (i) {
        return '<rect x="642" y="' + (210 + i * 14) + '" width="' + (140 - i * 24) + '" height="6" rx="3" fill="var(--good)" opacity=".4"/>';
      }).join("") +
      txt(490, 288, "A schematic. Open the real mockup for the designed screen.",
        { size: 11, fill: MU, anchor: "middle" });
    return svg(980, 300, out);
  };

  ART.tree = function () {
    var out = "", y = 30;
    [["project-blueprint/", "", 0, true],
     ["architecture.md", "what the cuts were made from", 1, false],
     ["tech-stack.md", "what the Week 1 stack was cut down from", 1, false],
     ["mvp-plan.md", "the checklist and the Friday decision", 1, false],
     ["mockup.html", "the designed screen", 1, false],
     ["one-pager.md", "the pitch", 1, false],
     ["mvp/", "", 1, true],
     ["index.html … 07-appendix.html", "this knowledge base", 2, false],
     ["assets/mvp.js", "the single data object", 2, false]].forEach(function (r) {
      var x = 26 + r[2] * 26;
      if (r[2] > 0) out += '<path d="M' + (x - 14) + " " + (y - 12) + " V" + (y - 4) + " H" + (x - 4) +
        '" stroke="' + BD + '" stroke-width="1.5" fill="none"/>';
      out += txt(x, y, r[0], { size: 12.5, weight: r[3] ? 700 : 600, fill: r[3] ? A : "var(--text)" });
      if (r[1]) out += txt(420, y, r[1], { size: 11.5, fill: MU });
      y += 28;
    });
    return svg(980, y, out);
  };

  function figure(id, title, inner, interp, isArt) {
    return '<div class="card figure" data-fig="' + id + '">' +
      '<div class="figure-head"><h3>' + title + '</h3>' +
      '<button class="expand" data-expand="' + id + '">⛶ Full screen</button></div>' +
      '<div class="figure-body' + (isArt ? " art" : "") + '">' + inner + "</div>" +
      (interp ? '<div class="interp"><b>Read this as:</b> ' + interp + "</div>" : "") + "</div>";
  }

  /* ---------- section bodies ---------- */
  var BODY = {
    summary: function () {
      return '<div class="card headline"><div class="eyebrow">The one question Week 1 answers</div>' +
        '<p style="font-size:17px;font-weight:600;margin:0 0 10px">' + M_.question + "</p>" +
        '<p style="margin:0;color:var(--muted)">' + M_.questionWhy + "</p></div>" +
        figure("bet", "The whole week, in one picture", ART.bet(),
          "ten résumés in, one advisor's verdict out. Everything between them is deliberately the smallest thing that could produce an honest answer.", true) +
        '<div class="kpis">' +
        [["Things kept", M_.building.length, "The smallest slice that tests the risk"],
         ["Things deleted", M_.cuts.length, "Of eleven architecture components"],
         ["Days", M_.days.length, "Monday to Friday, no weekend"],
         ["Reports to check", 10, "By hand, every one"]].map(function (k) {
          return '<div class="kpi"><div class="v">' + k[1] + '</div><div class="l">' + k[0] +
            '</div><div class="n">' + k[2] + "</div></div>";
        }).join("") + "</div>" +
        '<h3 class="grouphead">What you are building<span>' + M_.building.length + " things"+"</span></h3>" +
        M_.building.map(function (b) {
          return '<div class="build" data-search="' + esc((b.what + " " + b.detail + " " + b.from).toLowerCase()) + '">' +
            '<div class="b-what">' + b.what + "</div><p>" + b.detail + "</p>" +
            '<div class="b-from">From: ' + b.from + "</div></div>";
        }).join("");
    },

    plan: function () {
      return figure("week", "Five days", ART.week(),
        "Friday is not a demo day, it is a decision day. The other four exist to make Friday's answer trustworthy.", true) +
        M_.days.map(function (d, i) {
          return '<div class="day" data-search="' + esc((d.day + " " + d.outcome + " " + d.tasks.join(" ")).toLowerCase()) + '">' +
            '<div class="day-head"><span class="daynum">' + (i + 1) + "</span><div>" +
            '<div class="dayname">' + d.day + "</div><h3>" + d.outcome + "</h3></div></div>" +
            "<ul>" + d.tasks.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>";
        }).join("");
    },

    scope: function () {
      return figure("cuts", "Kept, and deleted", ART.cuts(),
        "the cuts are the plan. A Week 1 that includes auth, a queue and a deploy pipeline is Week 1 of a six-month project, and it proves nothing by Friday.", true) +
        '<h3 class="grouphead">What you are NOT building — and why that\'s safe<span>' + M_.cuts.length + " cuts</span></h3>" +
        '<div class="card"><table class="cov"><thead><tr><th>Cut</th><th>Why it\'s safe to cut this week</th></tr></thead><tbody>' +
        M_.cuts.map(function (c) {
          return '<tr data-search="' + esc((c.cut + " " + c.why).toLowerCase()) + '"><td><b>' + c.cut + "</b></td><td>" + c.why + "</td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<h3 class="grouphead">The stack, cut down to Week 1<span>from tech-stack.md</span></h3>' +
        '<div class="card"><table class="cov"><thead><tr><th>What</th><th>Using this week</th><th>Instead of</th></tr></thead><tbody>' +
        M_.stackCuts.map(function (s) {
          return '<tr data-search="' + esc((s.what + " " + s.using + " " + s.insteadOf).toLowerCase()) + '">' +
            "<td><b>" + s.what + "</b></td><td>" + s.using + '</td><td style="color:var(--muted)">' + s.insteadOf + "</td></tr>";
        }).join("") + "</tbody></table>" +
        '<div class="interp"><b>Note:</b> nothing here is a technology you\'d throw away — every row is the Week 1 shape of a row you\'ll grow into.</div></div>';
    },

    mockup: function () {
      return '<div class="card headline"><h3>' + M_.mockup.screen + "</h3>" +
        '<p style="margin:10px 0 16px">This is a designed screen with real sample content, not a wireframe — ' +
        "the point is to see whether the output looks like something an advisor would actually hand over.</p>" +
        '<a class="bigcta" href="' + M_.mockup.file + '" target="_blank" rel="noopener">' +
        "⛶ Open the mockup" + "</a>" +
        '<p style="margin:12px 0 0;font-size:12.5px;color:var(--muted)">Opens <code>project-blueprint/mockup.html</code> in a new tab. Student details are fictional.</p></div>' +
        figure("screen", "What's on the screen", ART.screen(),
          "the layout puts the receipts next to the claims. A gap without its quote would look obviously incomplete on this page, which is the point.", true) +
        '<div class="hl-grid">' + M_.mockup.highlights.map(function (h) {
          return '<div class="hl" data-search="' + esc((h.title + " " + h.note).toLowerCase()) + '">' +
            '<div class="hl-icon">' + h.icon + "</div><h4>" + h.title + "</h4><p>" + h.note + "</p></div>";
        }).join("") + "</div>";
    },

    pitch: function () {
      var p = M_.pitch;
      return '<div class="card pitchcard"><div class="eyebrow">The line</div>' +
        '<h2 class="pitchline">' + p.headline + "</h2></div>" +
        '<div class="card headline"><h3>Hand it over as a PDF</h3>' +
        '<p style="margin:10px 0 16px">' + p.pdf.note + "</p>" +
        '<a class="bigcta" href="' + p.pdf.file + '" target="_blank" rel="noopener">📄 Open the one-pager (PDF)</a>' +
        '<p style="margin:12px 0 0;font-size:12.5px;color:var(--muted)">' +
        p.pdf.pages + " page · " + p.pdf.size + " · generated with " + p.pdf.tool +
        ". Everything below is the same content, readable without opening it.</p></div>" +
        '<div class="card"><h3>😩 The problem</h3><p style="margin:0;font-size:15px">' + p.problem + "</p></div>" +
        '<div class="card"><h3>✨ What it does</h3>' +
        '<p style="margin:0 0 12px;color:var(--muted)">Drop in a résumé. Drop in the job posting. Get back:</p>' +
        p.does.map(function (d) {
          return '<div class="does" data-search="' + esc(d.text.toLowerCase()) + '"><span>' + d.icon + "</span><div>" + d.text + "</div></div>";
        }).join("") +
        '<p style="margin:12px 0 0;font-weight:700">In under a minute.</p></div>' +
        '<div class="card"><h3>🛡️ Why you can trust it</h3><p>' + p.trust + "</p>" +
        '<div class="pullquote">' + p.trustLine + "</div></div>" +
        '<div class="grid2"><div class="card"><h3>👥 Who needs this</h3><p style="margin:0">' + p.who + "</p></div>" +
        '<div class="card" style="background:var(--accent-soft);border-color:var(--accent)"><h3>💡 Why it matters</h3>' +
        '<p style="margin:0;font-size:15.5px;font-weight:600">' + p.why + "</p></div></div>" +
        '<div class="card"><h3>📈 What changes</h3><table class="cov"><thead><tr><th></th><th>Today</th><th>With this</th></tr></thead><tbody>' +
        p.changes.map(function (c) {
          return '<tr data-search="' + esc((c.today + " " + c.withIt).toLowerCase()) + '">' +
            '<td style="font-size:19px;width:44px">' + c.icon + '</td><td style="color:var(--muted)">' + c.today +
            "</td><td><b>" + c.withIt + "</b></td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<div class="card" style="text-align:center"><div class="eyebrow">Ready to see it?</div>' +
        '<p style="font-size:17px;font-weight:700;margin:0">' + p.close + "</p></div>" +
        '<p style="font-size:12px;color:var(--muted);text-align:center;margin-top:14px">' + p.caveat + "</p>";
    },

    proof: function () {
      return figure("decision", "Friday's three answers", ART.decision(),
        "the plan ends in a decision, not a demo. Two of these three outcomes are good news — only one of them means stop.", true) +
        '<div class="card" style="border-left:4px solid var(--good)"><h3>✅ What "it worked" looks like</h3><ul class="bars">' +
        M_.pass.map(function (p) { return '<li data-search="' + esc(p.toLowerCase()) + '">' + p + "</li>"; }).join("") +
        "</ul></div>" +
        '<div class="card" style="border-left:4px solid var(--risk)"><h3>❌ What "it didn\'t work" looks like</h3>' +
        '<p style="margin:0" data-search="' + esc(M_.fail.toLowerCase()) + '">' + M_.fail + "</p></div>" +
        '<h3 class="grouphead">What to do about each<span>' + M_.outcomes.length + " outcomes</span></h3>" +
        M_.outcomes.map(function (o) {
          return '<div class="outcome o-' + o.kind + '" data-search="' + esc((o.outcome + " " + o.when + " " + o.means + " " + o.next).toLowerCase()) + '">' +
            '<div class="o-top"><h4>' + o.outcome + '</h4><span>' + o.when + "</span></div>" +
            "<p>" + o.means + "</p>" +
            '<div class="o-next"><b>Next move:</b> ' + o.next + "</div></div>";
        }).join("");
    },

    appendix: function () {
      return figure("tree", "What is actually on disk", ART.tree(),
        "three deliverables plus this site, sitting beside the architecture and stack they were derived from.", true) +
        '<div class="card"><h3>Files</h3><table class="cov"><tbody>' +
        M_.artifacts.map(function (a) {
          return '<tr data-search="' + esc((a.label + " " + a.path + " " + a.note).toLowerCase()) + '">' +
            "<td><b>" + a.label + "</b></td><td><code>" + a.path + "</code></td>" +
            '<td style="color:var(--muted)">' + a.note + "</td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<div class="card" style="border-left:4px solid var(--warn)"><h3>What Week 1 deliberately proves nothing about</h3><ul class="bars">' +
        M_.provesNothing.map(function (n) { return '<li data-search="' + esc(n.toLowerCase()) + '">' + n + "</li>"; }).join("") +
        '</ul><div class="interp" style="background:var(--warn-tint)"><b>Why this list matters:</b> ' +
        "a good Week 1 result is easy to over-read. This is the list that stops somebody claiming the product is proven when only one assumption is.</div></div>";
    }
  };

  var SECTIONS = [
    { id: "summary", file: "01-summary.html", nav: "The Bet", title: "The Week 1 Bet", thumb: "bet",
      lede: "The one question five days can actually answer, and the smallest thing that answers it.",
      count: function () { return M_.building.length + " kept · " + M_.cuts.length + " cut"; } },
    { id: "plan", file: "02-plan.html", nav: "Five Days", title: "Five Days", thumb: "week",
      lede: "Monday to Friday, each day named by its outcome rather than its activity.",
      count: function () { return M_.days.reduce(function (a, d) { return a + d.tasks.length; }, 0) + " tasks"; } },
    { id: "scope", file: "03-scope.html", nav: "What's Cut", title: "What's In, What's Cut", thumb: "cuts",
      lede: "Nine of eleven architecture components are deleted. This is why that's safe.",
      count: function () { return M_.cuts.length + " cuts"; } },
    { id: "mockup", file: "04-mockup.html", nav: "The Mockup", title: "What It Could Look Like", thumb: "mock",
      lede: "The finished gap report — a designed screen with real sample content, not a wireframe.",
      count: function () { return M_.mockup.highlights.length + " things to notice"; } },
    { id: "pitch", file: "05-pitch.html", nav: "The Pitch", title: "How to Explain It", thumb: "pitch",
      lede: "For a dean, a funder, or a colleague in a hallway. No jargon anywhere.",
      count: function () { return M_.pitch.changes.length + " things that change"; } },
    { id: "proof", file: "06-proof.html", nav: "Did It Work?", title: "Did It Work?", thumb: "proof",
      lede: "The bar somebody else could apply without you in the room — and what each answer means.",
      count: function () { return M_.outcomes.length + " outcomes"; } },
    { id: "appendix", file: "07-appendix.html", nav: "Appendix", title: "Appendix", thumb: "apx",
      lede: "The files, and the honest list of what this week cannot tell you.",
      count: function () { return M_.artifacts.length + " files"; } }
  ];
  function sectionOf(id) { return SECTIONS.filter(function (s) { return s.id === id; })[0]; }

  /* ---------- search ---------- */
  var STOP = { the:1,a:1,an:1,is:1,are:1,of:1,to:1,in:1,on:1,for:1,and:1,or:1,it:1,this:1,that:1,
    what:1,why:1,how:1,does:1,do:1,i:1,my:1,we:1,you:1,be:1,with:1,from:1,at:1,as:1,by:1,can:1,will:1 };

  var INDEX = (function () {
    var out = [];
    function add(sec, title, text, kind) {
      out.push({ sec: sec, title: title, text: text, kind: kind, hay: (title + " " + text).toLowerCase() });
    }
    add("summary", "The one question", M_.question + " " + M_.questionWhy, "The bet");
    M_.building.forEach(function (b) { add("summary", b.what, b.detail + " From: " + b.from, "Building"); });
    M_.days.forEach(function (d) { add("plan", d.day + " — " + d.outcome, d.tasks.join(". "), "Day"); });
    M_.cuts.forEach(function (c) { add("scope", "Cut: " + c.cut, c.why, "Cut"); });
    M_.stackCuts.forEach(function (s) { add("scope", s.what, "Using " + s.using + " instead of " + s.insteadOf, "Stack cut"); });
    M_.mockup.highlights.forEach(function (h) { add("mockup", h.title, h.note, "On the screen"); });
    add("pitch", M_.pitch.headline, M_.pitch.problem + " " + M_.pitch.why, "Pitch");
    M_.pitch.does.forEach(function (d) { add("pitch", d.text, M_.pitch.trust, "What it does"); });
    M_.pitch.changes.forEach(function (c) { add("pitch", c.withIt, "Today: " + c.today, "What changes"); });
    M_.pass.forEach(function (p, i) { add("proof", "Pass condition " + (i + 1), p, "Success bar"); });
    add("proof", "What failure looks like", M_.fail, "Failure");
    M_.outcomes.forEach(function (o) { add("proof", o.outcome + " — " + o.when, o.means + " Next: " + o.next, "Outcome"); });
    M_.provesNothing.forEach(function (n) { add("appendix", "Proves nothing about", n, "Limit"); });
    M_.artifacts.forEach(function (a) { add("appendix", a.label, a.path + " — " + a.note, "File"); });
    return out;
  })();

  function terms(q) {
    return String(q).toLowerCase().split(/[^a-z0-9+.]+/).filter(function (t) { return t.length > 1 && !STOP[t]; });
  }
  function occurrences(hay, t) { var n = 0, i = 0; while ((i = hay.indexOf(t, i)) !== -1) { n++; i += t.length; } return n; }
  function searchMvp(q, limit) {
    var ts = terms(q); if (!ts.length) return [];
    var phrase = String(q).toLowerCase().trim();
    return INDEX.map(function (e) {
      var score = 0;
      ts.forEach(function (t) {
        var n = occurrences(e.hay, t);
        if (n) score += n * 2 + (e.title.toLowerCase().indexOf(t) !== -1 ? 8 : 0);
        else { var stem = t.length > 5 ? t.slice(0, t.length - 2) : t; if (stem.length > 3 && e.hay.indexOf(stem) !== -1) score += 1; }
      });
      if (phrase.length > 4 && e.hay.indexOf(phrase) !== -1) score += 12;
      return { e: e, score: score };
    }).filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; }).slice(0, limit || 8);
  }
  function snippet(text, ts, len) {
    var low = text.toLowerCase(), at = -1;
    ts.some(function (t) { var i = low.indexOf(t); if (i !== -1) { at = i; return true; } return false; });
    var start = at > 60 ? at - 50 : 0;
    return (start > 0 ? "…" : "") + text.slice(start, start + (len || 150)) + (start + (len || 150) < text.length ? "…" : "");
  }
  function mark(html, ts) {
    var out = esc(html);
    ts.forEach(function (t) { out = out.replace(new RegExp("(" + rx(t) + ")", "ig"), "<mark>$1</mark>"); });
    return out;
  }

  /* ---------- chrome ---------- */
  function chrome(activeId) {
    var links = SECTIONS.map(function (s) {
      return '<a class="nav-link' + (s.id === activeId ? " active" : "") + '" href="' + s.file + '">' + s.nav + "</a>";
    }).join("");
    var crumb = activeId
      ? '<a href="index.html">Command Center</a><span aria-hidden="true">›</span><b>' + sectionOf(activeId).title + "</b>"
      : "<b>Command Center</b>";
    return '<div id="progress"></div><nav class="top"><div class="nav-inner">' +
      '<a class="brand" href="index.html"><span class="mark">C</span><span>' + M_.project +
      "<small>Colaberry · Week 1 MVP</small></span></a>" +
      '<div class="nav-links" id="navlinks">' + links + '</div><div class="nav-tools">' +
      '<div class="search-wrap"><input id="search" type="search" placeholder="Search everything  /" autocomplete="off">' +
      '<div class="results" id="results" hidden></div></div>' +
      '<button class="icon-btn" id="theme" title="Toggle theme">◐</button>' +
      '<button class="icon-btn" id="print" title="Print">⎙</button>' +
      '<button class="icon-btn" id="hamburger" title="Menu">☰</button></div></div></nav>' +
      '<div class="crumbs">' + crumb + "</div>";
  }
  function footer() {
    return "<footer><div>Generated " + M_.generated + " · From <code>" + M_.basis.join("</code> and <code>") +
      "</code></div><div>Colaberry · Week 1 MVP</div></footer>";
  }
  function lightboxMarkup() {
    return '<div id="lightbox" role="dialog" aria-modal="true"><div class="lb-bar"><span class="title" id="lb-title"></span>' +
      '<button class="icon-btn" id="lb-out">−</button><span class="zoom-val" id="lb-zoom">100%</span>' +
      '<button class="icon-btn" id="lb-in">+</button><button class="icon-btn" id="lb-reset">⟲</button>' +
      '<button class="icon-btn" id="lb-close">✕</button></div>' +
      '<div class="lb-stage"><div class="lb-inner" id="lb-inner"></div></div></div>';
  }
  function agentMarkup(activeId) {
    return '<button id="ask-btn">✦ Ask</button><aside id="agent"><div class="ag-head">' +
      '<h3>Ask the plan<span class="sub">Search works with no key at all</span></h3>' +
      '<button class="icon-btn" id="ag-close">✕</button></div><div class="ag-config">' +
      '<div class="ag-mode"><button id="mode-local" class="on">🔍 Search · no key</button>' +
      '<button id="mode-llm">✦ Claude · needs key</button></div>' +
      '<div id="ag-llm-fields" hidden><div><label for="ag-key">Your Anthropic API key</label>' +
      '<input id="ag-key" type="password" placeholder="sk-ant-..." autocomplete="off"></div>' +
      '<div class="ag-row" style="margin-top:9px"><div><label for="ag-model">Model</label>' +
      '<select id="ag-model"><option value="claude-opus-5">Claude Opus 5</option>' +
      '<option value="claude-sonnet-5">Claude Sonnet 5</option>' +
      '<option value="claude-haiku-4-5">Claude Haiku 4.5</option></select></div>' +
      '<div><label for="ag-scope">Scope</label><select id="ag-scope">' +
      (activeId ? '<option value="section">This section</option>' : "") +
      '<option value="all">Whole plan</option></select></div></div>' +
      '<p class="ag-note" style="margin-top:9px"><b>Your key stays in this browser</b> and is sent only to api.anthropic.com. ' +
      "Anyone with access to this machine can read it.</p></div></div>" +
      '<div class="ag-log" id="ag-log"></div><div class="ag-input">' +
      '<textarea id="ag-text" rows="1" placeholder="Ask about this plan…"></textarea>' +
      '<button id="ag-send">Send</button></div></aside>';
  }

  /* ---------- fullscreen ---------- */
  var zoom = 1;
  function applyZoom() {
    var inner = document.getElementById("lb-inner"); if (!inner) return;
    inner.style.transform = "scale(" + zoom + ")";
    document.getElementById("lb-zoom").textContent = Math.round(zoom * 100) + "%";
  }
  function openFigure(figId) {
    var fig = document.querySelector('[data-fig="' + figId + '"]'); if (!fig) return;
    var svgEl = fig.querySelector(".figure-body svg"), inner = document.getElementById("lb-inner");
    inner.innerHTML = "";
    if (svgEl) {
      var clone = svgEl.cloneNode(true);
      var vb = (svgEl.getAttribute("viewBox") || "").split(/\s+/);
      var natural = vb.length === 4 ? parseFloat(vb[2]) : svgEl.clientWidth;
      clone.removeAttribute("style"); clone.removeAttribute("class");
      clone.setAttribute("width", Math.max(natural, 960)); clone.removeAttribute("height");
      clone.style.maxWidth = "none"; inner.appendChild(clone);
    }
    document.getElementById("lb-title").textContent = fig.querySelector(".figure-head h3").textContent;
    zoom = 1; applyZoom();
    document.getElementById("lightbox").classList.add("on");
    document.getElementById("lb-close").focus();
  }
  function closeFigure() {
    document.getElementById("lightbox").classList.remove("on");
    document.getElementById("lb-inner").innerHTML = "";
  }

  /* ---------- Ask panel ---------- */
  var AGENT_SCOPE = { summary: ["question","questionWhy","building"], plan: ["days"],
    scope: ["cuts","stackCuts"], mockup: ["mockup"], pitch: ["pitch"],
    proof: ["pass","fail","outcomes"], appendix: ["artifacts","provesNothing"] };
  function scopedMvp(scope, activeId) {
    if (scope === "all" || !activeId) return M_;
    var out = { project: M_.project, question: M_.question };
    (AGENT_SCOPE[activeId] || []).forEach(function (k) { out[k] = M_[k]; });
    return out;
  }

  function initAgent(activeId) {
    var panel = document.getElementById("agent"), log = document.getElementById("ag-log");
    var textEl = document.getElementById("ag-text"), sendEl = document.getElementById("ag-send");
    var keyEl = document.getElementById("ag-key"), modelEl = document.getElementById("ag-model");
    var scopeEl = document.getElementById("ag-scope"), fields = document.getElementById("ag-llm-fields");
    var bLocal = document.getElementById("mode-local"), bLLM = document.getElementById("mode-llm");
    var history = [], mode = "local";

    var sk = store("bp-key"); if (sk) keyEl.value = sk;
    var sm = store("bp-model"); if (sm) modelEl.value = sm;
    keyEl.addEventListener("change", function () { store("bp-key", keyEl.value.trim()); });
    modelEl.addEventListener("change", function () { store("bp-model", modelEl.value); });

    function setMode(m) {
      mode = m;
      bLocal.classList.toggle("on", m === "local");
      bLLM.classList.toggle("on", m === "llm");
      fields.hidden = m !== "llm";
      textEl.placeholder = m === "local" ? "Search the plan…" : "Ask about this plan…";
    }
    bLocal.onclick = function () { setMode("local"); };
    bLLM.onclick = function () { setMode("llm"); };

    function add(role, t) {
      var d = document.createElement("div"); d.className = "msg " + role; d.textContent = t;
      log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
    }
    function addHTML(role, h) {
      var d = document.createElement("div"); d.className = "msg " + role; d.innerHTML = h;
      log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
    }

    add("bot", "Two ways to use this. Search needs no key and works offline — it looks through the plan, the cuts, the pitch and the decision. Claude needs your own API key and answers in prose, still only from this plan.");
    var wrap = document.createElement("div"); wrap.className = "starters";
    ["why cut the queue", "what happens friday", "what it proves", "monday", "who is it for"].forEach(function (s) {
      var b = document.createElement("button"); b.className = "starter"; b.textContent = s;
      b.onclick = function () { textEl.value = s; send(); }; wrap.appendChild(b);
    });
    log.appendChild(wrap);

    function answerLocally(q) {
      var ts = terms(q), hits = searchMvp(q, 5);
      if (!hits.length) {
        addHTML("bot", "Nothing in this plan matches <b>" + esc(q) + "</b>. If it's something you expected Week 1 to cover, check the Appendix — it may be on the list of things this week deliberately proves nothing about.");
        return;
      }
      var html = "<b>" + hits.length + (hits.length === 1 ? " passage" : " passages") + "</b> match that:";
      hits.forEach(function (h) {
        var sec = sectionOf(h.e.sec);
        html += '<a class="hit" href="' + sec.file + '"><span class="h-top"><span class="h-sec">' + esc(sec.nav) +
          '</span><span class="h-title">' + mark(h.e.title, ts) + '</span></span><span class="h-snip">' +
          mark(snippet(h.e.text, ts, 190), ts) + "</span></a>";
      });
      addHTML("bot", html);
    }

    function answerWithClaude(q) {
      var key = keyEl.value.trim();
      if (!key) { add("err", "Paste your API key, or switch back to Search — that mode needs no key."); keyEl.focus(); return; }
      store("bp-key", key);
      var thinking = add("bot", "Thinking…"); sendEl.disabled = true;
      var system = 'You are an assistant embedded in a Week 1 MVP plan for a project called "' + M_.project + '".\n\n' +
        "Answer ONLY from the plan JSON below. If it is not covered, say so plainly rather than inventing scope. " +
        "Protect the plan's discipline: never suggest adding back something the plan deliberately cut, unless the user " +
        "explicitly asks what it would cost. Plain sentences, no markdown headers, no bullet walls.\n\n" +
        "PLAN JSON:\n" + JSON.stringify(scopedMvp(scopeEl.value, activeId), null, 1);
      history.push({ role: "user", content: q });
      var body = { model: modelEl.value, max_tokens: 16000, system: system, messages: history };
      if (modelEl.value !== "claude-haiku-4-5") body.output_config = { effort: "low" };
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key,
          "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify(body)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, json: j }; }); })
        .then(function (res) {
          thinking.remove();
          if (!res.ok) {
            var m = (res.json && res.json.error && res.json.error.message) || "HTTP " + res.status;
            if (res.status === 401) m = "That key was rejected. Check it, or use Search mode — it needs no key.";
            if (res.status === 429) m = "Rate limited. Use Search mode meanwhile.";
            add("err", m); history.pop(); sendEl.disabled = false; return;
          }
          if (res.json.stop_reason === "refusal") {
            add("err", "The model declined to answer that one."); history.pop(); sendEl.disabled = false; return;
          }
          var text = (res.json.content || []).filter(function (b) { return b.type === "text"; })
            .map(function (b) { return b.text; }).join("\n").trim() || "Empty answer — try rephrasing.";
          add("bot", text); history.push({ role: "assistant", content: text }); sendEl.disabled = false;
        }).catch(function () {
          thinking.remove();
          add("err", "Could not reach the API. If you opened this from disk the browser may be blocking it — " +
            'serve the folder ("python -m http.server"). Search mode keeps working either way.');
          history.pop(); sendEl.disabled = false;
        });
    }

    function send() {
      var q = textEl.value.trim(); if (!q) return;
      textEl.value = ""; add("user", q);
      if (mode === "local") answerLocally(q); else answerWithClaude(q);
    }
    sendEl.onclick = send;
    textEl.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
    document.getElementById("ask-btn").onclick = function () { panel.classList.add("on"); textEl.focus(); };
    document.getElementById("ag-close").onclick = function () { panel.classList.remove("on"); };
    setMode("local");
  }

  /* ---------- page behaviour ---------- */
  function wire(activeId) {
    try {
      var saved = store("bp-theme");
      if (saved) document.documentElement.dataset.theme = saved;
      else if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
    } catch (e) {}
    document.getElementById("theme").onclick = function () {
      var root = document.documentElement;
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      store("bp-theme", root.dataset.theme);
    };
    document.getElementById("print").onclick = function () { print(); };
    document.getElementById("hamburger").onclick = function () { document.getElementById("navlinks").classList.toggle("open"); };

    var prog = document.getElementById("progress"), totop = document.getElementById("totop");
    addEventListener("scroll", function () {
      var h = document.documentElement;
      prog.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + "%";
      totop.classList.toggle("on", h.scrollTop > 420);
    }, { passive: true });
    totop.onclick = function () { scrollTo({ top: 0, behavior: "smooth" }); };

    var search = document.getElementById("search"), results = document.getElementById("results");
    function runSearch() {
      var q = search.value.trim(), ts = terms(q), shown = 0;
      var items = document.querySelectorAll("[data-search]");
      items.forEach(function (el) {
        var hit = !q || el.dataset.search.indexOf(q.toLowerCase()) !== -1 ||
          ts.some(function (t) { return el.dataset.search.indexOf(t) !== -1; });
        el.hidden = !hit; if (hit) shown++;
      });
      var none = document.getElementById("no-results");
      if (none) none.hidden = shown > 0 || !items.length;
      if (!q) { results.hidden = true; results.innerHTML = ""; return; }
      var hits = searchMvp(q, 10);
      results.innerHTML = hits.length
        ? '<div class="res-head">' + hits.length + " result" + (hits.length === 1 ? "" : "s") + " across the plan</div>" +
          hits.map(function (h) {
            var sec = sectionOf(h.e.sec);
            return '<a class="res" href="' + sec.file + '"><span class="r-top"><span class="r-sec">' + esc(sec.nav) +
              '</span><span class="r-kind">' + esc(h.e.kind) + '</span></span><span class="r-title">' +
              mark(h.e.title, ts) + '</span><span class="r-snip">' + mark(snippet(h.e.text, ts, 140), ts) + "</span></a>";
          }).join("")
        : '<div class="res-none">Nothing in the plan matches “' + esc(q) + "”.</div>";
      results.hidden = false;
    }
    search.addEventListener("input", runSearch);
    search.addEventListener("focus", function () { if (search.value.trim()) runSearch(); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".search-wrap")) results.hidden = true;
    });
    addEventListener("keydown", function (e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (e.key === "/" && document.activeElement !== search && tag !== "TEXTAREA" && tag !== "INPUT") { e.preventDefault(); search.focus(); }
      if (e.key === "Escape") {
        if (document.getElementById("lightbox").classList.contains("on")) closeFigure();
        else if (!results.hidden) results.hidden = true;
        else if (document.activeElement === search) { search.value = ""; runSearch(); search.blur(); }
      }
    });
    document.addEventListener("click", function (e) {
      var exp = e.target.closest && e.target.closest("[data-expand]");
      if (exp) openFigure(exp.dataset.expand);
    });
    document.getElementById("lb-close").onclick = closeFigure;
    document.getElementById("lb-in").onclick = function () { zoom = Math.min(4, zoom + 0.25); applyZoom(); };
    document.getElementById("lb-out").onclick = function () { zoom = Math.max(0.5, zoom - 0.25); applyZoom(); };
    document.getElementById("lb-reset").onclick = function () { zoom = 1; applyZoom(); };
    document.getElementById("lightbox").addEventListener("click", function (e) { if (e.target.id === "lightbox") closeFigure(); });

    initAgent(activeId);
  }

  /* ---------- renderers ---------- */
  function renderIndex() {
    document.title = M_.project + " — Week 1 MVP Command Center";
    document.body.innerHTML = chrome(null) +
      '<div class="wrap"><header class="hero"><div class="eyebrow">Week 1 MVP · from the architecture and the stack</div>' +
      "<h1>" + M_.project + '</h1><p class="tagline">' + M_.tagline + "</p>" +
      '<div class="bar"><div class="lbl">The one question Week 1 answers</div><p>' + M_.question + "</p></div></header>" +
      figure("bet", "The whole week, in one picture", ART.bet(),
        "ten résumés in, one advisor's verdict out. Everything between is deliberately the smallest thing that could produce an honest answer.", true) +
      '<div class="cc-head"><h2>Command Center</h2><span>Everything in one spot — open a section, then come back here.</span></div>' +
      '<div class="cc-grid">' + SECTIONS.map(function (s) {
        return '<a class="tile" href="' + s.file + '" data-search="' + esc((s.title + " " + s.lede).toLowerCase()) + '">' +
          '<div class="thumb">' + THUMBS[s.thumb] + "</div><h3>" + s.title + "</h3><p>" + s.lede + "</p>" +
          '<div class="count">' + s.count() + "</div></a>";
      }).join("") + '</div><div class="empty" id="no-results" hidden>No section matches that search.</div>' +
      footer() + '</div><button id="totop">↑</button>' + lightboxMarkup() + agentMarkup(null);
    wire(null);
  }

  function render(id) {
    var i = -1;
    SECTIONS.forEach(function (s, n) { if (s.id === id) i = n; });
    if (i === -1) { renderIndex(); return; }
    var s = SECTIONS[i], prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
    document.title = s.title + " — " + M_.project;
    document.body.innerHTML = chrome(id) +
      '<div class="wrap"><div class="sec-head"><div class="eyebrow">Section ' + (i + 1) + " of " + SECTIONS.length +
      "</div><h1>" + s.title + "</h1><p>" + s.lede + "</p></div>" + BODY[id]() +
      '<div class="pagenav">' +
      (prev ? '<a href="' + prev.file + '"><span>← Previous</span>' + prev.title + "</a>"
            : '<a href="index.html"><span>←</span>Command Center</a>') +
      (next ? '<a class="nxt" href="' + next.file + '"><span>Next →</span>' + next.title + "</a>"
            : '<a class="nxt" href="index.html"><span>Back to →</span>Command Center</a>') +
      '</div><a class="back-cc" href="index.html">← Back to Command Center</a>' +
      footer() + '</div><button id="totop">↑</button>' + lightboxMarkup() + agentMarkup(id);
    wire(id);
  }

  global.Blueprint = { render: render, renderIndex: renderIndex, sections: SECTIONS,
    search: searchMvp, index: INDEX, art: ART };
})(window);
