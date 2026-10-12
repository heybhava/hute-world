/* HUMAN product page: deterministic demo data + shared demo state.
   Everything here is FICTIONAL demonstration data. Nothing is sent, booked, bought or shared outside this page. */
(function (g) {
  'use strict';
  var HD = {};

  /* ---------- people (used across every scene so the story stays consistent) ---------- */
  HD.me = { id: 'me', name: 'Alex' };
  HD.people = {
    maya:   { id: 'maya',   name: 'Maya',   role: 'Close friend',            bg: ['#FFE3D1', '#FFC9A8'], skin: '#EDBE98', hair: '#2f2420', style: 'bob',   shirt: '#FF8A5C', glasses: false },
    sophia: { id: 'sophia', name: 'Sophia', role: 'Friend · met at film night', bg: ['#FFD9E8', '#FFC2D6'], skin: '#E8B58F', hair: '#3a2a22', style: 'long',  shirt: '#7B5CFF', glasses: false },
    jordan: { id: 'jordan', name: 'Jordan', role: 'Neighbour',               bg: ['#D9ECFF', '#BEDDFF'], skin: '#C98E69', hair: '#1f1a17', style: 'short', shirt: '#2D6BFF', glasses: false },
    priya:  { id: 'priya',  name: 'Priya',  role: 'Robotics engineer',       bg: ['#E9E2FF', '#D6CAFF'], skin: '#C58A66', hair: '#1c1614', style: 'long',  shirt: '#5E17EB', glasses: true },
    theo:   { id: 'theo',   name: 'Theo',   role: 'Bookshop owner',          bg: ['#D5F5E3', '#B8EBCF'], skin: '#F0C7A5', hair: '#8a5a32', style: 'curly', shirt: '#1FAA59', glasses: true },
    elena:  { id: 'elena',  name: 'Elena',  role: 'Photographer',            bg: ['#FFF1B8', '#FFE680'], skin: '#E3AE86', hair: '#5a2e1c', style: 'bun',   shirt: '#E8A100', glasses: false },
    marcus: { id: 'marcus', name: 'Marcus', role: 'Tennis coach',            bg: ['#FFE0C2', '#FFC999'], skin: '#9C6642', hair: '#15110f', style: 'short', shirt: '#FF6A00', glasses: false },
    noor:   { id: 'noor',   name: 'Noor',   role: 'Psychology student',      bg: ['#FFDDE6', '#FFC4D4'], skin: '#D9A07A', hair: '#241915', style: 'bob',   shirt: '#FF2E93', glasses: false },
    kai:    { id: 'kai',    name: 'Kai',    role: 'Hardware founder',        bg: ['#D9ECFF', '#B9D9FF'], skin: '#EBC09C', hair: '#2b2118', style: 'curly', shirt: '#00A8C6', glasses: false },
    lena:   { id: 'lena',   name: 'Lena',   role: 'Ceramics teacher',        bg: ['#E9E2FF', '#CFC2FF'], skin: '#F2CBAA', hair: '#b07a3b', style: 'bun',   shirt: '#B2007A', glasses: false },
    sam:    { id: 'sam',    name: 'Sam',    role: 'Startup operator',        bg: ['#D5F5E3', '#A9E8C6'], skin: '#D6A27E', hair: '#2a211c', style: 'short', shirt: '#2D6BFF', glasses: true },
    dr:     { id: 'dr',     name: 'Dr. Lee', role: 'Dentist',                bg: ['#E8F4FF', '#CFE6FF'], skin: '#E7BB96', hair: '#3b3029', style: 'short', shirt: '#9bb7d6', glasses: true }
  };

  /* ---------- discovery profiles (people-search scene) ---------- */
  HD.profiles = [
    { id: 'sophia', interests: ['psychology', 'film photography', 'matcha', 'late-night conversations'], does: 'Coffee and long conversations', avail: ['tonight', 'now'], availText: 'Free tonight after 6', dist: 0.8, area: 'Soho', format: 'coffee', decision: 'accept', pin: [34, 40], activity: 'coffee', paid: null, twin: true,
      tags: ['psychology', 'coffee', 'tonight', 'conversation', 'conversations', 'late-night', 'matcha', 'film', 'photography', 'friend', 'nearby'] },
    { id: 'noor', interests: ['psychology', 'books', 'journaling'], does: 'Reading together at a café', avail: ['tonight', 'weekend'], availText: 'Free tonight and Sunday', dist: 1.9, area: 'Fitzrovia', format: 'coffee', decision: 'later', pin: [58, 28], activity: 'coffee', paid: null, twin: true,
      tags: ['psychology', 'books', 'reading', 'coffee', 'tonight', 'friend', 'long conversations', 'conversations', 'nearby'] },
    { id: 'jordan', interests: ['tennis', 'running', 'podcasts'], does: 'Doubles or a casual rally', avail: ['weekend'], availText: 'Free Saturday morning', dist: 1.4, area: 'Hackney', format: 'sport', decision: 'accept', pin: [66, 62], activity: 'sport', paid: { label: 'Court booking', amount: 14 }, twin: false,
      tags: ['tennis', 'sport', 'play', 'weekend', 'running', 'nearby'] },
    { id: 'marcus', interests: ['tennis', 'football', 'coaching'], does: 'Tennis rally, all levels', avail: ['weekend', 'weekdays'], availText: 'Free Saturday and Tuesday evenings', dist: 2.6, area: 'Islington', format: 'sport', decision: 'decline', pin: [74, 22], activity: 'sport', paid: { label: 'Court booking', amount: 14 }, twin: true,
      tags: ['tennis', 'sport', 'play', 'weekend', 'football', 'coach'] },
    { id: 'priya', interests: ['robotics', 'startups', 'machine learning', 'cofounder'], does: 'Looking for a technical co-founder match', avail: ['weekdays', 'tonight'], availText: 'Free weekday evenings', dist: 2.1, area: 'Shoreditch', format: 'coffee', decision: 'accept', pin: [80, 48], activity: 'coffee', paid: null, twin: true,
      tags: ['cofounder', 'co-founder', 'founder', 'robotics', 'startups', 'startup', 'machine learning', 'tech', 'build', 'weekdays', 'tonight'] },
    { id: 'kai', interests: ['robotics', 'hardware', 'startups'], does: 'Co-founder chat over coffee', avail: ['weekdays'], availText: 'Free Wednesday afternoon', dist: 3.4, area: 'King\'s Cross', format: 'video', decision: 'later', pin: [46, 14], activity: 'coffee', paid: null, twin: true,
      tags: ['cofounder', 'co-founder', 'founder', 'robotics', 'hardware', 'startups', 'startup', 'weekdays', 'tech', 'build'] },
    { id: 'theo', interests: ['books', 'tea', 'long conversations', 'poetry'], does: 'Bookshop browsing, then tea', avail: ['weekend', 'tonight'], availText: 'Free Saturday and tonight', dist: 1.1, area: 'Bloomsbury', format: 'walk', decision: 'accept', pin: [26, 62], activity: 'walk', paid: null, twin: true,
      tags: ['books', 'book', 'reading', 'tea', 'conversations', 'long conversations', 'friend', 'weekend', 'tonight', 'bookshop', 'poetry', 'nearby'] },
    { id: 'elena', interests: ['street photography', 'city walks', 'architecture'], does: 'Exploring neighbourhoods on foot', avail: ['weekend'], availText: 'Free Sunday', dist: 3.0, area: 'Camden', format: 'walk', decision: 'accept', pin: [18, 24], activity: 'walk', paid: null, twin: true,
      tags: ['explore', 'city', 'walk', 'walks', 'photography', 'architecture', 'weekend', 'friend', 'wander'] },
    { id: 'lena', interests: ['ceramics', 'art', 'slow weekends'], does: 'Pottery workshop for two', avail: ['weekend'], availText: 'Free Saturday afternoon', dist: 2.2, area: 'Peckham', format: 'class', decision: 'accept', pin: [52, 80], activity: 'class', paid: { label: 'Pottery workshop', amount: 38 }, twin: false,
      tags: ['ceramics', 'pottery', 'art', 'class', 'weekend', 'explore', 'city', 'friend'] },
    { id: 'sam', interests: ['startups', 'coffee', 'product design'], does: 'Quick coffee right now', avail: ['now', 'tonight', 'weekdays'], availText: 'Free right now', dist: 0.5, area: 'Soho', format: 'coffee', decision: 'accept', pin: [40, 54], activity: 'coffee', paid: null, twin: true,
      tags: ['coffee', 'startups', 'startup', 'now', 'tonight', 'product', 'design', 'nearby', 'weekdays', 'cofounder'] }
  ];

  HD.synonyms = {
    cafe: 'coffee', café: 'coffee', espresso: 'coffee', latte: 'coffee', matcha: 'coffee',
    evening: 'tonight', night: 'tonight', today: 'tonight',
    saturday: 'weekend', sunday: 'weekend', weekends: 'weekend',
    founder: 'cofounder', 'co-founder': 'cofounder', cofounders: 'cofounder',
    reading: 'books', book: 'books', readers: 'books',
    walking: 'walk', wander: 'walk', explore: 'walk', exploring: 'walk',
    friends: 'friend', talk: 'conversations', conversation: 'conversations', chat: 'conversations',
    play: 'tennis'
  };
  HD.stop = { a: 1, an: 1, the: 1, to: 1, with: 1, who: 1, i: 1, id: 1, love: 1, loves: 1, someone: 1, people: 1, person: 1, find: 1, for: 1, and: 1, this: 1, of: 1, my: 1, me: 1, in: 1, on: 1, at: 1, near: 1, get: 1, that: 1, is: 1, are: 1, would: 1, like: 1, a: 1 };

  /* ---------- meeting intelligence ---------- */
  HD.meeting = {
    id: 'm-sophia-coffee', title: 'Coffee with Sophia', time: '3:00 PM', length: '45 minutes', place: 'Café Lune, Soho',
    brief: {
      who: 'Sophia Marlowe: film photographer and psychology graduate. You met at Ana\'s film night in March.',
      last: 'Last spoke 12 days ago. She was deciding whether to take a three-month photography residency in Lisbon.',
      interests: ['Film photography', 'Psychology of habits', 'Matcha (oat milk)'],
      promises: ['You offered to send her "Four Thousand Weeks".', 'You said you would introduce her to Priya.'],
      points: ['Ask how she decided about the Lisbon residency.', 'Share the book recommendation you promised.', 'Suggest a day to shoot film around Soho together.']
    },
    transcript: [
      { t: '00:04', who: 'Sophia', text: 'Okay, I finally decided. I am taking the Lisbon residency in September, for three months.' },
      { t: '00:19', who: 'You', text: 'That is huge. What tipped it for you?' },
      { t: '00:31', who: 'Sophia', text: 'The studio has a darkroom and they offered me a small solo show at the end. I could not say no.' },
      { t: '00:52', who: 'You', text: 'You should do it. I promised to send you that book about time, Four Thousand Weeks. I will email it tonight.' },
      { t: '01:10', who: 'Sophia', text: 'Please do. And you said you knew someone in robotics? I want to photograph how lab spaces feel.' },
      { t: '01:29', who: 'You', text: 'Priya. I will introduce you two this week.' },
      { t: '01:44', who: 'Sophia', text: 'Perfect. Also, I am leaving on September 3rd, so I would love to see you again before then.' },
      { t: '02:02', who: 'You', text: 'Let us do Thursday the 21st. I can bring film and we can walk around Soho.' },
      { t: '02:20', who: 'Sophia', text: 'Yes. Morning light is best. Maybe 9 AM? I will bring the 35mm camera.' },
      { t: '02:41', who: 'You', text: 'Done. I will also look for a place that sells film nearby.' },
      { t: '03:03', who: 'Sophia', text: 'One open question: should I rent my flat while I am away? I am torn.' },
      { t: '03:25', who: 'You', text: 'Worth asking Maya, she did that last year. I can ask her for you.' }
    ],
    people: ['Sophia', 'Priya', 'Maya'],
    analysis: {
      summary: 'Sophia decided to take a three-month photography residency in Lisbon starting in September, with a solo show at the end. You agreed to send her a book, introduce her to Priya, and plan a morning film walk before she leaves.',
      takeaways: ['Sophia is taking the Lisbon residency (September 3rd departure).', 'The studio has a darkroom and offers a small solo show.', 'She wants to photograph robotics lab spaces.'],
      decisions: ['Sophia accepted the Lisbon residency.', 'Film walk in Soho on Thursday the 21st at 9 AM.'],
      promises: ['Email Sophia "Four Thousand Weeks" tonight.', 'Introduce Sophia to Priya this week.', 'Ask Maya about renting out a flat.'],
      actions: [
        { id: 'a1', text: 'Email the book recommendation to Sophia', owner: 'You', due: 'Tonight' },
        { id: 'a2', text: 'Introduce Sophia to Priya', owner: 'You', due: 'This week' },
        { id: 'a3', text: 'Ask Maya about renting out a flat', owner: 'You', due: 'This week' },
        { id: 'a4', text: 'Find a place that sells 35mm film', owner: 'You', due: 'Before Thursday' },
        { id: 'a5', text: 'Confirm the film walk with Sophia', owner: 'You', due: 'Thursday 9 AM' }
      ],
      followups: ['Send Sophia the book and a note about the film walk.', 'Draft an introduction between Sophia and Priya.', 'Propose Thursday the 21st, 9 AM for the next meeting.'],
      next: 'Film walk in Soho, Thursday the 21st at 9:00 AM',
      open: ['Should Sophia rent out her flat while she is away?']
    },
    templates: ['Personal catch-up', 'Coffee meeting', 'Interview', 'Brainstorm', 'General meeting', 'Custom'],
    history: [
      { id: 'h1', person: 'Sophia', title: 'Film night, introductions', date: 'March 14', text: 'First met at Ana\'s film night. Talked about 35mm photography, her work in a darkroom, and the psychology of habits. She likes oat milk matcha.' },
      { id: 'h2', person: 'Sophia', title: 'Video call: residency options', date: 'Two weeks ago', text: 'Sophia was weighing a photography residency in Lisbon against staying in London for a gallery job. She asked for book recommendations about time and choices.' },
      { id: 'h3', person: 'Priya', title: 'Coffee: robotics and startups', date: 'February 8', text: 'Priya described her lab\'s warehouse robots. She would like to meet more artists who photograph technology. Mentioned she is hiring a designer.' },
      { id: 'h4', person: 'Maya', title: 'Dinner: moving flats', date: 'Last month', text: 'Maya rented out her flat for six months last year while travelling. She recommended a trusted agency and a standard contract. Plans birthday trip in June.' },
      { id: 'h5', person: 'Maya', title: 'Walk in the park', date: 'Two months ago', text: 'Talked about her new job, tennis on weekends, and her sister\'s wedding. She promised to share the playlist from the road trip.' },
      { id: 'h6', person: 'Jordan', title: 'Neighbours catch-up', date: 'Three weeks ago', text: 'Jordan is organising a tennis morning in the park. Needs one more player. Also asked about the Wi-Fi password for the shared hallway.' }
    ]
  };

  /* ---------- memory (relationships scene + shared across scenes) ---------- */
  HD.memorySeed = {
    sophia: { last: 'Last met 12 days ago', next: 'Send the book, then plan the film walk', items: [
      { id: 's1', kind: 'fact', text: 'Loves film photography and matcha (oat milk)', priv: false },
      { id: 's2', kind: 'promise', text: 'Promised to send her "Four Thousand Weeks"', priv: false },
      { id: 's3', kind: 'date', text: 'Birthday: October 9th', priv: false },
      { id: 's4', kind: 'fact', text: 'Taking a photography residency in Lisbon in September', priv: false }] },
    maya: { last: 'Messaged 2 days ago', next: 'Confirm dinner on Friday', items: [
      { id: 'm1', kind: 'fact', text: 'Allergic to shellfish. Loves Italian food', priv: false },
      { id: 'm2', kind: 'date', text: 'Birthday trip to Lisbon in June', priv: false },
      { id: 'm3', kind: 'promise', text: 'Promised to send her the road trip playlist', priv: false },
      { id: 'm4', kind: 'fact', text: 'Rented out her flat last year (has an agency recommendation)', priv: false }] },
    jordan: { last: 'Last chatted 3 weeks ago', next: 'Say yes to the tennis morning', items: [
      { id: 'j1', kind: 'fact', text: 'Organising a Saturday tennis morning in the park', priv: false },
      { id: 'j2', kind: 'pref', text: 'Prefers texts to calls', priv: false },
      { id: 'j3', kind: 'date', text: 'Moved in next door: February', priv: false }] },
    priya: { last: 'Last coffee in February', next: 'Introduce her to Sophia', items: [
      { id: 'p1', kind: 'fact', text: 'Works on warehouse robotics', priv: false },
      { id: 'p2', kind: 'fact', text: 'Hiring a designer at her lab', priv: false },
      { id: 'p3', kind: 'promise', text: 'You said you would introduce her to Sophia', priv: false }] },
    theo: { last: 'Met at the bookshop in April', next: 'Recommend him a poetry book', items: [
      { id: 't1', kind: 'fact', text: 'Owns the bookshop on Lamb\'s Conduit Street', priv: false },
      { id: 't2', kind: 'pref', text: 'Drinks Assam tea, no sugar', priv: false },
      { id: 't3', kind: 'fact', text: 'Recommended "The Sellout" to you', priv: false }] },
    elena: { last: 'Last seen at the exhibition', next: 'Share the event invitation', items: [
      { id: 'e1', kind: 'fact', text: 'Photographs neighbourhoods at dawn', priv: false },
      { id: 'e2', kind: 'date', text: 'Exhibition opens November 2nd', priv: false }] },
    marcus: { last: 'Last played in summer', next: 'Arrange a reunion game', items: [
      { id: 'k1', kind: 'fact', text: 'Plays left-handed. Coaches juniors on Tuesdays', priv: false },
      { id: 'k2', kind: 'pref', text: 'Hates early mornings', priv: false }] },
    noor: { last: 'Reconnected 6 months ago', next: 'Reconnect over coffee', items: [
      { id: 'n1', kind: 'fact', text: 'Studying psychology, writing a dissertation on habit formation', priv: false },
      { id: 'n2', kind: 'promise', text: 'You promised to lend her your notes on behaviour change', priv: false }] }
  };

  /* ---------- places & calendar ---------- */
  HD.places = [
    { id: 'lune', name: 'Café Lune', area: 'Soho', pin: [38, 44], kind: 'coffee', hours: 'Open until 8 PM' },
    { id: 'bloom', name: 'Bloomsbury Tea Rooms', area: 'Bloomsbury', pin: [28, 60], kind: 'coffee', hours: 'Open until 6 PM' },
    { id: 'court', name: 'Victoria Park Courts', area: 'Hackney', pin: [68, 60], kind: 'sport', hours: 'Courts 7 AM to 9 PM' },
    { id: 'studio', name: 'Clay & Kiln Studio', area: 'Peckham', pin: [54, 78], kind: 'class', hours: 'Workshops 10 AM to 5 PM' },
    { id: 'book', name: 'Lamb\'s Conduit Books', area: 'Bloomsbury', pin: [30, 56], kind: 'walk', hours: 'Open until 7 PM' }
  ];
  HD.calendarSeed = [
    { id: 'c1', day: 'Today', time: '9:30 AM', title: 'Team stand-up', source: 'Calendar' },
    { id: 'c2', day: 'Today', time: '3:00 PM', title: 'Coffee with Sophia', source: 'Calendar' },
    { id: 'c3', day: 'Tomorrow', time: '10:00 AM', title: 'Dentist: Dr. Lee', source: 'Calendar' },
    { id: 'c4', day: 'Friday', time: '6:00 PM', title: 'Gym', source: 'Calendar' },
    { id: 'c5', day: 'Saturday', time: '8:30 AM', title: 'Free morning', source: 'Calendar' }
  ];

  /* ---------- text helpers ---------- */
  HD.tokens = function (q) {
    return (q || '').toLowerCase().replace(/[^a-z0-9\s'\-é]/g, ' ').split(/\s+/).filter(Boolean)
      .map(function (w) { return HD.synonyms[w] || w; }).filter(function (w) { return !HD.stop[w] && w.length > 1; });
  };
  HD.searchProfiles = function (q) {
    var toks = HD.tokens(q);
    if (!toks.length) return [];
    var out = [];
    HD.profiles.forEach(function (p) {
      var score = 0, why = [];
      toks.forEach(function (t) {
        var hit = false;
        if (p.tags.indexOf(t) > -1) { score += 3; hit = true; }
        p.interests.forEach(function (i) { if (i.toLowerCase().indexOf(t) > -1) { score += 2; hit = true; } });
        if (p.avail.indexOf(t) > -1) { score += 2; hit = true; }
        if (p.format === t || p.activity === t) { score += 1; hit = true; }
        if (t === 'nearby' && p.dist <= 1.5) { score += 2; hit = true; }
        if (hit && why.indexOf(t) < 0) why.push(t);
      });
      if (score > 0) out.push({ p: p, score: score, why: why });
    });
    out.sort(function (a, b) { return b.score - a.score || a.p.dist - b.p.dist; });
    return out;
  };

  /* ---------- shared demo state (one source of truth for every scene) ---------- */
  var KEY = 'human-product-demo-v1';
  var listeners = {};
  var S = {};
  function fresh() {
    return {
      calendar: HD.calendarSeed.map(function (c) { return Object.assign({}, c); }),
      memory: JSON.parse(JSON.stringify(HD.memorySeed)),
      log: [],
      tasks: [],
      drafts: [],
      connections: {},          // profileId -> { stage, decision, introText, meetup }
      meetups: [],
      notes: { draft: '', saved: '', template: 'Personal catch-up', analysis: null },
      twin: { shareInterests: true, shareCalendar: true, allowSchedule: true, allowMessages: true, requireApproval: true, contact: 'friends', paused: false },
      request: null,            // cross-channel request (Everywhere scene)
      prefs: { reduceMotionOverride: false }
    };
  }
  function load() {
    var base = fresh();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        // only lightweight preferences persist: notes draft and twin privacy settings
        if (saved.notes) { base.notes.draft = saved.notes.draft || ''; base.notes.saved = saved.notes.saved || ''; base.notes.template = saved.notes.template || base.notes.template; }
        if (saved.twin) base.twin = Object.assign(base.twin, saved.twin);
      }
    } catch (e) {}
    return base;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify({ notes: { draft: S.notes.draft, saved: S.notes.saved, template: S.notes.template }, twin: S.twin })); } catch (e) {}
  }
  S = load();
  var HS = {
    get: function () { return S; },
    on: function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    emit: function (evt, data) { (listeners[evt] || []).forEach(function (f) { try { f(data); } catch (e) { console.error(e); } }); (listeners['*'] || []).forEach(function (f) { try { f(evt, data); } catch (e) {} }); },
    save: persist,
    reset: function () { S = fresh(); try { localStorage.removeItem(KEY); } catch (e) {} HS.emit('reset'); HS.emit('change'); },
    log: function (kind, text, evidence) {
      var d = new Date(); var t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      S.log.push({ t: t, kind: kind, text: text, evidence: evidence || '' }); HS.emit('log'); HS.emit('change');
    },
    addEvent: function (ev) { ev.id = ev.id || ('ev' + Date.now() + Math.floor(Math.random() * 99)); S.calendar.push(ev); HS.emit('calendar'); HS.emit('change'); return ev; },
    removeEvent: function (id) { S.calendar = S.calendar.filter(function (e) { return e.id !== id; }); HS.emit('calendar'); HS.emit('change'); },
    addMemory: function (pid, kind, text) {
      S.memory[pid] = S.memory[pid] || { last: 'Just now', next: '', items: [] };
      var it = { id: 'mem' + Date.now() + Math.floor(Math.random() * 99), kind: kind, text: text, priv: false };
      S.memory[pid].items.push(it); HS.emit('memory', pid); HS.emit('change'); return it;
    },
    addTask: function (t) { t.id = 't' + Date.now() + Math.floor(Math.random() * 99); t.status = t.status || 'open'; S.tasks.push(t); HS.emit('tasks'); HS.emit('change'); return t; },
    addDraft: function (d) { d.id = 'd' + Date.now() + Math.floor(Math.random() * 99); d.status = d.status || 'needs approval'; S.drafts.push(d); HS.emit('drafts'); HS.emit('change'); return d; }
  };
  g.HD = HD; g.HS = HS;
})(window);
