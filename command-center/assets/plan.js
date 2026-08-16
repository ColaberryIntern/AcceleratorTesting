/* ============================================================
   PLAN — the project's plan of record.

   This is the single source for everything the Command Center
   shows about what the project INTENDS to build: requirements,
   stories, releases, agents, systems, roles, outcomes.

   It is true in both Sample and Real mode, because a plan is a
   real artefact. What the system has actually PRODUCED at runtime
   lives in state.js and is what the mode switch swaps.

   Nothing in this file may be invented. Every field traces to the
   plan document. Where the plan is silent, the value is null or []
   and the UI renders an empty state — it does not guess.
   ============================================================ */
const PLAN = {

  project: {
    name: "Student Engagement Monitoring Tool",
    purpose: "A tool to identify and notify instructors about students who may be " +
             "falling behind, using data from various educational systems.",
    buildStart: "2026-08-15",
    buildEnd:   "2026-10-01",
    demoDay:    "2026-10-08",
    demoPrep:   "The week between 2026-10-01 and 2026-10-08 is demo prep.",
    brandChosen: false
  },

  /* ---- Tabs. `built:false` renders in the rail but is not linked. ---- */
  tabs: [
    { n:1, id:"overview",   label:"Overview",   href:"index.html",         built:true },
    { n:2, id:"outcomes",   label:"Outcomes",   href:"02-outcomes.html",   built:true },
    { n:3, id:"users",      label:"Users",      href:"03-users.html",      built:true },
    { n:4, id:"guardrails", label:"Guardrails", href:"04-guardrails.html", built:true },
    { n:5, id:"systems",    label:"Systems",    href:"05-systems.html",    built:true },
    { n:6, id:"project",    label:"Project",    href:"06-project.html",    built:true },
    { n:7, id:"agents",     label:"AI agents",  href:"07-agents.html",     built:true },
    { n:8, id:"knowledge",  label:"Knowledge",  href:"08-knowledge.html",  built:true },
    { n:9, id:"model",      label:"Data model", href:"09-data-model.html", built:true }
  ],

  /* ---- Roles, taken verbatim from the "As a <role>…" stories ---- */
  roles: [
    { id:"instructor",   label:"Instructor" },
    { id:"sysadmin",     label:"System administrator" }
  ],

  /* ---- Outcomes. The plan carries NO numeric target. Do not add one. ---- */
  outcomes: [],
  outcomesNote: "The plan carries no numeric target yet. Nothing in this build " +
                "may claim a measure until one is agreed.",

  /* ---- Requirements (18) ---- */
  requirements: [
    { id:"REQ-001", kind:"CONSTRAINT", level:"must",   system:"student-portal",
      text:"The system must read student login data from the Student Portal." },
    { id:"REQ-002", kind:"CONSTRAINT", level:"must",   system:"learning-management",
      text:"The system must read student progress data from the Learning Management System." },
    { id:"REQ-003", kind:"CONSTRAINT", level:"must",   system:"attendance-tracking",
      text:"The system must read attendance data from the Attendance Tracking System." },
    { id:"REQ-004", kind:"CONSTRAINT", level:"must",   system:"email-platform",
      text:"The system must send emails via the Email Platform." },
    { id:"REQ-005", kind:"FUNC", level:"must",
      text:"The system must generate a weekly report of students potentially falling behind " +
           "based on login, progress, and attendance data." },
    { id:"REQ-006", kind:"FUNC", level:"must",
      text:"The system must allow instructors to review and approve the list of students " +
           "before emails are sent." },
    { id:"REQ-007", kind:"FUNC", level:"must",
      text:"The system must provide suggested opening lines for each student in the report." },
    { id:"REQ-008", kind:"FUNC", level:"must",
      text:"The system must flag students for instructor review if the recommendation is uncertain." },
    { id:"REQ-009", kind:"FUNC", level:"must",
      text:"The system must send the final approved list to instructors every Monday morning." },
    { id:"REQ-010", kind:"FUNC", level:"must",
      text:"The system must allow instructors to view activity data for each student in the report." },
    { id:"REQ-011", kind:"SAFE", level:"must",
      text:"The system must ensure data integrity and accuracy in reports." },
    { id:"REQ-012", kind:"OBS", level:"must",
      text:"The system must log all actions taken by instructors for audit purposes." },
    { id:"REQ-013", kind:"NFR", level:"should",
      text:"Every instructor-facing screen must allow completion of its primary action " +
           "in three clicks or fewer." },
    { id:"REQ-014", kind:"NFR", level:"should",
      text:"The system should optimize email content for engagement." },
    { id:"REQ-015", kind:"FUNC", level:"should",
      text:"The system should provide analytics on student engagement trends over time." },
    { id:"REQ-016", kind:"FUNC", level:"should",
      text:"The system should allow customization of report criteria by instructors." },
    { id:"REQ-017", kind:"NFR", level:"should",
      text:"The system should support multiple languages for email content." },
    { id:"REQ-018", kind:"NFR", level:"should",
      text:"The system should provide mobile access to reports." }
  ],

  /* ---- Releases (5) ---- */
  releases: [
    { id:"r0", name:"Initial Setup and Data Integration", start:"2026-08-15", end:"2026-08-23" },
    { id:"r1", name:"Instructor Review and Approval",     start:"2026-08-26", end:"2026-09-02" },
    { id:"r2", name:"Notification and Communication",     start:"2026-09-11", end:"2026-09-11" },
    { id:"r3", name:"Data Integrity and Audit",           start:"2026-09-16", end:"2026-09-21" },
    { id:"r4", name:"Enhancements and Analytics",         start:"2026-09-26", end:"2026-10-01" }
  ],

  /* ---- Stories (12), in build order ---- */
  stories: [
    { id:"STORY-001", release:"r0", due:"2026-08-15", agent:"data-aggregator",
      title:"Enable instructors to log in via Student Portal and access their dashboard" },
    { id:"STORY-002", release:"r0", due:"2026-08-18", agent:"data-aggregator",
      title:"Display student progress data on instructor dashboard" },
    { id:"STORY-003", release:"r0", due:"2026-08-20", agent:"data-aggregator",
      title:"Show attendance data on instructor dashboard" },
    { id:"STORY-012", release:"r0", due:"2026-08-23", agent:"integrity-checker",
      title:"Establish audit trail for all instructor actions" },
    { id:"STORY-004", release:"r1", due:"2026-08-26", agent:"report-generator",
      title:"Generate basic weekly report" },
    { id:"STORY-005", release:"r1", due:"2026-08-29", agent:"review-facilitator",
      title:"Enable instructor review of reports" },
    { id:"STORY-006", release:"r1", due:"2026-09-02", agent:"review-facilitator",
      title:"Flag uncertain recommendations for review" },
    { id:"STORY-007", release:"r2", due:"2026-09-11", agent:"email-notifier",
      title:"Send emails with suggested messages" },
    { id:"STORY-008", release:"r3", due:"2026-09-16", agent:"integrity-checker",
      title:"Implement data integrity checks" },
    { id:"STORY-009", release:"r3", due:"2026-09-21", agent:"integrity-checker",
      title:"Log instructor actions for audit" },
    { id:"STORY-010", release:"r4", due:"2026-09-26", agent:"analytics-provider",
      title:"Provide analytics on student engagement trends" },
    { id:"STORY-011", release:"r4", due:"2026-10-01", agent:"analytics-provider",
      title:"Allow customization of report criteria" }
  ],

  /* ---- Guardrails: promises the system makes. SAFE requirements. ---- */
  guardrails: [
    { req:"REQ-011",
      promise:"The system must ensure data integrity and accuracy in reports.",
      enforcedBy:[],   /* nothing in the build enforces this yet */
      bindsAgent:"integrity-checker" }
  ],

  /* ---- External systems (4). None connected on day one. ---- */
  systems: [
    { id:"student-portal",      name:"Student Portal",
      role:"Source of student login data.",           req:"REQ-001" },
    { id:"learning-management", name:"Learning Management",
      role:"Source of student progress data.",        req:"REQ-002" },
    { id:"attendance-tracking", name:"Attendance Tracking",
      role:"Source of attendance data.",              req:"REQ-003" },
    { id:"email-platform",      name:"Email Platform",
      role:"Sends the instructor emails.",            req:"REQ-004" }
  ],

  /* ---- AI agents (6) ---- */
  agents: [
    { id:"data-aggregator", name:"Data Aggregator",
      does:"Collects and displays student data from various systems for instructor review.",
      firesOn:"Instructor logs in via Student Portal", trigger:"manual",
      reads:["student-portal","learning-management","attendance-tracking"],
      produces:["Instructor Dashboard"],
      autonomy:"auto", autonomyLabel:"Completes on its own",
      stopsWhen:null, blockedByReq:null,
      skills:["read data from APIs","display data on dashboard"],
      owns:["STORY-001","STORY-002","STORY-003"] },

    { id:"report-generator", name:"Report Generator",
      does:"Generates a weekly report of students potentially falling behind.",
      firesOn:"Weekly schedule", trigger:"schedule",
      reads:["student-portal","learning-management","attendance-tracking"],
      produces:["Weekly Report"],
      autonomy:"auto", autonomyLabel:"Completes on its own",
      stopsWhen:null, blockedByReq:null,
      skills:["data analysis","report generation"],
      owns:["STORY-004"] },

    { id:"review-facilitator", name:"Review Facilitator",
      does:"Facilitates instructor review and approval of the weekly report.",
      firesOn:"Instructor accesses report for review", trigger:"manual",
      reads:["Weekly Report"],
      produces:["Approved Report"],
      autonomy:"human", autonomyLabel:"Prepares, then waits for a human to release it",
      stopsWhen:"If instructor does not approve, report is not sent.", blockedByReq:null,
      skills:["display report","capture instructor input"],
      owns:["STORY-005","STORY-006"] },

    { id:"email-notifier", name:"Email Notifier",
      does:"Sends emails to instructors with suggested messages for students.",
      firesOn:"Monday morning", trigger:"schedule",
      reads:["Approved Report"],
      produces:["Emails sent via Email Platform"],
      autonomy:"human", autonomyLabel:"Prepares, then waits for a human to release it",
      stopsWhen:"If report is not approved, emails are not sent.", blockedByReq:null,
      skills:["send email","generate email content"],
      owns:["STORY-007"] },

    { id:"integrity-checker", name:"Integrity Checker",
      does:"Ensures data integrity and logs instructor actions for audit purposes.",
      firesOn:"Any data processing or instructor action", trigger:"event",
      reads:["Instructor Dashboard","Weekly Report"],
      produces:["Audit Log"],
      autonomy:"human", autonomyLabel:"Prepares, then waits for a human to release it",
      stopsWhen:null, blockedByReq:"REQ-011",
      skills:["data validation","logging"],
      owns:["STORY-008","STORY-009","STORY-012"] },

    { id:"analytics-provider", name:"Analytics Provider",
      does:"Provides analytics on student engagement trends and allows report customization.",
      firesOn:"Instructor requests analytics or customization", trigger:"manual",
      reads:["student-portal","learning-management","attendance-tracking"],
      produces:["Engagement Analytics","Customized Report Criteria"],
      autonomy:"auto", autonomyLabel:"Completes on its own",
      stopsWhen:null, blockedByReq:null,
      skills:["data analysis","customization interface"],
      owns:["STORY-010","STORY-011"] }
  ]
};

/* ---- Derived counts. Computed, never typed twice. ---- */
PLAN.derive = (function () {
  const byId = (arr) => arr.reduce((m, x) => (m[x.id] = x, m), {});
  const d = {
    reqTotal:    PLAN.requirements.length,
    reqMust:     PLAN.requirements.filter(r => r.level === "must").length,
    reqShould:   PLAN.requirements.filter(r => r.level === "should").length,
    reqByKind:   {},
    storyTotal:  PLAN.stories.length,
    releaseTotal:PLAN.releases.length,
    agentTotal:  PLAN.agents.length,
    agentAuto:   PLAN.agents.filter(a => a.autonomy === "auto").length,
    agentHuman:  PLAN.agents.filter(a => a.autonomy === "human").length,
    systemTotal: PLAN.systems.length,
    guardrailTotal: PLAN.guardrails.length,
    outcomeTotal:   PLAN.outcomes.length,
    tabsBuilt:   PLAN.tabs.filter(t => t.built).length,
    tabsTotal:   PLAN.tabs.length,
    agentById:   byId(PLAN.agents),
    systemById:  byId(PLAN.systems),
    storyById:   byId(PLAN.stories),
    releaseById: byId(PLAN.releases),
    reqById:     byId(PLAN.requirements)
  };
  PLAN.requirements.forEach(r => { d.reqByKind[r.kind] = (d.reqByKind[r.kind] || 0) + 1; });
  d.storiesIn = (rid) => PLAN.stories.filter(s => s.release === rid);
  return d;
})();
