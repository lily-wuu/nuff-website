/* NUFF 2026 — shared script. No dependencies, no scroll listeners. */

/* ================================================================
   EVENTBRITE LINKS — paste each link between the quotes.
   While a link is empty the button reads "Tickets TBD".
   ================================================================ */
var TICKET_LINKS = {
  'fri-evening':   'https://www.eventbrite.com/e/2004157718687?aff=oddtdtcreator',  // Friday: Shorts Program 1
  'sat-afternoon': 'https://www.eventbrite.com/e/2004157718687?aff=oddtdtcreator',  // Saturday: Shorts Program 2
  'sat-evening':   'https://www.eventbrite.com/e/2004157718687?aff=oddtdtcreator'   // Saturday: Shorts Program 3 + Panel & Closing Ceremony
};

(function () {
  'use strict';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ticket buttons ---------- */
  document.querySelectorAll('[data-ticket]').forEach(function (btn) {
    var url = TICKET_LINKS[btn.getAttribute('data-ticket')];
    if (url) {
      btn.setAttribute('href', url);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener');
      btn.removeAttribute('aria-disabled');
      btn.textContent = 'Get Tickets';
      var note = btn.parentNode.querySelector('.ticket-note');
      if (note) note.textContent = 'via Eventbrite';
    }
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var menuPanel = document.getElementById('menu-panel');
  if (menuBtn && menuPanel) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuPanel.hidden = !open;
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    menuPanel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  /* ---------- Day tabs (schedule) ---------- */
  var tabs = [].slice.call(document.querySelectorAll('.day-tab'));
  if (tabs.length) {
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          if (on) panel.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
        }
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    var start = tabs[0];
    var hash = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (hash) {
      var p = hash.closest('.day-panel');
      tabs.forEach(function (t) { if (p && t.getAttribute('aria-controls') === p.id) start = t; });
    }
    select(start);
    if (hash) setTimeout(function () { hash.scrollIntoView({ block: 'start' }); }, 50);
  }

  /* ---------- Map (loads on request) ---------- */
  document.querySelectorAll('.map-slot').forEach(function (slot) {
    var btn = slot.querySelector('.map-load button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = slot.getAttribute('data-src');
      f.title = slot.getAttribute('data-title') || 'Map';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      slot.innerHTML = '';
      slot.appendChild(f);
    });
  });

  /* ---------- Cascade reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }
  root.classList.add('reveal-ready');
})();
