/* Tech-stack knowledge base — shared rendering, search, illustrations,
   fullscreen figures, copy-ready prompts and the Ask panel.
   Classic script (no modules) so it works from a file:// URL. */
(function (global) {
  "use strict";
  var S = STACK; // const at top level is NOT a window property

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  var FIT = {
    great:   { icon: "🟢", label: "Great fit",         c: "--good",  t: "--good-tint" },
    good:    { icon: "🟡", label: "Good fit",          c: "--warn",  t: "--warn-tint" },
    careful: { icon: "🔴", label: "Consider carefully", c: "--risk",  t: "--risk-tint" }
  };
  function countFit(f) { return S.picks.filter(function (p) { return p.fit === f; }).length; }
  function groupOf(id) { return S.groups.filter(function (g) { return g.id === id; })[0]; }

  /* ---------- SVG primitives ---------- */
  var BD = "var(--border)", A = "var(--accent)", M = "var(--muted)";
  function svg(w, h, body) {
    return '<svg class="illus" viewBox="0 0 ' + w + " " + h + '" role="img" aria-hidden="true">' + body + "</svg>";
  }
  function box(x, y, w, h, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="' + (o.r === undefined ? 10 : o.r) + '" fill="' + (o.fill || "var(--card)") +
      '" stroke="' + (o.stroke || BD) + '" stroke-width="' + (o.sw || 1.5) + '"/>';
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
      '" stroke="' + M + '" stroke-width="1.8"/>' +
      '<path d="M' + (x2 - 8 * d) + " " + (y - 5) + " L" + x2 + " " + y + " L" + (x2 - 8 * d) + " " + (y + 5) +
      '" fill="' + M + '"/>' +
      (label ? txt((x1 + x2) / 2, y - 10, label, { size: 10.5, anchor: "middle", fill: M }) : "");
  }

  /* ---------- tile previews ---------- */
  var THUMBS = {
    summary: svg(200, 106,
      [0, 1, 2].map(function (i) {
        var f = ["great", "good", "careful"][i];
        return box(20, 16 + i * 30, 160, 24, { r: 6, fill: "var(" + FIT[f].t + ")", stroke: "var(" + FIT[f].c + ")", sw: 1.2 }) +
          '<circle cx="36" cy="' + (28 + i * 30) + '" r="6" fill="var(' + FIT[f].c + ')"/>' +
          '<rect x="52" y="' + (24 + i * 30) + '" width="' + (100 - i * 22) + '" height="7" rx="3.5" fill="var(' + FIT[f].c + ')" opacity=".35"/>';
      }).join("")),
    stack: svg(200, 106, [0, 1, 2, 3].map(function (i) {
      return box(24, 12 + i * 23, 152, 19, { r: 5, fill: i === 3 ? "var(--warn-tint)" : "var(--card)",
        stroke: i === 3 ? "var(--warn)" : BD, sw: 1.2 }) +
        '<rect x="34" y="' + (18 + i * 23) + '" width="' + (70 - i * 8) + '" height="6" rx="3" fill="' + A + '" opacity="' + (1 - i * .18) + '"/>';
    }).join("")),
    fit: (function () {
      var g = countFit("great"), a = countFit("good"), r = countFit("careful"), t = g + a + r || 1;
      return svg(200, 106,
        '<rect x="20" y="42" width="' + (160 * g / t) + '" height="26" rx="6" fill="var(--good)"/>' +
        '<rect x="' + (20 + 160 * g / t) + '" y="42" width="' + (160 * a / t) + '" height="26" fill="var(--warn)"/>' +
        '<rect x="' + (20 + 160 * (g + a) / t) + '" y="42" width="' + (160 * r / t) + '" height="26" rx="6" fill="var(--risk)"/>' +
        txt(100, 88, g + " · " + a + " · " + r, { size: 13, weight: 700, anchor: "middle", fill: M }));
    })(),
    runs: svg(200, 106,
      box(16, 30, 48, 46, { r: 7, fill: "var(--accent-soft)", stroke: A, sw: 1.5 }) +
      box(76, 20, 62, 66, { r: 7, fill: "var(--info-tint)", stroke: "var(--info)", sw: 1.5 }) +
      box(150, 30, 40, 46, { r: 7, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.5 }) +
      '<path d="M66 53 H74 M140 53 H148" stroke="' + M + '" stroke-width="1.8"/>'),
    learn: svg(200, 106, [0, 1, 2, 3, 4, 5].map(function (i) {
      var x = 22 + i * 27, h = 12 + i * 11;
      return '<rect x="' + x + '" y="' + (92 - h) + '" width="20" height="' + h + '" rx="4" fill="' + A + '" opacity="' + (0.35 + i * 0.13) + '"/>';
    }).join("")),
    alts: svg(200, 106,
      '<path d="M100 26 V44 M100 44 L52 62 M100 44 L148 62" stroke="' + BD + '" stroke-width="1.5"/>' +
      box(70, 10, 60, 18, { r: 9, fill: "var(--accent-soft)", stroke: A, sw: 1.5 }) +
      box(24, 62, 56, 32, { r: 6, fill: "var(--good-tint)", stroke: "var(--good)", sw: 1.3 }) +
      box(120, 62, 56, 32, { r: 6, fill: "var(--slate-tint)", stroke: M, sw: 1.3 })),
    dec: svg(200, 106, [["low", "--good", 0], ["low", "--good", 1], ["medium", "--warn", 2], ["high", "--risk", 3]].map(function (d, i) {
      return box(24, 14 + i * 23, 152, 18, { r: 5, fill: "var(" + d[1] + "-tint)", stroke: "var(" + d[1] + ")", sw: 1.2 }) +
        '<rect x="34" y="' + (19 + i * 23) + '" width="' + (40 + i * 30) + '" height="7" rx="3.5" fill="var(' + d[1] + ')" opacity=".5"/>';
    }).join("")),
    apx: svg(200, 106, box(42, 14, 54, 74, { r: 6 }) + box(106, 26, 54, 74, { r: 6 }) +
      '<rect x="52" y="26" width="30" height="5" rx="2.5" fill="' + A + '"/>' +
      '<rect x="116" y="38" width="30" height="5" rx="2.5" fill="var(--info)"/>')
  };

  /* ============================================================
     ILLUSTRATIONS — generated from STACK
     ============================================================ */
  var ART = {};

  /* The whole stack as bands, colour-coded by fit */
  ART.stack = function () {
    var y = 14, out = "";
    S.groups.forEach(function (g) {
      var items = S.picks.filter(function (p) { return p.group === g.id; });
      if (!items.length) return;
      var rows = [[]], cw = 0, maxW = 748;
      items.forEach(function (p) {
        var w = Math.min(p.tech.length * 6.4 + 40, 330);
        if (cw + w > maxW && rows[rows.length - 1].length) { rows.push([]); cw = 0; }
        rows[rows.length - 1].push({ p: p, w: w });
        cw += w + 10;
      });
      var bh = rows.length * 38 + (rows.length - 1) * 10 + 26;
      out += box(16, y, 948, bh, { fill: "var(--slate-tint)", stroke: BD, r: 12 });
      out += multi(34, y + bh / 2 - 6, wrapText(g.label, 18), { size: 12, weight: 700, fill: M, lh: 14 });
      var cy = y + 13;
      rows.forEach(function (row) {
        var cx = 200;
        row.forEach(function (it) {
          var f = FIT[it.p.fit];
          out += box(cx, cy, it.w, 38, { r: 8, fill: "var(" + f.t + ")", stroke: "var(" + f.c + ")", sw: 1.4 });
          out += '<circle cx="' + (cx + 16) + '" cy="' + (cy + 19) + '" r="6" fill="var(' + f.c + ')"/>';
          out += txt(cx + 30, cy + 24, it.p.tech.split(/[—(]/)[0].trim(), { size: 11.5, weight: 600 });
          cx += it.w + 10;
        });
        cy += 48;
      });
      y += bh + 12;
    });
    return svg(980, y + 2, out);
  };

  /* Proportional fit bar, with the red rows called out beneath it */
  ART.fitBar = function () {
    var total = S.picks.length, X = 30, W = 920, out = "", cx = X;
    ["great", "good", "careful"].forEach(function (f) {
      var n = countFit(f); if (!n) return;
      var w = (n / total) * W, mid = cx + (w - 4) / 2;
      out += box(cx, 40, w - 4, 58, { r: 8, fill: "var(" + FIT[f].c + ")", stroke: "var(" + FIT[f].c + ")" });
      out += txt(mid, 68, FIT[f].icon + "  " + n, { size: 17, weight: 700, fill: "#fff", anchor: "middle" });
      out += txt(mid, 88, FIT[f].label, { size: 11, fill: "#fff", anchor: "middle" });
      cx += w;
    });
    out += txt(X, 126, "Every recommendation, weighted by how confident this stack is in it",
      { size: 11.5, weight: 600, fill: M });

    var reds = S.picks.filter(function (p) { return p.fit === "careful"; });
    var gap = 16, n = Math.max(reds.length, 1), cardW = (W - gap * (n - 1)) / n;
    var titleMax = Math.max(12, Math.floor((cardW - 26) / 6.1));
    var techMax = Math.max(14, Math.floor((cardW - 26) / 5.4));
    var laid = reds.map(function (p) {
      var t = wrapText("🔴 " + p.component, titleMax), k = wrapText(p.tech, techMax);
      return { p: p, t: t, k: k, h: 26 + t.length * 14 + k.length * 12 };
    });
    var cardH = laid.reduce(function (m, c) { return Math.max(m, c.h); }, 56);
    laid.forEach(function (c, i) {
      var bx = X + i * (cardW + gap);
      out += box(bx, 142, cardW, cardH, { r: 9, fill: "var(--risk-tint)", stroke: "var(--risk)", sw: 1.4 });
      out += multi(bx + 14, 162, c.t, { size: 11.5, weight: 700, fill: "var(--risk)", lh: 14 });
      out += multi(bx + 14, 168 + c.t.length * 14, c.k, { size: 10.5, fill: M, lh: 12 });
    });
    return svg(980, 142 + cardH + 12, out);
  };

  /* Where each thing actually runs */
  ART.topology = function () {
    var kindColor = { entry: ["--accent", "--accent-soft"], build: ["--info", "--info-tint"], external: ["--warn", "--warn-tint"] };
    var n = S.runsOn.length, gap = 30, x = 18;
    /* the middle band holds the most, so give it the extra room; never exceed the canvas */
    var total = 980 - 36 - gap * (n - 1), wide = Math.round(total * 0.42), narrow = Math.round((total - wide) / (n - 1));
    var out = "", tallest = 0, headLines = 1;
    S.runsOn.forEach(function (b, bi) {
      var w = (bi === 1 && n > 2) ? wide : narrow;
      headLines = Math.max(headLines, wrapText(b.box, Math.floor(w / 7.4)).length);
    });
    S.runsOn.forEach(function (b, bi) {
      var w = (bi === 1 && n > 2) ? wide : narrow;
      var c = kindColor[b.kind] || kindColor.build;
      var head = wrapText(b.box, Math.floor(w / 7.4));
      var iy = 58 + headLines * 15;
      var h = iy - 24 + b.items.length * 29 + 14;
      tallest = Math.max(tallest, h);
      out += box(x, 24, w, h, { r: 14, fill: "var(" + c[1] + ")", stroke: "var(" + c[0] + ")", sw: 1.8 });
      out += multi(x + 18, 50, head, { size: 12.5, weight: 700, fill: "var(" + c[0] + ")", lh: 15 });
      b.items.forEach(function (it, i) {
        out += box(x + 16, iy + i * 29, w - 32, 23, { r: 6, fill: "var(--card)", stroke: "var(" + c[0] + ")", sw: 1 });
        out += txt(x + 27, iy + 15.5 + i * 29, it, { size: 10.8, weight: 600 });
      });
      if (bi < n - 1) out += arrowH(x + w + 3, x + w + gap - 3, 96);
      x += w + gap;
    });
    return svg(980, 24 + tallest + 16, out);
  };

  /* Learning ladder */
  ART.ladder = function () {
    var n = S.learn.length, gap = 18;
    var cw = Math.min(150, Math.floor((980 - 48 - gap * (n - 1)) / Math.max(n, 1)));
    var step = cw + gap, base = 178, out = "";
    var wrapAt = Math.max(10, Math.floor((cw - 24) / 6.4));
    var tallest = 0;
    S.learn.forEach(function (l, i) { tallest = Math.max(tallest, wrapText(l.what, wrapAt).length); });
    var minH = 34 + tallest * 13;
    S.learn.forEach(function (l, i) {
      var x = 24 + i * step, h = minH + i * 14, y = base - h;
      var tint = l.when === "First" ? "--good" : l.when === "Next" ? "--warn" : "--slate";
      out += box(x, y, cw, h, { r: 9, fill: "var(" + tint + "-tint)", stroke: "var(" + tint + ")", sw: 1.4 });
      out += txt(x + 12, y + 20, l.when.toUpperCase(), { size: 9.5, weight: 700, fill: "var(" + tint + ")" });
      out += multi(x + 12, y + 38, wrapText(l.what, wrapAt), { size: 11.5, weight: 700, lh: 13 });
      out += txt(x + cw / 2, base + 18, String(l.order), { size: 11, weight: 700, fill: M, anchor: "middle" });
      if (i < n - 1) out += arrowH(x + cw + 3, x + step - 3, y + h / 2);
    });
    return svg(980, base + 26, out);
  };

  /* Lock-in scale */
  ART.locks = function () {
    var order = { low: 0, medium: 1, high: 2 };
    var col = { low: "--good", medium: "--warn", high: "--risk" };
    var out = txt(30, 24, "How hard would it be to change your mind later?", { size: 12, weight: 700, fill: M });
    var sorted = S.decisions.slice().sort(function (a, b) { return order[a.lock] - order[b.lock]; });
    sorted.forEach(function (d, i) {
      var y = 40 + i * 34, w = [180, 380, 620][order[d.lock]];
      out += box(30, y, w, 26, { r: 7, fill: "var(" + col[d.lock] + "-tint)", stroke: "var(" + col[d.lock] + ")", sw: 1.3 });
      out += txt(44, y + 18, d.decision, { size: 11.5, weight: 600 });
      out += txt(w + 44, y + 18, d.lock + " lock-in", { size: 11, weight: 700, fill: "var(" + col[d.lock] + ")" });
    });
    return svg(980, 40 + sorted.length * 34 + 12, out);
  };

  ART.tree = function () {
    var rows = [
      ["project-blueprint/", "", 0, true],
      ["architecture.md", "what this stack is based on", 1, false],
      ["tech-stack.md", "source of truth for these pages", 1, false],
      ["stack/", "", 1, true],
      ["index.html", "Command Center", 2, false],
      ["01-summary.html … 08-appendix.html", "one page per section", 2, false],
      ["assets/stack.js", "the single data object", 2, false],
      ["assets/site.js", "rendering, search, Ask panel", 2, false],
      ["assets/site.css", "Colaberry styles", 2, false]
    ];
    var out = "", y = 30;
    rows.forEach(function (r) {
      var x = 26 + r[2] * 26;
      if (r[2] > 0) out += '<path d="M' + (x - 14) + " " + (y - 12) + " V" + (y - 4) + " H" + (x - 4) +
        '" stroke="' + BD + '" stroke-width="1.5" fill="none"/>';
      out += txt(x, y, r[0], { size: 12.5, weight: r[3] ? 700 : 600, fill: r[3] ? A : "var(--text)" });
      if (r[1]) out += txt(420, y, r[1], { size: 11.5, fill: M });
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

  /* Figure captions live in STACK so no interpretation is written twice. */
  function cap(id) { return (S.figures && S.figures[id]) || ""; }

  function fitBadge(f) {
    return '<span class="fitbadge" style="background:var(' + FIT[f].t + ');color:var(' + FIT[f].c + ')">' +
      FIT[f].icon + " " + FIT[f].label + "</span>";
  }
  function promptBlock(p) {
    return '<div class="promptbox"><div class="pb-head"><span>Learn more — paste this into Claude</span>' +
      '<button class="copy" data-copy="' + esc(p.prompt) + '">⧉ Copy</button></div>' +
      '<div class="pb-text">' + esc(p.prompt) + "</div></div>";
  }

  /* ---------- section bodies ---------- */
  var BODY = {
    summary: function () {
      return '<div class="card headline"><h3>The headline</h3><p style="margin:0;font-size:15.5px">' + S.headline + "</p></div>" +
        figure("fitbar", "Every recommendation, by confidence", ART.fitBar(), cap("fitbar"), true) +
        '<div class="card"><h3>What the ratings mean</h3><div class="ratekey">' +
        S.ratingKey.map(function (r) {
          return '<div class="rk" style="border-color:var(' + FIT[r.fit].c + ')">' +
            '<div class="rk-top">' + r.icon + " <b>" + r.label + "</b></div><p>" + r.meaning + "</p></div>";
        }).join("") + "</div>" +
        '<div class="interp" style="background:var(--warn-tint)"><b>Note:</b> ' + S.ratingNote + "</div></div>" +
        '<div class="kpis">' +
        [["Recommendations", S.picks.length, "One per component, plus what the data flow needs"],
         ["Great fit", countFit("great"), "Settled — pick it and move on"],
         ["Good fit", countFit("good"), "Works, with a caveat worth reading"],
         ["Consider carefully", countFit("careful"), "Where this plan is most likely to hurt"]]
          .map(function (k) {
            return '<div class="kpi"><div class="v">' + k[1] + '</div><div class="l">' + k[0] +
              '</div><div class="n">' + k[2] + "</div></div>";
          }).join("") + "</div>";
    },

    stack: function () {
      return figure("stacklayers", "The whole stack, colour-coded", ART.stack(), cap("stacklayers"), true) +
        S.groups.map(function (g) {
          var items = S.picks.filter(function (p) { return p.group === g.id; });
          if (!items.length) return "";
          return '<h3 class="grouphead">' + g.label + '<span>' + g.note + "</span></h3>" +
            items.map(function (p) {
              return '<article class="pick" data-search="' +
                esc((p.component + " " + p.tech + " " + p.why + " " + (p.caveat || "")).toLowerCase()) +
                '" style="--fc:var(' + FIT[p.fit].c + ')">' +
                '<div class="pick-top"><div><div class="pick-comp">' + p.component + "</div>" +
                '<div class="pick-tech">' + p.tech + "</div></div>" + fitBadge(p.fit) + "</div>" +
                "<p>" + p.why + "</p>" +
                (p.caveat ? '<div class="caveat"><b>Read this twice:</b> ' + p.caveat + "</div>" : "") +
                promptBlock(p) + "</article>";
            }).join("");
        }).join("") +
        '<div class="empty" id="no-results" hidden>Nothing on this page matches that search.</div>';
    },

    fit: function () {
      return figure("fitbar2", "The spread", ART.fitBar(), cap("fitbar2"), true) +
        ["careful", "good", "great"].map(function (f) {
          var items = S.picks.filter(function (p) { return p.fit === f; });
          return '<h3 class="grouphead">' + FIT[f].icon + " " + FIT[f].label +
            "<span>" + items.length + " of " + S.picks.length + "</span></h3>" +
            '<div class="card" style="border-left:4px solid var(' + FIT[f].c + ')"><table class="cov"><tbody>' +
            items.map(function (p) {
              return '<tr data-search="' + esc((p.component + " " + p.tech).toLowerCase()) + '">' +
                "<td><b>" + p.component + "</b><br><span style=\"color:var(--muted);font-size:12.5px\">" + p.tech + "</span></td>" +
                "<td>" + (p.caveat || p.why) + "</td></tr>";
            }).join("") + "</tbody></table></div>";
        }).join("");
    },

    runs: function () {
      return figure("topo", "What runs where", ART.topology(), cap("topo"), true) +
        '<div class="card"><h3>' + S.runsNote.title + '</h3><p style="margin:0">' + S.runsNote.text + "</p></div>";
    },

    learn: function () {
      return figure("ladder", "What to learn, in order", ART.ladder(), cap("ladder"), true) +
        '<div class="card"><table class="cov"><thead><tr><th>When</th><th>What</th><th>Why this one</th></tr></thead><tbody>' +
        S.learn.map(function (l) {
          var tint = l.when === "First" ? "--good" : l.when === "Next" ? "--warn" : "--slate";
          return '<tr data-search="' + esc((l.what + " " + l.why).toLowerCase()) + '">' +
            '<td><span class="pill" style="background:var(' + tint + '-tint);color:var(' + tint + ')">' + l.when + "</span></td>" +
            "<td><b>" + l.what + "</b></td><td>" + l.why + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    },

    alternatives: function () {
      return figure("alts", "What else was considered", ART.stack(), cap("alts"), true) +
        '<div class="card"><table class="cov"><thead><tr><th>Instead of</th><th>You could use</th><th>Why not here</th></tr></thead><tbody>' +
        S.alternatives.map(function (a) {
          return '<tr data-search="' + esc((a.instead + " " + a.could + " " + a.whyNot).toLowerCase()) + '">' +
            "<td><b>" + a.instead + "</b></td><td>" + a.could + "</td><td>" + a.whyNot + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    },

    decisions: function () {
      return figure("locks", "How hard each choice is to undo", ART.locks(), cap("locks"), true) +
        '<div class="card"><table class="cov"><thead><tr><th>Decision</th><th>Lock-in</th><th>If you change your mind</th></tr></thead><tbody>' +
        S.decisions.map(function (d) {
          var col = d.lock === "low" ? "--good" : d.lock === "medium" ? "--warn" : "--risk";
          return '<tr data-search="' + esc((d.decision + " " + d.undo).toLowerCase()) + '">' +
            "<td><b>" + d.decision + '</b></td><td><span class="pill" style="background:var(' + col +
            '-tint);color:var(' + col + ')">' + d.lock + "</span></td><td>" + d.undo + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    },

    appendix: function () {
      return '<div class="card"><h3>Every copy-ready prompt in one place</h3>' +
        '<p style="font-size:14px;color:var(--muted)">Each one already names the project, so the answer is about your system rather than a textbook.</p>' +
        S.picks.map(function (p) {
          return '<div class="promptrow" data-search="' + esc((p.tech + " " + p.prompt).toLowerCase()) + '">' +
            '<div class="pr-tech">' + p.tech.split(/[—(]/)[0].trim() + "</div>" +
            '<div class="pr-text">' + esc(p.prompt) + "</div>" +
            '<button class="copy" data-copy="' + esc(p.prompt) + '">⧉ Copy</button></div>';
        }).join("") + "</div>" +
        figure("tree", "What is actually on disk", ART.tree(), cap("tree"), true) +
        '<div class="card"><h3>What this does not tell you</h3><table class="cov"><tbody>' +
        S.notCovered.map(function (n) {
          return '<tr data-search="' + esc((n.thing + " " + n.note).toLowerCase()) + '"><td><b>' + n.thing + "</b></td><td>" + n.note + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
  };

  var SECTIONS = [
    { id: "summary", file: "01-summary.html", nav: "Summary", title: "The Stack at a Glance", thumb: "summary",
      lede: "What you're committing to, and how confident this recommendation is in each part of it.",
      count: function () { return countFit("great") + " 🟢 · " + countFit("good") + " 🟡 · " + countFit("careful") + " 🔴"; } },
    { id: "stack", file: "02-stack.html", nav: "The Stack", title: "The Stack, Piece by Piece", thumb: "stack",
      lede: "One real technology per component, why it fits, and a prompt you can paste to go deeper.",
      count: function () { return S.picks.length + " recommendations"; } },
    { id: "fit", file: "03-fit.html", nav: "Fit & Risk", title: "Fit & Risk", thumb: "fit",
      lede: "The same list, sorted by how much it should worry you.",
      count: function () { return countFit("careful") + " to watch"; } },
    { id: "runs", file: "04-runs.html", nav: "Runs Where", title: "What Runs Where", thumb: "runs",
      lede: "The deployment picture — one machine, and the two things you don't control.",
      count: function () { return S.runsOn.length + " places"; } },
    { id: "learn", file: "05-learn.html", nav: "Learning", title: "What to Learn First", thumb: "learn",
      lede: "You don't need all of this at once. This is the order that makes the rest click.",
      count: function () { return S.learn.length + " steps"; } },
    { id: "alternatives", file: "06-alternatives.html", nav: "Alternatives", title: "Alternatives Considered", thumb: "alts",
      lede: "What else was weighed, and the honest reason it isn't the recommendation.",
      count: function () { return S.alternatives.length + " weighed"; } },
    { id: "decisions", file: "07-decisions.html", nav: "Decisions", title: "Decisions & Lock-in", thumb: "dec",
      lede: "Which of these you could undo next month, and which one you're really committing to.",
      count: function () { return S.decisions.length + " decisions"; } },
    { id: "appendix", file: "08-appendix.html", nav: "Appendix", title: "Appendix", thumb: "apx",
      lede: "Every copy-ready prompt in one place, the files, and what this document deliberately doesn't answer.",
      count: function () { return S.picks.length + " prompts"; } }
  ];
  function sectionOf(id) { return SECTIONS.filter(function (s) { return s.id === id; })[0]; }

  /* ---------- search ---------- */
  var STOP = { the:1,a:1,an:1,is:1,are:1,of:1,to:1,in:1,on:1,for:1,and:1,or:1,it:1,this:1,that:1,
    what:1,why:1,how:1,does:1,do:1,i:1,my:1,we:1,you:1,be:1,with:1,from:1,at:1,as:1,by:1,can:1,will:1,should:1 };

  var INDEX = (function () {
    var out = [];
    function add(sec, title, text, kind) {
      out.push({ sec: sec, title: title, text: text, kind: kind, hay: (title + " " + text).toLowerCase() });
    }
    add("summary", "The headline", S.headline, "Overview");
    S.ratingKey.forEach(function (r) { add("summary", r.icon + " " + r.label, r.meaning, "Rating"); });
    S.picks.forEach(function (p) {
      add("stack", p.tech, p.component + ". " + p.why + " Prompt: " + p.prompt,
        FIT[p.fit].icon + " " + FIT[p.fit].label);
      /* the caveat is what the Fit & Risk page is for, so it is indexed against that section */
      if (p.caveat) add("fit", p.tech + " — read this twice", p.component + ". " + p.caveat,
        FIT[p.fit].icon + " Caveat");
    });
    ["careful", "good", "great"].forEach(function (f) {
      var items = S.picks.filter(function (p) { return p.fit === f; });
      if (!items.length) return;
      add("fit", FIT[f].icon + " " + FIT[f].label,
        items.length + " of " + S.picks.length + " recommendations — " +
        items.map(function (p) { return p.component + " (" + p.tech + ")"; }).join("; "), "Fit group");
    });
    S.runsOn.forEach(function (b) { add("runs", b.box, b.items.join(", "), "Runs where"); });
    S.learn.forEach(function (l) { add("learn", l.what, l.when + " — " + l.why, "Learning step"); });
    S.alternatives.forEach(function (a) { add("alternatives", a.could, "Instead of " + a.instead + ". " + a.whyNot, "Alternative"); });
    S.decisions.forEach(function (d) { add("decisions", d.decision, d.lock + " lock-in. " + d.undo, "Decision"); });
    S.notCovered.forEach(function (n) { add("appendix", n.thing, n.note, "Not covered"); });
    return out;
  })();

  function terms(q) {
    return String(q).toLowerCase().split(/[^a-z0-9+.]+/).filter(function (t) { return t.length > 1 && !STOP[t]; });
  }
  function occurrences(hay, t) { var n = 0, i = 0; while ((i = hay.indexOf(t, i)) !== -1) { n++; i += t.length; } return n; }
  function searchStack(q, limit) {
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

  /* ---------- copy to clipboard (works on file://) ---------- */
  function copyText(text, btn) {
    var original = btn.textContent;
    function done() { btn.textContent = "✓ Copied"; btn.classList.add("ok"); setTimeout(function () { btn.textContent = original; btn.classList.remove("ok"); }, 1500); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Select it manually"; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
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
      '<a class="brand" href="index.html"><span class="mark">C</span><span>' + S.project +
      "<small>Colaberry · Tech Stack</small></span></a>" +
      '<div class="nav-links" id="navlinks">' + links + '</div><div class="nav-tools">' +
      '<div class="search-wrap"><input id="search" type="search" placeholder="Search everything  /" autocomplete="off">' +
      '<div class="results" id="results" hidden></div></div>' +
      '<button class="icon-btn" id="theme" title="Toggle theme">◐</button>' +
      '<button class="icon-btn" id="print" title="Print">⎙</button>' +
      '<button class="icon-btn" id="hamburger" title="Menu">☰</button></div></div></nav>' +
      '<div class="crumbs">' + crumb + "</div>";
  }
  function footer() {
    return "<footer><div>Generated " + S.generated + " · Derived from <code>" + S.basis +
      "</code> · Source of truth: <code>project-blueprint/tech-stack.md</code></div>" +
      "<div>Colaberry · Tech Stack</div></footer>";
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
      '<h3>Ask the stack<span class="sub">Search works with no key at all</span></h3>' +
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
      '<option value="all">Whole stack</option></select></div></div>' +
      '<p class="ag-note" style="margin-top:9px"><b>Your key stays in this browser</b> and is sent only to api.anthropic.com. ' +
      "Anyone with access to this machine can read it.</p></div></div>" +
      '<div class="ag-log" id="ag-log"></div><div class="ag-input">' +
      '<textarea id="ag-text" rows="1" placeholder="Ask about this stack…"></textarea>' +
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
  var AGENT_SCOPE = { summary: ["headline","ratingKey","ratingNote"], stack: ["picks","groups"], fit: ["picks"],
    runs: ["runsOn"], learn: ["learn"], alternatives: ["alternatives"], decisions: ["decisions"], appendix: ["picks","notCovered"] };
  function scopedStack(scope, activeId) {
    if (scope === "all" || !activeId) return S;
    var out = { project: S.project, basis: S.basis, headline: S.headline };
    (AGENT_SCOPE[activeId] || []).forEach(function (k) { out[k] = S[k]; });
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
      textEl.placeholder = m === "local" ? "Search the stack…" : "Ask about this stack…";
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

    add("bot", "Two ways to use this. Search needs no key and works offline — it looks through every recommendation, caveat and alternative. Claude needs your own API key and answers in prose, still only from this stack.");
    var wrap = document.createElement("div"); wrap.className = "starters";
    (S.starters || ["what is risky", "what runs where", "learn first"]).forEach(function (s) {
      var b = document.createElement("button"); b.className = "starter"; b.textContent = s;
      b.onclick = function () { textEl.value = s; send(); }; wrap.appendChild(b);
    });
    log.appendChild(wrap);

    function answerLocally(q) {
      var ts = terms(q), hits = searchStack(q, 5);
      if (!hits.length) {
        addHTML("bot", "Nothing in this stack matches <b>" + esc(q) + "</b>. If it's a technology that isn't recommended here, check Alternatives — it may have been considered and ruled out.");
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
      var system = 'You are an assistant embedded in a tech-stack recommendation for a project called "' + S.project + '".\n\n' +
        "Answer ONLY from the stack JSON below. If it is not covered, say so plainly rather than recommending something new. " +
        "Explain like the reader may not be technical: plain sentences, define any unavoidable jargon in five words, " +
        "no markdown headers, no bullet walls. Respect the fit ratings — never talk a reader out of a red rating.\n\n" +
        "STACK JSON:\n" + JSON.stringify(scopedStack(scopeEl.value, activeId), null, 1);
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
      var hits = searchStack(q, 10);
      results.innerHTML = hits.length
        ? '<div class="res-head">' + hits.length + " result" + (hits.length === 1 ? "" : "s") + " across the stack</div>" +
          hits.map(function (h) {
            var sec = sectionOf(h.e.sec);
            return '<a class="res" href="' + sec.file + '"><span class="r-top"><span class="r-sec">' + esc(sec.nav) +
              '</span><span class="r-kind">' + esc(h.e.kind) + '</span></span><span class="r-title">' +
              mark(h.e.title, ts) + '</span><span class="r-snip">' + mark(snippet(h.e.text, ts, 140), ts) + "</span></a>";
          }).join("")
        : '<div class="res-none">Nothing in the stack matches “' + esc(q) + "”.</div>";
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
      if (exp) { openFigure(exp.dataset.expand); return; }
      var cp = e.target.closest && e.target.closest("[data-copy]");
      if (cp) copyText(cp.dataset.copy, cp);
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
    document.title = S.project + " — Tech Stack Command Center";
    document.body.innerHTML = chrome(null) +
      '<div class="wrap"><header class="hero"><div class="eyebrow">Tech Stack · derived from the architecture</div>' +
      "<h1>" + S.project + '</h1><p class="tagline">' + S.tagline + "</p>" +
      '<div class="bar"><div class="lbl">The headline</div><p>' + S.headline + "</p></div></header>" +
      figure("fitbar", "Every recommendation, by confidence", ART.fitBar(), cap("ccbar") || cap("fitbar"), true) +
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
    document.title = s.title + " — " + S.project;
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
    search: searchStack, index: INDEX, art: ART, fitCount: countFit };
})(window);
