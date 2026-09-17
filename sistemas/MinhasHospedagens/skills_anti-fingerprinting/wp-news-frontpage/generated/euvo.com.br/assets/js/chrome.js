/**
 * EUVO News, comportamento do cabecalho.
 *
 * Roll: menu_position_in_header=hidden_burger | header_sticky_behavior=sticky_after_scroll_300px
 */
( function () {
    'use strict';

    var head    = document.getElementById( 'ev-head' );
    var spacer  = document.getElementById( 'ev-spacer' );
    var burger  = document.getElementById( 'ev-burger' );
    var nav     = document.getElementById( 'ev-nav' );

    /* Menu atras do botao. */
    if ( burger && nav ) {
        burger.addEventListener( 'click', function () {
            var open = nav.classList.toggle( 'is-open' );
            burger.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
            burger.setAttribute( 'aria-label', open ? 'Fechar o menu principal' : 'Abrir o menu principal' );
        } );

        /* Esc fecha e devolve o foco para o botao. */
        document.addEventListener( 'keydown', function ( e ) {
            if ( 'Escape' === e.key && nav.classList.contains( 'is-open' ) ) {
                nav.classList.remove( 'is-open' );
                burger.setAttribute( 'aria-expanded', 'false' );
                burger.setAttribute( 'aria-label', 'Abrir o menu principal' );
                burger.focus();
            }
        } );

        /* Clique fora fecha. */
        document.addEventListener( 'click', function ( e ) {
            if ( ! nav.classList.contains( 'is-open' ) ) {
                return;
            }
            if ( nav.contains( e.target ) || burger.contains( e.target ) ) {
                return;
            }
            nav.classList.remove( 'is-open' );
            burger.setAttribute( 'aria-expanded', 'false' );
        } );
    }

    /*
     * Sticky depois de 300px.
     *
     * O spacer assume a altura do cabecalho no instante em que ele vira fixed.
     * Sem isso a pagina daria um salto de uma altura de header, que o Lighthouse
     * contabiliza como layout shift.
     */
    if ( head && spacer ) {
        var stuck = false;
        var tick  = false;

        var apply = function () {
            var y = window.pageYOffset || document.documentElement.scrollTop;

            if ( ! stuck && y > 300 ) {
                spacer.style.height = head.offsetHeight + 'px';
                spacer.classList.add( 'is-on' );
                head.classList.add( 'is-stuck' );
                stuck = true;
            } else if ( stuck && y <= 300 ) {
                head.classList.remove( 'is-stuck' );
                spacer.classList.remove( 'is-on' );
                spacer.style.height = '';
                stuck = false;
            }
            tick = false;
        };

        window.addEventListener( 'scroll', function () {
            if ( ! tick ) {
                window.requestAnimationFrame( apply );
                tick = true;
            }
        }, { passive: true } );
    }
} )();
