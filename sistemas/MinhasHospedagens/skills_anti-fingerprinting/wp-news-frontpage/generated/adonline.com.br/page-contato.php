<?php
/**
 * Template Name: Contato (AdOnline)
 *
 * Form 4-fields: nome / email / motivo / texto
 * action: adon_envio_pauta=enviar, honeypot: numero_assinatura
 * Padrão da skill wp-news-portal-fullsetup (vd/cc/avi/etc).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$state = isset( $_GET['st'] ) ? sanitize_key( $_GET['st'] ) : '';
$ok    = $state === 'recebido';
$erro  = $state === 'erro' ? sanitize_text_field( $_GET['m'] ?? '' ) : '';
$nonce = wp_create_nonce( 'adon_pauta' );
$ts    = time();
?>

<main id="adon-main" role="main">
<article class="adon-post" style="max-width:760px;">

  <nav class="adon-breadcrumb" aria-label="Breadcrumb">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
    <span class="adon-breadcrumb__sep">/</span>
    <span>Contato</span>
  </nav>

  <header class="adon-post__head">
    <span class="adon-post__cat">Redação</span>
    <h1 class="adon-post__title">Fale com a redação</h1>
    <div class="adon-post__byline" style="margin-bottom:24px;">
      <span>Sugestões de pauta, correções, indicações de leitura, parcerias editoriais. A redação lê tudo. Releases sem contexto e propostas de SEO/backlink são descartadas.</span>
    </div>
  </header>

  <?php if ( $ok ) : ?>
    <div class="adon-flash adon-flash--ok" role="status">
      <strong>Mensagem recebida.</strong>
      <p>A redação confirma. Em até 48h em dias úteis um editor responde no e-mail informado.</p>
    </div>
  <?php endif; ?>

  <?php if ( $erro ) : ?>
    <div class="adon-flash adon-flash--err" role="alert">
      <strong>Não foi possível enviar.</strong>
      <p><?php echo esc_html( $erro ); ?></p>
    </div>
  <?php endif; ?>

  <form method="post" action="" class="adon-pauta" novalidate>
    <input type="hidden" name="adon_envio_pauta" value="enviar">
    <input type="hidden" name="adon_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
    <input type="hidden" name="adon_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

    <div class="adon-pauta__honey" aria-hidden="true">
      <label for="adon-honey">Número de assinatura (deixe vazio)</label>
      <input type="text" id="adon-honey" name="numero_assinatura" tabindex="-1" autocomplete="off">
    </div>

    <div class="adon-pauta__field">
      <label>Nome <span class="req">*</span></label>
      <input type="text" name="assinante" required maxlength="120" placeholder="Seu nome completo" autocomplete="name">
    </div>

    <div class="adon-pauta__field">
      <label>E-mail <span class="req">*</span></label>
      <input type="email" name="endereco_retorno" required maxlength="180" placeholder="seu@email.com" autocomplete="email">
    </div>

    <div class="adon-pauta__field">
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

    <div class="adon-pauta__field">
      <label>Mensagem <span class="req">*</span></label>
      <textarea name="texto" rows="9" required minlength="40" maxlength="4000" placeholder="40 a 4000 caracteres. Quanto mais contexto, melhor."></textarea>
    </div>

    <div class="adon-pauta__sign">
      <button type="submit" class="adon-btn">Enviar mensagem</button>
      <p class="adon-pauta__note">Ao enviar você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.</p>
    </div>
  </form>

</article>
</main>

<style>
.adon-flash { padding: 14px 18px; margin: 18px 0; border-left: 4px solid; background: var(--adon-paper-2); border-radius: var(--adon-r-card); }
.adon-flash--ok  { border-left-color: var(--adon-green); }
.adon-flash--err { border-left-color: #C0392B; }
.adon-flash strong { display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--adon-ink); }
.adon-flash p { margin: 0; font-size: 14px; color: var(--adon-muted-2); }

.adon-pauta { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--adon-line); }
.adon-pauta__honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.adon-pauta__field { margin: 0 0 18px; }
.adon-pauta__field label { display: block; font-size: 13px; font-weight: 700; letter-spacing: .04em; margin-bottom: 6px; color: var(--adon-ink-2); }
.adon-pauta__field .req { color: var(--adon-green-ink); margin-left: 2px; }
.adon-pauta__field input,
.adon-pauta__field select,
.adon-pauta__field textarea {
  width: 100%; padding: 12px 14px; border: 1px solid var(--adon-line);
  border-radius: var(--adon-r-button); font-family: inherit; font-size: 15px;
  background: var(--adon-paper); color: var(--adon-ink); transition: border-color .15s ease, box-shadow .15s ease;
}
.adon-pauta__field input:focus,
.adon-pauta__field select:focus,
.adon-pauta__field textarea:focus {
  outline: none; border-color: var(--adon-green); box-shadow: 0 0 0 3px var(--adon-green-soft);
}
.adon-pauta__field textarea { resize: vertical; min-height: 140px; line-height: 1.55; }
.adon-pauta__sign { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--adon-line-soft); display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
.adon-btn { padding: 12px 28px; background: var(--adon-ink); color: var(--adon-paper); border: 0; border-radius: var(--adon-r-button); font-family: inherit; font-weight: 700; font-size: 14px; letter-spacing: .04em; cursor: pointer; transition: background .15s ease; }
.adon-btn:hover { background: var(--adon-green-ink); }
.adon-pauta__note { margin: 0; font-size: 12px; color: var(--adon-muted); flex: 1; min-width: 240px; }
.adon-pauta__note a { color: var(--adon-green-ink); border-bottom: 1px solid var(--adon-green); }
</style>

<?php get_footer();
