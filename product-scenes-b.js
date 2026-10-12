/* Scenes 4-5: meeting intelligence + people discovery. */
(function (g) {
  'use strict';
  var PS = g.PS = g.PS || {};
  var el = HE.el, C = HE.Cards, wait = HE.wait;

  /* =====================================================================
     SCENE 4: MEETING INTELLIGENCE (Before / During / After)
     ===================================================================== */
  PS.meetings = function (root) {
    var M = HD.meeting, S = HS.get();
    var tabs = el('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Meeting stages' }), card = el('div', { class: 'mt-card' });
    root.appendChild(tabs); root.appendChild(card);
    var panes = {}, cur = 'before';
    ['before:Before', 'during:During', 'after:After'].forEach(function (t) {
      var id = t.split(':')[0], b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(id === 'before'), 'aria-controls': 'mt-' + id, text: t.split(':')[1], on: { click: function () { show(id); } } }); b.dataset.id = id; tabs.appendChild(b);
      panes[id] = el('div', { id: 'mt-' + id, role: 'tabpanel', hidden: id === 'before' ? null : 'hidden' }); card.appendChild(panes[id]);
    });
    tabs.addEventListener('keydown', function (e) { var ids = ['before', 'during', 'after'], i = ids.indexOf(cur); if (e.key === 'ArrowRight') show(ids[(i + 1) % 3], true); if (e.key === 'ArrowLeft') show(ids[(i + 2) % 3], true); });
    function show(id, focus) {
      cur = id; HE.$$('button', tabs).forEach(function (b) { var on = b.dataset.id === id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      Object.keys(panes).forEach(function (k) { if (k === id) panes[k].removeAttribute('hidden'); else panes[k].setAttribute('hidden', 'hidden'); });
      if (id === 'after') renderAfter();
    }

    /* ---------- BEFORE ---------- */
    (function () {
      var p = panes.before, left = el('div'), right = el('div', { class: 'side' });
      p.appendChild(el('div', { class: 'mt-grid' }, [left, right]));
      left.appendChild(el('div', { class: 'card-k', text: 'Today · ' + M.time + ' · ' + M.length }));
      left.appendChild(el('h3', { text: M.title, style: 'font-size:2.2rem;margin:4px 0 6px' }));
      left.appendChild(el('p', { text: M.place + ' · with Sophia Marlowe', style: 'color:#625f5a' }));
      var out = el('div', { class: 'ws-main', 'aria-live': 'polite' }), btn = el('button', { type: 'button', class: 'pill pri', text: 'Prepare me' });
      var meta = el('div', { class: 'ctl' }, [btn, el('span', { class: 'demo-note', text: 'HUMAN reads your calendar, past notes and messages you allowed.' })]);
      left.appendChild(meta); left.appendChild(el('div', { style: 'height:14px' })); left.appendChild(out);
      var b = M.brief, sections = [['Who she is', [b.who]], ['Where you left off', [b.last]], ['She cares about', b.interests], ['You promised', b.promises], ['Suggested talking points', b.points]], busy = false, done = false;
      btn.addEventListener('click', async function () {
        if (busy) return; if (done) { out.innerHTML = ''; done = false; }
        busy = true; btn.disabled = true; btn.textContent = 'Preparing…';
        for (var i = 0; i < sections.length; i++) {
          var sec = el('div', { class: 'card', style: 'animation:pop .45s both' }, [el('div', { class: 'card-k', text: sections[i][0] })]);
          var ul = el('ul', { class: 'mb-l' }); sections[i][1].forEach(function (t) { ul.appendChild(el('li', { text: t })); }); sec.appendChild(ul); out.appendChild(sec); await wait(520);
        }
        busy = false; done = true; btn.disabled = false; btn.textContent = 'Prepare again'; HS.log('meeting', 'Prepared a briefing for Coffee with Sophia');
      });
      var cal = el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'Your calendar' }), el('span', { class: 'st', text: 'Live' })])]), calList = el('ul', { class: 'logl' }); cal.appendChild(calList);
      function paintCal() { calList.innerHTML = ''; HS.get().calendar.forEach(function (e) { calList.appendChild(el('li', { class: e.title === M.title ? 'sel' : '' }, [el('time', { text: e.day.slice(0, 3) + ' ' + e.time.replace(' ', '') }), el('span', { text: e.title + (e.pending ? ' (proposed)' : '') })])); }); }
      HS.on('calendar', paintCal); HS.on('reset', paintCal); paintCal();
      right.appendChild(cal);
      right.appendChild(el('div', { class: 'glass' }, [el('h4', { text: 'Permissions' }), el('div', { class: 'perms' }, ['Read calendar', 'Read past notes', 'No sending without approval'].map(function (t) { return el('span', { text: t }); }))]));
    })();

    /* ---------- DURING ---------- */
    var dur = (function () {
      var p = panes.during, grid = el('div', { class: 'mt-grid' }), left = el('div'), right = el('div', { class: 'side' });
      p.appendChild(grid); grid.appendChild(left); grid.appendChild(right);
      var consent = el('div', { class: 'sw' }, [el('div', {}, [el('b', { text: 'Recording consent' }), el('small', { text: 'Demo: no microphone is used. A sample transcript plays.' })]), el('button', { type: 'button', role: 'switch', 'aria-checked': 'false', 'aria-label': 'Allow recording for this meeting' })]);
      var sw = consent.querySelector('button'); sw.addEventListener('click', function () { var on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', String(on)); rec.className = 'rec off'; recTxt.textContent = on ? 'Ready to record (consent given)' : 'Not recording (no consent)'; startBtn.disabled = !on; if (!on) pauseRun(); });
      var rec = el('span', { class: 'rec off' }, [el('i'), ]), recTxt = el('span', { text: 'Not recording (no consent)' }); rec.appendChild(recTxt);
      var wave = el('div', { class: 'wave', 'aria-hidden': 'true' }); for (var w = 0; w < 56; w++) { var bar = el('i'); bar.style.setProperty('--h', (25 + Math.abs(Math.sin(w * 1.7)) * 70) + '%'); bar.style.animationDelay = (w % 9) * 0.09 + 's'; wave.appendChild(bar); }
      var clock = el('b', { text: '00:00', style: 'font:600 1.4rem var(--serif)' }), startBtn = el('button', { type: 'button', class: 'pill pri', text: 'Start recording' }), skipBtn = el('button', { type: 'button', class: 'pill', text: 'Jump to the end' });
      startBtn.disabled = true;
      var ctlRow = el('div', { class: 'ctl', style: 'margin:10px 0' }, [startBtn, skipBtn, clock]);
      var tr = el('div', { class: 'tr', role: 'log', 'aria-live': 'polite', 'aria-label': 'Live transcript' });
      left.appendChild(consent); left.appendChild(el('div', { style: 'margin:14px 0 6px' }, [rec])); left.appendChild(wave); left.appendChild(ctlRow); left.appendChild(el('h4', { text: 'Live transcript (sample, clearly labelled)', style: 'font:700 .72rem var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#625f5a;margin:10px 0' })); left.appendChild(tr);
      // notes
      var notesBox = el('div', { class: 'glass notes' }, [el('h4', {}, [el('span', { text: 'Your private notes' }), el('span', { class: 'st', id: 'draft-st', text: S.notes.draft ? 'Draft restored' : 'Empty' })])]);
      var ta = el('textarea', { 'aria-label': 'Your notes', placeholder: 'Type notes alongside the transcript…' }); ta.value = S.notes.draft;
      var saveBtn = el('button', { type: 'button', class: 'pill', text: 'Save draft' }), saved = el('span', { class: 'demo-note', text: '' });
      notesBox.appendChild(ta); notesBox.appendChild(el('div', { class: 'ctl', style: 'margin-top:8px' }, [saveBtn, saved]));
      saveBtn.addEventListener('click', function () { HS.get().notes.draft = ta.value; HS.save(); saved.textContent = 'Draft saved on this device ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); notesBox.querySelector('.st').textContent = 'Saved'; });
      ta.addEventListener('input', function () { HS.get().notes.draft = ta.value; notesBox.querySelector('.st').textContent = 'Typing…'; });
      var moments = el('div', { class: 'glass' }, [el('h4', { text: 'Important moments' })]), mList = el('ul', { class: 'logl' }); moments.appendChild(mList);
      right.appendChild(notesBox); right.appendChild(moments);
      mList.appendChild(el('li', { class: 'empty', text: 'Tap ★ on any line to highlight it.' }));
      var idx = 0, timer = null, running = false, hl = {};
      function addLine(i) {
        var L = M.transcript[i], ln = el('div', { class: 'ln' + (hl[i] ? ' hi' : '') }, [el('time', { text: L.t }), el('b', { text: L.who }), el('span', { text: L.text })]);
        var star = el('button', { type: 'button', class: 'pill sm hl', 'aria-pressed': String(!!hl[i]), 'aria-label': 'Highlight this moment', text: '★', on: { click: function () { hl[i] = !hl[i]; star.setAttribute('aria-pressed', String(hl[i])); ln.classList.toggle('hi', hl[i]); paintMoments(); } } }); ln.appendChild(star);
        tr.appendChild(ln); tr.scrollTop = tr.scrollHeight; clock.textContent = L.t;
      }
      function paintMoments() { mList.innerHTML = ''; var any = false; Object.keys(hl).forEach(function (k) { if (hl[k]) { any = true; var L = M.transcript[k]; mList.appendChild(el('li', {}, [el('time', { text: L.t }), el('span', { text: L.text })])); } }); if (!any) mList.appendChild(el('li', { class: 'empty', text: 'Tap ★ on any line to highlight it.' })); dur.highlights = Object.keys(hl).filter(function (k) { return hl[k]; }).map(Number); }
      function step() { if (!running) return; if (idx >= M.transcript.length) { finish(); return; } addLine(idx++); timer = setTimeout(step, HE.ms(2000)); }
      function finish() { running = false; wave.classList.remove('live'); rec.className = 'rec off'; recTxt.textContent = 'Recording finished'; startBtn.textContent = 'Replay'; startBtn.disabled = false; HS.log('meeting', 'Captured the Coffee with Sophia transcript (sample)'); }
      function pauseRun() { running = false; clearTimeout(timer); wave.classList.remove('live'); if (idx < M.transcript.length && sw.getAttribute('aria-checked') === 'true') { rec.className = 'rec off'; recTxt.textContent = 'Paused'; startBtn.textContent = idx ? 'Resume' : 'Start recording'; } }
      startBtn.addEventListener('click', function () {
        if (running) { pauseRun(); return; }
        if (idx >= M.transcript.length) { idx = 0; tr.innerHTML = ''; hl = {}; paintMoments(); }
        running = true; wave.classList.add('live'); rec.className = 'rec'; recTxt.textContent = 'Recording (sample, consent given)'; startBtn.textContent = 'Pause'; step();
      });
      skipBtn.addEventListener('click', function () { clearTimeout(timer); running = false; while (idx < M.transcript.length) addLine(idx++); finish(); });
      var api = { highlights: [], lines: function () { return idx; }, hl: function () { return hl; } };
      HS.on('reset', function () { idx = 0; tr.innerHTML = ''; hl = {}; paintMoments(); });
      return api;
    })();

    /* ---------- AFTER ---------- */
    var edits = {}, share = {}, tplSel, custom = '', note, sharedNote, actionsEl, askOut;
    function cap(a) { return a.slice(); }
    function sectionsFor(tpl) {
      var A = M.analysis, mine = HS.get().notes.draft.trim();
      var map = {
        'Personal catch-up': [['How Sophia is', [A.summary]], ['Life updates', A.takeaways], ['Promises', A.promises], ['Next time', [A.next].concat(A.open)]],
        'Coffee meeting': [['Highlights', A.takeaways], ['Recommendations', ['Book: "Four Thousand Weeks" (you will send it)', 'Shoot 35mm film in Soho, morning light']], ['Follow-ups', A.actions.map(function (a) { return a.text + ' (' + a.due + ')'; })], ['Next coffee', [A.next]]],
        'Interview': [['Background', [A.summary]], ['Signals', A.decisions], ['Open questions', A.open], ['Next steps', A.actions.map(function (a) { return a.text; })]],
        'Brainstorm': [['Ideas raised', ['Photograph how robotics lab spaces feel', 'Film walk around Soho at 9 AM']], ['Themes', ['Creative residency', 'Technology and people']], ['Experiments to try', A.actions.map(function (a) { return a.text; })], ['Decisions', A.decisions]],
        'General meeting': [['Summary', [A.summary]], ['Key takeaways', A.takeaways], ['Decisions', A.decisions], ['Action items', A.actions.map(function (a) { return a.text + ' · ' + a.owner + ' · ' + a.due; })], ['Open questions', A.open]]
      };
      var secs;
      if (tpl === 'Custom') {
        var heads = (custom || 'Summary, Decisions, Actions, Mood').split(',').map(function (h) { return h.trim(); }).filter(Boolean);
        secs = heads.map(function (h) { var l = h.toLowerCase(); var items = /summary|overview/.test(l) ? [A.summary] : /takeaway|highlight/.test(l) ? A.takeaways : /decision/.test(l) ? A.decisions : /promise|commit/.test(l) ? A.promises : /action|todo|task|follow/.test(l) ? A.actions.map(function (a) { return a.text; }) : /next/.test(l) ? [A.next] : /open|question/.test(l) ? A.open : /people|who/.test(l) ? M.people : ['(add your own notes here)']; return [h, items]; });
      } else secs = map[tpl].map(function (s) { return [s[0], cap(s[1])]; });
      if (mine) secs.push(['Your private notes', mine.split('\n').filter(Boolean)]);
      return secs;
    }
    function renderAfter() {
      var p = panes.after; if (!p.dataset.built) { buildAfter(p); p.dataset.built = '1'; }
      paintNote();
    }
    function buildAfter(p) {
      var grid = el('div', { class: 'mt-grid' }), left = el('div'), right = el('div', { class: 'side' }); p.appendChild(grid); grid.appendChild(left); grid.appendChild(right);
      // template + custom
      tplSel = el('select', { 'aria-label': 'Note template', on: { change: function () { S.notes.template = tplSel.value; HS.save(); customRow.hidden = tplSel.value !== 'Custom'; paintNote(); } } }, M.templates.map(function (t) { return el('option', { value: t, text: t }); })); tplSel.value = S.notes.template;
      var customIn = el('input', { placeholder: 'Headings, e.g. Mood, Summary, Actions', 'aria-label': 'Custom headings' }), customRow = el('div', { class: 'ask-row', hidden: S.notes.template === 'Custom' ? null : 'hidden' }, [customIn, el('button', { type: 'button', class: 'pill', text: 'Build template', on: { click: function () { custom = customIn.value; paintNote(); } } })]);
      left.appendChild(el('div', { class: 'ctl', style: 'justify-content:space-between;margin-bottom:12px' }, [el('label', { class: 'field', style: 'min-width:220px' }, ['Template', tplSel]), el('div', { class: 'ctl' }, [el('button', { type: 'button', class: 'pill', text: 'Regenerate', on: { click: function () { edits = {}; paintNote(); HS.log('meeting', 'Regenerated notes'); } } }), el('button', { type: 'button', class: 'pill pri', text: 'Save notes', on: { click: saveNotes } })])]));
      left.appendChild(customRow);
      note = el('div', { class: 'note-doc', 'aria-live': 'polite' }); left.appendChild(note);
      left.appendChild(el('p', { class: 'demo-note', id: 'save-note', text: 'Click any text to edit it. Section share toggles control what goes in follow-ups.' }));
      // actions
      actionsEl = el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'Action items' }), el('span', { class: 'st', text: 'Extracted' })])]); right.appendChild(actionsEl);
      M.analysis.actions.forEach(function (a) { var cb = el('input', { type: 'checkbox', 'aria-label': 'Done: ' + a.text }); actionsEl.appendChild(el('label', { class: 'act' }, [cb, el('span', {}, [a.text, el('br'), el('small', { text: a.owner + ' · due ' + a.due })]), el('small', { text: '' })])); });
      // follow up
      var fuBtn = el('button', { type: 'button', class: 'pill pur', text: 'Take care of the follow-ups', style: 'padding:14px 20px;font-size:1rem' }), fuBox = el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'The most important button' })]), el('p', { text: 'HUMAN does the work after the meeting, then asks before anything leaves your hands.', style: 'font-size:.92rem;color:#625f5a' }), fuBtn]);
      var fuProg = el('div'), fuBoard = el('div', { class: 'glass', hidden: 'hidden' }, [el('h4', {}, [el('span', { text: 'Follow-up board' }), el('span', { class: 'st', text: 'Live' })])]), boardList = el('ul', { class: 'logl', style: 'max-height:none' }); fuBoard.appendChild(boardList);
      right.appendChild(fuBox); right.appendChild(fuProg); right.appendChild(fuBoard);
      function paintBoard() { var S2 = HS.get(); boardList.innerHTML = ''; S2.drafts.forEach(function (d) { boardList.appendChild(el('li', {}, [el('time', { text: 'Draft' }), el('span', {}, [el('b', { text: d.subject }), ' → ' + d.to + ' ', HE.status(d.status, /sent/.test(d.status) ? 'ok' : /held/.test(d.status) ? 'no' : 'warn')])])); }); S2.tasks.forEach(function (t) { boardList.appendChild(el('li', {}, [el('time', { text: 'Reminder' }), el('span', {}, [t.title + ' · ' + t.due + ' ', HE.status(t.status, 'ok')])])); }); S2.calendar.filter(function (e) { return e.source === 'HUMAN-meet'; }).forEach(function (e) { boardList.appendChild(el('li', {}, [el('time', { text: 'Calendar' }), el('span', {}, [e.title + ' · ' + e.day + ' ' + e.time + ' ', HE.status(e.pending ? 'proposed' : 'confirmed (demo)', e.pending ? 'warn' : 'ok')])])); }); fuBoard.hidden = !boardList.children.length; }
      HS.on('drafts', paintBoard); HS.on('tasks', paintBoard); HS.on('calendar', paintBoard); HS.on('reset', function () { fuBoard.hidden = true; boardList.innerHTML = ''; fuProg.innerHTML = ''; fuBtn.disabled = false; });
      var tp = null, fr = null;
      fuBtn.addEventListener('click', function () {
        if (fr && (fr.state === 'running' || fr.state === 'waiting')) return;
        fuProg.innerHTML = ''; var labels = ['Preparing an email to Sophia', 'Drafting the promised introduction', 'Creating reminders', 'Proposing the next meeting', 'Updating Sophia\'s relationship memory', 'Requesting approval for anything external', 'Marking authorized demo actions complete'];
        tp = C.TaskProgress({ title: 'Following up', kicker: 'HUMAN is working', steps: labels.map(function (l) { return { label: l }; }) }); var wrap = el('div', { class: 'workspace', style: 'margin:0;padding:14px' }); wrap.appendChild(tp); fuProg.appendChild(wrap);
        var shared = sectionsFor(S.notes.template).filter(function (s) { return share[s[0]] !== false && s[0] !== 'Your private notes'; });
        fr = new HE.Runner({ steps: [
          { id: 'e1', ms: 700, run: function () { var d = HS.addDraft({ to: 'Sophia', subject: 'Four Thousand Weeks, and Thursday', body: 'Hi Sophia, great catching up. Here is the book I promised. Still on for the film walk Thursday the 21st at 9? Sharing only: ' + shared.map(function (s) { return s[0]; }).join(', ') + '.' }); tp.set(0, 'doing', d.body); } },
          { id: 'e2', ms: 700, run: function () { var d = HS.addDraft({ to: 'Sophia + Priya', subject: 'Introducing Sophia and Priya', body: 'Sophia photographs how lab spaces feel; Priya works on warehouse robotics. I think you two would enjoy meeting.' }); tp.set(1, 'doing', d.body); } },
          { id: 'e3', ms: 700, run: function () { HS.addTask({ title: 'Ask Maya about renting out a flat', due: 'This week' }); HS.addTask({ title: 'Find a place that sells 35mm film', due: 'Before Thursday' }); tp.set(2, 'doing', 'Two reminders created with owners and deadlines.'); } },
          { id: 'e4', ms: 700, run: function () { var ev = HS.addEvent({ day: 'Thursday 21st', time: '9:00 AM', title: 'Film walk with Sophia', source: 'HUMAN-meet', pending: true }); tp.set(3, 'doing', 'Proposed (not confirmed until Sophia agrees).'); } },
          { id: 'e5', ms: 700, run: function () { HS.addMemory('sophia', 'fact', 'Leaving for Lisbon on September 3rd (three-month residency, solo show)'); HS.addMemory('sophia', 'promise', 'Film walk Thursday the 21st at 9 AM'); tp.set(4, 'doing', 'Two memories added to Sophia\'s profile.'); } },
          { id: 'e6', ms: 300, approval: { custom: function (r) { return C.Approval({ title: 'Send these two messages?', body: 'An email to Sophia and an introduction to Sophia and Priya. Your private notes are not included.', perms: ['Send email (demo)', 'Propose calendar time'], approveLabel: 'Approve and send', rejectLabel: 'Hold them', onApprove: function () { r.approve(); }, onReject: function () { r.reject(); } }); } }, run: function () { tp.set(5, 'doing', 'Waiting for you. Nothing external happens without approval.'); } },
          { id: 'e7', ms: 500, run: function () { HS.get().drafts.forEach(function (d) { d.status = 'sent (demo, not delivered)'; }); HS.emit('drafts'); HS.log('meeting', 'Follow-ups done: 2 messages, 2 reminders, 1 proposed meeting (demo)'); tp.set(6, 'doing', 'Marked complete. These are demonstration actions.'); } }
        ] }, {
          onStepStart: function (st, i) { tp.set(i, 'doing'); },
          onStepDone: function (st, i) { tp.set(i, 'done'); },
          onApproval: function (st, i, r) { var node = st.approval.custom(r); fuProg.appendChild(node); },
          onReject: function (st, i) { HS.get().drafts.forEach(function (d) { d.status = 'held (not sent)'; }); HS.emit('drafts'); tp.set(i, 'failed', 'You held them. Nothing was sent.'); tp.finish('Stopped'); HS.log('meeting', 'Held follow-up messages. Nothing sent'); },
          onDone: function () { tp.finish('Done'); }
        });
        fr.start();
      });
      // ask HUMAN
      var askIn = el('input', { placeholder: 'Ask HUMAN: what did Sophia say about her trip?', 'aria-label': 'Ask HUMAN about this meeting' }), askBtn = el('button', { type: 'button', class: 'pill pri', text: 'Ask' });
      askOut = el('div', { 'aria-live': 'polite' });
      var chips = el('div', { class: 'ideas' }, ['What did Sophia say about her trip?', 'What did I promise to send?', 'When should I follow up?'].map(function (q) { return HE.chip(q, function () { askIn.value = q; ask(); }); }));
      right.appendChild(el('div', { class: 'glass' }, [el('h4', { text: 'Ask HUMAN about this meeting' }), el('div', { class: 'ask-row' }, [askIn, askBtn]), chips, askOut]));
      function ask() { var q = askIn.value.trim(); if (!q) return; askOut.innerHTML = ''; var a = answer(q); askOut.appendChild(el('div', { class: 'ans' }, [el('b', { text: a.text }), el('div', { class: 'demo-note', text: a.src })])); }
      askBtn.addEventListener('click', ask); askIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') ask(); });
      // cross-meeting history
      var hist = el('div', { class: 'glass' }, [el('h4', { text: 'Meeting memory across people' })]), people = el('div', { class: 'ppl' }), hs = el('input', { placeholder: 'Search every meeting (try: lisbon, tennis, agency)', 'aria-label': 'Search meetings', style: 'width:100%;border:1.5px solid rgba(22,21,28,.18);border-radius:999px;padding:11px 16px;font:400 .94rem var(--sans);margin:10px 0' }), hl = el('div', { class: 'hist' });
      hist.appendChild(people); hist.appendChild(hs); hist.appendChild(hl); left.appendChild(el('div', { style: 'height:16px' })); left.appendChild(hist);
      var selPerson = null;
      ['Sophia', 'Priya', 'Maya', 'Jordan'].forEach(function (n) { var b = el('button', { type: 'button', 'aria-pressed': 'false' }, [HE.avatar(n.toLowerCase()), n]); b.addEventListener('click', function () { selPerson = selPerson === n ? null : n; HE.$$('button', people).forEach(function (x) { var on = x === b && selPerson; x.classList.toggle('on', !!on); x.setAttribute('aria-pressed', String(!!on)); }); paintHist(); }); people.appendChild(b); });
      hs.addEventListener('input', paintHist);
      function paintHist() {
        var q = hs.value.trim().toLowerCase(), toks = q.split(/\s+/).filter(Boolean); hl.innerHTML = '';
        var items = M.history.concat([{ id: 'cur', person: 'Sophia', title: M.title + ' (today)', date: 'Today', text: M.analysis.summary }]).filter(function (h) { if (selPerson && h.person !== selPerson) return false; if (!toks.length) return true; var hay = (h.title + ' ' + h.text + ' ' + h.person).toLowerCase(); return toks.every(function (t) { return hay.indexOf(t) > -1; }); });
        if (!items.length) { hl.appendChild(el('div', { class: 'empty', text: 'No meetings match. Try a person or a word like Lisbon.' })); return; }
        items.forEach(function (h) { var txt = h.text; if (toks.length) toks.forEach(function (t) { txt = txt.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '\u0001$1\u0002'); }); var html = HE.esc(txt).replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>'); hl.appendChild(el('div', { class: 'h' }, [el('b', { text: h.person + ' · ' + h.title }), el('small', { text: h.date }), el('div', { html: html })])); });
      }
      paintHist();
    }
    function paintNote() {
      if (!note) return; var tpl = S.notes.template; note.innerHTML = '';
      var secs = sectionsFor(tpl);
      note.appendChild(el('div', { class: 'card-k', text: M.title + ' · ' + M.time + ' · generated from the transcript, your notes and ' + dur.lines() + ' captured lines' }));
      secs.forEach(function (s) {
        var key = tpl + '|' + s[0], h = el('h5', { text: s[0] }); note.appendChild(h);
        var priv = s[0] === 'Your private notes';
        var ul = el('ul'); (edits[key] || s[1]).forEach(function (t, i) { var li = el('li'), sp = el('span', { contenteditable: 'true', spellcheck: 'false', role: 'textbox', 'aria-label': s[0] + ' item', text: t }); sp.addEventListener('input', function () { var arr = edits[key] || s[1].slice(); arr[i] = sp.textContent; edits[key] = arr; }); li.appendChild(sp); ul.appendChild(li); }); note.appendChild(ul);
        var sh = el('label', { class: 'demo-note', style: 'display:flex;gap:6px;align-items:center' }, [el('input', { type: 'checkbox', 'aria-label': 'Share ' + s[0] + ' in follow-ups' }), priv ? 'Private. Never shared' : 'Include in follow-ups']); var cb = sh.firstChild; cb.checked = priv ? false : share[s[0]] !== false; cb.disabled = priv; cb.addEventListener('change', function () { share[s[0]] = cb.checked; }); note.appendChild(sh);
      });
      if (dur.highlights && dur.highlights.length) { note.appendChild(el('h5', { text: 'Moments you highlighted' })); var u = el('ul'); dur.highlights.forEach(function (i) { u.appendChild(el('li', { text: M.transcript[i].t + ' · ' + M.transcript[i].text })); }); note.appendChild(u); }
    }
    function saveNotes() { var S2 = HS.get(); S2.notes.saved = note.innerText; S2.notes.template = tplSel.value; HS.save(); var n = document.getElementById('save-note'); if (n) n.textContent = 'Notes saved on this device at ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.'; HS.log('meeting', 'Saved notes (' + S2.notes.template + ')'); }
    function answer(q) {
      var ql = q.toLowerCase(), A = M.analysis;
      if (/promis/.test(ql)) return { text: 'You promised: ' + A.promises.join(' · '), src: 'From: Promises extracted from the transcript (00:52, 01:29, 03:25)' };
      if (/follow/.test(ql) && /(when|date|time)/.test(ql)) return { text: 'Follow up Thursday the 21st at 9 AM for the film walk. Send the book tonight.', src: 'From the transcript at 02:02 and 02:20' };
      var toks = HD.tokens(q), best = null, bs = 0;
      M.transcript.forEach(function (L) { var hay = L.text.toLowerCase(), sc = 0; toks.forEach(function (t) { if (hay.indexOf(t) > -1) sc += 2; }); if (/trip|lisbon|travel/.test(ql) && /lisbon|residency|leaving/.test(hay)) sc += 3; if (sc > bs) { bs = sc; best = L; } });
      if (best) return { text: best.who + ' said: "' + best.text + '"', src: 'From the transcript at ' + best.t };
      var mine = (HS.get().notes.draft || '').split('\n').filter(function (l) { var lc = l.toLowerCase(); return toks.some(function (t) { return lc.indexOf(t) > -1; }); })[0];
      if (mine) return { text: 'In your notes: "' + mine + '"', src: 'From your private notes' };
      return { text: 'I could not find that in this meeting. Try asking about Lisbon, the book, Priya, or the next meeting.', src: 'Searched the transcript, notes and summary' };
    }
    HS.on('reset', function () { edits = {}; share = {}; var ap = panes.after; ap.innerHTML = ''; delete ap.dataset.built; });
    return { show: show };
  };

  /* =====================================================================
     SCENE 5: PEOPLE DISCOVERY (search, cards, consent flow, map, meet now)
     ===================================================================== */
  PS.people = function (root) {
    var S = HS.get(), prompts = ['Someone to get coffee with tonight.', 'People nearby who love psychology.', 'Someone to play tennis with this weekend.', 'Find a cofounder who loves robotics.', 'Someone to explore the city with.', 'A friend who loves books and long conversations.'];
    var disc = el('div', { class: 'disc' }); root.appendChild(disc);
    var input = el('input', { placeholder: 'Who would you love to meet?', 'aria-label': 'Describe who you want to meet', maxlength: '140' }), go = el('button', { type: 'button', class: 'pill pri', text: 'Search' });
    var sb = el('div', { class: 'searchbox' }, [input, go]);
    var viewSeg = el('div', { class: 'seg2', role: 'group', 'aria-label': 'View' }, [el('button', { type: 'button', class: 'on', 'aria-pressed': 'true', text: 'List' }), el('button', { type: 'button', 'aria-pressed': 'false', text: 'Map' })]);
    var meetNow = el('button', { type: 'button', class: 'meet-now', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Meet someone now' });
    var ex = el('div', { class: 'examples' }); prompts.forEach(function (t) { ex.appendChild(HE.chip(t, function () { input.value = t; run(); })); });
    var top = el('div', { class: 'ctl', style: 'justify-content:space-between;margin:14px 0 4px' }, [viewSeg, meetNow]);
    var anim = el('div', { class: 'searching', hidden: 'hidden', 'aria-hidden': 'true' }), listEl = el('div', { class: 'results', 'aria-live': 'polite' }), mapEl = el('div', { hidden: 'hidden' }), status = el('p', { class: 'demo-note', 'aria-live': 'polite' });
    [sb, ex, top, anim, status, listEl, mapEl].forEach(function (n) { disc.appendChild(n); });
    var results = HD.profiles.map(function (p) { return { p: p, score: 0, why: [] }; }), dismissed = {}, token = 0, view = 'list', selected = null, lastQuery = '';

    /* --- search --- */
    async function run() {
      var q = input.value.trim(); if (!q) { status.textContent = 'Type who you would love to meet, or tap an example.'; input.focus(); return; }
      var my = ++token; lastQuery = q; listEl.innerHTML = ''; status.textContent = ''; anim.removeAttribute('hidden'); anim.innerHTML = '';
      var toks = HD.tokens(q).slice(0, 8); toks = toks.length ? toks : q.split(/\s+/).slice(0, 4);
      toks.forEach(function (t, i) { var w = el('span', { class: 'qw', text: t }); w.style.left = (8 + (i * 83) % 82) + '%'; w.style.top = (15 + (i * 37) % 55) + '%'; w.style.animationDelay = (i * 0.25) + 's'; anim.appendChild(w); });
      anim.appendChild(el('div', { class: 'dots' }, [el('i'), el('i'), el('i')]));
      await wait(1500); if (my !== token) return; anim.setAttribute('hidden', 'hidden');
      results = HD.searchProfiles(q); paint(true); if (view === 'map') mapApi.refresh();
    }
    function paint(animate) {
      listEl.innerHTML = '';
      var vis = results.filter(function (r) { return !dismissed[r.p.id]; });
      if (!vis.length) { listEl.appendChild(el('div', { class: 'empty', style: 'grid-column:1/-1;padding:30px' }, [el('b', { text: results.length ? 'You have passed on everyone for now.' : 'No one matches that yet.' }), el('div', { text: results.length ? 'Change the search or undo a pass below.' : 'Try fewer words, a different activity, or tap an example. HUMAN will keep looking and tell you when someone new fits.' })])); status.textContent = results.length ? '' : 'No matches for "' + lastQuery + '".'; paintUndo(); return; }
      status.textContent = lastQuery ? vis.length + ' people match "' + lastQuery + '". Approximate areas only. Nothing is shared until both of you agree.' : 'Everyone nearby in this demo. Search to narrow it down.';
      vis.forEach(function (r, i) { var c = card(r); if (animate) c.style.animationDelay = (i * 0.15) + 's'; listEl.appendChild(c); });
      paintUndo();
    }
    function paintUndo() { var ids = Object.keys(dismissed); if (!ids.length) return; var b = el('button', { type: 'button', class: 'pill', style: 'grid-column:1/-1;justify-self:center', text: 'Undo passes (' + ids.length + ')', on: { click: function () { dismissed = {}; paint(false); if (view === 'map') mapApi.refresh(); } } }); listEl.appendChild(b); }
    function compat(r) {
      var p = r.p, shared = r.why.filter(function (w) { return ['nearby', 'tonight', 'weekend', 'now'].indexOf(w) < 0; });
      var parts = []; if (shared.length) parts.push('You both mentioned ' + shared.slice(0, 3).join(', ')); if (r.why.indexOf('tonight') > -1 || r.why.indexOf('now') > -1) parts.push(p.availText.toLowerCase()); else if (r.why.indexOf('weekend') > -1) parts.push(p.availText.toLowerCase());
      if (!parts.length) parts.push('Shares your interest in ' + p.interests[0]); return parts.join(' · ') + '.';
    }
    var FLOW = ['Discovered', 'Introduction requested', 'Recipient accepted', 'Connected', 'Meetup suggested', 'Meeting confirmed'];
    function card(r) {
      var p = r.p, per = HD.people[p.id], conn = S.connections[p.id];
      var c = el('article', { class: 'pcard', 'aria-label': per.name });
      c.appendChild(el('div', { class: 'pc-ph', html: HE.portrait(per) + '<span class="nm">' + HE.esc(per.name) + '</span><span class="dist">≈ ' + p.dist.toFixed(1) + ' km · ' + HE.esc(p.area) + '</span>' }));
      var inf = el('div', { class: 'pc-in' }); c.appendChild(inf);
      inf.appendChild(el('div', { class: 'tg' }, p.interests.map(function (t) { return el('span', { text: t }); })));
      inf.appendChild(el('div', { html: '<b>' + HE.esc(p.does) + '</b><br><small style="color:#625f5a">' + HE.esc(p.availText) + ' · prefers ' + ({ coffee: 'coffee', walk: 'a walk', sport: 'a game', class: 'a class', video: 'video first' }[p.format]) + '</small>' }));
      inf.appendChild(el('div', { class: 'why', text: 'Why HUMAN suggests ' + per.name + ': ' + compat(r) }));
      var tw = el('button', { type: 'button', class: 'pill sm', text: p.twin ? 'Ask ' + per.name + '\'s AI twin' : 'AI twin not shared' }); tw.disabled = !p.twin; tw.addEventListener('click', function () { twinSheet(p); }); inf.appendChild(tw);
      var flowEl = el('div', { class: 'flow', role: 'list', 'aria-label': 'Connection progress' }), detail = el('div', { class: 'demo-note', 'aria-live': 'polite' });
      var react = el('div', { class: 'react' }), heart = el('button', { type: 'button', class: 'heart', 'aria-label': 'Send ' + per.name + ' a connection request', html: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.5 1.1 4.3 2.5C11.5 6.1 13 5 15 5c3.400 0 5.500 3.400 4 6.800C19.500 16.400 12 21 12 21z"/></svg> Heart' }),
        broken = el('button', { type: 'button', class: 'broken', 'aria-label': 'Pass on ' + per.name, html: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c1.800 0 3.200.9 4.100 2.100L9 11l3 2-1.500 4z"/><path d="M13 7.200C13.900 5.800 15.300 5 17 5c3.400 0 5.500 3.400 4 6.800C19.700 15.100 15 18.500 13 19.900l1.500-3.900-3-2 2-3z" opacity=".55"/></svg> Heartbreak' });
      react.appendChild(heart); react.appendChild(broken); inf.appendChild(react); inf.appendChild(flowEl); inf.appendChild(detail);
      c.flowEl = flowEl; c.detail = detail; c.heart = heart; c.broken = broken; c.p = p;
      broken.addEventListener('click', function () { dismissed[p.id] = true; c.style.transition = 'opacity .3s,transform .3s'; c.style.opacity = '0'; c.style.transform = 'scale(.9)'; setTimeout(function () { paint(false); if (view === 'map') mapApi.refresh(); }, 280); });
      heart.addEventListener('click', function () { startConnection(p, c); });
      c.addEventListener('click', function (e) { if (!e.target.closest('button')) select(p.id); });
      if (conn) renderFlow(p, c);
      return c;
    }
    function renderFlow(p, c) {
      var conn = S.connections[p.id]; if (!conn) return; c.heart.disabled = true; c.broken.disabled = true;
      c.flowEl.innerHTML = ''; FLOW.forEach(function (n, i) { var cls = i < conn.stage ? 'done' : i === conn.stage ? 'cur' : ''; if (conn.stopped && i === conn.stage) cls = 'stop'; var b = el('button', { type: 'button', role: 'listitem', class: cls, text: n, 'aria-label': n + (cls === 'done' ? ' (complete)' : cls === 'cur' ? ' (current)' : ''), on: { click: function () { c.detail.textContent = stageInfo(p, i, conn); } } }); c.flowEl.appendChild(b); });
      if (conn.note) c.detail.textContent = conn.note;
    }
    function stageInfo(p, i, conn) {
      var n = HD.people[p.id].name;
      return [n + ' appeared in your results because HUMAN matched interests, availability and distance.', conn.introText ? 'HUMAN prepared and sent: "' + conn.introText + '" (demo, nothing really sent).' : 'Not requested yet.', conn.stage > 2 ? n + ' accepted. This is a separate response, simulated here.' : 'Waiting for ' + n + ' to respond. Nothing happens unless they agree.', 'Both of you agreed, so HUMAN can now help you talk.', conn.meetup ? 'Suggested: ' + conn.meetup.place + ', ' + conn.meetup.time + '.' : 'No meetup suggested yet.', conn.stage > 5 ? 'Confirmed in the demo calendar.' : 'Not confirmed yet.'][i];
    }
    function cardFor(id) { return [].slice.call(listEl.querySelectorAll('.pcard')).filter(function (c) { return c.p && c.p.id === id; })[0]; }
    function select(id) { selected = id; HE.$$('.pcard', listEl).forEach(function (c) { c.classList.toggle('sel', c.p && c.p.id === id); }); if (view === 'map') mapApi.refresh(); }

    /* --- connection state machine with a separate recipient response --- */
    var recipientBox = el('div', { class: 'glass', style: 'margin-top:18px', hidden: 'hidden' }, [el('h4', {}, [el('span', { text: 'What the other person sees (simulated)' }), el('span', { class: 'st', text: 'Separate response' })])]), recThread = new PS.Thread(el('div'), '', '');
    recipientBox.appendChild(recThread.list); disc.appendChild(recipientBox);
    async function startConnection(p, c, opt) {
      opt = opt || {}; var per = HD.people[p.id], conn = S.connections[p.id];
      if (conn) return;
      conn = S.connections[p.id] = { stage: 1, introText: '', decision: p.decision, meetup: null, note: '', now: !!opt.now };
      var c0 = c || cardFor(p.id); function upd() { var cc = cardFor(p.id); if (cc) renderFlow(p, cc); }
      conn.note = 'Consent first: HUMAN only sends a request. ' + per.name + ' has to say yes.'; upd();
      var shared = (results.filter(function (r) { return r.p.id === p.id; })[0] || { why: [] }).why.filter(function (w) { return ['nearby', 'tonight', 'weekend', 'now'].indexOf(w) < 0; });
      var interest = shared[0] || p.interests[0];
      conn.introText = 'Hey ' + per.name + '! You and Alex both love ' + (shared.length > 1 ? shared.slice(0, 2).join(' and ') : interest) + (p.format === 'coffee' ? ' and good coffee conversations' : '') + '. Would you be interested in connecting?' + (opt.now ? ' Alex is nearby right now.' : '');
      // message being prepared
      conn.note = 'Preparing the introduction…'; upd(); await wait(900);
      var typed = ''; for (var i = 0; i < conn.introText.length; i += 3) { typed = conn.introText.slice(0, i + 3); var cc = cardFor(p.id); if (cc) cc.detail.textContent = '“' + typed + '”'; await wait(18); }
      conn.note = 'Request sent (demo): “' + conn.introText + '”'; upd(); HS.log('people', 'Requested an introduction to ' + per.name + ' (demo, consent required)');
      recipientBox.removeAttribute('hidden'); recThread.header(per.name + ' (simulated)', 'Incoming request'); recThread.sys('A new introduction request arrived (simulated)'); recThread.add('l', conn.introText, 'From Alex via HUMAN');
      await wait(HE.reduced ? 100 : 2200);
      if (conn.decision === 'decline') { conn.stopped = true; conn.note = per.name + ' declined (simulated). No message about it is shown to ' + per.name + ' again, and you are not notified who passed. Try someone else.'; recThread.add('r', 'No thanks, but thank you.', per.name + ' · simulated'); upd(); HS.log('people', per.name + ' declined (simulated)'); return; }
      if (conn.decision === 'later') { conn.stopped = true; conn.note = 'No reply from ' + per.name + ' yet. HUMAN will not nag. You can remind them tomorrow.'; recThread.sys('No response yet'); upd(); var cc2 = cardFor(p.id); if (cc2) { cc2.detail.appendChild(el('button', { type: 'button', class: 'pill sm', style: 'margin-left:8px', text: 'Remind tomorrow', on: { click: function () { conn.note = 'Reminder set for tomorrow (demo).'; HS.addTask({ title: 'Follow up with ' + per.name, due: 'Tomorrow' }); upd(); } } })); } return; }
      conn.stage = 2; conn.note = per.name + ' accepted (simulated response).'; recThread.add('r', 'Yes, I would love that!', per.name + ' · simulated'); upd(); await wait(HE.reduced ? 100 : 1300);
      conn.stage = 3; conn.note = 'You are connected. HUMAN can now help you plan.'; upd(); HS.addMemory(p.id in S.memory ? p.id : p.id, 'fact', 'Connected through HUMAN (' + p.interests[0] + ')'); await wait(HE.reduced ? 100 : 1200);
      var place = HD.places.filter(function (pl) { return pl.kind === (p.activity === 'coffee' ? 'coffee' : p.activity); })[0] || HD.places[0];
      conn.meetup = { place: place.name, area: place.area, time: opt.now ? 'Now (next 30 minutes)' : (p.avail.indexOf('tonight') > -1 ? 'Today 6:30 PM' : 'Saturday 11:00 AM'), status: 'proposed', pid: p.id };
      conn.stage = 4; conn.note = 'HUMAN suggests ' + conn.meetup.place + ', ' + conn.meetup.time + '.'; upd(); meetupCard(p, conn);
    }
    var planBox = el('div', { class: 'glass', style: 'margin-top:18px', hidden: 'hidden' }); disc.appendChild(planBox);
    function meetupCard(p, conn) {
      var per = HD.people[p.id], m = conn.meetup; planBox.removeAttribute('hidden'); planBox.innerHTML = ''; planBox.appendChild(el('h4', {}, [el('span', { text: 'Plan the meetup · ' + per.name }), el('span', { class: 'st', text: m.status })]));
      var body = el('div', { class: 'dual', style: 'gap:18px' }), L = el('div'), R = el('div', { style: 'display:grid;gap:10px;align-content:start' });
      body.appendChild(L); body.appendChild(R); planBox.appendChild(body);
      L.appendChild(C.Location({ place: m.place, sub: m.area + ' · public place · ' + (HD.places.filter(function (x) { return x.name === m.place; })[0] || {}).hours }));
      var times = ['Today 5:30 PM', 'Today 6:30 PM', 'Saturday 11:00 AM', 'Now (next 30 minutes)'], sel = el('select', { 'aria-label': 'Change time', on: { change: function (e) { m.time = e.target.value; refresh(); } } }, times.map(function (t) { return el('option', { value: t, text: t }); })); if (times.indexOf(m.time) < 0) sel.appendChild(el('option', { value: m.time, text: m.time })); sel.value = m.time;
      R.appendChild(el('label', { class: 'field' }, ['Time', sel]));
      var st = el('div', { class: 'card-status', 'aria-live': 'polite' });
      var b1 = el('button', { type: 'button', class: 'pill pri', text: p.paid ? 'Review cost and confirm' : 'Confirm meetup' }), b2 = el('button', { type: 'button', class: 'pill', text: 'Directions' }), b3 = el('button', { type: 'button', class: 'pill', text: 'Add to calendar' }), b4 = el('button', { type: 'button', class: 'pill', text: 'Cancel request' });
      b3.disabled = true; R.appendChild(el('div', { class: 'ctl' }, [b1, b2, b3, b4])); R.appendChild(st);
      function refresh() { planBox.querySelector('.st').textContent = m.status; }
      b1.addEventListener('click', function () {
        function confirm() { m.status = 'confirmed'; conn.stage = 5; conn.stopped = false; conn.note = 'Meeting confirmed (demo): ' + m.place + ', ' + m.time + '.'; var cc = cardFor(p.id); if (cc) renderFlow(p, cc); st.textContent = 'Confirmed in the demo. ' + per.name + ' gets the plan too (simulated).'; b1.disabled = true; b3.disabled = false; refresh(); HS.log('people', 'Meetup confirmed with ' + per.name + ' at ' + m.place + ' (demo)'); }
        if (p.paid) { var pay = C.PaymentReview({ items: [{ label: p.paid.label, amount: p.paid.amount }, { label: 'HUMAN booking fee (demo)', amount: 0 }], onApprove: function () { confirm(); sh.close(); }, onReject: function () { st.textContent = 'Not booked. Nothing was charged.'; sh.close(); } }); var wrap = el('div', { class: 'wsx' }, [pay]); var sh = HE.sheet('Cost breakdown', wrap); }
        else confirm();
      });
      b2.addEventListener('click', function () { var o = el('div', { class: 'perm' }, [el('p', { text: 'Approximate walking route (demo, fictional map):' }), el('ol', {}, ['Head north on Greek Street (3 min)', 'Turn left at the bookshop on the corner', m.place + ' is on your right (about 8 min total)'].map(function (t) { return el('li', { text: t }); })), el('small', { class: 'demo-note', text: 'No exact location of either person is shared. Directions go to the public meeting place only.' })]); HE.sheet('Directions to ' + m.place, o); });
      b3.addEventListener('click', function () { HS.addEvent({ day: m.time.split(' ')[0] === 'Saturday' ? 'Saturday' : 'Today', time: m.time.replace(/^(Today|Saturday) /, '').replace('Now (next 30 minutes)', 'Now'), title: m.place + ' with ' + per.name, source: 'HUMAN' }); b3.disabled = true; b3.textContent = 'Added'; HS.addMemory(p.id, 'fact', 'Met at ' + m.place + ' (' + m.time + ')'); });
      b4.addEventListener('click', function () { m.status = 'cancelled'; conn.stopped = true; conn.note = 'You cancelled the request. ' + per.name + ' is told politely (simulated).'; var cc = cardFor(p.id); if (cc) renderFlow(p, cc); b1.disabled = b3.disabled = true; refresh(); st.textContent = 'Cancelled.'; });
    }
    go.addEventListener('click', run); input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    input.addEventListener('input', function () { token++; anim.setAttribute('hidden', 'hidden'); });

    /* --- AI twin quick sheet (respects shared info) --- */
    function twinSheet(p) {
      var per = HD.people[p.id], body = el('div', { class: 'perm' }), out = el('div', { class: 'thread' });
      body.appendChild(el('p', { class: 'demo-note', text: per.name + '\'s twin only shares what ' + per.name + ' chose: interests and availability.' }));
      [['What do you like?', 'I like ' + p.interests.join(', ') + '.'], ['When are you free?', p.availText + '.'], ['Where do you live?', 'I do not share that. I can say I am around ' + p.area + '.']].forEach(function (q) { body.appendChild(HE.chip(q[0], function () { out.appendChild(el('div', { class: 'b r', text: q[0] })); out.appendChild(el('div', { class: 'b l', text: q[1] })); out.scrollTop = out.scrollHeight; })); });
      body.appendChild(out); HE.sheet(per.name + '\'s AI twin', body);
    }

    /* --- MAP --- */
    var mapApi = (function () {
      var wrap = el('div', { class: 'dual rev', style: 'gap:18px' }), mw = el('div', { class: 'map-wrap' }), vp = el('div', { class: 'map-vp' }), side = el('div', { class: 'mapside' });
      var base = '<svg class="base" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="100" fill="#EAF6EE"/><path d="M0 78 Q25 60 50 70 T100 55 L100 62 Q75 76 50 78 T0 86Z" fill="#CFE6F7"/><g stroke="#fff" stroke-width="2.2" fill="none"><path d="M0 40 L100 30"/><path d="M0 62 Q50 50 100 60"/><path d="M30 0 L38 100"/><path d="M62 0 L58 100"/><path d="M84 0 L80 100"/></g><g stroke="#fff" stroke-width="1" fill="none"><path d="M0 22 L100 18"/><path d="M0 52 L100 46"/><path d="M12 0 L18 100"/><path d="M48 0 L46 100"/><path d="M72 0 L70 100"/></g><g fill="#C4E8CE"><rect x="42" y="6" width="14" height="10" rx="3"/><rect x="6" y="64" width="12" height="10" rx="3"/></g></svg>';
      vp.innerHTML = base; mw.appendChild(vp); var you = el('div', { class: 'you-pin', 'aria-label': 'You (approximate)' }); you.style.left = '45%'; you.style.top = '48%'; vp.appendChild(you);
      var z = 1, tx = 0, ty = 0; function apply() { vp.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')'; }
      var ctl = el('div', { class: 'mapctl' }, [el('button', { type: 'button', 'aria-label': 'Zoom in', text: '+', on: { click: function () { z = Math.min(2.6, z + .35); clamp(); apply(); } } }), el('button', { type: 'button', 'aria-label': 'Zoom out', text: '−', on: { click: function () { z = Math.max(1, z - .35); clamp(); apply(); } } }), el('button', { type: 'button', 'aria-label': 'Reset view', text: '⌂', on: { click: function () { z = 1; tx = ty = 0; apply(); } } })]);
      function clamp() { var w = mw.clientWidth, h = mw.clientHeight; tx = Math.min(0, Math.max(w - w * z, tx)); ty = Math.min(0, Math.max(h - h * z, ty)); }
      var drag = null; mw.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; drag = { x: e.clientX - tx, y: e.clientY - ty }; mw.setPointerCapture && mw.setPointerCapture(e.pointerId); });
      mw.addEventListener('pointermove', function (e) { if (!drag) return; tx = e.clientX - drag.x; ty = e.clientY - drag.y; clamp(); vp.style.transition = 'none'; apply(); }); ['pointerup', 'pointercancel'].forEach(function (ev) { mw.addEventListener(ev, function () { drag = null; vp.style.transition = ''; }); });
      mw.addEventListener('wheel', function (e) { if (!e.ctrlKey) return; e.preventDefault(); z = Math.max(1, Math.min(2.6, z + (e.deltaY < 0 ? .2 : -.2))); clamp(); apply(); }, { passive: false });
      mw.appendChild(ctl); mw.appendChild(el('div', { class: 'maphint', text: 'Approximate areas. Pins are not exact locations.' }));
      var act = el('select', { 'aria-label': 'Activity filter', on: { change: refresh } }, [['all', 'All activities'], ['coffee', 'Coffee'], ['walk', 'Walks'], ['sport', 'Sport'], ['class', 'Classes']].map(function (o) { return el('option', { value: o[0], text: o[1] }); }));
      var distOut = el('b', { text: '5 km' }), dist = el('input', { type: 'range', min: '0.5', max: '5', step: '0.5', value: '5', 'aria-label': 'Maximum distance', on: { input: function () { distOut.textContent = dist.value + ' km'; refresh(); } } });
      var info = el('div', { class: 'glass', 'aria-live': 'polite' }, [el('div', { class: 'empty', text: 'Select a pin to see who it is.' })]);
      side.appendChild(el('div', { class: 'glass' }, [el('h4', { text: 'Filters' }), el('label', { class: 'field' }, ['Activity', act]), el('label', { class: 'range', style: 'margin-top:10px' }, ['Within ', distOut, dist])]));
      side.appendChild(info); wrap.appendChild(side); wrap.appendChild(mw); mapEl.appendChild(wrap);
      var pins = [];
      function refresh() {
        pins.forEach(function (n) { n.remove(); }); pins = [];
        var ids = results.filter(function (r) { return !dismissed[r.p.id]; }).map(function (r) { return r.p.id; });
        var shown = HD.profiles.filter(function (p) { return ids.indexOf(p.id) > -1 && (act.value === 'all' || p.activity === act.value) && p.dist <= +dist.value; });
        shown.forEach(function (p) { var per = HD.people[p.id], b = el('button', { type: 'button', class: 'mpin' + (selected === p.id ? ' sel' : ''), 'aria-label': per.name + ', about ' + p.dist.toFixed(1) + ' km, ' + p.area }, [el('span', { class: 'p', html: '<span class="av">' + HE.portrait(per) + '</span>', style: 'background:' + per.bg[1] }), el('span', { class: 'lbl', text: per.name + ' · ' + p.area })]); b.style.left = p.pin[0] + '%'; b.style.top = p.pin[1] + '%'; b.addEventListener('click', function (e) { e.stopPropagation(); selected = p.id; refresh(); showInfo(p); }); vp.appendChild(b); pins.push(b); });
        HD.places.forEach(function (pl) { var m = el('span', { class: 'mpin', style: 'pointer-events:none;opacity:.9', 'aria-hidden': 'true' }, [el('span', { class: 'p', style: 'background:#fff;width:20px;height:20px;border-width:2px', html: '<span style="transform:rotate(45deg);font-size:11px;display:grid;place-items:center;height:100%">' + ({ coffee: '☕', walk: '🌳', sport: '🎾', class: '🎨' }[pl.kind] || '📍') + '</span>' })]); m.style.left = pl.pin[0] + '%'; m.style.top = pl.pin[1] + '%'; vp.appendChild(m); pins.push(m); });
        if (!shown.length) info.innerHTML = '<div class="empty">No one matches these filters. Widen the distance or change the activity.</div>';
      }
      function showInfo(p) {
        var per = HD.people[p.id]; info.innerHTML = ''; info.appendChild(el('div', { class: 'mem-h' }, [el('span', { class: 'av', html: HE.portrait(per), style: 'width:56px;height:66px;border-radius:16px' }), el('div', {}, [el('b', { text: per.name }), el('div', { class: 'demo-note', text: '≈ ' + p.dist.toFixed(1) + ' km · ' + p.area + ' · ' + p.availText })])]));
        info.appendChild(el('p', { style: 'font-size:.9rem', text: p.does + '. Interests: ' + p.interests.join(', ') + '.' }));
        var conn = S.connections[p.id], b = el('button', { type: 'button', class: 'pill pri', text: conn ? 'Request already sent' : 'Send a connection request' }); b.disabled = !!conn; b.addEventListener('click', function () { b.disabled = true; setView('list'); startConnection(p, null); }); info.appendChild(b);
        var listCard = cardFor(p.id); if (listCard) select(p.id);
      }
      return { refresh: refresh, el: wrap };
    })();
    function setView(v) { view = v; var btns = viewSeg.querySelectorAll('button'); btns[0].classList.toggle('on', v === 'list'); btns[1].classList.toggle('on', v === 'map'); btns[0].setAttribute('aria-pressed', String(v === 'list')); btns[1].setAttribute('aria-pressed', String(v === 'map')); if (v === 'list') { listEl.removeAttribute('hidden'); mapEl.setAttribute('hidden', 'hidden'); } else { listEl.setAttribute('hidden', 'hidden'); mapEl.removeAttribute('hidden'); mapApi.refresh(); } }
    viewSeg.children[0].addEventListener('click', function () { setView('list'); }); viewSeg.children[1].addEventListener('click', function () { setView('map'); });

    /* --- Meet now --- */
    meetNow.addEventListener('click', function () {
      var cand = HD.profiles.filter(function (p) { return (p.avail.indexOf('now') > -1 || p.avail.indexOf('tonight') > -1) && p.dist <= 3 && !S.connections[p.id]; }).sort(function (a, b) { return (b.avail.indexOf('now') > -1) - (a.avail.indexOf('now') > -1) || a.dist - b.dist; }).slice(0, 4);
      var body = el('div', { class: 'perm' }), pick = cand[0] ? cand[0].id : null, fmt = 'in person';
      if (!cand.length) { body.appendChild(el('div', { class: 'empty', text: 'No one nearby is available right now. Try again later or widen your search.' })); HE.sheet('Meet someone now', body); return; }
      body.appendChild(el('b', { text: 'Nearby and free' })); var grp = el('div', { class: 'perm' });
      cand.forEach(function (p, i) { var per = HD.people[p.id], r = el('label', { class: 'opt' + (i === 0 ? ' sel' : '') }, [el('input', { type: 'radio', name: 'mn', 'aria-label': per.name, checked: i === 0 ? 'checked' : null }), HE.avatar(p.id), el('span', {}, [el('b', { text: per.name }), el('div', { class: 'meta', style: 'margin:0;text-align:left', text: '≈ ' + p.dist.toFixed(1) + ' km · ' + p.availText })])]); r.querySelector('input').addEventListener('change', function () { pick = p.id; HE.$$('.opt', grp).forEach(function (x) { x.classList.remove('sel'); }); r.classList.add('sel'); upd(); }); grp.appendChild(r); }); body.appendChild(grp);
      var sug = el('div', { class: 'glass', style: 'padding:14px' }); body.appendChild(sug);
      var seg = el('div', { class: 'seg2', role: 'group', 'aria-label': 'Meeting format' }, ['in person', 'video', 'audio', 'text'].map(function (f, i) { var b = el('button', { type: 'button', class: i === 0 ? 'on' : '', text: f, 'aria-pressed': String(i === 0) }); b.addEventListener('click', function () { fmt = f; HE.$$('button', seg).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); upd(); }); return b; }));
      body.appendChild(el('div', {}, [el('b', { text: 'How would you like to meet?' }), el('div', { style: 'margin-top:8px' }, [seg])]));
      var cons = el('div', { class: 'perm' }); var safe = { pub: true, loc: false, trust: true };
      [['pub', 'Public place only', 'Required for first meetings'], ['loc', 'Share live location during the meetup', 'Off by default. Ends when the meetup ends'], ['trust', 'Tell Maya where I am going', 'A trusted contact gets the place and time']].forEach(function (s) { var row = el('div', { class: 'sw' }, [el('div', {}, [el('b', { text: s[1] }), el('small', { text: s[2] })]), el('button', { type: 'button', role: 'switch', 'aria-checked': String(safe[s[0]]), 'aria-label': s[1] })]); var b = row.querySelector('button'); if (s[0] === 'pub') b.disabled = true; b.addEventListener('click', function () { safe[s[0]] = !safe[s[0]]; b.setAttribute('aria-checked', String(safe[s[0]])); }); cons.appendChild(row); });
      body.appendChild(el('b', { text: 'Consent and safety' })); body.appendChild(cons);
      var send = el('button', { type: 'button', class: 'pill pri', text: 'Send request' }); body.appendChild(send);
      function upd() { var p = HD.profiles.filter(function (x) { return x.id === pick; })[0], pl = HD.places.filter(function (x) { return x.kind === (p.activity === 'coffee' ? 'coffee' : p.activity); })[0] || HD.places[0]; sug.innerHTML = ''; sug.appendChild(el('div', { html: '<b>Suggestion:</b> ' + HE.esc(fmt === 'in person' ? p.does + ' at ' + pl.name + ' (' + pl.area + ', public)' : 'A ' + fmt + ' chat first, then decide') + '<br><small>Compatible windows: now (next 30 min)' + (p.avail.indexOf('tonight') > -1 ? ', today 5:30 to 7:00 PM' : '') + '</small>' })); }
      upd(); var sh = HE.sheet('Meet someone now', body);
      send.addEventListener('click', function () { sh.close(); var p = HD.profiles.filter(function (x) { return x.id === pick; })[0]; if (!results.some(function (r) { return r.p.id === p.id; })) results.push({ p: p, score: 1, why: ['now'] }); dismissed[p.id] = false; setView('list'); paint(false); var c = cardFor(p.id); if (c) c.scrollIntoView({ behavior: HE.reduced ? 'auto' : 'smooth', block: 'center' }); startConnection(p, c, { now: true }); });
    });
    paint(false);
    HS.on('reset', function () { S = HS.get(); recipientBox.setAttribute('hidden', 'hidden'); planBox.setAttribute('hidden', 'hidden'); });
    return { run: run };
  };
})(window);
