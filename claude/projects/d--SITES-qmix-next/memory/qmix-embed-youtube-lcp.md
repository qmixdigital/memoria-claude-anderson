---
name: qmix-embed-youtube-lcp
description: iframe do YouTube direto no conteúdo derrubava o LCP dos posts para 10s; usar sempre miniatura com player no clique
metadata: 
  node_type: memory
  type: project
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-09-09T12:54:01.068Z
---

Todo vídeo do YouTube no qmix.com.br entra por fachada: miniatura de
`i.ytimg.com` e o iframe só depois do clique. Vale para o corpo dos artigos
(`src/components/VideoLazy.tsx`, usado pelo `LexicalRenderer` no case `youtube`)
e para os blocos das páginas de venda (`src/components/BlocoVideos.tsx`).

**Why:** o `<iframe src="youtube.com/embed/...">` direto baixa o player inteiro
junto com a página, mesmo sem ninguém clicar. Medido no PageSpeed em 2026-09-08:
um post com dois vídeos puxava mais de 1,5 MB de JavaScript de terceiro
(`player_embed_es6` de 473 KB duas vezes, `ytembeds.base` de 220 KB duas vezes) e
ficava com LCP de 10 a 11 segundos e performance 57 no celular. Com a fachada:
LCP 3,1 a 3,4s e performance 91 a 94. Eram 25 dos 96 artigos publicados.

**How to apply:** nunca colocar iframe de terceiro direto em conteúdo. Conferir
com `curl <url> | grep -c "<iframe"` (tem que dar 0 no HTML servido) e, no
PageSpeed, olhar a lista de maiores recursos: se aparecer script de
`youtube.com/s/player`, a fachada não está sendo usada em algum lugar.

**Data e duração de vídeo saem só de `src/lib/videos.ts`.** Título e descrição
são por página (o mesmo vídeo é apresentado de ângulos diferentes), mas data e
duração são fato e vinham repetidos nos componentes. Em 2026-09-09 o Search
Console acusou `uploadDate` sem fuso; corrigi as três páginas de venda e passou
batido nos 25 posts do blog, que liam do registro. `uploadDate` precisa de ISO
8601 COM deslocamento (`2026-08-08T16:02:23-07:00`), lido do `uploadDate` da
página do vídeo no YouTube. Conferir com um crawler do sitemap que valide todo
`VideoObject` servido, não só as páginas que você mexeu.

Relacionado: [[qmix-loading-suspense]]
