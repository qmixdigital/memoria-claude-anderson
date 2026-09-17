<?php
/**
 * Câmera Cotidiana — single (archetype IV: sidebar_rich).
 * Byline: above_title. Share: inline_after_first_para. In-article ads: every_5_paras.
 * Author bio: NONE. Related: vertical_list_5. Comments: lazy_native.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="cc__shell">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

<article class="cc__post" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

    <nav class="cc__breadcrumb" aria-label="Localização">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
        <?php
        $bc = get_the_category();
        if ( ! empty( $bc ) ) {
            echo '<span class="cc__breadcrumb__sep" aria-hidden="true"></span>';
            echo '<a href="' . esc_url( get_category_link( $bc[0] ) ) . '">' . esc_html( strtolower( $bc[0]->name ) ) . '</a>';
        }
        echo '<span class="cc__breadcrumb__sep" aria-hidden="true"></span>';
        echo '<span>' . esc_html( strtolower( wp_trim_words( get_the_title(), 8, '…' ) ) ) . '</span>';
        ?>
    </nav>

    <header class="cc__post__head">
        <p class="cc__post__byline">
            por <strong><?php the_author(); ?></strong>
            <span aria-hidden="true">·</span>
            <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( wp_date( 'j \\d\\e F \\d\\e Y' ) ); ?></time>
            <?php
            $reading = cc_reading_time();
            if ( $reading ) :
            ?>
                <span aria-hidden="true">·</span>
                <span><?php echo esc_html( $reading ); ?></span>
            <?php endif; ?>
        </p>

        <?php
        $cats = get_the_category();
        if ( ! empty( $cats ) ) {
            echo '<a class="cc__post__kicker" href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( strtolower( $cats[0]->name ) ) . '</a>';
        }
        ?>

        <h1 class="cc__post__title"><?php the_title(); ?></h1>

        <?php if ( has_excerpt() ) : ?>
            <p class="cc__post__lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
        <?php endif; ?>
    </header>

    <?php if ( has_post_thumbnail() ) : ?>
        <figure class="cc__post__cover">
            <?php the_post_thumbnail( 'large', array( 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
            <?php
            $cap = get_the_post_thumbnail_caption();
            if ( $cap ) :
            ?>
                <figcaption><?php echo esc_html( $cap ); ?></figcaption>
            <?php endif; ?>
        </figure>
    <?php endif; ?>

    <div class="cc__post__body cc__prose">
        <?php
        $content = apply_filters( 'the_content', get_the_content() );
        $content = str_replace( ']]>', ']]&gt;', $content );
        cc_render_with_inline_extras( $content, get_the_ID() );
        ?>
    </div>

    <?php
    $tags = get_the_tags();
    if ( ! empty( $tags ) ) :
    ?>
    <div class="cc__post__tags">
        <span class="cc__post__tags-label">tags</span>
        <?php foreach ( $tags as $t ) : ?>
            <a href="<?php echo esc_url( get_tag_link( $t ) ); ?>" class="cc__post__tag"><?php echo esc_html( strtolower( $t->name ) ); ?></a>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php
    // Related: vertical_list_5
    $related = cc_related_posts( get_the_ID(), 5 );
    if ( ! empty( $related ) ) :
    ?>
    <section class="cc__post__related" aria-label="Relacionados">
        <h3>› continuar lendo</h3>
        <ol class="cc__post__related-list">
            <?php
            $rn = 0;
            foreach ( $related as $rid ) :
                $rn++;
            ?>
            <li>
                <span class="cc__post__related-num">0<?php echo (int) $rn; ?></span>
                <div class="cc__post__related-body">
                    <?php
                    $rcat = get_the_category( $rid );
                    if ( ! empty( $rcat ) ) {
                        echo '<span class="cc__post__related-cat">' . esc_html( strtolower( $rcat[0]->name ) ) . '</span>';
                    }
                    ?>
                    <h4>
                        <a href="<?php echo esc_url( get_permalink( $rid ) ); ?>"><?php echo esc_html( get_the_title( $rid ) ); ?></a>
                    </h4>
                </div>
            </li>
            <?php endforeach; ?>
        </ol>
    </section>
    <?php endif; ?>

    <?php
    // Comments: lazy_native — só exibe se tem comentários ou se estão abertos
    if ( comments_open() || get_comments_number() ) :
    ?>
    <section class="cc__post__comments" aria-label="Comentários">
        <h3>› notas dos leitores</h3>
        <?php comments_template(); ?>
    </section>
    <?php endif; ?>

</article>

<?php endwhile; endif; ?>
</div>

<?php
get_footer();
