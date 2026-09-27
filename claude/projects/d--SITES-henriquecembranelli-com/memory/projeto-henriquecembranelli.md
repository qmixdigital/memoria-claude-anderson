---
name: projeto-henriquecembranelli
description: Site do Dr. Henrique Cembranelli (ortopedista mão e punho, BH) migrado do Wix para HTML estático; repo, conta Cloudflare, preview e pendências
metadata:
  type: project
---

Cliente novo desde 20/09/2026. Site original no Wix (www.henriquecembranelli.com, feito pela FA7),
one-page + política de privacidade. Recriado em HTML estático em `d:\SITES\henriquecembranelli.com`.

- Repo: `qmixdigital/henriquecembranelli.com` (privado, branch `main`), criado pela API com o token de `Documents/APIs/github.txt` (o `gh` não está instalado nesta máquina).
- Conta Cloudflare do cliente: `db7f7f1b755edba76754fd154439b50e` (criada pelo Anderson em 20/09/2026). O token de `Documents/APIs/cloudflare-pages.txt` alcança essa conta (expira 15/10/2026).
- Preview por upload direto: projeto Pages `henriquecembranelli-preview` (https://henriquecembranelli-preview.pages.dev). É temporário: apagar quando o projeto ligado ao Git existir.
- Ligar o Git ao Pages pela API falhou (erro 8000011): o GitHub App do Cloudflare Pages precisa ser instalado pelo painel, na conta nova.
- Keyword principal (definida pelo Anderson em 20/09/2026): "ortopedista especialista em mão em Belo Horizonte", com o nome do médico no início do H1 e no title, para passar autoridade de entidade. URL antiga `/politicadeprivacidade` redireciona 301 no `_redirects`.
- WhatsApp: 5531996608166 (Dr.) e 5531998185436 (Körpem, atendimento particular). CRM-MG 49621, RQE 33937.

- Estrutura final (20/09/2026, pedido do cliente via Anderson): home = keyword; `/dr-henrique-cembranelli` = página da entidade (ProfilePage + Person, recebe âncoras de nome); 4 páginas de tratamento (foco do cliente): túnel do carpo, dedo em gatilho, De Quervain, rizartrose. Referência de estrutura: `d:/SITES/dr-henrique-bufaical-next` (texto NÃO copiado). Fotos das páginas de tratamento de banco gratuito via `banco_img.py`.
- Regra aplicada do primeiro link: nas internas, o breadcrumb leva a âncora de keyword para a home (variada por página) e é o primeiro `<a>` do corpo; um só link para a home por página.
- Git Credential Manager travou em 20/09 esperando prompt; push funciona com o token na URL e `-c credential.helper=`.

- 20/09/2026, redesign: Anderson pediu para "modernizar e evoluir" o layout original (mobile-first, 80% dos visitantes no celular). Fluxo da skill `design-fable`: 2 direções em mockup (`_mockups/a-evolucao.html` mantém Playfair; `_mockups/b-contemporanea.html` tudo sans), screenshots 1280 e 390, revisor com veto, aprovação dele por print ANTES de aplicar. O site do Dr. Eduardo passou para outro chat e NÃO recebe o redesign por enquanto. **Escolha do Anderson (20/09/2026): direção A**, aplicada e publicada no preview; mockups ficam em `_mockups/` (gitignored). Tokens: navy #062439, dourado #ad8c62 (texto #75573a, sobre navy #cdb08a), Playfair Display nos títulos, Manrope no corpo (WOFF2 local, Inter removida), raio 16px, 'moldura deslocada' dourada nas fotos, barra fixa de WhatsApp abaixo de 1024px e botão flutuante só no desktop.

- **NO AR em 21/09/2026 em `https://henriquecembranelli.com` (canônico SEM www, decisão do Anderson).** Domínio e DNS ficaram no Wix (Wix não deixa trocar NS de domínio comprado lá; Cloudflare Registrar exige NS já no CF, então a zona criada na conta Médicos BH ficou pendente). Solução: A @ e A www → VPS opengravity (77.37.69.175); no Hestia o domínio usa o template nginx `pages-proxy` (proxy da raiz para henriquecembranelli-preview.pages.dev, www → 301 raiz, LE para os dois, forcessl + HSTS). Deploy continua só no Pages. Detalhes no README do repo. Se rebuildar o domínio no Hestia, repor `https://` nos `nginx*.conf_redirect`.
- Pages: `_redirects` NÃO aceita regra por host (www → raiz não funciona lá); por isso o www vai pela VPS.
- O classificador do modo automático bloqueia edição de DNS/SSL pela API do Cloudflare ("DNS / Domain / Cert Changes"); certbot via Hestia (`v-add-letsencrypt-domain`) passou.

**Pendências:** ID do GA4 em `js/main.js`; conectar repo no Pages (painel); Search Console + sitemap; GBP com o site sem www.

- **22/09/2026: NO AR em `https://drhenriquecembranelli.com.br` (canônico, sem www).** Zona `0d57240a78e6676d7abacc9972eceed9` ativa na conta Médicos BH; CNAME `@`/`www` proxied → `henriquecembranelli-preview.pages.dev` (custom domains do projeto Pages). main do repo já está no `.com.br`. O `henriquecembranelli.com` (Wix → VPS opengravity) faz 301 URL a URL para o `.com.br` (Hestia redirect + `nginx.forcessl.conf` direto para o `.com.br`; não rebuildar o domínio sem repor). Sites do Eduardo e da Körpem já linkam o `.com.br` (commits 22/09). Removidos os hosts `.com` do projeto Pages.
- **Pendente:** regra www → raiz e SSL Full (strict)/Always HTTPS na zona nova: o token `cloudflare-pages.txt` não tem permissão de Zone Settings nem Rulesets (erro "Authentication error"); Anderson faz no painel ou amplia o token. GBP no domínio novo. Search Console: propriedades `sc-domain:` do `.com` e do `.com.br` com a service account `seoqmix` (chave `<<REMOVIDO>>`) como usuário completo; sitemap enviado por API em 22/09. Bing Webmaster: site adicionado, verificado por `BingSiteAuth.xml` (código 73706CE0268660E48484AF2A5E9D2730) e sitemap + 7 URLs enviados por API em 22/09 (chave `bing-webmaster-tools.txt`). Falta a 'Mudança de endereço' do `.com` para o `.com.br` no painel do GSC (não tem API). A zona veio com MX nulo, SPF `-all` e DMARC reject: apagar se o cliente quiser e-mail no `.com.br`.
