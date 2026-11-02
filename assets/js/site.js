/* NUFF 2026 — shared script. No dependencies, no scroll listeners. */

/* ================================================================
   EVENTBRITE LINKS — paste each link between the quotes.
   While a link is empty the button reads "Tickets TBD".
   ================================================================ */
var TICKET_LINKS = {
  'fri-evening':   'https://www.eventbrite.com/e/2004157718687?aff=oddtdtcreator',  // Friday: Kickoff + Mixed Block 1
  'sat-afternoon': 'https://www.eventbrite.com/e/2004157718687?aff=oddtdtcreator',  // Saturday: Lunch + Film Student Mixer + Doc / Animation Block
  'sat-evening':   'https://www.eventbrite.com/e/2004157718687?aff=oddtdtcreator'   // Saturday: Mixed Block 2 + Panel & Closing Ceremony
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

  /* ---------- Cascade reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
  }
  root.classList.add('reveal-ready');

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var panel = document.getElementById('menu-panel');
  if (menuBtn && panel) {
    var open = function () {
      panel.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
      var first = panel.querySelector('a');
      if (first) first.focus();
      document.addEventListener('keydown', onKey);
      document.addEventListener('click', onOutside, true);
    };
    var close = function (returnFocus) {
      panel.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onOutside, true);
      if (returnFocus) menuBtn.focus();
    };
    var onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key === 'Tab') {
        var f = [menuBtn].concat([].slice.call(panel.querySelectorAll('a')));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    var onOutside = function (e) {
      if (!panel.contains(e.target) && !menuBtn.contains(e.target)) close(false);
    };
    menuBtn.addEventListener('click', function () {
      if (panel.hidden) open(); else close(true);
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) close(false);
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (m) { if (m.matches) close(false); });
  }

  /* ---------- Schedule day tabs (shareable via #fri / #sat) ---------- */
  var tabs = [].slice.call(document.querySelectorAll('.day-tab'));
  if (tabs.length) {
    var select = function (tab, focus, push) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      if (push && history.replaceState) history.replaceState(null, '', '#' + tab.getAttribute('data-day'));
      // Panels that were hidden never intersected; reveal their contents now
      document.querySelectorAll('#' + tab.getAttribute('aria-controls') + ' .reveal').forEach(function (el) { el.classList.add('in'); });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false, true); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true, true); }
      });
    });
    var fromHash = function () {
      var h = (location.hash || '').replace('#', '');
      var match = tabs.filter(function (t) { return t.getAttribute('data-day') === h; })[0];
      select(match || tabs[0], false, false);
      if (match) {
        var head = document.querySelector('.day-tabs');
        if (head) head.scrollIntoView({ block: 'start' });
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- Deferred map: loads on request or when near the viewport ---------- */
  var slot = document.querySelector('.map-slot');
  if (slot) {
    var loaded = false;
    var load = function () {
      if (loaded) return; loaded = true;
      var f = document.createElement('iframe');
      f.src = slot.getAttribute('data-src');
      f.title = slot.getAttribute('data-title') || 'Map';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      slot.appendChild(f);
      var ph = slot.querySelector('.map-load'); if (ph) ph.remove();
    };
    var b = slot.querySelector('button'); if (b) b.addEventListener('click', load);
    if ('IntersectionObserver' in window) {
      var mo = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { load(); mo.disconnect(); }
      }, { rootMargin: '200px 0px' });
      mo.observe(slot);
    }
  }

  /* ---------- Film filters (shareable via #block-1 etc.) ---------- */
  var filters = [].slice.call(document.querySelectorAll('.filter'));
  if (filters.length) {
    var groups = [].slice.call(document.querySelectorAll('.block-group'));
    var apply = function (key, push) {
      filters.forEach(function (f) { f.setAttribute('aria-pressed', f.getAttribute('data-filter') === key ? 'true' : 'false'); });
      groups.forEach(function (g) {
        var show = key === 'all' || g.id === key;
        g.hidden = !show;
        if (show) g.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      });
      if (push && history.replaceState) history.replaceState(null, '', key === 'all' ? location.pathname : '#' + key);
    };
    filters.forEach(function (f) { f.addEventListener('click', function () { apply(f.getAttribute('data-filter'), true); }); });
    var h = (location.hash || '').replace('#', '');
    if (groups.some(function (g) { return g.id === h; })) apply(h, false);
  }
})();
