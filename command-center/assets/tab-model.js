/* ============================================================
   TAB 9 — Data model.

   Derived table by table from the 18 requirements, asking what
   each one has to STORE and what that thing is called in this
   domain. A table is never named after a vendor: the Student
   Portal is a system we talk to; a login event is what we keep.

   This is a PROPOSAL, not a schema. Nothing has been created.
   ============================================================ */
const TabModel = {

  bands: [
    { id:"people",  label:"Who and what",             note:"The people and the structure they sit in." },
    { id:"signals", label:"What the systems tell us",  note:"One row per observation, kept raw." },
    { id:"report",  label:"The weekly report",         note:"What gets judged, reviewed and approved." },
    { id:"send",    label:"Sending",                   note:"What actually left the building." },
    { id:"trust",   label:"Trust and connection",      note:"Cuts across everything above." }
  ],

  tables: [
    { t:"student", band:"people", stores:"A person whose engagement is being monitored.",
      reqs:["REQ-001","REQ-002","REQ-003"],
      fields:["id","external_ref","full_name","email","status"], refs:[] },
    { t:"instructor", band:"people", stores:"A person who receives a report and acts on it.",
      reqs:["REQ-006","REQ-009","REQ-013"],
      fields:["id","external_ref","full_name","email","locale"], refs:[] },
    { t:"course", band:"people", stores:"The unit an instructor teaches and a student is enrolled in.",
      reqs:["REQ-002","REQ-003"], fields:["id","code","title","term"], refs:[] },
    { t:"enrollment", band:"people",
      stores:"Which students are whose — the link that makes a report per-instructor possible.",
      reqs:["REQ-005"],
      fields:["id","student_id","course_id","instructor_id","enrolled_on","is_active"],
      refs:["student","course","instructor"] },

    { t:"login_event", band:"signals", stores:"One recorded student sign-in.",
      reqs:["REQ-001"],
      fields:["id","student_id","occurred_at","source_connection_id","ingested_at"],
      refs:["student","source_connection"] },
    { t:"progress_record", band:"signals",
      stores:"A point-in-time reading of how far a student has got in a course.",
      reqs:["REQ-002"],
      fields:["id","student_id","course_id","captured_at","items_completed","items_total",
              "source_connection_id"],
      refs:["student","course","source_connection"] },
    { t:"attendance_record", band:"signals", stores:"One attendance observation for one session.",
      reqs:["REQ-003"],
      fields:["id","student_id","course_id","session_date","state","source_connection_id"],
      refs:["student","course","source_connection"] },
    { t:"engagement_snapshot", band:"signals",
      stores:"The weekly roll-up a flag is decided from, and the series the trend analytics read.",
      reqs:["REQ-005","REQ-015"],
      fields:["id","student_id","course_id","week_start","days_since_login","progress_delta",
              "sessions_missed","score","computed_at"],
      refs:["student","course"] },

    { t:"report_criteria", band:"report",
      stores:"The thresholds an instructor uses to decide who is flagged.",
      reqs:["REQ-016"],
      fields:["id","instructor_id","course_id","name","rules","is_default","updated_at"],
      refs:["instructor","course"] },
    { t:"weekly_report", band:"report",
      stores:"One report, for one instructor, for one week — and its approval state.",
      reqs:["REQ-005","REQ-006","REQ-009"],
      fields:["id","instructor_id","week_start","criteria_id","generated_at","state",
              "approved_by","approved_at"],
      refs:["instructor","report_criteria"] },
    { t:"report_line", band:"report",
      stores:"One student's place in one report: why flagged, the opening line, and whether " +
             "the recommendation is uncertain.",
      reqs:["REQ-005","REQ-007","REQ-008","REQ-010"],
      fields:["id","report_id","student_id","snapshot_id","reason","confidence","is_uncertain",
              "suggested_opening","is_included"],
      refs:["weekly_report","student","engagement_snapshot"] },

    { t:"message_template", band:"send",
      stores:"The wording an email is built from, one row per language.",
      reqs:["REQ-014","REQ-017"], fields:["id","key","locale","subject","body"], refs:[] },
    { t:"email_message", band:"send",
      stores:"One email actually sent, with the key that makes a re-run safe.",
      reqs:["REQ-004","REQ-009","REQ-017"],
      fields:["id","report_id","instructor_id","template_id","locale","to_address",
              "idempotency_key","queued_at","sent_at","provider_message_id","state","error_class"],
      refs:["weekly_report","instructor","message_template"] },

    { t:"instructor_action", band:"trust",
      stores:"Every action an instructor takes — the audit trail itself.",
      reqs:["REQ-012"],
      fields:["id","instructor_id","action","subject_type","subject_id","occurred_at",
              "correlation_id","detail"],
      refs:["instructor"] },
    { t:"integrity_check", band:"trust",
      stores:"The result of one data-integrity check — what turns REQ-011 from a sentence " +
             "into a guarantee.",
      reqs:["REQ-011"],
      fields:["id","check_name","subject_type","subject_id","ran_at","outcome","detail"],
      refs:[] },
    { t:"source_connection", band:"trust",
      stores:"One external system's connection state and the last time it was checked.",
      reqs:["REQ-001","REQ-002","REQ-003","REQ-004"],
      fields:["id","system_key","display_name","state","last_checked_at","last_error"], refs:[] }
  ],

  inBand(id) { return TabModel.tables.filter(t => t.band === id); },

  byName(n) { return TabModel.tables.filter(t => t.t === n)[0]; },

  /* Requirements that force no table, and why. */
  noTable(g) {
    const covered = {};
    TabModel.tables.forEach(t => t.reqs.forEach(r => { covered[r] = true; }));
    return g.plan.requirements.filter(r => !covered[r.id]);
  },

  /* ---------- diagram: bands, generated from the data ---------- */
  diagram() {
    const W = 1120, PAD = 18, BAND_H = 104, LABEL_W = 168;
    const H = TabModel.bands.length * BAND_H + 26;
    let parts = [], y = 14;

    TabModel.bands.forEach((b, bi) => {
      const rows = TabModel.inBand(b.id);
      const areaX = LABEL_W + PAD, areaW = W - areaX - PAD;
      const boxW = (areaW - (rows.length - 1) * 12) / rows.length;

      parts.push('<rect class="m-band" x="' + PAD + '" y="' + y + '" width="' + (W - PAD * 2) +
        '" height="' + (BAND_H - 16) + '" rx="10"/>');
      parts.push('<text class="m-bandlabel" x="' + (PAD + 16) + '" y="' + (y + 28) + '">' +
        App.esc(b.label) + '</text>');
      parts.push('<text class="m-bandnote" x="' + (PAD + 16) + '" y="' + (y + 46) + '">' +
        App.esc(b.note) + '</text>');
      parts.push('<text class="m-bandnote" x="' + (PAD + 16) + '" y="' + (y + 64) + '">' +
        rows.length + ' tables</text>');

      rows.forEach((t, i) => {
        const x = areaX + i * (boxW + 12);
        parts.push('<a href="' + App.drill("table:" + t.t) + '">' +
          '<rect class="m-box" x="' + x.toFixed(1) + '" y="' + (y + 14) +
            '" width="' + boxW.toFixed(1) + '" height="' + (BAND_H - 44) + '" rx="8"/>' +
          '<text class="m-name" x="' + (x + 11).toFixed(1) + '" y="' + (y + 36) + '">' +
            App.esc(t.t) + '</text>' +
          '<text class="m-meta" x="' + (x + 11).toFixed(1) + '" y="' + (y + 54) + '">' +
            t.fields.length + ' fields</text>' +
          '<text class="m-meta" x="' + (x + 11).toFixed(1) + '" y="' + (y + 70) + '">' +
            t.reqs.length + ' reqs · ' + t.refs.length + ' links</text>' +
          '</a>');
      });

      if (bi < TabModel.bands.length - 1 && b.id !== "send")
        parts.push('<path class="m-arrow" d="M' + (W / 2) + ' ' + (y + BAND_H - 16) +
          ' l0 10 m-5 -5 l5 5 l5 -5"/>');
      y += BAND_H;
    });

    return '<div class="scroll-x"><svg class="model" viewBox="0 0 ' + W + ' ' + H +
      '" width="100%" height="' + H + '" role="img" ' +
      'aria-label="Proposed data model, ' + TabModel.tables.length +
      ' tables in ' + TabModel.bands.length + ' bands">' + parts.join("") + '</svg></div>';
  },

  render(g) {
    const d = g.d;
    const orphan = TabModel.noTable(g);
    const created = g.dataModel.status === "created";

    document.getElementById("page").innerHTML =
      '<header class="hero">' +
        '<div class="eyebrow">Tab 9 of ' + d.tabsTotal + '</div>' +
        '<h1>Data model</h1>' +
        '<p class="tagline">' + TabModel.tables.length + ' tables derived from the ' +
          d.reqTotal + ' requirements. A starting point, not the answer.</p>' +
        '<div class="said"><div class="lbl">Status</div><p>' +
          '<b>Proposed. Nothing has been created.</b> Each table below states what it stores ' +
          'and which requirements force it to exist. Review it before any table is made — ' +
          'this is the model, shown first, as asked.</p></div>' +
      '</header>' +
      '<div class="stats">' +
        App.stat({ k:"Tables proposed", v:TabModel.tables.length,
          s:"across " + TabModel.bands.length + " bands" }) +
        App.stat({ k:"Tables created", v:created ? g.dataModel.tables.length : 0,
          s:created ? "in the sample projection" : "none — the model is a proposal",
          sample:g.isSample, dotStatus:created ? "ok" : "off" }) +
        App.stat({ k:"Requirements covered", v:d.reqTotal - orphan.length, unit:"of " + d.reqTotal,
          s:orphan.length + " force no table" }) +
        App.stat({ k:"Relationships", v:TabModel.tables.reduce((n, t) => n + t.refs.length, 0),
          s:"foreign keys between tables" }) +
      '</div>' +
      '<div class="sec-head"><h2>The model</h2>' +
        '<span>Every box opens the table it names.</span></div>' +
      TabModel.diagram() +
      '<div class="note" style="margin-top:12px"><b>Naming rule applied throughout:</b> ' +
        'a table is named for the thing it stores, never for the system it came from. ' +
        'There is no <span class="mono">student_portal</span> table — there is a ' +
        '<span class="mono">login_event</span> table, and a single ' +
        '<span class="mono">source_connection</span> row that records which system it ' +
        'arrived through. Swapping the Student Portal for something else changes one row, ' +
        'not the schema.</div>' +
      '<div class="sec-head"><h2>Every table</h2>' +
        '<span>What it stores, and the requirements that force it.</span></div>' +
      Details.table(["Table", "Band", "What it stores", "Forced by", "Fields"],
        TabModel.tables.map(t => [
          '<a class="mono" href="' + App.drill("table:" + t.t) + '">' + App.esc(t.t) + '</a>',
          App.esc((TabModel.bands.filter(b => b.id === t.band)[0] || {}).label || ""),
          App.esc(t.stores),
          t.reqs.map(r => '<a class="mono" href="' + App.drill("req:" + r) + '">' +
            App.esc(r) + '</a>').join(" "),
          t.fields.length])) +
      '<div class="sec-head"><h2>Requirements that force no table</h2>' +
        '<span>' + orphan.length + ' of ' + d.reqTotal + '. Worth checking rather than assuming.</span></div>' +
      Details.table(["Requirement", "Kind", "Text", "Why no table"],
        orphan.map(r => [
          '<a class="mono" href="' + App.drill("req:" + r.id) + '">' + App.esc(r.id) + '</a>',
          App.pill(r.kind === "SAFE" ? "risk" : "unknown", r.kind),
          App.esc(r.text),
          App.esc(r.kind === "NFR"
            ? "A property of the interface, not a thing to store."
            : "Behaviour over existing tables rather than new state.")])) +
      '<div class="note" style="margin-top:14px"><b>Before anything is created:</b> this ' +
        'model is a reading of your requirements, and readings can be wrong. The three ' +
        'places it is most likely to be wrong are ' +
        '<span class="mono">enrollment</span> (the plan never says how a student is ' +
        'attached to an instructor), <span class="mono">engagement_snapshot</span> (the ' +
        'plan never says the flag is computed weekly and stored rather than computed on ' +
        'demand), and <span class="mono">report_criteria</span> (REQ-016 allows ' +
        'customization but does not say per instructor, per course, or both).</div>' +
      App.footer();
  }
};

/* ---------- drill-down: one page per table ---------- */
Details.handlers["table"] = function (id, g) {
  const t = TabModel.byName(id);
  if (!t) return null;
  const band = TabModel.bands.filter(b => b.id === t.band)[0] || {};
  const usedBy = TabModel.tables.filter(x => x.refs.indexOf(t.t) >= 0);
  const created = g.dataModel.status === "created" && g.dataModel.tables.indexOf(t.t) >= 0;

  return {
    kicker: "Data model · " + (band.label || ""),
    parent: { label: "Data model", href: "09-data-model.html" },
    title: t.t,
    lede: t.stores,
    body:
      Details.card("Status",
        '<p>' + App.statusText(created ? "ok" : "off", null) +
        (g.isSample ? " " + App.sampleChip() : "") + '</p>' +
        '<p style="margin-top:8px">' + (created
          ? "Present in the sample projection."
          : "<b>Proposed, not created.</b> This table does not exist. Nothing has been run " +
            "against a database.") + '</p>') +
      Details.card("Fields",
        '<p>' + t.fields.map(f => '<span class="pill unknown mono">' + App.esc(f) + '</span>')
          .join(" ") + '</p>') +
      Details.card("Requirements that force it to exist", Details.table(
        ["Requirement", "Kind", "Text"],
        t.reqs.map(r => {
          const rq = g.d.reqById[r] || {};
          return ['<a class="mono" href="' + App.drill("req:" + r) + '">' + App.esc(r) + '</a>',
            App.pill(rq.kind === "SAFE" ? "risk" : "unknown", rq.kind || "—"),
            App.esc(rq.text || "—")];
        }))) +
      Details.card("Relationships",
        (t.refs.length || usedBy.length)
          ? Details.table(["Direction", "Table", "What it means"],
              t.refs.map(r => ["points to",
                '<a class="mono" href="' + App.drill("table:" + r) + '">' + App.esc(r) + '</a>',
                "Each " + t.t + " belongs to one " + r + "."])
              .concat(usedBy.map(u => ["pointed to by",
                '<a class="mono" href="' + App.drill("table:" + u.t) + '">' +
                  App.esc(u.t) + '</a>',
                "Each " + u.t + " belongs to one " + t.t + "."])))
          : '<p><span class="checked">Stands alone — nothing references it and it ' +
            'references nothing.</span></p>')
  };
};
