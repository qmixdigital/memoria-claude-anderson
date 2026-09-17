<?php
/**
 * Template Name: Contato (Ebookcult)
 *
 * Form 4-passos numerados (cada bloco é um fieldset com badge "01 02 03 04").
 * Campo "Tema central". Honeypot: nome_alternativo. Action: ec_envio_pauta=submit.
 * Estrutura propositalmente distinta dos outros 3 portais (oie/ic/rde).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$flag  = isset( $_GET['msg'] ) ? sanitize_key( $_GET['msg'] ) : '';
$ok    = $flag === 'ok';
$erro  = $flag === 'err' ? sanitize_text_field( $_GET['detalhe'] ?? '' ) : '';
$nonce = wp_create_nonce( 'ec_contato_pauta' );
$ts    = time();
?>

<div class="ec-layout">
    <article class="ec-main ec-post">

        <nav class="ec-breadcrumb" aria-label="Localização">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
            <span class="ec-breadcrumb__sep">|</span>
            <span>Contato</span>
        </nav>

        <header class="ec-post__header">
            <span class="ec-post__kicker">Fale com a redação</span>
            <h1 class="ec-post__title">Proponha leitura, curso ou parceria</h1>
            <p class="ec-post__lead">
                A caixa de pautas chega direto para um editor. Lemos tudo. Releases sem contexto, indicações de produto sem newsletter prévia ou propostas de SEO/backlink são descartadas em silêncio. Para o resto, em até 48 horas em dias úteis você tem retorno.
            </p>
        </header>

        <?php if ( $ok ) : ?>
            <div class="ec-flash ec-flash--ok" role="status">
                <strong>Recebemos sua proposta.</strong>
                Um editor responde no e-mail informado em até 48h em dias úteis. Se não chegar nada nesse prazo, considere reenviar com outro endereço (acontece da mensagem cair em spam do nosso lado).
            </div>
        <?php endif; ?>

        <?php if ( $erro ) : ?>
            <div class="ec-flash ec-flash--err" role="alert">
                <strong>Não conseguimos enviar.</strong>
                <?php echo esc_html( $erro ); ?>
            </div>
        <?php endif; ?>

        <form method="post" action="" class="ec-pauta" novalidate>
            <input type="hidden" name="ec_envio_pauta" value="submit">
            <input type="hidden" name="ec_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
            <input type="hidden" name="ec_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

            <div class="ec-pauta__honey" aria-hidden="true">
                <label for="ec-honey">Nome alternativo (deixe vazio)</label>
                <input type="text" id="ec-honey" name="nome_alternativo" tabindex="-1" autocomplete="off">
            </div>

            <fieldset class="ec-pauta__step">
                <legend>
                    <span class="ec-pauta__num">01</span>
                    <span class="ec-pauta__legend">Quem está escrevendo</span>
                </legend>
                <div class="ec-pauta__field">
                    <label for="ec-autor">Nome completo <span class="ec-req">obrigatório</span></label>
                    <input type="text" id="ec-autor" name="autor" required maxlength="120" autocomplete="name">
                </div>
                <div class="ec-pauta__field">
                    <label for="ec-email">E-mail para resposta <span class="ec-req">obrigatório</span></label>
                    <input type="email" id="ec-email" name="email_resposta" required maxlength="180" autocomplete="email">
                </div>
            </fieldset>

            <fieldset class="ec-pauta__step">
                <legend>
                    <span class="ec-pauta__num">02</span>
                    <span class="ec-pauta__legend">Tema central da proposta</span>
                </legend>
                <div class="ec-pauta__field">
                    <label for="ec-tema">Sobre qual livro, curso, marca ou tema?</label>
                    <input type="text" id="ec-tema" name="tema_central" maxlength="200"
                           placeholder="Ex: livro 'Atomic Habits', curso de copywriting, tendência de IA generativa">
                    <small class="ec-pauta__hint">Opcional, mas ajuda muito a direcionar para o editor certo.</small>
                </div>
            </fieldset>

            <fieldset class="ec-pauta__step">
                <legend>
                    <span class="ec-pauta__num">03</span>
                    <span class="ec-pauta__legend">Tipo de proposta</span>
                </legend>
                <div class="ec-pauta__field">
                    <label for="ec-modal">Modalidade <span class="ec-req">obrigatório</span></label>
                    <select id="ec-modal" name="modalidade" required>
                        <option value="">Selecione</option>
                        <option value="livro">Indicação ou resenha de livro</option>
                        <option value="curso">Curso, mentoria ou formação</option>
                        <option value="release">Release / lançamento de produto</option>
                        <option value="dica">Dica de pauta editorial</option>
                        <option value="colaboracao">Colaboração editorial (texto autoral)</option>
                        <option value="correcao">Correção em matéria publicada</option>
                    </select>
                </div>
            </fieldset>

            <fieldset class="ec-pauta__step">
                <legend>
                    <span class="ec-pauta__num">04</span>
                    <span class="ec-pauta__legend">Sua mensagem</span>
                </legend>
                <div class="ec-pauta__field">
                    <label for="ec-desc">Descreva a proposta <span class="ec-req">obrigatório</span></label>
                    <textarea id="ec-desc" name="descricao" rows="8" required minlength="40" maxlength="3500"
                              placeholder="Conte o que motivou a mensagem. Quanto mais contexto, melhor."></textarea>
                    <small class="ec-pauta__hint">Entre 40 e 3500 caracteres.</small>
                </div>
            </fieldset>

            <div class="ec-pauta__submit">
                <button type="submit" class="ec-btn">Enviar proposta</button>
                <p class="ec-pauta__note">
                    Ao enviar, você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>. Não compartilhamos dados.
                </p>
            </div>
        </form>

    </article>

    <aside class="ec-sidebar" role="complementary">
        <div class="ec-widget">
            <h4>O que cobrimos</h4>
            <p style="font-size:13px; line-height:1.6; color:var(--ec-muted); margin:0;">
                Leitura aplicada, ebooks, formação online, marketing digital, produtividade e cultura literária. Não cobrimos: criptoativos, apostas, infoprodutos sem prova social.
            </p>
        </div>
        <div class="ec-widget">
            <h4>Como respondemos</h4>
            <p style="font-size:13px; line-height:1.6; color:var(--ec-muted); margin:0;">
                Toda proposta é lida por um editor. Resposta em 48h em dias úteis. Releases sem contexto editorial não recebem retorno.
            </p>
        </div>
    </aside>
</div>

<style>
.ec-flash { padding: var(--ec-sp-3) var(--ec-sp-4); margin: var(--ec-sp-4) 0 var(--ec-sp-5); }
.ec-flash--ok  { background: var(--ec-bg-warm); border-left: 4px solid var(--ec-primary); color: var(--ec-ink-2); }
.ec-flash--err { background: #FFF3F3; border-left: 4px solid #C0392B; color: #6E1A1A; }
.ec-flash strong { display: block; font-size: 16px; margin-bottom: 4px; }

.ec-pauta { margin-top: var(--ec-sp-5); }
.ec-pauta__honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

.ec-pauta__step {
    margin: 0 0 var(--ec-sp-5);
    padding: var(--ec-sp-4) var(--ec-sp-4) var(--ec-sp-3);
    border: 1px solid var(--ec-line);
    background: var(--ec-paper);
    box-shadow: var(--ec-shadow-flat);
}
.ec-pauta__step legend {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 8px;
    margin-left: -8px;
}
.ec-pauta__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--ec-grad);
    color: var(--ec-ink);
    font-family: var(--ec-mono);
    font-size: 14px;
    font-weight: 800;
    box-shadow: var(--ec-shadow-neu);
}
.ec-pauta__legend {
    font-size: 16px;
    font-weight: 700;
    color: var(--ec-ink);
    letter-spacing: -0.01em;
}

.ec-pauta__field { margin: var(--ec-sp-3) 0; }
.ec-pauta__field label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--ec-ink-2);
    margin-bottom: 6px;
    letter-spacing: 0.01em;
}
.ec-req {
    display: inline-block;
    font-size: 10px;
    color: var(--ec-primary);
    font-weight: 700;
    letter-spacing: 0.12em;
    margin-left: 8px;
    font-family: var(--ec-mono);
}
.ec-pauta__hint {
    display: block;
    font-size: 12px;
    color: var(--ec-muted);
    margin-top: 6px;
}

.ec-pauta__submit {
    padding: var(--ec-sp-4);
    background: var(--ec-bg-warm);
    border: 1px solid var(--ec-line);
    display: flex;
    flex-wrap: wrap;
    gap: var(--ec-sp-3);
    align-items: center;
    justify-content: space-between;
}
.ec-pauta__note {
    margin: 0;
    font-size: 12px;
    color: var(--ec-muted);
    flex: 1;
    min-width: 240px;
}
.ec-pauta__note a { color: var(--ec-primary); }
</style>

<?php
get_footer();
