# Student Prompt — Architecture → Tech Stack

> **🔒 LOCKED — v1.0, 2026-08-06.** Reviewed by the DRI against the reference output at
> [`project-blueprint/stack/`](../../project-blueprint/stack/). Changes need the DRI (`ali@colaberry.com`), a version
> bump here, and a regenerated reference build so the two never disagree.
> Companion to the locked [architecture prompt](system-architect-student-prompt.md) — students run that one first.

**Locked scope, v1.0:** one real technology per architecture component · 🟢/🟡/🔴 fit ratings judged against this project's scale · one plain-English sentence each · a copy-ready learning prompt per row · `tech-stack.md` plus a multi-page knowledge base with search, keyless Ask, copy buttons and inline-SVG illustrations · no CDN at all · runs from disk on any machine.

**Self-contained**, on the same principle as the architecture prompt: everything the model needs is inside the prompt block. No skill, plugin or settings file has to exist on the student's machine.

**Runs second.** It reads `project-blueprint/architecture.md`, so a student must have produced that before this will do anything useful.

---

## The prompt

```text
Given my architecture, what stack should I actually use? Explain it like I might
not be technical.

Read project-blueprint/architecture.md first. Everything below is about THAT
system — not a generic web app.

────────────────────────────────────────
1. RECOMMEND ONE TECHNOLOGY PER COMPONENT
────────────────────────────────────────
Walk my architecture's component list in order. For each one, name ONE real,
current, specific technology — "PostgreSQL 16", not "a database"; "React + Vite",
not "a frontend framework". Use my architecture's own component names so I can
line the two documents up side by side.

Then add any technology my DATA FLOW clearly needs that the component list never
named — text extraction, PDF rendering, hosting. Mark those as a separate group
so I can see they came from the flow, not the component list.

────────────────────────────────────────
2. RATE THE FIT — AND MEAN IT
────────────────────────────────────────
Every recommendation gets one of:

  🟢 great fit          — matches this project's size and needs; pick it, move on
  🟡 good fit           — works, but there is a real caveat I should read first
  🔴 consider carefully — where this plan is most likely to hurt me

Rate against MY project's actual scale and constraints — how much traffic, how
many people building it, what kind of data — not against what is popular. A
technology can be excellent and still be 🔴 here.

If everything comes back 🟢, you have not thought hard enough. Say plainly which
choices you are least confident about and why.

────────────────────────────────────────
3. EXPLAIN IT TO SOMEONE NON-TECHNICAL
────────────────────────────────────────
Each recommendation gets ONE plain-English sentence saying why it fits MY project.
No jargon unless you define it in the same breath, in five words or fewer —
"TypeScript, which checks your code's shapes before it runs".

Icons and short labels, never a wall of text. If a row needs a caveat, put it in
its own short block labelled so I cannot miss it — don't bury it in the sentence.

────────────────────────────────────────
4. GIVE ME A PROMPT I CAN PASTE LATER
────────────────────────────────────────
End every recommendation with a copy-ready prompt I can paste into Claude to learn
that one technology properly. Each must already name my project so the answer is
about my system, not a textbook. For example:

  "Explain PostgreSQL to me like I'm new to databases, using my <project> as the
   example. What tables would I actually have?"

────────────────────────────────────────
5. WRITE project-blueprint/tech-stack.md
────────────────────────────────────────
Sections: the fit-rating key and what a rating means · a one-paragraph headline
naming where this stack is most likely to break · the recommendations grouped
(things a person touches / things you write / things you store / things you depend
on / things the data flow needs) · every copy-ready prompt collected in one table ·
what to learn first, in order · alternatives considered and why not · how hard each
decision is to undo · what this document does NOT tell me.

────────────────────────────────────────
6. BUILD THE KNOWLEDGE BASE (multi-page)
────────────────────────────────────────
Same shape as my architecture knowledge base, under project-blueprint/stack/ so
the two sit side by side:

  index.html           Command Center
  01-summary.html … 08-appendix.html    one page per section
  assets/stack.js      the data object
  assets/site.js       shared rendering, nav, search, agent
  assets/site.css      shared styles

COMMAND CENTER: a responsive grid of tiles, one per section, each with an inline-SVG
picture previewing what's inside and a live count pulled from the data ("14
recommendations", "2 to watch"). The whole tile is the link.

EVERY SECTION PAGE: sticky nav, "← Command Center", breadcrumbs, previous/next at
the foot, scroll progress, back-to-top, search, theme toggle, print.

ONE DATA OBJECT: assets/stack.js defines `const STACK = {...}` holding every
recommendation, rating, caveat, prompt, alternative and decision. Every page renders
from it. Nothing typed twice. (Note `const` at top level is NOT a window property —
other scripts must reference the bare identifier.)

SEARCH ACROSS THE WHOLE SITE: one plain-JavaScript index over every field of STACK,
each entry tagged with its section. The nav box narrows the current page AND drops
down ranked matches from every other section, linked and highlighted. No model, no
network, works offline.

COPY BUTTONS: every copy-ready prompt gets a working copy-to-clipboard button that
confirms it copied. Use navigator.clipboard with a textarea + execCommand fallback,
because the clipboard API is often blocked on file:// URLs.

ILLUSTRATIONS: inline SVG generated from STACK — the whole stack as bands coloured
by fit rating; a proportional bar of 🟢/🟡/🔴 with the reds called out; a topology
showing what runs on my machine versus somebody else's; a learning ladder; a lock-in
scale. No stock art, no icon fonts, no external images. Every figure expands FULL
SCREEN with zoom in / out / reset and Esc.

AI AGENT — TWO MODES, DEFAULT NEEDS NO KEY:
  MODE 1 (default) "Search — no key": answers from the local index, returns matching
  passages as linked cards. No key, no network, works offline.
  MODE 2 "Claude — needs key": my own Anthropic API key in localStorage, model and
  scope pickers, answers ONLY from STACK and says so when something isn't covered.
  Tell it never to talk me out of a 🔴 rating. Every failure path points back to
  Search mode. Call the API directly:

  POST https://api.anthropic.com/v1/messages
  headers: content-type: application/json
           x-api-key: <the key the user pasted>
           anthropic-version: 2023-06-01
           anthropic-dangerous-direct-browser-access: true
  body:    { model, max_tokens: 16000, system, messages: [{role, content}] }

  Models: claude-opus-5 (default), claude-sonnet-5, claude-haiku-4-5.
  Send output_config: {effort: "low"} on the first two ONLY — Haiku rejects it.
  Read the reply from data.content where type === "text".
  Check data.stop_reason === "refusal" before reading content.

COLABERRY FORMATTING:
  background #eef2f6   text  #0f172a   accent #0f766e
  cards      #ffffff   muted #64748b   borders #e2e8f0
  radius 10-12px · soft shadows · "Segoe UI", system-ui, sans-serif
  Fit ratings map to the semantic colours: 🟢 green, 🟡 amber, 🔴 red — and a
  technology keeps its rating colour everywhere it appears. Support a dark theme.

────────────────────────────────────────
7. PORTABILITY — THIS RUNS ON MANY MACHINES
────────────────────────────────────────
Plain HTML, CSS, vanilla JS. No build step, no framework, no install, no server —
opening index.html from disk must work. Classic <script src="..."> only; no ES
modules and no fetch() of local files, both blocked on file:// URLs. No CDN needed
at all: draw every figure as inline SVG rather than pulling in a chart library.

────────────────────────────────────────
8. FINISH
────────────────────────────────────────
Open project-blueprint/stack/index.html in my browser.

WHEN FINISHED, REPORT: the exact path of the saved recommendation, the exact path of
the knowledge base, the fit-rating breakdown (how many 🟢 / 🟡 / 🔴), which
recommendations you were least confident about, and confirmation that every
component in my architecture has a row.
```

---

## What the student gets

| Artifact | Path |
|---|---|
| The recommendation, in Markdown | `project-blueprint/tech-stack.md` |
| Command Center | `project-blueprint/stack/index.html` |
| Section pages | `project-blueprint/stack/01-…html` … |
| Shared data, script, styles | `project-blueprint/stack/assets/` |

## Notes for whoever runs this with a cohort

- **This runs second.** It reads `architecture.md`. A student who skipped the architecture prompt gets nothing useful.
- **The fit ratings are the teaching moment, not the technology names.** Any model can name PostgreSQL. The valuable output is a student seeing that two of fourteen rows are red, and that both reds are about inputs they don't control rather than anything they'd have chosen differently.
- **Watch for an all-green stack.** If a student's output has no 🟡 or 🔴 at all, the model flattered them. Have them re-run and ask explicitly which choices it was least confident about.
- **No API key needed.** As with the architecture prompt, the Ask panel opens in keyless Search mode. A key only buys prose answers.
- **This one needs no CDN at all.** Unlike the architecture prompt, there are no Mermaid or Chart.js diagrams — every figure is inline SVG, so the whole site works offline from disk.
- **Estimated runtime** — not yet measured. The architecture prompt measured ~7½ minutes of model time; this one produces less output and has no mermaid, so expect less, but **run the timing audit before quoting a number to a cohort.**
