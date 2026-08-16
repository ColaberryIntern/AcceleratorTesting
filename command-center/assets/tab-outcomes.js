/* ============================================================
   TAB 2 — Outcomes. The numbers this has to move.

   The plan carries NO numeric target. This tab therefore renders
   an empty state that says so, with room for one card per measure.
   No number on this page may be invented — not a baseline, not a
   target, not a direction of travel.
   ============================================================ */
const TabOutcomes = {

  /* What a measure has to carry before it can appear here. */
  needs: [
    { part:"What is counted",   eg:"e.g. hours between a student being flagged and " +
                                    "an instructor making contact" },
    { part:"Where it is read from", eg:"which table or system produces the number" },
    { part:"Baseline today",    eg:"what it is now, before this tool exists" },
    { part:"Target",            eg:"the value that counts as success" },
    { part:"Direction of good", eg:"higher or lower" },
    { part:"Who owns it",       eg:"the person who acts when it moves the wrong way" }
  ],

  /* One card per measure the plan commits to. The plan records what
     was PROMISED; it never records how far it has moved. So the value
     is whatever the produced state says, and "not measured yet" when
     nothing says anything — never a zero, which reads as a real
     result that happens to be bad. */
  measureCard(g, m) {
    const read = m.value != null;
    return '<a class="tile' + (read ? "" : " empty") + '" href="' +
        App.drill("outcome:" + m.id) + '">' +
      '<div class="tile-top"><h3>' + App.esc(m.id) + '</h3>' +
        (read ? App.sampleChip() : App.dot("unknown")) + '</div>' +
      '<div class="headline">' + (read
        ? App.esc(String(m.value)) +
          (m.target != null ? ' <small>target ' + App.esc(String(m.target)) + '</small>' : '')
        : '<small>not measured yet</small>') + '</div>' +
      '<p class="lede">' + App.esc(m.name) + '</p>' +
      '<div class="foot"><span>' + (read
        ? App.pill("warn", "sample reading")
        : (m.stated ? App.pill("unknown", "target stated, never read")
                    : App.pill("warn", "no number stated"))) +
      '</span><span class="go">Open →</span></div>' +
    '</a>';
  },

  render(g) {
    const d = g.d;
    const total = g.measures.length;
    const read  = g.measuresRead;
    const withNumber = g.measures.filter(m => m.stated).length;

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 2 of ' + d.tabsTotal + '</div>' +
        '<h1>Outcomes</h1>' +
        '<p class="tagline">The numbers this has to move.</p>' +
        '<div class="said"><div class="lbl">Status</div><p>' + (total
          ? 'Your plan commits to <b>' + total + ' measures</b> — its ' +
            '<b>NFR</b> requirements, the ones that describe how the system must ' +
            'behave rather than what it must do. ' +
            (read
              ? 'The readings below are <b>made up</b>.'
              : '<b>None has ever been measured.</b> These files record what was ' +
                'promised; how far it has moved comes from the running system, which ' +
                'does not exist yet.')
          : 'Your plan names <b>no measure at all</b> — it carries no NFR requirement. ' +
            'This tab stays empty until one is agreed; nothing here will be invented ' +
            'to fill it.') + '</p></div>' +
      '</header>' +
      (total
        ? '<div class="stats">' +
            App.stat({ k:"Measures committed", v:total, s:"NFR requirements in the plan" }) +
            App.stat({ k:"Ever measured", v:read, unit:"of " + total,
              s:read ? "sample readings" : "nothing has produced a number",
              sample:g.isSample, dotStatus:read ? "warn" : "off" }) +
            App.stat({ k:"State a number", v:withNumber, unit:"of " + total,
              s:withNumber ? "carry a target you could test against"
                           : "none names a threshold to test against",
              dotStatus:withNumber ? "ok" : "warn" }) +
          '</div>' +
          '<div class="sec-head"><h2>Every measure</h2>' +
            '<span>One card per NFR requirement. Each opens how it would be calculated.</span>' +
          '</div>' +
          '<div class="grid">' +
            g.measures.map(m => TabOutcomes.measureCard(g, m)).join("") + '</div>'
        : Details.empty("No measure is defined",
            ["Your plan states what the system does and what it must never do, but it " +
             "names no number it has to move.",
             "Rather than invent one, this tab reports the gap."],
            ["Agree what success is measured in",
             "Agree the baseline today and the target",
             "Add it to the plan — this tab fills in with one card per measure"])) +
      '<div class="sec-head"><h2>What a measure has to carry</h2>' +
        '<span>Before any of the cards above can show a number.</span></div>' +
      Details.table(["Part", "Meaning"],
        TabOutcomes.needs.map(n => ['<b>' + App.esc(n.part) + '</b>', App.esc(n.eg)])) +
      '<div class="note" style="margin-top:14px"><b>Why this matters more than it looks:</b> ' +
        'every other tab in this Command Center reports on effort — stories shipped, ' +
        'systems connected, agents running. This is the only tab that would report on ' +
        'effect. While these cards read <i>not measured yet</i>, the Command Center can ' +
        'tell you the build is on schedule but not whether it worked.</div>' +
      App.footer();
  }
};

/* ---------- drill-down: one page per measure, and how it would be read ---------- */
Details.handlers["outcome"] = function (id, g) {
  const m = g.measures.filter(x => x.id === id)[0];
  if (!m) return null;
  const read = m.value != null;
  const covering = m.coveredBy.map(sid => g.stories.filter(s => s.id === sid)[0])
                              .filter(Boolean);

  return {
    kicker: "Outcomes",
    parent: { label: "Outcomes", href: "02-outcomes.html" },
    title: m.id,
    lede: m.name,
    body:
      Details.cardHtml("Reading" + (read ? " " + App.sampleChip() : ""), Details.table(
        ["Now", "Target stated in the plan", "Last measured"],
        [[read ? '<b>' + App.esc(String(m.value)) + '</b>'
               : '<span class="checked">not measured yet</span>',
          m.target != null ? '<b>' + App.esc(String(m.target)) + '</b>'
                           : '<span class="checked">the requirement states no number</span>',
          m.measuredAt ? '<span class="mono">' + App.esc(App.since(m.measuredAt)) + '</span>'
                       : '<span class="checked">never</span>']])) +
      Details.card("How it would be calculated",
        '<p>This measure is requirement <a class="mono" href="' +
          App.drill("req:" + m.req) + '">' + App.esc(m.req) + '</a>, typed <b>NFR</b> ' +
        'in the plan: <i>' + App.esc(m.name) + '</i></p>' +
        '<p style="margin-top:10px">' + (m.target != null
          ? 'It states a threshold of <b>' + App.esc(String(m.target)) + '</b>, so it can ' +
            'be tested the moment something emits the number. What is missing is the ' +
            'emitter — no part of the build measures this yet.'
          : 'It states <b>no number</b>. Before it can show a reading, someone has to ' +
            'decide what is counted, where the number is read from, and what value ' +
            'counts as success — the six parts listed on the Outcomes tab.') + '</p>') +
      Details.card("Work that would produce the number",
        covering.length
          ? Details.table(["Story", "Title", "Release", "Status"],
              covering.map(s => [
                '<a class="mono" href="' + App.drill("story:" + s.id) + '">' +
                  App.esc(s.id) + '</a>',
                App.esc(s.title),
                '<a class="mono" href="' + App.drill("release:" + s.release) + '">' +
                  App.esc((s.release || "").toUpperCase()) + '</a>',
                App.pill(s.status === "shipped" ? "ok" :
                         s.status === "building" ? "warn" : "unknown", s.status)]))
          : '<p><span class="checked">No story in the plan fulfils ' + App.esc(m.req) +
            '.</span> Nothing is scheduled that would make this measurable.</p>') +
      (read
        ? '<div class="note"><b>This reading is made up.</b> It exists so the shape of a ' +
          'measure card is visible. Switch to <b>Real</b> and it reports ' +
          '<i>not measured yet</i>, which is the true state.</div>'
        : Details.empty("Nothing has ever measured this",
            ["Your plan files record what the system promised. They do not — and cannot — " +
             "record how far it has moved. That number comes from the running system.",
             "A zero here would read as a real result. <i>Not measured yet</i> is the " +
             "honest reading and stays until something reports in."],
            ["The work above ships and starts emitting the number",
             "The number is recorded against " + App.esc(m.req),
             "This page shows the reading and the time it was taken"]))
  };
};
