<?php
/**
 * Plugin Name: OIE Link Audit (mu-plugin variant)
 * Description: `wp oie audit-links` para auditoria de links externos da rede QMIX. Regra 14g da skill wp-news-portal-fullsetup.
 * Version: 1.0
 * Author: QMIX
 *
 * NOTA: deliberadamente SEM o guard `if(!defined("ABSPATH")) exit;` para que
 * funcione tambem quando carregado via wp-cli.yml require ANTES do WP carregar.
 */
if ( ! class_exists( 'OIE_Link_Audit_Command' ) ) {

	class OIE_Link_Audit_Command {

		/**
		 * Audita / remove links externos para domínios alvo.
		 *
		 * ## OPTIONS
		 *
		 * --domain=<list>            Domínios alvo (separados por vírgula).
		 * [--remove]                 Remove ou modifica os links encontrados.
		 * [--dry-run]                Imprime o que faria sem modificar.
		 * [--replacement=<mode>]     text | nofollow | placeholder. Default: text.
		 * [--json]                   Saída JSON.
		 * [--post_status=<list>]     Default: publish.
		 *
		 * ## EXAMPLES
		 *
		 *     wp oie audit-links --domain=alvo.com
		 *     wp oie audit-links --domain=a.com,b.com --remove --dry-run
		 *     wp oie audit-links --domain=alvo.com --remove --replacement=nofollow
		 */
		public function __invoke( $args, $assoc ) {
			global $wpdb;
			$domains = array_filter( array_map( 'trim', explode( ',', isset( $assoc['domain'] ) ? $assoc['domain'] : '' ) ) );
			if ( empty( $domains ) ) { WP_CLI::error( '--domain é obrigatório.' ); }
			$remove = isset( $assoc['remove'] );
			$dry_run = isset( $assoc['dry-run'] );
			$mode = isset( $assoc['replacement'] ) ? $assoc['replacement'] : 'text';
			$as_json = isset( $assoc['json'] );
			$status = isset( $assoc['post_status'] ) ? $assoc['post_status'] : 'publish';
			$status_in = "'" . implode( "','", array_map( 'esc_sql', array_map( 'trim', explode( ',', $status ) ) ) ) . "'";
			$rows = $wpdb->get_results( "SELECT ID, post_title, post_content, guid FROM {$wpdb->posts} WHERE post_type='post' AND post_status IN ({$status_in})" );
			$matches = array(); $total_links = 0;
			foreach ( $rows as $row ) {
				$found = $this->find_links( $row->post_content, $domains );
				if ( empty( $found ) ) { continue; }
				$total_links += count( $found );
				$entry = array( 'ID' => (int) $row->ID, 'title' => $row->post_title, 'url' => get_permalink( $row->ID ), 'links' => $found );
				if ( $remove && ! $dry_run ) {
					$new = $this->mutate( $row->post_content, $domains, $mode );
					update_post_meta( $row->ID, 'oie_link_removed_' . time(), $row->post_content );
					$wpdb->update( $wpdb->posts, array( 'post_content' => $new ), array( 'ID' => $row->ID ) );
					clean_post_cache( $row->ID );
					$entry['removed'] = true;
				}
				$matches[] = $entry;
			}
			$out = array( 'site' => home_url(), 'domains' => $domains, 'matches' => $matches, 'removed' => $remove && ! $dry_run, 'dry_run' => $dry_run, 'totals' => array( 'posts' => count( $matches ), 'links' => $total_links ) );
			if ( $as_json ) { WP_CLI::log( wp_json_encode( $out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) ); return; }
			WP_CLI::log( sprintf( "Site: %s | Domínios: %s | Posts: %d | Links: %d", home_url(), implode( ',', $domains ), count( $matches ), $total_links ) );
			foreach ( $matches as $m ) { WP_CLI::log( sprintf( "  #%d %s: %d link(s)", $m['ID'], $m['title'], count( $m['links'] ) ) ); }
		}

		private function find_links( $html, $domains ) {
			$found = array();
			if ( preg_match_all( '/<a\s[^>]*?\bhref\s*=\s*(["\'])(.*?)\1/i', $html, $m ) ) {
				foreach ( $m[2] as $url ) {
					if ( $this->host_matches( $url, $domains ) ) { $found[] = $url; }
				}
			}
			return $found;
		}
		private function host_matches( $url, $domains ) {
			$host = wp_parse_url( $url, PHP_URL_HOST );
			if ( ! $host ) { return false; }
			$host = preg_replace( '/^www\\./', '', $host );
			foreach ( $domains as $d ) {
				$d = preg_replace( '/^www\\./', '', strtolower( $d ) );
				if ( strtolower( $host ) === $d ) { return true; }
				if ( str_ends_with( strtolower( $host ), '.' . $d ) ) { return true; }
			}
			return false;
		}
		private function mutate( $html, $domains, $mode ) {
			return preg_replace_callback( '/<a\s([^>]*?)\bhref\s*=\s*(["\'])(.*?)\2([^>]*)>(.*?)<\/a>/is', function ( $mm ) use ( $domains, $mode ) {
				if ( ! $this->host_matches( $mm[3], $domains ) ) { return $mm[0]; }
				if ( $mode === 'text' ) { return $mm[5]; }
				if ( $mode === 'placeholder' ) { return '<a ' . $mm[1] . 'href="#"' . $mm[4] . '>' . $mm[5] . '</a>'; }
				if ( $mode === 'nofollow' ) {
					$rel = preg_match( '/\\brel\\s*=/', $mm[1] . $mm[4] ) ? '' : ' rel="nofollow noopener"';
					return '<a ' . $mm[1] . 'href="' . esc_url( $mm[3] ) . '"' . $mm[4] . $rel . '>' . $mm[5] . '</a>';
				}
				return $mm[0];
			}, $html );
		}
	}
}

if ( defined( 'WP_CLI' ) && WP_CLI && class_exists( 'WP_CLI' ) ) {
	WP_CLI::add_command( 'oie audit-links', function ( $args, $assoc ) {
		$cmd = new OIE_Link_Audit_Command();
		$cmd( $args, $assoc );
	} );
}
