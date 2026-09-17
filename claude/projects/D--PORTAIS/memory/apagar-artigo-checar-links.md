---
name: apagar-artigo-checar-links
description: Apagar artigo sem conferir quem apontava para ele deixa link interno indo para 410
metadata:
  type: feedback
---

Toda vez que apago artigo, tenho que varrer o acervo atrás de **link interno
que apontava para ele**. Sem isso, sobra link levando o leitor a um 410.

Aconteceu em 16/08/2026: apaguei os textos do Dr. Luiz e ficaram 3 links no
agoranoticias e 1 no barranews apontando para o vazio. Só apareceram por acaso,
numa busca por outro motivo.

**How to apply:** depois de qualquer exclusão, rodar a varredura. O tratamento
depende do caso:

- se o slug apagado tem **301** configurado, reescrever o href para o
  **destino final**, e não deixar o salto extra;
- se não tem, **desfazer o link e manter o texto da âncora**, que é o menos
  invasivo: a frase continua de pé.

Não confundir com pasta que existe em `public/` sem JSON em `data/`: categoria,
autor e busca são assim de propósito, e não são link morto.

Relacionado: [[dr-luiz-teixeira-apagar]], [[linkagem-interna-automatica]]
