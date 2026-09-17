---
name: entidade-html-no-titulo
description: "Título gravado com entidade HTML sai escapado duas vezes na página, e o leitor vê \"Earth, Wind &amp; Fire\""
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-19T17:52:04.995Z
---

O motor escapa o título na hora de renderizar. Quando o dado já vem gravado com
entidade (`&amp;`, `&#8217;`, `&quot;`), o `&` é escapado de novo e o leitor vê
`Moody&#8217;s` e `Earth, Wind &amp; Fire` na tela. Alguns casos estão
codificados duas vezes (`&amp;ccedil;` para "ç"), então a decodificação precisa
rodar até estabilizar, não uma vez só.

**Why:** vem da importação de conteúdo de origem externa, então reaparece a cada
novo lote importado. Em 19/08/2026 a varredura achou 65 artigos em 28 dos 68
portais, nas três máquinas.

**How to apply:** o script está em `corrige_entidades.py` (scratchpad da sessão),
varre `/srv/portais/*/data/*.json` nos campos title, metaTitle, dek e excerpt com
`html.unescape` em laço. Depois reconstruir os portais afetados e purgar. Rodar
sempre que entrar lote vindo da plataforma do Antônio. Ver
[[plataforma-antonio-acesso]] e [[conferir-por-captura-usar-cache-busting]].
