---
name: reference-webp-cloudflare-vary
description: Servir WebP por reescrita na origem (.htaccess/LiteSpeed) é inseguro atrás do Cloudflare free; usar referência direta .webp ou CF Polish
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8d9dd106-0331-4431-8d43-88e3c9feee05
---

Servir WebP via **reescrita na origem** (regra `.htaccess` `RewriteCond %{HTTP_ACCEPT} image/webp` ou o "WebP Replacement" do LiteSpeed que reescreve a mesma URL `.jpg` pra webp) é **arriscado atrás do Cloudflare no plano free**: o CF **ignora `Vary: Accept`** (só respeita `Vary: Accept-Encoding`), então cacheia a resposta webp sob a URL `.jpg` e pode **servir webp pra navegador que não suporta → imagem quebrada**. Essa é a causa raiz do problema recorrente de imagens quebradas na rede.

**Formas seguras de servir WebP atrás do Cloudflare:**
1. **Referência direta** ao arquivo `.webp` no HTML/atributo (URL distinta por formato → CF cacheia certo). Foi assim que o conversor anterior do marianacabraldermato fez (arquivos `nome.webp`, ext trocada, referenciados direto no HTML). **SEMPRE manter o original** (`img_optm-rm_bkup=0` no LiteSpeed).
2. **Cloudflare Polish** (precisa CF **Pro**, ~US$20/mês) — converte webp/avif na borda, zero risco na origem.

**NÃO fazer:** ligar reescrita de origem (htaccess Accept-rewrite ou LiteSpeed webp_replace) em site atrás de CF free achando que é seguro. GD (`imagewebp`) gera webp ok no servidor (cwebp costuma estar ausente na Hostinger), mas gerar não basta — o problema é COMO servir. Ver [[reference_orphan_wp_cleanup]] e a lição qmiximoveis (plugin que apagou originais).
