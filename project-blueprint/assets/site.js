/* ============================================================
   Shared rendering, site-wide search, story illustrations,
   fullscreen figures and the Ask panel.
   Classic script (no modules) so it works from a file:// URL.
   Every page calls Blueprint.renderIndex() or Blueprint.render(id).
   ============================================================ */
(function (global) {
  "use strict";

  // blueprint.js declares `const BLUEPRINT`, which lives in the global lexical
  // scope — it is NOT a property of window. Reference the bare identifier.
  var B = BLUEPRINT;

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  var kindMeta = {
    entry:    { label: "Entry point", c: "--accent", t: "--accent-soft" },
    build:    { label: "You build",   c: "--info",   t: "--info-tint" },
    data:     { label: "Data store",  c: "--slate",  t: "--slate-tint" },
    external: { label: "Third party", c: "--warn",   t: "--warn-tint" }
  };
  function countKind(k) { return B.components.filter(function (c) { return c.kind === k; }).length; }
  function countCov(s) { return B.coverage.filter(function (c) { return c.status === s; }).length; }

  /* ---------- SVG primitives ---------- */
  var BD = "var(--border)", A = "var(--accent)", M = "var(--muted)";

  function svg(w, h, body, cls) {
    return '<svg class="illus ' + (cls || "") + '" viewBox="0 0 ' + w + " " + h +
      '" role="img" aria-hidden="true">' + body + "</svg>";
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
    o = o || {};
    var lh = o.lh || 14;
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

  /* ---------- Command Center tile previews ---------- */
  var THUMBS = {
    summary: svg(200, 106,
      box(16, 12, 76, 82, { r: 6 }) +
      '<rect x="25" y="23" width="46" height="5" rx="2.5" fill="' + A + '"/>' +
      [0, 1, 2, 3].map(function (i) {
        return '<rect x="25" y="' + (37 + i * 11) + '" width="' + (58 - i * 6) + '" height="4" rx="2" fill="' + BD + '"/>';
      }).join("") +
      [0, 1, 2].map(function (i) {
        return box(108, 16 + i * 28, 76, 22, { r: 5 }) +
          '<rect x="116" y="' + (23 + i * 28) + '" width="' + (22 - i * 5) + '" height="9" rx="2" fill="' + A + '" opacity="' + (1 - i * 0.25) + '"/>';
      }).join("")),

    arch: svg(200, 106,
      '<path d="M100 24 L100 46 M100 62 L58 80 M100 62 L142 80 M64 36 L96 28 M136 36 L104 28" stroke="' + BD + '" stroke-width="1.5"/>' +
      box(76, 14, 48, 18, { r: 9, fill: "var(--accent-soft)", stroke: A, sw: 1.5 }) +
      box(74, 46, 52, 18, { r: 4, fill: "var(--info-tint)", stroke: "var(--info)", sw: 1.5 }) +
      box(34, 76, 46, 18, { r: 4, fill: "var(--slate-tint)", stroke: M, sw: 1.5 }) +
      box(120, 76, 46, 18, { r: 4, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.5 }) +
      box(28, 28, 34, 16, { r: 4, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.5 }) +
      box(138, 28, 34, 16, { r: 4, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.5 })),

    comp: svg(200, 106, [0, 1, 2, 3, 4, 5].map(function (i) {
      var x = 14 + (i % 3) * 60, y = 16 + Math.floor(i / 3) * 42;
      var c = [A, "var(--info)", "var(--slate)"][i % 3];
      return box(x, y, 54, 34, { r: 5 }) +
        '<rect x="' + x + '" y="' + y + '" width="54" height="3" rx="1.5" fill="' + c + '"/>' +
        '<rect x="' + (x + 8) + '" y="' + (y + 12) + '" width="30" height="4" rx="2" fill="' + BD + '"/>' +
        '<rect x="' + (x + 8) + '" y="' + (y + 22) + '" width="20" height="3" rx="1.5" fill="' + BD + '"/>';
    }).join("")),

    flow: svg(200, 106,
      [0, 1, 2, 3].map(function (i) {
        return '<line x1="' + (28 + i * 48) + '" y1="20" x2="' + (28 + i * 48) + '" y2="94" stroke="' + BD + '" stroke-width="1.5"/>' +
          '<circle cx="' + (28 + i * 48) + '" cy="15" r="5" fill="' + (i === 0 ? A : "var(--card)") + '" stroke="' + (i === 0 ? A : M) + '" stroke-width="1.5"/>';
      }).join("") +
      [0, 1, 2].map(function (i) {
        return '<path d="M' + (28 + i * 48) + " " + (36 + i * 18) + " H" + (72 + i * 48) + '" stroke="' + A + '" stroke-width="1.8"/>' +
          '<path d="M' + (68 + i * 48) + " " + (32 + i * 18) + ' l5 4 l-5 4" stroke="' + A + '" stroke-width="1.8" fill="none"/>';
      }).join("") +
      '<path d="M172 88 H28" stroke="' + M + '" stroke-width="1.5" stroke-dasharray="3 3"/>' +
      '<path d="M33 84 l-5 4 l5 4" stroke="' + M + '" stroke-width="1.5" fill="none"/>'),

    gantt: svg(200, 106,
      [0, 1, 2, 3].map(function (i) {
        return '<line x1="' + (46 + i * 38) + '" y1="10" x2="' + (46 + i * 38) + '" y2="96" stroke="' + BD + '" stroke-width="1"/>';
      }).join("") +
      [[14, 16, 54], [32, 36, 44], [50, 54, 58], [68, 86, 40], [86, 100, 58]].map(function (b, i) {
        var fill = i < 2 ? A : (i < 4 ? "var(--info)" : "var(--slate)");
        return '<rect x="' + b[1] + '" y="' + b[0] + '" width="' + b[2] + '" height="11" rx="3" fill="' + fill + '" opacity="' + (1 - i * 0.1) + '"/>' +
          '<rect x="10" y="' + (b[0] + 3) + '" width="' + (28 - i * 3) + '" height="5" rx="2.5" fill="' + BD + '"/>';
      }).join("")),

    /* 24 cells in the same proportion as the real coverage table */
    cov: svg(200, 106, (function () {
      var order = ["designed", "partial", "deferred"], cells = [], out = "";
      order.forEach(function (status, k) {
        var n = Math.round(countCov(status) / B.coverage.length * 24);
        for (var j = 0; j < n; j++) cells.push(k);
      });
      while (cells.length < 24) cells.push(2);
      cells = cells.slice(0, 24);
      for (var i = 0; i < 24; i++) {
        var x = 20 + (i % 6) * 29, y = 16 + Math.floor(i / 6) * 22;
        out += box(x, y, 24, 17, {
          r: 4,
          fill: ["var(--good-tint)", "var(--warn-tint)", "var(--risk-tint)"][cells[i]],
          stroke: ["var(--good)", "var(--warn)", "var(--risk)"][cells[i]], sw: 1
        });
      }
      return out;
    })()),

    asm: svg(200, 106,
      '<path d="M100 84 V58 M100 58 L58 32 M100 58 L142 32" stroke="' + BD + '" stroke-width="1.5"/>' +
      '<circle cx="100" cy="89" r="10" fill="var(--warn-tint)" stroke="var(--warn)" stroke-width="1.5"/>' +
      txt(100, 94, "?", { size: 13, weight: 700, fill: "var(--warn)", anchor: "middle" }) +
      box(30, 20, 56, 22, { r: 5 }) + box(114, 20, 56, 22, { r: 5 }) +
      '<rect x="38" y="28" width="30" height="5" rx="2.5" fill="' + A + '"/>' +
      '<rect x="122" y="28" width="38" height="5" rx="2.5" fill="' + M + '"/>'),

    apx: svg(200, 106,
      box(42, 14, 54, 74, { r: 6 }) + box(106, 26, 54, 74, { r: 6 }) +
      '<rect x="52" y="26" width="30" height="5" rx="2.5" fill="' + A + '"/>' +
      '<rect x="116" y="38" width="30" height="5" rx="2.5" fill="var(--info)"/>' +
      [0, 1, 2, 3].map(function (i) {
        return '<rect x="52" y="' + (40 + i * 10) + '" width="' + (34 - i * 5) + '" height="4" rx="2" fill="' + BD + '"/>' +
          '<rect x="116" y="' + (52 + i * 10) + '" width="' + (34 - i * 6) + '" height="4" rx="2" fill="' + BD + '"/>';
      }).join(""))
  };

  /* ============================================================
     STORY ILLUSTRATIONS — all drawn from BLUEPRINT, all inline SVG
     (so they work offline, scale cleanly and follow the theme).
     ============================================================ */
  var ART = {};

  /* The whole idea in one picture: inputs → pipeline → gate → output */
  ART.story = function () {
    var s = B.story;
    var n = s.chips.length, cw = (332 - (n - 1) * 8) / n;
    var body =
      s.inputs.map(function (inp, i) {
        var y = 44 + i * 82;
        return box(24, y, 196, 66) +
          txt(40, y + 28, inp.title, { size: 13, weight: 700 }) +
          multi(40, y + 46, wrapText(inp.sub, 26), { size: 11, fill: M, lh: 13 });
      }).join("") +
      arrowH(228, 296, 118, s.inArrow) +
      box(300, 28, 364, 180, { fill: "var(--accent-soft)", stroke: A, r: 14 }) +
      txt(320, 54, s.pipelineTitle, { size: 13.5, weight: 700, fill: A }) +
      s.chips.map(function (c, i) {
        var x = 316 + i * (cw + 8);
        return box(x, 70, cw, 34, { r: 8, fill: "var(--card)", stroke: A, sw: 1.2 }) +
          txt(x + cw / 2, 92, c, { size: 11.5, weight: 600, anchor: "middle" });
      }).join("") +
      box(316, 122, 332, 66, { r: 10, fill: "var(--card)", stroke: "var(--good)", sw: 2 }) +
      txt(482, 146, s.gate.name, { size: 12.5, weight: 700, fill: "var(--good)", anchor: "middle" }) +
      multi(482, 164, wrapText(s.gate.note, 46), { size: 10.5, fill: M, anchor: "middle", lh: 12 }) +
      arrowH(668, 730, 118, s.outArrow) +
      box(734, 60, 222, 116, { stroke: A, sw: 2 }) +
      txt(845, 90, s.output.title, { size: 14, weight: 700, anchor: "middle" }) +
      multi(845, 112, s.output.lines, { size: 11, fill: M, anchor: "middle", lh: 15 }) +
      txt(490, 226, s.moral, { size: 11.5, weight: 600, fill: M, anchor: "middle" });
    return svg(980, 240, body);
  };

  /* How the job is done today, beside how it is done with the tool */
  ART.beforeAfter = function () {
    var ba = B.beforeAfter;
    function panel(x, title, tint, stroke) {
      return box(x, 20, 450, 172, { fill: tint, stroke: stroke, r: 14 }) +
        txt(x + 22, 48, title, { size: 13, weight: 700, fill: stroke });
    }
    var steps = ba.after.steps, sw = 96, gap = 40, x0 = 534;
    var body =
      panel(20, ba.before.title, "var(--warn-tint)", "var(--warn)") +
      [0, 1, 2, 3, 4].map(function (i) {
        return box(46 + i * 6, 70 + i * 4, 90, 62, { r: 6, fill: "var(--card)", stroke: "var(--warn)", sw: 1 });
      }).join("") +
      multi(160, 96, ba.before.lines, { size: 12, weight: 600, lh: 18 }) +
      txt(160, 140, ba.before.stat, { size: 11.5, fill: "var(--warn)", weight: 700 }) +
      txt(160, 158, ba.before.sub, { size: 11, fill: M }) +

      panel(510, ba.after.title, "var(--good-tint)", "var(--good)") +
      steps.map(function (lines, i) {
        var x = x0 + i * (sw + gap);
        var w = i === steps.length - 1 ? sw + 22 : sw;
        return box(x, 76, w, 54, { r: 8, fill: "var(--card)", stroke: "var(--good)", sw: 1.2 }) +
          multi(x + w / 2, 100, lines, { size: 11, weight: 600, anchor: "middle", lh: 14 }) +
          (i < steps.length - 1 ? arrowH(x + w + 6, x + w + gap - 6, 103) : "");
      }).join("") +
      txt(735, 158, ba.after.moral, { size: 11.5, fill: "var(--good)", weight: 700, anchor: "middle" });
    return svg(980, 206, body);
  };

  /* Components grouped into layers, laid out from the data */
  ART.layers = function () {
    var order = ["entry", "build", "data", "external"];
    var x0 = 190, maxW = 758, y = 14, out = "";
    order.forEach(function (kind) {
      var m = kindMeta[kind];
      var items = B.components.filter(function (c) { return c.kind === kind; });
      var rows = [[]], cw = 0;
      items.forEach(function (c) {
        var w = Math.min(c.name.length * 6.7 + 26, 340);
        if (cw + w > maxW && rows[rows.length - 1].length) { rows.push([]); cw = 0; }
        rows[rows.length - 1].push({ c: c, w: w });
        cw += w + 10;
      });
      var bh = rows.length * 36 + (rows.length - 1) * 10 + 26;
      out += box(16, y, 948, bh, { fill: "var(" + m.t + ")", stroke: "var(" + m.c + ")", r: 12 });
      out += txt(34, y + bh / 2 - 3, m.label, { size: 13, weight: 700, fill: "var(" + m.c + ")" });
      out += txt(34, y + bh / 2 + 14, items.length + (items.length === 1 ? " component" : " components"),
        { size: 11, fill: M });
      var cy = y + 13;
      rows.forEach(function (row) {
        var cx = x0;
        row.forEach(function (it) {
          out += box(cx, cy, it.w, 36, { r: 8, fill: "var(--card)", stroke: "var(" + m.c + ")", sw: 1.2 });
          out += txt(cx + it.w / 2, cy + 23, it.c.name, { size: 12, weight: 600, anchor: "middle" });
          cx += it.w + 10;
        });
        cy += 46;
      });
      y += bh + 12;
    });
    return svg(980, y + 2, out);
  };

  /* Compact kind key for the components page */
  ART.kinds = function () {
    var order = ["entry", "build", "data", "external"];
    return svg(980, 92, order.map(function (k, i) {
      var m = kindMeta[k], x = 16 + i * 240;
      return box(x, 14, 228, 64, { fill: "var(" + m.t + ")", stroke: "var(" + m.c + ")", r: 12 }) +
        txt(x + 20, 46, countKind(k), { size: 26, weight: 700, fill: "var(" + m.c + ")" }) +
        txt(x + 62, 42, m.label, { size: 12.5, weight: 700 }) +
        txt(x + 62, 60, k === "build" ? "code you write" :
          k === "data" ? "storage you configure" :
            k === "external" ? "vendors you call" : "where a human starts", { size: 10.5, fill: M });
    }).join(""));
  };

  /* The nine steps, colour-coded by whether the model touches them */
  ART.pipeline = function () {
    var n = B.flow.length, out = "", llm = 0;
    out += '<line x1="54" y1="46" x2="' + (54 + (n - 1) * 109) + '" y2="46" stroke="' + BD + '" stroke-width="2"/>';
    B.flow.forEach(function (f, i) {
      var cx = 54 + i * 109;
      var isLLM = !!f.llm; if (isLLM) llm++;
      var fill = isLLM ? "var(--accent-soft)" : "var(--card)";
      var stroke = isLLM ? A : M;
      out += '<circle cx="' + cx + '" cy="46" r="18" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>';
      out += txt(cx, 51, String(i + 1), { size: 13, weight: 700, anchor: "middle", fill: isLLM ? A : "var(--text)" });
      out += multi(cx, 84, wrapText(f.short, 13), { size: 10.5, weight: 600, anchor: "middle", lh: 12.5 });
    });
    out += box(16, 118, 300, 40, { r: 10, fill: "var(--accent-soft)", stroke: A, sw: 1.2 }) +
      '<circle cx="40" cy="138" r="8" fill="var(--card)" stroke="' + A + '" stroke-width="2"/>' +
      txt(58, 142, llm + (llm === 1 ? " step uses the model" : " steps use the model"),
        { size: 11.5, weight: 700, fill: A });
    out += box(328, 118, 340, 40, { r: 10, fill: "var(--slate-tint)", stroke: M, sw: 1.2 }) +
      '<circle cx="352" cy="138" r="8" fill="var(--card)" stroke="' + M + '" stroke-width="2"/>' +
      txt(370, 142, (n - llm) + " are plain code you can inspect", { size: 11.5, weight: 700, fill: "var(--slate)" });
    return svg(980, 172, out);
  };

  /* Build order as a proportional ribbon */
  ART.timeline = function () {
    var parsed = B.phases.map(function (p) {
      var m = /(\d+)\D+(\d+)/.exec(p.weeks) || [0, 1, 1];
      return { p: p, s: +m[1], e: +m[2] };
    });
    var total = parsed.reduce(function (a, x) { return Math.max(a, x.e); }, 0);
    var X = 30, W = 920, out = "";
    for (var w = 0; w <= total; w += 2) {
      var gx = X + (w / total) * W;
      out += '<line x1="' + gx + '" y1="42" x2="' + gx + '" y2="112" stroke="' + BD + '" stroke-width="1"/>';
      out += txt(gx, 34, "wk " + (w || 1), { size: 10, fill: M, anchor: "middle" });
    }
    parsed.forEach(function (x, i) {
      var bx = X + ((x.s - 1) / total) * W;
      var bw = ((x.e - x.s + 1) / total) * W;
      var critical = !!x.p.critical;
      out += box(bx + 2, 52, bw - 4, 50, {
        r: 9, fill: critical ? A : "var(--card)",
        stroke: critical ? A : M, sw: critical ? 2 : 1.4
      });
      out += multi(bx + bw / 2, 74, wrapText(x.p.name, Math.max(8, Math.floor(bw / 7))), {
        size: 11.5, weight: 700, anchor: "middle", lh: 13,
        fill: critical ? "#ffffff" : "var(--text)"
      });
      out += txt(bx + bw / 2, 126, x.p.weeks, { size: 10.5, fill: M, anchor: "middle" });
      if (critical) {
        out += box(bx + 2, 142, Math.max(bw - 4, 210), 44, { r: 9, fill: "var(--accent-soft)", stroke: A, sw: 1.2 });
        out += multi(bx + 14, 160, wrapText(B.criticalNote, 44),
          { size: 10.5, weight: 600, fill: A, lh: 13 });
      }
    });
    return svg(980, 196, out);
  };

  /* Coverage as a conditional-formatted grid */
  ART.heatmap = function () {
    var cols = 4, cw = 228, gap = 12, ch = 68, out = "";
    B.coverage.forEach(function (c, i) {
      var col = i % cols, row = Math.floor(i / cols);
      var x = 20 + col * (cw + gap), y = 16 + row * (ch + gap);
      var tint = "var(--" + (c.status === "designed" ? "good" : c.status === "partial" ? "warn" : "risk") + "-tint)";
      var line = "var(--" + (c.status === "designed" ? "good" : c.status === "partial" ? "warn" : "risk") + ")";
      out += box(x, y, cw, ch, { r: 10, fill: tint, stroke: line, sw: 1.4 });
      out += txt(x + 14, y + 21, c.status.toUpperCase(), { size: 9.5, weight: 700, fill: line });
      out += multi(x + 14, y + 40, wrapText(c.concern, 30), { size: 11.5, weight: 600, lh: 13 });
    });
    var rows = Math.ceil(B.coverage.length / cols);
    return svg(980, 16 + rows * (ch + gap) + 4, out);
  };

  /* The open question, as a fork */
  ART.fork = function () {
    var q = B.openQuestion;
    function branch(x, def, tint, line) {
      var out = box(x, 122, 420, 118, { r: 12, fill: tint, stroke: line, sw: 1.6 });
      out += txt(x + 20, 148, def.label, { size: 12.5, weight: 700, fill: line });
      def.items.forEach(function (it, i) {
        out += box(x + 20, 160 + i * 24, 380, 20, { r: 6, fill: "var(--card)", stroke: line, sw: 1 });
        out += txt(x + 32, 174 + i * 24, it, { size: 10.5, weight: 600 });
      });
      return out;
    }
    var body =
      box(280, 14, 420, 62, { r: 12, fill: "var(--warn-tint)", stroke: "var(--warn)", sw: 1.8 }) +
      txt(490, 38, "The one open question", { size: 10.5, weight: 700, fill: "var(--warn)", anchor: "middle" }) +
      txt(490, 60, q.q, { size: 13, weight: 700, anchor: "middle" }) +
      '<path d="M420 76 L250 116 M560 76 L730 116" stroke="' + BD + '" stroke-width="2" fill="none"/>' +
      branch(20, q.ifNo, "var(--good-tint)", "var(--good)") +
      branch(540, q.ifYes, "var(--risk-tint)", "var(--risk)");
    return svg(980, 252, body);
  };

  /* What is actually on disk */
  ART.tree = function () {
    var rows = [
      ["project-blueprint/", "", 0, true],
      ["index.html", "Command Center", 1, false],
      ["01-summary.html … 08-appendix.html", "one page per section", 1, false],
      ["architecture.md", "source of truth", 1, false],
      ["assets/", "", 1, true],
      ["blueprint.js", "the single data object", 2, false],
      ["site.js", "rendering, search, Ask panel", 2, false],
      ["site.css", "Colaberry styles", 2, false]
    ];
    var out = "", y = 30;
    rows.forEach(function (r, i) {
      var x = 26 + r[2] * 26;
      if (r[2] > 0) out += '<path d="M' + (x - 14) + " " + (y - 12) + " V" + (y - 4) + " H" + (x - 4) +
        '" stroke="' + BD + '" stroke-width="1.5" fill="none"/>';
      out += txt(x, y, r[0], { size: 12.5, weight: r[3] ? 700 : 600, fill: r[3] ? A : "var(--text)" });
      if (r[1]) out += txt(400, y, r[1], { size: 11.5, fill: M });
      y += 28;
    });
    return svg(980, y, out);
  };

  /* ---------- figure wrapper with a fullscreen control ---------- */
  function figure(id, title, inner, interp, isArt) {
    return '<div class="card figure" data-fig="' + id + '">' +
      '<div class="figure-head"><h3>' + title + '</h3>' +
      '<button class="expand" data-expand="' + id + '" title="Open full screen">⛶ Full screen</button></div>' +
      '<div class="figure-body' + (isArt ? " art" : "") + '">' + inner + "</div>" +
      (interp ? '<div class="interp"><b>Read this as:</b> ' + interp + "</div>" : "") +
      "</div>";
  }
  /* Figure titles and their plain-English interpretations live in BLUEPRINT,
     so this file stays true whatever the idea is. */
  function fig(id, inner, isArt) {
    var f = (B.figures || {})[id] || { title: id, interp: "" };
    return figure(id, f.title, inner, f.interp, isArt);
  }

  /* ---------- section bodies ---------- */
  var BODY = {
    summary: function () {
      return fig("story", ART.story(), true) +
        '<div class="card" style="border-left:4px solid var(--accent)">' +
        "<h3>The conclusion, first</h3><p style=\"margin:0;font-size:15.5px\">" + B.conclusion + "</p></div>" +
        '<div class="card"><h3 style="color:var(--muted);font-weight:600;font-size:14px">The idea, as written</h3>' +
        '<p style="margin:0;font-size:15px">' + B.idea + "</p></div>" +
        fig("beforeafter", ART.beforeAfter(), true) +
        '<div class="kpis">' + B.kpis.map(function (k) {
          return '<div class="kpi"><div class="v">' + k.value + '</div><div class="l">' + k.label +
            '</div><div class="n">' + k.note + "</div></div>";
        }).join("") + "</div>";
    },

    architecture: function () {
      return fig("layers", ART.layers(), true) +
        '<div class="grid2">' +
        fig("arch", '<pre class="mermaid" id="m-arch"></pre>') +
        fig("kinds", '<div class="chart-box"><canvas id="kindChart"></canvas></div>') +
        "</div>";
    },

    components: function () {
      return fig("kindkey", ART.kinds(), true) +
        '<div class="comp-grid">' + B.components.map(function (c) {
          var m = kindMeta[c.kind];
          return '<article class="comp" data-search="' +
            esc((c.name + " " + c.blurb + " " + c.tech + " " + m.label).toLowerCase()) +
            '" style="--kc:var(' + m.c + ");--kct:var(" + m.t + ')">' +
            "<h3>" + c.name + '<span class="badge">' + m.label + "</span></h3>" +
            "<p>" + c.blurb + "</p>" +
            '<div class="why"><b>Required by:</b> ' + c.why + " &middot; <b>Default:</b> " + c.tech + "</div></article>";
        }).join("") + '</div><div class="empty" id="no-results" hidden>Nothing on this page matches that search.</div>';
    },

    flow: function () {
      return fig("pipeline", ART.pipeline(), true) +
        fig("seq", '<pre class="mermaid" id="m-seq"></pre>') +
        '<div class="card"><ol class="flow">' + B.flow.map(function (f, i) {
          return '<li data-search="' + esc((f.title + " " + f.detail).toLowerCase()) + '">' +
            '<span class="num">' + (i + 1) + "</span><div><h4>" + f.title + "</h4><p>" + f.detail + "</p></div></li>";
        }).join("") + '</ol><div class="empty" id="no-results" hidden>Nothing on this page matches that search.</div></div>';
    },

    build: function () {
      return fig("ribbon", ART.timeline(), true) +
        fig("gantt", '<pre class="mermaid" id="m-gantt"></pre>') +
        '<div class="phases">' + B.phases.map(function (p) {
          return '<div class="phase" data-search="' + esc((p.name + " " + p.items.join(" ") + " " + p.proves).toLowerCase()) + '">' +
            '<div class="wk">' + p.weeks + "</div><h3>" + p.name + "</h3><ul>" +
            p.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") +
            '</ul><div class="proves"><b>Proves:</b> ' + p.proves + "</div></div>";
        }).join("") + "</div>";
    },

    coverage: function () {
      var order = { designed: 0, partial: 1, deferred: 2 };
      var rows = B.coverage.slice().sort(function (a, b) { return order[a.status] - order[b.status]; });
      return '<div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-top:0;margin-bottom:15px">' +
        '<div class="kpi"><div class="v" style="color:var(--good)">' + countCov("designed") + "</div>" +
        '<div class="l">Designed</div><div class="n">Specified here in enough detail to build</div></div>' +
        '<div class="kpi"><div class="v" style="color:var(--warn)">' + countCov("partial") + "</div>" +
        '<div class="l">Partial</div><div class="n">Named, but not specified to the same depth</div></div>' +
        '<div class="kpi"><div class="v" style="color:var(--risk)">' + countCov("deferred") + "</div>" +
        '<div class="l">Deferred</div><div class="n">Deliberately out of scope for this design</div></div></div>' +
        fig("heat", ART.heatmap(), true) +
        '<div class="card"><table class="cov"><thead><tr><th>Concern</th><th>Status</th><th>Note</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr data-search="' + esc((r.concern + " " + r.status + " " + r.note).toLowerCase()) + '">' +
            "<td>" + r.concern + '</td><td><span class="pill s-' + r.status + '">' + r.status + "</span></td>" +
            "<td>" + r.note + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    },

    assumptions: function () {
      var tint = { high: "--risk", medium: "--warn", low: "--slate" };
      return fig("fork", ART.fork(), true) +
        '<div class="asm">' + B.assumptions.map(function (a) {
          return '<div class="asm-row" data-search="' + esc(a.text.toLowerCase()) + '">' +
            '<span class="pill" style="background:var(' + tint[a.impact] + "-tint);color:var(" + tint[a.impact] + ')">' +
            a.impact + " impact</span><p>" + a.text + "</p></div>";
        }).join("") + "</div>" +
        '<div class="q"><div class="lbl">The one question that would change this design most</div>' +
        "<p>" + B.openQuestion.q + '</p><p class="sub">' + B.openQuestion.why + "</p></div>";
    },

    appendix: function () {
      return fig("tree", ART.tree(), true) +
        '<div class="card"><h3>Artifacts</h3><table class="cov"><tbody>' +
        B.artifacts.map(function (a) {
          return '<tr data-search="' + esc((a.label + " " + a.path).toLowerCase()) + '">' +
            "<td>" + a.label + '</td><td colspan="2"><code>' + a.path + "</code></td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<div class="card"><h3>Running this anywhere</h3>' +
        '<p style="margin:0 0 10px;font-size:14px">Open <code>index.html</code> from disk — no server, no build step, no install. ' +
        "Search and the Ask panel's local mode work entirely offline. " +
        "Only the Mermaid and Chart.js diagrams need the internet on first load, and only Ask's Claude mode needs a key. " +
        "If that Claude call is blocked from a <code>file://</code> URL, that is the browser's cross-origin rule, not the code — serve the folder instead:</p>" +
        '<p style="margin:0"><code>python -m http.server</code> &nbsp;→&nbsp; <code>http://localhost:8000</code></p></div>';
    }
  };

  /* ---------- section registry ---------- */
  var SECTIONS = [
    { id: "summary", file: "01-summary.html", nav: "Summary", title: "Executive Summary", thumb: "summary",
      count: function () { return B.kpis.length + " headline numbers"; } },
    { id: "architecture", file: "02-architecture.html", nav: "Architecture", title: "System Architecture", thumb: "arch",
      count: function () { return B.components.length + " components"; } },
    { id: "components", file: "03-components.html", nav: "Components", title: "The Components", thumb: "comp",
      count: function () { return countKind("build") + " services · " + countKind("data") + " stores · " + countKind("external") + " third-party"; } },
    { id: "flow", file: "04-flow.html", nav: "Data Flow", title: "Data Flow, Step by Step", thumb: "flow",
      count: function () { return B.flow.length + " steps"; } },
    { id: "build", file: "05-build.html", nav: "Build Order", title: "Build Order", thumb: "gantt",
      count: function () { return B.phases.length + " phases"; } },
    { id: "coverage", file: "06-coverage.html", nav: "Coverage", title: "Coverage", thumb: "cov",
      count: function () { return countCov("deferred") + " deferred"; } },
    { id: "assumptions", file: "07-assumptions.html", nav: "Assumptions", title: "Assumptions & the Open Question", thumb: "asm",
      count: function () { return B.assumptions.length + " assumptions"; } },
    { id: "appendix", file: "08-appendix.html", nav: "Appendix", title: "Appendix", thumb: "apx",
      count: function () { return B.artifacts.length + " artifacts"; } }
  ];
  /* One line per section, written for this idea — kept in the data object. */
  SECTIONS.forEach(function (s) { s.lede = (B.sectionCopy || {})[s.id] || ""; });
  function sectionOf(id) {
    return SECTIONS.filter(function (s) { return s.id === id; })[0];
  }

  /* ============================================================
     SEARCH — one index over the whole blueprint, no model involved.
     Powers both the nav search box and the Ask panel's local mode.
     ============================================================ */
  var STOP = { the: 1, a: 1, an: 1, is: 1, are: 1, was: 1, of: 1, to: 1, in: 1, on: 1, for: 1,
    and: 1, or: 1, it: 1, this: 1, that: 1, what: 1, why: 1, how: 1, does: 1, do: 1, i: 1,
    me: 1, my: 1, we: 1, you: 1, be: 1, with: 1, from: 1, at: 1, as: 1, by: 1, can: 1, will: 1 };

  var INDEX = (function build() {
    var out = [];
    // The searchable text includes the entry's kind and its section, so
    // "components", "data store", "third party" and "deferred" all find
    // the rows they name even when the prose never uses the word.
    function add(sec, title, text, kind) {
      out.push({ sec: sec, title: title, text: text, kind: kind,
        hay: (title + " " + text + " " + kind + " " + sec).toLowerCase() });
    }
    add("summary", "The idea", B.idea, "Overview");
    add("summary", "The conclusion", B.conclusion, "Overview");
    add("summary", "The day-one bar", B.dayOneBar, "Overview");
    B.kpis.forEach(function (k) { add("summary", k.label + ": " + k.value, k.note, "Number"); });
    B.components.forEach(function (c) {
      add("components", c.name, c.blurb + " Required by: " + c.why + " Default: " + c.tech, kindMeta[c.kind].label);
    });
    B.flow.forEach(function (f, i) {
      add("flow", "Step " + (i + 1) + " — " + f.title, f.detail, f.llm ? "Model step" : "Deterministic step");
    });
    B.phases.forEach(function (p) {
      add("build", p.name + " (" + p.weeks + ")", p.items.join(", ") + ". Proves: " + p.proves, "Build phase");
    });
    B.coverage.forEach(function (c) { add("coverage", c.concern, c.note, c.status); });
    B.assumptions.forEach(function (a) { add("assumptions", a.text.split(".")[0], a.text, a.impact + " impact assumption"); });
    add("assumptions", "The open question", B.openQuestion.q + " " + B.openQuestion.why, "Open question");
    B.artifacts.forEach(function (a) { add("appendix", a.label, a.path, "Artifact"); });
    return out;
  })();

  function terms(q) {
    return String(q).toLowerCase().split(/[^a-z0-9+]+/)
      .filter(function (t) { return t.length > 1 && !STOP[t]; });
  }
  function occurrences(hay, t) {
    var n = 0, i = 0;
    while ((i = hay.indexOf(t, i)) !== -1) { n++; i += t.length; }
    return n;
  }
  function searchBlueprint(q, limit) {
    var ts = terms(q);
    if (!ts.length) return [];
    var phrase = String(q).toLowerCase().trim();
    return INDEX.map(function (e) {
      var score = 0;
      ts.forEach(function (t) {
        var n = occurrences(e.hay, t);
        if (n) score += n * 2 + (e.title.toLowerCase().indexOf(t) !== -1 ? 8 : 0);
        else {
          var stem = t.length > 5 ? t.slice(0, t.length - 2) : t;
          if (stem.length > 3 && e.hay.indexOf(stem) !== -1) score += 1;
        }
      });
      if (phrase.length > 4 && e.hay.indexOf(phrase) !== -1) score += 12;
      return { e: e, score: score };
    }).filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit || 8);
  }
  function snippet(text, ts, len) {
    var low = text.toLowerCase(), at = -1;
    ts.some(function (t) { var i = low.indexOf(t); if (i !== -1) { at = i; return true; } return false; });
    var start = at > 60 ? at - 50 : 0;
    var s = text.slice(start, start + (len || 150));
    return (start > 0 ? "…" : "") + s + (start + (len || 150) < text.length ? "…" : "");
  }
  function mark(html, ts) {
    var out = esc(html);
    ts.forEach(function (t) {
      out = out.replace(new RegExp("(" + rx(t) + ")", "ig"), "<mark>$1</mark>");
    });
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

    return '<div id="progress"></div>' +
      '<nav class="top"><div class="nav-inner">' +
      '<a class="brand" href="index.html"><span class="mark">C</span>' +
      "<span>" + B.project + "<small>Colaberry · System Blueprint</small></span></a>" +
      '<div class="nav-links" id="navlinks">' + links + "</div>" +
      '<div class="nav-tools">' +
      '<div class="search-wrap"><input id="search" type="search" placeholder="Search everything  /" ' +
      'aria-label="Search the whole blueprint" autocomplete="off">' +
      '<div class="results" id="results" hidden></div></div>' +
      '<button class="icon-btn" id="theme" title="Toggle theme" aria-label="Toggle theme">◐</button>' +
      '<button class="icon-btn" id="print" title="Print" aria-label="Print">⎙</button>' +
      '<button class="icon-btn" id="hamburger" title="Menu" aria-label="Menu">☰</button>' +
      "</div></div></nav>" +
      '<div class="crumbs">' + crumb + "</div>";
  }
  function footer() {
    return "<footer><div>Generated " + B.generated +
      " · Source of truth: <code>project-blueprint/architecture.md</code></div>" +
      "<div>Colaberry · System Blueprint</div></footer>";
  }
  function lightboxMarkup() {
    return '<div id="lightbox" role="dialog" aria-modal="true" aria-label="Expanded figure">' +
      '<div class="lb-bar"><span class="title" id="lb-title"></span>' +
      '<button class="icon-btn" id="lb-out" title="Zoom out">−</button>' +
      '<span class="zoom-val" id="lb-zoom">100%</span>' +
      '<button class="icon-btn" id="lb-in" title="Zoom in">+</button>' +
      '<button class="icon-btn" id="lb-reset" title="Reset zoom">⟲</button>' +
      '<button class="icon-btn" id="lb-close" title="Close (Esc)">✕</button></div>' +
      '<div class="lb-stage"><div class="lb-inner" id="lb-inner"></div></div></div>';
  }
  function agentMarkup(activeId) {
    return '<button id="ask-btn">✦ Ask</button>' +
      '<aside id="agent" aria-label="Blueprint assistant"><div class="ag-head">' +
      "<h3>Ask the blueprint<span class=\"sub\">Search works with no key at all</span></h3>" +
      '<button class="icon-btn" id="ag-close" aria-label="Close">✕</button></div>' +
      '<div class="ag-config">' +
      '<div class="ag-mode" role="group" aria-label="Answer mode">' +
      '<button id="mode-local" class="on">🔍 Search · no key</button>' +
      '<button id="mode-llm">✦ Claude · needs key</button></div>' +
      '<div id="ag-llm-fields" hidden>' +
      '<div><label for="ag-key">Your Anthropic API key</label>' +
      '<input id="ag-key" type="password" placeholder="sk-ant-..." autocomplete="off"></div>' +
      '<div class="ag-row" style="margin-top:9px">' +
      '<div><label for="ag-model">Model</label><select id="ag-model">' +
      '<option value="claude-opus-5">Claude Opus 5</option>' +
      '<option value="claude-sonnet-5">Claude Sonnet 5</option>' +
      '<option value="claude-haiku-4-5">Claude Haiku 4.5</option></select></div>' +
      '<div><label for="ag-scope">Scope</label><select id="ag-scope">' +
      (activeId ? '<option value="section">This section</option>' : "") +
      '<option value="all">Whole blueprint</option></select></div></div>' +
      '<p class="ag-note" style="margin-top:9px"><b>Your key stays in this browser</b> (localStorage) and is sent only to ' +
      "api.anthropic.com. Anyone with access to this machine can read it — use a personal key, and don't publish this page with one saved.</p>" +
      "</div></div>" +
      '<div class="ag-log" id="ag-log"></div>' +
      '<div class="ag-input"><textarea id="ag-text" rows="1" placeholder="Ask about this design…"></textarea>' +
      '<button id="ag-send">Send</button></div></aside>';
  }

  /* ---------- mermaid + charts ---------- */
  function classDefs(dark) {
    return "\n" +
      "classDef entry fill:" + (dark ? "#0f3b38" : "#ccfbf1") + ",stroke:#0f766e,stroke-width:2px,color:" + (dark ? "#e6edf6" : "#0f172a") + ";\n" +
      "classDef build fill:" + (dark ? "#152740" : "#dbeafe") + ",stroke:#1d4ed8,stroke-width:2px,color:" + (dark ? "#e6edf6" : "#0f172a") + ";\n" +
      "classDef store fill:" + (dark ? "#1b2536" : "#f1f5f9") + ",stroke:#64748b,stroke-width:2px,color:" + (dark ? "#e6edf6" : "#0f172a") + ";\n" +
      "classDef ext   fill:" + (dark ? "#3a2c0a" : "#fef3c7") + ",stroke:#b45309,stroke-width:2px,color:" + (dark ? "#e6edf6" : "#0f172a") + ";\n" +
      Object.keys(B.mermaidClasses).map(function (k) {
        return "class " + B.mermaidClasses[k] + " " + k + ";";
      }).join("\n");
  }
  function renderMermaid() {
    var dark = document.documentElement.dataset.theme === "dark";
    var defs = [["m-arch", B.diagram + classDefs(dark)], ["m-seq", B.sequence], ["m-gantt", B.gantt]];
    var nodes = [];
    defs.forEach(function (d) {
      var el = document.getElementById(d[0]);
      if (!el) return;
      nodes.push(el);
      el.removeAttribute("data-processed");
      el.textContent = d[1];
    });
    if (!nodes.length) return;
    if (typeof mermaid === "undefined") {
      nodes.forEach(function (n) {
        n.outerHTML = '<p class="empty">This diagram needs the Mermaid library, which loads from a CDN — ' +
          "check the connection and reload. Everything else on the page works offline.</p>";
      });
      return;
    }
    mermaid.initialize({
      startOnLoad: false, securityLevel: "loose",
      theme: dark ? "dark" : "base",
      themeVariables: {
        fontFamily: '"Segoe UI", system-ui, sans-serif', fontSize: "13px",
        primaryColor: dark ? "#131c2b" : "#ffffff",
        primaryTextColor: dark ? "#e6edf6" : "#0f172a",
        primaryBorderColor: dark ? "#243044" : "#e2e8f0",
        lineColor: dark ? "#64748b" : "#94a3b8",
        secondaryColor: dark ? "#0f3b38" : "#ccfbf1",
        tertiaryColor: dark ? "#0b1220" : "#eef2f6"
      }
    });
    mermaid.run({ nodes: nodes }).catch(function () {
      nodes.forEach(function (n) { n.innerHTML = '<p class="empty">This diagram could not be drawn.</p>'; });
    });
  }

  var kindChart = null;
  function renderChart() {
    var el = document.getElementById("kindChart");
    if (!el) return;
    if (typeof Chart === "undefined") {
      el.parentNode.innerHTML = '<p class="empty">This chart needs the Chart.js library, which loads from a CDN — ' +
        "check the connection and reload.</p>";
      return;
    }
    var css = function (k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); };
    var kinds = Object.keys(kindMeta);
    if (kindChart) kindChart.destroy();
    kindChart = new Chart(el, {
      type: "doughnut",
      data: {
        labels: kinds.map(function (k) { return kindMeta[k].label; }),
        datasets: [{
          data: kinds.map(countKind),
          backgroundColor: kinds.map(function (k) { return css(kindMeta[k].c); }),
          borderColor: css("--card"), borderWidth: 3, hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "58%",
        plugins: {
          legend: { position: "bottom",
            labels: { color: css("--muted"), padding: 14, boxWidth: 11, boxHeight: 11, usePointStyle: true,
              font: { family: '"Segoe UI", system-ui, sans-serif', size: 12 } } },
          tooltip: { callbacks: { label: function (c) { return " " + c.parsed + (c.parsed === 1 ? " component" : " components"); } } }
        },
        animation: { duration: 700 }
      }
    });
  }

  /* ---------- fullscreen figures ---------- */
  var zoom = 1;
  function applyZoom() {
    var inner = document.getElementById("lb-inner");
    if (!inner) return;
    inner.style.transform = "scale(" + zoom + ")";
    document.getElementById("lb-zoom").textContent = Math.round(zoom * 100) + "%";
  }
  function openFigure(figId) {
    var fig = document.querySelector('[data-fig="' + figId + '"]');
    if (!fig) return;
    var body = fig.querySelector(".figure-body");
    var inner = document.getElementById("lb-inner");
    inner.innerHTML = "";
    var canvas = body.querySelector("canvas");
    var svgEl = body.querySelector("svg");
    if (canvas) {
      var img = new Image();
      img.src = canvas.toDataURL("image/png");
      img.style.width = Math.min(canvas.clientWidth * 1.6, 900) + "px";
      inner.appendChild(img);
    } else if (svgEl) {
      var clone = svgEl.cloneNode(true);
      var vb = (svgEl.getAttribute("viewBox") || "").split(/\s+/);
      var natural = vb.length === 4 ? parseFloat(vb[2]) : svgEl.clientWidth;
      clone.removeAttribute("style");
      clone.removeAttribute("class");
      clone.setAttribute("width", Math.max(natural, 960));
      clone.removeAttribute("height");
      clone.style.maxWidth = "none";
      inner.appendChild(clone);
    } else {
      inner.innerHTML = '<p class="empty">Nothing to expand yet — the figure is still loading.</p>';
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
  var AGENT_SCOPE = {
    summary: ["project", "idea", "dayOneBar", "conclusion", "kpis"],
    architecture: ["components", "diagram"],
    components: ["components"],
    flow: ["flow", "sequence"],
    build: ["phases", "gantt"],
    coverage: ["coverage"],
    assumptions: ["assumptions", "openQuestion"],
    appendix: ["artifacts"]
  };
  function scopedBlueprint(scope, activeId) {
    if (scope === "all" || !activeId) return B;
    var out = { project: B.project, idea: B.idea, dayOneBar: B.dayOneBar };
    (AGENT_SCOPE[activeId] || []).forEach(function (k) { out[k] = B[k]; });
    return out;
  }

  function initAgent(activeId) {
    var panel = document.getElementById("agent");
    var log = document.getElementById("ag-log");
    var textEl = document.getElementById("ag-text");
    var sendEl = document.getElementById("ag-send");
    var keyEl = document.getElementById("ag-key");
    var modelEl = document.getElementById("ag-model");
    var scopeEl = document.getElementById("ag-scope");
    var fields = document.getElementById("ag-llm-fields");
    var bLocal = document.getElementById("mode-local");
    var bLLM = document.getElementById("mode-llm");
    var history = [];
    var mode = "local";

    var savedKey = store("bp-key"); if (savedKey) keyEl.value = savedKey;
    var savedModel = store("bp-model"); if (savedModel) modelEl.value = savedModel;
    keyEl.addEventListener("change", function () { store("bp-key", keyEl.value.trim()); });
    modelEl.addEventListener("change", function () { store("bp-model", modelEl.value); });

    function setMode(m) {
      mode = m;
      bLocal.classList.toggle("on", m === "local");
      bLLM.classList.toggle("on", m === "llm");
      fields.hidden = m !== "llm";
      textEl.placeholder = m === "local"
        ? "Search the blueprint…"
        : "Ask about this design…";
    }
    bLocal.onclick = function () { setMode("local"); };
    bLLM.onclick = function () { setMode("llm"); };

    function add(role, text) {
      var d = document.createElement("div");
      d.className = "msg " + role;
      d.textContent = text;
      log.appendChild(d); log.scrollTop = log.scrollHeight;
      return d;
    }
    function addHTML(role, html) {
      var d = document.createElement("div");
      d.className = "msg " + role;
      d.innerHTML = html;
      log.appendChild(d); log.scrollTop = log.scrollHeight;
      return d;
    }

    add("bot", "Two ways to use this. Search needs no key and works offline — it looks through every section of the blueprint and shows you the passages. Claude needs your own API key and answers in prose, still only from this design.");
    var wrap = document.createElement("div");
    wrap.className = "starters";
    (B.starters || [])
      .forEach(function (s) {
        var b = document.createElement("button");
        b.className = "starter"; b.textContent = s;
        b.onclick = function () { textEl.value = s; send(); };
        wrap.appendChild(b);
      });
    log.appendChild(wrap);

    /* --- local, deterministic answer --- */
    function answerLocally(q) {
      var ts = terms(q);
      var hits = searchBlueprint(q, 5);
      if (!hits.length) {
        addHTML("bot", "Nothing in this blueprint matches <b>" + esc(q) + "</b>. " +
          "That may itself be the answer — check the Coverage section for what was deliberately left out.");
        return;
      }
      var html = "<b>" + hits.length + (hits.length === 1 ? " passage" : " passages") +
        "</b> in the blueprint match that:";
      hits.forEach(function (h) {
        var sec = sectionOf(h.e.sec);
        html += '<a class="hit" href="' + sec.file + '">' +
          '<span class="h-top"><span class="h-sec">' + esc(sec.nav) + "</span>" +
          '<span class="h-title">' + mark(h.e.title, ts) + "</span></span>" +
          '<span class="h-snip">' + mark(snippet(h.e.text, ts, 190), ts) + "</span></a>";
      });
      addHTML("bot", html);
    }

    /* --- Claude --- */
    function answerWithClaude(q) {
      var key = keyEl.value.trim();
      if (!key) { add("err", "Paste your Anthropic API key above, or switch back to Search — that mode needs no key."); keyEl.focus(); return; }
      store("bp-key", key);
      var thinking = add("bot", "Thinking…");
      sendEl.disabled = true;

      var data = scopedBlueprint(scopeEl.value, activeId);
      var system =
        'You are an assistant embedded in a system-architecture knowledge base for a project called "' + B.project + '".\n\n' +
        "Answer ONLY from the blueprint JSON below. If the answer is not in it, say plainly that this blueprint does not cover it, " +
        "and if useful name which section would need to change. Never invent components, numbers, or decisions that are not present.\n\n" +
        "Be concise and concrete. Write for a smart non-engineer unless the question is clearly technical. " +
        "Plain sentences, no markdown headers, no bullet-point walls.\n\n" +
        "BLUEPRINT JSON:\n" + JSON.stringify(data, null, 1);

      history.push({ role: "user", content: q });
      var body = { model: modelEl.value, max_tokens: 16000, system: system, messages: history };
      // Haiku 4.5 rejects output_config.effort; the 5-series accepts it.
      if (modelEl.value !== "claude-haiku-4-5") body.output_config = { effort: "low" };

      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify(body)
      }).then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, status: r.status, json: j }; });
      }).then(function (res) {
        thinking.remove();
        if (!res.ok) {
          var m = (res.json && res.json.error && res.json.error.message) || "HTTP " + res.status;
          if (res.status === 401) m = "That key was rejected. Check it, or use Search mode — it needs no key.";
          if (res.status === 429) m = "Rate limited. Wait a moment, or use Search mode meanwhile.";
          add("err", m); history.pop(); sendEl.disabled = false; return;
        }
        if (res.json.stop_reason === "refusal") {
          add("err", "The model declined to answer that one."); history.pop(); sendEl.disabled = false; return;
        }
        var text = (res.json.content || []).filter(function (b) { return b.type === "text"; })
          .map(function (b) { return b.text; }).join("\n").trim();
        if (!text) text = "The model returned an empty answer. Try rephrasing.";
        add("bot", text);
        history.push({ role: "assistant", content: text });
        sendEl.disabled = false;
      }).catch(function () {
        thinking.remove();
        add("err", "Could not reach the API. If you opened this file straight from disk, the browser may be blocking the request — " +
          'serve the folder instead ("python -m http.server" in project-blueprint, then http://localhost:8000). ' +
          "Search mode keeps working either way.");
        history.pop(); sendEl.disabled = false;
      });
    }

    function send() {
      var q = textEl.value.trim();
      if (!q) return;
      textEl.value = "";
      add("user", q);
      if (mode === "local") answerLocally(q); else answerWithClaude(q);
    }

    sendEl.onclick = send;
    textEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    document.getElementById("ask-btn").onclick = function () {
      panel.classList.add("on"); textEl.focus();
    };
    document.getElementById("ag-close").onclick = function () { panel.classList.remove("on"); };
    setMode("local");
  }

  /* ---------- page behaviour ---------- */
  function wire(activeId) {
    try {
      var saved = store("bp-theme");
      if (saved) document.documentElement.dataset.theme = saved;
      else if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
    } catch (e) { /* no storage — light theme */ }

    document.getElementById("theme").onclick = function () {
      var root = document.documentElement;
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      store("bp-theme", root.dataset.theme);
      renderMermaid(); renderChart();
    };
    document.getElementById("print").onclick = function () { print(); };
    document.getElementById("hamburger").onclick = function () {
      document.getElementById("navlinks").classList.toggle("open");
    };

    var prog = document.getElementById("progress");
    var totop = document.getElementById("totop");
    addEventListener("scroll", function () {
      var h = document.documentElement;
      prog.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + "%";
      totop.classList.toggle("on", h.scrollTop > 420);
    }, { passive: true });
    totop.onclick = function () { scrollTo({ top: 0, behavior: "smooth" }); };

    /* --- site-wide search + on-page filtering --- */
    var search = document.getElementById("search");
    var results = document.getElementById("results");

    function runSearch() {
      var q = search.value.trim();
      var ts = terms(q);

      // narrow what is visible on this page
      var shown = 0, items = document.querySelectorAll("[data-search]");
      items.forEach(function (el) {
        var hit = !q || el.dataset.search.indexOf(q.toLowerCase()) !== -1 ||
          ts.some(function (t) { return el.dataset.search.indexOf(t) !== -1; });
        el.hidden = !hit; if (hit) shown++;
      });
      var none = document.getElementById("no-results");
      if (none) none.hidden = shown > 0 || !items.length;

      // and show matches from everywhere else
      if (!q) { results.hidden = true; results.innerHTML = ""; return; }
      var hits = searchBlueprint(q, 10);
      if (!hits.length) {
        results.innerHTML = '<div class="res-none">Nothing in the blueprint matches “' + esc(q) + "”.</div>";
      } else {
        results.innerHTML = '<div class="res-head">' + hits.length + " result" + (hits.length === 1 ? "" : "s") +
          " across the blueprint</div>" +
          hits.map(function (h) {
            var sec = sectionOf(h.e.sec);
            return '<a class="res" href="' + sec.file + '">' +
              '<span class="r-top"><span class="r-sec">' + esc(sec.nav) + "</span>" +
              '<span class="r-kind">' + esc(h.e.kind) + "</span></span>" +
              '<span class="r-title">' + mark(h.e.title, ts) + "</span>" +
              '<span class="r-snip">' + mark(snippet(h.e.text, ts, 140), ts) + "</span></a>";
          }).join("");
      }
      results.hidden = false;
    }

    search.addEventListener("input", runSearch);
    search.addEventListener("focus", function () { if (search.value.trim()) runSearch(); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".search-wrap")) results.hidden = true;
    });

    addEventListener("keydown", function (e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (e.key === "/" && document.activeElement !== search && tag !== "TEXTAREA" && tag !== "INPUT") {
        e.preventDefault(); search.focus();
      }
      if (e.key === "Escape") {
        if (document.getElementById("lightbox").classList.contains("on")) closeFigure();
        else if (!results.hidden) results.hidden = true;
        else if (document.activeElement === search) {
          search.value = ""; runSearch(); search.blur();
        }
      }
    });

    /* --- fullscreen figures --- */
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-expand]");
      if (btn) openFigure(btn.dataset.expand);
    });
    document.getElementById("lb-close").onclick = closeFigure;
    document.getElementById("lb-in").onclick = function () { zoom = Math.min(4, zoom + 0.25); applyZoom(); };
    document.getElementById("lb-out").onclick = function () { zoom = Math.max(0.5, zoom - 0.25); applyZoom(); };
    document.getElementById("lb-reset").onclick = function () { zoom = 1; applyZoom(); };
    document.getElementById("lightbox").addEventListener("click", function (e) {
      if (e.target.id === "lightbox") closeFigure();
    });

    initAgent(activeId);
    renderMermaid();
    renderChart();
  }

  /* ---------- renderers ---------- */
  function renderIndex() {
    document.title = B.project + " — Command Center";
    document.body.innerHTML =
      chrome(null) +
      '<div class="wrap"><header class="hero">' +
      '<div class="eyebrow">System Blueprint</div>' +
      "<h1>" + B.project + "</h1>" +
      '<p class="tagline">' + B.tagline + "</p>" +
      '<div class="bar"><div class="lbl">The day-one bar</div><p>' + B.dayOneBar + "</p></div>" +
      "</header>" +
      fig("story", ART.story(), true) +
      '<div class="cc-head"><h2>Command Center</h2>' +
      "<span>Everything in one spot — open a section, then come back here for the next one.</span></div>" +
      '<div class="cc-grid">' + SECTIONS.map(function (s) {
        return '<a class="tile" href="' + s.file + '" data-search="' +
          esc((s.title + " " + s.lede).toLowerCase()) + '">' +
          '<div class="thumb">' + THUMBS[s.thumb] + "</div>" +
          "<h3>" + s.title + "</h3><p>" + s.lede + "</p>" +
          '<div class="count">' + s.count() + "</div></a>";
      }).join("") + "</div>" +
      '<div class="empty" id="no-results" hidden>No section matches that search.</div>' +
      footer() + "</div>" +
      '<button id="totop" aria-label="Back to top">↑</button>' +
      lightboxMarkup() + agentMarkup(null);
    wire(null);
  }

  function render(id) {
    var i = -1;
    SECTIONS.forEach(function (s, n) { if (s.id === id) i = n; });
    if (i === -1) { renderIndex(); return; }
    var s = SECTIONS[i], prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
    document.title = s.title + " — " + B.project;

    document.body.innerHTML =
      chrome(id) +
      '<div class="wrap"><div class="sec-head">' +
      '<div class="eyebrow">Section ' + (i + 1) + " of " + SECTIONS.length + "</div>" +
      "<h1>" + s.title + "</h1><p>" + s.lede + "</p></div>" +
      BODY[id]() +
      '<div class="pagenav">' +
      (prev ? '<a href="' + prev.file + '"><span>← Previous</span>' + prev.title + "</a>"
        : '<a href="index.html"><span>←</span>Command Center</a>') +
      (next ? '<a class="nxt" href="' + next.file + '"><span>Next →</span>' + next.title + "</a>"
        : '<a class="nxt" href="index.html"><span>Back to →</span>Command Center</a>') +
      "</div>" +
      '<a class="back-cc" href="index.html">← Back to Command Center</a>' +
      footer() + "</div>" +
      '<button id="totop" aria-label="Back to top">↑</button>' +
      lightboxMarkup() + agentMarkup(id);
    wire(id);
  }

  global.Blueprint = {
    render: render, renderIndex: renderIndex,
    sections: SECTIONS, search: searchBlueprint, index: INDEX, art: ART
  };
})(window);
