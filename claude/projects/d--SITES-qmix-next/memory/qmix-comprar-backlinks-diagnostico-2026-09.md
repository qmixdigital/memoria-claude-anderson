---
name: qmix-comprar-backlinks-diagnostico-2026-09
description: "Diagnóstico de 18/09/2026 de por que /comprar-backlinks oscila entre 5 e 34 para \"comprar backlinks\"; o que foi medido (links, âncoras, CWV, concorrentes), o que foi corrigido e o que ficou"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-18T22:06:28.351Z
---

**Sintoma (GSC, "comprar backlinks", página /comprar-backlinks):** pos 4,6 no fim de março/2026 → 14 em abril → 6-15 até julho
→ 23-34 em agosto → 13 e 10 nas semanas de 07 e 14/09. Serper em 18/09: 6º ("comprar backlinks"), 3º ("baratos"),
9º ("brasileiros"). CTR ok para a posição (2,8%). 1.334 imp/90d nessa consulta; desktop 19,1 vs mobile 13,2.

**O que NÃO é o problema (medido):** autoridade. Moz: PA 33, DA 59, **239 root domains** para a página; concorrentes que
rankeiam acima têm 42 (Link Connection), 46 (SEO Wagner), 81 (comprarbacklinks.com), 0 a 3 (mkart, fort, talkie).
Linkagem interna: 108 das 116 páginas do sitemap linkam para ela no corpo, com 25+ âncoras diferentes.

**Achados:**
- Perfil de âncoras "sujo" por 301: 87 portais inativos (×2 rotas) + ~13 posts antigos redirecionam para
  /comprar-backlinks, então Moz atribui a ela âncoras como "instagram mp4 19 sites...", "mochila é bagagem de mão",
  "150 frases para vender joias", "imóveis de alto padrão". O Google trata redirect em massa não relacionado como soft-404
  (ignora), então não penaliza, mas os 239 domínios são inflados; a autoridade real é menor. Não mexido.
- SERP é mista: Reddit ("Onde comprar backlinks?") em 1º, Mercado Livre, **o Instagram da QMIX em 2º-5º** (acima da
  página), e as matérias patrocinadas da própria QMIX (brasil247, jornaldebrasilia, portalcorreio, acritica) na frente
  para "comprar backlinks brasileiros".
- Página pesada: 4.411 palavras, 14 H2, 16 FAQs no schema (teto do CLAUDE.md é 8), HowTo+Service+AggregateOffer+ItemList,
  312 KB de HTML (146 KB de payload RSC). Concorrentes: 2.200 a 3.500 palavras (Link Connection 8.200, mas é guia).
- LCP mobile lab **5,8 s** (era 2,1 s em junho): regressão do redesign de 13-14/09, que pôs 4 famílias de fonte no root
  layout com preload (150 KB de woff2 na frente do CSS) e 4 logos com fetchPriority high.
- `dateModified` do WebPage era `new Date()` a cada request (frescor falso). Sem autor/revisor na página.

**Corrigido em 18/09/2026:** `preload:false` em Bricolage, Instrument e Montserrat (root layout); logo escura sem eager;
`dateModified` = `snapshot.geradoEm`, `reviewedBy` Anderson Alves no WebPage e linha visível "Catálogo e preços
atualizados em … Página revisada por Anderson Alves". LCP lab 5,8 → 3,2 s (perf 75 → 90). O que resta do LCP é o CSS
único do Tailwind (244 KB raw / 37 KB br, 3.065 regras, admin incluso) bloqueando ~1 s e o peso do HTML.

**`experimental.inlineCss` NÃO serve:** testado; o Next repete o CSS 3× no HTML (style + 2× no payload RSC):
/comprar-backlinks foi a 1,1 MB e não melhorou (home foi de 3,3 para 2,3 s no lab). Revertido no mesmo dia.

**Corte feito em 18/09/2026 (aprovado):** seção "Marketplace: como funciona e como evitar golpe" removida (duplicava o
HowTo e posts do blog); "Por que brasileiros" condensada a 1 parágrafo (H2 mantido pela consulta "comprar backlinks
brasileiros"); FAQ passou de 16 para **8**, com fonte única na tabela `perguntas_respostas` (as 4 de objeção que viviam
no código viraram linhas 13-16; ids 2,4,5,6,7,9,10,11 ficaram `rejeitada` = não exibidas; id 12 virou a pergunta de
apostas). Página: 4.411 → 3.182 palavras, 14 → 12 H2, 312 → 268 KB. LCP lab ficou em 3,2 s (o que sobra é o CSS
único do Tailwind, ~1 s).

**Ainda aberto:** separar o CSS do admin (463 classes só do admin, ~20% das 3.065 regras; ganho estimado 37 → ~30 KB br,
~0,2 s de LCP; exige Tailwind `@source not` no globals e build próprio para o admin). Reddit "Onde comprar backlinks?"
é o 1º resultado e não tem resposta da QMIX.

Scripts: `D:/tmp/gsc-cb.py` (tendência semanal + consultas da página), `D:/tmp/comp-cb.py` (perfil dos concorrentes),
`D:/tmp/moz-cb.mjs` e `moz-anc.mjs` (rodar na VPS), `D:/tmp/psi.py`/`psi3.py` (PageSpeed; a API falha 1 em 3, repetir).

**Layout desktop (18/09/2026, pedido do Anderson):** H1 sem `<br>` forçado, 44px com `text-wrap: balance` e painel
da direita em 460/500px (fecha em 3 linhas; antes eram 5 irregulares); FAQ e CTA de pacote movidos para depois do
conteúdo (antes vinham logo após o hero); grade de números duplicada removida do bloco da lista; "até R$ 700 nos
maiores" corrigido para R$ 1.800; "12" perdido no cabeçalho de seção removido; Recursos em 4 colunas (era 3+1);
mural de avaliações com média no topo, grade que fecha (5 → 5 colunas) e sem nome de portal (era vazamento).

**Reddit (18/09/2026):** Anderson comentou no thread r/MarketingDigitalBR "Onde comprar Backlinks?" (1º resultado da
SERP) como **u/mnakamuraseo** (persona Maurício Nakamura, perfil SEO): comentário de topo citando o estudo da QMIX
sem link, e resposta ao PerfectExplanation15. O sub tem filtro automático por palavra (Post Guidance): "black hat",
"spam", "manipulação" bloqueiam o botão de comentar; regra 4 proíbe afiliados, então nunca link de afiliado lá.
Regras combinadas: sem voto de outras contas, sem responder aos concorrentes, link do estudo só se pedirem.
