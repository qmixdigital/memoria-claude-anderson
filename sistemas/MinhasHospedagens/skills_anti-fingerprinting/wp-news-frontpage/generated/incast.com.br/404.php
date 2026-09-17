<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<section class="ic-404">
    <h1>404</h1>
    <p style="font-size:18px;color:var(--ink-2);max-width:48ch">A página que você procurava não existe ou foi movida.</p>
    <p style="margin-top:var(--sp-3);display:flex;gap:var(--sp-2);flex-wrap:wrap">
        <a class="ic-btn ic-btn--accent" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a home</a>
        <a class="ic-btn" href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Últimas publicações</a>
    </p>

    <div style="margin-top:var(--sp-5)">
        <h2 style="font-family:var(--serif);font-style:italic;font-size:24px;margin-bottom:var(--sp-2)">Talvez você queira ler</h2>
        <div class="ic-front__row-three">
            <?php
            $q = ic_query_for_section( array( 'posts_per_page' => 6, 'orderby' => 'rand' ) );
            $c = 0;
            while ( $q->have_posts() ) {
                $q->the_post();
                if ( ! has_post_thumbnail() ) { continue; }
                if ( $c >= 3 ) { break; }
                ic_card( 'lg' );
                $c++;
            }
            wp_reset_postdata();
            ?>
        </div>
    </div>
</section>

<?php get_footer();
