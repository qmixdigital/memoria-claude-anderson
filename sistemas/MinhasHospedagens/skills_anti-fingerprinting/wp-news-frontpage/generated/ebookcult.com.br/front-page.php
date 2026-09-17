<?php
/**
 * Portal: ebookcult.com.br
 * Front-page — Library Stack edition (archetype D revisitado).
 * Hero magazine cover + density-alternating stream + book-spine ranked.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="ec-edition" aria-label="Atualização da home">
    <span><span class="ec-edition__num">Em pauta</span> &nbsp;·&nbsp; Curadoria diária da redação</span>
    <span class="ec-edition__date">
        <strong>Atualizado <?php echo esc_html( wp_date( 'l, d \\d\\e F' ) ); ?></strong>
    </span>
</div>

<div class="ec-layout">
    <div class="ec-main">

        <?php
        $hero_q = ec_query_for_section( array(
            'posts_per_page' => 18,
            'no_found_rows'  => true,
        ) );
        $hero_ids = array();
        while ( $hero_q->have_posts() ) {
            $hero_q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $hero_ids[] = get_the_ID();
            if ( count( $hero_ids ) >= 5 ) { break; }
        }
        wp_reset_postdata();
        ?>

        <?php if ( ! empty( $hero_ids ) ) : ?>
        <section class="ec-hero" aria-label="Em destaque">
            <?php
            $lead     = $hero_ids[0];
            $supports = array_slice( $hero_ids, 1, 4 );
            $lead_excerpt = get_the_excerpt( $lead );
            if ( ! $lead_excerpt ) {
                $lead_excerpt = wp_trim_words( strip_tags( get_post_field( 'post_content', $lead ) ), 32, '…' );
            }
            $lead_reading = ec_reading_time( $lead );
            ?>
            <article class="ec-hero__lead">
                <a class="ec-hero__media" href="<?php echo esc_url( get_permalink( $lead ) ); ?>" aria-hidden="true" tabindex="-1">
                    <?php echo get_the_post_thumbnail( $lead, 'large', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
                </a>
                <div class="ec-hero__body">
                    <?php
                    $cats = get_the_category( $lead );
                    if ( ! empty( $cats ) ) {
                        echo '<a class="ec-hero__cat" href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
                    }
                    ?>
                    <h2 class="ec-hero__title">
                        <a href="<?php echo esc_url( get_permalink( $lead ) ); ?>"><?php echo esc_html( get_the_title( $lead ) ); ?></a>
                    </h2>
                    <?php if ( $lead_excerpt ) : ?>
                    <p class="ec-hero__excerpt"><?php echo esc_html( $lead_excerpt ); ?></p>
                    <?php endif; ?>
                    <p class="ec-hero__lead-meta">
                        <span>Por <strong><?php echo esc_html( get_the_author_meta( 'display_name', get_post_field( 'post_author', $lead ) ) ); ?></strong></span>
                        <span aria-hidden="true">·</span>
                        <span><?php echo esc_html( ec_post_date( $lead ) ); ?></span>
                        <?php if ( $lead_reading ) : ?>
                        <span class="ec-hero__time"><?php echo esc_html( str_replace( 'leitura: ', '', $lead_reading ) ); ?></span>
                        <?php endif; ?>
                    </p>
                </div>
            </article>

            <?php if ( ! empty( $supports ) ) : ?>
            <div class="ec-hero__support">
                <?php foreach ( $supports as $sid ) :
                    $sread = ec_reading_time( $sid );
                ?>
                    <article class="ec-hero__cell">
                        <a class="ec-hero__cell-media" href="<?php echo esc_url( get_permalink( $sid ) ); ?>" aria-hidden="true" tabindex="-1">
                            <?php echo get_the_post_thumbnail( $sid, 'medium', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
                        </a>
                        <div class="ec-hero__cell-body">
                            <?php
                            $sc = get_the_category( $sid );
                            if ( ! empty( $sc ) ) {
                                echo '<span class="ec-hero__cell-cat">' . esc_html( $sc[0]->name ) . '</span>';
                            }
                            ?>
                            <h3 class="ec-hero__cell-title">
                                <a href="<?php echo esc_url( get_permalink( $sid ) ); ?>"><?php echo esc_html( get_the_title( $sid ) ); ?></a>
                            </h3>
                            <?php if ( $sread ) : ?>
                            <span class="ec-hero__cell-time"><?php echo esc_html( str_replace( 'leitura: ', '', $sread ) ); ?></span>
                            <?php endif; ?>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </section>
        <?php endif; ?>

        <?php
        $stream_q = ec_query_for_section( array(
            'posts_per_page' => 24,
            'post__not_in'   => $hero_ids,
        ) );
        $stream_ids = array();
        while ( $stream_q->have_posts() ) {
            $stream_q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $stream_ids[] = get_the_ID();
            if ( count( $stream_ids ) >= 6 ) { break; }
        }
        wp_reset_postdata();
        ?>

        <?php if ( ! empty( $stream_ids ) ) : ?>
        <section class="ec-section">
            <div class="ec-section__head">
                <h2>Continue lendo</h2>
                <a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">Assinar RSS</a>
            </div>
            <div class="ec-stream">
                <?php
                $i = 0;
                foreach ( $stream_ids as $sid ) :
                    $side = ( $i % 2 === 0 ) ? 'left' : 'right';
                    $i++;
                    $sread = ec_reading_time( $sid );
                    $sexcerpt = get_the_excerpt( $sid );
                    if ( ! $sexcerpt ) {
                        $sexcerpt = wp_trim_words( strip_tags( get_post_field( 'post_content', $sid ) ), 22, '…' );
                    }
                ?>
                <article class="ec-stream__row ec-stream__row--<?php echo esc_attr( $side ); ?>">
                    <a class="ec-stream__media" href="<?php echo esc_url( get_permalink( $sid ) ); ?>" aria-hidden="true" tabindex="-1">
                        <?php echo get_the_post_thumbnail( $sid, 'medium_large', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
                    </a>
                    <div class="ec-stream__body">
                        <?php
                        $rcats = get_the_category( $sid );
                        if ( ! empty( $rcats ) ) {
                            $crumbs = array();
                            foreach ( array_slice( $rcats, 0, 2 ) as $rc ) {
                                $crumbs[] = '<a href="' . esc_url( get_category_link( $rc ) ) . '">' . esc_html( $rc->name ) . '</a>';
                            }
                            echo '<div class="ec-stream__cats">' . implode( '', $crumbs ) . '</div>';
                        }
                        ?>
                        <h3 class="ec-stream__title">
                            <a href="<?php echo esc_url( get_permalink( $sid ) ); ?>"><?php echo esc_html( get_the_title( $sid ) ); ?></a>
                        </h3>
                        <?php if ( $sexcerpt ) : ?>
                        <p class="ec-stream__lead"><?php echo esc_html( $sexcerpt ); ?></p>
                        <?php endif; ?>
                        <p class="ec-stream__meta">
                            <span>Por <strong><?php echo esc_html( get_the_author_meta( 'display_name', get_post_field( 'post_author', $sid ) ) ); ?></strong></span>
                            <span aria-hidden="true">·</span>
                            <span><?php echo esc_html( ec_post_date( $sid ) ); ?></span>
                            <?php if ( $sread ) : ?>
                            <span class="ec-stream__time"><?php echo esc_html( str_replace( 'leitura: ', '', $sread ) ); ?></span>
                            <?php endif; ?>
                        </p>
                    </div>
                </article>
                <?php
                if ( $i === 3 ) {
                    echo '<div class="ec-stream__ad" aria-hidden="true"><ins class="adsbygoogle ec-adslot" data-ad-client="' . esc_attr( EC_ADSENSE_CLIENT ) . '" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
                }
                endforeach;
                ?>
            </div>
        </section>
        <?php endif; ?>

        <?php
        $top_q = ec_query_for_section( array(
            'posts_per_page' => 18,
            'orderby'        => 'comment_count',
            'order'          => 'DESC',
            'post__not_in'   => array_merge( $hero_ids, $stream_ids ),
        ) );
        $top_ids = array();
        while ( $top_q->have_posts() ) {
            $top_q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $top_ids[] = get_the_ID();
            if ( count( $top_ids ) >= 6 ) { break; }
        }
        wp_reset_postdata();
        ?>

        <?php if ( ! empty( $top_ids ) ) : ?>
        <section class="ec-section ec-section--ranked">
            <div class="ec-section__head">
                <h2>Mais lidas da estação</h2>
            </div>
            <ol class="ec-ranked">
                <?php
                $rank = 0;
                foreach ( $top_ids as $tid ) :
                    $rank++;
                ?>
                <li class="ec-ranked__row">
                    <span class="ec-ranked__num"><?php echo str_pad( (string) $rank, 2, '0', STR_PAD_LEFT ); ?></span>
                    <div class="ec-ranked__body">
                        <?php
                        $tc = get_the_category( $tid );
                        if ( ! empty( $tc ) ) {
                            echo '<span class="ec-ranked__cat">' . esc_html( $tc[0]->name ) . '</span>';
                        }
                        ?>
                        <h4 class="ec-ranked__title">
                            <a href="<?php echo esc_url( get_permalink( $tid ) ); ?>"><?php echo esc_html( get_the_title( $tid ) ); ?></a>
                        </h4>
                    </div>
                </li>
                <?php endforeach; ?>
            </ol>
        </section>
        <?php endif; ?>

    </div>

    <aside class="ec-sidebar" role="complementary">

        <div class="ec-widget ec-widget--manifesto">
            <h4>Manifesto</h4>
            <p style="font-size:14.5px; line-height:1.7; margin:0;">
                Lemos para fugir do barulho. Cada texto aqui passa por um editor antes de subir, sem release pago como matéria, sem listas patrocinadas. Conteúdo independente desde 2018.
            </p>
        </div>

        <div class="ec-widget">
            <h4>Estantes do portal</h4>
            <ul>
                <?php
                $sb_cats = get_categories( array(
                    'orderby'    => 'count',
                    'order'      => 'DESC',
                    'number'     => 8,
                    'hide_empty' => true,
                ) );
                foreach ( $sb_cats as $sc ) {
                    echo '<li><a href="' . esc_url( get_category_link( $sc ) ) . '">' . esc_html( $sc->name ) . ' <span style="color:var(--ec-muted); font-family:var(--ec-mono); font-size:10px; float:right; letter-spacing:.12em;">' . (int) $sc->count . '</span></a></li>';
                }
                ?>
            </ul>
        </div>

        <?php
        $sb_top_q = ec_query_for_section( array(
            'posts_per_page' => 12,
            'orderby'        => 'comment_count',
            'order'          => 'DESC',
            'post__not_in'   => array_merge( $hero_ids, $stream_ids, $top_ids ),
        ) );
        $sb_top_ids = array();
        while ( $sb_top_q->have_posts() ) {
            $sb_top_q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $sb_top_ids[] = get_the_ID();
            if ( count( $sb_top_ids ) >= 5 ) { break; }
        }
        wp_reset_postdata();
        ?>

        <?php if ( ! empty( $sb_top_ids ) ) : ?>
        <div class="ec-widget">
            <h4>Bem comentadas</h4>
            <ul class="ec-widget__compact">
                <?php foreach ( $sb_top_ids as $sbid ) : ?>
                <li>
                    <a href="<?php echo esc_url( get_permalink( $sbid ) ); ?>">
                        <span class="ec-widget__thumb">
                            <?php echo get_the_post_thumbnail( $sbid, array( 56, 56 ), array( 'alt' => '', 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
                        </span>
                        <span class="ec-widget__txt">
                            <span class="ec-widget__title"><?php echo esc_html( wp_trim_words( get_the_title( $sbid ), 10, '…' ) ); ?></span>
                            <span class="ec-widget__date"><?php echo esc_html( ec_post_date( $sbid ) ); ?></span>
                        </span>
                    </a>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php endif; ?>

        <?php if ( is_active_sidebar( 'sidebar-1' ) ) : dynamic_sidebar( 'sidebar-1' ); endif; ?>

    </aside>

</div>

<?php
get_footer();
