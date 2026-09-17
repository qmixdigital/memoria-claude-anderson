---
name: sufixo-de-desduplicar-titulo-e-cortado
description: acrescentar o diferenciador no fim do título não resolve título repetido, porque o titleMax o corta
metadata:
  type: feedback
---

Ao desfazer título repetido entre dois artigos, o sufixo posto **no fim**
(`: o que muda em 2023`) é justamente a parte que o motor corta: ele monta o
`<title>` com `título + " - " + marca` e apara em 60. As duas páginas voltam a
ter o mesmo `<title>`, continuam competindo na busca e o mesmo texto âncora segue
servindo a dois destinos.

**Why:** o dado fica distinto e o HTML não. Quem confere pelo JSON não vê nada
errado; só a auditoria sobre o **HTML publicado** acusa.

**How to apply:** a diferença vai num `metaTitle` próprio, curto, com o
diferenciador no **começo**. O `title` volta ao original, porque ele é o `h1` e
não tem limite de 60. E ao cortar o núcleo para caber, reservar o tamanho do
sufixo e tirar preposição solta do fim, senão sai "plano de em 2023".
O slug nunca muda: ver [[titulo-duplicado-nao-apagar]].
