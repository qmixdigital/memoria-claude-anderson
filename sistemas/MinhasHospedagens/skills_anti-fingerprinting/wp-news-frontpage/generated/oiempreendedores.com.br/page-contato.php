<?php
/**
 * Template Name: Contato (Oi Empreendedores)
 *
 * Form 1-coluna full-width, com campo "Empresa/Negócio".
 * Honeypot: url_empresa (diferente de website usado em outros portais).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$state = isset( $_GET['c'] ) ? sanitize_key( $_GET['c'] ) : '';
$ok    = $state === 'enviado';
$erro  = $state === 'falha' ? sanitize_text_field( $_GET['m'] ?? '' ) : '';
$nonce = wp_create_nonce( 'oie_pauta_form' );
$ts    = time();
?>

<article class="oie-post" style="max-width:740px; margin:32px auto;">

    <span class="oie-post__kicker">Contato editorial</span>
    <h1 class="oie-post__title">Envie sua pauta</h1>

    <p style="font-size:18px; color:var(--ink-2); margin:0 0 32px; max-width:55ch">
        Histórias de empreendedores, releases de produto, mentorias e parcerias editoriais. Não recebemos propostas de SEO, backlink ou marketing de afiliados.
    </p>

    <?php if ( $ok ) : ?>
        <div role="status" style="background:var(--bg); border-left:4px solid var(--accent); padding:18px; margin:0 0 24px;">
            <strong style="display:block; font-family:var(--oie-font-display); font-style:italic; font-size:18px; margin-bottom:4px;">
                Recebemos sua mensagem.
            </strong>
            Em até 48 horas em dias úteis um editor responde. Se for urgente, escreva direto pela conta de e-mail listada na nossa <a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">página Sobre</a>.
        </div>
    <?php endif; ?>

    <?php if ( $erro ) : ?>
        <div role="alert" style="background:#fff8f0; border-left:4px solid #c0392b; padding:18px; margin:0 0 24px;">
            <strong style="display:block; margin-bottom:4px;">Não foi possível enviar.</strong>
            <?php echo esc_html( $erro ); ?>
        </div>
    <?php endif; ?>

    <form method="post" action="" style="display:flex; flex-direction:column; gap:18px;">
        <input type="hidden" name="oie_pauta_action" value="send">
        <input type="hidden" name="oie_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
        <input type="hidden" name="oie_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

        <div style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;" aria-hidden="true">
            <label for="oie-honey">URL da empresa (deixe vazio)</label>
            <input type="text" id="oie-honey" name="url_empresa" tabindex="-1" autocomplete="off">
        </div>

        <div>
            <label for="oie-nome" style="display:block; font-size:14px; font-weight:600; margin-bottom:6px;">Seu nome <span style="color:#c0392b">*</span></label>
            <input type="text" id="oie-nome" name="nome" required maxlength="120"
                   style="width:100%; padding:12px 14px; font-size:16px; border:1px solid var(--oie-line); background:var(--oie-paper); color:var(--oie-ink);">
        </div>

        <div>
            <label for="oie-email" style="display:block; font-size:14px; font-weight:600; margin-bottom:6px;">E-mail para resposta <span style="color:#c0392b">*</span></label>
            <input type="email" id="oie-email" name="email" required maxlength="180"
                   style="width:100%; padding:12px 14px; font-size:16px; border:1px solid var(--oie-line); background:var(--oie-paper); color:var(--oie-ink);">
        </div>

        <div>
            <label for="oie-empresa" style="display:block; font-size:14px; font-weight:600; margin-bottom:6px;">Empresa ou negócio (se aplicável)</label>
            <input type="text" id="oie-empresa" name="empresa" maxlength="160"
                   style="width:100%; padding:12px 14px; font-size:16px; border:1px solid var(--oie-line); background:var(--oie-paper); color:var(--oie-ink);">
        </div>

        <div>
            <label for="oie-tipo" style="display:block; font-size:14px; font-weight:600; margin-bottom:6px;">O que você quer compartilhar? <span style="color:#c0392b">*</span></label>
            <select id="oie-tipo" name="tipo" required
                    style="width:100%; padding:12px 14px; font-size:16px; border:1px solid var(--oie-line); background:var(--oie-paper); color:var(--oie-ink);">
                <option value="">Escolha…</option>
                <option value="historia">História de empreendedor</option>
                <option value="release">Release / lançamento</option>
                <option value="mentoria">Mentoria / coluna</option>
                <option value="correcao">Correção em matéria publicada</option>
                <option value="outro">Outro</option>
            </select>
        </div>

        <div>
            <label for="oie-msg" style="display:block; font-size:14px; font-weight:600; margin-bottom:6px;">Conte sua história <span style="color:#c0392b">*</span></label>
            <textarea id="oie-msg" name="mensagem" rows="7" required minlength="30" maxlength="3500"
                      style="width:100%; padding:12px 14px; font-size:16px; border:1px solid var(--oie-line); background:var(--oie-paper); color:var(--oie-ink); font-family:inherit; resize:vertical;"></textarea>
            <small style="font-size:12px; color:var(--oie-muted);">Entre 30 e 3500 caracteres. Quanto mais contexto, melhor.</small>
        </div>

        <button type="submit" class="oie-btn" style="align-self:flex-start;">Enviar pauta &rarr;</button>

        <p style="font-size:13px; color:var(--oie-muted); margin:8px 0 0;">
            Ao enviar, você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.
        </p>
    </form>

</article>

<?php get_footer();
