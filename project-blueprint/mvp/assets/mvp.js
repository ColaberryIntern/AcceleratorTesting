/* ============================================================
   MVP — the single source of truth for this knowledge base.
   Every page, tile, figure, count and search result renders
   from this object. Nothing is typed twice.
   Derived from architecture.md and tech-stack.md.
   ============================================================ */
const MVP = {
  project: "Advisor Gap Report",
  tagline: "Five days, nine components deleted, and one question worth answering before anything else gets built.",
  generated: "2026-08-06",
  basis: ["project-blueprint/architecture.md", "project-blueprint/tech-stack.md"],

  question: "Can the model find a student's real skill gaps and quote the exact line of the job posting that proves each one — reliably enough that a working advisor believes the output?",
  questionWhy: "Everything else in the architecture assumes the answer is yes. If it's no, no amount of queues, gates or SSO saves the idea.",

  building: [
    { what: "One page with two big text boxes", detail: "Paste a résumé, paste a posting, press a button.", from: "Advisor Web App, stripped to a single screen" },
    { what: "One endpoint", detail: "Sends both to Claude and asks for two lists of skills, each entry carrying the line it came from.", from: "API + Report Pipeline Worker + LLM API, collapsed into one file" },
    { what: "The subtraction, on screen", detail: "Required minus demonstrated, rendered as a gap list where every gap shows its quote.", from: "The core of the pipeline" },
    { what: "Ten projects hardcoded in a JavaScript array", detail: "Tagged with the skills they teach.", from: "Skills Taxonomy + Project Catalog, faked" }
  ],

  cuts: [
    { cut: "Job Queue", why: "It exists so an advisor isn't stuck watching a spinner. You are the only user this week and you can wait sixty seconds." },
    { cut: "Postgres", why: "Persistence proves nothing about extraction quality. Ten runs, ten browser tabs." },
    { cut: "pgvector + real taxonomy", why: "Matching phrasing to canonical skills is a solved-ish problem you can fake with ten hardcoded projects. It is not the risk." },
    { cut: "Object Storage + file upload", why: "Paste the text. Upload is plumbing; it has never been the thing that kills a product like this." },
    { cut: "College SSO", why: "It runs on your laptop. Nobody signs in." },
    { cut: "Report Quality Gate (as code)", why: "You are the gate this week. Check all ten by hand — that is how you learn what the automated checks need to be." },
    { cut: "Employer site fetch", why: "Paste the posting. The architecture already says the paste box should be the primary path anyway." },
    { cut: "Résumé text extraction", why: "Paste the text. This is a real Week 3 problem and a distraction from Week 1's question." },
    { cut: "PDF rendering", why: "Screen only. Nobody needs a file to tell you whether the gaps are right." },
    { cut: "Docker, VPS, deploy", why: "localhost is a deployment." }
  ],

  stackCuts: [
    { what: "Screen",     using: "One static HTML file with a form", insteadOf: "React + Vite" },
    { what: "Server",     using: "One ~100-line Node file, no framework", insteadOf: "Node + Express + TypeScript" },
    { what: "Model",      using: "Claude API, called directly", insteadOf: "Claude via the pipeline worker" },
    { what: "Catalog",    using: "A JavaScript array of 10 projects", insteadOf: "PostgreSQL + pgvector" },
    { what: "Storage",    using: "Nothing — it's in the page", insteadOf: "Cloudflare R2" },
    { what: "Validation", using: "Your own eyes, on all ten", insteadOf: "Zod + the Quality Gate" },
    { what: "Hosting",    using: "node server.js on your laptop", insteadOf: "Docker Compose on a VPS" }
  ],

  days: [
    { day: "Monday", short: "Quotes come back", outcome: "One résumé's skills come back with quotes attached",
      tasks: ["Get a Claude API key working from a Node script",
              "Ask for structured JSON: skill, plus the exact source line",
              "Run it on your own résumé and read every line of the output"] },
    { day: "Tuesday", short: "The gap list", outcome: "Both sides extracted, and the gap list renders",
      tasks: ["Same extraction against a posting",
              "Subtract: required minus demonstrated",
              "Put it on a page — ugly is fine, quotes are not optional"] },
    { day: "Wednesday", short: "Ten real ones", outcome: "Ten real résumés go through it",
      tasks: ["Collect 10 anonymised résumés and 3 real postings from the advisor",
              "Run all ten, save every output",
              "Write down every wrong gap and why it was wrong"] },
    { day: "Thursday", short: "Looks real", outcome: "Projects attached, and it stops looking like a demo",
      tasks: ["Hardcode 10 projects with skill tags and hour estimates",
              "Attach the best-fitting projects to each gap",
              "Spend two hours making the screen presentable — it changes how people read it"] },
    { day: "Friday", short: "A real person", outcome: "Put it in front of a real person",
      tasks: ["Sit with one career-services advisor",
              "Have them read three reports without you explaining anything",
              "Ask one question: \"Would you hand this to that student?\""] }
  ],

  pass: [
    "At least 7 of 10 have zero invented gaps — every gap traces to a line that really is in that posting, checked by hand.",
    "The advisor says they would hand at least 5 to a student after light edits.",
    "The advisor points at a gap you did not expect and says \"yes, that's the real problem.\" That is the moment the idea is real."
  ],
  fail: "Gaps come back generic — \"communication skills\", \"attention to detail\" — instead of specific and quoted. Or citations don't actually appear in the source text. Or the advisor reads three and says some version of \"this isn't how I think about students.\" Expect the last one: it is the most likely failure and the least technical.",

  outcomes: [
    { outcome: "Pass", kind: "good", when: "7+ clean, advisor would hand over 5",
      means: "The risky assumption holds. The rest of the architecture is ordinary engineering.",
      next: "Build Phase 2 from the architecture: real catalog, then the Quality Gate." },
    { outcome: "Partial", kind: "warn", when: "Extraction is clean but the projects are wrong",
      means: "The hard part works; the matching is the problem.",
      next: "Keep everything. Spend Week 2 on the catalog and the ranking rule, not on the model." },
    { outcome: "Fail", kind: "risk", when: "Citations unreliable, or the advisor doesn't recognise the thinking",
      means: "The day-one bar may not be reachable the way it's currently designed.",
      next: "Stop. Consider a version where the advisor drives and the tool assists, rather than the reverse — a different product, and better learned in Week 1 than Month 6." }
  ],

  provesNothing: [
    "Whether it works on scanned résumés — you are pasting text.",
    "Whether it scales, or survives two advisors at once.",
    "Whether FERPA and the college's IT department will allow any of it.",
    "Whether students actually do the six-week plans — that takes a semester to learn, not a week.",
    "Whether the reports are good enough unedited, which is the real day-one bar. Week 1 only tests whether they are close enough to be worth pursuing."
  ],

  mockup: {
    file: "../mockup.html",
    screen: "The finished gap report — the one screen the whole product exists to produce.",
    highlights: [
      { icon: "🔍", title: "Three gaps, each with its receipt", note: "Every gap shows the exact line of the posting that demands it, and what the résumé did or didn't show." },
      { icon: "🚀", title: "Projects ranked by hours-to-close", note: "Three real projects from the catalog, tagged with the skills they close and an hour estimate." },
      { icon: "🗓️", title: "Six weeks, about six hours each", note: "The plan laid out week by week, so the student sees a schedule rather than a wish." },
      { icon: "🛡️", title: "The checks, shown on the page", note: "The four gate checks that passed before an advisor saw it — visible, not hidden." },
      { icon: "✅", title: "What's already proven", note: "The sidebar gives the student credit for what the résumé does evidence, quoted back to them." }
    ]
  },

  pitch: {
    headline: "The 45-minute conversation, in 45 seconds.",
    problem: "One advisor. 200+ students a semester. A student brings in a résumé and a job they want; the advisor reads both, works out what's missing, and writes a plan. It takes an hour, it's the best work they do, and there is only ever time for a handful of students.",
    does: [
      { icon: "🔍", text: "What's missing — and the exact line of the posting that proves it" },
      { icon: "🚀", text: "What to build — real projects, ranked by how fast they close the gap" },
      { icon: "🗓️", text: "A six-week plan — about six hours a week" }
    ],
    trust: "Every claim is quoted from the real posting. Every project comes from a catalog your team approved. Nothing reaches an advisor until it passes a fixed checklist.",
    trustLine: "If it can't prove it, it doesn't print it.",
    who: "Community college career services — two-person teams carrying hundreds of students. The advisors who already know exactly what to say; they just can't say it two hundred times.",
    why: "A student's next job shouldn't depend on whether there was time in the calendar.",
    changes: [
      { icon: "⏱️", today: "An hour per student", withIt: "Under a minute" },
      { icon: "👤", today: "A handful get the deep version", withIt: "Every student does" },
      { icon: "📋", today: "Quality varies with the day", withIt: "Same checks, every time" },
      { icon: "🤝", today: "Advisor spends the hour analysing", withIt: "Advisor spends it advising" }
    ],
    close: "Ten students. One afternoon. Bring your own résumés.",
    caveat: "Figures describe a pilot design, not measured results. \"More than 200 students a semester\" and \"about an hour per student\" describe current practice as reported by advisors. \"Under a minute\" is an estimate from the system design and has not yet been measured in service.",
    pdf: {
      file: "../one-pager.pdf",
      tool: "headless Chrome print-to-PDF",
      pages: 1,
      size: "Letter, 0.45in margins",
      note: "A real PDF — one page, print-ready, ready to hand to a dean or attach to an email."
    }
  },

  artifacts: [
    { label: "Week 1 plan",        path: "project-blueprint/mvp-plan.md",  note: "The checklist, the cuts, and the Friday decision" },
    { label: "Mockup",             path: "project-blueprint/mockup.html",  note: "The finished gap report screen, real sample content" },
    { label: "One-pager (PDF)",    path: "project-blueprint/one-pager.pdf", note: "The pitch as a real one-page PDF, generated by headless Chrome" },
    { label: "One-pager (source)", path: "project-blueprint/one-pager.md",  note: "The same content in Markdown, for editing" },
    { label: "This knowledge base", path: "project-blueprint/mvp/index.html", note: "All three, browsable" },
    { label: "Architecture",       path: "project-blueprint/architecture.md", note: "What the cuts were made from" },
    { label: "Tech stack",         path: "project-blueprint/tech-stack.md", note: "What the Week 1 stack was cut down from" }
  ]
};
