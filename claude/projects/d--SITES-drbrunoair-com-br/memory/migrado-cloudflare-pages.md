---
name: migrado-cloudflare-pages
description: "Em 17/09/2026 o drbrunoair.com.br saiu da VPS para o Cloudflare Pages, com o blog WordPress convertido em HTML; a fonte de verdade agora é o repo D:\\GitHub\\drbrunoair.com.br"
metadata: 
  node_type: memory
  type: project
  originSessionId: b0fd5017-2e3c-42ee-a0c3-faab1c80e7a2
  modified: 2026-09-17T09:03:41.535Z
---

**A pasta `D:\SITES\drbrunoair.com.br` é legado.** Desde 17/09/2026 o site vive em
`D:\GitHub\drbrunoair.com.br` (repo `qmixdigital/drbrunoair.com.br`) e é servido
pelo Cloudflare Pages (projeto `drbrunoair`, subdomínio `drbrunoair-4ml.pages.dev`,
conta "Dr. Bruno AIR"). Ler o CLAUDE.md de lá antes de qualquer coisa.

**Por que e como:** o blog era WordPress + Jannah em /blog na VPS. 184 posts,
zero comentários, sem CPT. Exportei via `wp eval-file` (conteúdo renderizado +
meta RankMath + `_wp_old_slug`), regerei com template próprio no design editorial
do site (`src/blog/build.py`), e converti os 216 redirects do `.htaccess` mais
27 slugs antigos em `_redirects`. Post caiu de 134 KB para 26 KB. Validação:
241/241 URLs, 476/476 redirects, Lighthouse A11y/BP/SEO 100.

**Deploy:** GitHub Actions + wrangler (não a integração Git do painel, que exige
OAuth de navegador e não tem API). Push na main = build + verificar + publicar.

**Armadilhas vividas nesse dia:**
- Re-adicionar a zona em outra conta Cloudflare importou os IPs do proxy antigo
  como registro A e derrubou o site (erro 1000). Também zerou as settings
  (HTTPS forçado, SSL strict, TLS mínimo). Ver [[nginx-serve-html-direto]] para
  a conta e os IDs.
- `wrangler pages deploy` cria um `wrangler.jsonc` de Worker e mexe no
  `.gitignore` sem pedir. Apagar depois (já está no .gitignore).
- O nome `drbrunoair` já existia no Pages globalmente: virou `drbrunoair-4ml`.
- Escrever regex com `\b` dentro de heredoc no Bash tool grava um caractere
  backspace (`\x08`) invisível no arquivo; o regex nunca casa e `sed`/`Read`
  não mostram. Para editar código com barras invertidas, usar Write/Edit ou um
  script .py gravado com Write. Detectar com `grep -rln $'\x08'`.
- O PSI (API do PageSpeed) devolve "lighthouseError" 500 aleatório em hosts
  pages.dev; Lighthouse local (`npx lighthouse`) é a alternativa confiável.

**SEO de conteúdo (17/09, depois da migração):** `src/blog/variar_ancoras.py`
variou 317 âncoras internas (limite de 2x por texto+destino no site inteiro,
contando as 14 páginas estáticas), `src/blog/seo-overrides.json` tem 116
descriptions, 12 titles e as 10 categorias escritos à mão, com prioridade
máxima no build. `src/auditar_seo.py https://drbrunoair.com.br` deve dar
"NENHUM PROBLEMA".

**O que ficou para trás de propósito:** o WordPress continua íntegro na VPS
(`/home/boot/web/drbrunoair.com.br/public_html/blog`, banco `boot_brunoair`),
inacessível porque o DNS não aponta mais lá. É a rede de segurança. Só apagar
depois de semanas estáveis. O certificado Let's Encrypt dele vai falhar na
renovação (DNS mudou): ignorar os e-mails do HestiaCP sobre isso.
