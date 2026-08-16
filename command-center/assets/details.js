/* ============================================================
   DETAILS — one level down from every Overview card.

   A card with nothing behind it still opens: its detail says what
   will be there and what has to happen first. Nothing here claims
   a number, a connection or a result the project has not produced.
   ============================================================ */
const Details = {

  /* ---------- shared blocks ---------- */
  empty(title, lines, steps) {
    return '<div class="empty-state"><h3>' + App.esc(title) + '</h3>' +
      lines.map(l => '<p>' + l + '</p>').join("") +
      (steps && steps.length
        ? '<div class="need"><b>What has to happen first</b><ol>' +
          steps.map(s => '<li>' + s + '</li>').join("") + '</ol></div>'
        : '') +
    '</div>';
  },

  table(cols, rows) {
    return '<div class="scroll-x"><table class="data"><thead><tr>' +
      cols.map(c => '<th>' + App.esc(c) + '</th>').join("") +
      '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join("") + '</tr>').join("") +
      '</tbody></table></div>';
  },

  card(title, inner) {
    return Details.cardHtml(App.esc(title), inner);
  },

  /* Same card, but the heading is already-built HTML — for the one case where
     a heading carries a component (a sample chip). Callers passing plain text
     must use card(), which escapes; this variant does not. */
  cardHtml(titleHtml, inner) {
    return '<div class="card"><h3>' + titleHtml + '</h3>' + inner + '</div>';
  },

  /* ----------------------------------------------------------
     Registry.
       views[id]           — a fixed card, e.g. "systems"
       handlers[prefix]    — a family of cards, e.g. "system:student-portal"
     Each tab file registers its own handlers when it loads, so a
     tab never has to edit this file to add a drill-down.
     ---------------------------------------------------------- */
  handlers: {},

  resolve(id, g) {
    if (Details.views[id]) return Details.views[id](g);
    const i = id.indexOf(":");
    if (i > 0) {
      const h = Details.handlers[id.slice(0, i)];
      if (h) return h(id.slice(i + 1), g);
    }
    return null;
  },

  views: {

    "what-it-does": function (g) {
      const p = g.plan.project;
      return {
        title: "What this system does",
        lede: p.purpose,
        body:
          /* The pipeline, read off the agents themselves: what each one
             is fired by, and what it hands on. Nothing is named here
             that is not named in the plan. */
          Details.card("The shape of it", Details.table(
            ["Fires on", "Agent", "What comes out"],
            g.plan.agents.map(a => [
              App.esc(a.firesOn) + " " + App.pill("unknown", a.trigger),
              '<a href="' + App.drill("agent:" + a.id) + '"><b>' +
                App.esc(a.name) + '</b></a>' +
                (a.autonomy === "auto" ? "" : " " + App.pill("warn", a.autonomy === "draft" ? "drafts for a person" : "waits for a human")),
              a.produces.length ? a.produces.map(App.esc).join(", ")
                                : '<span class="checked">the plan names no output</span>'
            ]))) +
          Details.card("Who it is for", '<p>' +
            g.plan.roles.map(r => App.esc(r.label)).join(" · ") +
            ' — taken from the roles named in the stories. The Users tab expands this.</p>') +
          Details.card("Dates that matter", Details.table(
            ["Milestone", "Date"],
            [["Build starts", App.fmt(p.buildStart)],
             ["Build ends", App.fmt(p.buildEnd)],
             ["Demo day", App.fmt(p.demoDay)],
             ["Demo prep", App.esc(p.demoPrep)]]) +
            '<p style="margin-top:10px" class="checked">' + App.esc(p.anchorSource) + '</p>')
      };
    },

    "release-now": function (g) {
      const r = Overview.release(g);
      const rows = g.plan.releases.map(rel => {
        const st = g.plan.derive.storiesIn(rel.id);
        const done = st.filter(s => (g.stories.find(x => x.id === s.id) || {}).status === "shipped").length;
        const isNow = rel.id === r.rel.id;
        return [
          (isNow ? App.pill("brand", "now") + " " : "") + App.esc(rel.id.toUpperCase()),
          App.esc(rel.name),
          '<span class="mono">' + App.fmtShort(rel.start) + " → " + App.fmtShort(rel.end) + '</span>',
          done + " of " + st.length + " shipped" + (g.isSample ? " " + App.sampleChip() : "")
        ];
      });
      return {
        title: "Release " + r.rel.id.toUpperCase() + " — " + r.rel.name,
        lede: r.started
          ? "Day " + r.day + " of " + r.span + ". Runs " + App.fmt(r.rel.start) +
            " to " + App.fmt(r.rel.end) + "."
          : "Starts " + App.fmt(r.rel.start) + ".",
        body:
          Details.card("Stories in this release", Details.table(
            ["Story", "Title", "Fulfils", "Owned by", "Status"],
            r.stories.map(s => {
              const live = g.stories.find(x => x.id === s.id) || {};
              return ['<a class="mono" href="' + App.drill("story:" + s.id) + '">' +
                  App.esc(s.id) + '</a>', App.esc(s.title),
                s.fulfills.length ? s.fulfills.map(App.esc).join(" ")
                                  : '<span class="checked">—</span>',
                App.esc((g.d.agentById[s.agent] || {}).name || "—"),
                App.pill(live.status === "shipped" ? "ok" :
                         live.status === "building" ? "warn" : "unknown",
                         live.status || "planned") + (g.isSample ? " " + App.sampleChip() : "")];
            }))) +
          Details.card("All " + g.d.releaseTotal + " releases", Details.table(
            ["Release", "Name", "Window", "Progress"], rows)) +
          '<div class="note">The <a href="06-project.html">Project</a> tab carries the ' +
            'full Gantt view of these releases, with every task under them.</div>'
      };
    },

    "delivery": function (g) {
      const rows = g.stories.map(s => [
        '<a class="mono" href="' + App.drill("story:" + s.id) + '">' + App.esc(s.id) + '</a>',
        App.esc(s.title),
        '<span class="mono">' + App.esc((s.release || "").toUpperCase()) + '</span>',
        s.total ? s.passed + " of " + s.total : '<span class="checked">not tracked</span>',
        App.pill(s.status === "shipped" ? "ok" : s.status === "building" ? "warn" : "unknown",
                 s.status) + (g.isSample ? " " + App.sampleChip() : ""),
        App.esc(s.evidence || "—")
      ]);
      const first = g.stories[0];
      return {
        title: "Delivery progress",
        lede: g.storiesShipped + " of " + g.d.storyTotal + " stories shipped across " +
              g.d.releaseTotal + " releases. " + g.criteriaPassed + " of " +
              g.criteriaTotal + " acceptance criteria passing.",
        body: (g.storiesShipped === 0
          ? Details.empty("Nothing has shipped yet",
              ["A story counts as shipped here only when <b>every</b> acceptance " +
               "criterion against it passes in " +
               "<span class='mono'>.colaberry/progress.json</span>.",
               "A story with criteria still failing stays <b>planned</b> or " +
               "<b>building</b>, whatever the calendar says."],
              [(first ? App.esc(first.id) : "The first story") +
                 " lands and its criteria are ticked in progress.json",
               "The commit naming it is pushed and the platform verifies it",
               "This page moves to 1 of " + g.d.storyTotal +
                 " without anyone editing it"]) + "<br>"
          : "") +
          Details.card("Every story", Details.table(
            ["Story", "Title", "Release", "Criteria", "Status", "Evidence"], rows))
      };
    },

    "systems": function (g) {
      return {
        title: "Systems this connects to",
        lede: g.systemsConnected + " of " + g.d.systemTotal +
              " connected. Grey means unknown, not healthy.",
        body:
          Details.card("Connection status", Details.table(
            ["System", "What it is for", "Requirement", "Status", "Last checked"],
            g.systems.map(s => [
              App.esc(s.name) + (g.isSample ? " " + App.sampleChip() : ""),
              App.esc(s.role),
              '<span class="mono">' + App.esc(s.req) + '</span>',
              App.dot(s.status) + " " + App.esc((App.STATUS[s.status] || App.STATUS.unknown).word),
              '<span class="mono">' + App.esc(App.since(s.lastChecked)) + '</span>'
            ]))) +
          Details.card("What each connection is blocked on",
            '<p>' + g.systems.map(s => "<b>" + App.esc(s.name) + "</b>: " +
              App.esc(s.detail)).join("<br>") + '</p>') +
          '<div class="note">None of these are connected. This page is static, so it ' +
            'cannot reach any of them to find out — the indicator reports that honestly ' +
            'rather than defaulting to green. The <a href="05-systems.html">Systems</a> ' +
            'tab carries each one in full.</div>'
      };
    },

    "agents": function (g) {
      return {
        title: "AI agents",
        lede: g.d.agentTotal + " agents defined. " + g.d.agentAuto +
              " complete on their own; " + g.d.agentHuman +
              " prepare and then wait for a human to release the work.",
        body:
          Details.card("Every agent", Details.table(
            ["Agent", "Fires on", "Autonomy", "Status", "Runs", "Skills"],
            g.agents.map(a => [
              '<b>' + App.esc(a.name) + '</b><br><span class="checked">' +
                App.esc(a.does) + '</span>',
              App.esc(a.firesOn) + '<br>' + App.pill("unknown", a.trigger),
              a.autonomy === "auto"
                ? App.pill("ok", "completes alone")
                : App.pill("warn", "waits for a human"),
              App.dot(a.status) + " " + App.esc((App.STATUS[a.status] || App.STATUS.off).word),
              a.runs + (g.isSample ? " " + App.sampleChip() : ""),
              a.skills.length
                ? a.skills.map(s => App.esc(s)).join("<br>")
                : '<span class="checked">no skills registered yet</span>'
            ]))) +
          Details.card("Where each agent must stop and ask",
            '<p>' + g.agents.filter(a => a.stopsWhen || a.blockedByReq).map(a =>
              "<b>" + App.esc(a.name) + "</b>: " +
              App.esc(a.stopsWhen || "") +
              (a.blockedByReq ? " Cannot act alone because of " + App.esc(a.blockedByReq) +
                " — " + App.esc((g.d.reqById[a.blockedByReq] || {}).text || "") : "")
            ).join("<br><br>") + '</p>') +
          '<div class="note">The <a href="07-agents.html">AI agents</a> tab gives each ' +
            'agent its own card, with what fires it, what it reads and produces, and ' +
            'what it is holding for a human.</div>'
      };
    },

    "waiting": function (g) {
      const humans = g.agents.filter(a => a.autonomy === "human");
      return {
        title: "Waiting on a human",
        lede: g.approvals.length === 0
          ? "Nothing is held. " + humans.length +
            " agents will queue their work here once they run."
          : g.approvals.length + " items are held until a named person releases them.",
        body: (g.approvals.length === 0
          ? Details.empty("Nothing is waiting",
              ["No agent has produced anything, so nothing needs releasing.",
               "This is the surface that makes the autonomy setting real: an agent marked " +
               "<b>waits for a human</b> puts its work here and stops."],
              ["An agent runs and produces something",
               "It appears here with what it made and who has to release it",
               "Nothing downstream happens until that person releases it"])
          : Details.card("Held right now", Details.table(
              ["Item", "What is held", "Held by", "Released by", "Waiting since"],
              g.approvals.map(a => [
                '<span class="mono">' + App.esc(a.id) + '</span>' +
                  (g.isSample ? " " + App.sampleChip() : ""),
                App.esc(a.what),
                App.esc((g.d.agentById[a.agent] || {}).name || a.agent),
                App.pill("warn", a.releasedBy),
                '<span class="mono">' + App.esc(App.since(a.waitingSince)) + '</span>'
              ])))) +
          '<br>' +
          Details.card("Agents that route through here", Details.table(
            ["Agent", "Why it waits", "Owns"],
            humans.map(a => [
              App.esc(a.name),
              App.esc(a.stopsWhen ||
                (a.blockedByReq ? "Bound by " + a.blockedByReq + " — " +
                  ((g.d.reqById[a.blockedByReq] || {}).text || "") : "—")),
              a.owns.map(o => '<span class="mono">' + App.esc(o) + '</span>').join(", ")
            ])))
      };
    },

    "guardrails": function (g) {
      return {
        title: "Guardrails — what must never happen",
        lede: "The promises this system makes, and whether anything in the build " +
              "currently enforces them.",
        body:
          Details.card("Promises", Details.table(
            ["Requirement", "Promise", "Enforced by", "Last verified"],
            g.guardrails.map(gr => [
              '<span class="mono">' + App.esc(gr.req) + '</span> ' + App.pill("risk", "SAFE"),
              App.esc(gr.promise),
              gr.enforcedBy.length
                ? gr.enforcedBy.map(e => '<span class="mono">' + App.esc(e) + '</span>').join("<br>") +
                  (g.isSample ? " " + App.sampleChip() : "")
                : App.pill("unknown", "nothing yet"),
              '<span class="mono">' + App.esc(App.since(gr.lastVerified)) + '</span>'
            ]))) +
          (g.guardrailsEnforced === 0
            ? Details.empty("Nothing in the build enforces this yet",
                ["REQ-011 is written down and it binds the Integrity Checker — that agent " +
                 "cannot act alone because of it. But no shipped code checks it.",
                 "This row stays grey until a named check exists and has run."],
                ["STORY-008 <i>Implement data integrity checks</i> ships (due " +
                 App.fmt("2026-09-16") + ")",
                 "The check registers itself against REQ-011",
                 "This page names the check and the time it last passed"])
            : "") +
          '<div class="note">' +
            (g.d.guardrailTotal === 1 ? "One SAFE requirement is defined."
                                      : g.d.guardrailTotal + " SAFE requirements are defined.") +
            ' The <a href="04-guardrails.html">Guardrails</a> tab carries each one in ' +
            'full, with whether anything enforces it.</div>'
      };
    },

    "outcomes": function (g) {
      return {
        title: "Outcomes — the numbers this has to move",
        lede: g.measures.length === 0
          ? "The plan names no measure at all."
          : g.measures.length + " measures committed to in the plan, " +
            g.measuresRead + " ever measured.",
        body: (g.measures.length === 0
          ? Details.empty("No measure is defined",
              ["Your plan states what the system does and what it must never do, " +
               "but it names no number it has to move.",
               "Rather than invent one, this tab stays empty and says so."],
              ["Agree what success is measured in",
               "Agree the target value and the direction of good",
               "Add it to the plan; this tab fills in with one card per measure"])
          : Details.card("Every measure", Details.table(
              ["Measure", "Now", "Target in the plan", "Commitment"],
              g.measures.map(m => [
                '<a class="mono" href="' + App.drill("outcome:" + m.id) + '">' +
                  App.esc(m.id) + '</a>' + (m.value != null ? " " + App.sampleChip() : ""),
                m.value != null ? '<b>' + App.esc(String(m.value)) + '</b>'
                                : '<span class="checked">not measured yet</span>',
                m.target != null ? App.esc(String(m.target))
                                 : '<span class="checked">no number stated</span>',
                App.esc(m.name)
              ])) +
            '<div class="note">These are the plan\'s <b>NFR</b> requirements — what it ' +
              'promised about how the system behaves. Your files never record how far ' +
              'any of them has moved; that comes from the running system.</div>'))
      };
    },

    "requirements": function (g) {
      const kinds = Object.keys(g.d.reqByKind).map(k =>
        App.pill(k === "SAFE" ? "risk" : "unknown", k + " " + g.d.reqByKind[k])).join(" ");
      return {
        title: "Requirements",
        lede: g.d.reqTotal + " requirements — " + g.d.reqMust + " must, " +
              g.d.reqShould + " should.",
        body:
          '<div class="card"><h3>By kind</h3><p>' + kinds + '</p></div>' +
          Details.card("Every requirement", Details.table(
            ["ID", "Kind", "Level", "Requirement", "Covered by"],
            g.plan.requirements.map(r => [
              '<a class="mono" href="' + App.drill("req:" + r.id) + '">' +
                App.esc(r.id) + '</a>',
              App.pill(r.kind === "SAFE" ? "risk" : "unknown", r.kind),
              App.esc(r.level),
              App.esc(r.text),
              r.fulfilledBy.length
                ? r.fulfilledBy.map(sid => '<a class="mono" href="' +
                    App.drill("story:" + sid) + '">' + App.esc(sid) + '</a>').join(" ")
                : App.pill(r.level === "must" ? "risk" : "warn", "no story")
            ]))) +
          (g.d.reqMustUncovered.length
            ? '<div class="note"><b>' + g.d.reqMustUncovered.length +
              ' must-requirement' + (g.d.reqMustUncovered.length === 1 ? " has" : "s have") +
              ' no story covering ' + (g.d.reqMustUncovered.length === 1 ? "it" : "them") +
              ':</b> ' + g.d.reqMustUncovered.map(r =>
                '<a class="mono" href="' + App.drill("req:" + r.id) + '">' +
                App.esc(r.id) + '</a>').join(", ") +
              '. That is a gap in the plan — nothing scheduled will satisfy ' +
              (g.d.reqMustUncovered.length === 1 ? "it" : "them") + '.</div>'
            : '<div class="note">Every <b>must</b> requirement is covered by at least one ' +
              'story. The mapping is read from each story\'s own ' +
              '<span class="mono">fulfills</span> list.</div>')
      };
    },

    "data-model": function (g) {
      return {
        title: "Data model",
        lede: g.dataModel.status === "created"
          ? g.dataModel.tables.length + " tables."
          : "Proposed, not created. The model is shown before any table is made.",
        body: (g.dataModel.status === "created"
          ? Details.card("Tables", '<p>' + g.dataModel.tables.map(t =>
              '<span class="mono">' + App.esc(t) + '</span>').join(" · ") + " " +
              App.sampleChip() + '</p>')
          : Details.empty("No table has been created",
              ["The model has to be derived from the 18 requirements, table by table, " +
               "asking what each one has to store and what that thing is called in this domain.",
               "A table is named for the thing it stores, never for a vendor: the " +
               "<i>Student Portal</i> is a system this talks to; a <i>login event</i> is " +
               "a thing it stores."],
              ["Derive a candidate model from the requirements",
               "Review it with the DRI before anything is created",
               "Create the tables and this page fills in from the real schema"]))
      };
    },

    "knowledge": function (g) {
      const k = g.knowledge;
      return {
        title: "Knowledge base",
        lede: g.knowledgeCount + " records — everything the project knows about itself.",
        body:
          Details.card("What is in it", Details.table(
            ["Kind", "Count", "Source"],
            [["Requirements", g.d.reqTotal, "The plan"],
             ["Stories", g.d.storyTotal, "The plan"],
             ["Agent definitions", g.d.agentTotal, "The plan"],
             ["Notes added since", k.notes.length + (g.isSample ? " " + App.sampleChip() : ""),
              "Added as the build goes"],
             ["Decisions recorded", k.decisions.length + (g.isSample ? " " + App.sampleChip() : ""),
              "Added as the build goes"]])) +
          (k.notes.length || k.decisions.length
            ? Details.card("Notes and decisions",
                '<p>' + k.notes.concat(k.decisions).map(n =>
                  '<span class="mono">' + App.esc(n.date) + '</span> · ' +
                  App.pill("unknown", n.tab) + " " + App.esc(n.text)).join("<br>") + '</p>')
            : Details.empty("Nothing has been added yet",
                ["The knowledge base starts as the plan itself — requirements, stories and " +
                 "agent definitions — and grows as notes and decisions are added.",
                 "It is built to be added to rather than regenerated, so nothing written " +
                 "here is lost when the plan changes."],
                ["The Knowledge tab (tab 8) ships with an add-note form",
                 "Its chat panel answers from this data and cites the tab it came from",
                 "If it cannot answer from the data, it says so instead of guessing"]))
      };
    }
  },

  /* ---------- page ---------- */
  render(g) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("card") || "";
    const v = Details.resolve(id, g);

    if (!v) {
      document.getElementById("page").innerHTML =
        '<div class="crumbs"><a href="index.html">Overview</a><span>›</span>' +
          '<span>Not found</span></div>' +
        '<div class="detail-head"><h1>No such card</h1>' +
          '<p>Nothing is registered under <span class="mono">' + App.esc(id) + '</span>. ' +
          'Go back to the <a href="index.html">Overview</a>.</p></div>' + App.footer();
      return;
    }

    const parent = v.parent
      ? '<a href="' + v.parent.href + '">' + App.esc(v.parent.label) + '</a><span>›</span>'
      : "";

    document.title = v.title + " · Command Center";
    document.getElementById("page").innerHTML =
      '<div class="crumbs"><a href="index.html">Overview</a><span>›</span>' + parent +
        '<b>' + App.esc(v.title) + '</b></div>' +
      '<div class="detail-head">' +
        (v.kicker ? '<div class="eyebrow">' + App.esc(v.kicker) + '</div>' : '') +
        '<h1>' + App.esc(v.title) + '</h1>' +
        '<p>' + App.esc(v.lede) + '</p></div>' +
      v.body +
      App.footer();
  }
};
