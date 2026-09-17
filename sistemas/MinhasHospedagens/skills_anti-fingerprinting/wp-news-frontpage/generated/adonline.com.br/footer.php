<?php
/**
 * Footer F2: 4-column classic
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$logo_white = 'https://adonline.com.br/wp-content/uploads/2025/10/adonline-logomarca-branca.webp';
?>
<footer class="adon-footer" role="contentinfo">
	<div class="adon-footer__cols">
		<div class="adon-footer__col adon-footer__brand">
			<img src="<?php echo esc_url( $logo_white ); ?>" alt="AdOnline" width="200" height="35" loading="lazy" decoding="async">
			<p class="adon-footer__about">Portal de conteúdo digital com artigos evergreen sobre saúde, marketing, casa, empreendedorismo e mais. No ar desde 2000.</p>
		</div>

		<div class="adon-footer__col">
			<h4>Categorias</h4>
			<ul>
				<?php
				$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
				foreach ( $cats as $c ) {
					echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
				}
				?>
			</ul>
		</div>

		<div class="adon-footer__col">
			<h4>Institucional</h4>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/sobre-nos/' ) ); ?>">Sobre nós</a></li>
				<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
				<li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
			</ul>
		</div>

		<div class="adon-footer__col">
			<h4>Redação</h4>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Proponha uma pauta</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Anuncie no AdOnline</a></li>
				<li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS</a></li>
				<li><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>">Sitemap</a></li>
			</ul>
		</div>
	</div>

	<div class="adon-footer__bottom">
		<span>&copy; <?php echo esc_html( date( 'Y' ) ); ?> AdOnline. Todos os direitos reservados.</span>
		<span>Conteúdo independente.</span>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
