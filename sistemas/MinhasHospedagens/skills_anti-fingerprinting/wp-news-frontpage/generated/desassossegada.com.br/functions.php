<?php
// Desassossegada - functions.php
// Parent: Blocksy. Front-page archetype E (topical hub). Single III tabloid. Archive gamma.
// Visual: P20 palette + F06 Oswald/Source Serif 4 + tight spacing + friendly radius + bold shadow.

if ( ! defined( 'ABSPATH' ) ) { exit; }

// ===== Enqueues (parent + child + home/single CSS + Google Fonts) =====
add_action( 'wp_enqueue_scripts', function () {
  // Drop Blocksy auto-load of child style.css to avoid duplicate request
  wp_dequeue_style( 'blocksy-child-styles' );
  wp_deregister_style( 'blocksy-child-styles' );

  wp_enqueue_style( 'dsg-parent', get_template_directory_uri() . '/style.css' );

  $abs = get_stylesheet_directory() . '/style.css';
  $ver = file_exists( $abs ) ? filemtime( $abs ) : '1';
  wp_enqueue_style( 'dsg-child', get_stylesheet_directory_uri() . '/style.css', array( 'dsg-parent' ), $ver );

  if ( is_front_page() || is_home() ) {
    $hcss = get_stylesheet_directory() . '/assets/css/home.css';
    if ( file_exists( $hcss ) ) {
      wp_enqueue_style( 'dsg-home', get_stylesheet_directory_uri() . '/assets/css/home.css', array( 'dsg-child' ), filemtime( $hcss ) );
    }
  }
  if ( is_singular( 'post' ) ) {
    $scss = get_stylesheet_directory() . '/assets/css/single.css';
    if ( file_exists( $scss ) ) {
      wp_enqueue_style( 'dsg-single', get_stylesheet_directory_uri() . '/assets/css/single.css', array( 'dsg-child' ), filemtime( $scss ) );
    }
  }

  // Editorial magazine: Fraunces (display serif variavel) + DM Sans (body geometric)
  wp_enqueue_style( 'dsg-fonts',
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400..700,30..100,0..1;1,9..144,400..700,30..100,0..1&family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&display=swap',
    array(), null );
}, 100 );

// Preconnect for Google Fonts (saves ~80ms)
add_action( 'wp_head', function () {
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

// Cache-bust filter as backup against LiteSpeed dropping ?ver=
function dsg_cache_bust_asset( $src, $handle ) {
  if ( strpos( $src, get_stylesheet_directory_uri() ) === false ) { return $src; }
  $path = str_replace( get_stylesheet_directory_uri(), get_stylesheet_directory(), strtok( $src, '?' ) );
  if ( file_exists( $path ) ) {
    $src = strtok( $src, '?' ) . '?v=' . filemtime( $path );
  }
  return $src;
}
add_filter( 'style_loader_src',  'dsg_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'dsg_cache_bust_asset', 9999, 2 );

// ===== Theme support =====
add_action( 'after_setup_theme', function () {
  add_theme_support( 'post-thumbnails' );
  add_theme_support( 'title-tag' );
  add_theme_support( 'html5', array( 'caption', 'comment-form', 'comment-list', 'gallery', 'search-form' ) );
  add_theme_support( 'automatic-feed-links' );
  register_nav_menus( array(
    'primary' => 'Menu principal',
    'footer'  => 'Menu rodapé',
  ) );
  add_image_size( 'dsg-hero', 1200, 800, true );
  add_image_size( 'dsg-card', 600, 450, true );
} );

// ===== Sidebar =====
add_action( 'widgets_init', function () {
  register_sidebar( array(
    'name'          => 'Sidebar Principal',
    'id'            => 'sidebar-1',
    'before_widget' => '<div id="%1$s" class="dsg-widget %2$s">',
    'after_widget'  => '</div>',
    'before_title'  => '<h4>',
    'after_title'   => '</h4>',
  ) );
} );

// ===== Helpers =====
require_once get_stylesheet_directory() . '/inc/helpers.php';

// ===== Front-page archetype E: hide WP default homepage settings interference =====
add_action( 'wp', function () {
  if ( is_front_page() ) {
    remove_all_actions( 'blocksy:hero:before' );
    remove_all_actions( 'blocksy:hero:after' );
  }
} );
add_filter( 'blocksy:single:has-content-wrapper', '__return_false' );

// ===== pre_get_posts: posts_per_archive=8 + exclusao multilingue na home =====
add_action( 'pre_get_posts', function ( $query ) {
  if ( is_admin() || ! $query->is_main_query() ) { return; }
  if ( $query->is_archive() && ! $query->is_search() ) {
    $query->set( 'posts_per_page', 8 );
  }
  if ( $query->is_home() || $query->is_front_page() ) {
    if ( function_exists( 'dsg_excluded_lang_cat_ids' ) ) {
      $neg = array_map( function ( $id ) { return - (int) $id; }, dsg_excluded_lang_cat_ids() );
      if ( $neg ) { $query->set( 'cat', implode( ',', $neg ) ); }
    }
  }
} );

// ===== Body class =====
add_filter( 'body_class', function ( $classes ) {
  $classes[] = 'dsg-body';
  return $classes;
} );

// ===== Disable lazy-loading on the front-page (regra #3) =====
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
  if ( is_front_page() || is_home() ) { return false; }
  return $default;
}, 10, 3 );

// Avatars: sempre eager + data-no-lazy (LiteSpeed/PrettyURL respeita)
add_filter( 'get_avatar', function ( $avatar ) {
  $avatar = str_replace( array( "loading='lazy'", 'loading="lazy"' ), 'loading="eager" data-no-lazy="1"', $avatar );
  if ( strpos( $avatar, 'data-no-lazy' ) === false ) {
    $avatar = preg_replace( '/<img\s/', '<img data-no-lazy="1" ', $avatar, 1 );
  }
  return $avatar;
} );
add_filter( 'litespeed_optm_lazyload_img_excludes', function ( $excludes ) {
  $excludes[] = '/wp-content/litespeed/avatar/';
  $excludes[] = 'secure.gravatar.com';
  $excludes[] = 'class=\'avatar';
  $excludes[] = 'class="avatar';
  return $excludes;
} );
add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
  if ( is_front_page() || is_home() ) {
    $attr['loading']  = 'eager';
    $attr['decoding'] = 'async';
  }
  return $attr;
}, 99 );

// ===== Bunyad/SmartMag shims (legacy posts importados) =====
add_action( 'init', function () {
  add_shortcode( 'bunyad_dropcap', function ( $atts, $content = '' ) {
    return '<span class="dsg-dropcap">' . esc_html( wp_strip_all_tags( $content ) ) . '</span>';
  } );
  add_shortcode( 'bunyad_pullquote', function ( $atts, $content = '' ) {
    return '<blockquote class="dsg-pullquote">' . wp_kses_post( $content ) . '</blockquote>';
  } );
  add_shortcode( 'bunyad_quote', function ( $atts, $content = '' ) {
    return '<blockquote>' . wp_kses_post( $content ) . '</blockquote>';
  } );
  add_shortcode( 'bunyad_button', function ( $atts, $content = '' ) {
    $atts = shortcode_atts( array( 'url' => '#', 'target' => '_self' ), $atts );
    return '<a class="dsg-btn" href="' . esc_url( $atts['url'] ) . '" target="' . esc_attr( $atts['target'] ) . '">' . esc_html( wp_strip_all_tags( $content ) ) . '</a>';
  } );
  add_shortcode( 'bunyad_alert', function ( $atts, $content = '' ) {
    return '<div class="dsg-alert">' . wp_kses_post( $content ) . '</div>';
  } );
  add_shortcode( 'bunyad_divider', function () { return '<hr>'; } );
} );

// ===== Enxugar WordPress core (regra #12) =====
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
add_filter( 'tiny_mce_plugins', function ( $p ) {
  return is_array( $p ) ? array_diff( $p, array( 'wpemoji' ) ) : $p;
} );
add_filter( 'emoji_svg_url', '__return_false' );
add_action( 'wp_default_scripts', function ( $scripts ) {
  if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
    $jq = $scripts->registered['jquery'];
    if ( $jq->deps ) { $jq->deps = array_diff( $jq->deps, array( 'jquery-migrate' ) ); }
  }
} );
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );
remove_action( 'rest_api_init', 'wp_oembed_register_route' );
add_filter( 'embed_oembed_discover', '__return_false' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
remove_action( 'wp_head', 'feed_links_extra', 3 );
add_action( 'wp_enqueue_scripts', function () {
  if ( ! is_user_logged_in() ) {
    wp_dequeue_style( 'dashicons' );
    wp_deregister_style( 'dashicons' );
  }
}, 200 );
add_action( 'wp_enqueue_scripts', function () {
  foreach ( array(
    'wp-block-library', 'wp-block-library-theme', 'wc-block-style',
    'classic-theme-styles', 'global-styles', 'wp-img-auto-sizes-contain',
  ) as $h ) { wp_dequeue_style( $h ); }
}, 200 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

// ===== SEO complementares =====
// RankMath ja gera: og:type, og:title, og:description, og:image, twitter:card, canonical,
//                   Article/BlogPosting/BreadcrumbList/Person/Organization/WebSite JSON-LD.
// Nos complementamos com os campos que RankMath nao cobre por padrao em portais editoriais:
//   - WebSite SearchAction schema (somente se RankMath ainda nao injetou)
//   - og:article:author, og:article:section, og:article:tag, og:article:published_time, og:article:modified_time
add_action( 'wp_head', function () {
  $rank_math_active = function_exists( 'rank_math_the_breadcrumbs' ) || class_exists( 'RankMath\\Helper' );

  if ( ( is_front_page() || is_home() ) && ! $rank_math_active ) {
    $schema = array(
      '@context'    => 'https://schema.org',
      '@type'       => 'WebSite',
      'name'        => get_bloginfo( 'name' ),
      'url'         => home_url( '/' ),
      'inLanguage'  => 'pt-BR',
      'potentialAction' => array(
        '@type'       => 'SearchAction',
        'target'      => array(
          '@type'       => 'EntryPoint',
          'urlTemplate' => home_url( '/?s={search_term_string}' ),
        ),
        'query-input' => 'required name=search_term_string',
      ),
    );
    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
  }

  if ( is_singular( 'post' ) ) {
    $post_id   = get_the_ID();
    $author_id = (int) get_post_field( 'post_author', $post_id );
    $author    = get_the_author_meta( 'display_name', $author_id );
    $author_url = get_author_posts_url( $author_id );
    $published = get_the_date( 'c', $post_id );
    $modified  = get_the_modified_date( 'c', $post_id );
    $cats      = get_the_category( $post_id );
    $tags      = get_the_tags( $post_id );

    // RankMath ja injeta article:published_time, article:modified_time, article:section.
    // Complementamos apenas com o que RankMath nao cobre: author (name+URL), article:tag, twitter:creator.
    if ( $author ) {
      echo '<meta name="author" content="' . esc_attr( $author ) . '" />' . "\n";
      echo '<meta property="article:author" content="' . esc_attr( $author_url ) . '" />' . "\n";
    }
    if ( $tags && ! is_wp_error( $tags ) ) {
      foreach ( $tags as $t ) {
        echo '<meta property="article:tag" content="' . esc_attr( $t->name ) . '" />' . "\n";
      }
    }
    // Twitter author handle: tenta meta do user, senao usa display_name
    $tw = get_the_author_meta( 'twitter', $author_id );
    if ( $tw ) {
      $tw = '@' . ltrim( $tw, '@' );
      echo '<meta name="twitter:creator" content="' . esc_attr( $tw ) . '" />' . "\n";
    }

    // NewsArticle JSON-LD complementar — injeta SO se RankMath nao estiver ativo
    if ( ! $rank_math_active ) {
      $img = get_the_post_thumbnail_url( $post_id, 'full' );
      $schema = array(
        '@context'      => 'https://schema.org',
        '@type'         => 'NewsArticle',
        'headline'      => get_the_title(),
        'datePublished' => $published,
        'dateModified'  => $modified,
        'author'        => array(
          '@type' => 'Person',
          'name'  => $author,
          'url'   => $author_url,
        ),
        'image'         => $img ? array( $img ) : array(),
        'mainEntityOfPage' => array( '@type' => 'WebPage', '@id' => get_permalink() ),
        'articleSection' => $cats ? $cats[0]->name : '',
        'keywords'       => $tags && ! is_wp_error( $tags ) ? wp_list_pluck( $tags, 'name' ) : array(),
        'publisher'     => array(
          '@type' => 'Organization',
          'name'  => get_bloginfo( 'name' ),
          'logo'  => array(
            '@type' => 'ImageObject',
            'url'   => 'https://desassossegada.com.br/wp-content/uploads/2024/11/desassossegada-logo-600-x-120-px.png',
            'width' => 600, 'height' => 120,
          ),
        ),
      );
      echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
    }
  }
}, 20 );

/* ===================================================================
   OIE Link Audit WP-CLI command (regra #14)
   wp oie audit-links --domain=alvo.com [--remove] [--dry-run] [--json]
   =================================================================== */
if ( defined( 'WP_CLI' ) && WP_CLI ) {

  class OIE_Link_Audit_Command {

    public function audit_links( $args, $assoc_args ) {
      global $wpdb;

      $domains_raw = isset( $assoc_args['domain'] ) ? $assoc_args['domain'] : '';
      if ( empty( $domains_raw ) ) {
        WP_CLI::error( 'Especifique --domain=alvo.com' );
      }
      $domains = array_filter( array_map( 'trim', explode( ',', $domains_raw ) ) );
      $domains = array_map( function ( $d ) {
        $d = preg_replace( '#^https?://#i', '', $d );
        return preg_replace( '#^www\.#i', '', strtolower( $d ) );
      }, $domains );

      $remove      = ! empty( $assoc_args['remove'] );
      $dry_run     = ! empty( $assoc_args['dry-run'] );
      $as_json     = ! empty( $assoc_args['json'] );
      $replacement = isset( $assoc_args['replacement'] ) ? $assoc_args['replacement'] : 'text';
      $post_status = isset( $assoc_args['post_status'] ) ? $assoc_args['post_status'] : 'publish';

      $like_parts = array();
      $params = array();
      foreach ( $domains as $d ) {
        $like_parts[] = "post_content LIKE %s";
        $params[] = '%' . $wpdb->esc_like( $d ) . '%';
      }
      $status_in = ( $post_status === 'any' )
        ? "post_status IN ('publish','draft','pending','future','private')"
        : $wpdb->prepare( "post_status = %s", $post_status );

      $sql = "SELECT ID, post_title, post_content FROM {$wpdb->posts}
              WHERE post_type = 'post' AND {$status_in} AND ( " . implode( ' OR ', $like_parts ) . " )";
      $rows = $wpdb->get_results( $wpdb->prepare( $sql, $params ) );

      $matches = array();
      $total_links = 0;
      $total_removed = 0;

      foreach ( $rows as $row ) {
        $found = $this->find_links_to_domains( $row->post_content, $domains );
        if ( empty( $found ) ) { continue; }
        $total_links += count( $found );
        $entry = array(
          'ID'    => (int) $row->ID,
          'title' => $row->post_title,
          'url'   => get_permalink( $row->ID ),
          'links' => $found,
        );
        if ( $remove ) {
          $new_content = $this->mutate_content( $row->post_content, $domains, $replacement );
          $changed = ( $new_content !== $row->post_content );
          $entry['removed'] = $changed;
          if ( $changed && ! $dry_run ) {
            update_post_meta( $row->ID, 'oie_link_removed_' . time(), $row->post_content );
            $wpdb->update( $wpdb->posts, array( 'post_content' => $new_content ), array( 'ID' => $row->ID ) );
            clean_post_cache( $row->ID );
            $total_removed += count( $found );
          }
        }
        $matches[] = $entry;
      }

      $report = array(
        'site'     => home_url( '/' ),
        'domains'  => $domains,
        'matches'  => $matches,
        'total_posts_matched' => count( $matches ),
        'total_links_found'   => $total_links,
        'removed'  => $total_removed,
        'dry_run'  => (bool) $dry_run,
        'replacement' => $replacement,
      );

      if ( $as_json ) {
        WP_CLI::log( wp_json_encode( $report ) );
      } else {
        WP_CLI::log( sprintf( '%d posts com %d links em %s', count( $matches ), $total_links, implode( ',', $domains ) ) );
        foreach ( $matches as $m ) {
          WP_CLI::log( sprintf( '  [%d] %s -> %d link(s) %s', $m['ID'], $m['title'], count( $m['links'] ), $remove ? ( ! empty( $m['removed'] ) ? '[REMOVIDO]' : '[no-op]' ) : '' ) );
        }
      }
    }

    private function find_links_to_domains( $html, $domains ) {
      $found = array();
      if ( preg_match_all( '#<a\s[^>]*?\bhref\s*=\s*(["\'])(.*?)\1#i', $html, $m ) ) {
        foreach ( $m[2] as $href ) {
          $host = strtolower( (string) wp_parse_url( $href, PHP_URL_HOST ) );
          $host = preg_replace( '#^www\.#', '', $host );
          if ( ! $host ) { continue; }
          foreach ( $domains as $d ) {
            if ( $host === $d || str_ends_with( $host, '.' . $d ) ) {
              $found[] = $href; break;
            }
          }
        }
      }
      return array_values( array_unique( $found ) );
    }

    private function mutate_content( $html, $domains, $mode ) {
      return preg_replace_callback( '#<a\s([^>]*?)>(.*?)</a>#is', function ( $m ) use ( $domains, $mode ) {
        if ( ! preg_match( '#\bhref\s*=\s*(["\'])(.*?)\1#i', $m[1], $h ) ) { return $m[0]; }
        $host = strtolower( (string) wp_parse_url( $h[2], PHP_URL_HOST ) );
        $host = preg_replace( '#^www\.#', '', $host );
        $hit = false;
        foreach ( $domains as $d ) {
          if ( $host === $d || str_ends_with( $host, '.' . $d ) ) { $hit = true; break; }
        }
        if ( ! $hit ) { return $m[0]; }
        switch ( $mode ) {
          case 'nofollow':
            $attrs = preg_replace( '#\brel\s*=\s*(["\']).*?\1#i', '', $m[1] );
            return '<a ' . trim( $attrs ) . ' rel="nofollow noopener">' . $m[2] . '</a>';
          case 'placeholder':
            $attrs = preg_replace( '#\bhref\s*=\s*(["\']).*?\1#i', 'href="#"', $m[1] );
            return '<a ' . trim( $attrs ) . '>' . $m[2] . '</a>';
          case 'text':
          default:
            return $m[2];
        }
      }, $html );
    }
  }

  WP_CLI::add_command( 'oie', 'OIE_Link_Audit_Command' );
}
