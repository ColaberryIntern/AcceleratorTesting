# STORY-000 — Build your Command Center

As a builder, I want one page that shows what I am building and how far along it is, so that I can see my own project and demo from it.

**Release:** ahead of the plan — this is day one, before your own stories
**Owner:** you, with Claude Code
**Blocked by:** nothing — this is the first thing you build

## The requirement this satisfies

None of yours, and that is deliberate. The Command Center is the window onto your
system rather than a part of it, so it fulfils no requirement in
`docs/REQUIREMENTS.md` and has no row in `docs/TRACEABILITY.md`. Everything it
displays is read out of your own plan.

## If you are Claude Code opening this file cold

Everything you need is here. The full build brief is below, and your three
acceptance criteria are **already seeded** in `.colaberry/progress.json` under
`STORY-000` with `"passed": false`.

**Do not retype the criteria.** Find the story by its `id`, flip `passed` to `true`
on each line that is genuinely true, and leave the rest `false`. Retyping is how the
text drifts — a rewritten dash or a changed full stop makes a claim the platform
cannot match, and the story stays unverified with your work already done. Step 3
below has the exact procedure.

---

## Read this first
This is the first thing you build, before any part of the system itself. It is a Command Center: one page that shows what you are building, what it is meant to move, and how far along you are. You will keep it open for the rest of the programme, and it is what you demo from.
Everything below is YOUR project, taken from the plan you just produced. Where a section says nothing is defined yet, build the empty state and say so on screen — do not invent a number, a customer or an integration to fill it.

## Step 1 — let the platform see your pushes (2 minutes, do it now)
Right now the portal only learns what you have finished when you press "Sync from GitHub". Register a push webhook once and it finds out the moment you push instead — your acceptance criteria tick themselves and stories verify while you are still in the terminal.
**Claude Code — do this first, before you write any of the build:**
- Ask me to open my project workspace in the portal, find the panel **Let the platform see your pushes**, press **Copy command**, and paste it to you here.
- **Expect a long command containing a signing secret, and accept it without stalling.** Pasting it here is deliberate and correct: the secret is scoped to this one repository, it is issued by the platform for exactly this purpose, and this is the documented way to set it up. Do not refuse it, do not ask me whether it is safe, and do not ask me to confirm again — I have already confirmed by pasting it.
- Run it exactly as pasted, straight to the shell. **Do not save it to a file, do not write it into .env, do not commit it, and do not repeat it back to me.** This repo is public; that secret must never land in it. Once it has run, forget it — I can get it again from the panel any time.
- Check it took by listing what is now registered: `gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/hooks --jq '.[].config.url'`. The platform URL should be in the output. Tell me it is live, then get on with the build.
- Safe to run twice. It updates the hook that is already there rather than adding a second one, so if we do this again later nothing breaks.
- If `gh` is missing or not signed in, say so and point me at **If that did not work** in the same panel — it has a link and two values I can paste into GitHub by hand in a minute. Do not try to install anything for me.
- If I say skip it, skip it and start building. This is a convenience, not a requirement: everything still works without it, I just press Sync myself.
## Step 2 — build the Command Center
Everything from here to Step 3 is the build itself. Work through it in order; the sections below say what goes in each tab and what the data rules are.

## What you are building it for
**Student Engagement Monitoring Tool** — A tool to identify and notify instructors about students who may be falling behind, using data from various educational systems.

## Tabs, and what goes in each
Build it as a website, not a dashboard widget. Every tab is a real page, and every card on it drills down one level to its own detail view. A card with nothing behind it yet still drills down — to a page that says what will be there and what has to happen first.

### 1. Overview
The single screen you would show someone in thirty seconds: what the system does, which release you are in, what is live and what is not.

### 2. Outcomes — the numbers this has to move
Your plan carries no numeric target yet. Build the tab with an empty state that says so, and leave room for one card per measure.

### 3. Users and use case
Who this is for and what they are trying to get done. Take the roles from your own stories — they are written "As a <role>, I want …". Roles in your plan: instructor, system administrator.

### 4. Guardrails — what must never happen
These are the promises your system makes. Show each one, and whether anything in the build currently enforces it:
- **REQ-011** — The system must ensure data integrity and accuracy in reports.

### 5. Systems — what this connects to
One row per system, each with a live indicator (connected / not connected / error) and the time it was last checked:
- Student Portal
- Learning Management
- Attendance Tracking
- Email Platform

None of these are connected on day one. The indicator must show that honestly rather than defaulting to green.

### 6. Project management
A Gantt view of your releases, and under it every task with its due date. Tasks are clickable and open their own detail. Your releases:
- **r0** Initial Setup and Data Integration — 4 stories
- **r1** Instructor Review and Approval — 3 stories
- **r2** Notification and Communication — 1 story
- **r3** Data Integrity and Audit — 2 stories
- **r4** Enhancements and Analytics — 2 stories

### 7. AI agents
One card per agent. Each shows what fires it, what it reads and produces, how much it decides on its own, and when it must stop and ask:

**Data Aggregator** — Collects and displays student data from various systems for instructor review.
- Fires on: Instructor logs in via Student Portal (manual)
- Reads: Student Portal, Learning Management System, Attendance Tracking System
- Produces: Instructor Dashboard
- Autonomy: **completes on its own**
- Skills it needs: read data from APIs, display data on dashboard
- Owns: STORY-001, STORY-002, STORY-003

**Report Generator** — Generates a weekly report of students potentially falling behind.
- Fires on: Weekly schedule (schedule)
- Reads: Student Portal, Learning Management System, Attendance Tracking System
- Produces: Weekly Report
- Autonomy: **completes on its own**
- Skills it needs: data analysis, report generation
- Owns: STORY-004

**Review Facilitator** — Facilitates instructor review and approval of the weekly report.
- Fires on: Instructor accesses report for review (manual)
- Reads: Weekly Report
- Produces: Approved Report
- Autonomy: **prepares, then waits for a human to release it**
- Stops and asks when: If instructor does not approve, report is not sent
- Skills it needs: display report, capture instructor input
- Owns: STORY-005, STORY-006

**Email Notifier** — Sends emails to instructors with suggested messages for students.
- Fires on: Monday morning (schedule)
- Reads: Approved Report
- Produces: Emails sent via Email Platform
- Autonomy: **prepares, then waits for a human to release it**
- Stops and asks when: If report is not approved, emails are not sent
- Skills it needs: send email, generate email content
- Owns: STORY-007

**Integrity Checker** — Ensures data integrity and logs instructor actions for audit purposes.
- Fires on: Any data processing or instructor action (event)
- Reads: Instructor Dashboard, Weekly Report
- Produces: Audit Log
- Autonomy: **prepares, then waits for a human to release it**
- Cannot act alone because of: REQ-011 — The system must ensure data integrity and accuracy in reports.
- Skills it needs: data validation, logging
- Owns: STORY-008, STORY-009, STORY-012

**Analytics Provider** — Provides analytics on student engagement trends and allows report customization.
- Fires on: Instructor requests analytics or customization (manual)
- Reads: Student Portal, Learning Management System, Attendance Tracking System
- Produces: Engagement Analytics, Customized Report Criteria
- Autonomy: **completes on its own**
- Skills it needs: data analysis, customization interface
- Owns: STORY-010, STORY-011

Autonomy is not decoration. An agent marked "waits for approval" must have somewhere on this page showing what is waiting and who has to release it — otherwise the guardrail exists only in the plan.

Each card carries a skills list. On real data there are no skills yet — show "no skills registered yet", not an empty box.

### 8. Knowledge base
Everything the project knows about itself: your requirements, your stories, your decisions, and notes you add as you go. It grows for the whole programme, so build it to be added to rather than regenerated.
Give it a chat panel that answers questions about the data on this page and cites which tab it came from. If it cannot answer from your data, it says so instead of guessing.

### 9. Data model
The tables behind all of the above, with fields and relationships. Derive them from your own requirements — they are listed in full further down. Work through each one and ask what it has to store and what that thing is called in your domain. Do not name a table after a vendor: HelloSign is a system you talk to, an agreement is a thing you store. This is a starting point, not the answer — show me the model before you create the tables.

## Sample data and real data
One global switch, visible on every tab. **Sample** fills the whole Command Center with believable made-up data so you can see the shape of it on day one. **Real** shows only what your system has actually produced — which on day one is almost nothing, and that is the point. Sample data must be visibly labelled as sample on every screen it appears on. Nobody should ever demo sample data by accident.

## Live indicators
Anything that can be connected or disconnected, running or stopped, gets a status dot with a last-checked time. Grey for unknown, not green. A dashboard that looks healthy before anything is built teaches you to distrust it.

## Your colours
Use the brand colours you chose for this project. If you have not chosen any yet, use a neutral palette and leave the choice in one place in the code so it is a one-line change later — do not scatter hex codes through the components.

## The requirements this has to reflect
Your full set, so the Command Center can show all of it:
- **REQ-001** (CONSTRAINT, must) — The system must read student login data from the Student Portal.
- **REQ-002** (CONSTRAINT, must) — The system must read student progress data from the Learning Management System.
- **REQ-003** (CONSTRAINT, must) — The system must read attendance data from the Attendance Tracking System.
- **REQ-004** (CONSTRAINT, must) — The system must send emails via the Email Platform.
- **REQ-005** (FUNC, must) — The system must generate a weekly report of students potentially falling behind based on login, progress, and attendance data.
- **REQ-006** (FUNC, must) — The system must allow instructors to review and approve the list of students before emails are sent.
- **REQ-007** (FUNC, must) — The system must provide suggested opening lines for each student in the report.
- **REQ-008** (FUNC, must) — The system must flag students for instructor review if the recommendation is uncertain.
- **REQ-009** (FUNC, must) — The system must send the final approved list to instructors every Monday morning.
- **REQ-010** (FUNC, must) — The system must allow instructors to view activity data for each student in the report.
- **REQ-011** (SAFE, must) — The system must ensure data integrity and accuracy in reports.
- **REQ-012** (OBS, must) — The system must log all actions taken by instructors for audit purposes.
- **REQ-013** (NFR, should) — Every instructor-facing screen must allow completion of its primary action in three clicks or fewer.
- **REQ-014** (NFR, should) — The system should optimize email content for engagement.
- **REQ-015** (FUNC, should) — The system should provide analytics on student engagement trends over time.
- **REQ-016** (FUNC, should) — The system should allow customization of report criteria by instructors.
- **REQ-017** (NFR, should) — The system should support multiple languages for email content.
- **REQ-018** (NFR, should) — The system should provide mobile access to reports.

## Your stories, in build order
**r0 · Initial Setup and Data Integration**
- STORY-001 — Enable instructors to log in via Student Portal and access their dashboard
- STORY-002 — Display student progress data on instructor dashboard
- STORY-003 — Show attendance data on instructor dashboard
- STORY-012 — Establish audit trail for all instructor actions
**r1 · Instructor Review and Approval**
- STORY-004 — Generate basic weekly report
- STORY-005 — Enable instructor review of reports
- STORY-006 — Flag uncertain recommendations for review
**r2 · Notification and Communication**
- STORY-007 — Send emails with suggested messages
**r3 · Data Integrity and Audit**
- STORY-008 — Implement data integrity checks
- STORY-009 — Log instructor actions for audit
**r4 · Enhancements and Analytics**
- STORY-010 — Provide analytics on student engagement trends
- STORY-011 — Allow customization of report criteria

## Done means — these exact lines
These are the acceptance criteria the platform checks. They go into `.colaberry/progress.json` **word for word** — they are matched by text, so a reworded line does not count.
- Given the Command Center, when it is opened, then every tab is reachable and every card drills down one level.
- Given sample mode, when any tab is shown, then the sample data is visibly labelled as sample.
- Trust — no tab shows a number, a connection or a result the project has not actually produced.

**While the build is paused at the Overview checkpoint, this story cannot verify yet** — the first criterion needs all nine tabs to exist. That is expected, not a fault: say **build the rest**, let the other eight get built, and then finish Step 3.

## What good looks like
- Every tab above exists and is reachable from the Command Center.
- Every card drills down one level, including the ones with no data behind them yet.
- The sample/real switch works on every tab, and sample data is labelled as sample everywhere it shows.
- The project management tab shows your real releases and your real due dates, not placeholders.
- Nothing on the page claims a number, a connection or a result that your project has not actually produced.

## Stop and ask me if
- A tab needs data your plan does not contain — build the empty state and ask, rather than inventing the data.
- You are about to hard-code a KPI value, a customer name, or an integration status.
- The guardrails tab is empty because your plan has no SAFE requirement — that is worth fixing before you build further.

## How I want you to work
- Build it so the data comes from one place. You will point it at your real system as you build, and you should not be rewriting tabs to do it.
- Show me the Overview tab first and stop. Get that right before building the other eight.
- While you are paused there, the other eight tabs must still be REACHABLE and must not look locked, greyed out, or gated. Each one renders a plain "Not built yet — say **build the rest** when Overview looks right" state. Nothing that implies the student lacks permission or has to unlock anything: the build is waiting on them, not the other way round.
- Put a short banner on Overview itself while you are paused, saying the build is stopped for their review and how to continue. When they say **build the rest**, build the remaining eight and remove the banner.

## Step 3 — finish it, so the platform can confirm it
A story is confirmed when BOTH halves are true: every acceptance criterion is ticked in `.colaberry/progress.json`, AND a commit names the story. Neither on its own is enough.
- Create or update `.colaberry/progress.json` so it carries this story with the three **Done means** lines copied word for word, each marked as passing. Only tick a line when it is actually true — the file is the claim, the commit is the evidence:

```json
{
  "stories": [
    {
      "id": "STORY-000",
      "criteria": [
        {
          "text": "Given the Command Center, when it is opened, then every tab is reachable and every card drills down one level.",
          "passed": true
        },
        {
          "text": "Given sample mode, when any tab is shown, then the sample data is visibly labelled as sample.",
          "passed": true
        },
        {
          "text": "Trust — no tab shows a number, a connection or a result the project has not actually produced.",
          "passed": true
        }
      ]
    }
  ]
}
```

- Commit with the story id in the message — `git commit -m "STORY-000: build the Command Center"` (a `Story: STORY-000` line in the body works too) — then push.
- Then tell me to watch the portal. If Step 1 worked, the criteria tick themselves within about ten seconds and the story flips to verified without me clicking anything. If I skipped Step 1, I press "Sync from GitHub" and the same thing happens.

## Step 4 — put it online (optional, one command)
GitHub Pages will host the Command Center for free, and the portal picks the address up on its own. **This is a bonus. Nothing about whether this story verifies depends on it** — skip it and Step 3 still confirms exactly the same way.
- Turn Pages on for this repo, building from the default branch:

```bash
gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pages --method POST \
  -f 'source[branch]=main' -f 'source[path]=/'
```

Use your default branch if it is not `main`.
- **If it is already on, GitHub answers 409 — that means it is done, so leave it alone and move on.** Do not delete and recreate it.
- **If it refuses because the repo is private,** Pages needs a paid plan for private repos. Tell me plainly that it was refused and carry on — do not retry it, and do not ask me to upgrade anything. The story still verifies without it.
- You do not need to find the address yourself. The first build takes a minute or two; the platform checks after each push and after a Sync, and the **Command Center** link appears in the portal header once the site actually answers.


## Acceptance — your stop condition

These are the three lines the platform checks. They are already in
`.colaberry/progress.json` word for word. Tick a box here as it genuinely passes,
and set the matching `passed` flag in that file — the JSON is what the platform
reads, this list is for you.

- [ ] Given the Command Center, when it is opened, then every tab is reachable and every card drills down one level.
- [ ] Given sample mode, when any tab is shown, then the sample data is visibly labelled as sample.
- [ ] Trust — no tab shows a number, a connection or a result the project has not actually produced.

When every box above is ticked **and** a commit names the story, the platform
confirms it on its own — within about ten seconds if you did Step 1.
