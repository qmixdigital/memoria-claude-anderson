/* Câmera Cotidiana — chrome (sticky on scroll up, dark toggle, search modal, sticky bar) */
(function () {
    'use strict';

    /* === Dark toggle (manual_toggle, persistent in localStorage) === */
    var html = document.documentElement;
    var toggle = document.querySelector('.cc__chrome__theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            var current = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', current);
            try { localStorage.setItem('cc-theme', current); } catch (_) {}
        });
    }

    /* === Sticky chrome on scroll up === */
    var chrome = document.getElementById('cc-chrome');
    if (chrome) {
        var lastY = window.scrollY;
        var ticking = false;
        var threshold = 240;
        chrome.style.position = 'sticky';
        chrome.style.top = '0';
        chrome.style.zIndex = '500';
        function onScroll() {
            var y = window.scrollY;
            if (y < threshold) {
                chrome.classList.remove('cc__chrome--unstuck');
            } else if (y > lastY) {
                chrome.classList.add('cc__chrome--unstuck');
            } else {
                chrome.classList.remove('cc__chrome--unstuck');
            }
            lastY = y;
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
        }, { passive: true });
    }

    /* === Search modal === */
    var modal = document.querySelector('.cc__search-modal');
    var openBtn = document.querySelector('.cc__chrome__search-open');
    var closeBtn = document.querySelector('.cc__search-modal__close');
    if (modal && openBtn) {
        openBtn.addEventListener('click', function () {
            modal.setAttribute('aria-hidden', 'false');
            var inp = modal.querySelector('input[name=s]');
            if (inp) setTimeout(function () { inp.focus(); }, 50);
        });
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                modal.setAttribute('aria-hidden', 'true');
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /* === Sticky bar (F5) — show after 600px scroll, dismissable === */
    var bar = document.querySelector('.cc__sticky-bar');
    if (bar) {
        var dismissed = false;
        try { dismissed = localStorage.getItem('cc-bar-dismissed') === '1'; } catch (_) {}
        if (!dismissed) {
            window.addEventListener('scroll', function () {
                if (window.scrollY > 600) {
                    bar.classList.add('cc__sticky-bar--visible');
                } else {
                    bar.classList.remove('cc__sticky-bar--visible');
                }
            }, { passive: true });
            var closeBar = bar.querySelector('.cc__sticky-bar__close');
            if (closeBar) {
                closeBar.addEventListener('click', function () {
                    bar.classList.remove('cc__sticky-bar--visible');
                    bar.style.display = 'none';
                    try { localStorage.setItem('cc-bar-dismissed', '1'); } catch (_) {}
                });
            }
        } else {
            bar.style.display = 'none';
        }
    }

    /* === External links: open in new tab + rel security === */
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
