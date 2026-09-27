---
name: reference-publicar-parceiros-jean-mcp
description: Conector MCP dos portais do Jean - o campo da imagem destacada e imagem_destaque_id (nao imagem_destacada_id) e o nome do arquivo precisa ser passado
metadata:
  type: reference
---

No conector `Publicar em sites de parceiros` (portais do Jean), duas armadilhas custaram retrabalho em 22/09/2026, no lote do Jose Mario:

1. **O campo da imagem destacada e `imagem_destaque_id`**, sem o "ca". Passar `imagem_destacada_id` NAO da erro: o `criar_post` responde 200, o post sai publicado e fica com `featured_media: 0`. A pagina no ar mostra so o logo do tema e o `og:image` aponta para a imagem padrao do site. Conferir sempre pelo `og:image` da pagina, nao pela resposta do MCP.
2. **`subir_imagem` aceita `nome_arquivo`**, e sem ele o arquivo entra como `imagem.webp` na biblioteca. Passar sempre `<slug-da-keyword>.webp`.

Conserto de um post ja publicado: subir a imagem de novo com `nome_arquivo` e chamar `atualizar_post` com `imagem_destaque_id`.

**Titulo:** o tema acrescenta o sufixo do portal (" - Nome do Portal", 20 a 23 caracteres). Somar isso ao titulo antes de publicar; varios titulos de 51 a 60 caracteres estouraram os 70 no ar.
