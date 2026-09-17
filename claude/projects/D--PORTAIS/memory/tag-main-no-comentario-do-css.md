---
name: tag-main-no-comentario-do-css
description: Escrever a tag do elemento principal dentro de um comentário do CSS apaga o botão de menu do celular, sem erro nenhum
metadata:
  node_type: memory
  type: project
---

O `_menuSanfona` do `render.js` é quem injeta o botão de menu do celular nas
arquiteturas que não têm um. Ele delimita a área de busca assim:

```js
const iMain = html.indexOf('<main');
const fimBusca = iMain > 0 ? iMain : iCab;
const cab = html.slice(0, fimBusca);
```

A intenção é "procure a nav das editorias só no cabeçalho". Mas a busca é por
**texto cru no HTML inteiro**, e o `<style>` do motor fica no `<head>`, **antes**
do cabeçalho. Escrever essa sequência dentro de um comentário do CSS da
arquitetura põe a marca lá em cima: a área de busca fecha antes do `<header>`,
nenhuma `<nav>` é encontrada, e a função devolve o HTML intacto.

Foi o que aconteceu na arch AU em 29/08/2026. O comentário era:

```
/* sem medida e sem padding horizontal: o <main class=vao> ja da os dois ... */
```

**Nada acusa.** O `archs.js` carrega, o `node -e require` passa, a reconstrução
sai com exit 0, o desktop fica perfeito. Só no celular: o botão some e as
editorias vazam para fora da tela. Só a captura de tela mostrou.

**Regra:** em comentário de CSS de arquitetura, nunca escrever `<main`, e por
segurança nem `</header>` ou `<nav`, que são as outras marcas que a mesma função
procura. Descrever por extenso: "o elemento principal da página, com a classe
vao". Vale junto com [[crase-no-comentario-do-css]]: o comentário do CSS de uma
arch tem duas sequências proibidas, a crase e a tag literal.

Como conferir depois de mexer no CSS de uma arch:

```python
h = open(pagina, encoding="utf-8").read()
print(h.find("<header"), h.find("<main"))   # o header TEM que vir antes
```

Ver [[conferir-por-captura-usar-cache-busting]] e
[[deploy-de-arch-aponta-para-a-vizinha]].
