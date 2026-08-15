# Student Prompt — Idea → System Blueprint

> **🔒 LOCKED — v1.0, 2026-08-06.** This is the cohort standard. The reference output it produces is [`project-blueprint/`](../../project-blueprint/). Do not edit the prompt block below casually: it is the contract that keeps every student's output looking like one system. Changes need the DRI (`ali@colaberry.com`), a version bump here, and a regenerated reference build so the two never disagree.

**Self-contained.** Everything the model needs is inside the prompt below. It does not depend on a skill, a settings file, a plugin, or anything else being installed — a student can paste it into Claude Code on any machine and get the same result.

That is deliberate. An earlier version kept the spec in `.claude/skills/system-architect/SKILL.md` and left the prompt short. That produced identical output only on machines that had the skill. This version trades a longer paste for reproducibility.

**Locked scope, v1.0:** architecture Markdown · multi-page knowledge base with a Command Center · site-wide search · keyless local Ask mode plus optional Claude mode · full-screen diagrams · data-generated inline-SVG illustrations · Colaberry formatting · runs from disk on any machine.

---

## The prompt

```text
My idea: [describe your project in one paragraph — who it's for, what it does,
and the one thing it must do well on day one]

How would this actually work as a system? Then build it out as a knowledge base
I can browse.

────────────────────────────────────────
1. DESIGN THE SYSTEM
────────────────────────────────────────
Derive the component list from what my paragraph actually says. Every component
must trace back to specific words in it; every component it implies must appear.
Include a frontend only if a human uses one, a database only if state outlives a
session, a queue only if work is slow or bursty, an AI layer only if the idea
needs generation, extraction, or ranking by meaning. A padded diagram is a worse
answer than a small one.

The sentence naming what it must do well on day one outranks everything else.
Some component exists specifically to guarantee it — name that component.

────────────────────────────────────────
2. WRITE project-blueprint/architecture.md
────────────────────────────────────────
Sections: The Idea (my paragraph) · Components (table, each with ONE plain-English
sentence saying what it does for THIS project, plus the words that required it) ·
How It Fits Together (mermaid flowchart) · Data Flow (numbered walkthrough) ·
Build Order (phases, and what each phase proves) · Assumptions (with impact) ·
What This Design Does Not Cover (honest).

Mermaid rules: `flowchart TD`. Readable labels, not `DB`. EVERY arrow labelled
with the data or action crossing it. `[Rectangle]` services you build,
`[(Cylinder)]` data stores, `{{Hexagon}}` third parties, `([Stadium])` entry
points. Quote any label with a comma or parenthesis. No reserved words as node
IDs. Verify it parses.

────────────────────────────────────────
3. BUILD THE KNOWLEDGE BASE (multi-page)
────────────────────────────────────────
A small static site under project-blueprint/ — SEPARATE PAGES, not one long
scroll, so I can open a section, read it, go back to the Command Center, and
open the next one:

  index.html          Command Center
  01-summary.html … 0N-<section>.html   one page per section
  assets/blueprint.js  the data object
  assets/site.js       shared rendering, nav, agent
  assets/site.css      shared styles

COMMAND CENTER (index.html): a responsive grid of tiles, one per section. Each
tile has an inline-SVG picture previewing what's inside — a miniature node graph,
stacked flow steps, phase bars, a coverage grid — drawn from my data, not stock
art or emoji. Plus the section name, one line of description, and a live count
("11 components", "3 deferred"). The whole tile is the link.

EVERY SECTION PAGE: sticky top nav, a "← Command Center" control, breadcrumbs,
previous/next section links at the foot, scroll progress, back-to-top, search,
theme toggle, print. Keyboard reachable throughout.

ONE DATA OBJECT: assets/blueprint.js defines `const BLUEPRINT = {...}` holding
everything — components, diagram source, flow steps, phases, coverage,
assumptions. Every page renders from it. If a number appears twice in the source,
that's the bug. (Note `const` at top level is NOT a property of window — other
scripts must reference the bare identifier, not window.BLUEPRINT.)

SEARCH ACROSS THE WHOLE SITE: build one plain-JavaScript index over every field
of BLUEPRINT — components, flow steps, phases, coverage rows, assumptions, KPIs,
artifacts — each entry tagged with the section it belongs to. Typing in the nav
search box does two things at once: narrows what's visible on the current page,
AND drops down ranked matches from every OTHER section, each one a link to the
right page with the matched words highlighted. Score by term frequency with a
title boost and a whole-phrase bonus; drop stopwords; fall back to a stem match
so "components" finds "component". No model, no network, works offline.

DIAGRAMS AND CHARTS: Mermaid for the architecture, the data flow (sequence
diagram), and the build order (gantt). Charts only where my idea has real data to
support one — never invent a metric to fill a chart. EVERY diagram and chart has
an expand control that opens it FULL SCREEN with zoom in / zoom out / reset and
Esc to close. Every one also carries a one-line plain-English interpretation
beneath it: what it means, not what it shows.

ILLUSTRATIONS — PICTURES THAT TELL THE STORY: alongside the technical diagrams,
draw purpose-built inline-SVG illustrations, generated from BLUEPRINT so they
stay true when the data changes. Aim for one per section, for example: the whole
idea as inputs → pipeline → output; the components grouped into layers with the
real names placed in them; the steps as a numbered ribbon colour-coded by which
ones the model actually touches; the build phases as a proportional timeline with
the make-or-break phase highlighted; coverage as a conditional-formatted grid; the
open question as a two-branch fork showing what changes under each answer. Use
inline SVG only — no stock photography, no icon fonts, no emoji as the main
visual, no external image files. They must scale, follow the light/dark theme,
work offline, and expand full screen like every other figure.

AI AGENT — TWO MODES, AND THE DEFAULT NEEDS NO KEY: an "Ask" panel on every page
with a mode switch.

  MODE 1 (default) "Search — no key": answers from the same local index as the
  nav search. No API key, no network, no model. It returns the matching passages
  as cards, each labelled with its section, snippet highlighted, linking to the
  page. When nothing matches it says so and points at Coverage, since a miss may
  itself be the answer. This mode must work with the internet switched off.

  MODE 2 "Claude — needs key": I paste my own Anthropic API key (stored in
  localStorage, never hardcoded), pick a model, and choose scope — this section
  or the whole blueprint. It answers ONLY from the BLUEPRINT object, which you
  put in the system prompt, and says so plainly when the blueprint doesn't cover
  something. Every failure path (bad key, rate limit, blocked request) tells me I
  can fall back to Search mode. Call the API directly:

  POST https://api.anthropic.com/v1/messages
  headers: content-type: application/json
           x-api-key: <the key the user pasted>
           anthropic-version: 2023-06-01
           anthropic-dangerous-direct-browser-access: true
  body:    { model, max_tokens: 16000, system, messages: [{role, content}] }

  Models: claude-opus-5 (default), claude-sonnet-5, claude-haiku-4-5.
  Send output_config: {effort: "low"} on the first two ONLY — Haiku rejects it.
  Read the reply from data.content, filtering blocks where type === "text".
  Check data.stop_reason === "refusal" before reading content.
  Show a readable error on a bad key, rate limit, or lost connection.

COLABERRY FORMATTING:
  background #eef2f6   text  #0f172a   accent #0f766e
  cards      #ffffff   muted #64748b   borders #e2e8f0
  radius 10-12px · soft shadows · "Segoe UI", system-ui, sans-serif
  Semantic colors only — green good, amber warning, red risk, blue info,
  slate neutral. An entity keeps the same color everywhere it appears.
  Executive and calm, not consumer SaaS. Support a dark theme too.

────────────────────────────────────────
4. PORTABILITY — THIS RUNS ON MANY MACHINES
────────────────────────────────────────
Plain HTML, CSS, and vanilla JS. No build step, no framework, no bundler, no
package install, no local server required — opening index.html from disk must
work. Classic <script src="..."> only; no ES modules and no fetch() of local
files, both of which browsers block on file:// URLs. Mermaid and Chart.js from
CDN. No other network calls except the Anthropic one I trigger myself. Nothing
that depends on your operating system, your shell, or anything installed here.

────────────────────────────────────────
5. FINISH
────────────────────────────────────────
Open project-blueprint/index.html in my browser.

WHEN FINISHED, REPORT: the exact path of the saved architecture, the exact path
of the knowledge base, the component list with one line on why my idea required
each, what you assumed, the one question that would most change the design, that
Ask works with no API key in Search mode, and that Mermaid and Chart.js need
internet on first load — with an offer to build an offline version.
```

---

## What the student gets

| Artifact | Path |
|---|---|
| The design, in Markdown | `project-blueprint/architecture.md` |
| Command Center | `project-blueprint/index.html` |
| Section pages | `project-blueprint/01-…html` … |
| Shared data, script, styles | `project-blueprint/assets/` |

## Notes for whoever runs this with a cohort

- **The day-one sentence is the most important part of the paragraph.** It's what forces a real design decision instead of a generic three-tier diagram. If a student's paragraph doesn't have one, send it back before they run the prompt.
- **No student needs an API key to get value from this.** Search mode is the default and answers from a local index with no model and no network. A key only buys prose answers. Plan the session that way — key setup should be optional, not a prerequisite.
- **When a key is used, it's the student's own and it lives in their browser.** `anthropic-dangerous-direct-browser-access` is named that way for a reason: anyone with access to that machine or that page can read the key out of localStorage. Fine for a personal learning artifact on your own laptop; do not put a shared or company key in it, and do not host the page anywhere public with a key baked in.
- **If Claude mode fails from a `file://` URL**, the browser's cross-origin rules are the cause, not the code. Serving the folder fixes it: `python -m http.server` inside `project-blueprint/`, then open `http://localhost:8000`. Search mode and everything else work from disk either way.
- **Mermaid and Chart.js load from a CDN**, so those two diagrams need internet on first open. The illustrations, search, and Ask's search mode are all inline and work offline. Ask for the offline build if the cohort is somewhere without a connection.
- Students iterate by re-running with a revised paragraph — every file regenerates together.
