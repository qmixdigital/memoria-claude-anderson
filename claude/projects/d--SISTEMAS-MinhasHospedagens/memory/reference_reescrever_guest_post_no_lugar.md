---
name: reference_reescrever_guest_post_no_lugar
description: "Como trocar o texto inteiro de um guest post já publicado sem mexer na URL, na âncora nem no link do cliente, no portal-engine e no Next do medicinageriatrica"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 11d63bfc-1400-4f76-816e-cd634e1dbc24
  modified: 2026-09-09T21:43:14.918Z
---

Cliente que manda conteúdo duplicado (o mesmo texto em vários portais) se resolve
**reescrevendo no lugar**: mesma URL, mesma âncora ao pé da letra, mesmo link de
destino, texto 100% novo. Feito em 09/09/2026 com o post
`cirurgia-de-dbs-com-sensing-technology` do cliente `pedrohenriquecunha.com.br`,
que estava **idêntico** no medicinageriatrica e no saudeacessivel.

**Como escolher o novo assunto:** Search Console do portal hospedeiro, e não do
cliente. Cada portal ganha um tema diferente, senão a duplicidade continua. No
caso: medicinageriatrica imprime forte para transtorno de movimento por remédio
(discinesia tardia 69 imp, síndrome neuroléptica maligna 53 imp), então o texto
foi para "estimulação cerebral profunda no idoso" com o diferencial do
parkinsonismo medicamentoso; saudeacessivel não tem pegada neuro nenhuma, e
recebeu o explicador leigo "cirurgia para Parkinson". Similaridade final entre os
dois textos: 1,5%. **Atenção ao slug:** ele fica, então o tema novo precisa
continuar coerente com ele, senão a página não disputa nem a própria keyword.

## portal-engine (saudeacessivel)

`publishArticle` com o mesmo `slug` reescreve no lugar, mas **apaga o que você
não reenviar**:

- **Imagem some** se não vier `image_base64`. Reler o webp de
  `public/img/<slug>.webp` e reenviar em base64, junto de `image_alt` e
  `image_caption` do JSON antigo.
- **A data vira agora** se não vier `scheduled_date`. Passar a `date` original
  para não perder a data de publicação de uma URL já indexada.
- **A categoria muda de nome** se você mandar o id numérico: `categories:[2]`
  devolve `{name:"Manual"}` enquanto o artigo tinha `{name:"dicas"}`. Mandar a
  **string do nome antigo** preserva o objeto exatamente.

**O bloco extra do autoLink se pré-empede, não se remenda.** Com
`autoLink.map` vazio o motor sempre anexa um "Leia também" com 2 links de
categoria. Remendar depois não resolve, porque o HTML do artigo é escrito no
publish e o `rebuildIndexes` não o regenera. A saída é pôr no `map` uma entrada
cujo termo apareça no texto **depois** do link do cliente: aí `added>0` e o
fallback não dispara, e o link injetado vira um dos 2 internos (o outro fica no
`pe-leia-meio`). Ver [[reference_publisherbrasil_portal_engine]].

## Next + Postgres (medicinageriatrica)

Edição direta: `UPDATE artigos SET titulo, resumo, meta_titulo, meta_descricao,
conteudo, atualizado_em=now() WHERE slug=...`. Transferir o SQL por `scp` com
dollar-quoting (`$tag$...$tag$`) e `SET client_encoding TO 'UTF8'`, nunca por
heredoc de ssh, que corrompe acento.

Três coisas que só se descobrem olhando o HTML no ar:

- **`meta_titulo` vira o `<title>` puro, sem sufixo do portal.** O orçamento é
  os 60 caracteres inteiros, não 39.
- **O template emite só `Article` + `BreadcrumbList` + `Organization`.** Não há
  `FAQPage` nem `NewsArticle`. Como o `conteudo` é renderizado sem sanitizar,
  dá para **injetar um `<script type="application/ld+json">` com o FAQPage** no
  fim do HTML do artigo, montado a partir dos pares h3+p do FAQ. Funciona.
- **O ISR não expira sozinho, e há DOIS casos.** Esperar nunca resolve.
  1. Edição comum: `pm2 reload` nas duas instâncias mais uma requisição de
     aquecimento (a primeira volta velha e dispara a regeneração, a segunda vem
     nova).
  2. **Logo depois de um deploy o reload não basta**, porque o `next build`
     prerenderiza a rota de novo com o conteúdo daquele instante e o
     `revalidate: 3600` segura por uma hora. Aí é preciso apagar os artefatos
     da rota em `.next/server/app/<slug>.{html,rsc,meta,segments}` **e só então**
     recarregar: os processos guardam uma cópia em memória, e apagar o disco sem
     recarregar depois não muda nada (medido em 09/09/2026: 8 sondagens sem
     efeito, resolvido na primeira tentativa depois do reload).
  Isso corrige [[reference_publicar_revistamsaude_medicinageriatrica]], que
  registrava a espera de 1 hora como inevitável.

Ver [[reference_runbook_backlinks_clientes]] e [[feedback_padrao_links_guest_post]].
