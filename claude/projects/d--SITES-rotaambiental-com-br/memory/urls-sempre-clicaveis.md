---
name: urls-sempre-clicaveis
description: "Toda URL apresentada ao usuario deve ser link clicavel em markdown, nunca texto cru nem dentro de bloco de codigo"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4ca7b273-ea60-47c3-bc0b-10bef8047bab
  modified: 2026-08-26T11:04:08.321Z
---

Toda URL que eu apresentar precisa ser **clicavel**, em markdown `[texto](url)`. Vale para
URLs de site do cliente, links de artifact, paineis, sitemaps, endpoints de API e caminhos de
arquivo. Nunca entregar URL como texto cru nem enterrada em bloco de codigo quando a intencao
e que ele abra.

Cuidado especifico com **tabelas e listas de URLs** (mapas de redirect, listas de paginas
orfas, resultados de crawl): a tendencia natural e jogar tudo em bloco de codigo mono para
alinhar, e ai nada abre. Usar tabela markdown com cada URL como link.

**Why:** ele trabalha em varios sites ao mesmo tempo e confere cada URL abrindo no navegador
na hora. URL crua obriga a copiar e colar, o que custa tempo a cada item. Ele ja tinha pedido
isso antes e precisou repetir, entao e irritacao acumulada, nao preferencia leve.

**How to apply:** ao escrever a resposta, varrer o texto atras de qualquer coisa que comece
com `http` ou seja caminho de pagina do site, e converter em `[label](url)`. Para paginas de
site, o label bom e o slug ou o titulo da pagina, nao a URL repetida. Para arquivo do projeto,
seguir o formato de link relativo do VSCode ja definido no system prompt.
