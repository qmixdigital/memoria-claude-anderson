---
name: redesign-direcao-a-aprovada
description: "Redesign mobile-first do dreduardocembranelli.com aprovado em 20/09/2026 (direção A, \"consultório editorial\"); processo usado e o que ficou pendente (site do Henrique em paralelo)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2f5f7eba-79f5-4549-b14a-bc65d72c9615
  modified: 2026-09-20T13:51:27.041Z
---

Em 20/09/2026 Anderson pediu para modernizar o site do Dr. Eduardo Cembranelli com foco no celular (80% das visitas). Processo: duas direções geradas por agentes Fable em `_mockups/a` e `_mockups/b`, revisor independente com veto (`_mockups/REVISAO.md`), prints publicados em https://mockups.dreduardocembranelli-preview.pages.dev/_mockups/comparar, e ele escolheu **A com as correções** via AskUserQuestion.

Sistema aplicado: Playfair Display no display (laço com o wordmark serifado) + **Manrope self-hosted** no corpo (Inter removido), navy `#062439` em blocos estruturais (trajetória, família, footer), dourado só em detalhe. Celular: hero com foto curta e cartão sobreposto (821px, CTA visível sem rolar), barra fixa de agendamento que aparece quando o botão do hero sai da tela, tratamentos em linhas clicáveis, trajetória em scroll-snap (grade 4x2 no desktop). Home caiu de 13.249px para 6.769px em 390.

**Why:** ele reprovou o layout anterior como "molde" e pediu "incrível, moderno, atual, principalmente mobile". A direção B (sans-only, mais clara) foi considerada genérica pelo revisor e por ele.

**How to apply:** o layout é próprio de cada site e **não deve ser igualado** ao do Dr. Henrique (`d:\SITES\henriquecembranelli.com`), por decisão do Anderson em 21/09/2026: ele não quer os dois com o mesmo layout. Só as peças compartilhadas (faixa Körpem no rodapé, cookies, crédito QMIX, CSS crítico, regras de SEO) evoluem em paralelo. Ver [[conta-cloudflare-medicos-bh]] e [[css-critico-mobile-full-e-portas]].
