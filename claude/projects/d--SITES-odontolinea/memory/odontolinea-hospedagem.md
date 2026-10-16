---
name: odontolinea-hospedagem
description: Onde o odontolinea.com.br roda de verdade (Hostinger, export estatico + blog WP em /blog) e como mexer sem quebrar
metadata:
  type: project
---

odontolinea.com.br NAO roda o projeto Next local como servidor. No ar: Hostinger (alias SSH `hostinger-odontolinea`, user u890169415, porta 65002, chave <<REMOVIDO>>), pasta `~/domains/odontolinea.com.br/public_html`.
- Raiz: export estatico do Next (index.html por pasta). Editado direto em HTML no servidor; o codigo local so tem o numero de WhatsApp atualizado.
- `/blog`: WordPress (tema generatepress-odontolinea, Rank Math, LiteSpeed). Rastros do WP escondidos pelo mu-plugin `odl-limpeza.php` + rewrites no `blog/.htaccess` (/blog/midia, /tema, /base, /lib).
- GA4 G-29725NQ0HF; blog usa o mesmo via mu-plugin (Independent Analytics desativado).
- GSC: propriedade `https://odontolinea.com.br/` so e lida pela chave seoqmix (prefixo https, nao sc-domain; o script gsc_api.py nao acha por isso).

**Why:** em 15/10/2026 o trafego vinha 97% do blog e as paginas de tratamento estavam nas posicoes 15 a 50; o trafego caiu de ~3000 cliques/mes (nov/2025) para ~100 em out/2026, com queda brusca em abril/2026 (data do ultimo deploy do export, 08/04).
**How to apply:** nunca subir um build novo por cima da raiz sem preservar `/blog`; alterar HTML por script com backup (`~/bkp-html-20261015`, `~/htaccess-*.bak-20261015`, tabelas `bak1015_*` no banco do blog). `wp db export` nao gera arquivo la. 55 posts foram despublicados (rascunho) com 301 em `blog/.htaccess`.

## Atualizacao 15/10/2026 (recuperacao de trafego)
- Diagnostico: queda a partir de 26/03/2026, do site inteiro (home tambem caiu), indexacao saudavel. Buscas genericas de remedio/antibiotico sumiram (provavel filtro de qualidade em saude). NAO foi a mudanca para /blog.
- 65 posts despublicados (rascunho) com 301 em `blog/.htaccess`: 55 de canibalizacao/conteudo fraco + 10 de remedio/antibiotico. Restam 137 posts. Secoes de medicamento removidas de 9 posts.
- As 12 paginas de tratamento + /tratamentos + /odontolinea + /dentista-em-brasilia foram reescritas no codigo-fonte e republicadas. Build de export numa copia (`%TEMP%\odl-build`, sem app/api, app/admin, middleware) e deploy so dessas 15 paginas + `_next/static`. Script em `d:\tmp\work\content\apply.py` (+ g1..g4) e `d:\tmp\work\site\post.py` (injeta schema, bloco "Leia no blog", faixa CRO).
- CRO do Dr. Irvington: 9224 Taguatinga DF. Avaliacoes Google reais: 4,9 com 167. Perfil Maps cid=5637479444022987347.
- Chave IndexNow em Documents\APIs\indexnow-odontolinea.txt (arquivo na raiz do site). Sitemap enviado ao Google (conta seoqmix tem permissao total) e ao Bing.
**Pendente:** Dr. Irvington revisar posts de saude antes de qualquer selo "revisado por"; backlinks para as paginas de tratamento; depoimentos reais nas paginas.
