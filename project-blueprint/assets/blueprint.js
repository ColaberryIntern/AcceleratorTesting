/* ============================================================
   BLUEPRINT — the single source of truth for this knowledge base.
   Every page, tile, card, chart, diagram, count, illustration and
   agent answer renders from this object. No number is typed twice:
   anything countable is derived at the bottom of this file.
   ============================================================ */
const BLUEPRINT = {
  project: "Pantry Router",
  tagline: "A photograph of a case label goes in. A pantry that can actually distribute the food before it expires comes out — or a hold, and nothing else.",
  generated: "2026-08-06",

  dayOneBar: "Never route food to a pantry that cannot distribute it before it expires. If the expiry date is unreadable or the timing is too tight, say \"hold for staff review\" instead of guessing. Every other design decision here is downstream of that sentence.",

  idea: "It's for the two staff and rotating volunteers at a regional food bank who receive donated pallets all day and have to decide, on the spot, which of their 40 partner pantries each one goes to. A volunteer photographs the case label on their phone, and the system reads the product name, quantity, and expiry date off the photo, then matches it against what each pantry has asked for and how fast that pantry actually moves that kind of food, and prints a routing slip telling the volunteer which dock to stage it on. Coordinators at the receiving pantries get a text when a pallet is assigned to them, and every assignment stays on record so the food bank can show a funder where the donated food went.",

  conclusion: "The model reads the label. It never decides where the food goes. Product and expiry are extracted with the text they were read from and a confidence score attached, pantries are ranked by arithmetic against a maintained directory, and a deterministic gate is allowed to refuse — sending the pallet to a human desk rather than to a shelf it would rot on. That refusal is the product.",

  components: [
    { id: "phone", name: "Volunteer Phone App", kind: "entry", tech: "Mobile web, camera capture",
      blurb: "The one screen a volunteer uses at the dock — photograph a case label, confirm the case count, and watch a short live list turn each pallet into a pantry name and a dock number, or a hold.",
      why: "\"a volunteer photographs the case label on their phone\" — a human uses this directly" },
    { id: "board", name: "Staff Review Board", kind: "entry", tech: "Desktop web",
      blurb: "The desk screen where the two staff work through everything the system refused to route — the label photo beside the reading it got, which check failed, and a correct-or-override control that records who decided and why.",
      why: "\"hold for staff review\" — a hold with nowhere to land is a loss, not a safeguard" },
    { id: "api", name: "Intake API", kind: "build", tech: "Node + Express",
      blurb: "Takes the photo off the phone, files it, writes down that a pallet arrived, puts it in line to be read, and hands the phone back an answer immediately so the volunteer can photograph the next case.",
      why: "\"the volunteer cannot be left waiting on a spinner\"" },
    { id: "reader", name: "Label Reading Worker", kind: "build", tech: "Node worker",
      blurb: "Picks one waiting pallet at a time and turns a photograph of a case label into a product name, a pack size and an expiry date, each one carrying the text it actually read and how sure it is.",
      why: "\"reads the product name, quantity, and expiry date off the photo\"" },
    { id: "router", name: "Routing Engine", kind: "build", tech: "Deterministic scoring",
      blurb: "Decides where the food goes by arithmetic, not by opinion — which pantries asked for this kind of food, whether they have the cold storage for it, how many days their own record says it takes them to move that quantity, and which of them can clear it soonest.",
      why: "\"matches it against what each pantry has asked for and how fast that pantry actually moves that kind of food\"" },
    { id: "gate", name: "Expiry Safety Gate", kind: "build", tech: "Deterministic validator",
      blurb: "The reason nothing rots on a pantry shelf: the last checkpoint before anything is assigned, printed or texted, which blocks the assignment whenever the expiry date is unreadable, is in the past, or leaves less time than that pantry needs to hand the food out — and sends the pallet to staff instead.",
      why: "the day-one sentence — a ranking always returns a best answer, so something else has to be allowed to return nothing" },
    { id: "slip", name: "Slip Renderer", kind: "build", tech: "HTML to receipt printer",
      blurb: "Turns an approved assignment into the small printed slip a volunteer carries with the pallet — pantry name, dock number, product, count and expiry date, big enough to read across a warehouse.",
      why: "\"prints a routing slip telling the volunteer which dock to stage it on\"" },
    { id: "queue", name: "Photo Queue", kind: "data", tech: "Redis + BullMQ",
      blurb: "The waiting line of label photos, so sixty cases photographed in ten minutes get read in the order they arrived instead of overwhelming the reader or making a volunteer stand still.",
      why: "\"60 labels in ten minutes, then nothing for an hour\" — bursty, and each read takes seconds" },
    { id: "db", name: "Postgres", kind: "data", tech: "Postgres",
      blurb: "Remembers every pallet that came in, what was read off its label, where it was sent, what a staffer overrode and why — which is what you query when a funder asks where the donated food went.",
      why: "\"every assignment stays on record so the food bank can show a funder\"" },
    { id: "directory", name: "Pantry Directory", kind: "data", tech: "Postgres, maintained by staff",
      blurb: "The maintained list of the 40 partner pantries: what each one has standing requests for, whether it has refrigeration, how much it can take at once, and how fast it has historically moved each kind of food — this is what routing decides from.",
      why: "\"which of their 40 partner pantries\" — you cannot rank pantries that are not written down" },
    { id: "photos", name: "Photo Storage", kind: "data", tech: "S3 or equivalent",
      blurb: "Holds the label photographs themselves, both as the thing the reader works from and as the evidence a staffer looks at when they disagree with a reading.",
      why: "photographs are files, and they are the proof behind every reading" },
    { id: "vision", name: "Vision Model API", kind: "external", tech: "Claude vision",
      blurb: "Reads the label in the photograph — the one job in this system that needs a model, because case labels are photographed at an angle, in bad light, with shrink wrap over them.",
      why: "extraction of meaning from an image; no rule or lookup does this" },
    { id: "sms", name: "SMS Service", kind: "external", tech: "Twilio",
      blurb: "Sends the pantry coordinator the text that tells them a pallet is theirs, what it is, and when it has to be out the door by.",
      why: "\"coordinators at the receiving pantries get a text\"" },
    { id: "printer", name: "Dock Printer", kind: "external", tech: "Network receipt printer",
      blurb: "The receipt printer at the volunteer's station that the routing slip comes out of — hardware nobody controls, which jams and runs out of paper in the middle of a truck.",
      why: "\"prints a routing slip\" — the slip has to physically exist at the dock" }
  ],

  diagram: `flowchart TD
    Volunteer(["Volunteer at the receiving dock"])
    Staff(["Food-bank staff"])
    subgraph ours["Our infrastructure"]
        Phone["Volunteer Phone App"]
        Board["Staff Review Board"]
        API["Intake API"]
        Jobs[("Photo Queue")]
        Reader["Label Reading Worker"]
        Router["Routing Engine"]
        Gate["Expiry Safety Gate"]
        Slip["Slip Renderer"]
        DB[("Postgres — pallets, assignments, overrides")]
        Directory[("Pantry Directory — requests, capacity, throughput")]
        Photos[("Photo Storage — label photographs")]
    end
    Vision{{"Vision Model API"}}
    Sms{{"SMS Service"}}
    Printer{{"Dock Printer"}}

    Volunteer -->|"photo of the case label, station code, case count"| Phone
    Phone -->|"POST /pallets with the photo"| API
    API -->|"stores the original label photo"| Photos
    API -->|"writes pallet row, status reading"| DB
    API -->|"enqueues pallet ID"| Jobs
    API -->|"returns pallet ID immediately"| Phone
    Jobs -->|"delivers one pallet to a free worker"| Reader
    Reader -->|"reads the stored photo"| Photos
    Reader -->|"label image"| Vision
    Vision -->|"product, pack size, expiry, each with confidence"| Reader
    Reader -->|"normalised reading and case count"| Router
    Router -->|"which pantries requested this category"| Directory
    Directory -->|"matching pantries, cold storage, daily movement"| Router
    Router -->|"ranked pantries and projected days to distribute"| Gate
    Gate -->|"failed a check, status hold for staff review"| DB
    Gate -->|"passed, writes the assignment"| DB
    Gate -->|"approved assignment"| Slip
    Gate -->|"text to the pantry coordinator"| Sms
    Slip -->|"dock slip"| Printer
    Printer -->|"printed slip at the volunteer's station"| Volunteer
    Phone -->|"polls: reading, assigned, or on hold"| API
    API -->|"pallet status and the assigned pantry"| DB
    Staff -->|"corrects a reading or overrides with a reason"| Board
    Photos -->|"serves the label photo as evidence"| Board
    Board -->|"resolves a hold, edits standing requests"| API
    API -->|"records the override and who made it"| DB
    API -->|"updates standing requests and capacity"| Directory
    API -->|"re-runs routing on a corrected reading"| Router`,

  /* Which mermaid node IDs belong to which class — keeps the diagram
     colouring in the data instead of hardcoded in the renderer. */
  mermaidClasses: {
    entry: "Volunteer,Staff,Phone,Board",
    build: "API,Reader,Router,Gate,Slip",
    store: "Jobs,DB,Directory,Photos",
    ext:   "Vision,Sms,Printer"
  },

  sequence: `sequenceDiagram
    autonumber
    actor V as Volunteer
    participant P as Phone App
    participant A as Intake API
    participant W as Label Reader
    participant M as Vision Model
    participant R as Routing Engine
    participant G as Expiry Gate
    V->>P: Photo of the case label plus case count
    P->>A: POST /pallets
    A-->>P: Pallet ID immediately
    A->>W: Enqueue pallet
    W->>M: Label image
    M-->>W: Product, pack size, expiry, confidence
    W->>R: Normalised reading
    R->>G: Ranked pantries and days to distribute
    G-->>A: Hold for staff review on a failed check
    G->>A: Assignment approved, slip and text released
    A-->>P: Pantry name and dock, or hold
    P-->>V: Slip prints at the station`,

  gantt: `gantt
    title Proposed build sequence
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    section Read a label
    Photo capture on a phone          :a1, 2026-08-10, 7d
    Vision extraction with confidence :a2, after a1, 10d
    Reading shown back on screen      :a3, after a2, 4d
    section Never route past expiry
    Pantry directory and requests     :b1, after a3, 7d
    Deterministic routing engine      :b2, after b1, 7d
    Expiry safety gate                :b3, after b2, 7d
    Staff review board for holds      :b4, after b3, 7d
    section A real truck
    Queue and workers for bursts      :c1, after b4, 7d
    Dock slip printing                :c2, after c1, 5d
    Coordinator SMS                   :c3, after c2, 4d
    section Trust and records
    Assignment history and export     :d1, after c3, 7d
    Gate accuracy report              :d2, after d1, 7d`,

  /* `short` is the label used in the pipeline illustration; `title` is the prose heading.
     `llm: true` marks the steps where a model is involved at all. */
  flow: [
    { short: "Truck arrives", title: "A truck backs in and a volunteer opens the station link",
      detail: "The phone screen is scoped to one dock by a station code, not to a named person, because the volunteers rotate and half of them are here for one shift." },
    { short: "Photograph label", title: "One case label is photographed, and the count is confirmed",
      detail: "The photo is what the system reads. The case count is the one number a human types, because it cannot be seen in the picture — a single label tells you what is on the pallet, not how much of it there is." },
    { short: "API answers first", title: "The API answers before the work starts",
      detail: "It files the photo, writes a pallet row marked reading, drops the pallet ID on the queue, and hands the phone back an ID straight away. The volunteer photographs the next case instead of watching a spinner." },
    { short: "Queued read", title: "A worker takes one pallet off the queue",
      detail: "Bursts of sixty photos become an orderly line. A read that fails is retried rather than lost, and nothing about the burst reaches the volunteer as waiting." },
    { short: "Read the label", llm: true, title: "The model reads the label, and only the label",
      detail: "Product name, pack size and expiry date come back as structured fields, each carrying the exact text the model read and a confidence score. That confidence is not decoration — the gate uses it later to decide whether a date can be trusted at all." },
    { short: "Normalise", title: "The reading is normalised to a food category",
      detail: "\"GRN BEANS 6/#10\" and \"Green Beans, canned, No. 10\" resolve to the same category in the directory, so the matching that follows compares like with like rather than comparing two spellings." },
    { short: "Rank pantries", title: "The routing engine ranks pantries by arithmetic",
      detail: "Pantries with a standing request for that category, filtered by cold-storage need and by how much they can take at once, scored on how many days their own record says they need to move that quantity. Every input to that score is a number a staffer can look up and argue with." },
    { short: "Expiry gate", title: "The expiry safety gate has the last word",
      detail: "The top-ranked pantry is accepted only if the expiry date parsed cleanly, is in the future, was read with high enough confidence, and leaves more days than transit plus projected distribution plus a fixed safety buffer. Any failure means no assignment, no print, no text — the pallet becomes hold for staff review." },
    { short: "Slip, record, text", title: "A pass turns into a slip, a record and a text",
      detail: "The assignment is written, the dock slip prints at the volunteer's station, and the pantry coordinator gets a text saying what is coming and the date it has to be out the door by." },
    { short: "Holds to the desk", title: "A hold goes to the desk, and the override is the metric",
      detail: "The staff screen shows the photo, the reading, and which check failed. A staffer corrects the reading and re-runs it, or overrides with a reason. Every override is stored, because the rate at which humans overrule the gate is the only honest measure of whether the gate is set correctly." }
  ],

  phases: [
    { name: "Read a label", weeks: "Weeks 1–3",
      items: ["Photo capture on a phone", "Photo storage", "Vision extraction with confidence", "The reading shown back on screen"],
      proves: "That a model can read a real case label photographed at an angle under warehouse lighting. If it cannot, nothing after this matters — stop here." },
    { name: "Never route past expiry", weeks: "Weeks 4–7", critical: true,
      items: ["Pantry directory and standing requests", "Deterministic routing engine", "Expiry safety gate", "Staff review board for holds"],
      proves: "That the day-one promise holds: every assignment clears the expiry math, and everything that does not clear it lands on a desk instead of a pallet. This is the phase the idea lives or dies on." },
    { name: "A real truck", weeks: "Weeks 8–10",
      items: ["Queue and workers for burst arrivals", "Dock slip printing", "Coordinator SMS", "The live list on the phone"],
      proves: "That sixty labels in ten minutes get through without a volunteer waiting on any single one." },
    { name: "Trust and records", weeks: "Weeks 11–12",
      items: ["Assignment history and funder export", "Override reasons and a gate-accuracy report", "Throughput updated from real pickups"],
      proves: "That the food bank can show a funder where the food went, and can tell whether the gate is set too tight or too loose." }
  ],

  criticalNote: "Make-or-break: if the gate cannot keep food off a shelf it would rot on, nothing after it is worth building.",

  coverage: [
    { concern: "Label reading with confidence", status: "designed", note: "Product, pack size and expiry returned with the text read and a confidence score" },
    { concern: "Deterministic routing",         status: "designed", note: "Category match, cold-storage filter, then days-to-distribute arithmetic" },
    { concern: "Expiry safety gate",            status: "designed", note: "Blocks assignment on an unreadable, past, low-confidence or too-tight expiry date" },
    { concern: "Holds and staff override",      status: "designed", note: "Every hold lands on a desk with the photo and the failed check beside it" },
    { concern: "Burst intake",                  status: "designed", note: "Queue and workers sized for sixty photos in ten minutes" },
    { concern: "Assignment record",             status: "designed", note: "Every pallet, reading, assignment and override kept indefinitely" },
    { concern: "Dock slip printing",            status: "designed", note: "Rendered from the approved assignment, reprintable from the review board" },
    { concern: "Coordinator notification",      status: "designed", note: "One text per assignment, naming the product and the date it must be out by" },
    { concern: "Volunteer identity",            status: "partial",  note: "A station code identifies the dock; nobody signs in as themselves" },
    { concern: "Funder reporting",              status: "partial",  note: "The data is captured in the right shape; no export surface is designed" },
    { concern: "Throughput accuracy",           status: "partial",  note: "Seeded from coordinator estimates, updated from real pickups only in phase 4" },
    { concern: "Printer failure",               status: "partial",  note: "Reprint from the review board; no print queue and no retry design" },
    { concern: "Cold-chain compliance",         status: "deferred", note: "Refrigeration is a yes/no flag, not a monitored temperature chain" },
    { concern: "Allergen and dietary needs",    status: "deferred", note: "Routing matches food categories, not the people a pantry actually serves" },
    { concern: "Recall tracing",                status: "deferred", note: "Nothing traces which pantries received a recalled lot, though the data exists" },
    { concern: "Damaged or partial cases",      status: "deferred", note: "Assumes what arrives is distributable" },
    { concern: "Non-English labels and UI",     status: "deferred", note: "English only, which is optimistic for both the labels and the volunteers" },
    { concern: "Offline operation at the dock", status: "deferred", note: "Intake stops when the warehouse wifi does" },
    { concern: "Multi-warehouse scale",         status: "deferred", note: "One database, one queue, one worker pool — correct at this size" }
  ],

  assumptions: [
    { impact: "high",   text: "One label represents the whole pallet. The volunteer photographs one case and confirms how many cases are on it; mixed pallets would need case-level scanning and roughly double the intake flow." },
    { impact: "high",   text: "Pantry throughput is seeded by hand from coordinators' estimates and is not learned until phase 4 — so the routing engine's central number is a guess for the first months, and the safety buffer is doing more work than the ranking is." },
    { impact: "high",   text: "Volunteers are not individually identified. A station code identifies the dock, not the person holding the phone, which also sidesteps any policy about minors and one-day volunteers." },
    { impact: "medium", text: "Pickup is same-day or next-day, so transit enters the expiry math as a fixed allowance per pantry rather than a scheduled delivery route." },
    { impact: "medium", text: "Every assignment and every override is kept indefinitely — that record is what a funder audit reads and what the gate-accuracy report is built from." },
    { impact: "low",    text: "The warehouse has working wifi and there is no offline queue on the phone on day one, which at a loading dock is a matter of when, not if." },
    { impact: "low",    text: "One warehouse and one printer per dock. Printer routing and a per-site directory are not designed here." }
  ],

  openQuestion: {
    q: "Can a pantry decline an assignment?",
    why: "As designed, an assignment is a decision — the gate approves it, the slip prints, the coordinator is told. If a pantry can say no, the assignment becomes an offer: it needs a timeout, two-way SMS, a re-routing loop, a second pass through the expiry gate on the new candidate (whose margin is now smaller, because time has passed), and a slip that cannot print until somebody accepts. That one answer rewrites roughly half the diagram.",
    ifNo:  { label: "No — what is designed here", items: ["Assignment is a decision", "The text is a notification", "The slip prints straight away"] },
    ifYes: { label: "Yes — what would change", items: ["Assignment becomes an offer with a timeout", "Two-way SMS and a re-routing loop", "A second gate pass on a smaller margin"] }
  },

  /* Copy for the two story illustrations — kept here so the pictures
     change when the idea does, instead of being drawn from memory. */
  story: {
    inputs: [
      { title: "A case label", sub: "photographed at the dock" },
      { title: "40 partner pantries", sub: "what each asked for, how fast they move it" }
    ],
    inArrow: "as each pallet comes off the truck",
    pipelineTitle: "The pipeline",
    chips: ["Read", "Normalise", "Rank", "Check"],
    gate: { name: "Expiry safety gate", note: "Blocks any pantry that cannot hand the food out before it expires" },
    outArrow: "only if it passes",
    output: { title: "A dock slip", lines: ["Which pantry", "Which dock to stage it on", "or: hold for staff review"] },
    moral: "The model reads the label. It never decides where the food goes."
  },

  beforeAfter: {
    before: { title: "Today — by eye", lines: ["One staffer deciding,", "pallet by pallet"],
      stat: "40 partner pantries to hold in your head", sub: "Expiry math done in the aisle, or not at all" },
    after: { title: "With the tool — same truck", steps: [["Photo of", "the label"], ["Routing +", "expiry gate"], ["Dock slip,", "or a hold"]],
      moral: "Nothing is routed past its expiry date — or it is not routed at all" }
  },

  /* Per-section ledes and per-figure copy. Structural rendering lives in
     site.js; everything that is true only of THIS idea lives here. */
  sectionCopy: {
    summary:     "What this is, why it matters, and what to do next — before a single diagram.",
    architecture:"Every component traces back to a phrase in the idea. Nothing here is filler.",
    components:  "What each piece does for this project, in one sentence — and the words in the idea that required it.",
    flow:        "The path from a photograph at the dock to a pantry name on a printed slip.",
    build:       "The sequence you would actually build it in, and what each phase proves.",
    coverage:    "What this design solves, what it half-solves, and what it openly does not touch.",
    assumptions: "What the idea left unstated, what was assumed instead, and the one answer that would change the design most.",
    appendix:    "Where this came from, and how to run it anywhere."
  },

  figures: {
    story:       { title: "The whole idea, in one picture",
      interp: "the inputs on the left are a phone photo and a list of promises; the output on the right is a pallet with somewhere to be. Everything in between exists to make sure that somewhere is a place the food can actually be eaten in time." },
    beforeafter: { title: "What changes at the dock",
      interp: "the truck, the volunteers and the 40 pantries do not change. What changes is that no pallet leaves the dock until the expiry arithmetic has been done for it." },
    layers:      { title: "The system in four layers",
      interp: "read top to bottom: two screens where humans work, five services you write, four stores you configure, three outside services you depend on. The bottom two bands are where delivery risk actually lives." },
    arch:        { title: "How it fits together",
      interp: "the model sits at the edge of the system, not the centre — it reads a label and nothing else. Every decision about where food goes happens between the routing engine and the directory, where you can inspect it, and the gate is the last thing before anything is printed, texted or recorded." },
    kinds:       { title: "What you're actually building", interp: "" },
    kindkey:     { title: "The four kinds at a glance",
      interp: "the split matters for planning: the blue band is the only part where your team's velocity is the constraint." },
    pipeline:    { title: "", interp: "this is the most important picture in the blueprint. Exactly one step involves the model, and it is the one that reads a photograph — every decision about where the food goes comes out of the grey steps." },
    seq:         { title: "Who talks to whom",
      interp: "the API answers the phone before the reading starts — that early return is what lets a volunteer photograph sixty cases without waiting on any single one of them." },
    ribbon:      { title: "",
      interp: "the widths are proportional, so you can see where the time actually goes. The highlighted phase is the one that decides whether the rest is worth starting." },
    gantt:       { title: "The same plan as a schedule",
      interp: "a proposed sequence, not a commitment — useful for spotting what blocks what, not for holding anyone to a date." },
    heat:        { title: "Every concern, colour-coded",
      interp: "green is specified, amber is named but thin, red is openly out of scope. The red block is not a gap in the work — it is the design being honest about its edges." },
    fork:        { title: "The fork in the road",
      interp: "one answer, two different products. Everything on this site describes the left branch — the right branch is a different project wearing the same name." },
    tree:        { title: "What is actually on disk",
      interp: "three shared files under assets/ and one page per section. Change a number in blueprint.js and every page follows." }
  },

  starters: ["expiry gate", "why a queue", "what is deferred", "who decides where the food goes", "what breaks first"],

  artifacts: [
    { label: "Source of truth",    path: "project-blueprint/architecture.md" },
    { label: "Command Center",     path: "project-blueprint/index.html" },
    { label: "Shared data object", path: "project-blueprint/assets/blueprint.js" },
    { label: "Shared script",      path: "project-blueprint/assets/site.js" },
    { label: "Shared styles",      path: "project-blueprint/assets/site.css" },
    { label: "Student prompt",     path: "docs/prompts/system-architect-student-prompt.md" }
  ]
};

/* ------------------------------------------------------------
   Derived values. Everything countable is computed from the
   arrays above, so a number can never disagree with its source.
   ------------------------------------------------------------ */
(function derive(B) {
  function byKind(k) {
    return B.components.filter(function (c) { return c.kind === k; }).length;
  }
  function byStatus(s) {
    return B.coverage.filter(function (c) { return c.status === s; }).length;
  }

  B.totalWeeks = B.phases.reduce(function (max, p) {
    var m = /(\d+)\D+(\d+)/.exec(p.weeks);
    return m ? Math.max(max, +m[2]) : max;
  }, 0);

  B.modelSteps = B.flow.filter(function (f) { return f.llm; }).length;

  B.kpis = [
    { label: "Components", value: B.components.length,
      note: byKind("entry") + " screens · " + byKind("build") + " services · " +
        byKind("data") + " data stores · " + byKind("external") + " outside services" },
    { label: "Outside services", value: byKind("external"),
      note: "A vision model, a text messaging service, and the printer at the dock" },
    { label: "Steps end to end", value: B.flow.length,
      note: "From a photo at the dock to a pantry name on a printed slip" },
    { label: "Deferred concerns", value: byStatus("deferred"),
      note: "Named honestly in Coverage, not quietly skipped" }
  ];

  B.figures.pipeline.title = B.flow.length + " steps, and who does what";
  B.figures.ribbon.title = B.totalWeeks + " weeks, to scale";
  B.figures.kinds.interp = "only " + byKind("build") + " of " + B.components.length +
    " components are services you write — the rest is storage you configure and outside services you call.";
})(BLUEPRINT);
