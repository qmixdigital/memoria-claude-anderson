<?php
/**
 * Template Name: Contato (Exquisito)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$state = isset( $_GET['st'] ) ? sanitize_key( $_GET['st'] ) : '';
$ok    = $state === 'recebido';
$erro  = $state === 'erro' ? sanitize_text_field( $_GET['m'] ?? '' ) : '';
$nonce = wp_create_nonce( 'exq_pauta' );
$ts    = time();
?>
<main id="exq-main" role="main">
<article class="exq-single__main" style="max-width:760px;margin:0 auto;padding:var(--exq-sp-md) var(--exq-gutter) var(--exq-sp-xxl);">
	<nav class="exq-breadcrumb" aria-label="Breadcrumb">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
		<span class="exq-breadcrumb__sep">/</span>
		<span>Contato</span>
	</nav>
	<header class="exq-post__head">
		<span class="exq-post__cat">Redação</span>
		<h1 class="exq-post__title">Fale com a redação</h1>
		<p class="exq-post__sub">Sugestões de pauta, correções, indicações de leitura, parcerias editoriais. A redação lê tudo.</p>
	</header>

	<?php if ( $ok ) : ?>
		<div class="exq-flash exq-flash--ok" role="status">
			<strong>Mensagem recebida.</strong>
			<p>A redação confirma. Em até 48h em dias úteis um editor responde no e-mail informado.</p>
		</div>
	<?php endif; ?>
	<?php if ( $erro ) : ?>
		<div class="exq-flash exq-flash--err" role="alert">
			<strong>Não foi possível enviar.</strong>
			<p><?php echo esc_html( $erro ); ?></p>
		</div>
	<?php endif; ?>

	<form method="post" action="" class="exq-pauta" novalidate>
		<input type="hidden" name="exq_envio_pauta" value="enviar">
		<input type="hidden" name="exq_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
		<input type="hidden" name="exq_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

		<div class="exq-pauta__honey" aria-hidden="true">
			<label for="exq-honey">Número de assinatura (deixe vazio)</label>
			<input type="text" id="exq-honey" name="numero_assinatura" tabindex="-1" autocomplete="off">
		</div>

		<div class="exq-pauta__field">
			<label>Nome <span class="req">*</span></label>
			<input type="text" name="assinante" required maxlength="120" placeholder="Seu nome completo" autocomplete="name">
		</div>
		<div class="exq-pauta__field">
			<label>E-mail <span class="req">*</span></label>
			<input type="email" name="endereco_retorno" required maxlength="180" placeholder="seu@email.com" autocomplete="email">
		</div>
		<div class="exq-pauta__field">
			<label>Assunto <span class="req">*</span></label>
			<select name="motivo" required>
				<option value="">escolha um motivo</option>
				<option value="pauta">Sugestão de pauta</option>
				<option value="correcao">Correção em texto publicado</option>
				<option value="leitura">Indicação de leitura</option>
				<option value="release">Release / lançamento</option>
				<option value="parceria">Parceria editorial</option>
				<option value="outro">Outro</option>
			</select>
		</div>
		<div class="exq-pauta__field">
			<label>Mensagem <span class="req">*</span></label>
			<textarea name="texto" rows="9" required minlength="40" maxlength="4000" placeholder="40 a 4000 caracteres."></textarea>
		</div>
		<div class="exq-pauta__sign">
			<button type="submit" class="exq-btn">Enviar mensagem</button>
			<p class="exq-pauta__note">Ao enviar você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.</p>
		</div>
	</form>
</article>
</main>

<style>
.exq-flash { padding: 14px 18px; margin: 18px 0; border-left: 4px solid; background: var(--exq-paper-2); border-radius: var(--exq-r-card); }
.exq-flash--ok  { border-left-color: var(--exq-cyan); }
.exq-flash--err { border-left-color: #C0392B; }
.exq-flash strong { display: block; font-family: var(--exq-font-meta); font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--exq-ink); }
.exq-flash p { margin: 0; font-family: var(--exq-font-meta); font-size: 14px; color: var(--exq-muted-2); }
.exq-pauta { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--exq-line); font-family: var(--exq-font-meta); }
.exq-pauta__honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.exq-pauta__field { margin: 0 0 18px; }
.exq-pauta__field label { display: block; font-size: 12px; font-weight: 700; letter-spacing: .04em; margin-bottom: 6px; color: var(--exq-ink-2); text-transform: uppercase; }
.exq-pauta__field .req { color: var(--exq-cyan-ink); margin-left: 2px; }
.exq-pauta__field input,
.exq-pauta__field select,
.exq-pauta__field textarea {
	width: 100%; padding: 12px 14px; border: 1px solid var(--exq-line);
	border-radius: var(--exq-r-button); font-family: inherit; font-size: 15px;
	background: var(--exq-paper); color: var(--exq-ink);
	transition: border-color .15s ease, box-shadow .15s ease;
}
.exq-pauta__field input:focus,
.exq-pauta__field select:focus,
.exq-pauta__field textarea:focus {
	outline: none; border-color: var(--exq-cyan); box-shadow: 0 0 0 3px var(--exq-cyan-soft);
}
.exq-pauta__field textarea { resize: vertical; min-height: 140px; line-height: 1.55; font-family: var(--exq-font-body); }
.exq-pauta__sign { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--exq-line-soft); display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
.exq-btn { padding: 12px 28px; background: var(--exq-cyan); color: var(--exq-ink); border: 0; border-radius: var(--exq-r-button); font-family: inherit; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; transition: background .15s ease; }
.exq-btn:hover { background: var(--exq-cyan-2); color: var(--exq-paper); }
.exq-pauta__note { margin: 0; font-size: 12px; color: var(--exq-muted); flex: 1; min-width: 240px; }
.exq-pauta__note a { color: var(--exq-cyan-ink); border-bottom: 1px solid var(--exq-cyan); }
</style>

<?php get_footer();
