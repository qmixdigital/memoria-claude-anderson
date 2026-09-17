---
name: breadcrumb-ancora-generica
description: "O breadcrumb do motor linkava para a home com a âncora \"Início\" em todas as páginas; corrigido para o nome do portal, mas só 7 portais foram reconstruídos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-17T22:43:01.107Z
---

O breadcrumb do `render.js` trazia `<a href="/">Início</a>` fixo, tanto na trilha
visível quanto no `name` do primeiro `ListItem` do BreadcrumbList em JSON-LD. Como
todo artigo tem breadcrumb, isso significava **29.222 links internos** apontando para
as homes da rede com uma âncora genérica, justamente o sinal mais forte que a home
recebe. Além de desperdício, contraria a regra do CLAUDE.md que proíbe "inicio" e
"home" como texto âncora.

Corrigido em 17/08/2026 nas três instâncias para `site.shortName || site.name`, com
backup `render.js.bak-crumb-*` e `node --check`. A trilha agora sai como
"Diário do Brejo › Casa › título", e o JSON-LD acompanha.

**Resolvido em 19/08/2026.** A correção do pacote editorial exigiu reconstruir os
68 portais das três instâncias, e o breadcrumb foi junto. Conferido por amostra nos
três servidores: nenhuma ocorrência de âncora "Início" nas páginas publicadas.

Fica a lição de método: correção no motor **não vale nada até o `rebuildIndexes`**.
Entre a correção e o rebuild, os portais ficam meses com o defeito no ar. Quando
mexer no motor, rebuildar tudo na mesma sessão ou anotar a pendência com data.

Relacionado: [[patches-motor-clinicas-vps]], [[arch-local-e-fonte-unica]],
[[registro-de-lotes-por-portal]].

**Em 21/08/2026 apareceram mais duas do mesmo tipo**, achadas na conferência de
linkagem do viajenodetalhe e igualmente espalhadas pela rede inteira:

- **"Ver tudo"** no cabeçalho de seção da home, um por editoria. Virou
  `Ver tudo de <Editoria>`, que carrega a palavra-chave do destino.
- **"Página inicial"** no mapa do site. Virou o nome do portal, igual ao que já
  se fez na trilha.

⚠️ **Não trocar por replace cego.** A variável com o nome da editoria é `name` em
umas arquiteturas e `nome` em outras, e o replace uniforme derrubou o rebuild
inteiro com `ReferenceError: name is not defined`. Só apareceu porque o exit code
foi conferido: ver [[rebuild-exit-code-antes-de-comparar]]. A correção certa lê o
escopo de cada linha antes de trocar.

E o ajuste tem que voltar para o `archs.js` **local** de cada servidor, senão o
próximo deploy de arquitetura o desfaz: ver [[arch-local-e-fonte-unica]].
