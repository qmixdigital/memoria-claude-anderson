/* Viaje no Detalhe — chrome (sticky after 300px + drawer + dark toggle + ext links) */
(function () {
  'use strict';

  var html = document.documentElement;

  /* Dark toggle */
  var toggle = document.querySelector('.vd-chrome__theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', current);
      try { localStorage.setItem('vd-theme', current); } catch (e) {}
    });
  }

  /* Sticky chrome after 300px scroll */
  var chrome = document.getElementById('vd-chrome');
  if (chrome) {
    var threshold = 300;
    var ticking = false;
    function onScroll() {
      if (window.scrollY > threshold) chrome.classList.add('vd-chrome--sticky');
      else chrome.classList.remove('vd-chrome--sticky');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }

  /* Drawer (burger menu) */
  var burger = document.querySelector('.vd-chrome__burger');
  var drawer = document.querySelector('.vd-drawer');
  var closeBtn = document.querySelector('.vd-drawer__close');
  function setDrawer(state /* 'open' | 'closed' */) {
    if (!drawer) return;
    var isOpen = state === 'open';
    drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (isOpen) drawer.removeAttribute('inert');
    else drawer.setAttribute('inert', '');
    if (burger) burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  if (burger && drawer) {
    setDrawer('closed');
    burger.addEventListener('click', function () {
      setDrawer(drawer.getAttribute('aria-hidden') === 'false' ? 'closed' : 'open');
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer('closed'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer('closed'); });
    document.addEventListener('click', function (e) {
      if (drawer.getAttribute('aria-hidden') === 'false' &&
          !drawer.contains(e.target) && !burger.contains(e.target)) {
        setDrawer('closed');
      }
    });
  }

  /* External links */
  var host = window.location.host;
  document.querySelectorAll('main a[href^="http"]').forEach(function (a) {
    try {
      var u = new URL(a.href);
      if (u.host !== host) {
        a.target = '_blank';
        var rel = (a.rel || '').split(' ').filter(Boolean);
        if (rel.indexOf('noopener') === -1) rel.push('noopener');
        if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
        a.rel = rel.join(' ');
      }
    } catch (_) {}
  });
})();
