/* ============================================================
   NORMALISE — turn the three .colaberry files into the one shape
   every tab consumes.

   Split out of data.js, which loads the files; this file only
   shapes what they contain. Loaded after data.js, before any tab.

   Every value below traces to a field in plan.json or
   progress.json, or is derived from one by a rule stated in a
   comment. Newer plan files carry fields older ones do not
   (plan.schedule, plan.derived.*, due_on, fulfilled_by); those
   are preferred where present and derived where absent, so this
   file works against either shape and needs no version check.

   Where the plan is silent the value is null or [] and the tab
   renders an empty state. It never guesses.
   ============================================================ */
CC.normalise = function (plan, progress, manifest) {

    const reqsRaw    = Array.isArray(plan.requirements) ? plan.requirements : [];
    const storiesRaw = Array.isArray(plan.stories)      ? plan.stories      : [];
    const relsRaw    = Array.isArray(plan.releases)     ? plan.releases     : [];
    const agentsRaw  = Array.isArray(plan.agents)       ? plan.agents       : [];

    const derived  = (plan.derived && typeof plan.derived === "object") ? plan.derived : {};
    const schedule = (plan.schedule && typeof plan.schedule === "object") ? plan.schedule : {};

    /* ---- requirements ------------------------------------------------
       statement -> text, priority -> level. fulfilled_by is used when the
       file carries it; otherwise it is rebuilt from the stories below. */
    const requirements = reqsRaw.map(r => ({
      id:      r.id,
      kind:    r.kind || "FUNC",
      level:   r.priority || "must",
      cluster: r.cluster || null,
      text:    r.statement || "",
      fulfilledBy: Array.isArray(r.fulfilled_by) ? r.fulfilled_by.slice() : null
    }));

    /* ---- releases ----------------------------------------------------
       starts_on / ends_on when the file has them. Otherwise the week
       numbers counted off CC.ANCHOR: week N starts on day (N-1)*7 and
       week M ends on day M*7-1. */
    const anchor = schedule.build_start || CC.ANCHOR.buildStart;
    let datesFromFile = !!schedule.build_start;

    const releases = relsRaw.map(r => {
      const ws = Number(r.week_start), we = Number(r.week_end);
      const hasWeeks = isFinite(ws) && isFinite(we);
      const start = r.starts_on || (hasWeeks ? CC.addDays(anchor, (ws - 1) * 7) : null);
      const end   = r.ends_on   || (hasWeeks ? CC.addDays(anchor, we * 7 - 1)   : null);
      if (!r.starts_on) datesFromFile = false;
      return {
        id:        r.key,
        name:      r.name || r.key,
        goal:      r.goal || null,
        demo:      r.demo || null,
        isDemoTarget: r.is_demo_target === true,
        storyIds:  Array.isArray(r.story_ids) ? r.story_ids.slice() : null,
        weekStart: hasWeeks ? ws : null,
        weekEnd:   hasWeeks ? we : null,
        start, end
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
      recommends_only:   { key: "draft", label: "Drafts for a person" },
      suggests:          { key: "draft", label: "Drafts for a person" }
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
       derived.systems when the file carries it. Otherwise derived two
       ways and unioned:

       (1) A CONSTRAINT requirement declares an integration. The proper
           noun after "from the" / "via the" is the system it names.
       (2) An agent input that no agent produces came from outside.

       Either way, deleting the last thing that names a system removes
       it from this page. */
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

    /* The file's own list wins when it has one. */
    if (Array.isArray(derived.systems) && derived.systems.length) {
      derived.systems.forEach(name => addSystem(name, null, null));
    }

    /* A CONSTRAINT requirement names the system it integrates with. Used
       either to create the system, or to attach the requirement to one
       derived.systems already listed under a slightly different name. */
    requirements.filter(r => r.kind === "CONSTRAINT").forEach(r => {
      const m = r.text.match(
        /\b(?:from|via|to|with|into|through)\s+the\s+([A-Z][\w]*(?:\s+[A-Z][\w]*)*)/);
      if (!m) return;
      const exact = systemsBySlug[CC.slug(m[1])];
      /* "Learning Management System" in a requirement and "Learning
         Management" in derived.systems are the same system. Match on
         either being a prefix of the other before creating a duplicate. */
      const near = exact || Object.keys(systemsBySlug).map(k => systemsBySlug[k])
        .filter(s => {
          const a = CC.slug(s.name), b = CC.slug(m[1]);
          return a.indexOf(b) === 0 || b.indexOf(a) === 0;
        })[0];
      if (near) { if (!near.req) { near.req = r.id; near.role = r.text; } }
      else addSystem(m[1], r.id, r.text);
    });

    if (!(Array.isArray(derived.systems) && derived.systems.length)) {
      const producedSet = {};
      agents.forEach(a => a.produces.forEach(o => { producedSet[CC.slug(o)] = true; }));
      agents.forEach(a => a.rawInputs.forEach(i => {
        if (!producedSet[CC.slug(i)]) {
          addSystem(i, null,
            "Named as an input by an agent in the plan. No requirement names it.");
        }
      }));
    }

    const systems = Object.keys(systemsBySlug).map(k => systemsBySlug[k]);
    systems.forEach(s => {
      if (!s.role) s.role = "Named in the plan as a system this connects to. " +
        "No requirement in the plan names it.";
    });

    /* Now that systems are known, an agent's reads can point at them.
       Matched loosely for the same reason as above — an agent reading
       the "Learning Management System" is reading the system the plan
       lists as "Learning Management". Anything that resolves to no
       system stays as the artifact name it is. */
    const resolveSystem = (name) => {
      const want = CC.slug(name);
      if (systemsBySlug[want]) return want;
      const hit = systems.filter(s => {
        const have = CC.slug(s.name);
        return have.indexOf(want) === 0 || want.indexOf(have) === 0;
      })[0];
      return hit ? hit.id : null;
    };
    agents.forEach(a => {
      a.reads = a.rawInputs.map(i => resolveSystem(i) || i);
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
        /* due_on is the date the story carries NOW; due_baseline_on is
           the date it was first given. The gap between them is slippage,
           and both are kept so a chart cannot quietly move the target.
           Older plans carry neither, and every table then renders "—". */
        due:       s.due_on || null,
        dueBaseline: s.due_baseline_on || null,
        slipDays:  (s.due_on && s.due_baseline_on)
          ? Math.round((new Date(s.due_on + "T00:00:00") -
                        new Date(s.due_baseline_on + "T00:00:00")) / 86400000)
          : null,
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
       derived.roles when the file lists them, otherwise taken verbatim
       from the "As a <role>" clauses parsed above. */
    const roleSeen = {};
    const roles = [];
    const addRole = (name) => {
      const id = CC.slug(name);
      if (!id || roleSeen[id]) return;
      roleSeen[id] = true;
      roles.push({ id, label: CC.sentenceCase(name), term: String(name).toLowerCase() });
    };
    if (Array.isArray(derived.roles) && derived.roles.length) derived.roles.forEach(addRole);
    else stories.forEach(s => { if (s.role) addRole(s.role); });

    /* ---- which stories cover which requirement -----------------------
       fulfilled_by from the file when present; otherwise inverted from
       each story's own fulfills list. */
    const fulfilledBy = {};
    stories.forEach(s => s.fulfills.forEach(rid => {
      (fulfilledBy[rid] = fulfilledBy[rid] || []).push(s.id);
    }));
    const storyExists = {};
    stories.forEach(s => { storyExists[s.id] = true; });
    requirements.forEach(r => {
      if (!r.fulfilledBy) r.fulfilledBy = fulfilledBy[r.id] || [];
      /* fulfilled_by can name a story that has since left the plan. Such
         an id is not coverage — a requirement whose only covering story
         was deleted is uncovered, and has to read that way. The dangling
         ids are kept separately so a tab can say so rather than drop
         them silently. */
      r.fulfilledByMissing = r.fulfilledBy.filter(sid => !storyExists[sid]);
      r.fulfilledBy = r.fulfilledBy.filter(sid => storyExists[sid]);
    });

    /* ---- guardrails --------------------------------------------------
       derived.guardrails when the file lists them, otherwise every
       requirement typed SAFE. Which agent a guardrail binds is read
       from that agent's approval_gates, never assumed. */
    const guardIds = (Array.isArray(derived.guardrails) && derived.guardrails.length)
      ? derived.guardrails.map(x => (x && x.id) || x)
      : requirements.filter(r => r.kind === "SAFE").map(r => r.id);

    const guardrails = guardIds.map(rid => {
      const r = requirements.filter(x => x.id === rid)[0];
      const fromDerived = (derived.guardrails || [])
        .filter(x => x && x.id === rid)[0];
      const binder = agents.filter(a => a.approvalGates.indexOf(rid) >= 0)[0];
      return {
        req:        rid,
        promise:    (r && r.text) || (fromDerived && fromDerived.statement) || "",
        enforcedBy: [],                     /* filled from produced state */
        bindsAgent: binder ? binder.id : null,
        coveredBy:  (r && r.fulfilledBy) || []
      };
    }).filter(gr => gr.promise);

    /* ---- measures ----------------------------------------------------
       derived.measures when the file lists them, otherwise the NFR
       requirements — the plan's commitments about how the system must
       behave. Either way none carries a value, because these files
       record what was promised and never how far it has moved. */
    const measureIds = (Array.isArray(derived.measures) && derived.measures.length)
      ? derived.measures.map(x => (x && x.id) || x)
      : requirements.filter(r => r.kind === "NFR").map(r => r.id);

    const measures = measureIds.map(rid => {
      const r = requirements.filter(x => x.id === rid)[0];
      const fromDerived = (derived.measures || []).filter(x => x && x.id === rid)[0];
      const text = (r && r.text) || (fromDerived && fromDerived.statement) || "";
      const num = text.match(/\b(\d+(?:\.\d+)?)\b/);
      return {
        id: rid, req: rid, name: text,
        target: num ? Number(num[1]) : null,
        stated: !!num,
        coveredBy: (r && r.fulfilledBy) || []
      };
    }).filter(m => m.name);

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
    const proj      = (plan.project && typeof plan.project === "object") ? plan.project : {};
    const buildEnd  = schedule.build_end || lastEnd;
    const demoDay   = schedule.demo_day ||
                      (buildEnd ? CC.addDays(buildEnd, CC.ANCHOR.demoGapDays) : null);

    const PLAN = {
      project: {
        name:    proj.name || plan.project_name || "Untitled project",
        purpose: proj.descriptor || plan.descriptor || "",
        repoUrl: proj.repo_url || null,
        buildStart: schedule.build_start || anchor,
        buildEnd:   buildEnd,
        demoDay:    demoDay,
        buildWeeks: schedule.build_weeks || null,
        demoPrep:   (buildEnd && demoDay)
          ? "The " + (Math.round(
              (new Date(demoDay + "T00:00:00") - new Date(buildEnd + "T00:00:00"))
              / 86400000)) + " days between " + buildEnd + " and " + demoDay +
            " are demo prep."
          : "The plan carries no build end, so no demo window is derived.",
        /* Where the dates on this page actually came from. Every tab
           that prints one reads this rather than assuming. */
        datesFrom: datesFromFile ? "file" : "anchor",
        anchorSource: datesFromFile
          ? "Dates are read from plan.json — schedule.build_start and each " +
            "release's starts_on / ends_on."
          : "plan.json carries release week numbers but no calendar dates, so " +
            "week 1 is counted from " + anchor + ". " + CC.ANCHOR.source,
        /* Demo-prep tasks, when the plan schedules them. */
        prep: Array.isArray(schedule.prep)
          ? schedule.prep.map(x => ({ key: x.key, title: x.title, due: x.due_on || null }))
          : [],
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
};
