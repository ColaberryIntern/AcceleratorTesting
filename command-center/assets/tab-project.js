/* ============================================================
   TAB 6 — Project management.
   A Gantt view of the plan's releases, and under it every task,
   drawn across the window of the release it belongs to. Tasks
   are clickable and open their own detail.

   Geometry is computed from the release week numbers in
   plan.json, never drawn by hand, so the chart cannot drift
   from the plan. The plan gives no per-task date, so none is
   drawn — see the note in render().
   ============================================================ */
const TabProject = {

  W: 1120, PAD_L: 214, PAD_R: 22, HEAD: 54, REL_H: 30, STORY_H: 22,

  scale(g) {
    const p = g.plan.project;
    const total = App.days(p.buildStart, p.demoDay) + 1;
    const chartW = TabProject.W - TabProject.PAD_L - TabProject.PAD_R;
    const dayW = chartW / total;
    return {
      total: total, dayW: dayW,
      x: (d) => TabProject.PAD_L + App.days(p.buildStart, d) * dayW
    };
  },

  /* Unscheduled days between one release ending and the next starting. */
  gaps(g) {
    const rels = g.plan.releases, out = [];
    for (let i = 1; i < rels.length; i++) {
      const n = App.days(rels[i - 1].end, rels[i].start) - 1;
      if (n > 0) out.push({ after: rels[i - 1].id, before: rels[i].id, days: n,
        from: rels[i - 1].end, to: rels[i].start });
    }
    return out;
  },

  gantt(g) {
    const p = g.plan.project, s = TabProject.scale(g);
    const rows = [];
    g.plan.releases.forEach(r => {
      rows.push({ kind: "rel", ref: r });
      g.d.storiesIn(r.id).forEach(st => rows.push({ kind: "story", ref: st, rel: r }));
    });

    let y = TabProject.HEAD, parts = [];
    const H = TabProject.HEAD +
      g.plan.releases.length * TabProject.REL_H +
      g.d.storyTotal * TabProject.STORY_H + 26;

    /* weekly gridlines, labelled */
    const start = App.parse(p.buildStart);
    for (let i = 0; i <= s.total; i += 7) {
      const d = new Date(start.getTime() + i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const x = s.x(iso);
      parts.push('<line class="g-grid" x1="' + x.toFixed(1) + '" y1="' + (TabProject.HEAD - 14) +
        '" x2="' + x.toFixed(1) + '" y2="' + (H - 20) + '"/>');
      parts.push('<text class="g-tick" x="' + (x + 3).toFixed(1) + '" y="' +
        (TabProject.HEAD - 20) + '">' + App.esc(App.fmtShort(iso)) + '</text>');
    }

    /* rows */
    rows.forEach(row => {
      if (row.kind === "rel") {
        const r = row.ref;
        const x1 = s.x(r.start), x2 = s.x(r.end) + s.dayW;
        const st = g.d.storiesIn(r.id);
        const done = st.filter(x =>
          (g.stories.filter(y2 => y2.id === x.id)[0] || {}).status === "shipped").length;
        const frac = st.length ? done / st.length : 0;
        parts.push('<a href="' + App.drill("release:" + r.id) + '">' +
          '<rect class="g-hit" x="0" y="' + y + '" width="' + TabProject.W +
            '" height="' + TabProject.REL_H + '"/>' +
          '<text class="g-label rel" x="14" y="' + (y + 19) + '">' +
            App.esc(TabProject.clip(r.id.toUpperCase() + ' · ' + r.name, 27)) + '</text>' +
          '<rect class="g-bar" x="' + x1.toFixed(1) + '" y="' + (y + 6) +
            '" width="' + Math.max(x2 - x1, 4).toFixed(1) + '" height="17" rx="4"/>' +
          (frac > 0
            ? '<rect class="g-bar done" x="' + x1.toFixed(1) + '" y="' + (y + 6) +
              '" width="' + Math.max((x2 - x1) * frac, 3).toFixed(1) +
              '" height="17" rx="4"/>'
            : '') +
          '<text class="g-count" x="' + (x2 + 8).toFixed(1) + '" y="' + (y + 19) + '">' +
            done + '/' + st.length + '</text>' +
          '</a>');
        y += TabProject.REL_H;
      } else {
        /* The plan gives a story a RELEASE, never a date. So a story is
           drawn as the window it sits in, not as a due-date dot — a dot
           would be a deadline this project has never actually set. */
        const t = row.ref;
        const live = g.stories.filter(x => x.id === t.id)[0] || {};
        const x1 = s.x(row.rel.start), x2 = s.x(row.rel.end) + s.dayW;
        const cls = live.status === "shipped" ? "done"
                  : live.status === "building" ? "wip" : "todo";
        parts.push('<a href="' + App.drill("story:" + t.id) + '">' +
          '<rect class="g-hit" x="0" y="' + y + '" width="' + TabProject.W +
            '" height="' + TabProject.STORY_H + '"/>' +
          '<text class="g-label story" x="28" y="' + (y + 15) + '">' +
            App.esc(t.id) + ' · ' + App.esc(TabProject.clip(t.title, 30)) + '</text>' +
          '<line class="g-connect ' + cls + '" x1="' + x1.toFixed(1) + '" y1="' + (y + 11) +
            '" x2="' + x2.toFixed(1) + '" y2="' + (y + 11) + '"/>' +
          '<circle class="g-dot ' + cls + '" cx="' + x1.toFixed(1) + '" cy="' + (y + 11) +
            '" r="4"/>' +
          '<text class="g-due" x="' + (x2 + 8).toFixed(1) + '" y="' + (y + 15) + '">' +
            App.esc(row.rel.id.toUpperCase()) + ' window</text>' +
          '</a>');
        y += TabProject.STORY_H;
      }
    });

    /* build end, demo day, today */
    /* Labels near the right edge anchor to the end so they cannot
       run off the chart. */
    const marker = (iso, label, cls) => {
      const x = s.x(iso);
      const nearEnd = x > TabProject.W * 0.85;
      return '<line class="g-mark ' + cls + '" x1="' + x.toFixed(1) + '" y1="' +
        (TabProject.HEAD - 14) + '" x2="' + x.toFixed(1) + '" y2="' + (H - 20) + '"/>' +
        '<text class="g-marklabel ' + cls + '" text-anchor="' +
        (nearEnd ? "end" : "start") + '" x="' + (x + (nearEnd ? -4 : 4)).toFixed(1) +
        '" y="' + (H - 6) + '">' + App.esc(label) + '</text>';
    };
    parts.push(marker(p.buildEnd, "build ends", "end"));
    parts.push(marker(p.demoDay, "demo", "demo"));

    const todayIso = App.today().toISOString().slice(0, 10);
    if (App.days(p.buildStart, todayIso) >= 0 && App.days(todayIso, p.demoDay) >= 0)
      parts.push(marker(todayIso, "today", "today"));

    return '<div class="scroll-x"><svg class="gantt" viewBox="0 0 ' + TabProject.W + ' ' + H +
      '" width="100%" height="' + H + '" role="img" ' +
      'aria-label="Release schedule from ' + App.esc(App.fmt(p.buildStart)) +
      ' to ' + App.esc(App.fmt(p.demoDay)) + '">' + parts.join("") + '</svg></div>';
  },

  clip(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; },

  render(g) {
    const d = g.d, p = g.plan.project;
    const gaps = TabProject.gaps(g);
    const gapDays = gaps.reduce((n, x) => n + x.days, 0);
    const todayIso = App.today().toISOString().slice(0, 10);
    /* Slippage is measured at RELEASE level, because that is the only
       level the plan schedules. A release whose window has closed with
       unshipped stories in it is behind. */
    const late = g.plan.releases.filter(r =>
      r.end && App.days(r.end, todayIso) > 0 &&
      g.d.storiesIn(r.id).some(st =>
        (g.stories.filter(x => x.id === st.id)[0] || {}).status !== "shipped"));
    const lateStories = late.reduce((n, r) => n + g.d.storiesIn(r.id).filter(st =>
      (g.stories.filter(x => x.id === st.id)[0] || {}).status !== "shipped").length, 0);
    const firstRel = g.plan.releases[0] || {}, lastRel =
      g.plan.releases[g.plan.releases.length - 1] || {};

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 6 of ' + d.tabsTotal + '</div>' +
        '<h1>Project management</h1>' +
        '<p class="tagline">' + d.releaseTotal + ' releases and ' + d.storyTotal +
          ' tasks, ' + App.fmt(p.buildStart) + ' to ' + App.fmt(p.buildEnd) +
          '. Demo day is ' + App.fmt(p.demoDay) + '.</p>' +
      '</header>' +
      '<div class="stats">' +
        App.stat({ k:"Releases", v:d.releaseTotal,
          s:App.esc((firstRel.id || "").toUpperCase()) + " through " +
            App.esc((lastRel.id || "").toUpperCase()) }) +
        App.stat({ k:"Tasks", v:d.storyTotal, s:g.storiesShipped + " shipped",
          sample:g.isSample }) +
        App.stat({ k:"Releases behind", v:late.length,
          s:late.length ? lateStories + " tasks past their release window"
                        : "no release window has closed with work left in it",
          sample:g.isSample, dotStatus:late.length ? "risk" : "off" }) +
        App.stat({ k:"Unscheduled days", v:gapDays, s:"between releases",
          dotStatus:gapDays ? "warn" : "off" }) +
        App.stat({ k:"Demo prep", v:App.days(p.buildEnd, p.demoDay), unit:"days",
          s:App.fmtShort(p.buildEnd) + " → " + App.fmtShort(p.demoDay) }) +
      '</div>' +
      '<div class="note"><b>Where these dates come from.</b> ' +
        '<span class="mono">plan.json</span> gives each release a week number — ' +
        App.esc((firstRel.id || "").toUpperCase()) + ' is weeks ' +
        App.esc(firstRel.weekStart + "–" + firstRel.weekEnd) + ', ' +
        App.esc((lastRel.id || "").toUpperCase()) + ' is weeks ' +
        App.esc(lastRel.weekStart + "–" + lastRel.weekEnd) +
        ' — and no calendar dates at all. Every date on this page is those week ' +
        'numbers counted from <b>' + App.esc(App.fmt(p.buildStart)) + '</b>. ' +
        App.esc(p.anchorSource) + ' Change that one anchor and this whole page moves ' +
        'with it.</div>' +
      '<div class="sec-head"><h2>Schedule</h2>' +
        '<span>Every bar and every task opens its own detail.</span></div>' +
      TabProject.gantt(g) +
      '<div class="note" style="margin-top:12px">' +
        '<b>Reading it:</b> the thick bar is a release window and the thin line under it ' +
        'is a task, drawn across the same window. Tasks have no individual due date ' +
        'because the plan does not give them one — a dot on a date would be a deadline ' +
        'nobody has set. Vertical markers are today, build end and demo day.</div>' +
      (gaps.length
        ? '<div class="sec-head"><h2>Gaps between releases</h2>' +
            '<span>' + gapDays + ' days inside the build window carry no scheduled work.</span></div>' +
          Details.table(["After", "Before", "From", "To", "Days"],
            gaps.map(x => [
              '<a class="mono" href="' + App.drill("release:" + x.after) + '">' +
                App.esc(x.after.toUpperCase()) + '</a>',
              '<a class="mono" href="' + App.drill("release:" + x.before) + '">' +
                App.esc(x.before.toUpperCase()) + '</a>',
              '<span class="mono">' + App.fmtShort(x.from) + '</span>',
              '<span class="mono">' + App.fmtShort(x.to) + '</span>',
              App.pill("warn", x.days + " days")]))
        : "") +
      '<div class="sec-head"><h2>Every task</h2>' +
        '<span>' + d.storyTotal + ' tasks in build order.</span></div>' +
      Details.table(
        ["Task", "Title", "Release", "Window", "Owned by", "Status"],
        g.stories.map(s => {
          const rel = d.releaseById[s.release] || {};
          return [
            '<a class="mono" href="' + App.drill("story:" + s.id) + '">' + App.esc(s.id) + '</a>',
            '<a href="' + App.drill("story:" + s.id) + '">' + App.esc(s.title) + '</a>',
            '<a class="mono" href="' + App.drill("release:" + s.release) + '">' +
              App.esc((s.release || "").toUpperCase()) + '</a>',
            rel.start
              ? '<span class="mono">' + App.fmtShort(rel.start) + " → " +
                App.fmtShort(rel.end) + '</span>'
              : '<span class="checked">no window in plan</span>',
            '<a href="' + App.drill("agent:" + s.agent) + '">' +
              App.esc((d.agentById[s.agent] || {}).name || "—") + '</a>',
            App.pill(s.status === "shipped" ? "ok" : s.status === "building" ? "warn" : "unknown",
                     s.status) + (g.isSample ? " " + App.sampleChip() : "")];
        })) +
      App.footer();
  }
};

/* ---------- drill-down: one page per release ---------- */
Details.handlers["release"] = function (id, g) {
  const r = g.d.releaseById[id];
  if (!r) return null;
  const st = g.d.storiesIn(id);
  const done = st.filter(x =>
    (g.stories.filter(y => y.id === x.id)[0] || {}).status === "shipped").length;

  return {
    kicker: "Project management",
    parent: { label: "Project management", href: "06-project.html" },
    title: r.id.toUpperCase() + " · " + r.name,
    lede: st.length + " stories, " + App.fmt(r.start) + " to " + App.fmt(r.end) +
          " — " + (App.days(r.start, r.end) + 1) + " days.",
    body:
      Details.card("Window", Details.table(
        ["Weeks in the plan", "Derived window", "Days", "Stories"],
        [[r.weekStart != null
            ? '<span class="mono">' + r.weekStart + "–" + r.weekEnd + '</span>'
            : '<span class="checked">none</span>',
          '<span class="mono">' + App.fmt(r.start) + " → " + App.fmt(r.end) + '</span>',
          (App.days(r.start, r.end) + 1),
          st.length]])) +
      (r.goal ? Details.card("Goal", '<p>' + App.esc(r.goal) + '</p>') : "") +
      (r.demo ? Details.card("What it demos", '<p>' + App.esc(r.demo) + '</p>') : "") +
      Details.card("Progress",
        '<p>' + done + ' of ' + st.length + ' stories shipped' +
        (g.isSample ? " " + App.sampleChip() : "") + '</p>') +
      Details.card("Stories", Details.table(
        ["Story", "Title", "Fulfils", "Owned by", "Status"],
        st.map(s => {
          const live = g.stories.filter(x => x.id === s.id)[0] || {};
          return ['<a class="mono" href="' + App.drill("story:" + s.id) + '">' +
              App.esc(s.id) + '</a>',
            App.esc(s.title),
            s.fulfills.length
              ? s.fulfills.map(rid => '<a class="mono" href="' + App.drill("req:" + rid) +
                  '">' + App.esc(rid) + '</a>').join(" ")
              : '<span class="checked">—</span>',
            '<a href="' + App.drill("agent:" + s.agent) + '">' +
              App.esc((g.d.agentById[s.agent] || {}).name || "—") + '</a>',
            App.pill(live.status === "shipped" ? "ok" :
                     live.status === "building" ? "warn" : "unknown",
                     live.status || "planned")];
        })))
  };
};

/* ---------- drill-down: one page per task ---------- */
Details.handlers["story"] = function (id, g) {
  const s = g.stories.filter(x => x.id === id)[0];
  if (!s) return null;
  const rel = g.d.releaseById[s.release] || {};
  const agent = g.d.agentById[s.agent] || {};
  const todayIso = App.today().toISOString().slice(0, 10);
  const late = s.status !== "shipped" && rel.end && App.days(rel.end, todayIso) > 0;
  const prog = g.plan.progressById[s.id];

  return {
    kicker: "Task",
    parent: { label: "Project management", href: "06-project.html" },
    title: s.id + " · " + s.title,
    lede: "In " + (rel.id || "").toUpperCase() + " " + (rel.name || "") +
          (rel.start ? ", " + App.fmt(rel.start) + " to " + App.fmt(rel.end) : "") + ".",
    body:
      (s.narrative
        ? Details.card("The story", '<p style="font-size:15px;color:var(--text)">' +
            App.esc(s.narrative) + '</p>')
        : "") +
      Details.card("Status", Details.table(
        ["Status", "Release window", "Shipped", "Evidence"],
        [[App.pill(s.status === "shipped" ? "ok" : s.status === "building" ? "warn" : "unknown",
                   s.status) + (late ? " " + App.pill("risk", "window closed") : "") +
            (g.isSample ? " " + App.sampleChip() : ""),
          rel.start
            ? '<span class="mono">' + App.fmtShort(rel.start) + " → " +
              App.fmtShort(rel.end) + '</span>'
            : '<span class="checked">no window in plan</span>',
          s.shipped ? '<span class="mono">' + App.fmt(s.shipped) + '</span>' : "—",
          s.evidence
            ? App.esc(s.evidence)
            : '<span class="checked">none — a task is only marked shipped here ' +
              'when every acceptance criterion passes</span>']])) +
      Details.card("Acceptance criteria",
        (prog && prog.criteria.length
          ? Details.table(["Criterion", "Passing"],
              prog.criteria.map(c => [App.esc(c.text),
                c.passed ? App.pill("ok", "yes") : App.pill("unknown", "not yet")])) +
            '<p style="margin-top:10px" class="checked">Read from ' +
            '<span class="mono">.colaberry/progress.json</span>.</p>'
          : s.acceptance.length
          ? Details.table(["Criterion", "Passing"],
              s.acceptance.map(t => [App.esc(t), App.pill("unknown", "not tracked")])) +
            '<p style="margin-top:10px" class="checked">These are the plan\'s criteria. ' +
            'This story does not appear in <span class="mono">progress.json</span>, so ' +
            'nothing is tracking them.</p>'
          : '<p><span class="checked">The plan states no acceptance criteria ' +
            'for this task.</span></p>')) +
      Details.card("Who builds it", Details.table(
        ["Agent", "What it does", "Autonomy"],
        [['<a href="' + App.drill("agent:" + s.agent) + '"><b>' +
            App.esc(agent.name || "—") + '</b></a>',
          App.esc(agent.does || "—"),
          agent.autonomy === "auto" ? App.pill("ok", "completes alone")
                                    : App.pill("warn", "waits for a human")]])) +
      Details.card("Release", Details.table(
        ["Release", "Window", "Stories"],
        [['<a class="mono" href="' + App.drill("release:" + s.release) + '">' +
            App.esc((rel.id || "").toUpperCase()) + '</a> ' + App.esc(rel.name || ""),
          rel.start
            ? '<span class="mono">' + App.fmtShort(rel.start) + " → " +
              App.fmtShort(rel.end) + '</span>'
            : '<span class="checked">no window in plan</span>',
          g.d.storiesIn(s.release).length]])) +
      Details.card("Requirements it fulfils",
        s.fulfills.length
          ? Details.table(["Requirement", "Kind", "Statement"],
              s.fulfills.map(rid => {
                const r = g.d.reqById[rid];
                return ['<a class="mono" href="' + App.drill("req:" + rid) + '">' +
                    App.esc(rid) + '</a>',
                  r ? App.pill(r.kind === "SAFE" ? "risk" : "unknown", r.kind)
                    : App.pill("warn", "not in plan"),
                  r ? App.esc(r.text)
                    : '<span class="checked">This story cites a requirement that is no ' +
                      'longer in the plan.</span>'];
              }))
          : '<p><span class="checked">This task names no requirement.</span></p>') +
      (s.blockedBy.length
        ? Details.card("Blocked by", Details.table(["Story", "Title", "Status"],
            s.blockedBy.map(bid => {
              const b = g.stories.filter(x => x.id === bid)[0];
              return ['<a class="mono" href="' + App.drill("story:" + bid) + '">' +
                  App.esc(bid) + '</a>',
                App.esc(b ? b.title : "not in plan"),
                b ? App.pill(b.status === "shipped" ? "ok" : "unknown", b.status)
                  : App.pill("warn", "missing")];
            })))
        : "") +
      (s.failures.length
        ? Details.card("Failure paths the plan names",
            '<p>' + s.failures.map(f => App.pill("risk", f)).join(" ") + '</p>')
        : "") +
      (s.guidance
        ? Details.card("How the plan says to build it", '<p>' + App.esc(s.guidance) + '</p>')
        : "")
  };
};
