<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<section class="bx-error" aria-labelledby="bx-404-h">
    <p class="bx-error__code">404</p>
    <h1 id="bx-404-h">Página não encontrada</h1>
    <p>O endereço solicitado não existe ou foi removido. Volte ao início ou explore as editorias.</p>
    <a class="bx-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a home</a>
</section>

<?php
$sug_q = bx_query_for_section( array( 'posts_per_page' => 12, 'orderby' => 'rand' ) );
$sug_ids = array();
while ( $sug_q->have_posts() ) {
    $sug_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $sug_ids[] = get_the_ID();
    if ( count( $sug_ids ) >= 4 ) { break; }
}
wp_reset_postdata();

if ( ! empty( $sug_ids ) ) : ?>
<section class="bx-section" aria-label="Sugestões">
    <header class="bx-section__h"><h2>Em destaque</h2></header>
    <div class="bx-grid">
        <?php
        global $post; $_o = $post;
        foreach ( $sug_ids as $sid ) {
            $post = get_post( $sid );
            setup_postdata( $post );
            bx_card_overlay();
        }
        $post = $_o;
        wp_reset_postdata();
        ?>
    </div>
</section>
<?php endif; get_footer();
