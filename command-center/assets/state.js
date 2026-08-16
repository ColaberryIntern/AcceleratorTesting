/* ============================================================
   STATE — what the system has actually PRODUCED at runtime.

   Two blocks, and the mode switch chooses between them:

     REAL   — only what this project has really produced. On day
              one that is almost nothing, and that is the point.
              Every unknown is null. Nothing here may be filled in
              from the plan, from an expectation, or from a guess.

     SAMPLE — believable made-up data so the shape of the Command
              Center is visible on day one. It is a PROJECTION,
              not a record, and every screen it touches says so.

   When the real system starts emitting telemetry, only the REAL
   block below is replaced (by a generated file or an API read).
   No tab, card or component changes.
   ============================================================ */

const STATE = {

  /* ---------------------------------------------------------
     REAL — as at 2026-08-15, day one. Nothing is connected,
     nothing has run, nothing has shipped.
     --------------------------------------------------------- */
  real: {
    label: "Real",
    asAt: null,                    /* no telemetry has ever been received */
    provenance: "No telemetry has been received. Every value below is the " +
                "absence of a reading, not a reading of zero.",

    systems: {
      "student-portal":      { status:"unknown", lastChecked:null, detail:"Never checked." },
      "learning-management": { status:"unknown", lastChecked:null, detail:"Never checked." },
      "attendance-tracking": { status:"unknown", lastChecked:null, detail:"Never checked." },
      "email-platform":      { status:"unknown", lastChecked:null, detail:"Never checked." }
    },

    agents: {
      "data-aggregator":    { status:"off", runs:0, lastRun:null, skills:[] },
      "report-generator":   { status:"off", runs:0, lastRun:null, skills:[] },
      "review-facilitator": { status:"off", runs:0, lastRun:null, skills:[] },
      "email-notifier":     { status:"off", runs:0, lastRun:null, skills:[] },
      "integrity-checker":  { status:"off", runs:0, lastRun:null, skills:[] },
      "analytics-provider": { status:"off", runs:0, lastRun:null, skills:[] }
    },

    /* story id -> { status: planned|building|shipped, shipped, evidence } */
    stories: {},

    /* Waiting on a human. Empty because no agent has produced anything. */
    approvals: [],

    /* Measures. Empty because the plan defines no numeric target. */
    outcomes: [],

    /* Guardrail enforcement: which shipped code enforces which promise. */
    guardrails: { "REQ-011": { enforcedBy: [], lastVerified: null } },

    /* Data model: nothing created. The model is proposed, not built. */
    dataModel: { status:"proposed", tables: [], createdAt: null },

    /* Knowledge base: the plan's own records, plus notes added over time. */
    knowledge: { notes: [], decisions: [] }
  },

  /* ---------------------------------------------------------
     SAMPLE — a projection of what this looks like once the
     build is under way. Clearly fictional. Labelled everywhere.
     --------------------------------------------------------- */
  sample: {
    label: "Sample",
    asAt: "2026-09-14T08:12:00",
    provenance: "Believable made-up data showing the shape of the Command Center " +
                "mid-programme. Not a record of anything that happened.",

    systems: {
      "student-portal":      { status:"ok",      lastChecked:"2026-09-14T08:11:00",
                               detail:"OAuth token valid. 1,284 students in scope." },
      "learning-management": { status:"ok",      lastChecked:"2026-09-14T08:11:00",
                               detail:"Progress feed responding in 340 ms." },
      "attendance-tracking": { status:"error",   lastChecked:"2026-09-14T08:11:00",
                               detail:"401 Unauthorized since 2026-09-13 22:40. Credential expired." },
      "email-platform":      { status:"unknown", lastChecked:null,
                               detail:"Never checked. Not wired up in this projection." }
    },

    agents: {
      "data-aggregator":    { status:"ok",   runs:412, lastRun:"2026-09-14T08:05:00",
                              skills:["read data from APIs","display data on dashboard"] },
      "report-generator":   { status:"ok",   runs:4,   lastRun:"2026-09-14T06:00:00",
                              skills:["data analysis","report generation"] },
      "review-facilitator": { status:"warn", runs:4,   lastRun:"2026-09-14T06:02:00",
                              skills:["display report","capture instructor input"] },
      "email-notifier":     { status:"off",  runs:0,   lastRun:null, skills:[] },
      "integrity-checker":  { status:"warn", runs:412, lastRun:"2026-09-14T08:05:00",
                              skills:["data validation","logging"] },
      "analytics-provider": { status:"off",  runs:0,   lastRun:null, skills:[] }
    },

    stories: {
      "STORY-001":{status:"shipped",  shipped:"2026-08-15", evidence:"Login flow tested end to end"},
      "STORY-002":{status:"shipped",  shipped:"2026-08-18", evidence:"Dashboard renders progress"},
      "STORY-003":{status:"shipped",  shipped:"2026-08-20", evidence:"Attendance column live"},
      "STORY-012":{status:"shipped",  shipped:"2026-08-24", evidence:"Audit table created"},
      "STORY-004":{status:"shipped",  shipped:"2026-08-27", evidence:"First weekly report generated"},
      "STORY-005":{status:"shipped",  shipped:"2026-08-29", evidence:"Two instructors reviewed"},
      "STORY-006":{status:"building", shipped:null,         evidence:null},
      "STORY-007":{status:"planned",  shipped:null,         evidence:null},
      "STORY-008":{status:"planned",  shipped:null,         evidence:null},
      "STORY-009":{status:"planned",  shipped:null,         evidence:null},
      "STORY-010":{status:"planned",  shipped:null,         evidence:null},
      "STORY-011":{status:"planned",  shipped:null,         evidence:null}
    },

    approvals: [
      { id:"AP-0041", agent:"review-facilitator",
        what:"Weekly report for CS-101 — 23 students flagged, 4 uncertain",
        releasedBy:"instructor", waitingSince:"2026-09-14T06:02:00" },
      { id:"AP-0042", agent:"review-facilitator",
        what:"Weekly report for DS-220 — 11 students flagged, 1 uncertain",
        releasedBy:"instructor", waitingSince:"2026-09-14T06:02:00" },
      { id:"AP-0043", agent:"integrity-checker",
        what:"3 attendance records failed the freshness check and are held back",
        releasedBy:"system administrator", waitingSince:"2026-09-14T08:05:00" }
    ],

    outcomes: [
      { id:"OUT-S1", name:"Flagged students contacted within 48h", value:78, unit:"%",
        target:90, dir:"up", note:"Sample only — no target has been agreed for this project." },
      { id:"OUT-S2", name:"Instructor review turnaround",          value:6.4, unit:"h",
        target:4,  dir:"down", note:"Sample only — no target has been agreed for this project." },
      { id:"OUT-S3", name:"Reports sent without a human check",    value:0,  unit:"",
        target:0,  dir:"down", note:"Sample only — no target has been agreed for this project." }
    ],

    guardrails: {
      "REQ-011": { enforcedBy:["integrityChecker.freshnessCheck","report.rowCountAssert"],
                   lastVerified:"2026-09-14T08:05:00" }
    },

    dataModel: { status:"created", tables:["student","engagement_signal","weekly_report",
                 "report_line","instructor_action","audit_event","system_connection"],
                 createdAt:"2026-08-24" },

    knowledge: {
      notes: [
        { id:"N-01", date:"2026-08-19", tab:"Systems",
          text:"Attendance feed only refreshes overnight, so same-day absences are invisible." },
        { id:"N-02", date:"2026-08-27", tab:"Agents",
          text:"Report Generator over-flagged part-time students; weighting adjusted." }
      ],
      decisions: [
        { id:"D-01", date:"2026-08-16", tab:"Guardrails",
          text:"No email leaves the system without an instructor pressing approve." }
      ]
    }
  }
};

/* ============================================================
   CCData — the one place any page gets its data.
   Pages never touch STATE.real / STATE.sample directly.
   ============================================================ */
const CCData = {
  MODES: ["real", "sample"],
  KEY: "cc.mode",

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

  /* Resolved view: plan + the state block for the current mode. */
  get() {
    const mode = CCData.mode();
    const s = STATE[mode];
    const d = PLAN.derive;

    const storyState = (id) =>
      s.stories[id] || { status:"planned", shipped:null, evidence:null };

    const shipped   = PLAN.stories.filter(x => storyState(x.id).status === "shipped");
    const building  = PLAN.stories.filter(x => storyState(x.id).status === "building");
    const sysList   = PLAN.systems.map(x => Object.assign({}, x, s.systems[x.id]));
    const agentList = PLAN.agents.map(x => Object.assign({}, x, s.agents[x.id]));
    const guardList = PLAN.guardrails.map(g =>
      Object.assign({}, g, s.guardrails[g.req] || { enforcedBy:[], lastVerified:null }));

    return {
      mode, isSample: mode === "sample",
      label: s.label, asAt: s.asAt, provenance: s.provenance,
      plan: PLAN, d,

      systems: sysList,
      systemsConnected: sysList.filter(x => x.status === "ok").length,
      systemsError:     sysList.filter(x => x.status === "error").length,
      systemsUnknown:   sysList.filter(x => x.status === "unknown").length,

      agents: agentList,
      agentsRunning: agentList.filter(x => x.status === "ok" || x.status === "warn").length,
      agentsOff:     agentList.filter(x => x.status === "off").length,

      stories: PLAN.stories.map(x => Object.assign({}, x, storyState(x.id))),
      storiesShipped: shipped.length,
      storiesBuilding: building.length,

      approvals: s.approvals,
      outcomes: s.outcomes,
      guardrails: guardList,
      guardrailsEnforced: guardList.filter(g => g.enforcedBy.length > 0).length,
      dataModel: s.dataModel,
      knowledge: s.knowledge,

      /* Knowledge base always holds the plan's own records. */
      knowledgeCount: d.reqTotal + d.storyTotal + d.agentTotal +
                      s.knowledge.notes.length + s.knowledge.decisions.length
    };
  }
};
