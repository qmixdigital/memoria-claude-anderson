/* Ebookcult — home extras. Tiny, no animations on scroll (rule 4 — visible default). */
(function () {
    'use strict';

    // Activate adsbygoogle slot in stream once visible.
    var ad = document.querySelector('.ec-stream__ad .adsbygoogle');
    if (ad && window.adsbygoogle) {
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
    }
})();
