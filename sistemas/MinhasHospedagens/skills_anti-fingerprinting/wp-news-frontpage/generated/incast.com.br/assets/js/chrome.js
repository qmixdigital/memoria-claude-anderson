/* Header chrome: breaking strip tabs, share copy-link button. */
(function(){
  'use strict';
  var d = document;

  // Breaking strip — tab filter
  var tabsRoot = d.querySelector('.ic-breaking__tabs');
  if (tabsRoot) {
    tabsRoot.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      var key = btn.getAttribute('data-tab');
      Array.prototype.forEach.call(tabsRoot.querySelectorAll('button'), function(b){ b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      Array.prototype.forEach.call(d.querySelectorAll('.ic-breaking__pane'), function(p){
        p.classList.toggle('is-active', p.getAttribute('data-pane') === key);
      });
    });
  }

  // Share — copy link
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
