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
     THE SCHEDULE FALLBACK.

     Newer plan.json files carry real calendar dates: plan.schedule
     gives build_start / build_end / demo_day, and each release gives
     starts_on / ends_on. When those are present they are used, and
     nothing here applies.

     Older files carry only week_start / week_end per release and no
     calendar dates at all. For those, week 1 is counted off the anchor
     below and the page says on screen that it did so.

     Which of the two happened is recorded in project.datesFrom, and
     every tab that prints a date reads it.
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
