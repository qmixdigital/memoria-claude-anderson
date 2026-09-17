/* Infinite scroll para archives (REST). */
(function(){
  'use strict';

  if (typeof OIE_ARCHIVE === 'undefined') return;

  var loader = document.getElementById('oie-archive-loader');
  var list = document.getElementById('oie-archive-list');
  if (!loader || !list) return;

  var page = parseInt(list.getAttribute('data-page') || '1', 10);
  var cat = list.getAttribute('data-cat');
  var stopped = false;
  var loading = false;

  function load(){
    if (loading || stopped) return;
    loading = true;
    loader.setAttribute('data-loading', 'true');
    page += 1;
    var url = OIE_ARCHIVE.rest + '?per_page=15&page=' + page + '&_embed=1';
    if (cat) url += '&categories=' + encodeURIComponent(cat);

    fetch(url, { headers: { 'X-WP-Nonce': OIE_ARCHIVE.nonce } })
      .then(function(r){
        if (r.status === 400 || r.status === 404) { stopped = true; loader.style.display='none'; return null; }
        return r.json();
      })
      .then(function(posts){
        if (!posts || !posts.length) { stopped = true; loader.style.display='none'; return; }
        var frag = document.createDocumentFragment();
        var wrap = document.createElement('div');
        wrap.className = 'oie-archive__row1';
        posts.forEach(function(p){
          var art = document.createElement('article');
          art.className = 'oie-card';
          var catName = '';
          try {
            if (p._embedded && p._embedded['wp:term'] && p._embedded['wp:term'][0] && p._embedded['wp:term'][0][0]) {
              catName = p._embedded['wp:term'][0][0].name || '';
            }
          } catch (e) {}
          art.innerHTML = ''
            + (catName ? '<span class="oie-card__cat">' + catName.toLowerCase() + '</span>' : '')
            + '<h3 class="oie-card__title"><a href="' + p.link + '">' + p.title.rendered + '</a></h3>'
            + '<p class="oie-card__excerpt">' + (p.excerpt ? p.excerpt.rendered.replace(/<[^>]+>/g,'').slice(0, 140) : '') + '</p>';
          wrap.appendChild(art);
        });
        frag.appendChild(wrap);
        list.appendChild(frag);
        list.setAttribute('data-page', String(page));
      })
      .catch(function(){ stopped = true; loader.style.display='none'; })
      .finally(function(){ loading = false; loader.setAttribute('data-loading', 'false'); });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) load(); });
    }, { rootMargin: '600px' });
    io.observe(loader);
  } else {
    window.addEventListener('scroll', function(){
      var rect = loader.getBoundingClientRect();
      if (rect.top < window.innerHeight + 600) load();
    });
  }
})();
