<?php
/** Header H5 — Magazine Masthead (menu acima do logo, search visível inline, sticky). */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="profile" href="https://gmpg.org/xfn/11">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=IBM+Plex+Sans:<<REMOVIDO>>;500;600;700;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=IBM+Plex+Sans:<<REMOVIDO>>;500;600;700;800&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=IBM+Plex+Sans:<<REMOVIDO>>;500;600;700;800&display=swap"></noscript>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="ic-header" role="banner">
    <!-- Top bar: data + menu -->
    <div class="ic-header__top">
        <div class="ic-container">
            <div class="ic-header__top-row">
                <span class="ic-header__date"><?php echo esc_html( ucfirst( wp_date( 'l, j \\d\\e F \\d\\e Y' ) ) ); ?></span>
                <?php if ( has_nav_menu( 'primary' ) ) :
                    wp_nav_menu( array(
                        'theme_location' => 'primary',
                        'container'      => false,
                        'menu_class'     => 'ic-nav',
                        'fallback_cb'    => false,
                        'depth'          => 1,
                    ) );
                else : ?>
                    <ul class="ic-nav">
                        <?php
                        $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 6, 'hide_empty' => true, 'exclude' => ic_excluded_lang_cat_ids() ) );
                        foreach ( $cats as $c ) {
                            echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                        }
                        ?>
                    </ul>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Masthead: brand + search -->
    <div class="ic-container">
        <div class="ic-header__masthead">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="ic-header__brand" aria-label="<?php bloginfo( 'name' ); ?>">
                <?php echo esc_html( get_bloginfo( 'name' ) ); ?><span class="ic-brand__dot">.</span>
            </a>
            <form role="search" method="get" class="ic-header__search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                <input type="search" name="s" placeholder="Buscar matérias, famosos, programas…" aria-label="Buscar">
                <button type="submit" aria-label="Buscar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                </button>
            </form>
        </div>
    </div>
</header>

<?php
// Breaking strip — tab_filter. Mostra "Em alta", "Recentes", "Mais lidos".
$tabs = array(
    'em-alta'    => array( 'orderby' => 'rand',           'label' => 'Em alta' ),
    'recentes'   => array( 'orderby' => 'date',           'label' => 'Recentes',   'order' => 'DESC' ),
    'mais-lidos' => array( 'orderby' => 'comment_count',  'label' => 'Mais lidos', 'order' => 'DESC' ),
);
?>
<div class="ic-breaking">
    <div class="ic-container">
        <div class="ic-breaking__inner">
            <span class="ic-breaking__label">Agora</span>
            <div class="ic-breaking__tabs" role="tablist" aria-label="Filtros de manchetes">
                <?php $first = true; foreach ( $tabs as $key => $args ) : ?>
                    <button type="button"
                            role="tab"
                            id="ic-tab-<?php echo esc_attr( $key ); ?>"
                            aria-controls="ic-pane-<?php echo esc_attr( $key ); ?>"
                            aria-selected="<?php echo $first ? 'true' : 'false'; ?>"
                            tabindex="<?php echo $first ? '0' : '-1'; ?>"
                            class="<?php echo $first ? 'is-active' : ''; ?>"
                            data-tab="<?php echo esc_attr( $key ); ?>">
                        <?php echo esc_html( $args['label'] ); ?>
                    </button>
                <?php $first = false; endforeach; ?>
            </div>
            <div class="ic-breaking__items">
                <?php $first = true; foreach ( $tabs as $key => $args ) :
                    $q_args = array_intersect_key( $args, array_flip( array( 'orderby', 'order' ) ) );
                    $q = ic_query_for_section( array_merge( array( 'posts_per_page' => 12 ), $q_args ) );
                    ?>
                    <div class="ic-breaking__pane <?php echo $first ? 'is-active' : ''; ?>"
                         id="ic-pane-<?php echo esc_attr( $key ); ?>"
                         role="tabpanel"
                         aria-labelledby="ic-tab-<?php echo esc_attr( $key ); ?>"
                         data-pane="<?php echo esc_attr( $key ); ?>"
                         <?php echo $first ? '' : 'hidden'; ?>>
                        <?php $bs = 0; while ( $q->have_posts() ) : $q->the_post();
                            if ( ! has_post_thumbnail() ) { continue; }
                            if ( $bs >= 5 ) { break; }
                            $bs++; ?>
                            <span class="ic-breaking__item"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></span>
                        <?php endwhile; wp_reset_postdata(); ?>
                    </div>
                <?php $first = false; endforeach; ?>
            </div>
        </div>
    </div>
</div>

<main id="content" class="ic-main">
    <div class="ic-container">
