# Student Prompt — Architecture + Stack → Week 1 MVP

> **🔒 LOCKED — v1.0, 2026-08-06.** Reviewed by the DRI against the reference output at
> [`project-blueprint/mvp/`](../../project-blueprint/mvp/), [`mvp-plan.md`](../../project-blueprint/mvp-plan.md),
> [`mockup.html`](../../project-blueprint/mockup.html) and [`one-pager.md`](../../project-blueprint/one-pager.md).
> Changes need the DRI (`ali@colaberry.com`), a version bump here, and a regenerated reference build.

**Third and last in the sequence.** Students run [architecture](system-architect-student-prompt.md), then [stack](tech-stack-student-prompt.md), then this.

**It runs only this stage.** It *reads* `architecture.md` and `tech-stack.md` — it never regenerates them. A student who re-runs this does not lose their earlier work.

**Self-contained**, on the same principle as the other two: everything the model needs is inside the prompt block.

**Locked scope, v1.0:** `mvp-plan.md` · `mockup.html` · `one-pager.md` · a multi-page knowledge base with Command Center, site-wide search, keyless Ask, full-screen inline-SVG illustrations · no CDN at all · runs from disk on any machine.

---

## The prompt

```text
Given my architecture and stack, what should I build first, what could this look
like, and how would I pitch it to someone?

────────────────────────────────────────
0. READ FIRST — DO NOT REGENERATE
────────────────────────────────────────
Read project-blueprint/architecture.md and project-blueprint/tech-stack.md.

Both already exist. Do not rebuild, re-derive or overwrite either one — this run
only adds the MVP stage on top of them. If either file is missing, stop and tell
me which one, rather than inventing it.

────────────────────────────────────────
1. WRITE project-blueprint/mvp-plan.md
────────────────────────────────────────
The smallest real slice I could build in WEEK 1 — five working days — that
genuinely tests whether the idea works.

The whole discipline here is SUBTRACTION. Start from my architecture's component
list and cut until only the risky part is left. Expect to delete most of it. A
Week 1 plan containing auth, a queue, a database and a deploy pipeline is not a
Week 1 plan — it is week one of a six-month project, and it proves nothing by
Friday.

Sections, in this order:

  • The one question Week 1 answers — one sentence. Not "build the app": the
    single risky assumption that, if wrong, means nothing else is worth building.
  • What you are building — 3 to 6 items, each naming the architecture component
    it came from.
  • What you are NOT building, and why that's safe — a table, one row per cut,
    each saying what it would prove and why that isn't this week's question.
    This table should be LONGER than the one above.
  • The stack, cut down to Week 1 — what I actually use this week versus the
    fuller recommendation in tech-stack.md.
  • Five days — Monday to Friday as a checklist. Each day names an OUTCOME, not
    an activity: "gap list renders from a real résumé", not "work on extraction".
    Friday is putting it in front of a real person.
  • What "it worked" looks like — a specific, checkable bar somebody else could
    apply without me in the room. A number or a yes/no, never "it feels good".
  • What "it didn't work" looks like — equally specific. Name the failure you
    actually expect.
  • What you'll know on Friday, and what to do about it — a table with three
    outcomes (pass / partial / fail) and the next move for each. The fail branch
    must be allowed to say "stop and reconsider the product".
  • What Week 1 deliberately proves nothing about — so nobody over-reads a good
    result.

────────────────────────────────────────
2. WRITE project-blueprint/mockup.html
────────────────────────────────────────
A real, self-contained, visually appealing static HTML + CSS mockup of my idea's
MAIN SCREEN — the landing page or the core app view, whichever better sells it.

  • REAL SAMPLE CONTENT for THIS idea. Actual names, actual numbers, actual copy
    somebody would really see on that screen. Never lorem ipsum. Never
    "Feature 1 / Feature 2". Never [placeholder].
  • A DESIGNED SCREEN, NOT A WIREFRAME. Colour, icons, hierarchy, spacing, real
    buttons. Grey boxes with labels on them is a failure.
  • Show the PRODUCT, not the architecture. No boxes-and-arrows diagrams here.
  • One file. Inline CSS and inline SVG icons only — no CDN, no external images,
    no script tags. It must open from disk.
  • If the idea involves people's data, make the sample data obviously fictional
    and say so in a footer line.

────────────────────────────────────────
3. WRITE project-blueprint/one-pager.md
────────────────────────────────────────
A short marketing one-pager: what it does, who needs it, and one sentence on why
it matters.

Icons and emojis, short punchy lines, plenty of white space. Written for a dean,
a funder, or a colleague in a hallway.

NO technical description: no component names, no technology names, no
architecture, no jargon at all. If a claim uses a number, say plainly whether it
is measured or estimated.

────────────────────────────────────────
4. BUILD THE KNOWLEDGE BASE (multi-page)
────────────────────────────────────────
Same shape as my architecture and stack knowledge bases, under
project-blueprint/mvp/ so all three sit side by side:

  index.html           Command Center
  01-…html … 0N-…html  one page per section
  assets/mvp.js        the data object
  assets/site.js       shared rendering, nav, search, agent
  assets/site.css      shared styles

Sections should cover: the bet · the five days · what's cut · the mockup · the
pitch · did it work · appendix.

COMMAND CENTER: a responsive grid of tiles, one per section, each with an
inline-SVG picture previewing what's inside and a live count pulled from the data
("10 cuts", "3 outcomes"). The whole tile is the link.

EVERY SECTION PAGE: sticky nav, "← Command Center", breadcrumbs, previous/next at
the foot, scroll progress, back-to-top, search, theme toggle, print.

ONE DATA OBJECT: assets/mvp.js defines `const MVP = {...}` holding the question,
what's kept, every cut, the five days, the pass and fail bars, the outcomes and
the pitch. Every page renders from it. Nothing typed twice. (Note `const` at top
level is NOT a property of window — other scripts must reference the bare
identifier.)

SEARCH ACROSS THE WHOLE SITE: one plain-JavaScript index over every field of MVP,
each entry tagged with its section. The nav box narrows the current page AND drops
down ranked matches from every other section, linked and highlighted. No model, no
network, works offline.

THE MOCKUP PAGE: link OUT to mockup.html with a large, obvious button — do NOT
embed it in an iframe, because browsers block file:// iframes and it will render
as a blank panel. Alongside the button, draw an inline-SVG schematic of the screen
layout and list the handful of things worth noticing on it.

ILLUSTRATIONS: inline SVG generated from MVP — the whole week as inputs → one
screen → one person's verdict; the five days as a strip; kept versus deleted; the
Friday decision as a three-way fork. No stock art, no icon fonts, no external
images. Every figure expands FULL SCREEN with zoom in / out / reset and Esc.
Never draw two labels at the same coordinate — offset every repeated element by
its index. Keep nav labels short enough that they all fit on one line.

AI AGENT — TWO MODES, DEFAULT NEEDS NO KEY:
  MODE 1 (default) "Search — no key": answers from the local index, returns
  matching passages as linked cards. No key, no network, works offline.
  MODE 2 "Claude — needs key": my own Anthropic API key in localStorage, model and
  scope pickers, answers ONLY from MVP. Tell it to protect the plan's discipline —
  never suggest adding back something the plan deliberately cut unless I ask what
  it would cost. Every failure path points back to Search mode. Call the API
  directly:

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

COLABERRY FORMATTING (mockup and knowledge base alike):
  background #eef2f6   text  #0f172a   accent #0f766e
  cards      #ffffff   muted #64748b   borders #e2e8f0
  radius 10-12px · soft shadows · "Segoe UI", system-ui, sans-serif
  Semantic colours only — green good, amber warning, red risk, blue info, slate
  neutral. Support a dark theme in the knowledge base.

────────────────────────────────────────
5. PORTABILITY — THIS RUNS ON MANY MACHINES
────────────────────────────────────────
Plain HTML, CSS, vanilla JS. No build step, no framework, no install, no server —
opening index.html and mockup.html from disk must work. Classic <script src="...">
only; no ES modules and no fetch() of local files, both blocked on file:// URLs.
No CDN at all: draw every figure as inline SVG rather than pulling in a library.

Do not commit anything.

────────────────────────────────────────
6. FINISH
────────────────────────────────────────
Open project-blueprint/mockup.html in my browser, then
project-blueprint/mvp/index.html.

WHEN FINISHED, REPORT: whether mvp-scoper was invoked automatically, the exact
paths of mvp-plan.md, mockup.html and one-pager.md with one line on what each
contains, the exact path of the knowledge base, how many architecture components
you kept versus cut, and confirmation that you did not modify architecture.md or
tech-stack.md.
```

---

## What the student gets

| Artifact | Path |
|---|---|
| Week 1 plan | `project-blueprint/mvp-plan.md` |
| Mockup | `project-blueprint/mockup.html` |
| One-pager | `project-blueprint/one-pager.md` |
| Command Center | `project-blueprint/mvp/index.html` |
| Section pages + assets | `project-blueprint/mvp/` |

## Notes for whoever runs this with a cohort

- **This runs third and reads the first two.** A student who skipped either earlier stage gets stopped rather than given an invented architecture to scope against.
- **The cuts are the lesson, not the plan.** The valuable moment is a student seeing ten of their eleven components deleted and realising the week is still worth doing. If their cuts table is shorter than their build table, they haven't understood it — have them re-run.
- **Watch for a mockup that's secretly a wireframe.** Grey boxes with labels means the model took the cheap path. It should look like a product screenshot.
- **Watch for a one-pager with technology in it.** If PostgreSQL appears, it failed the brief.
- **No API key needed.** The Ask panel opens in keyless Search mode, same as the other two prompts.
- **No CDN at all**, so the whole thing works offline from disk — including the mockup.
- **Runtime not yet measured** for this stage. The architecture prompt measured ~7½ minutes of model time; this one produces three deliverables plus a site, so budget at least that. **Run the timing audit before quoting a number to a cohort.**
