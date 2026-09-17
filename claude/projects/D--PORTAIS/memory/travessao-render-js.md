---
name: travessao-render-js
description: "O motor gera a página de contato com travessão, violando a regra do Anderson nos 22 portais"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:04:41.775Z
---

O `render.js` do portal-engine monta o texto da página de contato com travessão:

> "Envie sua mensagem pelo formulário abaixo — sugestões, dúvidas, correções ou parcerias."

Está na **linha 473**. Como o texto é gerado pelo motor, sai **igual nos 22
portais** das duas VPS. Corrigido para dois-pontos em 15/08/2026 apenas na
`clinicas-vps` (backup `render.js.bak-travessao-20260815`).

Varredura do motor na mesma data:

| Onde | Ocorrências | Situação |
|---|---|---|
| `render.js`, conteúdo | 1 | corrigido na clinicas-vps |
| `render.js`, comentário e decoder de entidades | 2 | legítimos, não são conteúdo |
| `archs.js`, arquiteturas A a T | 11 | não auditadas, em uso nos outros portais |
| `archs.js`, arch U | 0 | limpa |

**Why:** a regra do Anderson contra travessão é absoluta ("denuncia texto de IA"),
e aqui ela é violada por código, não por redação, então nenhuma revisão de
conteúdo pega.

**How to apply:** para propagar, `sed` na linha 473 dos outros dois motores mais
`rebuildIndexes` por portal. Atenção ao decoder da **linha 43**
(`.replace(/&mdash;/g, '—')`): ele reintroduz travessão em artigo importado que
chegue com `&mdash;`, mesmo com todo o resto limpo.

Relacionado: [[receiver-contato-bugs]]
