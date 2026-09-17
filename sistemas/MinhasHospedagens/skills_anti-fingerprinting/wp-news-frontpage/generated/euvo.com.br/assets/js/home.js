/**
 * EUVO News, comportamento da capa.
 *
 * Roll: breaking_strip=tab_filter | pagination=load_more
 */
( function () {
    'use strict';

    /* ---- Faixa de últimas, filtro por abas ---- */
    var tabs = Array.prototype.slice.call( document.querySelectorAll( '.ev-strip__tab' ) );

    if ( tabs.length ) {
        var show = function ( tab ) {
            tabs.forEach( function ( t ) {
                var pane = document.getElementById( t.getAttribute( 'aria-controls' ) );
                var on   = ( t === tab );

                t.setAttribute( 'aria-selected', on ? 'true' : 'false' );
                t.setAttribute( 'tabindex', on ? '0' : '-1' );

                if ( pane ) {
                    pane.classList.toggle( 'is-on', on );
                    if ( on ) {
                        pane.removeAttribute( 'hidden' );
                    } else {
                        pane.setAttribute( 'hidden', '' );
                    }
                }
            } );
        };

        tabs.forEach( function ( tab, i ) {
            tab.addEventListener( 'click', function () {
                show( tab );
            } );

            /* Setas navegam entre as abas, como manda o padrao de tablist. */
            tab.addEventListener( 'keydown', function ( e ) {
                var next = null;

                if ( 'ArrowRight' === e.key ) {
                    next = tabs[ ( i + 1 ) % tabs.length ];
                } else if ( 'ArrowLeft' === e.key ) {
                    next = tabs[ ( i - 1 + tabs.length ) % tabs.length ];
                }

                if ( next ) {
                    e.preventDefault();
                    show( next );
                    next.focus();
                }
            } );
        } );
    }

    /* ---- Carregar mais ---- */
    var btn  = document.getElementById( 'ev-more' );
    var feed = document.getElementById( 'ev-feed' );

    if ( ! btn || ! feed || 'undefined' === typeof evCapa ) {
        return;
    }

    /*
     * Guarda o que ja esta na tela para o servidor nao repetir matéria.
     *
     * A semente vem do data-skip, e nao apenas dos cards do feed: a capa monta
     * hero, faixa e tres blocos de editoria antes das últimas, e nada disso
     * esta dentro de #ev-feed. Lendo so o feed, a página 2 traria de volta o
     * que o leitor ja passou mais acima.
     */
    var seen = [];

    var remember = function ( id ) {
        id = String( id );
        if ( id && seen.indexOf( id ) === -1 ) {
            seen.push( id );
        }
    };

    ( btn.getAttribute( 'data-skip' ) || '' ).split( ',' ).forEach( remember );

    Array.prototype.slice.call( feed.querySelectorAll( '.ev-card[data-id]' ) ).forEach( function ( card ) {
        remember( card.getAttribute( 'data-id' ) );
    } );

    var page = 1;

    btn.addEventListener( 'click', function () {
        btn.disabled = true;
        btn.textContent = 'Carregando...';

        page = page + 1;

        var body = new URLSearchParams();
        body.append( 'action', 'ev_more' );
        body.append( 'nonce', evCapa.nonce );
        body.append( 'page', String( page ) );
        seen.forEach( function ( id ) {
            body.append( 'skip[]', id );
        } );

        fetch( evCapa.ajax, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        } )
            .then( function ( r ) {
                return r.json();
            } )
            .then( function ( res ) {
                if ( ! res || ! res.success || ! res.data.html ) {
                    btn.remove();
                    return;
                }

                feed.insertAdjacentHTML( 'beforeend', res.data.html );

                ( res.data.ids || [] ).forEach( remember );

                if ( res.data.done ) {
                    btn.remove();
                    return;
                }

                btn.disabled = false;
                btn.textContent = 'Carregar mais matérias';
            } )
            .catch( function () {
                btn.disabled = false;
                btn.textContent = 'Tentar de novo';
            } );
    } );
} )();
