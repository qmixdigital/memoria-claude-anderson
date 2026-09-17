<?php
/**
 * Footer F4: Mega footer (5 cols + newsletter + social + bottom)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<footer class="exq-footer" role="contentinfo">
	<div class="exq-footer__top">
		<div class="exq-footer__col exq-footer__brand">
			<?php
			$logo_w_path = get_stylesheet_directory() . '/assets/exquisito-logo-white.svg';
			$logo_w_uri  = get_stylesheet_directory_uri() . '/assets/exquisito-logo-white.svg';
			$logo_w_ver  = file_exists( $logo_w_path ) ? filemtime( $logo_w_path ) : '1';
			?>
			<img src="<?php echo esc_url( $logo_w_uri . '?v=' . $logo_w_ver ); ?>" alt="Exquisito" width="280" height="52" loading="lazy" decoding="async" class="no-lazyload litespeed-no-lazy" data-no-lazy="1" data-no-optimize="1" style="height:52px;width:auto;max-width:none;display:block;">
			<p class="exq-footer__about">Portal editorial sobre notícias, viagens, tecnologia, casa, cursos, marketing, saúde e estilo. Conteúdo refinado e atualizado.</p>
			<div class="exq-footer__social" aria-label="Redes sociais">
				<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg></a>
				<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
				<a href="#" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
				<a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>" aria-label="RSS"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20A2.18 2.18 0 0 1 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/></svg></a>
			</div>
		</div>

		<div class="exq-footer__col">
			<h4>Editorias</h4>
			<ul>
				<?php
				$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true, 'exclude' => exq_excluded_lang_cat_ids() ) );
				foreach ( $cats as $c ) {
					echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
				}
				?>
			</ul>
		</div>

		<div class="exq-footer__col">
			<h4>Institucional</h4>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/sobre-nos/' ) ); ?>">Sobre nós</a></li>
				<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
				<li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
			</ul>
		</div>

		<div class="exq-footer__col">
			<h4>Redação</h4>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Proponha uma pauta</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Anuncie no Exquisito</a></li>
				<li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS</a></li>
				<li><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>">Sitemap</a></li>
			</ul>
		</div>

		<div class="exq-footer__col exq-footer__newsletter">
			<h4>Boletim</h4>
			<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:rgba(229,235,242,.72);">Receba o melhor da semana no seu e-mail.</p>
			<form method="post" action="<?php echo esc_url( home_url( '/contato/' ) ); ?>" onsubmit="return false;">
				<input type="email" placeholder="seu@email.com" aria-label="E-mail">
				<button type="submit">Assinar</button>
			</form>
		</div>
	</div>

	<div class="exq-footer__bottom">
		<span>&copy; <?php echo esc_html( date( 'Y' ) ); ?> Exquisito. Todos os direitos reservados.</span>
		<span>Conteúdo independente, atualização contínua.</span>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
