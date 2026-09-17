<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Footer archetype F4: Mega (5 colunas: marca+sobre, editorias, institucional, social, newsletter)
 * footer_credits_text: noticias_responsabilidade ("Notícias com responsabilidade.")
 * social_icons_position=bottom_left_footer
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$rr_top_cats = get_categories( array(
	'orderby'    => 'count',
	'order'      => 'DESC',
	'number'     => 8,
	'hide_empty' => true,
	'exclude'    => rr_excluded_lang_cat_ids(),
) );
?>
<footer class="rr-footer" role="contentinfo">
	<div class="rr-footer__inner">
		<div class="rr-footer__grid">

			<div class="rr-footer__col">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="rr-footer__brand" rel="home">Revista <em>Rumo</em></a>
				<p class="rr-footer__about">Conteúdo independente sobre notícias, lifestyle, saúde, viagem e cultura. Apuração cuidadosa e linguagem acessível.</p>
				<div class="rr-footer__social" aria-label="Redes sociais">
					<a href="#" aria-label="Facebook" rel="noopener">
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
					</a>
					<a href="#" aria-label="Instagram" rel="noopener">
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.39C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.39-2.13C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.17 6.17 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z"/></svg>
					</a>
					<a href="#" aria-label="X (Twitter)" rel="noopener">
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
					</a>
					<a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>" aria-label="RSS">
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/></svg>
					</a>
				</div>
			</div>

			<div class="rr-footer__col">
				<h3>Editorias</h3>
				<ul>
					<?php foreach ( $rr_top_cats as $c ) : ?>
						<li><a href="<?php echo esc_url( get_category_link( $c->term_id ) ); ?>"><?php echo esc_html( $c->name ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>

			<div class="rr-footer__col">
				<h3>Institucional</h3>
				<ul>
					<?php
					if ( has_nav_menu( 'footer' ) ) {
						wp_nav_menu( array(
							'theme_location' => 'footer',
							'container'      => false,
							'items_wrap'     => '%3$s',
							'depth'          => 1,
							'fallback_cb'    => false,
						) );
					} else {
					?>
						<li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre a Revista</a></li>
						<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
						<li><a href="<?php echo esc_url( home_url( '/equipe/' ) ); ?>">Equipe editorial</a></li>
						<li><a href="<?php echo esc_url( home_url( '/anuncie/' ) ); ?>">Anuncie aqui</a></li>
					<?php } ?>
				</ul>
			</div>

			<div class="rr-footer__col">
				<h3>Legal</h3>
				<ul>
					<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
					<li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
					<li><a href="<?php echo esc_url( home_url( '/politica-de-cookies/' ) ); ?>">Política de cookies</a></li>
					<li><a href="<?php echo esc_url( home_url( '/codigo-de-conduta/' ) ); ?>">Código de conduta</a></li>
				</ul>
			</div>

			<div class="rr-footer__col rr-footer__newsletter">
				<h3>Newsletter</h3>
				<p class="rr-footer__about">Receba as principais matérias da semana no seu e-mail. Sem spam, sem ruído.</p>
				<form action="#" method="post" onsubmit="return false">
					<label for="rr-newsletter-footer" class="screen-reader-text">Seu e-mail</label>
					<input id="rr-newsletter-footer" type="email" name="email" placeholder="seu@email.com" required>
					<button type="submit">Inscrever</button>
				</form>
			</div>

		</div>

		<div class="rr-footer__bottom">
			<span class="rr-footer__copy">&copy; <?php echo esc_html( date( 'Y' ) ); ?> Revista Rumo. Todos os direitos reservados.</span>
			<span class="rr-footer__credits">Notícias com responsabilidade.</span>
		</div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
