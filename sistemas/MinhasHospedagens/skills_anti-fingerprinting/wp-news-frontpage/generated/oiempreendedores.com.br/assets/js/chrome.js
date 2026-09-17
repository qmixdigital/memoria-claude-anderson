/* Header chrome: search modal, theme toggle, megamenu burger, breaking strip tabs. */
(function(){
  'use strict';

  var d = document;

  /* Theme toggle (manual_toggle) */
  var themeBtn = d.getElementById('oie-theme-toggle');
  if (themeBtn) {
    var saved = null;
    try { saved = localStorage.getItem('oie-theme'); } catch (e) {}
    if (saved === 'dark') { d.documentElement.setAttribute('data-theme', 'dark'); }
    themeBtn.addEventListener('click', function(){
      var cur = d.documentElement.getAttribute('data-theme');
      if (cur === 'dark') {
        d.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('oie-theme', 'light'); } catch (e) {}
      } else {
        d.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('oie-theme', 'dark'); } catch (e) {}
      }
    });
  }

  /* Search modal */
  var searchToggle = d.getElementById('oie-search-toggle');
  var searchModal = d.getElementById('oie-search-modal');
  if (searchToggle && searchModal) {
    searchToggle.addEventListener('click', function(){
      var open = searchModal.classList.toggle('is-open');
      searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var inp = searchModal.querySelector('input[type="search"]');
        if (inp) { setTimeout(function(){ inp.focus(); }, 50); }
      }
    });
    searchModal.addEventListener('click', function(e){
      if (e.target === searchModal) {
        searchModal.classList.remove('is-open');
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });
    d.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && searchModal.classList.contains('is-open')) {
        searchModal.classList.remove('is-open');
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Burger megamenu */
  var burger = d.getElementById('oie-burger');
  var mega = d.getElementById('oie-megamenu');
  var megaClose = d.getElementById('oie-megamenu-close');
  if (burger && mega) {
    burger.addEventListener('click', function(){
      var open = mega.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      d.body.style.overflow = open ? 'hidden' : '';
    });
    if (megaClose) {
      megaClose.addEventListener('click', function(){
        mega.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        d.body.style.overflow = '';
      });
    }
    d.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && mega.classList.contains('is-open')) {
        mega.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        d.body.style.overflow = '';
      }
    });
  }

  /* Breaking strip — manchete única, sem JS necessário */

  /* Hero static slider — clique tab muda manchete (sem auto-rotate, preserva LCP) */
  var heroNav = d.querySelector('.oie-hero__nav');
  if (heroNav) {
    heroNav.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-target]');
      if (!btn) return;
      var n = btn.getAttribute('data-target');
      Array.prototype.forEach.call(heroNav.querySelectorAll('button'), function(b){ b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      Array.prototype.forEach.call(d.querySelectorAll('.oie-hero__slide'), function(s){
        var match = s.getAttribute('data-slide') === n;
        s.classList.toggle('is-active', match);
        if (match) { s.removeAttribute('hidden'); } else { s.setAttribute('hidden', ''); }
      });
    });
  }
})();
