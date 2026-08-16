/* ============================================================
   OVERVIEW — tab 1.
   The screen you would show someone in thirty seconds: what the
   system does, which release you are in, what is live and what
   is not. Every card drills down one level via App.drill().
   ============================================================ */
const Overview = {

  /* Which release are we in, and how far through it? */
  release(g) {
    const now = App.today();
    const rels = g.plan.releases;
    let cur = null;
    for (let i = 0; i < rels.length; i++) {
      const s = App.parse(rels[i].start), e = App.parse(rels[i].end);
      if (now >= s && now <= new Date(e.getTime() + 86399000)) { cur = rels[i]; break; }
    }
    if (!cur) cur = rels.find(r => App.parse(r.start) > now) || rels[rels.length - 1];

    const span = App.days(cur.start, cur.end) + 1;
    const dayIn = App.days(cur.start, now.toISOString().slice(0, 10)) + 1;
    const started = dayIn >= 1;
    return {
      rel: cur, span: span,
      day: Math.min(Math.max(dayIn, 1), span),
      started: started,
      stories: g.plan.derive.storiesIn(cur.id)
    };
  },

  /* Where today sits in the build window. Derived, never a fixed claim —
     a sentence like "the build starts today" is true for one day and a
     lie on every other one. */
  buildPhrase(g) {
    const p = g.plan.project;
    const n = App.days(p.buildStart, App.today().toISOString().slice(0, 10));
    if (n === null) return "";
    if (n < 0)   return "The build starts " + App.fmt(p.buildStart) + ".";
    if (n === 0) return "The build starts today.";
    return "Day " + (n + 1) + " of the build, which started " + App.fmt(p.buildStart) + ".";
  },

  /* ---------- the cards. Also the registry details.js reads. ---------- */
  cards(g) {
    const r = Overview.release(g);
    const d = g.d;
    const sample = g.isSample;
    const nothing = '<small>nothing yet</small>';
    /* Skills the agents have actually REGISTERED at runtime — not the
       skills the plan says they need. Those live on g.d.agentById. */
    const skillsRegistered = g.agents.reduce((n, a) => n + a.skills.length, 0);

    return [
      {
        id: "what-it-does",
        title: "What this system does",
        headline: '<small>' + App.esc(d.agentTotal + " agents · " +
                  d.systemTotal + " systems · " + d.storyTotal + " stories") + '</small>',
        lede: App.esc(g.plan.project.purpose),
        foot: "The plan of record"
      },
      {
        id: "release-now",
        title: "Release you are in",
        headline: App.esc(r.rel.id.toUpperCase()) + ' <small>' +
                  (r.started ? "day " + r.day + " of " + r.span : "starts " + App.fmtShort(r.rel.start)) +
                  '</small>',
        lede: App.esc(r.rel.name) + " — " + r.stories.length + " stories, due " +
              App.fmtShort(r.rel.start) + " to " + App.fmtShort(r.rel.end) + ".",
        foot: d.releaseTotal + " releases in the programme"
      },
      {
        id: "delivery",
        title: "Delivery progress",
        sample: sample,
        headline: g.storiesShipped + ' <small>of ' + d.storyTotal + ' stories shipped</small>',
        lede: g.storiesShipped === 0
          ? "No story has shipped. " + Overview.buildPhrase(g)
          : g.storiesBuilding + " in progress, " +
            (d.storyTotal - g.storiesShipped - g.storiesBuilding) + " not started.",
        foot: "Build ends " + App.fmtShort(g.plan.project.buildEnd)
      },
      {
        id: "systems",
        title: "Systems",
        sample: sample,
        dotStatus: g.systemsError ? "error" : (g.systemsConnected === d.systemTotal ? "ok" : "unknown"),
        headline: g.systemsConnected + ' <small>of ' + d.systemTotal + ' connected</small>',
        lede: g.systemsUnknown === d.systemTotal
          ? "None of the four source systems has ever been checked."
          : g.systemsError + " in error, " + g.systemsUnknown + " never checked.",
        foot: "Grey means unknown, not healthy"
      },
      {
        id: "agents",
        title: "AI agents",
        sample: sample,
        headline: g.agentsRunning + ' <small>of ' + d.agentTotal + ' running</small>',
        lede: d.agentAuto + " complete on their own, " + d.agentHuman +
              " prepare and then wait for a human to release the work.",
        foot: skillsRegistered === 0
          ? "No skills registered yet"
          : skillsRegistered + " skills registered"
      },
      {
        id: "waiting",
        title: "Waiting on a human",
        sample: sample,
        empty: g.approvals.length === 0,
        headline: g.approvals.length === 0
          ? '<small>Nothing waiting</small>'
          : g.approvals.length + ' <small>items held</small>',
        lede: g.approvals.length === 0
          ? "No agent has produced anything that needs releasing. " + d.agentHuman +
            " agents will queue here once they run."
          : "Held by an agent that must not act alone. Each names who has to release it.",
        foot: d.agentHuman + " agents route through here"
      },
      {
        id: "guardrails",
        title: "Guardrails",
        sample: sample,
        empty: g.guardrailsEnforced === 0,
        headline: g.guardrailsEnforced + ' <small>of ' + d.guardrailTotal + ' enforced in the build</small>',
        lede: d.guardrailTotal === 0
          ? "The plan types no requirement SAFE, so this system promises nothing it must never do."
          : g.guardrailsEnforced === 0
          ? (d.guardrailTotal === 1 ? "One promise is" : d.guardrailTotal + " promises are") +
            " written down. Nothing in the build enforces " +
            (d.guardrailTotal === 1 ? "it" : "them") + " yet."
          : "Each promise names the code that enforces it and when it was last verified.",
        foot: g.guardrails.length
          ? g.guardrails.map(x => x.req).join(" · ") +
            (g.guardrails[0].coveredBy.length
              ? " · covered by " + g.guardrails[0].coveredBy.join(", ")
              : " · no story covers it")
          : "No SAFE requirement in the plan"
      },
      {
        id: "outcomes",
        title: "Outcomes",
        sample: sample && g.measuresRead > 0,
        empty: g.measuresRead === 0,
        headline: g.measures.length === 0
          ? '<small>No measure defined</small>'
          : g.measuresRead === 0
          ? '<small>Not measured yet</small>'
          : g.measuresRead + ' <small>of ' + g.measures.length + ' measured</small>',
        lede: g.measures.length === 0
          ? "The plan names no measure at all. Nothing here may claim one until it is agreed."
          : g.measuresRead === 0
          ? g.measures.length + " measures are committed to in the plan. None has ever been " +
            "measured — these files record what was promised, never how far it has moved."
          : "Sample readings only — nothing has really been measured for this project.",
        foot: g.measures.length
          ? g.measures.length + " NFR requirements"
          : "Needs a decision"
      },
      {
        id: "requirements",
        title: "Requirements",
        headline: d.reqTotal + ' <small>' + d.reqMust + ' must · ' + d.reqShould + ' should</small>',
        lede: "Constraints, functions, safety, observability and non-functional rules " +
              "the build has to satisfy.",
        foot: d.reqMustUncovered.length
          ? d.reqMustUncovered.length + " must-requirements no story covers"
          : "Every must-requirement is covered by a story"
      },
      {
        id: "data-model",
        title: "Data model",
        sample: sample,
        empty: g.dataModel.status !== "created",
        headline: g.dataModel.status === "created"
          ? g.dataModel.tables.length + ' <small>tables</small>'
          : '<small>Proposed, not created</small>',
        lede: g.dataModel.status === "created"
          ? "Tables derived from the requirements, named for the domain rather than the vendor."
          : "The model is to be derived from the " + d.reqTotal +
            " requirements and reviewed before any table is created.",
        foot: "Show the model before creating tables"
      },
      {
        id: "knowledge",
        title: "Knowledge base",
        sample: sample,
        headline: g.knowledgeCount + ' <small>records</small>',
        lede: d.reqTotal + " requirements, " + d.storyTotal + " stories and " + d.agentTotal +
              " agent definitions, plus " +
              (g.knowledge.notes.length + g.knowledge.decisions.length) +
              " notes and decisions added since.",
        foot: "Grows for the whole programme"
      }
    ];
  },

  /* ---------- the honest board: what is live, what is not ---------- */
  board(g) {
    const d = g.d;
    const worst = (list, key) => {
      if (list.some(x => x[key] === "error")) return "error";
      if (list.some(x => x[key] === "warn"))  return "warn";
      if (list.length && list.every(x => x[key] === "ok")) return "ok";
      if (list.some(x => x[key] === "ok"))    return "warn";
      return "unknown";
    };

    const rows = [
      { id:"systems", name:"Source systems",
        sub: g.systems.map(s => s.name).join(", ") || "none named in the plan",
        status: worst(g.systems, "status"),
        state: g.systemsConnected + " of " + d.systemTotal + " connected",
        checked: g.systems.map(s => s.lastChecked).filter(Boolean).sort().pop() || null },

      { id:"agents", name:"AI agents", sub:d.agentTotal + " defined in the plan",
        status: g.agentsRunning ? "warn" : "off",
        state: g.agentsRunning + " of " + d.agentTotal + " running",
        checked: g.agents.map(a => a.lastRun).filter(Boolean).sort().pop() || null },

      { id:"delivery", name:"Stories shipped", sub:"Across " + d.releaseTotal + " releases",
        status: g.storiesShipped ? "warn" : "off",
        state: g.storiesShipped + " of " + d.storyTotal + " shipped",
        checked: g.asAt },

      { id:"guardrails", name:"Guardrails enforced", sub:"Promises the system makes",
        status: g.guardrailsEnforced ? "ok" : "off",
        state: g.guardrailsEnforced + " of " + d.guardrailTotal + " enforced",
        checked: g.guardrails.map(x => x.lastVerified).filter(Boolean).sort().pop() || null },

      { id:"outcomes", name:"Outcome measures", sub:"Numbers this has to move",
        status: "unknown",
        state: g.measures.length === 0 ? "none defined"
             : g.measuresRead === 0 ? "0 of " + g.measures.length + " ever measured"
             : g.measuresRead + " of " + g.measures.length + " measured",
        checked: g.measures.map(m => m.measuredAt).filter(Boolean).sort().pop() || null },

      { id:"data-model", name:"Data model", sub:"Tables behind everything above",
        status: g.dataModel.status === "created" ? "ok" : "off",
        state: g.dataModel.status === "created"
          ? g.dataModel.tables.length + " tables created" : "proposed, not created",
        checked: g.dataModel.createdAt }
    ];

    return '<div class="board">' + rows.map(r =>
      '<a class="row" href="' + App.drill(r.id) + '">' +
        App.dot(r.status) +
        '<span class="name">' + App.esc(r.name) + '<em>' + App.esc(r.sub) + '</em></span>' +
        '<span class="state">' + App.esc(r.state) +
          '<br><span class="checked">' + App.since(r.checked) + '</span></span>' +
        '<span class="go">Open →</span>' +
      '</a>').join("") + '</div>';
  },

  /* ---------- page ---------- */
  render(g) {
    const p = g.plan.project;
    const r = Overview.release(g);
    const d = g.d;
    const toDemo = App.days(App.today().toISOString().slice(0, 10), p.demoDay);
    const toBuildEnd = App.days(App.today().toISOString().slice(0, 10), p.buildEnd);

    const hero =
      '<header class="hero">' +
        '<div class="eyebrow">Command Center · Tab 1 of ' + d.tabsTotal + '</div>' +
        '<h1>' + App.esc(p.name) + '</h1>' +
        '<p class="tagline">' + App.esc(p.purpose) + '</p>' +
        '<div class="said"><div class="lbl">Where this is right now</div>' +
          '<p>' + (r.started
            ? 'Day ' + r.day + ' of ' + r.span + ' in <b>' + App.esc(r.rel.id.toUpperCase()) +
              ' ' + App.esc(r.rel.name) + '</b>. '
            : App.esc(r.rel.id.toUpperCase()) + ' starts ' + App.fmt(r.rel.start) + '. ') +
          g.storiesShipped + ' of ' + d.storyTotal + ' stories shipped, ' +
          g.systemsConnected + ' of ' + d.systemTotal + ' systems connected, ' +
          g.agentsRunning + ' of ' + d.agentTotal + ' agents running. ' +
          'Build ends ' + App.fmt(p.buildEnd) + ' and the demo is ' + App.fmt(p.demoDay) + '.' +
          '</p></div>' +
      '</header>';

    const stats = '<div class="stats">' +
      App.stat({ k:"Release now", v:App.esc(r.rel.id.toUpperCase()),
        s:(r.started ? "Day " + r.day + " of " + r.span : "Starts " + App.fmtShort(r.rel.start)) +
          " · ends " + App.fmtShort(r.rel.end), href:App.drill("release-now") }) +
      App.stat({ k:"Stories shipped", v:g.storiesShipped, unit:"of " + d.storyTotal,
        s:g.storiesBuilding + " in progress", sample:g.isSample, href:App.drill("delivery") }) +
      App.stat({ k:"Systems connected", v:g.systemsConnected, unit:"of " + d.systemTotal,
        s:g.systemsError ? g.systemsError + " in error" : g.systemsUnknown + " never checked",
        sample:g.isSample,
        dotStatus:g.systemsError ? "error" : (g.systemsConnected === d.systemTotal ? "ok" : "unknown"),
        href:App.drill("systems") }) +
      App.stat({ k:"Agents running", v:g.agentsRunning, unit:"of " + d.agentTotal,
        s:d.agentHuman + " need a human to release", sample:g.isSample, href:App.drill("agents") }) +
      App.stat({ k:"Waiting on a human", v:g.approvals.length,
        s:g.approvals.length ? "held until released" : "nothing held", sample:g.isSample,
        href:App.drill("waiting") }) +
      App.stat({ k:"Days to demo", v:toDemo,
        s:App.fmt(p.demoDay) + " · build ends in " + toBuildEnd + " days",
        href:App.drill("release-now") }) +
    '</div>';

    document.getElementById("page").innerHTML =
      hero +
      '<div class="sec-head"><h2>What is live, and what is not</h2>' +
        '<span>Grey is unknown. Nothing here turns green until something real reports in.</span></div>' +
      Overview.board(g) +
      '<div class="sec-head"><h2>The thirty-second read</h2>' +
        '<span>Every card opens one level down.</span></div>' +
      stats +
      '<div class="sec-head"><h2>Everything this Command Center covers</h2>' +
        '<span>' + d.tabsBuilt + ' of ' + d.tabsTotal +
        ' tabs built — the rest are marked in the rail above.</span></div>' +
      '<div class="grid">' + Overview.cards(g).map(App.tile).join("") + '</div>' +
      App.footer();
  }
};
