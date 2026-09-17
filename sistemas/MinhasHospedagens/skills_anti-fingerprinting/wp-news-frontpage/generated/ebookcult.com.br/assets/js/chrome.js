/* Ebookcult — chrome (header + a11y polish). Pure vanilla, no jQuery. */
(function () {
    'use strict';

    // Ensure focus-visible polyfill for keyboard users on older Safari.
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') { document.documentElement.classList.add('ec-kbd'); }
    });
    document.addEventListener('mousedown', function () {
        document.documentElement.classList.remove('ec-kbd');
    });

    // External links: open in new tab + rel security (only outbound).
    var host = window.location.host;
    document.querySelectorAll('.ec-main a[href^="http"]').forEach(function (a) {
        try {
            var u = new URL(a.href);
            if (u.host !== host) {
                a.target = '_blank';
                var rel = (a.rel || '').split(' ').filter(Boolean);
                if (rel.indexOf('noopener') === -1) { rel.push('noopener'); }
                if (rel.indexOf('noreferrer') === -1) { rel.push('noreferrer'); }
                a.rel = rel.join(' ');
            }
        } catch (_) { /* malformed url, ignore */ }
    });
})();
