/* Scene 3: "You say it. It's done." Six execution workspaces driven by one runner. */
(function (g) {
  'use strict';
  var PS = g.PS = g.PS || {};
  var el = HE.el, C = HE.Cards, wait = HE.wait, money = HE.money;

  function table(headers, rows, cls) {
    var t = el('table', { class: 'tbl' }), th = el('tr'); headers.forEach(function (h) { th.appendChild(el('th', { text: h })); }); t.appendChild(el('thead', {}, [th]));
    var tb = el('tbody'); rows.forEach(function (r) { var tr = el('tr', { class: r.cls || '' }); r.cells.forEach(function (c) { tr.appendChild(el('td', typeof c === 'string' ? { text: c } : { html: c.html })); }); tb.appendChild(tr); });
    t.appendChild(tb); return { el: t, rows: [].slice.call(tb.children) };
  }

  PS.tasks = function (root) {
    var grid = el('div', { class: 'tasks-grid' }), host = el('div', { 'aria-live': 'polite' });
    root.appendChild(grid); root.appendChild(host);
    var runner = null, openId = null;

    /* ---------- task definitions ---------- */
    var defs = [];

    // A. Book my appointment
    defs.push({ id: 'cut', cls: 't1', tag: 'Booking', say: 'Book me a haircut Saturday afternoon.', title: 'Book my appointment',
      steps: function (ui, ctx) { return [
        { label: 'Understanding the request', ms: 700, run: function () { ui.set(el('div', { class: 'tg' }, [el('span', { text: 'Service: Haircut' }), el('span', { text: 'When: Saturday afternoon' }), el('span', { text: 'Budget: your usual' })])); } },
        { label: 'Checking preferences', ms: 800, run: function () { ui.add(el('div', { class: 'card' }, [el('div', { class: 'card-k', text: 'What I know about you' }), el('ul', { class: 'mb-l' }, [el('li', { text: 'Saturday between 2 and 5 PM' }), el('li', { text: 'Usually spends £25 to £35' }), el('li', { text: 'Likes to walk less than 1.5 km' })])])); } },
        { label: 'Searching availability', ms: 900, run: function () { ctx.opts = [{ n: 'Salon Oak', t: 'Sat 2:00 PM', p: 28, r: 4.8, d: 0.6 }, { n: 'Studio Nine', t: 'Sat 3:30 PM', p: 32, r: 4.9, d: 1.2 }, { n: 'Barber Row', t: 'Sat 1:00 PM', p: 22, r: 4.5, d: 0.9, out: true }];
            ctx.tbl = table(['Place', 'Time', 'Price', 'Rating', 'Distance'], ctx.opts.map(function (o) { return { cls: o.out ? 'out' : '', cells: [o.n + (o.out ? ' (fully booked)' : ''), o.t, money(o.p), o.r + ' ★', o.d + ' km'] }; })); ui.add(ctx.tbl.el); } },
        { label: 'Comparing options', ms: 900, run: function () { ctx.opts.forEach(function (o, i) { if (o.out) return; o.score = o.r * 10 - o.p * 0.5 - o.d * 2; ctx.tbl.rows[i].lastChild.textContent += '  ·  score ' + o.score.toFixed(1); }); ui.add(el('p', { class: 'demo-note', text: 'Score = rating × 10 − price × 0.5 − distance × 2. Barber Row is excluded: no availability.' })); } },
        { label: 'Selecting a time', ms: 800, run: function () { var best = ctx.opts.filter(function (o) { return !o.out; }).sort(function (a, b) { return b.score - a.score; })[0]; ctx.pick = best; ctx.tbl.rows[ctx.opts.indexOf(best)].classList.add('pick'); } },
        { label: 'Awaiting approval', approval: function () { return { title: 'Book ' + ctx.pick.n + ', ' + ctx.pick.t + ', ' + money(ctx.pick.p) + '?', body: 'I will send the booking request and add it to your calendar. You pay at the salon.', perms: ['Contact salon', 'Add calendar event'], approveLabel: 'Book it', rejectLabel: 'Not now' }; }, ms: 300 },
        { label: 'Booking confirmed (demo)', ms: 500, run: function () { HS.addEvent({ day: 'Saturday', time: '2:00 PM', title: 'Haircut · ' + ctx.pick.n, source: 'HUMAN' }); HS.log('task', 'Booked haircut: ' + ctx.pick.n + ' Saturday 2:00 PM (demo)');
            ui.add(C.Reservation({ place: ctx.pick.n, when: ctx.pick.t, party: 'Haircut · ' + money(ctx.pick.p), status: 'Confirmed (demo)' })); ui.add(C.CalendarEvent({ day: 'Saturday', time: '2:00 PM', title: 'Haircut · ' + ctx.pick.n })); } }
      ]; } });

    // B. Sort out my subscriptions
    defs.push({ id: 'subs', cls: 't2', tag: 'Money', say: 'Find the subscriptions I don\'t use.', title: 'Sort out my subscriptions',
      steps: function (ui, ctx) {
        ctx.subs = [{ id: 's1', n: 'StreamBox', p: 11.99, last: 'last used 94 days ago', un: true }, { id: 's2', n: 'Tunes+', p: 9.99, last: 'used yesterday', un: false }, { id: 's3', n: 'CloudDrive 200 GB', p: 2.99, last: 'last used 7 months ago', un: true }, { id: 's4', n: 'FitPass', p: 14.99, last: 'last used 62 days ago', un: true }, { id: 's5', n: 'Daily News Premium', p: 7.99, last: 'used this week', un: false }];
        ctx.sel = {}; var list, sum;
        function recalc() { var m = 0; ctx.subs.forEach(function (s) { if (ctx.sel[s.id] && !s.cancelled) m += s.p; }); ctx.monthly = m; if (sum) { sum.querySelector('big').textContent = money(m) + ' / month'; sum.querySelector('span').textContent = 'That is ' + money(m * 12) + ' a year'; } }
        return [
          { label: 'Scanning your accounts', ms: 500, run: async function () { list = el('div', { class: 'ws-main', style: 'gap:8px' }); ui.set(list); sum = el('div', { class: 'sum' }, [el('span', { text: 'Nothing selected yet' }), el('big', { text: money(0) + ' / month' })]); for (var i = 0; i < ctx.subs.length; i++) { var s = ctx.subs[i]; var cb = el('input', { type: 'checkbox', 'aria-label': 'Cancel ' + s.n, disabled: 'disabled' }); s.cb = cb; s.row = el('div', { class: 'opt' }, [el('label', {}, [cb, el('span', {}, [el('b', { text: s.n }), el('div', { class: 'meta', style: 'margin:0;text-align:left', text: s.last })])]), el('div', { class: 'meta', text: money(s.p) + ' / mo' })]); list.appendChild(s.row); await wait(280); } list.appendChild(sum); } },
          { label: 'Finding what you don\'t use', ms: 800, run: function () { ctx.subs.forEach(function (s) { if (s.un) { s.row.classList.add('sel'); s.cb.checked = true; ctx.sel[s.id] = true; } s.cb.removeAttribute('disabled'); s.cb.addEventListener('change', function () { ctx.sel[s.id] = s.cb.checked; s.row.classList.toggle('sel', s.cb.checked); recalc(); }); }); recalc(); } },
          { label: 'Your choice', approval: { custom: function (ui2, r) {
              var card = el('div', { class: 'card ap' }, [el('div', { class: 'card-k', text: 'Needs your approval' }), el('b', { class: 'card-t', text: 'Cancel the subscriptions you ticked?' }), el('p', { class: 'card-p', text: 'Tick or untick above. I will only cancel what is selected.' })]);
              var row = el('div', { class: 'card-btns' }), yes = el('button', { type: 'button', class: 'pill pri', text: 'Cancel selected' }), no = el('button', { type: 'button', class: 'pill', text: 'Keep everything' });
              function lbl() { var n = Object.keys(ctx.sel).filter(function (k) { return ctx.sel[k]; }).length; yes.textContent = n ? 'Cancel ' + n + ' selected' : 'Nothing selected'; yes.disabled = !n; }
              lbl(); ctx.subs.forEach(function (s) { s.cb.addEventListener('change', lbl); });
              yes.addEventListener('click', function () { row.remove(); card.classList.add('ok'); card.appendChild(el('div', { class: 'card-status', text: 'Approved (demo)' })); ctx.subs.forEach(function (s) { s.cb.disabled = true; }); r.approve(); });
              no.addEventListener('click', function () { row.remove(); card.classList.add('no'); card.appendChild(el('div', { class: 'card-status', text: 'Nothing was cancelled.' })); r.reject(); });
              row.appendChild(yes); row.appendChild(no); card.appendChild(row); return card; } }, ms: 300 },
          { label: 'Cancelling (demo)', ms: 800, run: async function () { var saved = 0, names = []; for (var i = 0; i < ctx.subs.length; i++) { var s = ctx.subs[i]; if (ctx.sel[s.id]) { s.cancelled = true; saved += s.p; names.push(s.n); s.row.classList.remove('sel'); s.row.querySelector('.meta').textContent = 'Cancelled (demo)'; s.row.style.opacity = .55; await wait(350); } } HS.log('task', 'Cancelled ' + names.length + ' subscriptions, saving ' + money(saved) + '/month (demo)'); ui.add(C.CompletionReceipt({ title: 'Saving ' + money(saved) + ' a month', lines: names.map(function (n) { return n + ' cancelled'; }).concat([money(saved * 12) + ' a year']), note: 'Demo only. No account was changed.' })); } }
        ];
      } });

    // C. Order what I need
    defs.push({ id: 'cart', cls: 't3', tag: 'Shopping', say: 'Order my usual groceries for Sunday.', title: 'Order what I need',
      steps: function (ui, ctx) {
        ctx.items = [{ n: 'Oat milk', q: 2, p: 1.85 }, { n: 'Free-range eggs (12)', q: 1, p: 2.9 }, { n: 'Sourdough loaf', q: 1, p: 3.2 }, { n: 'Bananas', q: 2, p: 1.1 }, { n: 'Greek yoghurt', q: 2, p: 2.4 }, { n: 'Baby spinach', q: 2, p: 1.6, out: true, sub: { n: 'Curly kale (bag)', p: 1.7 } }, { n: 'Pasta', q: 3, p: 1.2 }, { n: 'Chopped tomatoes', q: 4, p: 0.85 }, { n: 'Salmon fillet', q: 1, p: 6.5 }, { n: 'Coffee beans', q: 1, p: 7.8 }];
        ctx.window = 'Sunday 10:00 to 12:00'; ctx.acceptSub = true; var totalEl, cartEl;
        function lines() { return ctx.items.map(function (i) { var useSub = i.out && ctx.acceptSub && i.sub; return { label: i.q + ' × ' + (useSub ? i.sub.n : i.n), amount: i.q * (useSub ? i.sub.p : i.p), skip: i.out && !ctx.acceptSub && !i.sub }; }).filter(function (l) { return !l.skip; }); }
        function sumTotal() { return lines().reduce(function (a, l) { return a + l.amount; }, 0) + 3.5; }
        function repaint() { if (!cartEl) return; cartEl.innerHTML = ''; ctx.items.forEach(function (i) { var useSub = i.out && ctx.acceptSub && i.sub;
            var q = el('span', { class: 'qty' }, [el('button', { type: 'button', 'aria-label': 'Fewer ' + i.n, text: '−', on: { click: function () { i.q = Math.max(0, i.q - 1); repaint(); } } }), el('span', { text: String(i.q), 'aria-live': 'polite' }), el('button', { type: 'button', 'aria-label': 'More ' + i.n, text: '+', on: { click: function () { i.q++; repaint(); } } })]);
            cartEl.appendChild(el('div', { class: 'opt' + (i.out ? ' sel' : '') }, [el('div', {}, [el('b', { text: useSub ? i.sub.n : i.n }), el('div', { class: 'meta', style: 'margin:0;text-align:left', text: i.out ? (i.sub ? (ctx.acceptSub ? 'Substitute for ' + i.n + ' (out of stock)' : i.n + ' out of stock. Skipped') : 'Out of stock') : (i.n.match(/eggs|milk/i) ? 'Matches your preference: organic where possible' : 'Your usual') })]), q, el('div', { class: 'meta', text: money(i.q * (useSub ? i.sub.p : i.p)) })])); });
          if (totalEl) { totalEl.querySelector('big').textContent = money(sumTotal()); totalEl.querySelector('span').textContent = ctx.window + ' · incl. £3.50 delivery'; } }
        return [
          { label: 'Reading your usual order', ms: 700, run: function () { cartEl = el('div', { class: 'ws-main', style: 'gap:8px' }); ui.set(cartEl); totalEl = el('div', { class: 'sum' }, [el('span', { text: '' }), el('big', { text: '' })]); ctx.items.forEach(function (i) { i.out = i.out && false; }); ctx.items[5].out = false; repaint(); ui.add(totalEl); } },
          { label: 'Applying your preferences', ms: 800, run: function () { ui.add(el('p', { class: 'demo-note', text: 'Preferences applied: organic eggs and milk where available · no shellfish · same brands as last time.' })); } },
          { label: 'Checking stock and substitutions', ms: 900, run: function () { ctx.items[5].out = true; repaint(); var lab = el('label', { class: 'opt' }, [el('input', { type: 'checkbox', checked: 'checked', 'aria-label': 'Accept the kale substitution', on: { change: function (e) { ctx.acceptSub = e.target.checked; repaint(); } } }), el('span', { text: 'Baby spinach is out of stock. Replace it with curly kale?' })]); ui.add(lab); } },
          { label: 'Choosing a delivery window', ms: 800, run: function () { var sel = el('select', { 'aria-label': 'Delivery window', on: { change: function (e) { ctx.window = e.target.value; repaint(); } } }, ['Sunday 10:00 to 12:00', 'Sunday 12:00 to 14:00', 'Sunday 16:00 to 18:00'].map(function (t) { return el('option', { value: t, text: t }); })); ui.add(el('label', { class: 'field' }, ['Delivery window', sel])); } },
          { label: 'Estimating the price', ms: 700, run: function () { repaint(); ui.add(el('p', { class: 'demo-note', text: 'You can still change quantities above. The total updates live.' })); } },
          { label: 'Awaiting checkout approval', approval: { custom: function (ui2, r) { var node = C.PaymentReview({ items: lines().map(function (l) { return { label: l.label, amount: l.amount }; }).concat([{ label: 'Delivery', amount: 3.5 }]), onApprove: function () { r.approve(); }, onReject: function () { r.reject(); } }); return node; } }, ms: 300 },
          { label: 'Order placed (demo)', ms: 500, run: function () { HS.log('task', 'Groceries ordered, ' + money(sumTotal()) + ', ' + ctx.window + ' (demo, no payment)'); HS.addEvent({ day: 'Sunday', time: ctx.window.replace('Sunday ', '').split(' ')[0], title: 'Grocery delivery', source: 'HUMAN' }); ui.add(C.CompletionReceipt({ title: 'Groceries are on their way', lines: [lines().length + ' items', ctx.window, 'Total ' + money(sumTotal())], note: 'Demo order. No payment was taken.' })); } }
        ];
      } });

    // D. Plan my weekend
    defs.push({ id: 'wknd', cls: 't4', tag: 'Plans', say: 'Plan something fun with my friends.', title: 'Plan my weekend',
      steps: function (ui, ctx) {
        ctx.friends = [{ id: 'maya', sat: true, sun: false }, { id: 'jordan', sat: true, sun: true }, { id: 'theo', sat: false, sun: true }];
        ctx.pre = function () { var box = el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'Your friends\' availability (edit me)' })])]); var g = el('div', { class: 'avail' }, [el('span'), el('b', { text: 'Sat' }), el('b', { text: 'Sun' })]);
          ctx.friends.forEach(function (f) { g.appendChild(el('span', { style: 'display:flex;gap:8px;align-items:center' }, [HE.avatar(f.id), el('b', { text: HD.people[f.id].name })])); ['sat', 'sun'].forEach(function (d) { var cb = el('input', { type: 'checkbox', 'aria-label': HD.people[f.id].name + ' free ' + d, on: { change: function (e) { f[d] = e.target.checked; } } }); cb.checked = f[d]; g.appendChild(el('label', {}, [cb])); }); });
          box.appendChild(g); return box; };
        return [
          { label: 'Thinking up plans', ms: 800, run: function () { ui.set(el('div', { class: 'ideas' }, [el('span', { class: 'chip', text: 'Saturday: brunch + park walk' }), el('span', { class: 'chip', text: 'Saturday: pottery workshop (£38)' }), el('span', { class: 'chip', text: 'Sunday: easy hike + pub lunch' })])); } },
          { label: 'Inviting your friends', ms: 800, run: function () { var l = el('div', { class: 'card' }, [el('div', { class: 'card-k', text: 'Invitations prepared (demo, not sent)' })]); ctx.friends.forEach(function (f) { l.appendChild(el('div', { class: 'fld', style: 'display:flex;justify-content:space-between;padding:6px 0' }, [el('span', { text: HD.people[f.id].name }), HE.status('Invited', 'warn')])); }); ctx.inv = l; ui.add(l); } },
          { label: 'Collecting replies', ms: 600, run: async function () { var rows = ctx.inv.querySelectorAll('.fld'); for (var i = 0; i < ctx.friends.length; i++) { var f = ctx.friends[i]; await wait(600); var txt = f.sat && f.sun ? 'Free both days' : f.sat ? 'Can do Saturday' : f.sun ? 'Can do Sunday' : 'Can\'t this weekend'; rows[i].lastChild.replaceWith(HE.status(txt, f.sat || f.sun ? 'ok' : 'no')); } } },
          { label: 'Matching availability', ms: 900, run: function () { var sat = ctx.friends.filter(function (f) { return f.sat; }).length, sun = ctx.friends.filter(function (f) { return f.sun; }).length; ctx.day = sat >= sun ? 'Saturday' : 'Sunday'; ctx.count = Math.max(sat, sun); ctx.going = ctx.friends.filter(function (f) { return f[ctx.day === 'Saturday' ? 'sat' : 'sun']; });
              ui.add(el('div', { class: 'card' }, [el('b', { class: 'card-t', text: ctx.count ? ctx.day + ' works best (' + ctx.count + ' of 3 friends)' : 'No day works for anyone' }), el('p', { class: 'card-p', text: ctx.count ? 'Saturday: ' + sat + ' free · Sunday: ' + sun + ' free' : 'Edit the availability grid and run again.' })])); } },
          { label: 'Choosing venues', ms: 800, run: function () { ctx.plan = ctx.day === 'Saturday' ? { title: 'Brunch at Café Lune, then a walk in Victoria Park', time: '11:00 AM', day: 'Saturday' } : { title: 'Easy hike and pub lunch at Hampstead Heath', time: '11:00 AM', day: 'Sunday' }; ui.add(C.Location({ place: ctx.plan.title, sub: ctx.plan.day + ' · ' + ctx.plan.time + (ctx.count ? ' · ' + ctx.going.map(function (f) { return HD.people[f.id].name; }).join(', ') : '') })); } },
          { label: 'Awaiting your OK', approval: function () { return { title: ctx.count ? 'Send the plan to ' + ctx.going.map(function (f) { return HD.people[f.id].name; }).join(' and ') + '?' : 'Plan it just for you?', body: ctx.plan.title + ', ' + ctx.plan.day + ' ' + ctx.plan.time + '.', perms: ['Message friends', 'Add calendar event'], approveLabel: 'Send invites', rejectLabel: 'Not now' }; }, ms: 300 },
          { label: 'Plan confirmed (demo)', ms: 500, run: function () { HS.addEvent({ day: ctx.plan.day, time: ctx.plan.time, title: ctx.plan.title, source: 'HUMAN' }); ctx.going.forEach(function (f) { HS.addMemory(f.id, 'fact', 'Planned: ' + ctx.plan.title + ' (' + ctx.plan.day + ')'); }); HS.log('task', 'Weekend plan created: ' + ctx.plan.title + ' (demo, invites not sent)');
              ui.add(C.CompletionReceipt({ title: 'Your weekend is planned', lines: [ctx.plan.title, ctx.plan.day + ' ' + ctx.plan.time, (ctx.going.length ? ctx.going.length : 0) + ' friend(s) said yes (simulated)'], note: 'Simulated replies. No invitations were sent.' })); } }
        ];
      } });

    // E. Complete a form
    defs.push({ id: 'form', cls: 't5', tag: 'Forms', say: 'Sign me up for the gym.', title: 'Complete a form',
      steps: function (ui, ctx) {
        ctx.fields = [{ k: 'Full name', v: 'Alex Rivera' }, { k: 'Email', v: 'alex.rivera@example.com' }, { k: 'Home address', v: 'Flat 4, 12 Mercer Street, London' }, { k: 'Mobile', v: '07700 900123' }, { k: 'Emergency contact', v: 'Maya Chen, 07700 900456' }, { k: 'Plan', v: 'Off-peak monthly' }];
        var inputs = [];
        return [
          { label: 'Opening the form', ms: 700, run: function () { var f = el('form', { class: 'grid2' }); inputs = []; ctx.fields.forEach(function (fd) { var inp = el('input', { 'aria-label': fd.k }); inputs.push(inp); f.appendChild(el('label', { class: 'field' }, [fd.k, inp])); }); f.addEventListener('submit', function (e) { e.preventDefault(); }); ctx.form = f; ui.set(f); ui.add(el('p', { class: 'demo-note', text: 'Example form. Nothing is submitted anywhere.' })); } },
          { label: 'Filling in your details', ms: 400, run: async function () { for (var i = 0; i < ctx.fields.length; i++) { inputs[i].classList.add('hl'); inputs[i].style.borderColor = '#5E17EB'; var v = ctx.fields[i].v; for (var k = 0; k < v.length; k += 2) { inputs[i].value = v.slice(0, k + 2); await wait(24); } inputs[i].value = v; inputs[i].style.borderColor = ''; } } },
          { label: 'Double-checking', ms: 900, run: function () { inputs[3].value = '+44 7700 900123'; ui.add(el('div', { class: 'card' }, [el('b', { class: 'card-t', text: 'One fix made' }), el('p', { class: 'card-p', text: 'The form requires an international phone number, so I changed 07700 900123 to +44 7700 900123.' })])); } },
          { label: 'Your review', approval: { title: 'Submit the gym sign-up?', body: 'You can edit any field above before approving.', perms: ['Submit form (demo)'], approveLabel: 'Approve and submit', rejectLabel: 'Not now' }, ms: 300 },
          { label: 'Submitted (demo)', ms: 500, run: function () { inputs.forEach(function (i) { i.disabled = true; }); HS.log('form', 'Gym sign-up submitted (demo)'); ui.add(C.CompletionReceipt({ title: 'Gym sign-up submitted', lines: ['6 fields completed', 'Confirmation saved to your documents (demo)'], note: 'Example record. Nothing was submitted.' })); } }
        ];
      } });

    // F. Find a better deal
    defs.push({ id: 'deal', cls: 't6', tag: 'Deals', say: 'Find me a better deal on running shoes.', title: 'Find a better deal',
      steps: function (ui, ctx) {
        ctx.opts = [{ n: 'StrideShop', p: 84, d: 2, r: 4.7 }, { n: 'Marathon Direct', p: 79, d: 5, r: 4.2 }, { n: 'Pace & Co.', p: 92, d: 1, r: 4.9 }, { n: 'BargainBarn', p: 75, d: 7, r: 3.9 }];
        ctx.w = { price: 6, speed: 4, rel: 6 }; var tbl, ranking;
        function norm(v, lo, hi, inv) { return hi === lo ? 1 : inv ? (hi - v) / (hi - lo) : (v - lo) / (hi - lo); }
        function score() { var P = ctx.opts.map(function (o) { return o.p; }), D = ctx.opts.map(function (o) { return o.d; }), R = ctx.opts.map(function (o) { return o.r; }); var tw = ctx.w.price + ctx.w.speed + ctx.w.rel || 1;
          ctx.opts.forEach(function (o) { o.s = (ctx.w.price * norm(o.p, Math.min.apply(0, P), Math.max.apply(0, P), true) + ctx.w.speed * norm(o.d, Math.min.apply(0, D), Math.max.apply(0, D), true) + ctx.w.rel * norm(o.r, Math.min.apply(0, R), Math.max.apply(0, R), false)) / tw * 100; });
          ctx.top = ctx.opts.slice().sort(function (a, b) { return b.s - a.s; })[0]; }
        function paint() { if (!ranking) return; score(); ranking.innerHTML = ''; ctx.opts.slice().sort(function (a, b) { return b.s - a.s; }).forEach(function (o, i) { ranking.appendChild(el('div', { class: 'opt' + (i === 0 ? ' sel' : '') }, [el('div', { style: 'flex:1' }, [el('b', { text: (i === 0 ? '★ ' : '') + o.n }), el('div', { class: 'bar', style: 'margin-top:6px' }, [el('i', { style: 'width:' + o.s.toFixed(0) + '%' })])]), el('div', { class: 'meta', html: money(o.p) + '<br>' + o.d + ' day delivery · ' + o.r + ' ★' }), el('b', { text: o.s.toFixed(0) })])); }); }
        function slider(key, label) { var out = el('b', { text: String(ctx.w[key]) }), inp = el('input', { type: 'range', min: '0', max: '10', value: String(ctx.w[key]), 'aria-label': label + ' importance', on: { input: function (e) { ctx.w[key] = +e.target.value; out.textContent = e.target.value; paint(); } } }); return el('label', { class: 'rng' }, [el('span', {}, [label + ': ', out]), inp]); }
        return [
          { label: 'Finding options', ms: 800, run: async function () { ui.set(el('div', { class: 'tg' }, ctx.opts.map(function (o) { return el('span', { text: o.n }); }))); } },
          { label: 'Comparing on your criteria', ms: 600, run: function () { ranking = el('div', { class: 'ws-main', style: 'gap:8px' }); var s = el('div', { class: 'glass' }, [el('h4', {}, [el('span', { text: 'What matters to you (drag)' })]), el('div', { class: 'grid2' }, [slider('price', 'Low price'), slider('speed', 'Fast delivery'), slider('rel', 'Reliability')])]); ui.add(s); ui.add(ranking); paint(); } },
          { label: 'Picking the best match', ms: 900, run: function () { paint(); ui.add(el('p', { class: 'demo-note', text: 'Ranking is transparent: each criterion is scaled 0 to 1, multiplied by your slider, and averaged.' })); } },
          { label: 'Awaiting approval', approval: function () { score(); return { title: 'Add ' + ctx.top.n + ' to your cart?', body: money(ctx.top.p) + ' · ' + ctx.top.d + ' day delivery · ' + ctx.top.r + ' stars. You can still change the sliders first.', perms: ['Add to cart (demo)'], approveLabel: 'Add to cart', rejectLabel: 'Not now' }; }, ms: 300 },
          { label: 'Done (demo)', ms: 400, run: function () { score(); HS.log('task', 'Chose ' + ctx.top.n + ' for ' + money(ctx.top.p) + ' (demo)'); ui.add(C.CompletionReceipt({ title: ctx.top.n + ' is in your cart', lines: [money(ctx.top.p), ctx.top.d + ' day delivery', 'Chosen with: price ' + ctx.w.price + ', speed ' + ctx.w.speed + ', reliability ' + ctx.w.rel], note: 'Demo cart. Nothing was purchased.' })); } }
        ];
      } });

    /* ---------- cards ---------- */
    defs.forEach(function (d) {
      var b = el('button', { type: 'button', class: 'task ' + d.cls + ' rv', 'aria-expanded': 'false', 'aria-controls': 'ws-' + d.id }, [
        el('div', {}, [el('span', { class: 'tag', text: d.tag }), el('div', { class: 'q', text: '"' + d.say + '"' })]),
        el('span', { class: 'pill pri go', text: 'Open the workspace →' })]);
      b.addEventListener('click', function () { open(d.id, true); });
      d.btn = b; grid.appendChild(b);
    });

    /* ---------- workspace ---------- */
    function open(id, scroll) {
      var d = defs.filter(function (x) { return x.id === id; })[0]; if (!d) return;
      if (runner) runner.reset(true);
      defs.forEach(function (x) { x.btn.setAttribute('aria-expanded', String(x.id === id)); });
      openId = id; host.innerHTML = '';
      var ws = el('section', { class: 'workspace', id: 'ws-' + id, 'aria-label': d.title });
      var ctx = {}, main = el('div', { class: 'ws-main' }), stepsBox = el('div', { class: 'ws-steps', role: 'list' });
      var ui = { set: function (n) { main.innerHTML = ''; main.appendChild(n); }, add: function (n) { main.appendChild(n); } };
      var defsSteps = d.steps(ui, ctx), stepEls = defsSteps.map(function (s) { var n = el('div', { class: 'wstep', role: 'listitem' }, [el('i'), el('span', { text: s.label })]); stepsBox.appendChild(n); return n; });
      var status = el('p', { class: 'demo-note', 'aria-live': 'polite' });
      var pre = ctx.pre ? ctx.pre() : null;
      var bRun = el('button', { type: 'button', class: 'pill pri', text: 'Run demo' }), bPause = el('button', { type: 'button', class: 'pill', text: 'Pause' }), bSkip = el('button', { type: 'button', class: 'pill', text: 'Skip step' }), bReset = el('button', { type: 'button', class: 'pill', text: 'Restart' }), bClose = el('button', { type: 'button', class: 'pill', text: 'Close' });
      bPause.disabled = bSkip.disabled = true;
      ws.appendChild(el('div', { class: 'ws-h' }, [el('div', {}, [el('h3', { text: d.title }), el('div', { class: 'you', text: 'You said: "' + d.say + '"' })]), el('div', { class: 'ws-ctl' }, [bRun, bPause, bSkip, bReset, bClose])]));
      var left = el('div'); left.appendChild(stepsBox); if (pre) { pre.style.marginTop = '14px'; left.appendChild(pre); }
      ws.appendChild(el('div', { class: 'ws-body' }, [left, el('div', {}, [main, status])]));
      main.appendChild(el('div', { class: 'empty', text: 'Press "Run demo" to watch HUMAN do it. You stay in control: HUMAN asks before anything with consequences.' }));
      host.appendChild(ws);

      var r = new HE.Runner({ steps: defsSteps.map(function (s) { return s; }) }, {
        onState: function (rr) { bRun.textContent = rr.state === 'idle' ? 'Run demo' : 'Run again'; bPause.disabled = !(rr.state === 'running' || rr.state === 'paused'); bSkip.disabled = rr.state !== 'running'; bPause.textContent = rr.state === 'paused' ? 'Resume' : 'Pause';
          status.textContent = { running: 'HUMAN is working…', paused: 'Paused', waiting: 'Waiting for your approval', done: 'Finished. These are demo records, nothing real was sent or bought.', rejected: 'Stopped. Nothing was done.' }[rr.state] || ''; },
        onStepStart: function (st, i) { stepEls[i].className = 'wstep doing'; },
        onStepDone: function (st, i) { stepEls[i].className = 'wstep done'; },
        onApproval: function (st, i, rr) {
          stepEls[i].className = 'wstep wait';
          var a = typeof st.approval === 'function' ? st.approval() : st.approval, node;
          if (a.custom) node = a.custom(ui, rr);
          else node = C.Approval(Object.assign({}, a, { onApprove: function () { rr.approve(); }, onReject: function () { rr.reject(); } }));
          ui.add(node); node.scrollIntoView && node.scrollIntoView({ block: 'nearest', behavior: HE.reduced ? 'auto' : 'smooth' });
        },
        onApproved: function (st, i) { stepEls[i].className = 'wstep done'; },
        onReject: function (st, i) { stepEls[i].className = 'wstep failed'; for (var k = i + 1; k < stepEls.length; k++) stepEls[k].className = 'wstep skip'; }
      });
      // give runner access to approval helpers via ctx
      r.ctx = ctx;
      defsSteps.forEach(function (s) { var orig = s.run; if (orig) s.run = function () { return orig.apply(null, arguments); }; });
      bRun.addEventListener('click', function () { main.innerHTML = ''; stepEls.forEach(function (n) { n.className = 'wstep'; }); r.ctx = ctx; r.start(); });
      bPause.addEventListener('click', function () { if (r.state === 'paused') r.resume(); else r.pause(); });
      bSkip.addEventListener('click', function () { r.advance(); });
      bReset.addEventListener('click', function () { HS.get().calendar = HS.get().calendar.filter(function (e) { return e.source !== 'HUMAN'; }); HS.emit('calendar'); open(id, false); });
      bClose.addEventListener('click', function () { r.reset(true); host.innerHTML = ''; defs.forEach(function (x) { x.btn.setAttribute('aria-expanded', 'false'); }); openId = null; d.btn.focus(); });
      runner = r;
      // runner.run signature: (ctx, st, i, runner). Our step.run functions ignore ctx and use their closure.
      if (scroll) ws.scrollIntoView({ behavior: HE.reduced ? 'auto' : 'smooth', block: 'start' });
    }
    return { open: open };
  };
})(window);
