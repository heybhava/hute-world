/* HUMAN product page: demo engine + reusable iMessage-inspired phone + attachment cards.
   Vanilla JS, no dependencies. All data comes from product-data.js (HD / HS). */
(function (g) {
  'use strict';
  var HE = {};
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  HE.reduced = RM;

  /* ---------- tiny DOM helpers ---------- */
  function el(tag, a, kids) {
    var n = document.createElement(tag); a = a || {};
    Object.keys(a).forEach(function (k) {
      var v = a[k];
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k === 'html') n.innerHTML = v;
      else if (k === 'on') Object.keys(v).forEach(function (e) { n.addEventListener(e, v[e]); });
      else if (k === 'style') n.style.cssText = v; else if (v !== false && v != null) n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c == null) return; n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  HE.el = el;
  HE.$ = function (s, r) { return (r || document).querySelector(s); };
  HE.$$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  HE.ms = function (n) { return RM ? Math.min(n, 120) : n; };
  HE.wait = function (n) { return new Promise(function (r) { setTimeout(r, HE.ms(n)); }); };
  HE.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  HE.money = function (n) { return '£' + n.toFixed(2); };

  /* ---------- illustrated portraits (flat vector, not photos) ---------- */
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = Math.max(0, Math.min(255, (n >> 16) + amt)), gg = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }
  HE.portrait = function (p) {
    var id = 'pg' + Math.random().toString(36).slice(2, 8), c = p.shirt || '#5E17EB';
    return '<svg viewBox="0 0 120 150" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + HE.esc(p.name) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c + '"/><stop offset="1" stop-color="' + shade(c, -70) + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="120" height="150" fill="url(#' + id + ')"/><rect width="120" height="150" fill="url(#' + id + 'r)"/>' +
      '<text x="60" y="92" text-anchor="middle" font-family="EB Garamond, Georgia, serif" font-style="italic" font-size="78" fill="#fff" fill-opacity=".95">' + HE.esc(p.name.charAt(0)) + '</text></svg>';
  };
  HE.avatar = function (pid, cls) {
    var p = HD.people[pid]; return el('span', { class: 'av ' + (cls || ''), html: HE.portrait(p), 'aria-hidden': 'true' });
  };
  HE.humanAvatar = function () { return el('span', { class: 'av av-human', html: '<span>H</span>', 'aria-hidden': 'true' }); };

  /* ---------- accessible sheet / modal ---------- */
  HE.sheet = function (title, body, opt) {
    opt = opt || {};
    var host = opt.host || document.body, prev = document.activeElement;
    var back = el('div', { class: 'sheet-back' + (opt.inPhone ? ' in-phone' : '') });
    var box = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, tabindex: '-1' });
    var close = el('button', { class: 'sheet-x', type: 'button', 'aria-label': 'Close' , text: '×' });
    box.appendChild(el('div', { class: 'sheet-h' }, [el('b', { text: title }), close]));
    box.appendChild(body); back.appendChild(box); host.appendChild(back);
    function done() { back.classList.remove('in'); setTimeout(function () { if (back.parentNode) back.parentNode.removeChild(back); }, 220); document.removeEventListener('keydown', key); if (prev && prev.focus) prev.focus(); if (opt.onClose) opt.onClose(); }
    function key(e) {
      if (e.key === 'Escape') { done(); return; }
      if (e.key === 'Tab') {
        var f = HE.$$('button,input,select,textarea,a[href],[tabindex="0"]', box).filter(function (x) { return !x.disabled; });
        if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    close.addEventListener('click', done); back.addEventListener('click', function (e) { if (e.target === back) done(); });
    document.addEventListener('keydown', key);
    requestAnimationFrame(function () { back.classList.add('in'); (HE.$('input,textarea,button:not(.sheet-x)', box) || box).focus(); });
    return { close: done, box: box };
  };

  /* ---------- scenario runner (state machine) ---------- */
  function Runner(def, hooks) {
    this.def = def; this.h = hooks || {}; this.state = 'idle'; this.i = -1; this._tok = 0; this._paused = false; this._gateRes = null;
    this._approval = null; this._skip = null; this._retry = null; this.failedOnce = {}; this.ctx = {}; this.decisions = {};
  }
  Runner.prototype._set = function (s) { this.state = s; if (this.h.onState) this.h.onState(this); };
  Runner.prototype.start = function () { this.reset(true); this._set('running'); return this._loop(this._tok, 0); };
  Runner.prototype._gate = function () { var me = this; if (!me._paused) return Promise.resolve(); return new Promise(function (r) { me._gateRes = r; }); };
  Runner.prototype._pace = function (ms) { var me = this; return new Promise(function (res) { var t = setTimeout(function () { me._skip = null; res(); }, HE.ms(ms)); me._skip = function () { clearTimeout(t); me._skip = null; res(); }; }); };
  Runner.prototype._loop = async function (tok, from) {
    var steps = this.def.steps;
    for (var i = from; i < steps.length; i++) {
      if (tok !== this._tok) return;
      this.i = i; var st = steps[i];
      await this._gate(); if (tok !== this._tok) return;
      if (this.h.onStepStart) this.h.onStepStart(st, i, this);
      if (st.run) { try { await st.run(this.ctx, st, i, this); } catch (e) { console.error(e); } }
      if (tok !== this._tok) return;
      if (st.fail && !this.failedOnce[st.id]) {
        this.failedOnce[st.id] = 1; this._set('failed'); if (this.h.onFail) this.h.onFail(st, i, this);
        await new Promise(function (res) { this._retry = res; }.bind(this)); if (tok !== this._tok) return;
        this._set('running'); i--; continue;
      }
      if (st.approval) {
        this._set('waiting');
        var dec = await new Promise(function (res) { this._approval = res; if (this.h.onApproval) this.h.onApproval(st, i, this); }.bind(this));
        if (tok !== this._tok) return; this._approval = null; this.decisions[st.id] = dec;
        if (dec === 'reject') { this._set('rejected'); if (this.h.onReject) this.h.onReject(st, i, this); return; }
        this._set('running'); if (this.h.onApproved) this.h.onApproved(st, i, this);
      }
      await this._pace(st.ms || 700); if (tok !== this._tok) return;
      if (this.h.onStepDone) this.h.onStepDone(st, i, this);
    }
    this._set('done'); if (this.h.onDone) this.h.onDone(this);
  };
  Runner.prototype.pause = function () { if (this.state !== 'running') return; this._paused = true; this._set('paused'); };
  Runner.prototype.resume = function () { if (this.state !== 'paused') return; this._paused = false; this._set('running'); if (this._gateRes) { var r = this._gateRes; this._gateRes = null; r(); } };
  Runner.prototype.advance = function () { if (this._skip) this._skip(); };
  Runner.prototype.approve = function () { if (this._approval) this._approval('approve'); };
  Runner.prototype.reject = function () { if (this._approval) this._approval('reject'); };
  Runner.prototype.retry = function () { if (this._retry) { var r = this._retry; this._retry = null; r(); } };
  Runner.prototype.reset = function (silent) {
    this._tok++; this.i = -1; this.failedOnce = {}; this.ctx = {}; this.decisions = {}; this._paused = false;
    if (this._gateRes) { this._gateRes(); this._gateRes = null; } if (this._approval) { this._approval = null; } if (this._retry) { this._retry = null; }
    if (this._skip) this._skip();
    if (!silent) { this.state = 'idle'; if (this.h.onState) this.h.onState(this); if (this.h.onReset) this.h.onReset(this); } else { this.state = 'idle'; }
  };
  HE.Runner = Runner;

  /* ---------- iMessage-inspired phone ---------- */
  var ICONS = {
    signal: '<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>',
    battery: '<svg viewBox="0 0 26 12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2"/><rect x="24" y="4" width="2" height="4" rx="1"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M12 6l-5 5M12 6l5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  function Phone(root, o) {
    o = o || {}; var me = this;
    me.opt = o; me.onSend = o.onSend || function () {};
    me.root = root; root.classList.add('phone-wrap');
    me.el = el('div', { class: 'phone' + (o.cls ? ' ' + o.cls : ''), 'data-phone': o.id || '' });
    me.screen = el('div', { class: 'ph-screen' });
    me.screen.appendChild(el('div', { class: 'ph-island', 'aria-hidden': 'true' }));
    me.screen.appendChild(el('div', { class: 'ph-status', 'aria-hidden': 'true' }, [el('span', { text: o.time || '9:41' }), el('span', { class: 'ph-ic', html: ICONS.signal + ICONS.battery })]));
    me.head = el('div', { class: 'ph-head' });
    me.setHeader(o.name || 'HUMAN', o.sub || 'Messages', o.avatar);
    me.screen.appendChild(me.head);
    me.scroller = el('div', { class: 'ph-scroll', role: 'log', 'aria-live': 'polite', 'aria-label': (o.name || 'HUMAN') + ' conversation', tabindex: '0' });
    me.screen.appendChild(me.scroller);
    me.quickEl = el('div', { class: 'ph-quick', 'aria-label': 'Quick replies' }); me.screen.appendChild(me.quickEl);
    me.ta = el('textarea', { rows: '1', placeholder: o.placeholder || 'Message', 'aria-label': 'Write a message', maxlength: '400' });
    me.sendBtn = el('button', { type: 'submit', class: 'ph-send', 'aria-label': 'Send message', html: ICONS.send }); me.sendBtn.disabled = true;
    me.form = el('form', { class: 'ph-compose' }, [me.ta, me.sendBtn]);
    me.screen.appendChild(me.form);
    me.screen.appendChild(el('div', { class: 'ph-home', 'aria-hidden': 'true' }));
    me.el.appendChild(el('div', { class: 'ph-frame' }, [me.screen])); root.appendChild(me.el);
    me.ta.addEventListener('input', function () { me.ta.style.height = 'auto'; me.ta.style.height = Math.min(me.ta.scrollHeight, 96) + 'px'; me.sendBtn.disabled = !me.ta.value.trim(); });
    me.ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); me.form.requestSubmit(); } });
    me.form.addEventListener('submit', function (e) {
      e.preventDefault(); var t = me.ta.value.trim(); if (!t) return;
      me.ta.value = ''; me.ta.style.height = 'auto'; me.sendBtn.disabled = true; me.send(t);
    });
    me.lastMe = null; me.typingEl = null;
  }
  Phone.prototype.setHeader = function (name, sub, avatar) {
    var h = this.head; h.innerHTML = '';
    h.appendChild(el('span', { class: 'ph-back', 'aria-hidden': 'true', text: '‹' }));
    h.appendChild(el('div', { class: 'ph-who' }, [avatar || HE.humanAvatar(), el('b', { text: name }), el('small', { text: sub })]));
    h.appendChild(el('span', { class: 'ph-vid', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="14" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 10l5-3v10l-5-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>' }));
  };
  Phone.prototype.send = function (text) { this.addMessage({ from: 'me', text: text }); this.onSend(text); };
  Phone.prototype.scroll = function () { var s = this.scroller; if (HE.reduced) { s.scrollTop = s.scrollHeight; } else { try { s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }); } catch (e) { s.scrollTop = s.scrollHeight; } } };
  Phone.prototype.addMessage = function (m) {
    var me = this;
    if (m.from === 'sys') { var s = el('div', { class: 'msg-sys in', text: m.text }); me.scroller.appendChild(s); me.scroll(); return s; }
    me.clearTyping();
    var row = el('div', { class: 'msg-row ' + (m.from === 'me' ? 'me' : 'them') });
    if (m.node) { row.classList.add('has-card'); row.appendChild(m.node); }
    var bub = null;
    if (m.text) { bub = el('div', { class: 'bubble ' + (m.from === 'me' ? 'out' : 'in'), text: m.text }); row.appendChild(bub); }
    if (m.node && m.text) { row.insertBefore(bub, m.node); }
    me.scroller.appendChild(row);
    requestAnimationFrame(function () { row.classList.add('in'); });
    if (m.from === 'me') {
      if (me.lastMe) { var o = me.lastMe.querySelector('.deliv'); if (o) o.remove(); }
      var d = el('div', { class: 'deliv', text: 'Delivered' }); row.appendChild(d); me.lastMe = row;
      if (!m.noRead) setTimeout(function () { d.textContent = 'Read'; }, HE.ms(1100));
    }
    me.scroll(); return row;
  };
  Phone.prototype.typing = function (on) {
    var me = this;
    if (on) { if (me.typingEl) return; me.typingEl = el('div', { class: 'msg-row them in typing-row' }, [el('div', { class: 'bubble in typing', 'aria-label': 'HUMAN is typing', html: '<i></i><i></i><i></i>' })]); me.scroller.appendChild(me.typingEl); me.scroll(); }
    else me.clearTyping();
  };
  Phone.prototype.clearTyping = function () { if (this.typingEl) { this.typingEl.remove(); this.typingEl = null; } };
  Phone.prototype.reply = async function (m, delay) { this.typing(true); await HE.wait(delay == null ? 900 : delay); this.clearTyping(); return this.addMessage(Object.assign({ from: 'them' }, m)); };
  Phone.prototype.quick = function (list) {
    var me = this; me.quickEl.innerHTML = '';
    (list || []).forEach(function (q) {
      var b = el('button', { type: 'button', class: 'qr', text: q.label, on: { click: function () { me.quickEl.innerHTML = ''; if (q.send !== false) me.addMessage({ from: 'me', text: q.text || q.label }); q.onClick && q.onClick(); } } });
      me.quickEl.appendChild(b);
    });
  };
  Phone.prototype.clear = function () { this.scroller.innerHTML = ''; this.quickEl.innerHTML = ''; this.lastMe = null; this.typingEl = null; };
  HE.Phone = Phone;

  /* ---------- attachment cards (shared design system) ---------- */
  var C = {};
  C.Approval = function (o) {
    var card = el('div', { class: 'card ap', role: 'group', 'aria-label': o.title });
    card.appendChild(el('div', { class: 'card-k', text: o.kicker || 'Needs your approval' }));
    card.appendChild(el('b', { class: 'card-t', text: o.title }));
    if (o.body) card.appendChild(el('p', { class: 'card-p', text: o.body }));
    if (o.perms) card.appendChild(el('div', { class: 'perms' }, o.perms.map(function (p) { return el('span', { text: p }); })));
    var row = el('div', { class: 'card-btns' }), status = el('div', { class: 'card-status', 'aria-live': 'polite' });
    var yes = el('button', { type: 'button', class: 'pill pri', text: o.approveLabel || 'Approve' });
    var no = el('button', { type: 'button', class: 'pill', text: o.rejectLabel || 'Not now' });
    function resolve(kind) {
      row.remove(); card.classList.add(kind === 'approve' ? 'ok' : 'no');
      status.textContent = kind === 'approve' ? (o.approvedText || 'Approved (demo)') : (o.rejectedText || 'Declined. Nothing was done.'); card.appendChild(status);
    }
    yes.addEventListener('click', function () { resolve('approve'); o.onApprove && o.onApprove(); });
    no.addEventListener('click', function () { resolve('reject'); o.onReject && o.onReject(); });
    row.appendChild(yes); row.appendChild(no); card.appendChild(row); card.resolve = resolve; return card;
  };
  C.TaskProgress = function (o) {
    var card = el('div', { class: 'card tp', role: 'group', 'aria-label': o.title });
    card.appendChild(el('div', { class: 'card-k', text: o.kicker || 'In progress' })); var title = el('b', { class: 'card-t', text: o.title }); card.appendChild(title);
    var list = el('ol', { class: 'tp-list' }), items = [];
    o.steps.forEach(function (s, i) {
      var det = el('div', { class: 'tp-det', text: s.detail || '', hidden: 'hidden' });
      var b = el('button', { type: 'button', class: 'tp-b', 'aria-expanded': 'false', on: { click: function () { var open = det.hasAttribute('hidden'); if (open) det.removeAttribute('hidden'); else det.setAttribute('hidden', 'hidden'); b.setAttribute('aria-expanded', String(open)); } } }, [el('i', { class: 'tp-dot' }), el('span', { text: s.label })]);
      var li = el('li', { class: 'todo' }, [b, det]); list.appendChild(li); items.push({ li: li, det: det, s: s });
    });
    card.appendChild(list);
    card.set = function (i, state, detail) { var it = items[i]; if (!it) return; it.li.className = state; if (detail) it.det.textContent = detail; };
    card.finish = function (text) { card.classList.add('complete'); card.firstChild.textContent = text || 'Complete'; };
    card.setTitle = function (t) { title.textContent = t; };
    return card;
  };
  C.CalendarEvent = function (o) {
    var c = el('div', { class: 'card cal' }, [el('div', { class: 'cal-d' }, [el('small', { text: o.day }), el('b', { text: o.time })]), el('div', { class: 'cal-m' }, [el('b', { text: o.title }), el('small', { text: o.status || 'Added to your calendar (demo)' })])]);
    return c;
  };
  C.CompletionReceipt = function (o) {
    var c = el('div', { class: 'card rc' }, [el('div', { class: 'rc-ok', html: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' }), el('b', { class: 'card-t', text: o.title })]);
    var ul = el('ul', { class: 'rc-l' }); (o.lines || []).forEach(function (l) { ul.appendChild(el('li', { text: l })); }); c.appendChild(ul);
    c.appendChild(el('small', { class: 'demo-note', text: o.note || 'Demonstration record. Nothing was sent or purchased.' })); return c;
  };
  C.FormPreview = function (o) {
    var c = el('div', { class: 'card fp' }, [el('div', { class: 'card-k', text: 'PDF · ' + o.title }), el('div', { class: 'fp-sheet' })]);
    var sheet = c.querySelector('.fp-sheet');
    function paint() { sheet.innerHTML = ''; sheet.appendChild(el('b', { text: o.title })); o.fields.forEach(function (f) { sheet.appendChild(el('div', { class: 'fp-row' }, [el('span', { text: f.label }), el('em', { text: f.value || '—' })])); }); }
    paint(); c.repaint = paint;
    var row = el('div', { class: 'card-btns' }); (o.buttons || []).forEach(function (b) { row.appendChild(el('button', { type: 'button', class: 'pill' + (b.pri ? ' pri' : ''), text: b.label, on: { click: function () { b.onClick && b.onClick(c, row); } } })); });
    c.appendChild(row); c.row = row; return c;
  };
  C.MeetingBrief = function (m) {
    var b = m.brief, c = el('div', { class: 'card mb' }, [el('div', { class: 'card-k', text: m.time + ' · ' + m.length }), el('b', { class: 'card-t', text: m.title })]);
    c.appendChild(el('p', { class: 'card-p', text: b.who })); c.appendChild(el('p', { class: 'card-p', text: b.last }));
    var ul = el('ul', { class: 'mb-l' }); b.promises.forEach(function (p) { ul.appendChild(el('li', { text: p })); }); c.appendChild(ul); return c;
  };
  C.PersonIntro = function (o) {
    var c = el('div', { class: 'card pi' }, [el('div', { class: 'pi-av' }, [HE.avatar(o.a), el('i', { class: 'pi-link', 'aria-hidden': 'true' }), HE.avatar(o.b)]), el('b', { class: 'card-t', text: HD.people[o.a].name + ' + ' + HD.people[o.b].name }), el('p', { class: 'card-p', text: o.text })]);
    return c;
  };
  C.Location = function (o) {
    var c = el('div', { class: 'card lc' }, [el('div', { class: 'lc-map', 'aria-hidden': 'true', html: '<svg viewBox="0 0 200 90"><rect width="200" height="90" fill="#EAF6EE"/><path d="M0 60 Q50 40 100 55 T200 40" stroke="#fff" stroke-width="8" fill="none"/><path d="M60 0 L90 90" stroke="#fff" stroke-width="6"/><circle cx="104" cy="46" r="7" fill="#FF4D6D"/><circle cx="104" cy="46" r="2.6" fill="#fff"/></svg>' }),
      el('div', { class: 'lc-t' }, [el('b', { text: o.place }), el('small', { text: o.sub || '' })])]);
    return c;
  };
  C.Reservation = function (o) {
    return el('div', { class: 'card rs' }, [el('div', { class: 'card-k', text: o.status || 'Reservation (demo)' }), el('b', { class: 'card-t', text: o.place }), el('div', { class: 'rs-g' }, [el('span', { text: o.when }), el('span', { text: o.party })])]);
  };
  C.PaymentReview = function (o) {
    var total = o.items.reduce(function (a, b) { return a + b.amount; }, 0);
    var c = el('div', { class: 'card pr', role: 'group', 'aria-label': 'Payment review' }, [el('div', { class: 'card-k', text: 'Review before paying' })]);
    o.items.forEach(function (i) { c.appendChild(el('div', { class: 'pr-r' }, [el('span', { text: i.label }), el('b', { text: HE.money(i.amount) })])); });
    c.appendChild(el('div', { class: 'pr-r tot' }, [el('span', { text: 'Total' }), el('b', { text: HE.money(total) })]));
    c.appendChild(el('small', { class: 'demo-note', text: 'Demo payment sheet. No card is charged.' }));
    var row = el('div', { class: 'card-btns' }), st = el('div', { class: 'card-status' });
    var yes = el('button', { type: 'button', class: 'pill pri', text: 'Approve ' + HE.money(total) }), no = el('button', { type: 'button', class: 'pill', text: 'Cancel' });
    function res(k) { row.remove(); c.classList.add(k === 'approve' ? 'ok' : 'no'); st.textContent = k === 'approve' ? 'Approved (demo): no real charge' : 'Cancelled. Nothing was charged.'; c.appendChild(st); }
    yes.addEventListener('click', function () { res('approve'); o.onApprove && o.onApprove(total); }); no.addEventListener('click', function () { res('reject'); o.onReject && o.onReject(); });
    row.appendChild(yes); row.appendChild(no); c.appendChild(row); c.total = total; return c;
  };
  C.MeetingNotes = function (o) {
    var c = el('div', { class: 'card mn' }, [el('div', { class: 'card-k', text: 'Meeting notes' }), el('b', { class: 'card-t', text: o.title })]);
    var ul = el('ul', { class: 'mb-l' }); o.bullets.forEach(function (b) { ul.appendChild(el('li', { text: b })); }); c.appendChild(ul); return c;
  };
  HE.Cards = C;

  /* ---------- scroll reveal + shared helpers ---------- */
  HE.reveal = function (root) {
    var nodes = HE.$$('.rv', root);
    if (!('IntersectionObserver' in window)) { nodes.forEach(function (n) { n.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    nodes.forEach(function (n) { io.observe(n); });
    setTimeout(function () { nodes.forEach(function (n) { n.classList.add('in'); }); }, 3500);
  };
  HE.onVisible = function (node, fn, off) {
    // geometry based (works even when IntersectionObserver callbacks are throttled)
    var vis = false, queued = false;
    function check() {
      queued = false;
      var r = node.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var v = vh > 0 && r.top < vh * 0.78 && r.bottom > vh * 0.22;
      if (v && !vis) { vis = true; fn(); } else if (!v && vis) { vis = false; if (off) off(); }
    }
    function q() { if (!queued) { queued = true; requestAnimationFrame(check); setTimeout(check, 120); } }
    window.addEventListener('scroll', q, { passive: true }); window.addEventListener('resize', q);
    var n = 0, iv = setInterval(function () { check(); if (++n > 12) clearInterval(iv); }, 500);
    check();
  };
  HE.chip = function (text, onClick, cls) { return el('button', { type: 'button', class: 'chip ' + (cls || ''), text: text, on: { click: onClick } }); };
  HE.status = function (text, cls) { return el('span', { class: 'st ' + (cls || ''), text: text }); };
  g.HE = HE;
})(window);
