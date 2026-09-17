<?php
/**
 * Correcao da remocao enjai.com.br: remove SOMENTE links de raiz
 * (https://enjai.com.br/ e variantes, caminho vazio ou "/") e PRESERVA
 * links com caminho (ex: /comprar-seguidores-por-1-real).
 *
 * Fonte da verdade = backup original em postmeta oie_link_removed_<TS> de HOJE.
 * Recalcula o conteudo a partir do backup -> restaura subpaginas + mantem raiz removida.
 *
 * Uso (por site):
 *   wp eval-file fix-enjai.php          (DRY-RUN, so conta)
 *   wp eval-file fix-enjai.php apply    (aplica)
 */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) { return; }
global $wpdb;

$APPLY     = isset( $args[0] ) && $args[0] === 'apply';
$THRESHOLD = 1780704000; // 2026-06-06 00:00:00 UTC (separa rodada enjai de hoje da rodada IPTV de 27/05)

$root_removed = 0; $path_kept = 0; $posts_fixed = 0; $posts_seen = 0;

$metas = $wpdb->get_results( "SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE meta_key LIKE 'oie_link_removed_%'" );

// por post, pega o backup de HOJE mais antigo (= conteudo original antes da remocao de hoje)
$byPost = array();
foreach ( $metas as $m ) {
	$ts = (int) substr( $m->meta_key, strlen( 'oie_link_removed_' ) );
	if ( $ts < $THRESHOLD ) { continue; }
	if ( strpos( $m->meta_value, 'enjai.com.br' ) === false ) { continue; }
	if ( ! isset( $byPost[ $m->post_id ] ) || $ts < $byPost[ $m->post_id ]['ts'] ) {
		$byPost[ $m->post_id ] = array( 'ts' => $ts, 'orig' => $m->meta_value );
	}
}

foreach ( $byPost as $pid => $info ) {
	$posts_seen++;
	$r = 0; $k = 0;
	$new = preg_replace_callback(
		'/<a\s([^>]*?)\bhref\s*=\s*(["\'])(.*?)\2([^>]*)>(.*?)<\/a>/is',
		function ( $mm ) use ( &$r, &$k ) {
			$url  = $mm[3];
			$host = wp_parse_url( $url, PHP_URL_HOST );
			if ( ! $host ) { return $mm[0]; }
			$host = preg_replace( '/^www\./', '', strtolower( $host ) );
			if ( $host !== 'enjai.com.br' ) { return $mm[0]; }
			$path = wp_parse_url( $url, PHP_URL_PATH );
			if ( $path === null || $path === '' || $path === '/' ) { $r++; return $mm[5]; } // RAIZ -> remove, mantem texto
			$k++; return $mm[0]; // caminho -> PRESERVA o link
		},
		$info['orig']
	);
	$root_removed += $r; $path_kept += $k;
	$cur = get_post_field( 'post_content', $pid );
	if ( $new !== $cur ) {
		$posts_fixed++;
		if ( $APPLY ) {
			$wpdb->update( $wpdb->posts, array( 'post_content' => $new ), array( 'ID' => $pid ) );
			clean_post_cache( $pid );
		}
	}
}

WP_CLI::log( sprintf(
	'FIX site=%s posts_hoje=%d corrigidos=%d root_removidos=%d caminho_preservados=%d apply=%s',
	home_url(), $posts_seen, $posts_fixed, $root_removed, $path_kept, $APPLY ? '1' : '0'
) );
