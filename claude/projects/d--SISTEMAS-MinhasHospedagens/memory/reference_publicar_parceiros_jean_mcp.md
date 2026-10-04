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

## Linkagem interna é obrigatória nos posts do Jean (cobrança do Anderson, 03/10/2026)

Na rodada 3 do José Mário os 15 posts saíram só com o link do cliente e ele reclamou: "os conteúdos do Jean ficaram sem linkagem interna, sempre abaixo do link do cliente".

**Why:** post sem link interno fica solto no portal do parceiro e a regra do primeiro link exige que o do cliente venha antes de qualquer outro.

**How to apply:** todo post no Jean leva 2 links internos do MESMO portal, num parágrafo antes do último: `<p><strong>Rótulo:</strong> <a href="URL1">âncora</a> e <a href="URL2">âncora</a>.</p>`, com o rótulo variando (Leia também, Leia mais, Veja também, Relacionadas, Mais sobre o tema, Continue lendo) e a âncora sendo um corte do título real do destino. O link do cliente continua sendo o primeiro `<a>` do corpo. Os candidatos saem da REST pública do portal (`/wp-json/wp/v2/posts?search=TERMO&_fields=id,link,title,date`), sem credencial; conferir 200 e h1 antes de usar. Fazer isso ANTES do `criar_post`: `atualizar_post` exige reenviar o HTML inteiro. Scripts prontos em D:/PORTAIS/BACKLINKS/josemario-instagram3 (cand_jean.py, internos_jean.py, conf_tudo.py). Ver [[feedback_padrao_links_guest_post]].
