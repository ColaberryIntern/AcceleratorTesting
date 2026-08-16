/* ============================================================
   TAB 7 — AI agents.
   One card per agent: what fires it, what it reads and produces,
   how much it decides on its own, and when it must stop and ask.

   Autonomy is not decoration. Every agent marked "waits for a
   human" shows its held work on this page, with the person who
   has to release it named.
   ============================================================ */
const TabAgents = {

  /* reads[] mixes source-system ids with artifact names — link the
     ones that resolve to a system, print the rest as artifacts. */
  reads(g, a) {
    return a.reads.map(r => {
      const sys = g.d.systemById[r];
      return sys
        ? '<a href="' + App.drill("system:" + r) + '">' + App.esc(sys.name) + '</a>'
        : App.esc(r);
    }).join("<br>");
  },

  autonomyPill(a) {
    return a.autonomy === "auto"
      ? App.pill("ok", "completes on its own")
      : App.pill("warn", "waits for a human to release it");
  },

  card(g, a) {
    const held = g.approvals.filter(x => x.agent === a.id);
    return '<a class="tile" href="' + App.drill("agent:" + a.id) + '">' +
      '<div class="tile-top"><h3>' + App.esc(a.name) + '</h3>' +
        (g.isSample ? App.sampleChip() : App.dot(a.status)) + '</div>' +
      '<p class="lede">' + App.esc(a.does) + '</p>' +
      '<div>' + TabAgents.autonomyPill(a) + '</div>' +
      '<div class="note" style="font-size:12.6px">' +
        '<b>Fires on</b> ' + App.esc(a.firesOn) + ' · ' + App.esc(a.trigger) + '<br>' +
        '<b>Produces</b> ' + a.produces.map(App.esc).join(", ") + '<br>' +
        '<b>Skills</b> ' + (a.skills.length ? a.skills.map(App.esc).join(", ")
                                            : "no skills registered yet") +
      '</div>' +
      '<div class="foot"><span>' +
        App.dot(a.status) + " " +
        App.esc((App.STATUS[a.status] || App.STATUS.off).word) +
        (held.length ? " · " + held.length + " held" : "") +
      '</span><span class="go">Open →</span></div>' +
    '</a>';
  },

  waitingBlock(g) {
    const humans = g.agents.filter(a => a.autonomy === "human");
    if (g.approvals.length === 0) {
      return Details.empty("Nothing is waiting on a human right now",
        [humans.length + " of " + g.d.agentTotal + " agents prepare work and then stop. " +
         "None has run, so nothing is held.",
         "This block is the proof that the autonomy setting is real rather than a label " +
         "in the plan — held work appears here with the person who has to release it."],
        ["An agent that waits for a human runs and produces something",
         "It appears here with what it made and who must release it",
         "Nothing downstream happens until that person releases it"]);
    }
    return Details.table(
      ["Item", "What is held", "Held by", "Released by", "Waiting since"],
      g.approvals.map(a => [
        '<span class="mono">' + App.esc(a.id) + '</span> ' + App.sampleChip(),
        App.esc(a.what),
        '<a href="' + App.drill("agent:" + a.agent) + '">' +
          App.esc((g.d.agentById[a.agent] || {}).name || a.agent) + '</a>',
        App.pill("warn", a.releasedBy),
        '<span class="mono">' + App.esc(App.since(a.waitingSince)) + '</span>'
      ]));
  },

  render(g) {
    const d = g.d;
    const skillsRegistered = g.agents.reduce((n, a) => n + a.skills.length, 0);

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 7 of ' + d.tabsTotal + '</div>' +
        '<h1>AI agents</h1>' +
        '<p class="tagline">' + d.agentTotal + ' agents. ' + d.agentAuto +
          ' complete on their own; ' + d.agentHuman +
          ' prepare and then stop until a human releases the work.</p>' +
      '</header>' +
      '<div class="stats">' +
        App.stat({ k:"Defined", v:d.agentTotal, s:"in the plan" }) +
        App.stat({ k:"Running", v:g.agentsRunning, unit:"of " + d.agentTotal,
          s:g.agentsRunning ? "reporting activity" : "none has run", sample:g.isSample,
          dotStatus:g.agentsRunning ? "warn" : "off" }) +
        App.stat({ k:"Wait for a human", v:d.agentHuman, s:"cannot act alone",
          dotStatus:"warn" }) +
        App.stat({ k:"Skills registered", v:skillsRegistered,
          s:skillsRegistered ? "across all agents" : "none registered yet",
          sample:g.isSample, dotStatus:skillsRegistered ? "ok" : "off" }) +
      '</div>' +
      '<div class="sec-head"><h2>Waiting on a human</h2>' +
        '<span>The surface that makes the autonomy setting real.</span></div>' +
      TabAgents.waitingBlock(g) +
      '<div class="sec-head"><h2>Every agent</h2>' +
        '<span>Each card opens the agent it names.</span></div>' +
      '<div class="grid">' + g.agents.map(a => TabAgents.card(g, a)).join("") + '</div>' +
      App.footer();
  }
};

/* ---------- drill-down: one page per agent ---------- */
Details.handlers["agent"] = function (id, g) {
  const a = g.agents.filter(x => x.id === id)[0];
  if (!a) return null;
  const held = g.approvals.filter(x => x.agent === a.id);
  const blockReq = a.blockedByReq ? g.d.reqById[a.blockedByReq] : null;

  const stops = a.stopsWhen || blockReq
    ? Details.card("When it must stop and ask",
        (a.stopsWhen ? '<p>' + App.esc(a.stopsWhen) + '</p>' : '') +
        (blockReq
          ? '<p style="margin-top:8px">Cannot act alone because of ' +
            '<a class="mono" href="' + App.drill("guardrail:" + blockReq.id) + '">' +
            App.esc(blockReq.id) + '</a> — ' + App.esc(blockReq.text) + '</p>'
          : ''))
    : Details.card("When it must stop and ask",
        '<p>The plan sets no stopping condition for this agent. It completes on its own.</p>');

  return {
    kicker: "AI agents",
    parent: { label: "AI agents", href: "07-agents.html" },
    title: a.name,
    lede: a.does,
    body:
      Details.card("How it runs", Details.table(
        ["Fires on", "Trigger", "Autonomy", "Status", "Runs"],
        [[App.esc(a.firesOn), App.pill("unknown", a.trigger), TabAgents.autonomyPill(a),
          App.dot(a.status) + " " + App.esc((App.STATUS[a.status] || App.STATUS.off).word),
          a.runs + (g.isSample ? " " + App.sampleChip() : "") +
            '<br><span class="checked">' + App.esc(App.since(a.lastRun)) + '</span>']])) +
      '<div class="two-col" style="margin-top:14px">' +
        '<div class="card"><h3>Reads</h3><p>' + TabAgents.reads(g, a) + '</p></div>' +
        '<div class="card"><h3>Produces</h3><p>' +
          a.produces.map(App.esc).join("<br>") + '</p></div>' +
      '</div>' +
      stops +
      Details.card("Skills it needs",
        a.skills.length
          ? '<p>' + a.skills.map(s => App.pill("brand", s)).join(" ") +
            (g.isSample ? " " + App.sampleChip() : "") + '</p>'
          : '<p><span class="checked">No skills registered yet.</span> ' +
            'The plan says this agent needs: ' +
            g.d.agentById[a.id].skills.map(App.esc).join(", ") +
            ' — but nothing has been registered against it in the build.</p>') +
      Details.card("Stories it owns", Details.table(
        ["Story", "Title", "Release", "Due", "Status"],
        a.owns.map(sid => {
          const s = g.stories.filter(x => x.id === sid)[0] || {};
          return ['<a class="mono" href="' + App.drill("story:" + sid) + '">' +
              App.esc(sid) + '</a>',
            App.esc(s.title || "—"),
            '<a class="mono" href="' + App.drill("release:" + s.release) + '">' +
              App.esc((s.release || "").toUpperCase()) + '</a>',
            '<span class="mono">' + App.fmtShort(s.due) + '</span>',
            App.pill(s.status === "shipped" ? "ok" : s.status === "building" ? "warn" : "unknown",
                     s.status || "planned")];
        }))) +
      (a.autonomy === "human"
        ? Details.card("Work it is holding",
            held.length
              ? Details.table(["Item", "What is held", "Released by", "Waiting since"],
                  held.map(h => ['<span class="mono">' + App.esc(h.id) + '</span> ' +
                      App.sampleChip(),
                    App.esc(h.what), App.pill("warn", h.releasedBy),
                    '<span class="mono">' + App.esc(App.since(h.waitingSince)) + '</span>']))
              : '<p><span class="checked">Nothing held.</span> This agent has not run, ' +
                'so it has produced nothing to release.</p>')
        : "")
  };
};

/* ---------- drill-down: skills, shared by agent pages ---------- */
Details.handlers["skills"] = function (id, g) {
  const total = g.agents.reduce((n, a) => n + a.skills.length, 0);
  return {
    kicker: "AI agents",
    parent: { label: "AI agents", href: "07-agents.html" },
    title: "Skills",
    lede: total ? total + " skills registered across " + g.d.agentTotal + " agents."
                : "No skills are registered yet.",
    body: total
      ? Details.card("Registered", Details.table(["Agent", "Skills"],
          g.agents.map(a => [App.esc(a.name),
            a.skills.length ? a.skills.map(s => App.pill("brand", s)).join(" ") + " " +
              App.sampleChip() : '<span class="checked">none</span>'])))
      : Details.empty("No skills registered yet",
          ["Every agent in the plan states the skills it needs. None has been built, " +
           "so nothing is registered against any of them.",
           "The plan's stated needs are listed below — they are requirements, not registrations."],
          ["An agent is built and its skills registered",
           "This page lists what is registered, per agent",
           "A gap between what the plan needs and what is registered becomes visible here"]) +
        Details.card("What the plan says each agent needs", Details.table(
          ["Agent", "Skills the plan names"],
          g.agents.map(a => [App.esc(a.name), a.skills.map(App.esc).join(", ")])))
  };
};
