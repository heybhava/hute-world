/* HUMAN product page: bootstraps every scene, nav, reveal, reset. */
(function () {
  'use strict';
  var nav = document.querySelector('.nav'), bg = nav.querySelector('.burger');
  bg.addEventListener('click', function () { var o = nav.classList.toggle('open'); bg.setAttribute('aria-expanded', o); });
  nav.querySelectorAll('.drop a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) nav.classList.remove('open'); });

  var map = [['sc-hero', 'hero'], ['sc-comms', 'comms'], ['sc-tasks', 'tasks'], ['sc-meetings', 'meetings'], ['sc-people', 'people'], ['sc-rel', 'relationships'], ['sc-twin', 'twin'], ['sc-day', 'day'], ['sc-every', 'everywhere']];
  var inst = {};
  function build() {
    map.forEach(function (m) {
      var root = document.getElementById(m[0]); if (!root) return;
      root.innerHTML = '';
      if (typeof PS[m[1]] !== 'function') { console.warn('scene missing: ' + m[1]); return; }
      try { inst[m[1]] = PS[m[1]](root); } catch (e) { console.error('scene failed: ' + m[1], e); root.appendChild(HE.el('p', { class: 'demo-note', text: 'This demo could not load.' })); }
    });
    HE.reveal(document);
  }
  build();
  document.getElementById('reset-demo').addEventListener('click', function () {
    HS.reset(); build();
    var b = document.getElementById('reset-demo'); b.textContent = '✓ Demos reset'; setTimeout(function () { b.textContent = '↺ Reset demos'; }, 1600);
  });
  window.__inst = inst;
})();
