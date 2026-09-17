---
name: hover-de-card-medir-por-pixel
description: Fundo que muda no hover pode vir de background-image, entao ler backgroundColor computado nao detecta; medir o pixel da tela
metadata:
  type: feedback
---

Para conferir se um card muda de cor no hover, **amostrar o pixel real da tela**,
não ler `getComputedStyle(el).backgroundColor`.

**Por quê:** no tratamentodor.com.br o card da bio ficava azul escuro no hover com o
título navy por cima, 1:1, texto invisível. Duas medições minhas disseram que estava
tudo certo porque o `background-color` **continua branco**: o navy vinha de
`background-image`. A regra `.dpp a` desenha o sublinhado com um gradiente limitado por
`background-size:100% 1px`; no card o `background-size` volta a `auto` e
`.dpp a:hover` troca o gradiente para navy, então ele preenche o elemento inteiro.

**Como aplicar:** capturar screenshot, recortar a área do elemento e pegar a cor
dominante, antes e depois do hover. Verificar também que o `background-image:none` do
componente tem especificidade suficiente: `.dpp a:hover` é (0,2,1) e vence
`.dpp .componente`, que é (0,2,0); precisa de `.dpp a.componente:hover`, que é (0,3,1).
E depois de achar um caso, varrer TODOS os elementos do mesmo tipo, porque é falha de
classe, não caso isolado. Ver [[componente-so-funciona-onde-nasceu]].
