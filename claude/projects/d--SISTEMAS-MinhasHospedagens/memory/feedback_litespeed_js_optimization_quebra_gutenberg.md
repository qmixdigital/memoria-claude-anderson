---
name: cloudflare-cacheia-js-antigo-do-wp-e-quebra-gutenberg-ap-s-update-major
description: "Após `wp core update` major (ex 6.9.4→7.0), Cloudflare continua servindo os bundles JS antigos cacheados com max-age=31536000 (1 ano). URL idêntica antes/depois (LiteSpeed remove ?ver=). Browser carrega private-apis/theme/upload-media antigos → erros \"module already registered\" / \"Cannot read properties of undefined\" → tela branca no editor. Fix: mu-plugin que adiciona cache-buster query nas URLs admin."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
---

Quando rodar `wp core update` em sites na rede QMIX (Hostinger + Cloudflare + LiteSpeed Cache), os bundles JS do Gutenberg permanecem em cache no Cloudflare por **até 1 ano** (`Cache-Control: public, max-age=31536000`). O nginx Hostinger serve assets estáticos com esse cabeçalho de cache longo e Cloudflare honra.

Sintoma no editor `/wp-admin/post.php?...&action=edit`:
- Tela completamente branca
- Console mostra:
  - `Uncaught Error: ... module "@wordpress/upload-media" which is already registered`
  - `Uncaught Error: ... module "@wordpress/theme"` (private-apis whitelist rejection)
  - `Cannot read properties of undefined (reading 'privateApis')` em patterns/block-library
  - `Cannot read properties of undefined (reading 'SETTINGS_DEFAULTS')` em editor
  - `Cannot unlock an undefined object` em edit-post
  - `Cannot read properties of undefined (reading 'LinkControl')` em format-library
  - `Cannot read properties of undefined (reading 'initializeEditor')` em wp-edit-post-js-after

Servidor responde 200 OK + HTML completo via curl. Disco tem versão WP 7.0 correta. **Cloudflare é que serve versão antiga.**

**Diagnóstico de confirmação:**
```bash
# MD5 do arquivo NO DISCO
ssh host "md5sum /path/wp-includes/js/dist/private-apis.min.js"
# MD5 do arquivo SERVIDO via web
curl -s https://site.com.br/wp-includes/js/dist/private-apis.min.js | md5sum
# Se diferentes → Cloudflare cache stale
curl -sI https://site.com.br/wp-includes/js/dist/private-apis.min.js | grep -iE "age|cf-cache-status"
# "Age: 93920" e "cf-cache-status: HIT" confirmam
# Adicionar ?cb=qualquer-coisa → cf-cache-status: MISS, retorna fresh
```

**Why:** Hostinger nginx serve assets de wp-includes/js/dist/ com max-age 1 ano. Cloudflare edge cacheia respeitando esse header. URLs no HTML normalmente teriam `?ver=X.Y.Z` que mudaria entre versões, MAS o LiteSpeed Cache pode estar removendo query strings via "Remove Query Strings" optimization, ou o `?ver=` nunca esteve presente. Resultado: URL idêntica → cache hit eterno.

**Fix aplicado em advivo.com.br (2026-05-27):**
mu-plugin `wp-content/mu-plugins/zz-cachebust-admin.php` que adiciona `?cb=wp7cb1` em todos `script_loader_src` e `style_loader_src` quando `is_admin()`. URLs novas = Cloudflare MISS = fresh from origin = bundle correto do WP 7.0. Em updates major futuros, basta incrementar o buster (`wp7cb2`, `wp8cb1`, etc.).

```php
<?php
if (!defined('ABSPATH')) exit;
add_filter('script_loader_src', 'qmix_cachebust_admin_assets', 9999, 2);
add_filter('style_loader_src', 'qmix_cachebust_admin_assets', 9999, 2);
function qmix_cachebust_admin_assets($src, $handle) {
    if (!is_admin()) return $src;
    if (strpos($src, '/wp-includes/') === false && strpos($src, '/wp-content/') === false && strpos($src, '/wp-admin/') === false) return $src;
    $buster = 'wp7cb1';
    if (strpos($src, 'cb=') !== false) return $src;
    return add_query_arg('cb', $buster, $src);
}
```

**How to apply:**
- Em todo `wp core update` major na rede, copiar `zz-cachebust-admin.php` para `wp-content/mu-plugins/` de cada site + incrementar `$buster` para algo único do update.
- Rede QMIX 129 sites em 4 hospedagens (qmix, anderson, vps1, hostverge): aplicar em lote após qualquer update major do WP.
- Frontend NÃO afetado por esse mu-plugin (filtro só ativa em `is_admin()`).
- Se Hostinger Cloudflare adicionar API token, melhor purgar diretamente via API. Mu-plugin é o fix sem credenciais.

**Memória descartada anterior**: tentei culpar LiteSpeed JS optimization (`optm-js_min`, `optm-js_comb`, `optm-js_defer`). Realmente são suspeitos mas não eram a causa principal aqui — disable + wipe não resolveu. Causa real foi Cloudflare edge cache.
