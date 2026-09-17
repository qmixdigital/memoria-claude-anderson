---
name: feedback-abrir-html-no-navegador
description: Anderson quer que todo relatório HTML gerado seja aberto automaticamente no navegador dele
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 08d7866e-dcb1-4885-a05f-e9067c14346a
  modified: 2026-09-14T20:56:04.483Z
---

Sempre que gerar ou regerar um relatório HTML, abrir no navegador padrão dele
(`start "" "caminho.html"` via Bash) sem esperar pedido.

**Why:** ele avalia o resultado olhando, não lendo resumo em texto; abrir por
conta própria poupa uma rodada de pedido (14/09/2026).

**How to apply:** ao final de `relatorio.py --cliente X`, rodar `start` no
arquivo em `monitor-ia/resultados/`. Vale para cada relatório gerado, inclusive
quando forem vários de uma vez.
