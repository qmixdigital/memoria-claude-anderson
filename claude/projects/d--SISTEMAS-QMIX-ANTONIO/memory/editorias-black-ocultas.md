---
name: editorias-black-ocultas
description: Conteudo sensivel (apostas, IPTV, cassino, massagem, vape) publica em editorias ocultas dos portais, reservadas no Antonio a 4 editores; 10 apps Next ficaram de fora
metadata:
  type: project
---

Em 17/09/2026 o Anderson pediu que Dayane (10) e Diego (11) pudessem publicar
"conteudo black" alem do normal. Virou: 5 editorias (Apostas, IPTV, Cassino,
Massagem, Vape) criadas no `categoryMap` de 32 portais do portal-engine e
postas em `hideCategories` (pagina no ar, fora de menu/home), cadastradas em
`wp_categories`, e reservadas em `categorias-restritas.php` para
`EDITORES_BLACK = [2, 4, 10, 11]`.

**Why:** o mecanismo de categoria reservada ja existia (IPTV para 2 e 4), mas
estava vazio: as linhas de IPTV tinham sumido de `wp_categories`. E os sites
nao sao WordPress, sao portal-engine imitando `/wp-json/`, entao categoria se
cria no `sites.json`, nao por wp-cli.

**How to apply:** passo a passo em `OPERACOES.md`, secao "Categorias
reservadas: editorias black". Pendente: os **10 apps Next** do lote
(cirurgiacoracao, cirurgiadacatarata, cirurgiadecancer, geladeirastop,
institutoortopedico, medicinageriatrica, medicodasmaos, notebookx,
planomedicosaude, saudevitalidade) tem categorias em codigo e precisam de
deploy cada um; o Anderson ainda nao decidiu. Ver
[[dayane-editora-pagante-indexacao-auto]].
