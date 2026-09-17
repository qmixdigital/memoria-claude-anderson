<?php
/**
 * Template Name: Contato (Incast)
 *
 * Form 2-colunas (Nome+Email lado-a-lado), campo "Programa/Famoso".
 * Honeypot: telefone_extra. Visual table-like.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$status = isset( $_GET['cf'] ) ? sanitize_key( $_GET['cf'] ) : '';
$ok    = $status === '1';
$erro  = $status === '0' ? sanitize_text_field( $_GET['e'] ?? '' ) : '';
$nonce = wp_create_nonce( 'ic_contato' );
$ts    = time();
?>

<div class="ic-layout--single">

    <article class="ic-post" style="margin-top:32px">

        <span class="ic-post__kicker">Fale com a redação</span>
        <h1 class="ic-post__title">Sugira pauta, comente, corrija</h1>
        <p class="ic-post__lead" style="margin-bottom:32px">
            Times de programas, assessorias de famosos e leitores: este é o canal direto da redação.
        </p>

        <?php if ( $ok ) : ?>
            <div style="background:#fdf3f7; border:1px solid #c8326c; padding:16px 20px; margin:0 0 24px;">
                <strong style="display:block; margin-bottom:4px; color:#c8326c;">Mensagem recebida.</strong>
                Em até 48 horas em dias úteis um editor responde no e-mail informado.
            </div>
        <?php endif; ?>

        <?php if ( $erro ) : ?>
            <div style="background:#fff3f3; border:1px solid #cc3030; padding:16px 20px; margin:0 0 24px;">
                <strong style="display:block; margin-bottom:4px;">Erro:</strong>
                <?php echo esc_html( $erro ); ?>
            </div>
        <?php endif; ?>

        <form method="post" action="" style="border:1px solid var(--line); padding:24px; background:var(--paper);">
            <input type="hidden" name="ic_acao" value="enviar">
            <input type="hidden" name="ic_nonce" value="<?php echo esc_attr( $nonce ); ?>">
            <input type="hidden" name="ic_t" value="<?php echo esc_attr( $ts ); ?>">

            <div style="position:absolute; left:-9999px;" aria-hidden="true">
                <label for="ic-hp">Telefone alternativo</label>
                <input type="text" id="ic-hp" name="telefone_extra" tabindex="-1" autocomplete="off">
            </div>

            <table style="width:100%; border-collapse:separate; border-spacing:0 14px;">
                <tr>
                    <td style="padding-right:10px; width:50%;">
                        <label for="ic-n" style="display:block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; color:var(--ink-2);">Quem fala</label>
                        <input type="text" id="ic-n" name="quem" required maxlength="120"
                               style="width:100%; padding:10px 14px; font-size:15px; border:none; border-bottom:2px solid var(--line); background:transparent; color:var(--ink); outline:none;"
                               onfocus="this.style.borderBottomColor='#c8326c'" onblur="this.style.borderBottomColor='var(--line)'">
                    </td>
                    <td style="padding-left:10px; width:50%;">
                        <label for="ic-e" style="display:block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; color:var(--ink-2);">Onde respondemos</label>
                        <input type="email" id="ic-e" name="contato_email" required maxlength="180"
                               style="width:100%; padding:10px 14px; font-size:15px; border:none; border-bottom:2px solid var(--line); background:transparent; color:var(--ink); outline:none;"
                               onfocus="this.style.borderBottomColor='#c8326c'" onblur="this.style.borderBottomColor='var(--line)'">
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <label for="ic-prog" style="display:block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; color:var(--ink-2);">Programa, famoso ou matéria que motivou (opcional)</label>
                        <input type="text" id="ic-prog" name="programa" maxlength="200"
                               style="width:100%; padding:10px 14px; font-size:15px; border:none; border-bottom:2px solid var(--line); background:transparent; color:var(--ink); outline:none;"
                               placeholder="Ex: BBB 24, Faustão, A Fazenda, ou link da matéria">
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <label for="ic-cat" style="display:block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; color:var(--ink-2);">Categoria do contato</label>
                        <select id="ic-cat" name="categoria" required
                                style="width:100%; padding:10px 14px; font-size:15px; border:none; border-bottom:2px solid var(--line); background:transparent; color:var(--ink); outline:none;">
                            <option value="">— Escolha —</option>
                            <option value="dica">Dica de pauta</option>
                            <option value="comentario">Comentário sobre matéria</option>
                            <option value="correcao">Correção / direito de resposta</option>
                            <option value="release">Press release / divulgação</option>
                            <option value="outro">Outro</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <label for="ic-corpo" style="display:block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; color:var(--ink-2);">Sua mensagem</label>
                        <textarea id="ic-corpo" name="corpo" rows="6" required minlength="25" maxlength="3000"
                                  style="width:100%; padding:12px 14px; font-size:15px; border:1px solid var(--line); background:transparent; color:var(--ink); font-family:var(--sans); resize:vertical; line-height:1.6; outline:none;"
                                  onfocus="this.style.borderColor='#c8326c'" onblur="this.style.borderColor='var(--line)'"></textarea>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="padding-top:8px;">
                        <button type="submit" style="background:var(--ink); color:var(--paper); border:none; padding:12px 28px; font-family:var(--sans); font-size:14px; font-weight:600; cursor:pointer; letter-spacing:.04em;">
                            Enviar à redação →
                        </button>
                    </td>
                </tr>
            </table>

            <p style="font-size:12px; color:var(--muted); margin:18px 0 0; padding-top:14px; border-top:1px solid var(--line);">
                Ao enviar você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>" style="color:#c8326c;">política de privacidade</a>. Não compartilhamos seus dados.
            </p>
        </form>

    </article>

    <aside class="ic-sidebar" role="complementary">
        <div class="ic-widget">
            <h4>Categorias</h4>
            <ul>
                <?php
                $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 6, 'hide_empty' => true ) );
                foreach ( $cats as $c ) {
                    echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                }
                ?>
            </ul>
        </div>
        <div class="ic-widget">
            <h4>Sobre o contato</h4>
            <p style="font-size:13px; line-height:1.55; color:var(--muted); margin:0">
                Editorial responde de segunda a sexta. Para press kits e fotos, anexe link público (Drive/WeTransfer).
            </p>
        </div>
    </aside>

</div>

<?php get_footer();
