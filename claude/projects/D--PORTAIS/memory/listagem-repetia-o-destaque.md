---
name: listagem-repetia-o-destaque
description: A listagem de editoria abre com o destaque e a grade abaixo repetia o mesmo artigo; AR e AS tinham, AN não tem
metadata:
  type: project
---

Em `arList` e `asList` a página de editoria abria com o artigo mais recente em
destaque e, logo abaixo, montava a grade com **`itens.map`**, que inclui o
próprio destaque. A mesma foto e o mesmo título duas vezes seguidas, e dois links
para a mesma URL na mesma página.

O certo é `resto.map`, do `const [primeiro, ...resto] = itens`.

**Why:** a AS nasceu como cópia da AR e herdou o defeito. Descoberto por captura
de tela da editoria do pontonaturalbrasil; o universoneo estava no ar com ele.

**How to apply:** ao criar arquitetura nova por cópia, conferir a listagem de
editoria na captura, não só a home e o artigo.

⚠️ **A AN parece ter o mesmo defeito e não tem**: lá não existe destaque
separado, o mosaico é a página inteira, então `itens.map` está certo. Trocar por
`resto.map` faria a matéria mais recente sumir da própria editoria. As
arquiteturas que usam `itens.map((a, i) => ... i === 0 ...)` também estão certas:
ali o primeiro é estilizado dentro do próprio laço.

Ver [[deploy-de-arch-aponta-para-a-vizinha]] e [[atualizar-arch-ja-instalada]].
