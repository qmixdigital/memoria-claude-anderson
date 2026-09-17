<?php
/**
 * EUVO News, funcoes de apoio dos templates.
 *
 * Roll: classes=utility (prefixo ev-) | card=image_right | ratio=21x9 | date=relative
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Timestamp do arquivo para cache-bust, com fallback seguro.
 *
 * @since 1.0.0
 * @param string $abs Caminho absoluto.
 * @return string
 */
function ev_mtime( $abs ) {
    return file_exists( $abs ) ? (string) filemtime( $abs ) : '1';
}

/**
 * Categorias fora da capa.
 *
 * Alimenta todas as consultas da home (hero, faixa de abas, blocos de
 * editoria, últimas, mais lidos) e as listas de editoria do rodape, do menu
 * de emergencia, da busca e do 404.
 *
 * Como o corte e por category__not_in, uma matéria que esteja em Wellness sai
 * da capa mesmo que tambem esteja em outra editoria. E o comportamento pedido:
 * bloquear a categoria e as matérias dela.
 *
 * A página da própria editoria continua no ar e indexavel. Isto some da capa,
 * nao do site.
 *
 * 31 = Wellness (bloqueada em 15/07/2026 a pedido do operador).
 *
 * @since 1.0.0
 * @return array
 */
function ev_hidden_cats() {
    return array( 31 );
}

/**
 * Query padrao de qualquer bloco da capa.
 *
 * Camada 1 de 2 contra card quebrado: filtra _thumbnail_id no SQL.
 * EXISTS nao serve. Importadores (o Antonio, entre outros) deixam linhas de
 * _thumbnail_id com '' ou 0, e as duas passam por EXISTS. Por isso a
 * comparacao e numerica e maior que zero.
 *
 * Vale so para a capa. Arquivos, busca e relacionados nao filtram: eles
 * existem para mostrar todo post, com imagem ou sem.
 *
 * @since 1.0.0
 * @param array $args Sobrescritas de WP_Query.
 * @return WP_Query
 */
function ev_section_query( $args = array() ) {
    $base = array(
        'post_type'           => 'post',
        'post_status'         => 'publish',
        'posts_per_page'      => 5,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'category__not_in'    => ev_hidden_cats(),
        'meta_query'          => array(
            array(
                'key'     => '_thumbnail_id',
                'value'   => '0',
                'compare' => '>',
                'type'    => 'NUMERIC',
            ),
        ),
    );

    return new WP_Query( wp_parse_args( $args, $base ) );
}

/**
 * Coleta N ids que realmente tem imagem renderizavel.
 *
 * Usado nos blocos posicionais (1 destaque + resto), onde nao da para misturar
 * setup_postdata com continue no meio do laco.
 *
 * @since 1.0.0
 * @param int   $want Quantos ids sao necessarios.
 * @param array $args Sobrescritas de WP_Query.
 * @return array
 */
function ev_collect_ids( $want, $args = array() ) {
    $args['posts_per_page'] = $want * 3;
    $q                      = ev_section_query( $args );
    $ids                    = array();

    while ( $q->have_posts() ) {
        $q->the_post();
        if ( ! has_post_thumbnail() ) {
            continue;
        }
        $ids[] = get_the_ID();
        if ( count( $ids ) >= $want ) {
            break;
        }
    }
    wp_reset_postdata();

    return $ids;
}

/**
 * Ids das ultimas publicacoes, sem exigir imagem destacada.
 *
 * A faixa do topo e so texto: manchete e data, sem foto nenhuma. O filtro de
 * _thumbnail_id existe para o card nao renderizar moldura vazia, e ali nao
 * protege coisa alguma, so descarta 3 de cada 4 materias do acervo.
 *
 * Passar 0 em $cat traz o site inteiro, que e o que "ultimas publicacoes"
 * quer dizer.
 *
 * @since 1.0.0
 * @param int   $want Quantos ids.
 * @param int   $cat  Id da editoria, ou 0 para o site todo.
 * @param array $skip Ids a ignorar.
 * @return array
 */
function ev_latest_ids( $want, $cat = 0, $skip = array() ) {
    $args = array(
        'post_type'           => 'post',
        'post_status'         => 'publish',
        'posts_per_page'      => $want,
        'post__not_in'        => $skip,
        'category__not_in'    => ev_hidden_cats(),
        'ignore_sticky_posts' => true,
        'no_found_rows'       => true,
        'fields'              => 'ids',
        'orderby'             => 'date',
        'order'               => 'DESC',
    );

    if ( $cat ) {
        $args['cat'] = $cat;
    }

    return get_posts( $args );
}

/**
 * Editorias ordenadas pela publicacao mais recente, e nao pelo tamanho.
 *
 * As maiores por acervo sao justamente as paradas: Noticias Agora tem 1.603
 * materias e nao publica desde marco, Shows tem 990 e parou em setembro. Uma
 * faixa de ultimas noticias montada por tamanho abre com materia de meses
 * atras. Por atividade, ela abre pelo que a redacao publicou por ultimo.
 *
 * @since 1.0.0
 * @param int $quantas Quantas editorias.
 * @return array Lista de WP_Term.
 */
function ev_editorias_ativas( $quantas = 4 ) {
    $cats = get_categories(
        array(
            'orderby'    => 'count',
            'order'      => 'DESC',
            'number'     => 10,
            'hide_empty' => true,
            'exclude'    => ev_hidden_cats(),
        )
    );

    $com_data = array();
    foreach ( $cats as $cat ) {
        $ultimo = ev_latest_ids( 1, $cat->term_id );
        if ( empty( $ultimo ) ) {
            continue;
        }
        $com_data[] = array(
            'cat'  => $cat,
            'when' => (int) get_post_time( 'U', true, $ultimo[0] ),
        );
    }

    usort(
        $com_data,
        static function ( $a, $b ) {
            return $b['when'] - $a['when'];
        }
    );

    return array_column( array_slice( $com_data, 0, $quantas ), 'cat' );
}

/**
 * Chave de audiencia do portal.
 *
 * Vem do mu-plugin de estatisticas da plataforma, nao do tema. O Jannah
 * contava em tie_views, mas esse contador morre junto com o tema antigo.
 *
 * @since 1.0.0
 * @return string
 */
function ev_views_key() {
    return '<<REMOVIDO>>';
}

/**
 * Ids das matérias mais lidas.
 *
 * Nao passa por ev_section_query de proposito: wp_parse_args faz merge raso,
 * entao mandar um meta_query nos args apagaria o filtro de _thumbnail_id e a
 * lista voltaria a aceitar post sem capa. Aqui as duas clausulas sao montadas
 * juntas, com nome, para o orderby poder apontar para a de audiencia.
 *
 * @since 1.0.0
 * @param int   $want Quantos ids.
 * @param array $skip Ids a ignorar.
 * @return array
 */
function ev_most_read_ids( $want = 5, $skip = array() ) {
    $q = new WP_Query(
        array(
            'post_type'           => 'post',
            'post_status'         => 'publish',
            'posts_per_page'      => $want * 3,
            'post__not_in'        => $skip,
            'no_found_rows'       => true,
            'ignore_sticky_posts' => true,
            'category__not_in'    => ev_hidden_cats(),
            'meta_query'          => array(
                'thumb' => array(
                    'key'     => '_thumbnail_id',
                    'value'   => '0',
                    'compare' => '>',
                    'type'    => 'NUMERIC',
                ),
                'views' => array(
                    'key'     => ev_views_key(),
                    'compare' => 'EXISTS',
                    'type'    => 'NUMERIC',
                ),
            ),
            'orderby'             => array( 'views' => 'DESC' ),
        )
    );

    $ids = array();
    while ( $q->have_posts() ) {
        $q->the_post();
        if ( ! has_post_thumbnail() ) {
            continue;
        }
        $ids[] = get_the_ID();
        if ( count( $ids ) >= $want ) {
            break;
        }
    }
    wp_reset_postdata();

    return $ids;
}

/**
 * Data da matéria, num formato so.
 *
 * O roll pedia date_format=relative, e a primeira versao misturava: relativa
 * ate uma semana, absoluta depois. Num acervo onde quase tudo tem meses, isso
 * punha "ha 2 dias" ao lado de "16 de marco de 2026" na mesma faixa, e trocar
 * de aba trocava o formato. Le como bagunca, e foi o que o operador apontou.
 *
 * Agora e sempre absoluta. Uma regra so, em toda a capa e em toda matéria:
 * nada de adivinhar qual formato vai sair. Perde-se o "ha 2 horas" da matéria
 * quente, o que num acervo desta idade quase nunca se aplica.
 *
 * Desvio consciente do roll. date_format e variavel secundaria de fingerprint,
 * e o pedido do operador vem antes.
 *
 * @since 1.0.0
 * @param int|null $id Id do post, opcional.
 * @return string
 */
function ev_when( $id = null ) {
    $id = $id ? $id : get_the_ID();

    return get_the_date( 'j \d\e F \d\e Y', $id );
}

/**
 * Resumo limpo para hero e cards.
 *
 * Duas sujeiras vem do acervo importado e apareciam na capa:
 *
 * 1. HTML escapado dentro do resumo. O texto trazia &lt;/h1&gt;, que o
 *    wp_trim_words nao remove (para ele e texto comum) e saia impresso como
 *    "</h1>" no meio da frase. Por isso decodifica a entidade antes de tirar
 *    as tags: so nessa ordem o pedaco vira tag e cai fora.
 *
 * 2. Resumo que apenas repete a manchete. Aparecia o mesmo texto no h1 e logo
 *    abaixo, o que parece defeito. Quando o resumo comeca pelo titulo, o
 *    trecho repetido e cortado; se o que sobra nao diz nada, nao imprime nada.
 *
 * @since 1.0.0
 * @param int $id    Id do post.
 * @param int $words Limite de palavras.
 * @return string Vazio quando nao ha resumo util.
 */
function ev_excerpt( $id, $words = 16 ) {
    $raw = get_the_excerpt( $id );
    if ( ! $raw ) {
        return '';
    }

    $raw = html_entity_decode( $raw, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
    $raw = wp_strip_all_tags( $raw );
    $raw = trim( preg_replace( '/\s+/u', ' ', $raw ) );

    $title = trim( wp_strip_all_tags( html_entity_decode( get_the_title( $id ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ) );
    if ( $title && 0 === stripos( $raw, $title ) ) {
        $raw = ltrim( substr( $raw, strlen( $title ) ), " \t\n\r-:.|)(" );
    }

    if ( mb_strlen( $raw ) < 25 ) {
        return '';
    }

    return wp_trim_words( $raw, $words, '...' );
}

/**
 * Primeira categoria visivel do post.
 *
 * @since 1.0.0
 * @param int|null $id Id do post, opcional.
 * @return WP_Term|null
 */
function ev_first_cat( $id = null ) {
    $id   = $id ? $id : get_the_ID();
    $cats = get_the_category( $id );

    return empty( $cats ) ? null : $cats[0];
}

/**
 * Card do portal. card_style=image_right.
 *
 * Terceira defesa contra card vazio: se nao ha imagem, nao renderiza nada.
 * Vale mesmo com as duas camadas de query no lugar, porque um _thumbnail_id
 * numerico pode apontar para um anexo ja apagado.
 *
 * O link da imagem sai da ordem de foco: quem usa leitor de tela ja encontra
 * o mesmo destino no titulo, e ouvir duas vezes so atrapalha.
 *
 * @since 1.0.0
 * @param string $variant default, lg ou sm.
 * @return void
 */
function ev_card( $variant = 'default' ) {
    if ( ! has_post_thumbnail() ) {
        return;
    }

    $size = 'ev-card';
    $cls  = 'ev-card';

    if ( 'lg' === $variant ) {
        $cls .= ' ev-card--lg';
    } elseif ( 'sm' === $variant ) {
        $cls .= ' ev-card--sm';
        $size = 'ev-thumb';
    }

    $cat  = ev_first_cat();
    $lazy = ( is_front_page() || is_home() ) ? 'eager' : 'lazy';
    ?>
    <article class="<?php echo esc_attr( $cls ); ?>" data-id="<?php echo (int) get_the_ID(); ?>">
        <div class="ev-card__body">
            <?php if ( $cat ) : ?>
                <a class="ev-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
            <?php endif; ?>

            <h3 class="ev-card__t">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
            </h3>

            <?php
            $resumo = ( 'sm' === $variant ) ? '' : ev_excerpt( get_the_ID(), 16 );
            if ( $resumo ) :
                ?>
                <p class="ev-card__x"><?php echo esc_html( $resumo ); ?></p>
            <?php endif; ?>

            <time class="ev-card__when" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( ev_when() ); ?></time>
        </div>

        <a class="ev-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php
            the_post_thumbnail(
                $size,
                array(
                    'alt'     => '',
                    'loading' => $lazy,
                )
            );
            ?>
        </a>
    </article>
    <?php
}

/**
 * Card tolerante a matéria sem capa. Para uso fora da capa.
 *
 * Existe por um fato do acervo: so 1.209 dos 4.719 posts publicados tem imagem
 * destacada, e nas editorias de maior volume a taxa despenca (Noticias Agora
 * tem 83 capas em 1.603 matérias). Se o arquivo usasse ev_card(), que corta a
 * matéria sem imagem, a página da editoria sairia praticamente vazia.
 *
 * Regra da casa: a capa esconde matéria sem imagem, o arquivo mostra tudo.
 * Aqui a imagem e opcional e o card cai para uma versao so de texto.
 *
 * @since 1.0.0
 * @param string $variant default ou sm.
 * @return void
 */
function ev_card_any( $variant = 'default' ) {
    $has = has_post_thumbnail();
    $cls = 'ev-card';

    if ( 'sm' === $variant ) {
        $cls .= ' ev-card--sm';
    }
    if ( ! $has ) {
        $cls .= ' ev-card--txt';
    }

    $cat = ev_first_cat();
    ?>
    <article class="<?php echo esc_attr( $cls ); ?>" data-id="<?php echo (int) get_the_ID(); ?>">
        <div class="ev-card__body">
            <?php if ( $cat ) : ?>
                <a class="ev-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
            <?php endif; ?>

            <h3 class="ev-card__t">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
            </h3>

            <?php
            // Sem capa, o resumo carrega sozinho o peso do card, entao vem mais longo.
            $resumo = ( 'sm' === $variant ) ? '' : ev_excerpt( get_the_ID(), $has ? 16 : 30 );
            if ( $resumo ) :
                ?>
                <p class="ev-card__x"><?php echo esc_html( $resumo ); ?></p>
            <?php endif; ?>

            <time class="ev-card__when" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( ev_when() ); ?></time>
        </div>

        <?php if ( $has ) : ?>
            <a class="ev-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                <?php
                the_post_thumbnail(
                    ( 'sm' === $variant ) ? 'ev-thumb' : 'ev-card',
                    array(
                        'alt'     => '',
                        'loading' => 'lazy',
                    )
                );
                ?>
            </a>
        <?php endif; ?>
    </article>
    <?php
}

/**
 * Tempo de leitura estimado, 200 palavras por minuto.
 *
 * @since 1.0.0
 * @param int|null $id Id do post.
 * @return string
 */
function ev_read_time( $id = null ) {
    $id  = $id ? $id : get_the_ID();
    $n   = str_word_count( wp_strip_all_tags( (string) get_post_field( 'post_content', $id ) ) );
    $min = max( 1, (int) ceil( $n / 200 ) );

    return sprintf( '%d min de leitura', $min );
}

/**
 * Schema Article da matéria.
 *
 * @since 1.0.0
 * @param int $id Id do post.
 * @return void
 */
function ev_article_schema( $id ) {
    $cat  = ev_first_cat( $id );
    $data = array(
        '@context'         => 'https://schema.org',
        '@type'            => 'NewsArticle',
        'mainEntityOfPage' => array(
            '@type' => 'WebPage',
            '@id'   => get_permalink( $id ),
        ),
        'headline'         => wp_strip_all_tags( get_the_title( $id ) ),
        'datePublished'    => get_the_date( 'c', $id ),
        'dateModified'     => get_the_modified_date( 'c', $id ),
        'inLanguage'       => 'pt-BR',
        'publisher'        => array(
            '@type' => 'Organization',
            'name'  => get_bloginfo( 'name' ),
        ),
    );

    if ( has_excerpt( $id ) ) {
        $data['description'] = wp_strip_all_tags( get_the_excerpt( $id ) );
    }

    if ( $cat ) {
        $data['articleSection'] = $cat->name;
    }

    $logo_id = (int) get_theme_mod( 'custom_logo' );
    if ( $logo_id ) {
        $logo = wp_get_attachment_image_src( $logo_id, 'full' );
        if ( $logo ) {
            $data['publisher']['logo'] = array(
                '@type'  => 'ImageObject',
                'url'    => $logo[0],
                'width'  => (int) $logo[1],
                'height' => (int) $logo[2],
            );
        }
    }

    if ( has_post_thumbnail( $id ) ) {
        $img = wp_get_attachment_image_src( get_post_thumbnail_id( $id ), 'ev-hero' );
        if ( $img ) {
            $data['image'] = array(
                '@type'  => 'ImageObject',
                'url'    => $img[0],
                'width'  => (int) $img[1],
                'height' => (int) $img[2],
            );
        }
    }

    echo '<script type="application/ld+json">' .
        wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) .
        '</script>' . "\n";
}

/**
 * Botoes de compartilhar. share_buttons_position=inline_after_first_para.
 *
 * social_icons_position=inline_in_post_meta: os links sociais do portal vivem
 * aqui, junto do corpo da matéria, e nao no cabecalho nem no rodape.
 *
 * @since 1.0.0
 * @param string $html Conteudo renderizado.
 * @return string
 */
function ev_inject_share( $html ) {
    if ( ! is_singular( 'post' ) || ! in_the_loop() || ! is_main_query() ) {
        return $html;
    }

    $url = rawurlencode( get_permalink() );
    $ttl = rawurlencode( wp_strip_all_tags( get_the_title() ) );

    ob_start();
    ?>
    <div class="ev-share">
        <span class="ev-share__lbl">Compartilhar</span>
        <a href="https://api.whatsapp.com/send/?text=<?php echo esc_attr( $ttl . '%20' . $url ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar esta matéria no WhatsApp">WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo esc_attr( $url ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar esta matéria no Facebook">Facebook</a>
        <a href="https://x.com/intent/post?url=<?php echo esc_attr( $url ); ?>&text=<?php echo esc_attr( $ttl ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar esta matéria no X">X</a>
    </div>
    <?php
    $share = ob_get_clean();

    // Depois do primeiro paragrafo fechado. Sem </p> no corpo, vai para o topo.
    $at = strpos( $html, '</p>' );
    if ( false === $at ) {
        return $share . $html;
    }

    return substr_replace( $html, $share, $at + 4, 0 );
}
add_filter( 'the_content', 'ev_inject_share', 20 );

/**
 * Ids de matérias relacionadas, pela categoria principal.
 *
 * Sem filtro de imagem: relacionados existem para dar saida ao leitor, e um
 * post sem capa continua sendo uma saida valida.
 *
 * @since 1.0.0
 * @param int $id   Post atual.
 * @param int $want Quantos.
 * @return array
 */
function ev_related_ids( $id, $want = 6 ) {
    $cat = ev_first_cat( $id );
    if ( ! $cat ) {
        return array();
    }

    return get_posts(
        array(
            'post_type'           => 'post',
            'post_status'         => 'publish',
            'posts_per_page'      => $want,
            'cat'                 => $cat->term_id,
            'post__not_in'        => array( $id ),
            'ignore_sticky_posts' => true,
            'no_found_rows'       => true,
            'fields'              => 'ids',
            'orderby'             => 'date',
            'order'               => 'DESC',
        )
    );
}

/**
 * Menu de emergencia: as categorias com mais matérias.
 *
 * So aparece se nenhum menu estiver atribuido a localizacao ev_primary.
 * O portal ficaria sem navegacao alguma nesse caso.
 *
 * menu_structure_style=flat_compact: uma unica fila, sem submenus.
 *
 * @since 1.0.0
 * @return void
 */
function ev_menu_fallback() {
    $cats = get_categories(
        array(
            'orderby'    => 'count',
            'order'      => 'DESC',
            'number'     => 6,
            'hide_empty' => true,
            'exclude'    => ev_hidden_cats(),
        )
    );

    if ( empty( $cats ) ) {
        return;
    }

    echo '<ul class="ev-nav__list">';
    printf( '<li><a href="%s">Capa</a></li>', esc_url( home_url( '/' ) ) );

    foreach ( $cats as $cat ) {
        // Title Case: o nome sai do WP como esta, sem strtolower nem strtoupper.
        printf(
            '<li><a href="%s">%s</a></li>',
            esc_url( get_category_link( $cat->term_id ) ),
            esc_html( $cat->name )
        );
    }
    echo '</ul>';
}

/**
 * Data da edicao, no fuso do site.
 *
 * @since 1.0.0
 * @return string
 */
function ev_edition_date() {
    return ucfirst( wp_date( 'l, j \d\e F \d\e Y' ) );
}

/**
 * Trilha de navegacao. breadcrumb_style=chevron_icons.
 *
 * @since 1.0.0
 * @return void
 */
function ev_crumbs() {
    $sep = '<span class="ev-crumbs__sep" aria-hidden="true">&rsaquo;</span>';
    ?>
    <nav class="ev-crumbs" aria-label="Você está em">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Capa</a>
        <?php
        if ( is_singular( 'post' ) ) {
            $cat = ev_first_cat();
            if ( $cat ) {
                echo wp_kses_post( $sep );
                printf(
                    '<a href="%s">%s</a>',
                    esc_url( get_category_link( $cat->term_id ) ),
                    esc_html( $cat->name )
                );
            }
            echo wp_kses_post( $sep );
            printf(
                '<span class="ev-crumbs__now">%s</span>',
                esc_html( wp_trim_words( get_the_title(), 8, '...' ) )
            );
        } elseif ( is_category() ) {
            echo wp_kses_post( $sep );
            printf(
                '<span class="ev-crumbs__now">%s</span>',
                esc_html( single_cat_title( '', false ) )
            );
        }
        ?>
    </nav>
    <?php
}

/**
 * Schema ItemList da capa. schema=itemlist.
 *
 * @since 1.0.0
 * @param array $ids Ids na ordem em que aparecem.
 * @return void
 */
function ev_itemlist_schema( $ids ) {
    $ids = array_values( array_unique( array_filter( (array) $ids ) ) );
    if ( empty( $ids ) ) {
        return;
    }

    $items = array();
    $pos   = 1;

    foreach ( $ids as $id ) {
        $items[] = array(
            '@type'    => 'ListItem',
            'position' => $pos,
            'url'      => get_permalink( $id ),
            'name'     => wp_strip_all_tags( get_the_title( $id ) ),
        );
        $pos++;
    }

    $data = array(
        '@context'        => 'https://schema.org',
        '@type'           => 'ItemList',
        'name'            => get_bloginfo( 'name' ) . ', últimas notícias',
        'itemListOrder'   => 'https://schema.org/ItemListOrderDescending',
        'numberOfItems'   => count( $items ),
        'itemListElement' => $items,
    );

    echo '<script type="application/ld+json">' .
        wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) .
        '</script>' . "\n";
}
