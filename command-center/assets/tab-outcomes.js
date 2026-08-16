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

  measureCard(g, o) {
    const good = o.dir === "up" ? o.value >= o.target : o.value <= o.target;
    return '<a class="tile" href="' + App.drill("outcome:" + o.id) + '">' +
      '<div class="tile-top"><h3>' + App.esc(o.name) + '</h3>' + App.sampleChip() + '</div>' +
      '<div class="headline">' + o.value + App.esc(o.unit) +
        ' <small>target ' + o.target + App.esc(o.unit) + '</small></div>' +
      '<p class="lede">' + App.esc(o.note) + '</p>' +
      '<div class="foot"><span>' +
        App.pill(good ? "ok" : "warn", good ? "at or past target" : "short of target") +
      '</span><span class="go">Open →</span></div>' +
    '</a>';
  },

  slot(i) {
    return '<a class="tile empty" href="' + App.drill("outcome:slot") + '">' +
      '<div class="tile-top"><h3>Measure ' + (i + 1) + '</h3>' +
        App.dot("unknown") + '</div>' +
      '<div class="headline">Not defined</div>' +
      '<p class="lede">Room for a measure. Nothing fills this in until a number and a ' +
        'target are agreed.</p>' +
      '<div class="foot"><span>Needs a decision</span><span class="go">What it needs →</span>' +
      '</div></a>';
  },

  render(g) {
    const d = g.d;
    const has = g.outcomes.length > 0;

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 2 of ' + d.tabsTotal + '</div>' +
        '<h1>Outcomes</h1>' +
        '<p class="tagline">The numbers this has to move.</p>' +
        '<div class="said"><div class="lbl">Status</div><p>' + (has
          ? 'Showing <b>' + g.outcomes.length + ' sample measures</b>. These are made up. ' +
            'No target has been agreed for this project.'
          : 'Your plan carries <b>no numeric target</b>. This tab is empty on purpose, and ' +
            'stays empty until a measure is agreed — nothing here will be invented to ' +
            'fill it.') + '</p></div>' +
      '</header>' +
      (has
        ? '<div class="sec-head"><h2>Sample measures</h2>' +
            '<span>Made up. Switch to Real to see the true state.</span></div>' +
          '<div class="grid">' +
            g.outcomes.map(o => TabOutcomes.measureCard(g, o)).join("") + '</div>'
        : Details.empty("No measure is defined",
            ["Your plan states what the system does (18 requirements) and what it must " +
             "never do (1 guardrail), but it names no number it has to move.",
             "Rather than invent one, this tab reports the gap. The slots below are real " +
             "room in the layout, not placeholders for data that exists somewhere else."],
            ["Agree what success is measured in",
             "Agree the baseline today and the target",
             "Add it to the plan — this tab fills in with one card per measure"]) +
          '<div class="sec-head"><h2>Room for measures</h2>' +
            '<span>One card each, the moment a target is agreed.</span></div>' +
          '<div class="grid">' + [0, 1, 2].map(TabOutcomes.slot).join("") + '</div>') +
      '<div class="sec-head"><h2>What a measure has to carry</h2>' +
        '<span>Before it can appear on this tab.</span></div>' +
      Details.table(["Part", "Meaning"],
        TabOutcomes.needs.map(n => ['<b>' + App.esc(n.part) + '</b>', App.esc(n.eg)])) +
      '<div class="note" style="margin-top:14px"><b>Why this matters more than it looks:</b> ' +
        'every other tab in this Command Center reports on effort — stories shipped, ' +
        'systems connected, agents running. This is the only tab that would report on ' +
        'effect. While it is empty, the Command Center can tell you the build is on ' +
        'schedule but not whether it worked.</div>' +
      App.footer();
  }
};

/* ---------- drill-down: measures, and the empty slot ---------- */
Details.handlers["outcome"] = function (id, g) {
  if (id === "slot") {
    return {
      kicker: "Outcomes",
      parent: { label: "Outcomes", href: "02-outcomes.html" },
      title: "A measure that has not been defined",
      lede: "Nothing sits behind this card yet. Here is what has to happen before " +
            "something does.",
      body:
        Details.empty("This slot is empty on purpose",
          ["Your plan carries no numeric target, so there is nothing to show here. " +
           "A number invented to fill this space would be worse than the space.",
           "A measure becomes real on this tab when it carries all six parts below."],
          ["Agree what is counted and where the number is read from",
           "Record the baseline today and the target",
           "Name who owns it — the person who acts when it moves the wrong way"]) +
        Details.card("What this card will carry", Details.table(
          ["Part", "Meaning"],
          TabOutcomes.needs.map(n => ['<b>' + App.esc(n.part) + '</b>', App.esc(n.eg)]))) +
        '<div class="note">Measures usually come from the requirements that describe an ' +
          'effect rather than a feature. In this plan the closest candidates are ' +
          '<a class="mono" href="' + App.drill("req:REQ-009") + '">REQ-009</a> (the ' +
          'Monday send), <a class="mono" href="' + App.drill("req:REQ-014") + '">REQ-014</a> ' +
          '(email engagement) and <a class="mono" href="' + App.drill("req:REQ-015") + '">' +
          'REQ-015</a> (engagement trends over time). <b>None of them states a number</b> ' +
          '— which is exactly the gap this tab is reporting.</div>'
    };
  }

  const o = g.outcomes.filter(x => x.id === id)[0];
  if (!o) return null;
  const good = o.dir === "up" ? o.value >= o.target : o.value <= o.target;

  return {
    kicker: "Outcomes",
    parent: { label: "Outcomes", href: "02-outcomes.html" },
    title: o.name,
    lede: o.note,
    body:
      Details.cardHtml("Reading " + App.sampleChip(), Details.table(
        ["Now", "Target", "Direction of good", "Verdict"],
        [['<b>' + o.value + App.esc(o.unit) + '</b>',
          o.target + App.esc(o.unit),
          o.dir === "up" ? "higher is better" : "lower is better",
          App.pill(good ? "ok" : "warn", good ? "at or past target" : "short of target")]])) +
      '<div class="note"><b>This measure is made up.</b> It exists so the shape of a ' +
        'measure card is visible. Switch to <b>Real</b> and this tab reports that no ' +
        'measure is defined, which is the true state of the plan.</div>'
  };
};
