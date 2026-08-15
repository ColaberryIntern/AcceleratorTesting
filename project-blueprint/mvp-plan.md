# Advisor Gap Report — Week 1 MVP

_Generated 2026-08-06 · from [architecture.md](architecture.md) and [tech-stack.md](tech-stack.md)_

## The one question Week 1 answers

Can the model find a student's real skill gaps and quote the exact line of the job posting that proves each one — reliably enough that a working advisor believes the output?

Everything else in the architecture assumes the answer is yes. If it's no, no amount of queues, gates or SSO saves the idea.

## What you are building

- **One page with two big text boxes** — paste a résumé, paste a posting, press a button. *(Advisor Web App, stripped to a single screen.)*
- **One endpoint** that sends both to Claude and asks for two lists of skills, each entry carrying the line it came from. *(API + Report Pipeline Worker + LLM API, collapsed into one file.)*
- **The subtraction, on screen** — required minus demonstrated, rendered as a gap list where every gap shows its quote. *(The core of the pipeline.)*
- **Ten projects hardcoded in a JavaScript array**, tagged with the skills they teach. *(Skills Taxonomy + Project Catalog, faked.)*

That's it. Four things, one file each.

## What you are NOT building — and why that's safe

| Cut | Why it's safe to cut this week |
|---|---|
| **Job Queue** | It exists so an advisor isn't stuck watching a spinner. You are the only user this week and you can wait sixty seconds. |
| **Postgres** | Persistence proves nothing about extraction quality. Ten runs, ten browser tabs. |
| **pgvector + real taxonomy** | Matching phrasing to canonical skills is a solved-ish problem you can fake with ten hardcoded projects. It is not the risk. |
| **Object Storage + file upload** | Paste the text. Upload is plumbing; it has never been the thing that kills a product like this. |
| **College SSO** | It runs on your laptop. Nobody signs in. |
| **Report Quality Gate (as code)** | **You are the gate this week.** Check all ten by hand — that is how you learn what the automated checks need to be in the first place. |
| **Employer site fetch** | Paste the posting. The architecture already says the paste box should be the primary path anyway. |
| **Résumé text extraction (PDF/Word)** | Paste the text. This is a real Week 3 problem and a distraction from Week 1's question. |
| **PDF rendering** | Screen only. Nobody needs a file to tell you whether the gaps are right. |
| **Docker, VPS, deploy** | `localhost` is a deployment. |

Nine of the eleven components in the architecture are cut. That is the plan.

## The stack, cut down to Week 1

| What | Using this week | Instead of (from tech-stack.md) |
|---|---|---|
| Screen | One static HTML file with a `<form>` | React + Vite |
| Server | One ~100-line Node file, no framework | Node + Express + TypeScript |
| Model | Claude API, called directly | Claude via the pipeline worker |
| Catalog | A JavaScript array of 10 projects | PostgreSQL + pgvector |
| Storage | Nothing — it's in the page | Cloudflare R2 |
| Validation | Your own eyes, on all ten | Zod + the Quality Gate |
| Hosting | `node server.js` on your laptop | Docker Compose on a VPS |

Nothing here is a technology you'd throw away — every row is the Week 1 shape of a row you'll grow into.

## Five days

- [ ] **Monday — one résumé's skills come back with quotes attached**
  - [ ] Get a Claude API key working from a Node script
  - [ ] Ask for structured JSON: skill, plus the exact source line
  - [ ] Run it on your own résumé and read every line of the output
- [ ] **Tuesday — both sides extracted, and the gap list renders**
  - [ ] Same extraction against a posting
  - [ ] Subtract: required minus demonstrated
  - [ ] Put it on a page — ugly is fine, quotes are not optional
- [ ] **Wednesday — ten real résumés go through it**
  - [ ] Collect 10 anonymised résumés and 3 real postings from the advisor
  - [ ] Run all ten, save every output
  - [ ] Write down every wrong gap and *why* it was wrong
- [ ] **Thursday — projects attached, and it stops looking like a demo**
  - [ ] Hardcode 10 projects with skill tags and hour estimates
  - [ ] Attach the best-fitting projects to each gap
  - [ ] Spend two hours making the screen presentable — it changes how people read it
- [ ] **Friday — put it in front of a real person**
  - [ ] Sit with one career-services advisor
  - [ ] Have them read three reports without you explaining anything
  - [ ] Ask one question: *"Would you hand this to that student?"*

## What "it worked" looks like

Of the ten reports:

- **At least 7 have zero invented gaps** — every single gap traces to a line that really is in that posting, checked by you by hand.
- **The advisor says they would hand at least 5 to a student** after light edits.
- **The advisor points at a gap you did not expect** and says "yes, that's the real problem." That is the moment the idea is real.

## What "it didn't work" looks like

Gaps come back generic — "communication skills", "attention to detail" — instead of specific and quoted. Or citations don't actually appear in the source text. Or the advisor reads three and says some version of *"this isn't how I think about students."*

Expect the last one. It is the most likely failure and the least technical.

## What you'll know on Friday, and what to do about it

| Outcome | What it means | Next move |
|---|---|---|
| **Pass** — 7+ clean, advisor would hand over 5 | The risky assumption holds. The rest of the architecture is ordinary engineering. | Build Phase 2 from the architecture: real catalog, then the Quality Gate. |
| **Partial** — extraction is clean but the *projects* are wrong | The hard part works; the matching is the problem. | Keep everything. Spend Week 2 on the catalog and the ranking rule, not on the model. |
| **Fail** — citations unreliable, or the advisor doesn't recognise the thinking | The day-one bar may not be reachable the way it's currently designed. | Stop. Consider a version where the advisor drives and the tool assists, rather than the reverse. That is a different product and it is better to learn it in Week 1 than Month 6. |

## What Week 1 deliberately proves nothing about

- Whether it works on **scanned résumés** — you are pasting text.
- Whether it **scales**, or survives two advisors at once.
- Whether **FERPA and the college's IT department** will allow any of it.
- Whether **students actually do the six-week plans** — that takes a semester to learn, not a week.
- Whether the reports are **good enough unedited**, which is the real day-one bar. Week 1 only tests whether they are *close enough to be worth pursuing*.
