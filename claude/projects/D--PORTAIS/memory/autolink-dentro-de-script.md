---
name: autolink-dentro-de-script
description: A linkagem interna entrava em blocos de JSON-LD vindos do WordPress e as aspas do href quebravam o dado estruturado
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T18:47:31.019Z
---

`autoLinkContent` se protegia de entrar dentro de outro link e dentro de título,
mas não dentro de `<script>`. Artigo importado do WordPress que traga um
`<script type="application/ld+json">` no corpo (VideoObject, HowTo, o FAQ do
Yoast) recebe o `<a href="...">` **dentro da string JSON**, e as aspas do
atributo quebram o bloco inteiro.

**Nenhuma página quebra.** O dado estruturado apenas deixa de ser lido pelo
Google. Um único caso na rede inteira, achado só porque a auditoria roda
`json.loads` em cada bloco em vez de conferir por `grep`.

Corrigido nas três máquinas: `script`, `style`, `code` e `pre` entram no mesmo
contador de "não linkar aqui" que os títulos já usavam.

⚠️ **Corrigir o motor não desfaz o que já está gravado**, porque o link está no
`content` do artigo, no disco. A passada de reparo varre os blocos e desfaz a
âncora **só dentro deles**; fora, o link é legítimo e é o produto.

Efeito colateral que quase passou: aquele artigo ficou **sem nenhum link de
saída**, porque o único que tinha estava dentro do bloco, onde não valia nada.
Depois de uma limpeza dessas, refazer a contagem de links.

Ver [[linkagem-interna-automatica]] e [[link-interno-quebrado-gravado-no-conteudo]].
