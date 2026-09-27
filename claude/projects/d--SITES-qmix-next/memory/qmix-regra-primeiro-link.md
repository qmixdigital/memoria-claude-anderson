---
name: qmix-regra-primeiro-link
description: Como descrever a posição do link do cliente nas matérias da QMIX (é o primeiro link, não "no primeiro parágrafo")
metadata:
  type: feedback
---

O link do cliente numa matéria da QMIX é **sempre o primeiro link do texto**: nenhum link antes dele,
interno ou externo. Mas **nem sempre está no primeiro parágrafo** (na maioria das vezes não está).

**Why:** Anderson corrigiu em 14/09/2026 depois de a home dizer "seu link no 1º parágrafo da matéria";
a promessa era falsa e podia virar reclamação.

**How to apply:** em textos, mockups, e-mails e artigos, escrever "o primeiro link da matéria" /
"seu link antes de qualquer outro"; nunca "no primeiro parágrafo". Ver também [[qmix-blog-tema-claro]].

**Ampliação (18/09/2026):** a regra vale para todo conteúdo, não só matéria de cliente. O primeiro `<a>` do corpo
é o link mais forte da página (no blog da QMIX, em geral `/comprar-backlinks`). Antes de escrever, perguntar ao
Anderson qual é o link mais importante; ele responde com URL, com texto ou com "você escolhe". Procedimento completo
na skill `seo-aeo-best-practices` (seção "Regra do link mais forte"). O estudo `/blog/preco-de-backlink` foi
reordenado nesse dia para o marketplace ser o primeiro link.

**Link interno em matéria de portal parceiro (Anderson, 21/09/2026):** o link interno do portal (JBr, DM etc.)
tem de apontar para matéria de **cliente nosso** publicada naquele portal, nunca para matéria qualquer do acervo.
Fonte: `backlinks_clientes` filtrando pelo domínio do portal (as URLs de dm.com.br com id numérico antigo
redirecionam para `/brasil/<slug>/`; conferir 200 e h1). Inserir inline, depois do link do cliente.
