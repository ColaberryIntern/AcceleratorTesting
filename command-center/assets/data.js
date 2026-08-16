/* ============================================================
   DATA — the only place this Command Center reads its plan.

   Everything the page says about what the project INTENDS to
   build is fetched at runtime from three files:

     ../.colaberry/plan.json      the plan of record
     ../.colaberry/progress.json  what has actually been verified
     ../.colaberry/manifest.json  the "data as of" stamp

   Nothing in this file restates their contents. Delete a story
   from plan.json, reload, and it is gone from every tab — that
   is the test this layer exists to pass.

   Those files are rewritten on every sync from the portal, and
   they only ever GAIN fields. So: read what you recognise,
   ignore what you do not, and never fail because a field you
   did not expect turned up.
   ============================================================ */
const CC = {

  /* ---------- where the files live, relative to a tab page ---------- */
  PATHS: {
    plan:     "../.colaberry/plan.json",
    progress: "../.colaberry/progress.json",
    manifest: "../.colaberry/manifest.json"
  },

  FETCH_TIMEOUT_MS: 8000,

  /* ------------------------------------------------------------------
     THE SCHEDULE ANCHOR — the one date not present in the data files.

     plan.json gives each release a week_start and week_end (r0 is
     weeks 1-4, r4 is weeks 17-20). It does not say which calendar
     day week 1 begins on. Every date shown anywhere in this build is
     derived from the file's own week numbers counted off this anchor.

     It is declared once, here, and labelled on screen as supplied
     rather than read from the plan. Change this line and the whole
     schedule moves with it.
     ------------------------------------------------------------------ */
  ANCHOR: {
    buildStart: "2026-08-15",
    source: "That anchor is supplied by the programme brief, not read from any " +
            "file in this repo.",
    demoGapDays: 7
  },

  /* ---------- small helpers ---------- */
  slug(s) {
    return String(s == null ? "" : s).toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  },

  addDays(iso, n) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  },

  sentenceCase(s) {
    s = String(s || "").trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  },

  /* Fetch one JSON file. Fails loudly and specifically — a Command
     Center that silently renders an empty plan is worse than one
     that says it could not read the plan. */
  async fetchJson(path) {
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), CC.FETCH_TIMEOUT_MS) : null;
    try {
      const res = await fetch(path, ctl ? { signal: ctl.signal } : undefined);
      if (!res.ok) {
        throw new Error("HTTP " + res.status + " " + res.statusText + " for " + path);
      }
      return await res.json();
    } catch (err) {
      if (err && err.name === "AbortError") {
        throw new Error("Timed out after " + CC.FETCH_TIMEOUT_MS + "ms reading " + path);
      }
      throw new Error(
        (err && err.message ? err.message : String(err)) + " (reading " + path + ")");
    } finally {
      if (timer) clearTimeout(timer);
    }
  },

  /* ==================================================================
     NORMALISE — turn the two files into the shape the tabs consume.

     Every value below traces to a field in plan.json or progress.json,
     or is derived from one by a rule stated in a comment. Where the
     plan is silent the value is null or [] and the tab renders an
     empty state. It never guesses.
     ================================================================== */
  normalise(plan, progress, manifest) {

    const reqsRaw    = Array.isArray(plan.requirements) ? plan.requirements : [];
    const storiesRaw = Array.isArray(plan.stories)      ? plan.stories      : [];
    const relsRaw    = Array.isArray(plan.releases)     ? plan.releases     : [];
    const agentsRaw  = Array.isArray(plan.agents)       ? plan.agents       : [];

    /* ---- requirements ------------------------------------------------
       statement -> text, priority -> level. Nothing else changes. */
    const requirements = reqsRaw.map(r => ({
      id:      r.id,
      kind:    r.kind || "FUNC",
      level:   r.priority || "must",
      cluster: r.cluster || null,
      text:    r.statement || ""
    }));

    /* ---- releases ----------------------------------------------------
       week_start/week_end -> calendar window, counted off CC.ANCHOR.
       Week N starts on day (N-1)*7 and week M ends on day M*7-1. */
    const anchor = CC.ANCHOR.buildStart;
    const releases = relsRaw.map(r => {
      const ws = Number(r.week_start), we = Number(r.week_end);
      const hasWeeks = isFinite(ws) && isFinite(we);
      return {
        id:        r.key,
        name:      r.name || r.key,
        goal:      r.goal || null,
        demo:      r.demo || null,
        weekStart: hasWeeks ? ws : null,
        weekEnd:   hasWeeks ? we : null,
        start:     hasWeeks ? CC.addDays(anchor, (ws - 1) * 7) : null,
        end:       hasWeeks ? CC.addDays(anchor, we * 7 - 1)   : null
      };
    });

    const lastEnd = releases.reduce(
      (acc, r) => (r.end && (!acc || r.end > acc) ? r.end : acc), null);

    /* ---- agents ------------------------------------------------------
       autonomy_level is the plan's word; the label is the plain-English
       reading of it shown on screen. */
    const AUTONOMY = {
      acts_autonomously: { key: "auto",  label: "Completes on its own" },
      acts_with_approval:{ key: "human", label: "Prepares, then waits for a human to release it" },
      drafts_for_human:  { key: "draft", label: "Drafts for a person" },
      recommends_only:   { key: "draft", label: "Drafts for a person" }
    };

    const agents = agentsRaw.map(a => {
      const au = AUTONOMY[a.autonomy_level] ||
                 { key: "human", label: CC.sentenceCase(
                     String(a.autonomy_level || "unspecified").replace(/_/g, " ")) };
      /* approval_gates read "REQ-011 — ..."; keep the id, drop the restatement,
         because the requirement's own text is already in the plan. */
      const gate = (a.approval_gates || [])
        .map(t => (String(t).match(/\b(REQ-\d+)\b/) || [])[1])
        .filter(Boolean);
      return {
        id:            CC.slug(a.name),
        planId:        a.id || null,
        name:          a.name,
        does:          a.purpose || "",
        firesOn:       a.trigger || "",
        trigger:       a.trigger_type || "unspecified",
        rawInputs:     Array.isArray(a.inputs)  ? a.inputs  : [],
        produces:      Array.isArray(a.outputs) ? a.outputs : [],
        autonomy:      au.key,
        autonomyLabel: au.label,
        stopsWhen:     (a.escalation_rules || []).join(" ") || null,
        blockedByReq:  gate[0] || null,
        approvalGates: gate,
        skills:        Array.isArray(a.skills) ? a.skills : [],
        owns:          Array.isArray(a.owns)   ? a.owns   : []
      };
    });

    /* ---- external systems -------------------------------------------
       plan.json has no systems list, so this is derived two ways and
       the results unioned:

       (1) A CONSTRAINT requirement declares an integration. The proper
           noun after "from the" / "via the" is the system it names.
       (2) An agent input that no agent produces came from outside.

       Delete REQ-003 and the Attendance system leaves this page. */
    const systemsBySlug = {};
    const addSystem = (name, req, role) => {
      const id = CC.slug(name);
      if (!id) return;
      if (!systemsBySlug[id]) {
        systemsBySlug[id] = { id, name, role: role || null, req: req || null };
      } else if (req && !systemsBySlug[id].req) {
        systemsBySlug[id].req = req;
        systemsBySlug[id].role = role || systemsBySlug[id].role;
      }
    };

    requirements.filter(r => r.kind === "CONSTRAINT").forEach(r => {
      const m = r.text.match(
        /\b(?:from|via|to|with|into|through)\s+the\s+([A-Z][\w]*(?:\s+[A-Z][\w]*)*)/);
      if (m) addSystem(m[1], r.id, r.text);
    });

    const producedSet = {};
    agents.forEach(a => a.produces.forEach(o => { producedSet[CC.slug(o)] = true; }));
    agents.forEach(a => a.rawInputs.forEach(i => {
      if (!producedSet[CC.slug(i)]) {
        addSystem(i, null,
          "Named as an input by an agent in the plan. No requirement names it.");
      }
    }));

    const systems = Object.keys(systemsBySlug).map(k => systemsBySlug[k]);

    /* Now that systems are known, an agent's reads can point at them.
       Anything that is not a system stays as the artifact name. */
    agents.forEach(a => {
      a.reads = a.rawInputs.map(i => (systemsBySlug[CC.slug(i)] ? CC.slug(i) : i));
    });

    /* ---- stories -----------------------------------------------------
       "As a <role>, I want <want>, so that <why>." is parsed out of the
       narrative because it is the only place the plan records a role. */
    const agentByName = {};
    agents.forEach(a => { agentByName[a.name] = a.id; });

    const stories = storiesRaw.map(s => {
      const n = String(s.narrative || "");
      const mRole = n.match(/^\s*As\s+an?\s+([^,]+?)\s*,/i);
      const mWant = n.match(/I\s+want\s+(.+?)(?:,\s*so\s+that\s|\.\s*$|$)/i);
      const mWhy  = n.match(/,\s*so\s+that\s+(.+?)\.?\s*$/i);
      return {
        id:        s.id,
        title:     s.title || s.id,
        release:   s.release || null,
        /* The plan carries release windows, not per-story dates.
           null here, and every table renders it as "—". */
        due:       null,
        agent:     agentByName[s.owner_agent] || CC.slug(s.owner_agent || ""),
        narrative: n,
        role:      mRole ? mRole[1].trim().toLowerCase() : null,
        want:      mWant ? mWant[1].trim() : null,
        why:       mWhy  ? mWhy[1].trim()  : null,
        fulfills:  Array.isArray(s.fulfills)      ? s.fulfills      : [],
        blockedBy: Array.isArray(s.blocked_by)    ? s.blocked_by    : [],
        failures:  Array.isArray(s.failure_paths) ? s.failure_paths : [],
        guidance:  s.task_guidance || null,
        acceptance:Array.isArray(s.acceptance)    ? s.acceptance    : []
      };
    });

    /* Build order: release order first, then the order the plan lists them. */
    const relRank = {};
    releases.forEach((r, i) => { relRank[r.id] = i; });
    stories.sort((a, b) =>
      (relRank[a.release] == null ? 99 : relRank[a.release]) -
      (relRank[b.release] == null ? 99 : relRank[b.release]));

    /* ---- roles -------------------------------------------------------
       Taken verbatim from the "As a <role>" clauses above. */
    const roleSeen = {};
    const roles = [];
    stories.forEach(s => {
      if (!s.role) return;
      const id = CC.slug(s.role);
      if (roleSeen[id]) return;
      roleSeen[id] = true;
      roles.push({ id, label: CC.sentenceCase(s.role), term: s.role.toLowerCase() });
    });

    /* ---- which stories cover which requirement (both directions) ---- */
    const fulfilledBy = {};
    stories.forEach(s => s.fulfills.forEach(rid => {
      (fulfilledBy[rid] = fulfilledBy[rid] || []).push(s.id);
    }));
    requirements.forEach(r => { r.fulfilledBy = fulfilledBy[r.id] || []; });

    /* ---- guardrails --------------------------------------------------
       A guardrail is a requirement typed SAFE. Which agent it binds is
       read from that agent's approval_gates, not assumed. */
    const guardrails = requirements.filter(r => r.kind === "SAFE").map(r => {
      const binder = agents.filter(a => a.approvalGates.indexOf(r.id) >= 0)[0];
      return {
        req:        r.id,
        promise:    r.text,
        enforcedBy: [],                     /* filled from produced state */
        bindsAgent: binder ? binder.id : null,
        coveredBy:  r.fulfilledBy
      };
    });

    /* ---- measures ----------------------------------------------------
       The plan names no measure with a target. The nearest thing it has
       is its NFR requirements — commitments about how the system must
       behave. Each becomes a card; none carries a value, because the
       plan records what was promised and never how far it has moved. */
    const measures = requirements.filter(r => r.kind === "NFR").map(r => {
      const num = r.text.match(/\b(\d+(?:\.\d+)?)\b/);
      return {
        id: r.id, req: r.id, name: r.text,
        target: num ? Number(num[1]) : null,
        stated: !!num,
        coveredBy: r.fulfilledBy
      };
    });

    /* ---- progress.json ------------------------------------------------
       The only file that records what has actually been verified. */
    const progStories = Array.isArray(progress && progress.stories)
      ? progress.stories : [];
    const progressById = {};
    progStories.forEach(p => {
      const crit = Array.isArray(p.criteria) ? p.criteria : [];
      const passed = crit.filter(c => c && c.passed === true).length;
      progressById[p.id] = {
        id: p.id,
        criteria: crit,
        criteriaTotal: crit.length,
        criteriaPassed: passed,
        filesTouched: Array.isArray(p.files_touched) ? p.files_touched : [],
        testsAdded:   Array.isArray(p.tests_added)   ? p.tests_added   : [],
        notes:        p.notes || null,
        updatedAt:    p.updated_at || null
      };
    });

    /* ---- assemble ---------------------------------------------------- */
    const PLAN = {
      project: {
        name:    plan.project_name || "Untitled project",
        purpose: plan.descriptor || "",
        buildStart:  anchor,
        buildEnd:    lastEnd,
        demoDay:     lastEnd ? CC.addDays(lastEnd, CC.ANCHOR.demoGapDays) : null,
        demoPrep:    lastEnd
          ? "The week between " + lastEnd + " and " +
            CC.addDays(lastEnd, CC.ANCHOR.demoGapDays) + " is demo prep."
          : "No release in the plan carries a week number, so no demo window is derived.",
        anchorSource: CC.ANCHOR.source,
        schemaVersion: plan.schema_version || null
      },

      tabs: [
        { n:1, id:"overview",   label:"Overview",   href:"index.html",         built:true },
        { n:2, id:"outcomes",   label:"Outcomes",   href:"02-outcomes.html",   built:true },
        { n:3, id:"users",      label:"Users",      href:"03-users.html",      built:true },
        { n:4, id:"guardrails", label:"Guardrails", href:"04-guardrails.html", built:true },
        { n:5, id:"systems",    label:"Systems",    href:"05-systems.html",    built:true },
        { n:6, id:"project",    label:"Project",    href:"06-project.html",    built:true },
        { n:7, id:"agents",     label:"AI agents",  href:"07-agents.html",     built:true },
        { n:8, id:"knowledge",  label:"Knowledge",  href:"08-knowledge.html",  built:true },
        { n:9, id:"model",      label:"Data model", href:"09-data-model.html", built:true }
      ],

      requirements, releases, stories, agents, systems, roles,
      guardrails, measures, outcomes: [],
      progressById,

      manifest: {
        generatedAt:   (manifest && manifest.generated_at) || null,
        planVersion:   (manifest && manifest.plan_version) || null,
        correlationId: (manifest && manifest.correlation_id) || null
      },

      progressMeta: {
        schemaVersion: (progress && progress.schema_version) || null,
        storyCount: progStories.length
      }
    };

    /* ---- derived counts. Computed, never typed twice. ---- */
    const byId = (arr) => arr.reduce((m, x) => (m[x.id] = x, m), {});
    const d = {
      reqTotal:  requirements.length,
      reqMust:   requirements.filter(r => r.level === "must").length,
      reqShould: requirements.filter(r => r.level === "should").length,
      reqByKind: {},
      reqUncovered: requirements.filter(r => r.fulfilledBy.length === 0),
      reqMustUncovered: requirements.filter(
        r => r.level === "must" && r.fulfilledBy.length === 0),
      storyTotal:   stories.length,
      releaseTotal: releases.length,
      agentTotal:   agents.length,
      agentAuto:    agents.filter(a => a.autonomy === "auto").length,
      agentHuman:   agents.filter(a => a.autonomy !== "auto").length,
      systemTotal:  systems.length,
      guardrailTotal: guardrails.length,
      measureTotal:   measures.length,
      roleTotal:      roles.length,
      outcomeTotal:   0,
      tabsBuilt: PLAN.tabs.filter(t => t.built).length,
      tabsTotal: PLAN.tabs.length,
      agentById:   byId(agents),
      systemById:  byId(systems),
      storyById:   byId(stories),
      releaseById: byId(releases),
      reqById:     byId(requirements),
      roleById:    byId(roles)
    };
    requirements.forEach(r => { d.reqByKind[r.kind] = (d.reqByKind[r.kind] || 0) + 1; });
    d.storiesIn = (rid) => stories.filter(s => s.release === rid);
    d.storiesFor = (aid) => stories.filter(s => s.agent === aid);
    PLAN.derive = d;

    return PLAN;
  },

  /* ==================================================================
     LOAD — fetch all three, normalise, publish as the global PLAN.
     ================================================================== */
  async load() {
    const [plan, progress, manifest] = await Promise.all([
      CC.fetchJson(CC.PATHS.plan),
      CC.fetchJson(CC.PATHS.progress),
      /* The stamp is the least critical of the three: without it the
         page loses its age warning but every tab still renders. */
      CC.fetchJson(CC.PATHS.manifest).catch(() => null)
    ]);
    window.PLAN = CC.normalise(plan, progress, manifest);
    return window.PLAN;
  },

  /* ==================================================================
     AGE — how old the data is, from manifest.generated_at.
     "Data as of", not "last synced": the stamp moves when the DATA
     changes, so a sync that found nothing new leaves it alone. An old
     stamp means either nothing has happened or nobody has synced, and
     this page cannot tell which — so it prompts a sync either way.
     ================================================================== */
  age(iso, now) {
    if (!iso) {
      return { known: false, level: "warn", absolute: "unknown",
               relative: "no timestamp in manifest.json",
               text: "Data as of an unknown date — .colaberry/manifest.json carries no " +
                     "generated_at. Sync from the portal to refresh." };
    }
    const t = new Date(iso);
    if (isNaN(t.getTime())) {
      return { known: false, level: "warn", absolute: String(iso),
               relative: "unreadable timestamp",
               text: "Data as of an unreadable timestamp. Sync from the portal to refresh." };
    }
    now = now || new Date();
    const days = (now - t) / 86400000;
    const absolute = t.toLocaleDateString(undefined,
      { day: "numeric", month: "long", year: "numeric" });

    let relative, level;
    if (days < 0)           { relative = "timestamped in the future"; level = "warn"; }
    else if (days < 1/24)   { relative = "just now";                  level = "ok";   }
    else if (days < 1)      { relative = Math.round(days * 24) + " hours ago"; level = "ok"; }
    else if (days < 2)      { relative = "1 day ago";                 level = "ok";   }
    else if (days < 7)      { relative = Math.round(days) + " days ago"; level = "ok"; }
    else if (days < 14)     { relative = "1 week ago";                level = "warn"; }
    else if (days < 60)     { relative = Math.round(days / 7) + " weeks ago"; level = "warn"; }
    else                    { relative = Math.round(days / 30) + " months ago"; level = "warn"; }

    return {
      known: true, level, days,
      absolute, relative,
      text: "Data as of " + absolute + " (" + relative + ")" +
            (level === "warn" ? " — sync from the portal to refresh." : "")
    };
  }
};
