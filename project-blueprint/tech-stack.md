# Pantry Router — Recommended Tech Stack

_Generated 2026-08-06 · derived from [`architecture.md`](architecture.md)_

**Fit ratings:** 🟢 great fit · 🟡 good fit, with a caveat · 🔴 consider carefully

**This stack: 7 🟢 · 7 🟡 · 4 🔴** — 18 rows: 14 architecture components + 4 the data flow needs.

> A rating is about *this* project — one warehouse, 40 partner pantries, two staff and rotating
> volunteers, a few hundred label photos a day arriving in bursts when a truck backs in.
> A 🔴 does not mean "bad technology". It means this is where the plan is most likely to hurt you,
> and you should read that row twice.

---

## The headline

Almost everything you write here is deliberately boring, and one language runs all of it. The risk is
not in the frameworks — it is that the day-one promise, never route food that will expire first, rests
entirely on numbers that come out of a photograph. Four rows are red, and all four are places where
something outside your code decides whether a pallet is routed safely: a model's confidence about a
date read through shrink wrap, a carrier's willingness to deliver a text, a printer's paper, and a
list of food-label abbreviations nobody has written yet.

---

## The stack, component by component

### 🖥️ Things a person touches

| Component | Recommendation | Fit | Why, in one sentence | Paste this to learn more |
|---|---|---|---|---|
| **Volunteer Phone App** | **React + Vite, kept on the phone as a web app (PWA)** | 🟡 | One screen a rotating volunteer opens from a station link — no app store, no install, and it updates the second you deploy, which matters when the person holding the phone is different every shift. | `Explain React, Vite and what a PWA is to me like I have never built a web page, using my Pantry Router volunteer phone screen as the example. What happens on that screen between photographing a case label and seeing a dock number?` |
| **Staff Review Board** | **React + Vite (same codebase, staff-only routes)** | 🟢 | The desk screen shows the label photo beside the reading the system got, so it should be built from the same pieces and the same type definitions as the phone — one project to run, not two. | `Explain how I would build my Pantry Router Staff Review Board in the same React codebase as the volunteer phone screen. How do I stop a screen for two staff and a screen for rotating volunteers turning into one confusing app?` |

### ⚙️ Things you write

| Component | Recommendation | Fit | Why, in one sentence | Paste this to learn more |
|---|---|---|---|---|
| **Intake API** | **Node.js + Express + TypeScript** | 🟢 | Its whole job is to file the photo, write down that a pallet arrived and answer the phone in the same breath, and Express is the smallest well-worn thing that does exactly that — with TypeScript, which checks your code's shapes before it runs, so the phone and the worker can never disagree about what a pallet is. | `Explain Node, Express and TypeScript to me like I am new to backend code, using my Pantry Router Intake API as the example. Why does it answer the phone before the label has actually been read?` |
| **Label Reading Worker** | **pg-boss worker (Node, same codebase)** | 🟢 | It takes one pallet off the waiting line at a time, sends the photo to be read, and retries a failure instead of losing it — and because it lives in the same project as the API, there is one thing to deploy and one definition of a reading. | `Explain how a background worker works, using my Pantry Router Label Reading Worker as the example. What should happen when the vision model times out on the fortieth photo of a truck?` |
| **Routing Engine** | **Plain TypeScript — pure functions over SQL queries** | 🟢 | Your architecture is explicit that this decides by arithmetic and not opinion, so it should be ordinary readable code with no framework in the way — every number in the score stays one a staffer can look up and argue with. | `Help me write my Pantry Router Routing Engine as plain TypeScript functions. Given a food category, a case count and 40 pantries with standing requests, cold storage and daily movement figures, what does the scoring function actually look like?` |
| **Expiry Safety Gate** | **Zod + plain TypeScript, with a locked test suite in Vitest** | 🟢 | This is the one component allowed to return nothing, so it has to be boring — Zod, which checks a piece of data matches a shape you wrote down, proves there really is a date and a confidence score before any arithmetic runs, and the rest is if-statements you can read out loud to a funder. | `Explain Zod to me like I have never validated data before, using my Pantry Router Expiry Safety Gate as the example — what are the four checks the gate should run before it lets a pallet be assigned, and what would a test for each one look like?` |
| **Slip Renderer** | **`node-thermal-printer` (ESC/POS over the network)** | 🟡 | It speaks the receipt printer's own language, so an approved assignment turns into paper at the volunteer's station without anybody tapping print on anything. | `Explain how a thermal receipt printer is driven from Node with ESC/POS, using my Pantry Router dock slip as the example. What does the layout look like on 80mm paper if a volunteer has to read it across a warehouse?` |

### 🗄️ Things you store

| Component | Recommendation | Fit | Why, in one sentence | Paste this to learn more |
|---|---|---|---|---|
| **Photo Queue** | **pg-boss — the queue lives inside PostgreSQL** | 🟢 | Sixty photos arriving in ten minutes become an orderly line worked through one at a time, and putting that line inside the database you already run means one thing to back up instead of two. | `Compare pg-boss against Redis with BullMQ for my Pantry Router Photo Queue. Sixty photos arrive in ten minutes and then nothing for an hour, and two people maintain the whole system — which should I pick and what am I giving up?` |
| **Postgres** | **PostgreSQL 16** | 🟢 | Every pallet, every reading, every assignment and every override lives here, which is precisely what you query when a funder asks where the donated food went. | `Explain PostgreSQL to me like I am new to databases, using my Pantry Router project as the example. What tables would I actually have for pallets, readings, assignments and overrides?` |
| **Pantry Directory** | **PostgreSQL tables, edited through the Staff Review Board** | 🟡 | The 40 pantries, what each has standing requests for, whether it has refrigeration and how fast it moves each kind of food all belong in the same database as the decisions they produce, so a routing choice and the numbers behind it can be read side by side. | `Design the Pantry Directory tables for my Pantry Router — 40 pantries, standing requests by food category, cold storage, maximum intake and daily movement figures. How do I keep a history of who changed a throughput number and when?` |
| **Photo Storage** | **Cloudflare R2 (S3-compatible object storage)** | 🟡 | The label photographs are both what the reader works from and the evidence a staffer looks at when they disagree with a reading, so they need somewhere cheap and durable that is not the single machine everything else runs on. | `Explain object storage to me like I am new to it, using my Pantry Router label photographs as the example. These photos are the evidence in a funder audit — what retention and backup rules should I set on day one?` |

### 🔌 Things you depend on

| Component | Recommendation | Fit | Why, in one sentence | Paste this to learn more |
|---|---|---|---|---|
| **Vision Model API** | **Claude — `claude-sonnet-5`, returning structured fields** | 🔴 | Reading a product name, a pack size and an expiry date off a case photographed at an angle through shrink wrap is exactly the job this model family is reliable at, and it can hand back each field with the exact text it read and how sure it is. | `Explain how I would call the Claude API to read a case label photo for my Pantry Router, where the product, pack size and expiry date each come back with the exact text the model read and a confidence score — what does that request look like, and how would I measure whether the confidence score can be trusted?` |
| **SMS Service** | **Twilio Programmable Messaging** | 🔴 | It sends the pantry coordinator the text saying a pallet is theirs and the date it has to be out the door by, which is the only notice a coordinator driving a forklift will actually see. | `Explain sending SMS with Twilio for my Pantry Router coordinator notifications, including what A2P 10DLC registration is and how long it takes. How do I make sure a pallet is never left unclaimed because a text quietly failed to deliver?` |
| **Dock Printer** | **Epson TM-T20III (networked thermal, ESC/POS)** | 🔴 | It is the one part of this system a volunteer physically carries with the pallet, and a well-worn networked thermal printer is the cheapest hardware that keeps working in a warehouse. | `Design the failure path for my Pantry Router dock printer. The assignment is already written and the coordinator already has a text, but the printer jammed — what does the volunteer see, and how do they get the slip?` |

### 🔧 Things the data flow needs that the component list doesn't name

| Need | Recommendation | Fit | Why, in one sentence | Paste this to learn more |
|---|---|---|---|---|
| **Staff sign-in and station access** _(flow steps 1 & 10)_ | **OpenID Connect via `openid-client`** — staff use the food bank's existing Google or Microsoft account | 🟡 | Every override has to record who decided and why, so the two staff need real identities — and the cheapest real identity is the work account they already sign into every morning. | `Explain OpenID Connect to me like I am not technical, using my Pantry Router staff sign-in as the example. My volunteers are not identified at all and use a station link instead — how do I keep those two access paths from leaking into each other?` |
| **Photo capture and shrinking on the phone** _(flow steps 2–3)_ | **The browser's `capture` attribute + `browser-image-compression`** | 🟡 | The phone opens its camera straight from the web page and shrinks the picture before it goes anywhere, so sixty photos in ten minutes do not pile up behind warehouse wifi. | `Explain how a phone web page opens the camera and shrinks a photo before uploading, using my Pantry Router label capture as the example. How small can I make the image before the expiry date stops being readable?` |
| **Food-category normalisation** _(flow step 6)_ | **PostgreSQL `pg_trgm` + a staff-editable synonym table** | 🔴 | GRN BEANS 6/#10 and Green Beans, canned, No. 10 have to land on the same shelf in the directory, and trigram matching — comparing three-letter chunks of text — plus a list staff can edit is the version a human can correct the moment it is wrong. | `Explain pg_trgm and fuzzy text matching to me like I am not technical, using my Pantry Router food categories as the example. How should GRN BEANS 6/#10 find the canned green beans category, and what should happen when it matches nothing well?` |
| **Hosting and runtime** | **Docker Compose on a single VPS** | 🟡 | One warehouse, one worker pool, a few hundred label photos a day — one machine running one file is something two people can hold in their heads, and your architecture is openly not a multi-site design. | `Explain Docker and Docker Compose to me like I have never deployed anything, using my Pantry Router as the example. Nobody at the food bank is a sysadmin — should I be running a VPS at all, and what exactly would I be responsible for?` |

---

## ⚠️ Read these rows twice

Every 🟡 and 🔴 row above has a caveat. Here they are in full, out of the table so they cannot be
skimmed past.

### 🔴 Vision Model API — Claude

> This is where the whole day-one promise actually lives. The gate does not check an expiry date — it
> checks a **confidence number a model produced about a date it read through plastic**, and a model
> that is confidently wrong about a year is the one failure this design cannot see from the inside.
>
> Before phase 2 starts, photograph two hundred real cases in your own warehouse lighting, hand-label
> what each one says, and measure how often a high confidence score is wrong. **Set the gate's
> threshold from that measurement.** If you cannot produce that number, you do not yet know whether
> the system is safe, no matter how much of it is built.

### 🔴 SMS Service — Twilio

> Two separate problems, both outside your code. First, US carriers require A2P 10DLC registration — a
> brand and campaign approval that takes weeks and is not yours to schedule. Start it in week one even
> though SMS does not land until phase 3, or phase 3 waits in somebody else's queue.
>
> Second, a text that silently fails to deliver means a pallet nobody is expecting sits on a dock
> burning the exact margin the gate just protected. Take Twilio's delivery-status callbacks, store the
> delivery state on the assignment, and put undelivered texts on the Staff Review Board as something to
> chase — not in a log file.

### 🔴 Dock Printer — Epson TM-T20III

> Your architecture names this exactly right: hardware nobody controls, which jams and runs out of
> paper in the middle of a truck. The failure to design for is not the jam — it is **a jam being
> mistaken for a pallet that was never assigned**.
>
> The assignment must be valid whether or not paper came out, the slip must be re-printable from both
> the phone and the board, and a printer that has gone offline must show up on a screen rather than be
> discovered by a volunteer standing at a silent machine.

### 🔴 Food-category normalisation — `pg_trgm`

> This step is named in your data flow and in none of your components, and it is the quietest way this
> system misroutes food. Nobody has written the synonym list yet, and every new donor arrives with
> abbreviations it does not contain.
>
> A miss here does not look like an error — it looks like **a pallet confidently routed to a pantry
> that never asked for that food**, which the expiry gate will happily approve because the date was
> perfectly readable. Make "no confident category match" a hold reason that goes to the desk, exactly
> like an unreadable date. Never let it fall back to the nearest guess.

### 🟡 Volunteer Phone App — React + Vite as a PWA

> There is no offline queue on day one, and your architecture already admits it. A loading dock is
> exactly where wifi drops, and when it does, intake stops. Building it as a PWA — a web page the phone
> can keep on its home screen — does not make it work offline by itself, but it is the only starting
> point that lets you add an offline queue later without rewriting the screen the volunteer uses.

### 🟡 Slip Renderer — `node-thermal-printer`

> ESC/POS is a family of dialects, not one standard, so this component cannot be finished until the
> actual printer is chosen and sitting on the desk. Design the slip for 80mm paper and test it by
> reading it from across the warehouse — legibility at a distance is the entire point of the slip, and
> it is not something you can check on a laptop.

### 🟡 Pantry Directory — PostgreSQL tables

> Your architecture already admits the most important column here is a guess: how fast a pantry moves a
> category is typed in by hand at setup and is not learned from real pickups until phase 4. Until then
> **the safety buffer is doing more work than the ranking is.** Build the edit screen in phase 2 rather
> than phase 4, and record who changed a throughput number and when — otherwise you will never be able
> to explain why a routing decision changed between two trucks.

### 🟡 Photo Storage — Cloudflare R2

> Your architecture says every assignment and override is kept indefinitely, and these photos are what
> makes that record mean anything in a funder audit or a disagreement about a reading. "Keep forever"
> is a bill that grows quietly and a decision nobody revisits — set a retention rule and a lifecycle
> policy on day one, and decide explicitly whether a photo outlives the pallet it belongs to.

### 🟡 Staff sign-in and station access — OpenID Connect

> Two different problems are hiding in this one row and they must never touch. Staff sign in as
> themselves. Volunteers do not sign in at all — the dock phone is scoped by a station code in a link,
> which is **a password in a URL** and will be screenshotted, texted around and taped to a wall. Rotate
> it per shift, scope it to one dock, and make sure a station link can never reach the Staff Review
> Board. You also cannot finish this row until the food bank tells you whether they run Google
> Workspace or Microsoft 365.

### 🟡 Photo capture and shrinking — `browser-image-compression`

> How far you shrink is a safety decision disguised as a performance one. The expiry date is the
> smallest print on the case; compress the photo too hard and the model reads a blur, returns a
> confident wrong date, and nothing downstream can tell the difference. Fix a floor — around 1600
> pixels on the long edge — validate it against the same two hundred test photos you calibrate the
> model with, and never tune it for upload speed alone.

### 🟡 Hosting and runtime — Docker Compose on a VPS

> This assumes somebody keeps that machine patched and has restored a backup at least once. On a
> two-person food bank team that person usually does not exist, and an unpatched box holding your
> funder audit trail is a worse problem than a slightly larger monthly bill. If nobody owns the server,
> use a managed host — Render or Fly.io — and pay for not having one.

---

## Copy-ready prompts

Every prompt from the tables above, in one place. Each already names Pantry Router, so the answer is
about your system rather than a textbook.

| Technology | Prompt |
|---|---|
| React + Vite (phone) | `Explain React, Vite and what a PWA is to me like I have never built a web page, using my Pantry Router volunteer phone screen as the example. What happens on that screen between photographing a case label and seeing a dock number?` |
| React + Vite (staff board) | `Explain how I would build my Pantry Router Staff Review Board in the same React codebase as the volunteer phone screen. How do I stop a screen for two staff and a screen for rotating volunteers turning into one confusing app?` |
| Node + Express + TypeScript | `Explain Node, Express and TypeScript to me like I am new to backend code, using my Pantry Router Intake API as the example. Why does it answer the phone before the label has actually been read?` |
| pg-boss worker | `Explain how a background worker works, using my Pantry Router Label Reading Worker as the example. What should happen when the vision model times out on the fortieth photo of a truck?` |
| Plain TypeScript (routing) | `Help me write my Pantry Router Routing Engine as plain TypeScript functions. Given a food category, a case count and 40 pantries with standing requests, cold storage and daily movement figures, what does the scoring function actually look like?` |
| Zod + Vitest | `Explain Zod to me like I have never validated data before, using my Pantry Router Expiry Safety Gate as the example — what are the four checks the gate should run before it lets a pallet be assigned, and what would a test for each one look like?` |
| node-thermal-printer | `Explain how a thermal receipt printer is driven from Node with ESC/POS, using my Pantry Router dock slip as the example. What does the layout look like on 80mm paper if a volunteer has to read it across a warehouse?` |
| pg-boss (the queue) | `Compare pg-boss against Redis with BullMQ for my Pantry Router Photo Queue. Sixty photos arrive in ten minutes and then nothing for an hour, and two people maintain the whole system — which should I pick and what am I giving up?` |
| PostgreSQL 16 | `Explain PostgreSQL to me like I am new to databases, using my Pantry Router project as the example. What tables would I actually have for pallets, readings, assignments and overrides?` |
| Pantry Directory tables | `Design the Pantry Directory tables for my Pantry Router — 40 pantries, standing requests by food category, cold storage, maximum intake and daily movement figures. How do I keep a history of who changed a throughput number and when?` |
| Cloudflare R2 | `Explain object storage to me like I am new to it, using my Pantry Router label photographs as the example. These photos are the evidence in a funder audit — what retention and backup rules should I set on day one?` |
| Claude vision API | `Explain how I would call the Claude API to read a case label photo for my Pantry Router, where the product, pack size and expiry date each come back with the exact text the model read and a confidence score — what does that request look like, and how would I measure whether the confidence score can be trusted?` |
| Twilio SMS | `Explain sending SMS with Twilio for my Pantry Router coordinator notifications, including what A2P 10DLC registration is and how long it takes. How do I make sure a pallet is never left unclaimed because a text quietly failed to deliver?` |
| Epson dock printer | `Design the failure path for my Pantry Router dock printer. The assignment is already written and the coordinator already has a text, but the printer jammed — what does the volunteer see, and how do they get the slip?` |
| OpenID Connect | `Explain OpenID Connect to me like I am not technical, using my Pantry Router staff sign-in as the example. My volunteers are not identified at all and use a station link instead — how do I keep those two access paths from leaking into each other?` |
| browser-image-compression | `Explain how a phone web page opens the camera and shrinks a photo before uploading, using my Pantry Router label capture as the example. How small can I make the image before the expiry date stops being readable?` |
| pg_trgm | `Explain pg_trgm and fuzzy text matching to me like I am not technical, using my Pantry Router food categories as the example. How should GRN BEANS 6/#10 find the canned green beans category, and what should happen when it matches nothing well?` |
| Docker Compose | `Explain Docker and Docker Compose to me like I have never deployed anything, using my Pantry Router as the example. Nobody at the food bank is a sysadmin — should I be running a VPS at all, and what exactly would I be responsible for?` |

---

## What to learn first

You do not need all of this at once. In order:

1. **TypeScript and Node** — Every part of this system you write is in it — the API, the worker, the routing engine and the gate are all one language on purpose.
2. **PostgreSQL and SQL** — The pallets, the pantries, the waiting line and the audit trail a funder reads all live in one database, so this is the piece that touches everything.
3. **React** — Two screens, but they are the only surfaces a volunteer or a staffer ever sees, and one of them is used one-handed beside a truck.
4. **Background jobs** — The moment you understand why the phone does not wait for the label to be read, the whole shape of the architecture clicks.
5. **The Claude vision API** — One model call in the entire system, but it is the one the day-one promise rests on — learn it properly, and learn how to measure it.
6. **Docker Compose** — Only needed the week you actually deploy, and by then everything else will already run on your laptop.

---

## Alternatives considered

| Instead of | You could use | Why not here |
|---|---|---|
| pg-boss for the queue | Redis + BullMQ | Better tooling and genuinely built for bursts like a truck arriving — but it is a second database to run, secure and back up for a queue that idles most of the day, on a team with nobody to run it. |
| Node and TypeScript | Python + FastAPI | Perfectly good, and better if your team is already Python-first — but it splits the project into two languages and the contract between the API and the worker stops being checked automatically. |
| Claude for reading labels | Google Document AI or Tesseract OCR | Cheaper per page and excellent on flat printed text, but a shrink-wrapped case photographed at an angle is exactly where plain OCR hands you characters without knowing which of them is a date. |
| A printed dock slip | A digital slip on the phone screen | No paper to run out — but nothing travels with the pallet once the phone walks away, and a warehouse floor runs on things you can staple to a load. |
| Cloudflare R2 | Photos on the VPS disk | One less account to open, right up until the disk fills or fails and your entire funder audit trail goes with it. |
| Twilio SMS | Email to coordinators | Free, instant to set up and no carrier registration — but coordinators are on a forklift, not in an inbox, and the whole point is a message they see before the pallet arrives. |
| A single VPS | A managed platform (Render, Fly.io) | Less to administer and no patching, at a higher monthly bill — this is the right answer instead if nobody at the food bank owns a server. |

---

## How hard each decision is to undo

| Decision | Reversibility | What it would cost to change later |
|---|---|---|
| PostgreSQL | **Low** | Standard SQL and a standard schema — the data moves to anything else that speaks SQL. |
| pg-boss for the queue | **Low** | Swapping to Redis and BullMQ is a contained change in the worker's entry point; nothing else in the system knows how the queue is implemented. |
| Cloudflare R2 for photos | **Low** | S3-compatible, so the code barely changes — you are moving files, not rewriting anything. |
| Claude for label reading | **Medium** | The pipeline stays exactly as it is, but the prompt, the structured fields and every confidence threshold in the gate need re-measuring against a new model. |
| ESC/POS receipt printing | **Medium** | Ties you to one printer family; changing means new hardware on every dock and a re-tested slip layout. |
| Twilio and 10DLC registration | **Medium** | The code is a small change, but carrier registration is per-provider and you would queue for approval all over again. |
| Node + TypeScript everywhere | **High** | This is the language the API, the worker, the routing engine and the gate are all written in — changing it is rewriting the system, not migrating it. |
| An assignment is a decision, not an offer | **High** | This is your architecture's own open question. If a pantry can decline, you need a timeout, two-way SMS, a re-routing loop, a second pass through the gate on a smaller margin, and a slip that cannot print until somebody accepts — roughly half the system. |

---

## What this document does not tell you

- **What any of this costs.** No hosting, API, SMS or storage prices are estimated here, because none were measured. The two that grow with use are the vision API and SMS.
- **Whether the model can read your labels.** The single most important unknown in this document. It is a measurement you have to take in your own warehouse, and no technology choice substitutes for it.
- **Cold-chain compliance.** Your architecture puts temperature tracking out of scope, and nothing in this stack changes that — checking a pantry has refrigeration is not proving a chain held.
- **Non-English labels and a non-English volunteer interface.** Both are excluded by the architecture and both are likely needed sooner than is comfortable. The stack above would need a translation layer and an OCR path that does not assume Latin script.
- **Offline operation at the dock.** The PWA choice keeps the door open; it does not walk through it. An offline queue is design work nobody has done yet.
- **Whether a pantry can decline a pallet.** Every recommendation above assumes it cannot. That is the architecture's open question, and answering it *yes* changes the shape of the system, not just the code.
- **How long any of it takes to build.** That is the Build Order section of the architecture, not this document.
- **Exact version pins.** Only major versions are named. Pin them for real the week you actually start.

---

## Which of these I am least confident about

Named plainly, because an all-🟢 stack would mean nobody stress-tested it:

1. **pg-boss over Redis + BullMQ.** A truck arriving is a burst, and bursts are exactly what BullMQ is built for. I chose fewer moving parts for a two-person team over better tooling — that trade is defensible, not obvious, and it is the row most likely to be reversed.
2. **The specific printer.** Recommending hardware without seeing the dock is a guess. The ESC/POS *approach* is right; the model number is a placeholder until somebody stands in the warehouse.
3. **Rating Twilio 🔴 rather than 🟡.** Twilio is excellent and the volume here is tiny. It is red because two things outside your control — carrier registration and silent non-delivery — can each break the day-one promise, not because of the technology.
4. **`claude-sonnet-5` rather than `claude-opus-5` for the label read.** Sonnet is the sensible default, but the calibration exercise in the Vision Model caveat is what should actually decide this, and it has not been run.

---

_The multi-page version of this document, with search, figures and copy buttons, is at
[`stack/index.html`](stack/index.html)._
