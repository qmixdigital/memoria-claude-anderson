---
name: odontolinea-hospedagem
description: "Onde o odontolinea.com.br roda de verdade (Hostinger, export estatico + blog WP em /blog) e como mexer sem quebrar"
metadata:
  node_type: memory
  type: project
  originSessionId: 7abc300e-e3b3-40c7-802d-12a719fd77eb
  modified: 2026-10-22T09:23:42.409Z
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

## 16/10/2026
- WhatsApp atual da clinica: (61) 99633-2085 (5561996332085), trocado de 99633-8025 em 18/10/2026. Trocado em todo o site, blog (tema, 13 posts, opcoes), llms.txt, planilha de backlinks e projeto local. O numero tem o mesmo tamanho do anterior: so assim da para trocar direto em HTML/JS do Next (os dados internos `T<hex>,` carregam o tamanho em bytes; mudar o tamanho de um texto ali derruba a pagina com "This page couldn't load"). Para mudar texto de tamanho diferente, rebuildar pelo codigo-fonte.
- SEMPRE testar paginas do Next num Chrome headless (`--dump-dom`, procurar "couldn't load" e "Connection closed") antes de dar o deploy por concluido. HTTP 200 nao basta.
- Zona Cloudflare do odontolinea NAO esta nas contas do QMIX (provavelmente CDN da Hostinger): nao da para limpar cache por la. Chunks JS ficam em cache ate 7 dias.
- Avaliacoes reais do Google em `lib/avaliacoes.ts` (fonte unica da secao e do schema da home). Depoimentos antigos eram falsos e foram removidos.
- Politica de privacidade ganhou secao de WhatsApp, com CNPJ 23.273.833/0001-21 e clinicaodontolinea@gmail.com.
- Home redesenhada (direcao A "Clareza confiante" aprovada pelo dono; serif/marfim/arco foi reprovado): azul #003058 + laranja #F09000, Bricolage Grotesque + Hanken Grotesk, CSS proprio em `app/odl.css` (classes `oa-`). Header/rodape novos valem para o site todo; rodape tem "Desenvolvido por QMIX Digital" (obrigatorio). Mockup em `D:\tmp\work\mock\direcao-a.html`.
## 22/10/2026 (consolidacao do blog para recuperar E-E-A-T)
- Diagnostico: 26% dos cliques pre-queda vinham de buscas de remedio/receita caseira; mas artigos odontologicos legitimos tambem cairam 90%+ (rebaixamento do site inteiro por padrao de 200 posts repetidos). Decisao do dono: "pode seguir tudo".
- Feito: 10 posts sensacionalistas/fora de foco removidos (8 com 301 para servico, 2 de bebe com 410). 127 posts restantes viraram 28: 27 guias consolidados (hub = URL de maior trafego do grupo, mantida) + 1 mantido. 99 fundidos estao em rascunho com 301 para o hub no `blog/.htaccess`. Backup JSON de todos os posts em `D:\tmp\work\blog-bkp\posts-20261022.json`; htaccess anterior em `blog-bkp/htaccess.before-consol`.
- Pipeline reutilizavel em `D:\tmp\work\consol\`: plan.py (mapa hub->fundidos, extrai fontes), BRIEF.md + LINKS.md (briefing dos redatores Fable, 1 agente por guia, limite 20 simultaneos), validate.py (travessao, remedio, 1o link = servico, hrefs unicos/permitidos, FAQ 4-6 h3), apply.py -> payload.json + odl-apply.php (wp eval-file), fix_next_links.py (links /blog/ em lib/treatments-data.ts), llms.py.
- mu-plugin odl-limpeza.php gera FAQPage a partir do h2 "Perguntas frequentes" + pares h3/p de qualquer post.
- Regra de links nos guias: primeiro <a> do corpo = pagina de servico com ancora de keyword; depois 2-4 guias; um href por destino.
- 22/10 (tarde): dono confirmou que o Dr. Irvington aprovou/revisou todos os guias. Selo "Revisão clínica: Dr. Irvington Duarte, CRO 9224, em <data de modificação>" no single.php + schema reviewedBy/lastReviewed/MedicalWebPage no mu-plugin; nas 12 paginas de tratamento do Next, linha "Conteúdo revisado por..." em `app/[slug]/page.tsx` e node MedicalWebPage via post.py (PERSON @id /#irvington).
- Blog agora com 32 posts: 27 guias + 1 mantido + 4 novos (dente-do-siso, aparelho-ortodontico, mau-halito, dente-quebrado; imagens Pexels/Pixabay via banco_img.py, 1200x675). Guias novos: BRIEF-NOVO.md + publish_new.py. Rank Math: categorias noindex; titles dos posts sem sufixo "| OdontoLinea" (ficavam >65).
- GSC 22/10: consultas comerciais locais (dentista brasilia, implante brasilia, clareamento df) cairam de pos 1-2 para 50+ junto com o site; "dentista taguatinga" segue pos 1 (CTR baixo = pack local). Google escolhe /contato/ e /dentista-em-brasilia/ em vez da home para "dentista (em) taguatinga". Maior oportunidade informacional: cluster "dente obturado/restaurado doendo" (23 mil impressoes/120d, pos 8-10) -> hub dente-obturado-doendo-depois-de-meses.
- Sitemap da raiz e arquivo estatico (`sitemap.xml`, 51 URLs); regenerar a mao ao mudar paginas/posts. llms.txt tambem estatico na raiz.
- Armadilha: Tailwind v4 poe utilitarias em `@layer utilities`; CSS sem layer vence qualquer layer. Regras de elemento do odl.css (`:where(.oa) a` etc.) ficam dentro de `@layer base`, senao apagam `text-white` dos botoes das paginas internas.
