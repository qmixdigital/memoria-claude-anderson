<?php
/**
 * EUVO News, capa. Arquetipo A, jornal classico.
 *
 * Ordem: faixa com abas, hero sangrado, 3 blocos de editoria + últimas, sidebar.
 *
 * Roll: archetype=A | hero=bleed | breaking=tab_filter | card=image_right
 *       sidebar=floating | posts_per_category=5 | pagination=load_more
 *       schema=itemlist | ratio=21x9 | excerpt=short | meta=date_only
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();

/*
 * Tres listas, e nao uma so.
 *
 * $ev_used  : tudo que ja saiu. Alimenta o ItemList do fim e o corte das
 *             Últimas. Pode ter id repetido, e quem consome resolve.
 * $ev_faixa : o que a faixa de abas ja usou, para ela nao repetir dentro de si.
 * $ev_bloco_skip : o que os blocos de editoria ja usaram.
 *
 * Faixa e bloco tem listas separadas de proposito. Quando compartilhavam a
 * mesma, a faixa levava as 4 mais recentes de cada editoria e o bloco abaixo
 * era obrigado a abrir pela 5a: a capa mostrava marco de 2026 na faixa e
 * agosto de 2025 na chamada do mesmo bloco, o que le como bagunca de data. O
 * bloco e a vitrine da editoria e tem que abrir pela mais recente; a faixa e
 * um resumo de manchetes e pode repetir o que esta logo abaixo.
 */
$ev_used  = array();
$ev_faixa = array();

/*
 * Editorias por atividade, e nao por tamanho.
 *
 * Ordenadas por acervo, as quatro primeiras eram Noticias Agora (1.603
 * matérias, parada desde marco), Shows (990, parada em setembro), Insights e
 * Entretenimento. A faixa de ultimas noticias abria com matéria de meses
 * atras porque as maiores sao justamente as dormentes. Por atividade, ela abre
 * pelo que a redacao publicou por ultimo.
 */
$ev_editorias = ev_editorias_ativas( 4 );

/*
 * Blocos tambem por atividade, e nao por acervo.
 *
 * Antes eram as 3 maiores por acervo, e isso trazia Shows (990 matérias, mas
 * parada desde setembro de 2025) como bloco inteiro de posts velhos. O
 * operador foi claro: a home mostra o mais recente. Aqui as candidatas vem
 * ordenadas pela ultima publicacao; o laco abaixo renderiza as 3 primeiras que
 * tenham materia suficiente para encher, entao editoria dormente nao vira
 * bloco. Peco 8 candidatas para haver margem se alguma nao encher.
 */
$ev_blocos_cats = ev_editorias_ativas( 8 );

// Hero: a matéria mais recente com capa de verdade.
$ev_hero_ids = ev_collect_ids( 1 );
$ev_hero_id  = ! empty( $ev_hero_ids ) ? $ev_hero_ids[0] : 0;
if ( $ev_hero_id ) {
    $ev_used[]  = $ev_hero_id;
    $ev_faixa[] = $ev_hero_id;
}

// O hero e a unica matéria que ninguem mais repete: e a maior peca da página.
$ev_bloco_skip = $ev_hero_id ? array( $ev_hero_id ) : array();
?>

<?php
/*
 * Paineis da faixa.
 *
 * O primeiro e o site inteiro ("Últimas"), que e literalmente o que a faixa
 * promete: as ultimas publicações. Depois vem as editorias que publicaram mais
 * recentemente.
 *
 * Usa ev_latest_ids e nao a query da capa porque a faixa e so texto, manchete
 * e data, sem foto nenhuma. Exigir imagem destacada aqui nao protege card
 * algum (nao ha card) e jogaria fora 3 de cada 4 matérias do acervo.
 *
 * Cada aba corta apenas o hero, e nao as outras abas. Dedup entre abas seria
 * errado: a aba existe para ver aquela editoria, e a matéria mais recente do
 * site naturalmente aparece em "Últimas" e tambem na editoria dela.
 */
$ev_paineis = array();
$ev_corte   = $ev_hero_id ? array( $ev_hero_id ) : array();

$ev_ultimas = ev_latest_ids( 4, 0, $ev_corte );
if ( ! empty( $ev_ultimas ) ) {
    $ev_paineis[] = array(
        'key'  => 'ultimas',
        'nome' => 'Últimas',
        'ids'  => $ev_ultimas,
    );
}

foreach ( $ev_editorias as $ev_ed ) {
    $ev_ids = ev_latest_ids( 4, $ev_ed->term_id, $ev_corte );
    if ( empty( $ev_ids ) ) {
        continue;
    }
    $ev_paineis[] = array(
        'key'  => (string) $ev_ed->term_id,
        'nome' => $ev_ed->name,
        'ids'  => $ev_ids,
    );
}

foreach ( $ev_paineis as $ev_p ) {
    $ev_used = array_merge( $ev_used, $ev_p['ids'] );
}
?>

<?php if ( ! empty( $ev_paineis ) ) : ?>
<section class="ev-strip" aria-label="Últimas notícias">
    <div class="ev-wrap">

        <div class="ev-strip__tabs" role="tablist" aria-label="Escolha a editoria">
            <?php foreach ( $ev_paineis as $ev_i => $ev_p ) : ?>
                <button
                    class="ev-strip__tab"
                    type="button"
                    role="tab"
                    id="ev-tab-<?php echo esc_attr( $ev_p['key'] ); ?>"
                    aria-controls="ev-pane-<?php echo esc_attr( $ev_p['key'] ); ?>"
                    aria-selected="<?php echo ( 0 === $ev_i ) ? 'true' : 'false'; ?>"
                    tabindex="<?php echo ( 0 === $ev_i ) ? '0' : '-1'; ?>"
                ><?php echo esc_html( $ev_p['nome'] ); ?></button>
            <?php endforeach; ?>
        </div>

        <?php foreach ( $ev_paineis as $ev_i => $ev_p ) : ?>
            <div
                class="ev-strip__pane<?php echo ( 0 === $ev_i ) ? ' is-on' : ''; ?>"
                id="ev-pane-<?php echo esc_attr( $ev_p['key'] ); ?>"
                role="tabpanel"
                aria-labelledby="ev-tab-<?php echo esc_attr( $ev_p['key'] ); ?>"
                <?php echo ( 0 === $ev_i ) ? '' : 'hidden'; ?>
            >
                <?php foreach ( $ev_p['ids'] as $ev_pid ) : ?>
                    <div class="ev-strip__item">
                        <a href="<?php echo esc_url( get_permalink( $ev_pid ) ); ?>"><?php echo esc_html( get_the_title( $ev_pid ) ); ?></a>
                        <span class="ev-strip__when"><?php echo esc_html( ev_when( $ev_pid ) ); ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>

    </div>
</section>
<?php endif; ?>

<?php // ===== Hero sangrado, uma matéria ===== ?>
<?php if ( $ev_hero_id ) : ?>
    <?php
    $ev_hero_cat = ev_first_cat( $ev_hero_id );
    $ev_hero_x   = ev_excerpt( $ev_hero_id, 26 );
    ?>
<section class="ev-hero" aria-label="Manchete">
    <a class="ev-hero__media" href="<?php echo esc_url( get_permalink( $ev_hero_id ) ); ?>" aria-hidden="true" tabindex="-1">
        <?php
        echo get_the_post_thumbnail(
            $ev_hero_id,
            'ev-hero',
            array(
                'alt'           => '',
                'loading'       => 'eager',
                'fetchpriority' => 'high',
                'decoding'      => 'async',
            )
        );
        ?>
    </a>

    <div class="ev-hero__box">
        <?php if ( $ev_hero_cat ) : ?>
            <a class="ev-hero__kicker" href="<?php echo esc_url( get_category_link( $ev_hero_cat->term_id ) ); ?>"><?php echo esc_html( $ev_hero_cat->name ); ?></a>
        <?php endif; ?>

        <h1 class="ev-hero__t">
            <a href="<?php echo esc_url( get_permalink( $ev_hero_id ) ); ?>"><?php echo esc_html( get_the_title( $ev_hero_id ) ); ?></a>
        </h1>

        <?php if ( $ev_hero_x ) : ?>
            <p class="ev-hero__x"><?php echo esc_html( $ev_hero_x ); ?></p>
        <?php endif; ?>

        <time class="ev-hero__when" datetime="<?php echo esc_attr( get_the_date( 'c', $ev_hero_id ) ); ?>"><?php echo esc_html( ev_when( $ev_hero_id ) ); ?></time>
    </div>
</section>
<?php endif; ?>

<?php // ===== Corpo. O main vem antes do aside: a ordem do HTML define a coluna. ===== ?>
<div class="ev-wrap">
    <div class="ev-layout">

        <main class="ev-main" id="ev-conteudo">

            <?php
            // Ate 3 blocos de editoria, 5 matérias cada: 1 grande e 4 padrao.
            // As candidatas vem por atividade; renderiza as 3 primeiras que enchem.
            $ev_blocos          = $ev_blocos_cats;
            $ev_blocos_feitos   = 0;

            foreach ( $ev_blocos as $ev_bloco ) :
                if ( $ev_blocos_feitos >= 3 ) {
                    break;
                }
                /*
                 * Corta so contra o hero e contra o que outro bloco ja levou.
                 * A faixa nao entra: assim a chamada do bloco e sempre a
                 * matéria mais recente da editoria, que e o que o leitor
                 * espera ao bater o olho na secao.
                 */
                $ev_bids = ev_collect_ids(
                    5,
                    array(
                        'cat'          => $ev_bloco->term_id,
                        'post__not_in' => $ev_bloco_skip,
                    )
                );

                if ( count( $ev_bids ) < 2 ) {
                    continue;
                }
                $ev_bloco_skip = array_merge( $ev_bloco_skip, $ev_bids );
                $ev_used       = array_merge( $ev_used, $ev_bids );
                $ev_blocos_feitos++;
                ?>
                <section class="ev-section ev-catblock" aria-labelledby="ev-h-<?php echo (int) $ev_bloco->term_id; ?>">

                    <div class="ev-section__h">
                        <h2 id="ev-h-<?php echo (int) $ev_bloco->term_id; ?>"><?php echo esc_html( $ev_bloco->name ); ?></h2>
                        <a class="ev-section__more" href="<?php echo esc_url( get_category_link( $ev_bloco->term_id ) ); ?>">Tudo sobre <?php echo esc_html( $ev_bloco->name ); ?></a>
                    </div>

                    <?php
                    global $post;
                    $ev_keep = $post;

                    // Destaque do bloco.
                    $post = get_post( $ev_bids[0] );
                    setup_postdata( $post );
                    echo '<div class="ev-catblock__lead">';
                    ev_card( 'lg' );
                    echo '</div>';

                    // Restante do bloco.
                    $ev_resto = array_slice( $ev_bids, 1 );
                    if ( ! empty( $ev_resto ) ) {
                        echo '<div class="ev-grid-2">';
                        foreach ( $ev_resto as $ev_rid ) {
                            $post = get_post( $ev_rid );
                            setup_postdata( $post );
                            ev_card( 'default' );
                        }
                        echo '</div>';
                    }

                    $post = $ev_keep;
                    wp_reset_postdata();
                    ?>

                </section>
            <?php endforeach; ?>

            <?php // ===== Últimas, com carregar mais ===== ?>
            <section class="ev-section" aria-labelledby="ev-h-últimas">

                <div class="ev-section__h">
                    <h2 id="ev-h-últimas">Últimas</h2>
                </div>

                <div class="ev-grid-2" id="ev-feed">
                    <?php
                    $ev_feed = ev_section_query(
                        array(
                            'posts_per_page' => 24,
                            'post__not_in'   => $ev_used,
                        )
                    );

                    $ev_n = 0;
                    while ( $ev_feed->have_posts() ) {
                        $ev_feed->the_post();
                        if ( ! has_post_thumbnail() ) {
                            continue;
                        }
                        if ( $ev_n >= 8 ) {
                            break;
                        }
                        $ev_used[] = get_the_ID();
                        ev_card( 'default' );
                        $ev_n++;
                    }
                    wp_reset_postdata();
                    ?>
                </div>

                <?php if ( $ev_n >= 8 ) : ?>
                    <?php
                    /*
                     * data-skip leva tudo que ja foi impresso acima: hero, faixa
                     * e os tres blocos de editoria. Sem essa lista o servidor
                     * devolveria na página 2 matéria que o leitor ja passou.
                     */
                    ?>
                    <div class="ev-more">
                        <button
                            class="ev-btn"
                            type="button"
                            id="ev-more"
                            data-skip="<?php echo esc_attr( implode( ',', array_map( 'absint', $ev_used ) ) ); ?>"
                        >Carregar mais matérias</button>
                    </div>
                <?php endif; ?>

            </section>

        </main>

        <?php // sidebar=floating. Sem position:sticky aqui: quebra o alinhamento das colunas. ?>
        <aside class="ev-aside" aria-label="Destaques e serviços">

            <?php
            $ev_lidos = ev_most_read_ids( 5, $ev_used );
            if ( ! empty( $ev_lidos ) ) :
                ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Mais Lidos</h2>
                    <ol class="ev-rank">
                        <?php
                        $ev_pos = 1;
                        foreach ( $ev_lidos as $ev_lid ) :
                            $ev_used[] = $ev_lid;
                            ?>
                            <li>
                                <span class="ev-rank__n" aria-hidden="true"><?php echo (int) $ev_pos; ?></span>
                                <a class="ev-rank__t" href="<?php echo esc_url( get_permalink( $ev_lid ) ); ?>"><?php echo esc_html( get_the_title( $ev_lid ) ); ?></a>
                            </li>
                            <?php
                            $ev_pos++;
                        endforeach;
                        ?>
                    </ol>
                </section>
            <?php endif; ?>

            <section class="ev-w ev-news">
                <h2 class="ev-w__h">Receba a Nossa Seleção</h2>
                <p>As matérias que a redação destacou na semana, direto no seu e-mail. Sem cobrança e sem spam.</p>
                <a class="ev-btn" href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Quero receber</a>
            </section>

            <?php
            /*
             * Indice de editorias.
             *
             * O arquetipo previa um anuncio neste terco da coluna, mas o portal
             * nao roda AdSense e o espaco virava 2.000px de vazio ao lado das
             * matérias. Aqui ele vira indice: enche a coluna com conteudo e
             * ainda distribui link interno para cada editoria, que e o que o
             * anuncio nunca faria.
             */
            $ev_idx = get_categories(
                array(
                    'orderby'    => 'count',
                    'order'      => 'DESC',
                    'number'     => 8,
                    'hide_empty' => true,
                    'exclude'    => ev_hidden_cats(),
                )
            );
            if ( ! empty( $ev_idx ) ) :
                ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Editorias</h2>
                    <ul class="ev-idx">
                        <?php foreach ( $ev_idx as $ev_ic ) : ?>
                            <li>
                                <a href="<?php echo esc_url( get_category_link( $ev_ic->term_id ) ); ?>"><?php echo esc_html( $ev_ic->name ); ?></a>
                                <span class="ev-idx__n"><?php echo esc_html( number_format_i18n( (int) $ev_ic->count ) ); ?></span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </section>
            <?php endif; ?>

            <?php
            /*
             * Mais recentes que ainda nao apareceram.
             *
             * Era "Do Arquivo" (matéria com mais de 90 dias, aleatoria), mas o
             * operador foi claro: a home mostra o mais recente. Agora puxa as
             * ultimas publicacoes que nao entraram no hero, na faixa nem nos
             * blocos, mantendo a coluna cheia sem trazer post velho.
             */
            $ev_mais = ev_latest_ids( 4, 0, $ev_used );
            if ( ! empty( $ev_mais ) ) :
                ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Também Agora</h2>
                    <?php
                    global $post;
                    $ev_keep_a = $post;
                    foreach ( $ev_mais as $ev_aid ) {
                        $ev_used[] = $ev_aid;
                        $post      = get_post( $ev_aid );
                        setup_postdata( $post );
                        ev_card_any( 'sm' );
                    }
                    $post = $ev_keep_a;
                    wp_reset_postdata();
                    ?>
                </section>
            <?php endif; ?>

            <?php if ( is_active_sidebar( 'ev-aside' ) ) : ?>
                <?php dynamic_sidebar( 'ev-aside' ); ?>
            <?php endif; ?>

        </aside>

    </div>
</div>

<?php ev_itemlist_schema( $ev_used ); ?>

<?php
get_footer();
