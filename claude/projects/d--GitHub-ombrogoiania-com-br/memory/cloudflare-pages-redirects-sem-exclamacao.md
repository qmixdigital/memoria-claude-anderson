---
name: cloudflare-pages-redirects-sem-exclamacao
description: "No _redirects do Cloudflare Pages o sufixo \"!\" invalida a linha em silencio, e asset estatico tem precedencia sobre a regra"
metadata: 
  node_type: memory
  type: project
  originSessionId: dac55fc5-0b53-42ff-87c9-3a320ad11434
  modified: 2026-09-08T21:10:25.083Z
---

Duas armadilhas do `_redirects` no Cloudflare Pages, as duas silenciosas, encontradas em ombrogoiania.com.br em 08/09/2026:

1. **O sufixo `!` (forced) e sintaxe do Netlify.** No Cloudflare Pages ele nao forca nada: invalida a linha inteira sem erro, sem aviso e sem aparecer no log de build. No ombrogoiania havia tres regras assim, inclusive `https://www.dominio/* https://dominio/:splat 301!`. Resultado: `www.ombrogoiania.com.br` respondia **200** e servia o site inteiro numa segunda versao. So o canonical segurava o sinal.

2. **Asset estatico tem precedencia sobre a regra de redirect.** Enquanto `sobre.html` existia no build, `/sobre` respondia 200 e a regra `/sobre /doutor/ 301` era ignorada. Para o 301 valer, o arquivo precisa sair do deploy (`git rm --cached` + `.gitignore` resolve sem apagar o original do disco).

**Why:** as duas falham em silencio. O deploy passa, o site responde, e a duplicacao www/nao-www pode ficar meses sem ser notada. Vale para toda a rede de sites em Cloudflare Pages, nao so este.

**How to apply:** nunca usar `!` no `_redirects` do Pages. Regra de **hostname** (www para apex) nao funciona no `_redirects`: precisa de Redirect Rule na zona, e ja existe script pronto em `D:\SISTEMAS\Cloudflare\cf_www_apex.py <dominio>` (aceita `--dry-run`). Depois de qualquer mexida em redirect, conferir com cache-buster, porque a borda serve a resposta antiga por um tempo: `curl -sI "https://www.DOMINIO/pagina/?nc=$RANDOM"`.
