---
name: feedback_imagem_alt_igual_nome_arquivo
description: "Ao otimizar imagens de artigos, o texto ALT = nome do arquivo enviado (sem extensão)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

A partir de 2026-06-27, ao processar imagens que o usuário envia para artigos (blog), o **texto ALT é o próprio nome do arquivo** (sem a extensão, mantendo acentos). O usuário já manda as imagens salvas com o nome/keyword desejado.

**Why:** evita ida-e-volta perguntando alt; o nome do arquivo já carrega a keyword escolhida.

**How to apply:** alt = nome do arquivo sem extensão (com acentos, ex: `cirurgia no joelho por vídeo em Goiânia`). O nome do AVIF é a versão slug (minúsculas, sem acento, espaços→hífens, ex: `cirurgia-no-joelho-por-video-em-goiania.avif`). Fluxo completo: converter JPEG→AVIF (Pillow, quality 55, speed 4), `wp media import --post_id --featured_image --title --alt` no servidor, depois purgar Cloudflare. Ver [[reference_blog_cirurgiadojoelho_location_cf]] para localização do blog e token CF.
