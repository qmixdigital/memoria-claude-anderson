/* Viaje no Detalhe — archive load_more button (não infinite scroll) */
(function () {
  'use strict';

  var trigger = document.getElementById('vd-loadmore-trigger');
  var grid    = document.getElementById('vd-archive-grid');
  var nav     = document.getElementById('vd-archive-loadmore');
  if (!trigger || !grid || !nav) return;

  var nextUrl = nav.getAttribute('data-vd-next') || trigger.getAttribute('href');
  var loading = false;

  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    if (loading) return;
    loading = true;
    var orig = trigger.textContent;
    trigger.textContent = 'carregando…';
    fetch(nextUrl, { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var newItems = doc.querySelectorAll('#vd-archive-grid .vd-card');
        newItems.forEach(function (it) { grid.appendChild(it); });
        var nextNav = doc.getElementById('vd-archive-loadmore');
        if (nextNav) {
          nextUrl = nextNav.getAttribute('data-vd-next');
          trigger.setAttribute('href', nextUrl);
          trigger.textContent = orig;
        } else {
          trigger.textContent = '// fim do caderno';
          trigger.removeAttribute('href');
          nextUrl = null;
        }
        loading = false;
      })
      .catch(function () {
        loading = false;
        trigger.textContent = 'erro — tente clicar de novo';
      });
  });
})();
