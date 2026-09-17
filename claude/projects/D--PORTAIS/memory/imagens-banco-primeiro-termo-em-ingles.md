---
name: imagens-banco-primeiro-termo-em-ingles
description: "Regra permanente do Anderson: imagem vem de banco de fotos grátis por API (Pixabay, Pexels, Commons CC0), nunca gerada por IA sem ordem expressa, e o termo de busca é em inglês nas três"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1f871aca-8ade-42dd-b70a-66ffccd1c807
  modified: 2026-09-10T19:27:59.363Z
---

Ordem do Anderson em 10/09/2026, depois de as chaves do Pixabay e do Pexels
entrarem em `C:/Users/User/Documents/APIs/`: **"sempre tentar usar as APIs e
não usar imagens com inteligência artificial"**, e **"para pesquisar, os termos
devem ser em inglês em todos esses sites; o resultado é melhor"**. Ele mandou
gravar no sistema e na raiz do Claude: está nos dois, na seção "Imagens: banco
de fotos grátis PRIMEIRO" do `~/.claude/CLAUDE.md`.

**Why:** foto real rende melhor que ilustração sintética, não custa crédito de
IA, e as três fontes dispensam atribuição, o que apaga o bloco de crédito que
denunciava a rede. Ver [[bloco-de-credito-de-imagem-e-impressao-digital]].
E o inglês é a língua nativa do catálogo e das tags das três; a busca em
português passa por tradução e devolve menos e pior.

**How to apply:** `~/.claude/skills/guest-post-rede/scripts/banco_img.py`
`buscar "term in english" --portal SLUG` e `pegar --termo "..." --slug ...`.
O módulo já manda `lang=en` e `locale=en-US`. Português fica só no alt, escrito
olhando a foto. Se as três fontes não devolverem nada apto, **trocar o termo,
não a fonte**. Runware (FLUX) só quando ele pedir naquele caso, ou num projeto
em que ele já disse que a imagem é gerada.

⚠️ O `CLAUDE.md` global tinha a geração por IA como padrão até este dia; a
seção continua lá, rebaixada a "só com ordem expressa". Se alguma skill antiga
ainda gerar imagem por padrão (a `materias-jornalisticas-linkbuilding` cita
Runware na descrição), ela está desatualizada em relação a esta regra.
