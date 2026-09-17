---
name: conteudo-da-plataforma-nascia-sem-assinatura
description: "A plataforma do Antônio não manda autor, e o motor assinava com o nome do site: artigo novo ficava sem rel=author e fora da página do editor"
metadata:
  node_type: memory
  type: project
---

A plataforma do Antônio **não envia o campo `author`** no payload. O motor caía
no `site.name`, então **todo conteúdo novo de toda a rede** nascia assinado com o
nome do portal. Consequências, todas silenciosas:

- sem `rel=author` e sem `Person` no schema, só `Organization`
- o artigo não aparece na página de nenhum editor, porque ela filtra por
  `a.author === eq.nome`
- o pacote editorial de E-E-A-T fica só na fachada: as páginas de autor existem
  e nunca recebem conteúdo novo

**Corrigido em 22/08/2026 nas três máquinas** (`render.js`, helper `_assina`): sem
autor no payload, a assinatura sai do `equipe` do `sites.json`, pelo campo `cats`
de cada editor, casando com a editoria do artigo. Nome mandado explicitamente
continua tendo precedência, e portal sem `equipe` continua como estava.

**Duas formas do mesmo trecho na rede:** a `hostinger-vps-srv1166087` recebeu o
módulo "Editor Externo" e lê `author_name` antes de `author`. Patch que casa só
com a forma da opengravity passa batido lá, sem erro.

**How to apply:** ao conferir um portal convertido, publicar um teste pela rota
real da plataforma e olhar **de qual editor saiu a assinatura**, não só se o HTTP
foi 201. A rota é `/wp-json/<ns>/v1/artigos`, e os campos são `title`, `content`,
`excerpt`, `categories[]` (número). Ver [[pacote-editorial-eeat]],
[[campos-do-padrao-da-instancia]] e [[reiniciar-motor-depois-de-editar]].
