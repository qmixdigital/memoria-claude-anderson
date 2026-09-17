---
name: icone-que-e-letra-nao-se-desenha
description: Marca cujo ícone é uma letra tipográfica não vira SVG desenhado nem `<text>`; o caminho é embrulhar o PNG da origem em base64
metadata:
  type: project
---

Quando o ícone da marca é uma **letra** (o R itálico serifado da Revista Rumo),
não existe caminho por vetor:

- desenhar a curva à mão sai errado, e já foi ao ar marca com uma letra a menos
  nesta rede. Ver [[wordmark-svg-pode-faltar-letra]]
- `<text>` dentro do SVG depende de a fonte existir na máquina que renderiza, e
  o ImageMagick do servidor não tem a Playfair

**How to apply:** gerar as sete medidas de PNG e o `.ico` **a partir do arquivo
de 512px da origem** com `convert`, e escrever o `favicon.svg` que o `<head>`
declara como um SVG que **embrulha um PNG de 192 em base64**:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <image width="192" height="192" href="data:image/png;base64,…"/>
</svg>
```

É SVG válido, todo navegador desenha, e fica idêntico à marca. Dá ~9 KB.

🔴 **E o `iconSvg` do `sites.json` fica AUSENTE de propósito.** Se ele existir, o
`generateFavicons` tenta converter o SVG com o ImageMagick, cujo renderizador
interno **não desenha imagem embutida**: sairia um ícone vazio. Sem `iconSvg` e
com o `favicon.svg` já no disco, o motor cai no `if (fs.existsSync(svgPath))
return;` e não mexe.

Script guardado em `D:\SISTEMAS\MinhasHospedagens\Opengravity\marcas\favicon_rev.py`.
Ver [[favicon-para-a-serp-do-google]] e [[logo-da-origem-antes-de-inventar]].
