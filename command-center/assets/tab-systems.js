/* ============================================================
   TAB 5 — Systems. What this connects to.
   One row per system, a live indicator, and the time it was
   last checked. None are connected on day one and the indicator
   says so rather than defaulting to green.
   ============================================================ */
const TabSystems = {

  /* Agents that read a system, and the stories that ride on it. */
  usedBy(g, sysId) {
    const agents = g.agents.filter(a => a.reads.indexOf(sysId) >= 0);
    const stories = [];
    agents.forEach(a => a.owns.forEach(s => { if (stories.indexOf(s) < 0) stories.push(s); }));
    return { agents: agents, stories: stories };
  },

  row(g, s) {
    const u = TabSystems.usedBy(g, s.id);
    const word = (App.STATUS[s.status] || App.STATUS.unknown).word;
    return '<a class="row" href="' + App.drill("system:" + s.id) + '">' +
      App.dot(s.status) +
      '<span class="name">' + App.esc(s.name) +
        (g.isSample ? " " + App.sampleChip() : "") +
        '<em>' + App.esc(s.role) + '</em></span>' +
      '<span class="state"><b>' + App.esc(word) + '</b>' +
        '<br><span class="checked">' + App.esc(App.since(s.lastChecked)) + '</span></span>' +
      '<span class="go">' + u.agents.length + ' agents →</span>' +
    '</a>';
  },

  render(g) {
    const d = g.d;
    const stats = '<div class="stats">' +
      App.stat({ k:"Connected", v:g.systemsConnected, unit:"of " + d.systemTotal,
        s:"reporting healthy", sample:g.isSample,
        dotStatus:g.systemsConnected === d.systemTotal ? "ok" : "unknown" }) +
      App.stat({ k:"In error", v:g.systemsError, s:"returning a failure",
        sample:g.isSample, dotStatus:g.systemsError ? "error" : "off" }) +
      App.stat({ k:"Never checked", v:g.systemsUnknown, s:"no reading has been taken",
        sample:g.isSample, dotStatus:"unknown" }) +
      App.stat({ k:"Last check", v:'<small>' + App.esc(App.since(
          g.systems.map(x => x.lastChecked).filter(Boolean).sort().pop() || null)) + '</small>',
        s:"across all four systems", sample:g.isSample }) +
    '</div>';

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 5 of ' + d.tabsTotal + '</div>' +
        '<h1>Systems</h1>' +
        '<p class="tagline">The four systems this tool reads from and writes to. ' +
          'Grey means unknown, never healthy-by-default.</p>' +
      '</header>' +
      stats +
      '<div class="sec-head"><h2>Connections</h2>' +
        '<span>Each row opens the system it names.</span></div>' +
      '<div class="board">' + g.systems.map(s => TabSystems.row(g, s)).join("") + '</div>' +
      '<div class="sec-head"><h2>What each connection carries</h2>' +
        '<span>Traced from the requirement that demands it.</span></div>' +
      Details.table(
        ["System", "Requirement", "Read by", "Stories that depend on it"],
        g.systems.map(s => {
          const u = TabSystems.usedBy(g, s.id);
          return [
            App.dot(s.status) + " <b>" + App.esc(s.name) + "</b>",
            '<span class="mono">' + App.esc(s.req) + '</span> ' +
              App.esc((d.reqById[s.req] || {}).text || ""),
            u.agents.length
              ? u.agents.map(a => '<a href="' + App.drill("agent:" + a.id) + '">' +
                  App.esc(a.name) + '</a>').join("<br>")
              : '<span class="checked">no agent reads this yet</span>',
            u.stories.length
              ? u.stories.map(s2 => '<a class="mono" href="' + App.drill("story:" + s2) + '">' +
                  App.esc(s2) + '</a>').join(" ")
              : "—"
          ];
        })) +
      (g.systemsUnknown === d.systemTotal
        ? '<br>' + Details.empty("Nothing is connected yet",
            ["No credential has been issued and no check has run, so every indicator " +
             "above is grey. That is a reading of <i>unknown</i>, not a reading of healthy.",
             "A system turns green here only when a real check returns a real success."],
            ["Credentials are issued for each source system",
             "A connection check runs and records its result against the system",
             "The dot and the last-checked time on this page fill in on their own"])
        : "") +
      App.footer();
  }
};

/* ---------- drill-down: one page per system ---------- */
Details.handlers["system"] = function (id, g) {
  const s = g.systems.filter(x => x.id === id)[0];
  if (!s) return null;
  const u = TabSystems.usedBy(g, s.id);
  const req = g.d.reqById[s.req] || {};
  const word = (App.STATUS[s.status] || App.STATUS.unknown).word;

  return {
    kicker: "Systems",
    parent: { label: "Systems", href: "05-systems.html" },
    title: s.name,
    lede: s.role,
    body:
      Details.card("Live status",
        '<p>' + App.statusText(s.status, s.lastChecked) +
          (g.isSample ? " " + App.sampleChip() : "") + '</p>' +
        '<p style="margin-top:8px">' + App.esc(s.detail) + '</p>') +
      Details.card("Why this connection exists", Details.table(
        ["Requirement", "Kind", "Text"],
        [['<span class="mono">' + App.esc(s.req) + '</span>',
          App.pill("unknown", req.kind || "—"), App.esc(req.text || "—")]])) +
      Details.card("Agents that read it",
        u.agents.length
          ? Details.table(["Agent", "Fires on", "Autonomy", "Status"],
              u.agents.map(a => [
                '<a href="' + App.drill("agent:" + a.id) + '"><b>' + App.esc(a.name) + '</b></a>',
                App.esc(a.firesOn),
                a.autonomy === "auto" ? App.pill("ok", "completes alone")
                                      : App.pill("warn", "waits for a human"),
                App.dot(a.status) + " " +
                  App.esc((App.STATUS[a.status] || App.STATUS.off).word)]))
          : '<p>No agent in the plan reads this system.</p>') +
      Details.card("Stories that depend on it",
        u.stories.length
          ? Details.table(["Story", "Title", "Release", "Due", "Status"],
              u.stories.map(sid => {
                const st = g.stories.filter(x => x.id === sid)[0] || {};
                return ['<a class="mono" href="' + App.drill("story:" + sid) + '">' +
                    App.esc(sid) + '</a>',
                  App.esc(st.title || "—"),
                  '<span class="mono">' + App.esc((st.release || "").toUpperCase()) + '</span>',
                  '<span class="mono">' + App.fmtShort(st.due) + '</span>',
                  App.pill(st.status === "shipped" ? "ok" :
                           st.status === "building" ? "warn" : "unknown",
                           st.status || "planned")];
              }))
          : '<p>—</p>') +
      (s.status === "unknown"
        ? Details.empty("This connection has never been checked",
            ["There is no credential, no check and no history for " + App.esc(s.name) + ".",
             "Everything above describes what the connection is <i>for</i>. Nothing above " +
             "claims it works."],
            ["A credential is issued for " + App.esc(s.name),
             "A check runs and writes its result and timestamp",
             "This page shows the real status and check history"])
        : "")
  };
};
