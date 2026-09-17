---
name: feedback-jean-credito-foto
description: Regras dos 38 sites do Jean (conector MCP): crédito "Imagem de {Autor} via {Banco}" no caption, sem tags, pauta forçada em site nichado vai para a categoria Geral
metadata:
  type: feedback
---

Nos **sites do Jean** (conector "Publicar em sites de parceiros"), ordem do Anderson em
17/09/2026: (1) crédito da imagem **sempre no campo caption** da destacada, no padrão exato
`Imagem de {Autor} via {Banco}` (autor = uploader no banco; banco = Pexels/Pixabay/Commons);
(2) **nenhuma tag** nos posts; (3) em **site nichado** (canaljustica, ciberlex...), pauta de
cliente que só cabe no nicho com esforço vai para a categoria **Geral**, para não ocupar a home.

**Why:** pedido do Jean, dono dos sites (crédito e tags), e decisão do Anderson para
preservar a cara dos portais de nicho. Pexels/Pixabay não exigem crédito; a exigência é do parceiro.

**How to apply:** `subir_imagem` com `legenda`; tema que não imprime caption (canaljustica)
recebe a frase também no início do conteúdo como `<figure><figcaption>`, nunca `<p>` (capitular).
`tags: []` em `atualizar_post` limpa tags (servidor gnd-motor, /opt/wp-mcp, systemd `wp-mcp.service`,
patch de 17/09/2026 em src/wp/posts.ts). Nos portais próprios a regra de imagem é a oposta:
sem crédito. Detalhes na skill materias-jornalisticas-linkbuilding. Ver [[qmix-portais-nao-expostos]].
