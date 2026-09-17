---
name: classes-hasheadas-no-motor
description: "Como o portal-engine passou a gerar nomes de classe diferentes em cada portal, e o que falta propagar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T19:29:36.064Z
---

Implementado em 15/08/2026 no motor da **clinicas-vps**, para cumprir a regra de
[[classes-css-nao-podem-repetir]].

Em `render.js`:

- `_CLS_LIT` lista as **59 classes literais** do motor (`page`, `upd`, `sep`, `by`,
  `rt`, `bt`, `cform*`, `bs-*`, `nf-*`, `notfound`, `im`, `ov`, `cx`, `h`, `d`,
  `eq-*`, `rd-*`, `pf-*`, `autor-*`...)
- `_clsMapa(site)` gera, por hash FNV do slug, um nome opaco para cada uma
- `_renomClasses(site, html)` reescreve os atributos `class="..."` e os seletores
  dentro do `<style>` do documento já montado
- as sete funções de página viraram `_raw_*` e ganharam envelopes com o nome
  original, para que chamadas internas e externas passem pelo renomeador:
  `homePage`, `articleHtml`, `listPage`, `notFoundPage`, `pageHtml`,
  `sitemapPageHtml`, `searchPageHtml`

Conferido: **zero classes em comum** entre `boxnoticias.net` e
`agencianacionaldenoticias.com` em 8 tipos de página.

Cuidado ao mexer: o renomeador só troca seletor `.token` dentro do `<style>`, e
`\.[a-zA-Z]` nunca casa com `1.5rem`. Se algum dia o CSS ganhar `data:` URI, é
preciso protegê-lo antes de renomear.

**Concluído em 19/08/2026 nas três instâncias.** Medição por par de portais do
mesmo servidor: 12 classes em comum antes, **zero** depois, nos três motores.

O que faltava não eram as classes das arquiteturas, que já eram hasheadas: eram as
das **páginas institucionais** (`eq-card`, `eq-area`, `eq-res`, `autor-posts`,
`avatar-autor`, `pf-topo`, `err`, `nota`). Elas ficam fora dos arquétipos e por isso
passaram despercebidas.

**Regra que fica:** classe nova acrescentada ao `render.js` precisa entrar no
`_CLS_LIT` na mesma mexida. O `avatar-autor`, criado no pacote editorial, nasceu
literal nos três motores e quase virou mais uma assinatura comum da rede.
