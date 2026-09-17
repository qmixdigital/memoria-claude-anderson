<?php
/**
 * 404 — página não encontrada.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header(); ?>

<section class="oie-404">
    <h1>404</h1>
    <p>A página que você procurava não existe ou foi movida.</p>
    <p style="margin-top:var(--oie-sp-3);display:flex;gap:var(--oie-sp-2);flex-wrap:wrap">
        <a class="oie-btn oie-btn--accent" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a home</a>
        <a class="oie-btn" href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Últimas publicações</a>
    </p>
    <hr style="border:none;border-top:1px solid var(--oie-line);margin:var(--oie-sp-4) 0">
    <h2 style="font-size:18px;text-transform:lowercase">talvez você queira ler</h2>
    <div class="oie-front__row-three" style="margin-top:var(--oie-sp-2)">
        <?php
        $q = oie_query_for_section( array( 'posts_per_page' => 3, 'orderby' => 'rand' ) );
        while ( $q->have_posts() ) { $q->the_post(); oie_card( 'default' ); }
        wp_reset_postdata();
        ?>
    </div>
</section>

<?php get_footer();
