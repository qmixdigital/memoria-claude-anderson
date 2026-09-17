---
name: ingresso-do-motor-para-o-pages
description: "Portal no Pages precisa de um host de ingresso na VPS para a API de artigos e o contato; o que travou (HTTP-01, WAF, permissões do usuário portais) e como se resolveu"
metadata:
  type: project
---

Quando o domínio sai da VPS e vai para o Pages, os POST do sistema de conteúdo
(`/<ns>/artigos`, `/wp-json/<ns>/v1/artigos`) e o formulário (`/api/contato`)
passam a chegar no Pages. O `functions/_middleware.js` gerado pelo
`pages_pack.js` repassa esses POST para um host de ingresso da VPS
(`og-ingresso.qmix.com.br` na opengravity) com `X-Ingress-Secret` e
`X-Portal-Host`; o vhost do ingresso exige o segredo e repassa ao receptor com
`Host = X-Portal-Host` (o receptor acha o artigo pela chave e o contato pelo Host).

**Why:** sem isso a plataforma do Antônio recebe 405/404 do Pages e para de
entregar, e o contato morre em silêncio. O DNS do ingresso e o CNAME do domínio
são mudança de DNS: só com autorização dele.

**How to apply / o que travou em 16/09/2026:**
- Certificado do ingresso: HTTP-01 pelo webroot NÃO passa pela zona qmix.com.br;
  usar DNS-01 com o hook `/opt/portal-engine/cf-dns-auth.sh` (TXT pela API).
- A zona qmix.com.br devolve 403 a POST sem UA de navegador: regra de WAF
  "skip" para `http.host eq "og-ingresso.qmix.com.br"` (feita com o token
  master, que tem WAF:Edit; o token do Pages não tem).
- O motor roda como `portais`: `pages.json` e o token em 640 root:portais,
  nada criado por root em `public/`, `functions/` ou `.wrangler/`; wrangler
  precisa de HOME gravável (`/opt/portal-engine`).
- Domínio recém-adicionado ao projeto fica "pending" por minutos e as rotas não
  cacheadas dão 522; conferir só depois de "active active".
Ver [[portais-no-cloudflare-pages]].
