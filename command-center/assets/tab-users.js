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

  /* Words that name each role in the plan's own prose. */
  terms: {
    instructor: ["instructor"],
    sysadmin:   ["system administrator", "administrator", "admin"]
  },

  named(g, roleId) {
    const t = TabUsers.terms[roleId] || [];
    const hit = (s) => t.some(w => s.toLowerCase().indexOf(w) >= 0);
    return {
      stories: g.stories.filter(s => hit(s.title)),
      reqs:    g.plan.requirements.filter(r => hit(r.text))
    };
  },

  /* What each role is trying to get done, each line citing the
     requirement it is read from. Nothing here is invented. */
  jobs: {
    instructor: [
      { req:"REQ-005", job:"Know which students are falling behind without reading three " +
             "systems by hand" },
      { req:"REQ-010", job:"See the activity data behind a flag before acting on it" },
      { req:"REQ-006", job:"Check and approve the list before anything is sent" },
      { req:"REQ-007", job:"Have something to open with when making contact" },
      { req:"REQ-009", job:"Get the final list on Monday morning" },
      { req:"REQ-013", job:"Finish the primary action on any screen in three clicks or fewer" }
    ],
    sysadmin: []
  },

  roleCard(g, role) {
    const n = TabUsers.named(g, role.id);
    const jobs = TabUsers.jobs[role.id] || [];
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
        App.stat({ k:"Instructor stories", v:TabUsers.named(g, "instructor").stories.length,
          unit:"of " + d.storyTotal, s:"name the role in their title" }) +
        App.stat({ k:"Who receives the email", v:'<small>Instructor</small>',
          s:"REQ-009 — students are the subject, not the recipient" }) +
      '</div>' +
      '<div class="sec-head"><h2>Roles</h2>' +
        '<span>Each card opens the role it names.</span></div>' +
      '<div class="grid">' + g.plan.roles.map(r => TabUsers.roleCard(g, r)).join("") + '</div>' +
      '<div class="sec-head"><h2>The use case</h2>' +
        '<span>Read from the requirements, each line citing its source.</span></div>' +
      Details.table(["What the instructor is trying to do", "Read from"],
        TabUsers.jobs.instructor.map(j => [
          App.esc(j.job),
          '<a class="mono" href="' + App.drill("req:" + j.req) + '">' + App.esc(j.req) + '</a>'
        ])) +
      '<div class="sec-head"><h2>Who is not a user</h2><span>Worth being explicit about.</span></div>' +
      '<div class="note"><b>Students are the subject of this system, not its users.</b> ' +
        'REQ-009 sends the final approved list <i>to instructors</i>, and REQ-007 gives the ' +
        'instructor an opening line to use. No requirement in the plan gives a student a ' +
        'screen, an email or a login. If that is wrong, it is a plan change rather than a ' +
        'build change.</div>' +
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
  const jobs = TabUsers.jobs[id] || [];

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
            ["Job", "Read from", "Requirement"],
            jobs.map(j => {
              const r = g.d.reqById[j.req] || {};
              return [App.esc(j.job),
                '<a class="mono" href="' + App.drill("req:" + j.req) + '">' +
                  App.esc(j.req) + '</a>',
                App.esc(r.text || "—")];
            })))
        : "") +
      Details.card("Stories that name this role",
        n.stories.length
          ? Details.table(["Story", "Title", "Release", "Due", "Status"],
              n.stories.map(s => [
                '<a class="mono" href="' + App.drill("story:" + s.id) + '">' +
                  App.esc(s.id) + '</a>',
                App.esc(s.title),
                '<a class="mono" href="' + App.drill("release:" + s.release) + '">' +
                  App.esc(s.release.toUpperCase()) + '</a>',
                '<span class="mono">' + App.fmtShort(s.due) + '</span>',
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
