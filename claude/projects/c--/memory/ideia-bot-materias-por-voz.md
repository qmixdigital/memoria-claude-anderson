---
name: ideia-bot-materias-por-voz
description: Spec aprovada mas NAO construida (16/09/2026) para o bot agenda-telegram produzir e publicar materias por audio e capturar fotos na agenda; Anderson engavetou
metadata:
  type: project
---

Em 16/09/2026 o Anderson aprovou o desenho de duas extensoes do bot
`@agendaqmix_bot` e depois decidiu **nao construir agora** ("acho que nao vou
usar"). Pediu para ficar memorizado. Spec completa e commitada em
`d:\SISTEMAS\agenda-telegram\docs\superpowers\specs\2026-09-16-materias-e-fotos-design.md`.
Tambem virou evento de dia inteiro na agenda dele (30/09/2026, "Ideia: bot de
materias por voz e fotos"), que ele vai arrastando para frente.

Resumo: (1) briefing por audio -> Claude Code headless na opengravity roda as
skills `materias-jornalisticas-linkbuilding`/`guest-post-rede` -> previa no
navegador servida pelo bot -> botoes Publicar / Novas orientacoes (por audio) /
Descartar -> publica em site do Jean (REST, `jean.csv`) ou portal da rede
(portal-engine, `qmix_endpoints_atual.csv`), sem Search Console. (2) foto
(cartao, recibo) -> Claude vision -> evento na agenda com dados e foto anexa.

**Why:** ele gostou da ideia mas nao tinha uso imediato; quer poder retomar sem
redesenhar.

**How to apply:** se ele mencionar publicar materia pelo Telegram, bot de
materias, ou foto de cartao/recibo, apontar a spec e seguir direto para o plano
de implementacao (writing-plans), sem repetir o brainstorming. Ordem de entrega
ja definida na spec. Ponto em aberto: formato do payload do portal-engine
(levantar no plugin de um portal, ex. adonline.com.br).
