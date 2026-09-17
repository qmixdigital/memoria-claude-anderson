<?php
/**
 * EUVO News, matéria. Arquetipo IV, duas colunas com sidebar ativa.
 *
 * Roll: single=IV_sidebar_rich | typography=magazine_serif | featured=boxed_max_width
 *       meta=tech_blog (data, tempo de leitura, editoria) | author_bio=none
 *       share=inline_after_first_para | related=grid_6 | comments=disabled
 *       breadcrumb=chevron_icons | social=inline_in_post_meta
 *
 * Sem blocos de anuncio: o portal nao roda AdSense. Quando rodar, o ponto de
 * insercao e o mesmo filtro que injeta o compartilhar.
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();

while ( have_posts() ) :
    the_post();

    $ev_id  = get_the_ID();
    $ev_cat = ev_first_cat( $ev_id );
    ?>

<div class="ev-wrap">
    <div class="ev-layout ev-layout--post">

        <main class="ev-main" id="ev-conteudo">
            <article <?php post_class( 'ev-post' ); ?> id="post-<?php echo (int) $ev_id; ?>">

                <?php ev_crumbs(); ?>

                <header class="ev-post__head">
                    <?php if ( $ev_cat ) : ?>
                        <a class="ev-post__cat" href="<?php echo esc_url( get_category_link( $ev_cat->term_id ) ); ?>"><?php echo esc_html( $ev_cat->name ); ?></a>
                    <?php endif; ?>

                    <h1 class="ev-post__t"><?php the_title(); ?></h1>

                    <?php if ( has_excerpt() ) : ?>
                        <p class="ev-post__deck"><?php echo esc_html( get_the_excerpt() ); ?></p>
                    <?php endif; ?>

                    <?php // meta=tech_blog: data, tempo de leitura, editoria. Sem autor. ?>
                    <div class="ev-post__meta">
                        <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( ev_when( $ev_id ) ); ?></time>
                        <span class="ev-post__dot" aria-hidden="true">&middot;</span>
                        <span><?php echo esc_html( ev_read_time( $ev_id ) ); ?></span>
                        <?php if ( get_the_modified_time( 'U' ) > get_the_time( 'U' ) + DAY_IN_SECONDS ) : ?>
                            <span class="ev-post__dot" aria-hidden="true">&middot;</span>
                            <span>Atualizada em <?php echo esc_html( get_the_modified_date( 'j \d\e F \d\e Y' ) ); ?></span>
                        <?php endif; ?>
                    </div>
                </header>

                <?php // featured_image_treatment=boxed_max_width ?>
                <?php if ( has_post_thumbnail() ) : ?>
                    <figure class="ev-post__fig">
                        <?php
                        the_post_thumbnail(
                            'ev-hero',
                            array(
                                'alt'           => the_title_attribute( array( 'echo' => false ) ),
                                'fetchpriority' => 'high',
                                'decoding'      => 'async',
                            )
                        );
                        ?>
                        <?php if ( get_the_post_thumbnail_caption() ) : ?>
                            <figcaption><?php echo esc_html( get_the_post_thumbnail_caption() ); ?></figcaption>
                        <?php endif; ?>
                    </figure>
                <?php endif; ?>

                <div class="ev-post__body">
                    <?php the_content(); ?>
                </div>

                <?php
                $ev_tags = get_the_tags( $ev_id );
                if ( $ev_tags && ! is_wp_error( $ev_tags ) ) :
                    ?>
                    <div class="ev-post__tags">
                        <h2 class="ev-sr">Assuntos desta matéria</h2>
                        <div class="ev-tags">
                            <?php foreach ( $ev_tags as $ev_tag ) : ?>
                                <a href="<?php echo esc_url( get_tag_link( $ev_tag->term_id ) ); ?>"><?php echo esc_html( $ev_tag->name ); ?></a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>

                <?php
                /*
                 * Assinatura da matéria.
                 *
                 * O roll dizia author_bio_box=none, mas o operador pediu a
                 * seção: pedido do operador vem antes do roll.
                 *
                 * Sem link para o arquivo do autor de proposito. O mu-plugin
                 * author-privacy.php manda is_author() para a home com 301, a
                 * rede tira o autor do sitemap e fecha /wp/v2/users. Linkar
                 * para la seria mandar o leitor (e o Google) num redirecionamento.
                 * Quem quiser saber quem assina vai para /equipe/, que existe
                 * e responde 200.
                 */
                $ev_autor_id = (int) get_post_field( 'post_author', $ev_id );
                $ev_autor    = get_the_author_meta( 'display_name', $ev_autor_id );
                $ev_bio      = get_the_author_meta( 'description', $ev_autor_id );

                if ( $ev_autor ) :
                    ?>
                    <aside class="ev-author" aria-label="Quem assina esta matéria">
                        <div class="ev-author__pic">
                            <?php echo get_avatar( $ev_autor_id, 112, '', esc_attr( $ev_autor ) ); ?>
                        </div>

                        <div class="ev-author__body">
                            <span class="ev-author__kicker">Assinado por</span>
                            <p class="ev-author__name"><?php echo esc_html( $ev_autor ); ?></p>

                            <?php if ( $ev_bio ) : ?>
                                <p class="ev-author__bio"><?php echo esc_html( $ev_bio ); ?></p>
                            <?php endif; ?>

                            <a class="ev-author__link" href="<?php echo esc_url( home_url( '/equipe/' ) ); ?>">Conheça a equipe do EUVO News</a>
                        </div>
                    </aside>
                <?php endif; ?>

            </article>
        </main>

        <aside class="ev-aside" aria-label="Destaques e serviços">

            <?php
            $ev_lidos = ev_most_read_ids( 5, array( $ev_id ) );
            if ( ! empty( $ev_lidos ) ) :
                ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Mais Lidos</h2>
                    <ol class="ev-rank">
                        <?php
                        $ev_pos = 1;
                        foreach ( $ev_lidos as $ev_lid ) :
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

            <?php if ( $ev_cat ) : ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Mais de <?php echo esc_html( $ev_cat->name ); ?></h2>
                    <?php
                    $ev_mais = get_posts(
                        array(
                            'post_type'           => 'post',
                            'post_status'         => 'publish',
                            'posts_per_page'      => 4,
                            'cat'                 => $ev_cat->term_id,
                            'post__not_in'        => array_merge( array( $ev_id ), $ev_lidos ),
                            'ignore_sticky_posts' => true,
                            'no_found_rows'       => true,
                            'fields'              => 'ids',
                        )
                    );

                    global $post;
                    $ev_keep = $post;
                    foreach ( $ev_mais as $ev_mid ) {
                        $post = get_post( $ev_mid );
                        setup_postdata( $post );
                        ev_card_any( 'sm' );
                    }
                    $post = $ev_keep;
                    wp_reset_postdata();
                    ?>
                </section>
            <?php endif; ?>

            <?php if ( is_active_sidebar( 'ev-aside' ) ) : ?>
                <?php dynamic_sidebar( 'ev-aside' ); ?>
            <?php endif; ?>

        </aside>

    </div>

    <?php // related_posts_layout=grid_6 ?>
    <?php
    $ev_rel = ev_related_ids( $ev_id, 6 );
    if ( ! empty( $ev_rel ) ) :
        ?>
        <section class="ev-section ev-rel" aria-labelledby="ev-h-rel">
            <div class="ev-section__h">
                <h2 id="ev-h-rel">Leia Também</h2>
            </div>

            <div class="ev-grid-3">
                <?php
                /*
                 * O global $post precisa ser trocado de verdade. setup_postdata()
                 * numa variavel local nao mexe em $GLOBALS['post'], e o card
                 * acabaria imprimindo a própria matéria seis vezes.
                 *
                 * ev_card_any e nao ev_card: relacionado nao filtra por imagem,
                 * e nesse acervo a maioria das matérias nao tem capa.
                 */
                global $post;
                $ev_keep = $post;

                foreach ( $ev_rel as $ev_rid ) {
                    $post = get_post( $ev_rid );
                    setup_postdata( $post );
                    ev_card_any( 'default' );
                }

                $post = $ev_keep;
                wp_reset_postdata();
                ?>
            </div>
        </section>
    <?php endif; ?>

</div>

    <?php
    ev_article_schema( $ev_id );

endwhile;

get_footer();
