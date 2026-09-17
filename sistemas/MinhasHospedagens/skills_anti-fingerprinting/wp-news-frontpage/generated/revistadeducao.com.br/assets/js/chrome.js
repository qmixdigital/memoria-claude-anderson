/* Header chrome: search dropdown, sticky_on_scroll_up, share copy-link. */
(function(){
  'use strict';
  var d = document;

  // Search dropdown
  var toggle = d.getElementById('rde-search-toggle');
  var dropdown = d.getElementById('rde-search-dropdown');
  if (toggle && dropdown) {
    toggle.addEventListener('click', function(e){
      e.preventDefault();
      var open = dropdown.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var inp = dropdown.querySelector('input[type="search"]');
        if (inp) setTimeout(function(){ inp.focus(); }, 50);
      }
    });
    d.addEventListener('click', function(e){
      if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Header sticky_on_scroll_up — só fica sticky quando rolar PARA CIMA
  var header = d.querySelector('.rde-header');
  if (header) {
    var lastY = 0;
    var stickyThreshold = 200;
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if (y < stickyThreshold) {
        header.classList.remove('is-sticky');
        header.classList.remove('is-hidden');
      } else if (y > lastY) {
        header.classList.add('is-sticky');
        header.classList.add('is-hidden');
      } else {
        header.classList.add('is-sticky');
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  // Share copy-link
  d.addEventListener('click', function(e){
    var btn = e.target.closest('[data-action="copy-link"]');
    if (!btn) return;
    var url = btn.getAttribute('data-url') || location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function(){
        var prev = btn.textContent;
        btn.textContent = 'Link copiado ✓';
        setTimeout(function(){ btn.textContent = prev; }, 2000);
      });
    }
  });
})();
