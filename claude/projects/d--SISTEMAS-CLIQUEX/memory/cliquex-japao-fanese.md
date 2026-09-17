---
name: cliquex-japao-fanese
description: 7o e 8o money sites Teste IPTV (trabalhonojapao.com.br e fanese.com.br), conta Endrick, prontos aguardando propagacao
metadata:
  type: project
---

**trabalhonojapao.com.br (Kioku TV) e fanese.com.br (Prisma TV)** — 7o e 8o sites do silo de 110 paginas, feitos em 2026-09-02 na conta **Endrick `011fa32b46296a88d9ec00fc1b136f64`**. Zonas `941039c5a773d942b170521b7a16a645` e `2a6e216e1072ba141f37c5492f75e609`, as duas **ativas** desde 2026-09-03 (NS `damien`/`jill`).

Projetos Pages criados e no ar em `trabalhonojapao.pages.dev` e `fanese.pages.dev` (113 paginas cada: 110 do silo + termos + privacidade + home). Design proprio de cada um: **japao** = papel washi claro `#f7f3ea` + indigo `#1f3a93` + vermelhao `#d8452e`, DM Serif Display + Outfit, tom do conteudo **comparativo/analitico**; **fanese** = dark ameixa `#120b18` + magenta `#ff3d8b` + lilas `#b48cff`, Archivo + Epilogue, tom **passo a passo/tutorial**. Fontes ja self-hosted desde o primeiro deploy (`/fonts/`), schema completo (WebSite/Organization/CollectionPage+ItemList/BreadcrumbList/VideoObject/ImageObject/Product+Review/FAQPage), sitemap 113 URLs com `xmlns:video`, favicons completos, OG 1200x630, chave IndexNow.

Scripts genericos (servem para o proximo site da rede, so acrescentar entrada no CFG): `nb_builder.py`, `nb_finalize.py`, `nb_assets.py`, `nb_fonts.py`, `nb_deploy.py`, `nb_harden.py`, `nb_cf.py` no scratchpad da sessao.

**GOTCHA de token:** o token da conta26 (Endrick) em `contas.json` **nao serve para Pages** (Authentication error 10000, e ate `/user/tokens/verify` falha) — usar o token **`master`** (busca por `nome=="master"`), que alcanca Pages nessa conta. Serve tambem para as zonas.

**(feito) Falta fazer quando propagar:** adicionar dominio custom (apex + www) no projeto Pages, conferir CNAME, testar HTTP 200 no dominio, IndexNow das 113 URLs. Seguranca ja aplicada (WAF com skip de bot verificado, rate limit 200/10s, security headers + CSP, SSL strict, HSTS, www->apex). Bot Fight Mode continua dando `10405` com esse esquema de token. Ver [[cliquex-silo-rblc-replicas]], [[cliquex-seguranca-playbook]], [[cliquex-runware-video]].

**NO AR NO DOMINIO (2026-09-03).** Dominio custom (apex + www) ligado nos dois projetos Pages, IndexNow enviado (113 URLs cada, HTTP 202). Confirmou-se de novo o gotcha da rede: **o Cloudflare NAO cria o DNS sozinho** ao adicionar o dominio custom no Pages, mesmo com a zona ja ativa. Os dominios ficam em `initializing`/`pending` para sempre ate voce criar na mao o **CNAME do apex e do www apontando para `<projeto>.pages.dev`, proxied**. Depois disso o certificado sai em poucos minutos. Durante esse intervalo alguns caminhos devolvem **522** de forma intermitente (vi no `.txt` do IndexNow e num woff2 do trabalhonojapao): e propagacao da borda, nao erro de configuracao, e some sozinho, mas vale repetir o teste antes de sair caçando bug.

Checagem final feita nos dois: home, pagina de aparelho, pagina de app, sitemap, robots, hero-tv.mp4, legais, chave IndexNow, fonte woff2 (`200 font/woff2`), `www` 301 para o apex preservando o caminho, e **Googlebot com 200** na home.
