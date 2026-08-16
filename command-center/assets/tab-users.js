/* ============================================================
   TAB 3 — Users and use case.
   Who this is for and what they are trying to get done.
   Roles are taken from the plan. Where the plan does not record
   which story or requirement belongs to a role, this page matches
   on the role's name in the text and SAYS that is what it did —
   a text match is not a mapping, and the page never pretends
   otherwise.
   ============================================================ */
const TabUsers = {

  /* Words that name a role, generated from the role's own wording in
     the plan. "system administrator" also answers to "administrator"
     and "admin"; nothing else is assumed. */
  terms(role) {
    const t = [role.term];
    const words = role.term.split(/\s+/);
    if (words.length > 1) t.push(words[words.length - 1]);
    if (role.term.indexOf("administrator") >= 0) t.push("admin");
    return t;
  },

  named(g, roleId) {
    const role = g.d.roleById[roleId];
    if (!role) return { stories: [], reqs: [] };
    const t = TabUsers.terms(role);
    const hit = (s) => t.some(w => String(s).toLowerCase().indexOf(w) >= 0);
    return {
      stories: g.stories.filter(s => hit(s.title) || hit(s.narrative)),
      reqs:    g.plan.requirements.filter(r => hit(r.text))
    };
  },

  /* What each role is trying to get done. Read straight out of the
     "…so that <why>" clause of that role's own stories, and cited to
     the requirement the story says it fulfils. Nothing is invented and
     nothing is typed twice. */
  jobs(g, roleId) {
    const seen = {};
    return g.stories
      .filter(s => s.role && CC.slug(s.role) === roleId && s.why)
      .filter(s => (seen[s.why] ? false : (seen[s.why] = true)))
      .map(s => ({
        job:   CC.sentenceCase(s.why),
        story: s.id,
        req:   s.fulfills[0] || null,
        reqs:  s.fulfills
      }));
  },

  /* Who the plan talks ABOUT versus who it lets ACT.
     A role acts if some story is written "As a <role>, I want…".
     A role that only ever turns up inside requirement text is a
     subject of this system, not a user of it. Both facts are read
     from the plan; neither is asserted about anyone the plan does
     not name. */
  subjects(g) {
    const acting = {};
    g.stories.forEach(s => { if (s.role) acting[CC.slug(s.role)] = true; });

    const spokenOnly = g.plan.roles.filter(r => !acting[r.id]);
    const actors     = g.plan.roles.filter(r => acting[r.id]);

    return '<div class="note">' +
      '<b>' + actors.length + ' of ' + g.plan.roles.length + ' roles act.</b> ' +
      'A role acts when a story is written <i>As a &lt;role&gt;, I want…</i>. ' +
      (actors.length
        ? 'That is ' + actors.map(r => App.esc(r.label)).join(", ") + '. '
        : 'No story in the plan is written that way. ') +
      (spokenOnly.length
        ? '<br><br><b>' + spokenOnly.map(r => App.esc(r.label)).join(" and ") +
          '</b> appear in the plan but never as the actor in a story — the system is ' +
          'built <i>about</i> them rather than <i>for</i> them.'
        : '<br><br>Every role the plan names also has at least one story of its own.') +
      '<br><br>No other party gets a screen, an email or a login anywhere in these ' +
      'requirements. If that is wrong, it is a plan change rather than a build change.' +
    '</div>';
  },

  roleCard(g, role) {
    const n = TabUsers.named(g, role.id);
    const jobs = TabUsers.jobs(g, role.id);
    const silent = n.stories.length === 0 && n.reqs.length === 0;
    return '<a class="tile' + (silent ? " empty" : "") + '" href="' +
        App.drill("role:" + role.id) + '">' +
      '<div class="tile-top"><h3>' + App.esc(role.label) + '</h3>' +
        App.dot(silent ? "warn" : "off") + '</div>' +
      '<div class="headline">' + (silent
        ? '<small>Named in no story</small>'
        : n.stories.length + ' <small>of ' + g.d.storyTotal + ' stories name them</small>') +
      '</div>' +
      '<p class="lede">' + (silent
        ? "The plan lists this role but no story or requirement mentions it. What this " +
          "person needs is not recorded anywhere."
        : jobs.length + " things they are trying to get done, each read from a requirement.") +
      '</p>' +
      '<div class="foot"><span>' + n.reqs.length + ' requirements name them</span>' +
        '<span class="go">Open →</span></div>' +
    '</a>';
  },

  render(g) {
    const d = g.d;
    const silent = g.plan.roles.filter(r => {
      const n = TabUsers.named(g, r.id);
      return n.stories.length === 0 && n.reqs.length === 0;
    });

    /* The role with the most stories is the one this is mostly for. */
    const ranked = g.plan.roles
      .map(r => ({ role: r, n: TabUsers.named(g, r.id).stories.length,
                   jobs: TabUsers.jobs(g, r.id) }))
      .sort((a, b) => b.n - a.n);
    const lead = ranked[0] || { role: { id:"", label:"—" }, n: 0, jobs: [] };

    /* Every "so that…" clause in the plan, whoever it belongs to. */
    const allJobs = g.plan.roles.reduce(
      (acc, r) => acc.concat(TabUsers.jobs(g, r.id).map(
        j => Object.assign({ role: r }, j))), []);

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 3 of ' + d.tabsTotal + '</div>' +
        '<h1>Users and use case</h1>' +
        '<p class="tagline">Who this is for and what they are trying to get done. ' +
          'The roles are the ones your stories name.</p>' +
      '</header>' +
      '<div class="stats">' +
        App.stat({ k:"Roles", v:g.plan.roles.length, s:"named in the plan" }) +
        App.stat({ k:"Named in no story", v:silent.length,
          s:silent.length ? silent.map(r => r.label).join(", ") : "every role appears",
          dotStatus:silent.length ? "warn" : "ok" }) +
        App.stat({ k:App.esc(lead.role.label) + " stories", v:lead.n,
          unit:"of " + d.storyTotal, s:"name this role — the most of any role",
          href:App.drill("role:" + lead.role.id) }) +
        App.stat({ k:"Jobs recorded", v:allJobs.length,
          s:allJobs.length ? "from “so that…” clauses" : "no story says why",
          dotStatus:allJobs.length ? "ok" : "warn" }) +
      '</div>' +
      '<div class="sec-head"><h2>Roles</h2>' +
        '<span>Each card opens the role it names.</span></div>' +
      '<div class="grid">' + g.plan.roles.map(r => TabUsers.roleCard(g, r)).join("") + '</div>' +
      '<div class="sec-head"><h2>The use case</h2>' +
        '<span>Every “so that…” clause in the plan, cited to the story it came from.</span></div>' +
      (allJobs.length
        ? Details.table(["Role", "What they are trying to get done", "From", "Fulfils"],
            allJobs.map(j => [
              '<a href="' + App.drill("role:" + j.role.id) + '">' +
                App.esc(j.role.label) + '</a>',
              App.esc(j.job),
              '<a class="mono" href="' + App.drill("story:" + j.story) + '">' +
                App.esc(j.story) + '</a>',
              j.reqs.length
                ? j.reqs.map(rid => '<a class="mono" href="' + App.drill("req:" + rid) +
                    '">' + App.esc(rid) + '</a>').join(" ")
                : '<span class="checked">—</span>'
            ]))
        : Details.empty("No story says why",
            ["A role's job comes from the <i>so that…</i> half of its story. " +
             "No story in the plan carries one, so there is nothing to read."],
            ["Write a story as <i>As a &lt;role&gt;, I want …, so that …</i>",
             "This table fills in from it without anyone editing this page"])) +
      '<div class="sec-head"><h2>Who is not a user</h2>' +
        '<span>Named in the plan, but never as someone who acts.</span></div>' +
      TabUsers.subjects(g) +
      (silent.length
        ? '<br>' + Details.empty(
            silent.map(r => r.label).join(" and ") + ": named as a role, absent from the work",
            ["The plan lists this role, but no story and no requirement mentions it. " +
             "There is nothing to build for them and no way to tell whether the build " +
             "serves them.",
             "Rather than guess at what they need, this tab records the gap."],
            ["Decide whether this role is real for the first release",
             "If it is, write at least one story in the <i>As a &lt;role&gt;, I want…</i> form",
             "This page fills in from that story without anyone editing it"])
        : "") +
      App.footer();
  }
};

/* ---------- drill-down: one page per role ---------- */
Details.handlers["role"] = function (id, g) {
  const role = g.plan.roles.filter(r => r.id === id)[0];
  if (!role) return null;
  const n = TabUsers.named(g, id);
  const jobs = TabUsers.jobs(g, id);

  return {
    kicker: "Users",
    parent: { label: "Users and use case", href: "03-users.html" },
    title: role.label,
    lede: n.stories.length || n.reqs.length
      ? n.stories.length + " stories and " + n.reqs.length +
        " requirements name this role in their text."
      : "The plan lists this role, but nothing in the work mentions it.",
    body:
      (jobs.length
        ? Details.card("What they are trying to get done", Details.table(
            ["Job", "From the story", "Fulfils", "Requirement"],
            jobs.map(j => {
              const r = j.req ? (g.d.reqById[j.req] || {}) : {};
              return [App.esc(j.job),
                '<a class="mono" href="' + App.drill("story:" + j.story) + '">' +
                  App.esc(j.story) + '</a>',
                j.req
                  ? '<a class="mono" href="' + App.drill("req:" + j.req) + '">' +
                    App.esc(j.req) + '</a>'
                  : '<span class="checked">—</span>',
                App.esc(r.text || "the story names no requirement")];
            })))
        : "") +
      Details.card("Stories that name this role",
        n.stories.length
          ? Details.table(["Story", "Title", "Release", "Fulfils", "Status"],
              n.stories.map(s => [
                '<a class="mono" href="' + App.drill("story:" + s.id) + '">' +
                  App.esc(s.id) + '</a>',
                App.esc(s.title),
                '<a class="mono" href="' + App.drill("release:" + s.release) + '">' +
                  App.esc((s.release || "").toUpperCase()) + '</a>',
                s.fulfills.length
                  ? s.fulfills.map(rid => '<a class="mono" href="' +
                      App.drill("req:" + rid) + '">' + App.esc(rid) + '</a>').join(" ")
                  : '<span class="checked">—</span>',
                App.pill(s.status === "shipped" ? "ok" :
                         s.status === "building" ? "warn" : "unknown", s.status)]))
          : '<p><span class="checked">No story names this role.</span></p>') +
      Details.card("Requirements that name this role",
        n.reqs.length
          ? Details.table(["Requirement", "Kind", "Text"],
              n.reqs.map(r => [
                '<a class="mono" href="' + App.drill("req:" + r.id) + '">' +
                  App.esc(r.id) + '</a>',
                App.pill(r.kind === "SAFE" ? "risk" : "unknown", r.kind),
                App.esc(r.text)]))
          : '<p><span class="checked">No requirement names this role.</span></p>') +
      '<div class="note"><b>How this page was built:</b> the plan does not map stories or ' +
        'requirements to roles. Everything above is a match on the role\'s name in the text ' +
        '— useful, but not the same thing as a mapping. Treat it as a reading of the plan, ' +
        'not as the plan.</div>' +
      (n.stories.length === 0 && n.reqs.length === 0
        ? Details.empty("Nothing in the work mentions this role",
            ["The role is listed in the plan, but no story and no requirement names it.",
             "There is nothing to build for them, and no way to tell whether the build " +
             "serves them."],
            ["Decide whether this role is real for the first release",
             "If it is, write at least one story naming it",
             "This page fills in on its own"])
        : "")
  };
};
