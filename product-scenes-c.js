/* Scenes 6-9: relationships, AI twin, day in the life, everywhere. */
(function (g) {
  'use strict';
  var PS = g.PS = g.PS || {};
  var el = HE.el, C = HE.Cards, wait = HE.wait;
  var KINDS = { fact: 'Fact', promise: 'Promise', date: 'Date', pref: 'Preference' };

  /* =====================================================================
     SCENE 6: RELATIONSHIPS REMEMBERED
     ===================================================================== */
  PS.relationships = function (root) {
    var S = HS.get(), ids = ['sophia', 'maya', 'jordan', 'priya', 'theo', 'elena', 'marcus', 'noor'], sel = 'sophia';
    var grid = el('div', { class: 'rel-grid' }), constel = el('div', { class: 'constel', role: 'list', 'aria-label': 'People HUMAN remembers' }), card = el('div', { class: 'mem-card', 'aria-live': 'polite' });
    grid.appendChild(constel); grid.appendChild(card); root.appendChild(grid);
    ids.forEach(function (id) {
      var p = HD.people[id], m = S.memory[id], b = el('button', { type: 'button', class: 'pcl' + (id === sel ? ' sel' : ''), role: 'listitem', 'aria-pressed': String(id === sel), 'aria-label': p.name + ', ' + (m ? m.last : '') }, [HE.avatar(id), el('b', { text: p.name }), el('small', { text: (m && m.last) || '' })]);
      b.dataset.id = id; b.addEventListener('click', function () { sel = id; paintSel(); paint(); }); constel.appendChild(b);
    });
    function paintSel() { HE.$$('.pcl', constel).forEach(function (b) { var on = b.dataset.id === sel; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', String(on)); }); }
    var flowBox, undo = null;
    function paint() {
      S = HS.get(); var p = HD.people[sel], m = S.memory[sel] || { last: '', next: '', items: [] }; card.innerHTML = '';
      card.appendChild(el('div', { class: 'mem-h' }, [HE.avatar(sel), el('div', {}, [el('h3', { text: p.name }), el('div', { class: 'demo-note', text: p.role + ' · ' + m.last })])]));
      card.appendChild(el('div', { class: 'tg' }, [el('span', { text: 'Next: ' + (m.next || 'Nothing planned') })]));
      var list = el('div', { class: 'mem-list' }); card.appendChild(list);
      if (!m.items.length) list.appendChild(el('div', { class: 'empty', text: 'Nothing remembered yet. Add something below.' }));
      m.items.forEach(function (it) {
        var row = el('div', { class: 'mem' + (it.priv ? ' priv' : '') + (it.done ? ' done' : '') }), txt = el('span', { text: it.text + (it.priv ? ' (private)' : '') + (it.done ? ' ✓ done' : ''), style: it.done ? 'text-decoration:line-through;opacity:.6' : '' });
        var act = el('span', { class: 'act-b' });
        var ed = el('button', { type: 'button', 'aria-label': 'Edit this memory', text: '✎' }), lock = el('button', { type: 'button', 'aria-label': 'Mark private', 'aria-pressed': String(!!it.priv), text: '🔒' }), del = el('button', { type: 'button', 'aria-label': 'Delete this memory', text: '×' });
        ed.addEventListener('click', function () { var inp = el('input', { class: 'ed', value: it.text, 'aria-label': 'Edit memory text' }); txt.replaceWith(inp); inp.focus(); function save() { it.text = inp.value.trim() || it.text; HS.emit('memory', sel); paint(); } inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); if (e.key === 'Escape') paint(); }); inp.addEventListener('blur', save); });
        lock.addEventListener('click', function () { it.priv = !it.priv; paint(); });
        del.addEventListener('click', function () { row.classList.add('removing'); setTimeout(function () { var idx = m.items.indexOf(it); m.items.splice(idx, 1); undo = { id: sel, it: it, idx: idx }; paint(); card.insertBefore(el('div', { class: 'demo-note', style: 'display:flex;gap:10px;align-items:center' }, ['Deleted. ', el('button', { type: 'button', class: 'pill sm', text: 'Undo', on: { click: function () { var m2 = S.memory[undo.id]; m2.items.splice(undo.idx, 0, undo.it); undo = null; paint(); } } })]), card.children[2]); }, 260); });
        act.appendChild(ed); act.appendChild(lock); act.appendChild(del); row.appendChild(el('span', { class: 'k', text: KINDS[it.kind] || 'Note' })); row.appendChild(txt); row.appendChild(act); list.appendChild(row);
      });
      // add memory
      var kindSel = el('select', { 'aria-label': 'Memory type' }, Object.keys(KINDS).map(function (k) { return el('option', { value: k, text: KINDS[k] }); })), inp = el('input', { placeholder: 'Remember something about ' + p.name + '…', 'aria-label': 'New memory', style: 'flex:1;min-width:140px;border:1.5px solid rgba(22,21,28,.18);border-radius:999px;padding:10px 14px;font:400 .92rem var(--sans)' });
      var add = el('button', { type: 'button', class: 'pill', text: 'Add' });
      add.addEventListener('click', function () { if (!inp.value.trim()) { inp.focus(); return; } HS.addMemory(sel, kindSel.value, inp.value.trim()); paint(); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') add.click(); });
      card.appendChild(el('div', { class: 'ctl' }, [kindSel, inp, add]));
      // take care of it
      var care = el('button', { type: 'button', class: 'pill pur', text: 'Take care of it', style: 'padding:13px 22px;font-size:1rem' });
      care.addEventListener('click', function () { takeCare(); });
      card.appendChild(el('div', { class: 'ctl', style: 'margin-top:4px' }, [care, el('span', { class: 'demo-note', text: 'HUMAN finds the saved promise, drafts it in your voice, and asks before sending.' })]));
      flowBox = el('div', { class: 'wsx', 'aria-live': 'polite' }); card.appendChild(flowBox);
      // other examples
      card.appendChild(el('h4', { text: 'More ways HUMAN helps', style: 'font:700 .72rem var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#625f5a;margin:6px 0 0' }));
      var ideas = el('div', { class: 'ideas' }); card.appendChild(ideas);
      [['Remember a birthday', birthday], ['Arrange a reunion', reunion], ['Follow up after a conversation', followup], ['Reconnect with an old friend', reconnect], ['Remember a recommendation', recommend], ['Share an event invitation', invite]].forEach(function (x) { ideas.appendChild(HE.chip(x[0], function () { x[1](); })); });
    }
    function draftFlow(title, intro, text, onSend, sendLabel) {
      flowBox.innerHTML = ''; var box = el('div', { class: 'card ap' }, [el('div', { class: 'card-k', text: title }), el('p', { class: 'card-p', text: intro })]);
      var ta = el('textarea', { 'aria-label': 'Draft message', style: 'width:100%;min-height:90px;border:1.5px solid rgba(22,21,28,.18);border-radius:12px;padding:10px;font:400 .94rem/1.4 var(--sans);margin-top:8px' }); ta.value = text; box.appendChild(ta);
      var st = el('div', { class: 'card-status', 'aria-live': 'polite' }), row = el('div', { class: 'card-btns' });
      var yes = el('button', { type: 'button', class: 'pill pri', text: sendLabel || 'Approve and send (demo)' }), no = el('button', { type: 'button', class: 'pill', text: 'Discard' });
      yes.addEventListener('click', function () { row.remove(); box.classList.add('ok'); st.textContent = 'Approved (demo). Nothing was actually sent.'; box.appendChild(st); onSend(ta.value); });
      no.addEventListener('click', function () { flowBox.innerHTML = ''; });
      row.appendChild(yes); row.appendChild(no); box.appendChild(row); flowBox.appendChild(box); box.scrollIntoView && box.scrollIntoView({ block: 'nearest', behavior: HE.reduced ? 'auto' : 'smooth' });
    }
    async function takeCare() {
      var name = HD.people[sel].name, m = S.memory[sel] || { items: [] }, pr = m.items.filter(function (i) { return i.kind === 'promise' && !i.done && !i.priv; })[0];
      flowBox.innerHTML = '';
      if (!pr) { flowBox.appendChild(el('div', { class: 'card' }, [el('b', { class: 'card-t', text: 'Nothing is waiting for ' + name }), el('p', { class: 'card-p', text: 'No open promises. Add one above or try another person.' })])); return; }
      var tp = C.TaskProgress({ title: 'Following through with ' + name, steps: [{ label: 'Finding the saved promise' }, { label: 'Writing a personal message' }, { label: 'Waiting for your approval' }] }); flowBox.appendChild(tp);
      tp.set(0, 'doing', 'Found: "' + pr.text + '"'); await wait(800); tp.set(0, 'done'); tp.set(1, 'doing'); await wait(800);
      var likes = (m.items.filter(function (i) { return i.kind === 'fact'; })[0] || {}).text || '';
      var draft = 'Hi ' + name + '! Quick one: ' + pr.text.replace(/^(Promised to|You promised to|You said you would|Promised)\s*/i, 'I wanted to ').replace(/^I wanted to to /, 'I wanted to ') + '. ' + (likes ? 'I remembered you ' + likes.replace(/^Loves /, 'love ').toLowerCase() + ', so I thought of you. ' : '') + 'Talk soon!';
      tp.set(1, 'done'); tp.set(2, 'doing', 'Waiting for you. Edit the draft, then approve.');
      draftFlow('Draft for ' + name, 'Written in your tone using what HUMAN remembers.', draft, function () { tp.set(2, 'done'); tp.finish('Done'); pr.done = true; m.last = 'Messaged just now'; m.next = 'Nothing pending'; HS.log('relationship', 'Followed through with ' + name + ': ' + pr.text + ' (demo, not sent)'); HS.emit('memory', sel); setTimeout(paint, 900); });
    }
    function birthday() { flowBox.innerHTML = ''; var d = el('input', { type: 'date', 'aria-label': 'Birthday' }), b = el('button', { type: 'button', class: 'pill pri', text: 'Remember it' }); flowBox.appendChild(el('div', { class: 'card' }, [el('b', { class: 'card-t', text: 'When is ' + HD.people[sel].name + '\'s birthday?' }), el('div', { class: 'ctl', style: 'margin-top:8px' }, [d, b])])); b.addEventListener('click', function () { if (!d.value) { d.focus(); return; } var dt = new Date(d.value + 'T12:00:00'); HS.addMemory(sel, 'date', 'Birthday: ' + dt.toLocaleDateString([], { month: 'long', day: 'numeric' }) + ' (HUMAN will remind you a week before)'); HS.log('relationship', 'Remembered ' + HD.people[sel].name + '\'s birthday'); paint(); }); }
    function reunion() { var n = HD.people[sel].name; draftFlow('Arrange a reunion', 'HUMAN proposes a time, then asks ' + n + '.', 'Hi ' + n + '! It has been a while. Dinner Saturday the 14th? I\'ll book somewhere you like.', function () { HS.addEvent({ day: 'Saturday', time: '7:30 PM', title: 'Reunion dinner with ' + n, source: 'HUMAN', pending: true }); HS.addMemory(sel, 'fact', 'Reunion proposed for Saturday 7:30 PM'); HS.log('relationship', 'Proposed a reunion with ' + n + ' (demo)'); paint(); }, 'Approve invite (demo)'); }
    function followup() { var n = HD.people[sel].name; draftFlow('Follow up after a conversation', 'Created from your last conversation.', 'Great chatting earlier, ' + n + '. I\'ll send that link tonight, and let\'s pick a day next week.', function () { HS.addTask({ title: 'Send ' + n + ' the link', due: 'Tonight' }); HS.addMemory(sel, 'promise', 'Send the link from our last chat'); HS.log('relationship', 'Queued a follow-up to ' + n + ' (demo)'); paint(); }, 'Approve and queue'); }
    function reconnect() { var old = HD.people.noor, n = old.name; sel = 'noor'; paintSel(); paint(); draftFlow('Reconnect with an old friend', 'You have not spoken to ' + n + ' for six months.', 'Hi ' + n + '! I\'ve been thinking about your dissertation on habits. How is it going? Coffee soon?', function () { HS.addMemory('noor', 'fact', 'Reconnected, coffee being arranged'); HS.log('relationship', 'Reconnected with ' + n + ' (demo)'); paint(); }); }
    function recommend() { flowBox.innerHTML = ''; var i = el('input', { placeholder: 'e.g. Pachinko by Min Jin Lee', 'aria-label': 'Recommendation', style: 'flex:1;border:1.5px solid rgba(22,21,28,.18);border-radius:999px;padding:10px 14px;font:400 .92rem var(--sans)' }), b = el('button', { type: 'button', class: 'pill pri', text: 'Remember' }); flowBox.appendChild(el('div', { class: 'card' }, [el('b', { class: 'card-t', text: 'What did ' + HD.people[sel].name + ' recommend?' }), el('div', { class: 'ctl', style: 'margin-top:8px' }, [i, b])])); b.addEventListener('click', function () { if (!i.value.trim()) { i.focus(); return; } HS.addMemory(sel, 'pref', 'Recommended: ' + i.value.trim()); HS.log('relationship', 'Saved a recommendation from ' + HD.people[sel].name); paint(); }); }
    function invite() { var n = HD.people[sel].name; draftFlow('Share an event invitation', 'Elena\'s exhibition opens November 2nd.', 'Hi ' + n + '! Elena\'s photo exhibition opens on November 2nd. Want to go together?', function () { HS.addEvent({ day: 'November 2nd', time: '6:00 PM', title: 'Elena\'s exhibition with ' + n, source: 'HUMAN', pending: true }); HS.addMemory(sel, 'fact', 'Invited to Elena\'s exhibition (Nov 2)'); HS.log('relationship', 'Invited ' + n + ' to Elena\'s exhibition (demo)'); paint(); }, 'Approve invitation (demo)'); }
    paint(); HS.on('memory', function (pid) { if (pid === sel) { /* painted by callers */ } });
    return { select: function (id) { sel = id; paintSel(); paint(); } };
  };

  /* =====================================================================
     SCENE 7: AI TWIN
     ===================================================================== */
  PS.twin = function (root) {
    var S = HS.get(), T = S.twin, visitor = 'friend';
    var grid = el('div', { class: 'twin-grid' }), a = el('div'), b = el('div'), c = el('div');
    [a, b, c].forEach(function (n) { grid.appendChild(n); }); root.appendChild(grid);
    a.appendChild(el('p', { class: 'twin-label', text: 'You, with HUMAN' })); b.appendChild(el('p', { class: 'twin-label', text: 'Someone talking to your AI twin' }));
    var slotA = el('div', { class: 'phone-slot' }), slotB = el('div', { class: 'phone-slot' }); a.appendChild(slotA); b.appendChild(slotB);
    var mine = new HE.Phone(slotA, { id: 'twinA', name: 'HUMAN', sub: 'Messages', placeholder: 'Message HUMAN', onSend: function (t) { mine.reply({ text: PS.respond(t).text }, 700); } });
    var theirs = new HE.Phone(slotB, { id: 'twinB', name: 'Alex (AI twin)', sub: 'Messages', avatar: HE.humanAvatar(), placeholder: 'Message Alex', onSend: function (t) { handle(t); } });
    mine.addMessage({ from: 'sys', text: 'Today' }); mine.addMessage({ from: 'them', text: 'Your AI twin is on. I\'ll bring anything that needs you.' });
    theirs.addMessage({ from: 'sys', text: 'You are chatting with Alex\'s AI twin' });
    // visitor controls
    var vSel = el('select', { 'aria-label': 'Who is messaging', on: { change: function () { visitor = vSel.value; theirs.addMessage({ from: 'sys', text: 'Now messaging as: ' + (visitor === 'friend' ? 'Jamie, a friend of Alex' : 'Someone Alex has not met') }); } } }, [el('option', { value: 'friend', text: 'Jamie (a friend)' }), el('option', { value: 'stranger', text: 'A stranger' })]);
    b.appendChild(el('div', { class: 'ctl', style: 'justify-content:center;margin-top:14px' }, [el('label', { class: 'field', style: 'min-width:200px' }, ['Messaging as', vSel])]));
    var asks = el('div', { class: 'ideas', style: 'justify-content:center' }); b.appendChild(asks);
    [['Does Alex have time for coffee next week?', 'coffee'], ['What is Alex into?', 'interests'], ['Can you take a message?', 'message'], ['Share Alex\'s public profile', 'profile'], ['Can I get an introduction to Alex?', 'intro'], ['Where is Alex based?', 'where']].forEach(function (x) { asks.appendChild(HE.chip(x[0], function () { theirs.addMessage({ from: 'me', text: x[0] }); handle(x[0]); })); });
    // privacy controller
    var ctl = el('div', { class: 'glass perm' }, [el('h4', {}, [el('span', { text: 'Privacy controller' }), el('span', { class: 'st', text: 'You decide' })])]); c.appendChild(ctl);
    function sw(key, label, sub) {
      var row = el('div', { class: 'sw' }, [el('div', {}, [el('b', { text: label }), el('small', { text: sub })]), el('button', { type: 'button', role: 'switch', 'aria-checked': String(!!T[key]), 'aria-label': label })]), btn = row.querySelector('button');
      btn.addEventListener('click', function () { T[key] = !T[key]; btn.setAttribute('aria-checked', String(T[key])); HS.save(); theirs.addMessage({ from: 'sys', text: 'Alex updated: ' + label + ' is ' + (T[key] ? 'on' : 'off') }); }); ctl.appendChild(row);
    }
    sw('shareInterests', 'Share my interests', 'Hobbies and public profile details'); sw('shareCalendar', 'Share calendar availability', 'Only free or busy, never event titles'); sw('allowSchedule', 'Allow scheduling for me', 'Propose and book times');
    sw('allowMessages', 'Allow taking messages', 'Leave a note for me'); sw('requireApproval', 'Ask me before confirming', 'Approval needed for every booking or introduction'); sw('paused', 'Pause my AI twin', 'It stops answering for me');
    var who = el('div', { class: 'sw' }, [el('div', {}, [el('b', { text: 'Who can contact my twin' }), el('small', { text: 'Friends, anyone, or nobody' })]), el('select', { 'aria-label': 'Who can contact my twin', on: { change: function (e) { T.contact = e.target.value; HS.save(); theirs.addMessage({ from: 'sys', text: 'Alex updated: contact is ' + e.target.value }); } } }, [['friends', 'Friends'], ['anyone', 'Anyone'], ['nobody', 'Nobody']].map(function (o) { return el('option', { value: o[0], text: o[1] }); }))]);
    who.querySelector('select').value = T.contact; ctl.appendChild(who);
    ctl.appendChild(el('p', { class: 'demo-note', text: 'Every switch changes what the twin says in this demo.' }));
    var pending = null;
    function twinSay(text, node) { return theirs.reply({ text: text, node: node }, 800); }
    function needApproval(title, body, onYes, onNo) {
      mine.addMessage({ from: 'sys', text: 'Your AI twin needs you' });
      var card = C.Approval({ title: title, body: body, perms: ['Calendar', 'Reply as your twin'], approveLabel: 'Confirm', rejectLabel: 'Decline', onApprove: onYes, onReject: onNo }); mine.addMessage({ from: 'them', node: card }); HS.log('twin', title);
    }
    async function handle(text) {
      var t = text.toLowerCase();
      if (T.paused) { return twinSay('Alex\'s AI twin is paused. Alex will reply personally.'); }
      if (T.contact === 'nobody') return twinSay('Alex is not taking messages through his twin right now.');
      if (T.contact === 'friends' && visitor === 'stranger') return twinSay('Alex only accepts messages from friends at the moment. You can ask Alex to add you.');
      if (pending === 'time' && /(tue|thu|thursday|tuesday|afternoon|morning)/.test(t)) {
        var day = /thu/.test(t) ? 'Thursday' : 'Tuesday', time = /morning/.test(t) ? '10:00 AM' : '3:00 PM'; pending = null;
        await twinSay('I\'ll send Alex the proposed time and let you know when it\'s confirmed.');
        var finish = function (ok) { if (ok) { HS.addEvent({ day: day, time: time, title: 'Coffee with Jamie', source: 'HUMAN' }); HS.addMemory('maya', 'fact', 'Jamie coffee booked ' + day); twinSay('Confirmed: ' + day + ' at ' + time + ' at Café Lune. See you there!'); HS.log('twin', 'Booked coffee with Jamie, ' + day + ' ' + time + ' (demo)'); } else twinSay('Alex can\'t make ' + day + ' after all. Would another day work?'); };
        if (T.requireApproval) needApproval('Jamie asks for coffee on ' + day + ' at ' + time, 'Your twin found this free in your calendar. Confirm it?', function () { finish(true); }, function () { finish(false); });
        else { mine.addMessage({ from: 'them', text: 'Your twin confirmed coffee with Jamie on ' + day + ' at ' + time + ' (auto, because approval is off).' }); finish(true); }
        return;
      }
      if (/(coffee|time|free|available|schedule|meet)/.test(t)) {
        if (!T.allowSchedule) return twinSay('I can\'t schedule for Alex, but I can take a message.');
        if (!T.shareCalendar) return twinSay('I can\'t see Alex\'s calendar. Which times work for you, and I\'ll pass them on?');
        var cal = HS.get().calendar, busyTue = cal.some(function (e) { return /tue/i.test(e.day); }), busyThu = cal.some(function (e) { return /thu/i.test(e.day); });
        var opts = [!busyTue && 'Tuesday', !busyThu && 'Thursday'].filter(Boolean);
        if (!opts.length) return twinSay('Alex is busy next week. Want me to ask for the week after?');
        pending = 'time'; return twinSay('I can help you find a time Alex has made available. Would ' + opts.join(' or ') + ' work?');
      }
      if (/(into|like|interests|hobb)/.test(t)) return twinSay(T.shareInterests ? 'Alex loves film photography, tennis, robotics and long conversations over matcha.' : 'I can\'t share that. Alex keeps interests private. I can pass on a message.');
      if (/(message|note|tell alex)/.test(t)) { if (!T.allowMessages) return twinSay('I can\'t take messages right now.'); await twinSay('Got it. I\'ll pass it to Alex.'); mine.addMessage({ from: 'them', text: 'Message for you from Jamie via your twin: "Can you send me that playlist?"' }); HS.log('twin', 'Took a message from Jamie'); return; }
      if (/(profile|public)/.test(t)) { var lines = ['Alex Rivera', 'London · product designer']; if (T.shareInterests) lines.push('Into: film photography, tennis, robotics'); return twinSay('Here is Alex\'s public profile.', C.MeetingNotes({ title: 'Alex · public profile', bullets: lines })); }
      if (/(intro|introduce)/.test(t)) { await twinSay('I\'ll ask Alex. Introductions need Alex\'s yes.'); needApproval('Introduce yourself to Jamie\'s friend?', 'Jamie asked your twin for an introduction. You can say no.', function () { twinSay('Alex said yes. You are connected.'); }, function () { twinSay('Alex isn\'t making new introductions this week, thank you for asking.'); }); return; }
      if (/(where|based|live)/.test(t)) return twinSay(T.shareInterests ? 'Alex is based in London (public profile). I don\'t share exact locations.' : 'I can\'t share that.');
      return twinSay('I can help with scheduling, interests, messages, and Alex\'s public profile. What would you like?');
    }
    HS.on('reset', function () { pending = null; });
    return {};
  };

  /* =====================================================================
     SCENE 8: DAY IN THE LIFE
     ===================================================================== */
  PS.day = function (root) {
    var wrap = el('div', { class: 'day' }), timeline = el('div', { class: 'timeline', role: 'tablist', 'aria-label': 'Moments of the day' }), stage = el('div', { class: 'stage' }), ctlBar = el('div', { class: 'dctl' });
    wrap.appendChild(timeline); wrap.appendChild(stage); wrap.appendChild(ctlBar); root.appendChild(wrap);
    var outcomes = {}, cur = -1, playing = false, runner = null, token = 0;
    function win(title, body, cls) { var w = el('div', { class: 'win ' + (cls || '') }, [el('div', { class: 'win-bar' }, [el('i'), el('i'), el('i'), el('span', { text: title })]), el('div', { class: 'win-b' })]); if (body) [].concat(body).forEach(function (n) { w.lastChild.appendChild(n); }); w.body = w.lastChild; return w; }
    function calWin() { var w = win('Calendar', null), l = el('ul', { class: 'logl', style: 'max-height:none' }); w.body.appendChild(l); function p() { l.innerHTML = ''; HS.get().calendar.forEach(function (e) { l.appendChild(el('li', {}, [el('time', { text: e.day.slice(0, 3) + ' ' + e.time }), el('span', { text: e.title + (e.pending ? ' (proposed)' : '') })])); }); } p(); HS.on('calendar', p); return w; }
    function tpWin(title, labels) { var tp = C.TaskProgress({ title: title, kicker: 'HUMAN at work', steps: labels.map(function (l) { return { label: l }; }) }), w = win('HUMAN', [tp]); w.tp = tp; return w; }
    function approvalNode(r, a) { return C.Approval(Object.assign({ onApprove: function () { r.approve(); }, onReject: function () { r.reject(); } }, a)); }

    var stages = [
      { time: '8:30', label: '8:30 AM', title: 'Email', build: function (st) {
          var mail = win('Mail · Dr. Lee\'s office', [el('div', { class: 'mail' }, [el('div', { class: 'from', text: 'Dr. Lee\'s office' }), el('div', { class: 'sub', text: 'Could you reschedule our appointment?' }), el('div', { class: 'body', text: 'Hi Alex, tomorrow\'s 10:00 slot has to move. Do you have a time later this week?' })])]);
          var tpw = tpWin('Rescheduling the dentist', ['Reading the email', 'Finding a new time', 'Drafting a reply', 'Your approval', 'Updating the calendar']), cal = calWin(); var sl = el('div', { class: 'wins' }, [el('div', { class: 'w-a' }, [mail]), el('div', { class: 'w-b' }, [cal]), el('div', { class: 'w-c' }, [tpw])]); st.appendChild(sl);
          return [
            { label: 'Reading the email', ms: 700, tp: 0 }, { label: 'Finding a new time', ms: 800, tp: 1, run: function () { tpw.tp.set(1, 'doing', 'Your calendar is free Thursday 11:00 AM.'); } },
            { label: 'Drafting a reply', ms: 700, tp: 2, run: function () { mail.body.appendChild(el('div', { class: 'card', style: 'animation:pop .4s both' }, [el('div', { class: 'card-k', text: 'Reply drafted (demo, not sent)' }), el('p', { class: 'card-p', text: 'Thursday at 11:00 works. Please confirm.' })])); } },
            { label: 'Your approval', ms: 300, tp: 3, approval: { title: 'Send this reply and move the appointment?', body: 'Dentist: tomorrow 10:00 AM → Thursday 11:00 AM.', perms: ['Send reply (demo)', 'Change calendar event'], approveLabel: 'Approve', rejectLabel: 'Not now' }, host: sl },
            { label: 'Updating the calendar', ms: 600, tp: 4, run: function () { var S = HS.get(); S.calendar = S.calendar.filter(function (e) { return e.id !== 'c3'; }); HS.addEvent({ day: 'Thursday', time: '11:00 AM', title: 'Dentist: Dr. Lee (moved)', source: 'HUMAN' }); HS.log('day', 'Moved dentist to Thursday 11:00 AM (demo)'); outcomes.email = { ok: true, text: 'Moved the dentist to Thursday 11:00 AM', detail: 'Replied to Dr. Lee\'s office (demo, not sent) and updated your calendar.' }; } }
          ];
        }, fail: function () { outcomes.email = { ok: false, text: 'Left the dentist appointment as it was', detail: 'You chose not to reschedule.' }; } },
      { time: '10:15', label: '10:15 AM', title: 'Friend texts', phone: true, build: function (st, ph) {
          var tpw = tpWin('Replying to Maya', ['Checking your preferences', 'Checking availability', 'Writing a reply', 'Coordinating the plan']); var side = el('div', { class: 'side' }, [tpw, calWin()]); st.appendChild(side);
          return [
            { label: 'Maya texts', ms: 500, run: function () { ph.addMessage({ from: 'sys', text: 'Today 10:15 AM' }); ph.addMessage({ from: 'them', text: 'Are we meeting this weekend?' }); } },
            { label: 'Checking your preferences', ms: 700, tp: 0, run: function () { tpw.tp.set(0, 'doing', 'You like Saturday mornings, and Maya likes brunch.'); } },
            { label: 'Checking availability', ms: 700, tp: 1, run: function () { tpw.tp.set(1, 'doing', 'Saturday 8:30 to noon is free.'); } },
            { label: 'Writing a reply', ms: 800, tp: 2, run: async function () { await ph.reply({ text: 'Yes! Saturday brunch at 10? I\'ll find a place.' }, 500); ph.addMessage({ from: 'me', text: 'Yes! Saturday brunch at 10?', noRead: false }); } },
            { label: 'Coordinating the plan', ms: 600, tp: 3, run: function () { HS.addEvent({ day: 'Saturday', time: '10:00 AM', title: 'Brunch with Maya', source: 'HUMAN' }); HS.log('day', 'Arranged brunch with Maya (demo)'); ph.addMessage({ from: 'them', node: C.CalendarEvent({ day: 'Saturday', time: '10:00 AM', title: 'Brunch with Maya' }) }); outcomes.friend = { ok: true, text: 'Arranged brunch with Maya on Saturday', detail: 'Used your standing permission to reply to close friends about plans. Calendar updated.' }; } }
          ];
        } },
      { time: '12:30', label: '12:30 PM', title: 'Meeting', build: function (st) {
          var M = HD.meeting, brief = win('Briefing · ' + M.title, [C.MeetingBrief(M)]), notes = win('Live notes (sample)', [el('div', { class: 'tr', id: 'dtr' })]), tpw = tpWin('Meeting support', ['Preparing your brief', 'Asking for recording consent', 'Capturing notes']);
          st.appendChild(el('div', { class: 'wins' }, [el('div', { class: 'w-a' }, [brief]), el('div', { class: 'w-b' }, [tpw]), el('div', { class: 'w-c' }, [notes])]));
          return [
            { label: 'Preparing your brief', ms: 800, tp: 0 }, { label: 'Asking for recording consent', ms: 400, tp: 1, approval: { title: 'Record this meeting?', body: 'Demo: no microphone is used. A sample transcript will play.', perms: ['Recording (demo)', 'Transcription (sample)'], approveLabel: 'I have everyone\'s consent', rejectLabel: 'No recording' }, host: tpw },
            { label: 'Capturing notes', ms: 600, tp: 2, run: async function () { var box = notes.body.firstChild; for (var i = 0; i < 6; i++) { var L = M.transcript[i]; box.appendChild(el('div', { class: 'ln' }, [el('time', { text: L.t }), el('b', { text: L.who }), el('span', { text: L.text })])); await wait(450); } outcomes.meeting = { ok: true, text: 'Captured your coffee with Sophia', detail: 'Sample transcript captured with consent. Notes are in your meeting memory.' }; HS.log('day', 'Captured meeting notes with consent (sample)'); } }
          ];
        }, fail: function () { outcomes.meeting = { ok: false, text: 'Did not record your meeting', detail: 'You declined recording. HUMAN prepared the brief only.' }; } },
      { time: '1:15', label: '1:15 PM', title: 'After', build: function (st) {
          var tpw = tpWin('After the meeting', ['Extracting commitments', 'Preparing follow-ups', 'Your approval', 'Sending (demo)']), list = win('Commitments', [el('ul', { class: 'mb-l', id: 'dcm' })]), cal = calWin();
          st.appendChild(el('div', { class: 'wins' }, [el('div', { class: 'w-a' }, [list]), el('div', { class: 'w-b' }, [tpw]), el('div', { class: 'w-c' }, [cal])]));
          return [
            { label: 'Extracting commitments', ms: 700, tp: 0, run: async function () { var u = list.body.firstChild; for (var i = 0; i < HD.meeting.analysis.actions.length; i++) { var a = HD.meeting.analysis.actions[i]; u.appendChild(el('li', { text: a.text + ' (' + a.due + ')' })); await wait(320); } } },
            { label: 'Preparing follow-ups', ms: 700, tp: 1, run: function () { tpw.tp.set(1, 'doing', 'Email to Sophia, introduction to Priya, proposed film walk.'); } },
            { label: 'Your approval', ms: 300, tp: 2, approval: { title: 'Send 2 follow-ups and propose Thursday 9 AM?', body: 'Email to Sophia and an introduction to Priya. Private notes are never included.', perms: ['Send email (demo)', 'Propose calendar time'], approveLabel: 'Approve', rejectLabel: 'Hold them' }, host: tpw },
            { label: 'Sending (demo)', ms: 600, tp: 3, run: function () { HS.addEvent({ day: 'Thursday 21st', time: '9:00 AM', title: 'Film walk with Sophia (proposed)', source: 'HUMAN', pending: true }); HS.addMemory('sophia', 'promise', 'Film walk proposed: Thursday the 21st at 9 AM'); HS.log('day', 'Sent 2 follow-ups, proposed a film walk (demo)'); outcomes.after = { ok: true, text: 'Sent 2 follow-ups after your meeting', detail: 'Email to Sophia, introduction to Priya, and a proposed Thursday film walk (all demo).' }; } }
          ];
        }, fail: function () { outcomes.after = { ok: false, text: 'Held your meeting follow-ups', detail: 'Nothing was sent. They remain as drafts.' }; } },
      { time: '3:00', label: '3:00 PM', title: 'Nearby', build: function (st) {
          var p = HD.profiles.filter(function (x) { return x.id === 'sam'; })[0], per = HD.people.sam;
          var prof = win('Someone compatible nearby', [el('div', { class: 'pcard', style: 'box-shadow:none;animation:none' }, [el('div', { class: 'pc-ph', style: 'height:150px', html: HE.portrait(per) + '<span class="nm">' + per.name + '</span><span class="dist">≈ 0.5 km · Soho</span>' }), el('div', { class: 'pc-in' }, [el('div', { class: 'tg' }, p.interests.map(function (t) { return el('span', { text: t }); })), el('div', { class: 'why', text: 'Why HUMAN suggests Sam: both into startups and coffee, free right now.' })])])]);
          var tpw = tpWin('Introducing you to Sam', ['Spotting a compatible person', 'Asking Sam first (consent)', 'Sam responds', 'Suggesting a meetup']);
          var mapw = win('Map (approximate)', [el('div', { class: 'mapmini', style: 'height:130px', html: '<svg viewBox="0 0 220 96" preserveAspectRatio="xMidYMid slice"><rect width="220" height="96" fill="#EAF6EE"/><path d="M0 64 Q55 40 110 58 T220 42" stroke="#fff" stroke-width="9" fill="none"/><path d="M70 0 L100 96" stroke="#fff" stroke-width="7"/><circle cx="100" cy="52" r="6" fill="#007AFF"/><circle cx="140" cy="44" r="14" fill="#FF4D6D" opacity=".18"/><circle cx="140" cy="44" r="5" fill="#FF4D6D"/></svg>' })]);
          st.appendChild(el('div', { class: 'wins' }, [el('div', { class: 'w-a' }, [prof]), el('div', { class: 'w-b' }, [mapw, el('div', { style: 'height:14px' }), tpw])]));
          return [
            { label: 'Spotting a compatible person', ms: 800, tp: 0 },
            { label: 'Asking Sam first (consent)', ms: 300, tp: 1, approval: { title: 'Send Sam a coffee request?', body: 'Sam is 0.5 km away and free now. Nothing happens unless Sam says yes.', perms: ['Send request (demo)'], approveLabel: 'Send request', rejectLabel: 'Not today' }, host: tpw },
            { label: 'Sam responds', ms: 700, tp: 2, run: async function () { await wait(900); tpw.tp.set(2, 'doing', 'Sam said yes (simulated recipient response).'); } },
            { label: 'Suggesting a meetup', ms: 600, tp: 3, run: function () { HS.addEvent({ day: 'Today', time: '4:00 PM', title: 'Coffee with Sam · Café Lune', source: 'HUMAN' }); HS.addMemory('sam', 'fact', 'Coffee at Café Lune today 4 PM'); HS.log('day', 'Coffee with Sam arranged after mutual consent (demo)'); outcomes.nearby = { ok: true, text: 'Arranged coffee with Sam at 4 PM', detail: 'Sam agreed first (simulated). Café Lune, public place.' }; } }
          ];
        }, fail: function () { outcomes.nearby = { ok: false, text: 'Passed on meeting Sam', detail: 'No request was sent.' }; } },
      { time: '5:30', label: '5:30 PM', title: 'Groceries', build: function (st) {
          var items = [['Oat milk ×2', 3.7], ['Free-range eggs', 2.9], ['Sourdough loaf', 3.2], ['Pasta ×3', 3.6], ['Salmon fillet', 6.5], ['Delivery', 3.5]], tot = items.reduce(function (a, b) { return a + b[1]; }, 0);
          var cart = win('Browser · Your usual cart', [el('div', { class: 'browserui', style: 'box-shadow:none' }, [el('div', { class: 'url', text: '🔒 freshgrocer.example/cart (demo)' }), el('div', { class: 'win-b' }, items.map(function (i) { return el('div', { class: 'pr-r' }, [el('span', { text: i[0] }), el('b', { text: HE.money(i[1]) })]); }).concat([el('div', { class: 'pr-r tot' }, [el('span', { text: 'Total' }), el('b', { text: HE.money(tot) })])]))])]);
          var tpw = tpWin('Groceries for Sunday', ['Remembering you need groceries', 'Building your usual cart', 'Checkout approval', 'Order placed (demo)']);
          st.appendChild(el('div', { class: 'wins' }, [el('div', { class: 'w-a' }, [cart]), el('div', { class: 'w-b' }, [tpw])]));
          return [
            { label: 'Remembering you need groceries', ms: 600, tp: 0 }, { label: 'Building your usual cart', ms: 800, tp: 1 },
            { label: 'Checkout approval', ms: 300, tp: 2, approval: { title: 'Place this order for ' + HE.money(tot) + '?', body: 'Delivery Sunday 10 to 12. Demo: no card is charged.', perms: ['Purchase (demo)'], approveLabel: 'Approve ' + HE.money(tot), rejectLabel: 'Skip it' }, host: tpw },
            { label: 'Order placed (demo)', ms: 500, tp: 3, run: function () { HS.addEvent({ day: 'Sunday', time: '10:00 AM', title: 'Grocery delivery', source: 'HUMAN' }); HS.log('day', 'Ordered groceries ' + HE.money(tot) + ' (demo, no payment)'); outcomes.groceries = { ok: true, text: 'Ordered your usual groceries (' + HE.money(tot) + ')', detail: 'Approved by you. Demo order, no payment taken. Delivery Sunday 10 to 12.' }; } }
          ];
        }, fail: function () { outcomes.groceries = { ok: false, text: 'Did not order groceries', detail: 'You skipped the purchase. The cart was saved.' }; } },
      { time: '7:00', label: '7:00 PM', title: 'Digest', phone: true, build: function (st, ph) {
          var keys = [['email', '8:30 AM'], ['friend', '10:15 AM'], ['meeting', '12:30 PM'], ['after', '1:15 PM'], ['nearby', '3:00 PM'], ['groceries', '5:30 PM']];
          var dig = win('Today\'s digest', [el('ul', { class: 'digest', 'aria-label': 'Completed activity' })]); var ul = dig.body.firstChild;
          var sideNote = el('p', { class: 'demo-note', text: 'Built from what actually happened above. Reject something earlier and it shows here as skipped.' });
          st.appendChild(el('div', { class: 'side' }, [dig, sideNote]));
          return [
            { label: 'Collecting today', ms: 500, run: function () { ph.addMessage({ from: 'sys', text: 'Today 7:00 PM' }); } },
            { label: 'Writing your digest', ms: 700, run: async function () {
                await ph.reply({ text: 'Here\'s what I took care of today.' }, 600);
                for (var i = 0; i < keys.length; i++) { var o = outcomes[keys[i][0]] || { ok: null, text: 'Not played yet', detail: 'Play or step through this moment to see it here.' }; ul.appendChild(el('li', {}, [el('time', { text: keys[i][1], style: 'font:600 .78rem var(--sans);color:#625f5a' }), el('span', { text: o.text }), HE.status(o.ok === true ? 'Done' : o.ok === false ? 'Skipped' : 'Pending', o.ok === true ? 'ok' : o.ok === false ? 'no' : 'warn'), el('details', {}, [el('summary', { text: 'Evidence' }), el('div', { text: o.detail })])])); await wait(260); }
                var done = keys.filter(function (k) { return outcomes[k[0]] && outcomes[k[0]].ok; }).length; ph.addMessage({ from: 'them', node: C.CompletionReceipt({ title: done + ' of 6 things handled', lines: HS.get().log.slice(-4).map(function (l) { return l.text; }), note: 'All demo records. Nothing was sent or bought.' }) }); } }
          ];
        } }
    ];

    stages.forEach(function (s, i) { var b = el('button', { type: 'button', class: 'tl', role: 'tab', 'aria-selected': 'false', 'aria-label': s.label + ' ' + s.title }, [el('i', { text: String(i + 1) }), el('span', { text: s.label })]); b.addEventListener('click', function () { go(i, true); }); b.dataset.i = i; timeline.appendChild(b); });
    function setTl() { HE.$$('.tl', timeline).forEach(function (b, i) { var st = stages[i], done = i < cur || (outcomes[['email', 'friend', 'meeting', 'after', 'nearby', 'groceries', 'digest'][i]] && i !== cur); var skipped = outcomes[['email', 'friend', 'meeting', 'after', 'nearby', 'groceries'][i]] && outcomes[['email', 'friend', 'meeting', 'after', 'nearby', 'groceries'][i]].ok === false; b.className = 'tl' + (i === cur ? ' cur' : skipped ? ' skip' : done ? ' done' : ''); b.setAttribute('aria-selected', String(i === cur)); }); }
    var bPlay = el('button', { type: 'button', class: 'pill pri', text: '▶ Play the day' }), bPause = el('button', { type: 'button', class: 'pill', text: 'Pause' }), bPrev = el('button', { type: 'button', class: 'pill', text: '← Previous' }), bNext = el('button', { type: 'button', class: 'pill', text: 'Next action →' }), bRe = el('button', { type: 'button', class: 'pill', text: '↺ Replay the day' }), stat = el('span', { class: 'demo-note', 'aria-live': 'polite' });
    ctlBar.appendChild(el('div', { class: 'ctl' }, [bPlay, bPause, bPrev, bNext, bRe])); ctlBar.appendChild(stat);

    function go(i, user) {
      token++; var my = token; if (runner) runner.reset(true);
      i = Math.max(0, Math.min(stages.length - 1, i)); cur = i; stage.innerHTML = ''; stage.className = 'stage' + (stages[i].phone ? ' with-phone' : ''); setTl();
      var s = stages[i], phone = null;
      if (s.phone) { var slot = el('div', { class: 'phone-slot' }); stage.appendChild(slot); phone = new HE.Phone(slot, { id: 'day', name: 'HUMAN', sub: 'Messages', placeholder: 'Message HUMAN', onSend: function (t) { phone.reply({ text: PS.respond(t).text }, 700); } }); }
      var holder = el('div'); stage.appendChild(holder);
      var steps = s.build(holder, phone), tpw = holder.querySelector('.tp-list') ? holder.querySelector('.card.tp') : null;
      var def = { steps: steps.map(function (x) { return x; }) };
      runner = new HE.Runner(def, {
        onState: function (r) { stat.textContent = { running: s.label + ': HUMAN is working…', paused: 'Paused', waiting: 'Waiting for your approval', done: s.label + ' complete', rejected: 'You declined at ' + s.label + '. HUMAN did not do it.' }[r.state] || ''; bPause.disabled = !(r.state === 'running' || r.state === 'paused'); bPause.textContent = r.state === 'paused' ? 'Resume' : 'Pause'; },
        onStepStart: function (st, i2) { if (tpw && st.tp != null) tpw.set(st.tp, 'doing'); },
        onStepDone: function (st) { if (tpw && st.tp != null) tpw.set(st.tp, 'done'); },
        onApproval: function (st, i2, r) { var node = approvalNode(r, st.approval); var host = (st.host && st.host.querySelector && (st.host.querySelector('.win-b') || st.host)) || holder; if (phone) phone.addMessage({ from: 'them', node: node }); else host.appendChild(node); },
        onReject: function () { if (s.fail) s.fail(); setTl(); if (playing && my === token) setTimeout(function () { if (my === token && playing) go(cur + 1); }, 1500); },
        onDone: function () { setTl(); if (cur === stages.length - 1) { playing = false; bPlay.textContent = '▶ Play the day'; return; } if (playing && my === token) setTimeout(function () { if (my === token && playing) go(cur + 1); }, 1400); }
      });
      steps.forEach(function (x, k) { if (x.tp != null && tpw == null) { } });
      runner.start();
    }
    bPlay.addEventListener('click', function () { playing = true; bPlay.textContent = '▶ Playing…'; if (cur < 0 || (runner && (runner.state === 'done' || runner.state === 'rejected') && cur === stages.length - 1)) { outcomes = {}; go(0); } else if (runner && runner.state === 'paused') runner.resume(); else if (runner && (runner.state === 'done' || runner.state === 'rejected')) go(cur + 1); });
    bPause.addEventListener('click', function () { if (!runner) return; if (runner.state === 'paused') { playing = true; runner.resume(); } else { playing = false; bPlay.textContent = '▶ Play the day'; runner.pause(); } });
    bPrev.addEventListener('click', function () { playing = false; bPlay.textContent = '▶ Play the day'; go(cur <= 0 ? 0 : cur - 1, true); });
    bNext.addEventListener('click', function () { if (cur < 0) { go(0, true); return; } if (runner && runner.state === 'running') { runner.advance(); return; } playing = false; bPlay.textContent = '▶ Play the day'; if (cur < stages.length - 1) go(cur + 1, true); });
    bRe.addEventListener('click', function () { outcomes = {}; HS.get().calendar = HS.get().calendar.filter(function (e) { return e.source !== 'HUMAN' && e.source !== 'HUMAN-meet'; }); var S0 = HS.get(); if (!S0.calendar.some(function (e) { return e.id === 'c3'; })) S0.calendar.push({ id: 'c3', day: 'Tomorrow', time: '10:00 AM', title: 'Dentist: Dr. Lee', source: 'Calendar' }); HS.emit('calendar'); playing = true; bPlay.textContent = '▶ Playing…'; go(0); });
    stage.appendChild(el('div', { class: 'empty', text: 'Press "Play the day", or pick any moment on the timeline.' }));
    HE.onVisible(wrap, function () { /* autoplay is opt-in: keeps CPU low and never fights the reader */ });
    return { go: go };
  };

  /* =====================================================================
     SCENE 9: EVERYWHERE (shared state across devices)
     ===================================================================== */
  PS.everywhere = function (root) {
    var S = HS.get(), tabsDef = [['imessage', 'iPhone · Messages'], ['whatsapp', 'WhatsApp-style'], ['voice', 'Voice'], ['call', 'Phone call'], ['desktop', 'Desktop'], ['browser', 'Browser'], ['watch', 'Wearable']];
    var tabs = el('div', { class: 'dev-tabs', role: 'tablist', 'aria-label': 'Devices' }), stage = el('div', { class: 'dev-stage' }), view = el('div', { class: 'dev-view' }), side = el('div', { class: 'side' });
    root.appendChild(tabs); stage.appendChild(view); stage.appendChild(side); root.appendChild(stage);
    var dev = 'imessage', R = { events: [], status: 'idle', text: '', approval: null }, runner = null, phone = null, rendered = 0;
    S.request = R;
    var stateCard = el('div', { class: 'state-card' }), vision = el('div', { class: 'vision' }), presets = el('div', { class: 'ideas' }), reqIn = el('input', { placeholder: 'Ask HUMAN for something…', 'aria-label': 'Start a request', style: 'flex:1;border:1.5px solid rgba(22,21,28,.18);border-radius:999px;padding:11px 16px;font:400 .94rem var(--sans)' }), reqGo = el('button', { type: 'button', class: 'pill pri', text: 'Send from this device' });
    ['Order my usual groceries', 'Book a table for two on Friday', 'Reschedule my dentist'].forEach(function (t) { presets.appendChild(HE.chip(t, function () { submit(t); })); });
    side.appendChild(el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'One request, every device' }), el('span', { class: 'st', text: 'Shared state' })]), presets, el('div', { class: 'ask-row' }, [reqIn, reqGo]), stateCard, vision]));
    reqGo.addEventListener('click', function () { if (reqIn.value.trim()) { submit(reqIn.value.trim()); reqIn.value = ''; } }); reqIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') reqGo.click(); });
    var VIS = { imessage: 'Concept. Native iMessage access is not live. This is a web preview of the conversation.', whatsapp: 'Concept. A WhatsApp integration is not live. This preview shows the same HUMAN conversation.', voice: 'Concept. Voice runs as a simulated demo: no microphone is used.', call: 'Concept. Phone calls are not live. This shows how HUMAN could handle one.', desktop: 'Web preview of a desktop companion.', browser: 'Web preview of a browser companion.', watch: 'Concept. Wearables are a long-term vision, not a live integration.' };
    tabsDef.forEach(function (t) { var b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(t[0] === dev), text: t[1], on: { click: function () { setDev(t[0]); } } }); b.dataset.id = t[0]; tabs.appendChild(b); });
    tabs.addEventListener('keydown', function (e) { var ids = tabsDef.map(function (t) { return t[0]; }), i = ids.indexOf(dev); if (e.key === 'ArrowRight') setDev(ids[(i + 1) % ids.length], true); if (e.key === 'ArrowLeft') setDev(ids[(i + ids.length - 1) % ids.length], true); });

    function ev(who, text, kind) { R.events.push({ who: who, text: text, kind: kind || 'msg', t: R.events.length }); HS.emit('request'); render(true); }
    function submit(text) {
      if (runner) runner.reset(true); R.text = text; R.events = []; R.status = 'working'; R.approval = null; rendered = 0; if (phone) phone.clear();
      var dname = tabsDef.filter(function (t) { return t[0] === dev; })[0][1];
      ev('you', text, 'msg'); HS.log('everywhere', 'Request started on ' + dname + ': ' + text);
      runner = new HE.Runner({ steps: [
        { id: 's1', ms: 700, run: function () { ev('human', 'Got it. I will take care of "' + text + '".', 'msg'); } },
        { id: 's2', ms: 1000, run: function () { ev('human', 'Working on it: checking your calendar, preferences and options.', 'status'); } },
        { id: 's3', ms: 300, approval: { title: 'Go ahead with: "' + text + '"?' }, run: function () { R.status = 'needs approval'; R.approval = true; ev('human', 'I\'m ready. Do you approve? You can answer on any device.', 'approval'); } },
        { id: 's4', ms: 400, run: function () { R.status = 'done'; R.approval = null; ev('human', 'Done (demo). "' + text + '" is handled. Nothing real was sent or bought.', 'done'); HS.log('everywhere', 'Completed (demo): ' + text); } }
      ] }, { onState: function () { render(false); }, onReject: function () { R.status = 'declined'; R.approval = null; ev('human', 'Okay, I did not do it. Nothing was changed.', 'done'); } });
      runner.start(); render(false);
    }
    function decide(yes) { if (!R.approval || !runner) return; var dname = tabsDef.filter(function (t) { return t[0] === dev; })[0][1]; ev('you', (yes ? 'Approved' : 'Declined') + ' on ' + dname, 'msg'); if (yes) runner.approve(); else runner.reject(); }
    function paintState() {
      stateCard.innerHTML = ''; stateCard.appendChild(el('div', { class: 'card-k', text: 'Saved request (same on every device)' }));
      if (!R.text) { stateCard.appendChild(el('div', { class: 'empty', text: 'Nothing yet. Start a request above or in the device.' })); return; }
      stateCard.appendChild(el('b', { text: '"' + R.text + '"' })); var cls = { working: 'run', 'needs approval': 'warn', done: 'ok', declined: 'no' }[R.status] || '';
      stateCard.appendChild(el('div', { class: 'stg' }, [HE.status(R.status, cls), el('small', { text: R.events.length + ' events' })]));
      if (R.approval) stateCard.appendChild(el('div', { class: 'ctl' }, [el('button', { type: 'button', class: 'pill pri sm', text: 'Approve', on: { click: function () { decide(true); } } }), el('button', { type: 'button', class: 'pill sm', text: 'Decline', on: { click: function () { decide(false); } } })]));
    }
    function chipsFor() { return R.approval ? [{ label: 'Approve', yes: true }, { label: 'Not now', yes: false }] : []; }

    function setDev(id, focus) { dev = id; HE.$$('button', tabs).forEach(function (b) { var on = b.dataset.id === id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); }); vision.textContent = VIS[id]; buildView(); }
    function buildView() {
      view.innerHTML = ''; phone = null; rendered = 0;
      if (dev === 'imessage' || dev === 'whatsapp') {
        var slot = el('div', { class: 'phone-slot' }); view.appendChild(slot);
        var wa = dev === 'whatsapp'; phone = new HE.Phone(slot, { id: 'ev', name: wa ? 'HUMAN' : 'HUMAN', sub: wa ? 'online' : 'Messages', cls: wa ? 'wa' : '', placeholder: wa ? 'Message' : 'Message HUMAN', onSend: function (t) { if (!R.status || R.status === 'idle' || R.status === 'done' || R.status === 'declined') submitFromPhone(t); else phone.reply({ text: 'I\'m working on "' + R.text + '". Approve with the button when it appears.' }, 600); } });
        if (wa) slot.classList.add('wa-skin'); phone.addMessage({ from: 'sys', text: 'Today' });
      } else if (dev === 'voice') {
        var v = el('div', { class: 'voice' }, [el('div', { class: 'orb' + (runner && runner.state === 'running' ? ' live' : ''), 'aria-hidden': 'true' }), el('b', { text: 'HUMAN voice (simulated)' }), el('div', { class: 'thread', id: 'vtr', style: 'width:100%;max-height:200px;text-align:left' }), el('div', { id: 'vbtn', class: 'ctl', style: 'justify-content:center' })]); view.appendChild(v);
      } else if (dev === 'call') {
        view.appendChild(el('div', { class: 'callui' }, [HE.humanAvatar(), el('b', { text: 'HUMAN calling' }), el('small', { id: 'ctxt', text: 'Incoming (simulated). No real call is made.' }), el('div', { class: 'thread', id: 'ctr', style: 'text-align:left;color:#111;max-height:170px;background:#fff;border-radius:16px;padding:10px' }), el('div', { id: 'cbtn', class: 'ctl', style: 'justify-content:center' })]));
      } else if (dev === 'desktop') {
        view.appendChild(el('div', { class: 'laptop' }, [el('div', { class: 'scr' }, [el('div', { class: 'win-bar' }, [el('i'), el('i'), el('i'), el('span', { text: 'HUMAN · Desktop' })]), el('div', { class: 'win-b', id: 'dtx' })]), el('div', { class: 'base' })]));
      } else if (dev === 'browser') {
        view.appendChild(el('div', { class: 'browserui' }, [el('div', { class: 'url', text: '🔒 shop.example/checkout (demo page)' }), el('div', { class: 'win-b', id: 'btx' }, [el('p', { text: 'A page you are browsing. HUMAN sits in the side panel.' })])]));
      } else if (dev === 'watch') {
        view.appendChild(el('div', { class: 'watch', id: 'wtx', 'aria-label': 'Watch face' }));
      }
      render(false);
    }
    function submitFromPhone(t) { submit(t); }
    function render(fromEvent) {
      paintState();
      if (phone) { for (; rendered < R.events.length; rendered++) { var e = R.events[rendered]; if (e.who === 'you') { if (!(rendered === 0 && R.events[0].text === R.text && phoneEchoed)) phone.addMessage({ from: 'me', text: e.text }); } else if (e.kind === 'approval') { var card = C.Approval({ title: 'Approve "' + R.text + '"?', body: 'You can also approve on another device.', approveLabel: 'Approve', rejectLabel: 'Not now', onApprove: function () { if (R.approval) decide(true); }, onReject: function () { if (R.approval) decide(false); } }); phone.addMessage({ from: 'them', text: e.text, node: card }); } else if (e.kind === 'done') phone.addMessage({ from: 'them', node: C.CompletionReceipt({ title: 'Handled', lines: [R.text, 'Status: ' + R.status], note: 'Demo outcome. Nothing real happened.' }), text: e.text }); else phone.addMessage({ from: 'them', text: e.text }); } phoneEchoed = false; }
      var vtr = document.getElementById('vtr'); if (vtr) { vtr.innerHTML = ''; R.events.forEach(function (e) { vtr.appendChild(el('div', { class: 'b ' + (e.who === 'you' ? 'r' : 'l'), text: e.text })); }); vtr.scrollTop = vtr.scrollHeight; var vb = document.getElementById('vbtn'); vb.innerHTML = ''; if (R.approval) { vb.appendChild(el('button', { type: 'button', class: 'pill pri', text: 'Say: "Approve"', on: { click: function () { decide(true); } } })); vb.appendChild(el('button', { type: 'button', class: 'pill', text: 'Say: "Not now"', on: { click: function () { decide(false); } } })); } else vb.appendChild(el('button', { type: 'button', class: 'pill', text: 'Say: "' + (R.text || 'Order my usual groceries') + '"', on: { click: function () { submit(R.text || 'Order my usual groceries'); } } })); var orb = view.querySelector('.orb'); if (orb) orb.classList.toggle('live', R.status === 'working'); }
      var ctr = document.getElementById('ctr'); if (ctr) { ctr.innerHTML = ''; R.events.forEach(function (e) { ctr.appendChild(el('div', { class: 'b ' + (e.who === 'you' ? 'r' : 'l'), text: (e.who === 'you' ? 'You: ' : 'HUMAN: ') + e.text })); }); var cb = document.getElementById('cbtn'); cb.innerHTML = ''; if (R.approval) { cb.appendChild(el('button', { type: 'button', class: 'pill pri', text: 'Press 1 · Approve', on: { click: function () { decide(true); } } })); cb.appendChild(el('button', { type: 'button', class: 'pill', text: 'Press 2 · Decline', on: { click: function () { decide(false); } } })); } else cb.appendChild(el('button', { type: 'button', class: 'pill', text: R.text ? 'Replay request' : 'Start a request', on: { click: function () { submit(R.text || 'Order my usual groceries'); } } })); }
      var dtx = document.getElementById('dtx'); if (dtx) { dtx.innerHTML = ''; dtx.appendChild(el('div', { class: 'card' }, [el('div', { class: 'card-k', text: 'Task' }), el('b', { class: 'card-t', text: R.text ? '"' + R.text + '"' : 'No active task' }), HE.status(R.status === 'idle' ? 'idle' : R.status, { working: 'run', 'needs approval': 'warn', done: 'ok', declined: 'no' }[R.status] || '')])); var ul = el('ul', { class: 'logl', style: 'max-height:140px' }); R.events.forEach(function (e) { ul.appendChild(el('li', {}, [el('time', { text: e.who === 'you' ? 'You' : 'HUMAN' }), el('span', { text: e.text })])); }); dtx.appendChild(ul); if (R.approval) dtx.appendChild(el('div', { class: 'ctl' }, [el('button', { type: 'button', class: 'pill pri', text: 'Approve', on: { click: function () { decide(true); } } }), el('button', { type: 'button', class: 'pill', text: 'Decline', on: { click: function () { decide(false); } } })])); }
      var btx = document.getElementById('btx'); if (btx) { btx.innerHTML = ''; btx.appendChild(el('p', { text: 'A page you are browsing. HUMAN sits in the side panel.' })); var ext = el('div', { class: 'card', style: 'width:100%' }, [el('div', { class: 'card-k', text: 'HUMAN side panel' }), el('b', { class: 'card-t', text: R.text ? '"' + R.text + '"' : 'Ask HUMAN anything about this page' }), el('p', { class: 'card-p', text: R.status === 'idle' ? 'Waiting.' : 'Status: ' + R.status })]); if (R.approval) ext.appendChild(el('div', { class: 'card-btns' }, [el('button', { type: 'button', class: 'pill pri', text: 'Approve', on: { click: function () { decide(true); } } }), el('button', { type: 'button', class: 'pill', text: 'Decline', on: { click: function () { decide(false); } } })])); else if (!R.text) ext.appendChild(el('div', { class: 'card-btns' }, [el('button', { type: 'button', class: 'pill', text: 'Start: order my usual groceries', on: { click: function () { submit('Order my usual groceries'); } } })])); btx.appendChild(ext); }
      var wtx = document.getElementById('wtx'); if (wtx) { wtx.innerHTML = ''; wtx.appendChild(el('small', { text: 'HUMAN' })); wtx.appendChild(el('b', { text: R.text ? R.text : 'No request' })); wtx.appendChild(el('small', { text: R.status === 'idle' ? '' : R.status })); if (R.approval) wtx.appendChild(el('button', { type: 'button', text: 'Tap to approve', on: { click: function () { decide(true); } } })); else if (!R.text) wtx.appendChild(el('button', { type: 'button', text: 'Start a request', on: { click: function () { submit('Order my usual groceries'); } } })); }
    }
    var phoneEchoed = false;
    HS.on('reset', function () { R.events = []; R.status = 'idle'; R.text = ''; R.approval = null; });
    setDev('imessage');
    return { submit: submit };
  };
})(window);
