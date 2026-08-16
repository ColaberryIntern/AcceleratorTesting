/* ============================================================
   TAB 4 — Guardrails. What must never happen.
   Each promise the system makes, and whether anything in the
   build currently enforces it.
   ============================================================ */
const TabGuardrails = {

  /* Requirements that read like promises but are not typed SAFE.
     These are OBSERVATIONS about the plan, not guardrails — found by
     the language the requirement itself uses, and never reclassified.

     Each rule below names the phrasing that triggers it, so the page
     can say WHY a requirement was picked up rather than just listing
     it. A requirement already typed SAFE is a guardrail, not a
     candidate, and is skipped. */
  RULES: [
    { test: /\ball\b|\bevery\b|\beach\b/i,
      why: "It says <i>all</i> or <i>every</i>. A promise about every case fails the " +
           "moment one case slips through, which is what a guardrail is for." },
    { test: /\bapprove|\breview\b|\bbefore\b/i,
      why: "It puts a human between a decision and its effect. If it fails open, the " +
           "check disappears silently rather than loudly." },
    { test: /\bensure\b|\bintegrity\b|\baccura/i,
      why: "It promises correctness rather than a feature. Nothing else on this tab " +
           "would catch it being wrong." },
    { test: /\bflag\b|\buncertain\b|\bunsure\b/i,
      why: "It is what stops an uncertain recommendation being presented as a " +
           "confident one." },
    { test: /\blog\b|\baudit\b/i,
      why: "An audit trail is only worth anything if it cannot be skipped. Typed for " +
           "observability, it reads as telemetry rather than as a promise." }
  ],

  candidates(g) {
    const isGuardrail = {};
    g.guardrails.forEach(gr => { isGuardrail[gr.req] = true; });
    return g.plan.requirements
      .filter(r => !isGuardrail[r.id] && r.level === "must")
      .map(r => {
        const rule = TabGuardrails.RULES.filter(x => x.test.test(r.text))[0];
        return rule ? { req: r.id, why: rule.why } : null;
      })
      .filter(Boolean);
  },

  render(g) {
    const d = g.d;
    const enforced = g.guardrailsEnforced;
    const candidates = TabGuardrails.candidates(g);

    const promises = g.guardrails.map(gr => {
      const agent = gr.bindsAgent ? (d.agentById[gr.bindsAgent] || {}) : null;
      return '<div class="card">' +
        '<div class="tile-top"><h3>' +
          App.pill("risk", "SAFE") + ' ' + App.esc(gr.req) + '</h3>' +
          App.dot(gr.enforcedBy.length ? "ok" : "off") + '</div>' +
        '<p style="color:var(--text); font-size:15px; margin:8px 0 14px">' +
          App.esc(gr.promise) + '</p>' +
        Details.table(["Enforced by", "Last verified", "Binds"],
          [[gr.enforcedBy.length
              ? gr.enforcedBy.map(e => '<span class="mono">' + App.esc(e) + '</span>').join("<br>") +
                (g.isSample ? " " + App.sampleChip() : "")
              : App.pill("unknown", "nothing in the build yet"),
            '<span class="mono">' + App.esc(App.since(gr.lastVerified)) + '</span>',
            agent
              ? '<a href="' + App.drill("agent:" + gr.bindsAgent) + '">' +
                App.esc(agent.name || gr.bindsAgent) + '</a> — cannot act alone'
              : '<span class="checked">no agent names this as an approval gate</span>']]) +
        '<div style="margin-top:12px"><a class="pill brand" href="' +
          App.drill("guardrail:" + gr.req) + '" style="text-decoration:none">Open →</a></div>' +
      '</div>';
    }).join("");

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 4 of ' + d.tabsTotal + '</div>' +
        '<h1>Guardrails</h1>' +
        '<p class="tagline">The promises this system makes, and whether anything in the ' +
          'build currently enforces them.</p>' +
      '</header>' +
      '<div class="stats">' +
        App.stat({ k:"Promises", v:d.guardrailTotal, s:"SAFE requirements in the plan" }) +
        App.stat({ k:"Enforced in the build", v:enforced, unit:"of " + d.guardrailTotal,
          s:enforced ? "with a named check" : "nothing enforces them yet",
          sample:g.isSample, dotStatus:enforced ? "ok" : "off" }) +
        App.stat({ k:"Agents bound", v:g.guardrails.filter(x => x.bindsAgent).length,
          s:"cannot act alone", dotStatus:"warn" }) +
        App.stat({ k:"Candidates", v:candidates.length,
          s:"read like promises, not typed SAFE",
          dotStatus:candidates.length ? "warn" : "off" }) +
      '</div>' +
      '<div class="sec-head"><h2>Promises</h2>' +
        '<span>One per SAFE requirement in the plan.</span></div>' +
      (g.guardrails.length
        ? promises
        : Details.empty("Your plan makes no safety promise",
            ["No requirement in the plan is typed <b>SAFE</b>, so this tab has nothing " +
             "to show. That is a gap in the plan rather than a gap in the build.",
             "A system with agents that email people on its own should carry at least " +
             "one thing it must never do."],
            ["Decide what this system must never be allowed to do",
             "Add it to the plan as a SAFE requirement",
             "This tab fills in with one promise card, tracked from then on"])) +
      (g.guardrails.length && enforced === 0
        ? '<br>' + Details.empty("Nothing in the build enforces " +
            (g.guardrails.length > 1 ? "these yet" : "this yet"),
            [g.guardrails.map(gr => App.esc(gr.req)).join(", ") +
             " is written down" +
             (g.guardrails.some(gr => gr.bindsAgent)
               ? " and it binds " + g.guardrails.filter(gr => gr.bindsAgent)
                   .map(gr => App.esc((g.d.agentById[gr.bindsAgent] || {}).name || ""))
                   .join(", ") + " — that agent cannot act alone because of it"
               : "") +
             ". But no shipped code checks it, so the guardrail currently exists only " +
             "in the plan.",
             "The dot stays grey until a named check exists and has run."],
            (g.guardrails[0].coveredBy.length
              ? g.guardrails[0].coveredBy.map(sid => {
                  const s = g.stories.filter(x => x.id === sid)[0];
                  const rel = s ? (g.d.releaseById[s.release] || {}) : {};
                  return "<b>" + App.esc(sid) + "</b> <i>" +
                    App.esc(s ? s.title : "") + "</i> ships" +
                    (rel.end ? " (window closes " + App.fmt(rel.end) + ")" : "");
                }).concat([
                  "The check registers itself against " + App.esc(g.guardrails[0].req),
                  "This page names the check and the time it last passed"])
              : ["A story is written that fulfils " + App.esc(g.guardrails[0].req) +
                 " — no story in the plan does yet",
                 "The check registers itself against the requirement",
                 "This page names the check and the time it last passed"]))
        : "") +
      '<div class="sec-head"><h2>Requirements that read like promises</h2>' +
        '<span>An observation about the plan, not a claim about the build.</span></div>' +
      '<div class="note" style="margin-bottom:12px">Your plan types ' +
        (g.guardrails.length === 1 ? 'exactly one requirement'
                                   : g.guardrails.length + ' requirements') +
        ' as <b>SAFE</b>. The ' + candidates.length + ' below ' +
        (candidates.length === 1 ? 'is' : 'are') + ' typed otherwise, but each describes ' +
        'something that must never happen rather than something the system should do. ' +
        'They were picked up by the phrasing quoted in the last column. Whether they ' +
        'belong on this tab is <b>a decision for you</b> — nothing here has been ' +
        'reclassified.</div>' +
      Details.table(["Requirement", "Typed", "Text", "Why it reads like a promise"],
        candidates.map(c => {
          const r = d.reqById[c.req] || {};
          return ['<a class="mono" href="' + App.drill("req:" + c.req) + '">' +
              App.esc(c.req) + '</a>',
            App.pill("unknown", r.kind || "—"),
            App.esc(r.text || "—"),
            c.why];   /* authored above, already safe HTML */
        })) +
      App.footer();
  }
};

/* ---------- drill-down: one page per guardrail ---------- */
Details.handlers["guardrail"] = function (id, g) {
  const gr = g.guardrails.filter(x => x.req === id)[0];
  if (!gr) return null;
  const agent = gr.bindsAgent ? (g.d.agentById[gr.bindsAgent] || {}) : null;
  /* The work that would enforce it is whatever story the plan says
     fulfils this requirement — read from fulfills, not chosen here. */
  const enforcing = gr.coveredBy
    .map(sid => g.stories.filter(s => s.id === sid)[0]).filter(Boolean);
  const req = g.d.reqById[gr.req] || {};

  return {
    kicker: "Guardrails",
    parent: { label: "Guardrails", href: "04-guardrails.html" },
    title: gr.req + (req.cluster ? " — " + req.cluster.toLowerCase() : ""),
    lede: gr.promise,
    body:
      Details.card("Is it enforced?",
        '<p>' + App.statusText(gr.enforcedBy.length ? "ok" : "off", gr.lastVerified) +
        (g.isSample ? " " + App.sampleChip() : "") + '</p>' +
        (gr.enforcedBy.length
          ? '<p style="margin-top:8px">Enforced by ' +
            gr.enforcedBy.map(e => '<span class="mono">' + App.esc(e) + '</span>').join(", ") +
            '.</p>'
          : '<p style="margin-top:8px">Nothing in the build enforces this. The promise is ' +
            'written down and it constrains an agent, but no shipped code checks it.</p>')) +
      Details.card("What it constrains",
        agent
          ? Details.table(
              ["Agent", "What it does", "Autonomy", "Why it cannot act alone"],
              [['<a href="' + App.drill("agent:" + gr.bindsAgent) + '"><b>' +
                  App.esc(agent.name || "—") + '</b></a>',
                App.esc(agent.does || "—"),
                App.pill("warn", "waits for a human"),
                App.esc(gr.req) + " — " + App.esc(gr.promise)]])
          : '<p><span class="checked">No agent in the plan names ' + App.esc(gr.req) +
            ' as an approval gate.</span> The promise is written down but it does not ' +
            'currently stop any agent from acting.</p>') +
      Details.card("Work that would enforce it",
        enforcing.length
          ? Details.table(["Story", "Title", "Release", "Window", "Status"],
              enforcing.map(s => {
                const rel = g.d.releaseById[s.release] || {};
                return [
                  '<a class="mono" href="' + App.drill("story:" + s.id) + '">' +
                    App.esc(s.id) + '</a>',
                  App.esc(s.title),
                  '<span class="mono">' + App.esc((s.release || "").toUpperCase()) + '</span>',
                  rel.start
                    ? '<span class="mono">' + App.fmtShort(rel.start) + " → " +
                      App.fmtShort(rel.end) + '</span>'
                    : '<span class="checked">—</span>',
                  App.pill(s.status === "shipped" ? "ok" :
                           s.status === "building" ? "warn" : "unknown", s.status)];
              }))
          : '<p><span class="checked">No story in the plan fulfils ' + App.esc(gr.req) +
            '.</span> This promise has nothing scheduled that would enforce it — which ' +
            'is a gap in the plan, not just in the build.</p>') +
      (gr.enforcedBy.length === 0
        ? Details.empty("No check is registered against this promise",
            ["A guardrail that nothing verifies is a sentence in a document.",
             "This page will name the check and the moment it last passed, and turn its " +
             "indicator green, only when a real check reports in."],
            [(enforcing.length ? App.esc(enforcing[0].id) : "A story that fulfils " +
                App.esc(gr.req)) + " ships and registers a check",
             "The check runs and records a pass or a fail with a timestamp",
             "This page shows the check name and its last verified time"])
        : "")
  };
};

/* ---------- drill-down: one page per requirement ---------- */
Details.handlers["req"] = function (id, g) {
  const r = g.d.reqById[id];
  if (!r) return null;
  /* Which system this requirement names, read from the systems the
     plan's own CONSTRAINT requirements declare. */
  const sys = g.systems.filter(s => s.req === id)[0] || null;
  const guard = g.guardrails.filter(x => x.req === id)[0];
  const candidate = TabGuardrails.candidates(g).filter(c => c.req === id)[0];
  const covering = (r.fulfilledBy || [])
    .map(sid => g.stories.filter(s => s.id === sid)[0]).filter(Boolean);
  const measure = g.measures.filter(m => m.req === id)[0];

  return {
    kicker: "Requirement",
    parent: { label: "Knowledge base", href: "08-knowledge.html" },
    title: r.id,
    lede: r.text,
    body:
      Details.card("Classification", Details.table(
        ["Kind", "Level", "Cluster", "Guardrail?"],
        [[App.pill(r.kind === "SAFE" ? "risk" : "unknown", r.kind),
          App.esc(r.level),
          App.esc(r.cluster || "—"),
          guard ? App.pill("risk", "yes — SAFE")
                : (candidate ? App.pill("warn", "candidate, not typed SAFE")
                             : App.pill("unknown", "no"))]])) +
      Details.card("Stories that cover it",
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
          : '<p>' + App.pill(r.level === "must" ? "risk" : "warn", "not covered") +
            ' <span class="checked">No story in the plan fulfils this requirement.</span>' +
            (r.level === "must"
              ? ' It is a <b>must</b>, so this is a real gap in the plan.'
              : '') + '</p>') +
      ((r.fulfilledByMissing || []).length
        ? '<div class="note"><b>Dangling coverage claim.</b> The plan lists ' +
          r.fulfilledByMissing.map(sid => '<span class="mono">' + App.esc(sid) + '</span>')
            .join(", ") + ' as covering this requirement, but ' +
          (r.fulfilledByMissing.length === 1 ? 'that story is' : 'those stories are') +
          ' not in the plan. ' +
          (r.fulfilledByMissing.length === 1 ? 'It does' : 'They do') +
          ' not count as coverage here — a requirement whose only covering story was ' +
          'deleted is uncovered, however the file still reads.</div>'
        : "") +
      (measure
        ? Details.card("It is also a measure",
            '<p>This requirement appears on the <a href="02-outcomes.html">Outcomes</a> ' +
            'tab as <a class="mono" href="' + App.drill("outcome:" + measure.id) + '">' +
            App.esc(measure.id) + '</a>, because NFR requirements are the only things ' +
            'this plan commits to as numbers.</p>')
        : "") +
      (sys
        ? Details.card("System it names", Details.table(
            ["System", "Status", "Last checked"],
            [['<a href="' + App.drill("system:" + sys.id) + '"><b>' +
                App.esc(sys.name) + '</b></a>',
              App.dot(sys.status) + " " +
                App.esc((App.STATUS[sys.status] || App.STATUS.unknown).word),
              '<span class="mono">' + App.esc(App.since(sys.lastChecked)) + '</span>']]))
        : "") +
      (candidate
        ? '<div class="note"><b>Reads like a promise:</b> ' + candidate.why +
          ' It is typed ' + App.esc(r.kind) + ' in the plan and has <b>not</b> been ' +
          'reclassified here — see the <a href="04-guardrails.html">Guardrails</a> tab.</div>'
        : "")
  };
};
