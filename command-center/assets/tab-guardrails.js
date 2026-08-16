/* ============================================================
   TAB 4 — Guardrails. What must never happen.
   Each promise the system makes, and whether anything in the
   build currently enforces it.
   ============================================================ */
const TabGuardrails = {

  /* Requirements that read like promises but are not typed SAFE.
     These are OBSERVATIONS about the plan, not guardrails. The page
     says so, and asks rather than assumes. */
  candidates: [
    { req:"REQ-006", why:"It is the only thing standing between a generated list and " +
        "an email reaching an instructor. If it fails open, the human check disappears." },
    { req:"REQ-012", why:"An audit trail is only worth anything if it cannot be skipped. " +
        "Typed OBS, it reads as telemetry rather than as a promise." },
    { req:"REQ-008", why:"Flagging uncertainty is what stops a wrong recommendation being " +
        "presented as a confident one." }
  ],

  render(g) {
    const d = g.d;
    const enforced = g.guardrailsEnforced;

    const promises = g.guardrails.map(gr => {
      const agent = d.agentById[gr.bindsAgent] || {};
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
            '<a href="' + App.drill("agent:" + gr.bindsAgent) + '">' +
              App.esc(agent.name || gr.bindsAgent) + '</a> — cannot act alone']]) +
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
        App.stat({ k:"Candidates", v:TabGuardrails.candidates.length,
          s:"read like promises, not typed SAFE", dotStatus:"warn" }) +
      '</div>' +
      '<div class="sec-head"><h2>Promises</h2>' +
        '<span>One per SAFE requirement in the plan.</span></div>' +
      promises +
      (enforced === 0
        ? '<br>' + Details.empty("Nothing in the build enforces this yet",
            ["REQ-011 is written down and it binds the Integrity Checker — that agent " +
             "cannot act alone because of it. But no shipped code checks it, so the " +
             "guardrail currently exists only in the plan.",
             "The dot stays grey until a named check exists and has run."],
            ["STORY-008 <i>Implement data integrity checks</i> ships (due " +
             App.fmt("2026-09-16") + ")",
             "The check registers itself against REQ-011",
             "This page names the check and the time it last passed"])
        : "") +
      '<div class="sec-head"><h2>Requirements that read like promises</h2>' +
        '<span>An observation about the plan, not a claim about the build.</span></div>' +
      '<div class="note" style="margin-bottom:12px">Your plan types exactly one requirement ' +
        'as <b>SAFE</b>. The three below are typed FUNC or OBS, but each describes something ' +
        'that must never happen rather than something the system should do. Whether they ' +
        'belong on this tab is <b>a decision for you</b> — nothing here has been reclassified.' +
      '</div>' +
      Details.table(["Requirement", "Typed", "Text", "Why it reads like a promise"],
        TabGuardrails.candidates.map(c => {
          const r = d.reqById[c.req] || {};
          return ['<a class="mono" href="' + App.drill("req:" + c.req) + '">' +
              App.esc(c.req) + '</a>',
            App.pill("unknown", r.kind || "—"),
            App.esc(r.text || "—"),
            App.esc(c.why)];
        })) +
      App.footer();
  }
};

/* ---------- drill-down: one page per guardrail ---------- */
Details.handlers["guardrail"] = function (id, g) {
  const gr = g.guardrails.filter(x => x.req === id)[0];
  if (!gr) return null;
  const agent = g.d.agentById[gr.bindsAgent] || {};
  const enforcing = g.stories.filter(s => s.id === "STORY-008" || s.id === "STORY-009");

  return {
    kicker: "Guardrails",
    parent: { label: "Guardrails", href: "04-guardrails.html" },
    title: gr.req + " — data integrity",
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
      Details.card("What it constrains", Details.table(
        ["Agent", "What it does", "Autonomy", "Why it cannot act alone"],
        [['<a href="' + App.drill("agent:" + gr.bindsAgent) + '"><b>' +
            App.esc(agent.name || "—") + '</b></a>',
          App.esc(agent.does || "—"),
          App.pill("warn", "waits for a human"),
          App.esc(gr.req) + " — " + App.esc(gr.promise)]])) +
      Details.card("Work that would enforce it", Details.table(
        ["Story", "Title", "Release", "Due", "Status"],
        enforcing.map(s => [
          '<a class="mono" href="' + App.drill("story:" + s.id) + '">' + App.esc(s.id) + '</a>',
          App.esc(s.title),
          '<span class="mono">' + App.esc(s.release.toUpperCase()) + '</span>',
          '<span class="mono">' + App.fmtShort(s.due) + '</span>',
          App.pill(s.status === "shipped" ? "ok" : s.status === "building" ? "warn" : "unknown",
                   s.status)]))) +
      (gr.enforcedBy.length === 0
        ? Details.empty("No check is registered against this promise",
            ["A guardrail that nothing verifies is a sentence in a document.",
             "This page will name the check and the moment it last passed, and turn its " +
             "indicator green, only when a real check reports in."],
            ["STORY-008 ships and registers a check against " + App.esc(gr.req),
             "The check runs and records a pass or a fail with a timestamp",
             "This page shows the check name and its last verified time"])
        : "")
  };
};

/* ---------- drill-down: one page per requirement ---------- */
Details.handlers["req"] = function (id, g) {
  const r = g.d.reqById[id];
  if (!r) return null;
  const sys = r.system ? g.d.systemById[r.system] : null;
  const guard = g.guardrails.filter(x => x.req === id)[0];
  const candidate = TabGuardrails.candidates.filter(c => c.req === id)[0];

  return {
    kicker: "Requirement",
    parent: { label: "Knowledge base", href: "08-knowledge.html" },
    title: r.id,
    lede: r.text,
    body:
      Details.card("Classification", Details.table(
        ["Kind", "Level", "Guardrail?"],
        [[App.pill(r.kind === "SAFE" ? "risk" : "unknown", r.kind),
          App.esc(r.level),
          guard ? App.pill("risk", "yes — SAFE")
                : (candidate ? App.pill("warn", "candidate, not typed SAFE")
                             : App.pill("unknown", "no"))]])) +
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
        ? '<div class="note"><b>Reads like a promise:</b> ' + App.esc(candidate.why) +
          ' It is typed ' + App.esc(r.kind) + ' in the plan and has <b>not</b> been ' +
          'reclassified here — see the <a href="04-guardrails.html">Guardrails</a> tab.</div>'
        : "") +
      '<div class="note">This requirement is not mapped to a story — the plan does not ' +
        'carry that mapping, so none is claimed here.</div>'
  };
};
