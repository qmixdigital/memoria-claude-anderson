---
name: ffmpeg-static-segfault-rede
description: O binario do pacote ffmpeg-static da SIGSEGV lendo URL https na VPS srv1166087; usar ffmpeg de sistema nesse caminho
metadata: 
  node_type: memory
  type: project
  originSessionId: 8f6de13c-0ddd-4ee5-b99d-75b102eb9220
  modified: 2026-08-16T07:27:53.994Z
---

O binario do pacote npm `ffmpeg-static` (build johnvansickle 7.0.2) **da SIGSEGV
em qualquer entrada de rede https** na VPS `hostinger-vps-srv1166087`, com ou sem
proxy. Reproduz com `ffmpeg -i https://... -t 2 -c copy saida.mp4` (dumped core).

**Why:** O static build declara suportar os protocolos `https` e `tls`
(`ffmpeg -protocols` lista os dois), entao o problema nao aparece em inspecao,
so em execucao. Nao afeta render nem probe, que leem arquivo local, mas quebra
todo caminho em que o FFmpeg le direto de URL, incluindo o
`--download-sections` do yt-dlp (que falha com "ffmpeg exited with code -11").
Descoberto em 16/08/2026 ao implementar o download por trecho do Cortes IA.

**How to apply:** Para download por trecho, instalar o ffmpeg de sistema
(`apt install ffmpeg`, ja instalado na 6.1.1) e passar
`--ffmpeg-location /usr/bin` **so nesse caminho**, mantendo `ffmpeg-static` no
resto do pipeline para nao mexer no que funciona. Ver `workers/lib/ytdlp.ts` do
Cortes IA. Sintoma a reconhecer: `code -11` ou "dumped core" em qualquer job de
FFmpeg com URL na entrada.

Ver tambem [[redis-compartilhado-srv1166087]].
