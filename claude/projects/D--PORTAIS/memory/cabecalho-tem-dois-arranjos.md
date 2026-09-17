---
name: cabecalho-tem-dois-arranjos
description: a nav das editorias fica dentro do header ou numa faixa própria, e cada caso pede injeção diferente
metadata:
  type: feedback
---

Ao injetar qualquer coisa no cabeçalho dos portais, contar com um arranjo só dá
errado. São dois:

- **A**: a `<nav>` está **dentro** do `<header>`. O elemento novo entra ao lado
  dela, e a linha precisa **quebrar** (`flex-wrap:wrap`), para a nav aberta
  descer inteira.
- **B**: a `<nav>` é uma **faixa própria depois do `</header>`**, filha direta do
  corpo. O elemento novo tem de entrar **dentro** do cabeçalho, como último filho
  da linha da marca, e ali a linha **não pode quebrar**, senão ele cai embaixo da
  marca.

🔴 **No arranjo B, mirar o pai da nav com `:has()` acerta o `<body>`** e o
transforma em `display:flex;flex-direction:row`, desmontando a página. A regra
tem de mirar o **pai do elemento injetado**, com `:not(body):not(html)` junto.

**Why:** o botão de menu foi ao ar com a marca no alto e o botão embaixo, e quem
viu foi o Anderson, abrindo o site no celular. Nenhum auditor de HTML pega isso:
os dois elementos estão lá, na ordem certa.

**How to apply:** `refaz_menu.py`, em
`D:\SISTEMAS\MinhasHospedagens\Opengravity`, já decide o arranjo por posição
(`m.index < iCab`) e monta o CSS de acordo. Ver também
[[menu-sanfonado-tem-tres-padroes]].
