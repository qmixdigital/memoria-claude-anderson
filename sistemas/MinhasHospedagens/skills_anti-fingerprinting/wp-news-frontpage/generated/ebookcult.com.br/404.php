<?php
/**
 * Portal: ebookcult.com.br
 * 404 — segue padrão chrome do tema, com sugestões editoriais
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="ec-layout">
    <div class="ec-main">

        <section class="ec-404">
            <span class="ec-404__code">404</span>
            <h1 class="ec-404__title">Essa página saiu da estante</h1>
            <p class="ec-404__lead">
                O endereço não corresponde a nenhum texto publicado. Pode ter sido movido, ou o link veio com erro de digitação. Você ainda pode achar o que veio buscar pelo menu, pelas leituras em destaque ou pela busca abaixo.
            </p>

            <form role="search" method="get" class="ec-404__search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                <label for="ec-404-s" class="ec-404__sr">Buscar no portal</label>
                <input id="ec-404-s" type="search" name="s" placeholder="Digite um termo: livro, marketing, curso..." value="">
                <button type="submit" class="ec-btn">Buscar</button>
            </form>

            <div class="ec-404__suggestions">
                <h2>Leituras populares</h2>
                <ul>
                    <?php
                    $sug = ec_query_for_section( array(
                        'posts_per_page' => 12,
                        'orderby'        => 'comment_count',
                        'order'          => 'DESC',
                    ) );
                    $count = 0;
                    while ( $sug->have_posts() ) {
                        $sug->the_post();
                        if ( ! has_post_thumbnail() ) { continue; }
                        if ( $count >= 5 ) { break; }
                        echo '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
                        $count++;
                    }
                    wp_reset_postdata();
                    ?>
                </ul>
            </div>
        </section>

    </div>

    <aside class="ec-sidebar" role="complementary">
        <div class="ec-widget">
            <h4>Categorias</h4>
            <ul>
                <?php
                $cs = get_categories( array(
                    'orderby'    => 'count',
                    'order'      => 'DESC',
                    'number'     => 6,
                    'hide_empty' => true,
                ) );
                foreach ( $cs as $c ) {
                    echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                }
                ?>
            </ul>
        </div>
    </aside>
</div>

<style>
.ec-404 { padding: var(--ec-sp-7) 0; max-width: 60ch; }
.ec-404__code { display: block; font-size: clamp(80px, 16vw, 160px); font-weight: 800; line-height: 1; color: var(--ec-primary); letter-spacing: -0.04em; font-family: var(--ec-mono); margin-bottom: var(--ec-sp-4); -webkit-text-stroke: 2px var(--ec-secondary); }
.ec-404__title { font-size: clamp(24px, 3.5vw, 36px); margin: 0 0 var(--ec-sp-3); }
.ec-404__lead { font-size: 17px; color: var(--ec-muted); line-height: 1.65; margin: 0 0 var(--ec-sp-5); }
.ec-404__search { display: flex; gap: 10px; margin: 0 0 var(--ec-sp-6); flex-wrap: wrap; }
.ec-404__search input[type=search] { flex: 1; min-width: 220px; }
.ec-404__sr { position: absolute; left: -9999px; }
.ec-404__suggestions h2 { font-size: 14px; letter-spacing: 0.16em; font-family: var(--ec-mono); color: var(--ec-secondary); border-bottom: 2px solid var(--ec-secondary); padding-bottom: 8px; margin-bottom: var(--ec-sp-3); }
.ec-404__suggestions ul { list-style: none; padding: 0; margin: 0; }
.ec-404__suggestions li { padding: 10px 0; border-bottom: 1px dashed var(--ec-line); font-size: 15px; }
.ec-404__suggestions a { color: var(--ec-ink); }
.ec-404__suggestions a:hover { color: var(--ec-primary); }
</style>

<?php
get_footer();
