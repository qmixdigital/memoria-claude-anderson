---
name: patches-motor-clinicas-vps
description: "Correções e recursos que só existem no portal-engine da clinicas-vps, ainda não propagados"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:43:20.027Z
---

Tudo abaixo foi aplicado em 15/08/2026 **apenas na `clinicas-vps`**. Os outros
dois motores (opengravity, hostinger-vps-srv1166087) seguem sem essas mudanças,
ou seja, os 22 portais da rede ainda têm os defeitos.

**Correções (`.bak-*-20260815` ao lado de cada arquivo):**

| Onde | O quê |
|---|---|
| `receiver.js` | acento quebrado, `reply_to` duplo, travessão no e-mail, charset |
| `render.js` | travessão na página de contato (linha 473) |
| `render.js` | `short_name` do manifest cortava no meio da palavra |

**Recursos novos, úteis para a rede:**

| Onde | O quê |
|---|---|
| `render.js` | `extraPages` no `sites.json`: cada portal define páginas próprias, e as com `inFooter` entram nos links institucionais |
| `render.js` | JSON-LD por página (`page.jsonld`), sem o qual `ProfilePage` não sai |
| `render.js` | ícone `maskable` 192 e 512 gerados com o desenho a 80% da zona segura |
| `render.js` | `autorLink()`: assinatura vira link e schema vira `Person` com `url` quando o autor está em `site.equipe` |

**Armadilha do ambiente:** o ImageMagick da VPS usa o renderizador SVG interno,
não o librsvg, e **não suporta gradiente**. Ícone com `fill="url(#...)"` sai com
o fundo **preto**. Usar cor sólida no `iconSvg`. Instalei `librsvg2-bin` lá, mas
o `convert` continua usando o interno.

**Why:** as correções nasceram de defeito real encontrado em produção, e os
recursos foram necessários para o pacote editorial. Propagar exige mexer em 22
sites de uma vez, então depende de decisão do Anderson.

**How to apply:** copiar `receiver.js` e `render.js` da clinicas-vps para os
outros motores, reiniciar o serviço e rodar `rebuildIndexes` por portal. Conferir
antes se algum portal depende do comportamento antigo.

Relacionado: [[receiver-contato-bugs]], [[travessao-render-js]], [[pacote-editorial-eeat]]
