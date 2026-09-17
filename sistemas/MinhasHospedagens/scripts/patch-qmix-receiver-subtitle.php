<?php
/**
 * Remenda o qmix-receiver.php para aceitar os campos opcionais do Antônio:
 *
 *   meta_description -> postmeta rank_math_description
 *   subtitle         -> postmeta qmix_subtitle (renderizado pelo qmix-subtitulo.php)
 *
 * Não sobrescreve o arquivo: aplica dois remendos, preservando o namespace e a
 * chave de API de cada site. Idempotente.
 *
 * Uso: php patch-qmix-receiver-subtitle.php /caminho/qmix-receiver.php
 * Saída: OK | JA_APLICADO | ERRO:<motivo>
 */
$alvo = $argv[1] ?? '';
if ( ! $alvo || ! is_file( $alvo ) ) { echo "ERRO:arquivo-inexistente\n"; exit( 1 ); }

$s = file_get_contents( $alvo );
if ( strpos( $s, 'qmix_subtitle' ) !== false ) { echo "JA_APLICADO\n"; exit( 0 ); }

$velho = "    \$excerpt       = !empty(\$p['excerpt']) ? sanitize_textarea_field(\$p['excerpt']) : '';";
if ( strpos( $s, $velho ) === false ) { echo "ERRO:ancora-excerpt\n"; exit( 1 ); }

$novo = $velho . "\n"
	. "    // Campos opcionais do modulo de editores externos (Antonio). Chegam com\n"
	. "    // htmlspecialchars(ENT_QUOTES) — sem o decode virariam &quot; na pagina.\n"
	. "    \$subtitle      = !empty(\$p['subtitle'])\n"
	. "        ? sanitize_text_field(html_entity_decode((string) \$p['subtitle'], ENT_QUOTES, 'UTF-8')) : '';\n"
	. "    \$meta_desc_in  = !empty(\$p['meta_description'])\n"
	. "        ? sanitize_text_field(html_entity_decode((string) \$p['meta_description'], ENT_QUOTES, 'UTF-8')) : '';";
$s = str_replace( $velho, $novo, $s );

$velho2 = "    if (\$media_id)          set_post_thumbnail(\$pid, \$media_id);";
if ( strpos( $s, $velho2 ) === false ) { echo "ERRO:ancora-thumbnail\n"; exit( 1 ); }

$novo2 = $velho2 . "\n\n"
	. "    // So grava quando veio preenchido: nos outros artigos o Rank Math segue\n"
	. "    // gerando a descricao sozinho, como sempre fez.\n"
	. "    if (\$subtitle !== '')     update_post_meta(\$pid, 'qmix_subtitle', \$subtitle);\n"
	. "    if (\$meta_desc_in !== '') update_post_meta(\$pid, 'rank_math_description', \$meta_desc_in);";
$s = str_replace( $velho2, $novo2, $s );

file_put_contents( $alvo, $s );

// valida a sintaxe do resultado; se quebrou, restaura na hora
$out = [];
exec( 'php -l ' . escapeshellarg( $alvo ) . ' 2>&1', $out, $rc );
if ( $rc !== 0 ) { echo "ERRO:sintaxe\n"; exit( 1 ); }

echo "OK\n";
