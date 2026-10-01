---
name: conceptoffices-site-gerado
description: Site da Concept Offices (conceptoffices.com.br) é HTML gerado por build.py em D:\SITES\conecptoffices-build; nunca editar a pasta de publicação à mão
metadata:
  node_type: memory
  type: project
  originSessionId: 1dfb94f9-f82f-486f-91cd-e88c1f0786f9
  modified: 2026-09-29T11:51:13.713Z
---

Em 29/09/2026 o site da Concept Offices (coworking em Brasília e Fortaleza, cliente) foi
reconstruído do zero. O que o desenvolvedor do cliente tinha entregado "em HTML" era um espelho
estático do WordPress/Elementor (jQuery, wp-content, Rank Math), não um site novo.

- Fonte: `D:\SITES\conecptoffices-build\` (build.py, content/*.html, static/, BRIEFING.md com
  mapa de keywords e plano de âncoras, verifica.py, shots.py).
- Publicação: `python build.py` gera em `D:\SITES\conecptoffices\` (a pasta é esvaziada a cada
  build). `python verifica.py` tem de terminar com 0 problemas.
- Keywords principais: "coworking em Brasília" (/coworking-em-brasilia/, antes /coworking-em-brasilia-2/)
  e "coworking em Fortaleza" (/coworking-em-fortaleza/). A home ficou com a marca para parar de
  canibalizar as cidades.
- Backup do espelho WordPress: `D:\tmp\conecptoffices-backup-20260929.tar`.
- Hospedagem Hostinger (LiteSpeed, .htaccess). Em 30/09/2026 o site novo ainda não tinha sido
  publicado; o WordPress seguia no ar. Depois de publicar, rodar `verifica_producao.py`.
- Redesign em 30/09/2026: duas rodadas. A primeira (serifa + latão + papel + numeração) ele achou
  "cara de IA" e reprovou o texto centralizado no celular e a cor dourada. A segunda ficou: Archivo,
  branco/cinza frio, azul do logo, cartões com fio de 1px, tudo à esquerda no celular. Regra dele:
  nada centralizado no celular, nunca; evitar ornamento (itálico de destaque, numeração, grão).
- Auditoria de 30/09/2026: Lighthouse celular 99 a 100 (com gzip), W3C limpo salvo roles de
  tabela (propositais), schema.org sem erro. Pendências fora do código: ID do GA4 (site só tem
  GTM-N64H2CLZ), disavow dos links "slot88", subdomínio coworking.conceptoffices.com.br
  concorrente, URLs finais do Google Ads, horário das unidades para o schema.

**Why:** o Search Console mostrava queda de 24% em cliques e a home roubando as buscas das cidades.
**How to apply:** qualquer mudança de conteúdo vai em content/ e passa por build + verifica; ver
[[qmix-regra-primeiro-link]] para a ordem dos links.
