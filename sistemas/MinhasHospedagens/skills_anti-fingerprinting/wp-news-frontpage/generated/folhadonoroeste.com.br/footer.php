<?php
/**
 * Footer F2: 4-column classic
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$logo = 'https://folhadonoroeste.com.br/wp-content/uploads/2025/09/Folha-do-Noroeste-logomarca.png';
?>
<footer class="fn-footer" role="contentinfo">
	<div class="fn-footer__cols">
		<div class="fn-footer__col fn-footer__brand">
			<img src="<?php echo esc_url( $logo ); ?>" alt="Folha do Noroeste" width="200" height="40" loading="lazy" decoding="async">
			<p class="fn-footer__about">Notícias do Noroeste e do Brasil. Cobertura regional com olhar editorial cuidadoso, atualização contínua e foco no leitor brasileiro.</p>
		</div>
		<div class="fn-footer__col">
			<h4>Editorias</h4>
			<ul>
				<?php
				$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true, 'exclude' => fn_excluded_lang_cat_ids() ) );
				foreach ( $cats as $c ) {
					echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
				}
				?>
			</ul>
		</div>
		<div class="fn-footer__col">
			<h4>Institucional</h4>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/sobre-nos/' ) ); ?>">Sobre nós</a></li>
				<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
				<li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
			</ul>
		</div>
		<div class="fn-footer__col">
			<h4>Redação</h4>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Proponha uma pauta</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Anuncie na Folha</a></li>
				<li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS</a></li>
				<li><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>">Sitemap</a></li>
			</ul>
		</div>
	</div>
	<div class="fn-footer__bottom">
		<span>&copy; <?php echo esc_html( date( 'Y' ) ); ?> Folha do Noroeste. Todos os direitos reservados.</span>
		<span>Conteúdo independente.</span>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
