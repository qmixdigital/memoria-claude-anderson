---
name: leia-tambem-concentra-ancora
description: O bloco "Leia também" do motor dava os 3 mais recentes da editoria a todos os artigos dela, com pico de 641 usos da mesma âncora
metadata:
  type: project
---

O motor injeta um bloco `pe-leia-meio` no meio do corpo do artigo. Ele pegava
**sempre os 3 mais recentes da editoria**, e como é montado no render e não na
publicação, **todo artigo da editoria recebia os mesmos três**. Em vez de
espalhar autoridade, concentrava tudo em três URLs com o mesmo texto âncora:
pico de **641 usos** no jornaldebarcelos, 592 âncoras acima do teto somando os 21
portais da opengravity.

**Why:** contraria diretamente a régua permanente de [[teto-de-oito-usos-por-ancora]],
e o defeito é invisível em qualquer conferência de HTTP: as páginas respondem
200 e o bloco parece um recurso, não um problema.

**How to apply:** o conserto está em `_relacionados(pool, slug)` no `render.js`
da opengravity: desliza a janela por artigo, com deslocamento tirado de um hash
FNV do slug. Determinístico, então o rebuild não embaralha a página; uniforme,
então cada alvo recebe ~6 links. Janela menor não resolve: para o teto de 8 valer
numa editoria de N artigos, ela precisa ter pelo menos 0,75·N.

**As outras duas máquinas não têm o bloco** — o `render.js` de lá é anterior. Se
algum dia ele for para lá, o rodízio tem que ir junto. Ver
[[tres-instancias-do-motor]] e [[reiniciar-motor-depois-de-editar]].
