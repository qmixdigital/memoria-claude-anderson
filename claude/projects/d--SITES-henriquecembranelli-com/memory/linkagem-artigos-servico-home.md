---
name: linkagem-artigos-servico-home
description: Em artigo, link interno com âncora de keyword vai para página de serviço e home, nunca para a página do autor; linkagem externa = fontes de autoridade dentro do texto
metadata:
  type: feedback
---

Em artigo de blog, link interno com âncora de palavra-chave aponta para a **página de serviço** do tema e para a **home na keyword principal** (ex.: "ortopedista especialista em mão" → `/`). **Nunca** para a página do autor/perfil com âncora de keyword.

"Linkagem externa" no vocabulário do Anderson, quando fala de artigo, é **link de saída para fonte de autoridade dentro do texto** (ministério, sociedade médica, AAOS, ASSH, NHS), não link vindo de outros sites.

**Why:** em 30/09/2026 ele chamou de "péssima" a linkagem dos 3 primeiros artigos do Dr. Henrique porque "ortopedista especialista em túnel do carpo" apontava para o perfil, e reclamou de não achar links externos nos textos.

**How to apply:** por artigo: 1º link do corpo = página de serviço; home uma vez na frase de "ortopedista especialista…" (e tirar a home do breadcrumb visível para não duplicar destino); 2 links externos de autoridade em frases que já existem (URL conferida com 200), `target="_blank" rel="noopener"`; autor só aparece na linha de revisão, sem link de keyword. Ver [[projeto-henriquecembranelli]].

**Âncora tem de descrever o destino (correção dele em 30/09/2026):** "nervo mediano" apontando para uma página sobre síndrome do túnel do carpo é erro. Antes de publicar, ler cada par âncora → destino e perguntar "a página de destino é sobre exatamente isto?". Vale para link interno e externo. Melhor um link externo exato (ex.: "eletroneuromiografia" → página do exame) do que dois aproximados.
