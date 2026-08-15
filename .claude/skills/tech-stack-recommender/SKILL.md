---
name: tech-stack-recommender
description: Use when the user has a system architecture and wants a recommended tech stack, explained simply.
allowed-tools: Read, Write
---

# Tech Stack Recommender

## Purpose

Turn an existing system architecture into a real, named stack: **one specific
technology per component**, an honest 🟢/🟡/🔴 fit rating judged against *this*
project's scale, one plain-English sentence saying why it fits, and a copy-ready
prompt the user can paste later to learn that one technology properly. The result
is saved to `project-blueprint/tech-stack.md`.

This skill recommends. It does not install, scaffold, or run anything.

## When to use

- "What should I actually build this with?"
- "Given my architecture, what stack do I use?"
- "Explain the tech choices like I'm not technical."

**Do not use** for designing the architecture itself (that is `/system-architect`,
which runs first), for deciding what to build in week one (that is `/mvp-scoper`),
or for reviewing a stack already in production.

## Input

**Read `project-blueprint/architecture.md` first.** It is the whole input. Every
recommendation is about *that* system, not a generic web app.

If the file does not exist, stop and say so: this skill runs second, and the user
needs `/system-architect` first. Do not invent an architecture to recommend against.

Pull three things out of it before recommending anything:

1. The **component list** and each component's exact name (reuse the names verbatim,
   so the two documents line up row for row).
2. The **day-one guarantee** — the one thing the system must do well. It decides
   which rows are allowed to be risky.
3. The **data flow**, which usually implies technologies the component list never
   named: text extraction, PDF rendering, hosting, background scheduling.

---

## Step 1 — One real technology per component

Walk the component list in order. Name **ONE** real, current, specific technology
per row.

| Not this | This |
|---|---|
| "a database" | **PostgreSQL 16** |
| "a frontend framework" | **React + Vite** |
| "an LLM" | **Claude — `claude-sonnet-5`** |
| "a queue" | **Redis + BullMQ** |

Rules:

- **One pick per row.** A row offering three options has made no recommendation.
  Alternatives belong in the *Alternatives considered* section, not in the row.
- **Boring beats clever.** Prefer the technology with the most tutorials, the
  longest track record, and the easiest hiring pool, unless this project has a
  specific reason to deviate — then say the reason in the row.
- **Prefer fewer moving parts.** Two components that one technology can serve
  should say so (e.g. vector search inside the database already chosen).
- **Only name what you are confident exists** at a current version. If unsure of a
  version number, name the technology without one rather than inventing a release.
  For any LLM row, use a current model id and check with `/claude-api` rather than
  recalling one.
- **Then add the flow-implied rows** the component list never named, in their own
  group, so the user can see they came from the data flow rather than the component
  table.

Every architecture component gets a row. No component may be silently dropped.

## Step 2 — Rate the fit, and mean it

Every row gets exactly one:

| Rating | Meaning | The test |
|---|---|---|
| 🟢 **great fit** | Matches this project's size and needs — pick it, move on | You would not write a caveat, because there isn't one that matters at this scale |
| 🟡 **good fit** | Works, but there is a real caveat to read first | A second thing to run and back up, a cost that grows with use, or a decision that depends on someone else's answer |
| 🔴 **consider carefully** | Where this plan is most likely to hurt | The input isn't yours to control, the failure is unpredictable, or the operational burden is real |

**Rate the fit for THIS project, not the technology's quality.** How much traffic,
how many people building it, what kind of data, who hosts it. An excellent
technology is 🔴 here if this project is the wrong shape for it. A modest one is
🟢 if it matches.

**An all-🟢 stack is a failed run.** If nothing came back 🟡 or 🔴, you flattered
the user instead of advising them. Go back and name which choices you are least
confident about and why.

Where the reds usually are — check each before concluding there are none:

- Reading content the user doesn't control (someone else's website, an inbox, a feed)
- Documents that might be scanned, photographed, or handwritten
- Sign-in that belongs to another organisation's IT department
- Anything priced per unit at a volume nobody has measured yet
- A second database running for a handful of jobs a day
- Anything needing an operational skill nobody on the team has

Put every caveat in its **own short block** labelled so it cannot be missed. Never
bury a caveat mid-sentence in the *why* column.

## Step 3 — Explain the "why" in one plain-English sentence

Each row gets **ONE sentence** saying why this technology fits *this* project.

- Say what it does for the user's actual nouns — resumes, pantry visits, students —
  not "records" and "entities".
- **No jargon unless you define it in the same breath, in five words or fewer:**
  "TypeScript, which checks your code's shapes before it runs"; "pgvector, a
  Postgres add-on for meaning-based search".
- Never justify a pick with popularity alone. "Everyone uses it" is not a why.

> **Bad:** "Redis + BullMQ — industry-standard distributed job queue with robust
> retry semantics and horizontal scalability."
> **Good:** "Redis + BullMQ — holds the list of reports waiting to be built so a
> slow one never freezes the screen the advisor is looking at."

## Step 4 — End every row with a copy-ready prompt

The last thing in each row is a prompt the user can paste into Claude later to
learn that one technology properly.

- **Name the project and the component's real job in it**, so the answer is about
  their system rather than a textbook.
- **End with a specific question** that only makes sense for this project.
- One line, wrapped in backticks so it copies cleanly out of the table.

> `Explain PostgreSQL to me like I'm new to databases, using my Pantry Router
> project as the example. What tables would I actually have?`

Forbidden: "Tell me about React." A prompt that would work for any project teaches
nothing about this one.

## Step 5 — Layout: icons and short labels, never a wall of text

- Tables carry the recommendations. Prose carries only the headline and the caveats.
- No paragraph longer than three lines anywhere in the document.
- Group the rows so a non-technical reader can navigate by feel:
  🖥️ things a person touches · ⚙️ things you write · 🗄️ things you store ·
  🔌 things you depend on · 🔧 things the data flow needs
- A technology keeps the same rating icon everywhere it appears in the document.

## Step 6 — Save to `project-blueprint/tech-stack.md`

Create the directory if needed. Use exactly this structure:

````markdown
# <Project Name> — Recommended Tech Stack

_Generated <YYYY-MM-DD> · derived from [`architecture.md`](architecture.md)_

**Fit ratings:** 🟢 great fit · 🟡 good fit, with a caveat · 🔴 consider carefully

**This stack: N 🟢 · N 🟡 · N 🔴**

> A rating is about *this* project — <its actual scale, in one clause>.
> A 🔴 does not mean "bad technology". It means this is where the plan is most
> likely to hurt you, and you should read that row twice.

## The headline
<one paragraph naming where this stack is most likely to break>

## The stack, component by component

### 🖥️ Things a person touches
| Component | Recommendation | Fit | Why, in one sentence | Paste this to learn more |
|---|---|---|---|---|
| **<architecture's exact component name>** | **<technology>** | 🟢 | <one plain-English sentence> | `<copy-ready prompt naming the project>` |

### ⚙️ Things you write
### 🗄️ Things you store
### 🔌 Things you depend on
### 🔧 Things the data flow needs that the component list doesn't name

## ⚠️ Read these rows twice
- **<row name>** — <the caveat, in its own block, plain English>

## Copy-ready prompts
| Technology | Prompt |
|---|---|

## What to learn first
1. **<technology>** — <why it comes first>

## Alternatives considered
| Instead of | You could use | Why not here |
|---|---|---|

## How hard each decision is to undo
| Decision | Reversibility | What it would cost to change later |
|---|---|---|

## What this document does not tell you
- <honest omission>
````

**Never overwrite silently.** If `project-blueprint/tech-stack.md` already exists,
read it first and tell the user what is being replaced — including whether it
describes a *different* project than the current `architecture.md`.

## Step 7 — Self-check before reporting

Do not report done until all eight pass:

- [ ] Every component in `architecture.md` has a row, named exactly as the
      architecture names it
- [ ] Every row names ONE real, current, specific technology
- [ ] Every row has a rating, and the ratings are not all 🟢
- [ ] Every rating is justified by *this* project's scale, not the technology's
      reputation
- [ ] Every "why" is one sentence, jargon-free or jargon-defined inline
- [ ] Every row ends with a copy-ready prompt that names the project and asks
      something project-specific
- [ ] Every caveat sits in its own labelled block, not buried in a sentence
- [ ] The counts in the header sum to the number of rows

## Report

State: **the exact path written**, and **the fit-rating breakdown — how many 🟢,
how many 🟡, how many 🔴**. Then: which recommendations you were least confident
about, and confirmation that every architecture component has a row.

---

## Relationship to the locked cohort prompt

For classroom use, the self-contained student prompt is
[`docs/prompts/tech-stack-student-prompt.md`](../../../docs/prompts/tech-stack-student-prompt.md),
**locked at v1.0 (2026-08-06)**. It covers this same recommendation work *plus* the
multi-page HTML knowledge base at `project-blueprint/stack/`, and is deliberately
paste-able on machines where this skill is not installed.

This skill covers the Markdown deliverable only. The two must not disagree: the
rating definitions, the one-technology-per-component rule, the all-🟢-is-a-failed-run
rule, the copy-ready-prompt contract, and the `tech-stack.md` section list here are
the same ones the locked prompt specifies. If the prompt is version bumped, update
this file in the same change.

Reference output: [`project-blueprint/tech-stack.md`](../../../project-blueprint/tech-stack.md)
(14 rows, 8 🟢 / 4 🟡 / 2 🔴). Note it currently demonstrates an earlier idea than
the architecture beside it — see the known-inconsistency note in `PROGRESS.md`.
