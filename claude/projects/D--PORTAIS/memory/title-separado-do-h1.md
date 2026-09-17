---
name: title-separado-do-h1
description: "Como separar o <title> do <h1> no portal-engine, e a armadilha do titleMax que joga o titulo para 62 caracteres"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T10:04:15.940Z
---

O motor separa o `<title>` do `<h1>` pelo campo **`metaTitle`** do artigo, que
foi adicionado ao `artMeta` do `render.js`. Sem o campo, o `<title>` repete o
`<h1>`, e um dos dois está sempre errado: o `<title>` é o que aparece na busca e
deve liderar pela keyword em até 60 caracteres; o `<h1>` é o que o leitor lê.

**A armadilha:** escrever o `metaTitle` com 45 a 50 caracteres não basta. Se
sobrar espaço até o `titleMax` do site, o motor acrescenta " - Nome do Site" e o
resultado vai a 61 ou 62, que o Google corta.

**Regra:** `titleMax` vale **60**, nunca 62. E como o campo é global do site,
mudá-lo reescreve o `<title>` de todo o acervo, então a conferência tem que
varrer o HTML publicado inteiro, não só os artigos novos.

Ao reescrever título de acervo herdado, mexer **só no `metaTitle`**: o `<h1>` e
o slug ficam. Padrão que funciona: entidade primeiro, cortar "Como os" e "As
melhores" da frente, e conferir se dois artigos parecidos não ficaram com o
mesmo título de busca, o que piora a canibalização.

Estado em 16/08/2026: clickinfohub **100% coberto**, nas 178 páginas de artigo.
Os outros portais da rede não foram auditados por esse critério.

Ver [[campos-novos-do-motor]] e [[patches-motor-clinicas-vps]].
