/* ============================================================
   STATE — what the system has actually PRODUCED.

   The plan (data.js) says what is intended. This file says what
   exists. Two blocks, and the mode switch chooses between them:

     REAL   — read from .colaberry/progress.json, plus honest
              nulls for everything no file in this repo can know.
              A static page cannot check whether the Student
              Portal is up, so it reports "not checked from here"
              rather than a colour it has not earned.

     SAMPLE — a projection, generated FROM the loaded plan so it
              cannot drift from it. Delete a story from plan.json
              and it disappears from sample mode too. Every screen
              it touches is labelled.

   Both are built after the plan loads, so neither can restate it.
   ============================================================ */
const CCState = {

  /* ---------------------------------------------------------
     REAL — only what this project has really produced.
     --------------------------------------------------------- */
  real(P) {
    const stories = {};
    P.stories.forEach(s => {
      const p = P.progressById[s.id];
      if (!p || p.criteriaTotal === 0) {
        stories[s.id] = { status: "planned", shipped: null, evidence: null,
                          passed: 0, total: 0 };
        return;
      }
      /* A story is shipped only when every acceptance criterion in
         progress.json passes. Anything less is in progress — the file
         reports partial work honestly and so does this page. */
      const status = p.criteriaPassed === p.criteriaTotal ? "shipped"
                   : p.criteriaPassed > 0                 ? "building"
                   : "planned";
      stories[s.id] = {
        status: status,
        shipped: status === "shipped" ? p.updatedAt : null,
        evidence: p.criteriaPassed > 0
          ? p.criteriaPassed + " of " + p.criteriaTotal + " acceptance criteria passing" +
            (p.filesTouched.length ? " · " + p.filesTouched.length + " files" : "")
          : null,
        passed: p.criteriaPassed, total: p.criteriaTotal
      };
    });

    const systems = {};
    P.systems.forEach(s => {
      systems[s.id] = { status: "unknown", lastChecked: null,
        detail: "Not checked from here. This page is static — it cannot reach " +
                "the " + s.name + " to find out." };
    });

    const agents = {};
    P.agents.forEach(a => {
      agents[a.id] = { status: "off", runs: null, lastRun: null, skills: [] };
    });

    const guardrails = {};
    P.guardrails.forEach(gr => { guardrails[gr.req] = { enforcedBy: [], lastVerified: null }; });

    const measures = {};
    P.measures.forEach(m => { measures[m.id] = { value: null, measuredAt: null }; });

    const verified = Object.keys(stories).filter(k => stories[k].status === "shipped").length;

    return {
      label: "Real",
      asAt: P.manifest.generatedAt,
      provenance: "Story state is read from .colaberry/progress.json. Everything else " +
                  "is the absence of a reading, not a reading of zero — no file in " +
                  "this repo records a system check, an agent run or a measurement.",
      systems, agents, stories, guardrails, measures,
      approvals: [],
      outcomes: [],
      dataModel: { status: "proposed", tables: [], createdAt: null },
      knowledge: { notes: [], decisions: [] },
      storiesVerified: verified
    };
  },

  /* ---------------------------------------------------------
     SAMPLE — a projection of the same plan, mid-programme.
     Generated from P so it can never contradict the plan.
     --------------------------------------------------------- */
  sample(P) {
    const n = P.stories.length;
    const shippedTo  = Math.floor(n * 0.45);
    const buildingTo = shippedTo + 1;

    const stories = {};
    P.stories.forEach((s, i) => {
      const rel = P.derive.releaseById[s.release] || {};
      stories[s.id] = i < shippedTo
        ? { status: "shipped", shipped: rel.end || null,
            evidence: "3 of 3 acceptance criteria passing", passed: 3, total: 3 }
        : i < buildingTo
        ? { status: "building", shipped: null,
            evidence: "1 of 3 acceptance criteria passing", passed: 1, total: 3 }
        : { status: "planned", shipped: null, evidence: null, passed: 0, total: 3 };
    });

    /* A believable spread: mostly up, one broken, one never wired. */
    const SYS_CYCLE = [
      { status: "ok",      detail: "Responding. Credentials valid." },
      { status: "ok",      detail: "Responding in 340 ms." },
      { status: "error",   detail: "401 Unauthorized. Credential expired." },
      { status: "unknown", detail: "Never checked. Not wired up in this projection." }
    ];
    const checkedAt = CC.addDays(P.project.buildStart, 21) + "T08:11:00";
    const systems = {};
    P.systems.forEach((s, i) => {
      const c = SYS_CYCLE[i % SYS_CYCLE.length];
      systems[s.id] = { status: c.status,
        lastChecked: c.status === "unknown" ? null : checkedAt, detail: c.detail };
    });

    const agents = {};
    P.agents.forEach((a, i) => {
      const live = i < Math.ceil(P.agents.length / 2);
      agents[a.id] = live
        ? { status: i === 2 ? "warn" : "ok", runs: 4 + i * 17,
            lastRun: checkedAt, skills: a.skills.slice() }
        : { status: "off", runs: 0, lastRun: null, skills: [] };
    });

    /* Held work exists only for agents the plan says must wait. */
    const approvals = [];
    P.agents.filter(a => a.autonomy !== "auto").forEach((a, i) => {
      if (agents[a.id].status === "off") return;
      approvals.push({
        id: "AP-00" + (41 + i), agent: a.id,
        what: (a.produces[0] || "Output") + " prepared and held for release",
        releasedBy: (P.roles[0] || { label: "a human" }).label,
        waitingSince: checkedAt
      });
    });

    /* Only measures whose requirement actually states a number get a
       sample reading. The rest stay unmeasured even here, because
       inventing a unit for them would be inventing the measure. */
    const measures = {};
    P.measures.forEach((m, i) => {
      measures[m.id] = m.stated
        ? { value: m.target + (i % 2 ? 1 : 0), measuredAt: checkedAt }
        : { value: null, measuredAt: null };
    });

    const guardrails = {};
    P.guardrails.forEach(gr => {
      guardrails[gr.req] = {
        enforcedBy: ["integrityCheck.assertFreshness", "report.rowCountAssert"],
        lastVerified: checkedAt
      };
    });

    /* Table names come from the model tab's proposal, which is itself
       derived from the requirements — nothing new is named here. */
    const tables = (typeof TabModel !== "undefined" && TabModel.proposal)
      ? TabModel.proposal(P).map(t => t.t) : [];

    return {
      label: "Sample",
      asAt: checkedAt,
      provenance: "Believable made-up data showing the shape of this Command Center " +
                  "mid-programme. Generated from your plan, so it matches your real " +
                  "stories and agents — but it is not a record of anything that happened.",
      systems, agents, stories, guardrails, measures, approvals,
      outcomes: [],
      dataModel: { status: "created", tables: tables,
                   createdAt: CC.addDays(P.project.buildStart, 9) },
      knowledge: {
        notes: [
          { id:"N-01", date: CC.addDays(P.project.buildStart, 4), tab:"Systems",
            text:"Attendance feed only refreshes overnight, so same-day absences are invisible." },
          { id:"N-02", date: CC.addDays(P.project.buildStart, 12), tab:"Agents",
            text:"Report generation over-flagged part-time students; weighting adjusted." }
        ],
        decisions: [
          { id:"D-01", date: CC.addDays(P.project.buildStart, 1), tab:"Guardrails",
            text:"No email leaves the system without an instructor pressing approve." }
        ]
      },
      storiesVerified: Object.keys(stories)
        .filter(k => stories[k].status === "shipped").length
    };
  }
};

/* ============================================================
   CCData — the one place any page gets its data.
   Pages never touch the state blocks directly.
   ============================================================ */
const CCData = {
  MODES: ["real", "sample"],
  KEY: "cc.mode",
  _built: null,

  mode() {
    let m = null;
    try { m = window.localStorage.getItem(CCData.KEY); } catch (e) { m = null; }
    return CCData.MODES.indexOf(m) >= 0 ? m : "real";   /* default REAL, never sample */
  },

  setMode(m) {
    if (CCData.MODES.indexOf(m) < 0) return;
    try { window.localStorage.setItem(CCData.KEY, m); } catch (e) { /* private mode */ }
    document.documentElement.setAttribute("data-mode", m);
  },

  isSample() { return CCData.mode() === "sample"; },

  /* Built once per load, after PLAN exists. */
  states() {
    if (!CCData._built) {
      CCData._built = { real: CCState.real(PLAN), sample: CCState.sample(PLAN) };
    }
    return CCData._built;
  },

  /* Resolved view: plan + the state block for the current mode. */
  get() {
    const mode = CCData.mode();
    const s = CCData.states()[mode];
    const P = PLAN;
    const d = P.derive;

    const storyState = (id) =>
      s.stories[id] || { status:"planned", shipped:null, evidence:null, passed:0, total:0 };

    const sysList   = P.systems.map(x => Object.assign({}, x, s.systems[x.id]));
    const agentList = P.agents.map(x => Object.assign({}, x, s.agents[x.id]));
    const guardList = P.guardrails.map(gr =>
      Object.assign({}, gr, s.guardrails[gr.req] || { enforcedBy:[], lastVerified:null }));
    const measureList = P.measures.map(m =>
      Object.assign({}, m, s.measures[m.id] || { value:null, measuredAt:null }));
    const storyList = P.stories.map(x => Object.assign({}, x, storyState(x.id)));

    return {
      mode, isSample: mode === "sample",
      label: s.label, asAt: s.asAt, provenance: s.provenance,
      plan: P, d,
      age: CC.age(P.manifest.generatedAt),

      systems: sysList,
      systemsConnected: sysList.filter(x => x.status === "ok").length,
      systemsError:     sysList.filter(x => x.status === "error").length,
      systemsUnknown:   sysList.filter(x => x.status === "unknown").length,

      agents: agentList,
      agentsRunning: agentList.filter(x => x.status === "ok" || x.status === "warn").length,
      agentsOff:     agentList.filter(x => x.status === "off").length,

      stories: storyList,
      storiesShipped:  storyList.filter(x => x.status === "shipped").length,
      storiesBuilding: storyList.filter(x => x.status === "building").length,
      criteriaPassed:  storyList.reduce((n, x) => n + (x.passed || 0), 0),
      criteriaTotal:   storyList.reduce((n, x) => n + (x.total  || 0), 0),

      approvals: s.approvals,
      outcomes: s.outcomes,
      measures: measureList,
      measuresRead: measureList.filter(m => m.value != null).length,
      guardrails: guardList,
      guardrailsEnforced: guardList.filter(gr => gr.enforcedBy.length > 0).length,
      dataModel: s.dataModel,
      knowledge: s.knowledge,

      knowledgeCount: d.reqTotal + d.storyTotal + d.agentTotal +
                      s.knowledge.notes.length + s.knowledge.decisions.length
    };
  }
};
