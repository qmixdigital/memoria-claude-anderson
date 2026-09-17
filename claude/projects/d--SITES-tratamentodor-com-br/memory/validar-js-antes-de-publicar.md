---
name: validar-js-antes-de-publicar
description: Rodar node --check em todo script embutido antes de publicar, porque um erro de sintaxe impede o arquivo inteiro de rodar e pode apagar a pagina
metadata:
  type: feedback
---

Depois de editar JavaScript embutido no conteúdo de um post por regex ou sed,
extrair o script e rodar `node --check` **antes** de publicar.

**Por quê:** no tratamentodor.com.br removi por regex um bloco `forEach` do script da
home; a expressão levou o corpo e deixou o `});` órfão. Erro de sintaxe não falha só
naquele trecho, **impede o arquivo inteiro de executar**. Como o efeito de entrada usa
`.dpp__ent{opacity:0}` e só volta a 1 por JS, 21 das 26 seções da home ficaram
invisíveis no ar até eu perceber. Os testes automatizados não pegaram porque o
Playwright clica em elemento com `opacity:0` normalmente.

**Como aplicar:** extrair cada `<script>` para arquivo e `node --check`; e, quando o
JS controla visibilidade, verificar depois do deploy quantos elementos ficaram com
`opacity` diferente de 1 após rolar a página inteira, não só se a página respondeu 200.
Ver [[reservar-espaco-em-vez-de-adivinhar-breakpoint]].
