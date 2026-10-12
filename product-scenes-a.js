/* Scenes 1-2: hero composition + communications (iMessage-style phone). */
(function (g) {
  'use strict';
  var PS = g.PS = g.PS || {};
  var el = HE.el, C = HE.Cards, wait = HE.wait;

  /* ---------- shared rule-based responder (grounded in shared demo state) ---------- */
  PS.respond = function (text) {
    var t = (text || '').toLowerCase(), S = HS.get();
    if (/\b(hi|hello|hey)\b/.test(t)) return { text: 'Hi Alex. I am here. What can I take care of?' };
    if (/thank/.test(t)) return { text: 'Anytime. That is what I am for.' };
    if (/(calendar|schedule|today|agenda|what.?s on)/.test(t)) {
      var ev = S.calendar.filter(function (e) { return e.day === 'Today'; });
      return { text: ev.length ? 'Today you have: ' + ev.map(function (e) { return e.time + ' ' + e.title; }).join(', ') + '.' : 'Your day is clear.' };
    }
    if (/(tennis|play)/.test(t)) return { text: 'Jordan is free Saturday morning and loves tennis. Want me to ask him? (Try the "People" chapter for the full flow.)' };
    if (/(coffee|sophia)/.test(t)) return { text: 'Coffee with Sophia is at 3 PM at Café Lune. I prepared a brief: she is moving to Lisbon in September, and you promised to send her a book.' };
    if (/(dinner|friday|maya)/.test(t)) return { text: 'Maya asked about dinner on Friday around 7. I can confirm it for you. Try the "Dinner with Maya" demo above.' };
    if (/(dentist|form)/.test(t)) return { text: 'The dentist form is ready for your review. Open the "Dentist form" demo.' };
    if (/(package|parcel|order|delivery|refund)/.test(t)) return { text: 'I can look into that order and contact support. Open the "Missing package" demo.' };
    if (/(groceries|shopping|buy)/.test(t)) return { text: 'I can prepare your usual groceries. See "You say it. It is done" below, then you approve the purchase.' };
    if (/(anything|need to do|todo|to-?do)/.test(t)) return { text: 'Just enjoy your afternoon. I\'ll handle the rest.' };
    return { text: 'In this demo I can handle: dinner with Maya, the dentist form, a missing package, today\'s schedule, coffee with Sophia, or finding a tennis partner. Try one of those.' };
  };

  /* ---------- simple thread (what the other person sees) ---------- */
  function Thread(root, title, sub) {
    this.root = root; this.head = el('h4', {}, [el('span', { text: title }), el('span', { class: 'st', text: sub || 'Demo' })]);
    this.list = el('div', { class: 'thread', role: 'log', 'aria-live': 'polite' });
    root.appendChild(this.head); root.appendChild(this.list);
  }
  Thread.prototype.header = function (title, sub) { this.head.firstChild.textContent = title; this.head.lastChild.textContent = sub || 'Demo'; };
  Thread.prototype.add = function (side, text, meta) {
    var b = el('div', { class: 'b ' + side }, [document.createTextNode(text)]); if (meta) b.appendChild(el('small', { text: meta }));
    this.list.appendChild(b); this.list.scrollTop = this.list.scrollHeight; return b;
  };
  Thread.prototype.sys = function (text) { this.list.appendChild(el('div', { class: 'sys', text: text })); this.list.scrollTop = this.list.scrollHeight; };
  Thread.prototype.clear = function () { this.list.innerHTML = ''; };
  PS.Thread = Thread;

  function actionLog(root, kinds) {
    var wrap = el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'What HUMAN did' }), el('span', { class: 'st', text: 'Live' })])]);
    var list = el('ul', { class: 'logl' }); wrap.appendChild(list); root.appendChild(wrap);
    function paint() {
      list.innerHTML = ''; var items = HS.get().log.filter(function (l) { return !kinds || kinds.indexOf(l.kind) > -1; });
      if (!items.length) { list.appendChild(el('li', { class: 'empty', text: 'Nothing yet. Start a scenario.' })); return; }
      items.slice(-8).reverse().forEach(function (l) { list.appendChild(el('li', {}, [el('time', { text: l.t }), el('span', {}, [el('span', { class: 'k', text: l.kind }), l.text])])); });
    }
    HS.on('log', paint); HS.on('reset', paint); paint(); return wrap;
  }
  PS.actionLog = actionLog;

  /* =====================================================================
     SCENE 1: HERO
     ===================================================================== */
  PS.hero = function (root) {
    var stage = el('div', { class: 'hero-stage' }); root.appendChild(stage);
    var slot = el('div', { class: 'phone-slot' }); stage.appendChild(slot);
    var panels = {}, token = 0, auto = true, controlsBar;

    /* ----- phone ----- */
    var phone = new HE.Phone(slot, { id: 'hero', name: 'HUMAN', sub: 'Messages', placeholder: 'Message HUMAN', onSend: function (t) {
      stopAuto(); var r = PS.respond(t); phone.reply({ text: r.text }, 800);
    } });
    var actions = [
      { id: 'a', label: 'Replied to Maya', panel: 'pa', detail: 'Maya asked about Friday. I confirmed 7 PM (demo) and added it to your calendar.', stepsDone: false },
      { id: 'b', label: 'Prepared your 3 PM meeting', panel: 'pb', detail: 'Coffee with Sophia: brief ready, with the book you promised her at the top.', stepsDone: false },
      { id: 'c', label: 'Found someone to play tennis with', panel: 'pc', detail: 'Jordan is free Saturday morning. I drafted an introduction and asked first (demo).', stepsDone: false }
    ];
    var cardNode, rows = {};
    function buildActionCard() {
      var card = el('div', { class: 'card', role: 'group', 'aria-label': 'Things HUMAN took care of' });
      card.appendChild(el('div', { class: 'card-k', text: 'Handled for you' }));
      var list = el('div', { style: 'display:grid;gap:1.4cqw' });
      actions.forEach(function (a) {
        var det = el('div', { class: 'tp-det', text: a.detail, hidden: 'hidden', style: 'margin-left:6cqw' });
        var chk = el('i', { class: 'tp-dot', 'aria-hidden': 'true' });
        var b = el('button', { type: 'button', class: 'tp-b', 'aria-expanded': 'false', on: { click: function () {
          stopAuto(); var open = det.hasAttribute('hidden'); if (open) det.removeAttribute('hidden'); else det.setAttribute('hidden', 'hidden'); b.setAttribute('aria-expanded', String(open));
          Object.keys(panels).forEach(function (k) { panels[k].el.classList.remove('hl'); }); if (open && panels[a.panel]) panels[a.panel].el.classList.add('hl');
        } } }, [chk, el('span', { text: a.label })]);
        var li = el('div', { class: 'doing' }, [b, det]); rows[a.id] = { li: li, det: det }; list.appendChild(li);
      });
      card.appendChild(list); return card;
    }
    function markDone(id) { if (rows[id]) rows[id].li.className = 'done'; }

    /* ----- panels ----- */
    function mkPanel(cls, title, kind) {
      var p = el('section', { class: 'panel ' + cls, 'aria-label': title }); p.appendChild(el('h4', {}, [el('span', { text: title }), el('span', { class: 'st', text: 'Demo' })]));
      stage.appendChild(p); return p;
    }
    // A: inbox
    (function () {
      var p = mkPanel('pa', 'Inbox'), api = { el: p, s: 0 };
      var mail = el('div', { class: 'mini' }, [el('b', { text: 'Dr. Lee\'s office' }), el('div', { text: 'Please confirm tomorrow and complete the new patient form.' })]);
      var typed = el('div', { class: 'mini typed', 'aria-live': 'polite' });
      var form = el('div', { class: 'mini', hidden: 'hidden' });
      var steps = el('ul', { class: 'steps-mini' });
      ['Read the email', 'Reply drafted', 'Form filled', 'Sent (demo)'].forEach(function (l) { steps.appendChild(el('li', {}, [el('i'), el('span', { text: l })])); });
      var btn = el('button', { type: 'button', class: 'pill sm', text: 'Step through' }); btn.addEventListener('click', function () { stopAuto(); api.next(); });
      [mail, typed, form, steps, el('div', { class: 'row-chips' }, [btn])].forEach(function (n) { p.appendChild(n); });
      var reply = 'Hi, confirming tomorrow at 10:00. Form attached.';
      api.next = async function () {
        var lis = steps.children; if (api.s >= 4) { api.reset(); return; }
        var i = api.s++; lis[i].className = 'doing';
        if (i === 0) { await wait(500); }
        if (i === 1) { typed.textContent = ''; for (var k = 0; k < reply.length; k++) { typed.textContent += reply[k]; if (k % 3 === 0) await wait(16); } }
        if (i === 2) { form.removeAttribute('hidden'); form.innerHTML = ''; [['Name', 'Alex Rivera'], ['Allergies', 'Penicillin'], ['Insurance', 'HX-48213']].forEach(function (f, j) { form.appendChild(el('div', { class: 'fld' }, [el('span', { text: f[0] }), el('em', { text: f[1] })])); }); await wait(500); }
        if (i === 3) { await wait(400); }
        lis[i].className = 'done'; if (i === 3) { markDone('a'); HS.log('message', 'Replied to Maya (demo, not sent)'); }
      };
      api.reset = function () { api.s = 0; typed.textContent = ''; form.setAttribute('hidden', 'hidden'); [].forEach.call(steps.children, function (l) { l.className = ''; }); };
      panels.pa = api;
    })();
    // B: meeting brief
    (function () {
      var p = mkPanel('pb', 'Meetings'), api = { el: p, s: 0 };
      p.appendChild(el('div', { class: 'mini' }, [el('b', { text: '3:00 PM · Coffee with Sophia' }), el('small', { text: 'Café Lune · 45 min' })]));
      var brief = el('div', { class: 'mini', hidden: 'hidden' }), chips = el('div', { class: 'row-chips', hidden: 'hidden' });
      p.appendChild(brief); p.appendChild(chips);
      ['Last spoke 12 days ago', 'Decided on Lisbon residency', 'You promised her a book'].forEach(function (t, i) { brief.appendChild(el('div', { class: 'fld', hidden: 'hidden' }, [el('span', { text: t })])); });
      ['Send the book', 'Introduce to Priya'].forEach(function (t) {
        chips.appendChild(HE.chip(t, function (e) { stopAuto(); e.currentTarget.classList.toggle('on'); if (e.currentTarget.classList.contains('on')) HS.log('meeting', 'Follow-up queued: ' + t); }));
      });
      var btn = el('button', { type: 'button', class: 'pill sm', text: 'Prepare me' }); btn.addEventListener('click', function () { stopAuto(); api.next(); });
      p.appendChild(el('div', { class: 'row-chips' }, [btn]));
      api.next = async function () {
        if (api.s >= 2) { api.reset(); return; } api.s++;
        if (api.s === 1) { brief.removeAttribute('hidden'); for (var i = 0; i < brief.children.length; i++) { brief.children[i].removeAttribute('hidden'); await wait(380); } }
        if (api.s === 2) { chips.removeAttribute('hidden'); markDone('b'); }
      };
      api.reset = function () { api.s = 0; brief.setAttribute('hidden', 'hidden'); chips.setAttribute('hidden', 'hidden'); [].forEach.call(brief.children, function (c) { c.setAttribute('hidden', 'hidden'); }); [].forEach.call(chips.children, function (c) { c.classList.remove('on'); }); };
      panels.pb = api;
    })();
    // C: introductions
    (function () {
      var p = mkPanel('pc', 'Introductions'), api = { el: p, s: 0 };
      var pair = el('div', { class: 'pair' }, [HE.avatar('sophia'), el('i', { class: 'link' }), HE.avatar('priya')]);
      var txt = el('div', { class: 'mini', text: 'Both love photography of tech spaces. Introduce them?' });
      var status = el('div', { class: 'row-chips' }), btn = el('button', { type: 'button', class: 'pill sm pri', text: 'Introduce' });
      btn.addEventListener('click', function () { stopAuto(); api.next(); });
      [pair, txt, el('div', { class: 'row-chips' }, [btn, status])].forEach(function (n) { p.appendChild(n); });
      api.next = async function () {
        if (api.s === 0) { api.s = 1; btn.disabled = true; txt.textContent = 'Introduction requested. Waiting for both to agree.'; status.innerHTML = ''; status.appendChild(HE.status('Requested', 'warn')); await wait(900); api.s = 2; p.classList.add('matched'); txt.textContent = 'Sophia and Priya both said yes. Connected.'; status.innerHTML = ''; status.appendChild(HE.status('Connected', 'ok')); btn.textContent = 'Replay'; btn.disabled = false; markDone('c'); HS.log('people', 'Introduced Sophia and Priya (demo, consent shown)'); }
        else api.reset();
      };
      api.reset = function () { api.s = 0; p.classList.remove('matched'); txt.textContent = 'Both love photography of tech spaces. Introduce them?'; status.innerHTML = ''; btn.textContent = 'Introduce'; btn.disabled = false; };
      panels.pc = api;
    })();
    // D: meetup
    (function () {
      var p = mkPanel('pd', 'Meetup'), api = { el: p, s: 0, time: '4:30 PM' };
      var map = el('div', { class: 'mapmini', 'aria-hidden': 'true', html: '<svg viewBox="0 0 220 96" preserveAspectRatio="xMidYMid slice"><rect width="220" height="96" fill="#EAF6EE"/><path d="M0 64 Q55 40 110 58 T220 42" stroke="#fff" stroke-width="9" fill="none"/><path d="M70 0 L100 96" stroke="#fff" stroke-width="7"/><path d="M150 0 L140 96" stroke="#fff" stroke-width="5"/><path d="M104 56 L150 40" stroke="#007AFF" stroke-width="3" stroke-dasharray="4 5" fill="none"/><circle cx="104" cy="56" r="5" fill="#007AFF"/></svg>' });
      var line = el('div', { class: 'mini', text: 'Finding a café between you and Sophia...' });
      var chips = el('div', { class: 'row-chips', hidden: 'hidden' });
      ['4:30 PM', '5:00 PM'].forEach(function (t) { var c = HE.chip(t, function () { stopAuto(); setTime(t); }, t === api.time ? 'on' : ''); c.dataset.t = t; chips.appendChild(c); });
      [map, line, chips].forEach(function (n) { p.appendChild(n); });
      function setTime(t) {
        api.time = t; line.innerHTML = ''; line.appendChild(el('b', { text: 'Coffee · ' + t })); line.appendChild(el('div', { text: 'Café Lune, 0.4 km · both free' }));
        [].forEach.call(chips.children, function (c) { c.classList.toggle('on', c.dataset.t === t); });
        var S = HS.get(); S.calendar = S.calendar.filter(function (e) { return e.source !== 'HUMAN-hero'; }); HS.addEvent({ day: 'Today', time: t, title: 'Coffee at Café Lune', source: 'HUMAN-hero' });
      }
      var btn = el('button', { type: 'button', class: 'pill sm', text: 'Find a place' }); btn.addEventListener('click', function () { stopAuto(); api.next(); });
      p.appendChild(el('div', { class: 'row-chips' }, [btn]));
      api.next = async function () {
        if (api.s >= 1) { api.reset(); return; } api.s = 1; await wait(500);
        var pin = el('span', { class: 'pin' }); pin.style.left = '68%'; pin.style.top = '42%'; map.appendChild(pin); setTime(api.time); chips.removeAttribute('hidden');
      };
      api.reset = function () { api.s = 0; map.querySelectorAll('.pin').forEach(function (n) { n.remove(); }); chips.setAttribute('hidden', 'hidden'); line.textContent = 'Finding a café between you and Sophia...'; var S = HS.get(); S.calendar = S.calendar.filter(function (e) { return e.source !== 'HUMAN-hero'; }); HS.emit('calendar'); };
      panels.pd = api;
    })();
    // E: errands
    (function () {
      var p = mkPanel('pe', 'Errands'), api = { el: p, s: 0 };
      var cart = el('div', { class: 'mini' }, [el('b', { text: 'Groceries · 14 items' }), el('div', { text: 'Your usual, delivery Sunday 10 to 12' }), el('div', { class: 'fld' }, [el('span', { text: 'Estimated total' }), el('em', { text: '£48.20' })])]);
      var steps = el('ul', { class: 'steps-mini' });
      ['Cart ready', 'Waiting for your approval', 'Order placed (demo)'].forEach(function (l) { steps.appendChild(el('li', {}, [el('i'), el('span', { text: l })])); });
      var btn = el('button', { type: 'button', class: 'pill sm pri', text: 'Approve £48.20' }); btn.disabled = true;
      btn.addEventListener('click', function () { stopAuto(); api.approve(); });
      [cart, steps, el('div', { class: 'row-chips' }, [btn, el('span', { class: 'demo-note', text: 'Demo only. No payment.' })])].forEach(function (n) { p.appendChild(n); });
      api.next = async function () {
        if (api.s >= 1) { if (api.s === 2) api.reset(); return; } api.s = 1;
        steps.children[0].className = 'doing'; await wait(600); steps.children[0].className = 'done'; steps.children[1].className = 'doing'; btn.disabled = false;
      };
      api.approve = async function () { if (api.s !== 1) return; api.s = 2; btn.disabled = true; steps.children[1].className = 'done'; steps.children[2].className = 'doing'; await wait(700); steps.children[2].className = 'done'; HS.log('task', 'Groceries ordered for Sunday (demo, no payment)'); };
      api.reset = function () { api.s = 0; btn.disabled = true; [].forEach.call(steps.children, function (c) { c.className = ''; }); };
      panels.pe = api;
    })();

    /* ----- phone conversation ----- */
    function seed() {
      phone.clear(); actions.forEach(function (a) { a.stepsDone = false; });
      phone.addMessage({ from: 'sys', text: 'Today 8:12 AM' });
    }
    async function intro(my) {
      seed(); await wait(500); if (my !== token) return;
      phone.typing(true); await wait(1100); if (my !== token) return; phone.clearTyping();
      cardNode = buildActionCard();
      phone.addMessage({ from: 'them', text: 'Your day is looking good. I\'ve taken care of a few things.', node: cardNode });
      phone.quick([{ label: 'Anything I need to do?', onClick: function () { stopAuto(); phone.reply({ text: 'Just enjoy your afternoon. I\'ll handle the rest.' }, 900); } }]);
    }
    async function choreography(my) {
      function alive() { return my === token && auto; }
      await intro(my); if (!alive()) return; await wait(900);
      var seq = [['pa', 4], ['pb', 2], ['pc', 1], ['pd', 1], ['pe', 1]];
      for (var i = 0; i < seq.length; i++) {
        var k = seq[i][0], n = seq[i][1];
        for (var j = 0; j < n; j++) { if (!alive()) return; panels[k].el.classList.add('hl'); await panels[k].next(); await wait(900); }
        panels[k].el.classList.remove('hl');
        if (k === 'pc') markDone('c');
      }
      if (!alive()) return; await panels.pe.approve(); auto = false; setBar(true);
    }
    function stopAuto() { if (!auto) return; auto = false; token++; setBar(true); Object.keys(panels).forEach(function (k) { panels[k].el.classList.remove('hl'); }); if (cardNode) Object.keys(rows).forEach(function (id) { if (rows[id].li.className !== 'done') markDone(id); }); }
    function setBar(stopped) { if (controlsBar) controlsBar.querySelector('button').textContent = stopped ? 'Replay the morning' : 'Pause the autoplay'; }
    function replay() { token++; auto = true; Object.keys(panels).forEach(function (k) { panels[k].reset(); }); setBar(false); choreography(token); }
    controlsBar = el('div', { class: 'autoplay-bar' }, [el('button', { type: 'button', class: 'pill', text: 'Pause the autoplay', on: { click: function () { if (auto) stopAuto(); else replay(); } } })]);
    root.appendChild(controlsBar);

    // mouse parallax (desktop, motion allowed)
    if (!HE.reduced && window.matchMedia && matchMedia('(hover:hover) and (min-width:1101px)').matches) {
      var depth = { pa: 14, pb: -12, pc: 20, pd: -18, pe: -10 };
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        Object.keys(panels).forEach(function (k) { panels[k].el.style.transform = 'translate3d(' + (x * depth[k]).toFixed(1) + 'px,' + (y * depth[k]).toFixed(1) + 'px,0)'; });
      });
      stage.addEventListener('mouseleave', function () { Object.keys(panels).forEach(function (k) { panels[k].el.style.transform = ''; }); });
    }
    ['pointerdown', 'keydown'].forEach(function (ev) { stage.addEventListener(ev, function (e) { if (e.target.closest && e.target.closest('.autoplay-bar')) return; stopAuto(); }); });

    token = 1; HE.onVisible(stage, function () { if (token === 1 && auto) choreography(token); });
    return { replay: replay };
  };

  /* =====================================================================
     SCENE 2: COMMUNICATIONS
     ===================================================================== */
  PS.comms = function (root) {
    var tabsDef = [
      { id: 'dinner', label: 'Dinner with Maya', kw: /(dinner|friday|maya)/i },
      { id: 'dentist', label: 'Dentist form', kw: /(dentist|form|appointment)/i },
      { id: 'package', label: 'Missing package', kw: /(package|parcel|delivery|arrived|order)/i }
    ];
    var tabs = el('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Communication scenarios' });
    var layout = el('div', { class: 'dual' }), left = el('div'), side = el('div', { class: 'side' });
    var slot = el('div', { class: 'phone-slot' }); left.appendChild(slot);
    layout.appendChild(left); layout.appendChild(side);
    root.appendChild(tabs); root.appendChild(layout);
    var thread = new Thread(el('div', { class: 'glass' }), 'What Maya sees', 'Demo');
    side.appendChild(thread.root); actionLog(side, ['message', 'form', 'support', 'calendar']);
    var cur = null, runner = null, phone, ctl;
    phone = new HE.Phone(slot, { id: 'comms', name: 'HUMAN', sub: 'Messages', placeholder: 'Message HUMAN', onSend: function (t) {
      var hit = tabsDef.filter(function (d) { return d.kw.test(t); })[0];
      if (hit && hit.id !== cur) { select(hit.id, true); return; }
      if (runner && (runner.state === 'waiting' || runner.state === 'running')) { phone.reply({ text: 'I am in the middle of something. Use the buttons above to approve, pause or skip.' }, 700); return; }
      phone.reply({ text: PS.respond(t).text }, 800);
    } });
    ctl = el('div', { class: 'ctl', style: 'justify-content:center;margin-top:18px' });
    function cbtn(label, fn) { var b = el('button', { type: 'button', class: 'pill', text: label, on: { click: fn } }); ctl.appendChild(b); return b; }
    var bPause = cbtn('Pause', function () { if (!runner) return; if (runner.state === 'paused') runner.resume(); else runner.pause(); bPause.textContent = runner.state === 'paused' ? 'Resume' : 'Pause'; });
    var bSkip = cbtn('Skip step', function () { if (runner) runner.advance(); });
    cbtn('Restart', function () { select(cur, true); });
    left.appendChild(ctl);
    var stateLine = el('p', { class: 'demo-note', style: 'text-align:center', 'aria-live': 'polite' }); left.appendChild(stateLine);

    tabsDef.forEach(function (d) {
      var b = el('button', { type: 'button', role: 'tab', 'aria-selected': 'false', text: d.label, on: { click: function () { select(d.id, true); } } }); b.dataset.id = d.id; tabs.appendChild(b);
    });

    function approvalFlow(r, st, builder) { /* helper placeholder for readability */ }

    function mkTP(title, labels) { var tp = C.TaskProgress({ title: title, steps: labels.map(function (l) { return { label: l }; }) }); return tp; }

    /* --- scenario 1: dinner with Maya --- */
    function dinner() {
      var ctx = { time: '7:00 PM' }, tp;
      var def = { steps: [
        { id: 'incoming', ms: 800, run: function () { thread.header('Maya', 'Messages'); thread.add('l', 'Hey! Are we still doing dinner on Friday? I was thinking around 7.', 'Maya · now'); phone.addMessage({ from: 'sys', text: 'HUMAN noticed a new message from Maya' }); HS.log('message', 'Noticed Maya asking about Friday dinner'); } },
        { id: 'notice', ms: 200, run: async function () { await phone.reply({ text: 'Maya asked about dinner on Friday around 7. Friday works. I found a place you both liked last time. Want me to confirm 7?' }, 1100); },
          approval: { title: 'Confirm dinner with Maya?', body: 'Friday 7:00 PM. I will message Maya, reserve a table and add it to your calendar.', perms: ['Read calendar', 'Draft & send message to Maya', 'Add calendar event'], approveLabel: 'Go ahead', rejectLabel: 'Not now' } },
        { id: 'availability', ms: 900, tp: 0, run: function (c) { var fr = HS.get().calendar.filter(function (e) { return e.day === 'Friday' && e.source !== 'HUMAN'; }); return wait(500).then(function () { tp.set(0, 'doing', 'Friday evening has ' + (fr.length ? fr.map(function (e) { return e.title + ' at ' + e.time; }).join(' and ') : 'nothing') + '. ' + ctx.time + ' is free.'); }); } },
        { id: 'restaurant', ms: 900, tp: 1, run: async function () { await wait(500); phone.addMessage({ from: 'them', node: C.Reservation({ place: 'Trattoria Verde, Soho', when: 'Friday · ' + ctx.time, party: 'Table for 2', status: 'Table request (demo)' }) }); tp.set(1, 'doing', 'You both rated it 5 stars in March. I used Maya\'s allergy note: no shellfish dishes.'); } },
        { id: 'message', ms: 800, tp: 2, run: async function () { tp.set(2, 'doing', 'Drafted in your tone: short and warm.'); await wait(500); thread.add('r', 'Friday at ' + ctx.time + ' works! Trattoria Verde? I\'ll book us a table.', 'You, written by HUMAN (demo, not sent)'); HS.log('message', 'Sent confirmation to Maya (demo, not delivered)'); } },
        { id: 'reply', ms: 700, tp: 3, run: async function () { await wait(800); thread.add('l', 'Perfect, see you there!', 'Maya · simulated reply'); tp.set(3, 'doing', 'Simulated recipient response. In a real deployment this arrives from Maya.'); } },
        { id: 'calendar', ms: 700, tp: 4, run: function () { var ev = HS.addEvent({ day: 'Friday', time: ctx.time, title: 'Dinner with Maya · Trattoria Verde', source: 'HUMAN' }); HS.log('calendar', 'Added dinner with Maya, Friday ' + ctx.time); phone.addMessage({ from: 'them', node: C.CalendarEvent({ day: 'Friday', time: ctx.time, title: 'Dinner with Maya', status: 'Added to your calendar (demo)' }) }); HS.addMemory('maya', 'fact', 'Dinner at Trattoria Verde, Friday ' + ctx.time); } },
        { id: 'done', ms: 200, tp: 5, run: function () { phone.addMessage({ from: 'them', node: C.CompletionReceipt({ title: 'Dinner is arranged', lines: ['Confirmed with Maya (simulated reply)', 'Table at Trattoria Verde, ' + ctx.time, 'Calendar updated', 'Maya\'s allergy note respected'] }) }); } }
      ] };
      runner = new HE.Runner(def, scenarioHooks(function () { return tp; }, function (t) { tp = t; }, 'Dinner with Maya', ['Checking availability', 'Finding the restaurant', 'Preparing a message', 'Sending confirmation (demo)', 'Updating the calendar', 'Completed'], ctx, {
        quick: function () { return [{ label: 'Go ahead', onClick: function () { if (ctx.card) ctx.card.resolve('approve'); runner.approve(); } }, { label: 'Suggest 8 instead', onClick: function () { ctx.time = '8:00 PM'; if (ctx.card) ctx.card.resolve('approve'); phone.reply({ text: '8 it is. I will check that it works for both of you.' }, 600); runner.approve(); } }, { label: 'Not now', onClick: function () { if (ctx.card) ctx.card.resolve('reject'); runner.reject(); } }]; }
      }));
      return runner;
    }

    /* --- scenario 2: dentist form --- */
    function dentist() {
      var fields = [{ label: 'Full name', value: 'Alex Rivera' }, { label: 'Date of birth', value: '14 Mar 1994' }, { label: 'Allergies', value: 'Penicillin' }, { label: 'Medications', value: 'None' }, { label: 'Insurance ID', value: 'HX-48213' }, { label: 'Reason for visit', value: 'Routine cleaning' }];
      var ctx = {}, tp, formCard;
      function openEditor(card) {
        var body = el('form', { class: 'perm' }), inputs = [];
        fields.forEach(function (f) { var inp = el('input', { value: f.value, 'aria-label': f.label }); inputs.push(inp); body.appendChild(el('label', { class: 'field' }, [f.label, inp])); });
        body.appendChild(el('div', { class: 'ctl' }, [el('button', { type: 'submit', class: 'pill pri', text: 'Save changes' }), el('small', { class: 'demo-note', text: 'Demo form. Nothing is submitted anywhere.' })]));
        var sh = HE.sheet('Review and edit form', body);
        body.addEventListener('submit', function (e) { e.preventDefault(); inputs.forEach(function (inp, i) { fields[i].value = inp.value || '—'; }); card.repaint(); HS.log('form', 'Edited dentist form details'); sh.close(); });
      }
      var def = { steps: [
        { id: 'email', ms: 800, run: function () { thread.header('Email · Dr. Lee\'s Dental', 'Inbox'); thread.add('l', 'Hi Alex, before tomorrow\'s 10:00 appointment please complete the attached new patient form. Thanks, Front desk', 'Dr. Lee\'s office · 8:02 AM'); phone.addMessage({ from: 'sys', text: 'HUMAN is reading your email (demo)' }); HS.log('form', 'Found a form request from Dr. Lee\'s office'); } },
        { id: 'prepared', ms: 300, run: async function () {
            await phone.reply({ text: 'Your dentist sent a form before tomorrow\'s appointment. I\'ve prepared it using the details you approved.' }, 1100);
            formCard = C.FormPreview({ title: 'New patient form', fields: fields, buttons: [
              { label: 'Review form', onClick: function (c) { openEditor(c); } },
              { label: 'Approve submission', pri: true, onClick: function () { runner.approve(); } },
              { label: 'Edit information', onClick: function (c) { openEditor(c); } }] });
            phone.addMessage({ from: 'them', node: formCard });
          },
          approval: { title: 'Submit', body: '', perms: [], hidden: true } },
        { id: 'review', ms: 800, tp: 0, run: function () { formCard.row.remove(); tp.set(0, 'doing', 'You reviewed the details I filled in.'); } },
        { id: 'submit', ms: 900, tp: 1, run: function () { tp.set(1, 'doing', 'Submitted to Dr. Lee\'s office (demo, nothing sent).'); thread.add('r', 'Form completed. See you tomorrow at 10:00.', 'You, written by HUMAN (demo, not sent)'); HS.log('form', 'Submitted dentist form (demo, not sent)'); } },
        { id: 'confirm', ms: 400, tp: 2, run: function () { HS.addMemory('dr', 'fact', 'Form submitted for the 10:00 appointment'); phone.addMessage({ from: 'them', node: C.CompletionReceipt({ title: 'Form submitted', lines: ['Review → Submitted → Confirmation saved', 'Copy saved to your documents (demo)', 'Appointment still at 10:00 tomorrow'], note: 'Example record. No form was actually submitted.' }) }); } }
      ] };
      runner = new HE.Runner(def, scenarioHooks(function () { return tp; }, function (t) { tp = t; }, 'Submitting your form', ['Review', 'Submitted', 'Confirmation saved'], ctx, { quick: function () { return [{ label: 'Review form', send: false, onClick: function () { openEditor(formCard); } }]; }, hideApproval: true }));
      return runner;
    }

    /* --- scenario 3: customer service --- */
    function pkg() {
      var ctx = {}, tp, choice;
      var def = { steps: [
        { id: 'ask', ms: 300, run: async function () { phone.addMessage({ from: 'me', text: 'My package still hasn\'t arrived.' }); thread.header('Support · Linen & Co.', 'Chat'); await phone.reply({ text: 'I found the order. I\'ll check the delivery status and prepare the next step.' }, 1000); HS.log('support', 'Started: package not arrived'); } },
        { id: 'located', ms: 800, tp: 0, run: function () { tp.set(0, 'doing', 'Order A-58214 · Linen throw · shipped 6 days ago'); } },
        { id: 'issue', ms: 800, tp: 1, run: function () { tp.set(1, 'doing', 'Carrier shows a failed delivery attempt: flat number missing from the address.'); } },
        { id: 'contact', ms: 800, tp: 2, fail: true, run: async function () { thread.sys('Support chat opened (demo)'); thread.add('r', 'Hello, order A-58214 has not arrived. Could you check the delivery address?', 'HUMAN on your behalf (demo)'); tp.set(2, 'doing', 'Contacting Linen & Co. support...'); await wait(700); if (!ctx.retried) { /* handled by fail flag */ } else { thread.add('l', 'Thanks for flagging. We see the address issue.', 'Support · simulated'); tp.set(2, 'doing', 'Support replied (simulated).'); } } },
        { id: 'offer', ms: 800, tp: 3, run: async function () { await wait(500); thread.add('l', 'Sorry about that. We can redeliver by Tuesday or refund £39.00.', 'Support · simulated'); tp.set(3, 'doing', 'Two options offered: redelivery by Tuesday, or a £39.00 refund.'); } },
        { id: 'approval', ms: 300, tp: 4, run: function () { tp.set(4, 'doing', 'Waiting for your choice. HUMAN will not decide this for you.'); }, approval: { custom: true } },
        { id: 'resolved', ms: 600, tp: 5, run: function () {
            var redeliver = ctx.choice === 'redeliver';
            thread.add('r', redeliver ? 'Please redeliver to Flat 4, 12 Mercer Street by Tuesday.' : 'Please refund £39.00 to the original payment method.', 'HUMAN on your behalf (demo)'); thread.add('l', redeliver ? 'Done. Redelivery booked for Tuesday.' : 'Done. Refund of £39.00 issued.', 'Support · simulated');
            HS.log('support', redeliver ? 'Redelivery requested for Tuesday (demo)' : 'Refund requested: £39.00 (demo)');
            phone.addMessage({ from: 'them', node: C.CompletionReceipt({ title: redeliver ? 'Redelivery booked' : 'Refund requested', lines: ['Order A-58214 located', 'Address problem identified', redeliver ? 'New delivery: Tuesday (demo)' : 'Refund: £39.00 (demo)'], note: 'Simulated outcome. No real support contact was made.' }) });
          } }
      ] };
      runner = new HE.Runner(def, scenarioHooks(function () { return tp; }, function (t) { tp = t; }, 'Sorting out your package', ['Order located', 'Delivery issue identified', 'Support contacted', 'Refund or redelivery offered', 'Your approval requested', 'Resolution confirmed'], ctx, { custom: function (st, i, r) {
        var card = el('div', { class: 'card ap' }, [el('div', { class: 'card-k', text: 'Needs your approval' }), el('b', { class: 'card-t', text: 'How should this be resolved?' }), el('p', { class: 'card-p', text: 'Support offered two options. Your choice only, then I will tell them.' })]);
        var row = el('div', { class: 'card-btns' }); card.appendChild(row);
        [['Redeliver by Tuesday', 'redeliver', true], ['Refund £39.00', 'refund', false]].forEach(function (o) { row.appendChild(el('button', { type: 'button', class: 'pill' + (o[2] ? ' pri' : ''), text: o[0], on: { click: function () { ctx.choice = o[1]; row.remove(); card.classList.add('ok'); card.appendChild(el('div', { class: 'card-status', text: 'You chose: ' + o[0] })); phone.addMessage({ from: 'me', text: o[0] }); r.approve(); } } })); });
        row.appendChild(el('button', { type: 'button', class: 'pill', text: 'Cancel', on: { click: function () { row.remove(); card.classList.add('no'); card.appendChild(el('div', { class: 'card-status', text: 'Cancelled. Nothing was changed.' })); r.reject(); } } }));
        phone.addMessage({ from: 'them', node: card });
      } }));
      return runner;
    }

    /* shared hooks: progress card + approvals + failure/retry + controls */
    function scenarioHooks(getTP, setTP, title, labels, ctx, opt) {
      return {
        onState: function (r) {
          bPause.textContent = r.state === 'paused' ? 'Resume' : 'Pause'; bPause.disabled = r.state === 'idle' || r.state === 'done' || r.state === 'rejected' || r.state === 'waiting';
          bSkip.disabled = r.state !== 'running';
          stateLine.textContent = { idle: '', running: 'HUMAN is working…', paused: 'Paused', waiting: 'Waiting for your approval', failed: 'Something went wrong. Retry below.', done: 'Finished. These are demo records, nothing real was sent.', rejected: 'Stopped. Nothing was done.' }[r.state] || '';
        },
        onStepStart: function (st, i) {
          if (st.tp === 0 && !getTP()) { var tp = mkTP(title, labels); setTP(tp); phone.addMessage({ from: 'them', node: tp }); }
          var tp2 = getTP(); if (tp2 && st.tp != null) tp2.set(st.tp, 'doing');
        },
        onStepDone: function (st) { var tp = getTP(); if (tp && st.tp != null) { tp.set(st.tp, 'done'); if (st.tp === labels.length - 1) tp.finish('Complete'); } },
        onApproval: function (st, i, r) {
          if (st.approval.custom) { opt.custom(st, i, r); return; }
          if (!st.approval.hidden) { var card = C.Approval(Object.assign({}, st.approval, { onApprove: function () { r.approve(); }, onReject: function () { r.reject(); } })); phone.addMessage({ from: 'them', node: card }); ctx.card = card; }
          if (opt.quick) phone.quick(opt.quick());
        },
        onApproved: function () { phone.quick([]); if (ctx.card) { /* already resolved by its own button */ } },
        onReject: function (st) { phone.quick([]); phone.addMessage({ from: 'them', text: 'No problem. I did not do anything. Say the word if you change your mind.' }); var tp = getTP(); if (tp) { tp.classList.add('no'); tp.finish('Stopped'); } HS.log('message', 'You declined. Nothing was sent'); },
        onFail: function (st, i, r) {
          var tp = getTP(); if (tp) tp.set(st.tp, 'failed', 'Support chat timed out. Nothing was lost.');
          var card = C.Approval({ kicker: 'Something went wrong', title: 'Support did not answer in time', body: 'Want me to try again?', approveLabel: 'Retry', rejectLabel: 'Stop', approvedText: 'Retrying…', onApprove: function () { ctx.retried = true; r.retry(); }, onReject: function () { r.reject(); } });
          phone.addMessage({ from: 'them', node: card });
        }
      };
    }

    function select(id, restart) {
      if (!restart && cur === id) return;
      if (runner) runner.reset(true);
      cur = id; HE.$$('button', tabs).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.id === id)); });
      HS.get().log = HS.get().log.filter(function (l) { return ['message', 'form', 'support', 'calendar'].indexOf(l.kind) < 0; }); HS.emit('log');
      HS.get().calendar = HS.get().calendar.filter(function (e) { return e.source !== 'HUMAN'; }); HS.emit('calendar');
      phone.clear(); thread.clear(); phone.addMessage({ from: 'sys', text: 'Today' });
      var r = id === 'dinner' ? dinner() : id === 'dentist' ? dentist() : pkg();
      bPause.textContent = 'Pause'; setTimeout(function () { if (runner === r && cur === id) r.start(); }, 250);
    }
    var started = false;
    HE.onVisible(layout, function () { if (!started) { started = true; select('dinner'); } });
    return { select: select };
  };
})(window);
