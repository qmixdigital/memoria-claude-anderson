/* Câmera Cotidiana — archive (infinite scroll graceful degrade) */
(function () {
    'use strict';

    var trigger = document.getElementById('cc-loadmore-trigger');
    var grid    = document.getElementById('cc-archive-grid');
    if (!trigger || !grid) return;

    var nextUrl = trigger.getAttribute('href');
    var loading = false;
    var done    = false;

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting && !loading && !done && nextUrl) {
                fetchNext();
            }
        });
    }, { rootMargin: '600px 0px' });
    io.observe(trigger);

    function fetchNext() {
        loading = true;
        trigger.textContent = '› carregando…';
        fetch(nextUrl, { credentials: 'same-origin' })
            .then(function (r) { return r.text(); })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var newItems = doc.querySelectorAll('#cc-archive-grid .cc__archive__item');
                newItems.forEach(function (it) { grid.appendChild(it); });
                var nextLink = doc.querySelector('.cc__archive__loadmore');
                if (nextLink) {
                    nextUrl = nextLink.getAttribute('data-cc-next') || nextLink.querySelector('a').getAttribute('href');
                    trigger.setAttribute('href', nextUrl);
                    trigger.textContent = '› carregar mais';
                } else {
                    done = true;
                    trigger.textContent = '› fim';
                    trigger.removeAttribute('href');
                }
                loading = false;
            })
            .catch(function () {
                loading = false;
                trigger.textContent = '› carregar mais (erro, tente clicar)';
            });
    }

    trigger.addEventListener('click', function (e) {
        e.preventDefault();
        if (!loading && !done) fetchNext();
    });
})();
