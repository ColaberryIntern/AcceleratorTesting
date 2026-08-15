/* ============================================================
   STACK — the single source of truth for this knowledge base.
   Every page, tile, card, figure, count and search result renders
   from this object. No number is typed twice.
   Derived from project-blueprint/architecture.md (Pantry Router).
   ============================================================ */
const STACK = {
  project: "Pantry Router",
  tagline: "What to actually build it with — and the four places this plan is most likely to hurt.",
  generated: "2026-08-06",
  basis: "project-blueprint/architecture.md",

  headline: "Almost everything you write here is deliberately boring, and one language runs all of it. The risk is not in the frameworks — it is that the day-one promise, never route food that will expire first, rests entirely on numbers that come out of a photograph. Four rows are red, and all four are places where something outside your code decides whether a pallet is routed safely: a model's confidence about a date read through shrink wrap, a carrier's willingness to deliver a text, a printer's paper, and a list of food-label abbreviations nobody has written yet.",

  ratingNote: "A rating is about THIS project — one warehouse, 40 partner pantries, two staff and rotating volunteers, a few hundred label photos a day in bursts. A red does not mean \"bad technology\". It means this is where the plan is most likely to hurt you, and you should read that row twice.",

  ratingKey: [
    { fit: "great",   icon: "🟢", label: "Great fit",          meaning: "Matches this project's size and needs. Pick it and move on." },
    { fit: "good",    icon: "🟡", label: "Good fit",           meaning: "Works, but there is a real caveat worth reading before you commit." },
    { fit: "careful", icon: "🔴", label: "Consider carefully", meaning: "Most likely to hurt you. Not a bad technology — a risky part of this plan." }
  ],

  groups: [
    { id: "touch",  label: "Things a person touches", note: "A volunteer at a dock and two staff at a desk. That is the entire user base." },
    { id: "write",  label: "Things you write",        note: "Where your team's time actually goes." },
    { id: "store",  label: "Things you store",        note: "Run and configured, not coded." },
    { id: "depend", label: "Things you depend on",    note: "Somebody else's system, somebody else's hardware, somebody else's rules." },
    { id: "flow",   label: "Things the data flow needs", note: "Named in your step-by-step flow, never named in your component list." }
  ],

  picks: [
    /* ---------------- things a person touches ---------------- */
    { id: "phone", group: "touch", component: "Volunteer Phone App",
      tech: "React + Vite, kept on the phone as a web app (PWA)", fit: "good",
      why: "One screen a rotating volunteer opens from a station link — no app store, no install, and it updates the second you deploy, which matters when the person holding the phone is different every shift.",
      caveat: "There is no offline queue on day one, and your architecture already admits it. A loading dock is exactly where wifi drops, and when it does, intake stops. Building it as a PWA — a web page the phone can keep on its home screen — does not make it work offline by itself, but it is the only starting point that lets you add an offline queue later without rewriting the screen the volunteer uses.",
      prompt: "Explain React, Vite and what a PWA is to me like I have never built a web page, using my Pantry Router volunteer phone screen as the example. What happens on that screen between photographing a case label and seeing a dock number?" },

    { id: "board", group: "touch", component: "Staff Review Board",
      tech: "React + Vite (same codebase, staff-only routes)", fit: "great",
      why: "The desk screen shows the label photo beside the reading the system got, so it should be built from the same pieces and the same type definitions as the phone — one project to run, not two.",
      prompt: "Explain how I would build my Pantry Router Staff Review Board in the same React codebase as the volunteer phone screen. How do I stop a screen for two staff and a screen for rotating volunteers turning into one confusing app?" },

    /* ---------------- things you write ---------------- */
    { id: "api", group: "write", component: "Intake API",
      tech: "Node.js + Express + TypeScript", fit: "great",
      why: "Its whole job is to file the photo, write down that a pallet arrived and answer the phone in the same breath, and Express is the smallest well-worn thing that does exactly that — with TypeScript, which checks your code's shapes before it runs, so the phone and the worker can never disagree about what a pallet is.",
      prompt: "Explain Node, Express and TypeScript to me like I am new to backend code, using my Pantry Router Intake API as the example. Why does it answer the phone before the label has actually been read?" },

    { id: "worker", group: "write", component: "Label Reading Worker",
      tech: "pg-boss worker (Node, same codebase)", fit: "great",
      why: "It takes one pallet off the waiting line at a time, sends the photo to be read, and retries a failure instead of losing it — and because it lives in the same project as the API, there is one thing to deploy and one definition of a reading.",
      prompt: "Explain how a background worker works, using my Pantry Router Label Reading Worker as the example. What should happen when the vision model times out on the fortieth photo of a truck?" },

    { id: "router", group: "write", component: "Routing Engine",
      tech: "Plain TypeScript — pure functions over SQL queries", fit: "great",
      why: "Your architecture is explicit that this decides by arithmetic and not opinion, so it should be ordinary readable code with no framework in the way — every number in the score stays one a staffer can look up and argue with.",
      prompt: "Help me write my Pantry Router Routing Engine as plain TypeScript functions. Given a food category, a case count and 40 pantries with standing requests, cold storage and daily movement figures, what does the scoring function actually look like?" },

    { id: "gate", group: "write", component: "Expiry Safety Gate",
      tech: "Zod + plain TypeScript, with a locked test suite in Vitest", fit: "great",
      why: "This is the one component allowed to return nothing, so it has to be boring — Zod, which checks a piece of data matches a shape you wrote down, proves there really is a date and a confidence score before any arithmetic runs, and the rest is if-statements you can read out loud to a funder.",
      prompt: "Explain Zod to me like I have never validated data before, using my Pantry Router Expiry Safety Gate as the example — what are the four checks the gate should run before it lets a pallet be assigned, and what would a test for each one look like?" },

    { id: "slip", group: "write", component: "Slip Renderer",
      tech: "node-thermal-printer (ESC/POS over the network)", fit: "good",
      why: "It speaks the receipt printer's own language, so an approved assignment turns into paper at the volunteer's station without anybody tapping print on anything.",
      caveat: "ESC/POS is a family of dialects, not one standard, so this component cannot be finished until the actual printer is chosen and sitting on the desk. Design the slip for 80mm paper and test it by reading it from across the warehouse — legibility at a distance is the entire point of the slip, and it is not something you can check on a laptop.",
      prompt: "Explain how a thermal receipt printer is driven from Node with ESC/POS, using my Pantry Router dock slip as the example. What does the layout look like on 80mm paper if a volunteer has to read it across a warehouse?" },

    /* ---------------- things you store ---------------- */
    { id: "queue", group: "store", component: "Photo Queue",
      tech: "pg-boss — the queue lives inside PostgreSQL", fit: "great",
      why: "Sixty photos arriving in ten minutes become an orderly line worked through one at a time, and putting that line inside the database you already run means one thing to back up instead of two.",
      prompt: "Compare pg-boss against Redis with BullMQ for my Pantry Router Photo Queue. Sixty photos arrive in ten minutes and then nothing for an hour, and two people maintain the whole system — which should I pick and what am I giving up?" },

    { id: "pg", group: "store", component: "Postgres",
      tech: "PostgreSQL 16", fit: "great",
      why: "Every pallet, every reading, every assignment and every override lives here, which is precisely what you query when a funder asks where the donated food went.",
      prompt: "Explain PostgreSQL to me like I am new to databases, using my Pantry Router project as the example. What tables would I actually have for pallets, readings, assignments and overrides?" },

    { id: "dir", group: "store", component: "Pantry Directory",
      tech: "PostgreSQL tables, edited through the Staff Review Board", fit: "good",
      why: "The 40 pantries, what each has standing requests for, whether it has refrigeration and how fast it moves each kind of food all belong in the same database as the decisions they produce, so a routing choice and the numbers behind it can be read side by side.",
      caveat: "Your architecture already admits the most important column here is a guess: how fast a pantry moves a category is typed in by hand at setup and is not learned from real pickups until phase 4. Until then the safety buffer is doing more work than the ranking is. Build the edit screen in phase 2 rather than phase 4, and record who changed a throughput number and when — otherwise you will never be able to explain why a routing decision changed between two trucks.",
      prompt: "Design the Pantry Directory tables for my Pantry Router — 40 pantries, standing requests by food category, cold storage, maximum intake and daily movement figures. How do I keep a history of who changed a throughput number and when?" },

    { id: "photos", group: "store", component: "Photo Storage",
      tech: "Cloudflare R2 (S3-compatible object storage)", fit: "good",
      why: "The label photographs are both what the reader works from and the evidence a staffer looks at when they disagree with a reading, so they need somewhere cheap and durable that is not the single machine everything else runs on.",
      caveat: "Your architecture says every assignment and override is kept indefinitely, and these photos are what makes that record mean anything in a funder audit or a disagreement about a reading. \"Keep forever\" is a bill that grows quietly and a decision nobody revisits — set a retention rule and a lifecycle policy on day one, and decide explicitly whether a photo outlives the pallet it belongs to.",
      prompt: "Explain object storage to me like I am new to it, using my Pantry Router label photographs as the example. These photos are the evidence in a funder audit — what retention and backup rules should I set on day one?" },

    /* ---------------- things you depend on ---------------- */
    { id: "vision", group: "depend", component: "Vision Model API",
      tech: "Claude — claude-sonnet-5, returning structured fields", fit: "careful",
      why: "Reading a product name, a pack size and an expiry date off a case photographed at an angle through shrink wrap is exactly the job this model family is reliable at, and it can hand back each field with the exact text it read and how sure it is.",
      caveat: "This is where the whole day-one promise actually lives. The gate does not check an expiry date — it checks a confidence number a model produced about a date it read through plastic, and a model that is confidently wrong about a year is the one failure this design cannot see from the inside. Before phase 2 starts, photograph two hundred real cases in your own warehouse lighting, hand-label what each one says, and measure how often a high confidence score is wrong. Set the gate's threshold from that measurement. If you cannot produce that number, you do not yet know whether the system is safe, no matter how much of it is built.",
      prompt: "Explain how I would call the Claude API to read a case label photo for my Pantry Router, where the product, pack size and expiry date each come back with the exact text the model read and a confidence score — what does that request look like, and how would I measure whether the confidence score can be trusted?" },

    { id: "sms", group: "depend", component: "SMS Service",
      tech: "Twilio Programmable Messaging", fit: "careful",
      why: "It sends the pantry coordinator the text saying a pallet is theirs and the date it has to be out the door by, which is the only notice a coordinator driving a forklift will actually see.",
      caveat: "Two separate problems, both outside your code. First, US carriers require A2P 10DLC registration — a brand and campaign approval that takes weeks and is not yours to schedule. Start it in week one even though SMS does not land until phase 3, or phase 3 waits in somebody else's queue. Second, a text that silently fails to deliver means a pallet nobody is expecting sits on a dock burning the exact margin the gate just protected. Take Twilio's delivery-status callbacks, store the delivery state on the assignment, and put undelivered texts on the Staff Review Board as something to chase — not in a log file.",
      prompt: "Explain sending SMS with Twilio for my Pantry Router coordinator notifications, including what A2P 10DLC registration is and how long it takes. How do I make sure a pallet is never left unclaimed because a text quietly failed to deliver?" },

    { id: "printer", group: "depend", component: "Dock Printer",
      tech: "Epson TM-T20III (networked thermal, ESC/POS)", fit: "careful",
      why: "It is the one part of this system a volunteer physically carries with the pallet, and a well-worn networked thermal printer is the cheapest hardware that keeps working in a warehouse.",
      caveat: "Your architecture names this exactly right: hardware nobody controls, which jams and runs out of paper in the middle of a truck. The failure to design for is not the jam — it is a jam being mistaken for a pallet that was never assigned. The assignment must be valid whether or not paper came out, the slip must be re-printable from both the phone and the board, and a printer that has gone offline must show up on a screen rather than be discovered by a volunteer standing at a silent machine.",
      prompt: "Design the failure path for my Pantry Router dock printer. The assignment is already written and the coordinator already has a text, but the printer jammed — what does the volunteer see, and how do they get the slip?" },

    /* ---------------- things the data flow needs ---------------- */
    { id: "auth", group: "flow", component: "Staff sign-in and station access",
      tech: "OpenID Connect via openid-client (staff use the food bank's existing Google or Microsoft account)", fit: "good",
      why: "Every override has to record who decided and why, so the two staff need real identities — and the cheapest real identity is the work account they already sign into every morning.",
      caveat: "Two different problems are hiding in this one row and they must never touch. Staff sign in as themselves. Volunteers do not sign in at all — the dock phone is scoped by a station code in a link, which is a password in a URL and will be screenshotted, texted around and taped to a wall. Rotate it per shift, scope it to one dock, and make sure a station link can never reach the Staff Review Board. You also cannot finish this row until the food bank tells you whether they run Google Workspace or Microsoft 365.",
      prompt: "Explain OpenID Connect to me like I am not technical, using my Pantry Router staff sign-in as the example. My volunteers are not identified at all and use a station link instead — how do I keep those two access paths from leaking into each other?" },

    { id: "capture", group: "flow", component: "Photo capture and shrinking on the phone",
      tech: "The browser's capture attribute plus browser-image-compression", fit: "good",
      why: "The phone opens its camera straight from the web page and shrinks the picture before it goes anywhere, so sixty photos in ten minutes do not pile up behind warehouse wifi.",
      caveat: "How far you shrink is a safety decision disguised as a performance one. The expiry date is the smallest print on the case; compress the photo too hard and the model reads a blur, returns a confident wrong date, and nothing downstream can tell the difference. Fix a floor — around 1600 pixels on the long edge — validate it against the same two hundred test photos you calibrate the model with, and never tune it for upload speed alone.",
      prompt: "Explain how a phone web page opens the camera and shrinks a photo before uploading, using my Pantry Router label capture as the example. How small can I make the image before the expiry date stops being readable?" },

    { id: "category", group: "flow", component: "Food-category normalisation",
      tech: "PostgreSQL pg_trgm + a staff-editable synonym table", fit: "careful",
      why: "GRN BEANS 6/#10 and Green Beans, canned, No. 10 have to land on the same shelf in the directory, and trigram matching — comparing three-letter chunks of text — plus a list staff can edit is the version a human can correct the moment it is wrong.",
      caveat: "This step is named in your data flow and in none of your components, and it is the quietest way this system misroutes food. Nobody has written the synonym list yet, and every new donor arrives with abbreviations it does not contain. A miss here does not look like an error — it looks like a pallet confidently routed to a pantry that never asked for that food, which the expiry gate will happily approve because the date was perfectly readable. Make \"no confident category match\" a hold reason that goes to the desk, exactly like an unreadable date. Never let it fall back to the nearest guess.",
      prompt: "Explain pg_trgm and fuzzy text matching to me like I am not technical, using my Pantry Router food categories as the example. How should GRN BEANS 6/#10 find the canned green beans category, and what should happen when it matches nothing well?" },

    { id: "host", group: "flow", component: "Hosting and runtime",
      tech: "Docker Compose on a single VPS", fit: "good",
      why: "One warehouse, one worker pool, a few hundred label photos a day — one machine running one file is something two people can hold in their heads, and your architecture is openly not a multi-site design.",
      caveat: "This assumes somebody keeps that machine patched and has restored a backup at least once. On a two-person food bank team that person usually does not exist, and an unpatched box holding your funder audit trail is a worse problem than a slightly larger monthly bill. If nobody owns the server, use a managed host — Render or Fly.io — and pay for not having one.",
      prompt: "Explain Docker and Docker Compose to me like I have never deployed anything, using my Pantry Router as the example. Nobody at the food bank is a sysadmin — should I be running a VPS at all, and what exactly would I be responsible for?" }
  ],

  runsOn: [
    { box: "The volunteer's phone and the desk PC", kind: "entry",
      items: ["Volunteer Phone App (browser)", "Staff Review Board (browser)", "Camera capture and shrink"] },
    { box: "One machine you rent — a single Docker Compose file", kind: "build",
      items: ["Intake API (Express + TypeScript)", "Label Reading Worker (pg-boss)", "Routing Engine", "Expiry Safety Gate", "Slip Renderer", "PostgreSQL 16 — pallets, queue, directory"] },
    { box: "Somebody else's — internet or warehouse LAN", kind: "external",
      items: ["Claude vision API", "Twilio SMS", "Cloudflare R2 photos", "Epson dock printer (LAN)"] }
  ],

  learn: [
    { order: 1, when: "First", what: "TypeScript and Node", why: "Every part of this system you write is in it — the API, the worker, the routing engine and the gate are all one language on purpose." },
    { order: 2, when: "First", what: "PostgreSQL and SQL", why: "The pallets, the pantries, the waiting line and the audit trail a funder reads all live in one database, so this is the piece that touches everything." },
    { order: 3, when: "Next", what: "React", why: "Two screens, but they are the only surfaces a volunteer or a staffer ever sees, and one of them is used one-handed beside a truck." },
    { order: 4, when: "Next", what: "Background jobs", why: "The moment you understand why the phone does not wait for the label to be read, the whole shape of the architecture clicks." },
    { order: 5, when: "Later", what: "The Claude vision API", why: "One model call in the entire system, but it is the one the day-one promise rests on — learn it properly, and learn how to measure it." },
    { order: 6, when: "Later", what: "Docker Compose", why: "Only needed the week you actually deploy, and by then everything else will already run on your laptop." }
  ],

  alternatives: [
    { instead: "pg-boss for the queue", could: "Redis + BullMQ",
      whyNot: "Better tooling and genuinely built for bursts like a truck arriving — but it is a second database to run, secure and back up for a queue that idles most of the day, on a team with nobody to run it." },
    { instead: "Node and TypeScript", could: "Python + FastAPI",
      whyNot: "Perfectly good, and better if your team is already Python-first — but it splits the project into two languages and the contract between the API and the worker stops being checked automatically." },
    { instead: "Claude for reading labels", could: "Google Document AI or Tesseract OCR",
      whyNot: "Cheaper per page and excellent on flat printed text, but a shrink-wrapped case photographed at an angle is exactly where plain OCR hands you characters without knowing which of them is a date." },
    { instead: "A printed dock slip", could: "A digital slip on the phone screen",
      whyNot: "No paper to run out — but nothing travels with the pallet once the phone walks away, and a warehouse floor runs on things you can staple to a load." },
    { instead: "Cloudflare R2", could: "Photos on the VPS disk",
      whyNot: "One less account to open, right up until the disk fills or fails and your entire funder audit trail goes with it." },
    { instead: "Twilio SMS", could: "Email to coordinators",
      whyNot: "Free, instant to set up and no carrier registration — but coordinators are on a forklift, not in an inbox, and the whole point is a message they see before the pallet arrives." },
    { instead: "A single VPS", could: "A managed platform (Render, Fly.io)",
      whyNot: "Less to administer and no patching, at a higher monthly bill — this is the right answer instead if nobody at the food bank owns a server." }
  ],

  decisions: [
    { decision: "PostgreSQL", lock: "low",
      undo: "Standard SQL and a standard schema — the data moves to anything else that speaks SQL." },
    { decision: "pg-boss for the queue", lock: "low",
      undo: "Swapping to Redis and BullMQ is a contained change in the worker's entry point; nothing else in the system knows how the queue is implemented." },
    { decision: "Cloudflare R2 for photos", lock: "low",
      undo: "S3-compatible, so the code barely changes — you are moving files, not rewriting anything." },
    { decision: "Claude for label reading", lock: "medium",
      undo: "The pipeline stays exactly as it is, but the prompt, the structured fields and every confidence threshold in the gate need re-measuring against a new model." },
    { decision: "ESC/POS receipt printing", lock: "medium",
      undo: "Ties you to one printer family; changing means new hardware on every dock and a re-tested slip layout." },
    { decision: "Twilio and 10DLC registration", lock: "medium",
      undo: "The code is a small change, but carrier registration is per-provider and you would queue for approval all over again." },
    { decision: "Node + TypeScript everywhere", lock: "high",
      undo: "This is the language the API, the worker, the routing engine and the gate are all written in — changing it is rewriting the system, not migrating it." },
    { decision: "An assignment is a decision, not an offer", lock: "high",
      undo: "This is your architecture's own open question. If a pantry can decline, you need a timeout, two-way SMS, a re-routing loop, a second pass through the gate on a smaller margin, and a slip that cannot print until somebody accepts — roughly half the system." }
  ],

  notCovered: [
    { thing: "What any of this costs", note: "No hosting, API, SMS or storage prices are estimated here, because none were measured. The two that grow with use are the vision API and SMS." },
    { thing: "Whether the model can read your labels", note: "The single most important unknown in this document. It is a measurement you have to take in your own warehouse, and no technology choice substitutes for it." },
    { thing: "Cold-chain compliance", note: "Your architecture puts temperature tracking out of scope, and nothing in this stack changes that — checking a pantry has refrigeration is not proving a chain held." },
    { thing: "Non-English labels and a non-English volunteer interface", note: "Both are excluded by the architecture and both are likely needed sooner than is comfortable. The stack above would need a translation layer and an OCR path that does not assume Latin script." },
    { thing: "Offline operation at the dock", note: "The PWA choice keeps the door open; it does not walk through it. An offline queue is design work nobody has done yet." },
    { thing: "Whether a pantry can decline a pallet", note: "Every recommendation above assumes it cannot. That is the architecture's open question, and answering it yes changes the shape of the system, not just the code." },
    { thing: "How long any of it takes to build", note: "That is the Build Order section of the architecture, not this document." },
    { thing: "Exact version pins", note: "Only major versions are named. Pin them for real the week you actually start." }
  ],

  /* Figure captions — kept here so no interpretation is written twice. */
  figures: {
    fitbar: "green is settled, amber has a caveat you should read, red is where this plan is most likely to hurt. All four reds sit outside the code you write.",
    ccbar: "green is settled, amber has a caveat, red is where this plan is most likely to hurt.",
    stacklayers: "one language runs the whole middle band. Almost every amber and every red sits in the bottom two bands — the parts you depend on and the parts your data flow needs, rather than the parts you write.",
    fitbar2: "a stack that came back all green would be a stack nobody stress-tested. Four reds out of eighteen is roughly what an honest plan looks like for a system whose promise depends on reading a date off a photograph.",
    topo: "everything in the middle box is one Docker Compose file on one machine. The boxes either side are the parts you do not control — a phone in a volunteer's hand, and four services and one printer that belong to somebody else.",
    ladder: "you do not need all of this at once. The two greens carry most of the project; the greys can wait until the week you need them.",
    alts: "the recommendations above are not the only workable answers — they are the ones that fit one warehouse, two staff and a burst of sixty photos. Here is what was weighed against them.",
    locks: "only two rows are genuinely hard to reverse, and one of them is not a technology at all — it is whether a pantry is allowed to say no. Everything else can be swapped later without rewriting the project.",
    tree: "this stack site sits beside the architecture it was derived from, and shares its shape."
  },

  runsNote: {
    title: "Why one machine",
    text: "Your architecture puts the whole system at one warehouse, one worker pool and one printer per dock — a few hundred label photos a day, arriving in bursts when a truck backs in. At that size, splitting services across managed cloud products adds bills, dashboards and failure modes without removing a single real constraint. One machine running one Compose file is something two people can hold in their heads, and nothing in this stack is tied to it, so moving to a managed host later is a deployment change rather than a rewrite."
  },

  starters: ["what is risky", "can the model read a date", "pg-boss or redis", "what runs where", "learn first"]
};
