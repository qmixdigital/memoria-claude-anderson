<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Footer archetype F5: Bottom sticky bar (minimal brand + links + copyright)
 * footer_credits_text: omit
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<footer class="d8-footer" role="contentinfo">
	<div class="d8-footer__inner">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="d8-footer__brand" rel="home">DF<em style="font-style:normal;color:var(--d8-secondary);">8</em> News</a>
		<ul class="d8-footer__links">
			<li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre</a></li>
			<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
			<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Privacidade</a></li>
			<li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos</a></li>
			<li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS</a></li>
		</ul>
		<span class="d8-footer__copy">&copy; <?php echo esc_html( date( 'Y' ) ); ?> DF8 News</span>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
