/* ============================================================
   APP — the shell every page shares.
   Top bar, tab rail, mode switch, status dots, date helpers,
   and the drill-down link builder. No page-specific content.
   ============================================================ */
const App = {

  /* ---------- status vocabulary. Grey is the default. ---------- */
  STATUS: {
    ok:      { cls:"ok",      word:"Connected" },
    warn:    { cls:"warn",    word:"Needs attention" },
    error:   { cls:"risk",    word:"Error" },
    risk:    { cls:"risk",    word:"Error" },
    unknown: { cls:"unknown", word:"Not connected" },
    off:     { cls:"off",     word:"Not running" }
  },

  esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  },

  /* ---------- dates ---------- */
  today() { return new Date(); },

  parse(d) {
    if (!d) return null;
    const t = new Date(d.length === 10 ? d + "T00:00:00" : d);
    return isNaN(t.getTime()) ? null : t;
  },

  fmt(d) {
    const t = App.parse(d);
    if (!t) return "—";
    return t.toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" });
  },

  fmtShort(d) {
    const t = App.parse(d);
    if (!t) return "—";
    return t.toLocaleDateString(undefined, { day:"numeric", month:"short" });
  },

  days(from, to) {
    const a = App.parse(from), b = App.parse(to);
    if (!a || !b) return null;
    return Math.round((b - a) / 86400000);
  },

  /* "3 min ago" / "never checked". Never invents a time. */
  since(iso) {
    const t = App.parse(iso);
    if (!t) return "never checked";
    const mins = Math.round((App.today() - t) / 60000);
    if (mins < 0)    return "checked " + App.fmt(iso);
    if (mins < 1)    return "checked just now";
    if (mins < 60)   return "checked " + mins + " min ago";
    if (mins < 1440) return "checked " + Math.round(mins / 60) + " h ago";
    return "checked " + App.fmt(iso);
  },

  /* ---------- components ---------- */
  dot(status) {
    const s = App.STATUS[status] || App.STATUS.unknown;
    return '<span class="dot ' + s.cls + '" title="' + s.word + '"></span>';
  },

  statusText(status, lastChecked) {
    const s = App.STATUS[status] || App.STATUS.unknown;
    return '<span class="status">' + App.dot(status) + '<b>' + s.word + '</b>' +
           '<span class="checked">· ' + App.since(lastChecked) + '</span></span>';
  },

  pill(cls, text) {
    return '<span class="pill ' + cls + '">' + App.esc(text) + '</span>';
  },

  /* Renders only in sample mode. Every produced-state value carries one. */
  sampleChip() {
    return CCData.isSample()
      ? '<span class="chip-sample" title="This value is made up">Sample</span>' : '';
  },

  /* Drill-down link. Every card has one, even with nothing behind it. */
  drill(cardId) { return "detail.html?card=" + encodeURIComponent(cardId); },

  /* ---------- shell ---------- */

  /* Initials from the project's own name, never typed in. */
  initials() {
    return (PLAN.project.name || "?").split(/\s+/)
      .filter(w => /^[A-Za-z]/.test(w)).slice(0, 2)
      .map(w => w[0].toUpperCase()).join("") || "?";
  },

  /* The "Data as of" stamp. Sits on every tab, above the content,
     and turns into a warning once the data is over a week old. */
  stamp() {
    const a = CC.age(PLAN.manifest.generatedAt);
    return '<div class="stamp ' + a.level + '" role="status">' +
      '<span class="dot ' + (a.level === "warn" ? "warn" : "ok") + '"></span>' +
      '<b>Data as of ' + App.esc(a.absolute) + '</b>' +
      '<span class="stamp-rel">(' + App.esc(a.relative) + ')</span>' +
      (a.level === "warn"
        ? '<span class="stamp-warn">Sync from the portal to refresh.</span>'
        : '') +
      '<span class="stamp-note" title="These files are rewritten only when you sync">' +
        'Read from .colaberry/ — nothing here is live' +
      '</span>' +
    '</div>';
  },

  shell(activeTabId) {
    const p = PLAN.project;
    const initials = App.initials();

    const tabs = PLAN.tabs.map(t => {
      const active = t.id === activeTabId;
      const cls = "tab" + (active ? " active" : "") + (t.built ? "" : " pending");
      const dot = t.built ? "" : ' <span class="dot off" title="Not built yet"></span>';
      const inner = '<span class="num">' + t.n + '</span>' + App.esc(t.label) + dot;
      return t.built
        ? '<a class="' + cls + '" href="' + t.href + '">' + inner + '</a>'
        : '<span class="' + cls + '" title="Not built yet">' + inner + '</span>';
    }).join("");

    const mode = CCData.mode();
    const modeBtn = (m, label) =>
      '<button type="button" data-mode="' + m + '" aria-pressed="' +
      (mode === m ? "true" : "false") + '">' + label + '</button>';

    return '' +
      '<nav class="top">' +
        '<div class="nav-inner">' +
          '<a class="brand" href="index.html">' +
            '<span class="mark">' + initials + '</span>' +
            '<span><b>' + App.esc(p.name) + '</b>' +
            '<small>Command Center</small></span>' +
          '</a>' +
          '<div class="nav-tools">' +
            '<div class="mode" role="group" aria-label="Data mode">' +
              modeBtn("real", "Real") + modeBtn("sample", "Sample") +
            '</div>' +
            '<button class="icon-btn" id="theme-btn" type="button" ' +
              'aria-label="Toggle dark mode">◐</button>' +
          '</div>' +
        '</div>' +
      '</nav>' +
      '<div class="tabs"><div class="tabs-inner">' + tabs + '</div></div>' +
      '<div id="sample-banner">' +
        'Sample data — believable made-up values so you can see the shape of this page. ' +
        'Nothing here is a record of anything this project has produced.' +
      '</div>' +
      App.stamp();
  },

  footer(extra) {
    const g = CCData.get();
    const built = PLAN.derive.tabsBuilt, total = PLAN.derive.tabsTotal;
    return '<footer class="foot">' +
      '<span>' + App.esc(PLAN.project.name) + ' · Command Center · ' +
        built + ' of ' + total + ' tabs built</span>' +
      '<span>' + App.esc(g.label) + ' data · ' + App.esc(g.age.text) +
        (extra ? " · " + App.esc(extra) : "") + '</span>' +
    '</footer>';
  },

  /* ---------- load failure ----------
     A Command Center that renders an empty plan because a fetch failed
     is worse than one that says so. This never degrades quietly. */
  failScreen(err) {
    const local = window.location.protocol === "file:";
    return '<main class="wrap"><header class="hero">' +
      '<div class="eyebrow">Command Center</div>' +
      '<h1>Could not read the plan</h1>' +
      '<p class="tagline">Every tab is rendered from the files in ' +
        '<span class="mono">.colaberry/</span>. One of them could not be read, so ' +
        'nothing is shown rather than something wrong.</p>' +
      '</header>' +
      '<div class="card"><h3>What failed</h3>' +
        '<p class="mono" style="color:var(--risk)">' + App.esc(err && err.message ? err.message : String(err)) + '</p></div>' +
      (local
        ? '<div class="note"><b>You have opened this from the file system.</b> ' +
          'Browsers block <span class="mono">fetch()</span> on <span class="mono">file://</span> ' +
          'URLs, so the data files cannot be read. Serve the repo over HTTP instead — from ' +
          'the repo root run <span class="mono">npx serve .</span> or ' +
          '<span class="mono">python -m http.server</span>, then open ' +
          '<span class="mono">/command-center/</span>.</div>'
        : '<div class="note"><b>Checks worth making:</b> that ' +
          '<span class="mono">.colaberry/plan.json</span> and ' +
          '<span class="mono">.colaberry/progress.json</span> exist and are valid JSON, and ' +
          '— if this is GitHub Pages — that a <span class="mono">.nojekyll</span> file sits ' +
          'at the repo root, because Jekyll refuses to serve folders whose name starts with ' +
          'a dot.</div>') +
      '</main>';
  },

  /* ---------- boot ---------- */
  async init(activeTabId, render) {
    document.documentElement.setAttribute("data-mode", CCData.mode());

    let theme = "light";
    try { theme = window.localStorage.getItem("cc.theme") || "light"; } catch (e) {}
    document.documentElement.setAttribute("data-theme", theme);

    try {
      await CC.load();
    } catch (err) {
      if (window.console) console.error("Command Center: plan load failed", err);
      document.body.innerHTML = App.failScreen(err);
      return;
    }

    const shell = document.getElementById("shell");
    if (shell) shell.innerHTML = App.shell(activeTabId);

    const modeBox = document.querySelector(".mode");
    if (modeBox) {
      modeBox.addEventListener("click", function (ev) {
        const btn = ev.target.closest("button[data-mode]");
        if (!btn) return;
        CCData.setMode(btn.getAttribute("data-mode"));
        window.location.reload();
      });
    }

    const tbtn = document.getElementById("theme-btn");
    if (tbtn) {
      tbtn.addEventListener("click", function () {
        const next = document.documentElement.getAttribute("data-theme") === "dark"
          ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { window.localStorage.setItem("cc.theme", next); } catch (e) {}
      });
    }

    if (typeof render === "function") render(CCData.get());
  },

  /* ---------- small render helpers ---------- */
  stat(o) {
    const chip = o.sample ? App.sampleChip() : "";
    const body =
      '<div class="k">' + (o.dotStatus ? App.dot(o.dotStatus) : "") + App.esc(o.k) + '</div>' +
      '<div class="v">' + o.v + (o.unit ? '<small>' + App.esc(o.unit) + '</small>' : '') + '</div>' +
      '<div class="s">' + o.s + '</div>' +
      (chip ? '<span class="corner">' + chip + '</span>' : '');
    return o.href
      ? '<a class="stat" href="' + o.href + '">' + body + '</a>'
      : '<div class="stat">' + body + '</div>';
  },

  tile(c) {
    const chip = c.sample ? App.sampleChip() : "";
    return '<a class="tile' + (c.empty ? " empty" : "") + '" href="' + App.drill(c.id) + '">' +
      '<div class="tile-top"><h3>' + App.esc(c.title) + '</h3>' +
        (chip || (c.dotStatus ? App.dot(c.dotStatus) : "")) + '</div>' +
      '<div class="headline">' + c.headline + '</div>' +
      '<p class="lede">' + c.lede + '</p>' +
      '<div class="foot"><span>' + (c.foot || "") + '</span>' +
        '<span class="go">Open →</span></div>' +
    '</a>';
  }
};
