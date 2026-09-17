---
name: reference-wprocket-substr-fatal
description: WP-Rocket derruba o site com TypeError em substr() no Cloudflare.php; correcao e o cast (string) na linha 496
metadata:
  type: reference
---

O WP-Rocket quebra o site inteiro com **erro critico do WordPress (HTTP 500)**
e tambem impede o wp-cli de carregar:

    Fatal error: Uncaught TypeError: substr(): Argument #1 ($string)
    must be of type string, int given in
    wp-content/plugins/wp-rocket/inc/ThirdParty/Plugins/CDN/Cloudflare.php:496

**Causa:** em `unregister_callback()` o plugin percorre
`$wp_filter[$hook]->callbacks[$priority]` e chama `substr($key, ...)`. O PHP
converte automaticamente chave de array puramente numerica para `int`, e no
PHP 8 `substr()` com int lanca TypeError. Basta um plugin registrar callback
com chave numerica para derrubar tudo. Nao ha update do plugin que corrija
(3.20.1.2 ja e a ultima disponivel nessas contas).

**Correcao (1 linha, linha 496):**

    if ( substr( (string) $key, - strlen( $method ) ) !== $method ) {

Sempre com backup `.bak-DATA` antes, e conferir com `php -l`.

**Aplicado em 28/08/2026:**
- `pael.com.br` (hostinger-vps1, v3.20.1.2) estava **fora do ar com 500**
- `qmix.digital` (hostverge, raiz do public_html, v3.17.3.1) estava vulneravel
  mas ainda funcionando; patch preventivo

**O patch some se o plugin for atualizado.** Se um site com WP-Rocket cair com
500 depois de update, e a primeira coisa a conferir.

Sintoma irmao ja conhecido: o mesmo fatal aparecia como ruido ao rodar wp-cli
nesta hospedagem, e a giria era usar `--skip-plugins=wp-rocket`. Isso mascarava
o problema real: o site publico nao tem como pular o plugin.
Relacionado: [[reference-hostinger-vps1]] se existir, e
[[feedback-litespeed-js-optimization-quebra-gutenberg]].
