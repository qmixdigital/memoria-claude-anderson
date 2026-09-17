<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
?>
<article class="cc__card cc__card--reversed">
    <a class="cc__card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
        <?php the_post_thumbnail( 'large', array( 'alt' => '', 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
    </a>
    <div class="cc__card__body">
        <?php
        $cats = get_the_category();
        if ( ! empty( $cats ) ) {
            echo '<span class="cc__card__cat"><a href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( strtolower( $cats[0]->name ) ) . '</a></span>';
        }
        ?>
        <h2 class="cc__card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <p class="cc__card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28, '…' ) ); ?></p>
        <p class="cc__card__meta">por <?php the_author(); ?> · <?php echo esc_html( cc_post_date() ); ?></p>
    </div>
</article>
