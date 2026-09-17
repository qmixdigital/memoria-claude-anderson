---
name: trilha-so-existia-no-artigo
description: "BreadcrumbList só era emitido no artigo; editoria, autor, institucional e mapa do site ficavam sem, nos 73 portais"
metadata:
  node_type: memory
  type: project
---

O `render.js` emitia `BreadcrumbList` apenas em `artMeta`. Tudo que sai por
`listMeta` (editoria) e por `pageHtml` (equipe, política editorial, autor, quem
somos, contato, privacidade, termos) e o mapa do site iam para o ar **sem
trilha**, contra a regra do CLAUDE.md de breadcrumb em JSON-LD em toda página
interna. São 24 páginas por portal, em todos os 73.

Corrigido em 21/08/2026, nas três máquinas, com `trilhaSchema(site, itens)` e
`_trilhaPagina(site, page, url)`.

Na página de autor a trilha tem três degraus, **Home > Equipe > Nome**, que é a
hierarquia real. Mas `/equipe/` é `extraPage` e nem todo portal da rede tem: sem
guarda, o degrau do meio apontaria para um 404 **dentro do dado estruturado**, que
é pior do que não ter trilha. A guarda checa `site.extraPages` antes de incluir.

⚠️ A correção só aparece no HTML depois de **rebuild**. O motor patchado não
reescreve página nenhuma sozinho.

Ver [[breadcrumb-ancora-generica]] e [[reiniciar-motor-depois-de-editar]].
