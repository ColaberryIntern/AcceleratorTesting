/* ============================================================
   TAB 8 — Knowledge base.
   Everything the project knows about itself: requirements,
   stories, releases, agents, systems, roles, tables, decisions
   and notes added as the build goes.

   Built to be ADDED TO rather than regenerated — a note written
   here survives a change to the plan.

   The Ask panel answers from this index and cites the tab each
   answer came from. There is no model and no network: if the
   index cannot answer, it says so instead of guessing.
   ============================================================ */
const TabKnowledge = {

  NOTES_KEY: "cc.notes",
  STOP: ("the a an of to in for on and or is are be by with that this it as at from " +
         "what which who when where how many much does do did will can should must " +
         "we you i they there here about into over").split(" "),

  /* ---------- notes added in the browser ---------- */
  localNotes() {
    try {
      const raw = window.localStorage.getItem(TabKnowledge.NOTES_KEY);
      const a = raw ? JSON.parse(raw) : [];
      return Object.prototype.toString.call(a) === "[object Array]" ? a : [];
    } catch (e) { return []; }
  },

  addNote(text, tab) {
    const all = TabKnowledge.localNotes();
    all.push({ id: "N-L" + (all.length + 1), date: App.today().toISOString().slice(0, 10),
      tab: tab, text: text, local: true });
    try { window.localStorage.setItem(TabKnowledge.NOTES_KEY, JSON.stringify(all)); }
    catch (e) { /* private mode — the note is lost, and the UI says so */ }
    return all;
  },

  /* ---------- the index every answer is drawn from ---------- */
  /* Vocabulary a reader is likely to ask in, per kind. Searched but
     never displayed — a question phrased in the tab's own words has
     to reach the record even when the record never uses those words. */
  ALIAS: {
    project:     "overview purpose what does this do dates demo day build",
    requirement: "requirement rule spec constraint",
    story:       "task ticket due date deadline schedule build order backlog",
    release:     "release milestone sprint phase schedule gantt window",
    agent:       "agent automation autonomy trigger fires runs",
    system:      "system integration connection connected source feed api",
    role:        "role user persona who is this for audience use case",
    guardrail:   "guardrail promise what must never happen never happen safety safe " +
                 "forbidden must not prohibited red line",
    table:       "table schema field column data model storage entity",
    outcome:     "outcome measure metric kpi target goal success number to move baseline",
    note:        "note decision learned observation"
  },

  index(g) {
    const ix = [];
    const add = (kind, tab, title, text, href, extra) =>
      ix.push({ kind: kind, tab: tab, title: title, text: text, href: href,
        alias: (TabKnowledge.ALIAS[kind] || "") + " " + (extra || "") });

    const p = g.plan.project;
    add("project", "Overview", p.name, p.purpose + " Build runs " + p.buildStart +
      " to " + p.buildEnd + ". Demo day is " + p.demoDay + ". " + p.demoPrep,
      "index.html");

    g.plan.requirements.forEach(r => {
      const tab = r.kind === "SAFE" ? "Guardrails" : (r.system ? "Systems" : "Knowledge base");
      add("requirement", tab, r.id, r.text + " " + r.kind + " " + r.level,
        App.drill("req:" + r.id),
        r.kind === "SAFE" ? TabKnowledge.ALIAS.guardrail : "");
    });

    g.stories.forEach(s => add("story", "Project management", s.id,
      s.title + " due " + s.due + " in release " + s.release + ", status " + s.status,
      App.drill("story:" + s.id), s.title));

    g.plan.releases.forEach(r => add("release", "Project management", r.id.toUpperCase(),
      r.name + " runs " + r.start + " to " + r.end + " with " +
      g.d.storiesIn(r.id).length + " stories", App.drill("release:" + r.id), r.name));

    g.agents.forEach(a => add("agent", "AI agents", a.name,
      a.does + " Fires on " + a.firesOn + " (" + a.trigger + "). Produces " +
      a.produces.join(", ") + ". Autonomy: " + a.autonomyLabel + ". " +
      (a.stopsWhen || "") + " Skills needed: " + a.skills.join(", ") + ".",
      App.drill("agent:" + a.id),
      a.autonomy === "human"
        ? "waits for a human needs approval stops and asks held release " +
          "approve approves approver approval sign off who releases it"
        : "completes on its own fully automatic no approval needed"));

    g.systems.forEach(s => add("system", "Systems", s.name,
      s.role + " Required by " + s.req + ". Status " +
      (App.STATUS[s.status] || App.STATUS.unknown).word + ", " + App.since(s.lastChecked) + ".",
      App.drill("system:" + s.id)));

    g.plan.roles.forEach(r => add("role", "Users and use case", r.label,
      "A role this system is for. " +
      (TabUsers.jobs[r.id] || []).map(j => j.job).join(". "), App.drill("role:" + r.id)));

    g.guardrails.forEach(gr => add("guardrail", "Guardrails", gr.req + " guardrail",
      gr.promise + " Enforced by " +
      (gr.enforcedBy.length ? gr.enforcedBy.join(", ") : "nothing in the build yet") + ".",
      App.drill("guardrail:" + gr.req)));

    TabModel.tables.forEach(t => add("table", "Data model", t.t,
      t.stores + " Fields: " + t.fields.join(", ") + ". Forced by " + t.reqs.join(", ") + ".",
      App.drill("table:" + t.t), t.t.split("_").join(" ")));

    g.outcomes.forEach(o => add("outcome", "Outcomes", o.name,
      o.name + " is " + o.value + o.unit + " against a target of " + o.target + o.unit +
      ". " + o.note, App.drill("outcome:" + o.id)));
    if (!g.outcomes.length)
      add("outcome", "Outcomes", "No measure defined",
        "The plan carries no numeric target. No outcome measure, baseline or target has " +
        "been agreed for this project.", "02-outcomes.html");

    g.knowledge.notes.concat(g.knowledge.decisions).forEach(n =>
      add("note", n.tab, n.date + " note", n.text, "08-knowledge.html"));
    TabKnowledge.localNotes().forEach(n =>
      add("note", n.tab, n.date + " note", n.text, "08-knowledge.html"));

    return ix;
  },

  /* ---------- retrieval ---------- */
  tokens(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9\- ]+/g, " ").split(/\s+/)
      .filter(t => t.length > 1 && TabKnowledge.STOP.indexOf(t) < 0);
  },

  /* crude stem so "generated" reaches "generate" and "reports" reaches "report" */
  stem(t) {
    return t.replace(/(ies)$/, "y").replace(/(ed|ing|es|s)$/, "");
  },

  search(ix, q) {
    const terms = TabKnowledge.tokens(q);
    if (!terms.length) return [];
    const phrase = q.toLowerCase().trim();
    return ix.map(e => {
      const body  = (e.title + " " + e.text + " " + e.kind + " " + e.tab).toLowerCase();
      const alias = (e.alias || "").toLowerCase();
      const hay = body + " " + alias;
      let score = 0;
      terms.forEach(t => {
        const st = TabKnowledge.stem(t);
        let n = body.split(t).length - 1;
        if (!n && st.length > 2) n = body.split(st).length - 1;
        if (n) score += n;
        if (e.title.toLowerCase().indexOf(t) >= 0) score += 4;
        if (alias.indexOf(t) >= 0 || (st.length > 2 && alias.indexOf(st) >= 0)) score += 3;
        if (e.kind.indexOf(t) >= 0) score += 2;
      });
      /* a whole-phrase hit in the tab's own vocabulary is the strongest signal */
      if (phrase.length > 4 && body.indexOf(phrase) >= 0) score += 6;
      if (phrase.length > 4 && alias.indexOf(phrase.replace(/[?.!]+$/, "")) >= 0) score += 10;
      return { e: e, score: score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  },

  /* Words that narrow a count. If one is present, only a rule that
     accounts for it may answer — otherwise the panel stays quiet and
     lets retrieval speak. A confident total answering a narrowed
     question is worse than no direct answer at all. */
  QUALIFIER: /wait|human|approv|alone|automatic|connect|error|shipped|done|complete|running|enforced|remaining|left|outstanding|overdue|late|registered/,

  countAnswer(g, q) {
    const s = q.toLowerCase();
    if (!/how many|how much|count|number of/.test(s)) return null;

    /* qualified counts, checked first */
    const qualified = [
      { re:/agent/, q:/wait|human|approv/,      n:g.d.agentHuman,
        w:"of the " + g.d.agentTotal + " agents wait for a human to release their work",
        tab:"AI agents" },
      { re:/agent/, q:/alone|automatic|own/,    n:g.d.agentAuto,
        w:"of the " + g.d.agentTotal + " agents complete on their own", tab:"AI agents" },
      { re:/agent/, q:/running/,                n:g.agentsRunning,
        w:"of the " + g.d.agentTotal + " agents are running", tab:"AI agents" },
      { re:/system|integration/, q:/connect/,   n:g.systemsConnected,
        w:"of the " + g.d.systemTotal + " systems are connected", tab:"Systems" },
      { re:/system|integration/, q:/error/,     n:g.systemsError,
        w:"of the " + g.d.systemTotal + " systems are in error", tab:"Systems" },
      { re:/stor(y|ies)|task/, q:/shipped|done|complete/, n:g.storiesShipped,
        w:"of the " + g.d.storyTotal + " stories have shipped", tab:"Project management" },
      { re:/guardrail|promise/, q:/enforced/,   n:g.guardrailsEnforced,
        w:"of the " + g.d.guardrailTotal + " guardrails are enforced in the build",
        tab:"Guardrails" },
      { re:/skill/, q:/registered/,             n:g.agents.reduce((n2, a) => n2 + a.skills.length, 0),
        w:"skills are registered across all agents", tab:"AI agents" }
    ];
    for (let i = 0; i < qualified.length; i++)
      if (qualified[i].re.test(s) && qualified[i].q.test(s))
        return { text: qualified[i].n + " " + qualified[i].w + ".", tab: qualified[i].tab };

    /* plain totals — only when the question is not narrowed */
    if (TabKnowledge.QUALIFIER.test(s)) return null;
    const total = [
      { re:/requirement/,        n:g.d.reqTotal,       w:"requirements", tab:"Knowledge base" },
      { re:/stor(y|ies)|task/,   n:g.d.storyTotal,     w:"stories",      tab:"Project management" },
      { re:/release/,            n:g.d.releaseTotal,   w:"releases",     tab:"Project management" },
      { re:/agent/,              n:g.d.agentTotal,     w:"agents",       tab:"AI agents" },
      { re:/system|integration/, n:g.d.systemTotal,    w:"systems",      tab:"Systems" },
      { re:/guardrail|promise/,  n:g.d.guardrailTotal, w:"guardrails",   tab:"Guardrails" },
      { re:/table/,              n:TabModel.tables.length, w:"proposed tables", tab:"Data model" },
      { re:/role|user/,          n:g.plan.roles.length, w:"roles",       tab:"Users and use case" },
      { re:/outcome|measure|kpi|target/, n:g.outcomes.length, w:"outcome measures",
        tab:"Outcomes" }
    ];
    for (let i = 0; i < total.length; i++)
      if (total[i].re.test(s))
        return { text: total[i].n + " " + total[i].w + ".", tab: total[i].tab };
    return null;
  },

  answer(g, q) {
    const ix = TabKnowledge.index(g);
    const hits = TabKnowledge.search(ix, q).slice(0, 5);
    const direct = TabKnowledge.countAnswer(g, q);

    if (!hits.length && !direct)
      return '<div class="ask-none"><b>I cannot answer that from the data on this ' +
        'Command Center.</b><br>This panel only reads the ' + ix.length + ' records ' +
        'indexed from your plan and the current state — there is no model and no network ' +
        'behind it. Nothing was guessed.</div>';

    return (direct
      ? '<div class="ask-direct"><b>' + App.esc(direct.text) + '</b>' +
        '<span class="cite">' + App.esc(direct.tab) + ' tab</span></div>'
      : '') +
      hits.map(h =>
        '<a class="ask-hit" href="' + h.e.href + '">' +
          '<div class="ask-hit-top"><b>' + App.esc(h.e.title) + '</b>' +
            '<span class="cite">' + App.esc(h.e.tab) + ' tab</span></div>' +
          '<p>' + App.esc(TabKnowledge.clip(h.e.text, 240)) + '</p>' +
        '</a>').join("");
  },

  clip(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; },

  /* ---------- page ---------- */
  render(g) {
    const d = g.d;
    const ix = TabKnowledge.index(g);
    const local = TabKnowledge.localNotes();
    const kinds = {};
    ix.forEach(e => { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 8 of ' + d.tabsTotal + '</div>' +
        '<h1>Knowledge base</h1>' +
        '<p class="tagline">Everything the project knows about itself — ' + ix.length +
          ' records, growing for the whole programme.</p>' +
      '</header>' +
      '<div class="ask">' +
        '<div class="ask-head"><b>Ask about this Command Center</b>' +
          '<span>Answers come from the ' + ix.length + ' indexed records and cite the tab ' +
          'they came from. No model, no network — if the data cannot answer, it says so.</span>' +
        '</div>' +
        '<form class="ask-form" id="ask-form">' +
          '<input id="ask-q" type="text" autocomplete="off" ' +
            'placeholder="e.g. which agents wait for a human?">' +
          '<button class="btn" type="submit">Ask</button>' +
        '</form>' +
        '<div class="ask-starters">' +
          ['How many agents wait for a human?', 'What must never happen?',
           'When is the weekly report due?', 'Which systems are connected?',
           'What outcome are we measuring?'].map(s =>
            '<button class="starter" type="button">' + App.esc(s) + '</button>').join("") +
        '</div>' +
        '<div id="ask-out" class="ask-out"></div>' +
      '</div>' +
      '<div class="stats" style="margin-top:20px">' +
        App.stat({ k:"Records", v:ix.length, s:"indexed and searchable" }) +
        App.stat({ k:"From the plan", v:d.reqTotal + d.storyTotal + d.agentTotal,
          s:"requirements, stories, agents" }) +
        App.stat({ k:"Notes and decisions",
          v:g.knowledge.notes.length + g.knowledge.decisions.length + local.length,
          s:local.length ? local.length + " saved in this browser" : "added as the build goes",
          sample:g.isSample }) +
        App.stat({ k:"Tabs covered", v:Object.keys(ix.reduce((m, e) =>
          (m[e.tab] = 1, m), {})).length, s:"every record cites one" }) +
      '</div>' +
      '<div class="sec-head"><h2>Add a note</h2>' +
        '<span>The knowledge base is added to, never regenerated.</span></div>' +
      '<div class="card">' +
        '<form class="note-form" id="note-form">' +
          '<input id="note-text" type="text" placeholder="What did you learn?" required>' +
          '<select id="note-tab">' + g.plan.tabs.map(t =>
            '<option value="' + App.esc(t.label) + '">' + App.esc(t.label) + '</option>').join("") +
          '</select>' +
          '<button class="btn" type="submit">Add</button>' +
        '</form>' +
        '<p style="margin-top:10px; font-size:12.5px">Notes are saved <b>in this browser ' +
          'only</b>. There is no database behind this Command Center yet, so a note will ' +
          'not follow you to another machine — and this page says so rather than implying ' +
          'it is stored somewhere safe.</p>' +
      '</div>' +
      '<div class="sec-head"><h2>Notes and decisions</h2>' +
        '<span id="note-count">' +
        (g.knowledge.notes.length + g.knowledge.decisions.length + local.length) +
        ' recorded</span></div>' +
      '<div id="note-list">' + TabKnowledge.noteList(g) + '</div>' +
      '<div class="sec-head"><h2>Everything indexed</h2>' +
        '<span>Grouped by kind. Each row opens its own page.</span></div>' +
      Details.table(["Kind", "Records", "Shown on"],
        Object.keys(kinds).sort().map(k => [
          App.pill("unknown", k), kinds[k],
          Object.keys(ix.filter(e => e.kind === k).reduce((m, e) => (m[e.tab] = 1, m), {}))
            .join(", ")])) +
      '<div class="sec-head"><h2>All records</h2><span>' + ix.length + ' rows.</span></div>' +
      Details.table(["Record", "Kind", "Tab", "What it says"],
        ix.map(e => [
          '<a href="' + e.href + '">' + App.esc(e.title) + '</a>',
          App.pill("unknown", e.kind), App.esc(e.tab),
          App.esc(TabKnowledge.clip(e.text, 150))])) +
      App.footer();

    TabKnowledge.wire(g);
  },

  noteList(g) {
    const all = g.knowledge.notes.concat(g.knowledge.decisions)
      .concat(TabKnowledge.localNotes());
    if (!all.length)
      return Details.empty("No note has been added yet",
        ["The knowledge base starts as the plan itself and grows as notes and decisions " +
         "are added. Nothing has been added since the plan was written.",
         "Use the form above — a note written here is not lost when the plan changes."],
        ["Add a note as you learn something the plan does not say",
         "It is indexed immediately and the Ask panel can cite it",
         "When a database exists, these move into it"]);
    return Details.table(["Date", "Tab", "Note", "Stored"],
      all.map(n => ['<span class="mono">' + App.esc(n.date) + '</span>',
        App.pill("unknown", n.tab), App.esc(n.text),
        n.local ? App.pill("warn", "this browser only")
                : App.pill("unknown", "sample") ]));
  },

  wire(g) {
    const form = document.getElementById("ask-form");
    const q = document.getElementById("ask-q");
    const out = document.getElementById("ask-out");
    const run = () => { out.innerHTML = TabKnowledge.answer(g, q.value || ""); };

    if (form) form.addEventListener("submit", function (ev) { ev.preventDefault(); run(); });
    const starters = document.querySelectorAll(".starter");
    for (let i = 0; i < starters.length; i++)
      starters[i].addEventListener("click", function () {
        q.value = this.textContent; run();
      });

    const nf = document.getElementById("note-form");
    if (nf) nf.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const t = document.getElementById("note-text");
      const tab = document.getElementById("note-tab");
      if (!t.value.trim()) return;
      TabKnowledge.addNote(t.value.trim(), tab.value);
      t.value = "";
      document.getElementById("note-list").innerHTML = TabKnowledge.noteList(g);
    });
  }
};
